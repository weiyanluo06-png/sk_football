document.addEventListener('DOMContentLoaded',function(){
 'use strict';
 var main=document.querySelector('main'), pages={}, scrolls={}, current='';
 var labels={home:'首页',team:'球队',matches:'赛事',tactics:'战术板',gallery:'影像',notices:'通知',about:'了解球队',recruit:'加入球队',more:'更多'};
 function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
 function page(id){var el=document.createElement('div');el.className='column-page';el.dataset.page=id;el.hidden=true;main.appendChild(el);pages[id]=el;return el;}
 Object.keys(labels).forEach(page);
 function move(id,to){var el=document.getElementById(id);if(el)pages[to].appendChild(el);}
 move('hero','home');move('newcomers','team');move('managers','team');move('memory','matches');move('gallery','gallery');move('story','about');move('honors','about');move('recruit','recruit');
 var tools=document.querySelector('.squad-tools');pages.tactics.appendChild(tools);tools.id='tacticsPanel';
 var squad=document.getElementById('squad');var archive=document.createElement('details');archive.className='lineup-archive';archive.innerHTML='<summary>查看默认首发阵容与队员精选</summary>';archive.appendChild(squad);pages.team.appendChild(archive);
 var roster=document.createElement('section');roster.className='column-content';roster.innerHTML='<span class="section__kicker">TEAM ROSTER</span><h2>球队成员</h2><p>选择队员卡查看详细档案，进入战术板可自由排阵。</p><div class="team-directory"></div>';
 pages.team.appendChild(roster);
 function populateRoster(){var target=roster.querySelector('.team-directory');target.replaceChildren();document.querySelectorAll('#squadPool .player-card').forEach(function(card){var copy=card.cloneNode(true);copy.classList.remove('player-card--starting');copy.addEventListener('click',function(){var name=card.querySelector('.player-card__name').textContent; var originals=(window.PONYTAIL_DATA.players||[]); var max=originals.reduce(function(m,p){return Math.max(m,p.id);},0); var extras=(window.NEWCOMER_DATA.newcomers||[]).filter(function(p){return !originals.some(function(o){return o.name===p.name;});}); var found=originals.find(function(p){return p.name===name;}); window.openTeamProfile(found?found.id:max+1+extras.findIndex(function(p){return p.name===name;}));});target.appendChild(copy);});}
 populateRoster();
 var notices=(window.TEAM_NOTICES||[]).filter(function(n){return n.status==='发布';}).reverse().sort(function(a,b){return b.date.localeCompare(a.date);});
 function card(n){return '<a class="notice-card" href="#notice/'+encodeURIComponent(n.id)+'"><span class="notice-meta">'+esc(n.date)+'</span><h3>'+esc(n.title)+'</h3><p>'+esc(n.summary)+'</p><span class="text-link">查看公告 →</span></a>';}
 pages.home.insertAdjacentHTML('beforeend','<section class="home-overview"><div class="overview-heading"><div><span class="section__kicker">CLUB NEWS</span><h2>球队近况</h2></div><a href="#notices" class="text-link">全部通知 →</a></div><div class="home-news">'+notices.slice(0,3).map(card).join('')+'</div><div class="home-match" id="homeMatch"></div><nav class="quick-links" aria-label="快捷入口"><a href="#team">球队成员 <span>认识队员与经理 →</span></a><a href="#tactics">自由战术板 <span>选择阵型，自由排阵 →</span></a><a href="#matches">赛事档案 <span>赛程与比赛记录 →</span></a><a href="#gallery">球队影像 <span>留住场上场下的瞬间 →</span></a></nav><div class="home-bottom"><a href="#recruit">加入球队 →</a><a href="#about">了解我们的故事 →</a></div></section>');
 var matches=(window.PONYTAIL_DATA.matches||[]).filter(function(m){return /^\d{4}-\d{2}-\d{2}$/.test(m.date);});var today=new Date().toLocaleDateString('sv-SE');var next=matches.filter(function(m){return m.date>=today;}).sort(function(a,b){return a.date.localeCompare(b.date);})[0];var latest=next||matches.sort(function(a,b){return b.date.localeCompare(a.date);})[0];
 document.getElementById('homeMatch').innerHTML=latest?'<div><span class="section__kicker">'+(next?'下一场比赛':'最近赛果')+'</span><h3>生康学院 '+esc(latest.score)+' '+esc(latest.opponent)+'</h3><p>'+esc(latest.date)+' · '+esc(latest.competition)+' · '+esc(latest.venue)+'</p></div><a class="text-link" href="#matches">赛事详情 →</a>':'<p>近期赛事安排待公布</p>';
 pages.notices.innerHTML='<section class="column-content"><span class="section__kicker">NOTICE BOARD</span><h1>通知公告</h1><p>赛事、新面孔与球队共同经历的每一个节点。</p><div class="notice-list"></div></section>';
 pages.notices.querySelector('.notice-list').innerHTML=notices.map(card).join('')||'<p class="empty-notice">暂无通知，敬请期待。</p>';
 page('detail');
 function noticeParagraph(text){
     var lines=text.split('\n');
     if(lines.length===4 && lines.every(function(line){return /^[A-D]组：/.test(line);})){return '<div class="draw-groups" aria-label="纺大杯小组抽签结果">'+lines.map(function(line){var group=line.charAt(0),teams=line.slice(3).replace(/。$/,'').split('、'),ours=teams.includes('生康');return '<section class="draw-group'+(ours?' draw-group--ours':'')+'"><header><span class="draw-letter">'+group+'</span><div><span class="draw-eyebrow">GROUP '+group+'</span><h2>'+group+'组</h2></div>'+(ours?'<span class="draw-badge">生康所在组</span>':'')+'</header><ul>'+teams.map(function(team,i){return '<li'+(team==='生康'?' class="draw-team--ours"':'')+'><span class="draw-number">0'+(i+1)+'</span><strong>'+esc(team)+'</strong>'+(team==='生康'?'<span class="draw-us">我们的球队</span>':'')+'</li>';}).join('')+'</ul></section>';}).join('')+'<p class="draw-rule">小组赛采用积分制 · 各组前两名出线</p></div>';}
     return '<p>'+esc(text)+'</p>';
 }
 function detail(id){var n=notices.find(function(item){return item.id===id;});if(!n){pages.detail.innerHTML='<section class="column-content"><h1>未找到这条通知</h1><a href="#notices">返回通知列表</a></section>';return;}
 var members=(n.members||[]).map(function(name){return (window.NEWCOMER_DATA.newcomers||[]).find(function(p){return p.name===name;});}).filter(Boolean);
 pages.detail.innerHTML='<article class="column-content notice-detail"><a class="text-link" href="#notices">← 通知列表</a><div class="notice-meta">'+'发布于 '+esc(n.date)+'</div><h1>'+esc(n.title)+'</h1><p class="notice-lead">'+esc(n.summary)+'</p>'+n.body.split('\n\n').map(noticeParagraph).join('')+'<div class="notice-members">'+members.map(function(p){return '<div><strong>'+esc(p.name)+'</strong><span>'+esc(p.number)+'号 · '+esc(p.pos)+(p.role?' / '+esc(p.role):'')+' · '+esc(p.preferredFoot)+'</span></div>';}).join('')+'</div>'+(n.image?'<figure><img src="'+esc(n.image)+'" alt="'+esc(n.imageCaption)+'"><figcaption>'+esc(n.imageCaption)+'</figcaption></figure>':'')+'<a class="notice-action" href="'+esc(n.link)+'">'+esc(n.linkText)+' →</a></article>';}
 pages.more.innerHTML='<section class="column-content"><span class="section__kicker">EXPLORE</span><h1>更多</h1><nav class="quick-links"><a href="#notices">通知公告 →</a><a href="#gallery">球队影像 →</a><a href="#about">队史与荣誉 →</a><a href="#recruit">加入球队 →</a><a href="https://weiyanluo06-png.github.io/wtu-football/" target="_blank" rel="noopener noreferrer">材料足球队 ↗</a></nav></section>';
 var nav=document.querySelector('#mainNav ul');nav.innerHTML=['home','team','matches','tactics','gallery','notices','more'].map(function(id){return '<li><a class="header__nav-link" href="#'+id+'">'+labels[id]+'</a></li>';}).join('');
 var bottom=document.createElement('nav');bottom.className='mobile-columns';bottom.setAttribute('aria-label','栏目导航');bottom.innerHTML=['home','team','matches','tactics','more'].map(function(id){return '<a href="#'+id+'">'+labels[id]+'</a>';}).join('');document.body.appendChild(bottom);
 var aliases={hero:'home',newcomers:'team',managers:'team',memory:'matches',squad:'tactics',honors:'about',story:'about'};
 function route(){var hash=decodeURIComponent(location.hash.slice(1)||'home'),isDetail=hash.indexOf('notice/')===0,id=isDetail?'detail':(aliases[hash]||hash);if(!pages[id])id='home';
 if(current)scrolls[current]=window.scrollY;Object.keys(pages).forEach(function(key){pages[key].hidden=key!==id;});if(isDetail)detail(hash.slice(7));current=hash;
 document.body.dataset.column=id;document.title=(isDetail?'通知详情':labels[id]||'首页')+' | 生康足球队';
 document.querySelectorAll('.header__nav-link,.mobile-columns a').forEach(function(a){var target=a.hash.slice(1),active=target===id||(id==='detail'&&target==='notices')||(['notices','detail','gallery','about','recruit'].includes(id)&&target==='more');a.classList.toggle('header__nav-link--active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 document.getElementById('mainNav').classList.remove('header__nav--open');document.getElementById('menuToggle').setAttribute('aria-expanded','false');pages[id].querySelectorAll('.reveal').forEach(function(el){el.classList.add('reveal--visible');});
 requestAnimationFrame(function(){window.scrollTo({top:scrolls[hash]||0,behavior:'instant'});window.dispatchEvent(new Event('resize'));});}
 document.addEventListener('click',function(event){var a=event.target.closest('a[href^="#"]');if(!a||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;var h=a.getAttribute('href');if(h.length<2)return;event.preventDefault();if(location.hash!==h){history.pushState(null,'',h);route();}});
 window.addEventListener('hashchange',route);route();
});






