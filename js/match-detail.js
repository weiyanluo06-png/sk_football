(function () {
    'use strict';
    var data = window.PONYTAIL_DATA || {};
    function esc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function player(id) { return (data.players || []).find(function (p) { return p.id === id; }) || {}; }
    function name(id) { return esc(player(id).name || '待补充'); }
    window.renderTeamMatch = function (target, id) {
        var match = (data.matches || []).find(function (m) { return m.id === id; });
        if (!match) {
            target.innerHTML = '<section class="column-content"><h1>未找到这场比赛</h1><a href="#matches">返回赛事档案</a></section>';
            return '比赛详情';
        }
        var detailed = Array.isArray(match.appearances);
        var events = (match.events || []).slice().sort(function (a, b) { return a.minute - b.minute; });
        var mvp = match.mvpId != null ? player(match.mvpId) : null;
        var report = match.report || [match.quote || ''];
        var lineup = '';
        if (detailed) {
            lineup = '<section class="match-lineup"><div class="match-section-heading"><h2>本场阵容</h2><span>' + esc(match.formation) + '</span></div><div class="match-pitch" aria-label="本场首发阵容">' + ['FW', 'MF', 'DF', 'GK'].map(function (position) {
                var entries = match.appearances.filter(function (a) { return a.started && a.position === position; });
                var labels = { FW: '前锋', MF: '中场', DF: '后卫', GK: '门将' };
                return '<div class="match-pitch__line"><span class="match-pitch__label">' + labels[position] + '</span><div>' + (entries.length ? entries.map(function (a) {
                    return '<span class="match-pitch__player"><b>' + name(a.playerId) + '</b>' + (match.captainId === a.playerId ? '<small>队长</small>' : '') + '</span>';
                }).join('') : '<span class="match-pitch__pending">待补充</span>') + '</div></div>';
            }).join('') + '</div><div class="match-bench"><h3>替补登场</h3>' + match.appearances.filter(function (a) { return !a.started; }).map(function (a) {
                return '<p>' + name(a.playerId) + ' <span>' + esc(a.onMinute) + '′ 上场</span></p>';
            }).join('') + '</div></section>';
        }
        target.innerHTML = '<article class="column-content match-detail"><a class="text-link" href="#matches">← 赛事档案</a>' +
            '<header class="match-detail__header"><span class="section__kicker">' + esc(match.date.slice(0, 4)) + ' · ' + esc(match.competition) + '</span><h1>' + esc(match.reportTitle || '生康对阵' + match.opponent) + '</h1><p>' + esc(match.date) + (match.kickoff ? ' · ' + esc(match.kickoff) : '') + ' · ' + esc(match.venue) + (match.fullTimeMinutes ? ' · 全场' + esc(match.fullTimeMinutes) + '分钟' : '') + '</p></header>' +
            '<div class="match-result"><span>生康学院</span><div><strong>' + esc(match.score) + '</strong><small>全场比分</small></div><span>' + esc(match.opponent) + '</span></div>' +
            '<p class="match-detail__lead">' + esc(match.quote) + '</p><div class="match-detail__grid"><div>' +
            '<section class="match-report"><h2>赛后记</h2>' + report.map(function (paragraph) { return '<p>' + esc(paragraph) + '</p>'; }).join('') + '</section>' +
            (mvp ? '<section class="match-mvp">' + (mvp.photo ? '<img src="' + esc(mvp.photo) + '" alt="' + esc(mvp.name) + '的球员头像" loading="lazy">' : '') + '<div><span class="section__kicker">本场 MVP</span><h2>' + esc(mvp.name) + '</h2><p>' + esc(match.mvpReview) + '</p></div></section>' : '') +
            '<section class="match-photos"><h2>比赛影像</h2>' + ((match.photos || []).length ? '<div class="match-photos__grid">' + match.photos.map(function (photo) {
                return '<figure><a href="' + esc(photo.src) + '" target="_blank" rel="noopener noreferrer"><img src="' + esc(photo.src) + '" alt="' + esc(photo.caption) + '" loading="lazy"></a><figcaption>' + esc(photo.caption) + (photo.photographer ? '<small>摄影：' + esc(photo.photographer) + '</small>' : '') + '</figcaption></figure>';
            }).join('') + '</div>' + ((match.photographers || []).length ? '<p class="match-photographers">本场摄影：' + esc(match.photographers.join('、')) + '</p>' : '') : '<p class="match-pending">本场照片待补充，属于这场比赛的瞬间会保存在这里。</p>') + '</section></div><aside>' +
            (events.length ? '<section class="match-events"><h2>已记录事件</h2><ol>' + events.map(function (event) {
                return '<li><time>' + esc(event.exactTime || (event.minute + '′')) + '</time><div>' + (event.type === 'goal' ? '<strong>' + name(event.playerId) + ' 进球</strong><span>' + (event.assistId != null ? '助攻：' + name(event.assistId) : '助攻待确认') + '</span>' : '<strong>换人</strong><span>' + name(event.playerInId) + ' 换下 ' + name(event.playerOutId) + '</span>') + '</div></li>';
            }).join('') + '</ol></section>' : '<section class="match-events"><h2>进球记录</h2><p>' + esc(match.scorers) + '</p><p class="match-pending">历史比赛的阵容与详细事件待补充。</p></section>') + lineup +
            ((match.recorders || []).length ? '<section class="match-recorders"><h3>场外录制</h3><p>' + esc(match.recorders.join('、')) + '</p></section>' : '') +
            ((match.missingInfo || []).length ? '<section class="match-pending"><h3>待补充记录</h3><ul>' + match.missingInfo.map(function (info) { return '<li>' + esc(info) + '</li>'; }).join('') + '</ul></section>' : '') +
            '</aside></div><a class="notice-action" href="#matches">返回赛事档案 →</a></article>';
        return '生康 ' + match.score + ' ' + match.opponent;
    };
}());
