/* main.js — 状态、主循环与 UI 接线:按钮输入(3D 点按 / 键盘 / HUD)、
 * 固定步长物理、计分、通关庆祝、重置、帮助。 */
(function () {
  'use strict';
  const WT = window.WT;
  const scene3 = WT.scene3;
  const PULSE_T = WT.P.pulseT;

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

  const RING_TOTAL = WT.colors.ringColors.length;
  const state = {
    started: false,
    sound: false,
    won: false,
  };
  WT.state = state; // 验收/调试:暴露当前状态

  const $ = (id) => document.getElementById(id);
  const els = {
    scoreVal: $('score-val'), scoreBar: $('score-fill'),
    btnSound: $('btn-sound'), btnReset: $('btn-reset'), btnHelp: $('btn-help'),
    helpOverlay: $('help-overlay'), helpClose: $('help-close'),
    startOverlay: $('start-overlay'), startBtn: $('start-btn'), optSound: $('opt-sound'),
    winOverlay: $('win-overlay'), winBtn: $('win-btn'),
    hudBtnL: $('hud-btn-l'), hudBtnR: $('hud-btn-r'),
    stage: $('stage'),
  };

  let physics, fx;

  // ---- 输入 → 喷流(按住每 0.46 s 连发一记) ----
  const keys = { L: false, R: false };
  const held = { L: null, R: null };   // null = 未按住;数字 = 距下次连发
  function pressJet(side) {
    const fresh = physics.press(side);
    scene3.setPressed(side, true);
    held[side] = 0.46;
    if (fresh) {
      WT.audio.whoosh(1);
      fx.emitBubbles(side, 1);
    } else {
      WT.audio.whoosh(0.4);
    }
  }
  function releaseJet(side) {
    scene3.setPressed(side, false);
    held[side] = null;
  }

  function setKey(side, on) {
    if (keys[side] === on) return;
    keys[side] = on;
    if (on) pressJet(side); else releaseJet(side);
  }

  // 3D 玩具按钮(场景内点按,按住连发)
  scene3.onButton = (side, down) => {
    if (down) pressJet(side); else releaseJet(side);
  };

  // 键盘:A/← 左喷流,D/→ 右喷流,H 帮助,S 声音,R 重置
  window.addEventListener('keydown', (e) => {
    if (!state.started) return;
    switch (e.code) {
      case 'KeyA': case 'ArrowLeft': e.preventDefault(); setKey('L', true); break;
      case 'KeyD': case 'ArrowRight': e.preventDefault(); setKey('R', true); break;
      case 'KeyH': toggleHelp(); break;
      case 'KeyS': setSound(!state.sound); break;
      case 'KeyR': resetGame(); break;
      case 'Escape': toggleHelp(false); hideWin(); break;
    }
  });
  window.addEventListener('keyup', (e) => {
    switch (e.code) {
      case 'KeyA': case 'ArrowLeft': setKey('L', false); break;
      case 'KeyD': case 'ArrowRight': setKey('R', false); break;
    }
  });

  // HUD 按钮(移动端 / 鼠标点按)
  bindHold(els.hudBtnL, 'L');
  bindHold(els.hudBtnR, 'R');
  function bindHold(el, side) {
    const down = (e) => { e.preventDefault(); el.classList.add('on'); pressJet(side); };
    const up = () => { el.classList.remove('on'); releaseJet(side); };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointerleave', up);
    el.addEventListener('pointercancel', up);
  }

  // ---- 状态 UI ----
  function setSound(on) {
    state.sound = on;
    WT.audio.setOn(on);
    els.btnSound.classList.toggle('on', on);
    els.btnSound.textContent = on ? '♪ 声音开' : '♪ 声音关';
  }
  function resetGame() {
    physics.resetAll();
    state.won = false;
    hideWin();
    updateScore(true);
  }
  function updateScore(force) {
    const n = physics.countCaptured();
    const text = `${n}/${RING_TOTAL}`;
    if (force || els.scoreVal.textContent !== text) {
      els.scoreVal.textContent = text;
      els.scoreBar.style.width = (n / RING_TOTAL * 100) + '%';
    }
    return n;
  }
  function showWin() {
    state.won = true;
    els.winOverlay.classList.remove('hidden');
    WT.audio.chime();
  }
  function hideWin() { els.winOverlay.classList.add('hidden'); }

  function toggleHelp(show) {
    const target = show === undefined ? els.helpOverlay.classList.contains('hidden') : show;
    els.helpOverlay.classList.toggle('hidden', !target);
  }

  els.btnSound.addEventListener('click', () => setSound(!state.sound));
  els.btnReset.addEventListener('click', resetGame);
  els.btnHelp.addEventListener('click', () => toggleHelp());
  els.helpClose.addEventListener('click', () => toggleHelp(false));
  els.helpOverlay.addEventListener('click', (e) => { if (e.target === els.helpOverlay) toggleHelp(false); });
  els.winBtn.addEventListener('click', resetGame);

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

  // ---- 启动 ----
  try {
    scene3.init(els.stage);
  } catch (err) {
    fatal('<b>WebGL 初始化失败:</b>' + err.message +
      '<br>请确认浏览器已启用硬件加速,或换用最新版 Chrome / Edge / Safari。');
    return;
  }
  physics = new WT.WaterPhysics(WT.colors.ringColors);
  for (const r of physics.rings) WT.scene3.scene.add(r.mesh); // 圆环网格入场景
  fx = WT.fx;
  physics.onCapture = (r) => WT.audio.plink(r.stackIdx);
  physics.onPop = () => WT.audio.pop();
  WT.physics = physics;
  updateScore(true);

  // ---- 主循环:固定步长物理(120 Hz)+ 渲染 ----
  const FIXED = 1 / 120;
  let acc = 0, last = performance.now();
  let bubbleTimer = 0;

  // 某侧当前喷流强度(供粒子系统,0..1.35)
  function sideStrength(side) {
    let s = 0;
    for (const p of physics.pulses) {
      if (p.side !== side) continue;
      const t = Math.min(p.age / PULSE_T, 1);
      s += Math.pow(Math.sin(Math.PI * t), 1.15);
    }
    return Math.min(s, 1.35);
  }

  function stepFrame(dt) {
    if (state.started) {
      // 按住连发
      for (const side of ['L', 'R']) {
        if (held[side] !== null) {
          held[side] -= dt;
          if (held[side] <= 0) pressJet(side);
        }
      }
      acc += dt;
      let steps = 0;
      while (acc >= FIXED && steps < 6) {
        physics.step(FIXED);
        acc -= FIXED; steps++;
      }
      // 喷流活跃时按节奏补气泡
      bubbleTimer -= dt;
      const sL = sideStrength('L'), sR = sideStrength('R');
      if (bubbleTimer <= 0 && (sL > 0.35 || sR > 0.35)) {
        if (sL > 0.35) fx.emitBubbles('L', sL);
        if (sR > 0.35) fx.emitBubbles('R', sR);
        bubbleTimer = 0.12;
      }
      physics.syncMeshes();
      scene3.update(dt);
      WT.fx.update(dt, sL, sR);
      const n = updateScore();
      if (n === RING_TOTAL && !state.won) showWin();
    } else {
      scene3.update(dt);
    }
    scene3.render();
  }

  function frame(ts) {
    const dt = Math.min(0.05, (ts - last) / 1000) || 0.016;
    last = ts;
    stepFrame(dt);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // 验收钩子:RAF 被节流的环境(隐藏面板 / 无头)可手动驱动帧
  WT.tick = (dt) => stepFrame(Math.min(0.05, dt || 0.016));
})();
