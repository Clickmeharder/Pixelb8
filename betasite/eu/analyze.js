function parseGlobalMobName(line){
  // Most Entropia hunting globals use "killed a creature (Mob Name)".
  // Keep this deliberately creature-specific so mining/crafting globals
  // do not get mislabeled as mobs in the All Mob feed.
  const patterns=[
    /killed\s+(?:a\s+)?creature\s*\(([^)]+)\)/i,
    /defeated\s+(?:a\s+)?creature\s*\(([^)]+)\)/i,
    /killed\s+(?:a|an)\s+([^,(]+?)\s+(?:with|worth|for)\b/i,
    /defeated\s+(?:a|an)\s+([^,(]+?)\s+(?:with|worth|for)\b/i
  ];

  for(const pattern of patterns){
    const match=line.match(pattern);
    if(match?.[1]){
      return match[1]
        .replace(/\s+/g,' ')
        .replace(/[.!]+$/,'')
        .trim();
    }
  }

  // Guaranteed fallback for the six known event targets even when
  // a particular client log uses slightly different global wording.
  const lower=line.toLowerCase();
  const target=targetMobs.find(mob=>lower.includes(mob));
  if(target)return target;

  return null;
}

function parsePlayerName(line,mob){
  // Preserve the old fallback but try to extract a more complete name before common global verbs.
  const stripped=line.replace(/^\d{4}[-./]\d{1,2}[-./]\d{1,2}\s+\d{2}:\d{2}:\d{2}\s*/,'')
                     .replace(/\[[^\]]+\]/g,'')
                     .trim();
  const patterns=[
    /^(.*?)\s+(?:killed|defeated|has killed|has defeated|received|found|discovered|was awarded)\b/i,
    /^(.*?)\s+(?:scored|got|looted)\b/i
  ];
  for(const p of patterns){
    const m=stripped.match(p);
    if(m&&m[1].trim())return m[1].trim();
  }
  const parts=stripped.split(/\s+/);
  return parts.length?parts[0]:'Unknown';
}

function parseChatLog(content){
  const lines=content.split(/\r?\n/);
  const records=[];
  allMobHourlyStats=new Array(24).fill(0);
  const pedRegex=/([\d,]+\.?\d*)\s*PED/i;
  const timestampRegex=/^(\d{4}[-./]\d{1,2}[-./]\d{1,2})\s+(\d{2}:\d{2}:\d{2})/;

  for(let i=lines.length-1;i>=0;i--){
    const tm=lines[i].match(timestampRegex);
    if(tm){
      const parsed=new Date(tm[1].replace(/[\./]/g,'-')+'T'+tm[2]+'Z');
      if(!isNaN(parsed)){
        latestSyncedGameTime=parsed;
        document.getElementById('syncGameTimeDisplay').textContent=`${tm[1]} ${tm[2]}`;
        break;
      }
    }
  }

  for(const line of lines){
    const lower=line.toLowerCase();
    const tm=line.match(timestampRegex);
    const logDate=tm?new Date(tm[1].replace(/[\./]/g,'-')+'T'+tm[2]+'Z'):null;

    if(lower.includes('entropia universe time:')){
      const idx=lower.indexOf('entropia universe time:');
      const rawTime=line.slice(idx+'entropia universe time:'.length).trim();
      const normalized=rawTime.replace(/[\./]/g,'-').replace(' ','T');
      const parsedTime=new Date(/Z$|[+-]\d\d:?\d\d$/.test(normalized)?normalized:normalized+'Z');
      if(!isNaN(parsedTime)){
        latestSyncedGameTime=parsedTime;
        document.getElementById('syncGameTimeDisplay').textContent=rawTime;
      }
    }

    const isGlobalLine=lower.includes('[globals]')||lower.includes('global')||lower.includes('hall of fame');
    if(isGlobalLine&&logDate&&!isNaN(logDate))allMobHourlyStats[logDate.getHours()]++;

    if(!isGlobalLine)continue;
    const mob=parseGlobalMobName(line);
    if(!mob)continue;
    const pedMatch=line.match(pedRegex);
    const pedVal=pedMatch?parseFloat(pedMatch[1].replace(/,/g,'')):0;
    const isHof=lower.includes('hall of fame')||lower.includes('hof');
    const player=parsePlayerName(line,mob);
    records.push({mob,date:logDate,ped:pedVal,isHof,hour:logDate?logDate.getHours():0,player,raw:line});
  }

  globalParsedData=records;
  updateAnalyticsDisplay();
  updateScheduleDisplay();
  evaluateUserGlobals();
  setConnectionStatus('Live',true);
}

