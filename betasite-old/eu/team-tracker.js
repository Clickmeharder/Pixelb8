'use strict';

window.EntropiaTeamTracker=(()=>{
  const STORAGE_KEY='entropia_team_tracker_v1';
  const ROOM_KEY='entropia_team_room_v1';
  const BROKER='wss://broker.hivemq.com:8884/mqtt';
  const ROOT='pixelb8/entropia-hunt/v1';
  const clientId=`PB8_${randomCode(10)}`;

  let client=null;
  let connected=false;
  let roomCode='';
  let roomName='';
  let roomPrivacy='private';
  let isHost=false;
  let presenceTimer=null;
  let telemetryTimer=null;
  let pruneTimer=null;
  let directoryRooms=new Map();
  let peers=new Map();

  let state=loadState();

  function emptyState(){
    return {
      active:false,
      teamName:'',
      detectedAt:null,
      lastTeamAt:null,
      disbandedAt:null,
      members:{},
      loot:[],
      events:[]
    };
  }

  function loadState(){
    try{
      const v=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      return {...emptyState(),...(v||{}),members:v?.members||{},loot:Array.isArray(v?.loot)?v.loot:[],events:Array.isArray(v?.events)?v.events:[]};
    }catch{return emptyState()}
  }
  function saveState(){
    localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  }
  function nowMs(date){
    return date instanceof Date&&!Number.isNaN(date.getTime())?date.getTime():Date.now();
  }
  function cleanName(v){
    return String(v||'').replace(/\s+/g,' ').trim().slice(0,80);
  }
  function keyName(v){return cleanName(v).toLowerCase()}
  function escapeHtml(s){
    return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function randomCode(length=6){
    const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes=new Uint8Array(length);
    if(crypto?.getRandomValues)crypto.getRandomValues(bytes);
    else for(let i=0;i<length;i++)bytes[i]=Math.floor(Math.random()*256);
    return Array.from(bytes,b=>chars[b%chars.length]).join('');
  }
  function selfName(){
    return cleanName(document.getElementById('avatarNameInput')?.value||localStorage.getItem('entropia_avatar_name')||'');
  }
  function streamerName(){
    return cleanName(localStorage.getItem('entropia_streamer_display_name_v1')||'');
  }
  function isSelf(name){
    const n=keyName(name), me=keyName(selfName());
    if(!n||!me)return false;
    if(n===me)return true;
    const tokens=me.split(/\s+/).filter(Boolean);
    return tokens.includes(n) || me.includes(` ${n} `) || me.startsWith(`${n} `) || me.endsWith(` ${n}`);
  }

  function resolveMember(name){
    const cleaned=cleanName(name);
    const lower=keyName(cleaned);
    if(!lower)return null;
    if(isSelf(cleaned))return {key:'__self__',name:selfName()||cleaned,self:true};

    if(state.members[lower])return {key:lower,...state.members[lower]};

    const matches=Object.entries(state.members).filter(([k,m])=>{
      const full=keyName(m.name||k);
      const parts=full.split(/\s+/);
      return parts.includes(lower) || full.startsWith(`${lower} `);
    });
    if(matches.length===1)return {key:matches[0][0],...matches[0][1]};
    return {key:lower,name:cleaned,self:false};
  }

  function upsertMember(name,source,date,{active=true}={}){
    const resolved=resolveMember(name);
    if(!resolved||resolved.self)return resolved;
    const ts=nowMs(date);
    const existing=state.members[resolved.key]||{};
    state.members[resolved.key]={
      name:existing.name&&existing.name.split(/\s+/).length>=resolved.name.split(/\s+/).length?existing.name:resolved.name,
      active,
      firstSeenAt:existing.firstSeenAt||ts,
      lastSeenAt:ts,
      source:source||existing.source||'team-log',
      deaths:existing.deaths||0,
      revives:existing.revives||0,
      lootLines:existing.lootLines||0
    };
    state.active=true;
    state.detectedAt=state.detectedAt||ts;
    state.lastTeamAt=ts;
    saveState();
    return {key:resolved.key,...state.members[resolved.key]};
  }

  function addEvent(type,player,details,date){
    state.events.unshift({
      time:nowMs(date),
      type,
      player:cleanName(player),
      details:String(details||'').slice(0,240)
    });
    if(state.events.length>300)state.events.length=300;
  }

  function processLine(line,date=new Date()){
    if(!line||!line.includes('[Team]'))return false;
    const m=String(line).match(/^\d{4}[-./]\d{1,2}[-./]\d{1,2}\s+\d{2}:\d{2}:\d{2}\s+\[Team\]\s+\[(.*?)\]\s+(.*)$/);
    if(!m)return false;

    const sender=cleanName(m[1]);
    const msg=String(m[2]||'').trim();
    const ts=nowMs(date);
    state.lastTeamAt=ts;

    // Team chat content itself is intentionally not recorded. Seeing another
    // player speak is enough to infer team membership/activity.
    if(sender){
      if(!isSelf(sender)){
        const existed=!!resolveMember(sender)?.key && !!state.members[resolveMember(sender)?.key];
        upsertMember(sender,'team-chat',date);
        if(!existed)addEvent('Observed Member',sender,'Seen speaking in Team channel',date);
      }
      state.active=true;
      saveState();render();return true;
    }

    let x;
    if((x=msg.match(/^(.+?) joined the team$/i))){
      const p=cleanName(x[1]);
      upsertMember(p,'join',date);
      addEvent('Joined',p,'Joined the team',date);
      saveState();render();return true;
    }

    if((x=msg.match(/^(.+?) left the team$/i))){
      const p=cleanName(x[1]);
      const member=resolveMember(p);
      if(member&&!member.self&&state.members[member.key]){
        state.members[member.key].active=false;
        state.members[member.key].lastSeenAt=ts;
      }
      addEvent('Left',p,'Left the team',date);
      saveState();render();return true;
    }

    if(/Your team was disbanded/i.test(msg)){
      state.active=false;
      state.disbandedAt=ts;
      Object.values(state.members).forEach(m=>m.active=false);
      addEvent('Disbanded','','Your team was disbanded',date);
      saveState();render();return true;
    }

    if(/You cannot loot any killed creature when alone in a team/i.test(msg)){
      state.active=true;
      addEvent('Alone In Team',selfName(),'Team exists but no other active looter detected',date);
      saveState();render();return true;
    }

    if((x=msg.match(/^(.+?) was killed$/i))){
      const p=cleanName(x[1]);
      const member=upsertMember(p,'death',date);
      if(member&&!member.self&&state.members[member.key])state.members[member.key].deaths=(state.members[member.key].deaths||0)+1;
      addEvent('Killed',p,'Team member was killed',date);
      saveState();render();return true;
    }

    if((x=msg.match(/^(.+?) was revived$/i))){
      const p=cleanName(x[1]);
      const member=upsertMember(p,'revive',date);
      if(member&&!member.self&&state.members[member.key])state.members[member.key].revives=(state.members[member.key].revives||0)+1;
      addEvent('Revived',p,'Team member was revived',date);
      saveState();render();return true;
    }

    if((x=msg.match(/^(.+?) received (?:a )?(.+?)(?: \((\d+)\))?$/i))){
      const p=cleanName(x[1]);
      const item=cleanName(x[2]);
      const qty=Math.max(1,parseInt(x[3],10)||1);
      const member=upsertMember(p,'loot',date);
      if(member&&!member.self&&state.members[member.key])state.members[member.key].lootLines=(state.members[member.key].lootLines||0)+1;
      state.loot.unshift({time:ts,player:p,item,quantity:qty});
      if(state.loot.length>500)state.loot.length=500;
      addEvent('Team Loot',p,`${item} × ${qty}`,date);
      saveState();render();return true;
    }

    // Any other non-chat Team system line still proves team context.
    state.active=true;
    saveState();render();
    return true;
  }

  function updateIdentity(){
    if(roomCode&&connected)publishPresence();
    render();
  }

  function roomTopic(code=roomCode){return `${ROOT}/room/${code}`}
  function directoryTopic(code='+'){return `${ROOT}/directory/${code}`}

  function ensureMqtt(){
    if(client)return;
    if(typeof mqtt==='undefined'){
      window.showAppToast?.('MQTT.js could not be loaded. Team log tracking still works offline.','warning',4000);
      return;
    }
    client=mqtt.connect(BROKER,{
      clientId,
      clean:true,
      reconnectPeriod:3000,
      connectTimeout:10000
    });
    client.on('connect',()=>{
      connected=true;
      client.subscribe(directoryTopic());
      if(roomCode)subscribeRoom();
      render();
    });
    client.on('reconnect',()=>{connected=false;render()});
    client.on('offline',()=>{connected=false;render()});
    client.on('close',()=>{connected=false;render()});
    client.on('error',err=>{
      console.warn('Team MQTT error',err);
      render();
    });
    client.on('message',handleMqttMessage);
    if(!pruneTimer)pruneTimer=setInterval(prunePeers,5000);
  }

  function handleMqttMessage(topic,raw){
    const text=raw.toString();
    if(topic.startsWith(`${ROOT}/directory/`)){
      const code=topic.split('/').pop();
      if(!text)directoryRooms.delete(code);
      else{
        try{
          const info=JSON.parse(text);
          if(info?.code&&info.updatedAt>Date.now()-30000)directoryRooms.set(code,info);
        }catch{}
      }
      return;
    }
    if(topic!==roomTopic()||!text)return;
    try{
      const msg=JSON.parse(text);
      if(!msg?.type||!msg.senderId)return;
      if(msg.senderId===clientId)return;
      if(['JOIN','PRESENCE','TELEMETRY'].includes(msg.type)){
        const prior=peers.get(msg.senderId)||{};
        peers.set(msg.senderId,{
          ...prior,
          id:msg.senderId,
          avatarName:cleanName(msg.avatarName||prior.avatarName),
          streamerName:cleanName(msg.streamerName||prior.streamerName),
          isHost:!!msg.isHost,
          telemetry:msg.telemetry||prior.telemetry||null,
          loadout:msg.loadout||prior.loadout||null,
          seenAt:Date.now()
        });
        if(isHost&&msg.type==='JOIN')publish('WELCOME',{targetId:msg.senderId,roomName,privacy:roomPrivacy});
      }else if(msg.type==='LEAVE'){
        peers.delete(msg.senderId);
      }else if(msg.type==='WELCOME'&&(!msg.targetId||msg.targetId===clientId)){
        if(msg.roomName)roomName=cleanName(msg.roomName);
      }
      render();
    }catch(err){console.warn('Team MQTT parse error',err)}
  }

  function subscribeRoom(){
    if(!client||!connected||!roomCode)return;
    client.subscribe(roomTopic(),()=>{
      publish('JOIN',{});
      publishPresence();
      startRoomTimers();
    });
  }

  function startRoomTimers(){
    clearInterval(presenceTimer);clearInterval(telemetryTimer);
    presenceTimer=setInterval(publishPresence,7000);
    telemetryTimer=setInterval(publishTelemetry,2500);
    publishTelemetry();
  }

  function publish(type,payload={}){
    if(!client||!connected||!roomCode)return false;
    client.publish(roomTopic(),JSON.stringify({
      type,
      senderId:clientId,
      sentAt:Date.now(),
      avatarName:selfName(),
      streamerName:streamerName(),
      isHost,
      ...payload
    }),{qos:0});
    return true;
  }

  function publishPresence(){
    publish('PRESENCE',{roomName,privacy:roomPrivacy});
    if(isHost&&roomPrivacy==='public')publishDirectory();
  }

  function publishTelemetry(){
    if(!roomCode||!connected)return;
    const h=window.EntropiaHuntTracker;
    const s=h?.getSession?.()||{};
    const m=h?.getMetrics?.()||{};
    const active=window.activeLoadout;
    publish('TELEMETRY',{
      telemetry:{
        huntName:s.name||'',
        target:s.target||'',
        status:s.status||'idle',
        cost:Number(m.totalCost)||0,
        loot:Number(s.loot)||0,
        profit:Number(m.profit)||0,
        returnPct:Number(m.returnPct)||0,
        damage:Number(s.damageDealt)||0,
        shots:Number(s.shots)||0,
        hits:Number(s.hits)||0,
        globals:Number(s.globals)||0,
        hofs:Number(s.hofs)||0,
        actualDps:Number(m.dps)||0,
        actualDpp:Number(m.dpp)||0,
        accuracy:Number(m.accuracy)||0,
        elapsedMs:Number(m.elapsedMs)||0,
        combatMs:Number(m.combatMs)||0
      },
      loadout:active?{
        id:active.id||null,
        name:active.name||'',
        weaponName:active.weaponName||'',
        dpp:Number(active.dpp)||0,
        dps:Number(active.dps)||0,
        efficiency:Number(active.efficiency)||0,
        costPerShot:Number(active.costPerShot)||0,
        apm:Number(active.apm)||0,
        effectiveDamage:Number(active.effectiveDamage)||0
      }:null
    });
  }

  function publishDirectory(){
    if(!isHost||roomPrivacy!=='public'||!client||!connected)return;
    const listing={
      code:roomCode,
      name:roomName||'Public Team',
      host:streamerName()||selfName()||'Host',
      peerCount:peers.size+1,
      updatedAt:Date.now()
    };
    client.publish(directoryTopic(roomCode),JSON.stringify(listing),{retain:true,qos:0});
  }

  function clearDirectory(){
    if(client&&connected&&roomCode&&isHost){
      client.publish(directoryTopic(roomCode),'',{retain:true,qos:0});
    }
  }

  function createOrUpdateRoom(){
    const name=cleanName(document.getElementById('teamNameInput')?.value||state.teamName||'My Team');
    const privacy=document.getElementById('teamPrivacySelect')?.value==='public'?'public':'private';
    if(!name){
      window.showAppToast?.('Enter a team name first.','warning');
      return;
    }
    state.teamName=name;saveState();
    roomName=name;roomPrivacy=privacy;

    if(!roomCode){
      roomCode=randomCode(6);
      isHost=true;
      peers.clear();
      persistRoom();
      ensureMqtt();
      if(connected)subscribeRoom();
      window.showAppToast?.(`Team room ${roomCode} created.`,'success');
    }else{
      persistRoom();
      publishPresence();
      publishTelemetry();
      if(roomPrivacy==='private')clearDirectory();
      else publishDirectory();
      window.showAppToast?.('Team room updated.','success');
    }
    render();
  }

  function joinRoomFromInput(){
    const code=document.getElementById('teamRoomCodeInput')?.value||'';
    joinRoomCode(code);
  }

  function leaveRoom(showToast=true){
    if(roomCode){
      publish('LEAVE',{});
      clearDirectory();
      if(client&&connected)client.unsubscribe(roomTopic());
    }
    roomCode='';
    roomName='';
    isHost=false;
    peers.clear();
    clearInterval(presenceTimer);clearInterval(telemetryTimer);
    presenceTimer=telemetryTimer=null;
    localStorage.removeItem(ROOM_KEY);
    if(showToast)window.showAppToast?.('Left team room.','info');
    render();
  }

  function persistRoom(){
    localStorage.setItem(ROOM_KEY,JSON.stringify({roomCode,roomName,roomPrivacy,isHost}));
  }

  function restoreRoom(){
    try{
      const v=JSON.parse(localStorage.getItem(ROOM_KEY)||'null');
      if(!v?.roomCode)return;
      roomCode=String(v.roomCode);
      roomName=cleanName(v.roomName);
      roomPrivacy=v.roomPrivacy==='public'?'public':'private';
      isHost=!!v.isHost;
      ensureMqtt();
    }catch{}
  }

  function copyRoomCode(){
    if(!roomCode){
      window.showAppToast?.('Create or join a room first.','warning');
      return;
    }
    navigator.clipboard?.writeText(roomCode).then(
      ()=>window.showAppToast?.(`Room code ${roomCode} copied.`,'success'),
      ()=>window.showAppToast?.(`Room code: ${roomCode}`,'info',5000)
    );
  }

  function prunePeers(){
    const cutoff=Date.now()-22000;
    let changed=false;
    for(const [id,p] of peers){
      if((p.seenAt||0)<cutoff){peers.delete(id);changed=true}
    }
    for(const [code,r] of directoryRooms){
      if((r.updatedAt||0)<Date.now()-35000)directoryRooms.delete(code);
    }
    if(changed)render();
  }

  function fmtTime(ms){
    const d=new Date(ms);
    return Number.isNaN(d.getTime())?'--:--:--':d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});
  }

  function getPublicRooms(){
    return [...directoryRooms.values()]
      .filter(r=>r&&r.code&&r.updatedAt>Date.now()-35000)
      .sort((a,b)=>(b.peerCount||0)-(a.peerCount||0)||(a.name||'').localeCompare(b.name||''));
  }

  function refreshPublicRooms(){
    ensureMqtt();
    if(client&&connected){
      client.subscribe(directoryTopic(),()=>{
        renderPublicDirectory();
      });
      window.showAppToast?.('Refreshing public team rooms…','info',1800);
    }else{
      window.showAppToast?.('Connecting to the public team directory…','info',2200);
    }
    renderPublicDirectory();
  }

  function joinPublicRoom(code){
    if(!code)return;
    const input=document.getElementById('teamRoomCodeInput');
    const streamInput=document.getElementById('streamTeamRoomCodeInput');
    if(input)input.value=code;
    if(streamInput)streamInput.value=code;
    joinRoomCode(code);
  }

  function joinRoomCode(code){
    code=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8);
    if(!code){
      window.showAppToast?.('Enter a room code first.','warning');
      return;
    }
    if(roomCode)leaveRoom(false);
    roomCode=code;
    const publicInfo=directoryRooms.get(code);
    roomName=cleanName(publicInfo?.name||state.teamName||'Joined Team');
    roomPrivacy=publicInfo?'public':'private';
    isHost=false;
    peers.clear();
    persistRoom();
    ensureMqtt();
    if(connected)subscribeRoom();
    render();
  }

  function createOrUpdateRoomFromStreamer(){
    const nameEl=document.getElementById('streamTeamNameInput');
    const privacyEl=document.getElementById('streamTeamPrivacySelect');
    const mainName=document.getElementById('teamNameInput');
    const mainPrivacy=document.getElementById('teamPrivacySelect');
    if(mainName&&nameEl)mainName.value=nameEl.value;
    if(mainPrivacy&&privacyEl)mainPrivacy.value=privacyEl.value;
    state.teamName=cleanName(nameEl?.value||state.teamName);
    roomPrivacy=privacyEl?.value==='public'?'public':'private';
    createOrUpdateRoom();
  }

  function joinRoomFromStreamer(){
    const code=document.getElementById('streamTeamRoomCodeInput')?.value||'';
    joinRoomCode(code);
  }

  function teamReportingMembers(){
    if(!roomCode)return [];
    return [
      {avatarName:selfName()||'You',streamerName:streamerName(),isHost,self:true,telemetry:localTelemetry(),loadout:localLoadout()},
      ...[...peers.values()]
    ];
  }

  function aggregateTeamPerformance(){
    const members=teamReportingMembers();
    const telemetry=members.map(m=>m.telemetry).filter(Boolean);
    const loadouts=members.map(m=>m.loadout).filter(Boolean);

    const sum=(rows,key)=>rows.reduce((total,row)=>total+(Number(row?.[key])||0),0);
    const avg=(rows,key)=>{
      const vals=rows.map(row=>Number(row?.[key])).filter(Number.isFinite);
      return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;
    };

    const totalCost=sum(telemetry,'cost');
    const totalLoot=sum(telemetry,'loot');
    const totalDamage=sum(telemetry,'damage');
    const totalShots=sum(telemetry,'shots');
    const totalHits=sum(telemetry,'hits');
    const profit=totalLoot-totalCost;
    const returnPct=totalCost>0?totalLoot/totalCost*100:0;

    // Actual team DPP must use aggregate damage / aggregate cost rather than
    // averaging member DPP values.
    const actualTeamDpp=totalCost>0?totalDamage/(totalCost*100):0;

    // Each dashboard calculates actualDps from that member's observed combat
    // window. Summing those member rates gives a practical combined live DPS.
    const combinedActualDps=sum(telemetry,'actualDps');
    const avgActualDps=avg(telemetry,'actualDps');
    const accuracy=totalShots>0?totalHits/totalShots*100:0;

    const combinedEstimatedDps=sum(loadouts,'dps');
    const avgEstimatedDps=avg(loadouts,'dps');
    const avgEstimatedDpp=avg(loadouts,'dpp');
    const avgEfficiency=avg(loadouts,'efficiency');
    const avgCostPerShot=avg(loadouts,'costPerShot');

    return {
      members,telemetry,loadouts,
      reportingMembers:members.length,
      telemetryCount:telemetry.length,
      loadoutCount:loadouts.length,
      totalCost,totalLoot,totalDamage,totalShots,totalHits,profit,returnPct,
      actualTeamDpp,combinedActualDps,avgActualDps,accuracy,
      combinedEstimatedDps,avgEstimatedDps,avgEstimatedDpp,avgEfficiency,avgCostPerShot
    };
  }

  function syncStreamerTeamUi(){
    const nameEl=document.getElementById('streamTeamNameInput');
    const privacyEl=document.getElementById('streamTeamPrivacySelect');
    const codeEl=document.getElementById('streamTeamRoomCodeInput');

    if(nameEl&&document.activeElement!==nameEl)nameEl.value=state.teamName||roomName||'';
    if(privacyEl&&document.activeElement!==privacyEl)privacyEl.value=roomPrivacy||'private';
    if(codeEl&&document.activeElement!==codeEl)codeEl.value=roomCode||'';

    const roomDot=document.getElementById('streamTeamRoomDot');
    const totalsDot=document.getElementById('streamTeamTotalsDot');
    if(roomDot)roomDot.classList.toggle('active',!!roomCode&&connected);
    if(totalsDot)totalsDot.classList.toggle('active',!!roomCode&&connected);

    const stateEl=document.getElementById('streamTeamRoomState');
    if(stateEl)stateEl.textContent=roomCode?(connected?'ONLINE':'CONNECTING'):'OFFLINE';

    const perf=aggregateTeamPerformance();
    const all=perf.members;

    setText('streamTeamTotalsCount',`${roomCode?all.length:0} ONLINE`);
    setText('streamTeamMemberCount',String(roomCode?all.length:0));
    setText('streamTeamCost',`${perf.totalCost.toFixed(2)} PED`);
    setText('streamTeamLoot',`${perf.totalLoot.toFixed(2)} PED`);
    setText('streamTeamProfit',`${perf.profit>=0?'+':''}${perf.profit.toFixed(2)} PED`);
    setText('streamTeamReturn',`${perf.returnPct.toFixed(1)}%`);
    setText('streamTeamActualDps',perf.combinedActualDps.toFixed(1));
    setText('streamTeamActualDpp',perf.actualTeamDpp.toFixed(2));
    setText('streamTeamEstimatedDps',perf.combinedEstimatedDps.toFixed(1));
    setText('streamTeamAverageEstimatedDps',perf.avgEstimatedDps.toFixed(1));
    setText('streamTeamAverageEstimatedDpp',perf.avgEstimatedDpp.toFixed(2));
    setText('streamTeamAverageEfficiency',`${perf.avgEfficiency.toFixed(1)}%`);
    setText('streamTeamAccuracy',`${perf.accuracy.toFixed(1)}%`);
    setText('streamTeamDamage',perf.totalDamage.toFixed(0));

    const profitEl=document.getElementById('streamTeamProfit');
    if(profitEl){
      profitEl.classList.toggle('success',perf.profit>=0);
      profitEl.classList.toggle('danger',perf.profit<0);
    }

    const cards=document.getElementById('streamTeamMemberCards');
    if(cards){
      if(!roomCode){
        cards.innerHTML='<div class="hud-placeholder">Create or join a room to see connected teammates.</div>';
      }else{
        cards.innerHTML=all.map(p=>{
          const t=p.telemetry||{};
          const l=p.loadout||{};
          const display=p.streamerName||p.avatarName||(p.self?'You':'Peer');
          const profit=Number(t.profit)||0;
          return `<div class="stream-team-member-card">
            <div class="stream-team-member-head">
              <span><i class="team-presence-dot active"></i><b>${escapeHtml(display)}</b>${p.isHost?'<small>HOST</small>':''}</span>
              <em>${escapeHtml(t.status||'online')}</em>
            </div>
            <div class="stream-team-member-sub">${escapeHtml(p.avatarName||'Unknown avatar')}</div>
            <div class="stream-team-member-row-title">Actual</div>
            <div class="stream-team-member-metrics stream-member-six">
              <span><small>Cost</small><b>${(Number(t.cost)||0).toFixed(2)}</b></span>
              <span><small>Loot</small><b>${(Number(t.loot)||0).toFixed(2)}</b></span>
              <span><small>P/L</small><b class="${profit>=0?'success':'danger'}">${profit>=0?'+':''}${profit.toFixed(2)}</b></span>
              <span><small>DPS</small><b>${(Number(t.actualDps)||0).toFixed(1)}</b></span>
              <span><small>DPP</small><b>${(Number(t.actualDpp)||0).toFixed(2)}</b></span>
              <span><small>Return</small><b>${(Number(t.returnPct)||0).toFixed(1)}%</b></span>
            </div>
            <div class="stream-team-member-row-title">Loadout</div>
            <div class="stream-team-member-loadout">${escapeHtml(l.weaponName||l.name||'No loadout shared')}</div>
            <div class="stream-team-member-metrics stream-member-four">
              <span><small>Est DPS</small><b>${(Number(l.dps)||0).toFixed(1)}</b></span>
              <span><small>Est DPP</small><b>${(Number(l.dpp)||0).toFixed(2)}</b></span>
              <span><small>Eff.</small><b>${(Number(l.efficiency)||0).toFixed(1)}%</b></span>
              <span><small>Cost/shot</small><b>${(Number(l.costPerShot)||0).toFixed(4)}</b></span>
            </div>
          </div>`;
        }).join('');
      }
    }

    const publicList=document.getElementById('streamPublicTeamList');
    if(publicList){
      const rooms=getPublicRooms();
      publicList.innerHTML=rooms.length?rooms.map(r=>`
        <button class="stream-public-room-card" type="button" onclick="EntropiaTeamTracker.joinPublicRoom('${escapeHtml(r.code)}')">
          <span><b>${escapeHtml(r.name||'Public Team')}</b><small>${escapeHtml(r.host||'Host')}</small></span>
          <span><strong>${Number(r.peerCount)||1}</strong><small>online</small></span>
          <code>${escapeHtml(r.code)}</code>
        </button>
      `).join(''):'<div class="hud-placeholder">No public rooms discovered.</div>';
    }
  }

  function relativeFreshness(updatedAt){
    const seconds=Math.max(0,Math.floor((Date.now()-(Number(updatedAt)||0))/1000));
    if(seconds<5)return 'just now';
    if(seconds<60)return `${seconds}s ago`;
    const minutes=Math.floor(seconds/60);
    return `${minutes}m ago`;
  }

  function renderPublicDirectory(){
    const host=document.getElementById('teamPublicRoomList');
    const count=document.getElementById('teamPublicRoomCount');
    const rooms=getPublicRooms();

    if(count)count.textContent=`${rooms.length} available`;
    if(!host)return;

    if(!rooms.length){
      host.innerHTML='<div class="empty">No public team rooms discovered.</div>';
      return;
    }

    host.innerHTML=rooms.map(r=>`
      <article class="team-public-room-card">
        <div class="team-public-room-main">
          <div class="team-public-room-title">
            <b>${escapeHtml(r.name||'Public Team')}</b>
            <span>${escapeHtml(r.host||'Host')}</span>
          </div>
          <div class="team-public-room-meta">
            <span><strong>${Number(r.peerCount)||1}</strong> online</span>
            <span>${escapeHtml(relativeFreshness(r.updatedAt))}</span>
          </div>
        </div>
        <div class="team-public-room-actions">
          <code>${escapeHtml(r.code)}</code>
          <button class="btn primary" type="button" onclick="EntropiaTeamTracker.joinPublicRoom('${escapeHtml(r.code)}')">Join</button>
        </div>
      </article>
    `).join('');
  }

  function render(){
    syncStreamerTeamUi();
    renderPublicDirectory();
    const name=document.getElementById('teamNameInput');
    if(name&&document.activeElement!==name)name.value=state.teamName||roomName||'';
    const privacy=document.getElementById('teamPrivacySelect');
    if(privacy&&document.activeElement!==privacy)privacy.value=roomPrivacy||'private';
    const code=document.getElementById('teamRoomCodeInput');
    if(code&&document.activeElement!==code)code.value=roomCode||'';

    const activeMembers=Object.values(state.members).filter(m=>m.active);
    const detectedCount=activeMembers.length+(state.active?1:0);
    setText('teamDetectedCount',String(detectedCount));
    setText('teamOnlineCount',String(roomCode?(peers.size+1):0));
    setText('teamLogLootLines',String(state.loot.length));

    const logBadge=document.getElementById('teamLogBadge');
    if(logBadge){
      logBadge.textContent=state.active?'TEAM DETECTED':'LOG UNKNOWN';
      logBadge.classList.toggle('active',state.active);
    }
    const roomBadge=document.getElementById('teamRoomBadge');
    if(roomBadge){
      roomBadge.textContent=roomCode?(connected?'ROOM ONLINE':'ROOM CONNECTING'):'ROOM OFFLINE';
      roomBadge.classList.toggle('active',roomCode&&connected);
    }
    setText('teamDetectedState',state.active?'Team activity detected from chat.log':'No team activity detected');
    setText('teamRoomNameLabel',roomCode?`${roomName||'Team'} · ${roomCode}`:'No room');

    const detected=document.getElementById('teamDetectedRoster');
    if(detected){
      const rows=[];
      rows.push(renderDetectedMember({name:selfName()||'You',active:state.active,self:true,source:'self'}));
      activeMembers.sort((a,b)=>(a.name||'').localeCompare(b.name||'')).forEach(m=>rows.push(renderDetectedMember(m)));
      detected.innerHTML=rows.length?rows.join(''):'<div class="empty">No team members detected yet.</div>';
    }

    const online=document.getElementById('teamOnlineRoster');
    if(online){
      if(!roomCode){
        online.innerHTML='<div class="empty">Create or join a room to share live telemetry.</div>';
      }else{
        const me={
          avatarName:selfName()||'You',
          streamerName:streamerName(),
          isHost,
          telemetry:localTelemetry(),
          loadout:localLoadout()
        };
        online.innerHTML=[renderPeer(me,true),...[...peers.values()].sort((a,b)=>(a.avatarName||'').localeCompare(b.avatarName||'')).map(p=>renderPeer(p,false))].join('');
      }
    }

    const lootBody=document.getElementById('teamLootBody');
    if(lootBody){
      lootBody.innerHTML=state.loot.length
        ?state.loot.slice(0,150).map(x=>`<tr><td>${fmtTime(x.time)}</td><td>${escapeHtml(x.player)}</td><td>${escapeHtml(x.item)}</td><td>${x.quantity}</td></tr>`).join('')
        :'<tr><td colspan="4" class="empty">No Team loot lines yet.</td></tr>';
    }

    const evBody=document.getElementById('teamEventBody');
    setText('teamEventCount',String(state.events.length));
    if(evBody){
      evBody.innerHTML=state.events.length
        ?state.events.slice(0,180).map(e=>`<tr><td>${fmtTime(e.time)}</td><td>${escapeHtml(e.type)}</td><td>${escapeHtml(e.player||'—')}</td><td>${escapeHtml(e.details||'')}</td></tr>`).join('')
        :'<tr><td colspan="4" class="empty">Waiting for Team activity.</td></tr>';
    }

    const perf=aggregateTeamPerformance();
    setText('teamSharedCost',`${perf.totalCost.toFixed(2)} PED`);
    setText('teamSharedLoot',`${perf.totalLoot.toFixed(2)} PED`);
    setText('teamSharedProfit',`${perf.profit>=0?'+':''}${perf.profit.toFixed(2)} PED`);
    setText('teamSharedReturn',`Return ${perf.returnPct.toFixed(2)}%`);
    setText('teamActualDpp',perf.actualTeamDpp.toFixed(2));
    setText('teamActualDps',perf.combinedActualDps.toFixed(1));
    setText('teamAverageActualDps',`Avg member ${perf.avgActualDps.toFixed(1)}`);
    setText('teamEstimatedDps',perf.combinedEstimatedDps.toFixed(1));
    setText('teamAverageEstimatedDps',`Avg member ${perf.avgEstimatedDps.toFixed(1)}`);
    setText('teamAverageEfficiency',`${perf.avgEfficiency.toFixed(1)}%`);
    setText('teamAverageLoadoutDpp',`Avg DPP ${perf.avgEstimatedDpp.toFixed(2)}`);

    setText('teamPerformanceCoverage',`${perf.reportingMembers} member${perf.reportingMembers===1?'':'s'} reporting`);
    setText('teamPerfEstimatedCombinedDps',perf.combinedEstimatedDps.toFixed(1));
    setText('teamPerfEstimatedAvgDps',perf.avgEstimatedDps.toFixed(1));
    setText('teamPerfEstimatedAvgDpp',perf.avgEstimatedDpp.toFixed(2));
    setText('teamPerfEstimatedAvgEfficiency',`${perf.avgEfficiency.toFixed(1)}%`);
    setText('teamPerfEstimatedAvgCostShot',`${perf.avgCostPerShot.toFixed(4)} PED`);
    setText('teamPerfActualCombinedDps',perf.combinedActualDps.toFixed(1));
    setText('teamPerfActualAvgDps',perf.avgActualDps.toFixed(1));
    setText('teamPerfActualDpp',perf.actualTeamDpp.toFixed(2));
    setText('teamPerfAccuracy',`${perf.accuracy.toFixed(1)}%`);
    setText('teamPerfDamage',perf.totalDamage.toFixed(0));
    setText('teamPerfCost',`${perf.totalCost.toFixed(2)} PED`);
    setText('teamPerfLoot',`${perf.totalLoot.toFixed(2)} PED`);
    setText('teamPerfProfit',`${perf.profit>=0?'+':''}${perf.profit.toFixed(2)} PED`);
    setText('teamPerfReturn',`${perf.returnPct.toFixed(2)}%`);
    setText('teamPerfShots',String(perf.totalShots));

    const pEl=document.getElementById('teamSharedProfit');
    if(pEl){pEl.classList.toggle('success',perf.profit>=0);pEl.classList.toggle('danger',perf.profit<0)}
    const perfProfitEl=document.getElementById('teamPerfProfit');
    if(perfProfitEl){perfProfitEl.classList.toggle('success',perf.profit>=0);perfProfitEl.classList.toggle('danger',perf.profit<0)}
  }

  function renderDetectedMember(m){
    return `<div class="team-member-card">
      <div class="team-member-main"><span class="team-presence-dot ${m.active?'active':''}"></span><div><b>${escapeHtml(m.name||'Unknown')}</b><span>${m.self?'You':escapeHtml(m.source||'team-log')}</span></div></div>
      <div class="team-member-mini">${m.deaths?`${m.deaths} deaths · `:''}${m.lootLines||0} loot lines</div>
    </div>`;
  }

  function localTelemetry(){
    const h=window.EntropiaHuntTracker;
    const s=h?.getSession?.()||{};
    const m=h?.getMetrics?.()||{};
    return {
      huntName:s.name||'',target:s.target||'',status:s.status||'idle',
      cost:Number(m.totalCost)||0,loot:Number(s.loot)||0,profit:Number(m.profit)||0,returnPct:Number(m.returnPct)||0,
      damage:Number(s.damageDealt)||0,shots:Number(s.shots)||0,hits:Number(s.hits)||0,
      globals:Number(s.globals)||0,hofs:Number(s.hofs)||0,
      actualDps:Number(m.dps)||0,actualDpp:Number(m.dpp)||0,accuracy:Number(m.accuracy)||0,
      elapsedMs:Number(m.elapsedMs)||0,combatMs:Number(m.combatMs)||0
    };
  }
  function localLoadout(){
    const a=window.activeLoadout;
    return a?{
      name:a.name||'',weaponName:a.weaponName||'',
      dpp:Number(a.dpp)||0,dps:Number(a.dps)||0,efficiency:Number(a.efficiency)||0,
      costPerShot:Number(a.costPerShot)||0,apm:Number(a.apm)||0,effectiveDamage:Number(a.effectiveDamage)||0
    }:null;
  }
  function renderPeer(p,self=false){
    const t=p.telemetry||{};
    const l=p.loadout||{};
    const display=p.streamerName||p.avatarName||(self?'You':'Peer');
    const profit=Number(t.profit)||0;
    return `<div class="team-peer-card">
      <div class="team-peer-head">
        <div><span class="team-presence-dot active"></span><b>${escapeHtml(display)}</b>${p.isHost?'<small>HOST</small>':''}</div>
        <span>${escapeHtml(t.status||'online')}</span>
      </div>
      <div class="team-peer-avatar">${escapeHtml(p.avatarName||'Unknown avatar')}</div>

      <div class="team-peer-section-label">Actual Hunt</div>
      <div class="team-peer-metrics team-peer-metrics-six">
        <span><small>Cost</small><b>${(Number(t.cost)||0).toFixed(2)}</b></span>
        <span><small>Loot</small><b>${(Number(t.loot)||0).toFixed(2)}</b></span>
        <span><small>P/L</small><b class="${profit>=0?'success':'danger'}">${profit>=0?'+':''}${profit.toFixed(2)}</b></span>
        <span><small>Return</small><b>${(Number(t.returnPct)||0).toFixed(1)}%</b></span>
        <span><small>DPS</small><b>${(Number(t.actualDps)||0).toFixed(1)}</b></span>
        <span><small>DPP</small><b>${(Number(t.actualDpp)||0).toFixed(2)}</b></span>
        <span><small>Accuracy</small><b>${(Number(t.accuracy)||0).toFixed(1)}%</b></span>
        <span><small>Damage</small><b>${(Number(t.damage)||0).toFixed(0)}</b></span>
        <span><small>Shots</small><b>${Number(t.shots)||0}</b></span>
      </div>

      <div class="team-peer-section-label">Loadout Estimate</div>
      <div class="team-peer-loadout">${escapeHtml(l.weaponName||l.name||'No loadout shared')}</div>
      <div class="team-peer-metrics team-peer-metrics-four">
        <span><small>Est DPS</small><b>${(Number(l.dps)||0).toFixed(1)}</b></span>
        <span><small>Est DPP</small><b>${(Number(l.dpp)||0).toFixed(2)}</b></span>
        <span><small>Efficiency</small><b>${(Number(l.efficiency)||0).toFixed(1)}%</b></span>
        <span><small>Cost/Shot</small><b>${(Number(l.costPerShot)||0).toFixed(4)}</b></span>
      </div>
    </div>`;
  }

  function setText(id,value){const el=document.getElementById(id);if(el)el.textContent=value}

  function bind(){
    const savedName=state.teamName;
    if(savedName){
      const el=document.getElementById('teamNameInput');
      if(el)el.value=savedName;
    }
    document.getElementById('teamNameInput')?.addEventListener('input',e=>{
      state.teamName=cleanName(e.target.value);saveState();
    });
    document.getElementById('teamPrivacySelect')?.addEventListener('change',e=>{
      roomPrivacy=e.target.value==='public'?'public':'private';
      if(roomCode&&isHost){
        persistRoom();
        if(roomPrivacy==='public')publishDirectory();else clearDirectory();
      }
    });
    restoreRoom();
    render();
    setInterval(render,2000);
  }

  window.addEventListener('beforeunload',()=>{
    publish('LEAVE',{});
    clearDirectory();
  });

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);
  else bind();

  return {
    processLine,render,updateIdentity,
    createOrUpdateRoom,createOrUpdateRoomFromStreamer,
    joinRoomFromInput,joinRoomFromStreamer,joinPublicRoom,
    leaveRoom,copyRoomCode,refreshPublicRooms
  };
})();
