/* audio.js — WebAudio 音效(零素材):喷水(噪声+低通)、落柱(短正弦 plink)、
 * 顶出(低音 boop)、通关(四音小和弦)。全部很轻,主音量 −18 dB。
 */
(function () {
  'use strict';
  const WT = (window.WT = window.WT || {});

  const audio = WT.audio = {
    ctx: null, master: null, enabled: false,
    noiseBuf: null,

    init() {
      if (this.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = this.ctx = new AC();
      this.master = ctx.createGain();
      this.master.gain.value = 0.0;
      this.master.connect(ctx.destination);
      // 预生成 1 s 白噪声
      const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
    },
    resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
    setOn(on) {
      this.enabled = on;
      if (!this.ctx) { if (on) this.init(); }
      if (!this.ctx) return;
      this.resume();
      this.master.gain.setTargetAtTime(on ? 0.42 : 0, this.ctx.currentTime, 0.08);
    },

    // 喷水:带通噪声 + 低频噗
    whoosh(strength) {
      if (!this.enabled || !this.ctx) return;
      const ctx = this.ctx, t = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 620; bp.Q.value = 0.7;
      const g = ctx.createGain();
      const vol = 0.16 + 0.12 * strength;
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
      src.connect(bp).connect(g).connect(this.master);
      src.start(t); src.stop(t + 0.4);
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(58, t + 0.18);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.12 * strength + 0.05, t);
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(og).connect(this.master);
      osc.start(t); osc.stop(t + 0.22);
    },

    // 落柱:柔和 plink,音高随堆叠层数微升
    plink(stackIdx) {
      if (!this.enabled || !this.ctx) return;
      const ctx = this.ctx, t = ctx.currentTime;
      const f = 520 * Math.pow(2, stackIdx / 12);
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f * 1.28, t);
      osc.frequency.exponentialRampToValueAtTime(f, t + 0.1);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(g).connect(this.master);
      osc.start(t); osc.stop(t + 0.32);
    },

    // 顶出:低音 boop
    pop() {
      if (!this.enabled || !this.ctx) return;
      const ctx = this.ctx, t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.14);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.16, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(g).connect(this.master);
      osc.start(t); osc.stop(t + 0.2);
    },

    // 通关:四音上行小和弦
    chime() {
      if (!this.enabled || !this.ctx) return;
      const ctx = this.ctx;
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        const t = ctx.currentTime + i * 0.14;
        const osc = ctx.createOscillator();
        osc.type = 'triangle'; osc.frequency.value = f;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.001, t);
        g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.connect(g).connect(this.master);
        osc.start(t); osc.stop(t + 0.55);
      });
    },
  };
})();
