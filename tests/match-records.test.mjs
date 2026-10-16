import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { build, outputs, statKeys } from '../tools/build_team_data.mjs';

const source = JSON.parse(fs.readFileSync('data/team-records.json', 'utf8'));
const matchId = '2026-10-16-eleven-material';
test('本场12名出场球员、进球、助攻、MVP从明细正确汇总，历史不重复计数', () => {
    const data = build(source), match = data.matches.find(m => m.id === matchId);
    assert.equal(match.score, '2 : 3');
    assert.equal(match.kickoff, '12:00');
    assert.equal(match.appearances.filter(a => a.started).length, 11);
    assert.equal(match.appearances.length, 12);
    const byName = Object.fromEntries(data.players.map(p => [p.name, p]));
    const expected = { '吴宇成': 12, '刘航宇': 9, '田杨洋': 1, '张俊': 7, '李傲': 9, '彭卓伦': 9, '肖思博': 1, '段世添': 1, '何嗣承': 11, '吴宇泽': 12, '周霄旭': 11, '吴全银': 7 };
    for (const [name, apps] of Object.entries(expected)) {
        assert.equal(byName[name].apps, apps, name);
        assert.equal(byName[name].matchHistory.length, 1);
    }
    assert.equal(byName['彭卓伦'].goals, 3);
    assert.equal(byName['段世添'].goals, 1);
    assert.equal(byName['段世添'].motm, 1);
    assert.equal(byName['何嗣承'].asts, 2);
    assert.equal(byName['刘航宇'].cleanSheets, 1); // 沿用历史1次，本场不增加
    assert.equal(data.players.reduce((n, p) => n + p.apps - p.baseline.apps, 0), 12);
    assert.equal(data.players.reduce((n, p) => n + p.goals - p.baseline.goals, 0), 2);
    assert.equal(data.players.reduce((n, p) => n + p.asts - p.baseline.asts, 0), 1);
    for (const p of data.players.filter(p => !Object.hasOwn(expected, p.name))) {
        for (const key of statKeys) assert.equal(p[key], p.baseline[key], `${p.name}.${key}`);
    }
});
test('重复生成完全一致，源记录不被改变，已生成文件与来源一致', () => {
    const before = JSON.stringify(source);
    assert.deepEqual(build(source), build(source));
    assert.equal(JSON.stringify(source), before);
    for (const [file, text] of outputs(source)) assert.equal(fs.readFileSync(file, 'utf8'), text, file);
});
test('纠正进球归属和补充出场会重新计算，不叠加旧数值', () => {
    const edit = structuredClone(source);
    edit.matches[0].events[1].playerId = 7;
    const data = build(edit);
    assert.equal(data.players.find(p => p.name === '段世添').goals, 0);
    assert.equal(data.players.find(p => p.id === 7).goals, 7);
    assert.equal(data.players.find(p => p.name === '段世添').apps, 1);
    edit.matches[0].appearances.push({playerId:2,started:false,position:'DF',onMinute:55,offMinute:null});
    edit.matches[0].appearances.find(a=>a.playerId===10).offMinute=55;
    edit.matches[0].events.push({type:'substitution',minute:55,playerInId:2,playerOutId:10});
    assert.equal(build(edit).players.find(p=>p.id===2).apps, 5);
});
test('拒绝重复比赛、重复赛程、重复出场、未知球员、比分冲突及错误换人', () => {
    const corruptions = [
        r => r.matches.push(structuredClone(r.matches[0])),
        r => r.matches.push({...structuredClone(r.matches[0]), id:'another-id'}),
        r => r.matches[0].appearances.push(r.matches[0].appearances[0]),
        r => r.matches[0].appearances[0].playerId=999,
        r => r.matches[0].goalsFor=3,
        r => r.matches[0].events[0].assistId=8,
        r => r.matches[0].events[2].minute=49,
        r => r.matches[0].date='2025-10-01',
        r => r.matches[0].appearances.find(a=>a.playerId===4).cleanSheet=true,
        r => r.matches[0].photos.push({src:'../secret.jpg',caption:'test'}),
        r => r.matches[0].events[0].minute=51,
    ];
    for (const corrupt of corruptions) { const edit=structuredClone(source);corrupt(edit);assert.throws(()=>build(edit)); }
});
test('比赛详情显示门将、阵容、事件、战报、MVP和照片空状态，历史场次可回看', () => {
    const window={PONYTAIL_DATA:build(source)};
    vm.runInNewContext(fs.readFileSync('js/match-detail.js','utf8'),{window});
    const target={innerHTML:''};
    window.renderTeamMatch(target,matchId);
    for (const text of ['刘航宇','4-4-2','何嗣承','吴全银','段世添','本场 MVP','我们是一个团队','match-2026-10-16-01.jpg','match-2026-10-16-05.jpg','摄影：陈晗韵、刘雨莹','助攻待确认']) assert.ok(target.innerHTML.includes(text),text);
    assert.ok(!target.innerHTML.includes('首发门将待补充'));
    window.PONYTAIL_DATA.matches[0].report=['<script>bad</script>'];
    window.PONYTAIL_DATA.matches[0].photos=[{src:'assets/photos/sample.jpg',caption:'比赛合影'}];
    window.renderTeamMatch(target,matchId);
    assert.ok(target.innerHTML.includes('&lt;script&gt;bad&lt;/script&gt;'));
    assert.ok(target.innerHTML.includes('比赛合影'));
    window.renderTeamMatch(target,source.historicalMatches[0].id);
    assert.ok(target.innerHTML.includes('历史比赛的阵容与详细事件待补充'));
    window.renderTeamMatch(target,'missing');
    assert.ok(target.innerHTML.includes('未找到这场比赛'));
});
