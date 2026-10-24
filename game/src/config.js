export const CITY = {
  blocksX: 8,
  blocksZ: 8,
  blockSize: 56,
  roadWidth: 20,
  sidewalk: 4,
  laneOffset: 4.5, // road centre -> driving lane centre
  parkOffset: 8.2, // road centre -> parking lane centre
  curbHeight: 0.2,
  margin: 36, // land between the outer ring road and the water
};
CITY.pitch = CITY.blockSize + CITY.roadWidth;
CITY.originX = -(CITY.blocksX * CITY.pitch) / 2;
CITY.originZ = -(CITY.blocksZ * CITY.pitch) / 2;
CITY.minX = CITY.originX - CITY.roadWidth / 2;
CITY.maxX = CITY.originX + CITY.blocksX * CITY.pitch + CITY.roadWidth / 2;
CITY.minZ = CITY.originZ - CITY.roadWidth / 2;
CITY.maxZ = CITY.originZ + CITY.blocksZ * CITY.pitch + CITY.roadWidth / 2;

export const DAY_LENGTH = 480; // real seconds per in-game day
export const START_TIME = 0.4; // fraction of a day (0.5 = noon)

export const POPULATION = {
  traffic: 22,
  parked: 55,
  peds: 60,
  trafficSpawnMin: 90,
  trafficSpawnMax: 260,
  trafficDespawn: 330,
  pedSpawnMin: 40,
  pedSpawnMax: 150,
  pedDespawn: 220,
};

export const PLAYER = {
  walkSpeed: 5.5,
  runSpeed: 10,
  radius: 0.45,
  jumpSpeed: 7.5,
  gravity: -22,
};
