(function () {
    'use strict';

    var teamData = window.PONYTAIL_DATA || {};
    var allPlayers = teamData.players || [];
    var startingLineup = teamData.startingLineup || {};
    var matchItems = teamData.matches || [];
    var galleryItems = teamData.gallery || [];
    var honors = teamData.honors || [];
    var messages = teamData.messages || [];
    var fallbackPhotos = teamData.fallbackPhotos || [];
    var selectedNodeKey = null;
    var activeSeason = '全部';
    var activeResult = '全部';
    var activeGallery = '全部';
    var activeLineupGroup = 'FW';
    var lineupGroupMeta = {
        FW: { title: 'Forwards', subtitle: '锋线三人组', slots: ['LW', 'ST', 'RW'] },
        MF: { title: 'Midfield', subtitle: '中场连接线', slots: ['CAM', 'CM', 'CDM'] },
        DF: { title: 'Defenders', subtitle: '后防四人组', slots: ['LB', 'CB1', 'CB2', 'RB'] },
        GK: { title: 'Goalkeeper', subtitle: '最后一道门', slots: ['GK'] }
    };
    function $(id) { return document.getElementById(id); }
    function escapeHtml(str) { return String(str).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function getPlayerById(id) { return allPlayers.find(function (p) { return p.id === id; }) || null; }
    function getMetric(player) { return player.pos === 'GK' ? player.saves : player.tackles; }
    function getMetricLabel(player) { return player.pos === 'GK' ? '扑救' : '抢断'; }
    function getLineupPlayerIds() { return Object.keys(startingLineup).map(function (key) { return startingLineup[key].playerId; }); }
    function resultName(result) { return { win: '胜', draw: '平', loss: '负' }[result] || result; }
    function getPlayerPhoto(player) { return player.photo || fallbackPhotos[player.id % fallbackPhotos.length] || ''; }
    function getLineupGroupForSlot(slotKey) {
        if (lineupGroupMeta.FW.slots.indexOf(slotKey) !== -1) return 'FW';
        if (lineupGroupMeta.MF.slots.indexOf(slotKey) !== -1) return 'MF';
        if (lineupGroupMeta.DF.slots.indexOf(slotKey) !== -1) return 'DF';
        return 'GK';
    }

    function renderLineupStage() {
        var pitch = $('lineupPitch'); if (!pitch) return;
        pitch.querySelectorAll('.lineup-card').forEach(function (node) { node.remove(); });
        Object.keys(startingLineup).forEach(function (key) {
            var slot = startingLineup[key];
            var player = getPlayerById(slot.playerId);
            if (!player) return;
            var group = getLineupGroupForSlot(key);
            var node = document.createElement('button');
            node.type = 'button';
            node.className = 'lineup-card lineup-card--' + group;
            node.setAttribute('data-group', group);
            node.setAttribute('data-number', player.number);
            node.setAttribute('aria-label', player.name + ' 队员档案');
            node.style.left = slot.left;
            node.style.top = slot.top;
            node.innerHTML =
                '<span class="lineup-card__flag" aria-hidden="true"></span>' +
                '<span class="lineup-card__photo" style="background-image:url(\'' + getPlayerPhoto(player) + '\');"></span>' +
                '<span class="lineup-card__body"><strong>' + escapeHtml(player.name) + '</strong><span>' + player.number + '号 / ' + player.role + '</span></span>';
            node.addEventListener('click', function () { openPlayerModal(player.id); });
            pitch.appendChild(node);
        });
        updateLineupFocus(activeLineupGroup);
    }

    function updateLineupFocus(group) {
        activeLineupGroup = group || activeLineupGroup;
        var meta = lineupGroupMeta[activeLineupGroup] || lineupGroupMeta.FW;
        var title = $('lineupGroupTitle');
        var subtitle = $('lineupGroupSubtitle');
        if (title) title.textContent = meta.title;
        if (subtitle) subtitle.textContent = meta.subtitle;
        document.querySelectorAll('.lineup-card').forEach(function (card) {
            var isActive = card.getAttribute('data-group') === activeLineupGroup;
            card.classList.toggle('lineup-card--active', isActive);
            card.classList.toggle('lineup-card--dim', !isActive);
        });
    }

    function initLineupScroll() {
        var experience = $('lineupExperience');
        if (!experience) return;
        var groups = ['FW', 'MF', 'DF', 'GK'];
        var animationFrame = null;
        function syncLineupGroup() {
            var rect = experience.getBoundingClientRect();
            var travel = Math.max(1, rect.height - window.innerHeight);
            var progress = Math.min(0.999, Math.max(0, -rect.top / travel));
            var index = Math.min(groups.length - 1, Math.floor(progress * groups.length));
            updateLineupFocus(groups[index]);
        }
        function scheduleLineupSync() {
            if (animationFrame) return;
            animationFrame = window.requestAnimationFrame(function () {
                animationFrame = null;
                syncLineupGroup();
            });
        }
        window.__syncLineupGroup = syncLineupGroup;
        window.addEventListener('scroll', scheduleLineupSync, { passive: true });
        window.addEventListener('resize', scheduleLineupSync);
        if ('ResizeObserver' in window) {
            new ResizeObserver(scheduleLineupSync).observe(experience);
        }
        syncLineupGroup();
    }

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
        renderLineupStage();
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
        initLineupScroll();

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