function evaluateUserGlobals(){
  if(!globalParsedData||!userAvatarName){
    firstUserGlobalTime=null;
    userEventGlobalPed=0;
    userEventHofPed=0;
    userEventTotalLoot=0;

    document.getElementById('userGlobalCount').textContent='0';
    document.getElementById('userHofCount').textContent='0';
    updateUserEventLiveSummary(0,0);
    resetTimerDisplay();
    return;
  }

  let globals=0,hofs=0,earliest=null;
  let globalPed=0,hofPed=0;

  for(const rec of globalParsedData){
    if((rec.player||'').toLowerCase()!==userAvatarName)continue;
    if(!rec.date||isNaN(rec.date))continue;
    if(rec.date<eventStart||rec.date>eventEnd)continue;

    const ped=Number(rec.ped)||0;

    if(rec.isHof){
      hofs++;
      hofPed+=ped;
    }else{
      globals++;
      globalPed+=ped;
    }

    if(!earliest||rec.date<earliest)earliest=rec.date;
  }

  userEventGlobalPed=globalPed;
  userEventHofPed=hofPed;
  userEventTotalLoot=globalPed+hofPed;

  document.getElementById('userGlobalCount').textContent=globals;
  document.getElementById('userHofCount').textContent=hofs;
  updateUserEventLiveSummary(globals,hofs);

  firstUserGlobalTime=earliest;
  if(firstUserGlobalTime)startTimerCountdown();else resetTimerDisplay();
}

function renderScheduleTable(hourlyStats,currentH){
  const tbody=document.getElementById('scheduleTableBody');
  if(!tbody)return;
  tbody.innerHTML='';
  const maxPerHour=Math.max(1,...hourlyStats.map(x=>x.total));

  for(let h=0;h<24;h++){
    const hourStat=hourlyStats[h];
    const mobs=Object.entries(hourStat.mobs||{})
      .map(([mob,count])=>({mob,count}))
      .sort((a,b)=>b.count-a.count||a.mob.localeCompare(b.mob));
    const top=mobs[0]||{mob:'—',count:0};
    const alt=mobs[1]||{mob:'—',count:0};
    const activity=Math.round((hourStat.total/maxPerHour)*100);
    const tr=document.createElement('tr');
    if(h===currentH)tr.classList.add('current-row');
    tr.innerHTML=`
      <td><b>${String(h).padStart(2,'0')}:00–${String((h+1)%24).padStart(2,'0')}:00</b></td>
      <td class="mob-name">${top.count?escapeHtml(top.mob)+' · '+top.count:'Low activity'}</td>
      <td>${hourStat.total}</td>
      <td class="muted">${alt.count?escapeHtml(alt.mob)+' · '+alt.count:'—'}</td>
      <td>
        <div style="display:flex;align-items:center;gap:6px">
          <div style="width:70px;height:6px;border-radius:99px;background:#081522;border:1px solid var(--border);overflow:hidden">
            <div style="height:100%;width:${activity}%;background:var(--accent)"></div>
          </div>
          <span class="muted">${activity}%</span>
        </div>
      </td>`;
    tbody.appendChild(tr);
  }

  const currentRow=tbody.querySelector('.current-row');
  if(currentRow)requestAnimationFrame(()=>currentRow.scrollIntoView({block:'nearest'}));
}

