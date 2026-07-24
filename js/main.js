(function () {
    'use strict';

    var teamData = window.PONYTAIL_DATA || {};
    var allPlayers = teamData.players || [];
    var startingLineup = teamData.startingLineup || {};
    var matchItems = teamData.matches || [];
    var galleryItems = window.PONYTAIL_GALLERY || [];
    var honors = teamData.honors || [];
    var fallbackPhotos = teamData.fallbackPhotos || [];
    var featuredPlayers = [];
    var selectedNodeKey = null;
    var activeCompetition = teamData.defaultCompetitionId || (teamData.competitions && teamData.competitions[0] && teamData.competitions[0].id) || (matchItems[0] && matchItems[0].competition) || '';
    var activeYear = '';
    var activeGallery = '全部';
    var activeLineupGroup = 'FW';
    var lineupGroupOrder = ['FW', 'MF', 'DF', 'GK'];
    var lastModalTrigger = null;
    var lineupGroupMeta = {
        FW: { title: '前锋', subtitle: '4-3-3 · 锋线三人组', slots: ['LW', 'ST', 'RW'] },
        MF: { title: '中场', subtitle: '4-3-3 · 中场三人组', slots: ['LCM', 'DM', 'RCM'] },
        DF: { title: '后卫', subtitle: '4-3-3 · 后防四人组', slots: ['LB', 'CB1', 'CB2', 'RB'] },
        GK: { title: '门将', subtitle: '4-3-3 · 门将', slots: ['GK'] }
    };
    function $(id) { return document.getElementById(id); }
    function escapeHtml(str) { return String(str).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function getPlayerById(id) { return allPlayers.find(function (p) { return p.id === id; }) || null; }
    function getLineupPlayerIds() { return Object.keys(startingLineup).map(function (key) { return startingLineup[key].playerId; }); }
    function resultName(result) { return { win: '胜', draw: '平', loss: '负' }[result] || result; }
    function getPlayerPhoto(player) { return player.photo || fallbackPhotos[player.id % fallbackPhotos.length] || ''; }
    function getLineupGroupForSlot(slotKey) {
        if (lineupGroupMeta.FW.slots.indexOf(slotKey) !== -1) return 'FW';
        if (lineupGroupMeta.MF.slots.indexOf(slotKey) !== -1) return 'MF';
        if (lineupGroupMeta.DF.slots.indexOf(slotKey) !== -1) return 'DF';
        return 'GK';
    }

    function shuffled(items) {
        var copy = items.slice();
        for (var i = copy.length - 1; i > 0; i -= 1) {
            var index = Math.floor(Math.random() * (i + 1));
            var temp = copy[i];
            copy[i] = copy[index];
            copy[index] = temp;
        }
        return copy;
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

    function syncLineupRail(group) {
        var meta = lineupGroupMeta[group] || lineupGroupMeta.FW;
        var title = $('lineupGroupTitle');
        var subtitle = $('lineupGroupSubtitle');
        var roster = $('lineupGroupRoster');
        var groupNumber = $('lineupGroupNumber');
        if (title) title.textContent = meta.title;
        if (subtitle) subtitle.textContent = meta.subtitle;
        if (groupNumber) {
            var index = Math.max(0, lineupGroupOrder.indexOf(group));
            groupNumber.textContent = String(index + 1).padStart(2, '0') + ' / 04';
        }
        if (roster) {
            roster.style.setProperty('--lineup-roster-count', Math.max(1, meta.slots.length));
            roster.innerHTML = meta.slots.map(function (slotKey) {
                var slot = startingLineup[slotKey];
                var player = slot && getPlayerById(slot.playerId);
                if (!player) return '';
                return '<span><b>' + slotKey.replace(/[0-9]/g, '') + '</b><em>' + escapeHtml(player.name) + '</em></span>';
            }).join('');
        }
    }

    function updateLineupFocus(group) {
        activeLineupGroup = group || activeLineupGroup;
        syncLineupRail(activeLineupGroup);
        document.querySelectorAll('[data-lineup-control]').forEach(function (control) {
            var isSelected = control.getAttribute('data-lineup-control') === activeLineupGroup;
            control.classList.toggle('is-active', isSelected);
            control.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        });
        document.querySelectorAll('[data-lineup-progress]').forEach(function (marker) {
            marker.classList.toggle('is-active', marker.getAttribute('data-lineup-progress') === activeLineupGroup);
        });
        document.querySelectorAll('.lineup-card').forEach(function (card) {
            var isActive = card.getAttribute('data-group') === activeLineupGroup;
            card.classList.toggle('lineup-card--active', isActive);
            card.classList.toggle('lineup-card--dim', !isActive);
        });
    }

    function initLineupScroll() {
        var experience = $('lineupExperience');
        if (!experience) return;
        if (window.matchMedia('(max-width: 760px)').matches) {
            initMobileLineupNavigator();
            updateLineupFocus('FW');
            return;
        }
        var groups = lineupGroupOrder;
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

    function initMobileLineupNavigator() {
        var pitch = $('lineupPitch');
        var nav = $('lineupSwipeNav');
        var rail = document.querySelector('.lineup-rail');
        if (!pitch || !nav || !rail) return;
        var groups = lineupGroupOrder;
        var lastSwipeAt = 0;

        nav.querySelectorAll('[data-lineup-control]').forEach(function (control) {
            control.addEventListener('click', function () {
                updateLineupFocus(control.getAttribute('data-lineup-control'));
            });
        });

        function bindSwipeSurface(surface) {
            var startX = 0;
            var startY = 0;
            surface.addEventListener('touchstart', function (event) {
                var touch = event.changedTouches[0];
                startX = touch.clientX;
                startY = touch.clientY;
            }, { passive: true });
            surface.addEventListener('touchend', function (event) {
                var touch = event.changedTouches[0];
                var deltaX = touch.clientX - startX;
                var deltaY = touch.clientY - startY;
                if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
                var index = groups.indexOf(activeLineupGroup);
                var nextIndex = (index + (deltaX > 0 ? 1 : -1) + groups.length) % groups.length;
                lastSwipeAt = Date.now();
                updateLineupFocus(groups[nextIndex]);
            }, { passive: true });
        }

        bindSwipeSurface(pitch);
        bindSwipeSurface(rail);

        pitch.addEventListener('click', function (event) {
            if (Date.now() - lastSwipeAt < 420) {
                event.preventDefault();
                event.stopPropagation();
            }
        }, true);
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
                '<div class="player-card__stats"><span>出场 ' + player.apps + '</span><span>进球 ' + player.goals + '</span><span>助攻 ' + player.asts + '</span></div>';
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
        featuredPlayers.forEach(function (p) {
            var tags = p.traits.map(function (t) { return '<span class="tag">' + escapeHtml(t) + '</span>'; }).join('');
            wrap.innerHTML += '<button class="flip-card" type="button" data-player-id="' + p.id + '"><span class="flip-card__inner"><span class="flip-card__face flip-card__face--front"><i class="fa-solid ' + p.avatarIcon + '"></i><h3>' + escapeHtml(p.name) + '</h3><p>' + p.role + ' / ' + p.number + '号 / ' + escapeHtml(p.nickname) + '</p><span class="flip-card__tags">' + tags + '</span></span><span class="flip-card__face flip-card__face--back"><h3>' + escapeHtml(p.memory) + '</h3><p>' + escapeHtml(p.bio) + '</p></span></span></button>';
        });
        wrap.querySelectorAll('.flip-card').forEach(function (card) {
            card.addEventListener('click', function () { openPlayerModal(parseInt(card.getAttribute('data-player-id'), 10)); });
        });
    }

    function getCompetitionArchive() {
        if (teamData.competitions && teamData.competitions.length) return teamData.competitions;
        return Array.from(new Set(matchItems.map(function (m) { return m.competition; }))).map(function (name) {
            var match = matchItems.find(function (item) { return item.competition === name; });
            return { id: name, year: match ? match.date.slice(0, 4) : '', name: name, label: name, description: '' };
        });
    }

    function getCompetitionId(competition) { return competition.id || competition.name; }

    function getActiveCompetition() {
        return getCompetitionArchive().find(function (competition) { return getCompetitionId(competition) === activeCompetition; }) || { id: activeCompetition, name: activeCompetition, label: activeCompetition, description: '' };
    }

    function renderSeasonSwitch() {
        var competitions = getCompetitionArchive();
        var active = getActiveCompetition();
        var yearWrap = $('yearSwitch');
        var competitionWrap = $('seasonSwitch');
        if (!activeYear || !competitions.some(function (competition) { return competition.year === activeYear; })) {
            activeYear = active.year || (competitions[0] && competitions[0].year) || '';
        }
        if (active.year !== activeYear) {
            active = competitions.find(function (competition) { return competition.year === activeYear; }) || competitions[0] || active;
            activeCompetition = getCompetitionId(active);
        }
        var years = Array.from(new Set(competitions.map(function (competition) { return competition.year; }).filter(Boolean)));
        if (yearWrap) {
            yearWrap.innerHTML = years.map(function (year) {
                return '<button class="filter-btn ' + (activeYear === year ? 'filter-btn--active' : '') + '" type="button" data-year="' + escapeHtml(year) + '">' + escapeHtml(year) + '</button>';
            }).join('');
            yearWrap.querySelectorAll('button').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    activeYear = btn.getAttribute('data-year');
                    var firstCompetition = competitions.find(function (competition) { return competition.year === activeYear; });
                    activeCompetition = firstCompetition ? getCompetitionId(firstCompetition) : activeCompetition;
                    renderSeasonSwitch();
                    renderMatches();
                });
            });
        }
        if (!competitionWrap) return;
        competitionWrap.innerHTML = competitions.filter(function (competition) { return competition.year === activeYear; }).map(function (competition) {
            return '<button class="filter-btn ' + (activeCompetition === getCompetitionId(competition) ? 'filter-btn--active' : '') + '" type="button" data-competition="' + escapeHtml(getCompetitionId(competition)) + '">' + escapeHtml(competition.label || competition.name) + '</button>';
        }).join('');
        competitionWrap.querySelectorAll('button').forEach(function (btn) {
            btn.addEventListener('click', function () {
                activeCompetition = btn.getAttribute('data-competition');
                renderSeasonSwitch();
                renderMatches();
            });
        });
    }

    function renderMatches() {
        var wrap = $('matchTimeline'); if (!wrap) return;
        var competition = getActiveCompetition();
        var filtered = matchItems.filter(function (m) {
            return m.competition === competition.name && (!competition.year || m.date.slice(0, 4) === competition.year);
        })
            .sort(function (a, b) { return b.date.localeCompare(a.date); });
        var overview = $('seasonOverview');
        if (overview) {
            overview.classList.add('season-overview--archive');
            overview.innerHTML = '<span class="season-overview__label">' + escapeHtml(competition.status || '赛事档案') + '</span><div><strong>' + escapeHtml(competition.name) + '</strong><p>' + escapeHtml(competition.description || '记录这一段比赛里的对手、比分和进球。') + '</p></div><span class="season-overview__count">' + filtered.length + ' 场记录</span>';
        }
        wrap.innerHTML = filtered.map(function (m) {
            var date = new Date(m.date + 'T00:00:00');
            var day = String(date.getDate()).padStart(2, '0');
            var month = String(date.getMonth() + 1).padStart(2, '0') + '月';
            return '<article class="match-card"><div class="match-card__date"><div><div class="match-card__day">' + day + '</div><div class="match-card__month">' + month + ' / ' + date.getFullYear() + '</div></div></div><div class="match-card__body"><div class="match-card__meta">' + escapeHtml(m.competition) + ' / ' + escapeHtml(m.venue) + '</div><h3 class="match-card__opponent">VS ' + escapeHtml(m.opponent) + '</h3><p class="match-card__quote">' + escapeHtml(m.quote) + '</p><p class="match-card__scorers">进球：' + escapeHtml(m.scorers) + '</p></div><div class="match-card__score"><div class="scoreboard"><span class="result-' + m.result + '">' + resultName(m.result) + '</span><strong>' + m.score + '</strong><span>FINAL SCORE</span></div></div></article>';
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

    function lazyLoadGalleryImages(root) {
        var images = root.querySelectorAll('[data-bg]');
        function loadImage(image) {
            var source = image.getAttribute('data-bg');
            if (!source) return;
            image.style.backgroundImage = 'url("' + source + '")';
            image.closest('.gallery__item').classList.add('gallery__item--loaded');
            image.removeAttribute('data-bg');
        }
        if (!('IntersectionObserver' in window)) {
            images.forEach(loadImage);
            return;
        }
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                loadImage(entry.target);
                observer.unobserve(entry.target);
            });
        }, { rootMargin: '240px 0px' });
        images.forEach(function (image) { observer.observe(image); });
    }

    function renderGallery() {
        var grid = $('galleryGrid'); if (!grid) return;
        var filtered = galleryItems.filter(function (g) { return activeGallery === '全部' || g.category === activeGallery; });
        grid.innerHTML = filtered.map(function (g, i) {
            return '<article class="gallery__item" data-photo="' + i + '"><button class="like-btn" type="button" aria-label="点赞"><i class="fa-solid fa-heart"></i></button><div class="gallery__img" style="height:' + g.height + 'px" data-bg="' + g.image + '"></div><span class="gallery__tag">' + g.tag + '</span><div class="gallery__info"><h3>' + escapeHtml(g.title) + '</h3><p>' + g.date + ' / ' + g.category + '</p></div></article>';
        }).join('');
        lazyLoadGalleryImages(grid);
        grid.querySelectorAll('.gallery__item').forEach(function (item) {
            item.addEventListener('click', function (event) {
                if (event.target.closest('.like-btn')) return;
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
        var reviews = (player.reviews || []).map(function (review, index) {
            return '<span style="--comment-top:' + (28 + (index % 3) * 27) + 'px;--comment-delay:' + (index * -1.35) + 's">' + escapeHtml(review) + '</span>';
        }).join('');
        var reviewSection = reviews ? '<div class="modal__reviews" aria-label="队友评价弹幕">' + reviews + '</div>' : '';
        var cleanSheetMetric = player.cleanSheets > 0 ? '<div class="modal__stat"><strong>' + player.cleanSheets + '</strong><span>零封</span></div>' : '';
        body.innerHTML = '<div class="modal__hero"><div class="modal__number">' + player.number + '</div><div><h3 class="modal__title" id="playerModalTitle">' + escapeHtml(player.name) + '</h3><p class="modal__subtitle">' + player.pos + ' / ' + player.role + ' / ' + escapeHtml(player.nickname) + ' / 评分 ' + player.rating + '</p></div></div><div class="modal__stats"><div class="modal__stat"><strong>' + player.apps + '</strong><span>出场</span></div><div class="modal__stat"><strong>' + player.goals + '</strong><span>进球</span></div><div class="modal__stat"><strong>' + player.asts + '</strong><span>助攻</span></div><div class="modal__stat"><strong>' + player.motm + '</strong><span>MVP</span></div>' + cleanSheetMetric + '<div class="modal__stat"><strong>' + player.rating + '</strong><span>评分</span></div></div><p class="modal__bio"><strong>代表瞬间：</strong>' + escapeHtml(player.memory) + '</p>' + reviewSection + '<p class="modal__bio">' + escapeHtml(player.bio) + '</p><div class="modal__tags">' + tags + '</div>';
        openModal(modal);
    }

    function openPhotoModal(photo) {
        var modal = $('photoModal');
        var body = $('photoModalBody');
        if (!modal || !body || !photo) return;
        body.innerHTML = '<div class="photo-modal__image" style="background-image:url(\'' + photo.image + '\');"></div><div class="photo-modal__content"><div class="photo-modal__meta">' + photo.date + ' / ' + photo.category + ' / ' + photo.tag + '</div><h3 id="photoModalTitle">' + escapeHtml(photo.title) + '</h3><p>' + escapeHtml(photo.story) + '</p></div>';
        openModal(modal);
    }

    function openModal(modal) {
        lastModalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        modal.classList.add('modal--open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('body--modal-open');
        var closeButton = modal.querySelector('.modal__close');
        if (closeButton) closeButton.focus();
    }

    function closeModals() {
        document.querySelectorAll('.modal').forEach(function (modal) {
            modal.classList.remove('modal--open');
            modal.setAttribute('aria-hidden', 'true');
        });
        document.body.classList.remove('body--modal-open');
        if (lastModalTrigger && document.contains(lastModalTrigger)) lastModalTrigger.focus();
        lastModalTrigger = null;
    }

    function initModals() {
        document.addEventListener('click', function (e) {
            if (e.target.closest('[data-modal-close]') || e.target.closest('[data-photo-close]')) closeModals();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeModals();
                closeMobileMenu();
                return;
            }
            if (e.key !== 'Tab') return;
            var modal = document.querySelector('.modal--open');
            if (!modal) return;
            var focusable = Array.from(modal.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])')).filter(function (element) {
                return !element.hasAttribute('disabled') && element.getClientRects().length > 0;
            });
            if (!focusable.length) {
                e.preventDefault();
                return;
            }
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
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
                btn.classList.remove('like-btn--burst');
                window.requestAnimationFrame(function () { btn.classList.add('like-btn--burst'); });
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

    function getHeroImage(slide) {
        return window.matchMedia('(max-width: 760px)').matches ? slide.dataset.imageMobile : slide.dataset.image;
    }

    function loadHeroImage(slide) {
        if (!slide) return;
        var source = getHeroImage(slide);
        if (!source || slide.dataset.loadedImage === source) return;
        slide.style.backgroundImage = 'linear-gradient(rgba(7,11,19,0.2), rgba(7,11,19,0.72)), url("' + source + '")';
        slide.dataset.loadedImage = source;
    }

    function preloadNextHeroImage() {
        var nextSlide = slides[(slideIndex + 1) % slides.length];
        if (!nextSlide || !getHeroImage(nextSlide)) return;
        window.setTimeout(function () { loadHeroImage(nextSlide); }, 1800);
    }

    function showSlide(n) {
        slides.forEach(function (slide) { slide.classList.remove('hero__slide--active'); });
        slideIndex = (n + slides.length) % slides.length;
        loadHeroImage(slides[slideIndex]);
        slides[slideIndex].classList.add('hero__slide--active');
        updateDots();
        preloadNextHeroImage();
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

    function initHeroSwipe(hero) {
        var startX = 0;
        var startY = 0;
        hero.addEventListener('touchstart', function (event) {
            var touch = event.changedTouches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            stopAutoPlay();
        }, { passive: true });
        hero.addEventListener('touchend', function (event) {
            var touch = event.changedTouches[0];
            var deltaX = touch.clientX - startX;
            var deltaY = touch.clientY - startY;
            if (Math.abs(deltaX) >= 48 && Math.abs(deltaX) > Math.abs(deltaY)) {
                showSlide(slideIndex + (deltaX > 0 ? -1 : 1));
            }
            startAutoPlay();
        }, { passive: true });
        hero.addEventListener('touchcancel', startAutoPlay, { passive: true });
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
        featuredPlayers = shuffled(allPlayers).slice(0, 3);
        renderAllPlayers();
        renderSeasonSwitch();
        renderMatches();
        renderGalleryTabs();
        renderGallery();
        renderHonors();
        buildDots();
        loadHeroImage(slides[0]);
        preloadNextHeroImage();
        initLikeButtons();
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
            initHeroSwipe(hero);
        }
        startAutoPlay();
        window.addEventListener('scroll', handleScrollReveal);
        window.addEventListener('load', handleScrollReveal);
        handleScrollReveal();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
