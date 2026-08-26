/**
 * Deepvidia hero background
 * Inspired by ThreeUI Community "Orbital Sphere" / Structure Flow
 * (MIT — https://github.com/MengTo/threeui)
 * Adapted to vanilla Three.js r128 + Deepvidia brand colors.
 */
(function () {
  // Mobile menu
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.style.display === "flex";
      nav.style.display = open ? "none" : "flex";
      nav.style.flexDirection = "column";
      nav.style.position = "absolute";
      nav.style.top = "68px";
      nav.style.right = "4%";
      nav.style.background = "rgba(7,9,15,0.95)";
      nav.style.padding = "1rem 1.25rem";
      nav.style.borderRadius = "12px";
      nav.style.border = "1px solid rgba(255,255,255,0.08)";
      nav.style.gap = "0.85rem";
      nav.style.zIndex = "200";
    });
  }

  const container = document.getElementById("canvas-container");
  if (!container || typeof THREE === "undefined") return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 6.2;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const networkGroup = new THREE.Group();
  scene.add(networkGroup);

  // Brand palette (Deepvidia)
  const colorBright = new THREE.Color(0x3ee0a0); // accent green
  const colorMid = new THREE.Color(0x4cc9f0);    // accent cyan
  const colorDim = new THREE.Color(0x0d3d32);    // deep green

  // Orbital particle sphere (ThreeUI Orbital Sphere pattern)
  const radius = 2.25;
  const particleCount = 12000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  let validIndex = 0;

  for (let i = 0; i < particleCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / particleCount);
    const theta = Math.sqrt(particleCount * Math.PI) * phi;
    const x = radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(phi);
    const noise =
      Math.sin(x * 3.5) * Math.cos(y * 3.5) * Math.sin(z * 3.5) +
      Math.cos(x * 6) * 0.4;
    if (noise <= -0.12) continue;
    const distortion = 1 + noise * 0.12;
    positions[validIndex * 3] = x * distortion;
    positions[validIndex * 3 + 1] = y * distortion;
    positions[validIndex * 3 + 2] = z * distortion;
    const mixed =
      noise > 0.45
        ? colorBright.clone().lerp(colorMid, 0.35)
        : colorDim.clone().lerp(colorBright, 0.55);
    colors[validIndex * 3] = mixed.r;
    colors[validIndex * 3 + 1] = mixed.g;
    colors[validIndex * 3 + 2] = mixed.b;
    validIndex++;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions.slice(0, validIndex * 3), 3)
  );
  particleGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(colors.slice(0, validIndex * 3), 3)
  );
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.018,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  networkGroup.add(new THREE.Points(particleGeometry, particleMaterial));

  // Orbit rings
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0x3ee0a0,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
  });
  const orbitCount = 7;
  for (let i = 0; i < orbitCount; i++) {
    const orbitRadius = 1.6 + i * 0.28;
    const segments = 96;
    const pts = [];
    for (let s = 0; s <= segments; s++) {
      const a = (s / segments) * Math.PI * 2;
      pts.push(Math.cos(a) * orbitRadius, Math.sin(a) * orbitRadius, 0);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const line = new THREE.Line(geo, orbitMaterial);
    line.rotation.x = Math.random() * Math.PI;
    line.rotation.y = Math.random() * Math.PI;
    networkGroup.add(line);

    // Nodes on alternate orbits
    if (i % 2 === 0) {
      const nodeGeo = new THREE.SphereGeometry(0.03, 12, 12);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: 0x4cc9f0,
        transparent: true,
        opacity: 0.9,
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      const angle = Math.random() * Math.PI * 2;
      node.position.set(Math.cos(angle) * orbitRadius, Math.sin(angle) * orbitRadius, 0);
      line.add(node);

      const haloGeo = new THREE.SphereGeometry(0.09, 12, 12);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x3ee0a0,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      node.add(new THREE.Mesh(haloGeo, haloMat));
    }
  }

  // Soft ambient particles in the distance (Structure Flow style depth)
  const bgCount = 400;
  const bgPos = new Float32Array(bgCount * 3);
  for (let i = 0; i < bgCount; i++) {
    bgPos[i * 3] = (Math.random() - 0.5) * 40;
    bgPos[i * 3 + 1] = (Math.random() - 0.5) * 24;
    bgPos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 8;
  }
  const bgGeo = new THREE.BufferGeometry();
  bgGeo.setAttribute("position", new THREE.BufferAttribute(bgPos, 3));
  const bgMat = new THREE.PointsMaterial({
    size: 0.04,
    color: 0x3ee0a0,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
  });
  const bgPoints = new THREE.Points(bgGeo, bgMat);
  scene.add(bgPoints);

  let mouseX = 0;
  let mouseY = 0;
  let responsiveScale = 1;

  function layout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    if (w >= 1024) {
      networkGroup.position.set(2.4, 0.15, -1.5);
      responsiveScale = 1.2;
      camera.position.z = 5.8;
    } else {
      networkGroup.position.set(0, -0.4, -2.2);
      responsiveScale = 0.95;
      camera.position.z = 6.8;
    }
    networkGroup.scale.setScalar(responsiveScale);
  }
  layout();

  document.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);
    networkGroup.rotation.y += 0.001;
    networkGroup.rotation.x += 0.00035;
    networkGroup.children.forEach((child, index) => {
      if (child.type === "Line") {
        child.rotation.z += 0.00045 * (index % 2 === 0 ? 1 : -1);
      }
    });
    bgPoints.rotation.y += 0.0004;
    camera.position.x += (mouseX * 0.9 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 0.55 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", layout);
})();
