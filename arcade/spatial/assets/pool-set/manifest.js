window.PixelB8PoolSetManifest={
  id:'pixelb8.pool-set',
  name:'PixelB8 Pool Table Set',
  version:'0.33.0',
  kind:'interactive-furniture-set',
  portable:true,
  multiplayer:true,
  instancePolicy:'one-session-per-table',
  defaultPlacement:{
    position:[0,0,0],
    rotation:[0,0,0]
  },
  contents:[
    'pool-table',
    '16-ball-set',
    'bridge-rest',
    'triangle-rack'
  ],
  compatibleItems:['pixelb8.pool-cue'],
  recommendedCompanions:['pixelb8.pool-cue-rack'],
  capabilities:[
    'physics',
    'cue-contact-aiming',
    'cue-reach',
    'cue-elevation',
    'crouch-aware-stance',
    'jump-shots',
    'trajectory-preview',
    '8-ball-rules',
    'free-play',
    'auto-rack',
    'manual-rack',
    'ball-in-hand',
    'pocketed-ball-tracking'
  ],
  controls:{
    stroke:'LMB drag/release',
    reach:'RMB + mouse X',
    cueElevation:'mouse wheel',
    crouch:'Shift + mouse wheel',
    stand:'MMB',
    leave:'Backspace'
  },
  dependencies:[
    'PixelB8 Spatial Runtime',
    'THREE',
    'A-Frame'
  ],
  migration:{
    stage:'legacy-adapter',
    note:'Geometry and gameplay currently execute through the Arcade XR implementation. The asset contract is now stable so implementation can move behind it without changing world manifests.'
  }
};