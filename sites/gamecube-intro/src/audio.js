// 音轨:三条「开机音」变体全部由 WebAudio 离线合成(零音频素材),
// 形态呼应原作的开机听感:一声轻柔的上升「嗖」+ 竖琴式上行滑音 + 落定铃音 + 底垫。
// 播放引擎与原作同思路:每条音轨预解码正放 buffer + 采样倒放副本,
// 音频骑在动画时钟上(变速走 playbackRate,倒放切倒放 buffer,漂移超阈值才重定位),
// 因此拖时间轴、倒放、变速都不会脱拍。
window.GC = window.GC || {};
GC.audio = (function () {
  'use strict';

  const SAMPLE_RATE = 44100;
  const LENGTH = 7.3; // 覆盖整条动画

  // 音轨清单(与播放器 UI 的顺序一致)
  const TRACKS = [
    { id: 'classic', label: '经典', offset: -0.1 },
    { id: 'pad', label: '绵长', offset: -0.2 },
    { id: 'echo', label: '回响', offset: -0.2 },
  ];

  // ---------- 合成原语 ----------
  // 铃/拨弦:基频 + 少量泛音,指数衰减
  function pluck(ctx, dest, t, freq, gain, decay, bright) {
    const partials = [[1, 1], [2, bright], [3, bright * 0.35], [4.2, bright * 0.12]];
    for (const [mult, amp] of partials) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * mult;
      osc.detune.value = (Math.random() - 0.5) * 3;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gain * amp, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay * (mult === 1 ? 1 : 0.55));
      osc.connect(g).connect(dest);
      osc.start(t);
      osc.stop(t + decay + 0.1);
    }
  }

  // 上升「嗖」:带通噪声扫频
  function whoosh(ctx, dest, t0, dur, f0, f1, gain) {
    const len = Math.ceil(dur * ctx.sampleRate);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(f0, t0);
    bp.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + dur * 0.55);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(bp).connect(g).connect(dest);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }

  // 底垫:三和弦正弦,慢起慢收
  function pad(ctx, dest, t0, t1, freqs, gain) {
    for (const f of freqs) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      osc.detune.value = (Math.random() - 0.5) * 6;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(gain, t0 + 1.1);
      g.gain.setValueAtTime(gain, Math.max(t0 + 1.1, t1 - 1.6));
      g.gain.linearRampToValueAtTime(0.0001, t1);
      osc.connect(g).connect(dest);
      osc.start(t0);
      osc.stop(t1 + 0.1);
    }
  }

  // ---------- 三条变体 ----------
  // G 大调五声音阶两 个八度,滑音 + 落定铃(G5+D6)
  const GLISS = [196, 220, 246.9, 293.7, 329.6, 392, 440, 493.9, 587.3, 659.3, 784];

  function renderClassic(ctx, out) {
    whoosh(ctx, out, 0.02, 1.15, 320, 2500, 0.14);
    let t = 0.30;
    for (const f of GLISS) {
      pluck(ctx, out, t, f, 0.15, 0.6, 0.4);
      t += 0.128;
    }
    // 落定铃:双音 + 微失谐光泽
    pluck(ctx, out, 1.78, 784, 0.2, 2.4, 0.22);
    pluck(ctx, out, 1.80, 1174.7, 0.13, 2.6, 0.16);
    pluck(ctx, out, 1.79, 785.6, 0.07, 2.2, 0.1);
    pad(ctx, out, 0.9, 6.4, [196, 246.9, 293.7], 0.045);
  }

  function renderPad(ctx, out) {
    whoosh(ctx, out, 0.02, 1.5, 260, 1900, 0.11);
    let t = 0.34;
    for (const f of GLISS) {
      pluck(ctx, out, t, f, 0.11, 1.0, 0.25);
      t += 0.185;
    }
    pluck(ctx, out, 2.35, 784, 0.13, 3.4, 0.14);
    pluck(ctx, out, 2.37, 587.3, 0.1, 3.0, 0.12);
    pad(ctx, out, 0.8, 7.0, [196, 246.9, 293.7, 392], 0.075);
  }

  function renderEcho(ctx, out) {
    whoosh(ctx, out, 0.02, 1.0, 380, 2800, 0.13);
    let t = 0.28;
    for (const f of GLISS) {
      // 每个音带 3 层回声,回声逐层升八度感更亮
      pluck(ctx, out, t, f, 0.14, 0.5, 0.5);
      pluck(ctx, out, t + 0.11, f, 0.07, 0.5, 0.5);
      pluck(ctx, out, t + 0.22, f * 2, 0.045, 0.45, 0.5);
      pluck(ctx, out, t + 0.33, f * 2, 0.022, 0.4, 0.5);
      t += 0.128;
    }
    pluck(ctx, out, 1.78, 784, 0.18, 2.0, 0.26);
    pluck(ctx, out, 1.90, 784 * 2, 0.08, 1.6, 0.2);
    pluck(ctx, out, 2.02, 1174.7, 0.06, 1.4, 0.16);
    pad(ctx, out, 1.0, 6.0, [196, 293.7], 0.04);
  }

  // 渲染一条音轨的正放 AudioBuffer
  async function renderTrack(id) {
    const ctx = new OfflineAudioContext(2, Math.ceil(LENGTH * SAMPLE_RATE), SAMPLE_RATE);
    const out = ctx.createGain();
    out.gain.value = 0.9;
    out.connect(ctx.destination);
    if (id === 'classic') renderClassic(ctx, out);
    else if (id === 'pad') renderPad(ctx, out);
    else renderEcho(ctx, out);
    return ctx.startRendering();
  }

  // 采样倒放副本(倒放模式使用)
  function reverseBuffer(ctx, buffer) {
    const rev = ctx.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const src = buffer.getChannelData(ch);
      const dst = rev.getChannelData(ch);
      for (let i = 0, j = src.length - 1; j >= 0; i++, j--) dst[i] = src[j];
    }
    return rev;
  }

  // 合成全部音轨;返回 { id: { fwd, rev, offset } }
  async function buildBuffers(liveCtx) {
    const map = {};
    for (const t of TRACKS) {
      const fwd = await renderTrack(t.id);
      map[t.id] = { fwd, rev: reverseBuffer(liveCtx, fwd), offset: t.offset };
    }
    return map;
  }

  // ---------- 播放引擎 ----------
  const DRIFT = 0.25;   // 超过该漂移才重定位(重启代价高)
  const MIN_RATE = 0.0625, MAX_RATE = 16;

  class Engine {
    constructor(ctx, buffers, trackId, enabled, volume) {
      this.ctx = ctx;
      this.buffers = buffers;
      this.track = trackId;
      this.enabled = enabled;
      this.gain = ctx.createGain();
      this.gain.gain.value = volume;
      this.gain.connect(ctx.destination);
      this.source = null;
      this.dir = 1;
      this.rate = 1;
      this.baseCtx = 0;
      this.baseClip = 0;
    }

    get volume() { return this.gain.gain.value; }
    set volume(v) { this.gain.gain.value = v; }

    stop() {
      if (!this.source) return;
      try { this.source.onended = null; this.source.stop(); } catch (e) { /* 已停止 */ }
      this.source.disconnect();
      this.source = null;
    }

    restart() { this.stop(); }

    // 音轨尚未合成完毕时(启动初期)静默跳过
    ready() { return !!(this.buffers && this.buffers[this.track]); }
    duration() { return this.ready() ? this.buffers[this.track].fwd.duration : 0; }
    offset() { return this.ready() ? (this.buffers[this.track].offset || 0) : 0; }

    // 当前正播的源所处的「动画钟」位置
    position() {
      return this.baseClip + this.dir * this.rate * (this.ctx.currentTime - this.baseCtx);
    }

    start(clip, dir, rate) {
      this.stop();
      const bufs = this.buffers[this.track];
      const buffer = dir < 0 ? bufs.rev : bufs.fwd;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = rate;
      source.connect(this.gain);
      const offset = dir < 0 ? buffer.duration - clip : clip;
      source.start(this.ctx.currentTime, Math.min(Math.max(offset, 0), buffer.duration));
      this.source = source;
      this.dir = dir;
      this.rate = rate;
      this.baseCtx = this.ctx.currentTime;
      this.baseClip = clip;
    }

    // 每帧同步:动画钟 -> 音频钟
    sync(clipTime, paused, reverse, speed) {
      if (!this.ready()) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const target = clipTime + this.offset();
      const dur = this.duration();
      const dir = reverse ? -1 : 1;
      const rate = Math.min(Math.max(speed, MIN_RATE), MAX_RATE);
      const shouldPlay = this.enabled && !paused && speed > 0 && target >= 0 && target <= dur;
      if (!shouldPlay) {
        this.stop();
        return;
      }
      if (!this.source || dir !== this.dir) {
        this.start(target, dir, rate);
        return;
      }
      if (rate !== this.rate) {
        this.baseClip = this.position();
        this.baseCtx = this.ctx.currentTime;
        this.source.playbackRate.value = rate;
        this.rate = rate;
      }
      if (Math.abs(this.position() - target) > DRIFT) this.start(target, dir, rate);
    }
  }

  return { TRACKS, buildBuffers, Engine };
})();
