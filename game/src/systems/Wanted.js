const CRIMES = {
  hitPed: 1,
  hitCar: 0.5,
  jack: 1,
  jackPolice: 2,
  shootPed: 1,
  shootCar: 0.4,
  shootPolice: 2,
  hitPolice: 1,
  destroyCar: 1,
  shotNearPolice: 1,
};

export class Wanted {
  constructor() {
    this.level = 0;
    this.heat = 0;
    this.evade = 0;
    this.cooldowns = new Map();
    this.onChange = null;
  }

  crime(kind) {
    const now = performance.now();
    if (now - (this.cooldowns.get(kind) || 0) < 800) return;
    this.cooldowns.set(kind, now);
    this.heat = Math.min(5, this.heat + CRIMES[kind]);
    const level = Math.min(5, Math.floor(this.heat + 1e-6));
    if (level > this.level) {
      this.level = level;
      this.onChange?.(this.level);
    }
    this.evade = 0;
  }

  update(dt, nearestPoliceDist) {
    if (this.level === 0) {
      this.heat = Math.max(0, this.heat - dt * 0.05);
      return;
    }
    if (nearestPoliceDist < 70) {
      this.evade = 0;
      return;
    }
    this.evade += dt;
    if (this.evade > 14) {
      this.evade = 0;
      this.level--;
      this.heat = this.level;
      this.onChange?.(this.level);
    }
  }

  reset() {
    this.level = 0;
    this.heat = 0;
    this.evade = 0;
  }
}
