/* 场景:渲染器 / 灯光 / 纸桌 / 图纸垫 / 共享材质(主板作为零件在 parts.js 飞入) */
(function (C64B) {
  var M = {};

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
    // 软件渲染下降像素比 + 精简阴影,保证可交互帧率
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
    scene.background = C64B.Textures.sky();

    var camera = new THREE.PerspectiveCamera(38, stage.clientWidth / stage.clientHeight, 0.1, 80);
    camera.position.set(5.2, 4.6, 7.0);

    var hemi = new THREE.HemisphereLight(0xfff3e0, 0x8f836b, 1.0);
    scene.add(hemi);
    var sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(5, 9, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(softGL ? 1024 : 2048, softGL ? 1024 : 2048);
    sun.shadow.camera.left = -8; sun.shadow.camera.right = 8;
    sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 26;
    sun.shadow.bias = -0.0004;
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    /* ---- 纸桌 ---- */
    var desk = new THREE.Mesh(
      new THREE.PlaneGeometry(46, 46),
      new THREE.MeshStandardMaterial({ map: C64B.Textures.desk(), roughness: 0.95 })
    );
    desk.rotation.x = -Math.PI / 2;
    desk.receiveShadow = true;
    scene.add(desk);

    /* ---- 图纸垫 ---- */
    var matTex = C64B.Textures.mat();
    var sideMat = new THREE.MeshStandardMaterial({ color: 0xb7a98a, roughness: 0.85 });
    var topMat = new THREE.MeshStandardMaterial({ map: matTex, roughness: 0.9 });
    var matMesh = new THREE.Mesh(
      new THREE.BoxGeometry(7.6, 0.09, 5.6),
      [sideMat, sideMat, topMat, sideMat, sideMat, sideMat]
    );
    matMesh.position.y = 0.045;
    matMesh.rotation.y = 0.03;
    matMesh.receiveShadow = true;
    matMesh.castShadow = true;
    scene.add(matMesh);

    /* ---- 共享材质(先建,主板/零件都依赖) ---- */
    M.plastic = new THREE.MeshStandardMaterial({ color: 0x26231d, roughness: 0.8 });
    M.dark = new THREE.MeshStandardMaterial({ color: 0x3a362e, roughness: 0.75 });
    M.silver = new THREE.MeshStandardMaterial({ color: 0xc9cdd4, metalness: 0.75, roughness: 0.32 });
    M.alu = new THREE.MeshStandardMaterial({ color: 0xd4d6da, metalness: 0.55, roughness: 0.42 });
    M.gold = new THREE.MeshStandardMaterial({ color: 0xc9a24b, metalness: 0.8, roughness: 0.34 });
    M.chip = new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.38, metalness: 0.15 });
    M.cream = new THREE.MeshStandardMaterial({ color: 0xe8dfc8, roughness: 0.6 });
    M.crtShell = new THREE.MeshStandardMaterial({ color: 0x3a3e45, roughness: 0.7 });
    M.crtDark = new THREE.MeshStandardMaterial({ color: 0x23262b, roughness: 0.6 });
    M.cable = new THREE.MeshStandardMaterial({ color: 0x191a1e, roughness: 0.7 });
    M.c64side = new THREE.MeshStandardMaterial({ color: 0x2c3178, roughness: 0.6 });
    M.c64back = new THREE.MeshStandardMaterial({ color: 0x27306e, roughness: 0.7 });
    M.capA = new THREE.MeshStandardMaterial({ color: 0x32427e, roughness: 0.45 });
    M.capB = new THREE.MeshStandardMaterial({ color: 0x23262e, roughness: 0.5 });

    C64B.Scene3D = {
      scene: scene,
      camera: camera,
      renderer: renderer,
      mesh: mesh,
      M: M
    };
  }

  function update() { /* CRT 屏幕等动态内容由 parts.js 负责 */ }

  C64B.SceneInit = init;
  C64B.SceneUpdate = update;
})(window.C64B = window.C64B || {});
