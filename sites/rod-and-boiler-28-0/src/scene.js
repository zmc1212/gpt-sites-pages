/* 场景:渲染器 / 灯光 / 蓝图地面 / 钢轨 / 机车根节点 / 蒸汽粒子 */
(function (ST28) {
  var M = {};              // 共享材质
  var sun = null;
  var groundTex = null, tieTex = null;
  var puffs = [], jets = [];

  function mesh(geo, mat, x, y, z, cast, receive) {
    var m = new THREE.Mesh(geo, mat);
    if (x !== undefined) m.position.set(x, y, z);
    m.castShadow = cast !== false;
    m.receiveShadow = receive !== false;
    return m;
  }

  function makePool(scene, n) {
    var tex = ST28.Textures.puff();
    var arr = [];
    for (var i = 0; i < n; i++) {
      var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false });
      var sp = new THREE.Sprite(mat);
      sp.visible = false;
      scene.add(sp);
      arr.push({ sp: sp, life: -1, max: 1.1, vx: 0, vy: 0, vz: 0, base: 1 });
    }
    return arr;
  }

  function spawn(arr, x, y, z, opt) {
    for (var i = 0; i < arr.length; i++) {
      var p = arr[i];
      if (p.life >= 0) continue;
      p.life = 0;
      p.max = opt.max;
      p.base = opt.base;
      p.vx = opt.vx; p.vy = opt.vy; p.vz = opt.vz;
      p.sp.position.set(x, y, z);
      p.sp.scale.set(opt.base, opt.base, 1);
      p.sp.material.opacity = opt.opacity;
      p.sp.visible = true;
      return;
    }
  }

  function stepPool(arr, dt) {
    for (var i = 0; i < arr.length; i++) {
      var p = arr[i];
      if (p.life < 0) continue;
      p.life += dt;
      var t = p.life / p.max;
      if (t >= 1) { p.life = -1; p.sp.visible = false; continue; }
      p.sp.scale.set(p.base * (0.35 + 1.9 * t), p.base * (0.35 + 1.9 * t), 1);
      p.sp.material.opacity = 0.62 * (1 - t) * (1 - t);
      p.sp.position.x += p.vx * dt;
      p.sp.position.y += p.vy * dt;
      p.sp.position.z += p.vz * dt;
      p.vy *= (1 - 0.65 * dt);
    }
  }

  function init() {
    var stage = document.getElementById("stage");
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    // 软件渲染(SwiftShader 等)下降像素比 + 精简阴影,保证可交互帧率
    var softGL = false;
    try {
      var gl = renderer.getContext();
      var ext = gl.getExtension("WEBGL_debug_renderer_info");
      var gpu = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "";
      softGL = /swiftshader|software|basic render/i.test(String(gpu));
    } catch (e) { /* 保留默认 */ }
    renderer.setPixelRatio(softGL ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = softGL ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    // 物理光照:去掉 legacy 模式的 π 增益,否则暗色材质会被抬成灰白
    renderer.physicallyCorrectLights = true;
    stage.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    scene.background = ST28.Textures.sky();
    scene.fog = new THREE.Fog(0x16324A, 22, 58);

    var camera = new THREE.PerspectiveCamera(38, stage.clientWidth / stage.clientHeight, 0.1, 140);
    camera.position.set(5, 4.2, 10.5);

    var hemi = new THREE.HemisphereLight(0xd8e8f5, 0x1c2c3c, 0.85);
    scene.add(hemi);
    sun = new THREE.DirectionalLight(0xfff4e2, 2.0);
    sun.position.set(-6, 9, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(softGL ? 1024 : 2048, softGL ? 1024 : 2048);
    sun.shadow.camera.left = -9; sun.shadow.camera.right = 9;
    sun.shadow.camera.top = 9; sun.shadow.camera.bottom = -9;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 30;
    sun.shadow.bias = -0.0004;
    scene.add(sun);
    scene.add(sun.target);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    /* ---- 共享材质(先建,零件全部依赖) ---- */
    M.iron = new THREE.MeshStandardMaterial({ color: 0x23252A, metalness: 0.5, roughness: 0.52 });
    M.ironD = new THREE.MeshStandardMaterial({ color: 0x1A1C20, metalness: 0.5, roughness: 0.6 });
    M.wine = new THREE.MeshStandardMaterial({ color: 0x8C2F39, metalness: 0.28, roughness: 0.4 });
    M.brass = new THREE.MeshStandardMaterial({ color: 0xB08D57, metalness: 0.8, roughness: 0.3 });
    M.boiler = new THREE.MeshStandardMaterial({ color: 0x3A3E44, metalness: 0.55, roughness: 0.45 });
    M.steel = new THREE.MeshStandardMaterial({ color: 0xAEB4BC, metalness: 0.75, roughness: 0.34 });
    M.steelD = new THREE.MeshStandardMaterial({ color: 0x70767E, metalness: 0.6, roughness: 0.5 });
    M.white = new THREE.MeshStandardMaterial({ color: 0xE9EEF2, metalness: 0.05, roughness: 0.5 });
    M.dark = new THREE.MeshStandardMaterial({ color: 0x10131A, metalness: 0.1, roughness: 0.7 });
    M.cabWin = new THREE.MeshStandardMaterial({ color: 0x0E1620, metalness: 0.3, roughness: 0.25 });
    M.lamp = new THREE.MeshStandardMaterial({ color: 0xFFE9C8, emissive: 0xFFD9A0, emissiveIntensity: 1.1, roughness: 0.3 });
    M.coal = new THREE.MeshStandardMaterial({ map: ST28.Textures.coal(), roughness: 0.95 });

    /* ---- 蓝图地面 ---- */
    groundTex = ST28.Textures.ground();
    var ground = mesh(new THREE.PlaneGeometry(240, 240),
      new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.95 }), 0, 0, 0, false, true);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    /* ---- 枕木条(轨道下) ---- */
    tieTex = ST28.Textures.ties();
    var tieStrip = mesh(new THREE.PlaneGeometry(240, 2.3),
      new THREE.MeshStandardMaterial({ map: tieTex, roughness: 0.95 }), 0, 0.008, 0, false, true);
    tieStrip.rotation.x = -Math.PI / 2;
    scene.add(tieStrip);

    /* ---- 钢轨 ×2(轨顶 y=0.16,与轮径匹配) ---- */
    M.rail = new THREE.MeshStandardMaterial({ color: 0x565D66, metalness: 0.8, roughness: 0.32 });
    for (var s = -1; s <= 1; s += 2) {
      scene.add(mesh(new THREE.BoxGeometry(240, 0.05, 0.08), M.rail, 0, 0.135, s * 0.60, false, true));
    }

    /* ---- 机车根节点(装配后整体前移) ---- */
    var train = new THREE.Group();
    scene.add(train);

    /* ---- 蒸汽粒子池 ---- */
    puffs = makePool(scene, 26);
    jets = makePool(scene, 18);

    ST28.Scene3D = {
      scene: scene,
      camera: camera,
      renderer: renderer,
      train: train,
      mesh: mesh,
      M: M,
      spawnPuff: function (x, y, z, strength) {
        var s = 0.55 + 0.7 * (strength === undefined ? 0.6 : strength);
        spawn(puffs, x, y, z, { max: 1.15, base: s, vx: 0.5 + Math.random() * 0.4, vy: 1.35 + Math.random() * 0.6, vz: (Math.random() - 0.5) * 0.4, opacity: 0.62 });
      },
      spawnJet: function (x, y, z) {
        spawn(jets, x, y, z, { max: 0.5, base: 0.16, vx: (Math.random() - 0.5) * 0.7, vy: 2.5, vz: (Math.random() - 0.5) * 0.7, opacity: 0.7 });
      }
    };
  }

  /* 每帧:太阳跟车 / 地面网格与枕木后移(与滚动无滑移匹配) / 粒子 */
  function update(dt) {
    var train = ST28.Scene3D.train;
    var tx = train.position.x;
    if (sun) {
      sun.position.set(tx - 5, 9, 7);
      sun.target.position.set(tx, 0, 0);
    }
    if (groundTex) groundTex.offset.x = tx / 8;      // 地贴 tile 世界宽度 8
    if (tieTex) tieTex.offset.x = tx / 3.2;          // 枕木 tile 3.2(4 根 / 0.8 间距)
    stepPool(puffs, dt);
    stepPool(jets, dt);
  }

  ST28.SceneInit = init;
  ST28.SceneUpdate = update;
})(window.ST28 = window.ST28 || {});
