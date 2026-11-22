// 播放器:动画钟 + 全部持久化状态(变速/倒放/循环/轨道/线框/配色/音轨/音量)。
// UI 只调用这里的方法;每次变更同步应用到音频引擎/轨道相机/场景并落盘,
// 「改了字段还要记得应用与保存」的逻辑只存在这一处(思路与原作一致)。
window.GC = window.GC || {};
GC.player = (function () {
  'use strict';

  const FRAME = 1 / 60;
  const STORE_KEY = 'gcintro-replica.settings';

  function loadSettings() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return raw && typeof raw === 'object' ? raw : {};
    } catch (e) {
      return {};
    }
  }

  // 拖动滑块会高频触发写入;合并成 200ms 尾随写一次
  let pending = null;
  let timer = 0;
  function flush() {
    if (!pending) return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(pending)); } catch (e) { /* 隐私模式等 */ }
    pending = null;
  }
  window.addEventListener('pagehide', flush);

  function createPlayer(opts) {
    // opts: { audio, orbit, applyWireframe, applyColor, sessionMuted }
    const saved = loadSettings();
    const state = {
      speed: typeof saved.speed === 'number' ? saved.speed : 1,
      reverse: !!saved.reverse,
      orbit: saved.orbit === undefined ? true : !!saved.orbit,
      orbitIntensity: typeof saved.orbitIntensity === 'number' ? saved.orbitIntensity : 1,
      wireframe: !!saved.wireframe,
      loop: saved.loop === undefined ? true : !!saved.loop,
      color: GC.palette.option(saved.color).id,
      track: GC.audio.TRACKS.some((t) => t.id === saved.track) ? saved.track : GC.audio.TRACKS[0].id,
      soundEnabled: saved.soundEnabled === undefined ? true : !!saved.soundEnabled,
      volume: typeof saved.volume === 'number' ? saved.volume : 0.9,
    };

    const p = {
      time: 0,
      paused: false,
      state,

      get duration() { return GC.timeline.DUR; },

      update(dt) {
        if (!p.paused) {
          p.time += dt * state.speed * (state.reverse ? -1 : 1);
          if (state.loop) {
            if (p.time >= GC.timeline.DUR) { p.time %= GC.timeline.DUR; opts.audio.restart(); }
            if (p.time < 0) { p.time = GC.timeline.DUR + (p.time % GC.timeline.DUR); opts.audio.restart(); }
          } else {
            if (p.time >= GC.timeline.DUR) { p.time = GC.timeline.DUR; p.paused = true; }
            if (p.time <= 0) { p.time = 0; p.paused = true; }
          }
        }
        opts.audio.sync(p.time, p.paused, state.reverse, state.speed);
      },

      // ---------- 传输 ----------
      play() {
        // 非循环时若正停在「要驶离的那一端」,从另一端出发
        if (!state.loop) {
          if (state.reverse && p.time <= 0) p.time = GC.timeline.DUR;
          else if (!state.reverse && p.time >= GC.timeline.DUR) p.time = 0;
        }
        p.paused = false;
        opts.audio.restart();
        p.save();
      },
      pause() { p.paused = true; p.save(); },
      rewind() { p.time = 0; opts.audio.restart(); p.save(); },
      seekTo(t) {
        p.time = Math.min(Math.max(t, 0), GC.timeline.DUR);
        p.save(); // 音频引擎下一帧自行重定位
      },
      seekBy(d) { p.seekTo(p.time + d); },
      frameBack() { p.paused = true; p.seekBy(-FRAME); },
      frameForward() { p.paused = true; p.seekBy(FRAME); },

      // ---------- 设置 ----------
      setSpeed(v) { state.speed = Math.min(4, Math.max(0.01, v)); p.save(); },
      setReverse(v) { state.reverse = !!v; p.save(); },
      setLoop(v) {
        state.loop = !!v;
        if (v && p.time >= GC.timeline.DUR) { p.time = 0; opts.audio.restart(); }
        p.save();
      },
      setOrbitEnabled(v) { state.orbit = !!v; opts.orbit.setEnabled(v); p.save(); },
      setOrbitIntensity(v) { state.orbitIntensity = v; opts.orbit.intensity = v; p.save(); },
      setWireframe(v) { state.wireframe = !!v; opts.applyWireframe(v); p.save(); },
      setColor(id) { state.color = GC.palette.option(id).id; opts.applyColor(state.color); p.save(); },
      setTrack(id) { state.track = id; opts.audio.track = id; opts.audio.restart(); p.save(); },
      toggleMute() { state.soundEnabled = !state.soundEnabled; p.save(); },
      setVolume(v) { state.volume = Math.min(1, Math.max(0, v)); p.save(); },

      // ---------- 持久化 ----------
      save() {
        pending = Object.assign({}, state);
        clearTimeout(timer);
        timer = setTimeout(flush, 200);
      },
    };

    // 应用已持久化的状态
    opts.orbit.intensity = state.orbitIntensity;
    opts.orbit.setEnabled(state.orbit);
    opts.applyWireframe(state.wireframe);
    opts.applyColor(state.color);
    opts.audio.track = state.track;
    opts.audio.enabled = state.soundEnabled;
    opts.audio.volume = state.volume;

    return p;
  }

  return { createPlayer };
})();
