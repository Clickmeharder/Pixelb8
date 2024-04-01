
var camera, scene, renderer;
var earth, cloud, heatmap;

var pointLight, ambientLight;
var mouseDown = false,
  mouseX = 0,
  mouseY = 0;
var stats;
// Define the markers array
var markers = [];
var markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
var markerGeometry = new THREE.SphereGeometry(1, 8, 8);
  // Add city markers
  var cities = [];

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
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  stats.dom.style.position = 'relative';
  stats.dom.style.display = 'flex-block!important';
  stats.dom.style.top = '0';
  stats.dom.style.width = '100%'; // Set the desired width
  stats.dom.style.height = '100%'; // Set the desired height
  document.getElementById('stats-container').appendChild(stats.dom);


  // Load the displacement map
  var earth_displacement = new THREE.TextureLoader().load(
    "https://i.imgur.com/5zCuDBG.png"
  );

  // Load the ambient occlusion map
  var earth_ao = new THREE.TextureLoader().load(
    "https://i.imgur.com/r6vbejH.png"
  );

  // Earth terrain
  var earth_texture = new THREE.TextureLoader().load(
    //"https://i.imgur.com/jX5Uhq2.png"
    //"https://i.imgur.com/saFysjd.jpeg"
    "https://i.imgur.com/6mWrheX.jpeg"
  );
  var earth_bump = new THREE.TextureLoader().load(
    "https://i.imgur.com/bjFnZmK.jpeg"
	//"https://pixelb8.lul/modules/globemaps/arkadia/newspecularmap.png"
  );
  var earth_specular = new THREE.TextureLoader().load(
    //"https://i.imgur.com/yPiv3Gk.png"
    "https://i.imgur.com/YBFt7oC.jpeg"
  );
  var earth_geometry = new THREE.SphereGeometry(14.5, 32, 32);
  var earth_material = new THREE.MeshPhongMaterial({
    shininess: 0,
    bumpScale: 0.01,
    map: earth_texture,
    bumpMap: earth_bump,
    specularMap: earth_specular,
    displacementMap: earth_displacement, // Add the displacement map
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
  // heatmap
  var heatmap_texture = new THREE.TextureLoader().load(
    "https://pixelb8.lol/Modules/globemaps/arkadia/arkmapoverla-unlabelled.png"
  );
   var heatmap_bump = new THREE.TextureLoader().load(
    "https://pixelb8.lol/Modules/globemaps/arkadia/heatmapspecular.png"
  );
   var heatmap_specular = new THREE.TextureLoader().load(
    "https://pixelb8.lol/Modules/globemaps/arkadia/heatmapnormal.png"
  );
  var heatmap_geometry = new THREE.SphereGeometry(16.5, 32, 32);
  var heatmap_material = new THREE.MeshPhongMaterial({
	shininess: 1,
    bumpScale: .12,

    map: heatmap_texture,
	bumpMap: earth_bump,
	specularMap: earth_specular,
	
	displacementMap: earth_displacement,
	
	displacementScale: 1.1, // Adjust the displacement scale as needed
    transparent: true,
    opacity: 0.8,
 // Adjust the intensity of ambient occlusion effect	
	
	
  });
  heatmap = new THREE.Mesh(heatmap_geometry, heatmap_material);
  scene.add(heatmap);
  //city marker stuff------------------------------------------------------
	// Create marker geometries (spheres for simplicity)
	var markerGeometry = new THREE.SphereGeometry(1, 8, 8);
  // Move the pivot point of the marker geometry up to its center
    markerGeometry.translate(0, 1, 0);
	// Move the pivot point of the marker geometry up to its center
	markerGeometry.translate(0, 1, 0);

	// Create markers
	var centerMarker = new THREE.Mesh(markerGeometry, markerMaterial);
	centerMarker.position.set(0, 0, 0); // Position at the center of the map
	markers.push(centerMarker); // Add to markers array


	// Add city markers
	var cities = [
	  { name: 'New York', position: new THREE.Vector3(10, 0, 10) },
	  { name: 'North Pole', position: new THREE.Vector3(0, 14.5, 0) },
	  { name: 'South Pole', position: new THREE.Vector3(0, -14.5, 0) },
	  { name: 'London', position: new THREE.Vector3(-10, 0, -10) },
	  { name: 'London', position: new THREE.Vector3(-10, 0, -10) },
	  { name: 'Celeste Outpost', position: new THREE.Vector3(14.31204, .5, 14.9521) },
	  { name: 'Celeste Quarry', position: new THREE.Vector3(-15, 0, 5) }
	];

	var markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
	var markerGeometry = new THREE.SphereGeometry(1, 8, 8);

	cities.forEach(city => {
	  var cityMarker = new THREE.Mesh(markerGeometry, markerMaterial);
	  cityMarker.position.copy(city.position);
	  earth.add(cityMarker); // Add city markers to the earth mesh
	});

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
  heatmap.rotation.y += rotationSpeed;

  // Calculate the rotation angle for the markers
  var rotationAngle = rotationSpeed * 300; // Adjust the factor as needed

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

function onMouseMove(evt) {
  if (!mouseDown) return;
  evt.preventDefault();
  var deltaX = evt.clientX - mouseX,
    deltaY = evt.clientY - mouseY;
  mouseX = evt.clientX;
  mouseY = evt.clientY;
  rotateScene(deltaX, deltaY);
}

function onMouseDown(evt) {
  evt.preventDefault();
  mouseDown = true;
  mouseX = evt.clientX;
  mouseY = evt.clientY;
}

function onMouseUp(evt) {
  evt.preventDefault();
  mouseDown = false;
}
function rotateScene(deltaX, deltaY) {
  // Rotate the Earth and clouds based on mouse movement
  earth.rotation.y += deltaX / 300;
  earth.rotation.x += deltaY / 300;
  cloud.rotation.y += deltaX / 300;
  cloud.rotation.x += deltaY / 300;
  heatmap.rotation.y += deltaX / 300;
  heatmap.rotation.x += deltaY / 300;
  // Rotate the markers around the globe's center
  markers.forEach(marker => {
    marker.rotation.y += deltaY / 300; // Rotate around the y-axis
    marker.rotation.x += deltaX / 300; // Adjust the x-axis rotation based on deltaY
  });

  // Log rotation values for debugging
  console.log('Delta X:', deltaX);
  console.log('Delta Y:', deltaY);
  console.log('Earth Rotation Y:', earth.rotation.y);
  console.log('Cloud Rotation Y:', cloud.rotation.y);
  markers.forEach((marker, index) => {
    console.log(`Marker ${index} Rotation Y:`, marker.rotation.y);
    console.log(`Marker ${index} Rotation X:`, marker.rotation.x);
  });
}
// Add an event listener for the wheel event
document.addEventListener("wheel", onScroll);

function onScroll(event) {
 // event.preventDefault(); // Prevent the default scroll behavior

  // Check the deltaY property to determine the scroll direction
  if (event.deltaY > 0) {
    // Scrolling down, move the camera closer (decrease z position)
    camera.position.z += 1; // You can adjust the speed of zooming here
  } else {
    // Scrolling up, move the camera farther (increase z position)
    camera.position.z -= 1; // You can adjust the speed of zooming here
  }
}

// Define variables for raycasting
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
// Define a variable to hold the coordinates
var cursorCoordinates = document.getElementById('cursor-coordinates');

function onDocumentMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster's origin based on the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Find intersected objects
  const intersects = raycaster.intersectObjects(markers);

  if (intersects.length > 0) {
    const intersection = intersects[0];
    const { x, y, z } = intersection.point;
    cursorCoordinates.textContent = `Coordinates: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`;
  } else {
    cursorCoordinates.textContent = 'Coordinates: N/A';
  }
}

// Define a variable to track if the shift key is pressed
var shiftKeyPressed = false;

// Event listener for keydown to track shift key
document.addEventListener("keydown", function (e) {
  if (e.key === "Shift") {
    shiftKeyPressed = true;
  }
});

// Event listener for keyup to track shift key
document.addEventListener("keyup", function (e) {
  if (e.key === "Shift") {
    shiftKeyPressed = false;
  }
});

// Event listener for mouse click on the globe
document.addEventListener("click", function (event) {
  if (shiftKeyPressed) { // Check if shift key is pressed
    // Calculate the intersection point with the globe
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(earth);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const { x, y, z } = intersection.point;

      // Create a new marker at the intersection point
      var newMarker = new THREE.Mesh(markerGeometry, markerMaterial);
      newMarker.position.copy(intersection.point);
      earth.add(newMarker); // Add the new marker to the earth mesh
      markers.push(newMarker); // Add the new marker to the markers array
    }
  }
});
