/* 场景：渲染器 / 灯光 / 图纸台面 / UNO R3 teal 主板（丝印 Canvas 贴图） */
(function (UNO3) {
  var M = {};      // 共享材质
  var boardGroup = null;

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
    // 物理光照：去掉 legacy 模式的 π 增益，否则暗色材质会被抬成灰白
    renderer.physicallyCorrectLights = true;
    stage.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    scene.background = UNO3.Textures.sky();

    var camera = new THREE.PerspectiveCamera(38, stage.clientWidth / stage.clientHeight, 0.1, 90);
    camera.position.set(6, 6.5, 9);

    var hemi = new THREE.HemisphereLight(0xfff4e2, 0x9a8f78, 1.0);
    scene.add(hemi);
    var sun = new THREE.DirectionalLight(0xffffff, 1.55);
    sun.position.set(5.5, 9, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(softGL ? 1024 : 2048, softGL ? 1024 : 2048);
    sun.shadow.camera.left = -8; sun.shadow.camera.right = 8;
    sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 26;
    sun.shadow.bias = -0.0004;
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    /* ---- 图纸台面 ---- */
    var desk = new THREE.Mesh(
      new THREE.PlaneGeometry(38, 30),
      new THREE.MeshStandardMaterial({ map: UNO3.Textures.paper(), roughness: 0.95 })
    );
    desk.rotation.x = -Math.PI / 2;
    desk.receiveShadow = true;
    scene.add(desk);

    /* ---- 共享材质（先建，主板/零件都依赖） ---- */
    M.plastic = new THREE.MeshStandardMaterial({ color: 0x17181c, roughness: 0.55 });
    M.dark = new THREE.MeshStandardMaterial({ color: 0x26292f, roughness: 0.7 });
    M.chip = new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.38, metalness: 0.15 });
    M.silver = new THREE.MeshStandardMaterial({ color: 0xc9cdd4, metalness: 0.8, roughness: 0.3 });
    M.steel = new THREE.MeshStandardMaterial({ color: 0xaeb3ba, metalness: 0.7, roughness: 0.42 });
    M.gold = new THREE.MeshStandardMaterial({ color: 0xd0a94f, metalness: 0.9, roughness: 0.32 });
    M.resBody = new THREE.MeshStandardMaterial({ color: 0x2e2a26, roughness: 0.5 });
    M.capBody = new THREE.MeshStandardMaterial({ color: 0xb98d5a, roughness: 0.55 });
    M.sleeve = new THREE.MeshStandardMaterial({ color: 0x1e2f52, roughness: 0.42 });
    M.fuse = new THREE.MeshStandardMaterial({ color: 0xd8b13a, roughness: 0.5 });
    M.filmCap = new THREE.MeshStandardMaterial({ color: 0xc27a35, roughness: 0.5 });
    M.ceramic = new THREE.MeshStandardMaterial({ color: 0xd9cfc0, roughness: 0.6 });
    M.copper = new THREE.MeshStandardMaterial({ color: 0xb0703c, metalness: 0.75, roughness: 0.4 });

    /* LED（可在 timeline 里点亮） */
    function ledMat(base, glow) {
      var m = new THREE.MeshStandardMaterial({
        color: base, roughness: 0.4,
        emissive: new THREE.Color(glow), emissiveIntensity: 0
      });
      return m;
    }
    M.ledGreen = ledMat(0x1d5a30, 0x39e07a);
    M.ledOrange = ledMat(0x6e3c12, 0xff8a2a);
    M.ledYellow = ledMat(0x6e5c12, 0xffd23f);

    /* ---- 主板（第 1 阶段飞入，由 Parts 控制位置） ---- */
    boardGroup = buildMainBoard();
    boardGroup.visible = false;
    scene.add(boardGroup);

    UNO3.Scene3D = {
      scene: scene,
      camera: camera,
      renderer: renderer,
      board: boardGroup,
      mesh: mesh,
      M: M
    };
  }

  /* 主板：68.6 × 53.4 mm（1 单位 = 1 cm），板厚 1.6 mm */
  function buildMainBoard() {
    var g = new THREE.Group();
    var L = UNO3.PCB_LAYOUT;
    var pcbTex = UNO3.Textures.pcb(L);
    var tealSide = new THREE.MeshStandardMaterial({ color: 0x016374, roughness: 0.62 });
    var tealTop = new THREE.MeshStandardMaterial({ map: pcbTex, roughness: 0.6 });
    var base = mesh(new THREE.BoxGeometry(L.w / 10, 0.16, L.h / 10),
      [tealSide, tealSide, tealTop, tealSide, tealSide, tealSide], 0, 0.08, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    g.add(base);
    return g;
  }

  function update(dt) { /* 预留：当前场景无持续动画 */ }

  UNO3.SceneInit = init;
  UNO3.SceneUpdate = update;
})(window.UNO3 = window.UNO3 || {});
