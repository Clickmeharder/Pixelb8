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
      const parsed=new Date(tm[1].replace(/[\./]/g,'-')+'T'+tm[2]);
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
    const logDate=tm?new Date(tm[1].replace(/[\./]/g,'-')+'T'+tm[2]):null;

    if(lower.includes('entropia universe time:')){
      const idx=lower.indexOf('entropia universe time:');
      const rawTime=line.slice(idx+'entropia universe time:'.length).trim();
      const parsedTime=new Date(rawTime.replace(/[\./]/g,'-'));
      if(!isNaN(parsedTime)){
        latestSyncedGameTime=parsedTime;
        document.getElementById('syncGameTimeDisplay').textContent=rawTime;
      }
    }

    const isGlobalLine=lower.includes('[globals]')||lower.includes('global')||lower.includes('hall of fame');
    if(isGlobalLine&&logDate&&!isNaN(logDate))allMobHourlyStats[logDate.getHours()]++;

    if(!isGlobalLine)continue;
    for(const mob of targetMobs){
      if(lower.includes(mob)){
        const pedMatch=line.match(pedRegex);
        const pedVal=pedMatch?parseFloat(pedMatch[1].replace(/,/g,'')):0;
        const isHof=lower.includes('hall of fame')||lower.includes('hof');
        const player=parsePlayerName(line,mob);
        records.push({
          mob,date:logDate,ped:pedVal,isHof,
          hour:logDate?logDate.getHours():0,
          player,raw:line
        });
        break;
      }
    }
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
  tbody.innerHTML='';

  // Use synced Entropia/log time when available. The schedule is an event-UTC
  // schedule, so only the exact matching event date + hour gets highlighted.
  const activeNow=latestSyncedGameTime||new Date();

  // Entropia/log timestamps are treated as the active event clock in this UI.
  // ISO strings are preferred when we have a real UTC Date; local getters are
  // retained for parsed log dates because those were created from log clock text.
  const activeYear=activeNow.getFullYear();
  const activeMonth=activeNow.getMonth();
  const activeDate=activeNow.getDate();

  const days=[
    {label:'Aug 15',last:false,year:2026,month:7,date:15},
    {label:'Aug 16',last:true,year:2026,month:7,date:16}
  ];

  for(const day of days){
    for(let h=0;h<24;h++){
      const hourStat=hourlyStats[h];
      const mobs=targetMobs.map(m=>({mob:m,count:hourStat[m]})).sort((a,b)=>b.count-a.count);
      const top=mobs[0],alt=mobs[1];
      const maxPerHour=Math.max(...Array.from({length:24},(_,hh)=>hourlyStats[hh].total),1);
      const activity=Math.round(hourStat.total/maxPerHour*100);
      const tr=document.createElement('tr');
      const isExactCurrentRow=
        day.year===activeYear &&
        day.month===activeMonth &&
        day.date===activeDate &&
        h===currentH;
      if(isExactCurrentRow)tr.classList.add('current-row');
      tr.innerHTML=`
        <td class="${day.last?'last-day':''}">
          <b>${day.label}</b> · ${String(h).padStart(2,'0')}:00–${String((h+1)%24).padStart(2,'0')}:00
        </td>
        <td class="mob-name">${top.count>0?escapeHtml(top.mob)+' · '+top.count:'Low activity'}</td>
        <td>${hourStat.total}</td>
        <td class="muted">${alt.count>0?escapeHtml(alt.mob)+' · '+alt.count:'—'}</td>
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
  }

  const currentRow=tbody.querySelector('.current-row');
  if(currentRow){
    requestAnimationFrame(()=>currentRow.scrollIntoView({block:'center'}));
  }
}

function renderHeatmaps(hourlyStats,currentH){
  const targetGrid=document.getElementById('heatmapGrid');
  const allGrid=document.getElementById('heatmapGridAll');
  targetGrid.innerHTML='';
  allGrid.innerHTML='';

  const maxTarget=Math.max(1,...Array.from({length:24},(_,h)=>hourlyStats[h].total));
  const maxAll=Math.max(1,...allMobHourlyStats);

  let targetPeak=0,targetPeakCount=-1;
  let allPeak=0,allPeakCount=-1;

  for(let h=0;h<24;h++){
    const tc=hourlyStats[h].total;
    if(tc>targetPeakCount){targetPeakCount=tc;targetPeak=h}
    targetGrid.appendChild(makeHeatCell(h,tc,maxTarget,'target',h===currentH));

    const ac=allMobHourlyStats[h]||0;
    if(ac>allPeakCount){allPeakCount=ac;allPeak=h}
    allGrid.appendChild(makeHeatCell(h,ac,maxAll,'all',h===currentH));
  }

  document.getElementById('targetPeakLabel').textContent=
    targetPeakCount>0?`Peak ${String(targetPeak).padStart(2,'0')}:00 · ${targetPeakCount}`:'No data';
  document.getElementById('allPeakLabel').textContent=
    allPeakCount>0?`Peak ${String(allPeak).padStart(2,'0')}:00 · ${allPeakCount}`:'No data';
}

function renderCurrentHourBreakdown(hourData,currentH){
  const box=document.getElementById('currentHourBreakdown');
  const sorted=targetMobs.map(m=>({mob:m,count:hourData[m]||0})).sort((a,b)=>b.count-a.count);
  const max=Math.max(1,...sorted.map(x=>x.count));

  box.innerHTML=sorted.map(x=>{
    const pct=Math.round((x.count/max)*100);
    return `
      <div style="display:grid;grid-template-columns:96px 1fr 32px;gap:7px;align-items:center;margin-bottom:7px">
        <div style="font-size:.67rem;text-transform:uppercase;color:var(--text);overflow:hidden;text-overflow:ellipsis">${escapeHtml(x.mob)}</div>
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
  const currentH=getActiveTargetHour();
  document.getElementById('currentTimeDisplay').textContent=`${String(currentH).padStart(2,'0')}:00`;
  document.getElementById('currentHourMiniLabel').textContent=`${String(currentH).padStart(2,'0')}:00`;

  if(!globalParsedData||!globalParsedData.length){
    document.getElementById('recommendedMobBox').textContent='No log data loaded';
    document.getElementById('recommendationReason').textContent='Connect chat.log to calculate the strongest target for the active hour.';
    document.getElementById('bestWindowBox').textContent='No log data loaded';
    document.getElementById('bestWindowReason').textContent='';
    document.getElementById('loadedGlobalsKpi').textContent='0';
    document.getElementById('loadedGlobalsSub').textContent='No target-mob records';
    document.getElementById('allMobPeakKpi').textContent='--';
    document.getElementById('allMobPeakSub').textContent='Waiting for data';
    renderHeatmaps(emptyHourlyStats(),currentH);
    renderCurrentHourBreakdown(emptyHourlyStats()[currentH],currentH);
    return;
  }

  const hourlyStats=emptyHourlyStats();
  let totalTargetPed=0;
  for(const rec of globalParsedData){
    if(rec.date&&!isNaN(rec.date)){
      const h=rec.hour;
      if(hourlyStats[h]?.[rec.mob]!==undefined){
        hourlyStats[h][rec.mob]++;
        hourlyStats[h].total++;
        hourlyStats[h].ped+=rec.ped||0;
        if(rec.isHof)hourlyStats[h].hofs++;
        totalTargetPed+=rec.ped||0;
      }
    }
  }

  document.getElementById('loadedGlobalsKpi').textContent=globalParsedData.length.toLocaleString();
  document.getElementById('loadedGlobalsSub').textContent=`${totalTargetPed.toFixed(0)} PED across target records`;

  let allPeakHour=0,allPeakCount=-1;
  allMobHourlyStats.forEach((count,h)=>{
    if(count>allPeakCount){allPeakCount=count;allPeakHour=h}
  });
  document.getElementById('allMobPeakKpi').textContent=`${String(allPeakHour).padStart(2,'0')}:00`;
  document.getElementById('allMobPeakSub').textContent=`${allPeakCount} all-mob globals`;

  let bestWindowStart=0,maxWindowGlobals=-1;
  for(let start=0;start<24;start++){
    let sum=0;
    for(let i=0;i<6;i++)sum+=hourlyStats[(start+i)%24].total;
    if(sum>maxWindowGlobals){
      maxWindowGlobals=sum;
      bestWindowStart=start;
    }
  }
  const bestWindowEnd=(bestWindowStart+6)%24;
  document.getElementById('bestWindowBox').textContent=
    `${String(bestWindowStart).padStart(2,'0')}:00 → ${String(bestWindowEnd).padStart(2,'0')}:00 UTC · ${maxWindowGlobals} globals`;
  document.getElementById('bestWindowReason').textContent=
    'Highest historical target-mob global density across any contiguous six-hour block.';

  const current=hourlyStats[currentH];
  const sorted=targetMobs.map(m=>({mob:m,count:current[m]})).sort((a,b)=>b.count-a.count);
  const best=sorted[0],second=sorted[1];

  if(best.count>0){
    const share=current.total?Math.round(best.count/current.total*100):0;
    document.getElementById('recommendedMobBox').innerHTML=
      `🎯 ${best.mob.toUpperCase()} <span class="muted" style="font-size:.72rem">· ${best.count} globals · ${share}% share</span>`;
    document.getElementById('recommendationReason').textContent=
      `Runner-up: ${second.mob} (${second.count}). Current-hour target total: ${current.total}.`;
  }else{
    document.getElementById('recommendedMobBox').textContent=`No clear peak at ${String(currentH).padStart(2,'0')}:00`;
    document.getElementById('recommendationReason').textContent='No target-mob globals were recorded in this exact historical hour.';
  }

  renderHeatmaps(hourlyStats,currentH);
  renderCurrentHourBreakdown(current,currentH);
  renderScheduleTable(hourlyStats,currentH);
  syncStreamerHud();
}


function trackerRecordWithinAnalysisWindow(record){
  const explicitStart=trackerOptions?.analysisStartUtc ? utcInputToDate(trackerOptions.analysisStartUtc) : null;
  const end=trackerOptions?.analysisEndUtc ? utcInputToDate(trackerOptions.analysisEndUtc) : null;
  const reference=latestSyncedGameTime||new Date();
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
