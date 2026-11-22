/* 相机零件建模 + 飞行装配控制器 + 机构动态 API（帘幕/光圈/镜筒/胶片/后盖…） */
(function (RF35) {
  var list = [];          // {id,name,sub,group,pos,flyPhase,delay,duration,...}
  var root = null;
  var seatedCount = 0;
  var flying = false, t0 = 0, flyPhaseNow = -1;
  var ghostMeshes = [];
  var gmChrome, gmBrushed, gmLeather, gmDark;   // 剖视幽灵材质
  var dyn = {};           // 机构动态引用

  var CLOTH_MAX = 0.30;   // 帘幕行程半径（帘全展覆盖 ±0.30）

  /* ---------- 计数窗动态贴图 ---------- */
  var cntCv = document.createElement("canvas");
  cntCv.width = 128; cntCv.height = 128;
  var cntTex = new THREE.CanvasTexture(cntCv);
  cntTex.anisotropy = 8;
  cntTex.encoding = THREE.sRGBEncoding;
  function drawCounter(n) {
    var ctx = cntCv.getContext("2d");
    ctx.fillStyle = "#EFE9DB";
    ctx.beginPath(); ctx.arc(64, 64, 62, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#26241F"; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(64, 64, 57, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#C75B39";
    ctx.font = "bold 62px monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(String(Math.min(36, Math.max(0, n | 0))), 64, 70);
    ctx.fillStyle = "rgba(38,36,31,0.55)";
    ctx.font = "13px monospace";
    ctx.fillText("FRAME", 64, 32);
    cntTex.needsUpdate = true;
  }

  /* ---------- 工具 ---------- */
  function mesh(geo, mat, x, y, z, ghost) {
    var m = new THREE.Mesh(geo, mat);
    if (x !== undefined) m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    if (ghost) ghostMeshes.push(m);
    return m;
  }

  function roundedRectShape(w, h, r) {
    var s = new THREE.Shape();
    var x = w / 2, y = h / 2;
    s.moveTo(-x + r, -y);
    s.lineTo(x - r, -y);
    s.absarc(x - r, -y + r, r, -Math.PI / 2, 0, false);
    s.lineTo(x, y - r);
    s.absarc(x - r, y - r, r, 0, Math.PI / 2, false);
    s.lineTo(-x + r, y);
    s.absarc(-x + r, y - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(-x, -y + r);
    s.absarc(-x + r, -y + r, r, Math.PI, Math.PI * 1.5, false);
    return s;
  }

  /* 圆孔洞 */
  function holePath(cx, cy, r) {
    var p = new THREE.Path();
    p.absarc(cx, cy, r, 0, Math.PI * 2, true);
    return p;
  }

  /* 弧面透镜：绕 Y 车削后转到 Z 轴 */
  function lensGeo(r, sag) {
    var pts = [
      new THREE.Vector2(0, sag),
      new THREE.Vector2(r * 0.45, sag * 0.75),
      new THREE.Vector2(r * 0.85, sag * 0.28),
      new THREE.Vector2(r, 0),
      new THREE.Vector2(r * 0.85, -sag * 0.28),
      new THREE.Vector2(r * 0.45, -sag * 0.75),
      new THREE.Vector2(0, -sag)
    ];
    var g = new THREE.LatheGeometry(pts, 30);
    g.rotateX(Math.PI / 2);
    return g;
  }

  /* 沿路径的胶片带（垂直宽度，v 向重复贴图） */
  function ribbonGeom(pts, width, vRep) {
    var curve = new THREE.CatmullRomCurve3(pts);
    var N = 100, pos = [], uvs = [], idx = [];
    for (var i = 0; i <= N; i++) {
      var t = i / N;
      var p = curve.getPoint(t);
      pos.push(p.x, p.y - width / 2, p.z, p.x, p.y + width / 2, p.z);
      uvs.push(0, t * vRep, 1, t * vRep);
    }
    for (var s = 0; s < N; s++) {
      var a = s * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx);
    return { geo: g, segs: N };
  }

  function smooth(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }

  /* ============ 零件建模 ============ */
  function build() {
    var M = RF35.Scene3D.M, T = RF35.Textures, defs = [];
    var knurlSilver = new THREE.MeshStandardMaterial({ map: T.knurl("#B9BCC2", "rgba(60,64,70,0.55)"), metalness: 0.75, roughness: 0.42 });
    var knurlDark = new THREE.MeshStandardMaterial({ map: T.knurl("#2B2C2F", "rgba(0,0,0,0.6)"), metalness: 0.5, roughness: 0.55 });
    var clothMat = new THREE.MeshStandardMaterial({ map: T.cloth(), roughness: 0.92, side: THREE.DoubleSide });
    var dialFaceMat = new THREE.MeshStandardMaterial({ map: T.dialFace(), roughness: 0.55 });
    var ringTextMat = new THREE.MeshStandardMaterial({ map: T.ringText(), metalness: 0.5, roughness: 0.5 });
    var filmMat = new THREE.MeshStandardMaterial({ map: T.filmTex(), roughness: 0.55, side: THREE.DoubleSide });

    function def(id, name, sub, pos, flyPhase, delay, anchorY, buildFn, hidden) {
      var g = buildFn();
      g.position.set(pos[0], pos[1], pos[2]);
      g.userData.tagAnchor = new THREE.Vector3(0, anchorY, 0);
      root.add(g);
      defs.push({ id: id, name: name, sub: sub, group: g, flyPhase: flyPhase, delay: delay, hidden: !!hidden });
    }

    /* ---- 1 · 机身铸件（侧壁 / 底板 / 内腔 / 前脸饰皮开孔） ---- */
    def("shell", "BODY CASTING", "chrome · vulcanite wrap", [0, 0, 0], 0, 0, 0.55, function () {
      var g = new THREE.Group();
      var wallGeo = new THREE.BoxGeometry(0.04, 0.60, 0.38);
      g.add(mesh(wallGeo, gmChrome, -0.70, 0.44, 0, true));
      g.add(mesh(wallGeo, gmChrome, 0.70, 0.44, 0, true));
      g.add(mesh(new THREE.BoxGeometry(1.40, 0.03, 0.38), gmChrome, 0, 0.155, 0, true));   // 底板
      g.add(mesh(new THREE.BoxGeometry(1.32, 0.02, 0.34), gmDark, 0, 0.185, 0, true));      // 内腔地板
      // 分仓隔板（上下留出胶片通道）
      g.add(mesh(new THREE.BoxGeometry(0.02, 0.22, 0.34), gmDark, 0.38, 0.61, 0, true));
      g.add(mesh(new THREE.BoxGeometry(0.02, 0.14, 0.34), gmDark, 0.38, 0.21, 0, true));
      g.add(mesh(new THREE.BoxGeometry(0.02, 0.22, 0.34), gmDark, -0.38, 0.61, 0, true));
      g.add(mesh(new THREE.BoxGeometry(0.02, 0.14, 0.34), gmDark, -0.38, 0.21, 0, true));
      // 前脸：饰皮面板（Extrude 开孔：取景 / 测距 / 镜头）
      var face = roundedRectShape(1.44, 0.60, 0.10);
      face.holes.push(holePath(-0.45, 0.16, 0.056));
      face.holes.push(holePath(-0.30, 0.16, 0.056));
      face.holes.push(holePath(0, -0.02, 0.176));
      var faceGeo = new THREE.ExtrudeGeometry(face, { depth: 0.02, bevelEnabled: false });
      var fm = mesh(faceGeo, gmLeather, 0, 0.44, 0.185, true);
      g.add(fm);
      // 挂绳耳
      var lugGeo = new THREE.CylinderGeometry(0.018, 0.024, 0.05, 10);
      var lug1 = mesh(lugGeo, gmChrome, -0.755, 0.62, 0, true); lug1.rotation.z = Math.PI / 2;
      var lug2 = mesh(lugGeo, gmChrome, 0.755, 0.62, 0, true); lug2.rotation.z = Math.PI / 2;
      g.add(lug1); g.add(lug2);
      return g;
    });

    /* ---- 2 · 胶片轨距框 ---- */
    def("gate", "FILM GATE", "24 × 36 MM", [0, 0, 0], 0, 0.5, 0.44, function () {
      var g = new THREE.Group();
      var railGeo = new THREE.BoxGeometry(0.05, 0.30, 0.02);
      g.add(mesh(railGeo, M.alu, -0.205, 0.40, -0.035));
      g.add(mesh(railGeo, M.alu, 0.205, 0.40, -0.035));
      var barGeo = new THREE.BoxGeometry(0.44, 0.035, 0.02);
      g.add(mesh(barGeo, M.alu, 0, 0.545, -0.035));
      g.add(mesh(barGeo, M.alu, 0, 0.255, -0.035));
      return g;
    });

    /* ---- 3 · 顶盖（拉丝铬） ---- */
    def("topplate", "TOP PLATE", "brass · chrome finish", [0, 0, 0], 0, 1.0, 0.86, function () {
      var g = new THREE.Group();
      g.add(mesh(new THREE.BoxGeometry(1.48, 0.08, 0.42), gmBrushed, 0, 0.78, 0, true));
      var eng = new THREE.MeshStandardMaterial({ map: RF35.Textures.engraving(), transparent: true, roughness: 0.7 });
      var e = mesh(new THREE.PlaneGeometry(0.72, 0.135), eng, -0.18, 0.762, 0.212);
      e.castShadow = false;
      g.add(e);
      return g;
    });

    /* ---- 4 · 热靴 ---- */
    def("hotshoe", "HOT SHOE", "flash contact", [0, 0, 0], 0, 1.6, 0.88, function () {
      var g = new THREE.Group();
      var sy = 0.842;
      g.add(mesh(new THREE.BoxGeometry(0.02, 0.032, 0.15), gmChrome, -0.095, sy, -0.02, true));
      g.add(mesh(new THREE.BoxGeometry(0.02, 0.032, 0.15), gmChrome, 0.095, sy, -0.02, true));
      g.add(mesh(new THREE.BoxGeometry(0.21, 0.032, 0.02), gmChrome, 0, sy, -0.10, true));
      g.add(mesh(new THREE.BoxGeometry(0.21, 0.032, 0.02), gmChrome, 0, sy, 0.06, true));
      g.add(mesh(new THREE.BoxGeometry(0.03, 0.006, 0.09), gmDark, 0, 0.858, -0.02, true));
      return g;
    });

    /* ---- 5 · 快门按钮（橙红） ---- */
    def("shutterbtn", "SHUTTER RELEASE", "orange · screw-in", [0, 0, 0], 0, 2.0, 0.88, function () {
      var g = new THREE.Group();
      g.add(mesh(new THREE.CylinderGeometry(0.052, 0.056, 0.014, 20), gmChrome, -0.52, 0.827, 0.10, true));
      dyn.btn = mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.02, 18), M.orange, -0.52, 0.842, 0.10);
      dyn.btnBaseY = 0.842;
      g.add(dyn.btn);
      return g;
    });

    /* ---- 6/7 · 帘幕卷轴 A/B（竖轴） ---- */
    function drum() {
      return function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.36, 16), M.alu, 0, 0, 0));
        g.add(mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.008, 20), M.dark, 0, 0.18, 0));
        g.add(mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.008, 20), M.dark, 0, -0.18, 0));
        g.add(mesh(new THREE.BoxGeometry(0.03, 0.06, 0.12), M.dark, 0, 0.235, 0));
        g.add(mesh(new THREE.BoxGeometry(0.03, 0.06, 0.12), M.dark, 0, -0.235, 0));
        return g;
      };
    }
    def("spoolA", "CURTAIN DRUM · A", "second curtain", [-0.31, 0.42, 0.085], 1, 0, 0.25, drum(-0.31, 0.085));
    def("spoolB", "CURTAIN DRUM · B", "first curtain", [0.31, 0.42, 0.115], 1, 0.4, 0.25, drum(0.31, 0.115));
    dyn.spoolA = list0(defs, "spoolA");
    dyn.spoolB = list0(defs, "spoolB");

    /* ---- 8 · 布帘双帘 ---- */
    def("cloth", "CLOTH SHUTTER", "rubberized twin curtains", [0, 0, 0], 1, 0.9, 0.46, function () {
      var g = new THREE.Group();
      var geo1 = new THREE.PlaneGeometry(0.60, 0.34);
      geo1.translate(-0.30, 0, 0);        // 原点在右缘（锚在 B 轴）
      dyn.curtain1 = new THREE.Mesh(geo1, clothMat);
      dyn.curtain1.position.set(0.30, 0.42, 0.115);
      dyn.curtain1.castShadow = true;
      var geo2 = new THREE.PlaneGeometry(0.60, 0.34);
      geo2.translate(0.30, 0, 0);         // 原点在左缘（锚在 A 轴）
      dyn.curtain2 = new THREE.Mesh(geo2, clothMat);
      dyn.curtain2.position.set(-0.30, 0.42, 0.085);
      dyn.curtain2.castShadow = true;
      g.add(dyn.curtain1); g.add(dyn.curtain2);
      return g;
    });

    /* ---- 9 · 速度盘 ---- */
    def("speeddial", "SPEED DIAL", "B · 1 → 1/1000", [0, 0, 0], 1, 2.6, 0.90, function () {
      var g = new THREE.Group();
      g.add(mesh(new THREE.CylinderGeometry(0.148, 0.148, 0.018, 28), gmChrome, 0.18, 0.835, 0.02, true));
      dyn.dial = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.05, 28),
        [knurlDark, dialFaceMat, M.dark]
      );
      dyn.dial.position.set(0.18, 0.865, 0.02);
      dyn.dial.castShadow = true;
      g.add(dyn.dial);
      var pt = mesh(new THREE.BoxGeometry(0.014, 0.016, 0.05), M.orange, 0.325, 0.852, 0.02);
      g.add(pt);
      return g;
    });

    /* ---- 10 · 过片扳手 ---- */
    def("advance", "ADVANCE LEVER", "130° throw", [-0.45, 0.835, 0.0], 2, 0, 0.06, function () {
      var g = new THREE.Group();
      g.add(mesh(new THREE.CylinderGeometry(0.058, 0.062, 0.03, 22), M.chrome, 0, 0, 0));
      // 弧形杆：环形扇面挤出
      var s = new THREE.Shape();
      s.absarc(0, 0, 0.235, Math.PI * 0.62, Math.PI * 1.08, false);
      s.absarc(0, 0, 0.075, Math.PI * 1.08, Math.PI * 0.62, true);
      var armGeo = new THREE.ExtrudeGeometry(s, { depth: 0.018, bevelEnabled: false });
      var arm = mesh(armGeo, M.chrome, 0, 0.012, -0.02);
      arm.rotation.x = -Math.PI / 2;
      g.add(arm);
      var tip = mesh(new THREE.BoxGeometry(0.055, 0.016, 0.04), knurlDark, 0, 0.03, -0.245);
      g.add(tip);
      dyn.lever = g;
      return g;
    });

    /* ---- 11 · 计数窗 ---- */
    def("counter", "FRAME COUNTER", "0 → 36", [0, 0, 0], 2, 0.6, 0.90, function () {
      var g = new THREE.Group();
      g.add(mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.012, 20), M.chrome, 0.40, 0.826, 0.12));
      dyn.counterDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.038, 0.038, 0.014, 20),
        [M.dark, new THREE.MeshStandardMaterial({ map: cntTex, roughness: 0.5 }), M.dark]
      );
      dyn.counterDisc.position.set(0.40, 0.832, 0.12);
      g.add(dyn.counterDisc);
      return g;
    });

    /* ---- 12 · 倒片旋钮 ---- */
    def("rewind", "REWIND KNOB", "fold crank", [0.55, 0, -0.08], 2, 1.2, 0.92, function () {
      var g = new THREE.Group();
      g.add(mesh(new THREE.CylinderGeometry(0.075, 0.08, 0.05, 24), knurlSilver, 0, 0.805, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.05, 14), M.chrome, 0, 0.845, 0));
      var arm = mesh(new THREE.BoxGeometry(0.016, 0.05, 0.02), M.chrome, 0, 0.875, 0.045);
      g.add(arm);
      g.add(mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.014, 14), knurlSilver, 0, 0.905, 0.055));
      return g;
    });

    /* ---- 13/14 · 取景窗 / 测距窗 ---- */
    def("vf", "VIEWFINDER", "bright-line 35", [0, 0, 0], 3, 0, 0.60, function () {
      var g = new THREE.Group();
      var ring = mesh(new THREE.TorusGeometry(0.054, 0.011, 10, 26), M.chrome, -0.45, 0.56, 0.214);
      ring.rotation.x = Math.PI / 2;
      g.add(ring);
      var glass = mesh(new THREE.CircleGeometry(0.052, 26), M.glass, -0.45, 0.56, 0.216);
      glass.castShadow = false;
      g.add(glass);
      return g;
    });
    def("rf", "RANGEFINDER", "coupled patch", [0, 0, 0], 3, 0.5, 0.60, function () {
      var g = new THREE.Group();
      var ring = mesh(new THREE.TorusGeometry(0.054, 0.011, 10, 26), M.chrome, -0.30, 0.56, 0.214);
      ring.rotation.x = Math.PI / 2;
      g.add(ring);
      var glass = mesh(new THREE.CircleGeometry(0.052, 26), M.glassPurple, -0.30, 0.56, 0.216);
      glass.castShadow = false;
      g.add(glass);
      return g;
    });

    /* ---- 15 · 黄斑联动杆组 ×3 ---- */
    def("linkage", "RF LINKAGE", "3-lever train", [0, 0, 0], 3, 1.1, 0.60, function () {
      var g = new THREE.Group();
      dyn.levers = [];
      var spots = [[-0.42, 0.56, 0.08, 0.10], [-0.30, 0.50, 0.11, 0.085], [-0.22, 0.62, 0.13, 0.075]];
      for (var i = 0; i < 3; i++) {
        var piv = new THREE.Group();
        piv.position.set(spots[i][0], spots[i][1], spots[i][2]);
        var hub = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.024, 10), M.brass, 0, 0, 0);
        piv.add(hub);
        var arm = mesh(new THREE.BoxGeometry(spots[i][3], 0.012, 0.016), M.brass, spots[i][3] / 2, 0.004, 0);
        piv.add(arm);
        piv.rotation.y = i * 1.15;
        piv.userData.baseY = i * 1.15;
        dyn.levers.push(piv);
        g.add(piv);
      }
      return g;
    });

    /* ---- 16 · 镜筒（三级伸缩） ---- */
    def("barrel", "LENS BARREL", "3-stage draw · M mount", [0, 0.40, 0], 4, 0, 0.24, function () {
      var g = new THREE.Group();
      g.add(mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.024, 34).rotateX(Math.PI / 2), M.chrome, 0, 0, 0.212));
      g.add(mesh(new THREE.TorusGeometry(0.155, 0.01, 10, 34), M.dark, 0, 0, 0.226));
      g.add(mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.10, 34).rotateX(Math.PI / 2), M.chrome, 0, 0, 0.26));
      dyn.sections = [];
      function sec(r, len, fullZ, dz, mat) {
        var m = mesh(new THREE.CylinderGeometry(r, r, len, 34).rotateX(Math.PI / 2), mat, 0, 0, fullZ);
        g.add(m);
        dyn.sections.push({ obj: m, fullZ: fullZ, dz: dz });
        return m;
      }
      sec(0.142, 0.10, 0.36, 0.10, M.chrome);
      sec(0.128, 0.10, 0.46, 0.20, M.alu);
      var frontMat = [ringTextMat, M.chrome, M.chrome];
      var fr = new THREE.Mesh(new THREE.CylinderGeometry(0.118, 0.118, 0.045, 34).rotateX(Math.PI / 2), frontMat);
      fr.position.set(0, 0, 0.512);
      fr.castShadow = true;
      g.add(fr);
      dyn.sections.push({ obj: fr, fullZ: 0.512, dz: 0.20 });
      return g;
    });

    /* ---- 17 · 光圈环 ---- */
    def("apring", "APERTURE RING", "f/2 → f/16", [0, 0.40, 0], 4, 0.6, 0.50, function () {
      var g = new THREE.Group();
      var m = mesh(new THREE.CylinderGeometry(0.158, 0.158, 0.05, 34).rotateX(Math.PI / 2), knurlSilver, 0, 0, 0.36);
      g.add(m);
      g.add(mesh(new THREE.BoxGeometry(0.012, 0.05, 0.02), M.orange, 0.158, 0, 0.352));
      dyn.sections.push({ obj: m, fullZ: 0.36, dz: 0.10 });
      return g;
    });

    /* ---- 18 · 对焦环 ---- */
    def("fring", "FOCUS RING", "0.9 M → ∞", [0, 0.40, 0], 4, 1.0, 0.50, function () {
      var g = new THREE.Group();
      var m = mesh(new THREE.CylinderGeometry(0.138, 0.138, 0.055, 34).rotateX(Math.PI / 2), knurlDark, 0, 0, 0.46);
      g.add(m);
      dyn.sections.push({ obj: m, fullZ: 0.46, dz: 0.20 });
      dyn.fring = m;
      return g;
    });

    /* ---- 19 · 光圈叶片 ×8 ---- */
    def("iris", "IRIS", "8 blades", [0, 0.40, 0], 4, 1.4, 0.44, function () {
      var g = new THREE.Group();
      g.add(mesh(new THREE.TorusGeometry(0.132, 0.008, 8, 30), M.dark, 0, 0, 0.205));
      dyn.blades = [];
      for (var i = 0; i < 8; i++) {
        var bgeo = new THREE.BoxGeometry(0.20, 0.05, 0.0035);
        bgeo.translate(0.10, 0, 0);
        var b = mesh(bgeo, M.blade, Math.cos(i * Math.PI / 4) * 0.125, Math.sin(i * Math.PI / 4) * 0.125, 0.205 + (i % 2) * 0.004 - 0.002);
        b.userData.theta = i * Math.PI / 4;
        b.castShadow = false;
        dyn.blades.push(b);
        g.add(b);
      }
      return g;
    });

    /* ---- 20-25 · 六片镜片（前后组交替飞入） ---- */
    var els = [
      ["el1", "ELEMENT 1", "front · blue coat", 0.125, 0.030, 0.44, M.glassBlue, 1.9, 0.20],
      ["el2", "ELEMENT 2", "front group", 0.105, 0.022, 0.37, M.glass, 3.0, 0.15],
      ["el3", "ELEMENT 3", "front · violet coat", 0.135, 0.034, 0.30, M.glassPurple, 4.1, 0.10],
      ["el4", "ELEMENT 4", "rear group", 0.115, 0.024, 0.145, M.glass, 2.45, 0],
      ["el5", "ELEMENT 5", "rear group", 0.100, 0.020, 0.065, M.glass, 3.55, 0],
      ["el6", "ELEMENT 6", "rear · blue coat", 0.125, 0.030, -0.01, M.glassBlue, 4.65, 0]
    ];
    els.forEach(function (e) {
      def(e[0], e[1], e[2], [0, 0.40, 0], 4, e[7], 0.42, function () {
        var g = new THREE.Group();
        var m = mesh(lensGeo(e[3], e[4]), e[6], 0, 0, e[5]);
        m.castShadow = false;
        g.add(m);
        if (e[8] > 0) dyn.sections.push({ obj: m, fullZ: e[5], dz: e[8] });
        return g;
      });
    });

    /* ---- 26 · 胶卷暗盒 ---- */
    def("cassette", "FILM CASSETTE", "135 · 36 EXP", [0.48, 0.40, -0.02], 5, 0.9, 0.30, function () {
      var g = new THREE.Group();
      g.add(mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.34, 26), M.alu, 0, 0, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.106, 0.106, 0.012, 26), M.chrome, 0, -0.175, 0));
      dyn.casSpool = mesh(new THREE.CylinderGeometry(0.086, 0.086, 0.014, 20), M.dark, 0, 0.172, 0);
      g.add(dyn.casSpool);
      g.add(mesh(new THREE.TorusGeometry(0.105, 0.007, 8, 26), M.felt, 0, 0.15, 0).rotateX(Math.PI / 2));
      g.add(mesh(new THREE.BoxGeometry(0.05, 0.16, 0.004), M.orange, 0.07, 0.02, 0.106));
      return g;
    });

    /* ---- 27 · 卷片轴 ---- */
    def("spoolT", "TAKE-UP SPOOL", "wind core", [-0.48, 0.42, -0.02], 5, 1.5, 0.20, function () {
      var g = new THREE.Group();
      dyn.spoolT = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.30, 18), M.dark, 0, 0, 0);
      g.add(dyn.spoolT);
      g.add(mesh(new THREE.CylinderGeometry(0.074, 0.074, 0.006, 22), M.alu, 0, 0.152, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.074, 0.074, 0.006, 22), M.alu, 0, -0.152, 0));
      return g;
    });

    /* ---- 28 · 压片板（装在后盖内侧，随门开合） ---- */
    def("plate", "PRESSURE PLATE", "film flatness", [0, 0.40, 0], 5, 2.1, 0.16, function () {
      var g = new THREE.Group();
      g.add(mesh(new THREE.BoxGeometry(0.36, 0.26, 0.010), M.alu, 0, 0, -0.095));
      g.add(mesh(new THREE.BoxGeometry(0.30, 0.03, 0.008), M.rubber, 0, 0.09, -0.106));
      g.add(mesh(new THREE.BoxGeometry(0.30, 0.03, 0.008), M.rubber, 0, -0.09, -0.106));
      return g;
    });

    /* ---- 29 · 后盖（铰链开合） ---- */
    def("backdoor", "BACK DOOR", "hinge · felt trap", [0, 0.155, -0.20], 5, 0, 0.30, function () {
      var g = new THREE.Group();      // 铰链轴在底部 y=0.155
      var panel = roundedRectShape(1.42, 0.58, 0.10);
      var pg = new THREE.ExtrudeGeometry(panel, { depth: 0.02, bevelEnabled: false });
      pg.rotateY(Math.PI);            // 翻转法线朝后
      var p = mesh(pg, gmChrome, 0, 0.285, 0, true);
      g.add(p);
      var inner = mesh(new THREE.PlaneGeometry(1.34, 0.50), gmLeather, 0, 0.285, 0.021, true);
      g.add(inner);
      g.add(mesh(new THREE.BoxGeometry(1.28, 0.02, 0.004), M.felt, 0, 0.505, 0.026));
      g.add(mesh(new THREE.BoxGeometry(1.28, 0.02, 0.004), M.felt, 0, 0.065, 0.026));
      var h1 = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 10), M.chrome, -0.35, 0, 0);
      h1.rotation.z = Math.PI / 2;
      var h2 = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 10), M.chrome, 0.35, 0, 0);
      h2.rotation.z = Math.PI / 2;
      g.add(h1); g.add(h2);
      dyn.doorPivot = g;
      return g;
    });

    /* ---- 30 · 胶片片头（沿路径的带状网格，feed 揭示） ---- */
    def("film", "FILM LEADER", "crosses the gate", [0, 0, 0], 5, 2.8, 0.56, function () {
      var g = new THREE.Group();
      var path = [
        new THREE.Vector3(0.475, 0.38, 0.082),    // 暗盒出口（前缘切点）
        new THREE.Vector3(0.40, 0.40, 0.06),
        new THREE.Vector3(0.32, 0.40, 0.005),
        new THREE.Vector3(0.24, 0.40, -0.045),
        new THREE.Vector3(0.10, 0.40, -0.062),
        new THREE.Vector3(0, 0.40, -0.062),
        new THREE.Vector3(-0.20, 0.40, -0.062),
        new THREE.Vector3(-0.36, 0.40, -0.048),
        new THREE.Vector3(-0.46, 0.40, -0.005),
        new THREE.Vector3(-0.525, 0.40, 0.035),   // 卷片轴切线进入
        new THREE.Vector3(-0.515, 0.40, -0.03),
        new THREE.Vector3(-0.47, 0.40, -0.062)
      ];
      var rb = ribbonGeom(path, 0.33, 5);
      dyn.filmMesh = new THREE.Mesh(rb.geo, filmMat);
      dyn.filmMesh.castShadow = true;
      dyn.filmSegs = rb.segs;
      dyn.filmMesh.geometry.setDrawRange(0, 0);
      g.add(dyn.filmMesh);
      return g;
    });

    // 压片板挂到后盖铰链上（门开时随动，贴合真实 M3 结构）
    var doorDef = null, plateDef = null;
    defs.forEach(function (d) {
      if (d.id === "backdoor") doorDef = d;
      if (d.id === "plate") plateDef = d;
    });
    if (doorDef && plateDef) {
      doorDef.group.add(plateDef.group);
      plateDef.group.position.set(0, 0.245, 0.105);   // 相对铰链：世界 (0,0.40,-0.095)
    }

    return defs;
  }

  function list0(defs, id) {
    for (var i = 0; i < defs.length; i++) if (defs[i].id === id) return defs[i].group;
    return null;
  }

  /* ============ 飞行控制 ============ */
  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function bez(p0, p1, p2, t) {
    var a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t;
    return new THREE.Vector3(
      a * p0.x + b * p1.x + c * p2.x,
      a * p0.y + b * p1.y + c * p2.y,
      a * p0.z + b * p1.z + c * p2.z
    );
  }

  function init() {
    root = new THREE.Group();
    RF35.Scene3D.scene.add(root);
    var M = RF35.Scene3D.M;
    function mkGhost(base) {
      var m = base.clone();
      m.transparent = false;
      m.opacity = 1;
      m.depthWrite = true;
      return m;
    }
    gmChrome = mkGhost(M.chrome);
    gmBrushed = mkGhost(M.brushed);
    gmLeather = mkGhost(M.leather);
    gmDark = mkGhost(M.dark);
    drawCounter(0);
    list = build();
    list.forEach(function (p, i) {
      p.duration = 1.1;
      p.target = p.group.position.clone();
      // 飞行起点（画面右上前外侧）
      p.start = new THREE.Vector3(
        p.target.x + 2.0 + (i % 5) * 0.35,
        p.target.y + 1.5 + (i % 4) * 0.30,
        p.target.z + 1.35 + (i % 3) * 0.5
      );
      p.mid = new THREE.Vector3(
        p.start.x + (p.target.x - p.start.x) * 0.45,
        p.target.y + 1.25 + (i % 3) * 0.3,
        p.start.z + (p.target.z - p.start.z) * 0.5 - 0.25
      );
      p.group.visible = false;
    });
    setCurtains(-CLOTH_MAX, -CLOTH_MAX);   // 初始：一帘展开遮住画窗
    setExtend(0);
    setAperture(1);
    setFeed(0);
    setDoor(0);
    setLever(0);
    setFocus(8);
    setDialAngle(0);
  }

  function begin(phase) {
    flyPhaseNow = phase;
    flying = true;
    t0 = 0;   // 飞行计时使用阶段内时间（timeline 传入的 pt）
    list.forEach(function (p) {
      if (p.flyPhase !== phase) return;
      p.sealed = false;
      p.landed = false; p.tagShown = false;
      p.group.visible = false;
      if (p.line) { RF35.Scene3D.scene.remove(p.line); p.line = null; }
      var pts = [];
      for (var i = 0; i <= 30; i++) pts.push(bez(p.start, p.mid, p.target, i / 30));
      var geo = new THREE.BufferGeometry().setFromPoints(pts);
      var line = new THREE.Line(geo, new THREE.LineDashedMaterial({
        color: 0xC75B39, dashSize: 0.09, gapSize: 0.06, transparent: true, opacity: 0.8
      }));
      line.computeLineDistances();
      RF35.Scene3D.scene.add(line);
      p.line = line;
      p.lineUntil = Infinity;
    });
  }

  function update(now) {
    if (!flying) return;
    list.forEach(function (p) {
      // 轨迹线过期清理（含已落位零件）
      if (p.line && now > p.lineUntil) {
        RF35.Scene3D.scene.remove(p.line);
        p.line.geometry.dispose(); p.line.material.dispose();
        p.line = null;
      }
      if (p.sealed || p.flyPhase !== flyPhaseNow) return;
      var t = (now - t0 - p.delay) / p.duration;
      if (t <= 0) return;
      if (!p.tagShown) {
        p.tagShown = true;
        p.group.visible = true;
        RF35.Labels.announce(p.id, p.group, p.name, p.sub, performance.now(), 2600);
      }
      var tt = easeInOut(Math.min(t, 1));
      var pos = bez(p.start, p.mid, p.target, tt);
      p.group.position.copy(pos);
      p.group.rotation.y = (1 - tt) * 0.9;
      if (t >= 1 && !p.landed) {
        p.landed = true;
        p.sealed = true;         // 落位即密封，避免飞行钉位覆盖机构旋转
        seatedCount++;
        p.lineUntil = now + 0.55;
        if (p.line) p.line.material.opacity = 0.8;
      }
    });
  }

  function reset() {
    flying = false; flyPhaseNow = -1; seatedCount = 0;
    list.forEach(function (p) {
      p.sealed = false;
      p.group.visible = false;
      if (p.line) { RF35.Scene3D.scene.remove(p.line); p.line = null; }
    });
    drawCounter(0);
    setCurtains(-CLOTH_MAX, -CLOTH_MAX);
    setExtend(0);
    setAperture(1);
    setFeed(0);
    setDoor(0);
    setLever(0);
    setFocus(8);
    setDialAngle(0);
    setGhost(1);
  }

  /* 跳阶段用：密封所有 flyPhase < phase 的零件 */
  function sealThrough(phase) {
    list.forEach(function (p) {
      if (p.flyPhase < phase && !p.sealed) {
        p.sealed = true;
        p.landed = true; p.tagShown = true;
        seatedCount++;
        p.group.visible = true;
        p.group.position.copy(p.target);
        p.group.rotation.y = 0;
        if (p.line) { RF35.Scene3D.scene.remove(p.line); p.line = null; }
      }
    });
  }

  function sealAll() { sealThrough(99); }

  /* ============ 机构动态 API ============ */

  /* 剖视：机身壳体透明度 */
  function setGhost(a) {
    var mats = [gmChrome, gmBrushed, gmLeather, gmDark];
    for (var i = 0; i < mats.length; i++) {
      var m = mats[i];
      var t = a < 0.98;
      if (m.transparent !== t) { m.transparent = t; m.needsUpdate = true; }
      m.opacity = a;
      m.depthWrite = a > 0.55;
    }
  }

  /* 帘幕位置：x1 = 一帘左缘（−0.30 全展 → +0.30 收起）；y2 = 二帘右缘 */
  function setCurtains(x1, y2) {
    x1 = Math.max(-CLOTH_MAX, Math.min(CLOTH_MAX, x1));
    y2 = Math.max(-CLOTH_MAX, Math.min(CLOTH_MAX, y2));
    if (dyn.curtain1) {
      dyn.curtain1.scale.x = Math.max(0.001, (CLOTH_MAX - x1) / (CLOTH_MAX * 2));
      if (dyn.spoolB) dyn.spoolB.rotation.y -= (x1 - (dyn.prevX1 === undefined ? -CLOTH_MAX : dyn.prevX1)) / 0.028;
    }
    if (dyn.curtain2) {
      dyn.curtain2.scale.x = Math.max(0.001, (y2 + CLOTH_MAX) / (CLOTH_MAX * 2));
      if (dyn.spoolA) dyn.spoolA.rotation.y += (y2 - (dyn.prevY2 === undefined ? -CLOTH_MAX : dyn.prevY2)) / 0.028;
    }
    dyn.prevX1 = x1;
    dyn.prevY2 = y2;
  }

  /* 光圈：t 1 = f/2 全开，0 = f/16 全收 */
  function setAperture(t) {
    var phi = (1 - Math.max(0, Math.min(1, t))) * 1.36;
    (dyn.blades || []).forEach(function (b) {
      b.rotation.z = b.userData.theta + Math.PI / 2 + phi;
    });
  }

  /* 镜筒伸缩：t 0 收 → 1 全伸 */
  function setExtend(t) {
    (dyn.sections || []).forEach(function (s) {
      s.obj.position.z = s.fullZ - s.dz * (1 - t);
    });
  }

  /* 对焦：环旋转 + 联动杆随动 */
  function setFocus(dist) {
    dist = Math.max(0.6, dist);
    if (dyn.fring) dyn.fring.rotation.y = 2.4 / dist;
    (dyn.levers || []).forEach(function (p, i) {
      p.rotation.y = p.userData.baseY + (1.6 / dist) * (i % 2 === 0 ? 1 : -0.7);
    });
  }

  /* 胶片过片：t 0→1 沿路径揭示 + 卷片轴旋转 */
  function setFeed(t) {
    if (dyn.filmMesh) dyn.filmMesh.geometry.setDrawRange(0, Math.floor((dyn.filmSegs || 100) * Math.max(0, Math.min(1, t))) * 6);
    if (dyn.spoolT) dyn.spoolT.rotation.y = -t * 9;
    if (dyn.casSpool) dyn.casSpool.rotation.y = -t * 9;
  }

  /* 后盖开合：t 0 合 → 1 开（约 89°，平展不触桌面） */
  function setDoor(t) {
    if (dyn.doorPivot) dyn.doorPivot.rotation.x = -1.55 * smooth(t);
  }

  /* 过片扳手：t 0 静止 → 1 全行程 */
  function setLever(t) {
    if (dyn.lever) dyn.lever.rotation.y = -2.27 * Math.max(0, Math.min(1, t));
  }

  /* 速度盘角度 */
  function setDialAngle(a) {
    if (dyn.dial) dyn.dial.rotation.y = a;
  }

  /* 计数窗 */
  function setCounter(n) { drawCounter(n); }

  /* 快门按钮按下深度 */
  function setPress(t) {
    if (dyn.btn) dyn.btn.position.y = dyn.btnBaseY - 0.013 * Math.max(0, Math.min(1, t));
  }

  RF35.Parts = {
    init: init,
    begin: begin,
    update: update,
    reset: reset,
    sealThrough: sealThrough,
    sealAll: sealAll,
    group: function (id) {
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].group;
      return null;
    },
    list: function () { return list; },
    setGhost: setGhost,
    setCurtains: setCurtains,
    setAperture: setAperture,
    setExtend: setExtend,
    setFocus: setFocus,
    setFeed: setFeed,
    setDoor: setDoor,
    setLever: setLever,
    setDialAngle: setDialAngle,
    setCounter: setCounter,
    setPress: setPress,
    get seatedCount() { return seatedCount; },
    get flying() { return flying; }
  };
})(window.RF35 = window.RF35 || {});
