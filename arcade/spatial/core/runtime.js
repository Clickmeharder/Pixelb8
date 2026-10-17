(()=>{'use strict';
const Core=window.PixelB8SpatialCore=window.PixelB8SpatialCore||{};
const EventBus=Core.EventBus;

class ModuleRegistry{
  constructor(){this.modules=new Map();this.games=new Map();}
  register(id,module){this.modules.set(id,module);return module;}
  registerGame(id,module){this.games.set(id,module);return module;}
  get(id){return this.modules.get(id);}
  getGame(id){return this.games.get(id);}
}

class GameSession{
  constructor({id,type,capacity=2,bus}={}){
    this.id=id;this.type=type;this.capacity=capacity;this.bus=bus;
    this.players=new Set();this.spectators=new Set();this.state='idle';this.meta={};
  }
  join(playerId,{spectator=false}={}){
    (spectator?this.spectators:this.players).add(playerId);
    this.state=this.players.size?'active':'idle';
    this.bus?.emit('session:join',{session:this,playerId,spectator});
  }
  leave(playerId){
    this.players.delete(playerId);this.spectators.delete(playerId);
    this.state=this.players.size?'active':'idle';
    this.bus?.emit('session:leave',{session:this,playerId});
  }
  serialize(){return{id:this.id,type:this.type,state:this.state,capacity:this.capacity,players:[...this.players],spectators:[...this.spectators],meta:this.meta};}
}

class InterestManager{
  constructor({near=8,mid=20,far=40}={}){this.near=near;this.mid=mid;this.far=far;}
  tier(distance){return distance<=this.near?'near':distance<=this.mid?'mid':distance<=this.far?'far':'culled';}
  updateHz(distance){const t=this.tier(distance);return t==='near'?15:t==='mid'?5:t==='far'?2:0;}
}

class InstanceClient{
  constructor({worldId,instanceId=null,url=null,bus}={}){
    this.worldId=worldId;this.instanceId=instanceId;this.url=url;this.bus=bus;this.socket=null;this.connected=false;
  }
  connect(){
    if(!this.url)return Promise.resolve(false);
    return new Promise((resolve,reject)=>{
      const ws=new WebSocket(this.url);this.socket=ws;
      ws.addEventListener('open',()=>{this.connected=true;this.send('hello',{worldId:this.worldId,instanceId:this.instanceId});this.bus?.emit('network:open',{client:this});resolve(true);});
      ws.addEventListener('message',e=>{let msg=e.data;try{msg=JSON.parse(msg);}catch{}this.bus?.emit('network:message',msg);});
      ws.addEventListener('close',()=>{this.connected=false;this.bus?.emit('network:close',{client:this});});
      ws.addEventListener('error',reject);
    });
  }
  send(type,payload={}){if(this.socket?.readyState===1)this.socket.send(JSON.stringify({type,payload}));}
  close(){this.socket?.close();}
}

class SpatialRuntime{
  constructor(manifest={}){
    this.manifest=manifest;
    this.bus=new EventBus();
    this.registry=new ModuleRegistry();
    this.interest=new InterestManager(manifest.interest);
    this.sessions=new Map();
    this.instance=new InstanceClient({
      worldId:manifest.id,
      instanceId:manifest.instance?.id||null,
      url:manifest.network?.roomUrl||null,
      bus:this.bus
    });
  }
  registerGame(id,module){return this.registry.registerGame(id,module);}
  createSession(opts){
    const session=new GameSession({...opts,bus:this.bus});
    this.sessions.set(session.id,session);
    return session;
  }
  start(){
    this.bus.emit('runtime:start',{runtime:this,manifest:this.manifest});
    window.dispatchEvent(new CustomEvent('pixelb8-spatial-ready',{detail:{runtime:this}}));
    return this;
  }
}
Core.ModuleRegistry=ModuleRegistry;
Core.GameSession=GameSession;
Core.InterestManager=InterestManager;
Core.InstanceClient=InstanceClient;
Core.SpatialRuntime=SpatialRuntime;
window.PixelB8Spatial=window.PixelB8Spatial||{};
window.PixelB8Spatial.createRuntime=manifest=>new SpatialRuntime(manifest);
})();