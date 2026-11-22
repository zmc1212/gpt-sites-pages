/* 转轮藏部件建模与注册(8 件)。
   坐标系:y 上;藏柜八棱柱绕中心竖轴旋转(轴 y,原点在枢针 (0,0,0));
   各 kine 部件 rotation.y = ψ(柜体/书架/檐顶/推杆同角);
   errPos = 推杆端头世界位置 vs 解析(R·cos/sin ψ),应≈0。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;

  function group() { return new THREE.Group(); }
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  var _wood = null, _dark = null;
  function woodMat() {
    if (!_wood) {
      var c = document.createElement("canvas");
      c.width = c.height = 128;
      var x = c.getContext("2d");
      x.fillStyle = "#8A5A2B";
      x.fillRect(0, 0, 128, 128);
      for (var i = 0; i < 60; i++) {
        x.strokeStyle = "rgba(70,42,16," + (0.15 + Math.random() * 0.25).toFixed(2) + ")";
        x.lineWidth = 1 + Math.random() * 2;
        x.beginPath();
        x.moveTo(0, Math.random() * 128);
        x.bezierCurveTo(40, Math.random() * 128, 90, Math.random() * 128, 128, Math.random() * 128);
        x.stroke();
      }
      var t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
      t.encoding = THREE.sRGBEncoding;
      _wood = new THREE.MeshStandardMaterial({ map: t, roughness: 0.8, metalness: 0.04 });
    }
    return _wood;
  }
  function darkMat() {
    if (!_dark) {
      _dark = new THREE.MeshStandardMaterial({ color: 0x5A3A1E, roughness: 0.86, metalness: 0.04 });
    }
    return _dark;
  }

  /* —— 部件构建器 —— */

  function buildBase() {    // 殿基:八角石台 + 中央凹座(承枢针)
    var g = group();
    var N = 8;
    var slab = new THREE.MeshStandardMaterial({ color: 0x6E7076, roughness: 0.92 });
    g.add(P.cyl(D.RCase + 0.55, D.RCase + 0.75, 0.26, slab, 0, 0.13, 0, N * 2));
    g.add(P.cyl(D.RCase + 0.30, D.RCase + 0.40, 0.16, slab, 0, 0.34, 0, N * 2));
    /* 中央凹座(铁承座在此) */
    g.add(P.cyl(0.30, 0.34, 0.10, darkMat(), 0, 0.47, 0, 20));
    return { group: g, anchor: mkAnchor(D.RCase + 0.3, 0.4, D.RCase * 0.3) };
  }

  function buildBearing() { // 铁承座 + 藏针(下枢):座 + 针尖向上
    var g = group();
    g.add(P.cyl(0.16, 0.20, 0.10, M3.iron, 0, 0.52, 0, 18));
    g.add(P.cyl(D.needleR, D.needleR * 0.6, 0.14, M3.steel, 0, 0.60, 0, 10));   // 针
    return { group: g, anchor: mkAnchor(0.18, 0.62, 0) };
  }

  function buildCase() {    // 藏柜八棱体:八面经柜格(格内经函随体)
    var g = group();
    var N = D.NS;
    var R = D.RCase;
    var h0 = D.caseY0, h1 = D.caseY1;
    /* 八棱柱身:8 面板 */
    for (var i = 0; i < N; i++) {
      var a = (i + 0.5) / N * Math.PI * 2;
      var panelW = 2 * R * Math.sin(Math.PI / N);
      var panel = P.box(panelW, h1 - h0, 0.10, woodMat(), 0, 0, 0);
      panel.position.set(Math.cos(a) * (R - 0.05), (h0 + h1) / 2, Math.sin(a) * (R - 0.05));
      panel.rotation.y = -a;
      g.add(panel);
      /* 面板沿顶底枋 */
      g.add(P.box(panelW, 0.10, 0.14, darkMat(), Math.cos(a) * (R - 0.03), h0 + 0.05, Math.sin(a) * (R - 0.03)));
      g.add(P.box(panelW, 0.10, 0.14, darkMat(), Math.cos(a) * (R - 0.03), h1 - 0.05, Math.sin(a) * (R - 0.03)));
    }
    /* 中柱(藏心柱) */
    g.add(P.cyl(0.14, 0.16, h1 - h0, darkMat(), 0, (h0 + h1) / 2, 0, 14));
    /* 底枋十字托 */
    g.add(P.box(R * 1.5, 0.12, 0.16, darkMat(), 0, h0 - 0.06, 0));
    g.add(P.box(0.16, 0.12, R * 1.5, darkMat(), 0, h0 - 0.06, 0));
    return { group: g, anchor: mkAnchor(R - 0.06, 1.6, 0.06) };
  }

  function buildShelves() { // 经函架:三排 24 函(小木盒,随柜转)
    var g = group();
    var N = D.NS;
    var R = D.RCase - 0.12;
    for (var f = 0; f < N; f++) {
      var a = (f + 0.5) / N * Math.PI * 2;
      var fx = Math.cos(a) * R, fz = Math.sin(a) * R;
      var face = -a + Math.PI / 2;
      for (var r = 0; r < D.shelfRows; r++) {
        var y = D.caseY0 + 0.35 + r * 0.62;
        g.add(P.box(2 * D.RCase * Math.sin(Math.PI / N) - 0.14, 0.05, 0.14, woodMat(), fx, y, fz));
        for (var b = 0; b < D.boxesPer; b++) {
          var t = (b - (D.boxesPer - 1) / 2) * 0.42;
          var bx = fx + Math.cos(a) * 0 + Math.cos(face) * t;
          var bz = fz + Math.sin(face) * t;
          var box = P.box(0.34, 0.30, 0.30,
            new THREE.MeshStandardMaterial({ color: b % 2 ? 0xB08D57 : 0x9C7A3E, roughness: 0.8 }),
            bx, y + 0.19, bz);
          box.rotation.y = -a;
          g.add(box);
        }
      }
    }
    return { group: g, anchor: mkAnchor(R, 1.5, 0.1) };
  }

  function buildCanopy() {  // 八角檐顶:八棱锥坡顶 + 宝顶
    var g = group();
    var N = D.NS;
    var roof = P.mesh(new THREE.CylinderGeometry(0.24, D.RCase + 0.72, 0.46, N, 1, false),
      new THREE.MeshStandardMaterial({ color: 0x4E3320, roughness: 0.85, flatShading: true }),
      0, D.caseY1 + 0.28, 0);
    g.add(roof);
    var eave = P.cyl(D.RCase + 0.72, D.RCase + 0.80, 0.06, darkMat(), 0, D.caseY1 + 0.06, 0, N);
    g.add(eave);
    /* 宝顶 */
    g.add(P.cyl(0.09, 0.13, 0.22, M3.gold, 0, D.caseY1 + 0.60, 0, 14));
    g.add(P.sph(0.09, M3.gold, 0, D.caseY1 + 0.76, 0));
    /* 八棱短柱檐托 */
    for (var j = 0; j < N; j++) {
      var a3 = j / N * Math.PI * 2;
      g.add(P.cyl(0.05, 0.06, 0.40, darkMat(), Math.cos(a3) * (D.RCase - 0.02), D.caseY1 + 0.20, Math.sin(a3) * (D.RCase - 0.02), 8));
    }
    return { group: g, anchor: mkAnchor(D.RCase + 0.2, D.caseY1 + 0.4, 0.1) };
  }

  function buildTopBeam() { // 上梁悬桩:横梁 + 下垂悬桩(限位)
    var g = group();
    g.add(P.box(1.90, 0.16, 0.20, darkMat(), 0, D.beamY, 0));
    [1, -1].forEach(function (s) {
      g.add(P.box(0.15, D.beamY - D.caseY1, 0.15, darkMat(), s * 0.80, (D.beamY + D.caseY1) / 2, 0));
    });
    g.add(P.cyl(0.03, 0.03, 0.14, M3.steel, 0, D.beamY - 0.12, 0, 8));
    return { group: g, anchor: mkAnchor(0.7, D.beamY + 0.1, 0.1) };
  }

  function buildPushBar() { // 推杆:装于柜面下枋的横推把手(随柜转)
    var g = group();
    g.add(P.box(0.90, 0.07, 0.07, woodMat(), D.RCase - 0.02, D.caseY0 + 0.28, 0));
    g.add(P.cyl(0.035, 0.035, 0.20, darkMat(), D.RCase + 0.10, D.caseY0 + 0.28, 0, 10));
    g.add(P.sph(0.045, M3.gold, D.RCase + 0.21, D.caseY0 + 0.28, 0));
    return { group: g, anchor: mkAnchor(D.RCase + 0.20, D.caseY0 + 0.34, 0.12) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "base", name: "BASE · 殿基凹座", sub: "八角石台 · 中央凹座", phase: 0, at: 0.2, dur: 1.5,
      build: buildBase, target: [0, 0, 0], start: [0, 4.4, 0], mid: [0, 2.2, 0] });
    def({ id: "bearing", name: "BEARING · 铁承座藏针", sub: "枢针 r 0.02 · 下承", phase: 0, at: 1.7, dur: 1.2, kind: "screw",
      build: buildBearing, target: [0, 0, 0], start: [0, 3.4, 0.4], mid: [0, 1.7, 0.2] });

    def({ id: "case", name: "CASE · 八棱藏柜", sub: "对径 2.6 · 高 2.28", phase: 1, at: 6.6, dur: 1.7, kind: "kine",
      build: buildCase, target: [0, 0, 0], off: [0.9, 2.4, 0.8] });
    def({ id: "shelves", name: "SHELVES · 经函架", sub: "3 排 × 8 面 · 24 函", phase: 1, at: 8.0, dur: 1.6, kind: "kine",
      build: buildShelves, target: [0, 0, 0], off: [-0.9, 2.2, 0.8] });

    def({ id: "canopy", name: "CANOPY · 八角檐顶", sub: "檐面八坡 · 宝顶", phase: 2, at: 13.4, dur: 1.6, kind: "kine",
      build: buildCanopy, target: [0, 0, 0], off: [0.8, 2.6, 0.7] });
    def({ id: "topBeam", name: "TOP BEAM · 上梁悬桩", sub: "限位悬桩", phase: 2, at: 14.8, dur: 1.3,
      build: buildTopBeam, target: [0, 0, 0], start: [0, 4.6, 0.4], mid: [0, 3.4, 0.2] });

    def({ id: "pushBar", name: "PUSH BAR · 推杆", sub: "施力把手 · 随柜转", phase: 3, at: 19.4, dur: 1.3, kind: "kine",
      build: buildPushBar, target: [0, 0, 0], off: [0.6, 1.4, 0.8] });
  };

  /* —— 运动学分发 ——
     ψ = coastPsi(τ) 纯函数;柜体/书架/檐顶/推杆 rotation.y = ψ;
     errPos = 推杆端头 vs 解析(R+0.21)·(cos/sin ψ),应≈0。 */
  var _wp = new THREE.Vector3();
  MECH.KINE = function (st) {
    var psi = st.psi || 0;
    ["case", "shelves", "canopy", "pushBar"].forEach(function (id) {
      var e = MECH.Parts.entry(id);
      if (e && e.shown) e.group.rotation.y = psi;
    });

    st.errPos = 0;
    var pb = MECH.Parts.entry("pushBar");
    if (pb && pb.sealed) {
      pb.group.updateWorldMatrix(true, false);
      _wp.set(D.RCase + 0.21, D.caseY0 + 0.28, 0).applyMatrix4(pb.group.matrixWorld);
      var ax = Math.cos(psi) * (D.RCase + 0.21);
      var az = -Math.sin(psi) * (D.RCase + 0.21);
      var dy = _wp.y - (D.caseY0 + 0.28);
      st.errPos = Math.sqrt((_wp.x - ax) * (_wp.x - ax) + dy * dy + (_wp.z - az) * (_wp.z - az));
    }
  };
})(window.MECH = window.MECH || {});
