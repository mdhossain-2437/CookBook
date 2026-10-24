# Open City — 3D open-world driving game

A GTA-style open-world prototype built with [Three.js](https://threejs.org/) and Vite. Everything in it is
procedurally generated at startup (city, textures, vehicles, characters, audio), so there are no asset files
to download.

## Features

- **Procedural island city** — 8×8 blocks of buildings, parks, parking lots, crosswalks, street lamps and three
  landmarks (police station, hospital, mod garage), seeded so the layout is the same every run.
- **On foot and behind the wheel** — walk, sprint, jump, shoot; enter any car with `E`, including carjacking
  moving traffic. Six vehicle classes (sedan, sports car, van, pickup, taxi, police cruiser) with arcade physics:
  drifting on the handbrake, speed-sensitive steering, body roll, tire smoke, damage, smoke, fire and explosions.
- **Living traffic** — AI drivers follow the road graph with right-hand lanes, slow for corners, queue behind
  other cars, stop for pedestrians and creep around obstacles. Pedestrians walk the sidewalk network, cross at
  crosswalks, dive out of the way of speeding cars, flee from gunfire and get knocked down.
- **Wanted system** — hitting people or cars, carjacking and shooting raise your stars. Police cruisers spawn,
  navigate the road graph toward you, ram your car or box you in. Stop next to them and you get **BUSTED**
  (respawn at the police station, lose $500); lose all health and you are **WASTED** (hospital, $300).
  Evade them long enough and the stars drop.
- **Jobs** — walk into a yellow marker to start a mission: Courier, Taxi fare (needs a car, stop at the
  markers), Street race (five checkpoints) and Repo job (steal a marked car and deliver it to the garage).
  Each pays cash and runs against the clock.
- **Day/night cycle** — an 8-minute day with moving sun, dusk colours, lit windows, street-lamp light pools
  and working headlights.
- **HUD** — GTA-style rotating minimap with blips for jobs, objectives and police, health bar, cash, wanted
  stars, clock, speedometer and mission timer.
- **Synthesised audio** — engine note tied to RPM, sirens, crashes, gunshots and mission jingles via the Web
  Audio API (`M` to mute).

## Controls

| Key | Action |
| --- | --- |
| `W A S D` / arrows | Walk / drive |
| Mouse | Look around (camera settles behind the car while driving) |
| `Shift` | Sprint |
| `Space` | Jump (on foot) / handbrake (in a car) |
| `E` or `F` | Enter / exit vehicle |
| Left click | Shoot (on foot) |
| `M` | Mute / unmute |
| `H` | Toggle on-screen controls |
| `Esc` | Pause (releases the mouse) |

## Running it

Requires Node.js 20.19+ or 22.12+ (Vite 8).

```bash
cd game
npm install
npm run dev        # http://localhost:5173
npm run build      # static bundle in dist/
npm run preview    # serve the production build
```

Click **CLICK TO PLAY** to lock the mouse and start. Query parameters useful for testing:
`?autostart=1` skips the pointer-lock requirement and `?time=0.95` sets the time of day (0–1, 0.5 = noon).
`window.__game` exposes the running game for debugging.

## Project layout

```
src/
  Game.js            orchestrates the simulation, player actions, police, deaths, population
  config.js          city dimensions, population counts, player tuning
  world/City.js      procedural layout, road + sidewalk graphs, merged/instanced meshes
  world/DayNight.js  sun, sky, fog and night factor
  world/textures.js  canvas-generated textures
  entities/          Player, Pedestrian, Vehicle (arcade physics), TrafficAI (traffic + police drivers)
  systems/           Physics (AABB/circle collisions, raycasts), CameraRig, Particles, Wanted, Missions
  ui/                HUD (DOM) and Minimap (canvas)
  audio/             Web Audio synthesis
```
