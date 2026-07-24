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


class TeamWorkbookSyncTest(unittest.TestCase):
    def test_workbook_has_formula_driven_player_data_and_schedule_sheets(self):
        self.assertTrue(WORKBOOK_PATH.exists())
        workbook = load_workbook(WORKBOOK_PATH, data_only=False)
        self.assertIn('球员数据', workbook.sheetnames)
        self.assertIn('赛事索引', workbook.sheetnames)
        self.assertIn('赛程', workbook.sheetnames)
        self.assertTrue(str(workbook['球员数据']['M2'].value).startswith('=ROUND(MIN('))
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
            self.assertEqual(player['saves'], row['扑救'])
            self.assertEqual(player['cleanSheets'], row['零封'])
            self.assertEqual(player['rating'], row['评分'])
            self.assertEqual(player['memory'], row['代表数据'])


if __name__ == '__main__':
    unittest.main()
