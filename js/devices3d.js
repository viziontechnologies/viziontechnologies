/*
 * devices3d.js — floating laptop + phone scenes (Three.js).
 *
 * Mounts on:
 *  - #hero3d (homepage hero): the phone cycles through our apps (real
 *    screenshots and clickable-prototype captures), the laptop shows a
 *    matching dashboard, notifications pop up, glass cards and glossy
 *    shapes float around, and a bubble names the app with links.
 *  - [data-devices3d] (case-study headers): one project's screens, via
 *    data-phone="key,key" and data-laptop="theme".
 *
 * Interaction: the scene tilts towards the pointer (or the phone's own
 * tilt on touch devices); nearby shapes spin or swell; clicking the
 * phone opens the app's page (on touch screens a tap ripples and shows
 * the next app); scrolling the hero away turns the devices round.
 * ?night=1 shows a night studio with glowing screens (off by default:
 * the light scene reads better).
 *
 * Progressive: until the scene draws, its box shows a shimmer
 * (.d3-loading); the hero's laptop image comes back if WebGL fails.
 * Small screens get a lighter version. Reduced motion: one still frame.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const FONT = '"Sora", "Segoe UI", system-ui, sans-serif';
const WA = 'https://wa.me/263778686550?text=';
const asset = p => new URL(`../${p}`, import.meta.url).href;
const page = p => new URL(`../${p}`, import.meta.url).href;    // site-root relative, from any page

/* Apps the phone can show. kind: 'real' = screenshot of the real app,
   'prototype' = capture of our clickable prototype (sample data). */
const APPS = {
  agrixpert:  { name: 'AgriXpert',          kind: 'real',      img: 'assets/screenshots/agrixpert/2.jpg',          href: 'work/agrixpert.html',            theme: 'farm' },
  agriweather:{ name: 'AgriXpert',          kind: 'real',      img: 'assets/screenshots/agrixpert/6.jpg',          href: 'work/agrixpert.html',            theme: 'farm' },
  guesthouse: { name: 'Guesthouse manager', kind: 'real',      img: 'assets/screenshots/guesthouse/1-dashboard.jpg', href: 'portfolio.html#try-guesthouse', theme: 'bookings' },
  tylliq:     { name: 'Tylliq POS',         kind: 'prototype', img: 'assets/screenshots/prototypes/tylliq.jpg',     href: 'work/tylliq.html',               theme: 'shop' },
  dellinoo:   { name: 'Dellinoo',           kind: 'prototype', img: 'assets/screenshots/prototypes/dellinoo.jpg',   href: 'work/dellinoo.html',             theme: 'orders' },
  zimsec:     { name: 'ZIMSEC AI',          kind: 'prototype', img: 'assets/screenshots/prototypes/zimsec-ai.jpg',  href: 'portfolio.html#try-zimsec',      theme: 'study' },
  church:     { name: 'Church app',         kind: 'prototype', img: 'assets/screenshots/prototypes/church-app.jpg', href: 'portfolio.html#try-church',      theme: 'church' },
};
const HERO_APPS = ['agrixpert', 'tylliq', 'guesthouse', 'dellinoo', 'zimsec', 'church'];

/* Laptop screens. img: a capture of one of our desktop prototypes;
   otherwise a dashboard drawn here (bars, not figures: sample UI). */
const THEMES = {
  business: { title: 'Good morning', sub: 'Here is your business today', nav: ['Dashboard', 'Sales', 'Stock', 'Customers', 'Reports'], tiles: ['Sales', 'Orders', 'Stock'], chart: 'This week', list: 'Latest' },
  farm:     { title: 'Farm overview', sub: 'Crops, livestock and tasks', nav: ['Overview', 'Crops', 'Livestock', 'Tasks', 'Market'], tiles: ['Crops', 'Livestock', 'Tasks'], chart: 'Rainfall this week', list: 'Today', accent: '#16a34a' },
  orders:   { title: 'Orders', sub: 'In stock and shipping from China', nav: ['Orders', 'Products', 'Customers', 'Deliveries', 'Payments'], tiles: ['New', 'In transit', 'Delivered'], chart: 'Orders this week', list: 'Latest orders', accent: '#eab308' },
  study:    { title: 'Study progress', sub: 'Practice by subject', nav: ['Subjects', 'Practice', 'Flashcards', 'Notes', 'Progress'], tiles: ['Maths', 'English', 'Science'], chart: 'Questions practised', list: 'Weak topics', accent: '#0f766e' },
  church:   { title: 'Church admin', sub: 'Members, events and giving', nav: ['Members', 'Events', 'Sermons', 'Giving', 'Groups'], tiles: ['Attendance', 'Events', 'Giving'], chart: 'Attendance', list: 'Coming up', accent: '#7c3aed' },
  shop:     { img: 'assets/screenshots/prototypes/rutz-pos.jpg' },
  bookings: { img: 'assets/screenshots/prototypes/innsuite.jpg' },
  portal:   { img: 'assets/screenshots/prototypes/vizion-portal.jpg' },
  cases:    { img: 'assets/screenshots/prototypes/case-management.jpg' },
};
const NOTES = [
  { color: '#10b981', icon: 'cart', title: 'New order', sub: '2 × Bread loaf · just now' },
  { color: '#f59e0b', icon: 'alert', title: 'Stock running low', sub: 'Sugar 2kg · 3 left' },
  { color: '#2563eb', icon: 'cash', title: 'Payment received', sub: 'EcoCash · $12.50' },
];

// ?still: render one settled frame (used to make the share image).
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).has('still');
const small = window.matchMedia('(max-width: 900px)').matches;
const touch = window.matchMedia('(pointer: coarse)').matches;

