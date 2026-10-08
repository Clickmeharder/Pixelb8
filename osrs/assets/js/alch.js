window.AlchTerminal = (() => {
  let items=[]; let sortField='name'; let sortDir=1; let active=null; let marketBound=false;
  const $=id=>document.getElementById(id); const favorites=()=>JSON.parse(localStorage.getItem('vtam_favorites')||'[]');
  const COLS=['icon','price','highalch','lowalch','high','low','buyLimit','profit','totalProfit','limitCost','targetBuy','headroom'];
  function staffActive(id){return $(id)?.classList.contains('active')}
  function runeCost(){const nat=+$('natPrice')?.value||0, fire=+$('firePrice')?.value||0;return Math.ceil(nat*(staffActive('bryo')?14/15:1))+(staffActive('fireStaff')?0:fire*5)}
  function profitBasis(){return $('profitBasis')?.value||'high'}
  function basisPrice(i){return profitBasis()==='low'?(+i.low||0):(+i.high||0)}
  function limitCostBasis(){return $('limitCostBasis')?.value||'low'}
  function compute(i){const cost=runeCost(),buy=basisPrice(i),alch=+i.highalch||0,target=+$('targetProfit')?.value||0,limit=+i.limit||0,low=+i.low||0,high=+i.high||0;const profit=alch-buy-cost,targetBuy=alch-cost-target,headroom=targetBuy-low;const lcb=limitCostBasis(),limitUnit=lcb==='high'?high:lcb==='target'?targetBuy:low;return {...i,buyLimit:limit,profit,profitBasisPrice:buy,targetBuy,headroom,totalProfit:profit*limit,limitCost:limit*limitUnit}}
  function visibleColumns(){const out={};COLS.forEach(c=>{const el=document.querySelector(`[data-alch-col="${c}"]`);out[c]=!!el?.checked});return out}
  function applyColumnVisibility(){const vis=visibleColumns();COLS.forEach(c=>document.querySelectorAll(`[data-col="${c}"]`).forEach(el=>el.hidden=!vis[c]));}
  function render(){
    if(!$('alchBody')||!$('itemSearch'))return;
    const q=$('itemSearch').value.trim().toLowerCase(),type=VTAM.geAccess(),fav=favorites(),vis=visibleColumns(),minProfitRaw=$('minProfit')?.value?.trim()??'',minProfit=minProfitRaw===''?null:Number(minProfitRaw);
    let rows=items.filter(i=>i.highalch>0&&(!q||i.name.toLowerCase().includes(q))).map(compute);
    if(type==='f2p')rows=rows.filter(i=>!i.members);if(type==='p2p')rows=rows.filter(i=>i.members);if($('hideNoLimit')?.classList.contains('active'))rows=rows.filter(i=>i.buyLimit>0);if(minProfit!==null&&Number.isFinite(minProfit))rows=rows.filter(i=>i.profit>=minProfit);
    rows.sort((a,b)=>{let A=a[sortField],B=b[sortField];if(typeof A==='string'){A=A.toLowerCase();B=B.toLowerCase()}return(A>B?1:A<B?-1:0)*sortDir});
    $('itemCount').textContent=`${VTAM.fmt(rows.length)} items`;
    const cells=i=>[
      `<td data-col="icon"${vis.icon?'':' hidden'}><span class="alch-icon-slot"><img class="alch-item-icon" src="${VTAM.itemIconUrl(i.id)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${VTAM.path('assets/img/item-placeholder.svg')}'"></span></td>`,
      `<td>${fav.includes(i.id)?'<span class="accent">★</span> ':''}${i.name}</td>`,
      `<td class="right" data-col="price"${vis.price?'':' hidden'}>${VTAM.money(i.price)}</td>`,
      `<td class="right muted" data-col="highalch"${vis.highalch?'':' hidden'}>${VTAM.money(i.highalch)}</td>`,
      `<td class="right muted" data-col="lowalch"${vis.lowalch?'':' hidden'}>${VTAM.money(i.lowalch)}</td>`,
      `<td class="right" data-col="high"${vis.high?'':' hidden'}>${VTAM.money(i.high)}</td>`,
      `<td class="right" data-col="low"${vis.low?'':' hidden'}>${VTAM.money(i.low)}</td>`,
      `<td class="right" data-col="buyLimit"${vis.buyLimit?'':' hidden'}>${VTAM.fmt(i.buyLimit)}</td>`,
      `<td class="right ${i.profit>=0?'good':'bad'}" data-col="profit"${vis.profit?'':' hidden'}>${VTAM.money(i.profit)}</td>`,
      `<td class="right ${i.totalProfit>=0?'good':'bad'}" data-col="totalProfit"${vis.totalProfit?'':' hidden'}>${VTAM.money(i.totalProfit)}</td>`,
      `<td class="right" data-col="limitCost"${vis.limitCost?'':' hidden'}>${VTAM.money(i.limitCost)}</td>`,
      `<td class="right" data-col="targetBuy"${vis.targetBuy?'':' hidden'}>${VTAM.money(i.targetBuy)}</td>`,
      `<td class="right ${i.headroom>=0?'good':'bad'}" data-col="headroom"${vis.headroom?'':' hidden'}>${VTAM.money(i.headroom)}</td>`
    ].join('');
    const visibleCount=1+COLS.filter(c=>vis[c]).length;
    $('alchBody').innerHTML=rows.map(i=>`<tr data-id="${i.id}">${cells(i)}</tr>`).join('')||`<tr><td colspan="${visibleCount}" class="center muted">No matching alch items.</td></tr>`;
    applyColumnVisibility();
    $('alchBody').querySelectorAll('tr[data-id]').forEach(r=>r.addEventListener('contextmenu',e=>{e.preventDefault();active=+r.dataset.id;showMenu(e)}));
  }
  function showMenu(e){const m=$('contextMenu'),i=items.find(x=>x.id===active);if(!m)return;$('contextTitle').textContent=i?.name||'Item';$('contextAction').textContent=favorites().includes(active)?'★ Remove from watchlist':'☆ Add to watchlist';m.style.display='block';m.style.left=Math.min(e.clientX,innerWidth-210)+'px';m.style.top=Math.min(e.clientY,innerHeight-100)+'px'}
  function toggleFav(){const f=favorites(),idx=f.indexOf(active);idx>=0?f.splice(idx,1):f.push(active);localStorage.setItem('vtam_favorites',JSON.stringify(f));const m=$('contextMenu');if(m)m.style.display='none';render()}
  function applyMarket(data){items=Array.isArray(data)?data:[];
    const fire=items.find(i=>i.id===1387); const bryo=items.find(i=>i.id===22368);
    const fireImg=document.querySelector('#fireStaff img'); const bryoImg=document.querySelector('#bryo img');
    if(fireImg){fireImg.src=VTAM.itemIconUrl(1387);fireImg.onerror=()=>{fireImg.onerror=null;fireImg.src=VTAM.path('assets/img/item-placeholder.svg')}}
    if(bryoImg){bryoImg.src=VTAM.itemIconUrl(22368);bryoImg.onerror=()=>{bryoImg.onerror=null;bryoImg.src=VTAM.path('assets/img/item-placeholder.svg')}}
    const nat=items.find(i=>i.id===561), fireRune=items.find(i=>i.id===554);
    const natIcon=$('natRuneIcon'), fireRuneIcon=$('fireRuneIcon');
    if(natIcon){natIcon.src=VTAM.itemIconUrl(561);natIcon.onerror=()=>{natIcon.onerror=null;natIcon.src=VTAM.path('assets/img/item-placeholder.svg')}}
    if(fireRuneIcon){fireRuneIcon.src=VTAM.itemIconUrl(554);fireRuneIcon.onerror=()=>{fireRuneIcon.onerror=null;fireRuneIcon.src=VTAM.path('assets/img/item-placeholder.svg')}}
    if(nat){if($('natPrice'))$('natPrice').value=nat.high||135;if($('natHigh'))$('natHigh').textContent=VTAM.money(nat.high);if($('natLow'))$('natLow').textContent=VTAM.money(nat.low)}
    if(fireRune){if($('firePrice'))$('firePrice').value=fireRune.high||4;if($('fireHigh'))$('fireHigh').textContent=VTAM.money(fireRune.high);if($('fireLow'))$('fireLow').textContent=VTAM.money(fireRune.low)}
    if($('marketStatus')){$('marketStatus').textContent='Live market connected';$('marketStatus').className='badge good'}
    render()}
  function init(){
    if(!$('alchBody'))return;
    ['natPrice','firePrice','targetProfit','minProfit','itemSearch','profitBasis','limitCostBasis'].forEach(id=>$(id)?.addEventListener('input',render));
    ['fireStaff','bryo'].forEach(id=>$(id)?.addEventListener('click',()=>{const b=$(id);b.classList.toggle('active');b.setAttribute('aria-pressed',b.classList.contains('active')?'true':'false');render()}));
    $('hideNoLimit')?.addEventListener('click',()=>{const b=$('hideNoLimit');b.classList.toggle('active');b.setAttribute('aria-pressed',b.classList.contains('active')?'true':'false');render()});
    document.querySelectorAll('[data-alch-col]').forEach(cb=>cb.addEventListener('change',()=>{applyColumnVisibility();render()}));
    document.querySelectorAll('[data-sort]').forEach(th=>th.addEventListener('click',()=>{const f=th.dataset.sort;if(sortField===f)sortDir*=-1;else{sortField=f;sortDir=f==='name'?1:-1}render()}));
    if($('contextAction'))$('contextAction').onclick=e=>{e.stopPropagation();toggleFav()};if($('refreshMarket'))$('refreshMarket').onclick=()=>VTAM.loadMarket(true).catch(()=>{});
    window.addEventListener('vtam:ge-access-changed',render);
    if(!marketBound){window.addEventListener('vtam:market',e=>applyMarket(e.detail));document.addEventListener('click',()=>{const m=$('contextMenu');if(m)m.style.display='none'});marketBound=true;}
    VTAM.loadMarket().then(applyMarket).catch(()=>{});
  }
  return {init};
})();
