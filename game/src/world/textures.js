import * as THREE from 'three';

function makeCanvas(w, h = w) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function speckle(ctx, w, h, count, alpha, tint = null) {
  for (let i = 0; i < count; i++) {
    const v = Math.floor(Math.random() * 255);
    ctx.fillStyle = tint
      ? `rgba(${tint[0] + v * 0.15},${tint[1] + v * 0.2},${tint[2]},${alpha})`
      : `rgba(${v},${v},${v},${alpha})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
}

function toTexture(c, { srgb = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

// One tile spans the full road width and 20 units of length.
export function makeRoadTexture() {
  const s = 256;
  const c = makeCanvas(s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2d2d31';
  ctx.fillRect(0, 0, s, s);
  speckle(ctx, s, s, 1800, 0.12);
  ctx.fillStyle = 'rgba(235,235,235,0.75)';
  ctx.fillRect(8, 0, 3, s);
  ctx.fillRect(s - 11, 0, 3, s);
  ctx.fillStyle = 'rgba(240,200,60,0.85)';
  for (let i = 0; i < 2; i++) ctx.fillRect(s / 2 - 2, i * 128 + 24, 4, 80);
  return toTexture(c);
}

export function makeAsphaltTexture() {
  const s = 256;
  const c = makeCanvas(s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2d2d31';
  ctx.fillRect(0, 0, s, s);
  speckle(ctx, s, s, 1800, 0.12);
  return toTexture(c);
}

// One tile = 8 units, 4x4 paving slabs.
export function makeSidewalkTexture() {
  const s = 256;
  const c = makeCanvas(s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#a3a19c';
  ctx.fillRect(0, 0, s, s);
  speckle(ctx, s, s, 1200, 0.1);
  ctx.strokeStyle = '#8a8884';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 64, 0);
    ctx.lineTo(i * 64, s);
    ctx.moveTo(0, i * 64);
    ctx.lineTo(s, i * 64);
    ctx.stroke();
  }
  return toTexture(c);
}

export function makeGrassTexture() {
  const s = 256;
  const c = makeCanvas(s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#4f7f3a';
  ctx.fillRect(0, 0, s, s);
  speckle(ctx, s, s, 2500, 0.18, [40, 90, 30]);
  return toTexture(c);
}

// Tile = 12x12 units: 4 floors of 4 windows. Facade is white so vertex colours tint it.
export function makeWindowTexture() {
  const s = 256;
  const map = makeCanvas(s);
  const emissive = makeCanvas(s);
  const m = map.getContext('2d');
  const e = emissive.getContext('2d');
  m.fillStyle = '#ffffff';
  m.fillRect(0, 0, s, s);
  speckle(m, s, s, 600, 0.06);
  e.fillStyle = '#000000';
  e.fillRect(0, 0, s, s);
  for (let r = 0; r < 4; r++) {
    for (let col = 0; col < 4; col++) {
      const x = col * 64 + 16;
      const y = r * 64 + 12;
      const shade = 50 + Math.floor(Math.random() * 25);
      m.fillStyle = `rgb(${shade},${shade + 14},${shade + 30})`;
      m.fillRect(x, y, 32, 40);
      m.fillStyle = 'rgba(255,255,255,0.18)';
      m.fillRect(x + 3, y + 3, 10, 14);
      const lit = Math.random();
      e.fillStyle = lit < 0.4 ? '#ffe2a0' : lit < 0.55 ? '#9fc3e8' : '#000000';
      e.fillRect(x, y, 32, 40);
    }
  }
  return { map: toTexture(map), emissiveMap: toTexture(emissive) };
}

export function makeParticleTexture() {
  const s = 64;
  const c = makeCanvas(s);
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.6)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function makeLightPoolTexture() {
  const s = 128;
  const c = makeCanvas(s);
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,225,170,0.9)');
  g.addColorStop(0.5, 'rgba(255,215,150,0.35)');
  g.addColorStop(1, 'rgba(255,200,120,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function makeSignTexture(text, bg = '#1b3a6b', fg = '#ffffff') {
  const c = makeCanvas(512, 128);
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = fg;
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 112);
  ctx.fillStyle = fg;
  ctx.font = 'bold 68px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 68);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
