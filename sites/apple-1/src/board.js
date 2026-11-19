/* 场景：渲染器 / 灯光 / 木桌 / 深蓝垫 / Apple I 裸 FR-4 主板（无丝印） */
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
      stops: ["#f8e3e0", "#f6ecdb", "#e3e8ef", "#eae0ee"],
      blobs: [
        [205, 102, 240, "rgba(245,170,160,0.45)"],
        [819, 153, 260, "rgba(240,205,170,0.45)"]
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
      map: LS8.Textures.mat({ title: "APPLE 1 BENCH MAT · 60 x 40" }),
      roughness: 0.82
    });
    var sideMat = new THREE.MeshStandardMaterial({ color: 0x16233f, roughness: 0.85 });
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
    M.white = new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.4 });
    M.chip = new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.4, metalness: 0.2 });
    M.cream = new THREE.MeshStandardMaterial({
      map: LS8.Textures.makeTex(512, 384, function (ctx, w, h) {
        /* 裸 FR-4（无阻焊无丝印，真实 Apple I 即是如此）：棕褐底 + 正交铜箔走线 */
        ctx.fillStyle = "#cdb98c";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "rgba(96, 70, 38, 0.5)";
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        var seed = 11;
        function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
        for (var i = 0; i < 26; i++) {
          ctx.beginPath();
          var x = rnd() * w, y = rnd() * h;
          ctx.moveTo(x, y);
          for (var s = 0; s < 3; s++) {
            /* 严格曼哈顿长走线 */
            if (s % 2 === 0) x += (rnd() > 0.5 ? 1 : -1) * (60 + rnd() * 150);
            else y += (rnd() > 0.5 ? 1 : -1) * (40 + rnd() * 110);
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        /* 镀锡焊点 */
        for (var d = 0; d < 90; d++) {
          ctx.fillStyle = "rgba(226, 216, 196, 0.75)";
          ctx.beginPath(); ctx.arc(rnd() * w, rnd() * h, 2.2, 0, Math.PI * 2); ctx.fill();
        }
      }, { repeat: [1, 1] }),
      roughness: 0.65
    });

    /* ---- Apple I 主板（静态） ---- */
    var boardGroup = new THREE.Group();
    boardGroup.position.set(0.05, 0.095, 0.1);
    boardGroup.rotation.y = 0.02;
    var g = boardGroup;

    var pcbBase = mesh(new THREE.BoxGeometry(2.45, 0.04, 1.58), M.cream, 0, 0.02, 0);
    g.add(pcbBase);

    // RAM 插座阵列：2 排 × 8 座（真实布局：一排插 8 颗 MK4096，一排留作扩展）
    for (var r = 0; r < 2; r++) {
      for (var c = 0; c < 8; c++) {
        g.add(mesh(new THREE.BoxGeometry(0.17, 0.02, 0.07), M.dark, -0.85 + c * 0.225, 0.05, 0.3 + r * 0.25));
      }
    }
    // 零散小件
    for (var i = 0; i < 10; i++) {
      g.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 8), M.dark, -1.05 + (i % 5) * 0.5, 0.05, 0.35 + Math.floor(i / 5) * 0.12));
    }
    // 底边 44 金手指底座
    g.add(mesh(new THREE.BoxGeometry(2.0, 0.02, 0.07), M.gold, 0, 0.035, 0.72));

    scene.add(boardGroup);

    LS8.Scene3D = {
      scene: scene, camera: camera, renderer: renderer,
      board: boardGroup, mesh: mesh, M: M,
      setFanSpeed: function () { /* 无风扇 */ }
    };
  }

  function update() { /* 无旋转件 */ }

  LS8.SceneInit = init;
  LS8.SceneUpdate = update;
})(window.LS8 = window.LS8 || {});
