
(function(){
  const api={};

  api.clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||min));

  api.loadNumber=(key,fallback)=>{
    const n=Number(localStorage.getItem(key));
    return Number.isFinite(n)?n:fallback;
  };

  api.saveNumber=(key,value)=>{
    localStorage.setItem(key,String(value));
  };

  api.bindVerticalResizer=function(options={}){
    const {
      element,
      cssVariable,
      storageKey,
      defaultWidth=248,
      minWidth=210,
      maxWidth=460,
      enabled=()=>true,
      invert=true,
      onResize
    }=options;

    const el=typeof element==='string'?document.querySelector(element):element;
    if(!el||!cssVariable)return null;

    let state=null;
    const root=document.documentElement;

    const apply=(width,save=false)=>{
      const next=api.clamp(width,minWidth,maxWidth);
      root.style.setProperty(cssVariable,`${next}px`);
      if(save&&storageKey)api.saveNumber(storageKey,next);
      if(typeof onResize==='function')onResize(next);
      return next;
    };

    const restore=()=>{
      const saved=storageKey?api.loadNumber(storageKey,defaultWidth):defaultWidth;
      return apply(saved,false);
    };

    const move=e=>{
      if(!state)return;
      const delta=invert?(state.startX-e.clientX):(e.clientX-state.startX);
      apply(state.startWidth+delta,false);
    };

    const end=()=>{
      if(!state)return;
      const current=parseFloat(getComputedStyle(root).getPropertyValue(cssVariable))||defaultWidth;
      apply(current,true);
      state=null;
      el.classList.remove('dragging');
      document.body.style.cursor='';
      document.body.style.userSelect='';
      window.removeEventListener('pointermove',move);
    };

    const start=e=>{
      if(e.button!==undefined&&e.button!==0)return;
      if(typeof enabled==='function'&&!enabled())return;
      const current=parseFloat(getComputedStyle(root).getPropertyValue(cssVariable))||defaultWidth;
      state={startX:e.clientX,startWidth:current};
      el.classList.add('dragging');
      document.body.style.cursor='col-resize';
      document.body.style.userSelect='none';
      el.setPointerCapture?.(e.pointerId);
      window.addEventListener('pointermove',move);
      window.addEventListener('pointerup',end,{once:true});
      window.addEventListener('pointercancel',end,{once:true});
      e.preventDefault();
    };

    if(!el.dataset.pixelb8ResizeReady){
      el.dataset.pixelb8ResizeReady='1';
      el.addEventListener('pointerdown',start);
    }

    restore();
    return {restore,apply};
  };

  api.toggleMore=function(target){
    const section=typeof target==='string'?document.querySelector(target):target;
    if(!section)return false;
    const collapsed=section.classList.toggle('collapsed');
    section.querySelector('.pixelb8-more-toggle, .pixelb8-links-toggle')?.setAttribute('aria-expanded',String(!collapsed));
    return !collapsed;
  };

  api.initMore=function(root=document){
    root.querySelectorAll('[data-pixelb8-more]').forEach(section=>{
      section.classList.add('collapsed');
      section.querySelector('.pixelb8-more-toggle, .pixelb8-links-toggle')?.setAttribute('aria-expanded','false');
    });
  };



  api.enhanceToolSections=function(root=document,options={}){
    const host=typeof root==='string'?document.querySelector(root):root;
    if(!host)return [];
    const selector=options.selector||'[data-pixelb8-tool-section]';
    const storagePrefix=options.storagePrefix||'pixelb8_tool_section';
    const sections=[...host.querySelectorAll(selector)];

    for(const section of sections){
      if(section.dataset.pixelb8ToolReady==='1')continue;
      const heading=section.querySelector(':scope > h2, :scope > h3');
      if(!heading)continue;

      const key=section.dataset.toolSectionKey||heading.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      const storageKey=`${storagePrefix}_${key}`;
      const body=document.createElement('div');
      body.className='pixelb8-tool-section-body';
      const header=document.createElement('button');
      header.type='button';
      header.className='pixelb8-tool-section-header';
      header.setAttribute('aria-expanded','true');
      header.title=`Collapse ${heading.textContent.trim()}`;
      const title=document.createElement('span');
      title.className='pixelb8-tool-section-title';
      const chevron=document.createElement('span');
      chevron.className='pixelb8-tool-section-chevron';
      chevron.textContent='⌄';

      heading.remove();
      title.appendChild(heading);
      header.append(title,chevron);
      while(section.firstChild)body.appendChild(section.firstChild);
      section.append(header,body);
      section.classList.add('pixelb8-tool-section');

      const saved=localStorage.getItem(storageKey);
      const defaultCollapsed=section.dataset.toolCollapsed==='true';
      const collapsed=saved===null?defaultCollapsed:saved==='1';
      section.classList.toggle('collapsed',collapsed);
      header.setAttribute('aria-expanded',collapsed?'false':'true');
      header.title=`${collapsed?'Expand':'Collapse'} ${heading.textContent.trim()}`;

      header.addEventListener('click',()=>{
        const next=section.classList.toggle('collapsed');
        header.setAttribute('aria-expanded',next?'false':'true');
        header.title=`${next?'Expand':'Collapse'} ${heading.textContent.trim()}`;
        localStorage.setItem(storageKey,next?'1':'0');
        window.dispatchEvent(new Event('resize'));
      });
      section.dataset.pixelb8ToolReady='1';
    }
    return sections;
  };

  window.PixelB8Shell=api;
})();


