import { buildCharacter, animateWalk } from './Character.js';
import { PLAYER } from '../config.js';
import { clamp, damp, dampAngle } from '../utils/math.js';
import { circleVsAABBs } from '../systems/Physics.js';

const TMP = {};

export class Player {
  constructor(scene, city) {
    this.city = city;
    this.char = buildCharacter({ shirt: 0x2f6fde, pants: 0x2a2a30, skin: 0xd9a37e, hair: 0x2b1b12 });
    scene.add(this.char.group);
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.vx = 0;
    this.vz = 0;
    this.vy = 0;
    this.yaw = 0;
    this.phase = 0;
    this.health = 100;
    this.money = 500;
    this.vehicle = null;
    this.downTimer = 0;
    this.onGround = true;
    this.sinceDamage = 10;
    this.radius = PLAYER.radius;
  }

  setPosition(x, z, yaw) {
    this.x = x;
    this.z = z;
    this.yaw = yaw;
    this.y = this.city.groundHeight(x, z);
    this.vx = this.vz = this.vy = 0;
    this.sync();
  }

  updateFoot(dt, input, camYaw, colliders) {
    this.sinceDamage += dt;
    if (this.sinceDamage > 5 && this.health < 50) this.health = Math.min(50, this.health + 2 * dt);
    const ground = this.city.groundHeight(this.x, this.z);

    if (this.downTimer > 0) {
      this.downTimer -= dt;
      this.x += this.vx * dt;
      this.z += this.vz * dt;
      const k = Math.exp(-3 * dt);
      this.vx *= k;
      this.vz *= k;
      this.y = ground;
      if (this.downTimer <= 0) this.getUp();
    } else {
      const fwdIn = (input.down('KeyW') || input.down('ArrowUp') ? 1 : 0) - (input.down('KeyS') || input.down('ArrowDown') ? 1 : 0);
      const strafe = (input.down('KeyD') || input.down('ArrowRight') ? 1 : 0) - (input.down('KeyA') || input.down('ArrowLeft') ? 1 : 0);
      const fx = -Math.sin(camYaw);
      const fz = -Math.cos(camYaw);
      const rx = Math.cos(camYaw);
      const rz = -Math.sin(camYaw);
      let mx = fx * fwdIn + rx * strafe;
      let mz = fz * fwdIn + rz * strafe;
      const len = Math.hypot(mx, mz);
      if (len > 0) {
        mx /= len;
        mz /= len;
      }
      const speed = len > 0 ? (input.down('ShiftLeft') || input.down('ShiftRight') ? PLAYER.runSpeed : PLAYER.walkSpeed) : 0;
      this.vx = damp(this.vx, mx * speed, 12, dt);
      this.vz = damp(this.vz, mz * speed, 12, dt);
      if (len > 0) this.yaw = dampAngle(this.yaw, Math.atan2(-mx, -mz), 12, dt);

      if (this.onGround && input.justPressed('Space')) {
        this.vy = PLAYER.jumpSpeed;
        this.onGround = false;
      }
      this.vy += PLAYER.gravity * dt;
      this.y += this.vy * dt;
      if (this.y <= ground) {
        this.y = ground;
        this.vy = 0;
        this.onGround = true;
      }
      this.x += this.vx * dt;
      this.z += this.vz * dt;

      const moving = Math.hypot(this.vx, this.vz);
      this.phase += moving * dt * 1.6;
      animateWalk(this.char, this.onGround ? this.phase : 1.2, this.onGround ? clamp(moving / 4, 0, 1) : 0.5);
    }

    const res = circleVsAABBs(this.x, this.z, this.radius, colliders, TMP);
    this.x = res.x;
    this.z = res.z;
    this.sync();
  }

  knockDown(vx, vz, damage) {
    this.downTimer = 1.6;
    this.vx = vx;
    this.vz = vz;
    if (Math.hypot(vx, vz) > 0.1) this.yaw = Math.atan2(-vx, -vz);
    this.char.body.rotation.x = -Math.PI / 2;
    animateWalk(this.char, 0, 0);
    this.damage(damage);
  }

  getUp() {
    this.downTimer = 0;
    this.char.body.rotation.x = 0;
  }

  damage(amount) {
    this.health = Math.max(0, this.health - amount);
    this.sinceDamage = 0;
  }

  sync() {
    const g = this.char.group;
    g.position.set(this.x, this.y + (this.downTimer > 0 ? 0.15 : 0), this.z);
    g.rotation.y = this.yaw;
  }
}
