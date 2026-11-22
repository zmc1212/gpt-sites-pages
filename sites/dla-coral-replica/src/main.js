/* 主入口:设置与 URL 参数、启动流程、加载预生长、rAF 主循环、自检。 */
(function () {
  'use strict';

  const DC = (window.DC = window.DC || {});
  window.__errs = [];
  window.addEventListener('error', (e) => window.__errs.push((e.message || 'error') + ' @' + (e.filename || '') + ':' + (e.lineno || '')));
  window.addEventListener('unhandledrejection', (e) => window.__errs.push('promise: ' + (e.reason && e.reason.message || e.reason)));

  /* ---------- 默认设置 ---------- */
  const DEFAULTS = {
    seed: 260716,
    shape: 'point',            // point | sphere | ring
    seedRadius: 8,
    target: 14000,
    threshold: 1,
    stickChance: 1,
    bootstrap: 50,
    neighborhood: 'full26',
    walkers: 4096,
    growthRate: 60,            // 目标生长速度:粒子/秒
    launchPad: 6,              // 发射球 = 最大半径 + 此余量(越大越分形)
    killPad: 24,               // 击杀半径 = 发射半径 + 此余量
    // 显示
    innerColor: '#ac2a4a',
    outerColor: '#ffffff',
    gradientContrast: 1.37,
    gradientBias: -0.74,
    gradientBlur: 0.45,
    size: 1.0,
    gap: 0.0,
    hideEnclosed: true,
    keyBrightness: 1.0,
    ambientFill: 1.0,
    rimBrightness: 1.0,
    bounceBrightness: 1.0,
    shadowStrength: 1.0,
    lightAzimuth: -0.62,       // 主光方位角(弧度)
    lightElevation: 44,        // 主光仰角(度)
    bloomStrength: 0.5,
    bloomThreshold: 0.5,
    exposure: 0.88,
    displayContrast: 1.1,
    brightness: 1.0,
    autoRotate: true,
  };

  const PRESETS = {
    crimson: {
      name: '绯红珊瑚',
      shape: 'point', seedRadius: 8, neighborhood: 'full26', threshold: 1, stickChance: 1,
      bootstrap: 50, target: 14000, innerColor: '#ac2a4a', outerColor: '#ffffff',
      gradientContrast: 1.37, gradientBias: -0.74, gradientBlur: 0.45, size: 1.0, gap: 0,
    },
    golden: {
      name: '深海金穗',
      shape: 'sphere', seedRadius: 7, neighborhood: 'full26', threshold: 3, stickChance: 1,
      bootstrap: 120, target: 16000, innerColor: '#8a5a18', outerColor: '#ffe2a8',
      gradientContrast: 1.3, gradientBias: -0.62, gradientBlur: 0.3, size: 0.9, gap: 0.08,
    },
    ice: {
      name: '冰晶簇',
      shape: 'sphere', seedRadius: 10, neighborhood: 'radius3', threshold: 3, stickChance: 1,
      bootstrap: 80, target: 11000, innerColor: '#23477a', outerColor: '#d6ecff',
      gradientContrast: 1.5, gradientBias: -0.7, gradientBlur: 0.2, size: 0.85, gap: 0.12,
    },
    atoll: {
      name: '环礁花园',
      shape: 'ring', seedRadius: 9, neighborhood: 'full26', threshold: 1, stickChance: 1,
      bootstrap: 50, target: 15000, innerColor: '#0e6b5c', outerColor: '#eafff4',
      gradientContrast: 1.4, gradientBias: -0.7, gradientBlur: 0.4, size: 0.95, gap: 0.04,
    },
  };

  DC.PRESETS = PRESETS;
  const COLOR_KEYS = new Set(['innerColor', 'outerColor', 'gradientContrast', 'gradientBias', 'gradientBlur']);
  const SPACE_KEYS = new Set(['size', 'gap']);
  const STUDIO_KEYS = new Set(['keyBrightness', 'ambientFill', 'rimBrightness', 'bounceBrightness', 'shadowStrength']);
  const POST_KEYS = new Set(['bloomStrength', 'bloomThreshold', 'exposure', 'displayContrast', 'brightness']);

  function parseParams(settings) {
    const q = new URLSearchParams(location.search);
    const get = (k) => q.get(k);
    if (get('seed') !== null && !isNaN(+get('seed'))) settings.seed = +get('seed') | 0;
    if (['point', 'sphere', 'ring'].includes(get('shape'))) settings.shape = get('shape');
    if (get('target') !== null && !isNaN(+get('target'))) settings.target = Math.max(500, Math.min(60000, +get('target')));
    if (get('threshold') !== null && !isNaN(+get('threshold'))) settings.threshold = Math.max(1, Math.min(8, +get('threshold')));
    if (DC.NEIGHBORHOODS[get('neighborhood')]) settings.neighborhood = get('neighborhood');
    if (get('inner') && /^#[0-9a-fA-F]{6}$/.test(get('inner'))) settings.innerColor = get('inner');
    if (get('outer') && /^#[0-9a-fA-F]{6}$/.test(get('outer'))) settings.outerColor = get('outer');
    if (get('pause') === '1') DC.paused = true;
    return settings;
  }

  function boot() {
    if (!window.THREE) throw new Error('THREE 未加载(vendor/three.min.js)');
    DC.settings = Object.assign({}, DEFAULTS);
    parseParams(DC.settings);

    const canvas = document.getElementById('stage');
    const renderer = new DC.Renderer(canvas);
    DC.renderer = renderer;
    const sim = DC.sim = new DC.Sim();

    sim.onReset = () => { renderer.buildCoral(sim); renderer.setShownCount(DC.shownCount || 0); };
    sim.onAdd = (b) => renderer.onAdd(b);
    sim.onEnclose = (b) => renderer.onEnclose(b);

    DC.controls = new DC.Controls(canvas, renderer.camera, () => renderer.radiusWorld);
    DC.ui = new DC.UI();
    renderer.resize();
    window.addEventListener('resize', () => renderer.resize());

    DC.ui.bindSettings((changed) => {
      const key = changed && changed.key;
      if (key === 'target' || key === 'walkers') { resetSim(); return; }
      if (!key || COLOR_KEYS.has(key)) renderer.refreshColors();
      if (!key || SPACE_KEYS.has(key)) renderer.updateSpacing();
      if (!key || STUDIO_KEYS.has(key)) renderer.updateStudio(DC.settings);
      if (!key || POST_KEYS.has(key)) renderer.applyPost(DC.settings);
    });

    resetSim();
    renderer.updateStudio(DC.settings);
    renderer.applyPost(DC.settings);
    renderer.resize();
    // 引导横幅判据:setup 同步完成即算引导成功(异步预生长完成前 load 事件就已触发)
    DC.bootReady = true;

    // 加载预生长(分块让进度条可刷新),然后进入实时生长
    const loader = document.getElementById('loader');
    const loaderBar = document.getElementById('loader-fill');
    const preGrow = 700;
    if (DC.settings.target <= preGrow) {
      sim.fastForward(DC.settings.target);
      loader.classList.add('hidden');
      DC.shownCount = sim.count;
      startLoop();
    } else {
      let last = performance.now();
      function scheduleNext(fn) {
        // 后台标签 rAF 会被冻结,退化为 setTimeout 保证加载能走完
        if (document.hidden) setTimeout(fn, 40); else requestAnimationFrame(fn);
      }
      function chunk() {
        const now = performance.now();
        const budget = Math.max(14, 34 - (now - last));
        last = now;
        const t0 = performance.now();
        while (sim.count < preGrow && performance.now() - t0 < budget) sim.step(2);
        loaderBar.style.width = Math.min(100, (sim.count / preGrow) * 100) + '%';
        if (sim.count < preGrow) {
          scheduleNext(chunk);
        } else {
          loader.classList.add('hidden');
          DC.shownCount = sim.count;
          startLoop();
        }
      }
      scheduleNext(chunk);
    }
  }

  function resetSim() {
    const s = DC.settings;
    DC.shownCount = 0;
    DC.timelineLock = false;
    DC.sim.reset(s);
    DC.renderer.radiusWorld = Math.sqrt(DC.sim.maxR2) * DC.renderer.spacing + 2;
  }

  DC.resetSim = resetSim;

  /* ---------- 主循环 ---------- */
  let lastT = 0, fpsAcc = 0, fpsN = 0, statT = 0, prevSticks = 0;
  function startLoop() {
    DC.booted = true;
    const banner = document.getElementById('boot-fail');
    if (banner) banner.classList.add('hidden');
    DC.stickBudget = 0;
    function frame(t) {
      const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
      lastT = t;
      const sim = DC.sim;
      // 时间驱动的生长节奏:预算按 dt 累计(上限 3 秒存量,防卡顿后爆发)
      DC.stickBudget = Math.min(
        DC.stickBudget + DC.settings.growthRate * dt,
        DC.settings.growthRate * 3
      );
      if (!DC.paused && sim.count < sim.s.target) {
        const want = Math.min(Math.floor(DC.stickBudget), 480);
        if (want > 0) {
          const res = sim.step(8, want);
          DC.stickBudget -= res.sticks;
        }
      }
      if (DC.timelineLock) {
        DC.renderer.setShownCount(DC.shownCount);
      } else {
        DC.shownCount = sim.count;
        DC.renderer.setShownCount(sim.count);
      }
      DC.controls.autoRotate = DC.settings.autoRotate;
      DC.controls.update(dt);
      // 地台随珊瑚生长下沉,雾密度随尺度自适应
      const gy = -(DC.renderer.radiusWorld + 0.6);
      DC.renderer.scene.children.forEach((o) => {
        if (o.geometry && o.geometry.type === 'CircleGeometry') o.position.y = gy;
      });
      DC.renderer.scene.fog.density = 0.5 / Math.max(24, DC.renderer.radiusWorld * 2.4);
      DC.renderer.renderFrame();
      // 统计
      fpsAcc += dt; fpsN++;
      statT += dt;
      if (statT > 0.5) {
        const nowSticks = sim.sticksTotal;
        const perSec = Math.round((nowSticks - prevSticks) / statT);
        prevSticks = nowSticks;
        DC.ui.updateStats({
          count: sim.count,
          target: sim.s.target,
          sticks: DC.paused ? 0 : perSec,
          radius: DC.renderer.radiusWorld,
          fps: Math.round(fpsN / Math.max(0.001, fpsAcc)),
        });
        fpsAcc = 0; fpsN = 0; statT = 0;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- 自检(?selftest=1) ---------- */
  function selftest() {
    const out = [];
    const line = (ok, name, detail) => {
      out.push({ ok, name, detail });
      console[ok ? 'log' : 'error']((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
    };
    try {
      // 1) 决定论:同 seed 两次生长坐标一致
      const grow = (seed) => {
        const s = Object.assign({}, DEFAULTS, { seed, target: 400, walkers: 256 });
        const sim2 = new DC.Sim();
        sim2.reset(s);
        sim2.fastForward(400);
        let h = seed >>> 0;
        for (let i = 0; i < sim2.count; i++) {
          h = (Math.imul(h ^ sim2.px[i], 0x85ebca6b) ^ Math.imul(h ^ sim2.py[i], 0xc2b2ae35) ^ Math.imul(h ^ sim2.pz[i], 0x27d4eb2f)) >>> 0;
        }
        return { h, count: sim2.count, maxR2: sim2.maxR2 };
      };
      const a = grow(1234), b = grow(1234), c = grow(4321);
      line(a.count === 400, '生长到达目标', 'count=' + a.count);
      line(a.maxR2 > 0, '半径增长', 'maxR2=' + a.maxR2);
      line(a.h === b.h, '决定论复现', 'hash=' + a.h.toString(16));
      line(a.h !== c.h, '不同种子不同形', 'hash=' + c.h.toString(16));
      // 2) 包裹统计自洽
      const s = Object.assign({}, DEFAULTS, { seed: 99, target: 600, walkers: 256 });
      const sim2 = new DC.Sim();
      sim2.reset(s);
      sim2.fastForward(600);
      let bad = 0;
      for (let i = 0; i < sim2.count; i++) {
        if ((sim2.enclosed[i] === 1) !== (sim2.nb[i] === 26)) bad++;
      }
      line(bad === 0, '包裹标记自洽', '异常=' + bad);
      // 3) 三种种子形状都能生长
      for (const shape of ['point', 'sphere', 'ring']) {
        const s3 = Object.assign({}, DEFAULTS, { seed: 7, shape, seedRadius: 6, target: 200, walkers: 256 });
        const sim3 = new DC.Sim();
        sim3.reset(s3);
        sim3.fastForward(200);
        line(sim3.count >= 200, '种子形状 ' + shape + ' 可生长', 'count=' + sim3.count);
      }
    } catch (e) {
      line(false, '自检异常', e.message);
    }
    return out;
  }

  window.addEventListener('load', () => {
    if (!window.THREE || !window.DC || !window.DC.bootReady) {
      const el = document.getElementById('boot-fail');
      if (window.__errs.length) {
        const d = document.createElement('div');
        d.style.cssText = 'font-size:12px;opacity:.85;margin-top:8px';
        d.textContent = '错误详情:' + window.__errs.join(' | ');
        el.appendChild(d);
      }
      el.classList.remove('hidden');
    }
  });

  try {
    boot();
    const q = new URLSearchParams(location.search);
    if (q.get('selftest') === '1') {
      const results = selftest();
      const box = document.getElementById('selftest');
      box.classList.remove('hidden');
      const allOk = results.every((r) => r.ok);
      box.innerHTML = '<div class="st-title">自检结果 ' + (allOk ? '✅ 全部通过' : '❌ 存在失败') + '</div>' +
        results.map((r) => '<div class="' + (r.ok ? 'ok' : 'bad') + '">' + (r.ok ? 'PASS' : 'FAIL') + ' ' + r.name + (r.detail ? ' — ' + r.detail : '') + '</div>').join('');
      DC.selftestResults = results;
    }
  } catch (e) {
    window.__errs.push('boot: ' + e.message);
    const el = document.getElementById('boot-fail');
    el.classList.remove('hidden');
    el.appendChild(Object.assign(document.createElement('div'), {
      style: 'font-size:12px;opacity:.85;margin-top:8px',
      textContent: '错误详情:' + e.message,
    }));
  }
})();
