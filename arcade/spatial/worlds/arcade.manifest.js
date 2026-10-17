window.PixelB8WorldManifest={
  id:'pixelb8-arcade',
  name:'PixelB8 Arcade',
  version:'0.33',
  capacity:24,
  spawn:{x:0,y:0,z:8},
  instance:{strategy:'capacity',softCapacity:24},
  interest:{near:8,mid:20,far:40},
  network:{
    transport:'websocket',
    roomUrl:null,
    note:'Room URL intentionally unset until authoritative instance service is deployed.'
  },
  systems:['player','input','interaction','inventory','hotbar','posture','seating','chat','presence'],
  assets:[
    {id:'pool-main',asset:'pixelb8.pool-set',position:[8.7,0,3.25],rotation:[0,0,0]},
    {id:'pool-cue-rack-main',asset:'pixelb8.pool-cue-rack',position:[16.8,0,3.25],rotation:[0,-90,0]}
  ],
  games:[
    {id:'pool-main-session',type:'pool',capacity:2,assetInstance:'pool-main'},
    {id:'connect4-main',type:'connect4',capacity:2,position:[3.4,0,2.7]},
    {id:'cards-main',type:'cards',capacity:4,position:[0,0,2.7]}
  ],
  portals:[{id:'arcade-exit',target:'../index.html',label:'2D Arcade'}]
};