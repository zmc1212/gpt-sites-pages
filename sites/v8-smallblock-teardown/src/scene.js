/* 场景:渲染器 / 灯光 / 钢板地面 / 装配支架 / 共享材质 */
(function (V8SB) {
  var M = {};   // 共享材质(必须在零件建模之前创建)

  function mesh(geo, mat, x, y, z, cast, receive) {
    var m = new THREE.Mesh(geo, mat);
    if (x !== undefined) m.position.set(x, y, z);
    m.castShadow = cast !== false;
    m.receiveShadow = receive !== false;
    return m;
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
    scene.background = V8SB.Textures.blueprint();
    scene.fog = new THREE.Fog(0x26282C, 16, 36);

    var camera = new THREE.PerspectiveCamera(40, stage.clientWidth / stage.clientHeight, 0.1, 90);
    camera.position.set(7.5, 6.5, 8.5);

    var hemi = new THREE.HemisphereLight(0xd8dce2, 0x2e3134, 0.85);
    scene.add(hemi);
    var sun = new THREE.DirectionalLight(0xffffff, 1.55);
    sun.position.set(7, 10, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(softGL ? 1024 : 2048, softGL ? 1024 : 2048);
    sun.shadow.camera.left = -8; sun.shadow.camera.right = 8;
    sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 26;
    sun.shadow.bias = -0.0004;
    scene.add(sun);
    var fill = new THREE.DirectionalLight(0x9fb4c8, 0.45);
    fill.position.set(-7, 4.5, -5);
    scene.add(fill);
    scene.add(new THREE.AmbientLight(0xffffff, 0.22));

    /* ---- 钢板地面 ---- */
    var floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(46, 46),
      new THREE.MeshStandardMaterial({ map: V8SB.Textures.floor(), roughness: 0.94, metalness: 0.12 })
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    /* ---- 装配支架(两台 trestle) ---- */
    var stand = new THREE.Group();
    var standMat = new THREE.MeshStandardMaterial({ color: 0x1b1c1f, metalness: 0.6, roughness: 0.52 });
    [-1.85, 1.85].forEach(function (x) {
      var t = new THREE.Group();
      t.add(mesh(new THREE.BoxGeometry(0.22, 0.1, 1.6), standMat, 0, 0.68, 0));
      [-0.62, 0.62].forEach(function (z) {
        t.add(mesh(new THREE.BoxGeometry(0.18, 0.66, 0.18), standMat, 0, 0.33, z));
        t.add(mesh(new THREE.BoxGeometry(0.3, 0.05, 0.3), standMat, 0, 0.025, z));
      });
      t.add(mesh(new THREE.BoxGeometry(0.05, 0.5, 0.05), standMat, 0, 0.42, -0.62));
      t.add(mesh(new THREE.BoxGeometry(0.05, 0.5, 0.05), standMat, 0, 0.42, 0.62));
      t.position.x = x;
      stand.add(t);
    });
    scene.add(stand);

    /* ---- 共享材质(先建,零件都依赖) ---- */
    M.block = new THREE.MeshStandardMaterial({ map: V8SB.Textures.castOrange(), metalness: 0.42, roughness: 0.5 });
    M.iron = new THREE.MeshStandardMaterial({ color: 0x17181a, metalness: 0.72, roughness: 0.46 });
    M.crank = new THREE.MeshStandardMaterial({ color: 0x9ba1aa, metalness: 0.92, roughness: 0.3 });
    M.piston = new THREE.MeshStandardMaterial({ map: V8SB.Textures.pistonSide(), metalness: 0.82, roughness: 0.34 });
    M.pistonTop = new THREE.MeshStandardMaterial({ color: 0xc8ccd2, metalness: 0.86, roughness: 0.26 });
    M.alu = new THREE.MeshStandardMaterial({ color: 0xc6c9ce, metalness: 0.72, roughness: 0.36 });
    M.head = new THREE.MeshStandardMaterial({ color: 0xa9adb4, metalness: 0.78, roughness: 0.42 });
    M.cam = new THREE.MeshStandardMaterial({ color: 0x1b1c1f, metalness: 0.7, roughness: 0.34 });
    M.valve = new THREE.MeshStandardMaterial({ color: 0xd7dae0, metalness: 0.9, roughness: 0.22 });
    M.spring = new THREE.MeshStandardMaterial({ color: 0xb4b8c0, metalness: 0.85, roughness: 0.3 });
    M.porcelain = new THREE.MeshStandardMaterial({ color: 0xefede6, metalness: 0.05, roughness: 0.3 });
    M.hex = new THREE.MeshStandardMaterial({ color: 0x9ea3aa, metalness: 0.85, roughness: 0.32 });
    M.wire = new THREE.MeshStandardMaterial({ color: 0x2e2f33, roughness: 0.78, metalness: 0.1 });
    M.boot = new THREE.MeshStandardMaterial({ color: 0xe8611c, roughness: 0.55, metalness: 0.1 });
    M.dark = new THREE.MeshStandardMaterial({ color: 0x1e1f22, metalness: 0.5, roughness: 0.6, side: THREE.DoubleSide });
    M.ring = new THREE.MeshStandardMaterial({ color: 0x303236, metalness: 0.8, roughness: 0.4 });
    M.stamp = new THREE.MeshStandardMaterial({ map: V8SB.Textures.stamp(), transparent: true, roughness: 0.7, metalness: 0.1 });
    M.stand = new THREE.MeshStandardMaterial({ color: 0x1b1c1f, metalness: 0.6, roughness: 0.52 });
    M.bore = new THREE.MeshStandardMaterial({ color: 0x2a2c30, metalness: 0.6, roughness: 0.35 });
    M.liner = new THREE.MeshStandardMaterial({ color: 0x1e1f22, metalness: 0.5, roughness: 0.6, side: THREE.DoubleSide });

    V8SB.Scene3D = {
      scene: scene,
      camera: camera,
      renderer: renderer,
      mesh: mesh,
      M: M,
      softGL: softGL,
      /* 怠速阶段透视模式:外壳半透明,露出活塞/曲轴/气门联动 */
      setXray: function (on) {
        [M.block, M.head, M.liner, M.bore].forEach(function (mat) {
          mat.transparent = on;
          mat.opacity = on ? 0.32 : 1;
          mat.depthWrite = !on;
          mat.needsUpdate = true;
        });
      }
    };
  }

  /* 每帧场景级更新(火花/热浪由 engine.js 管理,此处保留结构) */
  function update() { /* 引擎机构动画在 engine.js 内完成 */ }

  V8SB.SceneInit = init;
  V8SB.SceneUpdate = update;
})(window.V8SB = window.V8SB || {});
