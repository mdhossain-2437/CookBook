import * as THREE from 'three';
import { clamp, damp } from '../utils/math.js';

export const VEHICLE_TYPES = {
  sedan: { name: 'Sedan', w: 2.0, h: 0.62, l: 4.5, cabin: [1.7, 0.6, 2.3, 0.25], wheelR: 0.38, wheelBase: 2.8, maxSpeed: 32, accel: 11, brake: 26, maxSteer: 0.55, mass: 1.0, colors: [0xc0392b, 0x2980b9, 0xf1c40f, 0xecf0f1, 0x2c3e50, 0x27ae60, 0x8e44ad, 0xe67e22, 0x95a5a6, 0x6d4c41] },
  sport: { name: 'Comet GT', w: 2.0, h: 0.5, l: 4.3, cabin: [1.6, 0.48, 1.9, 0.2], wheelR: 0.36, wheelBase: 2.7, maxSpeed: 46, accel: 17, brake: 30, maxSteer: 0.5, mass: 0.9, colors: [0xd62828, 0xffb703, 0x00b4d8, 0x111111, 0xf8f9fa, 0x7209b7] },
  van: { name: 'Cargo Van', w: 2.2, h: 1.0, l: 5.2, cabin: [2.1, 0.95, 3.6, 0.6], cabinPaint: true, wheelR: 0.42, wheelBase: 3.2, maxSpeed: 26, accel: 8, brake: 20, maxSteer: 0.5, mass: 1.5, colors: [0xffffff, 0xd9d9d9, 0x3a506b, 0x9c6644] },
  pickup: { name: 'Pickup', w: 2.1, h: 0.75, l: 5.0, cabin: [1.9, 0.65, 1.6, -0.5], wheelR: 0.44, wheelBase: 3.1, maxSpeed: 30, accel: 10, brake: 24, maxSteer: 0.52, mass: 1.3, colors: [0x8d99ae, 0x4a4e69, 0xb5651d, 0x2d6a4f] },
  taxi: { name: 'Taxi', w: 2.0, h: 0.62, l: 4.5, cabin: [1.7, 0.6, 2.3, 0.25], roofSign: true, wheelR: 0.38, wheelBase: 2.8, maxSpeed: 32, accel: 11, brake: 26, maxSteer: 0.55, mass: 1.0, colors: [0xffc300] },
  police: { name: 'Police Cruiser', w: 2.0, h: 0.62, l: 4.6, cabin: [1.7, 0.6, 2.3, 0.25], police: true, wheelR: 0.38, wheelBase: 2.9, maxSpeed: 40, accel: 14, brake: 28, maxSteer: 0.55, mass: 1.1, colors: [0xf5f5f5] },
};

const GEO_CACHE = new Map();
function geo(key, make) {
  let g = GEO_CACHE.get(key);
  if (!g) {
    g = make();
    GEO_CACHE.set(key, g);
  }
  return g;
}
const WHEEL_GEO = new THREE.CylinderGeometry(1, 1, 0.3, 12);
const WHEEL_MAT = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
const GLASS_MAT = new THREE.MeshStandardMaterial({ color: 0x1c2733, roughness: 0.15, metalness: 0.6 });
const STRIPE_MAT = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
const HEADLIGHT_MAT = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2cc, emissiveIntensity: 0.6 });
const TAILLIGHT_MAT = new THREE.MeshStandardMaterial({ color: 0x550000, emissive: 0xff2200, emissiveIntensity: 0.5 });
const TAXI_SIGN_MAT = new THREE.MeshStandardMaterial({ color: 0xffd60a, emissive: 0xffd60a, emissiveIntensity: 0.5 });
const LIGHT_GEO = new THREE.BoxGeometry(0.4, 0.2, 0.08);
const BAR_GEO = new THREE.BoxGeometry(0.5, 0.18, 0.4);
const SIGN_GEO = new THREE.BoxGeometry(0.9, 0.25, 0.4);

export class Vehicle {
  constructor(typeName, color) {
    const T = VEHICLE_TYPES[typeName];
    this.type = T;
    this.typeName = typeName;
    this.color = color ?? T.colors[Math.floor(Math.random() * T.colors.length)];
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.yaw = 0;
    this.vx = 0;
    this.vz = 0;
    this.steer = 0;
    this.forwardSpeed = 0;
    this.lateralSpeed = 0;
    this.prevForward = 0;
    this.throttleIn = 0;
    this.steerIn = 0;
    this.handbrake = false;
    this.health = 100;
    this.destroyed = false;
    this.driver = null;
    this.ai = null;
    this.isPlayerVehicle = false;
    this.lastDamageBy = null;
    this.onDestroyed = null;
    this.radius = T.l / 2 + 0.3;
    this.sampleR = T.w / 2 + 0.1;
    this.sampleOffsets = [-(T.l / 2 - T.w / 2), 0, T.l / 2 - T.w / 2];
    this.smokeTimer = 0;
    this.burnTimer = 0;
    this.siren = false;
    this.sirenPhase = 0;
    this.wheels = [];
    this.buildMesh();
  }

