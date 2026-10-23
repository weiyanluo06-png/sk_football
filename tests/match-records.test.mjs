import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { build, outputs, statKeys } from '../tools/build_team_data.mjs';

const source = JSON.parse(fs.readFileSync('data/team-records.json', 'utf8'));
const matchId = '2026-10-16-eleven-material';
const managementMatchId = '2026-10-23-eleven-management';
test('两场比赛的出场、进球、助攻、MVP和零封从明细正确汇总，历史不重复计数', () => {
    const data = build(source), match = data.matches.find(m => m.id === matchId);
    assert.equal(match.score, '2 : 3');
    assert.equal(match.kickoff, '12:00');
    assert.equal(match.appearances.filter(a => a.started).length, 11);
    assert.equal(match.appearances.length, 12);
    const byName = Object.fromEntries(data.players.map(p => [p.name, p]));
    const expected = { '吴宇成': 13, '刘航宇': 10, '田杨洋': 2, '张俊': 8, '李傲': 10, '彭卓伦': 10, '肖思博': 2, '段世添': 2, '何嗣承': 12, '吴宇泽': 13, '周霄旭': 12, '吴全银': 7, '王伯涵': 10, '曹维嘉': 9 };
    for (const [name, apps] of Object.entries(expected)) {
        assert.equal(byName[name].apps, apps, name);
    }
    assert.equal(byName['彭卓伦'].goals, 3);
    assert.equal(byName['段世添'].goals, 2);
    assert.equal(byName['段世添'].motm, 2);
    assert.equal(byName['何嗣承'].asts, 2);
    assert.equal(byName['刘航宇'].cleanSheets, 2);
    assert.equal(data.players.reduce((n, p) => n + p.apps - p.baseline.apps, 0), 25);
    assert.equal(data.players.reduce((n, p) => n + p.goals - p.baseline.goals, 0), 4);
    assert.equal(data.players.reduce((n, p) => n + p.asts - p.baseline.asts, 0), 3);
    for (const p of data.players.filter(p => !Object.hasOwn(expected, p.name))) {
        for (const key of statKeys) assert.equal(p[key], p.baseline[key], `${p.name}.${key}`);
    }
});
test('管理学院一战记录首胜、精确进球时间、两次换人、队长、零封和场外录制', () => {
    const data = build(source), match = data.matches.find(m => m.id === managementMatchId);
    assert.equal(match.score, '2 : 0');
    assert.equal(match.result, 'win');
    assert.equal(match.kickoff, '12:00');
    assert.equal(match.venue, '武汉纺织大学足球场');
    assert.equal(match.fullTimeMinutes, 70);
    assert.equal(match.captainId, 9);
    assert.equal(match.appearances.filter(a => a.started).length, 11);
    assert.equal(match.appearances.length, 13);
    assert.equal(match.appearances.find(a => a.playerId === 4).cleanSheet, true);
    assert.deepEqual(match.events.filter(e => e.type === 'goal').map(e => [e.minute, e.exactTime || null, e.playerId, e.assistId]), [[19, '19:15', 9, 18], [60, null, 18, 9]]);
    assert.deepEqual(match.events.filter(e => e.type === 'substitution').map(e => [e.minute, e.playerInId, e.playerOutId]), [[35, 3, 12], [50, 5, 27]]);
    assert.deepEqual(match.recorders, ['赵慰冉', '王凯程', '刘雨莹', '陈涵韵']);
    assert.equal(match.photos.length, 21);
    assert.equal(new Set(match.photos.map(photo => photo.src)).size, 21);
    assert.equal(match.photos[0].src, 'assets/photos/match-2026-10-23-01.jpg');
    for (const photo of match.photos) assert.ok(fs.existsSync(photo.src), photo.src);
    assert.equal(match.mvpId, 18);
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
    assert.equal(data.players.find(p => p.name === '段世添').goals, 1);
    assert.equal(data.players.find(p => p.id === 7).goals, 7);
    assert.equal(data.players.find(p => p.name === '段世添').apps, 2);
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
    for (const text of ['刘航宇','4-4-2','何嗣承','吴全银','段世添','本场 MVP','我们是一个团队','match-2026-10-16-01.jpg','match-2026-10-16-05.jpg','摄影：陈涵韵、刘雨莹','助攻待确认']) assert.ok(target.innerHTML.includes(text),text);
    assert.ok(!target.innerHTML.includes('首发门将待补充'));
    window.renderTeamMatch(target,managementMatchId);
    for (const text of ['十一人制首胜','19:15','全场70分钟','王伯涵 换下 李傲','曹维嘉 换下 田杨洋','场外录制','赵慰冉、王凯程、刘雨莹、陈涵韵','match-2026-10-23-01.jpg','match-2026-10-23-21.jpg']) assert.ok(target.innerHTML.includes(text),text);
    assert.ok(!target.innerHTML.includes('本场摄影：</p>'));
    const materialMatch = window.PONYTAIL_DATA.matches.find(match => match.id === matchId);
    materialMatch.report=['<script>bad</script>'];
    materialMatch.photos=[{src:'assets/photos/sample.jpg',caption:'比赛合影'}];
    window.renderTeamMatch(target,matchId);
    assert.ok(target.innerHTML.includes('&lt;script&gt;bad&lt;/script&gt;'));
    assert.ok(target.innerHTML.includes('比赛合影'));
    window.renderTeamMatch(target,source.historicalMatches[0].id);
    assert.ok(target.innerHTML.includes('历史比赛的阵容与详细事件待补充'));
    window.renderTeamMatch(target,'missing');
    assert.ok(target.innerHTML.includes('未找到这场比赛'));
});
test('十一人制首胜公告已经发布并链接到本场比赛', () => {
    const window = {};
    vm.runInNewContext(fs.readFileSync('js/notices-data.js', 'utf8'), { window });
    const notice = window.TEAM_NOTICES.find(item => item.id === 'eleven-first-win-management-2026');
    assert.ok(notice);
    assert.equal(notice.status, '发布');
    assert.equal(notice.link, '#match/2026-10-23-eleven-management');
    assert.match(notice.body, /第19分15秒/);
    assert.match(notice.body, /十一人制正式比赛首胜/);
    assert.match(notice.body, /21张比赛图片/);
    assert.equal(notice.image, 'assets/photos/match-2026-10-23-01.jpg');
});
