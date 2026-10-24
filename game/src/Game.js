import * as THREE from 'three';
import { POPULATION } from './config.js';
import { Random } from './utils/Random.js';
import { clamp, dist } from './utils/math.js';
import { Input } from './input/Input.js';
import { City } from './world/City.js';
import { DayNight } from './world/DayNight.js';
import { Player } from './entities/Player.js';
import { Pedestrian } from './entities/Pedestrian.js';
import { Vehicle } from './entities/Vehicle.js';
import { Driver } from './entities/TrafficAI.js';
import { vehicleVsWorld, vehicleVsVehicle, vehicleVsPeds, raycastColliders, raySphere } from './systems/Physics.js';
import { CameraRig } from './systems/CameraRig.js';
import { Particles } from './systems/Particles.js';
import { Wanted } from './systems/Wanted.js';
import { Missions } from './systems/Missions.js';
import { GameAudio } from './audio/GameAudio.js';
import { HUD } from './ui/HUD.js';
import { Minimap } from './ui/Minimap.js';

const TRAFFIC_TYPES = ['sedan', 'sedan', 'sedan', 'sedan', 'sport', 'van', 'pickup', 'taxi', 'taxi'];
const POLICE_COUNT = [0, 1, 2, 3, 4, 6];
const ENTER_RADIUS = 5;

export class Game {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = options;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(62, 1, 0.1, 900);
    this.rng = new Random(options.seed ?? 2024);
    this.input = new Input(canvas);
    this.hud = new HUD();
    this.audio = new GameAudio();
    this.particles = new Particles(this.scene);
    this.city = new City(this.scene, 11);
    this.dayNight = new DayNight(this.scene);
    if (options.time != null) this.dayNight.t = clamp(parseFloat(options.time) || 0, 0, 0.999);
    this.minimap = new Minimap(document.getElementById('minimap'), this.city);
    this.player = new Player(this.scene, this.city);
    this.cameraRig = new CameraRig(this.camera);
    this.wanted = new Wanted();
    this.wanted.onChange = (level) => {
      if (level > 0) this.hud.notice(`Wanted level ${level}`, 2);
    };
    this.vehicles = [];
    this.peds = [];
    this.missions = new Missions(this);
    this.paused = !options.autostart;
    this.time = 0;
    this.deathTimer = 0;
    this.deathKind = null;
    this.fireCooldown = 0;
    this.spawnCooldown = 0;
    this.policeCooldown = 0;
    this.bustTimer = 0;
    this.nearestPolice = Infinity;
    this.headlights = this.makeHeadlights();
    this.tracer = this.makeTracer();
    this.physicsEvents = this.makePhysicsEvents();
    this.populate();
    this.bindUI();
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  // ---------- setup ----------

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  makeHeadlights() {
    const group = new THREE.Group();
    group.lights = [];
    for (const sx of [-0.7, 0.7]) {
      const light = new THREE.SpotLight(0xfff4d6, 0, 55, 0.5, 0.5, 1.2);
      light.position.set(sx, 0.8, 0);
      light.target.position.set(sx, 0, -16);
      group.add(light, light.target);
      group.lights.push(light);
    }
    return group;
  }

