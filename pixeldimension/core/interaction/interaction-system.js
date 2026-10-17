(()=>{'use strict';

const PD=window.PixelDimension=window.PixelDimension||{};

class InteractionSystem{
  constructor({cameraId='playerCamera',promptId='pdInteractionPrompt'}={}){
    this.cameraId=cameraId;
    this.promptId=promptId;
    this.providers=[];
    this.focus=null;
    this._installed=false;
  }

  get camera(){return document.getElementById(this.cameraId);}
  get prompt(){return document.getElementById(this.promptId);}

  install(context={}){
    if(this._installed)return this;
    this._installed=true;

    window.addEventListener('keydown',e=>{
      if(e.key!=='Enter')return;
      if(context.player?.isEditable?.(e.target))return;
      if(this.interact(context))e.preventDefault();
    });

    return this;
  }

  register(provider){
    if(provider&&!this.providers.includes(provider))this.providers.push(provider);
    return provider;
  }

  unregister(provider){
    const i=this.providers.indexOf(provider);
    if(i>=0)this.providers.splice(i,1);
  }

  update(context={}){
    let best=null;

    for(const provider of this.providers){
      const candidate=provider?.getInteraction?.(this.camera,context);
      if(!candidate)continue;
      if(!best||(candidate.score??0)>(best.score??0)){
        best={...candidate,provider};
      }
    }

    this.focus=best;

    if(this.prompt){
      this.prompt.classList.toggle('hidden',!best);
      if(best)this.prompt.textContent=best.label||'INTERACT [ENTER]';
    }

    return best;
  }

  interact(context={}){
    if(!this.focus)return false;
    return this.focus.provider?.interact?.(this.focus,context)!==false;
  }
}

PD.InteractionSystem=InteractionSystem;

})();