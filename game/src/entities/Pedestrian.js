import { buildCharacter, animateWalk, PED_LOOKS } from './Character.js';
import { dampAngle } from '../utils/math.js';
import { circleVsAABBs } from '../systems/Physics.js';

const TMP = {};

export class Pedestrian {
  constructor(scene, city, rng, nodeIdx) {
    this.scene = scene;
    this.city = city;
    this.rng = rng;
    this.char = buildCharacter({
      shirt: rng.pick(PED_LOOKS.shirts),
      pants: rng.pick(PED_LOOKS.pants),
      skin: rng.pick(PED_LOOKS.skins),
      hair: rng.pick(PED_LOOKS.hairs),
    });
    scene.add(this.char.group);
    const n = city.walkNodes[nodeIdx];
    this.x = n.x;
    this.z = n.z;
    this.y = 0;
    this.node = nodeIdx;
    this.prev = -1;
    this.target = this.pickNext();
    this.speed = rng.range(1.2, 1.9);
    this.phase = rng.range(0, 6);
    this.state = 'walk';
    this.yaw = 0;
    this.vx = 0;
    this.vz = 0;
    this.timer = 0;
    this.fleeFrom = { x: 0, z: 0 };
    this.radius = 0.4;
  }

  pickNext() {
    const n = this.city.walkNodes[this.node];
    const opts = n.neighbors.filter((i) => i !== this.prev);
    return opts.length ? this.rng.pick(opts) : n.neighbors[0];
  }

  update(dt, colliders) {
    const nodes = this.city.walkNodes;
    if (this.state === 'down') {
      this.timer -= dt;
      this.x += this.vx * dt;
      this.z += this.vz * dt;
      const k = Math.exp(-4 * dt);
      this.vx *= k;
      this.vz *= k;
      if (this.timer <= 0) this.getUp();
    } else if (this.state === 'flee') {
      this.timer -= dt;
      let dx = this.x - this.fleeFrom.x;
      let dz = this.z - this.fleeFrom.z;
      const d = Math.hypot(dx, dz) || 1;
      dx /= d;
      dz /= d;
      this.vx = dx * 5.5;
      this.vz = dz * 5.5;
      this.x += this.vx * dt;
      this.z += this.vz * dt;
      const res = circleVsAABBs(this.x, this.z, this.radius, colliders, TMP);
      this.x = res.x;
      this.z = res.z;
      this.yaw = Math.atan2(-dx, -dz);
      this.phase += 9 * dt;
      animateWalk(this.char, this.phase, 1);
      if (this.timer <= 0) this.returnToSidewalk();
    } else {
      const t = nodes[this.target];
      let dx = t.x - this.x;
      let dz = t.z - this.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.5) {
        this.prev = this.node;
        this.node = this.target;
        this.target = this.pickNext();
      } else {
        dx /= d;
        dz /= d;
        this.vx = dx * this.speed;
        this.vz = dz * this.speed;
        this.x += this.vx * dt;
        this.z += this.vz * dt;
        this.yaw = dampAngle(this.yaw, Math.atan2(-dx, -dz), 8, dt);
      }
      this.phase += this.speed * dt * 1.7;
      animateWalk(this.char, this.phase, 1);
    }
    this.y = this.city.groundHeight(this.x, this.z);
    const g = this.char.group;
    g.position.set(this.x, this.y + (this.state === 'down' ? 0.15 : 0), this.z);
    g.rotation.y = this.yaw;
  }

  knockDown(vx, vz) {
    if (this.state === 'down') return;
    this.state = 'down';
    this.timer = 5 + this.rng.range(0, 3);
    this.vx = vx;
    this.vz = vz;
    if (Math.hypot(vx, vz) > 0.1) this.yaw = Math.atan2(-vx, -vz);
    this.char.body.rotation.x = -Math.PI / 2;
    animateWalk(this.char, 0, 0);
  }

  getUp() {
    this.char.body.rotation.x = 0;
    this.returnToSidewalk();
  }

  returnToSidewalk() {
    this.state = 'walk';
    this.node = this.city.nearestWalkNode(this.x, this.z);
    this.prev = -1;
    this.target = this.node;
    this.vx = this.vz = 0;
  }

  flee(fromX, fromZ, duration = 4) {
    if (this.state === 'down') return;
    this.state = 'flee';
    this.timer = Math.max(this.timer, duration);
    this.fleeFrom.x = fromX;
    this.fleeFrom.z = fromZ;
  }

  dispose() {
    this.scene.remove(this.char.group);
  }
}
