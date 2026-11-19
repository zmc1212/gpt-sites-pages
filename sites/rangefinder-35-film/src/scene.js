/* 场景：渲染器 / 灯光 / 纸面工作台 / 共享材质（银铬·饰皮·玻璃·橙红） */
(function (RF35) {
  var M = {};      // 共享材质（先建，零件都依赖）

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
    // 软件渲染（SwiftShader 等）下降像素比 + 精简阴影，保证可交互帧率
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
    renderer.toneMappingExposure = 1.08;
    renderer.physicallyCorrectLights = true;
    stage.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    scene.background = RF35.Textures.sky();

    var camera = new THREE.PerspectiveCamera(36, stage.clientWidth / stage.clientHeight, 0.05, 60);
    camera.position.set(2.4, 2.2, 3.2);

    var hemi = new THREE.HemisphereLight(0xfff4e0, 0x8d8574, 1.05);
    scene.add(hemi);
    var key = new THREE.DirectionalLight(0xffffff, 1.7);
    key.position.set(2.6, 6.5, 4.2);
    key.castShadow = true;
    key.shadow.mapSize.set(softGL ? 1024 : 2048, softGL ? 1024 : 2048);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    key.shadow.camera.near = 1; key.shadow.camera.far = 18;
    key.shadow.bias = -0.0004;
    scene.add(key);
    var fill = new THREE.DirectionalLight(0xdfe6f2, 0.55);
    fill.position.set(-4.5, 3.2, -2.5);
    scene.add(fill);
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    /* ---- 纸面工作台 ---- */
    var desk = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.MeshStandardMaterial({ map: RF35.Textures.paper(), roughness: 0.94 })
    );
    desk.rotation.x = -Math.PI / 2;
    desk.position.y = 0.133;   // 机身底面 (y=0.14) 恰好落在纸面上
    desk.receiveShadow = true;
    scene.add(desk);

    /* ---- 共享材质（先建，零件都依赖） ---- */
    M.chrome = new THREE.MeshStandardMaterial({ color: 0xC9CCD1, metalness: 0.88, roughness: 0.26 });
    M.alu = new THREE.MeshStandardMaterial({ color: 0xd8dade, metalness: 0.65, roughness: 0.38 });
    M.brushed = new THREE.MeshStandardMaterial({ map: RF35.Textures.brushed(), metalness: 0.72, roughness: 0.34 });
    M.dark = new THREE.MeshStandardMaterial({ color: 0x2c2b29, roughness: 0.75 });
    M.ink = new THREE.MeshStandardMaterial({ color: 0x111113, roughness: 0.6, metalness: 0.15 });
    M.leather = new THREE.MeshStandardMaterial({ map: RF35.Textures.leather(), roughness: 0.9 });
    M.orange = new THREE.MeshStandardMaterial({ color: 0xC75B39, roughness: 0.5 });
    M.cream = new THREE.MeshStandardMaterial({ color: 0xEFE9DB, roughness: 0.6 });
    M.felt = new THREE.MeshStandardMaterial({ color: 0x1c1b19, roughness: 0.98 });
    M.rubber = new THREE.MeshStandardMaterial({ color: 0x3a3a3e, roughness: 0.6, metalness: 0.2 });
    M.brass = new THREE.MeshStandardMaterial({ color: 0xb9975c, metalness: 0.8, roughness: 0.4 });
    M.glass = new THREE.MeshPhysicalMaterial({
      color: 0xe8eef6, metalness: 0, roughness: 0.07, transparent: true, opacity: 0.42,
      clearcoat: 1, clearcoatRoughness: 0.08, side: THREE.DoubleSide
    });
    M.glassBlue = new THREE.MeshPhysicalMaterial({
      color: 0xa9c4ff, metalness: 0, roughness: 0.06, transparent: true, opacity: 0.4,
      clearcoat: 1, clearcoatRoughness: 0.06, side: THREE.DoubleSide
    });
    M.glassPurple = new THREE.MeshPhysicalMaterial({
      color: 0xd0b6ff, metalness: 0, roughness: 0.06, transparent: true, opacity: 0.4,
      clearcoat: 1, clearcoatRoughness: 0.06, side: THREE.DoubleSide
    });
    M.blade = new THREE.MeshStandardMaterial({ color: 0x4a4b4f, metalness: 0.7, roughness: 0.35, side: THREE.DoubleSide });

    RF35.Scene3D = {
      scene: scene,
      camera: camera,
      renderer: renderer,
      mesh: mesh,
      M: M,
      softGL: softGL
    };
  }

  function update(dt) { /* 预留：本站无持续旋转的场景元素 */ }

  RF35.SceneInit = init;
  RF35.SceneUpdate = update;
})(window.RF35 = window.RF35 || {});
