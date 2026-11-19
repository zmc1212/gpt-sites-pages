/* 场景：渲染器 / 灯光 / 木桌 / 深红垫 / Famicom 绿板（裸机，待装壳） */
(function (LS8) {
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
    var softGL = false;
    try {
      var gl = renderer.getContext();
      var ext = gl.getExtension("WEBGL_debug_renderer_info");
      var gpu = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "";
      softGL = /swiftshader|software|basic render/i.test(String(gpu));
    } catch (e) { /* 默认 */ }
    renderer.setPixelRatio(softGL ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = softGL ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    renderer.physicallyCorrectLights = true;
    stage.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    scene.background = LS8.Textures.sky({
      stops: ["#f8dede", "#f6e6da", "#e8e2ef", "#efe0e6"],
      blobs: [
        [205, 102, 240, "rgba(240,160,170,0.45)"],
        [819, 153, 260, "rgba(230,170,180,0.4)"]
      ]
    });

    var camera = new THREE.PerspectiveCamera(38, stage.clientWidth / stage.clientHeight, 0.1, 80);
    camera.position.set(4.5, 4.2, 6.4);

    scene.add(new THREE.HemisphereLight(0xfff2df, 0x8a7f66, 1.0));
    var sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(4.5, 8, 3.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(softGL ? 1024 : 2048, softGL ? 1024 : 2048);
    sun.shadow.camera.left = -6.5; sun.shadow.camera.right = 6.5;
    sun.shadow.camera.top = 6.5; sun.shadow.camera.bottom = -6.5;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 22;
    sun.shadow.bias = -0.0004;
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.18));

    var desk = new THREE.Mesh(
      new THREE.PlaneGeometry(46, 46),
      new THREE.MeshStandardMaterial({ map: LS8.Textures.wood(), roughness: 0.92 })
    );
    desk.rotation.x = -Math.PI / 2;
    desk.receiveShadow = true;
    scene.add(desk);

    var topMat = new THREE.MeshStandardMaterial({
      map: LS8.Textures.mat({ a: "#3a1f28", b: "#2a1620", grid: "rgba(220,150,160,0.14)", grid2: "rgba(230,160,170,0.22)", tick: "rgba(240,200,205,0.4)", title: "FAMICOM BENCH MAT · 60 x 40" }),
      roughness: 0.82
    });
    var sideMat = new THREE.MeshStandardMaterial({ color: 0x241017, roughness: 0.85 });
    var matMesh = new THREE.Mesh(new THREE.BoxGeometry(7.3, 0.09, 4.8),
      [sideMat, sideMat, topMat, sideMat, sideMat, sideMat]);
    matMesh.position.y = 0.048;
    matMesh.rotation.y = 0.045;
    matMesh.receiveShadow = true;
    matMesh.castShadow = true;
    scene.add(matMesh);

    /* ---- 共享材质 ---- */
    M.plastic = new THREE.MeshStandardMaterial({ color: 0x1d1f26, roughness: 0.85 });
    M.dark = new THREE.MeshStandardMaterial({ color: 0x2a2d36, roughness: 0.8 });
    M.silver = new THREE.MeshStandardMaterial({ color: 0xc9cdd4, metalness: 0.75, roughness: 0.32 });
    M.alu = new THREE.MeshStandardMaterial({ color: 0xd8dade, metalness: 0.6, roughness: 0.4 });
    M.gold = new THREE.MeshStandardMaterial({ color: 0xc9a24b, metalness: 0.85, roughness: 0.35 });
    M.navy = new THREE.MeshStandardMaterial({ color: 0x2a3a66, roughness: 0.5 });
    M.pink = new THREE.MeshStandardMaterial({ color: 0xe84f8e, roughness: 0.5 });
    M.white = new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.45 });
    M.chip = new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.4, metalness: 0.2 });
    M.red = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.5 });
    M.green = new THREE.MeshStandardMaterial({
      map: LS8.Textures.pcb("#3a7a50", "rgba(14,42,26,0.5)", "HVC-001", "FAMILY COMPUTER"),
      roughness: 0.62
    });

    /* ---- Famicom 裸主板（静态） ---- */
    var boardGroup = new THREE.Group();
    boardGroup.position.set(0.05, 0.095, 0.05);
    boardGroup.rotation.y = 0.03;
    var g = boardGroup;

    g.add(mesh(new THREE.BoxGeometry(2.1, 0.04, 1.35), M.green, 0, 0.02, 0));

    // 卡带连接器（60 针，上缘，立式长条）
    g.add(mesh(new THREE.BoxGeometry(1.3, 0.22, 0.1), M.plastic, -0.1, 0.15, -0.5));
    g.add(mesh(new THREE.BoxGeometry(1.3, 0.02, 0.02), M.gold, -0.1, 0.27, -0.5));

    // RF 盒屏蔽罩底座（右上）
    g.add(mesh(new THREE.BoxGeometry(0.5, 0.03, 0.3), M.silver, 0.72, 0.045, -0.42));

    // 小散件
    for (var i = 0; i < 10; i++) {
      g.add(mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.03, 8), M.dark, -0.85 + (i % 5) * 0.42, 0.05, 0.25 + Math.floor(i / 5) * 0.16));
    }
    // 前缘 15-PIN 扩展端口（针脚 + 丝印）
    g.add(mesh(new THREE.BoxGeometry(0.5, 0.02, 0.05), M.gold, 0.72, 0.032, 0.62));
    for (var e = 0; e < 15; e++) {
      g.add(mesh(new THREE.BoxGeometry(0.014, 0.022, 0.03), M.gold, 0.49 + e * 0.032, 0.05, 0.62));
    }

    scene.add(boardGroup);

    LS8.Scene3D = {
      scene: scene, camera: camera, renderer: renderer,
      board: boardGroup, mesh: mesh, M: M,
      setFanSpeed: function () { /* 无旋转件 */ }
    };
  }

  function update() { /* 无 */ }

  LS8.SceneInit = init;
  LS8.SceneUpdate = update;
})(window.LS8 = window.LS8 || {});
