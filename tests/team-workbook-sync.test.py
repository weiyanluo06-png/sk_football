import json
import subprocess
import unittest
from pathlib import Path

from openpyxl import load_workbook


ROOT = Path(__file__).resolve().parents[1]
WORKBOOK_PATH = ROOT / 'data' / '生康足球队数据源.xlsx'


def load_site_data():
    script = """
const fs = require('fs');
const vm = require('vm');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync('js/team-data.js', 'utf8'), context);
process.stdout.write(JSON.stringify(context.window.PONYTAIL_DATA));
"""
    result = subprocess.run(['node', '-e', script], cwd=ROOT, check=True, capture_output=True)
    return json.loads(result.stdout.decode('utf-8'))


def load_newcomer_data():
    script = """
const fs = require('fs');
const vm = require('vm');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync('js/newcomer-data.js', 'utf8'), context);
process.stdout.write(JSON.stringify(context.window.NEWCOMER_DATA));
"""
    result = subprocess.run(['node', '-e', script], cwd=ROOT, check=True, capture_output=True)
    return json.loads(result.stdout.decode('utf-8'))


class TeamWorkbookSyncTest(unittest.TestCase):
    def test_workbook_has_isolated_newcomer_sheet(self):
        workbook = load_workbook(WORKBOOK_PATH, data_only=False)
        self.assertIn('新生展示', workbook.sheetnames)
        headers = [cell.value for cell in workbook['新生展示'][1]]
        self.assertEqual(headers, [
            '排序', '姓名', '年级', '号码', '主位置', '可胜任位置',
            '惯用脚', '踢球风格', '自我介绍', '照片文件名', '照片焦点', '展示状态',
        ])

    def test_newcomers_are_not_official_players(self):
        workbook = load_workbook(WORKBOOK_PATH, data_only=True)
        rows = list(workbook['新生展示'].iter_rows(min_row=2, values_only=True))
        visible_names = {row[1] for row in rows if row[0] is not None and row[11] == '展示'}
        newcomer_names = {item['name'] for item in load_newcomer_data()['newcomers']}
        official_names = {item['name'] for item in load_site_data()['players']}
        self.assertEqual(newcomer_names, visible_names)
        self.assertTrue(newcomer_names.isdisjoint(official_names))

    def test_workbook_has_formula_driven_player_data_and_schedule_sheets(self):
        self.assertTrue(WORKBOOK_PATH.exists())
        workbook = load_workbook(WORKBOOK_PATH, data_only=False)
        self.assertIn('球员数据', workbook.sheetnames)
        self.assertIn('赛事索引', workbook.sheetnames)
        self.assertIn('赛程', workbook.sheetnames)
        headers = [cell.value for cell in workbook['球员数据'][1]]
        self.assertNotIn('扑救', headers)
        self.assertIn('低失球场', headers)
        rating_formula = str(workbook['球员数据']['M2'].value)
        self.assertTrue(rating_formula.startswith('=ROUND(MIN('))
        self.assertIn('IF(E2="DF"', rating_formula)
        self.assertTrue(str(workbook['球员数据']['O2'].value).startswith('=IF('))

    def test_player_stats_in_workbook_match_the_website(self):
        workbook = load_workbook(WORKBOOK_PATH, data_only=True)
        worksheet = workbook['球员数据']
        headers = [cell.value for cell in worksheet[1]]
        rows = [dict(zip(headers, values)) for values in worksheet.iter_rows(min_row=2, values_only=True)]
        site_players = {player['name']: player for player in load_site_data()['players']}

        self.assertEqual(set(site_players), {row['姓名'] for row in rows})
        for row in rows:
            player = site_players[row['姓名']]
            self.assertEqual(player['number'], row['号码'])
            self.assertEqual(player['pos'], row['主位置'])
            self.assertEqual(player['role'], row['可胜任位置'])
            self.assertEqual(player['apps'], row['出场'])
            self.assertEqual(player['goals'], row['进球'])
            self.assertEqual(player['asts'], row['助攻'])
            self.assertEqual(player['motm'], row['MVP'])
            self.assertEqual(player['cleanSheets'], row['零封'])
            self.assertEqual(player['lowConcedeGames'], row['低失球场'])
            self.assertEqual(player['rating'], row['评分'])
            self.assertEqual(player['memory'], row['代表数据'])
            self.assertNotIn('saves', player)


if __name__ == '__main__':
    unittest.main()
