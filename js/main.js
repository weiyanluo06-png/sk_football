(function () {
    'use strict';

    var allPlayers = [
        { id: 101, name: '张伟', nickname: '禁区捕手', number: 9, pos: 'FW', apps: 12, goals: 14, asts: 3, role: 'ST', tackles: 9, interceptions: 4, saves: 0, cleanSheets: 0, motm: 4, rating: 8.9, featured: true, avatarIcon: 'fa-crosshairs', traits: ['门前终结', '头球', '反击'], memory: '雨战补时头球绝杀', quote: '只要还有一次传中，他就会冲到门前。', bio: '球队锋线支点，擅长门前抢点和背身拿球，是关键比赛里最稳定的得分点。' },
        { id: 102, name: '王强', nickname: '左路风', number: 7, pos: 'FW', apps: 10, goals: 8, asts: 2, role: 'LW', tackles: 12, interceptions: 5, saves: 0, cleanSheets: 0, motm: 2, rating: 8.2, featured: false, avatarIcon: 'fa-person-running', traits: ['速度', '内切', '冲刺'], memory: '半场奔袭破门', quote: '他一起速，边线就像突然变短了。', bio: '左路爆点型队员，擅长用速度制造纵深，也能回撤参与防守。' },
        { id: 103, name: '刘洋', nickname: '右路传中机', number: 11, pos: 'FW', apps: 11, goals: 5, asts: 4, role: 'RW', tackles: 10, interceptions: 6, saves: 0, cleanSheets: 0, motm: 1, rating: 7.9, featured: false, avatarIcon: 'fa-bolt', traits: ['传中', '前插', '跑位'], memory: '后点包抄锁定胜局', quote: '他总能在最合适的地方出现。', bio: '右路稳定输出，传中质量高，经常在后点和肋部找到机会。' },
        { id: 104, name: '陈实', nickname: '替补奇兵', number: 18, pos: 'FW', apps: 6, goals: 2, asts: 1, role: 'CF', tackles: 5, interceptions: 3, saves: 0, cleanSheets: 0, motm: 0, rating: 7.1, featured: false, avatarIcon: 'fa-fire', traits: ['策应', '对抗'], memory: '替补登场制造点球', quote: '不一定首发，但上来就能改变节奏。', bio: '能在前场提供身体对抗和二点球争夺，是替补席上的重要变化。' },
        { id: 105, name: '林峰', nickname: '新同学', number: 19, pos: 'FW', apps: 3, goals: 0, asts: 0, role: 'ST', tackles: 3, interceptions: 1, saves: 0, cleanSheets: 0, motm: 0, rating: 6.8, featured: false, avatarIcon: 'fa-shoe-prints', traits: ['潜力', '跑动'], memory: '第一次代表球队登场', quote: '刚来不久，但每次训练都到得很早。', bio: '新加入的前锋，正在适应球队节奏，训练态度积极。' },
        { id: 201, name: '李默', nickname: '节拍器', number: 8, pos: 'MF', apps: 12, goals: 4, asts: 11, role: 'CAM', tackles: 18, interceptions: 11, saves: 0, cleanSheets: 0, motm: 3, rating: 8.7, featured: true, avatarIcon: 'fa-compass', traits: ['组织', '直塞', '定位球'], memory: '任意球直接破门', quote: '他拿球时，大家都会开始向前跑。', bio: '球队前场节拍器，能用最后一传改变比赛，也是定位球的主要主罚者。' },
        { id: 202, name: '赵磊', nickname: '中场马达', number: 6, pos: 'MF', apps: 11, goals: 1, asts: 0, role: 'CM', tackles: 24, interceptions: 14, saves: 0, cleanSheets: 0, motm: 1, rating: 7.6, featured: false, avatarIcon: 'fa-gauge-high', traits: ['覆盖', '平衡'], memory: '全场最高跑动距离', quote: '他不一定最显眼，但哪里都能看到他。', bio: '中场覆盖面积大，负责连接攻防和保护后防线前沿。' },
        { id: 203, name: '周鹏', nickname: '防线闸门', number: 14, pos: 'MF', apps: 9, goals: 0, asts: 0, role: 'CDM', tackles: 28, interceptions: 20, saves: 0, cleanSheets: 0, motm: 1, rating: 7.8, featured: false, avatarIcon: 'fa-anchor', traits: ['拦截', '卡位'], memory: '连续三次关键拦截', quote: '他在后腰位置，像给球队上了一道锁。', bio: '防守型中场，擅长预判线路和完成第一时间破坏。' },
        { id: 204, name: '郑智', nickname: '老队长', number: 20, pos: 'MF', apps: 7, goals: 2, asts: 3, role: 'CM', tackles: 13, interceptions: 9, saves: 0, cleanSheets: 0, motm: 1, rating: 7.4, featured: false, avatarIcon: 'fa-chess-knight', traits: ['经验', '节奏'], memory: '毕业前最后一场助攻', quote: '他会提醒大家站位，也会在赛后请大家喝水。', bio: '经验丰富，能在比赛后段帮助球队稳住节奏。' },
        { id: 205, name: '马明', nickname: '拼抢专家', number: 23, pos: 'MF', apps: 5, goals: 0, asts: 0, role: 'CDM', tackles: 11, interceptions: 8, saves: 0, cleanSheets: 0, motm: 0, rating: 6.9, featured: false, avatarIcon: 'fa-person-rays', traits: ['拼抢', '替补'], memory: '替补登场后追回三次球权', quote: '他上场之后，对手会明显踢得更难受。', bio: '替补登场时能提供强度，训练出勤稳定。' },
        { id: 301, name: '孙悦', nickname: '后场指挥官', number: 4, pos: 'DF', apps: 11, goals: 1, asts: 0, role: 'CB', tackles: 21, interceptions: 28, saves: 0, cleanSheets: 4, motm: 2, rating: 8.1, featured: true, avatarIcon: 'fa-shield-halved', traits: ['解围', '盯人', '领袖'], memory: '门线解围守住胜利', quote: '他喊一声，后防线就会一起往前压。', bio: '后防核心，争顶和补位稳定，经常承担场上指挥职责。' },
        { id: 302, name: '冯涛', nickname: '铁闸', number: 5, pos: 'DF', apps: 10, goals: 0, asts: 0, role: 'CB', tackles: 19, interceptions: 18, saves: 0, cleanSheets: 3, motm: 1, rating: 7.7, featured: false, avatarIcon: 'fa-lock', traits: ['对抗', '补位'], memory: '禁区内关键封堵', quote: '他在身后，大家心里会稳一点。', bio: '中卫搭档，身体对抗强，能在禁区内完成关键封堵。' },
        { id: 303, name: '姜浩', nickname: '边路勤务员', number: 2, pos: 'DF', apps: 8, goals: 0, asts: 2, role: 'LB', tackles: 17, interceptions: 13, saves: 0, cleanSheets: 2, motm: 0, rating: 7.3, featured: false, avatarIcon: 'fa-arrow-left', traits: ['边路', '助攻'], memory: '下底传中助攻绝平', quote: '他跑的是边路，做的是苦活。', bio: '左后卫，攻守转换积极，能套边送出传中。' },
        { id: 304, name: '张琦', nickname: '右路保险', number: 3, pos: 'DF', apps: 9, goals: 0, asts: 1, role: 'RB', tackles: 18, interceptions: 12, saves: 0, cleanSheets: 2, motm: 0, rating: 7.2, featured: false, avatarIcon: 'fa-arrow-right', traits: ['回追', '传中'], memory: '终场前回追铲断', quote: '最累的回追，他经常第一个到。', bio: '右后卫，回追速度快，能在边路提供稳定出球点。' },
        { id: 305, name: '高准', nickname: '替补中卫', number: 12, pos: 'DF', apps: 6, goals: 0, asts: 0, role: 'CB', tackles: 12, interceptions: 9, saves: 0, cleanSheets: 1, motm: 0, rating: 6.9, featured: false, avatarIcon: 'fa-road', traits: ['轮换', '防空'], memory: '第一次首发零封', quote: '机会来的时候，他能顶上去。', bio: '中卫轮换，防空能力不错，适合对抗高球较多的比赛。' },
        { id: 306, name: '李清', nickname: '速度边卫', number: 16, pos: 'DF', apps: 4, goals: 0, asts: 0, role: 'LB', tackles: 8, interceptions: 5, saves: 0, cleanSheets: 1, motm: 0, rating: 6.7, featured: false, avatarIcon: 'fa-forward', traits: ['速度', '替补'], memory: '替补出场完成首秀', quote: '还在适应，但速度已经够用了。', bio: '边后卫替补，速度条件好，仍在提升防守站位。' },
        { id: 401, name: '曾诚', nickname: '最后一道门', number: 1, pos: 'GK', apps: 11, goals: 0, asts: 0, role: 'GK', tackles: 0, interceptions: 0, saves: 36, cleanSheets: 4, motm: 2, rating: 8.0, featured: false, avatarIcon: 'fa-hands', traits: ['扑救', '出击'], memory: '点球扑救后全队冲向他', quote: '他扑出点球那一刻，替补席比进球还激动。', bio: '主力门将，反应快，擅长近距离封堵和指挥后防。' },
        { id: 402, name: '颜骏', nickname: '稳稳接住', number: 22, pos: 'GK', apps: 4, goals: 0, asts: 0, role: 'GK', tackles: 0, interceptions: 0, saves: 12, cleanSheets: 1, motm: 0, rating: 7.0, featured: false, avatarIcon: 'fa-mitten', traits: ['轮换', '稳定'], memory: '杯赛首发完成零封', quote: '他说话不多，但手很稳。', bio: '替补门将，基本功扎实，训练中进步明显。' }
    ];

    var startingLineup = {
        GK: { top: '88%', left: '50%', playerId: 401 }, LB: { top: '66%', left: '15%', playerId: 303 }, CB1: { top: '72%', left: '37%', playerId: 301 }, CB2: { top: '72%', left: '63%', playerId: 302 }, RB: { top: '66%', left: '85%', playerId: 304 },
        CDM: { top: '48%', left: '50%', playerId: 203 }, CM: { top: '36%', left: '28%', playerId: 202 }, CAM: { top: '34%', left: '72%', playerId: 201 }, LW: { top: '15%', left: '18%', playerId: 102 }, ST: { top: '12%', left: '50%', playerId: 101 }, RW: { top: '15%', left: '82%', playerId: 103 }
    };

    var matchItems = [
        { season: '2026', result: 'win', score: '3 : 1', opponent: '计算机学院足球队', date: '2026-06-20', venue: '校本部南操场', competition: '周末联赛', scorers: '张伟 2球 / 李默 1球', quote: '雨停之后，我们终于把上一场没踢完的遗憾追回来了。' },
        { season: '2026', result: 'draw', score: '2 : 2', opponent: '自动化老友队', date: '2026-06-13', venue: '经开区体育公园', competition: '友谊赛', scorers: '王强 / 刘洋', quote: '最后十分钟连续压上，那种全队一起追平的感觉很难忘。' },
        { season: '2026', result: 'loss', score: '0 : 2', opponent: '教工元老队', date: '2026-06-06', venue: '校本部北操场', competition: '杯赛热身', scorers: '无', quote: '输球之后大家没有马上散，围在中圈聊了二十分钟。' },
        { season: '2026', result: 'win', score: '4 : 0', opponent: '材料学院联队', date: '2026-05-28', venue: '校本部南操场', competition: '训练赛', scorers: '张伟 / 王强 / 郑智 / 乌龙球', quote: '这是本赛季第一次踢出完整的高位压迫。' },
        { season: '2025', result: 'draw', score: '1 : 1', opponent: '研究生博士联队', date: '2025-12-18', venue: '校本部南操场', competition: '积分赛', scorers: '孙悦', quote: '队长最后一场，他用头球给自己留了一个结尾。' },
        { season: '2025', result: 'win', score: '2 : 0', opponent: '新生混编队', date: '2025-10-09', venue: '学院球场', competition: '迎新赛', scorers: '李默 / 陈实', quote: '那天来了很多新面孔，后来真的有几个人留了下来。' }
    ];

    var galleryItems = [
        { title: '周末联赛开场前', date: '2026-06-20', category: '比赛', tag: 'MATCHDAY', height: 270, image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=900', story: '开球前队长把大家叫到一起，提醒第一脚传球要稳。那天我们从第一分钟就踢得很坚决。' },
        { title: '全队更衣室合影', date: '2026-06-14', category: '合照', tag: 'TEAM', height: 330, image: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=900', story: '没有正式摄影，只有一台手机和挤在一起的大家。照片有点糊，但每张脸都很亮。' },
        { title: '队长捧起院杯', date: '2025-12-30', category: '荣誉', tag: 'TROPHY', height: 280, image: 'https://images.unsplash.com/photo-1527871369852-eb58cb2b54e2?q=80&w=900', story: '奖杯不大，但那天我们把它传了很多圈。每个人都想和它拍一张。' },
        { title: '体能训练日', date: '2026-05-18', category: '训练', tag: 'TRAINING', height: 240, image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=900', story: '最累的是最后三组折返跑，最快乐的是跑完之后一起坐在草地上吹风。' },
        { title: '新赛季球衣发布', date: '2026-05-01', category: '合照', tag: 'KIT', height: 310, image: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?q=80&w=900', story: '号码选定的那天，大家都认真得像在签职业合同。' },
        { title: '毕业生最后一场', date: '2026-04-15', category: '告别', tag: 'FAREWELL', height: 260, image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=900', story: '终场以后没有马上收球，毕业生又多罚了几脚点球，好像这样时间就能慢一点。' }
    ];

    var honors = [
        { icon: 'fa-trophy', title: '院杯四强', date: '2025-12-30', text: '一路踢到半决赛，第一次让这支队伍在学院杯里被更多人记住。' },
        { icon: 'fa-cloud-rain', title: '雨战绝杀', date: '2026-06-20', text: '补时阶段的头球绝杀，是本赛季目前最值得反复播放的瞬间。' },
        { icon: 'fa-chart-line', title: '最大比分胜利', date: '2026-05-28', text: '4:0 战胜材料学院联队，前场压迫和边路推进都踢出了训练效果。' },
        { icon: 'fa-hands-holding-circle', title: '毕业生最后一场', date: '2026-04-15', text: '不是冠军，也不是决赛，但很多人说这是最舍不得结束的一场。' }
    ];

    var messages = [
        { name: '老队长 郑智', text: '希望下一届继续把训练坚持下去。很多默契不是比赛当天才出现的，是平时一次次传球传出来的。' },
        { name: '门将 曾诚', text: '最想记住的是点球扑出去以后，大家从半场冲过来抱我的那一下。' },
        { name: '2024级边卫', text: '刚入队时谁都不认识，后来发现每周最期待的就是周末下午那两个小时。' },
        { name: '场边朋友', text: '你们踢得不一定每次都漂亮，但每次都很认真，这就是我愿意来拍照的原因。' }
    ];

    if (window.PONYTAIL_DATA) {
        allPlayers = window.PONYTAIL_DATA.players || allPlayers;
        startingLineup = window.PONYTAIL_DATA.startingLineup || startingLineup;
        matchItems = window.PONYTAIL_DATA.matches || matchItems;
        honors = window.PONYTAIL_DATA.honors || honors;
    }

    var selectedNodeKey = null;
    var activeSeason = '全部';
    var activeResult = '全部';
    var activeGallery = '全部';

    function $(id) { return document.getElementById(id); }
    function escapeHtml(str) { return String(str).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function getPlayerById(id) { return allPlayers.find(function (p) { return p.id === id; }) || null; }
    function getMetric(player) { return player.pos === 'GK' ? player.saves : player.tackles; }
    function getMetricLabel(player) { return player.pos === 'GK' ? '扑救' : '抢断'; }
    function getLineupPlayerIds() { return Object.keys(startingLineup).map(function (key) { return startingLineup[key].playerId; }); }
    function resultName(result) { return { win: '胜', draw: '平', loss: '负' }[result] || result; }

    function renderPitchNodes() {
        var pitch = $('pitch'); if (!pitch) return;
        pitch.querySelectorAll('.pitch__player').forEach(function (node) { node.remove(); });
        Object.keys(startingLineup).forEach(function (key) {
            var slot = startingLineup[key];
            var player = getPlayerById(slot.playerId);
            var node = document.createElement('button');
            node.type = 'button';
            node.className = 'pitch__player';
            if (key === selectedNodeKey) node.classList.add('pitch__player--selected');
            node.style.top = slot.top;
            node.style.left = slot.left;
            node.innerHTML = (player ? player.number : '?') + '<span class="pitch__player-name">' + (player ? escapeHtml(player.name) : '空缺') + '</span>';
            node.addEventListener('mouseenter', function () { toggleCardHighlight(slot.playerId, true); });
            node.addEventListener('mouseleave', function () { toggleCardHighlight(slot.playerId, false); });
            node.addEventListener('click', function () { selectedNodeKey = selectedNodeKey === key ? null : key; renderAllPlayers(); });
            pitch.appendChild(node);
        });
    }

    function renderSquadPool() {
        ['FW', 'MF', 'DF', 'GK'].forEach(function (pos) { var el = $('pool-' + pos); if (el) el.innerHTML = ''; });
        var lineupIds = getLineupPlayerIds();
        allPlayers.forEach(function (player) {
            var card = document.createElement('button');
            card.type = 'button';
            card.id = 'card-' + player.id;
            card.className = 'player-card';
            if (lineupIds.indexOf(player.id) !== -1) card.classList.add('player-card--starting');
            if (selectedNodeKey && isCandidateForSlot(player, selectedNodeKey)) card.classList.add('player-card--candidate');
            card.innerHTML =
                '<div class="player-card__name">' + escapeHtml(player.name) + '</div>' +
                '<div class="player-card__info">' + player.number + '号 / ' + player.role + ' / ' + escapeHtml(player.nickname) + '</div>' +
                '<div class="player-card__memory">' + escapeHtml(player.memory) + '</div>' +
                '<div class="player-card__stats"><span>出场 ' + player.apps + '</span><span>进球 ' + player.goals + '</span><span>' + getMetricLabel(player) + ' ' + getMetric(player) + '</span></div>';
            card.addEventListener('mouseenter', function () { toggleNodeHighlight(player.id, true); });
            card.addEventListener('mouseleave', function () { toggleNodeHighlight(player.id, false); });
            card.addEventListener('click', function () {
                if (selectedNodeKey) {
                    startingLineup[selectedNodeKey].playerId = player.id;
                    selectedNodeKey = null;
                    renderAllPlayers();
                } else {
                    openPlayerModal(player.id);
                }
            });
            var pool = $('pool-' + player.pos); if (pool) pool.appendChild(card);
        });
    }

    function isCandidateForSlot(player, key) {
        return (key.indexOf('GK') !== -1 && player.pos === 'GK') ||
            ((key.indexOf('LB') !== -1 || key.indexOf('RB') !== -1 || key.indexOf('CB') !== -1) && player.pos === 'DF') ||
            (key.indexOf('M') !== -1 && player.pos === 'MF') ||
            (['ST', 'LW', 'RW'].indexOf(key) !== -1 && player.pos === 'FW');
    }

    function renderFeaturedPlayers() {
        var wrap = $('featuredPlayers'); if (!wrap) return;
        wrap.innerHTML = '';
        allPlayers.filter(function (p) { return p.featured; }).slice(0, 3).forEach(function (p) {
            var tags = p.traits.map(function (t) { return '<span class="tag">' + escapeHtml(t) + '</span>'; }).join('');
            wrap.innerHTML += '<button class="flip-card" type="button" data-player-id="' + p.id + '"><span class="flip-card__inner"><span class="flip-card__face flip-card__face--front"><i class="fa-solid ' + p.avatarIcon + '"></i><h3>' + escapeHtml(p.name) + '</h3><p>' + p.role + ' / ' + p.number + '号 / ' + escapeHtml(p.nickname) + '</p><span class="flip-card__tags">' + tags + '</span></span><span class="flip-card__face flip-card__face--back"><h3>' + escapeHtml(p.memory) + '</h3><p>' + escapeHtml(p.quote) + '</p></span></span></button>';
        });
        wrap.querySelectorAll('.flip-card').forEach(function (card) {
            card.addEventListener('click', function () { openPlayerModal(parseInt(card.getAttribute('data-player-id'), 10)); });
        });
    }

    function renderSeasonSwitch() {
        var wrap = $('seasonSwitch'); if (!wrap) return;
        var seasons = ['全部'].concat(Array.from(new Set(matchItems.map(function (m) { return m.season; }))).sort().reverse());
        wrap.innerHTML = seasons.map(function (season) {
            return '<button class="filter-btn ' + (activeSeason === season ? 'filter-btn--active' : '') + '" type="button" data-season="' + season + '">' + season + '</button>';
        }).join('');
        wrap.querySelectorAll('button').forEach(function (btn) {
            btn.addEventListener('click', function () { activeSeason = btn.getAttribute('data-season'); renderMatches(); renderSeasonSwitch(); });
        });
    }

    function renderMatchFilters() {
        var wrap = $('matchFilters'); if (!wrap) return;
        var filters = [['全部', '全部'], ['胜场', 'win'], ['平局', 'draw'], ['失利', 'loss']];
        wrap.innerHTML = filters.map(function (item) {
            return '<button class="filter-btn ' + (activeResult === item[1] ? 'filter-btn--active' : '') + '" type="button" data-result="' + item[1] + '">' + item[0] + '</button>';
        }).join('');
        wrap.querySelectorAll('button').forEach(function (btn) {
            btn.addEventListener('click', function () { activeResult = btn.getAttribute('data-result'); renderMatches(); renderMatchFilters(); });
        });
    }

    function renderMatches() {
        var wrap = $('matchTimeline'); if (!wrap) return;
        var filtered = matchItems.filter(function (m) {
            return (activeSeason === '全部' || m.season === activeSeason) && (activeResult === '全部' || m.result === activeResult);
        });
        wrap.innerHTML = filtered.map(function (m) {
            var date = new Date(m.date + 'T00:00:00');
            var day = String(date.getDate()).padStart(2, '0');
            var month = String(date.getMonth() + 1).padStart(2, '0') + '月';
            return '<article class="match-card"><div class="match-card__date"><div><div class="match-card__day">' + day + '</div><div class="match-card__month">' + month + ' / ' + m.season + '</div></div></div><div class="match-card__body"><div class="match-card__meta">' + escapeHtml(m.competition) + ' / ' + escapeHtml(m.venue) + '</div><h3 class="match-card__opponent">VS ' + escapeHtml(m.opponent) + '</h3><p class="match-card__quote">' + escapeHtml(m.quote) + '</p><p class="match-card__scorers">进球：' + escapeHtml(m.scorers) + '</p></div><div class="match-card__score"><div class="scoreboard"><span class="result-' + m.result + '">' + resultName(m.result) + '</span><strong>' + m.score + '</strong><span>FINAL SCORE</span></div></div></article>';
        }).join('');
    }

    function renderGalleryTabs() {
        var wrap = $('galleryTabs'); if (!wrap) return;
        var cats = ['全部'].concat(Array.from(new Set(galleryItems.map(function (g) { return g.category; }))));
        wrap.innerHTML = cats.map(function (cat) {
            return '<button class="filter-btn ' + (activeGallery === cat ? 'filter-btn--active' : '') + '" type="button" data-gallery="' + cat + '">' + cat + '</button>';
        }).join('');
        wrap.querySelectorAll('button').forEach(function (btn) {
            btn.addEventListener('click', function () { activeGallery = btn.getAttribute('data-gallery'); renderGallery(); renderGalleryTabs(); });
        });
    }

    function renderGallery() {
        var grid = $('galleryGrid'); if (!grid) return;
        var filtered = galleryItems.filter(function (g) { return activeGallery === '全部' || g.category === activeGallery; });
        grid.innerHTML = filtered.map(function (g, i) {
            return '<article class="gallery__item" data-photo="' + i + '"><button class="like-btn" type="button" aria-label="点赞"><i class="fa-solid fa-heart"></i></button><div class="gallery__img" style="height:' + g.height + 'px;background-image:url(\'' + g.image + '\');"></div><span class="gallery__tag">' + g.tag + '</span><div class="gallery__info"><h3>' + escapeHtml(g.title) + '</h3><p>' + g.date + ' / ' + g.category + '</p></div></article>';
        }).join('');
        grid.querySelectorAll('.gallery__item').forEach(function (item) {
            item.addEventListener('click', function () {
                var visible = galleryItems.filter(function (g) { return activeGallery === '全部' || g.category === activeGallery; });
                openPhotoModal(visible[parseInt(item.getAttribute('data-photo'), 10)]);
            });
        });
    }

    function renderHonors() {
        var grid = $('honorsGrid'); if (!grid) return;
        grid.innerHTML = honors.map(function (h) {
            return '<article class="honor-card"><div><i class="fa-solid ' + h.icon + '"></i><h3>' + escapeHtml(h.title) + '</h3><p>' + escapeHtml(h.text) + '</p></div><time>' + h.date + '</time></article>';
        }).join('');
    }

    function renderMessages() {
        var wall = $('messageWall'); if (!wall) return;
        wall.innerHTML = messages.map(function (m, i) {
            var tilt = [-1.2, 0.8, -0.5, 1.1, -0.9][i % 5];
            return '<article class="message-card" style="--tilt:' + tilt + 'deg"><p>' + escapeHtml(m.text) + '</p><strong>' + escapeHtml(m.name) + '</strong></article>';
        }).join('');
    }

    function initMessageForm() {
        var form = $('messageForm');
        var status = $('messageFormStatus');
        if (!form || !status) return;
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var data = new FormData(form);
            messages.unshift({ name: data.get('name'), text: data.get('message') });
            renderMessages();
            form.reset();
            status.textContent = '已经贴到留言墙了。刷新页面后会恢复示例数据。';
        });
    }

    function toggleCardHighlight(playerId, highlight) {
        var card = $('card-' + playerId);
        if (card) card.style.borderColor = highlight ? 'rgba(216,166,58,0.85)' : '';
    }

    function toggleNodeHighlight(playerId, highlight) {
        var target = getPlayerById(playerId);
        if (!target) return;
        document.querySelectorAll('.pitch__player').forEach(function (node) {
            var span = node.querySelector('.pitch__player-name');
            if (span && span.textContent === target.name) node.classList.toggle('pitch__player--linked', highlight);
        });
    }

    function openPlayerModal(id) {
        var player = getPlayerById(id);
        var modal = $('playerModal');
        var body = $('playerModalBody');
        if (!player || !modal || !body) return;
        var tags = player.traits.map(function (t) { return '<span class="tag">' + escapeHtml(t) + '</span>'; }).join('');
        body.innerHTML = '<div class="modal__hero"><div class="modal__number">' + player.number + '</div><div><h3 class="modal__title" id="playerModalTitle">' + escapeHtml(player.name) + '</h3><p class="modal__subtitle">' + player.pos + ' / ' + player.role + ' / ' + escapeHtml(player.nickname) + ' / 评分 ' + player.rating + '</p></div></div><div class="modal__stats"><div class="modal__stat"><strong>' + player.apps + '</strong><span>出场</span></div><div class="modal__stat"><strong>' + player.goals + '</strong><span>进球</span></div><div class="modal__stat"><strong>' + player.asts + '</strong><span>助攻</span></div><div class="modal__stat"><strong>' + player.motm + '</strong><span>MVP</span></div><div class="modal__stat"><strong>' + getMetric(player) + '</strong><span>' + getMetricLabel(player) + '</span></div><div class="modal__stat"><strong>' + player.interceptions + '</strong><span>拦截</span></div><div class="modal__stat"><strong>' + player.cleanSheets + '</strong><span>零封</span></div><div class="modal__stat"><strong>' + player.rating + '</strong><span>评分</span></div></div><p class="modal__bio"><strong>代表瞬间：</strong>' + escapeHtml(player.memory) + '</p><p class="modal__bio"><strong>队友评价：</strong>' + escapeHtml(player.quote) + '</p><p class="modal__bio">' + escapeHtml(player.bio) + '</p><div class="modal__tags">' + tags + '</div>';
        modal.classList.add('modal--open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('body--modal-open');
    }

    function openPhotoModal(photo) {
        var modal = $('photoModal');
        var body = $('photoModalBody');
        if (!modal || !body || !photo) return;
        body.innerHTML = '<div class="photo-modal__image" style="background-image:url(\'' + photo.image + '\');"></div><div class="photo-modal__content"><div class="photo-modal__meta">' + photo.date + ' / ' + photo.category + ' / ' + photo.tag + '</div><h3 id="photoModalTitle">' + escapeHtml(photo.title) + '</h3><p>' + escapeHtml(photo.story) + '</p></div>';
        modal.classList.add('modal--open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('body--modal-open');
    }

    function closeModals() {
        document.querySelectorAll('.modal').forEach(function (modal) {
            modal.classList.remove('modal--open');
            modal.setAttribute('aria-hidden', 'true');
        });
        document.body.classList.remove('body--modal-open');
    }

    function initModals() {
        document.addEventListener('click', function (e) {
            if (e.target.closest('[data-modal-close]') || e.target.closest('[data-photo-close]')) closeModals();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeModals();
                closeMobileMenu();
            }
        });
    }

    function initLikeButtons() {
        var grid = $('galleryGrid'); if (!grid) return;
        grid.addEventListener('click', function (e) {
            var btn = e.target.closest('.like-btn');
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();
            btn.classList.toggle('like-btn--liked');
            if (btn.classList.contains('like-btn--liked')) {
                for (var i = 0; i < 10; i++) createParticle(btn);
            }
        });
    }

    function createParticle(btn) {
        var p = document.createElement('span');
        p.className = 'particle';
        p.style.setProperty('--px', (Math.random() - 0.5) * 90 + 'px');
        p.style.setProperty('--py', (Math.random() - 0.7) * 90 + 'px');
        btn.appendChild(p);
        p.addEventListener('animationend', function () { p.remove(); });
    }

    var slides = document.querySelectorAll('.hero__slide');
    var slideIndex = 0;
    var slideInterval;

    function showSlide(n) {
        slides.forEach(function (slide) { slide.classList.remove('hero__slide--active'); });
        slideIndex = (n + slides.length) % slides.length;
        slides[slideIndex].classList.add('hero__slide--active');
        updateDots();
    }

    function startAutoPlay() { stopAutoPlay(); slideInterval = setInterval(function () { showSlide(slideIndex + 1); }, 5200); }
    function stopAutoPlay() { if (slideInterval) clearInterval(slideInterval); }

    function buildDots() {
        var dots = $('carouselDots'); if (!dots) return;
        dots.innerHTML = '';
        slides.forEach(function (_, index) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'hero__dot';
            dot.setAttribute('aria-label', '切换到第 ' + (index + 1) + ' 张');
            dot.addEventListener('click', function () { showSlide(index); });
            dots.appendChild(dot);
        });
        updateDots();
    }

    function updateDots() {
        document.querySelectorAll('.hero__dot').forEach(function (dot, i) { dot.classList.toggle('hero__dot--active', i === slideIndex); });
    }

    function handleScrollReveal() {
        var h = window.innerHeight;
        document.querySelectorAll('.reveal').forEach(function (el) {
            if (el.getBoundingClientRect().top < h - 110) el.classList.add('reveal--visible');
        });
    }

    function closeMobileMenu() {
        var toggle = $('menuToggle');
        var nav = $('mainNav');
        if (!toggle || !nav) return;
        nav.classList.remove('header__nav--open');
        toggle.setAttribute('aria-expanded', 'false');
    }

    function initMobileMenu() {
        var toggle = $('menuToggle');
        var nav = $('mainNav');
        if (!toggle || !nav) return;
        toggle.addEventListener('click', function () {
            var open = !nav.classList.contains('header__nav--open');
            nav.classList.toggle('header__nav--open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        nav.querySelectorAll('.header__nav-link').forEach(function (link) { link.addEventListener('click', closeMobileMenu); });
    }

    function initNavScroll() {
        var header = $('header');
        var navLinks = document.querySelectorAll('.header__nav-link');
        var sections = Array.from(navLinks).map(function (link) {
            var id = link.getAttribute('href').slice(1);
            return { link: link, el: $(id) };
        }).filter(function (item) { return item.el; });
        window.addEventListener('scroll', function () {
            header.classList.toggle('header--compact', window.scrollY > 80);
            var pos = window.scrollY + 140;
            sections.forEach(function (item) {
                if (pos >= item.el.offsetTop && pos < item.el.offsetTop + item.el.offsetHeight) {
                    navLinks.forEach(function (link) { link.classList.remove('header__nav-link--active'); });
                    item.link.classList.add('header__nav-link--active');
                }
            });
        });
    }

    function renderAllPlayers() {
        renderPitchNodes();
        renderSquadPool();
        renderFeaturedPlayers();
    }

    function init() {
        renderAllPlayers();
        renderSeasonSwitch();
        renderMatchFilters();
        renderMatches();
        renderGalleryTabs();
        renderGallery();
        renderHonors();
        renderMessages();
        buildDots();
        initLikeButtons();
        initMessageForm();
        initModals();
        initMobileMenu();
        initNavScroll();

        var prev = $('carouselPrev');
        var next = $('carouselNext');
        var hero = $('hero');
        if (prev) prev.addEventListener('click', function () { showSlide(slideIndex - 1); });
        if (next) next.addEventListener('click', function () { showSlide(slideIndex + 1); });
        if (hero) {
            hero.addEventListener('mouseenter', stopAutoPlay);
            hero.addEventListener('mouseleave', startAutoPlay);
        }
        startAutoPlay();
        window.addEventListener('scroll', handleScrollReveal);
        window.addEventListener('load', handleScrollReveal);
        handleScrollReveal();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
