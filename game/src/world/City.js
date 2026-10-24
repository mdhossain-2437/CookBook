import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CITY } from '../config.js';
import { Random } from '../utils/Random.js';
import { lerp } from '../utils/math.js';
import * as tex from './textures.js';

const FACADES = [0xd9c7a8, 0xbfae95, 0x9aa3ad, 0xb55b4a, 0xe8e4dc, 0x5f6b78, 0xc9b8a0, 0xa36b55, 0xcfd4d8, 0x8c8f94, 0xd4a66a, 0x7b6d62];
const GLASS = [0x7f9bb3, 0x8fa8c8, 0x6f8fa8, 0x9fb5c9, 0x5d7a94];
const LANDMARKS = {
  police: { h: 9, color: 0x5c6f8f, label: 'POLICE', bg: '#163a7a' },
  hospital: { h: 15, color: 0xf2f2f0, label: 'HOSPITAL', bg: '#b3261e' },
  garage: { h: 7, color: 0x8a7a5a, label: 'MOD GARAGE', bg: '#1f1f1f' },
};

// Yaw convention used everywhere: forward = (-sin yaw, -cos yaw), right = (cos yaw, -sin yaw).
export const yawFromDir = (dx, dz) => Math.atan2(-dx, -dz);

export class City {
  constructor(scene, seed = 11) {
    this.scene = scene;
    this.rng = new Random(seed);
    this.blocks = [];
    this.buildings = [];
    this.colliders = [];
    this.trees = [];
    this.parkedSpots = [];
    this.policeSpots = [];
    this.landmarks = {};
    this.nodes = [];
    this.edges = [];
    this.walkNodes = [];
    this.bounds = {
      minX: CITY.minX - CITY.margin,
      maxX: CITY.maxX + CITY.margin,
      minZ: CITY.minZ - CITY.margin,
      maxZ: CITY.maxZ + CITY.margin,
    };
    this.generateLayout();
    this.buildRoadGraph();
    this.buildWalkGraph();
    this.placeParking();
    this.placeStart();
    this.buildMeshes();
  }

  // ---------- layout ----------

  generateLayout() {
    const { blocksX, blocksZ, blockSize, roadWidth, pitch } = CITY;
    const landmarkAt = { '1,1': 'police', [`${blocksX - 2},1`]: 'hospital', [`${blocksX - 2},${blocksZ - 2}`]: 'garage' };
    for (let bi = 0; bi < blocksX; bi++) {
      for (let bj = 0; bj < blocksZ; bj++) {
        const x0 = CITY.originX + bi * pitch + roadWidth / 2;
        const z0 = CITY.originZ + bj * pitch + roadWidth / 2;
        const block = { bi, bj, x0, z0, x1: x0 + blockSize, z1: z0 + blockSize, cx: x0 + blockSize / 2, cz: z0 + blockSize / 2, type: 'city' };
        const landmark = landmarkAt[`${bi},${bj}`];
        const downtown = 1 - Math.min(1, Math.hypot(bi - (blocksX - 1) / 2, bj - (blocksZ - 1) / 2) / (blocksX / 2));
        if (landmark) {
          block.type = landmark;
          this.makeLandmark(block, landmark);
        } else if (this.rng.chance(0.12)) {
          block.type = 'park';
          this.makePark(block);
        } else {
          this.makeCityBlock(block, downtown);
        }
        this.blocks.push(block);
      }
    }
  }

