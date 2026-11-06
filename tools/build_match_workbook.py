"""生成「比赛录入」工作簿：把 data/team-records.json 的逐场明细导出成可填写的 Excel 表单。

用法：
    python tools/build_match_workbook.py            # 生成 data/比赛录入.xlsx
    python tools/build_match_workbook.py --output 其他路径.xlsx

设计：
- 「比赛」表：一场一行，只放短字段（比分、阵型、队长、MVP…）。
- 「战报」表：一场一行，放长文本（一句话总结、评语、战报正文、记录人、待补充）。
- 「出场」「事件」「照片」：各自一行，靠「比赛ID」关联。
- 球员用姓名填写，有下拉；日期一律按文本保存，避免 Excel 自动转 datetime。
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = Path(__file__).resolve().parents[1]
RECORDS = ROOT / "data" / "team-records.json"
DEFAULT_OUTPUT = ROOT / "data" / "比赛录入.xlsx"

GREEN = "1F7A4D"
GREEN_DARK = "0F3D2A"

HEADER_FONT = Font(name="Microsoft YaHei", size=10, bold=True, color="FFFFFF")
BODY_FONT = Font(name="Microsoft YaHei", size=10)
TITLE_FONT = Font(name="Microsoft YaHei", size=13, bold=True, color="FFFFFF")
NOTE_FONT = Font(name="Microsoft YaHei", size=10, color="17231D")
SECTION_FONT = Font(name="Microsoft YaHei", size=11, bold=True, color=GREEN_DARK)

HEADER_FILL = PatternFill("solid", fgColor=GREEN)
TITLE_FILL = PatternFill("solid", fgColor=GREEN_DARK)
THIN = Side(style="thin", color="D7EADF")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)

MATCH_COLUMNS = [
    ("比赛ID", 30, "必填：日期-杯赛-对手拼音"),
    ("日期", 12, "YYYY-MM-DD"),
    ("开球时间", 10, "默认 12:00"),
    ("场地", 20, "默认 武汉纺织大学足球场"),
    ("赛事ID", 20, "下拉选择"),
    ("对手", 12, "学院全名"),
    ("我方进球", 9, ""),
    ("对方进球", 9, ""),
    ("阵型", 9, "如 4-4-2"),
    ("队长", 10, "姓名"),
    ("全场分钟", 9, "未知留空"),
    ("MVP", 10, "姓名"),
]

REPORT_COLUMNS = [
    ("比赛ID", 30, "与「比赛」表一致"),
    ("一句话总结", 30, "比分卡片上显示那句"),
    ("MVP评语", 24, "一句真实评语"),
    ("战报标题", 26, ""),
    ("战报正文", 60, "分段：段与段之间空一行"),
    ("记录人", 18, "顿号分隔"),
    ("摄影", 18, "顿号分隔"),
    ("待补充信息", 30, "每行一条"),
]

APPEARANCE_COLUMNS = [
    ("比赛ID", 30, "下拉选择"),
    ("球员姓名", 12, "下拉选择"),
    ("首发", 8, "是 / 否"),
    ("本场位置", 10, "GK / DF / MF / FW"),
    ("上场分钟", 10, "首发填 0"),
    ("下场分钟", 10, "没换下就留空"),
    ("零封", 8, "是 / 否"),
    ("低失球场", 10, "是 / 否"),
]

EVENT_COLUMNS = [
    ("比赛ID", 30, "下拉选择"),
    ("分钟", 8, "第几分钟"),
    ("类型", 10, "进球 / 换人"),
    ("进球者或换上", 14, "姓名"),
    ("助攻或换下", 14, "没有助攻留空"),
    ("精确时间", 10, "可选，如 19:15"),
]

PHOTO_COLUMNS = [
    ("比赛ID", 30, "下拉选择"),
    ("文件路径", 46, "assets/photos/xxx.jpg"),
    ("说明", 34, "这张照片在拍什么"),
    ("摄影", 14, "姓名"),
]


def load_records() -> dict:
    return json.loads(RECORDS.read_text(encoding="utf-8"))


def text_width(value: str) -> int:
    return sum(2 if ord(ch) > 127 else 1 for ch in str(value))


def style_table(ws, columns, title: str) -> None:
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=len(columns))
    cell = ws.cell(row=1, column=1, value=title)
    cell.font = TITLE_FONT
    cell.fill = TITLE_FILL
    cell.alignment = Alignment(horizontal="left", vertical="center", indent=1)
    ws.row_dimensions[1].height = 28

    for idx, (name, width, hint) in enumerate(columns, start=1):
        cell = ws.cell(row=2, column=idx, value=name)
        cell.font = HEADER_FONT
        cell.fill = HEADER_FILL
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = BORDER
        ws.column_dimensions[get_column_letter(idx)].width = width
    ws.row_dimensions[2].height = 24
    ws.freeze_panes = "A3"


def fill_rows(ws, columns, rows) -> None:
    wide = {"战报正文", "待补充信息", "说明", "一句话总结", "MVP评语", "战报标题", "记录人", "摄影"}
    centered = {"我方进球", "对方进球", "全场分钟", "首发", "上场分钟", "下场分钟", "零封", "低失球场", "分钟"}
    for r, values in enumerate(rows, start=3):
        tallest = 1
        for c, value in enumerate(values, start=1):
            name, width, _ = columns[c - 1]
            cell = ws.cell(row=r, column=c, value=value)
            cell.font = BODY_FONT
            cell.border = BORDER
            if name in centered:
                cell.alignment = Alignment(vertical="center", horizontal="center")
            else:
                cell.alignment = Alignment(vertical="top", wrap_text=name in wide)
            if name in ("日期", "开球时间", "比赛ID"):
                cell.number_format = "@"
            if name in wide and value:
                # 每行约能放下 width/2 个汉字，按此估算需要多少行
                per_line = max(8, int(width * 0.95 / 2))
                tallest = max(tallest, -(-text_width(value) // per_line))
        ws.row_dimensions[r].height = max(20, min(400, 15 * tallest + 4))


def add_list_validation(ws, col_letter: str, source_range: str, max_row: int = 5000) -> None:
    dv = DataValidation(type="list", formula1=source_range, allow_blank=True, showDropDown=False)
    dv.error = "请从下拉列表中选择"
    dv.errorTitle = "不在可选范围"
    ws.add_data_validation(dv)
    dv.add(f"{col_letter}3:{col_letter}{max_row}")


def build_notes_sheet(wb: Workbook) -> None:
    ws = wb.create_sheet("说明", 0)
    ws.sheet_view.showGridLines = False
    ws.column_dimensions["A"].width = 4
    ws.column_dimensions["B"].width = 100

    ws.merge_cells("A1:B1")
    cell = ws["A1"]
    cell.value = "生康足球队 · 比赛录入表"
    cell.font = TITLE_FONT
    cell.fill = TITLE_FILL
    cell.alignment = Alignment(vertical="center", indent=1)
    ws.row_dimensions[1].height = 32

    blocks = [
        ("怎么用", [
            "1. 「比赛」表每场填一行：比赛ID、日期、赛事、对手、比分、阵型、队长、MVP。",
            "2. 「战报」表同一场比赛填一行：一句话总结、评语、战报正文、记录人、待补充信息。",
            "3. 「出场」表每个真正上场的球员一行（替补席没上场的不填）。",
            "4. 「事件」表填进球与换人，进球一行、换人一行。",
            "5. 有照片就在「照片」表登记文件路径和说明。",
            "6. 存盘后运行：python tools/import_matches.py",
            "   导入成功后会自动调用 node tools/build_team_data.mjs，网站数据随即更新。",
        ]),
        ("三条铁律", [
            "· 不确定的就留空或写进「待补充信息」，不要猜。助攻、进球分钟、出场分钟、照片人物都属于这一类。",
            "· 同一个比赛ID 必须同时出现在「比赛／战报／出场／事件／照片」里，否则那一行会被忽略。",
            "· 比赛ID 写成「日期-杯赛-对手拼音」，例如 2026-11-06-eleven-jisuanji；各表都有下拉可直接选。",
        ]),
        ("常见填法", [
            "· 日期写 2026-11-06。这一列是文本格式，Excel 不会把它变成日期。",
            "· 开球时间留空按 12:00；场地留空按「武汉纺织大学足球场」。",
            "· 全场分钟不知道就留空——脚本不会替你按 90 分钟算。",
            "· 首发球员「上场分钟」填 0；被换下才填「下场分钟」。",
            "· 替补上场的球员：首发填「否」，上场分钟填换上去的那一分钟。",
            "· 零封只在本场对方 0 球时填「是」；低失球场只在对方 ≤1 球时填「是」。",
            "· 战报正文分段：段与段之间留一个空行。",
        ]),
        ("脚本会替你检查", [
            "· 球员姓名是否在名单里、同一场是否重复出场。",
            "· 首发是否超过 11 人、位置是否合法。",
            "· 进球事件数是否等于比分；助攻者、MVP 是否有出场。",
            "· 换人与出场分钟是否对得上（谁上谁下、第几分钟）。",
            "· 比分与零封／低失球场是否矛盾。",
            "任何一条不符会直接报错并指出是第几行，不会写坏数据；写坏了也会自动回滚。",
        ]),
        ("与其他文件的关系", [
            "· 本表只管「逐场比赛」，导入时只改 data/team-records.json 的 matches。",
            "· 不会动历史基数（baseline）、2026-10-15 之前的比赛、球员资料和首发。",
            "· data/生康足球队数据源.xlsx 是迁移前的历史存档，不要再往里填球员或赛程。",
            "· 导入是幂等的：同一份表重复导入不会重复累计。",
            "· 删除比赛不要直接删行，请改 JSON 或交给维护者。",
        ]),
    ]

    row = 3
    for title, lines in blocks:
        ws.cell(row=row, column=2, value=title).font = SECTION_FONT
        row += 1
        for line in lines:
            cell = ws.cell(row=row, column=2, value=line)
            cell.font = NOTE_FONT
            cell.alignment = Alignment(wrap_text=True, vertical="top")
            ws.row_dimensions[row].height = max(18, 16 * (1 + text_width(line) // 92))
            row += 1
        row += 1


def build_reference_sheet(wb: Workbook, records: dict) -> None:
    ws = wb.create_sheet("参考")
    ws.sheet_view.showGridLines = False
    ws["A1"] = "球员名单"
    ws["A1"].font = SECTION_FONT
    for idx, header in enumerate(["姓名", "号码", "主位置"], start=1):
        cell = ws.cell(row=2, column=idx, value=header)
        cell.font = HEADER_FONT
        cell.fill = HEADER_FILL
    for r, player in enumerate(records["players"], start=3):
        ws.cell(row=r, column=1, value=player["name"]).font = BODY_FONT
        ws.cell(row=r, column=2, value=player.get("number")).font = BODY_FONT
        ws.cell(row=r, column=3, value=player.get("pos")).font = BODY_FONT
    ws.column_dimensions["A"].width = 14
    ws.column_dimensions["B"].width = 8
    ws.column_dimensions["C"].width = 10

    ws["E1"] = "赛事"
    ws["E1"].font = SECTION_FONT
    for idx, header in enumerate(["赛事ID", "名称"], start=5):
        cell = ws.cell(row=2, column=idx, value=header)
        cell.font = HEADER_FONT
        cell.fill = HEADER_FILL
    for r, comp in enumerate(records["competitions"], start=3):
        ws.cell(row=r, column=5, value=comp["id"]).font = BODY_FONT
        ws.cell(row=r, column=6, value=comp["name"]).font = BODY_FONT
    ws.column_dimensions["E"].width = 22
    ws.column_dimensions["F"].width = 16
    ws.sheet_state = "hidden"


def match_row(match: dict, players: dict) -> list:
    name = lambda pid: players.get(pid, {}).get("name", "") if pid is not None else ""
    return [
        match["id"], match["date"], match.get("kickoff", ""), match.get("venue", ""),
        match["competitionId"], match["opponent"], match["goalsFor"], match["goalsAgainst"],
        match.get("formation", ""), name(match.get("captainId")), match.get("fullTimeMinutes", ""),
        name(match.get("mvpId")),
    ]


def report_row(match: dict) -> list:
    return [
        match["id"], match.get("quote", ""), match.get("mvpReview", ""), match.get("reportTitle", ""),
        "\n\n".join(match.get("report", [])), "、".join(match.get("recorders", [])),
        "、".join(match.get("photographers", [])), "\n".join(match.get("missingInfo", [])),
    ]


def build(output: Path) -> None:
    records = load_records()
    players = {p["id"]: p for p in records["players"]}

    wb = Workbook()
    wb.remove(wb.active)
    build_notes_sheet(wb)
    build_reference_sheet(wb, records)

    matches, reports, appearances, events, photos = [], [], [], [], []
    for match in records["matches"]:  # 保持原顺序，保证导入可无损往返
        matches.append(match_row(match, players))
        reports.append(report_row(match))
        for app in match.get("appearances", []):
            appearances.append([
                match["id"], players.get(app["playerId"], {}).get("name", ""),
                "是" if app.get("started") else "否", app.get("position", ""),
                app.get("onMinute", 0), app.get("offMinute"),
                "是" if app.get("cleanSheet") else "", "是" if app.get("lowConcedeGame") else "",
            ])
        for ev in match.get("events", []):
            if ev["type"] == "goal":
                events.append([match["id"], ev["minute"], "进球",
                               players.get(ev["playerId"], {}).get("name", ""),
                               players.get(ev["assistId"], {}).get("name", "") if ev.get("assistId") else "",
                               ev.get("exactTime", "")])
            else:
                events.append([match["id"], ev["minute"], "换人",
                               players.get(ev["playerInId"], {}).get("name", ""),
                               players.get(ev["playerOutId"], {}).get("name", ""),
                               ev.get("exactTime", "")])
        for photo in match.get("photos", []):
            photos.append([match["id"], photo.get("src", ""), photo.get("caption", ""), photo.get("photographer", "")])

    specs = [
        ("比赛", MATCH_COLUMNS, matches, "比赛（一场一行：比分、阵型、队长、MVP）"),
        ("战报", REPORT_COLUMNS, reports, "战报（一场一行：总结、评语、正文、记录人、待补充）"),
        ("出场", APPEARANCE_COLUMNS, appearances, "出场（上场球员每人一行，靠比赛ID关联）"),
        ("事件", EVENT_COLUMNS, events, "事件（进球一行、换人一行）"),
        ("照片", PHOTO_COLUMNS, photos, "照片（一张一行）"),
    ]
    for name, columns, rows, title in specs:
        ws = wb.create_sheet(name)
        style_table(ws, columns, title)
        fill_rows(ws, columns, rows)

    # 下拉验证
    player_rows = len(records["players"]) + 2
    comp_rows = len(records["competitions"]) + 2
    letters = {name: get_column_letter(i) for i, (name, _, _) in enumerate(MATCH_COLUMNS, start=1)}
    app_letters = {name: get_column_letter(i) for i, (name, _, _) in enumerate(APPEARANCE_COLUMNS, start=1)}
    ev_letters = {name: get_column_letter(i) for i, (name, _, _) in enumerate(EVENT_COLUMNS, start=1)}
    re_letters = {name: get_column_letter(i) for i, (name, _, _) in enumerate(REPORT_COLUMNS, start=1)}

    add_list_validation(wb["比赛"], letters["赛事ID"], f"参考!$E$3:$E${comp_rows}")
    add_list_validation(wb["比赛"], letters["队长"], f"参考!$A$3:$A${player_rows}")
    add_list_validation(wb["比赛"], letters["MVP"], f"参考!$A$3:$A${player_rows}")
    add_list_validation(wb["出场"], app_letters["球员姓名"], f"参考!$A$3:$A${player_rows}")
    add_list_validation(wb["出场"], app_letters["首发"], '"是,否"')
    add_list_validation(wb["出场"], app_letters["本场位置"], '"GK,DF,MF,FW"')
    add_list_validation(wb["出场"], app_letters["零封"], '"是,否"')
    add_list_validation(wb["出场"], app_letters["低失球场"], '"是,否"')
    add_list_validation(wb["事件"], ev_letters["类型"], '"进球,换人"')
    add_list_validation(wb["事件"], ev_letters["进球者或换上"], f"参考!$A$3:$A${player_rows}")
    add_list_validation(wb["事件"], ev_letters["助攻或换下"], f"参考!$A$3:$A${player_rows}")

    # 明细表的比赛ID 直接引用「比赛」表，避免手打错
    for sheet, col in (("战报", re_letters["比赛ID"]), ("出场", app_letters["比赛ID"]),
                       ("事件", ev_letters["比赛ID"]),
                       ("照片", get_column_letter(1))):
        add_list_validation(wb[sheet], col, "比赛!$A$3:$A$500")

    order = ["说明", "比赛", "战报", "出场", "事件", "照片", "参考"]
    wb._sheets = [wb[name] for name in order]

    output.parent.mkdir(parents=True, exist_ok=True)
    wb.save(output)
    print(f"已生成 {output}（比赛 {len(matches)} 场 / 战报 {len(reports)} 条 / 出场 {len(appearances)} 条 / "
          f"事件 {len(events)} 条 / 照片 {len(photos)} 张）")


def main() -> None:
    parser = argparse.ArgumentParser(description="生成比赛录入工作簿")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    build(args.output)


if __name__ == "__main__":
    main()
