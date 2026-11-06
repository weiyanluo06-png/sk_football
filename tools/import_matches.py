"""把「比赛录入.xlsx」导入 data/team-records.json，并重新生成网站数据。

用法：
    python tools/import_matches.py             # 导入 + 重新生成
    python tools/import_matches.py --dry-run   # 只校验并预览，不写任何文件
    python tools/import_matches.py --no-build  # 只写 team-records.json

安全策略：
- 只增改 records["matches"]，绝不碰 players / baseline / historicalMatches / startingLineup。
- 写文件前先备份，构建校验失败自动回滚。
- 幂等：同一份表重复导入不会重复累计。
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import shutil
import subprocess
import sys
from pathlib import Path

from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[1]
RECORDS = ROOT / "data" / "team-records.json"
WORKBOOK = ROOT / "data" / "比赛录入.xlsx"

DEFAULT_KICKOFF = "12:00"
DEFAULT_VENUE = "武汉纺织大学足球场"
POSITIONS = {"GK", "DF", "MF", "FW"}


class ImportProblem(Exception):
    """导入过程中可预期的错误，直接展示给填表的人。"""


def norm(value) -> str:
    if value is None:
        return ""
    if isinstance(value, (dt.datetime, dt.date)):
        return value.strftime("%Y-%m-%d")
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def as_int(value, where: str, field: str, allow_blank: bool = False):
    text = norm(value)
    if text == "":
        if allow_blank:
            return None
        raise ImportProblem(f"{where}：{field} 不能为空")
    try:
        number = float(text)
    except ValueError as exc:
        raise ImportProblem(f"{where}：{field} 必须是数字，实际是「{text}」") from exc
    if not number.is_integer() or number < 0:
        raise ImportProblem(f"{where}：{field} 必须是非负整数，实际是「{text}」")
    return int(number)


def as_bool(value):
    text = norm(value)
    if text in ("是", "Y", "y", "true", "True", "1"):
        return True
    if text in ("否", "N", "n", "false", "False", "0"):
        return False
    return None


def split_names(value) -> list[str]:
    """姓名类字段：顿号、分号、换行都算分隔符。"""
    text = norm(value)
    if not text:
        return []
    parts = []
    for chunk in text.replace("；", "、").replace(";", "、").replace("\n", "、").replace(",", "、").split("、"):
        chunk = chunk.strip()
        if chunk:
            parts.append(chunk)
    return parts


def split_lines(value) -> list[str]:
    """长文本类字段：只按换行或分号拆分，避免误伤句子里的顿号。"""
    text = norm(value)
    if not text:
        return []
    chunks = []
    for line in text.split("\n"):
        for piece in line.replace("；", ";").split(";"):
            piece = piece.strip()
            if piece:
                chunks.append(piece)
    return chunks


def read_sheet(workbook, name: str, required: list[str]) -> list[dict]:
    if name not in workbook.sheetnames:
        raise ImportProblem(f"工作簿里缺少「{name}」工作表")
    ws = workbook[name]
    header_cells = list(ws.iter_rows(min_row=2, max_row=2, values_only=True))
    if not header_cells:
        raise ImportProblem(f"「{name}」表缺少表头（第 2 行）")
    headers = [norm(h) for h in header_cells[0]]
    missing = [h for h in required if h not in headers]
    if missing:
        raise ImportProblem(f"「{name}」表缺少列：{'、'.join(missing)}")
    index = {h: i for i, h in enumerate(headers) if h}
    rows = []
    for excel_row, values in enumerate(ws.iter_rows(min_row=3, values_only=True), start=3):
        if not any(norm(v) for v in values):
            continue
        rows.append({"__row__": excel_row, **{h: values[i] if i < len(values) else None for h, i in index.items()}})
    return rows


def season_of(date_text: str) -> str:
    year, month = int(date_text[:4]), int(date_text[5:7])
    start = year if month >= 8 else year - 1
    return f"{start}-{start + 1}"


def competition_suffix(competition_id: str) -> str:
    if "eleven" in competition_id:
        return "eleven"
    if "freshmen" in competition_id:
        return "freshmen"
    if "eight" in competition_id:
        return "eight"
    return competition_id.split("-", 1)[-1]


def merge_matches(records: dict, workbook, force: bool) -> tuple[list[dict], list[str]]:
    players_by_name = {p["name"]: p for p in records["players"]}
    comp_ids = [c["id"] for c in records["competitions"]]
    baseline_through = records["baseline"]["through"]

    match_rows = read_sheet(workbook, "比赛", ["比赛ID", "日期", "赛事ID", "对手", "我方进球", "对方进球"])
    app_rows = read_sheet(workbook, "出场", ["比赛ID", "球员姓名", "首发", "本场位置"])
    ev_rows = read_sheet(workbook, "事件", ["比赛ID", "分钟", "类型", "进球者或换上"])
    report_rows = read_sheet(workbook, "战报", ["比赛ID"]) if "战报" in workbook.sheetnames else []
    photo_rows = read_sheet(workbook, "照片", ["比赛ID", "文件路径", "说明"]) if "照片" in workbook.sheetnames else []

    if not match_rows:
        raise ImportProblem("「比赛」表没有任何数据行")

    existing = {m["id"]: m for m in records["matches"]}
    # 先整体扫一遍 ID 冲突，保证报错指向「比赛」表而不是后面某张明细表
    for row in match_rows:
        raw = norm(row.get("比赛ID"))
        old = existing.get(raw) if raw else None
        if old and not force:
            if old["date"] != norm(row.get("日期")) or old["opponent"] != norm(row.get("对手")):
                raise ImportProblem(
                    f"比赛表第 {row['__row__']} 行：比赛ID「{raw}」已存在，但日期/对手不一致"
                    f"（已有 {old['date']} vs {old['opponent']}）。确认要覆盖请加 --force"
                )

    grouped_app: dict[str, list[dict]] = {}
    for row in app_rows:
        grouped_app.setdefault(norm(row.get("比赛ID")), []).append(row)
    grouped_ev: dict[str, list[dict]] = {}
    for row in ev_rows:
        grouped_ev.setdefault(norm(row.get("比赛ID")), []).append(row)
    grouped_photo: dict[str, list[dict]] = {}
    for row in photo_rows:
        grouped_photo.setdefault(norm(row.get("比赛ID")), []).append(row)
    grouped_report: dict[str, dict] = {}
    for row in report_rows:
        mid = norm(row.get("比赛ID"))
        if mid:
            if mid in grouped_report:
                raise ImportProblem(f"战报表第 {row['__row__']} 行：比赛ID「{mid}」重复了，一场只能有一行战报")
            grouped_report[mid] = row

    result: list[dict] = []
    notes: list[str] = []
    seen_ids: set[str] = set()

    for seq, row in enumerate(match_rows, start=1):
        where = f"比赛表第 {row['__row__']} 行"
        raw_id = norm(row.get("比赛ID"))
        date_text = norm(row.get("日期"))
        if not date_text:
            raise ImportProblem(f"{where}：日期不能为空")
        if len(date_text) != 10 or date_text[4] != "-" or date_text[7] != "-":
            raise ImportProblem(f"{where}：日期必须写成 YYYY-MM-DD，实际是「{date_text}」")
        try:
            dt.date.fromisoformat(date_text)
        except ValueError as exc:
            raise ImportProblem(f"{where}：日期「{date_text}」不是有效日期") from exc
        if date_text <= baseline_through:
            raise ImportProblem(
                f"{where}：日期 {date_text} 不晚于历史基数截止日 {baseline_through}，"
                f"会与历史累计重复统计。2026-10-15 及以前的比赛属于历史存档，不要录进本表。"
            )

        competition_id = norm(row.get("赛事ID"))
        if competition_id not in comp_ids:
            raise ImportProblem(f"{where}：赛事ID「{competition_id}」不存在。可选：{'、'.join(comp_ids)}")
        opponent = norm(row.get("对手"))
        if not opponent:
            raise ImportProblem(f"{where}：对手不能为空")

        if not raw_id:
            suggestion = f"{date_text}-{competition_suffix(competition_id)}-duishoupinyin"
            raise ImportProblem(
                f"{where}：比赛ID 不能为空。建议写成「日期-杯赛-对手拼音」，例如 {suggestion}；\n"
                f"    然后把这同一个 ID 填到「出场」「事件」「照片」三张表的比赛ID列（有下拉可选）。"
            )
        match_id = raw_id
        if not all(ch.islower() or ch.isdigit() or ch == "-" for ch in match_id):
            raise ImportProblem(f"{where}：比赛ID 只能用英文小写、数字和连字符，实际是「{match_id}」")

        if match_id in seen_ids:
            raise ImportProblem(f"{where}：比赛ID「{match_id}」在本表里重复了")
        seen_ids.add(match_id)

        old = existing.get(match_id)
        if old and (old["date"] != date_text or old["opponent"] != opponent) and not force:
            raise ImportProblem(
                f"{where}：比赛ID「{match_id}」已存在，但日期/对手不一致"
                f"（已有 {old['date']} vs {old['opponent']}）。确认要覆盖请加 --force"
            )

        kickoff = norm(row.get("开球时间")) or DEFAULT_KICKOFF
        if len(kickoff) != 5 or kickoff[2] != ":":
            raise ImportProblem(f"{where}：开球时间必须写成 HH:MM，实际是「{kickoff}」")
        venue = norm(row.get("场地")) or DEFAULT_VENUE

        goals_for = as_int(row.get("我方进球"), where, "我方进球")
        goals_against = as_int(row.get("对方进球"), where, "对方进球")

        appearances = []
        seen_players: dict[int, str] = {}
        starters = 0
        for app in grouped_app.get(match_id, []):
            app_where = f"出场表第 {app['__row__']} 行"
            name = norm(app.get("球员姓名"))
            if not name:
                continue
            player = players_by_name.get(name)
            if not player:
                raise ImportProblem(f"{app_where}：球员「{name}」不在名单里。请检查是不是错别字。")
            if player["id"] in seen_players:
                raise ImportProblem(f"{app_where}：「{name}」在同一场比赛里重复出场")
            started = as_bool(app.get("首发"))
            if started is None:
                raise ImportProblem(f"{app_where}：首发只能填「是」或「否」")
            position = norm(app.get("本场位置")).upper()
            if position not in POSITIONS:
                raise ImportProblem(f"{app_where}：本场位置只能是 GK/DF/MF/FW，实际是「{position}」")
            on_minute = as_int(app.get("上场分钟"), app_where, "上场分钟")
            off_minute = as_int(app.get("下场分钟"), app_where, "下场分钟", allow_blank=True)
            if started and on_minute != 0:
                raise ImportProblem(f"{app_where}：首发球员的上场分钟必须填 0")
            if off_minute is not None and off_minute < on_minute:
                raise ImportProblem(f"{app_where}：下场分钟不能早于上场分钟")
            clean = as_bool(app.get("零封")) is True
            low = as_bool(app.get("低失球场")) is True
            if clean and goals_against != 0:
                raise ImportProblem(f"{app_where}：本场对方进了 {goals_against} 球，不能记零封")
            if low and goals_against > 1:
                raise ImportProblem(f"{app_where}：本场对方进了 {goals_against} 球，不能记低失球场")
            entry = {"playerId": player["id"], "started": started, "position": position,
                     "onMinute": on_minute, "offMinute": off_minute}
            if clean:
                entry["cleanSheet"] = True
            if low:
                entry["lowConcedeGame"] = True
            seen_players[player["id"]] = name
            if started:
                starters += 1
            appearances.append(entry)
        if not appearances:
            raise ImportProblem(f"{where}：出场表里没有任何属于这场比赛（比赛ID={match_id}）的球员")
        if starters > 11:
            raise ImportProblem(f"{where}：首发有 {starters} 人，超过 11 人")

        events = []
        goals = 0
        subs_in: set[int] = set()
        subs_out: set[int] = set()
        for ev in grouped_ev.get(match_id, []):
            ev_where = f"事件表第 {ev['__row__']} 行"
            minute = as_int(ev.get("分钟"), ev_where, "分钟")
            kind = norm(ev.get("类型"))
            name = norm(ev.get("进球者或换上"))
            partner = norm(ev.get("助攻或换下"))
            exact = norm(ev.get("精确时间"))
            if kind == "进球":
                if name not in players_by_name:
                    raise ImportProblem(f"{ev_where}：进球者「{name}」不在名单里")
                scorer = players_by_name[name]["id"]
                if partner and partner not in players_by_name:
                    raise ImportProblem(f"{ev_where}：助攻「{partner}」不在名单里")
                assist = players_by_name[partner]["id"] if partner else None
                if assist is not None and assist == scorer:
                    raise ImportProblem(f"{ev_where}：进球者不能助攻自己")
                if scorer not in seen_players:
                    raise ImportProblem(f"{ev_where}：进球者「{name}」没有出现在这场比赛的出场表里")
                if assist is not None and assist not in seen_players:
                    raise ImportProblem(f"{ev_where}：助攻「{partner}」没有出现在这场比赛的出场表里")
                if exact:
                    parts = exact.split(":")
                    if len(parts) != 2 or not parts[0].isdigit() or int(parts[0]) != minute:
                        raise ImportProblem(f"{ev_where}：精确时间要写成 19:15 这种，且分钟要与「分钟」一致")
                event = {"type": "goal", "minute": minute}
                if exact:
                    event["exactTime"] = exact
                event["playerId"] = scorer
                event["assistId"] = assist
                events.append(event)
                goals += 1
            elif kind == "换人":
                if name not in players_by_name or partner not in players_by_name:
                    raise ImportProblem(f"{ev_where}：换人的两个球员都必须在名单里")
                player_in = players_by_name[name]["id"]
                player_out = players_by_name[partner]["id"]
                if player_in == player_out:
                    raise ImportProblem(f"{ev_where}：换上和换下不能是同一个人")
                if player_in in subs_in or player_out in subs_out:
                    raise ImportProblem(f"{ev_where}：「{name}」或「{partner}」重复换人")
                subs_in.add(player_in)
                subs_out.add(player_out)
                events.append({"type": "substitution", "minute": minute,
                               "playerInId": player_in, "playerOutId": player_out})
            else:
                raise ImportProblem(f"{ev_where}：类型只能填「进球」或「换人」，实际是「{kind}」")

        if goals != goals_for:
            raise ImportProblem(f"{where}：比分写的是我方 {goals_for} 球，但事件表里有 {goals} 个进球")
        for entry in appearances:
            if not entry["started"] and entry["playerId"] not in subs_in:
                raise ImportProblem(f"{where}：「{seen_players[entry['playerId']]}」标为替补，但事件表里没有他上场的换人记录")
            if entry["offMinute"] is not None and entry["playerId"] not in subs_out:
                raise ImportProblem(f"{where}：「{seen_players[entry['playerId']]}」填了下场分钟，但事件表里没有换下他的记录")

        captain_name = norm(row.get("队长"))
        mvp_name = norm(row.get("MVP"))
        captain_id = None
        mvp_id = None
        for role, value in (("队长", captain_name), ("MVP", mvp_name)):
            if not value:
                continue
            if value not in players_by_name:
                raise ImportProblem(f"{where}：{role}「{value}」不在名单里")
            pid = players_by_name[value]["id"]
            if pid not in seen_players:
                raise ImportProblem(f"{where}：{role}「{value}」没有出现在出场表里")
            if role == "队长":
                captain_id = pid
            else:
                mvp_id = pid

        photos = []
        for photo in grouped_photo.get(match_id, []):
            ph_where = f"照片表第 {photo['__row__']} 行"
            src = norm(photo.get("文件路径"))
            caption = norm(photo.get("说明"))
            if not src:
                continue
            if not src.startswith("assets/"):
                raise ImportProblem(f"{ph_where}：文件路径必须以 assets/ 开头，实际是「{src}」")
            if not caption:
                raise ImportProblem(f"{ph_where}：照片必须写说明")
            item = {"src": src, "caption": caption}
            photographer = norm(photo.get("摄影"))
            if photographer:
                item["photographer"] = photographer
            photos.append(item)

        match = {
            "id": match_id,
            "competitionId": competition_id,
            "season": season_of(date_text),
            "date": date_text,
            "kickoff": kickoff,
            "venue": venue,
        }
        full_time = as_int(row.get("全场分钟"), where, "全场分钟", allow_blank=True)
        if full_time is not None:
            if full_time <= 0:
                raise ImportProblem(f"{where}：全场分钟必须大于 0")
            match["fullTimeMinutes"] = full_time
        report = grouped_report.get(match_id, {})

        def field(name: str) -> str:
            """长文本字段优先取「战报」表，兼容写在「比赛」表里的旧表。"""
            return norm(report.get(name)) or norm(row.get(name))

        match.update({
            "opponent": opponent,
            "status": "played",
            "goalsFor": goals_for,
            "goalsAgainst": goals_against,
            "formation": norm(row.get("阵型")),
            "captainId": captain_id,
            "appearances": appearances,
            "events": events,
            "mvpId": mvp_id,
            "mvpReview": field("MVP评语"),
            "quote": field("一句话总结"),
            "reportTitle": field("战报标题"),
            "report": [p.strip() for p in field("战报正文").split("\n\n") if p.strip()],
        })
        recorders = split_names(field("记录人"))
        if recorders:
            match["recorders"] = recorders
        match["photographers"] = split_names(field("摄影"))
        match["photos"] = photos
        match["missingInfo"] = split_lines(field("待补充信息"))
        result.append(match)

    return result, notes


def orphan_check(workbook, match_ids: set[str]) -> list[str]:
    """找出填了比赛ID、但「比赛」表里没有对应行的明细，避免静默丢失。"""
    warnings = []
    for sheet, required in (("战报", ["比赛ID"]),
                            ("出场", ["比赛ID", "球员姓名"]),
                            ("事件", ["比赛ID", "类型"]),
                            ("照片", ["比赛ID", "文件路径"])):
        if sheet not in workbook.sheetnames:
            continue
        for row in read_sheet(workbook, sheet, required):
            mid = norm(row.get("比赛ID"))
            if not mid:
                warnings.append(f"{sheet}表第 {row['__row__']} 行：没有填比赛ID，这一行被忽略了")
            elif mid not in match_ids:
                warnings.append(f"{sheet}表第 {row['__row__']} 行：比赛ID「{mid}」在比赛表里没有对应行，已忽略")
    return warnings


def main() -> int:
    parser = argparse.ArgumentParser(description="导入比赛录入表到 team-records.json")
    parser.add_argument("--workbook", type=Path, default=WORKBOOK)
    parser.add_argument("--records", type=Path, default=RECORDS)
    parser.add_argument("--dry-run", action="store_true", help="只校验和预览，不写文件")
    parser.add_argument("--no-build", action="store_true", help="不自动运行 node tools/build_team_data.mjs")
    parser.add_argument("--force", action="store_true", help="允许覆盖同 ID 但日期/对手不同的比赛")
    args = parser.parse_args()

    if not args.workbook.exists():
        print(f"找不到录入表：{args.workbook}", file=sys.stderr)
        print("先运行 python tools/build_match_workbook.py 生成。", file=sys.stderr)
        return 2

    records = json.loads(args.records.read_text(encoding="utf-8"))

    try:
        imported, notes = merge_matches(records, load_workbook(args.workbook), args.force)
    except ImportProblem as exc:
        print(f"[错误] 导入中止：{exc}", file=sys.stderr)
        return 1

    for note in notes:
        print(f"- {note}")
    for warning in orphan_check(load_workbook(args.workbook), {m["id"] for m in imported}):
        print(f"[提示] {warning}")

    merged: list[dict] = []
    by_id = {m["id"]: m for m in imported}
    updated = 0
    for old in records["matches"]:
        if old["id"] in by_id:
            new = by_id.pop(old["id"])
            merged.append(new)
            if new != old:
                updated += 1
        else:
            merged.append(old)
    added = 0
    for new in sorted(by_id.values(), key=lambda m: m["date"]):
        merged.append(new)
        added += 1

    print(f"- 表内 {len(imported)} 场：新增 {added} 场，更新 {updated} 场，未改动 {len(imported) - added - updated} 场")

    if args.dry_run:
        print("- --dry-run：未写入任何文件")
        return 0

    records["matches"] = merged
    backup = args.records.with_suffix(".json.bak")
    shutil.copy2(args.records, backup)
    try:
        args.records.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        if not args.no_build:
            node = shutil.which("node") or "node"
            proc = subprocess.run([node, str(ROOT / "tools" / "build_team_data.mjs")],
                                  cwd=str(ROOT), capture_output=True, text=True,
                                  encoding="utf-8", errors="replace")
            if proc.returncode != 0:
                raise ImportProblem("生成脚本校验失败：\n" + (proc.stderr or proc.stdout).strip())
            print((proc.stdout or "").strip())
    except ImportProblem as exc:
        shutil.copy2(backup, args.records)
        print(f"[错误] 已回滚，原文件未改动。原因：\n{exc}", file=sys.stderr)
        return 1
    except Exception as exc:  # noqa: BLE001
        shutil.copy2(backup, args.records)
        print(f"[错误] 已回滚，原文件未改动。原因：{exc}", file=sys.stderr)
        return 1
    finally:
        backup.unlink(missing_ok=True)

    print("[完成] 导入完成，js/team-data.js 与 data/player-stats.json 已重新生成")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
