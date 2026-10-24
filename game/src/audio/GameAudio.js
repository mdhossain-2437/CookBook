import { clamp } from '../utils/math.js';

// Everything is synthesised with the Web Audio API, so no audio assets are needed.
export class GameAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = (this.ctx = new Ctx());
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.6;
    this.master.connect(ctx.destination);

    this.engineGain = ctx.createGain();
    this.engineGain.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 650;
    this.engineOsc = ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.value = 60;
    this.engineOsc2 = ctx.createOscillator();
    this.engineOsc2.type = 'square';
    this.engineOsc2.frequency.value = 30;
    const g2 = ctx.createGain();
    g2.gain.value = 0.35;
    this.engineOsc.connect(filter);
    this.engineOsc2.connect(g2).connect(filter);
    filter.connect(this.engineGain).connect(this.master);
    this.engineOsc.start();
    this.engineOsc2.start();

    this.sirenGain = ctx.createGain();
    this.sirenGain.gain.value = 0;
    this.sirenOsc = ctx.createOscillator();
    this.sirenOsc.type = 'triangle';
    this.sirenOsc.frequency.value = 750;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 1.2;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 160;
    lfo.connect(lfoGain).connect(this.sirenOsc.frequency);
    this.sirenOsc.connect(this.sirenGain).connect(this.master);
    this.sirenOsc.start();
    lfo.start();

    const len = ctx.sampleRate;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }

  setEngine(on, rpm) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const f = 55 + rpm * 160;
    this.engineOsc.frequency.setTargetAtTime(f, t, 0.05);
    this.engineOsc2.frequency.setTargetAtTime(f / 2, t, 0.05);
    this.engineGain.gain.setTargetAtTime(on ? 0.08 + rpm * 0.12 : 0, t, 0.08);
  }

  setSiren(on, vol) {
    if (!this.ctx) return;
    this.sirenGain.gain.setTargetAtTime(on ? vol * 0.12 : 0, this.ctx.currentTime, 0.1);
  }

  playNoise(duration, gain, freq) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    src.connect(f).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + duration);
  }

  crash(intensity, distance) {
    const vol = clamp(intensity / 20, 0.1, 1) * clamp(1 - distance / 80, 0, 1);
    if (vol > 0.01) this.playNoise(0.3, vol * 0.8, 900);
  }

  shot() {
    this.playNoise(0.12, 0.6, 2500);
  }

  hit() {
    this.playNoise(0.15, 0.4, 500);
  }

  tone(freq, start, dur, type = 'square', vol = 0.12) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(vol, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g).connect(this.master);
    o.start(start);
    o.stop(start + dur + 0.05);
  }

  jingle(kind) {
    if (!this.ctx) return;
    const notes = { pass: [523, 659, 784, 1046], fail: [392, 330, 262], start: [660, 880], checkpoint: [880], cash: [1200, 1600] }[kind] || [];
    const t = this.ctx.currentTime;
    notes.forEach((f, i) => this.tone(f, t + i * 0.14, 0.25, kind === 'fail' ? 'sawtooth' : 'square'));
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.6;
    return this.muted;
  }
}
