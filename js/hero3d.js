/*
 * hero3d.js — the 3D scene in the homepage hero (Three.js, core only).
 * A character in an egg chair working on a laptop, with app panels
 * floating around. Built from primitives, so there are no model files.
 *
 * Progressive: the laptop mockup image stays in the page and is only
 * hidden (via .has-3d on #hVis) once WebGL has drawn its first frame.
 * Skipped entirely when the hero visual is hidden (small screens).
 * Reduced motion: one still frame, no animation loop.
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const host = document.getElementById('hero3d');
const visual = document.getElementById('hVis');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (host && visual && visual.offsetParent !== null && hasWebGL()) {
  try { init(); } catch (err) { console.warn('hero3d: falling back to the image', err); }
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

function init() {
  /* ── Renderer, scene, camera ─────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.environment = makeEnvironment(renderer);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  const lookAt = new THREE.Vector3(0, 1.55, 0);

  /* ── Lights ──────────────────────────────────────────────── */
  scene.add(new THREE.HemisphereLight(0xffffff, 0xc7d2fe, 0.9));

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(3.5, 6.5, 4.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -3; key.shadow.camera.right = 3;
  key.shadow.camera.top = 4; key.shadow.camera.bottom = -2;
  key.shadow.radius = 6;
  key.shadow.bias = -0.0004;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x93c5fd, 0.7);
  fill.position.set(-5, 3, 2);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, 1.1);
  rim.position.set(-2, 4, -5);
  scene.add(rim);

  /* ── Materials ───────────────────────────────────────────── */
  const M = {
    shell:   new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08 }),
    velvet:  new THREE.MeshPhysicalMaterial({ color: 0x2563eb, roughness: 0.9, sheen: 1, sheenColor: new THREE.Color(0x93c5fd), sheenRoughness: 0.5, side: THREE.BackSide }),
    cushion: new THREE.MeshPhysicalMaterial({ color: 0x1d4ed8, roughness: 0.9, sheen: 1, sheenColor: new THREE.Color(0x93c5fd), sheenRoughness: 0.5 }),
    skin:    new THREE.MeshStandardMaterial({ color: 0x7a4a2a, roughness: 0.55 }),
    hair:    new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.9 }),
    hoodie:  new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.75 }),
    jeans:   new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.8 }),
    sneaker: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 }),
    sole:    new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.6 }),
    dark:    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 }),
    metal:   new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.25, metalness: 0.9 }),
  };

  const world = new THREE.Group();
  scene.add(world);

  /* ── Floor that only shows shadows ───────────────────────── */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.13 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  world.add(floor);

  /* ── Egg chair ───────────────────────────────────────────── */
  const chair = new THREE.Group();
  world.add(chair);

  // Pedestal: flared base and a short stem.
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.78, 0.07, 64), M.shell);
  base.position.y = 0.035;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.16, 0.42, 32), M.shell);
  stem.position.y = 0.28;
  [base, stem].forEach(m => { m.castShadow = m.receiveShadow = true; chair.add(m); });

  // Shell: a sphere with a large cap removed. The opening faces OPEN_DIR.
  const R = 1.18, CUT = 1.32;                       // radius, angle of the opening edge from the pole
  const OPEN_DIR = new THREE.Vector3(-0.42, 0.42, 1).normalize();
  const egg = new THREE.Group();                    // carries the egg stretch
  egg.position.y = 1.72;
  egg.scale.set(1, 1.1, 1);
  chair.add(egg);

  const shell = new THREE.Group();
  shell.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), OPEN_DIR);
  egg.add(shell);

  const outer = new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64, 0, Math.PI * 2, CUT, Math.PI - CUT), M.shell);
  outer.castShadow = true;
  const inner = new THREE.Mesh(new THREE.SphereGeometry(R * 0.95, 96, 64, 0, Math.PI * 2, CUT, Math.PI - CUT), M.velvet);
  inner.receiveShadow = true;
  const lip = new THREE.Mesh(new THREE.TorusGeometry(R * 0.975 * Math.sin(CUT), R * 0.026, 24, 160), M.shell);
  lip.position.y = R * 0.975 * Math.cos(CUT);
  lip.rotation.x = Math.PI / 2;
  shell.add(outer, inner, lip);

  // Seat cushion in the bottom of the shell.
  const cushion = new THREE.Mesh(new THREE.SphereGeometry(0.78, 48, 32), M.cushion);
  cushion.scale.set(1, 0.32, 0.95);
  cushion.position.set(-0.08, -0.56, 0.18);
  cushion.castShadow = cushion.receiveShadow = true;
  egg.add(cushion);

  /* ── Character (faces +Z in its own frame) ───────────────── */
  const person = new THREE.Group();
  person.position.set(-0.1, 1.5, 0.28);
  person.rotation.y = Math.atan2(OPEN_DIR.x, OPEN_DIR.z) * 0.8;
  chair.add(person);

  const limb = (a, b, r, mat, parent = person) => {
    const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b);
    const dir = to.clone().sub(from);
    const len = dir.length();
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(len - r * 0.2, 0.01), 8, 20), mat);
    m.position.copy(from).add(to).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    m.castShadow = true;
    parent.add(m);
    return m;
  };
  const ball = (p, r, mat, parent = person, s = [1, 1, 1]) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), mat);
    m.position.set(...p);
    m.scale.set(...s);
    m.castShadow = true;
    parent.add(m);
    return m;
  };

  // Hips and torso, leaning back into the shell.
  ball([0, 0.02, 0], 0.27, M.jeans, person, [1.15, 0.75, 1]);
  const torso = new THREE.Group();
  torso.position.set(0, 0.08, -0.04);
  torso.rotation.x = -0.38;
  person.add(torso);
  limb([0, 0.05, 0], [0, 0.5, 0], 0.25, M.hoodie, torso);
  ball([0, 0.62, -0.02], 0.2, M.hoodie, torso, [1.25, 0.6, 1]);          // shoulders
  // Hood bunched behind the neck
  const hood = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.06, 12, 32), M.hoodie);
  hood.position.set(0, 0.7, -0.1);
  hood.rotation.x = Math.PI / 2.4;
  torso.add(hood);

  // Head, looking down at the laptop. Rotated in the loop to follow the pointer.
  const head = new THREE.Group();
  head.position.set(0, 0.86, 0.02);
  torso.add(head);
  limb([0, -0.14, 0], [0, 0.02, 0], 0.075, M.skin, head);                 // neck
  ball([0, 0.17, 0], 0.21, M.skin, head, [0.95, 1.08, 1]);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.218, 32, 24, 0, Math.PI * 2, 0, 1.25), M.hair);
  hair.position.set(0, 0.19, -0.015);
  hair.rotation.x = -0.35;
  hair.scale.set(0.97, 1.08, 1);
  head.add(hair);
  ball([0.205, 0.15, -0.01], 0.045, M.skin, head);                         // ears
  ball([-0.205, 0.15, -0.01], 0.045, M.skin, head);
  // Glasses
  for (const x of [-0.075, 0.075]) {
    const lens = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.011, 10, 28), M.dark);
    lens.position.set(x, 0.17, 0.195);
    head.add(lens);
    ball([x, 0.165, 0.18], 0.017, M.dark, head);                           // eyes
  }
  limb([-0.024, 0.175, 0.205], [0.024, 0.175, 0.205], 0.008, M.dark, head); // bridge
  // Smile
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.009, 8, 20, Math.PI * 0.8), M.dark);
  smile.position.set(0, 0.075, 0.19);
  smile.rotation.z = Math.PI * 1.1;
  head.add(smile);
  head.rotation.x = 0.32;

  // Legs: left foot hangs over the lip, right leg crossed over it.
  limb([-0.13, 0.02, 0.02], [-0.16, 0.06, 0.5], 0.115, M.jeans);
  limb([-0.16, 0.06, 0.5], [-0.2, -0.55, 0.72], 0.1, M.jeans);
  limb([0.13, 0.04, 0.02], [-0.02, 0.2, 0.5], 0.115, M.jeans);
  limb([-0.02, 0.2, 0.5], [0.08, -0.22, 0.92], 0.1, M.jeans);
  const shoe = (p, rotY) => {
    const g = new THREE.Group();
    g.position.set(...p);
    g.rotation.set(0.25, rotY, 0);
    person.add(g);
    ball([0, 0, 0.06], 0.085, M.sneaker, g, [0.95, 0.7, 1.7]);
    ball([0, -0.045, 0.06], 0.085, M.sole, g, [1, 0.25, 1.75]);
  };
  shoe([-0.2, -0.63, 0.74], 0.1);
  shoe([0.08, -0.3, 0.95], -0.25);

  // Laptop resting on the crossed knee.
  const laptop = new THREE.Group();
  laptop.position.set(-0.02, 0.36, 0.42);
  laptop.rotation.set(-0.12, 0, 0.04);
  person.add(laptop);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.022, 0.38), M.metal);
  deck.castShadow = true;
  laptop.add(deck);
  const lid = new THREE.Group();
  lid.position.set(0, 0.011, 0.19);                                        // hinge on the far edge
  lid.rotation.x = 0.34;                                                   // opened ~110°, tilted away from him
  laptop.add(lid);
  const lidBox = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.36, 0.016), M.metal);
  lidBox.position.y = 0.18;
  lidBox.castShadow = true;
  lid.add(lidBox);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.32), new THREE.MeshBasicMaterial({ map: canvasTexture(320, 200, drawScreen), toneMapped: false }));
  screen.position.set(0, 0.18, -0.0085);
  screen.rotation.y = Math.PI;                                             // faces him
  lid.add(screen);
  const logo = new THREE.Mesh(new THREE.CircleGeometry(0.035, 32), new THREE.MeshBasicMaterial({ color: 0x60a5fa }));
  logo.position.set(0, 0.18, 0.0085);
  lid.add(logo);
  // Screen glow on the face
  const glow = new THREE.PointLight(0x93c5fd, 0.9, 1.4, 2);
  glow.position.set(0, 0.3, -0.05);
  laptop.add(glow);

  // Arms reaching to the keyboard. Hands move in the loop.
  const shoulderL = [-0.3, 0.64, -0.25], shoulderR = [0.3, 0.64, -0.25];
  const elbowL = [-0.36, 0.3, 0.12], elbowR = [0.36, 0.3, 0.12];
  limb(shoulderL, elbowL, 0.085, M.hoodie);
  limb(shoulderR, elbowR, 0.085, M.hoodie);
  const handL = ball([-0.14, 0.4, 0.42], 0.06, M.skin);
  const handR = ball([0.14, 0.4, 0.42], 0.06, M.skin);
  const forearmL = limb(elbowL, [-0.14, 0.4, 0.42], 0.075, M.hoodie);
  const forearmR = limb(elbowR, [0.14, 0.4, 0.42], 0.075, M.hoodie);

  /* ── Floating app panels (decorative, no text) ───────────── */
  const panels = [
    makePanel(0.9, 0.62, drawDashboard, [1.55, 2.55, 0.4]),
    makePanel(0.46, 0.82, drawPhone, [-1.65, 2.25, 0.55]),
    makePanel(0.36, 0.36, drawCheck, [1.35, 1.05, 1.0]),
  ];
  panels.forEach(p => world.add(p));

  function makePanel(w, h, draw, pos) {
    const tex = canvasTexture(Math.round(w * 400), Math.round(h * 400), draw);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
    m.position.set(...pos);
    m.userData.base = m.position.clone();
    m.userData.phase = Math.random() * Math.PI * 2;
    return m;
  }

  /* ── Sizing ──────────────────────────────────────────────── */
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Pull the camera back on narrow boxes so the chair and panels fit.
    const dist = 7.6 / Math.min(camera.aspect, 1.15);
    camera.position.set(1.1, 2.35, dist);
    camera.lookAt(lookAt);
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(host);

  /* ── Pointer: camera parallax and head turn ──────────────── */
  const pointer = new THREE.Vector2(), eased = new THREE.Vector2();
  if (!reduceMotion) {
    window.addEventListener('pointermove', e => {
      pointer.set(e.clientX / window.innerWidth * 2 - 1, e.clientY / window.innerHeight * 2 - 1);
    }, { passive: true });
  }

  /* ── Loop ────────────────────────────────────────────────── */
  const clock = new THREE.Clock();
  let running = false, shown = false;
  const handBaseL = handL.position.clone(), handBaseR = handR.position.clone();

  function frame() {
    const t = clock.getElapsedTime();
    eased.lerp(pointer, 0.05);

    // Intro: rise and scale in over the first second.
    const intro = reduceMotion ? 1 : Math.min(t / 1.1, 1);
    const ease = 1 - Math.pow(1 - intro, 3);
    world.scale.setScalar(0.9 + 0.1 * ease);
    world.position.y = -0.25 * (1 - ease);

    if (!reduceMotion) {
      chair.rotation.y = Math.sin(t * 0.35) * 0.06 + eased.x * 0.12;
      torso.rotation.x = -0.38 + Math.sin(t * 1.4) * 0.012;                 // breathing
      head.rotation.y = eased.x * 0.35;
      head.rotation.x = 0.32 + eased.y * 0.12;
      // Typing
      handL.position.y = handBaseL.y + Math.max(0, Math.sin(t * 9)) * 0.018;
      handR.position.y = handBaseR.y + Math.max(0, Math.sin(t * 9 + 1.7)) * 0.018;
      aim(forearmL, elbowL, handL.position);
      aim(forearmR, elbowR, handR.position);
      panels.forEach((p, i) => {
        p.position.y = p.userData.base.y + Math.sin(t * 0.9 + p.userData.phase) * 0.06;
        p.rotation.z = Math.sin(t * 0.6 + i) * 0.03;
      });
      camera.position.x = 1.1 + eased.x * 0.35;
      camera.position.y = 2.35 - eased.y * 0.2;
      camera.lookAt(lookAt);
    }
    panels.forEach(p => p.quaternion.copy(camera.quaternion));

    renderer.render(scene, camera);
    if (!shown) { shown = true; visual.classList.add('has-3d'); }
    if (running) requestAnimationFrame(frame);
  }

  function aim(mesh, from, to) {
    const a = new THREE.Vector3(...from);
    const dir = to.clone().sub(a);
    mesh.position.copy(a).add(to).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  }

  if (reduceMotion) { frame(); return; }

  // Only animate while the hero is on screen and the tab is visible.
  const start = () => { if (!running) { running = true; requestAnimationFrame(frame); } };
  const stop = () => { running = false; };
  let onScreen = true;
  new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    onScreen && !document.hidden ? start() : stop();
  }).observe(host);
  document.addEventListener('visibilitychange', () => (document.hidden || !onScreen ? stop() : start()));
  start();
}