/* ── Auto-mount ─────────────────────────────────────────────── */
if (hasWebGL()) {
  const heroHost = document.getElementById('hero3d');
  const heroVis = document.getElementById('hVis');
  if (heroHost && heroVis) {
    if (heroVis.offsetParent === null && small) heroVis.classList.add('mobile-3d');
    if (heroVis.offsetParent !== null) {
      mount(heroHost, heroVis, { apps: HERO_APPS, notes: true, shapes: true, bubble: true, scroll: true, hint: true, linkOut: true });
    }
  }
  document.querySelectorAll('[data-devices3d]').forEach(el => {
    const apps = (el.dataset.phone || '').split(',').map(s => s.trim()).filter(Boolean);
    mount(el, el, { apps, laptop: el.dataset.laptop || null, notes: false, shapes: true, bubble: false, scroll: false, hint: apps.length > 1, wide: true, linkOut: false });
  });
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

function mount(host, visual, opts) {
  visual.classList.add('d3-loading');
  run(host, visual, opts).catch(err => {
    console.warn('devices3d: falling back', err);
    visual.classList.remove('d3-loading');
  });
}

function isNight() {
  const q = new URLSearchParams(location.search);
  if (q.has('night')) return true;
  return false;                                    // night mode only on request: the light scene reads better
}

async function run(host, visual, opts) {
  await Promise.race([document.fonts?.ready, new Promise(r => setTimeout(r, 1500))]);
  const night = isNight();
  const apps = opts.apps.map(k => APPS[k]).filter(Boolean);
  const hasPhone = apps.length > 0;

  /* ── Renderer, scene, camera ─────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: small ? 'low-power' : 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = night ? 0.9 : 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  pmrem.dispose();
  const NIGHT_BG = 0x0b1222;
  if (night) {
    scene.background = new THREE.Color(NIGHT_BG);
    scene.fog = new THREE.Fog(NIGHT_BG, 10, 18);
    scene.environmentIntensity = 0.35;              // r163+; ignored on older builds
    host.classList.add('d3-night');
  } else {
    scene.fog = new THREE.Fog(0xf3f6fd, 10, 17);    // far objects soften into the page
  }

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);

  const key = new THREE.DirectionalLight(0xffffff, night ? 0.5 : 1.4);
  key.position.set(3, 7, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(small ? 512 : 1024, small ? 512 : 1024);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 });
  key.shadow.radius = 14;
  key.shadow.bias = -0.0005;
  scene.add(key);
  const rim = new THREE.DirectionalLight(night ? 0x3b82f6 : 0x93c5fd, night ? 1.6 : 1.0);
  rim.position.set(-6, 2, -4);
  scene.add(rim);

  const stage = new THREE.Group();
  scene.add(stage);

  /* ── Materials ───────────────────────────────────────────── */
  const MAT = {
    alu: new THREE.MeshPhysicalMaterial({ color: 0xcfd4dc, metalness: 1, roughness: 0.33 }),
    aluDark: new THREE.MeshPhysicalMaterial({ color: 0x9aa1ab, metalness: 1, roughness: 0.4 }),
    titanium: new THREE.MeshPhysicalMaterial({ color: 0x8d949e, metalness: 1, roughness: 0.22 }),
    blackGlass: new THREE.MeshPhysicalMaterial({ color: 0x05070c, roughness: 0.06, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.03 }),
    keycap: new THREE.MeshStandardMaterial({ color: 0x14161b, roughness: 0.55 }),
    well: new THREE.MeshStandardMaterial({ color: 0x0b0d12, roughness: 0.8 }),
    pad: new THREE.MeshPhysicalMaterial({ color: 0xc3c9d1, metalness: 0.6, roughness: 0.18, clearcoat: 1 }),
    sheen: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.04, transparent: true, opacity: 0.04, depthWrite: false }),
  };
  const gloss = color => new THREE.MeshPhysicalMaterial({ color, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.04 });
  // Screens: unlit; at night pushed above white so the bloom makes them glow.
  const flat = (map, extra = {}) => new THREE.MeshBasicMaterial({ map, toneMapped: false, fog: false, ...extra });
  const screenMat = map => flat(map, night ? { color: new THREE.Color(1.15, 1.15, 1.2) } : {});
  const faceTint = night ? { color: new THREE.Color(0.62, 0.66, 0.75) } : {};   // keep white faces under the bloom threshold
  const shadowed = m => { m.castShadow = true; return m; };

  /* ── Laptop ──────────────────────────────────────────────── */
  const LW = 3.3, LD = 2.25, LT = 0.09;
  const laptop = new THREE.Group();
  const LAPTOP_POS = hasPhone ? new THREE.Vector3(-0.55, -0.55, 0) : new THREE.Vector3(0, -0.6, 0);
  const LAPTOP_ROT_Y = hasPhone ? -0.5 : -0.35;
  laptop.position.copy(LAPTOP_POS);
  laptop.rotation.set(0.18, LAPTOP_ROT_Y, 0);
  stage.add(laptop);

  laptop.add(shadowed(new THREE.Mesh(new RoundedBoxGeometry(LW, LT, LD, 6, 0.04), MAT.alu)));
  const KW = LW * 0.84, KD = LD * 0.46, KZ = -LD * 0.13;
  const well = new THREE.Mesh(new THREE.PlaneGeometry(KW + 0.06, KD + 0.06), MAT.well);
  well.rotation.x = -Math.PI / 2;
  well.position.set(0, LT / 2 + 0.001, KZ);
  laptop.add(well);
  const cols = 14, rows = 6, gap = 0.022;
  const kw = (KW - gap * (cols - 1)) / cols, kd = (KD - gap * (rows - 1)) / rows;
  const keyList = [];
  for (let r = 0; r < rows; r++) {
    const depth = r === 0 ? kd * 0.55 : kd;
    const z = KZ - KD / 2 + r * (kd + gap) + kd / 2 - (r === 0 ? kd * 0.2 : 0);
    if (r === rows - 1) {                           // bottom row: wide space bar
      const side = 4;
      for (let c = 0; c < cols; c++) if (c < side || c >= cols - side) keyList.push([-KW / 2 + c * (kw + gap) + kw / 2, z, kw, depth]);
      keyList.push([0, z, (cols - 2 * side) * (kw + gap) - gap, depth]);
    } else {
      for (let c = 0; c < cols; c++) keyList.push([-KW / 2 + c * (kw + gap) + kw / 2, z, kw, depth]);
    }
  }
  const keys = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 1, 1, 2, 0.12), MAT.keycap, keyList.length);
  const m4 = new THREE.Matrix4(), noRot = new THREE.Quaternion();
  keyList.forEach(([x, z, w, d], i) => keys.setMatrixAt(i, m4.compose(new THREE.Vector3(x, LT / 2 + 0.012, z), noRot, new THREE.Vector3(w, 0.022, d))));
  laptop.add(keys);
  if (night) {                                      // backlit keys
    const glowKeys = new THREE.Mesh(new THREE.PlaneGeometry(KW, KD), new THREE.MeshBasicMaterial({ color: 0x1d4ed8, transparent: true, opacity: 0.35, fog: false }));
    glowKeys.rotation.x = -Math.PI / 2;
    glowKeys.position.set(0, LT / 2 + 0.002, KZ);
    laptop.add(glowKeys);
  }
  const pad = new THREE.Mesh(new RoundedBoxGeometry(LW * 0.36, 0.006, LD * 0.3, 2, 0.003), MAT.pad);
  pad.position.set(0, LT / 2, LD * 0.29);
  laptop.add(pad);
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, LW * 0.8, 24), MAT.aluDark);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, LT / 2, -LD / 2 + 0.02);
  laptop.add(hinge);

  const LH = 2.15, lid = new THREE.Group();
  lid.position.set(0, LT / 2, -LD / 2 + 0.02);
  lid.rotation.x = -0.26;
  laptop.add(lid);
  const lidShell = shadowed(new THREE.Mesh(new RoundedBoxGeometry(LW, LH, 0.05, 6, 0.024), MAT.alu));
  lidShell.position.y = LH / 2;
  lid.add(lidShell);
  const lidFront = new THREE.Mesh(new RoundedPlane(LW - 0.03, LH - 0.03, 0.06), MAT.blackGlass);
  lidFront.position.set(0, LH / 2, 0.0255);
  lid.add(lidFront);
  const DW = LW - 0.2, DH = LH - 0.32;
  const dash = liveCanvas(1000, Math.round(1000 * DH / DW), 1.5);
  const display = new THREE.Mesh(new THREE.PlaneGeometry(DW, DH), screenMat(dash.tex));
  display.position.set(0, LH / 2 + 0.06, 0.026);
  lid.add(display);
  const lidSheen = new THREE.Mesh(new RoundedPlane(LW - 0.03, LH - 0.03, 0.06), MAT.sheen);
  lidSheen.position.set(0, LH / 2, 0.0275);
  lid.add(lidSheen);
  const chin = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.07), flat(canvasTexture(250, 35, drawChinLabel), { transparent: true }));
  chin.position.set(0, 0.09, 0.0262);
  lid.add(chin);
  const badge = new THREE.Mesh(new THREE.CircleGeometry(0.2, 64), new THREE.MeshPhysicalMaterial({ map: canvasTexture(256, 256, drawLogo), metalness: 1, roughness: 0.12, transparent: true }));
  badge.position.set(0, LH / 2, -0.0255);
  badge.rotation.y = Math.PI;
  lid.add(badge);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(6, 4.4), flat(canvasTexture(256, 190, drawGlow), { transparent: true, depthWrite: false, opacity: night ? 1 : 0.55 }));
  glow.position.set(0, LH / 2, -0.35);
  lid.add(glow);

  /* ── Laptop screen: themed dashboard or desktop prototype ─── */
  const imgCache = {};
  const loadImg = src => imgCache[src] || (imgCache[src] = new Promise((res, rej) => {
    const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = asset(src);
  }));
  const bars = [0.42, 0.6, 0.5, 0.75, 0.66, 0.88, 0.8].map(v => ({ now: 0, to: v }));
  const tiles = [0.82, 0.6, 0.9].map(v => ({ now: 0, to: v }));
  let theme = THEMES.business, themeImg = null, flash = -1, dashDirty = true;
  const prevDash = document.createElement('canvas');
  prevDash.width = dash.g.canvas.width; prevDash.height = dash.g.canvas.height;
  let dashFade = 1;
  async function setTheme(keyName) {
    const th = THEMES[keyName] || THEMES.business;
    const im = th.img ? await loadImg(th.img) : null;
    prevDash.getContext('2d').drawImage(dash.g.canvas, 0, 0);
    theme = th; themeImg = im; dashFade = 0; dashDirty = true;
  }
  function drawDash() {
    const { g, w, h } = dash;
    if (themeImg) { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); drawCover(g, themeImg, w, h); }
    else drawDashboardScreen(g, w, h, theme, bars, tiles, flash, night);
    if (dashFade < 1) {                              // cross-fade from the previous screen
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1 - dashFade;
      g.drawImage(prevDash, 0, 0); g.restore();
    }
    dash.tex.needsUpdate = true;
  }
  function stepDash(dt) {
    let moving = dashFade < 1;
    if (dashFade < 1) dashFade = Math.min(1, dashFade + dt / 0.5);
    if (!themeImg) for (const b of [...bars, ...tiles]) {
      const d = b.to - b.now;
      if (Math.abs(d) > 0.002) { b.now += d * Math.min(1, dt * 4); moving = true; } else b.now = b.to;
    }
    if (moving || dashDirty) { drawDash(); dashDirty = false; }
  }
  function newData() {
    flash = Math.floor(Math.random() * bars.length);
    bars[flash].to = THREE.MathUtils.clamp(bars[flash].to + (Math.random() - 0.35) * 0.25, 0.25, 0.95);
    const t = tiles[Math.floor(Math.random() * tiles.length)];
    t.to = THREE.MathUtils.clamp(t.to + (Math.random() - 0.4) * 0.15, 0.35, 0.95);
  }

  /* ── Phone ───────────────────────────────────────────────── */
  const PW = 1.0, PH = 2.1, PT = 0.085;
  const phone = new THREE.Group();
  const PHONE_POS = new THREE.Vector3(2.05, -0.15, 1.15);
  phone.position.copy(PHONE_POS);
  phone.rotation.set(0.05, -0.35, 0.06);
  phone.visible = hasPhone;
  stage.add(phone);
  phone.add(shadowed(new THREE.Mesh(new RoundedBoxGeometry(PW, PH, PT, 8, 0.13), MAT.titanium)));
  const phoneFront = new THREE.Mesh(new RoundedPlane(PW - 0.02, PH - 0.02, 0.125), MAT.blackGlass);
  phoneFront.position.z = PT / 2 + 0.0005;
  phone.add(phoneFront);
  const screenCv = liveCanvas(540, 1200, 1);
  const phoneScreen = new THREE.Mesh(new RoundedPlane(PW - 0.075, PH - 0.075, 0.1), screenMat(screenCv.tex));
  phoneScreen.position.z = PT / 2 + 0.001;
  phone.add(phoneScreen);
  const island = new THREE.Mesh(new RoundedPlane(0.28, 0.075, 0.0375), new THREE.MeshBasicMaterial({ color: 0x000000, fog: false }));
  island.position.set(0, PH / 2 - 0.12, PT / 2 + 0.0015);
  phone.add(island);
  const phoneSheen = new THREE.Mesh(new RoundedPlane(PW - 0.02, PH - 0.02, 0.125), MAT.sheen);
  phoneSheen.position.z = PT / 2 + 0.002;
  phone.add(phoneSheen);
  for (const [x, y, h] of [[-PW / 2, 0.45, 0.16], [-PW / 2, 0.22, 0.16], [PW / 2, 0.35, 0.28]]) {
    const b = new THREE.Mesh(new RoundedBoxGeometry(0.03, h, 0.04, 2, 0.012), MAT.titanium);
    b.position.set(x + Math.sign(x) * 0.008, y, 0);
    phone.add(b);
  }
  if (hasPhone && night) {
    const pg = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.8), flat(canvasTexture(190, 256, drawGlow), { transparent: true, depthWrite: false }));
    pg.position.z = -0.3;
    phone.add(pg);
  }

  const shots = await Promise.all(apps.map(a => loadImg(a.img)));
  let app = 0, slide = 1, phoneDirty = false;
  const ripples = [];                               // { u, v, age } taps on the phone screen
  function drawPhoneScreen() {
    if (!hasPhone) return;
    const { g, w, h } = screenCv;
    const e = slide * slide * (3 - 2 * slide);
    const prev = (app - 1 + shots.length) % shots.length;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    if (e < 1) g.drawImage(shots[prev], -e * w, 0, w, h);
    g.drawImage(shots[app], (1 - e) * w, 0, w, h);
    for (const r of ripples) {
      const p = r.age / 0.6;
      g.strokeStyle = `rgba(37,99,235,${0.55 * (1 - p)})`; g.lineWidth = 10 * (1 - p) + 2;
      g.beginPath(); g.arc(r.u * w, (1 - r.v) * h, 20 + p * 160, 0, 7); g.stroke();
      g.fillStyle = `rgba(37,99,235,${0.18 * (1 - p)})`; g.fill();
    }
    screenCv.tex.needsUpdate = true;
  }
  const showApp = i => {
    app = i; slide = 0;
    if (!opts.laptop) setTheme(apps[app].theme);
    updateBubble();
  };

  /* ── Notification card next to the phone ─────────────────── */
  const note = new THREE.Group();
  const NOTE_POS = new THREE.Vector3(1.55, 1.0, 2.1);
  note.position.copy(NOTE_POS);
  note.rotation.set(0, -0.3, 0.02);
  note.visible = false;
  if (opts.notes) stage.add(note);
  const noteSlab = new THREE.Mesh(new RoundedBoxGeometry(1.7, 0.5, 0.05, 4, 0.08), Object.assign(gloss(night ? 0x9aa6bd : 0xffffff), { transparent: true }));
  note.add(noteSlab);
  const noteCv = liveCanvas(510, 150, 2);
  const noteFace = new THREE.Mesh(new THREE.PlaneGeometry(1.62, 1.62 * 150 / 510), flat(noteCv.tex, { transparent: true, ...faceTint }));
  noteFace.position.z = 0.027;
  note.add(noteFace);
  let noteIdx = 0, noteAge = 0;
  const NOTE_LIFE = 4.5;
  function showNote(i) {
    drawNotification(noteCv.g, noteCv.w, noteCv.h, NOTES[i]);
    noteCv.tex.needsUpdate = true;
    noteAge = 0;
  }
  showNote(0);

  /* ── Cards and glossy shapes ─────────────────────────────── */
  const floaters = [];
  if (opts.shapes) {
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, thickness: 0.4, roughness: 0.2, ior: 1.35, clearcoat: 1, clearcoatRoughness: 0.1 });
    const card = (w, h, draw, pos, rot, frosted) => {
      const g = new THREE.Group();
      g.position.set(...pos); g.rotation.set(...rot);
      g.add(shadowed(new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.06, 4, 0.06), frosted && !small && !night ? glass : gloss(night ? 0x9aa6bd : 0xffffff))));
      const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.92, h * 0.88), flat(canvasTexture(Math.round(w * 300), Math.round(h * 300), draw), { transparent: true, ...faceTint }));
      face.position.z = 0.032;
      g.add(face);
      stage.add(g);
      floaters.push({ obj: g, kind: 'card', base: g.position.clone(), rot0: g.rotation.y, turn: 0, amp: 0.09, speed: 0.9, phase: Math.random() * 6, spin: 0 });
    };
    const ball = (r, color, pos) => {
      const m = shadowed(new THREE.Mesh(new THREE.SphereGeometry(r, 64, 48), gloss(color)));
      m.position.set(...pos);
      stage.add(m);
      floaters.push({ obj: m, kind: 'ball', base: m.position.clone(), amp: 0.12, speed: 0.6, phase: Math.random() * 6, spin: 0 });
    };
    const wideX = opts.wide ? 1.35 : 1;               // spread out in wide case-study boxes
    card(1.35, 0.82, drawChartCard, [2.05 * wideX, 2.1, -0.4], [0, -0.3, 0.04], true);
    card(0.82, 0.82, drawCheckCard, [-2.2 * wideX, 1.25, 0.9], [0, 0.35, -0.05], false);
    card(1.25, 0.55, drawChatCard, [-1.75 * wideX, -1.75, 1.3], [0, 0.25, 0.03], true);
    ball(0.42, 0x2563eb, [-2.35 * wideX, 2.05, -1.2]);
    ball(0.24, 0xf59e0b, [2.95 * wideX, -1.25, 0.3]);
    ball(0.16, 0x60a5fa, [0.85, -1.95, 1.4]);
    const ring = shadowed(new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.11, 32, 96), gloss(0x93c5fd)));
    ring.position.set(0.45, 2.25, -1.6);
    ring.rotation.set(0.9, 0.3, 0);
    stage.add(ring);
    floaters.push({ obj: ring, kind: 'ring', base: ring.position.clone(), amp: 0.1, speed: 0.5, phase: 1, spin: 0 });
  }

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: night ? 0.25 : 0.06 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.85;
  floor.receiveShadow = true;
  stage.add(floor);
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 3), flat(canvasTexture(256, 140, drawShadow), { transparent: true, depthWrite: false }));
  blob.rotation.x = -Math.PI / 2;
  blob.position.set(-0.4, -1.84, 0.2);
  stage.add(blob);

  /* ── First screens ───────────────────────────────────────── */
  await setTheme(opts.laptop || (hasPhone ? apps[0].theme : 'business'));
  dashFade = 1;
  drawPhoneScreen();

  /* ── Overlay: app bubble and "it's live" hint ────────────── */
  const bubble = document.createElement('div');
  bubble.className = 'd3-bubble';
  bubble.innerHTML = '<span class="d3-tag"></span><strong class="d3-name"></strong><span class="d3-by">built by Vizion</span>'
    + '<span class="d3-actions"><a class="d3-see" href="#">See it &rarr;</a><a class="d3-wa" target="_blank" rel="noopener" href="#">Ask on WhatsApp</a></span>';
  function updateBubble() {
    if (!opts.bubble || !hasPhone) return;
    const a = apps[app];
    bubble.querySelector('.d3-tag').textContent = a.kind === 'real' ? 'Real app' : 'Prototype';
    bubble.querySelector('.d3-tag').dataset.kind = a.kind;
    bubble.querySelector('.d3-name').textContent = a.name;
    bubble.querySelector('.d3-see').href = page(a.href);
    bubble.querySelector('.d3-wa').href = WA + encodeURIComponent(`Hi Vizion, I'd like an app like ${a.name}.`);
    bubble.classList.remove('d3-swap'); void bubble.offsetWidth; bubble.classList.add('d3-swap');
  }
  if (opts.bubble && hasPhone) { host.appendChild(bubble); updateBubble(); }

  const hint = document.createElement('div');
  hint.className = 'd3-hint';
  hint.setAttribute('aria-hidden', 'true');
  hint.innerHTML = `<span class="d3-hint-dot"></span>${touch ? 'Tap the phone to switch apps' : opts.linkOut ? 'It’s live: hover, then click the phone' : 'Click the phone to switch screens'}`;
  let hinted = false;
  const dismissHint = () => { if (!hinted) { hinted = true; hint.classList.add('d3-hint-out'); } };
  if (opts.hint && hasPhone && !reduceMotion) { host.appendChild(hint); setTimeout(dismissHint, 9000); }

  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);

  /* ── Post-processing (night only): screens bloom ─────────── */
  let composer = null;
  if (night) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 0.45, 0.5, 1.0));
    composer.addPass(new OutputPass());
  }

  /* ── Sizing ──────────────────────────────────────────────── */
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer?.setSize(w, h);
    camera.aspect = w / h;
    const dist = opts.wide ? 11.5 / Math.min(camera.aspect, 1.6) : 11.2 / Math.min(camera.aspect, 1.1);
    camera.position.set(0, 0.35, dist);
    camera.lookAt(0, 0.1, 0);
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(host);

  /* ── Pointer, tilt, taps ─────────────────────────────────── */
  const pointer = new THREE.Vector2(), eased = new THREE.Vector2();
  const ndc = new THREE.Vector2(-9, -9);
  const ray = new THREE.Raycaster();
  const toNdc = e => {
    const r = canvas.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  const phoneHit = () => {
    if (!hasPhone) return null;
    ray.setFromCamera(ndc, camera);
    return ray.intersectObject(phoneScreen, false)[0] || ray.intersectObject(phone, true)[0] || null;
  };
  if (!reduceMotion) {
    window.addEventListener('pointermove', e => {
      if (e.pointerType === 'mouse') pointer.set(e.clientX / window.innerWidth * 2 - 1, e.clientY / window.innerHeight * 2 - 1);
      toNdc(e);
      canvas.style.cursor = phoneHit() && (opts.linkOut || apps.length > 1) ? 'pointer' : '';
    }, { passive: true });
  }
  let tilt = false;
  const onTilt = e => {
    if (e.gamma == null) return;
    tilt = true;
    pointer.set(THREE.MathUtils.clamp(e.gamma / 30, -1, 1), THREE.MathUtils.clamp((e.beta - 45) / 30, -1, 1));
  };
  if (touch && !reduceMotion) window.addEventListener('deviceorientation', onTilt);
  canvas.addEventListener('click', e => {
    toNdc(e);
    dismissHint();
    // iOS asks for motion permission on a user gesture.
    if (touch && typeof DeviceOrientationEvent?.requestPermission === 'function' && !tilt) {
      DeviceOrientationEvent.requestPermission().catch(() => {});
    }
    const hit = phoneHit();
    if (!hit) return;
    if (touch || !opts.linkOut) {
      if (hit.object === phoneScreen && hit.uv) ripples.push({ u: hit.uv.x, v: hit.uv.y, age: 0 });
      showApp((app + 1) % apps.length);
      appTimer = 0;
    } else {
      window.location.href = page(apps[app].href);
    }
  });

  /* ── Scroll (hero only) ──────────────────────────────────── */
  let scrollP = 0;
  const readScroll = () => opts.scroll ? THREE.MathUtils.clamp(-host.getBoundingClientRect().top / Math.max(host.offsetHeight, 1), 0, 1) : 0;

  /* ── Loop ────────────────────────────────────────────────── */
  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3();
  let running = false, shown = false, dataTimer = 0, appTimer = 0;

  function placeBubble() {
    if (!bubble.isConnected) return;
    tmp.set(-PW / 2, -PH / 2 + 0.25, PT).applyMatrix4(phone.matrixWorld).project(camera);
    const w = host.clientWidth, h = host.clientHeight;
    const bw = bubble.offsetWidth, bh = bubble.offsetHeight;
    let x = (tmp.x + 1) / 2 * w - bw - 14, y = (1 - tmp.y) / 2 * h - bh / 2;   // just left of the phone
    if (small) { x = 8; y = h - bh - 46; }          // phones: a fixed corner, above the hint
    x = THREE.MathUtils.clamp(x, 6, w - bw - 6); y = THREE.MathUtils.clamp(y, 6, h - bh - 6);
    bubble.style.transform = `translate(${x}px, ${y}px)`;
  }

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    eased.lerp(pointer, tilt ? 0.08 : 0.05);

    const intro = reduceMotion ? 1 : Math.min(t / 1.2, 1);
    const ease = 1 - Math.pow(1 - intro, 3);

    if (!reduceMotion) {
      scrollP += (readScroll() - scrollP) * 0.12;
      const s = scrollP * scrollP * (3 - 2 * scrollP);

      stage.scale.setScalar(0.92 + 0.08 * ease);
      stage.rotation.y = eased.x * 0.22 + Math.sin(t * 0.25) * 0.04 + s * 0.35;
      stage.rotation.x = eased.y * 0.08;
      stage.position.y = -0.3 * (1 - ease) + s * 0.9;

      laptop.position.set(LAPTOP_POS.x - s * 1.4, LAPTOP_POS.y + Math.sin(t * 0.6) * 0.05, LAPTOP_POS.z);
      laptop.rotation.y = LAPTOP_ROT_Y + s * 2.6;
      phone.position.set(PHONE_POS.x + s * 1.6, PHONE_POS.y + Math.sin(t * 0.7 + 1) * 0.1 + s * 0.6, PHONE_POS.z);
      phone.rotation.y = -0.35 - s * 0.9;

      for (const f of floaters) {
        f.obj.getWorldPosition(tmp).project(camera);
        if (Math.hypot(tmp.x - ndc.x, tmp.y - ndc.y) < 0.22) f.spin = Math.min(f.spin + dt * 8, 6);
        f.spin *= 0.965;
        f.obj.position.y = f.base.y + Math.sin(t * f.speed + f.phase) * f.amp;
        if (f.kind === 'ball') f.obj.scale.setScalar(1 + Math.min(f.spin, 3) * 0.07);
        else if (f.kind === 'card') { f.turn += f.spin * dt; f.obj.rotation.y = f.rot0 + f.turn; }
        else f.obj.rotation.z += dt * (0.3 + f.spin);
      }

      dataTimer += dt;
      if (dataTimer > 2.6) { dataTimer = 0; newData(); }
      stepDash(dt);

      if (hasPhone) {
        appTimer += dt;
        if (apps.length > 1 && appTimer > 4.2) { appTimer = 0; showApp((app + 1) % apps.length); }
        ripples.forEach(r => (r.age += dt));
        while (ripples.length && ripples[0].age > 0.6) ripples.shift();
        const busy = slide < 1 || ripples.length > 0;
        if (slide < 1) slide = Math.min(1, slide + dt / 0.6);
        if (busy || phoneDirty) { drawPhoneScreen(); phoneDirty = busy; }  // one last clean draw after
      }

      if (opts.notes) {
        noteAge += dt;
        if (noteAge > NOTE_LIFE) { noteIdx = (noteIdx + 1) % NOTES.length; showNote(noteIdx); }
        const inP = Math.min(noteAge / 0.45, 1), outP = Math.max(0, (noteAge - (NOTE_LIFE - 0.5)) / 0.5);
        const pop = 1 - Math.pow(1 - inP, 3);
        const alpha = pop * (1 - outP) * (1 - s);
        note.scale.setScalar(0.62 + 0.2 * pop);
        note.position.y = NOTE_POS.y - 0.25 * (1 - pop) + s * 0.4;
        noteSlab.material.opacity = noteFace.material.opacity = alpha;
        note.visible = alpha > 0.01;
      }
      bubble.style.opacity = String(1 - s);
    } else {
      bars.forEach(b => (b.now = b.to)); tiles.forEach(b => (b.now = b.to));
      drawDash();
    }

    stage.updateMatrixWorld(true);
    placeBubble();
    composer ? composer.render() : renderer.render(scene, camera);
    if (!shown) { shown = true; visual.classList.remove('d3-loading'); visual.classList.add('has-3d'); }
    if (running) requestAnimationFrame(frame);
  }

  if (reduceMotion) { frame(); return; }

  const start = () => { if (!running) { running = true; clock.getDelta(); requestAnimationFrame(frame); } };
  const stop = () => { running = false; };
  let onScreen = true;
  new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    onScreen && !document.hidden ? start() : stop();
  }).observe(host);
  document.addEventListener('visibilitychange', () => (document.hidden || !onScreen ? stop() : start()));
  start();
}

