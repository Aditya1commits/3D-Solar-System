import * as THREE from "https://cdn.skypack.dev/three@0.129.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls;
let planets = {};
let isAnimating = true;

const orbitRadii = {
  mercury: 50,
  venus: 60,
  earth: 70,
  mars: 80,
  jupiter: 100,
  saturn: 120,
  uranus: 140,
  neptune: 160,
};

const speedControls = {
  mercury: 2,
  venus: 1.5,
  earth: 1,
  mars: 0.8,
  jupiter: 0.7,
  saturn: 0.6,
  uranus: 0.5,
  neptune: 0.4,
};

function createPlanet(name, texturePath, radius, isSun = false) {
  const geometry = new THREE.SphereGeometry(radius, 64, 64);
  const texture = new THREE.TextureLoader().load(texturePath);
  let material;

  if (isSun) {
    material = new THREE.MeshBasicMaterial({
      map: texture,
      emissive: 0xffaa00,
      emissiveIntensity: 2,
      toneMapped: false
    });
  } else {
    material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.0
    });
  }

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  planets[name] = mesh;
}

function createRing(radius) {
  const geometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 100);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI / 2;
  scene.add(mesh);
}

function createSliders() {
  const container = document.getElementById("sliders");
  Object.keys(speedControls).forEach((planet) => {
    const label = document.createElement("label");
    label.textContent = `${planet.charAt(0).toUpperCase() + planet.slice(1)}: `;

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0.1";
    slider.max = "20"; // Increased max speed
    slider.step = "0.1";
    slider.value = speedControls[planet];
    slider.oninput = () => {
      speedControls[planet] = parseFloat(slider.value);
    };

    container.appendChild(label);
    container.appendChild(slider);
    container.appendChild(document.createElement("br"));
  });
}

function addSkybox() {
  const loader = new THREE.TextureLoader();
  const bgTexture = loader.load("/img/starfield.jpg");
  scene.background = bgTexture;
}

function addToggleButton() {
  const button = document.getElementById("toggleAnimation");
  button.addEventListener("click", () => {
    isAnimating = !isAnimating;
    button.textContent = isAnimating ? "⏸️ Pause" : "▶️ Resume";
  });
}

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 200;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
  renderer.domElement.id = "c";

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Lighting
  const pointLight = new THREE.PointLight(0xffffff, 2.5, 1000);
  pointLight.position.set(0, 0, 0);
  pointLight.castShadow = true;
  scene.add(pointLight);

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(100, 100, 100);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Background
  addSkybox();

  // Planets
  createPlanet("sun", "/img/sun_hd.jpg", 20, true);
  createPlanet("mercury", "/img/mercury_hd.jpg", 2);
  createPlanet("venus", "/img/venus_hd.jpg", 3);
  createPlanet("earth", "/img/earth_hd.jpg", 4);
  createPlanet("mars", "/img/mars_hd.jpg", 3.5);
  createPlanet("jupiter", "/img/jupiter_hd.jpg", 10);
  createPlanet("saturn", "/img/saturn_hd.jpg", 8);
  createPlanet("uranus", "/img/uranus_hd.jpg", 6);
  createPlanet("neptune", "/img/neptune_hd.jpg", 5);

  Object.values(orbitRadii).forEach(createRing);
}

function animate(time) {
  requestAnimationFrame(animate);
  const t = time * 0.001;
  const revSpeed = 0.02; // Faster orbit

  if (isAnimating) {
    planets.sun.rotation.y += 0.005;

    for (const planet in orbitRadii) {
      const p = planets[planet];
      p.rotation.y += 0.01;
      p.position.set(
        orbitRadii[planet] * Math.cos(t * speedControls[planet] * revSpeed),
        0,
        orbitRadii[planet] * Math.sin(t * speedControls[planet] * revSpeed)
      );
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
createSliders();
addToggleButton();
animate();
