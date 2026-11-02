'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const game=read('threshold-v18-preview/js/game.js');
const index=read('threshold-v18-preview/index.html');
const gallery=read('threshold-v18-preview/fase-a-gallery.html');
const expected=["archiveBookCart","healingMedicineCart","sanctuaryReliquary","treasurySilverCabinet","cryptSkullColumn","storeChainHoist","armoryChainRack","armoryQuiver","armoryHelmetShelf","armoryBellows","archiveScrollTable","archiveClock","guardWeaponBench","guardMapBoard","guardHelmStand","guardSupplyLocker","healingWashBasin","cryptBonePile","cryptCandleTomb","storeCart","storePotteryRack","storeWineCrates","storeRopeCoils"];
const ids=[...new Set(expected)];
assert.equal(ids.length,23,'Duplicate asset ID');
for(const id of ids){
 const asset=read('threshold-v18-preview/assets/sprites/v18_24/'+id+'.svg');
 assert.match(asset,/<svg[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/,'SVG root '+id);
 assert.match(asset,/<\/svg>\s*$/,'SVG closing '+id);
 assert.match(asset,/(width="(32|64)" height="32")/,'Native size '+id);
 assert.ok(asset.length>350,'Asset too small '+id);
 assert.ok(game.includes(id+":'"+id+".svg'"),'Missing manifest ID '+id);
 assert.ok(gallery.includes('data-id="'+id+'"'),'Missing gallery card '+id);
}
assert.match(game,/const V18_24_SPRITES=/);
assert.match(game,/if\(phaseB\?\.complete&&phaseB\.naturalWidth\)/);
assert.match(game,/else if\(phaseA\?\.complete&&phaseA\.naturalWidth\)/);
assert.match(index,/game\.js\?v=18\.(?:24\.0-furniture|25\.0-phase-b)/);
assert.equal((gallery.match(/<article class="card"/g)||[]).length,36,'Gallery must include all 36');
console.log('Threshold v18.24: 23/23 new asset references and 36/36 gallery cards passed.');
