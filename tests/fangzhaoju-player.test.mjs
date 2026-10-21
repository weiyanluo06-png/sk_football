import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { build } from '../tools/build_team_data.mjs';

const records = JSON.parse(fs.readFileSync('data/team-records.json', 'utf8'));

test('方昭炬使用固定球员ID、位置待定且个人统计从0开始', () => {
    const player = build(records).players.find(item => item.name === '方昭炬');
    assert.ok(player);
    assert.equal(player.id, 29);
    assert.equal(player.number, 44);
    assert.equal(player.pos, 'TBD');
    assert.equal(player.role, '位置待定');
    assert.equal(player.nickname, '2026级 · 右脚');
    for (const key of ['apps', 'goals', 'asts', 'motm', 'cleanSheets', 'lowConcedeGames']) {
        assert.equal(player.baseline[key], 0, `baseline.${key}`);
        assert.equal(player[key], 0, key);
    }
    assert.deepEqual(player.matchHistory, []);
});

test('新生展示、欢迎公告和位置待定球员池均已同步', () => {
    const context = { window: {} };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync('js/newcomer-data.js', 'utf8'), context);
    vm.runInContext(fs.readFileSync('js/notices-data.js', 'utf8'), context);
    const newcomer = context.window.NEWCOMER_DATA.newcomers.find(item => item.name === '方昭炬');
    const notice = context.window.TEAM_NOTICES.find(item => item.id === 'welcome-fangzhaoju-2026');
    assert.equal(newcomer.pos, '位置待定');
    assert.equal(newcomer.preferredFoot, '右脚');
    assert.equal(newcomer.photo, 'assets/players/fangzhaoju.jpg');
    assert.ok(notice.body.includes('个人统计将从0开始'));
    assert.equal(notice.image, 'assets/players/showcase/fangzhaoju-640.webp');
    assert.ok(fs.existsSync(newcomer.photo));
    assert.ok(fs.readFileSync('index.html', 'utf8').includes('id="pool-TBD"'));
    assert.ok(fs.readFileSync('js/tactics.js', 'utf8').includes("'TBD'"));
});
