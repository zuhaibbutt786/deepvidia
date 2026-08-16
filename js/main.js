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
    });
  }

  // Three.js subtle particle field
  const container = document.getElementById("canvas-container");
  if (!container || typeof THREE === "undefined") return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 28;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const count = 900;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 60;
    positions[i3 + 1] = (Math.random() - 0.5) * 40;
    positions[i3 + 2] = (Math.random() - 0.5) * 50;

    const t = Math.random();
    colors[i3] = 0.15 + t * 0.25;
    colors[i3 + 1] = 0.7 + t * 0.3;
    colors[i3 + 2] = 0.55 + (1 - t) * 0.35;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // soft connecting lines (sparse)
  const linePositions = [];
  for (let i = 0; i < 80; i++) {
    const a = Math.floor(Math.random() * count);
    const b = Math.floor(Math.random() * count);
    linePositions.push(
      positions[a * 3], positions[a * 3 + 1], positions[a * 3 + 2],
      positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2]
    );
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x3ee0a0,
    transparent: true,
    opacity: 0.07,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  let mouseX = 0;
  let mouseY = 0;
  document.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);
    points.rotation.y += 0.0009;
    points.rotation.x += 0.0003;
    lines.rotation.y += 0.0007;
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();