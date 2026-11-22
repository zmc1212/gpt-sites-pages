/* 场景：渲染器 / 灯光 / 木桌 / 黑色垫 / Altair 蓝色机箱 + S-100 主板 */
(function (LS8) {
  var M = {};
  var fanBlades = null;
  var fanSpeed = 0;

  function mesh(geo, mat, x, y, z, cast, receive) {
    var m = new THREE.Mesh(geo, mat);
    if (x !== undefined) m.position.set(x, y, z);
    m.castShadow = cast !== false;
    m.receiveShadow = receive !== false;
    return m;
  }

  /* 前面板 LED 画布（3D 机箱面板 + 仪表盘共用绘制逻辑）——36 颗 LED 布局照真实面板 */
  var panel = LS8.Textures.dynamic(512, 160);

  var STATUS_NAMES = ["MEMR", "INP", "M1", "OUT", "HLTA", "STACK", "WO", "INT"];
  var INDI_NAMES = ["INTE", "PROT", "WAIT", "HLDA"];

  function drawPanel(addr, data, power, run, status) {
    var ctx = panel.ctx, W = panel.w, H = panel.h;
    ctx.fillStyle = "#101216";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "bold 15px monospace";
    ctx.fillText("MITS", 14, 22);
    ctx.font = "11px monospace";
    ctx.fillText("ALTAIR 8800", 60, 22);
    var st = status || 0;
    /* 状态行：8 颗红 LED（MEMR INP M1 OUT HLTA STACK WO INT） */
    ctx.font = "9px monospace";
    STATUS_NAMES.forEach(function (n, s) {
      var on = power && ((st >> s) & 1);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(n, 176 + s * 28, 36);
      ctx.fillStyle = on ? "#ff3b30" : "#3a1210";
      if (on) { ctx.shadowColor = "rgba(255,59,48,0.9)"; ctx.shadowBlur = 6; }
      ctx.fillRect(176 + s * 28, 40, 18, 8);
      ctx.shadowBlur = 0;
    });
    /* 指示灯行：INTE PROT WAIT HLDA（运行时 WAIT 亮，无绿色 RUN 灯） */
    INDI_NAMES.forEach(function (n, s) {
      var on = power && ((st >> (8 + s)) & 1);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(n, 176 + s * 28, 60);
      ctx.fillStyle = on ? "#ff3b30" : "#3a1210";
      if (on) { ctx.shadowColor = "rgba(255,59,48,0.9)"; ctx.shadowBlur = 6; }
      ctx.fillRect(176 + s * 28, 64, 18, 8);
      ctx.shadowBlur = 0;
    });
    var rows = [
      { y: 96, bits: (addr >> 8) & 0xff, label: "A15-8", hex: (addr >> 8).toString(16).toUpperCase().padStart(2, "0") },
      { y: 118, bits: addr & 0xff, label: "A7-0", hex: (addr & 0xff).toString(16).toUpperCase().padStart(2, "0") },
      { y: 140, bits: data & 0xff, label: "D7-0", hex: (data & 0xff).toString(16).toUpperCase().padStart(2, "0") }
    ];
    rows.forEach(function (r, ri) {
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = "10px monospace";
      ctx.fillText(r.label, 130, r.y - 2);
      for (var b = 0; b < 8; b++) {
        var on = power && ((r.bits >> (7 - b)) & 1);
        ctx.fillStyle = on ? "#ff3b30" : "#3a1210";
        if (on) { ctx.shadowColor = "rgba(255,59,48,0.9)"; ctx.shadowBlur = 8; }
        ctx.fillRect(176 + b * 30, r.y - 12, 18, 14);
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "bold 13px monospace";
      ctx.fillText(r.hex, 428, r.y);
    });
    /* 开关排丝印（真实面板 25 个球头拨动开关的标牌文字） */
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "9px monospace";
    ctx.fillText("25 TOGGLE SWITCHES · RUN/STOP · SINGLE STEP · EXAMINE/NEXT · DEPOSIT/NEXT · RESET/CLR · PROTECT/UNPROTECT · AUX", 14, 157);
    panel.tex.needsUpdate = true;
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
      stops: ["#dfe9f6", "#e9eef4", "#dfe4f0", "#e4e0ef"],
      blobs: [
        [205, 102, 240, "rgba(150,180,235,0.5)"],
        [819, 153, 260, "rgba(190,200,240,0.45)"],
        [512, 71, 200, "rgba(200,180,235,0.4)"]
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

    /* 木桌 */
    var desk = new THREE.Mesh(
      new THREE.PlaneGeometry(46, 46),
      new THREE.MeshStandardMaterial({ map: LS8.Textures.wood(), roughness: 0.92 })
    );
    desk.rotation.x = -Math.PI / 2;
    desk.receiveShadow = true;
    scene.add(desk);

    /* 黑色垫 */
    var topMat = new THREE.MeshStandardMaterial({
      map: LS8.Textures.mat({ a: "#171a22", b: "#101219", grid: "rgba(150,160,180,0.13)", grid2: "rgba(160,170,190,0.22)", tick: "rgba(200,210,225,0.4)", title: "S-100 BENCH MAT · 60 x 40" }),
      roughness: 0.82
    });
    var sideMat = new THREE.MeshStandardMaterial({ color: 0x0c0e14, roughness: 0.85 });
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
    M.copper = new THREE.MeshStandardMaterial({ color: 0xb0703c, metalness: 0.8, roughness: 0.4 });
    M.navy = new THREE.MeshStandardMaterial({ color: 0x2a3a66, roughness: 0.5 });
    M.pink = new THREE.MeshStandardMaterial({ color: 0xe84f8e, roughness: 0.5 });
    M.white = new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.4 });
    M.chip = new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.4, metalness: 0.2 });
    M.caseBlue = new THREE.MeshStandardMaterial({ color: 0x2e5f9e, roughness: 0.45, metalness: 0.15 });
    M.pcbGreen = new THREE.MeshStandardMaterial({ map: LS8.Textures.pcb("#2a5c3c", "rgba(12,34,22,0.55)", "ALTAIR 8800", "S-100 MAIN BOARD"), roughness: 0.6 });
    M.panelFace = new THREE.MeshStandardMaterial({ map: panel.tex, roughness: 0.4, emissiveMap: panel.tex, emissive: 0xffffff, emissiveIntensity: 0.55 });

    /* ---- Altair 机箱（静态，开口顶盖） ---- */
    var boardGroup = new THREE.Group();
    boardGroup.position.set(0.62, 0.093, -0.05);
    boardGroup.rotation.y = -0.04;
    var g = boardGroup;

    // 底板
    g.add(mesh(new THREE.BoxGeometry(2.5, 0.06, 1.15), M.caseBlue, 0, 0.03, 0));
    // 四壁（顶盖开口）
    g.add(mesh(new THREE.BoxGeometry(2.5, 0.5, 0.05), M.caseBlue, 0, 0.28, -0.55));   // 后
    g.add(mesh(new THREE.BoxGeometry(0.05, 0.5, 1.15), M.caseBlue, -1.225, 0.28, 0)); // 左
    g.add(mesh(new THREE.BoxGeometry(0.05, 0.5, 1.15), M.caseBlue, 1.225, 0.28, 0));  // 右
    // 前壁：上沿 + 下沿，中间留给面板
    g.add(mesh(new THREE.BoxGeometry(2.5, 0.08, 0.05), M.caseBlue, 0, 0.06, 0.55));
    g.add(mesh(new THREE.BoxGeometry(2.5, 0.06, 0.05), M.caseBlue, 0, 0.52, 0.55));

    // S-100 主板（横躺机箱底部）
    var main = mesh(new THREE.BoxGeometry(2.3, 0.03, 0.95), M.pcbGreen, 0, 0.09, -0.02);
    g.add(main);
    // 主板上预置小元件
    for (var i = 0; i < 8; i++) {
      g.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.035, 8), M.dark, -1.0 + i * 0.27, 0.115, 0.32));
    }
    // 18 个 S-100 插槽（真实 Altair 主板为 18 槽，底座接线 4 槽 + 扩展板）
    for (var s = 0; s < 18; s++) {
      g.add(mesh(new THREE.BoxGeometry(0.04, 0.12, 0.85), M.plastic, -1.05 + s * 0.124, 0.155, -0.02));
    }

    // 面板占位（面板零件飞入后贴合）
    var face = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.42, 0.03), M.panelFace);
    face.position.set(0, 0.29, 0.555);
    face.castShadow = false;
    g.add(face);
    g.userData.panelFace = face;

    // 面板两侧蓝框
    g.add(mesh(new THREE.BoxGeometry(0.62, 0.42, 0.04), M.caseBlue, -0.92, 0.29, 0.55));
    g.add(mesh(new THREE.BoxGeometry(0.62, 0.42, 0.04), M.caseBlue, 0.92, 0.29, 0.55));

    scene.add(boardGroup);

    LS8.Scene3D = {
      scene: scene, camera: camera, renderer: renderer,
      board: boardGroup, mesh: mesh, M: M,
      setFanSpeed: function (s) { fanSpeed = s; },
      drawPanel: drawPanel,
      panel: panel
    };
  }

  function update(dt) {
    if (fanBlades && fanSpeed > 0) fanBlades.rotation.y += fanSpeed * dt;
  }

  LS8.SceneInit = init;
  LS8.SceneUpdate = update;
})(window.LS8 = window.LS8 || {});
