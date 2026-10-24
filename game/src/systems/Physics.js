import { clamp } from '../utils/math.js';

const TMP = {};

// Pushes a ground circle out of every overlapping AABB collider (xz plane only).
export function circleVsAABBs(x, z, r, colliders, out = {}) {
  let hit = false;
  let nx = 0;
  let nz = 0;
  for (const c of colliders) {
    if (x + r <= c.x0 || x - r >= c.x1 || z + r <= c.z0 || z - r >= c.z1) continue;
    const qx = clamp(x, c.x0, c.x1);
    const qz = clamp(z, c.z0, c.z1);
    let dx = x - qx;
    let dz = z - qz;
    const d2 = dx * dx + dz * dz;
    if (d2 >= r * r) continue;
    if (d2 < 1e-8) {
      const l = x - c.x0;
      const rr = c.x1 - x;
      const t = z - c.z0;
      const b = c.z1 - z;
      const m = Math.min(l, rr, t, b);
      if (m === l) { x = c.x0 - r; nx = -1; nz = 0; }
      else if (m === rr) { x = c.x1 + r; nx = 1; nz = 0; }
      else if (m === t) { z = c.z0 - r; nx = 0; nz = -1; }
      else { z = c.z1 + r; nx = 0; nz = 1; }
    } else {
      const d = Math.sqrt(d2);
      dx /= d;
      dz /= d;
      const pen = r - d;
      x += dx * pen;
      z += dz * pen;
      nx = dx;
      nz = dz;
    }
    hit = true;
  }
  out.x = x;
  out.z = z;
  out.hit = hit;
  out.nx = nx;
  out.nz = nz;
  return out;
}

// Nearest ray hit distance against the 3D boxes (colliders carry y0/y1), or maxT.
export function raycastColliders(ox, oy, oz, dx, dy, dz, maxT, colliders) {
  let best = maxT;
  for (const c of colliders) {
    let tmin = 0;
    let tmax = best;
    let ok = true;
    const y0 = c.y0 ?? 0;
    const y1 = c.y1 ?? 1000;
    for (let axis = 0; axis < 3 && ok; axis++) {
      const lo = axis === 0 ? c.x0 : axis === 1 ? y0 : c.z0;
      const hi = axis === 0 ? c.x1 : axis === 1 ? y1 : c.z1;
      const o = axis === 0 ? ox : axis === 1 ? oy : oz;
      const d = axis === 0 ? dx : axis === 1 ? dy : dz;
      if (Math.abs(d) < 1e-9) {
        if (o < lo || o > hi) ok = false;
        continue;
      }
      let t1 = (lo - o) / d;
      let t2 = (hi - o) / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) ok = false;
    }
    if (ok && tmin < best) best = tmin;
  }
  return best;
}

export function raySphere(ox, oy, oz, dx, dy, dz, cx, cy, cz, r) {
  const lx = cx - ox;
  const ly = cy - oy;
  const lz = cz - oz;
  const tca = lx * dx + ly * dy + lz * dz;
  if (tca < 0) return Infinity;
  const d2 = lx * lx + ly * ly + lz * lz - tca * tca;
  if (d2 > r * r) return Infinity;
  const t = tca - Math.sqrt(r * r - d2);
  return t > 0 ? t : 0;
}

function samples(v, out) {
  const fx = -Math.sin(v.yaw);
  const fz = -Math.cos(v.yaw);
  for (let i = 0; i < 3; i++) {
    const off = v.sampleOffsets[i];
    out[i].x = v.x + fx * off;
    out[i].z = v.z + fz * off;
  }
  return out;
}
const SA = [{ x: 0, z: 0 }, { x: 0, z: 0 }, { x: 0, z: 0 }];
const SB = [{ x: 0, z: 0 }, { x: 0, z: 0 }, { x: 0, z: 0 }];

// Spin a car when an off-centre sample is pushed sideways.
function spin(v, off, nx, nz, impact) {
  const rx = Math.cos(v.yaw);
  const rz = -Math.sin(v.yaw);
  const lat = nx * rx + nz * rz;
  v.yaw += clamp(-off * lat * impact * 0.015, -0.25, 0.25);
}

