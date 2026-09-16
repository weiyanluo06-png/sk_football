const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('js/tactics.js','utf8'),context);
const model=context.window.TACTICS_MODEL;
test('formation changes preserve eleven unique players within the pitch',()=>{
 let slots=model.positions('4-3-3').map((s,i)=>({...s,player:'player-'+i}));
 for(const formation of ['4-4-2','4-2-3-1','4-1-4-1','3-5-2','3-4-3','4-3-3']){
  slots=model.switchFormation(slots,formation);assert.equal(slots.length,11);assert.equal(new Set(slots.map(s=>s.player)).size,11);
  assert(slots.every(s=>s.x>=8&&s.x<=92&&s.y>=8&&s.y<=90));
 }
});
test('any player can replace goalkeeper and existing players exchange places',()=>{
 const slots=model.positions('4-3-3').map((s,i)=>({...s,player:'player-'+i}));
 model.assign(slots,0,'winger');assert.equal(slots[0].player,'winger');
 model.assign(slots,0,'player-5');assert.equal(slots[0].player,'player-5');assert.equal(slots[5].player,'winger');assert.equal(new Set(slots.map(s=>s.player)).size,11);
});
