window.CraftingTool = (() => {
  const $=id=>document.getElementById(id);
  let market=[], byName=new Map(), sortField='profit', sortDir=-1;
  const COLS=['level','icon','method','inputs','inputCost','output','profit','xp','gpXp','actionsHr','xpHr','gpHr'];
  const recipes=[
    // F2P jewellery
    {cat:'Jewellery',level:5,members:false,name:'Gold ring',out:'Gold ring',xp:15,rate:1050,in:[['Gold bar',1]]},
    {cat:'Jewellery',level:6,members:false,name:'Gold necklace',out:'Gold necklace',xp:20,rate:1050,in:[['Gold bar',1]]},
    {cat:'Jewellery',level:7,members:true,name:'Gold bracelet',out:'Gold bracelet',xp:25,rate:1200,in:[['Gold bar',1]]},
    {cat:'Jewellery',level:8,members:false,name:'Gold amulet (u)',out:'Gold amulet (u)',xp:30,rate:1050,in:[['Gold bar',1]]},
    {cat:'Jewellery',level:20,members:false,name:'Sapphire ring',out:'Sapphire ring',xp:40,rate:1050,in:[['Gold bar',1],['Sapphire',1]]},
    {cat:'Jewellery',level:22,members:false,name:'Sapphire necklace',out:'Sapphire necklace',xp:55,rate:1050,in:[['Gold bar',1],['Sapphire',1]]},
    {cat:'Jewellery',level:23,members:true,name:'Sapphire bracelet',out:'Sapphire bracelet',xp:60,rate:1200,in:[['Gold bar',1],['Sapphire',1]]},
    {cat:'Jewellery',level:24,members:false,name:'Sapphire amulet (u)',out:'Sapphire amulet (u)',xp:65,rate:1050,in:[['Gold bar',1],['Sapphire',1]]},
    {cat:'Jewellery',level:27,members:false,name:'Emerald ring',out:'Emerald ring',xp:55,rate:1050,in:[['Gold bar',1],['Emerald',1]]},
    {cat:'Jewellery',level:29,members:false,name:'Emerald necklace',out:'Emerald necklace',xp:60,rate:1050,in:[['Gold bar',1],['Emerald',1]]},
    {cat:'Jewellery',level:30,members:true,name:'Emerald bracelet',out:'Emerald bracelet',xp:65,rate:1200,in:[['Gold bar',1],['Emerald',1]]},
    {cat:'Jewellery',level:31,members:false,name:'Emerald amulet (u)',out:'Emerald amulet (u)',xp:70,rate:1050,in:[['Gold bar',1],['Emerald',1]]},
    {cat:'Jewellery',level:34,members:false,name:'Ruby ring',out:'Ruby ring',xp:70,rate:1050,in:[['Gold bar',1],['Ruby',1]]},
    {cat:'Jewellery',level:40,members:false,name:'Ruby necklace',out:'Ruby necklace',xp:75,rate:1050,in:[['Gold bar',1],['Ruby',1]]},
    {cat:'Jewellery',level:42,members:true,name:'Ruby bracelet',out:'Ruby bracelet',xp:80,rate:1200,in:[['Gold bar',1],['Ruby',1]]},
    {cat:'Jewellery',level:50,members:false,name:'Ruby amulet (u)',out:'Ruby amulet (u)',xp:85,rate:1050,in:[['Gold bar',1],['Ruby',1]]},
    {cat:'Jewellery',level:43,members:false,name:'Diamond ring',out:'Diamond ring',xp:85,rate:1050,in:[['Gold bar',1],['Diamond',1]]},
    {cat:'Jewellery',level:56,members:false,name:'Diamond necklace',out:'Diamond necklace',xp:90,rate:1050,in:[['Gold bar',1],['Diamond',1]]},
    {cat:'Jewellery',level:58,members:true,name:'Diamond bracelet',out:'Diamond bracelet',xp:95,rate:1200,in:[['Gold bar',1],['Diamond',1]]},
    {cat:'Jewellery',level:70,members:false,name:'Diamond amulet (u)',out:'Diamond amulet (u)',xp:100,rate:1050,in:[['Gold bar',1],['Diamond',1]]},

    // Silver crafting
    {cat:'Silver',level:16,members:false,name:'Unstrung symbol',out:'Unstrung symbol',xp:50,rate:1050,in:[['Silver bar',1]]},
    {cat:'Silver',level:17,members:true,name:'Unstrung emblem',out:'Unstrung emblem',xp:50,rate:1050,in:[['Silver bar',1]]},
    {cat:'Silver',level:18,members:true,name:'Silver sickle',out:'Silver sickle',xp:50,rate:1050,in:[['Silver bar',1]]},
    {cat:'Silver',level:21,members:true,name:'Silver bolts (unf)',out:'Silver bolts (unf)',outQty:10,xp:50,rate:1050,in:[['Silver bar',1]]},
    {cat:'Silver',level:23,members:false,name:'Tiara',out:'Tiara',xp:52.5,rate:1050,in:[['Silver bar',1]]},

    // Pottery (full shaping + firing cycle)
    {cat:'Pottery',level:1,members:false,name:'Pot',out:'Pot',xp:12.6,rate:600,in:[['Soft clay',1]]},
    {cat:'Pottery',level:3,members:true,name:'Empty cup',out:'Empty cup',outQty:4,xp:17,rate:600,in:[['Soft clay',1]]},
    {cat:'Pottery',level:7,members:false,name:'Pie dish',out:'Pie dish',xp:25,rate:600,in:[['Soft clay',1]]},
    {cat:'Pottery',level:8,members:false,name:'Bowl',out:'Bowl',xp:33,rate:600,in:[['Soft clay',1]]},
    {cat:'Pottery',level:19,members:true,name:'Empty plant pot',out:'Empty plant pot',xp:37.5,rate:600,in:[['Soft clay',1]]},
    {cat:'Pottery',level:25,members:true,name:'Pot lid',out:'Pot lid',xp:40,rate:600,in:[['Soft clay',1]]},

    // Gem cutting
    {cat:'Gem Cutting',level:20,members:false,name:'Cut sapphire',out:'Sapphire',xp:50,rate:2700,in:[['Uncut sapphire',1]]},
    {cat:'Gem Cutting',level:27,members:false,name:'Cut emerald',out:'Emerald',xp:67.5,rate:2700,in:[['Uncut emerald',1]]},
    {cat:'Gem Cutting',level:34,members:false,name:'Cut ruby',out:'Ruby',xp:85,rate:2700,in:[['Uncut ruby',1]]},
    {cat:'Gem Cutting',level:43,members:false,name:'Cut diamond',out:'Diamond',xp:107.5,rate:2700,in:[['Uncut diamond',1]]},
    {cat:'Gem Cutting',level:55,members:true,name:'Cut dragonstone',out:'Dragonstone',xp:137.5,rate:2700,in:[['Uncut dragonstone',1]]},
    {cat:'Gem Cutting',level:67,members:true,name:'Cut onyx',out:'Onyx',xp:167.5,rate:2700,in:[['Uncut onyx',1]]},
    {cat:'Gem Cutting',level:89,members:true,name:'Cut zenyte',out:'Zenyte',xp:200,rate:2700,in:[['Uncut zenyte',1]]},

    // F2P leather
    {cat:'Leather',level:1,members:false,name:'Leather gloves',out:'Leather gloves',xp:13.8,rate:1400,in:[['Leather',1]]},
    {cat:'Leather',level:7,members:false,name:'Leather boots',out:'Leather boots',xp:16.25,rate:1400,in:[['Leather',1]]},
    {cat:'Leather',level:9,members:false,name:'Leather cowl',out:'Leather cowl',xp:18.5,rate:1400,in:[['Leather',1]]},
    {cat:'Leather',level:11,members:false,name:'Leather vambraces',out:'Leather vambraces',xp:22,rate:1400,in:[['Leather',1]]},
    {cat:'Leather',level:14,members:false,name:'Leather body',out:'Leather body',xp:25,rate:1400,in:[['Leather',1]]},
    {cat:'Leather',level:18,members:false,name:'Leather chaps',out:'Leather chaps',xp:27,rate:1400,in:[['Leather',1]]},
    {cat:'Leather',level:28,members:false,name:'Hardleather body',out:'Hardleather body',xp:35,rate:2600,in:[['Hard leather',1]]},
    {cat:'Leather',level:38,members:true,name:'Coif',out:'Coif',xp:37,rate:1400,in:[['Leather',1]]},

    // Stringing amulets (F2P; 4 Crafting XP each)
    {cat:'Stringing',level:1,members:false,name:'String gold amulet',out:'Gold amulet',xp:4,rate:2500,in:[['Gold amulet (u)',1],['Ball of wool',1]]},
    {cat:'Stringing',level:1,members:false,name:'String sapphire amulet',out:'Sapphire amulet',xp:4,rate:2500,in:[['Sapphire amulet (u)',1],['Ball of wool',1]]},
    {cat:'Stringing',level:1,members:false,name:'String emerald amulet',out:'Emerald amulet',xp:4,rate:2500,in:[['Emerald amulet (u)',1],['Ball of wool',1]]},
    {cat:'Stringing',level:1,members:false,name:'String ruby amulet',out:'Ruby amulet',xp:4,rate:2500,in:[['Ruby amulet (u)',1],['Ball of wool',1]]},
    {cat:'Stringing',level:1,members:false,name:'String diamond amulet',out:'Diamond amulet',xp:4,rate:2500,in:[['Diamond amulet (u)',1],['Ball of wool',1]]},

    // Molten glass production
    {cat:'Molten Glass',level:1,members:false,name:'Molten glass — Furnace',out:'Molten glass',xp:20,rate:2200,in:[['Soda ash',1],['Bucket of sand',1]]},
    {cat:'Molten Glass',level:77,members:true,name:'Molten glass — Superglass Make (soda ash)',out:'Molten glass',outQty:1.3,xp:10,rate:10000,in:[['Soda ash',1],['Bucket of sand',1],['Astral rune',2/18],['Fire rune',6/18],['Air rune',10/18]]},
    {cat:'Molten Glass',level:77,members:true,name:'Molten glass — Giant seaweed (leave overflow)',out:'Molten glass',outQty:26.1,xp:180,rate:575,in:[['Giant seaweed',3],['Bucket of sand',18],['Astral rune',2],['Fire rune',6],['Air rune',10]]},
    {cat:'Molten Glass',level:77,members:true,name:'Molten glass — Giant seaweed (pick up overflow)',out:'Molten glass',outQty:28.8,xp:180,rate:469,in:[['Giant seaweed',3],['Bucket of sand',18],['Astral rune',2],['Fire rune',6],['Air rune',10]]},

    // Glassblowing (members)
    {cat:'Glass',level:1,members:true,name:'Beer glass',out:'Beer glass',xp:17.5,rate:1800,in:[['Molten glass',1]]},
    {cat:'Glass',level:4,members:true,name:'Empty candle lantern',out:'Empty candle lantern',xp:19,rate:1800,in:[['Molten glass',1]]},
    {cat:'Glass',level:12,members:true,name:'Empty oil lamp',out:'Empty oil lamp',xp:25,rate:1800,in:[['Molten glass',1]]},
    {cat:'Glass',level:33,members:true,name:'Vial',out:'Vial',xp:35,rate:1800,in:[['Molten glass',1]]},
    {cat:'Glass',level:42,members:true,name:'Empty fishbowl',out:'Empty fishbowl',xp:42.5,rate:1800,in:[['Molten glass',1]]},
    {cat:'Glass',level:46,members:true,name:'Unpowered orb',out:'Unpowered orb',xp:52.5,rate:1800,in:[['Molten glass',1]]},
    {cat:'Glass',level:49,members:true,name:'Lantern lens',out:'Lantern lens',xp:55,rate:1800,in:[['Molten glass',1]]},
    {cat:'Glass',level:87,members:true,name:'Empty light orb',out:'Empty light orb',xp:70,rate:1750,in:[['Molten glass',1]]},

    // Battlestaves
    {cat:'Battlestaves',level:54,members:true,name:'Water battlestaff',out:'Water battlestaff',xp:100,rate:2450,in:[['Battlestaff',1],['Water orb',1]]},
    {cat:'Battlestaves',level:58,members:true,name:'Earth battlestaff',out:'Earth battlestaff',xp:112.5,rate:2450,in:[['Battlestaff',1],['Earth orb',1]]},
    {cat:'Battlestaves',level:62,members:true,name:'Fire battlestaff',out:'Fire battlestaff',xp:125,rate:2450,in:[['Battlestaff',1],['Fire orb',1]]},
    {cat:'Battlestaves',level:66,members:true,name:'Air battlestaff',out:'Air battlestaff',xp:137.5,rate:2450,in:[['Battlestaff',1],['Air orb',1]]},

    // Dragonhide bodies
    {cat:'Dragonhide',level:63,members:true,name:"Green d'hide body",out:"Green d'hide body",xp:186,rate:1650,in:[["Green dragon leather",3]]},
    {cat:'Dragonhide',level:71,members:true,name:"Blue d'hide body",out:"Blue d'hide body",xp:210,rate:1650,in:[["Blue dragon leather",3]]},
    {cat:'Dragonhide',level:77,members:true,name:"Red d'hide body",out:"Red d'hide body",xp:234,rate:1650,in:[["Red dragon leather",3]]},
    {cat:'Dragonhide',level:84,members:true,name:"Black d'hide body",out:"Black d'hide body",xp:258,rate:1650,in:[["Black dragon leather",3]]}
  ];
  const norm=s=>String(s||'').trim().toLowerCase();
  const price=(item,basis)=>{if(!item)return null;const v=Number(item[basis]);return Number.isFinite(v)&&v>0?v:null};
  const inputBasis=()=> $('craftInputBasis')?.value||'high';
  const outputBasis=()=> $('craftOutputBasis')?.value||'low';
  const rateScale=()=> Math.max(0,(Number($('craftRateScale')?.value)||100)/100);
  function hydrate(r){
    const out=byName.get(norm(r.out)); let inputCost=0,missing=false;
    const inputs=r.in.map(([name,qty])=>{const item=byName.get(norm(name)),p=price(item,inputBasis());if(p==null)missing=true;else inputCost+=p*qty;return {name,qty,item,p,lineCost:p==null?null:p*qty};});
    const outQty=Math.max(1,Number(r.outQty)||1),outUnitPrice=price(out,outputBasis()),outPrice=outUnitPrice==null?null:outUnitPrice*outQty; if(outPrice==null)missing=true;
    const profit=missing?null:outPrice-inputCost, gpXp=profit==null?null:profit/r.xp, actionsHr=Math.round(r.rate*rateScale()), xpHr=r.xp*actionsHr, gpHr=profit==null?null:profit*actionsHr;
    return {...r,outItem:out,inputs,inputCost:missing&&inputs.some(x=>x.p==null)?null:inputCost,outQty,outUnitPrice,outPrice,profit,gpXp,actionsHr,xpHr,gpHr};
  }
  const money=v=>v==null?'—':VTAM.money(Math.round(v));
  const num=v=>v==null?'—':VTAM.fmt(Math.round(v));
  const decimal=v=>v==null?'—':(Math.round(v*100)/100).toFixed(2);
  function visibleColumns(){const out={};COLS.forEach(c=>{const el=document.querySelector(`[data-craft-col="${c}"]`);out[c]=!!el?.checked});return out}
  function applyColumnVisibility(){const vis=visibleColumns();COLS.forEach(c=>document.querySelectorAll(`#craftTable [data-col="${c}"]`).forEach(el=>el.hidden=!vis[c]));}
  function accessMatches(r){
    const access=VTAM.geAccess();return access==='all'||(access==='f2p'&&!r.members)||(access==='p2p'&&r.members);
  }
  function syncCategories(initial=false){
    const cat=$('craftCategory');if(!cat)return;
    const prev=cat.value||'all',cats=[...new Set(recipes.filter(accessMatches).map(r=>r.cat))];
    cat.innerHTML='<option value="all">All Categories</option>'+cats.map(c=>`<option value="${c}">${c}</option>`).join('');
    if(initial&&cats.includes('Jewellery'))cat.value='Jewellery';
    else cat.value=cats.includes(prev)?prev:'all';
  }
  function filteredRows(){
    const q=norm($('craftSearch')?.value), access=VTAM.geAccess(), cat=$('craftCategory')?.value||'all', minProfitRaw=$('craftMinProfit')?.value?.trim()??'', minProfit=minProfitRaw===''?null:Number(minProfitRaw);
    let rows=recipes.map(hydrate).filter(r=>(!q||norm(r.name+' '+r.cat+' '+r.in.map(x=>x[0]).join(' ')).includes(q))&&(access==='all'||(access==='f2p'&&!r.members)||(access==='p2p'&&r.members))&&(cat==='all'||r.cat===cat));
    if(minProfit!==null&&Number.isFinite(minProfit))rows=rows.filter(r=>r.profit!=null&&r.profit>=minProfit);
    return rows;
  }
  function inputCell(x){
    if(!x)return '';
    const icon=x.item?VTAM.itemIconUrl(x.item.id):VTAM.path('assets/img/item-placeholder.svg');
    const line=x.p==null?null:x.p*x.qty;
    return `<span class="smith-input-card"><img src="${icon}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${VTAM.path('assets/img/item-placeholder.svg')}'"><span><strong>${x.qty>1?x.qty+'× ':''}${x.name}</strong><small>${x.p==null?'No live price':`${money(x.p)} ea${x.qty>1?` • ${money(line)} total`:''}`}</small></span></span>`;
  }
  function relevantMaterials(rows){
    const map=new Map();
    const add=(name,count=0,context=false,order=999)=>{
      const key=norm(name),item=byName.get(key);
      if(!map.has(key))map.set(key,{name,item,count,context,order});
      else{const m=map.get(key);m.count+=count;m.context=m.context||context;m.order=Math.min(m.order,order);if(!m.item&&item)m.item=item}
    };
    rows.forEach(r=>r.inputs.forEach(x=>add(x.name,1,false,999)));
    const glassVisible=rows.some(r=>r.cat==='Glass');
    if(glassVisible){
      add('Soda ash',0,true,1);
      add('Bucket of sand',0,true,2);
      add('Molten glass',0,true,3);
    }
    return [...map.values()].sort((a,b)=>{
      if(glassVisible){
        const ao=a.order<999?a.order:999,bo=b.order<999?b.order:999;
        if(ao!==bo)return ao-bo;
      }
      return Number(a.context)-Number(b.context)||b.count-a.count||a.name.localeCompare(b.name);
    });
  }
  function renderMaterials(rows){
    const tray=$('craftMaterialTray'),grid=$('craftMaterialGrid'),toggle=$('craftMaterialToggle');
    if(!tray||!grid||!toggle)return;
    const open=toggle.getAttribute('aria-pressed')==='true';
    tray.hidden=!open;
    if(!open)return;
    const mats=relevantMaterials(rows), shown=mats.slice(0,16);
    const bucket=byName.get(norm('Bucket')),bucketHigh=price(bucket,'high'),bucketLow=price(bucket,'low');
    grid.innerHTML=shown.map(m=>{
      const i=m.item,icon=i?VTAM.itemIconUrl(i.id):VTAM.path('assets/img/item-placeholder.svg');
      const hi=price(i,'high'),lo=price(i,'low');
      const bucketCost=m.name==='Bucket of sand'?`<small class="craft-material-container-cost">Empty bucket H ${money(bucketHigh)} • L ${money(bucketLow)}</small>`:'';
      const context=m.context?'<span class="craft-material-chain-tag">chain</span>':'';
      return `<div class="craft-material-card"><img src="${icon}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${VTAM.path('assets/img/item-placeholder.svg')}'"><div><strong>${m.name}${context}</strong><small>H ${money(hi)} • L ${money(lo)}</small>${bucketCost}</div></div>`;
    }).join('')+(mats.length>16?`<div class="craft-material-more">+${mats.length-16} more<br><small>Narrow category/search to focus materials</small></div>`:'');
    if(!mats.length)grid.innerHTML='<span class="muted">No materials match the current filters.</span>';
  }
  function render(){
    if(!$('craftBody'))return;
    const vis=visibleColumns();
    let rows=filteredRows();
    rows.sort((a,b)=>{let A=a[sortField],B=b[sortField];if(A==null)A=sortDir>0?Infinity:-Infinity;if(B==null)B=sortDir>0?Infinity:-Infinity;if(typeof A==='string'){A=A.toLowerCase();B=String(B).toLowerCase()}return(A>B?1:A<B?-1:0)*sortDir});
    $('craftCount').textContent=`${rows.length} methods`;
    const cells=r=>{
      const icon=r.outItem?VTAM.itemIconUrl(r.outItem.id):VTAM.path('assets/img/item-placeholder.svg');
      const ingredients=r.inputs.map(x=>`${x.qty!==1?(Number.isInteger(x.qty)?x.qty:(Math.round(x.qty*100)/100))+'× ':''}${x.name}`).join(' + ');
      return [
        `<td class="right" data-col="level"${vis.level?'':' hidden'}>${r.level}</td>`,
        `<td data-col="icon"${vis.icon?'':' hidden'}><span class="alch-icon-slot"><img class="alch-item-icon" src="${icon}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${VTAM.path('assets/img/item-placeholder.svg')}'"></span></td>`,
        `<td data-col="method"${vis.method?'':' hidden'}><strong>${r.name}</strong><div class="craft-subline">${r.members?'Members':'F2P'} • ${r.cat}</div></td>`,
        `<td class="craft-inputs" data-col="inputs"${vis.inputs?'':' hidden'}><div class="smith-input-list">${r.inputs.map(inputCell).join('')}</div></td>`,
        `<td class="right" data-col="inputCost"${vis.inputCost?'':' hidden'}>${money(r.inputCost)}</td>`,
        `<td class="right" data-col="output"${vis.output?'':' hidden'}>${money(r.outPrice)}</td>`,
        `<td class="right ${r.profit==null?'muted':r.profit>=0?'good':'bad'}" data-col="profit"${vis.profit?'':' hidden'}>${money(r.profit)}</td>`,
        `<td class="right" data-col="xp"${vis.xp?'':' hidden'}>${r.xp}</td>`,
        `<td class="right ${r.gpXp==null?'muted':r.gpXp>=0?'good':'bad'}" data-col="gpXp"${vis.gpXp?'':' hidden'}>${decimal(r.gpXp)}</td>`,
        `<td class="right" data-col="actionsHr"${vis.actionsHr?'':' hidden'}>${num(r.actionsHr)}</td>`,
        `<td class="right" data-col="xpHr"${vis.xpHr?'':' hidden'}>${num(r.xpHr)}</td>`,
        `<td class="right ${r.gpHr==null?'muted':r.gpHr>=0?'good':'bad'}" data-col="gpHr"${vis.gpHr?'':' hidden'}>${money(r.gpHr)}</td>`
      ].join('');
    };
    const visibleCount=COLS.filter(c=>vis[c]).length;
    $('craftBody').innerHTML=rows.map(r=>`<tr>${cells(r)}</tr>`).join('')||`<tr><td colspan="${visibleCount}" class="center muted">No crafting methods match these filters.</td></tr>`;
    applyColumnVisibility();
    renderMaterials(rows);
  }
  function setMarketStatus(state,title){
    const s=$('craftMarketStatus');if(!s)return;
    s.className=`bone-market-indicator${state?' '+state:''}`;
    s.title=title;s.setAttribute('aria-label',title);
  }
  function applyMarket(data){market=Array.isArray(data)?data:[];byName=new Map(market.map(i=>[norm(i.name),i]));setMarketStatus('good','Live market connected');render()}
  function init(){
    if(!$('craftBody'))return;
    const cat=$('craftCategory');syncCategories(true);
    ['craftSearch','craftCategory','craftInputBasis','craftOutputBasis','craftRateScale','craftMinProfit'].forEach(id=>$(id)?.addEventListener('input',render));
    document.querySelectorAll('#craftTable [data-sort]').forEach(th=>th.addEventListener('click',()=>{const f=th.dataset.sort;if(sortField===f)sortDir*=-1;else{sortField=f;sortDir=f==='name'?1:-1}render()}));
    document.querySelectorAll('[data-craft-col]').forEach(box=>box.addEventListener('change',()=>{applyColumnVisibility();render()}));
    $('craftMaterialToggle')?.addEventListener('click',()=>{const b=$('craftMaterialToggle'),next=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(next));render()});
    $('craftRefresh')?.addEventListener('click',()=>{setMarketStatus('','Refreshing market');VTAM.loadMarket(true).then(applyMarket).catch(()=>{setMarketStatus('bad','Market unavailable');render()})});
    window.addEventListener('vtam:ge-access-changed',()=>{syncCategories(false);render()});
    window.addEventListener('vtam:market',e=>applyMarket(e.detail),{once:true});
    setMarketStatus('','Connecting to live market');
    VTAM.loadMarket().then(applyMarket).catch(()=>{setMarketStatus('bad','Market unavailable');render()});
  }
  return {init};
})();
