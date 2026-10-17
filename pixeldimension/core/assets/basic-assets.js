(()=>{'use strict';

const PD=window.PixelDimension=window.PixelDimension||{};
const Basic=PD.BasicAssets=PD.BasicAssets||{};

Basic.table=({id,x=0,y=.72,z=0,w=2,d=1,color='#3a2a1d'}={})=>`
  <a-entity id="${id||''}" data-pd-collider="box" data-halfx="${w/2}" data-halfz="${d/2}" position="${x} 0 ${z}">
    <a-box position="0 ${y} 0" width="${w}" height=".10" depth="${d}" color="${color}"></a-box>
    <a-box position="${-w*.38} ${y*.45} ${-d*.35}" width=".10" height="${y*.9}" depth=".10" color="${color}"></a-box>
    <a-box position="${w*.38} ${y*.45} ${-d*.35}" width=".10" height="${y*.9}" depth=".10" color="${color}"></a-box>
    <a-box position="${-w*.38} ${y*.45} ${d*.35}" width=".10" height="${y*.9}" depth=".10" color="${color}"></a-box>
    <a-box position="${w*.38} ${y*.45} ${d*.35}" width=".10" height="${y*.9}" depth=".10" color="${color}"></a-box>
  </a-entity>`;

Basic.chair=({id,x=0,z=0,rot=0,color='#33404b'}={})=>`
  <a-entity id="${id||''}" class="pd-seat" data-seat="true"
    position="${x} 0 ${z}" rotation="0 ${rot} 0">
    <a-box position="0 .45 0" width=".58" height=".10" depth=".58" color="${color}"></a-box>
    <a-box position="0 .82 .25" width=".58" height=".68" depth=".08" color="${color}"></a-box>
    <a-box position="-.22 .20 -.22" width=".07" height=".40" depth=".07" color="${color}"></a-box>
    <a-box position=".22 .20 -.22" width=".07" height=".40" depth=".07" color="${color}"></a-box>
    <a-box position="-.22 .20 .22" width=".07" height=".40" depth=".07" color="${color}"></a-box>
    <a-box position=".22 .20 .22" width=".07" height=".40" depth=".07" color="${color}"></a-box>
  </a-entity>`;

Basic.door=({id,x=0,y=1.2,z=0,rot=0,label='DOOR',target=''}={})=>`
  <a-entity id="${id||''}" class="pd-door" data-pd-door="${target}"
    position="${x} 0 ${z}" rotation="0 ${rot} 0">
    <a-box position="0 ${y} 0" width="1.25" height="2.4" depth=".12" color="#24303a"></a-box>
    <a-text value="${label}" position="0 2.55 .08" align="center" color="#9adcf5" width="2"></a-text>
  </a-entity>`;

})();