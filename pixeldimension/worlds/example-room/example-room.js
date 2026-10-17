(()=>{'use strict';

PixelDimension.bootstrapRoom({
  roomComponent:'pd-example-room',
  interactionProviders:[()=>PixelDimension.portalProvider()],
  build(){
    const host=document.getElementById('roomHost');
    const A=PixelDimension.BasicAssets;

    host.innerHTML=`
      <a-text value="EXAMPLE ASSET ROOM" position="0 2.7 -4.86"
        align="center" color="#89dfff" width="4"></a-text>
      ${A.table({id:'meetingTable',x:0,z:-.6,w:3.4,d:1.4,color:'#4b3425'})}
      ${A.chair({x:-1.7,z:-.6,rot:-90,color:'#374653'})}
      ${A.chair({x:1.7,z:-.6,rot:90,color:'#374653'})}
      ${A.chair({x:0,z:-1.65,rot:0,color:'#374653'})}
      ${A.chair({x:0,z:.45,rot:180,color:'#374653'})}

      <a-box position="-3.8 .65 -3.8" width="1.1" height="1.3" depth=".65" color="#3a2a20"></a-box>
      <a-box position="3.8 .45 -3.8" width="1.4" height=".9" depth=".7" color="#26313a"></a-box>

      ${A.door({id:'homeDoor',x:-4.2,z:4.1,label:'HOME',target:'../../index.html'})}
      ${A.door({id:'voidDoor',x:4.2,z:4.1,label:'VOID TEST',target:'../void-test/index.html'})}
    `;
  }
});

})();