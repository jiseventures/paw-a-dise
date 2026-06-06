import * as THREE from 'three';

function createGlowTexture(primary = '#ffdd9a', secondary = '#8fffe1') {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(256, 220, 0, 256, 256, 240);
  gradient.addColorStop(0, 'rgba(255,255,255,0.98)');
  gradient.addColorStop(0.16, primary);
  gradient.addColorStop(0.42, secondary);
  gradient.addColorStop(0.72, 'rgba(31,55,73,0.18)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 180; i += 1) {
    const x = Math.random() * 512, y = Math.random() * 512, radius = Math.random() * 5 + 1;
    ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.5})`;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 50);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.35, 'rgba(255,223,170,0.95)');
  gradient.addColorStop(0.8, 'rgba(255,160,220,0.3)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

export function createBackground(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 18);
  const clock = new THREE.Clock();
  const particleTexture = createParticleTexture();

  const starGeo = new THREE.BufferGeometry();
  const starCount = 1600;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const a = new THREE.Color('#ffe3aa'), b = new THREE.Color('#97fff0'), c = new THREE.Color('#9ba7ff');
  for (let i = 0; i < starCount; i += 1) {
    const p = i * 3;
    positions[p] = (Math.random() - 0.5) * 40;
    positions[p + 1] = (Math.random() - 0.5) * 28;
    positions[p + 2] = (Math.random() - 0.5) * 18;
    const mixed = a.clone().lerp(b, Math.random()).lerp(c, Math.random() * 0.4);
    colors[p] = mixed.r; colors[p + 1] = mixed.g; colors[p + 2] = mixed.b;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ map: particleTexture, size: 0.17, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true, opacity: 0.95 }));
  scene.add(stars);

  const auroraGroup = new THREE.Group();
  const glowA = new THREE.Sprite(new THREE.SpriteMaterial({ map: createGlowTexture('#ffe1a1', '#89f2cb'), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
  glowA.scale.set(24, 16, 1); glowA.position.set(0, 0, -4); auroraGroup.add(glowA);
  const glowB = new THREE.Sprite(new THREE.SpriteMaterial({ map: createGlowTexture('#c9b8ff', '#8ab8ff'), transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending }));
  glowB.scale.set(20, 13, 1); glowB.position.set(-3, 1, -6); auroraGroup.add(glowB);
  scene.add(auroraGroup);

  const meadowGlow = new THREE.Mesh(new THREE.PlaneGeometry(20, 12), new THREE.MeshBasicMaterial({ color: '#2f5c3f', transparent: true, opacity: 0.14 }));
  meadowGlow.position.set(0, -5.2, -8); scene.add(meadowGlow);

  const revealOverlay = document.createElement('div');
  revealOverlay.className = 'aurora-reveal-overlay';
  revealOverlay.innerHTML = `<div class="aurora-reveal-overlay__sky"></div><div class="aurora-reveal-overlay__content"><div class="aurora-reveal-overlay__star"></div><div class="aurora-reveal-overlay__egg"></div><div class="aurora-reveal-overlay__animal"></div><div class="aurora-reveal-overlay__caption">A Light in the Meadow</div></div>`;
  revealOverlay.hidden = true;
  canvas.parentElement.appendChild(revealOverlay);

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  function update() {
    const elapsed = clock.getElapsedTime();
    stars.rotation.z += 0.0003;
    stars.rotation.y = Math.sin(elapsed * 0.07) * 0.08;
    glowA.material.rotation += 0.0008;
    glowB.material.rotation -= 0.0005;
    glowA.position.x = Math.sin(elapsed * 0.35) * 1.1;
    glowB.position.y = 1 + Math.cos(elapsed * 0.27) * 0.6;
    auroraGroup.position.y = Math.sin(elapsed * 0.18) * 0.4;
    renderer.render(scene, camera);
  }

  function pulseBoardImpact(intensity = 1) {
    const boost = Math.min(1.3, 0.88 + intensity * 0.14);
    renderer.toneMappingExposure = boost;
    setTimeout(() => { renderer.toneMappingExposure = 1.05; }, 180);
  }

  function triggerAuroraReveal() {
    revealOverlay.hidden = false;
    revealOverlay.classList.remove('active');
    void revealOverlay.offsetWidth;
    revealOverlay.classList.add('active');
    setTimeout(() => { revealOverlay.classList.remove('active'); revealOverlay.hidden = true; }, 7600);
  }

  window.addEventListener('resize', resize);
  resize();

  return {
    update, pulseBoardImpact, triggerAuroraReveal,
    destroy() {
      window.removeEventListener('resize', resize);
      renderer.dispose();
      starGeo.dispose();
      [stars, glowA, glowB].forEach((obj) => { obj.material?.map?.dispose(); obj.material?.dispose(); });
      meadowGlow.material.dispose(); meadowGlow.geometry.dispose();
      revealOverlay.remove();
    },
  };
}
