/* 主程序:渲染器 / 场景总装 / 太阳驱动 / 渲染循环 / 致命错误横幅 */
(function () {
  'use strict';
  var fatalEl = document.getElementById('fatal');
  window.__errs = [];
  function fatal(msg) {
    window.__errs.push(String(msg).slice(0, 300));
    fatalEl.textContent = '启动失败:' + msg +
      '\n本站为纯静态页面,可用 python3 tools/serve.py 8223 后访问 http://127.0.0.1:8223';
    fatalEl.style.display = 'block';
  }
  window.addEventListener('error', function (e) {
    fatal((e.message || '未知错误') + ' @ ' + (e.filename || '') + ':' + (e.lineno || ''));
  });

  if (typeof THREE === 'undefined') {
    fatal('three.js (vendor/three.min.js) 加载失败 —— 若以 file:// 打开仍看到本条,请检查 vendor 目录完整性');
    return;
  }

  try {
    boot();
  } catch (err) {
    fatal(err && err.message ? err.message : String(err));
    console.error(err);
  }

  function boot() {
    var renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.94;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = 'gl';
    document.body.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2400);
    camera.position.set(60, 14, -70);

    /* 石材(共享材质) */
    var stoneMat = new THREE.MeshStandardMaterial({
      vertexColors: true, flatShading: true, roughness: 0.93, metalness: 0.0
    });
    var built = STStones.buildStones(scene, stoneMat);
    var anchors = built.anchors;
    var stoneGroup = built.group;

    /* 环境(含昼夜系统) */
    var env = STEnv.build(scene, anchors);

    /* 相机 */
    var camCtl = STCameraCtl.create(camera, renderer.domElement);
    camCtl.setImmediate({ target: new THREE.Vector3(0, 3, 0), radius: 98, theta: STSolar.AXIS_AZ, phi: 0.14 });

    /* 声音与 UI(初始即"日轮贴着脚跟石跃出"的夏至清晨) */
    var audio = STAudio.create();
    var state = { date: 172, time: STSolar.timeAtAlt(172, 0.02) };
    var ui = STUI.create({
      state: state, camCtl: camCtl, env: env, anchors: anchors,
      renderer: renderer, camera: camera, stoneGroup: stoneGroup, audio: audio
    });

    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    /* 渲染循环
     * rAF 驱动正常浏览;__step 供验收/无头环境手动步进(面板被遮挡时 rAF 会被暂停) */
    var sunDir = new THREE.Vector3(0, 1, 0);
    var last = performance.now();
    window.__cam = camCtl.state;         // 调试钩子(验收用)
    window.__camera = camera;
    window.__frames = 0;
    function frame(dt) {
      camCtl.tick(dt);
      var sp = STSolar.sunPos(state.date, state.time);
      sunDir.copy(STSolar.dirFromAltAz(sp.alt, sp.az));
      env.update({ sunDir: sunDir, alt: sp.alt, az: sp.az }, dt);
      ui.tick(dt, ((camCtl.state.theta + 180) % 360 + 360) % 360, sp);
      renderer.render(scene, camera);
    }
    window.__step = function (n, dt) {
      n = n || 1; dt = dt || 0.033;
      for (var i = 0; i < n; i++) frame(dt);
      return window.__frames;
    };
    function loop(now) {
      requestAnimationFrame(loop);
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      window.__frames++;
      frame(dt);
    }
    requestAnimationFrame(loop);
  }
})();