function renderHeatmaps(hourlyStats,currentH){
  const targetGrid=document.getElementById('heatmapGrid');
  const allGrid=document.getElementById('heatmapGridAll');
  if(targetGrid)targetGrid.innerHTML='';
  if(allGrid)allGrid.innerHTML='';

  const totals=hourlyStats.map(x=>Number(x?.total)||0);
  const maxAll=Math.max(1,...totals);
  let allPeak=0,allPeakCount=-1;

  for(let h=0;h<24;h++){
    const count=totals[h]||0;
    if(count>allPeakCount){allPeakCount=count;allPeak=h}
    if(allGrid)allGrid.appendChild(makeHeatCell(h,count,maxAll,'all',h===currentH));
    // Keep legacy target heatmap safe if an older layout still contains it.
    if(targetGrid)targetGrid.appendChild(makeHeatCell(h,count,maxAll,'all',h===currentH));
  }

  const targetPeakLabel=document.getElementById('targetPeakLabel');
  if(targetPeakLabel)targetPeakLabel.textContent=allPeakCount>0?`Peak ${String(allPeak).padStart(2,'0')}:00 · ${allPeakCount}`:'No data';
  const allPeakLabel=document.getElementById('allPeakLabel');
  if(allPeakLabel)allPeakLabel.textContent=allPeakCount>0?`Peak ${String(allPeak).padStart(2,'0')}:00 · ${allPeakCount}`:'No data';
}

function renderCurrentHourBreakdown(hourData,currentH){
  const box=document.getElementById('currentHourBreakdown');
  if(!box)return;
  const sorted=Object.entries(hourData?.mobs||{})
    .map(([mob,count])=>({mob,count}))
    .sort((a,b)=>b.count-a.count||a.mob.localeCompare(b.mob))
    .slice(0,10);
  const max=Math.max(1,...sorted.map(x=>x.count));

  if(!sorted.length){
    box.innerHTML=`<div class="empty">No creature globals recorded for ${String(currentH).padStart(2,'0')}:00 UTC in the current analysis window.</div>`;
    return;
  }

  box.innerHTML=sorted.map(x=>{
    const pct=Math.round((x.count/max)*100);
    return `
      <div style="display:grid;grid-template-columns:minmax(110px,1.2fr) 1fr 32px;gap:7px;align-items:center;margin-bottom:7px">
        <div style="font-size:.67rem;text-transform:uppercase;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escapeHtml(x.mob)}">${escapeHtml(x.mob)}</div>
        <div style="height:7px;background:#081522;border-radius:99px;overflow:hidden;border:1px solid var(--border)">
          <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--accent),var(--success))"></div>
        </div>
        <div style="font-size:.7rem;text-align:right;color:var(--muted)">${x.count}</div>
      </div>`;
  }).join('')+
  `<div style="border-top:1px solid var(--border);padding-top:7px;margin-top:3px;font-size:.68rem;color:var(--muted)">
    ${String(currentH).padStart(2,'0')}:00 total: <b style="color:var(--text)">${hourData.total}</b>
    · HOFs: <b class="hof">${hourData.hofs}</b>
    · PED: <b class="success">${hourData.ped.toFixed(2)}</b>
  </div>`;
}