  makeTracer() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    const line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 0.9 }));
    line.visible = false;
    line.frustumCulled = false;
    this.scene.add(line);
    line.timer = 0;
    return line;
  }

  bindUI() {
    const overlay = document.getElementById('overlay');
    const begin = () => {
      this.audio.ensure();
      if (this.options.autostart) {
        this.hud.showOverlay(false);
        this.paused = false;
      } else {
        this.input.lock();
      }
    };
    document.getElementById('play').addEventListener('click', begin);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) begin();
    });
    this.input.onLockChange = (locked) => {
      if (this.options.autostart) return;
      this.paused = !locked;
      this.hud.showOverlay(!locked, true);
    };
    if (this.options.autostart) {
      this.hud.showOverlay(false);
      this.input.freeLook = true;
    }
  }

  populate() {
    const s = this.city.start;
    this.player.setPosition(s.x, s.z, s.yaw);
    this.cameraRig.yaw = s.yaw;
    this.addVehicle('sport', s.car.x, s.car.z, s.car.yaw, 0xd62828);
    for (const p of this.rng.shuffle(this.city.parkedSpots).slice(0, POPULATION.parked)) this.addVehicle(this.rng.pick(TRAFFIC_TYPES), p.x, p.z, p.yaw);
    for (const p of this.city.policeSpots) this.addVehicle('police', p.x, p.z, p.yaw);
    for (let i = 0; i < POPULATION.traffic; i++) this.spawnTraffic(true);
    for (let i = 0; i < POPULATION.peds; i++) this.spawnPed(true);
  }

  addVehicle(typeName, x, z, yaw, color) {
    const v = new Vehicle(typeName, color);
    v.place(x, z, yaw, this.city);
    v.onDestroyed = (veh) => this.onVehicleDestroyed(veh);
    this.scene.add(v.mesh);
    this.vehicles.push(v);
    return v;
  }

  removeVehicle(v) {
    if (this.headlights.parent === v.mesh) v.mesh.remove(this.headlights);
    this.scene.remove(v.mesh);
    v.dispose();
    const i = this.vehicles.indexOf(v);
    if (i >= 0) this.vehicles.splice(i, 1);
  }

  spawnTraffic(initial) {
    const p = this.player;
    for (let attempt = 0; attempt < 12; attempt++) {
      const e = this.rng.pick(this.city.edges);
      const [a, b] = this.rng.chance(0.5) ? [e.a, e.b] : [e.b, e.a];
      const t = this.rng.range(0.2, 0.8);
      const pose = this.city.lanePose(a, b, t);
      const d = dist(pose, p);
      if (initial ? d < 25 : d < POPULATION.trafficSpawnMin || d > POPULATION.trafficSpawnMax) continue;
      if (this.vehicles.some((v) => dist(v, pose) < 12)) continue;
      const v = this.addVehicle(this.rng.pick(TRAFFIC_TYPES), pose.x, pose.z, pose.yaw);
      new Driver(v, this.city, this.rng).spawnOnEdge(a, b, t);
      return v;
    }
    return null;
  }

  spawnPolice() {
    const p = this.player;
    for (let attempt = 0; attempt < 16; attempt++) {
      const e = this.rng.pick(this.city.edges);
      const [a, b] = this.rng.chance(0.5) ? [e.a, e.b] : [e.b, e.a];
      const t = this.rng.range(0.2, 0.8);
      const pose = this.city.lanePose(a, b, t);
      const d = dist(pose, p);
      if (d < 110 || d > 240) continue;
      if (this.vehicles.some((v) => dist(v, pose) < 12)) continue;
      const v = this.addVehicle('police', pose.x, pose.z, pose.yaw);
      new Driver(v, this.city, this.rng, { police: true, cruise: 34 }).spawnOnEdge(a, b, t);
      return v;
    }
    return null;
  }

  spawnPed(initial) {
    const p = this.player;
    const camDir = new THREE.Vector3();
    this.camera.getWorldDirection(camDir);
    for (let attempt = 0; attempt < 12; attempt++) {
      const idx = this.rng.int(0, this.city.walkNodes.length - 1);
      const n = this.city.walkNodes[idx];
      const d = dist(n, p);
      if (initial ? d < 12 : d < POPULATION.pedSpawnMin || d > POPULATION.pedSpawnMax) continue;
      const behind = (n.x - p.x) * camDir.x + (n.z - p.z) * camDir.z < 0;
      if (!initial && !behind && d < 90) continue;
      const ped = new Pedestrian(this.scene, this.city, this.rng, idx);
      this.peds.push(ped);
      return ped;
    }
    return null;
  }

  spawnPedAt(x, z) {
    const ped = new Pedestrian(this.scene, this.city, this.rng, this.city.nearestWalkNode(x, z));
    ped.x = x;
    ped.z = z;
    this.peds.push(ped);
    return ped;
  }

  // ---------- main loop ----------

  start() {
    let last = performance.now();
    const loop = (now) => {
      requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      this.update(dt);
      this.renderer.render(this.scene, this.camera);
    };
    requestAnimationFrame(loop);
  }

  update(dt) {
    if (!this.paused) {
      this.time += dt;
      const p = this.player;
      this.dayNight.update(dt, p.x, p.z);
      this.city.setNight(this.dayNight.night);
      for (const l of this.headlights.lights) l.intensity = this.dayNight.night * 90;

      if (this.deathTimer > 0) this.updateDeath(dt);
      else this.updatePlay(dt);
      this.updateAI(dt);
      for (const v of this.vehicles) v.update(dt, this.city, this.particles);
      this.physicsStep(dt);
      if (p.vehicle) {
        p.x = p.vehicle.x;
        p.z = p.vehicle.z;
        p.y = p.vehicle.y;
      }
      this.updatePeds(dt);
      this.updatePopulation(dt);
      this.updatePolice(dt);
      this.missions.update(dt);
      this.particles.update(dt);
      if (this.tracer.visible && (this.tracer.timer -= dt) <= 0) this.tracer.visible = false;
      this.updateCamera(dt);
      this.updateHUD(dt);
      this.updateAudio();
      if (this.input.justPressed('KeyM')) this.hud.notice(this.audio.toggleMute() ? 'Sound off' : 'Sound on', 1.5);
      if (this.input.justPressed('KeyH')) this.hud.toggleHelp();
    }
    this.input.endFrame();
  }

  updatePlay(dt) {
    const p = this.player;
    const input = this.input;
    this.fireCooldown -= dt;
    if (p.vehicle) {
      const v = p.vehicle;
      const thr = (input.down('KeyW') || input.down('ArrowUp') ? 1 : 0) - (input.down('KeyS') || input.down('ArrowDown') ? 1 : 0);
      const steer = (input.down('KeyA') || input.down('ArrowLeft') ? 1 : 0) - (input.down('KeyD') || input.down('ArrowRight') ? 1 : 0);
      v.setControls(thr, steer, input.down('Space'));
      this.hud.prompt('');
      if (input.justPressed('KeyE') || input.justPressed('KeyF')) this.exitVehicle();
    } else {
      p.updateFoot(dt, input, this.cameraRig.yaw, this.city.colliders);
      const near = this.nearestVehicle(p.x, p.z, ENTER_RADIUS);
      this.hud.prompt(near && p.downTimer <= 0 ? `Press E to enter ${near.type.name}` : '');
      if (near && p.downTimer <= 0 && (input.justPressed('KeyE') || input.justPressed('KeyF'))) this.enterVehicle(near);
      if (input.down('Mouse0') && this.fireCooldown <= 0 && p.downTimer <= 0) this.fire();
    }
    if (p.health <= 0) this.die('wasted');
  }

  nearestVehicle(x, z, radius) {
    let best = null;
    let bestD = radius;
    for (const v of this.vehicles) {
      if (v.destroyed) continue;
      const d = Math.hypot(v.x - x, v.z - z) - v.type.w / 2;
      if (d < bestD) {
        bestD = d;
        best = v;
      }
    }
    return best;
  }

  enterVehicle(v) {
    const p = this.player;
    if (v.ai) {
      const rx = Math.cos(v.yaw);
      const rz = -Math.sin(v.yaw);
      const ped = this.spawnPedAt(v.x + rx * 2.4, v.z + rz * 2.4);
      ped.flee(v.x, v.z, 6);
      const wasPolice = v.ai.police;
      v.ai = null;
      this.wanted.crime(wasPolice ? 'jackPolice' : 'jack');
      this.hud.notice(wasPolice ? 'You jacked a police cruiser!' : 'Carjacking!', 2);
    } else if (v.type.police) {
      this.wanted.crime('jack');
      this.hud.notice('Stealing a police cruiser!', 2);
    }
    v.driver = p;
    v.isPlayerVehicle = true;
    v.setControls(0, 0, false);
    p.vehicle = v;
    p.char.group.visible = false;
    v.mesh.add(this.headlights);
    this.hud.prompt('');
  }

  exitVehicle(bail = true) {
    const p = this.player;
    const v = p.vehicle;
    if (!v) return;
    const speed = Math.hypot(v.vx, v.vz);
    const rx = Math.cos(v.yaw);
    const rz = -Math.sin(v.yaw);
    p.x = v.x - rx * (v.type.w / 2 + 0.9);
    p.z = v.z - rz * (v.type.w / 2 + 0.9);
    p.y = this.city.groundHeight(p.x, p.z);
    p.yaw = v.yaw;
    p.vx = p.vz = p.vy = 0;
    v.driver = null;
    v.isPlayerVehicle = false;
    v.setControls(0, 0, true);
    v.mesh.remove(this.headlights);
    p.vehicle = null;
    p.char.group.visible = true;
    p.sync();
    if (bail && speed > 6) p.knockDown(v.vx * 0.8, v.vz * 0.8, speed * 1.5);
  }

  fire() {
    this.fireCooldown = 0.18;
    this.audio.shot();
    const p = this.player;
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    // Aim from the character's chest toward where the crosshair points.
    const aim = this.camera.position.clone().addScaledVector(dir, 80);
    const ox = p.x;
    const oy = p.y + 1.3;
    const oz = p.z;
    dir.set(aim.x - ox, aim.y - oy, aim.z - oz).normalize();
    let bestT = 120;
    let kind = null;
    let target = null;
    const tWorld = raycastColliders(ox, oy, oz, dir.x, dir.y, dir.z, bestT, this.city.colliders);
    if (tWorld < bestT) {
      bestT = tWorld;
      kind = 'world';
    }
    for (const ped of this.peds) {
      const t = raySphere(ox, oy, oz, dir.x, dir.y, dir.z, ped.x, ped.y + 0.9, ped.z, 0.6);
      if (t < bestT) {
        bestT = t;
        kind = 'ped';
        target = ped;
      }
    }
    for (const v of this.vehicles) {
      const t = raySphere(ox, oy, oz, dir.x, dir.y, dir.z, v.x, v.y + 0.7, v.z, v.type.l * 0.45);
      if (t < bestT) {
        bestT = t;
        kind = 'vehicle';
        target = v;
      }
    }
    const hx = ox + dir.x * bestT;
    const hy = oy + dir.y * bestT;
    const hz = oz + dir.z * bestT;
    const pos = this.tracer.geometry.attributes.position;
    pos.setXYZ(0, ox, oy, oz);
    pos.setXYZ(1, hx, hy, hz);
    pos.needsUpdate = true;
    this.tracer.visible = true;
    this.tracer.timer = 0.06;
    this.particles.emit({ x: ox + dir.x * 0.6, y: oy + dir.y * 0.6, z: oz + dir.z * 0.6, life: 0.08, size: 0.7, color: 0xffd080, additive: true });

    if (kind === 'ped') {
      target.knockDown(dir.x * 4, dir.z * 4);
      this.particles.dust(hx, hy, hz, 3);
      this.wanted.crime('shootPed');
    } else if (kind === 'vehicle') {
      target.applyDamage(12, 'player');
      this.particles.sparks(hx, hy, hz, 6);
      this.wanted.crime(target.type.police ? 'shootPolice' : 'shootCar');
    } else if (kind === 'world') {
      this.particles.dust(hx, hy, hz, 3);
    }
    if (this.nearestPolice < 60) this.wanted.crime('shotNearPolice');
    this.scarePeds(p.x, p.z, 25, p.x, p.z, target);
  }

  scarePeds(x, z, radius, fromX, fromZ, except = null) {
    for (const ped of this.peds) {
      if (ped !== except && Math.hypot(ped.x - x, ped.z - z) < radius) ped.flee(fromX, fromZ, 4);
    }
  }

  // ---------- simulation ----------

  updateAI(dt) {
    const p = this.player;
    const pv = p.vehicle;
    const ctx = {
      vehicles: this.vehicles,
      pedestrians: pv ? this.peds : [...this.peds, p],
      playerVehicle: pv,
      wanted: this.deathTimer > 0 ? 0 : this.wanted.level,
      target: { x: p.x, z: p.z, vx: pv ? pv.vx : p.vx, vz: pv ? pv.vz : p.vz, onFoot: !pv },
    };
    for (const v of this.vehicles) if (v.ai) v.ai.update(dt, ctx);
  }

  makePhysicsEvents() {
    const front = (v) => ({ x: v.x - Math.sin(v.yaw) * v.type.l * 0.5, z: v.z - Math.cos(v.yaw) * v.type.l * 0.5 });
    return {
      onVehicleHitWorld: (v, impact) => {
        if (impact < 6) return;
        v.applyDamage((impact - 6) * 2.5, v.isPlayerVehicle ? 'player' : null);
        const f = front(v);
        this.particles.sparks(f.x, v.y + 0.6, f.z, 6);
        this.audio.crash(impact, dist(v, this.player));
      },
      onVehicleHitVehicle: (a, b, impact) => {
        if (impact < 4) return;
        const pv = this.player.vehicle;
        const playerInvolved = pv && (a === pv || b === pv);
        a.applyDamage((impact - 4) * 2, playerInvolved ? 'player' : null);
        b.applyDamage((impact - 4) * 2, playerInvolved ? 'player' : null);
        this.particles.sparks((a.x + b.x) / 2, a.y + 0.6, (a.z + b.z) / 2, 8);
        this.audio.crash(impact, dist(a, this.player));
        if (playerInvolved && impact > 6) {
          const other = a === pv ? b : a;
          this.wanted.crime(other.type.police ? 'hitPolice' : 'hitCar');
        }
      },
      onVehicleHitPed: (v, ped, speed, kx, kz) => {
        if (ped === this.player) {
          ped.knockDown(kx, kz, speed * 2.5);
          this.audio.hit();
          return;
        }
        ped.knockDown(kx, kz);
        if (v.isPlayerVehicle) {
          this.wanted.crime('hitPed');
          this.hud.notice('You ran someone over!', 2);
          this.audio.hit();
        }
        this.scarePeds(ped.x, ped.z, 12, v.x, v.z, ped);
      },
    };
  }

  physicsStep() {
    const events = this.physicsEvents;
    const colliders = this.city.colliders;
    const vehicles = this.vehicles;
    for (const v of vehicles) vehicleVsWorld(v, colliders, events);
    for (let i = 0; i < vehicles.length; i++) {
      for (let j = i + 1; j < vehicles.length; j++) vehicleVsVehicle(vehicles[i], vehicles[j], events);
    }
    const p = this.player;
    const pedLike = p.vehicle ? this.peds : [...this.peds, p];
    for (const v of vehicles) vehicleVsPeds(v, pedLike, events);
    if (!p.vehicle) {
      for (const ped of this.peds) {
        const dx = ped.x - p.x;
        const dz = ped.z - p.z;
        const d2 = dx * dx + dz * dz;
        const R = ped.radius + p.radius;
        if (d2 < R * R && d2 > 1e-6) {
          const d = Math.sqrt(d2);
          ped.x += (dx / d) * (R - d);
          ped.z += (dz / d) * (R - d);
        }
      }
      p.sync();
    }
  }

  updatePeds(dt) {
    const pv = this.player.vehicle;
    const fast = pv && Math.abs(pv.forwardSpeed) > 9;
    const fx = pv ? -Math.sin(pv.yaw) : 0;
    const fz = pv ? -Math.cos(pv.yaw) : 0;
    for (const ped of this.peds) {
      if (fast && ped.state === 'walk') {
        const dx = ped.x - pv.x;
        const dz = ped.z - pv.z;
        const ahead = dx * fx + dz * fz;
        const lat = Math.abs(dx * -fz + dz * fx);
        if (ahead > 0 && ahead < 10 && lat < 2.5) ped.flee(pv.x, pv.z, 2);
      }
      ped.update(dt, this.city.colliders);
    }
  }

  updatePopulation(dt) {
    const p = this.player;
    this.spawnCooldown -= dt;
    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      const v = this.vehicles[i];
      if (!v.ai || v === p.vehicle || v === this.missions.targetVehicle) continue;
      if (dist(v, p) > POPULATION.trafficDespawn) this.removeVehicle(v);
    }
    for (let i = this.peds.length - 1; i >= 0; i--) {
      if (dist(this.peds[i], p) > POPULATION.pedDespawn) {
        this.peds[i].dispose();
        this.peds.splice(i, 1);
      }
    }
    if (this.spawnCooldown <= 0) {
      const traffic = this.vehicles.reduce((n, v) => n + (v.ai && !v.ai.police && !v.destroyed ? 1 : 0), 0);
      if (traffic < POPULATION.traffic) this.spawnTraffic(false);
      if (this.peds.length < POPULATION.peds) this.spawnPed(false);
      this.spawnCooldown = 0.3;
    }
  }

  updatePolice(dt) {
    const p = this.player;
    const active = this.vehicles.filter((v) => v.ai?.police && !v.destroyed);
    this.policeCooldown -= dt;
    if (this.deathTimer <= 0 && active.length < POLICE_COUNT[this.wanted.level] && this.policeCooldown <= 0) {
      if (this.spawnPolice()) this.policeCooldown = 2.5;
    }
    if (this.wanted.level === 0) {
      for (const v of active) {
        v.ai.police = false;
        v.setSiren(false);
      }
    }
    let nearest = Infinity;
    let threat = false;
    for (const v of active) {
      const d = dist(v, p);
      nearest = Math.min(nearest, d);
      const policeSlow = Math.hypot(v.vx, v.vz) < 3;
      const playerSlow = !p.vehicle || Math.abs(p.vehicle.forwardSpeed) < 2.5;
      if (d < 7 && policeSlow && playerSlow) threat = true;
    }
    this.nearestPolice = nearest;
    this.wanted.update(dt, nearest);
    this.bustTimer = threat ? this.bustTimer + dt : Math.max(0, this.bustTimer - dt);
    if (this.bustTimer > 1.6 && this.deathTimer <= 0) this.die('busted');
  }

  onVehicleDestroyed(v) {
    this.particles.explosion(v.x, v.y, v.z);
    this.audio.crash(30, dist(v, this.player));
    if (v.lastDamageBy === 'player') this.wanted.crime('destroyCar');
    this.scarePeds(v.x, v.z, 20, v.x, v.z);
    if (v.driver === this.player) {
      this.player.health = 0;
      this.die('wasted');
    }
  }

  die(kind) {
    if (this.deathTimer > 0) return;
    this.deathKind = kind;
    this.deathTimer = 4.6;
    this.bustTimer = 0;
    this.missions.fail(kind === 'wasted' ? 'You died' : 'You got busted');
    this.hud.bigMessage(kind === 'wasted' ? 'WASTED' : 'BUSTED', kind === 'wasted' ? 'red' : 'white', 3);
    this.hud.prompt('');
    if (this.player.vehicle) this.exitVehicle(false);
    this.player.knockDown(0, 0, 0);
    this.player.downTimer = 99;
    this.audio.jingle('fail');
  }

  updateDeath(dt) {
    this.deathTimer -= dt;
    const t = this.deathTimer;
    // 4.6-3.0: message, 3.0-1.8: fade out, respawn at 1.8, 1.8-1.0: black, 1.0-0: fade in.
    if (t > 3) this.hud.setFade(0);
    else if (t > 1.8) this.hud.setFade((3 - t) / 1.2);
    else if (t > 1) {
      if (!this.respawned) this.respawn();
      this.hud.setFade(1);
    } else this.hud.setFade(t);
    if (t <= 0) {
      this.deathTimer = 0;
      this.respawned = false;
      this.hud.setFade(0);
    }
    this.player.sync();
  }

  respawn() {
    this.respawned = true;
    const p = this.player;
    const lm = this.deathKind === 'wasted' ? this.city.landmarks.hospital : this.city.landmarks.police;
    p.getUp();
    p.setPosition(lm.spawn.x, lm.spawn.z, lm.spawn.yaw);
    p.health = 100;
    p.money = Math.max(0, p.money - (this.deathKind === 'wasted' ? 300 : 500));
    this.wanted.reset();
    this.cameraRig.yaw = p.yaw;
    this.hud.notice(this.deathKind === 'wasted' ? 'Hospital bill: $300' : 'Bail: $500', 4);
  }

  // ---------- presentation ----------

  updateCamera(dt) {
    const p = this.player;
    const v = p.vehicle;
    const target = v ? { x: v.x, y: v.y, z: v.z, groundY: v.y } : { x: p.x, y: p.y, z: p.z, groundY: p.y };
    this.cameraRig.update(dt, this.input, target, v ? 'vehicle' : 'foot', v ? v.yaw : p.yaw, this.city.colliders, v ? v.forwardSpeed : 0);
  }

  updateHUD(dt) {
    const p = this.player;
    const v = p.vehicle;
    const hud = this.hud;
    hud.setHealth(p.health);
    hud.setMoney(p.money);
    hud.setWanted(this.wanted.level, this.wanted.level > 0 && this.nearestPolice > 70);
    hud.setClock(this.dayNight.hours);
    hud.setVehicle(v ? v.type.name : null, v ? Math.abs(v.forwardSpeed) * 3.6 : 0);
    hud.setMission(this.missions.hudState());
    hud.setCrosshair(!v && this.deathTimer <= 0);
    hud.update(dt);
    const blips = this.missions.blips();
    for (const veh of this.vehicles) if (veh.ai?.police && !veh.destroyed) blips.push({ x: veh.x, z: veh.z, color: '#3d7bff', r: 3.5 });
    this.minimap.draw(p.x, p.z, v ? v.yaw : p.yaw, this.cameraRig.yaw, blips);
  }

  updateAudio() {
    const v = this.player.vehicle;
    this.audio.setEngine(!!v && !v.destroyed, v ? Math.min(1, Math.abs(v.forwardSpeed) / v.type.maxSpeed) : 0);
    const sirenOn = this.wanted.level > 0 && this.nearestPolice < 120;
    this.audio.setSiren(sirenOn, sirenOn ? clamp(1 - this.nearestPolice / 120, 0.1, 1) : 0);
  }
}