/* A flat rectangle with rounded corners, UVs 0..1. */
class RoundedPlane extends THREE.ShapeGeometry {
  constructor(w, h, r) {
    const s = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    super(s, 12);
    const uv = this.attributes.uv, pos = this.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) - x) / w, (pos.getY(i) - y) / h);
  }
}

/* ── Canvas helpers ───────────────────────────────────────── */
function liveCanvas(w, h, scale) {
  const c = document.createElement('canvas');
  c.width = Math.round(w * scale); c.height = Math.round(h * scale);
  const g = c.getContext('2d');
  g.scale(scale, scale);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { g, tex, w, h };
}

function canvasTexture(w, h, draw) {
  const { g, tex } = liveCanvas(w, h, 2);
  draw(g, w, h);
  tex.needsUpdate = true;
  return tex;
}

function drawCover(g, im, w, h) {                  // fill the box, cropping from the top-left
  const s = Math.max(w / im.width, h / im.height);
  g.drawImage(im, 0, 0, w / s, h / s, 0, 0, w, h);
}

function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/* ── Drawings ─────────────────────────────────────────────── */
function drawDashboardScreen(g, w, h, th, bars, tiles, flash, dark) {
  const accent = th.accent || '#2563eb';
  // Light and dark (night) palettes: page, card, ink, muted, line, track.
  const P = dark
    ? { bg: "#0b1120", card: "#151d2e", ink: "#e2e8f0", muted: "#94a3b8", line: "#1f2a3d", track: "#1f2a3d", bar: "#1e3a8a" }
    : { bg: "#f8fafc", card: "#fff", ink: "#0f172a", muted: "#64748b", line: "#e2e8f0", track: "#eef2f7", bar: "#dbeafe" };
  g.fillStyle = P.bg; g.fillRect(0, 0, w, h);
  g.fillStyle = '#0f172a'; g.fillRect(0, 0, 190, h);
  g.fillStyle = accent; rr(g, 26, 28, 38, 38, 10); g.fill();
  g.fillStyle = '#fff'; g.font = `700 22px ${FONT}`; g.fillText('V', 37, 55);
  g.font = `600 17px ${FONT}`; g.fillText('Vizion', 76, 54);
  th.nav.forEach((t, i) => {
    if (!i) { g.fillStyle = 'rgba(255,255,255,.12)'; rr(g, 16, 100, 158, 40, 10); g.fill(); }
    g.fillStyle = i ? '#94a3b8' : '#fff';
    g.font = `500 15px ${FONT}`; g.fillText(t, 34, 126 + i * 52);
  });
  g.fillStyle = P.ink; g.font = `700 26px ${FONT}`; g.fillText(th.title, 222, 62);
  g.fillStyle = P.muted; g.font = `400 15px ${FONT}`; g.fillText(th.sub, 222, 88);
  g.fillStyle = '#10b981'; g.beginPath(); g.arc(w - 140, 56, 6, 0, 7); g.fill();
  g.fillStyle = P.muted; g.font = `500 14px ${FONT}`; g.fillText('Live', w - 126, 61);
  const tileColors = [accent, '#f59e0b', '#10b981'];
  th.tiles.forEach((t, i) => {
    const x = 222 + i * 254;
    g.fillStyle = P.card; rr(g, x, 116, 234, 104, 16); g.fill();
    g.strokeStyle = P.line; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = P.muted; g.font = `500 14px ${FONT}`; g.fillText(t, x + 20, 146);
    g.fillStyle = P.track; rr(g, x + 20, 164, 190, 14, 7); g.fill();
    g.fillStyle = tileColors[i]; rr(g, x + 20, 164, Math.max(14, 190 * tiles[i].now), 14, 7); g.fill();
    g.fillStyle = P.line; rr(g, x + 20, 190, 120, 8, 4); g.fill();
  });
  const ch = h - 270;
  g.fillStyle = P.card; rr(g, 222, 240, 500, ch, 18); g.fill(); g.strokeStyle = P.line; g.stroke();
  g.fillStyle = P.ink; g.font = `600 17px ${FONT}`; g.fillText(th.chart, 246, 278);
  const baseY = 240 + ch - 30, maxH = ch - 90;
  bars.forEach((b, i) => {
    const bx = 256 + i * 64, bh = Math.max(6, b.now * maxH);
    const grad = g.createLinearGradient(0, baseY - bh, 0, baseY);
    grad.addColorStop(0, i === flash ? '#1d4ed8' : accent); grad.addColorStop(1, P.bar);
    g.fillStyle = grad; rr(g, bx, baseY - bh, 38, bh, 10); g.fill();
  });
  g.fillStyle = P.card; rr(g, 742, 240, 240, ch, 18); g.fill(); g.strokeStyle = P.line; g.stroke();
  g.fillStyle = P.ink; g.font = `600 17px ${FONT}`; g.fillText(th.list, 764, 278);
  ['#10b981', '#f59e0b', accent, '#8b5cf6'].forEach((c, i) => {
    const y = 304 + i * 58;
    if (y + 36 > 240 + ch - 10) return;
    g.fillStyle = c; rr(g, 764, y, 36, 36, 10); g.fill();
    g.fillStyle = P.muted; rr(g, 812, y + 6, 140, 9, 4); g.fill();
    g.fillStyle = P.line; rr(g, 812, y + 22, 90, 8, 4); g.fill();
  });
}