  makeCityBlock(block, downtown) {
    const rng = this.rng;
    const sw = CITY.sidewalk;
    const inner = CITY.blockSize - 2 * sw;
    const nx = rng.pick([1, 2, 2, 2, 3]);
    const nz = rng.pick([1, 2, 2, 2, 3]);
    const lw = inner / nx;
    const ld = inner / nz;
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < nz; j++) {
        const lot = { x0: block.x0 + sw + i * lw, z0: block.z0 + sw + j * ld };
        lot.x1 = lot.x0 + lw;
        lot.z1 = lot.z0 + ld;
        lot.cx = lot.x0 + lw / 2;
        lot.cz = lot.z0 + ld / 2;
        const r = rng.next();
        if (r < 0.06 && lw >= 16) {
          this.makeParkingLot(lot, block);
          continue;
        }
        if (r < 0.1) {
          for (let k = 0; k < 3; k++) this.addTree(rng.range(lot.x0 + 2, lot.x1 - 2), rng.range(lot.z0 + 2, lot.z1 - 2), rng.range(0.8, 1.3));
          continue;
        }
        const gap = rng.range(1.2, 2.6);
        const w = Math.floor((lw - 2 * gap) / 3) * 3;
        const d = Math.floor((ld - 2 * gap) / 3) * 3;
        if (w < 6 || d < 6) continue;
        const rr = rng.next();
        let floors;
        if (rr < 0.05 + 0.3 * downtown) floors = rng.int(12, 18 + Math.round(18 * downtown));
        else if (rr < 0.5) floors = rng.int(5, 11);
        else floors = rng.int(2, 5);
        const color = floors >= 12 ? rng.pick(GLASS) : rng.pick(FACADES);
        this.addBuilding(lot.cx - w / 2, lot.cx + w / 2, lot.cz - d / 2, lot.cz + d / 2, floors * 3, color);
      }
    }
  }

  makeParkingLot(lot, block) {
    block.lots ??= [];
    block.lots.push(lot);
    const n = Math.floor((lot.x1 - lot.x0 - 4) / 3.2);
    for (let i = 0; i < n; i++) {
      if (this.rng.chance(0.6)) this.parkedSpots.push({ x: lot.x0 + 3 + i * 3.2, z: lot.cz, yaw: this.rng.chance(0.5) ? 0 : Math.PI });
    }
  }

  makePark(block) {
    const sw = CITY.sidewalk;
    const n = this.rng.int(10, 16);
    for (let i = 0; i < n; i++) {
      this.addTree(this.rng.range(block.x0 + sw + 2, block.x1 - sw - 2), this.rng.range(block.z0 + sw + 2, block.z1 - sw - 2), this.rng.range(0.8, 1.5));
    }
  }

  makeLandmark(block, kind) {
    const sw = CITY.sidewalk;
    const spec = LANDMARKS[kind];
    const b = this.addBuilding(block.x0 + sw + 3, block.x1 - sw - 3, block.z0 + sw + 3, block.z1 - sw - 14, spec.h, spec.color);
    b.sign = { label: spec.label, bg: spec.bg };
    b.landmark = kind;
    const frontZ = b.z1 + 5;
    this.landmarks[kind] = { x: block.cx, z: frontZ, spawn: { x: block.cx, z: block.z1 - 2, yaw: Math.PI } };
    if (kind === 'police') for (const dx of [-7, 0, 7]) this.policeSpots.push({ x: block.cx + dx, z: frontZ, yaw: Math.PI });
    if (kind === 'hospital') for (const dx of [-16, 16]) this.addTree(block.cx + dx, frontZ, 1.1);
  }

  addBuilding(x0, x1, z0, z1, h, color) {
    const b = { x0, x1, z0, z1, y0: 0, y1: CITY.curbHeight + h, h, color };
    this.buildings.push(b);
    this.colliders.push(b);
    return b;
  }

  addTree(x, z, s) {
    this.trees.push({ x, z, s });
    this.colliders.push({ x0: x - 0.3, x1: x + 0.3, z0: z - 0.3, z1: z + 0.3, y0: 0, y1: 2.5, tree: true });
  }

  // ---------- graphs ----------

  buildRoadGraph() {
    const { blocksX, blocksZ, pitch } = CITY;
    const idx = (i, j) => i * (blocksZ + 1) + j;
    for (let i = 0; i <= blocksX; i++) {
      for (let j = 0; j <= blocksZ; j++) this.nodes.push({ i, j, x: CITY.originX + i * pitch, z: CITY.originZ + j * pitch, neighbors: [] });
    }
    for (let i = 0; i <= blocksX; i++) {
      for (let j = 0; j <= blocksZ; j++) {
        if (i < blocksX) this.addEdge(idx(i, j), idx(i + 1, j));
        if (j < blocksZ) this.addEdge(idx(i, j), idx(i, j + 1));
      }
    }
  }

  addEdge(a, b) {
    this.nodes[a].neighbors.push(b);
    this.nodes[b].neighbors.push(a);
    this.edges.push({ a, b });
  }

  edgeDir(a, b) {
    const A = this.nodes[a];
    const B = this.nodes[b];
    const len = Math.hypot(B.x - A.x, B.z - A.z);
    return { dx: (B.x - A.x) / len, dz: (B.z - A.z) / len, len };
  }

  // Right-hand-traffic lane entry/exit points for travelling a -> b.
  lanePoint(a, b, which) {
    const A = this.nodes[a];
    const B = this.nodes[b];
    const { dx, dz } = this.edgeDir(a, b);
    const rx = -dz;
    const rz = dx;
    const off = CITY.roadWidth / 2 + 1.5;
    const L = CITY.laneOffset;
    return which === 'start'
      ? { x: A.x + dx * off + rx * L, z: A.z + dz * off + rz * L }
      : { x: B.x - dx * off + rx * L, z: B.z - dz * off + rz * L };
  }

  lanePose(a, b, t) {
    const A = this.nodes[a];
    const B = this.nodes[b];
    const { dx, dz } = this.edgeDir(a, b);
    const L = CITY.laneOffset;
    return { x: lerp(A.x, B.x, t) - dz * L, z: lerp(A.z, B.z, t) + dx * L, yaw: yawFromDir(dx, dz) };
  }

  nearestNode(x, z) {
    const { blocksX, blocksZ, pitch } = CITY;
    const i = Math.max(0, Math.min(blocksX, Math.round((x - CITY.originX) / pitch)));
    const j = Math.max(0, Math.min(blocksZ, Math.round((z - CITY.originZ) / pitch)));
    return i * (blocksZ + 1) + j;
  }

  buildWalkGraph() {
    const { blocksX, blocksZ, sidewalk: sw } = CITY;
    const idx = (bi, bj, ci, cj) => ((bi * blocksZ + bj) * 2 + ci) * 2 + cj;
    for (const b of this.blocks) {
      for (let ci = 0; ci < 2; ci++) {
        for (let cj = 0; cj < 2; cj++) {
          this.walkNodes.push({ x: ci ? b.x1 - sw / 2 : b.x0 + sw / 2, z: cj ? b.z1 - sw / 2 : b.z0 + sw / 2, neighbors: [] });
        }
      }
    }
    for (const b of this.blocks) {
      for (let ci = 0; ci < 2; ci++) {
        for (let cj = 0; cj < 2; cj++) {
          const n = this.walkNodes[idx(b.bi, b.bj, ci, cj)].neighbors;
          n.push(idx(b.bi, b.bj, ci ^ 1, cj), idx(b.bi, b.bj, ci, cj ^ 1));
          if (ci === 1 && b.bi < blocksX - 1) n.push(idx(b.bi + 1, b.bj, 0, cj));
          if (ci === 0 && b.bi > 0) n.push(idx(b.bi - 1, b.bj, 1, cj));
          if (cj === 1 && b.bj < blocksZ - 1) n.push(idx(b.bi, b.bj + 1, ci, 0));
          if (cj === 0 && b.bj > 0) n.push(idx(b.bi, b.bj - 1, ci, 1));
        }
      }
    }
    this.walkIndex = idx;
  }

  nearestWalkNode(x, z) {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < this.walkNodes.length; i++) {
      const n = this.walkNodes[i];
      const d = (n.x - x) ** 2 + (n.z - z) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }

  placeParking() {
    const { roadWidth, parkOffset } = CITY;
    for (const e of this.edges) {
      const A = this.nodes[e.a];
      const { dx, dz, len } = this.edgeDir(e.a, e.b);
      const rx = -dz;
      const rz = dx;
      for (let s = roadWidth / 2 + 5; s < len - roadWidth / 2 - 5; s += 7) {
        for (const side of [1, -1]) {
          if (!this.rng.chance(0.04)) continue;
          this.parkedSpots.push({
            x: A.x + dx * s + rx * side * parkOffset,
            z: A.z + dz * s + rz * side * parkOffset,
            yaw: side === 1 ? yawFromDir(dx, dz) : yawFromDir(-dx, -dz),
          });
        }
      }
    }
  }

  placeStart() {
    const { blocksX, blocksZ, parkOffset } = CITY;
    const bi = Math.floor(blocksX / 2) - 1;
    const bj = Math.floor(blocksZ / 2) - 1;
    const block = this.blocks[bi * blocksZ + bj];
    const node = this.walkNodes[this.walkIndex(bi, bj, 1, 1)];
    const roadX = CITY.originX + (bi + 1) * CITY.pitch; // road east of the block, west parking lane = southbound
    this.start = { x: node.x, z: node.z, yaw: -Math.PI / 2, car: { x: roadX - parkOffset, z: block.z1 - 4, yaw: Math.PI } };
    this.missionSpots = [
      this.walkNodes[this.walkIndex(bi - 1, bj - 1, 1, 1)],
      this.walkNodes[this.walkIndex(bi + 2, bj + 2, 0, 0)],
      this.walkNodes[this.walkIndex(bi + 2, bj - 1, 0, 1)],
      this.walkNodes[this.walkIndex(bi - 1, bj + 2, 1, 0)],
    ].map((n) => ({ x: n.x, z: n.z }));
  }

  // ---------- queries ----------

  groundHeight(x, z) {
    const { pitch, roadWidth, blocksX, blocksZ, curbHeight } = CITY;
    const u = x - CITY.originX;
    const v = z - CITY.originZ;
    if (u < 0 || v < 0 || u > blocksX * pitch || v > blocksZ * pitch) return 0;
    const um = u % pitch;
    const vm = v % pitch;
    const half = roadWidth / 2;
    const inX = um > half && um < pitch - half;
    const inZ = vm > half && vm < pitch - half;
    return inX && inZ ? curbHeight : 0;
  }

  setNight(n) {
    this.lampMaterial.emissiveIntensity = n * 3;
    this.windowMaterial.emissiveIntensity = n * 1.3;
    this.poolMaterial.opacity = n * 0.85;
  }

  // ---------- meshes ----------

  buildMeshes() {
    const { blockSize, roadWidth, curbHeight, margin, sidewalk: sw } = CITY;
    const scene = this.scene;
    const rng = this.rng;
    const cityW = CITY.maxX - CITY.minX;
    const cityD = CITY.maxZ - CITY.minZ;
    const ccx = (CITY.minX + CITY.maxX) / 2;
    const ccz = (CITY.minZ + CITY.maxZ) / 2;
    const std = (opts) => new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, ...opts });
    const addMesh = (geo, mat, { cast = false, receive = true } = {}) => {
      if (!geo) return null;
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = cast;
      m.receiveShadow = receive;
      scene.add(m);
      return m;
    };

    // Island + water.
    const grassTex = tex.makeGrassTexture();
    grassTex.repeat.set((cityW + 2 * margin) / 10, (cityD + 2 * margin) / 10);
    // Island top sits 5cm under the road planes so distant roads never z-fight with the grass.
    const island = addMesh(new THREE.BoxGeometry(cityW + 2 * margin, 3, cityD + 2 * margin), std({ map: grassTex }));
    island.position.set(ccx, -1.55, ccz);
    const water = addMesh(new THREE.PlaneGeometry(4000, 4000), std({ color: 0x1f5f9f, roughness: 0.25, metalness: 0.2 }), { receive: false });
    water.rotation.x = -Math.PI / 2;
    water.position.set(ccx, -1.2, ccz);

    // Roads, intersections and crosswalk bars.
    const roadGeos = [];
    const interGeos = [];
    const crossGeos = [];
    for (const e of this.edges) {
      const A = this.nodes[e.a];
      const B = this.nodes[e.b];
      const g = new THREE.PlaneGeometry(roadWidth, blockSize);
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setY(i, (uv.getY(i) * blockSize) / roadWidth);
      g.rotateX(-Math.PI / 2);
      if (A.z === B.z) g.rotateY(Math.PI / 2);
      g.translate((A.x + B.x) / 2, 0.01, (A.z + B.z) / 2);
      roadGeos.push(g);
    }
    for (const n of this.nodes) {
      const g = new THREE.PlaneGeometry(roadWidth, roadWidth);
      g.rotateX(-Math.PI / 2);
      g.translate(n.x, 0.01, n.z);
      interGeos.push(g);
      for (const m of n.neighbors) {
        const M = this.nodes[m];
        const dx = Math.sign(M.x - n.x);
        const dz = Math.sign(M.z - n.z);
        const cx = n.x + dx * (roadWidth / 2 + 2);
        const cz = n.z + dz * (roadWidth / 2 + 2);
        for (let k = -7; k <= 7; k++) {
          const bar = new THREE.PlaneGeometry(dx ? 2.4 : 0.6, dx ? 0.6 : 2.4);
          bar.rotateX(-Math.PI / 2);
          bar.translate(cx + (dx ? 0 : k * 1.25), 0.03, cz + (dz ? 0 : k * 1.25));
          crossGeos.push(bar);
        }
      }
    }
    const roadTex = tex.makeRoadTexture();
    const asphaltTex = tex.makeAsphaltTexture();
    asphaltTex.repeat.set(1, 1);
    addMesh(mergeGeometries(roadGeos), std({ map: roadTex }));
    addMesh(mergeGeometries(interGeos), std({ map: asphaltTex }));
    addMesh(mergeGeometries(crossGeos), std({ color: 0xe8e8e8, transparent: true, opacity: 0.8, polygonOffset: true, polygonOffsetFactor: -2 }));

    // Raised concrete slabs per block; parks and parking lots get an inset surface on top.
    const sideTex = tex.makeSidewalkTexture();
    const slabGeos = [];
    const parkGeos = [];
    const lotGeos = [];
    for (const b of this.blocks) {
      const g = new THREE.BoxGeometry(blockSize, curbHeight, blockSize);
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * blockSize) / 8, (uv.getY(i) * blockSize) / 8);
      g.translate(b.cx, curbHeight / 2, b.cz);
      slabGeos.push(g);
      if (b.type === 'park') {
        const p = new THREE.PlaneGeometry(blockSize - 2 * sw, blockSize - 2 * sw);
        const puv = p.attributes.uv;
        for (let i = 0; i < puv.count; i++) puv.setXY(i, puv.getX(i) * 5, puv.getY(i) * 5);
        p.rotateX(-Math.PI / 2);
        p.translate(b.cx, curbHeight + 0.02, b.cz);
        parkGeos.push(p);
      }
      for (const lot of b.lots ?? []) {
        const p = new THREE.PlaneGeometry(lot.x1 - lot.x0, lot.z1 - lot.z0);
        p.rotateX(-Math.PI / 2);
        p.translate(lot.cx, curbHeight + 0.02, lot.cz);
        lotGeos.push(p);
      }
    }
    addMesh(mergeGeometries(slabGeos), std({ map: sideTex }));
    const parkTex = tex.makeGrassTexture();
    addMesh(mergeGeometries(parkGeos), std({ map: parkTex }));
    if (lotGeos.length) addMesh(mergeGeometries(lotGeos), std({ map: asphaltTex }));

    // Buildings: merged boxes with window UVs scaled to 12-unit tiles and per-building vertex colour.
    const win = tex.makeWindowTexture();
    const bGeos = [];
    const roofGeos = [];
    const color = new THREE.Color();
    for (const b of this.buildings) {
      const w = b.x1 - b.x0;
      const d = b.z1 - b.z0;
      const h = b.h;
      const g = new THREE.BoxGeometry(w, h, d);
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        const face = Math.floor(i / 4); // +x -x +y -y +z -z
        if (face === 2 || face === 3) {
          uv.setXY(i, 0, 0);
          continue;
        }
        uv.setXY(i, (uv.getX(i) * (face < 2 ? d : w)) / 12, (uv.getY(i) * h) / 12);
      }
      color.setHex(b.color);
      const colors = new Float32Array(g.attributes.position.count * 3);
      for (let i = 0; i < g.attributes.position.count; i++) colors.set([color.r, color.g, color.b], i * 3);
      g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      g.translate((b.x0 + b.x1) / 2, curbHeight + h / 2, (b.z0 + b.z1) / 2);
      bGeos.push(g);
      const roof = new THREE.PlaneGeometry(w, d);
      roof.rotateX(-Math.PI / 2);
      roof.translate((b.x0 + b.x1) / 2, curbHeight + h + 0.03, (b.z0 + b.z1) / 2);
      roofGeos.push(roof);
      if (h > 24) {
        const n = rng.int(1, 3);
        for (let k = 0; k < n; k++) {
          const bw = rng.range(2, 5);
          const bh = rng.range(1, 3);
          const bd = rng.range(2, 5);
          const box = new THREE.BoxGeometry(bw, bh, bd);
          box.translate(rng.range(b.x0 + bw / 2 + 1, b.x1 - bw / 2 - 1), curbHeight + h + bh / 2, rng.range(b.z0 + bd / 2 + 1, b.z1 - bd / 2 - 1));
          roofGeos.push(box);
        }
      }
    }
    this.windowMaterial = std({ map: win.map, emissiveMap: win.emissiveMap, emissive: 0xffd58a, emissiveIntensity: 0, vertexColors: true, roughness: 0.85 });
    addMesh(mergeGeometries(bGeos), this.windowMaterial, { cast: true });
    addMesh(mergeGeometries(roofGeos), std({ color: 0x3b3b3f }), { cast: true });

    for (const b of this.buildings) {
      if (!b.sign) continue;
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(16, 4), new THREE.MeshBasicMaterial({ map: tex.makeSignTexture(b.sign.label, b.sign.bg) }));
      sign.position.set((b.x0 + b.x1) / 2, curbHeight + b.h - 2.5, b.z1 + 0.05);
      scene.add(sign);
    }

    // Street lamps (instanced) with additive light pools that fade in at night.
    const lampPositions = [];
    for (const b of this.blocks) {
      const inset = 1.2;
      const sides = [
        [b.x0 + inset, b.z0 + inset, b.x1 - inset, b.z0 + inset],
        [b.x1 - inset, b.z0 + inset, b.x1 - inset, b.z1 - inset],
        [b.x0 + inset, b.z1 - inset, b.x1 - inset, b.z1 - inset],
        [b.x0 + inset, b.z0 + inset, b.x0 + inset, b.z1 - inset],
      ];
      for (const [ax, az, bx, bz] of sides) for (const f of [1 / 6, 1 / 2, 5 / 6]) lampPositions.push({ x: lerp(ax, bx, f), z: lerp(az, bz, f) });
    }
    const dummy = new THREE.Object3D();
    const poles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.1, 6, 6), std({ color: 0x333338 }), lampPositions.length);
    this.lampMaterial = std({ color: 0x222222, emissive: 0xffe2a8, emissiveIntensity: 0 });
    const heads = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.18, 0.5), this.lampMaterial, lampPositions.length);
    const poolGeos = [];
    lampPositions.forEach((p, i) => {
      dummy.position.set(p.x, curbHeight + 3, p.z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      poles.setMatrixAt(i, dummy.matrix);
      dummy.position.set(p.x, curbHeight + 6.1, p.z);
      dummy.updateMatrix();
      heads.setMatrixAt(i, dummy.matrix);
      const pool = new THREE.CircleGeometry(7.5, 16);
      pool.rotateX(-Math.PI / 2);
      pool.translate(p.x, curbHeight + 0.06, p.z);
      poolGeos.push(pool);
    });
    poles.castShadow = true;
    scene.add(poles, heads);
    this.poolMaterial = new THREE.MeshBasicMaterial({ map: tex.makeLightPoolTexture(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    addMesh(mergeGeometries(poolGeos), this.poolMaterial, { receive: false });

    // Trees (instanced trunk + foliage).
    if (this.trees.length) {
      const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.15, 0.25, 2.4, 6), std({ color: 0x5a3d22 }), this.trees.length);
      const leaves = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.6, 1), std({ color: 0xffffff, roughness: 0.9 }), this.trees.length);
      const leafColor = new THREE.Color();
      this.trees.forEach((t, i) => {
        dummy.position.set(t.x, curbHeight + 1.2 * t.s, t.z);
        dummy.scale.set(t.s, t.s, t.s);
        dummy.updateMatrix();
        trunks.setMatrixAt(i, dummy.matrix);
        dummy.position.set(t.x, curbHeight + 2.4 * t.s + 1.2 * t.s, t.z);
        dummy.updateMatrix();
        leaves.setMatrixAt(i, dummy.matrix);
        leaves.setColorAt(i, leafColor.setHSL(0.28 + rng.range(-0.04, 0.04), 0.55, 0.28 + rng.range(-0.06, 0.08)));
      });
      trunks.castShadow = leaves.castShadow = true;
      scene.add(trunks, leaves);
    }

    // Invisible walls at the island edge.
    const big = 2000;
    const m = margin - 3;
    this.colliders.push(
      { x0: CITY.minX - m - big, x1: CITY.minX - m, z0: -big, z1: big, y0: 0, y1: 60, wall: true },
      { x0: CITY.maxX + m, x1: CITY.maxX + m + big, z0: -big, z1: big, y0: 0, y1: 60, wall: true },
      { x0: -big, x1: big, z0: CITY.minZ - m - big, z1: CITY.minZ - m, y0: 0, y1: 60, wall: true },
      { x0: -big, x1: big, z0: CITY.maxZ + m, z1: CITY.maxZ + m + big, y0: 0, y1: 60, wall: true },
    );
  }
}
