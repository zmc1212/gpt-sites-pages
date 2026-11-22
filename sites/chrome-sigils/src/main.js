/* chrome-sigils — 入口:装配渲染器 / 场景 / 交互 / UI,主循环,快捷键
 *
 * URL 约定:
 *   #auto   跳过开始卡(无头验收 / 嵌入预览),其余行为与正常访问一致
 * 失败兜底:three.js 缺失、WebGL 不可用、运行期未捕获异常都会亮出 #fatal 横幅。
 */
(function (global) {
  'use strict';

  var AUTO = /#auto/.test(location.hash);

  function showFatal(msg, detail) {
    var el = document.getElementById('fatal');
    if (!el) return;
    el.classList.remove('hidden');
    el.innerHTML = '<b>出错了:</b>' + msg +
      (detail ? '<br><small>' + String(detail).replace(/[<>&]/g, function (c) {
        return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c];
      }) + '</small>' : '');
  }

  window.addEventListener('error', function (e) {
    showFatal(e.message || '未知错误', e.filename ? (e.filename.split('/').pop() + ':' + e.lineno) : '');
  });

  function boot() {
    if (!window.THREE) { showFatal('three.js 加载失败(vendor/three.min.js 缺失或路径错误)'); return; }
    if (typeof SigilGeom === 'undefined' || typeof SigilModel === 'undefined' ||
        typeof SigilDrawing === 'undefined' || typeof SigilUI === 'undefined' ||
        typeof SigilEnv === 'undefined' || typeof SigilMaterials === 'undefined' ||
        typeof SigilPresets === 'undefined' || typeof SigilOrbit === 'undefined') {
      showFatal('源码模块加载不完整,请检查 src/*.js'); return;
    }

    var stage = document.getElementById('stage');
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch (err) {
      showFatal('WebGL 初始化失败,浏览器可能不支持或被禁用', err && err.message); return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    stage.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 60);

    // env 贴图承担几乎全部光照;一盏弱方向光补造型层次(不投影)
    var keyLight = new THREE.DirectionalLight(0xffffff, 0.30);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    var envDisposer = null;
    function applyEnv(name) {
      if (envDisposer) envDisposer();
      envDisposer = SigilEnv.apply(renderer, scene, name);
    }

    var model = new SigilModel(SigilMaterials.presets[0].make());
    scene.add(model.root);

    var orbit = new SigilOrbit({ yaw: -0.34, pitch: 0.10, radius: 4.8 });
    orbit.updateCamera(camera);

    var router = new SigilDrawing(model, camera, orbit, renderer.domElement, {
      strokeWidth: 0.16,
      symmetry: false,
      onSymmetryHint: function (msg) { if (ui) ui.toast(msg); }
    });

    var savedPng = false;
    var actions = {
      applyMaterial: function (id) {
        var p = SigilMaterials.findById(id);
        model.setMaterial(p.make());
      },
      applyEnv: applyEnv,
      savePng: function () {
        renderer.render(scene, camera);   // 同步渲染后立刻取帧,免 preserveDrawingBuffer
        var cv = renderer.domElement;
        if (cv.toBlob) {
          cv.toBlob(function (blob) {
            if (!blob) { ui.toast('保存失败'); return; }
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'sigil-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.png';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
            ui.toast('已保存 PNG');
          }, 'image/png');
        } else {
          // 老浏览器兜底:dataURL
          var a2 = document.createElement('a');
          a2.href = cv.toDataURL('image/png');
          a2.download = 'sigil.png';
          document.body.appendChild(a2); a2.click(); a2.remove();
          ui.toast('已保存 PNG');
        }
        savedPng = true;
      },
      randomSigil: function () {
        model.loadPreset(SigilPresets.random(), router.strokeWidth);
        orbit.nudge();
      }
    };

    // hash 参数:#auto&env=neon&mat=gold —— 无头验收可直接指定环境与材质
    var HASH_PARAMS = {};
    location.hash.replace(/^#/, '').split('&').forEach(function (kv) {
      if (!kv) return;
      var p = kv.split('=');
      HASH_PARAMS[decodeURIComponent(p[0])] = p.length > 1 ? decodeURIComponent(p[1]) : true;
    });

    var ui = SigilUI.init({
      model: model,
      router: router,
      actions: actions,
      onStart: function () { orbit.nudge(); }
    });

    // ---------- 初始内容 ----------
    if (AUTO) document.getElementById('card-title').classList.add('hidden');
    if (!model.restore()) {
      model.loadPreset(SigilPresets.default(), 0.16);
    }
    applyEnv(ui.settings.env || 'studio');
    actions.applyMaterial(ui.settings.material || 'chrome');
    if (HASH_PARAMS.env && SigilEnv.names.indexOf(HASH_PARAMS.env) >= 0) ui.pickEnv(HASH_PARAMS.env);
    if (HASH_PARAMS.mat && SigilMaterials.findById(HASH_PARAMS.mat).id === HASH_PARAMS.mat) ui.pickMaterial(HASH_PARAMS.mat);
    router.strokeWidth = ui.settings.width || 0.16;
    document.getElementById('width-slider').value = router.strokeWidth;
    document.getElementById('width-val').textContent = (router.strokeWidth * 100).toFixed(0) + '‰';
    if (ui.settings.symmetry) router.setSymmetry(true);

    // ---------- 快捷键 ----------
    window.addEventListener('keydown', function (e) {
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return;
      var k = e.key, low = k.length === 1 ? k.toLowerCase() : k;
      if ((e.ctrlKey || e.metaKey) && low === 'z' && !e.shiftKey) { model.undo(); e.preventDefault(); return; }
      if ((e.ctrlKey || e.metaKey) && (low === 'y' || (e.shiftKey && low === 'z'))) { model.redo(); e.preventDefault(); return; }
      if (k === 'Tab') {
        e.preventDefault();
        if (model.strokes.length) {
          var ids = model.strokes.map(function (s) { return s.id; });
          var idx = ids.indexOf(model.selectedId);
          model.select(ids[(idx + 1) % ids.length]);
        }
      } else if (k === 'Delete' || k === 'Backspace') {
        if (model.selectedId) { e.preventDefault(); model.deleteStroke(model.selectedId); }
      } else if (low >= '1' && low <= '5') {
        var p = SigilMaterials.presets[+low - 1];
        if (p) ui.pickMaterial(p.id);
      } else if (low === 'q') { ui.pickEnv('studio');
      } else if (low === 'w') { ui.pickEnv('neon');
      } else if (low === 'e') { ui.pickEnv('sunset');
      } else if (low === 'r') { actions.randomSigil();
      } else if (low === 's') { actions.savePng(); e.preventDefault();
      } else if (low === 'x') { ui.toggleSymmetry();
      } else if (k === '?' || low === 'h') { ui.toggleHelp();
      }
    });

    // ---------- 自适应 ----------
    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ---------- 主循环 ----------
    var last = performance.now();
    window.__sigilFrameCount = 0;
    function tickFrame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      model.tick(dt);
      orbit.tick(dt, camera);
      renderer.render(scene, camera);
      window.__sigilFrameCount++;
      requestAnimationFrame(tickFrame);
    }
    requestAnimationFrame(tickFrame);

    // 验收钩子:rAF 被节流的环境(遮挡的内嵌面板)可手动渲染一帧供截图
    window.__sigilRenderOnce = function () {
      model.tick(1 / 60);
      orbit.tick(1 / 60, camera);
      renderer.render(scene, camera);
      window.__sigilFrameCount++;
      return true;
    };
    window.__sigilRenderN = function (n) {
      for (var i = 0; i < n; i++) window.__sigilRenderOnce();
      return window.__sigilFrameCount;
    };

    // 验收探针:无头测试读取
    window.__sigilReady = true;
    window.__sigil = { model: model, router: router, orbit: orbit, ui: ui };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