function updateScheduleDisplay(){
  const body=document.getElementById('scheduleTableBody');
  const start=typeof activitySessionStartedAt!=='undefined'?activitySessionStartedAt:new Date();
  const records=(globalParsedData||[]).filter(rec=>{
    const d=typeof getCapturedRecordDate==='function'?getCapturedRecordDate(rec):(rec.date instanceof Date?rec.date:new Date(rec.date));
    return d&&!Number.isNaN(d.getTime())&&d>=start;
  }).sort((a,b)=>{
    const ad=typeof getCapturedRecordDate==='function'?getCapturedRecordDate(a):a.date;
    const bd=typeof getCapturedRecordDate==='function'?getCapturedRecordDate(b):b.date;
    return (bd?.getTime?.()||0)-(ad?.getTime?.()||0);
  });

  if(typeof updateCapturedFreshnessUI==='function')updateCapturedFreshnessUI();
  const source=typeof currentSourceLabel==='function'?currentSourceLabel():'Live source';
  const status=document.getElementById('activitySessionStatus');
  if(status)status.textContent=/Live/i.test(source)?source:'Waiting for live data';

  const globals=records.length;
  const hofs=records.filter(r=>r.isHof);
  const ped=records.reduce((sum,r)=>sum+(Number(r.ped)||0),0);
  const hofPed=hofs.reduce((sum,r)=>sum+(Number(r.ped)||0),0);
  const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
  set('sessionGlobalCount',globals.toLocaleString());
  set('sessionGlobalSub',globals?`${new Set(records.map(r=>r.mob).filter(Boolean)).size} mobs observed this session`:'No globals captured this session');
  set('sessionHofCount',hofs.length.toLocaleString());
  set('sessionHofSub',`${hofPed.toFixed(2)} PED in HOFs`);
  set('sessionGlobalPed',ped.toFixed(2));
  set('sessionRecordCount',`${globals.toLocaleString()} ${globals===1?'record':'records'}`);

  const latest=records[0];
  if(latest){
    const d=typeof getCapturedRecordDate==='function'?getCapturedRecordDate(latest):latest.date;
    set('sessionLatestTime',d?formatDateTimeUTCish(d):'—');
    set('sessionLatestMob',`${latest.mob||'Unknown'} · ${latest.player||'Unknown'} · ${(Number(latest.ped)||0).toFixed(2)} PED${latest.isHof?' HOF':''}`);
  }else{
    set('sessionLatestTime','—');
    set('sessionLatestMob',/Live/i.test(source)?'Live source connected · waiting for a new global/HOF':'No active live session');
  }

  if(body){
    if(!records.length){
      body.innerHTML=`<tr><td colspan="5" class="empty">${/Live/i.test(source)?'Live source connected. No globals/HOFs captured during this session yet.':'No active live source. History and Analytics remain available from previously captured data.'}</td></tr>`;
    }else{
      body.innerHTML=records.slice(0,150).map(rec=>{
        const d=typeof getCapturedRecordDate==='function'?getCapturedRecordDate(rec):rec.date;
        return `<tr><td>${escapeHtml(formatDateTimeUTCish(d))}</td><td>${escapeHtml(rec.player||'Unknown')}</td><td><b class="analytics-mob-name">${escapeHtml(rec.mob||'Unknown')}</b></td><td class="analytics-number ${rec.isHof?'hof':'success'}">${(Number(rec.ped)||0).toFixed(2)}</td><td>${rec.isHof?'<span class="history-type hof">HOF</span>':'<span class="history-type">Global</span>'}</td></tr>`;
      }).join('');
    }
  }
  syncStreamerHud?.();
}


function trackerRecordWithinAnalysisWindow(record){
  const explicitStart=trackerOptions?.analysisStartUtc ? utcInputToDate(trackerOptions.analysisStartUtc) : null;
  const end=trackerOptions?.analysisEndUtc ? utcInputToDate(trackerOptions.analysisEndUtc) : null;
  const reference=new Date();
  const lookbackStart=getAnalysisReadCutoff(reference);
  const start=explicitStart && lookbackStart
    ?(explicitStart>lookbackStart?explicitStart:lookbackStart)
    :(explicitStart||lookbackStart);

  const when=record?.date || record?.timestamp || record?.time;
  const date=when instanceof Date ? when : (when ? new Date(when) : null);
  if(!date || Number.isNaN(date.getTime()))return true;
  if(start && date<start)return false;
  if(end && date>=end)return false;
  return true;
}

function trackerSelectedTarget(record){
  const mob=String(record?.mob||'').toLowerCase();
  return targetMobs.some(target=>mob.includes(target));
}
