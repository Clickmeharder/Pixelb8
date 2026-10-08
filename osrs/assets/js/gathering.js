window.GatheringTool = (() => {
  const $=id=>document.getElementById(id);
  let market=[],byName=new Map(),skill='mining',sortField='level',sortDir=1;

  const resources={
    mining:[
      {level:1,members:false,name:'Clay',xp:5,qtyHr:900},
      {level:1,members:false,name:'Copper ore',xp:17.5,qtyHr:1000},
      {level:1,members:false,name:'Tin ore',xp:17.5,qtyHr:1000},
      {level:10,members:true,name:'Blurite ore',xp:17.5,qtyHr:500},
      {level:15,members:false,name:'Iron ore',xp:35,qtyHr:1200},
      {level:20,members:false,name:'Silver ore',xp:40,qtyHr:650},
      {level:25,members:true,name:'Lead ore',xp:40.5,qtyHr:800},
      {level:30,members:false,name:'Coal',xp:50,qtyHr:700},
      {level:40,members:false,name:'Gold ore',xp:65,qtyHr:550},
      {level:55,members:false,name:'Mithril ore',xp:80,qtyHr:320},
      {level:65,members:true,name:'Lovakite ore',xp:60,qtyHr:500},
      {level:70,members:false,name:'Adamantite ore',xp:95,qtyHr:220},
      {level:74,members:true,name:'Nickel ore',xp:80.5,qtyHr:300},
      {level:85,members:false,name:'Runite ore',xp:125,qtyHr:90},
      {level:92,members:true,name:'Amethyst',xp:240,qtyHr:90}
    ],
    woodcutting:[
      {level:1,members:false,name:'Logs',xp:25,qtyHr:500},
      {level:15,members:false,name:'Oak logs',xp:37.5,qtyHr:700},
      {level:30,members:false,name:'Willow logs',xp:67.5,qtyHr:850},
      {level:35,members:true,name:'Teak logs',xp:85,qtyHr:900},
      {level:45,members:false,name:'Maple logs',xp:100,qtyHr:650},
      {level:50,members:true,name:'Mahogany logs',xp:125,qtyHr:500},
      {level:60,members:false,name:'Yew logs',xp:175,qtyHr:250},
      {level:75,members:true,name:'Magic logs',xp:250,qtyHr:130},
      {level:90,members:true,name:'Redwood logs',xp:380,qtyHr:180}
    ],
    fishing:[
      {level:1,members:false,name:'Raw shrimps',xp:10,qtyHr:450},
      {level:5,members:false,name:'Raw sardine',xp:20,qtyHr:450},
      {level:10,members:false,name:'Raw herring',xp:30,qtyHr:450},
      {level:15,members:false,name:'Raw anchovies',xp:40,qtyHr:450},
      {level:20,members:false,name:'Raw trout',xp:50,qtyHr:700},
      {level:30,members:false,name:'Raw salmon',xp:70,qtyHr:500},
      {level:35,members:false,name:'Raw tuna',xp:80,qtyHr:350},
      {level:40,members:false,name:'Raw lobster',xp:90,qtyHr:300},
      {level:50,members:false,name:'Raw swordfish',xp:100,qtyHr:220},
      {level:62,members:true,name:'Raw monkfish',xp:120,qtyHr:320},
      {level:65,members:true,name:'Raw karambwan',xp:50,qtyHr:700},
      {level:76,members:true,name:'Raw shark',xp:110,qtyHr:180},
      {level:82,members:true,name:'Raw anglerfish',xp:120,qtyHr:150},
      {level:85,members:true,name:'Raw dark crab',xp:130,qtyHr:220}
    ]
  };

  const norm=s=>String(s||'').trim().toLowerCase();
  const accessMatch=r=>VTAM.geAccess()==='all'||(VTAM.geAccess()==='f2p'&&!r.members)||(VTAM.geAccess()==='p2p'&&r.members);
  const scale=()=>Math.max(0,(Number($('gatherRateScale')?.value)||100)/100);
  const money=v=>v==null?'—':VTAM.money(Math.round(v)),num=v=>v==null?'—':VTAM.fmt(Math.round(v));

  function hydrate(r){
    const item=byName.get(norm(r.name)),high=Number(item?.high)||null,low=Number(item?.low)||null,qtyHr=Math.round(r.qtyHr*scale()),xpHr=r.xp*qtyHr,gpHr=low==null?null:low*qtyHr;
    return {...r,item,high,low,qtyHr,xpHr,gpHr};
  }
  function render(){
    if(!$('gatherBody'))return;
    const q=norm($('gatherSearch')?.value);
    let rows=(resources[skill]||[]).filter(accessMatch).map(hydrate).filter(r=>!q||norm(r.name).includes(q));
    rows.sort((a,b)=>{let A=a[sortField],B=b[sortField];if(A==null)A=sortDir>0?Infinity:-Infinity;if(B==null)B=sortDir>0?Infinity:-Infinity;if(typeof A==='string'){A=A.toLowerCase();B=String(B).toLowerCase()}return(A>B?1:A<B?-1:0)*sortDir});
    $('gatherCount').textContent=`${rows.length} resources`;
    $('gatherBody').innerHTML=rows.map(r=>{const icon=r.item?VTAM.itemIconUrl(r.item.id):VTAM.path('assets/img/item-placeholder.svg');return `<tr><td class="right">${r.level}</td><td><span class="alch-icon-slot"><img class="alch-item-icon" src="${icon}" alt=""></span></td><td><strong>${r.name}</strong><div class="craft-subline">${r.members?'Members':'F2P'} • ${skill[0].toUpperCase()+skill.slice(1)}</div></td><td class="right">${r.xp}</td><td class="right">${money(r.high)}</td><td class="right">${money(r.low)}</td><td class="right">${num(r.qtyHr)}</td><td class="right">${num(r.xpHr)}</td><td class="right ${r.gpHr==null?'muted':r.gpHr>=0?'good':'bad'}">${money(r.gpHr)}</td></tr>`}).join('')||'<tr><td colspan="9" class="center muted">No resources match this filter.</td></tr>';
  }
  function setSkill(next){
    if(!resources[next])return;skill=next;document.querySelectorAll('[data-gather-skill]').forEach(b=>b.classList.toggle('active',b.dataset.gatherSkill===skill));render();
  }
  function status(state,title){const s=$('gatherMarketStatus');if(!s)return;s.className=`bone-market-indicator${state?' '+state:''}`;s.title=title;s.setAttribute('aria-label',title)}
  function apply(data){market=Array.isArray(data)?data:[];byName=new Map(market.map(i=>[norm(i.name),i]));status('good','Live market connected');render()}
  function init(){
    if(!$('gatherBody'))return;
    document.querySelectorAll('[data-gather-skill]').forEach(b=>b.addEventListener('click',()=>setSkill(b.dataset.gatherSkill)));
    ['gatherSearch','gatherRateScale'].forEach(id=>$(id)?.addEventListener('input',render));
    document.querySelectorAll('#gatherTable [data-sort]').forEach(th=>th.addEventListener('click',()=>{const f=th.dataset.sort;if(sortField===f)sortDir*=-1;else{sortField=f;sortDir=f==='name'?1:-1}render()}));
    window.addEventListener('vtam:ge-access-changed',render);
    $('gatherRefresh')?.addEventListener('click',()=>{status('','Refreshing market');VTAM.loadMarket(true).then(apply).catch(()=>status('bad','Market unavailable'))});
    status('','Connecting to live market');VTAM.loadMarket().then(apply).catch(()=>{status('bad','Market unavailable');render()});
  }
  return {init};
})();