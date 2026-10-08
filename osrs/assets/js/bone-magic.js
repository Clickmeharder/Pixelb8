window.BoneMagicTool = (() => {
  const $=id=>document.getElementById(id);
  const norm=s=>String(s||'').trim().toLowerCase();
  const money=v=>v==null?'—':VTAM.money(Math.round(v));
  const decimal=v=>v==null?'—':(Math.round(v*100)/100).toFixed(2);
  const bones=[
    {name:'Bones',fallbackMembers:false},
    {name:'Burnt bones',fallbackMembers:true},
    {name:'Bat bones',fallbackMembers:true},
    {name:'Bleached bones',fallbackMembers:true,untradeable:true},
    {name:'Jogre bones',fallbackMembers:true},
    {name:'Wolf bones',fallbackMembers:true},
    {name:'Monkey bones',fallbackMembers:false},
    {name:"Alan's bones",fallbackMembers:true,untradeable:true},
    {name:"Animals' bones",fallbackMembers:true,untradeable:true},
    {name:'Big bones',fallbackMembers:false}
  ];
  const spells={
    bananas:{key:'bananas',name:'Bones to Bananas',members:false,level:15,xp:25,out:'Banana',nature:1,earth:2,water:2},
    peaches:{key:'peaches',name:'Bones to Peaches',members:true,level:60,xp:35.5,out:'Peach',nature:2,earth:4,water:4,note:'Mage Training Arena unlock required'}
  };
  const mainHands=[
    {key:'none',name:'No staff',members:false},
    {key:'earth',name:'Staff of earth',members:false,provides:['earth']},
    {key:'water',name:'Staff of water',members:false,provides:['water']},
    {key:'bryo',name:"Bryophyta's staff",marketName:"Bryophyta's staff (uncharged)",members:false,bryo:true},
    {key:'mud',name:'Mud battlestaff',members:true,provides:['earth','water']}
  ];
  const offHands=[
    {key:'none',name:'No off-hand',members:false},
    {key:'waterTome',name:'Tome of water',members:true,provides:['water']},
    {key:'earthTome',name:'Tome of earth',members:true,provides:['earth']}
  ];
  let byName=new Map(),mainKey='earth',offKey='none',mode='bananas',hideUntradeable=true,hideUnprofitable=true;

  function item(name){return byName.get(norm(name))||null}
  function price(name,basis){const i=item(name),v=Number(i?.[basis]);return Number.isFinite(v)&&v>0?v:null}
  function boneMembers(b){const i=item(b.name);return typeof i?.members==='boolean'?i.members:b.fallbackMembers}
  function selectedMain(){return mainHands.find(x=>x.key===mainKey)||mainHands[0]}
  function selectedOff(){return offHands.find(x=>x.key===offKey)||offHands[0]}
  function supplied(element){return !!selectedMain().provides?.includes(element)||!!selectedOff().provides?.includes(element)}
  function currentAccess(){return VTAM.geAccess()}
  function isF2P(){return currentAccess()==='f2p'}
  function spell(){return spells[mode]}

  function runeUnit(name){
    const el=$(name==='Nature rune'?'boneNatPrice':name==='Earth rune'?'boneEarthPrice':'boneWaterPrice');
    const n=Number(el?.value);return Number.isFinite(n)&&n>=0?n:0;
  }
  function maxBonesPerCast(){
    let stacks=1; // Nature runes are still required even with Bryophyta's staff.
    if(!supplied('earth'))stacks++;
    if(!supplied('water'))stacks++;
    return Math.max(1,28-stacks);
  }
  function configuredBonesPerCast(){
    const max=maxBonesPerCast();
    const raw=Math.max(1,Math.floor(Number($('bonePerCast')?.value)||max));
    const qty=Math.min(max,raw);
    if($('bonePerCastMax'))$('bonePerCastMax').textContent=String(max);
    return qty;
  }
  function runeCost(s){
    let nature=s.nature*runeUnit('Nature rune');
    if(selectedMain().bryo)nature*=14/15;
    const earth=supplied('earth')?0:s.earth*runeUnit('Earth rune');
    const water=supplied('water')?0:s.water*runeUnit('Water rune');
    return nature+earth+water;
  }
  function visibleBones(){
    const access=currentAccess();
    return bones.filter(b=>{const m=boneMembers(b),accessMatch=access==='all'||(access==='f2p'&&!m)||(access==='p2p'&&m);return accessMatch&&(!hideUntradeable||!b.untradeable)});
  }
  function setMode(next){
    if(next==='peaches'&&isF2P())return;
    mode=next==='peaches'?'peaches':'bananas';
    document.querySelectorAll('[data-bone-mode]').forEach(b=>b.classList.toggle('active',b.dataset.boneMode===mode));
    const peachBtn=document.querySelector('[data-bone-mode="peaches"]');if(peachBtn)peachBtn.disabled=isF2P();
    render();
  }
  function updateModeCopy(){
    const peaches=mode==='peaches';
    if($('boneFruitBasisWrap'))$('boneFruitBasisWrap').hidden=peaches;
    if($('boneFruitMarket'))$('boneFruitMarket').hidden=peaches;
    if($('boneSlicedSlice'))$('boneSlicedSlice').hidden=peaches;
    if($('boneBasketSlice'))$('boneBasketSlice').hidden=peaches||isF2P();
    if($('boneBatchTitle'))$('boneBatchTitle').textContent=peaches?'Peaches Batch Planner':'Bananas Batch Profit';
    if($('boneModeNote'))$('boneModeNote').textContent=peaches?'Peaches are untradeable, so this mode focuses on casting cost, Magic XP, peaches produced and supply planning rather than resale profit. Bones/Cast is user-controlled up to the inventory maximum for the current rune setup.':'Bananas use live GE output prices and can be evaluated for profit. Bones/Cast is user-controlled up to the inventory maximum for the current rune setup. Bryophyta’s staff still requires a Nature rune stack and only reduces expected Nature rune consumption.';
  }
  function renderHead(){
    if(!$('boneHead'))return;
    if(mode==='bananas')$('boneHead').innerHTML='<tr><th>Icon</th><th>Bone</th><th class="right">Bones/Cast</th><th class="right">Bone Price</th><th class="right">Rune Cost</th><th class="right">Total Cost</th><th class="right">Banana Value</th><th class="right">Profit/Cast</th><th class="right">Profit/Bone</th><th class="right">Magic XP</th><th class="right">GP/XP</th><th class="right">GP/Hour</th></tr>';
    else $('boneHead').innerHTML='<tr><th>Icon</th><th>Bone</th><th class="right">Bones/Cast</th><th class="right">Bone Price</th><th class="right">Rune Cost</th><th class="right">Cost/Cast</th><th class="right">Peaches</th><th class="right">Magic XP</th><th class="right">XP/Hour</th><th class="right">GP/XP Cost</th><th class="right">Cost/Hour</th></tr>';
  }
  function render(){
    if(!$('boneBody'))return;
    updateModeCopy();renderHead();
    const s=spell(),inBasis=$('boneInputBasis')?.value||'high',outBasis=$('boneOutputBasis')?.value||'low';
    const castsHr=Math.max(1,Number($('boneCastsHour')?.value)||780),qty=configuredBonesPerCast(),rCost=runeCost(s),rows=[];
    for(const b of visibleBones()){
      const members=boneMembers(b),boneItem=item(b.name),boneP=price(b.name,inBasis),boneCost=boneP==null?null:boneP*qty,total=boneCost==null?null:boneCost+rCost;
      if(mode==='bananas'){
        const outP=price(s.out,outBasis),outVal=outP==null?null:outP*qty,profit=total==null||outVal==null?null:outVal-total,perBone=profit==null?null:profit/qty,gpXp=profit==null?null:profit/s.xp,gpHr=profit==null?null:profit*castsHr;
        rows.push({b,members,boneItem,boneP,boneCost,total,rCost,outVal,profit,perBone,gpXp,gpHr});
      } else {
        const xpHr=s.xp*castsHr,gpXp=total==null?null:total/s.xp,costHr=total==null?null:total*castsHr;
        rows.push({b,members,boneItem,boneP,boneCost,total,rCost,xpHr,gpXp,costHr});
      }
    }
    if(mode==='bananas'&&hideUnprofitable)rows.splice(0,rows.length,...rows.filter(r=>r.profit!=null&&r.profit>=0));
    const iconFallback=VTAM.path('assets/img/item-placeholder.svg');
    $('boneBody').innerHTML=rows.map(r=>{
      const icon=r.boneItem?.id?VTAM.itemIconUrl(r.boneItem.id):iconFallback;
      const bonePrice=r.boneP==null?(r.b.untradeable?'Untradeable':'—'):money(r.boneP);
      if(mode==='bananas')return `<tr><td><span class="alch-icon-slot"><img class="alch-item-icon" src="${icon}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${iconFallback}'"></span></td><td><strong>${r.b.name}</strong><div class="craft-subline">${r.members?'Members':'F2P'}${r.b.untradeable?' • no GE price':''}</div></td><td class="right">${qty}</td><td class="right">${bonePrice}</td><td class="right">${money(r.rCost)}</td><td class="right">${money(r.total)}</td><td class="right">${money(r.outVal)}</td><td class="right ${r.profit==null?'muted':r.profit>=0?'good':'bad'}">${money(r.profit)}</td><td class="right ${r.perBone==null?'muted':r.perBone>=0?'good':'bad'}">${money(r.perBone)}</td><td class="right">${s.xp}</td><td class="right ${r.gpXp==null?'muted':r.gpXp>=0?'good':'bad'}">${decimal(r.gpXp)}</td><td class="right ${r.gpHr==null?'muted':r.gpHr>=0?'good':'bad'}">${money(r.gpHr)}</td></tr>`;
      return `<tr><td><span class="alch-icon-slot"><img class="alch-item-icon" src="${icon}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${iconFallback}'"></span></td><td><strong>${r.b.name}</strong><div class="craft-subline">${r.members?'Members':'F2P'}${r.b.untradeable?' • no GE price':''}</div></td><td class="right">${qty}</td><td class="right">${bonePrice}</td><td class="right">${money(r.rCost)}</td><td class="right bad">${money(r.total)}</td><td class="right">${qty}</td><td class="right">${s.xp}</td><td class="right">${money(r.xpHr)}</td><td class="right">${decimal(r.gpXp)}</td><td class="right bad">${money(r.costHr)}</td></tr>`;
    }).join('')||`<tr><td colspan="${mode==='bananas'?12:11}" class="center muted">No bones match these filters.</td></tr>`;
    if($('boneCount'))$('boneCount').textContent=`${rows.length} bones`;
    renderBatch();renderEquipSlots();
  }

  function populateBatchBones(){
    const sel=$('boneBatchBone');if(!sel)return;
    const prev=sel.value,list=visibleBones();sel.innerHTML=list.map(b=>`<option value="${b.name.replace(/"/g,'&quot;')}">${b.name}</option>`).join('');if(list.some(b=>b.name===prev))sel.value=prev;
  }
  function timeText(hours){if(!Number.isFinite(hours)||hours<0)return '—';const m=Math.round(hours*60);if(m<60)return `${m}m`;const h=Math.floor(m/60),r=m%60;return r?`${h}h ${r}m`:`${h}h`}
  function batchMetric(label,value,cls=''){return `<div class="bone-batch-metric"><span>${label}</span><strong class="${cls}">${value}</strong></div>`}
  function renderBatch(){
    if(!$('boneBatchGrid'))return;populateBatchBones();
    const b=bones.find(x=>x.name===$('boneBatchBone')?.value)||visibleBones()[0];if(!b)return;
    const s=spell(),amount=Math.max(0,Math.floor(Number($('boneBatchAmount')?.value)||0)),qty=configuredBonesPerCast(),casts=amount?Math.ceil(amount/qty):0,inBasis=$('boneInputBasis')?.value||'high',outBasis=$('boneOutputBasis')?.value||'low';
    const boneP=price(b.name,inBasis),boneCost=boneP==null?null:boneP*amount,totalRune=runeCost(s)*casts,totalCost=boneCost==null?null:boneCost+totalRune,castsHr=Math.max(1,Number($('boneCastsHour')?.value)||780),xp=casts*s.xp;
    if($('boneBatchHint'))$('boneBatchHint').textContent=`${qty} bones/cast • ${casts.toLocaleString()} casts • ${timeText(casts/castsHr)}`;
    if(mode==='bananas'){
      const outP=price('Banana',outBasis),outVal=outP==null?null:outP*amount,profit=totalCost==null||outVal==null?null:outVal-totalCost;
      $('boneBatchGrid').innerHTML=batchMetric('Casts',money(casts))+batchMetric('Rune cost',money(totalRune))+batchMetric('Bone cost',money(boneCost))+batchMetric('Banana value',money(outVal))+batchMetric('Total profit',money(profit),profit==null?'muted':profit>=0?'good':'bad')+batchMetric('Magic XP',money(xp))+batchMetric('Time',timeText(casts/castsHr));
    }else{
      $('boneBatchGrid').innerHTML=batchMetric('Casts',money(casts))+batchMetric('Rune cost',money(totalRune))+batchMetric('Bone cost',money(boneCost))+batchMetric('Total cost',money(totalCost),'bad')+batchMetric('Peaches made',money(amount))+batchMetric('Magic XP',money(xp))+batchMetric('Time',timeText(casts/castsHr));
    }
  }

  function equipmentIcon(option){if(option.key==='none')return VTAM.path('assets/img/item-placeholder.svg');const found=item(option.marketName||option.name);return found?.id?VTAM.itemIconUrl(found.id):VTAM.path('assets/img/item-placeholder.svg')}
  function renderEquipSlots(){const m=selectedMain(),o=selectedOff(),mi=$('boneMainIcon'),oi=$('boneOffIcon');if(mi)mi.src=equipmentIcon(m);if(oi)oi.src=equipmentIcon(o);if($('boneMainName'))$('boneMainName').textContent=m.name;if($('boneOffName'))$('boneOffName').textContent=o.name;document.querySelectorAll('[data-bone-main]').forEach(b=>b.classList.toggle('active',b.dataset.boneMain===mainKey));document.querySelectorAll('[data-bone-off]').forEach(b=>b.classList.toggle('active',b.dataset.boneOff===offKey))}
  function closeMenus(except){['boneMainMenu','boneOffMenu'].forEach(id=>{if(id!==except){const el=$(id);if(el)el.hidden=true}})}
  function toggleMenu(id){const el=$(id);if(!el)return;const opening=el.hidden;closeMenus(id);el.hidden=!opening}
  function enforceAccess(){
    const f2p=isF2P();if(f2p){if(selectedMain().members)mainKey='none';if(selectedOff().members)offKey='none';if(mode==='peaches')mode='bananas'}
    document.querySelectorAll('[data-bone-main]').forEach(b=>{const opt=mainHands.find(x=>x.key===b.dataset.boneMain);b.disabled=!!(f2p&&opt?.members)});document.querySelectorAll('[data-bone-off]').forEach(b=>{const opt=offHands.find(x=>x.key===b.dataset.boneOff);b.disabled=!!(f2p&&opt?.members)});const p=document.querySelector('[data-bone-mode="peaches"]');if(p)p.disabled=f2p;render();
  }
  function renderEquipmentMenus(){
    const fallback=VTAM.path('assets/img/item-placeholder.svg');const make=(opt,attr)=>`<button class="bone-equip-option${opt.key==='none'?' bone-equip-none':''}" type="button" ${attr}="${opt.key}"><img src="${equipmentIcon(opt)}" alt="" onerror="this.onerror=null;this.src='${fallback}'"><span>${opt.name}</span>${opt.members?'<small>Members</small>':''}</button>`;
    if($('boneMainMenu'))$('boneMainMenu').innerHTML=mainHands.map(o=>make(o,'data-bone-main')).join('');if($('boneOffMenu'))$('boneOffMenu').innerHTML=offHands.map(o=>make(o,'data-bone-off')).join('');document.querySelectorAll('[data-bone-main]').forEach(b=>b.addEventListener('click',()=>{if(b.disabled)return;mainKey=b.dataset.boneMain;closeMenus();render()}));document.querySelectorAll('[data-bone-off]').forEach(b=>b.addEventListener('click',()=>{if(b.disabled)return;offKey=b.dataset.boneOff;closeMenus();render()}));enforceAccess();
  }
  function setRuneMarket(name,idPrefix){const i=item(name),img=$(idPrefix+'Icon'),high=$(idPrefix+'High'),low=$(idPrefix+'Low'),input=$(idPrefix+'Price');if(img&&i?.id){img.src=VTAM.itemIconUrl(i.id);img.onerror=()=>{img.onerror=null;img.src=VTAM.path('assets/img/item-placeholder.svg')}}if(high)high.textContent=money(i?.high);if(low)low.textContent=money(i?.low);if(input&&i)input.value=i.high||i.low||input.value}
  function setMarketSlice(name,idPrefix){
    const i=item(name),img=$(idPrefix+'Icon'),high=$(idPrefix+'High'),low=$(idPrefix+'Low'),limit=$(idPrefix+'Limit'),volume=$(idPrefix+'Volume');
    if(img&&i?.id){img.src=VTAM.itemIconUrl(i.id);img.onerror=()=>{img.onerror=null;img.src=VTAM.path('assets/img/item-placeholder.svg')}}
    if(high)high.textContent=money(i?.high);
    if(low)low.textContent=money(i?.low);
    if(limit)limit.textContent=`Limit ${i?.limit?Number(i.limit).toLocaleString():'—'}`;
    if(volume){const v=Number(i?.volume24h);volume.textContent=Number.isFinite(v)?`24h ${Math.round(v).toLocaleString()}`:'24h —'}
  }
  function setBasketCost(){
    const basket=item('Basket'),high=$('boneBasketCostHigh'),low=$('boneBasketCostLow');
    if(high)high.textContent=money(basket?.high);
    if(low)low.textContent=money(basket?.low);
  }
  function applyMarket(data){byName=new Map((Array.isArray(data)?data:[]).map(i=>[norm(i.name),i]));setRuneMarket('Nature rune','boneNat');setRuneMarket('Earth rune','boneEarth');setRuneMarket('Water rune','boneWater');setMarketSlice('Banana','boneBanana');setMarketSlice('Sliced banana','boneSliced');setMarketSlice('Bananas(5)','boneBasket');setBasketCost();renderEquipmentMenus();if($('boneMarketStatus')){$('boneMarketStatus').className='bone-market-indicator good';$('boneMarketStatus').title='Live market connected';$('boneMarketStatus').setAttribute('aria-label','Live market connected')}render()}
  function init(){
    if(!$('boneBody'))return;
    const untradeableBtn=$('boneHideUntradeable'),unprofitableBtn=$('boneHideUnprofitable');
    if(untradeableBtn)untradeableBtn.setAttribute('aria-pressed',String(hideUntradeable));
    if(unprofitableBtn)unprofitableBtn.setAttribute('aria-pressed',String(hideUnprofitable));
    ['boneInputBasis','boneOutputBasis','boneCastsHour','bonePerCast','boneNatPrice','boneEarthPrice','boneWaterPrice','boneBatchAmount','boneBatchBone'].forEach(id=>$(id)?.addEventListener('input',render));
    window.addEventListener('vtam:ge-access-changed',enforceAccess);$('boneHideUntradeable')?.addEventListener('click',()=>{hideUntradeable=!hideUntradeable;const b=$('boneHideUntradeable');if(b)b.setAttribute('aria-pressed',String(hideUntradeable));render()});$('boneHideUnprofitable')?.addEventListener('click',()=>{hideUnprofitable=!hideUnprofitable;const b=$('boneHideUnprofitable');if(b)b.setAttribute('aria-pressed',String(hideUnprofitable));render()});document.querySelectorAll('[data-bone-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.boneMode)));
    $('boneMainSlot')?.addEventListener('click',e=>{e.stopPropagation();toggleMenu('boneMainMenu')});$('boneOffSlot')?.addEventListener('click',e=>{e.stopPropagation();toggleMenu('boneOffMenu')});document.addEventListener('click',e=>{if(!e.target.closest('.bone-equip-picker'))closeMenus()});$('boneRefresh')?.addEventListener('click',()=>VTAM.loadMarket(true).then(applyMarket).catch(()=>{}));VTAM.loadMarket().then(applyMarket).catch(()=>{if($('boneMarketStatus')){$('boneMarketStatus').className='bone-market-indicator bad';$('boneMarketStatus').title='Market unavailable';$('boneMarketStatus').setAttribute('aria-label','Market unavailable')}render()});
  }
  return {init};
})();
