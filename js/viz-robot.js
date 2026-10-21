// Three.js comes from the page's import map (shared with js/devices3d.js, loaded once).
import * as THREE from 'three';

const canvas = document.querySelector('[data-viz-robot]');
const mascot = canvas?.closest('.vzn-guide-avatar');

if (canvas && mascot) {
  try {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(116, 132, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1.75, 1.75, 2, -2, 0.1, 30);
    camera.position.set(0, 0.15, 8);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xc9d6ee, 2.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3);
    keyLight.position.set(-3, 5, 7);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x7ca9ff, 1.4);
    fillLight.position.set(4, 1, 5);
    scene.add(fillLight);

    const robot = new THREE.Group();
    scene.add(robot);

    const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xf8fbff, roughness: 0.32, metalness: 0.12 });
    const blueMaterial = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3, metalness: 0.18 });
    const navyMaterial = new THREE.MeshStandardMaterial({ color: 0x172b4d, roughness: 0.38, metalness: 0.08 });
    const jointMaterial = new THREE.MeshStandardMaterial({ color: 0x8da5c8, roughness: 0.34, metalness: 0.25 });
    const greenMaterial = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x087b55, emissiveIntensity: 0.5, roughness: 0.3 });

    function addSphere(parent, material, position, scale, geometry = [1, 24, 16]) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(geometry[0], geometry[1], geometry[2]), material);
      mesh.position.set(...position);
      mesh.scale.set(...scale);
      parent.add(mesh);
      return mesh;
    }

    function addCapsule(parent, material, position, radius, length, rotation = [0, 0, 0]) {
      const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 4, 8), material);
      mesh.position.set(...position);
      mesh.rotation.set(...rotation);
      parent.add(mesh);
      return mesh;
    }

    addCapsule(robot, whiteMaterial, [0, -0.73, 0], 0.37, 0.55);

    addSphere(robot, jointMaterial, [-0.52, -0.38, 0], [0.13, 0.13, 0.13]);
    addSphere(robot, jointMaterial, [0.52, -0.38, 0], [0.13, 0.13, 0.13]);
    addCapsule(robot, blueMaterial, [-0.7, -0.67, 0], 0.1, 0.38, [0, 0, -0.25]);
    addCapsule(robot, blueMaterial, [0.7, -0.67, 0], 0.1, 0.38, [0, 0, 0.25]);
    addSphere(robot, whiteMaterial, [-0.78, -0.93, 0.03], [0.13, 0.12, 0.13]);
    addSphere(robot, whiteMaterial, [0.78, -0.93, 0.03], [0.13, 0.12, 0.13]);

    addCapsule(robot, jointMaterial, [-0.2, -1.37, 0], 0.1, 0.35);
    addCapsule(robot, jointMaterial, [0.2, -1.37, 0], 0.1, 0.35);
    addSphere(robot, blueMaterial, [-0.2, -1.64, 0.08], [0.19, 0.1, 0.26]);
    addSphere(robot, blueMaterial, [0.2, -1.64, 0.08], [0.19, 0.1, 0.26]);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.25, 20), jointMaterial);
    neck.position.set(0, -0.24, 0);
    robot.add(neck);

    const head = new THREE.Group();
    head.position.set(0, 0.47, 0);
    robot.add(head);

    addSphere(head, whiteMaterial, [0, 0, 0], [0.61, 0.59, 0.48]);
    addSphere(head, navyMaterial, [0, -0.015, 0.414], [0.47, 0.36, 0.105]);

    const eyes = [];
    [-1, 1].forEach(side => {
      const eye = new THREE.Group();
      eye.position.set(side * 0.19, 0.055, 0.498);
      head.add(eye);
      addSphere(eye, whiteMaterial, [0, 0, 0], [0.132, 0.16, 0.06]);
      const pupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.072, 20, 14),
        new THREE.MeshStandardMaterial({ color: 0x0f3477, roughness: 0.24 })
      );
      pupil.position.set(0, -0.01, 0.056);
      eye.add(pupil);
      addSphere(eye, whiteMaterial, [0.025, 0.05, 0.114], [0.025, 0.025, 0.014]);
      eyes.push(eye);
    });

    const smile = new THREE.Mesh(
      new THREE.TorusGeometry(0.09, 0.012, 6, 24, Math.PI),
      whiteMaterial
    );
    smile.position.set(0, -0.145, 0.521);
    smile.rotation.z = Math.PI;
    head.add(smile);

    const antennaStem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.16, 10), blueMaterial);
    antennaStem.position.set(0, 0.62, 0);
    head.add(antennaStem);
    addSphere(head, greenMaterial, [0, 0.73, 0], [0.065, 0.065, 0.065]);
    addSphere(robot, greenMaterial, [0, -0.65, 0.37], [0.055, 0.055, 0.035]);

    mascot.classList.add('has-3d-robot');

    let pointerX = 0;
    let pointerY = 0;
    let blinkStart = 0;
    let nextBlink = performance.now() + 2500 + Math.random() * 2500;
    const clock = new THREE.Clock();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => {
      pointerX = 0;
      pointerY = 0;
    });

    function animate(now) {
      const elapsed = clock.getElapsedTime();
      if (!prefersReducedMotion) {
        robot.position.y = Math.sin(elapsed * 1.8) * 0.035;
        head.rotation.y += (pointerX * 0.5 - head.rotation.y) * 0.075;
        head.rotation.x += (-pointerY * 0.24 - head.rotation.x) * 0.075;
      } else {
        head.rotation.set(0, 0, 0);
      }

      if (!prefersReducedMotion && now >= nextBlink && blinkStart === 0) blinkStart = now;
      if (!prefersReducedMotion && blinkStart) {
        const progress = (now - blinkStart) / 155;
        const openness = progress < 0.5 ? 1 - progress * 1.85 : 0.075 + (progress - 0.5) * 1.85;
        eyes.forEach(eye => { eye.scale.y = 0.16 * Math.max(0.075, Math.min(openness, 1)); });
        if (progress >= 1) {
          eyes.forEach(eye => { eye.scale.y = 0.16; });
          blinkStart = 0;
          nextBlink = now + 2800 + Math.random() * 3200;
        }
      }

      renderer.render(scene, camera);
      if (!prefersReducedMotion) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  } catch (error) {
    console.warn('Viz 3D mascot could not start; keeping the illustrated fallback.', error);
  }
}
