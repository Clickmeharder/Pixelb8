

var camera, scene, renderer;
var earth, cloud;
var pointLight, ambientLight;
var mouseDown = false,
  mouseX = 0,
  mouseY = 0;
var stats;
// Define the markers array
var markers = [];
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

  // Create marker materials
  var markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  // Create marker geometries (spheres for simplicity)
  var markerGeometry = new THREE.SphereGeometry(0.5, 16, 16);

  // Create markers
  var centerMarker = new THREE.Mesh(markerGeometry, markerMaterial);
  centerMarker.position.set(0, 0, 0); // Position at the center of the map
  markers.push(centerMarker); // Add to markers array

  var northPoleMarker = new THREE.Mesh(markerGeometry, markerMaterial);
  northPoleMarker.position.set(0, 14.5, 0); // Position at the north pole
  markers.push(northPoleMarker); // Add to markers array

  var southPoleMarker = new THREE.Mesh(markerGeometry, markerMaterial);
  southPoleMarker.position.set(0, -14.5, 0); // Position at the south pole
  markers.push(southPoleMarker); // Add to markers array

  // Add markers to the scene
  markers.forEach(marker => {
    scene.add(marker);
  });
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
    //"https://imgur.com/h8UcRzr"
    "https://imgur.com/RXs3ea8"
  );
  var earth_specular = new THREE.TextureLoader().load(
    //"https://i.imgur.com/yPiv3Gk.png"
    "https://i.imgur.com/YBFt7oC.jpeg"
  );
  var earth_geometry = new THREE.SphereGeometry(14.5, 32, 32);
  var earth_material = new THREE.MeshPhongMaterial({
    shininess: 0,
    bumpScale: 1,
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

  // Add city markers
  var cities = [
    { name: 'New York', position: new THREE.Vector3(10, 0, 10) },
    { name: 'London', position: new THREE.Vector3(-10, 0, -10) },
    { name: 'Celeste Outpost', position: new THREE.Vector3(15, 0, -5) },
    { name: 'Celeste Quarry', position: new THREE.Vector3(-15, 0, 5) }
  ];


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
  earth.rotation.y += 0.001;
  cloud.rotation.y += 0.001;
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
  earth.rotation.y += deltaX / 300;
  earth.rotation.x += deltaY / 300;
  cloud.rotation.y += deltaX / 300;
  cloud.rotation.x += deltaY / 300;
}

// Add an event listener for the wheel event
document.addEventListener("wheel", onScroll);

function onScroll(event) {
  event.preventDefault(); // Prevent the default scroll behavior

  // Check the deltaY property to determine the scroll direction
  if (event.deltaY > 0) {
    // Scrolling down, move the camera closer (decrease z position)
    camera.position.z += 1; // You can adjust the speed of zooming here
  } else {
    // Scrolling up, move the camera farther (increase z position)
    camera.position.z -= 1; // You can adjust the speed of zooming here
  }
}
