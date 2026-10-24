import * as THREE from 'three';

const GEO = {
  torso: new THREE.BoxGeometry(0.5, 0.62, 0.28),
  head: new THREE.SphereGeometry(0.17, 10, 8),
  hair: new THREE.SphereGeometry(0.18, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  leg: new THREE.BoxGeometry(0.2, 0.76, 0.22),
  arm: new THREE.BoxGeometry(0.14, 0.6, 0.14),
};
GEO.leg.translate(0, -0.38, 0);
GEO.arm.translate(0, -0.3, 0);

const MATS = new Map();
function mat(color) {
  let m = MATS.get(color);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
    MATS.set(color, m);
  }
  return m;
}

export const PED_LOOKS = {
  shirts: [0xe63946, 0x457b9d, 0x2a9d8f, 0xf4a261, 0x8d99ae, 0x6a4c93, 0xffffff, 0x222222, 0xffb703, 0x3a86ff],
  pants: [0x1d3557, 0x2b2d42, 0x4a4e69, 0x6c584c, 0x343a40],
  skins: [0xf1c9a5, 0xd9a37e, 0xc68642, 0x8d5524, 0x5c3a21],
  hairs: [0x2b1b12, 0x0e0e0e, 0x6b4a2b, 0xc9a66b, 0x8a3b12],
};

// Group handles yaw; body handles the "lying down" tilt so the two never fight.
export function buildCharacter({ shirt, pants, skin, hair }) {
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);
  const add = (geo, color, x, y, z, parent = body) => {
    const m = new THREE.Mesh(geo, mat(color));
    m.position.set(x, y, z);
    m.castShadow = true;
    parent.add(m);
    return m;
  };
  add(GEO.torso, shirt, 0, 1.08, 0);
  add(GEO.head, skin, 0, 1.57, 0);
  add(GEO.hair, hair, 0, 1.58, 0);
  const legs = [-0.13, 0.13].map((x) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0.78, 0);
    body.add(pivot);
    add(GEO.leg, pants, 0, 0, 0, pivot);
    return pivot;
  });
  const arms = [-0.33, 0.33].map((x) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, 1.36, 0);
    body.add(pivot);
    add(GEO.arm, shirt, 0, 0, 0, pivot);
    return pivot;
  });
  return { group, body, legs, arms };
}

export function animateWalk(char, phase, amount) {
  const s = Math.sin(phase) * 0.8 * amount;
  char.legs[0].rotation.x = s;
  char.legs[1].rotation.x = -s;
  char.arms[0].rotation.x = -s * 0.8;
  char.arms[1].rotation.x = s * 0.8;
}