/* =========================================================
   SHARED PIXELB8 ACCOUNT / SOCIAL RAIL
   ========================================================= */
(function(){
  if(!window.PixelB8Shell)return;

  const PROFILE_KEY='pixelb8_profile_v1';
  const CHAT_TOPIC='pixelb8/site/v1/chat/global';
  const CHAT_BROKER='wss://broker.hivemq.com:8884/mqtt';

  let chatClient=null;
  let chatSeen=new Set();

  PixelB8Shell.getProfile=function(){
    try{
      const saved=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}');
      const name=String(saved.name||'Guest').trim().slice(0,32)||'Guest';
      const initial=String(saved.initial||name.slice(0,1)||'G').trim().slice(0,2).toUpperCase()||'G';
      return {name,initial,isGuest:name.toLowerCase()==='guest'};
    }catch{
      return {name:'Guest',initial:'G',isGuest:true};
    }
  };

  PixelB8Shell.saveProfile=function(profile){
    localStorage.setItem(PROFILE_KEY,JSON.stringify(profile||{}));
    PixelB8Shell.renderProfile?.();
  };

  PixelB8Shell.logout=function(){
    localStorage.removeItem(PROFILE_KEY);
    PixelB8Shell.renderProfile?.();
  };

  PixelB8Shell.renderProfile=function(){
    const p=PixelB8Shell.getProfile();
    document.querySelectorAll('[data-pixelb8-profile-name]').forEach(el=>el.textContent=p.name);
    document.querySelectorAll('[data-pixelb8-profile-initial]').forEach(el=>el.textContent=p.initial);
    document.querySelectorAll('[data-pixelb8-profile-status]').forEach(el=>el.textContent=p.isGuest?'Guest account':'PixelB8 profile');
  };

  PixelB8Shell.toggleRightRail=function(force){
    const shell=document.querySelector('[data-pixelb8-shell]');
    const rail=document.querySelector('[data-pixelb8-right-rail]');
    if(!shell||!rail)return;
    const shouldExpand=typeof force==='boolean'?force:rail.classList.contains('collapsed');
    rail.classList.toggle('collapsed',!shouldExpand);
    shell.classList.toggle('social-expanded',shouldExpand);
  };

  PixelB8Shell.toggleAccountSection=function(target){
    const section=target
      ? (typeof target==='string'?document.querySelector(target):target)
      : document.querySelector('[data-pixelb8-account-section]');
    if(!section)return false;
    const collapsed=section.classList.toggle('collapsed');
    section.querySelector('[data-pixelb8-account-toggle]')?.setAttribute('aria-expanded',String(!collapsed));
    return !collapsed;
  };

  PixelB8Shell.toggleChatSection=function(target){
    const section=target
      ? (typeof target==='string'?document.querySelector(target):target)
      : document.querySelector('[data-pixelb8-chat-section]');
    if(!section)return false;
    const collapsed=section.classList.toggle('collapsed');
    section.querySelector('[data-pixelb8-chat-toggle]')?.setAttribute('aria-expanded',String(!collapsed));
    if(!collapsed){
      requestAnimationFrame(()=>{
        const host=section.querySelector('[data-pixelb8-chat-messages]');
        if(host)host.scrollTop=host.scrollHeight;
      });
    }
    return !collapsed;
  };

  PixelB8Shell.initRightSections=function(root=document){
    root.querySelectorAll('[data-pixelb8-account-section]').forEach(section=>{
      section.classList.add('collapsed');
      section.querySelector('[data-pixelb8-account-toggle]')?.setAttribute('aria-expanded','false');
    });
    root.querySelectorAll('[data-pixelb8-chat-section]').forEach(section=>{
      section.classList.remove('collapsed');
      section.querySelector('[data-pixelb8-chat-toggle]')?.setAttribute('aria-expanded','true');
    });
  };

  PixelB8Shell.openAccountSettings=function(){
    const p=PixelB8Shell.getProfile();
    const back=document.querySelector('[data-pixelb8-account-settings]');
    if(!back)return;
    const name=back.querySelector('[data-pixelb8-account-name-input]');
    const initial=back.querySelector('[data-pixelb8-account-initial-input]');
    if(name)name.value=p.name;
    if(initial)initial.value=p.initial;
    back.classList.remove('hidden');
  };

  PixelB8Shell.closeAccountSettings=function(event){
    const back=document.querySelector('[data-pixelb8-account-settings]');
    if(!back)return;
    if(event&&event.target!==back)return;
    back.classList.add('hidden');
  };

  PixelB8Shell.saveAccountSettings=function(){
    const back=document.querySelector('[data-pixelb8-account-settings]');
    if(!back)return;
    const name=String(back.querySelector('[data-pixelb8-account-name-input]')?.value||'Guest').trim().slice(0,32)||'Guest';
    const initial=String(back.querySelector('[data-pixelb8-account-initial-input]')?.value||name.slice(0,1)||'G').trim().slice(0,2).toUpperCase()||'G';
    PixelB8Shell.saveProfile({name,initial});
    PixelB8Shell.closeAccountSettings();
  };

  function setChatState(online,label){
    document.querySelectorAll('[data-pixelb8-chat-state]').forEach(el=>{
      el.textContent=label;
      el.classList.toggle('online',online);
    });
  }

  function renderSystem(text){
    document.querySelectorAll('[data-pixelb8-chat-messages]').forEach(host=>{
      const row=document.createElement('div');
      row.className='pixelb8-chat-system';
      row.textContent=text;
      host.appendChild(row);
      host.scrollTop=host.scrollHeight;
    });
  }

  function renderMessage(msg){
    const profile=PixelB8Shell.getProfile();
    document.querySelectorAll('[data-pixelb8-chat-messages]').forEach(host=>{
      const row=document.createElement('div');
      row.className='pixelb8-chat-row'+(msg.name===profile.name?' self':'');
      const meta=document.createElement('div');
      meta.className='pixelb8-chat-meta';
      const author=document.createElement('b');
      author.textContent=String(msg.name||'Guest').slice(0,32);
      const time=document.createElement('span');
      time.textContent=new Date(Number(msg.timestamp)||Date.now()).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
      meta.append(author,time);
      const body=document.createElement('div');
      body.textContent=String(msg.text||'').slice(0,240);
      row.append(meta,body);
      host.appendChild(row);
      while(host.children.length>120)host.removeChild(host.firstChild);
      host.scrollTop=host.scrollHeight;
    });
  }

  PixelB8Shell.initChat=function(){
    if(chatClient)return;
    if(typeof mqtt==='undefined'){
      setChatState(false,'OFFLINE');
      renderSystem('MQTT chat library unavailable.');
      return;
    }
    chatClient=mqtt.connect(CHAT_BROKER,{
      clientId:`P8_SITE_CHAT_${Math.random().toString(36).slice(2,12)}`,
      clean:true,
      reconnectPeriod:3000,
      connectTimeout:10000
    });
    chatClient.on('connect',()=>{
      chatClient.subscribe(CHAT_TOPIC);
      setChatState(true,'LIVE');
      renderSystem('Connected to PixelB8 chat.');
    });
    chatClient.on('reconnect',()=>setChatState(false,'RECONNECTING'));
    chatClient.on('offline',()=>setChatState(false,'OFFLINE'));
    chatClient.on('close',()=>setChatState(false,'OFFLINE'));
    chatClient.on('error',()=>setChatState(false,'ERROR'));
    chatClient.on('message',(topic,payload)=>{
      if(topic!==CHAT_TOPIC)return;
      try{
        const msg=JSON.parse(payload.toString());
        if(!msg?.id||!msg?.text||chatSeen.has(msg.id))return;
        chatSeen.add(msg.id);
        renderMessage(msg);
      }catch{}
    });
  };

  PixelB8Shell.sendChat=function(){
    const input=document.querySelector('[data-pixelb8-chat-input]');
    const text=String(input?.value||'').trim().slice(0,240);
    if(!text||!chatClient?.connected)return;
    const p=PixelB8Shell.getProfile();
    chatClient.publish(CHAT_TOPIC,JSON.stringify({
      id:`${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
      name:p.name,
      text,
      timestamp:Date.now()
    }),{qos:0,retain:false});
    if(input)input.value='';
    document.querySelector('[data-pixelb8-emoji-picker]')?.classList.add('hidden');
  };

  PixelB8Shell.toggleEmojiPicker=function(){
    document.querySelector('[data-pixelb8-emoji-picker]')?.classList.toggle('hidden');
  };

  PixelB8Shell.insertEmoji=function(emoji){
    const input=document.querySelector('[data-pixelb8-chat-input]');
    if(!input)return;
    input.value=(input.value+emoji).slice(0,240);
    input.focus();
  };

  PixelB8Shell.initRightRail=function(){
    PixelB8Shell.renderProfile();
    PixelB8Shell.initRightSections(document);
    PixelB8Shell.toggleRightRail(false);
    PixelB8Shell.initChat();
  };
})();
