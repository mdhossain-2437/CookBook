import { CITY } from '../config.js';

// Base map is rasterised once at 1px per world unit; each frame draws a rotated, clipped window of it.
export class Minimap {
  constructor(canvas, city) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.size = canvas.width;
    this.scale = 0.6;
    const b = city.bounds;
    const w = Math.ceil(b.maxX - b.minX);
    const h = Math.ceil(b.maxZ - b.minZ);
    const base = document.createElement('canvas');
    base.width = w;
    base.height = h;
    const c = base.getContext('2d');
    c.fillStyle = '#5a8a46';
    c.fillRect(0, 0, w, h);
    c.translate(-b.minX, -b.minZ);
    c.strokeStyle = '#2b2b30';
    c.lineWidth = CITY.roadWidth;
    c.lineCap = 'square';
    c.beginPath();
    for (const e of city.edges) {
      const A = city.nodes[e.a];
      const B = city.nodes[e.b];
      c.moveTo(A.x, A.z);
      c.lineTo(B.x, B.z);
    }
    c.stroke();
    for (const bl of city.blocks) {
      c.fillStyle = bl.type === 'park' ? '#3f7a3a' : '#9b9b97';
      c.fillRect(bl.x0, bl.z0, bl.x1 - bl.x0, bl.z1 - bl.z0);
    }
    const landmarkColors = { police: '#2f5fbf', hospital: '#d64545', garage: '#c58a2a' };
    for (const bd of city.buildings) {
      c.fillStyle = landmarkColors[bd.landmark] || '#62626a';
      c.fillRect(bd.x0, bd.z0, bd.x1 - bd.x0, bd.z1 - bd.z0);
    }
    this.base = base;
    this.baseX = b.minX;
    this.baseZ = b.minZ;
  }

  draw(px, pz, pyaw, camYaw, blips) {
    const { ctx, size, scale: s } = this;
    const half = size / 2;
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath();
    ctx.arc(half, half, half - 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = '#163a5c';
    ctx.fillRect(0, 0, size, size);
    ctx.translate(half, half);
    ctx.rotate(camYaw);
    ctx.scale(s, s);
    ctx.translate(-px, -pz);
    ctx.drawImage(this.base, this.baseX, this.baseZ);
    for (const b of blips) {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.z, b.r / s, 0, Math.PI * 2);
      ctx.fill();
    }
    const fx = -Math.sin(pyaw);
    const fz = -Math.cos(pyaw);
    const rx = Math.cos(pyaw);
    const rz = -Math.sin(pyaw);
    const L = 7 / s;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5 / s;
    ctx.beginPath();
    ctx.moveTo(px + fx * L, pz + fz * L);
    ctx.lineTo(px - fx * L * 0.7 + rx * L * 0.6, pz - fz * L * 0.7 + rz * L * 0.6);
    ctx.lineTo(px - fx * L * 0.7 - rx * L * 0.6, pz - fz * L * 0.7 - rz * L * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(half, half, half - 2, 0, Math.PI * 2);
    ctx.stroke();
    const nx = half + (half - 14) * Math.sin(camYaw);
    const ny = half - (half - 14) * Math.cos(camYaw);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', nx, ny);
  }
}
