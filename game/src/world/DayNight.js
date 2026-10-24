import * as THREE from 'three';
import { DAY_LENGTH, START_TIME } from '../config.js';
import { clamp } from '../utils/math.js';

const NIGHT = new THREE.Color(0x0a1020);
const DAWN = new THREE.Color(0xf29b5c);
const DAY = new THREE.Color(0x8ec5f2);
const SUN_WARM = new THREE.Color(0xffb070);
const SUN_WHITE = new THREE.Color(0xfff4e0);
const MOON = new THREE.Color(0x8899cc);

const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export class DayNight {
  constructor(scene) {
    this.scene = scene;
    this.t = START_TIME;
    this.night = 0;
    this.sun = new THREE.DirectionalLight(0xffffff, 2);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera;
    sc.left = sc.bottom = -90;
    sc.right = sc.top = 90;
    sc.near = 1;
    sc.far = 420;
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.03;
    this.hemi = new THREE.HemisphereLight(0xbfdfff, 0x3a3a30, 0.6);
    scene.add(this.sun, this.sun.target, this.hemi);
    this.sky = new THREE.Color();
    scene.background = new THREE.Color();
    scene.fog = new THREE.Fog(0x8ec5f2, 120, 560);
  }

  get hours() {
    return this.t * 24;
  }

  update(dt, fx, fz) {
    this.t = (this.t + dt / DAY_LENGTH) % 1;
    const phi = (this.t - 0.25) * Math.PI * 2;
    const e = Math.sin(phi);
    const dayF = smoothstep(-0.12, 0.3, e);
    const dawnF = Math.exp(-(e * e) / 0.02);
    this.sky.copy(NIGHT).lerp(DAY, dayF).lerp(DAWN, dawnF * 0.7);
    this.scene.background.copy(this.sky);
    this.scene.fog.color.copy(this.sky);
    this.night = 1 - dayF;

    const dirX = Math.cos(phi);
    const dirY = Math.sin(phi);
    const dirZ = 0.35;
    if (e > 0) {
      this.sun.position.set(fx + dirX * 140, dirY * 140, fz + dirZ * 140);
      this.sun.intensity = Math.max(0.12, 2.6 * Math.pow(clamp(e, 0, 1), 0.6));
      this.sun.color.copy(SUN_WARM).lerp(SUN_WHITE, smoothstep(0, 0.5, e));
    } else {
      this.sun.position.set(fx - dirX * 140, -dirY * 140, fz + dirZ * 140);
      this.sun.intensity = 0.35;
      this.sun.color.copy(MOON);
    }
    this.sun.target.position.set(fx, 0, fz);
    this.hemi.intensity = 0.32 + 0.4 * dayF;
    this.hemi.color.copy(this.sky).lerp(new THREE.Color(0xffffff), 0.3);
  }
}
