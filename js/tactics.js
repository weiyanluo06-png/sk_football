(function () {
    'use strict';
    var formations = {'4-3-3': [4,3,3], '4-4-2': [4,4,2], '4-2-3-1': [4,2,3,1], '4-1-4-1': [4,1,4,1], '3-5-2': [3,5,2], '3-4-3': [3,4,3]};
    function positions(name) {
        var rows = formations[name], result = [{x:50,y:88}];
        rows.forEach(function (count, row) {
            for (var i=0;i<count;i++) result.push({x:count===1?50:15+i*70/(count-1), y:70-row*55/(rows.length-1)});
        });
        return result;
    }
    function switchFormation(slots, name) {
        var remaining=slots.slice();
        return positions(name).map(function (point) {
            var best=0;
            remaining.forEach(function (slot,i) {
                function distance(s) {return Math.pow(s.x-point.x,2)+Math.pow(s.y-point.y,2);}
                if(distance(slot)<distance(remaining[best])) best=i;
            });
            return Object.assign({},point,{player:remaining.splice(best,1)[0].player});
        });
    }
    function assign(slots,index,player) {
        var other=slots.findIndex(function(s){return s.player===player;});
        if(other>=0) slots[other].player=slots[index].player;
        slots[index].player=player;
    }
    window.TACTICS_MODEL={positions:positions,switchFormation:switchFormation,assign:assign};
    window.createTacticsEditor=function(players,original,openProfile) {
        var pitch=document.getElementById('pitch'), select=document.getElementById('formationSelect');
        var status=document.getElementById('tacticsStatus'), selected=null, formation='4-3-3', custom=false;
        var byName=function(name){return players.find(function(p){return p.name===name;});};
        var defaults=Object.keys(original).map(function(k){var s=original[k];return {x:parseFloat(s.left),y:parseFloat(s.top),player:players.find(function(p){return p.id===s.playerId;}).name};});
        var slots=JSON.parse(JSON.stringify(defaults)), storageKey='sk-football-tactics-v1', canSave=true;
        try {
            var saved=JSON.parse(localStorage.getItem(storageKey));
            if(saved && formations[saved.formation] && Array.isArray(saved.slots) && saved.slots.length===11 && new Set(saved.slots.map(function(s){return s.player;})).size===11 && saved.slots.every(function(s){return byName(s.player)&&Number.isFinite(s.x)&&Number.isFinite(s.y)&&s.x>=8&&s.x<=92&&s.y>=8&&s.y<=90;})) {
                slots=saved.slots;formation=saved.formation;custom=!!saved.custom;
            }
        } catch(e) {canSave=false;}
        function save(){try{localStorage.setItem(storageKey,JSON.stringify({formation:formation,custom:custom,slots:slots}));canSave=true;}catch(e){canSave=false;}}
        function announce(){status.textContent=(custom?'自定义阵型 · ':'')+formation+' · '+(canSave?'自动保存在当前浏览器':'当前浏览器无法保存')+(selected!==null?' · 已选 '+slots[selected].player+'，请选择替换队员':'');}
        function render(){
            select.value=formation;announce();
            pitch.querySelectorAll('.pitch__player').forEach(function(n){n.remove();});
            slots.forEach(function(slot,index){
                var p=byName(slot.player), node=document.createElement('button');node.type='button';
                node.className='pitch__player tactics-player'+(selected===index?' pitch__player--selected':'');
                node.style.left=slot.x+'%';node.style.top=slot.y+'%';node.setAttribute('aria-label',p.name+'，'+p.number+'号，点击换人或拖动调整站位');
                if(p.photo){var img=document.createElement('img');img.src=p.photo;img.alt='';node.appendChild(img);}
                var label=document.createElement('span');label.className='pitch__player-name';label.textContent=p.number+' '+p.name;node.appendChild(label);
                var drag=null,suppress=false;
                node.addEventListener('pointerdown',function(e){if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,oldX:slot.x,oldY:slot.y,moved:false};node.setPointerCapture(e.pointerId);});
                node.addEventListener('pointermove',function(e){if(!drag)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<6&&!drag.moved)return;drag.moved=true;var rect=pitch.getBoundingClientRect();slot.x=Math.max(8,Math.min(92,drag.oldX+(e.clientX-drag.x)/rect.width*100));slot.y=Math.max(8,Math.min(90,drag.oldY+(e.clientY-drag.y)/rect.height*100));node.style.left=slot.x+'%';node.style.top=slot.y+'%';});
                node.addEventListener('pointerup',function(){if(drag&&drag.moved){suppress=true;custom=true;save();announce();}drag=null;});
                node.addEventListener('pointercancel',function(){if(drag){slot.x=drag.oldX;slot.y=drag.oldY;node.style.left=slot.x+'%';node.style.top=slot.y+'%';}drag=null;});
                node.addEventListener('click',function(){if(suppress){suppress=false;return;}selected=selected===index?null:index;render();});
                pitch.appendChild(node);
            });
            ['FW','MF','DF','GK'].forEach(function(group){document.getElementById('pool-'+group).replaceChildren();});
            players.forEach(function(p){
                var card=document.createElement('button');card.type='button';card.className='player-card';
                if(slots.some(function(s){return s.player===p.name;}))card.classList.add('player-card--starting');
                var name=document.createElement('div');name.className='player-card__name';name.textContent=p.name;
                var info=document.createElement('div');info.className='player-card__info';info.textContent=p.number+'号 / '+p.role+' / '+p.nickname;
                card.append(name,info);card.addEventListener('click',function(){if(selected===null){openProfile(p.id);return;}assign(slots,selected,p.name);selected=null;save();render();});
                document.getElementById('pool-'+p.pos).appendChild(card);
            });
        }
        select.addEventListener('change',function(){formation=select.value;slots=switchFormation(slots,formation);custom=false;selected=null;save();render();});
        document.getElementById('resetPositions').addEventListener('click',function(){slots=switchFormation(slots,formation);custom=false;selected=null;save();render();});
        document.getElementById('resetTactics').addEventListener('click',function(){slots=JSON.parse(JSON.stringify(defaults));formation='4-3-3';custom=false;selected=null;save();render();});
        return {render:render};
    };
})();