/* ── Environment for reflections (studio-style, built in code) ── */
function makeEnvironment(renderer) {
  const env = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0xe2e8f0, side: THREE.BackSide }));
  env.add(room);
  const panel = (w, h, pos, color = 0xffffff, intensity = 1) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity) }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  panel(4, 3, [0, 4.9, 0], 0xffffff, 3);
  panel(3, 4, [-4.9, 1, 1], 0xdbeafe, 2);
  panel(3, 3, [4.9, 2, -1], 0xffffff, 2.5);
  panel(6, 1.5, [0, 1, 4.9], 0xffffff, 1.5);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.04).texture;
  pmrem.dispose();
  return tex;
}

/* ── Canvas textures ──────────────────────────────────────── */
function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w * 2; c.height = h * 2;
  const g = c.getContext('2d');
  g.scale(2, 2);
  draw(g, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function card(g, w, h) {
  g.shadowColor = 'rgba(15,23,42,.18)';
  g.shadowBlur = 18;
  g.shadowOffsetY = 6;
  g.fillStyle = '#ffffff';
  roundRect(g, 12, 8, w - 24, h - 24, 22);
  g.fill();
  g.shadowColor = 'transparent';
}

function drawScreen(g, w, h) {
  g.fillStyle = '#0f172a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1e293b';
  g.fillRect(0, 0, 60, h);
  const bars = [0.45, 0.7, 0.55, 0.85, 0.65, 0.95];
  bars.forEach((v, i) => {
    g.fillStyle = i === bars.length - 1 ? '#60a5fa' : '#3b82f6';
    g.fillRect(84 + i * 36, h - 30 - v * 110, 22, v * 110);
  });
  g.fillStyle = '#334155';
  for (let i = 0; i < 4; i++) g.fillRect(14, 20 + i * 26, 32, 8);
}

function drawDashboard(g, w, h) {
  card(g, w, h);
  g.fillStyle = '#eff6ff';
  roundRect(g, 32, 28, w - 64, 34, 10); g.fill();
  g.fillStyle = '#2563eb';
  roundRect(g, 40, 38, 60, 14, 7); g.fill();
  // line chart
  g.strokeStyle = '#2563eb'; g.lineWidth = 5; g.lineJoin = 'round';
  g.beginPath();
  const pts = [0.2, 0.35, 0.3, 0.55, 0.5, 0.72, 0.8];
  pts.forEach((v, i) => {
    const x = 40 + i * ((w - 80) / (pts.length - 1)), y = h - 40 - v * (h - 120);
    i ? g.lineTo(x, y) : g.moveTo(x, y);
  });
  g.stroke();
  g.lineTo(w - 40, h - 40); g.lineTo(40, h - 40); g.closePath();
  g.fillStyle = 'rgba(37,99,235,.12)'; g.fill();
}

function drawPhone(g, w, h) {
  card(g, w, h);
  g.fillStyle = '#e2e8f0';
  roundRect(g, w / 2 - 22, 22, 44, 8, 4); g.fill();
  const rows = ['#2563eb', '#f59e0b', '#10b981'];
  rows.forEach((c, i) => {
    const y = 52 + i * 62;
    g.fillStyle = c;
    roundRect(g, 32, y, 40, 40, 12); g.fill();
    g.fillStyle = '#cbd5e1';
    roundRect(g, 84, y + 6, w - 128, 10, 5); g.fill();
    g.fillStyle = '#e2e8f0';
    roundRect(g, 84, y + 24, (w - 128) * 0.6, 8, 4); g.fill();
  });
  g.fillStyle = '#2563eb';
  roundRect(g, 32, h - 72, w - 64, 34, 12); g.fill();
}

function drawCheck(g, w, h) {
  card(g, w, h);
  g.fillStyle = '#10b981';
  g.beginPath(); g.arc(w / 2, h / 2 - 8, 42, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(w / 2 - 18, h / 2 - 8); g.lineTo(w / 2 - 4, h / 2 + 6); g.lineTo(w / 2 + 20, h / 2 - 20); g.stroke();
}