function drawNotification(g, w, h, n) {
  g.clearRect(0, 0, w, h);
  g.fillStyle = n.color;
  rr(g, 22, 33, 84, 84, 22); g.fill();
  g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round';
  const cx = 64, cy = 75;
  if (n.icon === 'cart') {
    g.beginPath(); g.moveTo(cx - 22, cy - 16); g.lineTo(cx - 14, cy - 16); g.lineTo(cx - 6, cy + 8); g.lineTo(cx + 18, cy + 8); g.lineTo(cx + 23, cy - 8); g.lineTo(cx - 10, cy - 8); g.stroke();
    g.beginPath(); g.arc(cx - 2, cy + 18, 4, 0, 7); g.fill();
    g.beginPath(); g.arc(cx + 14, cy + 18, 4, 0, 7); g.fill();
  } else if (n.icon === 'alert') {
    g.beginPath(); g.moveTo(cx, cy - 22); g.lineTo(cx, cy + 4); g.stroke();
    g.beginPath(); g.arc(cx, cy + 18, 4.5, 0, 7); g.fill();
  } else {
    g.font = `800 40px ${FONT}`; g.textAlign = 'center'; g.fillText('$', cx, cy + 14); g.textAlign = 'left';
  }
  g.fillStyle = '#0f172a'; g.font = `700 30px ${FONT}`; g.fillText(n.title, 128, 68);
  g.fillStyle = '#64748b'; g.font = `500 22px ${FONT}`; g.fillText(n.sub, 128, 104);
}

