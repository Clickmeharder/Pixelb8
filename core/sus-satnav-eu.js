
var camera, scene, renderer;
var earth, cloud, TPmap;
var earth_texture;
var ark_defaulttexture;
var ark_tptexture;
var earth_displacement;
var landareas;
var pointLight, ambientLight;
var rotationEnabled = true;
var mouseDown = false,
  mouseX = 0,
  mouseY = 0;
var stats;
var markers = [];
var markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
var markerGeometry = new THREE.SphereGeometry(1, 8, 8);
var cities = [];
var mapTextures = [];

init();
animate();

function init() {
  // initialization
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 80;
  stats = new Stats();
  stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
  stats.dom.style.position = 'relative';
  stats.dom.style.display = 'flex-block!important';
  stats.dom.style.top = '0';
  stats.dom.style.width = '100%'; // Set the desired width
  stats.dom.style.height = '100%'; // Set the desired height
  document.getElementById('stats-container').appendChild(stats.dom);
  // Load the displacement map
  var caly_defaulttexture = new THREE.TextureLoader().load(
	"https://pixelb8.lol/Modules/globemaps/arkadia/PlanetCalypsomap.jpg"
  );
  var earth_displacement = new THREE.TextureLoader().load(
    "https://i.imgur.com/5zCuDBG.png"
  );
  // Load the ambient occlusion map
  var earth_ao = new THREE.TextureLoader().load(
    "https://i.imgur.com/r6vbejH.png"
  );
  // Earth terrain
  var earth_texture = new THREE.TextureLoader().load(
	"https://pixelb8.lol/Modules/globemaps/arkadia/arkadiaglobemap.png"
	// "https://pixelb8.lol/Modules/globemaps/arkadia/arkmap-tpmap.png"
    //"https://i.imgur.com/6mWrheX.jpeg"
  );
  // Earth terrain
  var ark_defaulttexture = new THREE.TextureLoader().load(
	"https://pixelb8.lol/Modules/globemaps/arkadia/arkadiaglobemap.png"
  );
  var ark_tptexture = new THREE.TextureLoader().load(
	"https://pixelb8.lol/Modules/globemaps/arkadia/arkmap-tpmap.png"
  );

  var earth_bump = new THREE.TextureLoader().load(
    "https://i.imgur.com/bjFnZmK.jpeg"
	//"https://pixelb8.lul/modules/globemaps/arkadia/newspecularmap.png"
  );
  var earth_specular = new THREE.TextureLoader().load(
    //"https://i.imgur.com/yPiv3Gk.png"
    "https://i.imgur.com/YBFt7oC.jpeg"
  );
  mapTextures.push(earth_texture, ark_defaulttexture, ark_tptexture, earth_displacement);
  var earth_geometry = new THREE.SphereGeometry(14.5, 32, 32);
  var earth_material = new THREE.MeshPhongMaterial({
    shininess: 0,
    bumpScale: 0.01,
    map: earth_texture,
    bumpMap: earth_bump,
    specularMap: earth_specular,
    displacementMap: earth_displacement, 
    displacementScale: 1.1, // Adjust the displacement scale as needed
    aoMap: earth_ao, // Add the ambient occlusion map
    aoMapIntensity: 1.8, // Adjust the intensity of ambient occlusion effect
  });
  earth = new THREE.Mesh(earth_geometry, earth_material);
  scene.add(earth);

  // Earth cloud
  var cloud_texture = new THREE.TextureLoader().load(
    "https://i.postimg.cc/k4WhFtFh/cloud.png"
  );
  var cloud_geometry = new THREE.SphereGeometry(15.5, 32, 32);
  var cloud_material = new THREE.MeshBasicMaterial({
    map: cloud_texture,
    transparent: true,
    opacity: 0.4
  });
  cloud = new THREE.Mesh(cloud_geometry, cloud_material);
  scene.add(cloud);

  // TPmap
  var TPmap_texture = new THREE.TextureLoader().load(
    "https://pixelb8.lol/Modules/globemaps/arkadia/ark-TPmap.png"
  );
  var TPmap_geometry = new THREE.SphereGeometry(15.5, 32, 32);
  var TPmap_material = new THREE.MeshBasicMaterial({
    map: TPmap_texture,
    transparent: true,
    opacity: 0.4
  });
  TPmap = new THREE.Mesh(TPmap_geometry, TPmap_material);
  scene.add(TPmap);
  // landareas
  var landareas_texture = new THREE.TextureLoader().load(
    "https://pixelb8.lol/Modules/globemaps/arkadia/ark-landareas.png"
  );

  var landareas_geometry = new THREE.SphereGeometry(16.5, 32, 32);
  var landareas_material = new THREE.MeshPhongMaterial({
	shininess: 1,
    bumpScale: 0.01,
    map: landareas_texture,
	bumpMap: earth_bump,
	specularMap: earth_specular,
	displacementMap: earth_displacement,
	displacementScale: 1.1, 
    transparent: true,
    opacity: 0.8,	
	
	
  });
  landareas = new THREE.Mesh(landareas_geometry, landareas_material);
  scene.add(landareas);
	function addTextLabel(marker, labelText) {
	  // Create a div element for the label
	  var labelElement = document.createElement('div');
	  labelElement.className = 'marker-label';
	  labelElement.textContent = labelText;

	  // Position the label relative to the marker's position
	  var labelPosition = marker.position.clone(); // Clone marker's position
	  labelPosition.y += 2; // Adjust the vertical position of the label

	  // Convert 3D position to 2D screen coordinates
	  var screenPosition = labelPosition.project(camera);
	  var screenWidth = window.innerWidth,
		screenHeight = window.innerHeight;
	  var x = Math.round((screenPosition.x + 1) * screenWidth / 2);
	  var y = Math.round((-screenPosition.y + 1) * screenHeight / 2);

	  // Set label's CSS styles for position and appearance
	  labelElement.style.position = 'absolute';
	  labelElement.style.left = x + 'px';
	  labelElement.style.top = y + 'px';
	  labelElement.style.pointerEvents = 'none'; // Ensure the label doesn't block mouse events
	  labelElement.style.zIndex = 100; // Set the z-index to ensure it's above other elements

	  // Append the label to the document body
	  document.body.appendChild(labelElement);
	}

//End of city marker stuff------------------------------------------------------

  //point light (upper left) 
  pointLight = new THREE.PointLight(0xffffff);
  pointLight.position.set(-400, 100, 150);
  scene.add(pointLight);

  // ambient light
  ambientLight = new THREE.AmbientLight(0x222222);
  scene.add(ambientLight);

  // renderer
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setClearColor(0xffffff, 0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // event handler
  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener(
    "mousemove",
    function (e) {
      onMouseMove(e);
    },
    false
  );
  document.addEventListener(
    "mousedown",
    function (e) {
      onMouseDown(e);
    },
    false
  );
  document.addEventListener(
    "mouseup",
    function (e) {
      onMouseUp(e);
    },
    false
  );
}
function animate() {
  requestAnimationFrame(animate);
  stats.begin();

  var rotationSpeed = 0.001; // Adjust this value as needed for the desired rotation speed
  earth.rotation.y += rotationSpeed;
  cloud.rotation.y += rotationSpeed;
  landareas.rotation.y += rotationSpeed;
  TPmap.rotation.y += rotationSpeed;
  // Rotate the markers around the globe's center
  markers.forEach(marker => {
    marker.rotateY(rotationAngle); // Rotate around the y-axis
  });

  stats.end();
  renderer.render(scene, camera);
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
// Function to toggle rotation based on checkbox state
function toggleRotation() {
  rotationEnabled = document.getElementById('rotationCheckbox').checked;
}
function onMouseMove(evt) {
  if (!mouseDown) return;
  var deltaX = evt.clientX - mouseX,
    deltaY = evt.clientY - mouseY;
  mouseX = evt.clientX;
  mouseY = evt.clientY;
  rotateScene(deltaX, deltaY);
}

function onMouseDown(evt) {
  if (!rotationEnabled) return;
  mouseDown = true;
  mouseX = evt.clientX;
  mouseY = evt.clientY;
}

function onMouseUp(evt) {
  mouseDown = false;
}
function rotateScene(deltaX, deltaY) {
  if (!rotationEnabled) return;
  // Rotate the Earth and clouds based on mouse movement
  earth.rotation.y += deltaX / 300;
  earth.rotation.x += deltaY / 300;
  cloud.rotation.y += deltaX / 300;
  cloud.rotation.x += deltaY / 300;
  landareas.rotation.y += deltaX / 300;
  landareas.rotation.x += deltaY / 300;
  TPmap.rotation.y += deltaX / 300;
  TPmap.rotation.x += deltaY / 300;
  // Rotate the markers around the globe's center
  markers.forEach(marker => {
    marker.rotation.y += deltaY / 300; // Rotate around the y-axis
    marker.rotation.x += deltaX / 300; // Adjust the x-axis rotation based on deltaY
  });

}
// Add an event listener for the wheel event
document.addEventListener("wheel", onScroll);

function onScroll(event) {
  // Check if rotation is enabled


  // Check the deltaY property to determine the scroll direction
  if (event.deltaY > 0) {
    // Scrolling down, move the camera closer (decrease z position)
    camera.position.z += 1; // Decrease the distance by 1 unit
    // Optionally, add a limit for how close the camera can go
    if (camera.position.z < 50) { // Adjust the limit as needed
      camera.position.z = 50; // Set a minimum distance
    }
  } else {
    // Scrolling up, move the camera farther (increase z position)
    camera.position.z -= 1; // Increase the distance by 1 unit
    // Optionally, add a limit for how far the camera can go
    if (camera.position.z > 150) { // Adjust the limit as needed
      camera.position.z = 150; // Set a maximum distance
    }
  }
}






//------------------
// controlbar
//-----------------------------

// Function to toggle visibility of specific elements
/* function toggleElement(elementName) {
  var element = scene.getObjectByName(elementName);
  console.log('Toggling element:', elementName);
  if (element) {
    element.visible = elementName.checked;
    renderer.render(scene, camera);
  }
} */

// Function to adjust opacity of specific elements
/* function adjustOpacity(value, elementName) {
  var element = scene.getObjectByName(elementName);
  console.log('Adjusting opacity for element:', elementName, 'with value:', value);
  if (element) {
    var opacityValue = Math.min(Math.max(parseFloat(value) / 100, 0), 1);
    element.material.opacity = opacityValue;
    renderer.render(scene, camera);
  }
} */

/* function toggleClouds() {
  cloud.material.opacity = 0;
  console.log('clouds toggled');
} */
/* function toggleTPmap() {
  TPmap.material.opacity = 0;
  console.log('TPmap toggled');
} */
/* function togglelandareas() {
  landareas.material.opacity = 0;
  console.log('landareas toggled');
} */
function toggleClouds() {
  // Check the current opacity of the cloud material
  var currentOpacity = cloud.material.opacity;
  
  // Toggle the opacity between 0 and 1.00
  if (currentOpacity === 0) {
    cloud.material.opacity = 1.00;
	console.log('clouds toggled ON');
  } else {
    cloud.material.opacity = 0;
	console.log('clouds toggled OFF');
  }
}
function togglelandareas() {
  // Check the current opacity of the cloud material
  var currentOpacity = landareas.material.opacity;
  
  // Toggle the opacity between 0 and 1.00
  if (currentOpacity === 0) {
    landareas.material.opacity = 1.00;
	console.log('landareas toggled ON');
  } else {
    landareas.material.opacity = 0;
	console.log('landareas toggled OFF');
  }
}
function toggleTPmap() {
  // Check the current opacity of the cloud material
  var currentOpacity = TPmap.material.opacity;
  // Toggle the opacity between 0 and 1.00
  if (currentOpacity === 0) {
    TPmap.material.opacity = 1.00;
	console.log('TPmap toggled ON');
  } else {
    TPmap.material.opacity = 0;
	console.log('TPmap toggled OFF');
  }
}
function toggleWildlifemap() {
  // Check the current opacity of the cloud material
  var currentOpacity = Wildlifemap.material.opacity;
  // Toggle the opacity between 0 and 1.00
  if (currentOpacity === 0) {
    Wildlifemap.material.opacity = 1.00;
	console.log('TPmap toggled ON');
  } else {
    Wildlifemap.material.opacity = 0;
	console.log('TPmap toggled OFF');
  }
}
function togglePvpzonemap() {
  // Check the current opacity of the cloud material
  var currentOpacity = Pvpzonemap.material.opacity;
  // Toggle the opacity between 0 and 1.00
  if (currentOpacity === 0) {
    Pvpzonemap.material.opacity = 1.00;
	console.log('TPmap toggled ON');
  } else {
    Pvpzonemap.material.opacity = 0;
	console.log('TPmap toggled OFF');
  }
}
function togglePvplootablemap() {
  // Check the current opacity of the cloud material
  var currentOpacity = Pvplootablemap.material.opacity;
  // Toggle the opacity between 0 and 1.00
  if (currentOpacity === 0) {
    Pvplootablemap.material.opacity = 1.00;
	console.log('TPmap toggled ON');
  } else {
    Pvplootablemap.material.opacity = 0;
	console.log('TPmap toggled OFF');
  }
}
//SLIDERS
// Function to adjust cloud opacity
function adjustCloudOpacity(value) {
  cloud.material.opacity = parseFloat(value);
}
// wokring functions
function adjustLightIntensity(value) {
  pointLight.intensity = parseFloat(value);
}

function adjustAmbientLightIntensity(value) {
  ambientLight.intensity = parseFloat(value);
}

var currentMapIndex = 0;
function cycleMap() {
  currentMapIndex++;

  if (currentMapIndex >= mapTextures.length) {
    currentMapIndex = 0;
  }

  earth_material.map = mapTextures[currentMapIndex];

  // You can set a flag to indicate that a render update is needed
  // This flag can be checked in your animation loop or update function
  // and trigger a render update when necessary
  needsRenderUpdate = true;
}