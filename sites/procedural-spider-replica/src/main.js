/* 引导层：渲染器/场景/相机/世界/蜘蛛/跟随相机、输入、调参面板、HUD、
 * 头部驱动 API（GOSSAMER.drive，供隐藏标签页/截图/自检确定性回放）与 ?selftest=1 自检。
 */
'use strict';

(function () {

  const L = window.SpiderLib;
  const TOUCH = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
  const $ = (id) => document.getElementById(id);
  const errEl = $('err');
  function fatal(msg) { errEl.style.display = 'block'; errEl.textContent = msg; }

  if (typeof THREE === 'undefined' || !L || !L.Spider) {
    fatal('初始化失败：three.js 或站点脚本未加载。\n' +
      '双击 file:// 打开时请确认 vendor/three.min.js 与 src/*.js 都在站点目录内。\n' +
      '或用 HTTP 启动：cd procedural-spider-replica && python3 tools/serve.py 8322');
    return;
  }

  // ---------- 渲染器 / 场景 ----------
  let renderer, scene, camera, world, spider, spiderCam;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: !TOUCH, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, TOUCH ? 1.5 : 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;                 // r149：输出端 sRGB
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    $('app').appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 700);

    world = new L.World(scene);
    spider = new L.Spider(scene, world);
    spiderCam = new L.SpiderCamera(camera);
  } catch (err) {
    fatal('初始化错误: ' + (err && err.message ? err.message : err));
    console.error(err);
    return;
  }

  // 开机断言：核心对象就位
  try {
    if (spider.legs.length !== 8) throw new Error('腿数 ≠ 8');
    if (!isFinite(spider.pos.x + spider.pos.y + spider.pos.z)) throw new Error('出生位置 NaN');
    if (!world.terrain || !world.terrain.geometry) throw new Error('地形网格缺失');
    if (!(L.colliders.length >= 10)) throw new Error('碰撞体未登记');
  } catch (err) {
    fatal('开机断言失败: ' + (err && err.message ? err.message : err));
    console.error(err);
    return;
  }

  // ---------- URL 参数 ----------
  const qs = new URLSearchParams(location.search);
  const numParam = (k, def) => { const v = parseFloat(qs.get(k)); return isFinite(v) ? v : def; };
  spider.baseSpeed = L.clamp(numParam('speed', spider.baseSpeed), 1, 12);
  spider.rideClear = L.clamp(numParam('ride', spider.rideClear), 1.5, 3.6);
  spider.stepH = L.clamp(numParam('step', spider.stepH), 0.2, 1.4);
  spider.baseFreq = L.clamp(numParam('freq', spider.baseFreq), 0.6, 2.6);
  spider.reset();

  // ---------- 输入 ----------
  const keys = {};
  window.__SPIDER_KEYS__ = keys;   // 诊断钩子：验证键盘输入链路
  let joyId = null, joyBX = 0, joyBY = 0, joyVX = 0, joyVY = 0;
  let camId = null, camLX = 0, camLY = 0, dragging = false;
  const JOYR = 46;
  const joyEl = $('joy'), knobEl = joyEl.querySelector('i');
  const showJoy = (x, y) => { joyEl.style.left = x + 'px'; joyEl.style.top = y + 'px'; joyEl.style.display = 'block'; knobEl.style.left = '50%'; knobEl.style.top = '50%'; };
  const moveKnob = (x, y) => { knobEl.style.left = (x - parseFloat(joyEl.style.left)) + 'px'; knobEl.style.top = (y - parseFloat(joyEl.style.top)) + 'px'; };
  const hideJoy = () => { joyEl.style.display = 'none'; };

  addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'KeyR') spider.reset();
    if (e.code === 'Space' && !e.repeat) { spider.jump(); e.preventDefault(); }
    if (e.code === 'KeyH') { $('panel').classList.toggle('closed'); }
    if (e.code === 'KeyP') paused = !paused;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].indexOf(e.code) >= 0) e.preventDefault();
  });
  addEventListener('keyup', (e) => { keys[e.code] = false; });
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; joyId = null; joyVX = joyVY = 0; hideJoy(); });
  addEventListener('visibilitychange', () => { if (document.hidden) { for (const k in keys) keys[k] = false; joyId = null; joyVX = joyVY = 0; hideJoy(); } });

  const dom = renderer.domElement;
  dom.addEventListener('pointerdown', (e) => {
    const leftZone = e.clientX < innerWidth * 0.46;
    if (e.pointerType === 'touch' && leftZone && joyId === null) {
      joyId = e.pointerId; joyBX = e.clientX; joyBY = e.clientY; joyVX = 0; joyVY = 0;
      showJoy(e.clientX, e.clientY);
    } else if (camId === null) {
      camId = e.pointerId; camLX = e.clientX; camLY = e.clientY; dragging = true;
    }
    try { dom.setPointerCapture(e.pointerId); } catch (_) {}
  });
  dom.addEventListener('pointermove', (e) => {
    if (e.pointerId === joyId) {
      let dx = e.clientX - joyBX, dy = e.clientY - joyBY;
      const len = Math.hypot(dx, dy);
      if (len > JOYR) { dx *= JOYR / len; dy *= JOYR / len; }
      joyVX = dx / JOYR; joyVY = -dy / JOYR;
      moveKnob(e.clientX, e.clientY);
    } else if (e.pointerId === camId) {
      spiderCam.addDrag(e.clientX - camLX, e.clientY - camLY);
      camLX = e.clientX; camLY = e.clientY;
    }
  });
  const endPtr = (e) => {
    if (e.pointerId === joyId) { joyId = null; joyVX = 0; joyVY = 0; hideJoy(); }
    if (e.pointerId === camId) { camId = null; dragging = false; }
  };
  dom.addEventListener('pointerup', endPtr); dom.addEventListener('pointercancel', endPtr);
  dom.addEventListener('wheel', (e) => { e.preventDefault(); spiderCam.zoom(e.deltaY); }, { passive: false });
  $('btnJump').addEventListener('pointerdown', (e) => { e.preventDefault(); spider.jump(); });
  if (TOUCH) document.body.classList.add('touch');

  function readInput() {
    let ix = 0, iy = 0;
    if (joyId !== null) { ix = joyVX; iy = joyVY; }
    else {
      if (keys.KeyW || keys.ArrowUp) iy += 1;
      if (keys.KeyS || keys.ArrowDown) iy -= 1;
      if (keys.KeyD || keys.ArrowRight) ix += 1;
      if (keys.KeyA || keys.ArrowLeft) ix -= 1;
    }
    return { ix, iy, sprint: !!(keys.ShiftLeft || keys.ShiftRight), camYaw: spiderCam.yaw };
  }

  // ---------- 标题卡 / 面板 ----------
  $('titleCard').addEventListener('click', () => $('titleCard').classList.toggle('folded'));
  const fmt = (v) => (Math.abs(v) >= 10 ? '' + Math.round(v) : (+v).toFixed(2));
  (function buildPanel() {
    const wrap = $('sliders');
    const defs = [
      { label: '速度 Speed', min: 1, max: 12, step: 0.5, get: () => spider.baseSpeed, set: (v) => { spider.baseSpeed = v; } },
      { label: '骑高 Ride', min: 1.5, max: 3.6, step: 0.05, get: () => spider.rideClear, set: (v) => { spider.rideClear = v; } },
      { label: '抬脚 Step height', min: 0.2, max: 1.4, step: 0.05, get: () => spider.stepH, set: (v) => { spider.stepH = v; } },
      { label: '步频 Gait rate', min: 0.6, max: 2.6, step: 0.05, get: () => spider.baseFreq, set: (v) => { spider.baseFreq = v; } },
      { label: '转向 Turn rate', min: 0.6, max: 3.0, step: 0.1, get: () => spider.turnRate, set: (v) => { spider.turnRate = v; } },
      { label: '跨距 Stride', min: 1.2, max: 3.4, step: 0.1, get: () => spider.maxStride, set: (v) => { spider.maxStride = v; } },
      { label: '膝摆范围 Swivel', min: 0.5, max: 3.14, step: 0.05, get: () => L.TUNE.aRange, set: (v) => { L.TUNE.aRange = v; } },
      { label: '膝采样 Samples', min: 2, max: 14, step: 1, get: () => L.TUNE.aSamp, set: (v) => { L.TUNE.aSamp = v; } },
    ];
    for (const d of defs) {
      const row = document.createElement('div'); row.className = 'sld';
      const lab = document.createElement('label');
      const nm = document.createElement('span'); nm.textContent = d.label;
      const val = document.createElement('b'); val.textContent = fmt(d.get());
      lab.appendChild(nm); lab.appendChild(val);
      const inp = document.createElement('input');
      inp.type = 'range'; inp.min = d.min; inp.max = d.max; inp.step = d.step; inp.value = d.get();
      inp.addEventListener('input', () => { const v = parseFloat(inp.value); d.set(v); val.textContent = fmt(v); });
      inp.addEventListener('pointerdown', (e) => e.stopPropagation());
      row.appendChild(lab); row.appendChild(inp); wrap.appendChild(row);
    }
    const tog = (label, get, set) => {
      const row = document.createElement('div'); row.className = 'tog';
      const nm = document.createElement('span'); nm.textContent = label;
      const val = document.createElement('b');
      const render = () => { const on = get(); val.textContent = on ? 'ON' : 'OFF'; row.classList.toggle('on', !!on); };
      render();
      row.appendChild(nm); row.appendChild(val);
      row.addEventListener('click', () => { set(!get()); render(); });
      row.addEventListener('pointerdown', (e) => e.stopPropagation());
      wrap.appendChild(row);
    };
    tog('IK 求解器 分解式', () => L.TUNE.decomposed, (v) => { L.TUNE.decomposed = v; });
    tog('车身贴合 Conform', () => spider.bodyConform, (v) => { spider.bodyConform = v; });
    tog('腹部弯折 Flex', () => spider.bodyFlex, (v) => { spider.bodyFlex = v; });
  })();
  $('panelHead').addEventListener('click', () => {
    const p = $('panel'); p.classList.toggle('closed');
    $('panelTog').textContent = p.classList.contains('closed') ? '+' : '–';
  });
  $('panel').addEventListener('pointerdown', (e) => e.stopPropagation());
  $('reset').addEventListener('click', () => spider.reset());
  $('shot').addEventListener('click', () => {
    renderer.render(scene, camera);
    renderer.domElement.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'procedural-spider-' + Date.now() + '.png';
      a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, 'image/png');
  });

  // ---------- HUD / 主循环 ----------
  const fpsEl = $('fps'), spdEl = $('spd'), gradeEl = $('grade');
  const clock = new THREE.Clock();
  let fpsAcc = 0, fpsCnt = 0, fpsT = 0, crashed = false, paused = qs.get('pause') === '1';

  window.__SPIDER_DIAGNOSTICS__ = {
    renderer: renderer.info,
    get state() {
      return {
        fps: fpsCnt && fpsAcc ? Math.round(fpsCnt / fpsAcc) : 0,
        spider: {
          pos: spider.pos.toArray().map((n) => +n.toFixed(2)),
          up: spider.up.toArray().map((n) => +n.toFixed(2)),
          speed: +spider.curSpeed.toFixed(2),
        },
        drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles,
      };
    },
  };

  function animate() {
    requestAnimationFrame(animate);
    if (crashed) return;
    const dt = Math.min(clock.getDelta(), 0.033);
    try {
      const inp = paused ? { ix: 0, iy: 0, sprint: false, camYaw: spiderCam.yaw } : readInput();
      if (!paused) spider.update(dt, inp);
      if (!paused) world.updateDust(dt);
      spiderCam.update(dt, spider, dragging);
      renderer.render(scene, camera);
    } catch (err) { crashed = true; fatal('运行时错误: ' + (err && err.message ? err.message : err)); console.error(err); }
    fpsAcc += dt; fpsCnt++; fpsT += dt;
    if (fpsT > 0.4) {
      fpsEl.textContent = Math.round(fpsCnt / fpsAcc);
      spdEl.textContent = spider.curSpeed.toFixed(1);
      const uy = spider.up.y;
      const gr = uy > 0.93 ? '平地' : uy > 0.55 ? '斜坡' : uy > -0.3 ? '立墙' : '倒悬';
      gradeEl.textContent = paused ? gr + ' · 暂停' : gr;
      gradeEl.classList.toggle('wall', uy < 0.55);
      fpsAcc = 0; fpsCnt = 0; fpsT = 0;
    }
  }
  animate();
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  // ---------- 头部驱动 API（隐藏标签页/自检/截图用；rAF 在后台会被节流） ----------
  window.GOSSAMER = {
    scene, spider, world, camera, renderer, spiderCam,
    drive(steps = 60, ix = 0, iy = 1, sprint = false, camYaw = null) {
      const inp = { ix, iy, sprint, camYaw: camYaw === null ? spiderCam.yaw : camYaw };
      for (let i = 0; i < steps; i++) spider.update(1 / 60, inp);
      spiderCam.update(1 / 60, spider, false);
      renderer.render(scene, camera);
      return spider;
    },
  };

  // ---------- ?selftest=1 自检 ----------
  if (qs.get('selftest') === '1') runSelftest();

  function runSelftest() {
    const V = L.V3, terrainH = L.terrainH, terrainN = L.terrainN, castAll = L.castAll;
    const results = [];
    const t = (name, fn) => {
      try {
        const r = fn();
        results.push({ name, ok: !!r.ok, detail: r.detail || '' });
      } catch (err) { results.push({ name, ok: false, detail: '异常: ' + (err && err.message ? err.message : err) }); }
    };
    // 可复现伪随机（自检自身确定性）
    let seed = 20261121;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

    t('地形高度场有限 + 法线单位', () => {
      const F = L.FIELD / 2 - 4;
      for (let gx = -F; gx <= F; gx += 17) for (let gz = -F; gz <= F; gz += 23) {
        const h = terrainH(gx, gz);
        if (!isFinite(h)) return { ok: false, detail: 'H NaN @' + gx + ',' + gz };
        const n = terrainN(gx, gz);
        if (Math.abs(n.length() - 1) > 1e-5) return { ok: false, detail: '|n|≠1 @' + gx + ',' + gz };
      }
      return { ok: true, detail: '全场网格采样通过' };
    });

    t('castAll 下探命中地形表面', () => {
      let tested = 0, bad = 0;
      for (let k = 0; k < 60 && tested < 30; k++) {
        const x = (rnd() * 2 - 1) * (L.FIELD / 2 - 6), z = (rnd() * 2 - 1) * (L.FIELD / 2 - 6);
        // 跳过被解析体（卵石/立柱）覆盖的柱列：命中碰撞体顶也属正确，但不验证地形贴合
        let covered = false;
        for (const c of L.colliders) if (L.clearance(V(x, terrainH(x, z) + 2, z), c).d < 2.5) { covered = true; break; }
        if (covered) continue;
        tested++;
        const g = castAll(V(x, terrainH(x, z) + 60, z), V(0, -1, 0), 200);
        if (!g || Math.abs(g.point.y - terrainH(x, z)) > 0.4 || g.n.y <= 0) bad++;
      }
      return { ok: bad === 0, detail: tested ? bad + '/' + tested + ' 未命中' : '无可用柱列' };
    });

    t('clearance 球体有符号距离', () => {
      const c = { kind: 'sphere', c: V(0, 9999, 0), r: 5, br: 5, wall: false };
      const inside = L.clearance(V(0, 9999, 0), c);
      const outside = L.clearance(V(7, 9999, 0), c);
      const ok = Math.abs(inside.d - (-5)) < 1e-5 && Math.abs(outside.d - 2) < 1e-5;
      return { ok, detail: '内部 ' + inside.d.toFixed(4) + ' / 外部 ' + outside.d.toFixed(4) };
    });

    t('两骨 IK 闭式解精度（两种求解器）', () => {
      const l1 = 2.05, l2 = 2.05;
      let worst = 0;
      for (let k = 0; k < 24; k++) {
        const root = V(rnd() * 4 - 2, rnd() * 4, rnd() * 4 - 2);
        const dir = V(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1).normalize();
        const dist = 0.4 + rnd() * (l1 + l2 - 0.9);
        const target = root.clone().addScaledVector(dir, dist);
        const pole = V(0, 1, 0);
        for (const fn of [L.twoBoneKnee, L.twoBoneKneeDecomposed]) {
          const knee = fn(root, target, l1, l2, pole, dir.clone(), V());
          worst = Math.max(worst, Math.abs(knee.clone().sub(root).length() - l1));
          worst = Math.max(worst, Math.abs(target.clone().sub(knee).length() - l2));
        }
      }
      return { ok: worst < 1e-3, detail: '最大骨长误差 ' + worst.toExponential(2) };
    });

    t('直行位移（drive 240 步 ≈ 4s）', () => {
      spider.teleport(0, 0, V(0, 0, 1));
      const p0 = spider.pos.clone();
      window.GOSSAMER.drive(240, 0, 1);
      const d = spider.pos.distanceTo(p0);
      const finite = isFinite(spider.pos.x + spider.pos.y + spider.pos.z);
      return { ok: d >= 12 && finite, detail: '位移 ' + d.toFixed(1) + 'u' };
    });

    t('机身不沉入地面', () => {
      let minAbove = 1e9;
      spider.teleport(0, 0, V(0, 0, 1));
      for (let i = 0; i < 240; i++) {
        spider.update(1 / 60, { ix: 0, iy: 1, sprint: false, camYaw: Math.PI });
        const above = spider.bodyOrigin.y - terrainH(spider.pos.x, spider.pos.z);
        minAbove = Math.min(minAbove, above);
      }
      return { ok: minAbove >= spider.rideClear * 0.4, detail: '最低骑高 ' + minAbove.toFixed(2) + 'u' };
    });

    t('腿不超伸（可达保护）', () => {
      const maxReach = spider.femur + spider.tibia;
      let worst = 0;
      for (const leg of spider.legs) {
        const hipW = spider.root.localToWorld(leg.hip.clone());
        worst = Math.max(worst, hipW.distanceTo(leg.plant));
      }
      return { ok: worst <= maxReach * 1.05, detail: '最远腿 ' + worst.toFixed(2) + ' / 上限 ' + (maxReach * 1.05).toFixed(2) };
    });

    t('步态运转（240 步内完成抬步 ≥ 10）', () => {
      spider.teleport(0, 0, V(0, 0, 1));
      const s0 = spider.stepCount;
      window.GOSSAMER.drive(240, 0, 1);
      const n = spider.stepCount - s0;
      return { ok: n >= 10, detail: '完成抬步 ' + n + ' 次' };
    });

    t('确定性：同序列两次回放逐位一致', () => {
      // camYaw 显式锁定（π）：相机自动跟随会演化 yaw，进入模拟输入后破坏回放确定性
      const seq = [[30, 0, 1], [30, 0.8, 1], [30, 0, 1], [30, -0.8, 1], [30, 0, 1, true]];
      const snap = () => spider.pos.toArray().concat(spider.up.toArray()).map((n) => n.toFixed(9)).join(',');
      spider.teleport(0, 0, V(0, 0, 1));
      for (const s of seq) window.GOSSAMER.drive(s[0], s[1], s[2], !!s[3], Math.PI);
      const a = snap();
      spider.teleport(0, 0, V(0, 0, 1));
      for (const s of seq) window.GOSSAMER.drive(s[0], s[1], s[2], !!s[3], Math.PI);
      const b = snap();
      return { ok: a === b, detail: a === b ? '两轮回放一致' : '发散:\n  ' + a + '\n  ' + b };
    });

    t('跳跃→抛体→自动落面', () => {
      spider.teleport(0, 0, V(0, 0, 1));
      spider.jump();
      let wasAir = false;
      for (let i = 0; i < 150; i++) {
        spider.update(1 / 60, { ix: 0, iy: 0.4, sprint: false, camYaw: Math.PI });
        if (spider.airborne) wasAir = true;
      }
      const finite = isFinite(spider.pos.x + spider.pos.y + spider.pos.z);
      return { ok: wasAir && !spider.airborne && finite, detail: wasAir ? (spider.airborne ? '150 步后仍未落地' : '已落面') : '未离地' };
    });

    t('越阶爬升（塔阶 Δy ≥ 1.0）', () => {
      const S = L.WORLD_SCALE, zx = -15 * S, zStart = -13 * S + 13;
      spider.teleport(zx, zStart, V(0, 0, -1));
      const y0 = spider.bodyOrigin.y;
      let minUpY = 1;
      for (let i = 0; i < 420; i++) {
        spider.update(1 / 60, { ix: 0, iy: 1, sprint: false, camYaw: 0 });
        minUpY = Math.min(minUpY, spider.up.y);
      }
      const dy = spider.bodyOrigin.y - y0;
      return { ok: dy >= 1.0, detail: 'Δy=' + dy.toFixed(2) + 'u，min up.y=' + minUpY.toFixed(2) };
    });

    // 还原演示状态
    spider.reset();
    spiderCam.yaw = Math.PI; spiderCam.pitch = 0.5; spiderCam.dist = 15; spiderCam._d = null;
    spiderCam.target.set(0, 2, 0); spiderCam.update(0.016, spider, false);

    const pass = results.filter((r) => r.ok).length;
    const el = $('selftest');
    el.style.display = 'block';
    el.innerHTML = '<h2>自检 <b class="' + (pass === results.length ? '' : 'bad') + '">' + pass + '/' + results.length + ' PASS</b></h2>' +
      '<ul>' + results.map((r) =>
        '<li><span class="' + (r.ok ? 'ok' : 'no') + '">' + (r.ok ? 'PASS' : 'FAIL') + '</span>' +
        '<span>' + r.name + (r.detail ? ' <span class="d">— ' + r.detail.replace(/\n/g, ' · ') + '</span>' : '') + '</span></li>'
      ).join('') + '</ul>' +
      '<button class="close">关闭报告</button>';
    el.querySelector('.close').addEventListener('click', () => { el.style.display = 'none'; });
    window.__SELFTEST__ = { pass, total: results.length, results };
    console.log('[selftest] ' + pass + '/' + results.length + ' PASS', results);
  }

})();
