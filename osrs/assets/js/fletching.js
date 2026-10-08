window.FletchingTool = (() => {
  const $=id=>document.getElementById(id);
  const COLS=['level','icon','inputs','inputCost','output','profit','xp','xpHr','gpHr'];
  let market=[],byName=new Map(),sortField='profit',sortDir=-1;

  const methods=[
    {cat:'Processing',level:0,members:false,name:'Chocolate dust (knife)',out:'Chocolate dust',xp:0,rate:9000,in:[['Chocolate bar',1]],note:'PixelB8 F2P custom'},
    {cat:'Arrow Shafts',level:1,members:true,name:'Arrow shafts',out:'Arrow shaft',outQty:15,xp:5,rate:2000,in:[['Logs',1]]},
    {cat:'Arrow Shafts',level:15,members:true,name:'Oak arrow shafts',out:'Arrow shaft',outQty:30,xp:10,rate:2000,in:[['Oak logs',1]]},
    {cat:'Arrow Shafts',level:30,members:true,name:'Willow arrow shafts',out:'Arrow shaft',outQty:45,xp:15,rate:2000,in:[['Willow logs',1]]},
    {cat:'Headless Arrows',level:1,members:true,name:'Headless arrows',out:'Headless arrow',outQty:15,xp:15,rate:3000,in:[['Arrow shaft',15],['Feather',15]]},

    {cat:'Arrows',level:1,members:true,name:'Bronze arrows',out:'Bronze arrow',outQty:15,xp:19.5,rate:3000,in:[['Headless arrow',15],['Bronze arrowtips',15]]},
    {cat:'Arrows',level:15,members:true,name:'Iron arrows',out:'Iron arrow',outQty:15,xp:37.5,rate:3000,in:[['Headless arrow',15],['Iron arrowtips',15]]},
    {cat:'Arrows',level:30,members:true,name:'Steel arrows',out:'Steel arrow',outQty:15,xp:75,rate:3000,in:[['Headless arrow',15],['Steel arrowtips',15]]},
    {cat:'Arrows',level:45,members:true,name:'Mithril arrows',out:'Mithril arrow',outQty:15,xp:112.5,rate:3000,in:[['Headless arrow',15],['Mithril arrowtips',15]]},
    {cat:'Arrows',level:60,members:true,name:'Adamant arrows',out:'Adamant arrow',outQty:15,xp:150,rate:3000,in:[['Headless arrow',15],['Adamant arrowtips',15]]},
    {cat:'Arrows',level:75,members:true,name:'Rune arrows',out:'Rune arrow',outQty:15,xp:187.5,rate:3000,in:[['Headless arrow',15],['Rune arrowtips',15]]},
    {cat:'Arrows',level:82,members:true,name:'Amethyst arrows',out:'Amethyst arrow',outQty:15,xp:202.5,rate:3000,in:[['Headless arrow',15],['Amethyst arrowtips',15]]},

    {cat:'Darts',level:10,members:true,name:'Bronze darts',out:'Bronze dart',outQty:10,xp:18,rate:1800,in:[['Bronze dart tip',10],['Feather',10]]},
    {cat:'Darts',level:22,members:true,name:'Iron darts',out:'Iron dart',outQty:10,xp:38,rate:1800,in:[['Iron dart tip',10],['Feather',10]]},
    {cat:'Darts',level:37,members:true,name:'Steel darts',out:'Steel dart',outQty:10,xp:75,rate:1800,in:[['Steel dart tip',10],['Feather',10]]},
    {cat:'Darts',level:52,members:true,name:'Mithril darts',out:'Mithril dart',outQty:10,xp:112,rate:1800,in:[['Mithril dart tip',10],['Feather',10]]},
    {cat:'Darts',level:67,members:true,name:'Adamant darts',out:'Adamant dart',outQty:10,xp:150,rate:1800,in:[['Adamant dart tip',10],['Feather',10]]},
    {cat:'Darts',level:81,members:true,name:'Rune darts',out:'Rune dart',outQty:10,xp:188,rate:1800,in:[['Rune dart tip',10],['Feather',10]]},

    {cat:'Javelins',level:3,members:true,name:'Bronze javelins',out:'Bronze javelin',outQty:15,xp:15,rate:3000,in:[['Javelin shaft',15],['Bronze javelin heads',15]]},
    {cat:'Javelins',level:17,members:true,name:'Iron javelins',out:'Iron javelin',outQty:15,xp:30,rate:3000,in:[['Javelin shaft',15],['Iron javelin heads',15]]},
    {cat:'Javelins',level:32,members:true,name:'Steel javelins',out:'Steel javelin',outQty:15,xp:75,rate:3000,in:[['Javelin shaft',15],['Steel javelin heads',15]]},
    {cat:'Javelins',level:47,members:true,name:'Mithril javelins',out:'Mithril javelin',outQty:15,xp:120,rate:3000,in:[['Javelin shaft',15],['Mithril javelin heads',15]]},
    {cat:'Javelins',level:62,members:true,name:'Adamant javelins',out:'Adamant javelin',outQty:15,xp:150,rate:3000,in:[['Javelin shaft',15],['Adamant javelin heads',15]]},
    {cat:'Javelins',level:77,members:true,name:'Rune javelins',out:'Rune javelin',outQty:15,xp:186,rate:3000,in:[['Javelin shaft',15],['Rune javelin heads',15]]},

    {cat:'Bows',level:5,members:true,name:'Shortbow (u)',out:'Shortbow (u)',xp:5,rate:1700,in:[['Logs',1]]},
    {cat:'Bows',level:10,members:true,name:'Longbow (u)',out:'Longbow (u)',xp:10,rate:1700,in:[['Logs',1]]},
    {cat:'Bows',level:20,members:true,name:'Oak shortbow (u)',out:'Oak shortbow (u)',xp:16.5,rate:1700,in:[['Oak logs',1]]},
    {cat:'Bows',level:25,members:true,name:'Oak longbow (u)',out:'Oak longbow (u)',xp:25,rate:1700,in:[['Oak logs',1]]},
    {cat:'Bows',level:35,members:true,name:'Willow shortbow (u)',out:'Willow shortbow (u)',xp:33.3,rate:1700,in:[['Willow logs',1]]},
    {cat:'Bows',level:40,members:true,name:'Willow longbow (u)',out:'Willow longbow (u)',xp:41.5,rate:1700,in:[['Willow logs',1]]},
    {cat:'Bows',level:50,members:true,name:'Maple shortbow (u)',out:'Maple shortbow (u)',xp:50,rate:1700,in:[['Maple logs',1]]},
    {cat:'Bows',level:55,members:true,name:'Maple longbow (u)',out:'Maple longbow (u)',xp:58.3,rate:1700,in:[['Maple logs',1]]},
    {cat:'Bows',level:65,members:true,name:'Yew shortbow (u)',out:'Yew shortbow (u)',xp:67.5,rate:1700,in:[['Yew logs',1]]},
    {cat:'Bows',level:70,members:true,name:'Yew longbow (u)',out:'Yew longbow (u)',xp:75,rate:1700,in:[['Yew logs',1]]},
    {cat:'Bows',level:80,members:true,name:'Magic shortbow (u)',out:'Magic shortbow (u)',xp:83.3,rate:1700,in:[['Magic logs',1]]},
    {cat:'Bows',level:85,members:true,name:'Magic longbow (u)',out:'Magic longbow (u)',xp:91.5,rate:1700,in:[['Magic logs',1]]},

    {cat:'Stringing',level:5,members:true,name:'Shortbow',out:'Shortbow',xp:5,rate:2400,in:[['Shortbow (u)',1],['Bow string',1]]},
    {cat:'Stringing',level:10,members:true,name:'Longbow',out:'Longbow',xp:10,rate:2400,in:[['Longbow (u)',1],['Bow string',1]]},
    {cat:'Stringing',level:20,members:true,name:'Oak shortbow',out:'Oak shortbow',xp:16.5,rate:2400,in:[['Oak shortbow (u)',1],['Bow string',1]]},
    {cat:'Stringing',level:25,members:true,name:'Oak longbow',out:'Oak longbow',xp:25,rate:2400,in:[['Oak longbow (u)',1],['Bow string',1]]},
    {cat:'Stringing',level:35,members:true,name:'Willow shortbow',out:'Willow shortbow',xp:33.3,rate:2400,in:[['Willow shortbow (u)',1],['Bow string',1]]},
    {cat:'Stringing',level:40,members:true,name:'Willow longbow',out:'Willow longbow',xp:41.5,rate:2400,in:[['Willow longbow (u)',1],['Bow string',1]]},
    {cat:'Stringing',level:50,members:true,name:'Maple shortbow',out:'Maple shortbow',xp:50,rate:2400,in:[['Maple shortbow (u)',1],['Bow string',1]]},
    {cat:'Stringing',level:55,members:true,name:'Maple longbow',out:'Maple longbow',xp:58.3,rate:2400,in:[['Maple longbow (u)',1],['Bow string',1]]},
    {cat:'Stringing',level:65,members:true,name:'Yew shortbow',out:'Yew shortbow',xp:67.5,rate:2400,in:[['Yew shortbow (u)',1],['Bow string',1]]},
    {cat:'Stringing',level:70,members:true,name:'Yew longbow',out:'Yew longbow',xp:75,rate:2400,in:[['Yew longbow (u)',1],['Bow string',1]]},
    {cat:'Stringing',level:80,members:true,name:'Magic shortbow',out:'Magic shortbow',xp:83.3,rate:2400,in:[['Magic shortbow (u)',1],['Bow string',1]]},
    {cat:'Stringing',level:85,members:true,name:'Magic longbow',out:'Magic longbow',xp:91.5,rate:2400,in:[['Magic longbow (u)',1],['Bow string',1]]}
  ];

  const norm=s=>String(s||'').trim().toLowerCase();
  const price=(i,b)=>{const v=Number(i?.[b]);return Number.isFinite(v)&&v>0?v:null};
  const money=v=>v==null?'—':VTAM.money(Math.round(v)),num=v=>v==null?'—':VTAM.fmt(Math.round(v));
  const accessMatch=m=>VTAM.geAccess()==='all'||(VTAM.geAccess()==='f2p'&&!m.members)||(VTAM.geAccess()==='p2p'&&m.members);
  const inputBasis=()=>$('fletchInputBasis')?.value||'high',outputBasis=()=>$('fletchOutputBasis')?.value||'low',scale=()=>Math.max(0,(Number($('fletchRateScale')?.value)||100)/100);

  function hydrate(m){
    let inputCost=0,missing=false;
    const inputs=m.in.map(([name,qty])=>{const item=byName.get(norm(name)),p=price(item,inputBasis());if(p==null)missing=true;else inputCost+=p*qty;return {name,qty,item,p}});
    const outItem=byName.get(norm(m.out)),outQty=Math.max(1,Number(m.outQty)||1),unit=price(outItem,outputBasis()),outPrice=unit==null?null:unit*outQty;
    const cost=missing?null:inputCost,profit=cost==null||outPrice==null?null:outPrice-cost,actionsHr=Math.round(m.rate*scale()),xpHr=m.xp*actionsHr,gpHr=profit==null?null:profit*actionsHr;
    return {...m,inputs,outItem,inputCost:cost,outPrice,profit,actionsHr,xpHr,gpHr};
  }
  function syncCategories(){
    const el=$('fletchCategory');if(!el)return;const prev=el.value||'all',cats=[...new Set(methods.filter(accessMatch).map(m=>m.cat))];
    el.innerHTML='<option value="all">All Categories</option>'+cats.map(c=>`<option value="${c}">${c}</option>`).join('');
    el.value=cats.includes(prev)?prev:'all';
  }
  function vis(){const o={};COLS.forEach(c=>o[c]=!!document.querySelector(`[data-fletch-col="${c}"]`)?.checked);return o}
  function inputCell(x){
    const icon=x.item?VTAM.itemIconUrl(x.item.id):VTAM.path('assets/img/item-placeholder.svg'),line=x.p==null?null:x.p*x.qty;
    return `<span class="smith-input-card"><img src="${icon}" alt=""><span><strong>${x.qty>1?x.qty+'× ':''}${x.name}</strong><small>${x.p==null?'No live price':`${money(x.p)} ea${x.qty>1?` • ${money(line)} total`:''}`}</small></span></span>`;
  }
  function render(){
    if(!$('fletchBody'))return;const q=norm($('fletchSearch')?.value),cat=$('fletchCategory')?.value||'all',v=vis();
    let rows=methods.filter(accessMatch).map(hydrate).filter(r=>(cat==='all'||r.cat===cat)&&(!q||norm(r.name+' '+r.in.map(x=>x[0]).join(' ')).includes(q)));
    rows.sort((a,b)=>{let A=a[sortField],B=b[sortField];if(A==null)A=sortDir>0?Infinity:-Infinity;if(B==null)B=sortDir>0?Infinity:-Infinity;if(typeof A==='string'){A=A.toLowerCase();B=String(B).toLowerCase()}return(A>B?1:A<B?-1:0)*sortDir});
    $('fletchCount').textContent=`${rows.length} methods`;
    $('fletchBody').innerHTML=rows.map(r=>{const icon=r.outItem?VTAM.itemIconUrl(r.outItem.id):VTAM.path('assets/img/item-placeholder.svg');return `<tr><td class="right" data-col="level"${v.level?'':' hidden'}>${r.level}</td><td data-col="icon"${v.icon?'':' hidden'}><span class="alch-icon-slot"><img class="alch-item-icon" src="${icon}" alt=""></span></td><td><strong>${r.name}</strong><div class="craft-subline">${r.members?'Members':'F2P'} • ${r.cat}${r.note?' • '+r.note:''}</div></td><td data-col="inputs"${v.inputs?'':' hidden'}><div class="smith-input-list">${r.inputs.map(inputCell).join('')}</div></td><td class="right" data-col="inputCost"${v.inputCost?'':' hidden'}>${money(r.inputCost)}</td><td class="right" data-col="output"${v.output?'':' hidden'}>${money(r.outPrice)}</td><td class="right ${r.profit==null?'muted':r.profit>=0?'good':'bad'}" data-col="profit"${v.profit?'':' hidden'}>${money(r.profit)}</td><td class="right" data-col="xp"${v.xp?'':' hidden'}>${r.xp}</td><td class="right" data-col="xpHr"${v.xpHr?'':' hidden'}>${num(r.xpHr)}</td><td class="right ${r.gpHr==null?'muted':r.gpHr>=0?'good':'bad'}" data-col="gpHr"${v.gpHr?'':' hidden'}>${money(r.gpHr)}</td></tr>`}).join('')||'<tr><td colspan="10" class="center muted">No Fletching methods match these filters.</td></tr>';
  }
  function status(state,title){const s=$('fletchMarketStatus');if(!s)return;s.className=`bone-market-indicator${state?' '+state:''}`;s.title=title;s.setAttribute('aria-label',title)}
  function apply(data){market=Array.isArray(data)?data:[];byName=new Map(market.map(i=>[norm(i.name),i]));status('good','Live market connected');render()}
  function init(){
    if(!$('fletchBody'))return;syncCategories();
    ['fletchSearch','fletchCategory','fletchInputBasis','fletchOutputBasis','fletchRateScale'].forEach(id=>$(id)?.addEventListener('input',render));
    document.querySelectorAll('[data-fletch-col]').forEach(x=>x.addEventListener('change',render));
    document.querySelectorAll('#fletchTable [data-sort]').forEach(th=>th.addEventListener('click',()=>{const f=th.dataset.sort;if(sortField===f)sortDir*=-1;else{sortField=f;sortDir=f==='name'?1:-1}render()}));
    window.addEventListener('vtam:ge-access-changed',()=>{syncCategories();render()});
    $('fletchRefresh')?.addEventListener('click',()=>{status('','Refreshing market');VTAM.loadMarket(true).then(apply).catch(()=>status('bad','Market unavailable'))});
    status('','Connecting to live market');VTAM.loadMarket().then(apply).catch(()=>{status('bad','Market unavailable');render()});
  }
  return {init};
})();