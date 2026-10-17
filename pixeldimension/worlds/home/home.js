(()=>{'use strict';

PixelDimension.bootstrapRoom({
  roomComponent:'pd-home',
  interactionProviders:[()=>PixelDimension.portalProvider()],
  build(){
    const host=document.getElementById('roomHost');

    host.innerHTML=
      PixelDimension.BasicAssets.door({
        id:'doorClassroom',x:-3.8,z:-4.5,label:'CLASSROOM',
        target:'worlds/classroom/index.html'
      })+
      PixelDimension.BasicAssets.door({
        id:'doorExample',x:0,z:-4.5,label:'EXAMPLE ROOM',
        target:'worlds/example-room/index.html'
      })+
      PixelDimension.BasicAssets.door({
        id:'doorVoid',x:3.8,z:-4.5,label:'VOID TEST',
        target:'worlds/void-test/index.html'
      })+
      PixelDimension.BasicAssets.door({
        id:'doorArcade',x:0,z:4.0,rot:180,label:'PIXELB8 ARCADE',
        target:'../arcade/xr/index.html'
      });
  }
});

})();