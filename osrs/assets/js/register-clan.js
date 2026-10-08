window.ClanRegistration = (() => {
  const REGISTER_URL="https://us-west1-pixelb8-osrs-clans.cloudfunctions.net/registerClan";
  const slugify=value=>String(value||"").trim().toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,64);
  function routeSlug(){
    const route=window.OSRSApp?.route?.()||'';
    const parts=route.split('/');
    return parts[0]==='clans'&&parts[1]==='register'?(parts[2]||''):'';
  }
  function init(){
    const form=document.getElementById("registerClanForm"); if(!form)return;
    const button=document.getElementById("registerClanButton"),status=document.getElementById("registerClanStatus"),success=document.getElementById("registrationSuccess"),keyInput=document.getElementById("verificationKey"),copyButton=document.getElementById("copyVerificationKey"),openClanPage=document.getElementById("openClanPage"),openClanOffice=document.getElementById("openClanOffice");
    const localSlug=routeSlug();
    const localClan=localSlug?window.OSRSClans?.getLocal?.(localSlug):null;
    const clanNameInput=document.getElementById("clanName");
    const registeredByInput=document.getElementById("registeredBy");
    const profile=window.VTAM?.currentProfile?.();
    if(localClan){
      clanNameInput.value=localClan.displayName||localClan.name||'';
      clanNameInput.readOnly=true;
      if(localClan.createdBy) registeredByInput.value=localClan.createdBy;
    }
    if(!registeredByInput.value && profile?.rsn && !profile.unavailable) registeredByInput.value=profile.rsn;
    const showStatus=(message,kind="info")=>{status.hidden=false;status.className=`registration-status ${kind}`;status.textContent=message};
    if(!localClan){
      showStatus('Create a local clan first, then register that clan here if you want PixelB8-hosted roster syncing.','info');
      button.disabled=true;
    }
    form.onsubmit=async event=>{event.preventDefault();const clanName=clanNameInput.value.trim(),registeredBy=registeredByInput.value.trim();if(!localClan||!clanName||!registeredBy)return;button.disabled=true;success.hidden=true;showStatus("Registering clan…");try{const response=await fetch(REGISTER_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({clanName,registeredBy})});let data={};try{data=await response.json()}catch(_){}if(!response.ok||!data.ok){if(data.error==="clan_already_registered")throw new Error("That clan is already registered on PixelB8.");if(data.error==="clan_limit_reached")throw new Error("PixelB8 clan registration is currently full.");throw new Error(data.error||`Registration failed (${response.status}).`)}const clanId=data.clanId||slugify(clanName);keyInput.value=data.verificationKey||"";if(data.verificationKey)localStorage.setItem(`pixelb8_clan_owner_key:${clanId}`,data.verificationKey);window.OSRSClans?.markRegistered?.(clanId);openClanPage.href=`#clans/${encodeURIComponent(clanId)}`;if(openClanOffice)openClanOffice.href="#dashboard/clan/office";success.hidden=false;showStatus(`${data.clanName||clanName} is now PixelB8 Registered.` ,"success")}catch(error){console.error("Clan registration failed:",error);showStatus(error.message||"Clan registration failed.","error")}finally{button.disabled=false}};
    copyButton.onclick=async()=>{const value=keyInput.value;if(!value)return;try{await navigator.clipboard.writeText(value);copyButton.textContent="Copied";setTimeout(()=>{copyButton.textContent="Copy Key"},1500)}catch(_){keyInput.select();document.execCommand("copy")}};
  }
  return {init};
})();
