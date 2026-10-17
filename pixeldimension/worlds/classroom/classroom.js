(()=>{'use strict';

PixelDimension.bootstrapRoom({
  roomComponent:'pd-classroom',
  interactionProviders:[()=>PixelDimension.portalProvider()],
  build(){
    const host=document.getElementById('roomHost');
    const A=PixelDimension.BasicAssets;

    let html=`
      <a-box position="0 1.75 -5.82" width="5.2" height="1.55" depth=".05" color="#1d352d"></a-box>
      <a-text value="PIXELDIMENSION CLASSROOM" position="0 2.65 -5.76"
        align="center" color="#d6e7dd" width="4"></a-text>
    `;

    html+=A.table({id:'teacherDesk',x:0,z:-4,w:2.3,d:.9,color:'#5a402a'});
    html+=A.chair({id:'teacherChair',x:0,z:-4.85,rot:180,color:'#344754'});

    const rows=[-1.7,.2,2.1];
    for(const z of rows){
      for(const x of [-3,-1,1,3]){
        html+=A.table({x,z,w:1.25,d:.7,color:'#4b3929'});
        html+=A.chair({x,z:z+.75,rot:180,color:'#35424d'});
      }
    }

    html+=A.door({id:'homeDoor',x:-4.8,z:5.82,label:'HOME',target:'../../index.html'});

    host.innerHTML=html;
  }
});

})();