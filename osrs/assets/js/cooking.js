window.CookingTool = (() => {
  const $=id=>document.getElementById(id);
  const COLS=['level','icon','input','inputCost','output','profit','xp','xpHr','gpHr'];
  let market=[],byName=new Map(),sortField='profit',sortDir=-1;
  const methods=[
    {cat:'Fish',level:1,members:false,name:'Shrimp',in:'Raw shrimps',out:'Shrimps',xp:30,rate:1400},
    {cat:'Fish',level:1,members:false,name:'Anchovies',in:'Raw anchovies',out:'Anchovies',xp:30,rate:1400},
    {cat:'Fish',level:1,members:false,name:'Sardine',in:'Raw sardine',out:'Sardine',xp:40,rate:1400},
    {cat:'Fish',level:5,members:false,name:'Herring',in:'Raw herring',out:'Herring',xp:50,rate:1400},
    {cat:'Fish',level:10,members:true,name:'Mackerel',in:'Raw mackerel',out:'Mackerel',xp:60,rate:1400},
    {cat:'Fish',level:15,members:false,name:'Trout',in:'Raw trout',out:'Trout',xp:70,rate:1400},
    {cat:'Fish',level:18,members:true,name:'Cod',in:'Raw cod',out:'Cod',xp:75,rate:1400},
    {cat:'Fish',level:20,members:false,name:'Pike',in:'Raw pike',out:'Pike',xp:80,rate:1400},
    {cat:'Fish',level:25,members:false,name:'Salmon',in:'Raw salmon',out:'Salmon',xp:90,rate:1400},
    {cat:'Fish',level:30,members:false,name:'Tuna',in:'Raw tuna',out:'Tuna',xp:100,rate:1400},
    {cat:'Fish',level:40,members:false,name:'Lobster',in:'Raw lobster',out:'Lobster',xp:120,rate:1400},
    {cat:'Fish',level:43,members:true,name:'Bass',in:'Raw bass',out:'Bass',xp:130,rate:1400},
    {cat:'Fish',level:45,members:false,name:'Swordfish',in:'Raw swordfish',out:'Swordfish',xp:140,rate:1400},
    {cat:'Fish',level:62,members:true,name:'Monkfish',in:'Raw monkfish',out:'Monkfish',xp:150,rate:1400},
    {cat:'Fish',level:80,members:true,name:'Shark',in:'Raw shark',out:'Shark',xp:210,rate:1400},
    {cat:'Fish',level:84,members:true,name:'Anglerfish',in:'Raw anglerfish',out:'Anglerfish',xp:230,rate:1400},
    {cat:'Fish',level:90,members:true,name:'Dark crab',in:'Raw dark crab',out:'Dark crab',xp:215,rate:1400},
    {cat:'Meat',level:1,members:false,name:'Cooked meat',in:'Raw beef',out:'Cooked meat',xp:30,rate:1400},
    {cat:'Meat',level:1,members:false,name:'Cooked chicken',in:'Raw chicken',out:'Cooked chicken',xp:30,rate:1400},
    {cat:'Wine',level:35,members:false,name:'Jug of wine',in:'Grapes',extra:[['Jug of water',1]],out:'Jug of wine',xp:200,rate:2450},
    {cat:'Pies',level:10,members:false,name:'Redberry pie',in:'Pie shell',extra:[['Redberries',1]],out:'Redberry pie',xp:78,rate:900},
    {cat:'Pies',level:20,members:false,name:'Meat pie',in:'Pie shell',extra:[['Cooked meat',1]],out:'Meat pie',xp:110,rate:900},
    {cat:'Pies',level:30,members:false,name:'Apple pie',in:'Pie shell',extra:[['Cooking apple',1]],out:'Apple pie',xp:130,rate:900},
    {cat:'Pies',level:34,members:true,name:'Garden pie',in:'Pie shell',extra:[['Tomato',1],['Onion',1],['Cabbage',1]],out:'Garden pie',xp:138,rate:700},
    {cat:'Pies',level:47,members:true,name:'Fish pie',in:'Pie shell',extra:[['Trout',1],['Cod',1],['Potato',1]],out:'Fish pie',xp:164,rate:700},
    {cat:'Pies',level:70,members:true,name:'Admiral pie',in:'Pie shell',extra:[['Salmon',1],['Tuna',1],['Potato',1]],out:'Admiral pie',xp:210,rate:700},


    {cat:'Vegetables & Stews',level:7,members:true,name:'Baked potato',in:'Potato',out:'Baked potato',xp:15,rate:1400},
    {cat:'Vegetables & Stews',level:9,members:true,name:'Spicy sauce',in:'Gnome spice',extra:[['Chopped garlic',1]],out:'Spicy sauce',xp:25,rate:1200},
    {cat:'Vegetables & Stews',level:11,members:true,name:'Chilli con carne',in:'Spicy sauce',extra:[['Cooked meat',1]],out:'Chilli con carne',xp:0,rate:1100},
    {cat:'Vegetables & Stews',level:13,members:true,name:'Scrambled egg',in:'Egg',out:'Scrambled egg',xp:50,rate:1200},
    {cat:'Vegetables & Stews',level:23,members:true,name:'Egg and tomato',in:'Scrambled egg',extra:[['Tomato',1]],out:'Egg and tomato',xp:0,rate:1100},
    {cat:'Vegetables & Stews',level:25,members:false,name:'Stew',in:'Bowl of water',extra:[['Potato',1],['Cooked meat',1]],out:'Stew',xp:117,rate:850},
    {cat:'Vegetables & Stews',level:25,members:true,name:'Spicy stew',in:'Stew',extra:[['Spice',1]],out:'Spicy stew',xp:0,rate:1200},
    {cat:'Vegetables & Stews',level:28,members:true,name:'Cooked sweetcorn',in:'Sweetcorn',out:'Cooked sweetcorn',xp:104,rate:1400},
    {cat:'Vegetables & Stews',level:39,members:true,name:'Potato with butter',in:'Baked potato',extra:[['Pat of butter',1]],out:'Potato with butter',xp:40,rate:1000},
    {cat:'Vegetables & Stews',level:41,members:true,name:'Chilli potato',in:'Potato with butter',extra:[['Chilli con carne',1]],out:'Chilli potato',xp:15,rate:1000},
    {cat:'Vegetables & Stews',level:42,members:true,name:'Fried onions',in:'Onion',out:'Fried onions',xp:60,rate:1200},
    {cat:'Vegetables & Stews',level:46,members:true,name:'Fried mushrooms',in:'Mushrooms',out:'Fried mushrooms',xp:60,rate:1200},
    {cat:'Vegetables & Stews',level:47,members:true,name:'Potato with cheese',in:'Potato with butter',extra:[['Cheese',1]],out:'Potato with cheese',xp:40,rate:1000},
    {cat:'Vegetables & Stews',level:51,members:true,name:'Egg potato',in:'Potato with butter',extra:[['Egg and tomato',1]],out:'Egg potato',xp:45,rate:1000},
    {cat:'Vegetables & Stews',level:57,members:true,name:'Mushroom & onion',in:'Fried mushrooms',extra:[['Fried onions',1]],out:'Mushroom & onion',xp:0,rate:1100},
    {cat:'Vegetables & Stews',level:64,members:true,name:'Mushroom potato',in:'Potato with butter',extra:[['Mushroom & onion',1]],out:'Mushroom potato',xp:55,rate:1000},
    {cat:'Vegetables & Stews',level:67,members:true,name:'Tuna and corn',in:'Tuna',extra:[['Cooked sweetcorn',1]],out:'Tuna and corn',xp:0,rate:1100},
    {cat:'Vegetables & Stews',level:68,members:true,name:'Tuna potato',in:'Potato with butter',extra:[['Tuna and corn',1]],out:'Tuna potato',xp:10,rate:1000},

    {cat:'Kebabs',level:1,members:false,name:'Kebab',in:'Cooked meat',extra:[['Pitta bread',1]],out:'Kebab',xp:0,rate:1000},
    {cat:'Kebabs',level:58,members:true,name:'Ugthanki kebab',in:'Cooked ugthanki meat',extra:[['Pitta bread',1],['Tomato',1],['Onion',1]],out:'Ugthanki kebab',xp:120,rate:900},

    {cat:'Pizzas',level:35,members:false,name:'Plain pizza',in:'Pizza base',extra:[['Tomato',1],['Cheese',1]],out:'Plain pizza',xp:143,rate:900},
    {cat:'Pizzas',level:45,members:false,name:'Meat pizza',in:'Plain pizza',extra:[['Cooked meat',1]],out:'Meat pizza',xp:169,rate:900},
    {cat:'Pizzas',level:55,members:false,name:'Anchovy pizza',in:'Plain pizza',extra:[['Anchovies',1]],out:'Anchovy pizza',xp:182,rate:900},
    {cat:'Pizzas',level:65,members:true,name:'Pineapple pizza',in:'Plain pizza',extra:[['Pineapple ring',2]],out:'Pineapple pizza',xp:195,rate:900},

    {cat:'Cakes',level:40,members:false,name:'Cake',in:'Cake tin',extra:[['Bucket of milk',1],['Egg',1],['Pot of flour',1]],out:'Cake',xp:180,rate:700},
    {cat:'Cakes',level:50,members:false,name:'Chocolate cake',in:'Cake',extra:[['Chocolate bar',1]],out:'Chocolate cake',xp:210,rate:900},

    {cat:'Dairy',level:21,members:true,name:'Cream',in:'Bucket of milk',out:'Cream',xp:18,rate:1200},
    {cat:'Dairy',level:38,members:true,name:'Butter',in:'Bucket of milk',out:'Pat of butter',xp:40.5,rate:1200},
    {cat:'Dairy',level:48,members:true,name:'Cheese',in:'Bucket of milk',out:'Cheese',xp:64,rate:1200},

    {cat:'Hot Drinks',level:20,members:true,name:'Cup of tea',in:'Cup of hot water',extra:[['Tea leaves',1]],out:'Cup of tea',xp:52,rate:1200},
    {cat:'Hot Drinks',level:25,members:true,name:'Nettle tea',in:'Bowl of water',extra:[['Nettles',1]],out:'Nettle tea',xp:52,rate:900},

    {cat:'Brewing',level:14,members:true,name:'Cider',in:'Apple mush',extra:[['Bucket of water',1],['Ale yeast',1]],out:'Cider',xp:182,rate:250},
    {cat:'Brewing',level:19,members:true,name:"Chef's delight",in:'Chocolate dust',extra:[['Bucket of water',1],['Ale yeast',1]],out:"Chef's delight",xp:224,rate:250},
    {cat:'Brewing',level:24,members:true,name:'Asgarnian ale',in:'Barley malt',extra:[['Bucket of water',1],['Ale yeast',1]],out:'Asgarnian ale',xp:248,rate:250},
    {cat:'Brewing',level:29,members:true,name:"Greenman's ale",in:'Barley malt',extra:[['Bucket of water',1],['Ale yeast',1],['Harralander',1]],out:"Greenman's ale",xp:281,rate:250},
    {cat:'Brewing',level:39,members:true,name:'Dragon bitter',in:'Barley malt',extra:[['Bucket of water',1],['Ale yeast',1]],out:'Dragon bitter',xp:347,rate:250},

    {cat:'Gnome Cooking',level:10,members:true,name:'Toad crunchies',in:'Crunchy tray',extra:[['Gianne dough',1],['Toad legs',2]],out:'Toad crunchies',xp:100,rate:700},
    {cat:'Gnome Cooking',level:25,members:true,name:'Worm crunchies',in:'Crunchy tray',extra:[['Gianne dough',1],['King worm',2]],out:'Worm crunchies',xp:120,rate:700},
    {cat:'Gnome Cooking',level:30,members:true,name:'Fruit batta',in:'Batta tin',extra:[['Gianne dough',1],['Pineapple chunks',1],['Lime chunks',1],['Orange chunks',1]],out:'Fruit batta',xp:150,rate:650},
    {cat:'Gnome Cooking',level:35,members:true,name:'Chocolate bomb',in:'Half baked bowl',extra:[['Chocolate bar',4],['Cream',1]],out:'Chocolate bomb',xp:190,rate:600},
    {cat:'Pies',level:1,members:false,name:'Pie shell',in:'Pastry dough',extra:[['Pie dish',1]],out:'Pie shell',xp:0,rate:2200},

    {cat:'Bread & Dough',level:1,members:false,name:'Bread dough',in:'Pot of flour',extra:[['Jug of water',1]],out:'Bread dough',xp:0,rate:1800},
    {cat:'Bread & Dough',level:1,members:false,name:'Bread',in:'Bread dough',out:'Bread',xp:40,rate:1400},
    {cat:'Bread & Dough',level:35,members:false,name:'Pizza base',in:'Pot of flour',extra:[['Jug of water',1]],out:'Pizza base',xp:0,rate:1800},
    {cat:'Bread & Dough',level:58,members:true,name:'Pitta dough',in:'Pot of flour',extra:[['Jug of water',1]],out:'Pitta dough',xp:0,rate:1800},
    {cat:'Bread & Dough',level:58,members:true,name:'Pitta bread',in:'Pitta dough',out:'Pitta bread',xp:40,rate:1400},


  ];
  const norm=s=>String(s||'').trim().toLowerCase();
  const price=(i,b)=>{const v=Number(i?.[b]);return Number.isFinite(v)&&v>0?v:null};
  const money=v=>v==null?'—':VTAM.money(Math.round(v));
  const num=v=>v==null?'—':VTAM.fmt(Math.round(v));
  const accessMatch=m=>VTAM.geAccess()==='all'||(VTAM.geAccess()==='f2p'&&!m.members)||(VTAM.geAccess()==='p2p'&&m.members);
  const inputBasis=()=>$('cookInputBasis')?.value||'high',outputBasis=()=>$('cookOutputBasis')?.value||'low';
  const success=()=>Math.max(0,Math.min(1,(Number($('cookSuccess')?.value)||0)/100));
  const scale=()=>Math.max(0,(Number($('cookRateScale')?.value)||100)/100);
  function hydrate(m){
    const input=byName.get(norm(m.in)),extras=(m.extra||[]).map(([name,qty])=>({name,qty,item:byName.get(norm(name))}));
    let inputCost=price(input,inputBasis()),missing=inputCost==null;
    extras.forEach(x=>{const p=price(x.item,inputBasis());if(p==null)missing=true;else inputCost=(inputCost||0)+p*x.qty});
    const out=byName.get(norm(m.out)),outUnit=price(out,outputBasis()),expectedOutput=outUnit==null?null:outUnit*success();
    const cost=missing?null:inputCost,profit=cost==null||expectedOutput==null?null:expectedOutput-cost;
    const actionsHr=Math.round(m.rate*scale()),xpHr=m.xp*actionsHr*success(),gpHr=profit==null?null:profit*actionsHr;
    return {...m,inputItem:input,outItem:out,extras,inputCost:cost,expectedOutput,profit,actionsHr,xpHr,gpHr};
  }
  function syncCategories(){
    const el=$('cookCategory');if(!el)return;const prev=el.value||'all',cats=[...new Set(methods.filter(accessMatch).map(m=>m.cat))];
    el.innerHTML='<option value="all">All Categories</option>'+cats.map(c=>`<option value="${c}">${c}</option>`).join('');
    el.value=cats.includes(prev)?prev:(cats.includes('Fish')?'Fish':'all');
  }
  function vis(){const o={};COLS.forEach(c=>o[c]=!!document.querySelector(`[data-cook-col="${c}"]`)?.checked);return o}
  function render(){
    if(!$('cookBody'))return;const q=norm($('cookSearch')?.value),cat=$('cookCategory')?.value||'all',v=vis();
    let rows=methods.filter(accessMatch).map(hydrate).filter(r=>(cat==='all'||r.cat===cat)&&(!q||norm(r.name+' '+r.in+' '+r.out).includes(q)));
    rows.sort((a,b)=>{let A=a[sortField],B=b[sortField];if(A==null)A=sortDir>0?Infinity:-Infinity;if(B==null)B=sortDir>0?Infinity:-Infinity;if(typeof A==='string'){A=A.toLowerCase();B=String(B).toLowerCase()}return(A>B?1:A<B?-1:0)*sortDir});
    $('cookCount').textContent=`${rows.length} methods`;
    $('cookBody').innerHTML=rows.map(r=>{const icon=r.outItem?VTAM.itemIconUrl(r.outItem.id):VTAM.path('assets/img/item-placeholder.svg');const allInputs=[{name:r.in,qty:1,item:r.inputItem},...r.extras];const inputHtml=allInputs.map(x=>{const i=x.item||byName.get(norm(x.name)),p=price(i,inputBasis()),icon=i?VTAM.itemIconUrl(i.id):VTAM.path('assets/img/item-placeholder.svg');return `<span class="smith-input-card"><img src="${icon}" alt=""><span><strong>${x.qty>1?x.qty+'× ':''}${x.name}</strong><small>${p==null?'No live price':money(p)+' ea'}</small></span></span>`}).join('');return `<tr><td class="right" data-col="level"${v.level?'':' hidden'}>${r.level}</td><td data-col="icon"${v.icon?'':' hidden'}><span class="alch-icon-slot"><img class="alch-item-icon" src="${icon}" alt=""></span></td><td><strong>${r.name}</strong><div class="craft-subline">${r.members?'Members':'F2P'} • ${r.cat}</div></td><td data-col="input"${v.input?'':' hidden'}><div class="smith-input-list">${inputHtml}</div></td><td class="right" data-col="inputCost"${v.inputCost?'':' hidden'}>${money(r.inputCost)}</td><td class="right" data-col="output"${v.output?'':' hidden'}>${money(r.expectedOutput)}</td><td class="right ${r.profit==null?'muted':r.profit>=0?'good':'bad'}" data-col="profit"${v.profit?'':' hidden'}>${money(r.profit)}</td><td class="right" data-col="xp"${v.xp?'':' hidden'}>${r.xp}</td><td class="right" data-col="xpHr"${v.xpHr?'':' hidden'}>${num(r.xpHr)}</td><td class="right ${r.gpHr==null?'muted':r.gpHr>=0?'good':'bad'}" data-col="gpHr"${v.gpHr?'':' hidden'}>${money(r.gpHr)}</td></tr>`}).join('')||'<tr><td colspan="10" class="center muted">No cooking methods match these filters.</td></tr>';
  }
  function status(state,title){const s=$('cookMarketStatus');if(!s)return;s.className=`bone-market-indicator${state?' '+state:''}`;s.title=title;s.setAttribute('aria-label',title)}
  function apply(data){market=Array.isArray(data)?data:[];byName=new Map(market.map(i=>[norm(i.name),i]));status('good','Live market connected');render()}
  function init(){
    if(!$('cookBody'))return;syncCategories();
    ['cookSearch','cookCategory','cookInputBasis','cookOutputBasis','cookSuccess','cookRateScale'].forEach(id=>$(id)?.addEventListener('input',render));
    document.querySelectorAll('[data-cook-col]').forEach(x=>x.addEventListener('change',render));
    document.querySelectorAll('#cookTable [data-sort]').forEach(th=>th.addEventListener('click',()=>{const f=th.dataset.sort;if(sortField===f)sortDir*=-1;else{sortField=f;sortDir=f==='name'?1:-1}render()}));
    window.addEventListener('vtam:ge-access-changed',()=>{syncCategories();render()});
    $('cookRefresh')?.addEventListener('click',()=>{status('','Refreshing market');VTAM.loadMarket(true).then(apply).catch(()=>status('bad','Market unavailable'))});
    status('','Connecting to live market');VTAM.loadMarket().then(apply).catch(()=>{status('bad','Market unavailable');render()});
  }
  return {init};
})();