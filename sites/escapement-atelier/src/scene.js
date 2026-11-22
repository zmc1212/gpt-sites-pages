/* 场景：渲染器 / 灯光 / 纸面地台 / 墨色展示座 / 共享材质 */
(function (MOVT) {
  var M = {};      // 共享材质

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
    renderer.toneMappingExposure = 1.18;
    // 物理光照：去掉 legacy 模式的 π 增益，否则金属材质发灰
    renderer.physicallyCorrectLights = true;
    stage.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    scene.background = MOVT.Textures.backdrop();
    scene.fog = new THREE.Fog(0xdcd2bd, 16, 42);

    var camera = new THREE.PerspectiveCamera(38, stage.clientWidth / stage.clientHeight, 0.1, 80);
    camera.position.set(4.2, 4.6, 5.4);

    var hemi = new THREE.HemisphereLight(0xfff6e6, 0x9a8f7a, 0.95);
    scene.add(hemi);
    var sun = new THREE.DirectionalLight(0xfff4e2, 1.75);
    sun.position.set(4, 7, 3);
    sun.castShadow = true;
    sun.shadow.mapSize.set(softGL ? 1024 : 2048, softGL ? 1024 : 2048);
    sun.shadow.camera.left = -5.5; sun.shadow.camera.right = 5.5;
    sun.shadow.camera.top = 5.5; sun.shadow.camera.bottom = -5.5;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 22;
    sun.shadow.bias = -0.0004;
    scene.add(sun);
    var fill = new THREE.DirectionalLight(0xe7ecf4, 0.55);   // 冷侧补光，给金属提亮
    fill.position.set(-5, 3, -4);
    scene.add(fill);
    var glint = new THREE.DirectionalLight(0xffe8c8, 0.4);   // 低角度掠射，扫出金属高光
    glint.position.set(-2, 1.4, 5);
    scene.add(glint);
    scene.add(new THREE.AmbientLight(0xffffff, 0.16));

    /* ---- 共享材质（先建，展示座/零件都依赖，避免 undefined 回退成白色） ---- */
    M.brass = new THREE.MeshStandardMaterial({ color: 0xb08d57, metalness: 0.72, roughness: 0.3 });
    M.brassPlate = new THREE.MeshStandardMaterial({ map: MOVT.Textures.perlage(), metalness: 0.55, roughness: 0.42 });
    M.brassDark = new THREE.MeshStandardMaterial({ color: 0x8a6b3c, metalness: 0.7, roughness: 0.36 });
    M.brassLine = new THREE.MeshStandardMaterial({ color: 0xc09a5e, metalness: 0.8, roughness: 0.25 });
    M.rhodium = new THREE.MeshStandardMaterial({ color: 0xc6cbd2, metalness: 0.8, roughness: 0.22 });
    M.steel = new THREE.MeshStandardMaterial({ color: 0x9ba1a8, metalness: 0.72, roughness: 0.32 });
    M.steelDark = new THREE.MeshStandardMaterial({ color: 0x565a60, metalness: 0.7, roughness: 0.4 });
    M.ink = new THREE.MeshStandardMaterial({ color: 0x2a2723, metalness: 0.15, roughness: 0.62 });
    M.handSteel = new THREE.MeshStandardMaterial({ color: 0x2f2b26, metalness: 0.6, roughness: 0.3 });
    M.wine = new THREE.MeshStandardMaterial({ color: 0x8c2f39, metalness: 0.3, roughness: 0.32 });
    M.ruby = new THREE.MeshStandardMaterial({
      color: 0x9c1f34, metalness: 0.1, roughness: 0.14,
      transparent: true, opacity: 0.9,
      emissive: 0x35040c, emissiveIntensity: 0.7
    });
    M.spring = new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.72, roughness: 0.35 });
    M.glass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0, roughness: 0.04,
      transparent: true, opacity: 0.16,
      clearcoat: 1, clearcoatRoughness: 0.05,
      side: THREE.DoubleSide, depthWrite: false
    });

    /* ---- 纸面地台 ---- */
    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ map: MOVT.Textures.ground(), roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.48;
    ground.receiveShadow = true;
    scene.add(ground);

    /* ---- 墨色展示座（velvet 风格圆台，衬托黄铜机芯） ---- */
    var pedestal = mesh(new THREE.CylinderGeometry(3.05, 3.2, 0.18, 72), M.ink, 0, -0.39, 0);
    pedestal.receiveShadow = true;
    pedestal.castShadow = true;
    scene.add(pedestal);
    var inlay = mesh(new THREE.TorusGeometry(2.62, 0.016, 8, 80), M.brassLine, 0, -0.295, 0);
    inlay.rotation.x = Math.PI / 2;
    scene.add(inlay);

    MOVT.Scene3D = {
      scene: scene,
      camera: camera,
      renderer: renderer,
      mesh: mesh,
      M: M
    };
  }

  function update() { /* 场景级动画暂无，保留接口 */ }

  MOVT.SceneInit = init;
  MOVT.SceneUpdate = update;
})(window.MOVT = window.MOVT || {});
