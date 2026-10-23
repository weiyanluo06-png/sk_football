import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const statKeys = ['apps', 'goals', 'asts', 'motm', 'cleanSheets', 'lowConcedeGames'];
const fail = message => { throw new Error(message); };
const count = value => Number.isInteger(value) && value >= 0;
const safeAsset = value => typeof value === 'string' && /^assets\/[a-zA-Z0-9_\-./]+$/.test(value) && !value.split('/').includes('..');

export function build(records) {
    if (records.schemaVersion !== 1) fail('不支持的数据版本');
    const players = new Map(), matchIds = new Set(), fixtures = new Set();
    const competitions = new Map();
    const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
    if (!validDate(records.baseline.through)) fail('历史基数截止日期无效');
    for (const competition of records.competitions) {
        if (!competition.id || competitions.has(competition.id)) fail('赛事ID重复或缺失');
        competitions.set(competition.id, competition);
    }
    if (!competitions.has(records.defaultCompetitionId)) fail('默认赛事不存在');
    const names = new Set();
    for (const profile of records.players) {
        if (!Number.isInteger(profile.id) || players.has(profile.id) || names.has(profile.name) || !profile.name) fail('球员ID或姓名重复/缺失');
        if (!statKeys.every(key => count(profile.baseline[key]))) fail(`${profile.name}的历史统计无效`);
        names.add(profile.name);
        players.set(profile.id, { ...structuredClone(profile), ...profile.baseline, matchHistory: [] });
    }
    const person = id => players.get(id) || fail(`未知球员ID：${id}`);
    const register = match => {
        if (!/^[a-z0-9-]+$/.test(match.id) || matchIds.has(match.id)) fail('比赛ID重复或无效');
        if (!validDate(match.date) || !competitions.has(match.competitionId)) fail(`比赛${match.id}日期或赛事无效`);
        const key = [match.competitionId, match.date, match.opponent, match.kickoff || ''].join('|');
        if (fixtures.has(key)) fail('同一赛程重复录入');
        fixtures.add(key); matchIds.add(match.id);
    };
    const matches = structuredClone(records.historicalMatches);
    matches.forEach(match => {
        register(match);
        if (match.date > records.baseline.through) fail('历史赛程超出基数截止日期');
        match.status = 'played';
    });
    for (const source of records.matches) {
        register(source);
        if (source.date <= records.baseline.through) fail('明细比赛落在历史基数内，会重复统计');
        if (source.status !== 'played') fail('明细仅接受已完赛比赛');
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(source.kickoff)) fail('开球时间无效');
        if (source.fullTimeMinutes != null && (!Number.isInteger(source.fullTimeMinutes) || source.fullTimeMinutes <= 0)) fail('全场时长无效');
        if (!count(source.goalsFor) || !count(source.goalsAgainst)) fail('比分无效');
        const appearances = new Map();
        for (const appearance of source.appearances) {
            person(appearance.playerId);
            if (appearances.has(appearance.playerId)) fail('同场球员重复出场');
            if (typeof appearance.started !== 'boolean' || !['GK', 'DF', 'MF', 'FW'].includes(appearance.position)) fail('首发标记或比赛位置无效');
            if (!count(appearance.onMinute) || (appearance.started && appearance.onMinute !== 0) || (appearance.offMinute !== null && (!count(appearance.offMinute) || appearance.offMinute < appearance.onMinute))) fail('出场时间无效');
            if (appearance.cleanSheet === true && source.goalsAgainst !== 0) fail('失球比赛不可记整场零封');
            if (appearance.lowConcedeGame === true && source.goalsAgainst > 1) fail('失球超过1球不可记低失球场');
            appearances.set(appearance.playerId, appearance);
        }
        const starters = source.appearances.filter(a => a.started);
        if (starters.length > 11) fail('首发超过11人');
        const participant = id => appearances.get(id) || fail(`球员${id}没有出场记录`);
        if (source.captainId != null) participant(source.captainId);
        if (source.mvpId != null) participant(source.mvpId);
        const goals = source.events.filter(event => event.type === 'goal');
        if (goals.length !== source.goalsFor) fail('我方进球事件数与比分不符');
        const activeAt = (id, minute) => {
            const appearance = participant(id);
            if (minute < appearance.onMinute || (appearance.offMinute !== null && minute > appearance.offMinute)) fail('事件发生时球员不在场');
        };
        const subIns = new Set(), subOuts = new Set();
        for (const event of source.events) {
            if (!count(event.minute)) fail('事件时间无效');
            if (event.exactTime != null && (!/^\d{1,3}:[0-5]\d$/.test(event.exactTime) || Number(event.exactTime.split(':')[0]) !== event.minute)) fail('事件精确时间无效');
            if (event.type === 'goal') {
                activeAt(event.playerId, event.minute);
                if (event.assistId != null) {
                    activeAt(event.assistId, event.minute);
                    if (event.assistId === event.playerId) fail('进球者不能助攻自己');
                }
            } else if (event.type === 'substitution') {
                const incoming = participant(event.playerInId), outgoing = participant(event.playerOutId);
                if (event.playerInId === event.playerOutId || incoming.started || incoming.onMinute !== event.minute || outgoing.offMinute !== event.minute || subIns.has(event.playerInId) || subOuts.has(event.playerOutId)) fail('换人与出场记录不一致');
                subIns.add(event.playerInId); subOuts.add(event.playerOutId);
            } else fail('未知比赛事件类型');
        }
        for (const appearance of source.appearances) {
            if (!appearance.started && !subIns.has(appearance.playerId)) fail('替补出场缺少换人事件');
            if (appearance.offMinute !== null && !subOuts.has(appearance.playerId)) fail('下场记录缺少换人事件');
            const player = person(appearance.playerId);
            const stats = {
                apps: 1, goals: goals.filter(e => e.playerId === player.id).length,
                asts: goals.filter(e => e.assistId === player.id).length,
                motm: Number(source.mvpId === player.id), cleanSheets: Number(appearance.cleanSheet === true),
                lowConcedeGames: Number(appearance.lowConcedeGame === true),
            };
            for (const key of statKeys) player[key] += stats[key];
            player.matchHistory.push({ matchId: source.id, date: source.date, opponent: source.opponent, started: appearance.started, position: appearance.position, onMinute: appearance.onMinute, offMinute: appearance.offMinute, ...stats });
        }
        for (const photo of source.photos) {
            if (!safeAsset(photo.src) || !photo.caption) fail('比赛照片路径或说明无效');
            if (photo.photographer && typeof photo.photographer !== 'string') fail('比赛照片摄影信息无效');
        }
        matches.push({
            ...structuredClone(source), competition: competitions.get(source.competitionId).name,
            score: `${source.goalsFor} : ${source.goalsAgainst}`,
            result: source.goalsFor > source.goalsAgainst ? 'win' : source.goalsFor < source.goalsAgainst ? 'loss' : 'draw',
            scorers: goals.map(e => `${person(e.playerId).name} ${e.minute}′${e.assistId != null ? `（助攻：${person(e.assistId).name}）` : ''}`).join(' / ') || '无进球',
        });
    }
    const resultPlayers = [...players.values()].map(player => {
        const score = 6 + player.apps * .08 + player.goals * .35 + player.asts * .25 + player.motm * .25 + player.cleanSheets * .15 + (player.pos === 'DF' ? player.apps * .06 + player.cleanSheets * .35 + player.lowConcedeGames * .15 : 0);
        player.rating = Math.round((Math.min(9.5, Math.max(6, score)) + Number.EPSILON) * 10) / 10;
        player.memory = player.goals ? `贡献 ${player.goals} 粒进球${player.asts ? ` / 送出 ${player.asts} 次助攻` : ''}` : player.asts ? `送出 ${player.asts} 次助攻` : `累计出场 ${player.apps} 场`;
        player.matchHistory.sort((a, b) => b.date.localeCompare(a.date));
        return player;
    });
    return {
        players: resultPlayers, startingLineup: records.startingLineup,
        defaultCompetitionId: records.defaultCompetitionId, competitions: records.competitions,
        matches: matches.sort((a, b) => b.date.localeCompare(a.date)), honors: records.honors,
        fallbackPhotos: records.fallbackPhotos, baselineThrough: records.baseline.through,
    };
}

