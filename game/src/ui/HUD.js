import { clamp } from '../utils/math.js';

const $ = (id) => document.getElementById(id);

export class HUD {
  constructor() {
    this.money = $('money');
    this.wanted = $('wanted');
    this.clock = $('clock');
    this.mission = $('mission');
    this.missionTitle = $('mission-title');
    this.missionObjective = $('mission-objective');
    this.missionTimer = $('mission-timer');
    this.healthFill = $('health-fill');
    this.vehicleInfo = $('vehicle-info');
    this.speed = $('speed');
    this.vehicleName = $('vehicle-name');
    this.promptEl = $('prompt');
    this.big = $('big-message');
    this.noticeEl = $('notice');
    this.crosshair = $('crosshair');
    this.fade = $('fade');
    this.overlay = $('overlay');
    this.overlayTitle = $('overlay-title');
    this.playButton = $('play');
    this.help = $('help');
    this.bigTimer = 0;
    this.noticeTimer = 0;
    this.lastPrompt = null;
  }

  update(dt) {
    if (this.bigTimer > 0) {
      this.bigTimer -= dt;
      if (this.bigTimer <= 0) this.big.style.display = 'none';
    }
    if (this.noticeTimer > 0) {
      this.noticeTimer -= dt;
      if (this.noticeTimer <= 0) this.noticeEl.style.display = 'none';
    }
  }

  setHealth(h) {
    this.healthFill.style.width = `${clamp(h, 0, 100)}%`;
    this.healthFill.classList.toggle('low', h < 30);
  }

  setMoney(m) {
    this.money.textContent = `$${Math.max(0, Math.round(m)).toLocaleString()}`;
  }

  setWanted(level, evading) {
    let html = '';
    for (let i = 0; i < 5; i++) html += `<span class="${i < level ? 'on' : 'off'}">★</span>`;
    if (this.wanted.innerHTML !== html) this.wanted.innerHTML = html;
    this.wanted.classList.toggle('evading', !!evading);
  }

  setClock(hours) {
    const h = Math.floor(hours) % 24;
    const m = Math.floor((hours % 1) * 60);
    this.clock.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  setVehicle(name, kmh) {
    if (!name) {
      this.vehicleInfo.style.display = 'none';
      return;
    }
    this.vehicleInfo.style.display = 'block';
    this.speed.textContent = String(Math.round(kmh));
    this.vehicleName.textContent = name;
  }

  setMission(state) {
    if (!state) {
      this.mission.style.display = 'none';
      return;
    }
    this.mission.style.display = 'block';
    this.missionTitle.textContent = state.title;
    this.missionObjective.textContent = state.objective;
    const t = Math.max(0, state.time);
    this.missionTimer.textContent = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    this.missionTimer.classList.toggle('low', t < 15);
  }

  prompt(text) {
    if (text === this.lastPrompt) return;
    this.lastPrompt = text;
    this.promptEl.textContent = text;
    this.promptEl.style.display = text ? 'block' : 'none';
  }

  bigMessage(text, cls = 'white', duration = 3) {
    this.big.textContent = text;
    this.big.className = cls;
    this.big.style.display = 'block';
    this.bigTimer = duration;
  }

  notice(text, duration = 3) {
    this.noticeEl.textContent = text;
    this.noticeEl.style.display = 'block';
    this.noticeTimer = duration;
  }

  setCrosshair(v) {
    this.crosshair.style.display = v ? 'block' : 'none';
  }

  setFade(a) {
    this.fade.style.opacity = String(clamp(a, 0, 1));
  }

  showOverlay(show, resume = false) {
    this.overlay.style.display = show ? 'flex' : 'none';
    if (show) {
      this.overlayTitle.textContent = resume ? 'PAUSED' : 'OPEN CITY';
      this.playButton.textContent = resume ? 'CLICK TO RESUME' : 'CLICK TO PLAY';
    }
  }

  toggleHelp() {
    const show = this.help.style.display !== 'block';
    this.help.style.display = show ? 'block' : 'none';
  }
}