function drawChinLabel(g, w, h) {
  g.fillStyle = 'rgba(203,213,225,.55)';
  g.font = `600 20px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('vizion', w / 2, h / 2);
}

function drawLogo(g, w, h) {
  const grad = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
  grad.addColorStop(0, '#dbeafe'); grad.addColorStop(1, '#93c5fd');
  g.fillStyle = grad; g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, 7); g.fill();
  g.fillStyle = '#1d4ed8'; g.font = `800 150px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('V', w / 2, h / 2 + 8);
}

function drawGlow(g, w, h) {
  const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  grad.addColorStop(0, 'rgba(59,130,246,.30)');
  grad.addColorStop(0.5, 'rgba(96,165,250,.12)');
  grad.addColorStop(1, 'rgba(147,197,253,0)');
  g.fillStyle = grad;
  g.save(); g.scale(1, h / w); g.translate(0, (w - h) / 2);
  g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, 7); g.fill();
  g.restore();
}

function drawChartCard(g, w, h) {
  g.fillStyle = 'rgba(255,255,255,.55)'; rr(g, 0, 0, w, h, 26); g.fill();
  g.fillStyle = '#1e3a8a'; g.font = `700 22px ${FONT}`; g.fillText('Growth', 26, 46);
  g.strokeStyle = '#2563eb'; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath();
  [0.25, 0.4, 0.35, 0.6, 0.55, 0.8].forEach((v, i, a) => {
    const x = 30 + i * ((w - 60) / (a.length - 1)), y = h - 26 - v * (h - 100);
    i ? g.lineTo(x, y) : g.moveTo(x, y);
  });
  g.stroke();
}

