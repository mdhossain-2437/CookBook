import * as THREE from 'three';
import { dist } from '../utils/math.js';

const JOB_TYPES = ['courier', 'taxi', 'race', 'repo'];
const JOB_INFO = {
  courier: { title: 'COURIER', brief: 'Pick up the package and deliver it before time runs out.', reward: 400 },
  taxi: { title: 'TAXI FARE', brief: 'Grab a car, pick up the passenger and drive them to their destination.', reward: 600 },
  race: { title: 'STREET RACE', brief: 'Get a car and blast through all the checkpoints in time.', reward: 1000 },
  repo: { title: 'REPO JOB', brief: 'Find the marked car, take it and bring it to the Mod Garage.', reward: 800 },
};

class Marker {
  constructor(scene, color) {
    this.group = new THREE.Group();
    const mat = () => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false });
    this.cyl = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 1, 24, 1, true), mat());
    this.cyl.position.y = 0.5;
    this.beam = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.9, 90, 10, 1, true), mat());
    this.beam.material.opacity = 0.16;
    this.beam.position.y = 45;
    this.ring = new THREE.Mesh(new THREE.RingGeometry(2.4, 3.0, 32), mat());
    this.ring.material.opacity = 0.6;
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.y = 0.05;
    this.group.add(this.cyl, this.beam, this.ring);
    this.group.visible = false;
    scene.add(this.group);
    this.t = 0;
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  setVisible(v) {
    this.group.visible = v;
  }

  setColor(c) {
    for (const m of [this.cyl, this.beam, this.ring]) m.material.color.setHex(c);
  }

  update(dt) {
    this.t += dt;
    this.ring.rotation.z += dt;
    const s = 1 + Math.sin(this.t * 4) * 0.08;
    this.cyl.scale.set(s, 1, s);
  }
}

export class Missions {
  constructor(game) {
    this.game = game;
    this.city = game.city;
    this.active = null;
    this.cooldown = 0;
    this.targetVehicle = null;
    this.spots = this.city.missionSpots.map((p, i) => ({ x: p.x, z: p.z, type: JOB_TYPES[i % JOB_TYPES.length], marker: new Marker(game.scene, 0xffd23f) }));
    for (const s of this.spots) {
      s.marker.setPosition(s.x, this.city.groundHeight(s.x, s.z), s.z);
      s.marker.setVisible(true);
    }
    this.objMarker = new Marker(game.scene, 0xff3b30);
  }

  update(dt) {
    const g = this.game;
    const p = g.player;
    for (const s of this.spots) s.marker.update(dt);
    this.objMarker.update(dt);
    if (this.cooldown > 0) {
      this.cooldown -= dt;
      return;
    }
    if (!this.active) {
      if (g.deathTimer > 0) return;
      for (const s of this.spots) {
        if (dist(p, s) < (p.vehicle ? 5 : 3)) {
          this.start(s.type);
          break;
        }
      }
      return;
    }
    const m = this.active;
    m.timeLeft -= dt;
    if (m.timeLeft <= 0) return this.fail('Out of time');
    const obj = m.objectives[m.index];
    if (obj.vehicle) {
      if (obj.vehicle.destroyed) return this.fail('The car was destroyed');
      obj.x = obj.vehicle.x;
      obj.z = obj.vehicle.z;
      this.objMarker.setPosition(obj.x, obj.vehicle.y, obj.z);
      if (p.vehicle === obj.vehicle) this.advance();
      return;
    }
    const need = obj.requiresVehicle;
    const hasVehicle = !need || (p.vehicle && (need === true || p.vehicle === need));
    m.hint = !need ? '' : !p.vehicle ? 'you need a vehicle' : !hasVehicle ? 'get back in the marked car' : '';
    const stopped = !obj.mustStop || !p.vehicle || Math.abs(p.vehicle.forwardSpeed) < 2;
    if (hasVehicle && stopped && dist(p, obj) < (p.vehicle ? 5 : 3)) this.advance();
  }

  start(type) {
    const info = JOB_INFO[type];
    const objectives = this.build(type);
    if (!objectives) {
      this.game.hud.notice('No job available right now, try again later.', 3);
      this.cooldown = 3;
      return;
    }
    this.active = { type, title: info.title, reward: info.reward, objectives, index: 0, timeLeft: objectives.reduce((t, o) => t + o.time, 0) + 20, hint: '' };
    for (const s of this.spots) s.marker.setVisible(false);
    this.showObjective();
    this.game.hud.bigMessage(info.title, 'gold', 2.5);
    this.game.hud.notice(info.brief, 6);
    this.game.audio.jingle('start');
  }