export function outputs(records) {
    const data = build(records);
    return new Map([
        ['js/team-data.js', '// 自动生成：请维护 data/team-records.json，然后运行 node tools/build_team_data.mjs\nwindow.PONYTAIL_DATA = ' + JSON.stringify(data, null, 4) + ';\n'],
        ['data/player-stats.json', JSON.stringify({ schemaVersion: 1, baselineThrough: records.baseline.through, players: data.players.map(p => ({ playerId: p.id, name: p.name, baseline: p.baseline, totals: Object.fromEntries(statKeys.map(key => [key, p[key]])), matches: p.matchHistory })) }, null, 2) + '\n'],
    ]);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const check = process.argv.includes('--check');
        const records = JSON.parse(readFileSync(path.join(root, 'data/team-records.json'), 'utf8'));
        // Validate every record before writing any output. Rebuild from the baseline every time.
        for (const [relative, content] of outputs(records)) {
            const file = path.join(root, relative);
            if (check) {
                if (readFileSync(file, 'utf8') !== content) fail(`${relative}未同步，请运行 node tools/build_team_data.mjs`);
            } else writeFileSync(file, content, 'utf8');
        }
        console.log(check ? '比赛记录与生成数据一致。' : '已从历史基数和逐场记录生成网站数据及个人统计。');
    } catch (error) { console.error(error.message); process.exitCode = 1; }
}
