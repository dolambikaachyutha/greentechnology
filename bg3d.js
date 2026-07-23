/**
 * SolarClean AI - Hyper-Dynamic 3D Energy Motion Engine (Inspired by Cognizance Tech-Fest)
 * Renders an intense 3D WebGL scene with undulating solar grid, glowing energy torus rings, 
 * hyper-speed photon streams, dynamic camera motion, and reactive solar plasma lighting.
 */

window.Init3DBackground = function () {
  const canvas = document.getElementById('canvas-3d-bg');
  if (!canvas) return;

  if (typeof THREE === 'undefined') {
    console.warn('Three.js loading...');
    setTimeout(window.Init3DBackground, 300);
    return;
  }

  // 1. Scene & Atmosphere Setup
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030611, 0.0012);

  const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 18, 50);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 2. Pulsating Cyber Lights
  const ambientLight = new THREE.AmbientLight(0x0f172a, 1.2);
  scene.add(ambientLight);

  const solarPointLight = new THREE.PointLight(0xf59e0b, 3.5, 120);
  solarPointLight.position.set(0, 25, 10);
  scene.add(solarPointLight);

  const cyanPointLight = new THREE.PointLight(0x06b6d4, 3.0, 120);
  cyanPointLight.position.set(-35, -15, -20);
  scene.add(cyanPointLight);

  const ecoPointLight = new THREE.PointLight(0x10b981, 2.5, 100);
  ecoPointLight.position.set(35, 10, -30);
  scene.add(ecoPointLight);

  // 3. Dynamic Undulating Solar Energy Grid (Floor & Horizon)
  const gridGroup = new THREE.Group();
  
  const planeGeo = new THREE.PlaneGeometry(160, 160, 60, 60);
  const planeMat = new THREE.MeshStandardMaterial({
    color: 0x05091a,
    emissive: 0x071126,
    roughness: 0.2,
    metalness: 0.8,
    wireframe: true
  });
  const terrainMesh = new THREE.Mesh(planeGeo, planeMat);
  terrainMesh.rotation.x = -Math.PI / 2;
  terrainMesh.position.y = -18;
  gridGroup.add(terrainMesh);

  scene.add(gridGroup);

  // Store original terrain z heights for wave animation
  const posArr = planeGeo.attributes.position;
  const initialZ = new Float32Array(posArr.count);
  for (let i = 0; i < posArr.count; i++) {
    initialZ[i] = posArr.getZ(i);
  }

  // 4. Central Glowing Solar Plasma Torus (Energy Core)
  const torusGroup = new THREE.Group();
  const torusGeo = new THREE.TorusGeometry(18, 1.2, 16, 100);
  const torusMat = new THREE.MeshPhongMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.6,
    wireframe: true,
    transparent: true,
    opacity: 0.8
  });
  const torusMesh = new THREE.Mesh(torusGeo, torusMat);
  torusMesh.rotation.x = Math.PI / 3;
  torusGroup.add(torusMesh);

  // Secondary Inner Cyber Ring
  const ringGeo = new THREE.TorusGeometry(12, 0.6, 12, 80);
  const ringMat = new THREE.MeshPhongMaterial({
    color: 0x06b6d4,
    emissive: 0x0891b2,
    emissiveIntensity: 0.8,
    wireframe: true,
    transparent: true,
    opacity: 0.9
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.y = Math.PI / 4;
  torusGroup.add(ringMesh);

  torusGroup.position.set(0, 5, -25);
  scene.add(torusGroup);

  // 5. Flying Photons & High-Speed Solar Particle Streams
  const particleCount = 1200;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorSolar = new THREE.Color(0xfbbf24);
  const colorCyan = new THREE.Color(0x22d3ee);
  const colorGreen = new THREE.Color(0x34d399);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 120;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 120;

    velocities[i * 3] = (Math.random() - 0.5) * 0.15;
    velocities[i * 3 + 1] = 0.1 + Math.random() * 0.35; // Upward buoyant particle stream
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.15;

    const r = Math.random();
    const c = r > 0.5 ? colorSolar : r > 0.25 ? colorCyan : colorGreen;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.9,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // 6. Floating Holographic Solar Polyhedrons (Faceted Panel Array)
  const polyGroup = new THREE.Group();
  const polyGeo = new THREE.IcosahedronGeometry(2.5, 0);

  const polyMatYellow = new THREE.MeshPhongMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.4,
    wireframe: true,
    transparent: true,
    opacity: 0.75
  });

  const polyMatCyan = new THREE.MeshPhongMaterial({
    color: 0x06b6d4,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.4,
    wireframe: true,
    transparent: true,
    opacity: 0.75
  });

  for (let i = 0; i < 28; i++) {
    const mesh = new THREE.Mesh(polyGeo, i % 2 === 0 ? polyMatYellow : polyMatCyan);
    mesh.position.x = (Math.random() - 0.5) * 90;
    mesh.position.y = (Math.random() - 0.5) * 50;
    mesh.position.z = (Math.random() - 0.5) * 70;

    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;

    mesh.userData = {
      rotX: (Math.random() - 0.5) * 0.03,
      rotY: (Math.random() - 0.5) * 0.03,
      pulseSpeed: 1 + Math.random() * 2,
      initY: mesh.position.y
    };

    polyGroup.add(mesh);
  }
  scene.add(polyGroup);

  // 7. Dynamic Mouse Interaction Parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.035;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.035;
  });

  // Resize Handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // 8. Hyper-Dynamic High-FPS Render Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Smooth Dynamic Camera Parallax with Sine Wave Orbiting
    targetX += (mouseX - targetX) * 0.06;
    targetY += (-mouseY - targetY) * 0.06;

    camera.position.x = targetX + Math.sin(elapsedTime * 0.5) * 2;
    camera.position.y = 18 + targetY + Math.cos(elapsedTime * 0.7) * 1.5;
    camera.lookAt(0, 0, -10);

    // Animate Undulating Terrain Mesh (Energy Waves)
    for (let i = 0; i < posArr.count; i++) {
      const x = posArr.getX(i);
      const y = posArr.getY(i);
      const wave = Math.sin(elapsedTime * 2.5 + x * 0.15 + y * 0.15) * 1.8;
      posArr.setZ(i, initialZ[i] + wave);
    }
    posArr.needsUpdate = true;

    // Spin Central Solar Torus Core
    torusMesh.rotation.z = elapsedTime * 0.3;
    torusMesh.rotation.y = elapsedTime * 0.2;
    ringMesh.rotation.x = -elapsedTime * 0.4;
    ringMesh.rotation.z = elapsedTime * 0.25;

    // Pulse Lighting
    solarPointLight.intensity = 3.0 + Math.sin(elapsedTime * 3) * 1.0;
    cyanPointLight.intensity = 2.5 + Math.cos(elapsedTime * 2.5) * 0.8;

    // Animate Polyhedrons
    polyGroup.children.forEach((mesh) => {
      mesh.rotation.x += mesh.userData.rotX;
      mesh.rotation.y += mesh.userData.rotY;
      mesh.position.y = mesh.userData.initY + Math.sin(elapsedTime * mesh.userData.pulseSpeed + mesh.position.x) * 2.0;
    });

    // Particle Velocity & Re-spawning Loop
    const pos = particleGeo.attributes.position;
    for (let i = 0; i < particleCount; i++) {
      let px = pos.getX(i) + velocities[i * 3];
      let py = pos.getY(i) + velocities[i * 3 + 1];
      let pz = pos.getZ(i) + velocities[i * 3 + 2];

      if (py > 45) {
        py = -35;
        px = (Math.random() - 0.5) * 120;
        pz = (Math.random() - 0.5) * 120;
      }

      pos.setXYZ(i, px, py, pz);
    }
    pos.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();
};