  build(type) {
    const { rng, player: p, vehicles } = this.game;
    const city = this.city;
    const farNode = (from, min, max, nodes) => {
      for (let i = 0; i < 40; i++) {
        const n = rng.pick(nodes);
        const d = dist(n, from);
        if (d >= min && d <= max) return n;
      }
      return rng.pick(nodes);
    };
    switch (type) {
      case 'courier': {
        const a = farNode(p, 70, 200, city.walkNodes);
        const b = farNode(a, 100, 300, city.walkNodes);
        return [
          { text: 'Pick up the package', x: a.x, z: a.z, time: dist(p, a) / 7 },
          { text: 'Deliver the package', x: b.x, z: b.z, time: dist(a, b) / 7 },
        ];
      }
      case 'taxi': {
        const a = farNode(p, 80, 220, city.walkNodes);
        const b = farNode(a, 120, 350, city.walkNodes);
        return [
          { text: 'Pick up the passenger (stop at the marker)', x: a.x, z: a.z, time: dist(p, a) / 11 + 15, requiresVehicle: true, mustStop: true },
          { text: 'Drop the passenger at the destination', x: b.x, z: b.z, time: dist(a, b) / 11, requiresVehicle: true, mustStop: true },
        ];
      }
      case 'race': {
        const objs = [];
        let cur = city.nearestNode(p.x, p.z);
        let prev = -1;
        let last = p;
        for (let i = 0; i < 5; i++) {
          for (let k = rng.int(2, 3); k > 0; k--) {
            const cands = city.nodes[cur].neighbors.filter((n) => n !== prev);
            prev = cur;
            cur = rng.pick(cands.length ? cands : city.nodes[cur].neighbors);
          }
          const n = city.nodes[cur];
          objs.push({ text: `Checkpoint ${i + 1} of 5`, x: n.x, z: n.z, time: dist(last, n) / 15 + 3, requiresVehicle: true });
          last = n;
        }
        objs[0].time += 15;
        return objs;
      }
      case 'repo': {
        const cands = vehicles.filter((v) => !v.destroyed && v !== p.vehicle && !v.type.police && dist(v, p) > 120);
        if (!cands.length) return null;
        const v = rng.pick(cands);
        this.targetVehicle = v;
        const garage = city.landmarks.garage;
        return [
          { text: `Steal the marked ${v.type.name}`, x: v.x, z: v.z, time: dist(p, v) / 8 + 30, vehicle: v },
          { text: 'Deliver the car to the Mod Garage', x: garage.x, z: garage.z, time: dist(v, garage) / 10 + 20, requiresVehicle: v, mustStop: true },
        ];
      }
      default:
        return null;
    }
  }

  showObjective() {
    const o = this.active.objectives[this.active.index];
    this.objMarker.setColor(o.requiresVehicle ? 0x4da3ff : 0xff3b30);
    this.objMarker.setPosition(o.x, this.city.groundHeight(o.x, o.z), o.z);
    this.objMarker.setVisible(true);
  }

  advance() {
    const m = this.active;
    m.index++;
    if (m.index >= m.objectives.length) return this.complete();
    this.showObjective();
    this.game.audio.jingle('checkpoint');
  }

  complete() {
    const m = this.active;
    this.game.player.money += m.reward;
    this.game.hud.bigMessage('MISSION PASSED', 'green', 3);
    this.game.hud.notice(`+$${m.reward}`, 3);
    this.game.audio.jingle('pass');
    this.end();
  }

  fail(reason) {
    if (!this.active) return;
    this.game.hud.bigMessage('MISSION FAILED', 'red', 3);
    this.game.hud.notice(reason, 4);
    this.game.audio.jingle('fail');
    this.end();
  }

  end() {
    this.active = null;
    this.targetVehicle = null;
    this.objMarker.setVisible(false);
    this.cooldown = 2;
    for (const s of this.spots) s.marker.setVisible(true);
  }

  hudState() {
    if (!this.active) return null;
    const m = this.active;
    const o = m.objectives[m.index];
    return { title: m.title, objective: o.text + (m.hint ? ` — ${m.hint}` : ''), time: m.timeLeft };
  }

  blips() {
    if (this.active) {
      const o = this.active.objectives[this.active.index];
      return [{ x: o.x, z: o.z, color: o.requiresVehicle ? '#4da3ff' : '#ff3b30', r: 5 }];
    }
    return this.spots.map((s) => ({ x: s.x, z: s.z, color: '#ffd23f', r: 4 }));
  }
}