  buildMesh() {
    const T = this.type;
    const g = new THREE.Group();
    const body = new THREE.Group();
    g.add(body);
    this.mesh = g;
    this.body = body;
    this.paint = new THREE.MeshStandardMaterial({ color: this.color, roughness: 0.35, metalness: 0.4 });
    const baseY = T.wheelR + 0.1;
    const add = (geometry, material, x, y, z, parent = body) => {
      const m = new THREE.Mesh(geometry, material);
      m.position.set(x, y, z);
      m.castShadow = true;
      parent.add(m);
      return m;
    };
    add(geo(`body:${T.name}`, () => new THREE.BoxGeometry(T.w, T.h, T.l)), this.paint, 0, baseY + T.h / 2, 0);
    const [cw, ch, cl, cz] = T.cabin;
    add(geo(`cabin:${T.name}`, () => new THREE.BoxGeometry(cw, ch, cl)), T.cabinPaint ? this.paint : GLASS_MAT, 0, baseY + T.h + ch / 2, cz);
    const cabinTop = baseY + T.h + ch;
    if (T.police) {
      add(geo(`stripe:${T.name}`, () => new THREE.BoxGeometry(T.w + 0.04, T.h * 0.45, T.l * 0.55)), STRIPE_MAT, 0, baseY + T.h / 2, 0.1);
      this.redLight = new THREE.MeshStandardMaterial({ color: 0xff2222, emissive: 0xff2222, emissiveIntensity: 0.4 });
      this.blueLight = new THREE.MeshStandardMaterial({ color: 0x2266ff, emissive: 0x2266ff, emissiveIntensity: 0.4 });
      add(BAR_GEO, this.redLight, -0.3, cabinTop + 0.09, cz - 0.2);
      add(BAR_GEO, this.blueLight, 0.3, cabinTop + 0.09, cz - 0.2);
    }
    if (T.roofSign) add(SIGN_GEO, TAXI_SIGN_MAT, 0, cabinTop + 0.12, cz);
    for (const sx of [-1, 1]) {
      add(LIGHT_GEO, HEADLIGHT_MAT, sx * (T.w / 2 - 0.35), baseY + T.h * 0.6, -T.l / 2 - 0.03);
      add(LIGHT_GEO, TAILLIGHT_MAT, sx * (T.w / 2 - 0.35), baseY + T.h * 0.6, T.l / 2 + 0.03);
    }
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const hub = new THREE.Group();
      hub.position.set(sx * (T.w / 2 - 0.05), T.wheelR, sz * (T.wheelBase / 2));
      const wheel = new THREE.Mesh(WHEEL_GEO, WHEEL_MAT);
      wheel.scale.set(T.wheelR, 1, T.wheelR);
      wheel.rotation.z = Math.PI / 2;
      wheel.castShadow = true;
      hub.add(wheel);
      g.add(hub);
      this.wheels.push({ hub, wheel, front: sz < 0 });
    }
  }

  setControls(throttle, steer, handbrake) {
    this.throttleIn = throttle;
    this.steerIn = steer;
    this.handbrake = handbrake;
  }

  setSiren(on) {
    this.siren = on && !!this.redLight;
  }

  place(x, z, yaw, city) {
    this.x = x;
    this.z = z;
    this.yaw = yaw;
    this.vx = this.vz = 0;
    this.y = city.groundHeight(x, z);
    this.syncMesh();
  }

  update(dt, city, particles) {
    const T = this.type;
    // Steering uses the pre-update forward speed (bicycle model).
    let fx = -Math.sin(this.yaw);
    let fz = -Math.cos(this.yaw);
    let vF = this.vx * fx + this.vz * fz;
    // Steering lock shrinks quickly with speed so top-speed turns are wide instead of twitchy.
    const s = Math.min(1, Math.abs(vF) / T.maxSpeed);
    const steerLimit = (T.maxSteer * (1 - 0.75 * s)) / (1 + 1.5 * s);
    const steerTarget = this.destroyed ? 0 : clamp(this.steerIn, -1, 1) * steerLimit;
    this.steer = damp(this.steer, steerTarget, 8, dt);
    const yawRate = (vF / T.wheelBase) * Math.tan(this.steer);
    this.yaw += yawRate * dt;

    // Re-decompose in the new frame: the turn leaves a lateral slip that grip bleeds off.
    fx = -Math.sin(this.yaw);
    fz = -Math.cos(this.yaw);
    const rx = Math.cos(this.yaw);
    const rz = -Math.sin(this.yaw);
    vF = this.vx * fx + this.vz * fz;
    let vR = this.vx * rx + this.vz * rz;

    const thr = this.destroyed ? 0 : clamp(this.throttleIn, -1, 1);
    if (thr > 0) {
      if (vF < -0.3) vF += T.brake * thr * dt;
      else vF += T.accel * thr * (1 - Math.max(0, vF) / T.maxSpeed) * dt;
    } else if (thr < 0) {
      if (vF > 0.3) vF += T.brake * thr * dt;
      else vF += T.accel * 0.6 * thr * (1 - Math.max(0, -vF) / (T.maxSpeed * 0.4)) * dt;
    }
    if (this.handbrake) vF *= Math.exp(-2.2 * dt);
    vF *= Math.exp(-0.05 * dt);
    const roll = 1.2 * dt;
    vF = Math.abs(vF) < roll ? 0 : vF - Math.sign(vF) * roll;
    vF = clamp(vF, -T.maxSpeed * 0.4, T.maxSpeed);
    vR *= Math.exp(-(this.handbrake ? 1.4 : 6.5) * dt);

    this.vx = fx * vF + rx * vR;
    this.vz = fz * vF + rz * vR;
    this.x += this.vx * dt;
    this.z += this.vz * dt;
    this.y = damp(this.y, city.groundHeight(this.x, this.z), 10, dt);
    this.forwardSpeed = vF;
    this.lateralSpeed = vR;
    this.drifting = Math.abs(vR) > 3.5 && Math.abs(vF) > 4;

    const accel = (vF - this.prevForward) / Math.max(dt, 1e-3);
    this.prevForward = vF;
    this.body.rotation.z = damp(this.body.rotation.z, -yawRate * 0.06, 6, dt);
    this.body.rotation.x = damp(this.body.rotation.x, clamp(-accel * 0.006, -0.08, 0.08), 6, dt);
    for (const w of this.wheels) {
      w.wheel.rotation.x -= (vF * dt) / T.wheelR;
      w.hub.rotation.y = w.front ? this.steer : 0;
    }
    this.syncMesh();
    this.updateEffects(dt, particles, fx, fz, rx, rz);
  }

  updateEffects(dt, particles, fx, fz, rx, rz) {
    const T = this.type;
    this.smokeTimer -= dt;
    if (this.siren) {
      this.sirenPhase += dt;
      const on = Math.floor(this.sirenPhase * 4) % 2 === 0;
      this.redLight.emissiveIntensity = on ? 3 : 0.1;
      this.blueLight.emissiveIntensity = on ? 0.1 : 3;
    } else if (this.redLight) {
      this.redLight.emissiveIntensity = this.blueLight.emissiveIntensity = 0.4;
    }
    if (!particles || this.smokeTimer > 0) return;
    if (this.destroyed) {
      if (this.burnTimer > 0) {
        this.burnTimer -= 0.1;
        particles.fire(this.x + fx * 0.8, this.y + 1, this.z + fz * 0.8, 1);
        particles.smoke(this.x, this.y + 1.4, this.z, 1, 0x222222);
      }
      this.smokeTimer = 0.1;
    } else if (this.drifting) {
      for (const s of [-1, 1]) particles.smoke(this.x - fx * T.wheelBase * 0.5 + rx * s * T.w * 0.5, this.y + 0.2, this.z - fz * T.wheelBase * 0.5 + rz * s * T.w * 0.5, 1, 0xdddddd, 0.5);
      this.smokeTimer = 0.05;
    } else if (this.health < 40) {
      const hx = this.x + fx * (T.l / 2 - 0.6);
      const hz = this.z + fz * (T.l / 2 - 0.6);
      particles.smoke(hx, this.y + 1, hz, 1, this.health < 15 ? 0x333333 : 0x999999);
      if (this.health < 15) particles.fire(hx, this.y + 0.9, hz, 1);
      this.smokeTimer = 0.12;
    }
  }

  applyDamage(amount, by = null) {
    if (this.destroyed) return;
    this.health -= amount;
    if (by) this.lastDamageBy = by;
    if (this.health <= 0) this.destroy();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.health = 0;
    this.burnTimer = 18;
    this.siren = false;
    this.paint.color.setHex(0x151515);
    this.paint.metalness = 0;
    this.paint.roughness = 0.9;
    this.vx *= 0.3;
    this.vz *= 0.3;
    this.onDestroyed?.(this);
  }

  syncMesh() {
    this.mesh.position.set(this.x, this.y, this.z);
    this.mesh.rotation.y = this.yaw;
  }

  dispose() {
    this.paint.dispose();
    this.redLight?.dispose();
    this.blueLight?.dispose();
  }
}