export function vehicleVsWorld(v, colliders, events) {
  const fx = -Math.sin(v.yaw);
  const fz = -Math.cos(v.yaw);
  let maxImpact = 0;
  for (const off of v.sampleOffsets) {
    const px = v.x + fx * off;
    const pz = v.z + fz * off;
    const res = circleVsAABBs(px, pz, v.sampleR, colliders, TMP);
    if (!res.hit) continue;
    const dx = res.x - px;
    const dz = res.z - pz;
    v.x += dx;
    v.z += dz;
    const n = Math.hypot(dx, dz);
    if (n < 1e-6) continue;
    const nx = dx / n;
    const nz = dz / n;
    const vn = v.vx * nx + v.vz * nz;
    if (vn < 0) {
      const impact = -vn;
      v.vx -= 1.25 * vn * nx;
      v.vz -= 1.25 * vn * nz;
      v.vx *= 0.97;
      v.vz *= 0.97;
      spin(v, off, nx, nz, impact);
      maxImpact = Math.max(maxImpact, impact);
    }
  }
  if (maxImpact > 0) events.onVehicleHitWorld?.(v, maxImpact);
}

export function vehicleVsVehicle(a, b, events) {
  const ddx = b.x - a.x;
  const ddz = b.z - a.z;
  const rr = a.radius + b.radius;
  if (ddx * ddx + ddz * ddz > rr * rr) return;
  const pa = samples(a, SA);
  const pb = samples(b, SB);
  const R = a.sampleR + b.sampleR;
  let best = null;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const ex = pb[j].x - pa[i].x;
      const ez = pb[j].z - pa[i].z;
      const d2 = ex * ex + ez * ez;
      if (d2 >= R * R) continue;
      const d = Math.sqrt(d2) || 1e-4;
      const pen = R - d;
      if (!best || pen > best.pen) best = { nx: ex / d, nz: ez / d, pen, offA: a.sampleOffsets[i], offB: b.sampleOffsets[j] };
    }
  }
  if (!best) return;
  const { nx, nz, pen } = best;
  const ma = a.type.mass;
  const mb = b.type.mass;
  const total = ma + mb;
  a.x -= nx * pen * (mb / total);
  a.z -= nz * pen * (mb / total);
  b.x += nx * pen * (ma / total);
  b.z += nz * pen * (ma / total);
  const vn = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
  if (vn >= 0) return;
  const j = (-1.3 * vn) / (1 / ma + 1 / mb);
  a.vx -= (j * nx) / ma;
  a.vz -= (j * nz) / ma;
  b.vx += (j * nx) / mb;
  b.vz += (j * nz) / mb;
  const impact = -vn;
  spin(a, best.offA, -nx, -nz, impact * 0.6);
  spin(b, best.offB, nx, nz, impact * 0.6);
  events.onVehicleHitVehicle?.(a, b, impact);
}

// Peds (and the on-foot player, which shares the interface) get shoved or run over.
export function vehicleVsPeds(v, peds, events) {
  const speed = Math.hypot(v.vx, v.vz);
  const pts = samples(v, SA);
  for (const p of peds) {
    if (p.state === 'down' || p.downTimer > 0) continue;
    const dx = p.x - v.x;
    const dz = p.z - v.z;
    const reach = v.radius + 1;
    if (dx * dx + dz * dz > reach * reach) continue;
    for (const s of pts) {
      const ex = p.x - s.x;
      const ez = p.z - s.z;
      const R = v.sampleR + p.radius;
      const d2 = ex * ex + ez * ez;
      if (d2 >= R * R) continue;
      const d = Math.sqrt(d2) || 1e-4;
      const nx = ex / d;
      const nz = ez / d;
      if (speed > 2.5) {
        events.onVehicleHitPed?.(v, p, speed, v.vx * 0.7 + nx * 2.5, v.vz * 0.7 + nz * 2.5);
      } else {
        p.x = s.x + nx * R;
        p.z = s.z + nz * R;
      }
      break;
    }
  }
}
