/* main.js — 状态、主循环与 UI 接线:频率旋钮/预设/扫频/热图/发声/粒子档位/帮助 */
(function () {
  'use strict';
  const CH = window.CH;

  function fatal(html) {
    const el = document.getElementById('fatal');
    el.innerHTML = html;
    el.classList.remove('hidden');
  }

  if (!window.THREE) {
    fatal('<b>three.js 加载失败。</b>双击打开时请确认 vendor/three.min.js 与 index.html 在同一目录;' +
      '如仍失败,用本地 HTTP 启动:<code>python3 tools/serve.py 8080</code> 后访问 http://127.0.0.1:8080');
    return;
  }

  // 预设取自共振梯的实际记法(m>n),避免标签与内部模式显示不一致
  const PRESETS = [345, 897, 1725, 2346, 3588, 5865].map((f) => {
    const e = CH.ladder.find((x) => x.freq === f);
    return { f, label: e ? `(${e.m},${e.n})` : '' };
  });
  const QUALITY = [
    { n: 12000, name: '低', wan: '1.2万' },
    { n: 30000, name: '中', wan: '3.0万' },
    { n: 60000, name: '高', wan: '6.0万' },
  ];
  const SWEEP_PERIOD = 40; // 扫频一个来回的秒数

  const state = {
    freq: 2346,
    sweep: false, sweepT: 0,
    heat: false,
    sound: false,
    quality: 1,
    started: false,
  };

  CH.state = state; // 验收/调试:暴露当前状态(频率、扫频、热图、发声等)

  const $ = (id) => document.getElementById(id);
  const els = {
    slider: $('freq-slider'), freqVal: $('freq-val'), noteVal: $('note-val'),
    modeVal: $('mode-val'), modeFill: $('mode-fill'), modePct: $('mode-pct'),
    sandVal: $('sand-val'),
    btnSweep: $('btn-sweep'), btnHeat: $('btn-heat'), btnSound: $('btn-sound'),
    btnQuality: $('btn-quality'), btnHelp: $('btn-help'), presetRow: $('preset-row'),
    helpOverlay: $('help-overlay'), helpClose: $('help-close'),
    startOverlay: $('start-overlay'), startBtn: $('start-btn'), optSound: $('opt-sound'),
  };

  // ---- 预设按钮 ----
  PRESETS.forEach((p) => {
    const b = document.createElement('button');
    b.className = 'btn preset';
    b.innerHTML = `${p.f}<small>${p.label}</small>`;
    b.addEventListener('click', () => setFreq(p.f, true));
    els.presetRow.insertBefore(b, els.presetRow.querySelector('.sep'));
  });

  // ---- 状态变更 ----
  function setFreq(f, fromUser) {
    f = Math.max(CH.F_MIN, Math.min(CH.F_MAX, Math.round(f)));
    state.freq = f;
    els.slider.value = f;
    if (fromUser && state.sweep) setSweep(false);
  }

  function setSweep(on) {
    state.sweep = on;
    if (on) state.sweepT = Math.acos(1 - 2 * norm(state.freq)) / (2 * Math.PI / SWEEP_PERIOD) || 0;
    els.btnSweep.classList.toggle('on', on);
  }
  function norm(f) { return (f - CH.F_MIN) / (CH.F_MAX - CH.F_MIN); }

  function setHeat(on) {
    state.heat = on;
    CH.scene3.setHeat(on);
    els.btnHeat.classList.toggle('on', on);
  }

  function setSound(on) {
    state.sound = on;
    CH.audio.setOn(on);
    CH.scene3.setLed(on);
    els.btnSound.classList.toggle('on', on);
  }

  function setQuality(idx) {
    state.quality = idx;
    CH.sand.build(CH.scene3.scene, QUALITY[idx].n);
    els.sandVal.textContent = QUALITY[idx].wan;
    els.btnQuality.innerHTML = `粒子 · ${QUALITY[idx].name}<span class="key">Q</span>`;
  }

  function toggleHelp(show) {
    const target = show === undefined ? els.helpOverlay.classList.contains('hidden') : show;
    els.helpOverlay.classList.toggle('hidden', !target);
  }

  // ---- UI 事件 ----
  els.slider.addEventListener('input', () => setFreq(+els.slider.value, true));
  els.btnSweep.addEventListener('click', () => setSweep(!state.sweep));
  els.btnHeat.addEventListener('click', () => setHeat(!state.heat));
  els.btnSound.addEventListener('click', () => setSound(!state.sound));
  els.btnQuality.addEventListener('click', () => setQuality((state.quality + 1) % QUALITY.length));
  els.btnHelp.addEventListener('click', () => toggleHelp());
  els.helpClose.addEventListener('click', () => toggleHelp(false));
  els.helpOverlay.addEventListener('click', (e) => { if (e.target === els.helpOverlay) toggleHelp(false); });

  els.startBtn.addEventListener('click', () => {
    state.started = true;
    els.startOverlay.classList.add('hidden');
    if (els.optSound.checked) setSound(true);
  });

  // #auto 直达场景(无头验收 / 嵌入预览):跳过开始卡,保持静音
  if (location.hash === '#auto') {
    state.started = true;
    els.startOverlay.classList.add('hidden');
  }

  window.addEventListener('keydown', (e) => {
    if (!state.started) return;
    switch (e.code) {
      case 'Space': case 'KeyM': e.preventDefault(); setSound(!state.sound); break;
      case 'ArrowLeft': e.preventDefault(); setFreq(state.freq - (e.shiftKey ? 64 : 8), true); break;
      case 'ArrowRight': e.preventDefault(); setFreq(state.freq + (e.shiftKey ? 64 : 8), true); break;
      case 'KeyS': setSweep(!state.sweep); break;
      case 'KeyG': setHeat(!state.heat); break;
      case 'KeyQ': setQuality((state.quality + 1) % QUALITY.length); break;
      case 'KeyH': toggleHelp(); break;
      case 'Escape': toggleHelp(false); break;
    }
  });

  // ---- 启动 ----
  try {
    CH.scene3.init($('stage'));
  } catch (err) {
    fatal('<b>WebGL 初始化失败:</b>' + err.message +
      '<br>请确认浏览器已启用硬件加速,或换用最新版 Chrome / Edge / Safari。');
    return;
  }
  CH.sand.build(CH.scene3.scene, QUALITY[state.quality].n);
  els.sandVal.textContent = QUALITY[state.quality].wan;

  // ---- 主循环 ----
  let last = performance.now();
  let lastAudioFreq = 0;
  let uiTick = 0;
  let lastFreqText = '';

  function frame(ts) {
    const dt = Math.min(0.033, (ts - last) / 1000) || 0.016;
    last = ts;

    if (state.sweep) {
      state.sweepT += dt;
      const ph = 0.5 - 0.5 * Math.cos(state.sweepT * 2 * Math.PI / SWEEP_PERIOD);
      setFreq(CH.F_MIN + (CH.F_MAX - CH.F_MIN) * ph, false);
    }

    const modes = CH.modesAt(state.freq);
    CH.sand.update(dt, modes.m, modes.n, modes.env);
    CH.scene3.update(dt, modes, !state.sweep);

    if (state.sound && Math.abs(state.freq - lastAudioFreq) > 0.5) {
      CH.audio.setFreq(state.freq);
      lastAudioFreq = state.freq;
    }

    // 读数刷新(每 3 帧,减 DOM 抖动)
    if (++uiTick % 3 === 0) {
      const ft = String(Math.round(state.freq));
      if (ft !== lastFreqText) {
        els.freqVal.textContent = ft;
        els.noteVal.textContent = CH.noteName(state.freq);
        lastFreqText = ft;
      }
      const lo = modes.lo, hi = modes.hi;
      const mt = `(${lo.m},${lo.n})→(${hi.m},${hi.n})`;
      if (mt !== els.modeVal.textContent) els.modeVal.textContent = mt;
      const pct = Math.round(modes.t * 100);
      els.modePct.textContent = pct + '%';
      els.modeFill.style.width = pct + '%';
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
