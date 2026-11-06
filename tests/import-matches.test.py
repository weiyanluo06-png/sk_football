"""比赛录入工作簿 <-> team-records.json 的往返与校验测试。

运行：
    python tests/import-matches.test.py
覆盖：
- 从现有 JSON 生成的录入表，导入回来必须完全一致（往返无损）
- 新增一场比赛后，只增加该场的出场与事件，不重复累计
- 常见填表错误必须被拦下并给出可读提示
"""
import importlib.util
import json
import shutil
import sys
import unittest
import uuid
from pathlib import Path

from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[1]
RECORDS_PATH = ROOT / "data" / "team-records.json"


def load_module(name: str, relative: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / relative)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


BUILD = load_module("build_match_workbook", "tools/build_match_workbook.py")
IMPORT = load_module("import_matches", "tools/import_matches.py")


class ImportMatchesTest(unittest.TestCase):
    def setUp(self):
        # 用工作区内的临时目录：系统 TEMP 在当前沙箱下不可写
        self.dir = ROOT / f".tmp-import-test-{uuid.uuid4().hex[:8]}"
        self.dir.mkdir(parents=True, exist_ok=True)
        self.addCleanup(shutil.rmtree, self.dir, True)
        self.records = json.loads(RECORDS_PATH.read_text(encoding="utf-8"))
        self.workbook_path = self.dir / "比赛录入.xlsx"
        BUILD.build(self.workbook_path)

    # ---------- 工具 ----------

    def append_rows(self, sheet: str, rows: list[list]) -> None:
        workbook = load_workbook(self.workbook_path)
        workbook[sheet].append([""] * 0 or rows)
        workbook.save(self.workbook_path)

    def append_match(self, overrides: dict | None = None) -> str:
        workbook = load_workbook(self.workbook_path)
        ws = workbook["比赛"]
        headers = [c.value for c in ws[2]]
        row = {
            "比赛ID": "2026-11-06-eleven-jisuanji",
            "日期": "2026-11-06",
            "开球时间": "12:00",
            "场地": "武汉纺织大学足球场",
            "赛事ID": "2026-eleven-fangda",
            "对手": "计算机学院",
            "我方进球": 1,
            "对方进球": 0,
            "阵型": "4-4-2",
            "队长": "周霄旭",
            "全场分钟": 70,
            "MVP": "段世添",
        }
        row.update(overrides or {})
        ws.append([row.get(h, "") for h in headers])

        mid = row["比赛ID"]
        ws_report = workbook["战报"]
        report_headers = [c.value for c in ws_report[2]]
        report = {
            "比赛ID": mid,
            "一句话总结": "小组赛两连胜。",
            "MVP评语": "制胜球",
            "战报标题": "2:1 / 本场标题",
            "战报正文": "第一段。\n\n第二段。",
            "记录人": "陈晗韵",
            "摄影": "刘雨莹",
            "待补充信息": "对方进球时间待补充",
        }
        report.update(overrides or {})
        ws_report.append([report.get(h, "") for h in report_headers])

        wa = workbook["出场"]
        starters = [("刘航宇", "GK"), ("王伯涵", "DF"), ("吴宇成", "DF"), ("李傲", "DF"), ("吴全银", "DF"),
                    ("何嗣承", "MF"), ("彭卓伦", "MF"), ("张俊", "MF"), ("吴宇泽", "FW"), ("周霄旭", "FW"),
                    ("段世添", "FW")]
        for name, pos in starters:
            wa.append([mid, name, "是", pos, 0, None, "", ""])
        we = workbook["事件"]
        we.append([mid, 65, "进球", "段世添", "", ""])
        workbook.save(self.workbook_path)
        return mid

    def merge(self, force=False):
        workbook = load_workbook(self.workbook_path)
        return IMPORT.merge_matches(self.records, workbook, force)[0]

    # ---------- 用例 ----------

    def test_roundtrip_is_lossless(self):
        """从现有 JSON 生成的表，导入回来必须与原 JSON 完全一致。"""
        imported = self.merge()
        self.assertEqual(imported, self.records["matches"])

    def test_new_match_only_adds_that_match(self):
        mid = self.append_match()
        imported = self.merge()
        self.assertEqual(len(imported), len(self.records["matches"]) + 1)
        new = next(m for m in imported if m["id"] == mid)
        self.assertEqual(new["opponent"], "计算机学院")
        self.assertEqual(new["goalsFor"], 1)
        self.assertEqual(new["season"], "2026-2027")
        self.assertEqual(len(new["appearances"]), 11)
        self.assertEqual(len(new["events"]), 1)
        self.assertEqual(new["missingInfo"], ["对方进球时间待补充"])
        # 其余比赛原样保留
        for old in self.records["matches"]:
            self.assertIn(old, imported)

    def test_rejects_unknown_player(self):
        self.append_match()
        workbook = load_workbook(self.workbook_path)
        ws = workbook["出场"]
        ws.append(["2026-11-06-eleven-jisuanji", "不存在的人", "是", "FW", 0, None, "", ""])
        workbook.save(self.workbook_path)
        with self.assertRaises(IMPORT.ImportProblem) as ctx:
            self.merge()
        self.assertIn("不在名单里", str(ctx.exception))

    def test_rejects_goal_count_mismatch(self):
        self.append_match({"我方进球": 3})
        with self.assertRaises(IMPORT.ImportProblem) as ctx:
            self.merge()
        self.assertIn("进球", str(ctx.exception))

    def test_rejects_duplicate_player(self):
        self.append_match()
        workbook = load_workbook(self.workbook_path)
        workbook["出场"].append(["2026-11-06-eleven-jisuanji", "周霄旭", "是", "FW", 0, None, "", ""])
        workbook.save(self.workbook_path)
        with self.assertRaises(IMPORT.ImportProblem) as ctx:
            self.merge()
        self.assertIn("重复出场", str(ctx.exception))

    def test_rejects_date_inside_baseline(self):
        self.append_match({"比赛ID": "2026-10-01-eleven-x", "日期": "2026-10-01"})
        with self.assertRaises(IMPORT.ImportProblem) as ctx:
            self.merge()
        self.assertIn("历史基数", str(ctx.exception))

    def test_rejects_missing_match_id(self):
        self.append_match({"比赛ID": ""})
        with self.assertRaises(IMPORT.ImportProblem) as ctx:
            self.merge()
        self.assertIn("比赛ID 不能为空", str(ctx.exception))

    def test_rejects_conflicting_existing_id(self):
        existing = self.records["matches"][0]
        self.append_match({"比赛ID": existing["id"], "日期": "2026-11-30"})
        with self.assertRaises(IMPORT.ImportProblem) as ctx:
            self.merge()
        self.assertIn("已存在", str(ctx.exception))


if __name__ == "__main__":
    unittest.main(verbosity=2)
