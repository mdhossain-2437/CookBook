import * as THREE from 'three';
import { makeParticleTexture } from '../world/textures.js';

const rnd = (s) => (Math.random() - 0.5) * s;

export class Particles {
  constructor(scene, max = 240) {
    this.tex = makeParticleTexture();
    this.items = [];
    this.next = 0;
    for (let i = 0; i < max; i++) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.tex, transparent: true, depthWrite: false, opacity: 0 }));
      sprite.visible = false;
      scene.add(sprite);
      this.items.push({ sprite, life: 0, maxLife: 1, vx: 0, vy: 0, vz: 0, size: 1, growth: 0, gravity: 0, opacity: 1 });
    }
  }

  emit({ x, y, z, vx = 0, vy = 0, vz = 0, life = 1, size = 1, growth = 0, gravity = 0, color = 0xffffff, opacity = 1, additive = false }) {
    const it = this.items[this.next];
    this.next = (this.next + 1) % this.items.length;
    Object.assign(it, { life, maxLife: life, vx, vy, vz, size, growth, gravity, opacity });
    const s = it.sprite;
    s.visible = true;
    s.position.set(x, y, z);
    s.scale.set(size, size, 1);
    s.material.color.setHex(color);
    s.material.opacity = opacity;
    s.material.blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
  }

  update(dt) {
    for (const it of this.items) {
      if (it.life <= 0) continue;
      it.life -= dt;
      if (it.life <= 0) {
        it.sprite.visible = false;
        continue;
      }
      it.vy += it.gravity * dt;
      const s = it.sprite;
      s.position.x += it.vx * dt;
      s.position.y += it.vy * dt;
      s.position.z += it.vz * dt;
      it.size += it.growth * dt;
      s.scale.set(it.size, it.size, 1);
      s.material.opacity = it.opacity * (it.life / it.maxLife);
    }
  }

  smoke(x, y, z, n = 1, color = 0xaaaaaa, spread = 1) {
    for (let i = 0; i < n; i++) {
      this.emit({ x: x + rnd(0.4), y, z: z + rnd(0.4), vx: rnd(0.8) * spread, vy: 1.2 + Math.random(), vz: rnd(0.8) * spread, life: 0.9 + Math.random() * 0.6, size: 0.8, growth: 1.8, color, opacity: 0.45 });
    }
  }

  fire(x, y, z, n = 1) {
    for (let i = 0; i < n; i++) {
      this.emit({ x: x + rnd(0.6), y, z: z + rnd(0.6), vx: rnd(0.6), vy: 2.5, vz: rnd(0.6), life: 0.5, size: 1.2, growth: 0.5, color: 0xff7a1a, opacity: 0.9, additive: true });
    }
  }

  sparks(x, y, z, n = 8) {
    for (let i = 0; i < n; i++) {
      this.emit({ x, y, z, vx: rnd(8), vy: 2 + Math.random() * 4, vz: rnd(8), life: 0.35, size: 0.25, gravity: -15, color: 0xffcc66, additive: true });
    }
  }

  dust(x, y, z, n = 4) {
    for (let i = 0; i < n; i++) {
      this.emit({ x, y, z, vx: rnd(2), vy: 0.5 + Math.random(), vz: rnd(2), life: 0.5, size: 0.4, growth: 1.2, color: 0xc9c2b2, opacity: 0.6 });
    }
  }

  explosion(x, y, z) {
    for (let i = 0; i < 14; i++) {
      this.emit({ x: x + rnd(1.5), y: y + 0.5, z: z + rnd(1.5), vx: rnd(5), vy: 2 + Math.random() * 5, vz: rnd(5), life: 0.6 + Math.random() * 0.4, size: 3, growth: 2, color: 0xff6a00, opacity: 1, additive: true });
    }
    for (let i = 0; i < 10; i++) {
      this.emit({ x: x + rnd(1), y: y + 1, z: z + rnd(1), vx: rnd(2), vy: 2 + Math.random() * 2, vz: rnd(2), life: 1.6 + Math.random(), size: 2, growth: 3, color: 0x333333, opacity: 0.7 });
    }
    this.sparks(x, y + 1, z, 20);
  }
}
