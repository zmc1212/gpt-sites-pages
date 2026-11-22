/* audio.js — 全程序化 WebAudio 音效(无外部音频文件,M 键静音)
 * 海浪底噪随离岸距离变化;咬钩/上鱼/收线/硬币/断线等短音效即时合成。 */
(function () {
  'use strict';
  const TW = window.TW;
  const U = TW.util;

  const audio = {
    ctx: null, muted: false, started: false,
    master: null, surfGain: null, reelOsc: null, reelGain: null,

    init() {
      if (this.started) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      this.master.connect(this.ctx.destination);
      this.started = true;
      this.startSurf();
      this.startReel();
    },

    resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
    toggleMute() {
      this.muted = !this.muted;
      if (this.master) this.master.gain.value = this.muted ? 0 : 0.9;
      return this.muted;
    },

    // 粉噪缓冲(海浪/水花共用)
    noiseBuffer(seconds) {
      const ctx = this.ctx;
      const len = Math.floor(ctx.sampleRate * seconds);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + 0.029 * w; b1 = 0.985 * b1 + 0.032 * w; b2 = 0.95 * b2 + 0.048 * w;
        d[i] = (b0 + b1 + b2 + w * 0.05) * 0.45;
      }
      return buf;
    },

    // 持续海浪底噪:增益由 main 每帧按离岸距离写入
    startSurf() {
      const ctx = this.ctx;
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer(4); src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 0.4;
      this.surfGain = ctx.createGain(); this.surfGain.gain.value = 0;
      // 缓慢起伏,模拟浪的呼吸
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.11;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.02;
      lfo.connect(lfoGain).connect(this.surfGain.gain);
      src.connect(lp).connect(this.surfGain).connect(this.master);
      src.start(); lfo.start();
    },

    setSurf(level) {
      if (this.surfGain) this.surfGain.gain.value = U.clamp(level, 0, 0.5) * 0.5;
    },

    // 收线咔哒循环(fighting 时开,平时关)
    startReel() {
      const ctx = this.ctx;
      this.reelGain = ctx.createGain(); this.reelGain.gain.value = 0;
      this.reelGain.connect(this.master);
      this.reelTimer = 0;
    },
    reelTick(dt, reeling) {
      if (!this.ctx) return;
      this.reelTimer -= dt;
      if (reeling && this.reelTimer <= 0) {
        this.reelTimer = 0.09;
        this.blip(1900, 0.02, 0.05, 'square');
      }
    },

    // 短音工具
    blip(freq, dur, vol, type) {
      if (!this.ctx) return;
      const ctx = this.ctx, t = ctx.currentTime;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(this.master);
      o.start(t); o.stop(t + dur + 0.02);
    },

    // 白噪爆(水花/扑通)
    splash(vol, dur, freq) {
      if (!this.ctx) return;
      const ctx = this.ctx, t = ctx.currentTime;
      const src = ctx.createBufferSource(); src.buffer = this.noiseBuffer(dur + 0.1);
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
      bp.frequency.setValueAtTime(freq || 900, t);
      bp.frequency.exponentialRampToValueAtTime((freq || 900) * 0.4, t + dur);
      bp.Q.value = 1.2;
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(bp).connect(g).connect(this.master);
      src.start(t); src.stop(t + dur + 0.05);
    },

    // 具名事件
    cast() { this.splash(0.25, 0.5, 700); this.blip(500, 0.12, 0.1, 'triangle'); },
    plop() { this.splash(0.3, 0.25, 500); this.blip(220, 0.1, 0.15, 'sine'); },
    bite() { this.blip(880, 0.09, 0.22, 'triangle'); setTimeout(() => this.blip(1320, 0.09, 0.22, 'triangle'), 90); },
    hook() { this.blip(660, 0.06, 0.2, 'square'); },
    snap() { this.splash(0.2, 0.12, 2500); this.blip(160, 0.18, 0.3, 'sawtooth'); },
    caught() {
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => setTimeout(() => this.blip(f, 0.18, 0.18, 'triangle'), i * 110));
    },
    escape() { this.blip(392, 0.2, 0.18, 'sawtooth'); setTimeout(() => this.blip(262, 0.3, 0.18, 'sawtooth'), 150); },
    coin() { this.blip(1175, 0.08, 0.2, 'square'); setTimeout(() => this.blip(1568, 0.14, 0.2, 'square'), 70); },
    buy() { this.blip(784, 0.1, 0.18, 'triangle'); setTimeout(() => this.blip(988, 0.16, 0.18, 'triangle'), 100); },
    fail() { this.blip(196, 0.25, 0.2, 'sawtooth'); },
    gull() {
      if (!this.ctx) return;
      const ctx = this.ctx, t = ctx.currentTime;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(1200 + Math.random() * 300, t);
      o.frequency.exponentialRampToValueAtTime(700, t + 0.18);
      o.frequency.exponentialRampToValueAtTime(1100, t + 0.32);
      g.gain.setValueAtTime(0.045, t);
      g.gain.setValueAtTime(0.045, t + 0.3);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      o.connect(g).connect(this.master);
      o.start(t); o.stop(t + 0.45);
    },
    whale() {
      if (!this.ctx) return;
      const ctx = this.ctx, t = ctx.currentTime;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(180, t);
      o.frequency.exponentialRampToValueAtTime(420, t + 1.2);
      o.frequency.exponentialRampToValueAtTime(240, t + 2.4);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.5);
      g.gain.linearRampToValueAtTime(0.0001, t + 2.6);
      o.connect(g).connect(this.master);
      o.start(t); o.stop(t + 2.7);
    }
  };

  TW.audio = audio;
})();
