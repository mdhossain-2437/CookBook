import { clamp, angleDiff, dist2 } from '../utils/math.js';

// Waypoint-following driver for traffic cars; police mode steers toward the player instead.
export class Driver {
  constructor(vehicle, city, rng, { police = false, cruise } = {}) {
    this.v = vehicle;
    this.city = city;
    this.rng = rng;
    this.police = police;
    this.cruise = cruise ?? rng.range(13, 19);
    this.waypoints = [];
    this.from = -1;
    this.to = -1;
    this.stuck = 0;
    this.reverse = 0;
    this.direct = false;
    vehicle.ai = this;
  }

  spawnOnEdge(a, b, t) {
    const p = this.city.lanePose(a, b, t);
    this.v.place(p.x, p.z, p.yaw, this.city);
    this.from = a;
    this.to = b;
    this.waypoints = [this.city.lanePoint(a, b, 'end')];
  }

  rejoinRoad() {
    const n = this.city.nearestNode(this.v.x, this.v.z);
    const N = this.city.nodes[n];
    this.from = -1;
    this.to = n;
    this.waypoints = [{ x: N.x, z: N.z }];
  }

  planNext(target) {
    const nodes = this.city.nodes;
    const B = nodes[this.to];
    let cands = B.neighbors.filter((n) => n !== this.from);
    if (!cands.length) cands = B.neighbors;
    let next;
    if (target && !this.rng.chance(0.2)) {
      next = cands.reduce((best, n) => (dist2(nodes[n], target) < dist2(nodes[best], target) ? n : best), cands[0]);
    } else {
      next = this.rng.pick(cands);
    }
    this.waypoints.push(this.city.lanePoint(this.to, next, 'start'), this.city.lanePoint(this.to, next, 'end'));
    this.from = this.to;
    this.to = next;
  }

  update(dt, ctx) {
    const v = this.v;
    if (v.destroyed) {
      v.setControls(0, 0, true);
      return;
    }
    const chasing = this.police && ctx.wanted > 0;
    v.setSiren(chasing);
    const target = chasing ? ctx.target : null;
    let targetSpeed = this.cruise;
    let tx;
    let tz;

    if (chasing) {
      const d = Math.hypot(target.x - v.x, target.z - v.z);
      if (d < 34) this.direct = true;
      else if (d > 48 && this.direct) {
        this.direct = false;
        this.rejoinRoad();
      }
    } else {
      this.direct = false;
    }

    if (this.direct) {
      const lead = target.onFoot ? 0 : 0.5;
      tx = target.x + target.vx * lead;
      tz = target.z + target.vz * lead;
      targetSpeed = 38;
      if (target.onFoot) {
        const d = Math.hypot(tx - v.x, tz - v.z);
        targetSpeed = d < 5 ? 0 : Math.min(targetSpeed, 4 + d * 1.5);
      }
    } else {
      if (!this.waypoints.length) this.planNext(target);
      let wp = this.waypoints[0];
      let d = Math.hypot(wp.x - v.x, wp.z - v.z);
      if (d < 3.5) {
        this.waypoints.shift();
        if (!this.waypoints.length) this.planNext(target);
        wp = this.waypoints[0];
        d = Math.hypot(wp.x - v.x, wp.z - v.z);
      }
      tx = wp.x;
      tz = wp.z;
      if (this.waypoints.length > 1 && d < 14) {
        const n = this.waypoints[1];
        const a1 = Math.atan2(-(wp.x - v.x), -(wp.z - v.z));
        const a2 = Math.atan2(-(n.x - wp.x), -(n.z - wp.z));
        if (Math.abs(angleDiff(a1, a2)) > 0.6) targetSpeed = Math.min(targetSpeed, this.police ? 12 : 6);
      }
    }

    const desired = Math.atan2(-(tx - v.x), -(tz - v.z));
    const diff = angleDiff(v.yaw, desired);
    let steer = clamp(diff * 2.2, -1, 1);
    targetSpeed *= 1 - 0.6 * Math.min(1, Math.abs(diff) / 1.2);

    const fx = -Math.sin(v.yaw);
    const fz = -Math.cos(v.yaw);
    const rx = Math.cos(v.yaw);
    const rz = -Math.sin(v.yaw);
    const ramming = this.direct && !target.onFoot;
    let blocker = null;
    for (const o of ctx.vehicles) {
      if (o === v || (ramming && o === ctx.playerVehicle)) continue;
      const dx = o.x - v.x;
      const dz = o.z - v.z;
      if (dx * dx + dz * dz > 256) continue;
      const ahead = dx * fx + dz * fz;
      const lat = dx * rx + dz * rz;
      const moving = Math.hypot(o.vx, o.vz) > 1;
      // Parked cars in the adjacent lane only count when they really overlap our path.
      if (ahead > 0 && ahead < 13 && Math.abs(lat) < (moving ? 2.8 : 2.2)) {
        targetSpeed = Math.min(targetSpeed, Math.max(0, (ahead - 5.5) * 2.5));
        if (!blocker || ahead < blocker.ahead) blocker = { ahead, lat, moving };
      }
    }
    if (blocker && !blocker.moving && blocker.ahead < 10) {
      // Creep around stationary obstacles (parked, abandoned or wrecked cars) instead of waiting forever.
      steer = clamp(steer + (blocker.lat > 0 ? 0.6 : -0.6), -1, 1);
      targetSpeed = Math.max(targetSpeed, 4);
    }
    if (!ramming) {
      for (const p of ctx.pedestrians) {
        const dx = p.x - v.x;
        const dz = p.z - v.z;
        if (dx * dx + dz * dz > 121) continue;
        const ahead = dx * fx + dz * fz;
        const lat = dx * rx + dz * rz;
        if (ahead > 0 && ahead < 10 && Math.abs(lat) < 2.2) targetSpeed = Math.min(targetSpeed, Math.max(0, (ahead - 4) * 2));
      }
    }

    let throttle = clamp((targetSpeed - v.forwardSpeed) * 0.35, -1, 1);
    // Stuck = not moving while either pushing the throttle or held up by something that is not moving either.
    if (Math.abs(v.forwardSpeed) < 0.4 && (throttle > 0.3 || (blocker && !blocker.moving))) this.stuck += dt;
    else this.stuck = 0;
    if (this.stuck > 2) {
      this.reverse = 1.3;
      this.stuck = 0;
    }
    if (this.reverse > 0) {
      this.reverse -= dt;
      throttle = -0.9;
      steer = -steer;
    }
    v.setControls(throttle, steer, false);
  }
}