function drawCheckCard(g, w, h) {
  g.fillStyle = '#10b981';
  g.beginPath(); g.arc(w / 2, h / 2, w * 0.32, 0, 7); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = 16; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(w * 0.36, h * 0.5); g.lineTo(w * 0.46, h * 0.6); g.lineTo(w * 0.65, h * 0.4); g.stroke();
}

function drawChatCard(g, w, h) {
  g.fillStyle = 'rgba(255,255,255,.55)'; rr(g, 0, 0, w, h, 24); g.fill();
  g.fillStyle = '#25d366'; g.beginPath(); g.arc(46, h / 2, 26, 0, 7); g.fill();
  g.fillStyle = '#fff'; rr(g, 34, h / 2 - 9, 24, 18, 6); g.fill();
  g.fillStyle = '#1e293b'; rr(g, 90, h / 2 - 20, w * 0.55, 14, 7); g.fill();
  g.fillStyle = '#94a3b8'; rr(g, 90, h / 2 + 6, w * 0.38, 12, 6); g.fill();
}

function drawShadow(g, w, h) {
  const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  grad.addColorStop(0, 'rgba(15,23,42,.22)');
  grad.addColorStop(1, 'rgba(15,23,42,0)');
  g.fillStyle = grad;
  g.save(); g.scale(1, h / w); g.translate(0, (w - h) / 2);
  g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, 7); g.fill();
  g.restore();
}
