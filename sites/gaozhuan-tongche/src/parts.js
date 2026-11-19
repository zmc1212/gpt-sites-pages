/* 高转筒车部件建模与注册(渠田 3 + 架墩 4 + 轴轮 4 + 摇柄 1 + 链板 14 = 26 件)。
   坐标系:y 向上;链面在 x-y 平面(轮轴沿 z),轮心 x = xC = −2.5;
   下轮浸入溪渠(水面 0.18),链板沿封闭路径运动(见 mech.js chainPos),
   每板为独立部件(static 飞入落位后由 KINE 接管位置)。
   全部几何位于全球地面 y=0 之上(渠底 0.06 不透明盖板)。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;

  function group() { return new THREE.Group(); }
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  var _paving = null;
  function pavingTex() {
    if (_paving) return _paving;
    var c = document.createElement("canvas");
    c.width = c.height = 256;
    var x = c.getContext("2d");
    x.fillStyle = "#63666C";
    x.fillRect(0, 0, 256, 256);
    var row, col, w = 62, h = 30;
    for (row = 0; row < 9; row++) {
      var off = (row % 2) * 31;
      for (col = -1; col < 5; col++) {
        var px = col * w + off, py = row * h;
        var g = 100 + ((row * 7 + col * 13) % 22);
        x.fillStyle = "rgb(" + g + "," + (g + 3) + "," + (g + 8) + ")";
        x.fillRect(px + 2, py + 2, w - 4, h - 4);
        x.strokeStyle = "rgba(30,32,36,0.65)";
        x.lineWidth = 2;
        x.strokeRect(px + 2, py + 2, w - 4, h - 4);
      }
    }
    for (var i = 0; i < 420; i++) {
      x.fillStyle = "rgba(255,255,255," + (Math.random() * 0.05).toFixed(3) + ")";
      x.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
    t.encoding = THREE.sRGBEncoding;
    _paving = t;
    return t;
  }

  var _plank = null;
  function plankTex() {
    if (_plank) return _plank;
    var c = document.createElement("canvas");
    c.width = c.height = 128;
    var x = c.getContext("2d");
    x.fillStyle = "#9A6B33";
    x.fillRect(0, 0, 128, 128);
    for (var i = 0; i < 8; i++) {
      var px = i * 16 + 1;
      x.fillStyle = (i % 2) ? "#8A5E2B" : "#A97844";
      x.fillRect(px, 0, 14, 128);
      x.strokeStyle = "rgba(58,36,12,0.6)";
      x.lineWidth = 1.6;
      x.strokeRect(px, 0, 14, 128);
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 1);
    t.encoding = THREE.sRGBEncoding;
    _plank = t;
    return t;
  }

  /* —— 部件构建器 —— */

  function buildStream() {   // 溪渠:两岸 + 不透明渠底 + 水面
    var g = group();
    var pave = new THREE.MeshStandardMaterial({ map: pavingTex(), roughness: 0.9, metalness: 0.04 });
    var dark = new THREE.MeshStandardMaterial({ color: 0x35383E, roughness: 0.95, metalness: 0.04 });
    g.add(P.box(0.35, D.bankTop, D.chZ * 2, pave, D.chX0 + 0.175, D.bankTop / 2, 0));
    g.add(P.box(0.35, D.bankTop, D.chZ * 2, pave, D.chX1 - 0.175, D.bankTop / 2, 0));
    g.add(P.box(1.5, 0.04, D.chZ * 2, dark, 0, 0.04, 0));
    var water = P.mesh(new THREE.PlaneGeometry(1.5, D.chZ * 2), M3.water, 0, D.waterY, 0);
    water.rotation.x = -Math.PI / 2;
    water.castShadow = false;
    g.add(water);
    g.userData.water = water;
    return { group: g, anchor: mkAnchor(D.chX0 + 0.2, 0.32, 0.9) };
  }

  function buildPaddy() {    // 田:四埂 + 田面水
    var g = group();
    var rim = new THREE.MeshStandardMaterial({ color: 0x6B5A3E, roughness: 0.92, metalness: 0.03 });
    var W = D.paddyW, Dp = D.paddyD / 2;
    g.add(P.box(W * 2 + 0.24, D.paddyRim, 0.16, rim, 0, D.paddyRim / 2, Dp + 0.04));
    g.add(P.box(W * 2 + 0.24, D.paddyRim, 0.16, rim, 0, D.paddyRim / 2, -Dp - 0.04));
    g.add(P.box(0.16, D.paddyRim, Dp * 2 + 0.2, rim, W + 0.04, D.paddyRim / 2, 0));
    g.add(P.box(0.16, D.paddyRim, Dp * 2 + 0.2, rim, -W - 0.04, D.paddyRim / 2, 0));
    g.add(P.box(W * 2, 0.05, Dp * 2, new THREE.MeshStandardMaterial({ color: 0x4A3E2A, roughness: 0.95 }), 0, 0.03, 0));
    var water = P.mesh(new THREE.PlaneGeometry(W * 2 - 0.1, Dp * 2 - 0.1), M3.water, 0, D.paddyWater, 0);
    water.rotation.x = -Math.PI / 2;
    water.castShadow = false;
    g.add(water);
    g.userData.water = water;
    return { group: g, anchor: mkAnchor(-W - 0.1, D.paddyRim + 0.06, 0.3) };
  }

  function buildTrough() {   // 渡槽:斜置木槽 + 槽内水 + 三根支柱
    var g = group();
    var slope = Math.atan2(D.trY1 - D.trY0, D.trX1 - D.trX0);
    var midX = (D.trX0 + D.trX1) / 2, midY = (D.trY0 + D.trY1) / 2;
    var len = Math.sqrt(Math.pow(D.trX1 - D.trX0, 2) + Math.pow(D.trY1 - D.trY0, 2)) + 0.02;
    var holder = group();
    holder.position.set(midX, midY, 0);
    holder.rotation.z = slope;
    holder.add(P.box(len, 0.04, D.trW, M3.woodD, 0, -0.10, 0));
    holder.add(P.box(len, 0.16, 0.035, M3.wood, 0, 0.0, D.trW / 2));
    holder.add(P.box(len, 0.16, 0.035, M3.wood, 0, 0.0, -D.trW / 2));
    var water = P.mesh(new THREE.PlaneGeometry(len - 0.15, D.trW - 0.08), M3.water, 0, 0.015, 0);
    water.rotation.x = -Math.PI / 2;
    water.castShadow = false;
    holder.add(water);
    g.add(holder);
    /* 支柱(着地,顶部距槽底留 0.01 间隙,防穿插) */
    [-1.25, -0.15, 0.75].forEach(function (px) {
      var py = D.trY0 + (px - D.trX0) / (D.trX1 - D.trX0) * (D.trY1 - D.trY0);
      var top = py - 0.14;
      g.add(P.box(0.11, top - 0.02, 0.11, M3.woodD, px, (top + 0.02) / 2, 0.12));
      g.add(P.box(0.11, top - 0.02, 0.11, M3.woodD, px, (top + 0.02) / 2, -0.12));
    });
    g.userData.water = water;
    return { group: g, anchor: mkAnchor(midX + 1.0, midY + 0.3, 0) };
  }

  function buildPier(side) { // 下轮石柱墩(承轴,立于渠中)
    var g = group();
    var pave = new THREE.MeshStandardMaterial({ map: pavingTex(), roughness: 0.9, metalness: 0.04 });
    g.add(P.box(0.26, D.yL, 0.26, pave, 0, D.yL / 2, side * 0.45));
    g.add(P.box(0.30, 0.10, 0.30, M3.woodD, 0, D.yL, side * 0.45));
    return { group: g, anchor: mkAnchor(0.2, D.yL + 0.15, side * 0.5) };
  }

  function buildUpperFrame() { // 上轮高架:双柱 + 交叉斜撑 + 轴承
    var g = group();
    var H = D.yU;
    [1, -1].forEach(function (s) {
      g.add(P.box(0.15, H, 0.15, M3.woodD, 0, H / 2, s * 0.45));
      g.add(P.box(0.36, 0.10, 0.36, M3.stone, 0, 0.05, s * 0.45));
      g.add(P.box(0.18, 0.24, 0.28, M3.woodD, 0, H, s * 0.45));
      g.add(P.box(0.20, 0.05, 0.30, M3.iron, 0, H + 0.14, s * 0.45));
    });
    /* 交叉斜撑(两层,双柱之间) */
    [1.1, 2.3].forEach(function (yy) {
      [1, -1].forEach(function (s2) {
        var brace = P.box(0.075, 1.55, 0.075, M3.wood, 0, yy, 0);
        brace.rotation.x = s2 * 0.49;
        g.add(brace);
      });
    });
    g.add(P.box(0.12, 0.10, 1.05, M3.wood, 0, 1.05, 0));
    return { group: g, anchor: mkAnchor(0.12, 2.0, 0.5) };
  }

  function buildAxle(hi) {   // 轮轴(沿 z)
    var g = group();
    var L = hi ? 1.24 : 1.62;
    var axle = P.cyl(0.038, 0.038, L, M3.steelD, 0, 0, 0, 12);
    axle.rotation.x = P.ROTX;
    g.add(axle);
    [1, -1].forEach(function (s) {
      var sl = P.cyl(0.065, 0.065, 0.14, M3.bronze, 0, 0, s * (hi ? 0.45 : 0.45), 14);
      sl.rotation.x = P.ROTX;
      g.add(sl);
    });
    return { group: g, anchor: mkAnchor(0, 0.07, hi ? 0.5 : 0.6) };
  }

  function buildSprocket() { // 链轮:轮辋 + 8 辐 + 毂 + 拨齿
    var g = group();
    var R = D.R;
    var rim = P.torus(R - 0.02, 0.045, M3.woodD, 0, 0, 0, 40);
    g.add(rim);
    var rim2 = P.torus(R - 0.10, 0.028, M3.wood, 0, 0, 0, 40);
    g.add(rim2);
    for (var i = 0; i < 8; i++) {
      var a = i / 8 * Math.PI * 2;
      var len = R - 0.16;
      var s = P.box(0.055, len, 0.055, M3.wood, 0, 0, 0);
      s.position.set(Math.cos(a) * (0.09 + len / 2), Math.sin(a) * (0.09 + len / 2), 0);
      s.rotation.z = a - Math.PI / 2;
      g.add(s);
    }
    var hub = P.cyl(0.09, 0.09, 0.20, M3.woodD, 0, 0, 0, 14);
    hub.rotation.x = P.ROTX;
    g.add(hub);
    /* 拨齿:轮辋上 4 对短柱(z 向),示意拨动链板吊索 */
    for (var j = 0; j < 4; j++) {
      var b = j / 4 * Math.PI * 2;
      var peg = P.cyl(0.024, 0.024, D.wheelW + 0.10, M3.iron, Math.cos(b) * (R - 0.05), Math.sin(b) * (R - 0.05), 0, 8);
      peg.rotation.x = P.ROTX;
      g.add(peg);
    }
    return { group: g, anchor: mkAnchor(R - 0.10, 0.10, 0.10) };
  }

  function buildCrank() {    // 摇柄(下轮轴东端,z +0.78):臂沿 +x,ψ=0 指东
    var g = group();
    g.add(P.box(0.07, D.crankArm + 0.05, 0.05, M3.iron, (D.crankArm + 0.05) / 2 - 0.02, 0, 0));
    var handle = P.cyl(0.03, 0.034, D.wheelW + 0.16, M3.wood, D.crankArm, 0, -0.08, 12);
    handle.rotation.x = P.ROTX;
    g.add(handle);
    g.add(P.sph(0.042, M3.iron, D.crankArm, 0, 0));
    return { group: g, anchor: mkAnchor(D.crankArm + 0.06, 0.05, 0.12) };
  }

  function buildBoard(idx) { // 刮板小筒:托板 + 竹筒 + 筒内水(kine 接管位置)
    var g = group();
    var plank = new THREE.MeshStandardMaterial({ map: plankTex(), roughness: 0.84, metalness: 0.04 });
    g.add(P.box(0.30, 0.045, 0.26, plank, 0, 0, 0));
    var bamboo = new THREE.MeshStandardMaterial({ color: 0x9C8B4F, roughness: 0.6, metalness: 0.04 });
    g.add(P.cyl(0.088, 0.082, 0.16, bamboo, 0, 0.115, 0, 14));
    var rimT = P.torus(0.088, 0.011, bamboo, 0, 0.193, 0, 14);
    rimT.rotation.x = P.ROTX;
    g.add(rimT);
    var water = P.mesh(new THREE.CylinderGeometry(0.072, 0.068, 0.13, 12), M3.water, 0, 0.07, 0);
    water.castShadow = false;
    water.visible = false;
    g.add(water);
    g.userData.water = water;
    g.userData.idx = idx;
    return { group: g, anchor: g };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    /* 阶段 1:溪渠 + 田 + 渡槽 */
    def({ id: "stream", name: "STREAM · 溪渠", sub: "渠底 0.06 · 水面 0.18 · 两岸石砌", phase: 0, at: 0.2, dur: 1.3,
      build: buildStream, target: [0, 0, 0], start: [0, 4.6, 0], mid: [0, 2.4, 0] });
    def({ id: "paddy", name: "PADDY · 田", sub: "四埂围水 · 受渡槽注水", phase: 0, at: 1.2, dur: 1.2,
      build: buildPaddy, target: [D.paddyX, 0, 0], start: [D.paddyX, 4.6, 0.6], mid: [D.paddyX, 2.4, 0.3] });
    def({ id: "trough", name: "TROUGH · 渡槽", sub: "斜置木槽 · 三柱架空", phase: 0, at: 2.3, dur: 1.4,
      build: buildTrough, target: [0, 0, 0], start: [0.6, 7.0, 0], mid: [0.3, 5.4, 0] });

    /* 阶段 2:下轮石墩 */
    def({ id: "pierN", name: "PIER · 石墩 N", sub: "承下轮轴 · 跨渠", phase: 1, at: 5.6, dur: 1.1,
      build: function () { return buildPier(1); }, target: [D.xC, 0, 0], start: [D.xC, 4.0, 1.2], mid: [D.xC, 2.2, 0.6] });
    def({ id: "pierS", name: "PIER · 石墩 S", sub: "承下轮轴 · 跨渠", phase: 1, at: 6.3, dur: 1.1,
      build: function () { return buildPier(-1); }, target: [D.xC, 0, 0], start: [D.xC, 4.0, -1.2], mid: [D.xC, 2.2, -0.6] });

    /* 阶段 3:高架 */
    def({ id: "upperFrame", name: "HIGH FRAME · 上轮高架", sub: "双柱交叉撑 · 轴高 3.95m", phase: 2, at: 10.6, dur: 1.6,
      build: buildUpperFrame, target: [D.xC, 0, 0], start: [D.xC + 1.2, 7.2, 0.8], mid: [D.xC + 0.6, 4.6, 0.4] });

    /* 阶段 4:轴与轮 */
    def({ id: "lowerAxle", name: "AXLE · 下轮轴", sub: "轴高 0.62m · 铜套", phase: 3, at: 16.4, dur: 1.1, kind: "screw",
      build: function () { return buildAxle(false); }, target: [D.xC, D.yL, 0], start: [D.xC, 3.0, 1.0], mid: [D.xC, 1.6, 0.5] });
    def({ id: "upperAxle", name: "AXLE · 上轮轴", sub: "轴高 3.95m · 铜套", phase: 3, at: 17.1, dur: 1.1, kind: "screw",
      build: function () { return buildAxle(true); }, target: [D.xC, D.yU, 0], start: [D.xC, 6.4, 1.0], mid: [D.xC, 5.0, 0.5] });
    def({ id: "lowerWheel", name: "SPROCKET · 下链轮", sub: "径 1.0m · 浸水 0.06m · 拨齿", phase: 3, at: 17.9, dur: 1.2, kind: "kine",
      build: buildSprocket, target: [D.xC, D.yL, 0], off: [-1.2, 1.8, 0.8] });
    def({ id: "upperWheel", name: "SPROCKET · 上链轮", sub: "径 1.0m · 倾注入槽", phase: 3, at: 18.7, dur: 1.2, kind: "kine",
      build: buildSprocket, target: [D.xC, D.yU, 0], off: [-1.0, 2.4, 0.8] });

    /* 阶段 5:摇柄 */
    def({ id: "crank", name: "CRANK · 摇柄", sub: "臂 0.38m · 踏转下轮", phase: 4, at: 20.6, dur: 1.2, kind: "screw",
      build: buildCrank, target: [D.xC, D.yL, 0.78], start: [D.xC + 1.0, 2.6, 1.4], mid: [D.xC + 0.5, 1.4, 1.0] });

    /* 阶段 6:链板 14 块(逐块飞入,落位后由 KINE 沿链接管) */
    for (var i = 0; i < D.NB; i++) {
      (function (i) {
        var p0 = KS.boardState(i, 0);
        def({
          id: "bd" + i, name: "BOARD · 刮板筒 " + (i + 1), sub: "板距 0.70m · 竹筒载水",
          phase: 5, at: 21.8 + i * 0.32, dur: 1.0, kind: "static",
          build: function () { return buildBoard(i); },
          target: [p0.x, p0.y, 0],
          start: [p0.x + (i % 2 ? 1.4 : -1.4), p0.y + 2.2, 1.3 - (i % 3) * 0.5],
          mid: [p0.x + (i % 2 ? 0.7 : -0.7), p0.y + 1.0, 0.6],
          anchor: [0, 0.2, 0]
        });
      })(i);
    }
  };

  /* —— 运动学分发(每帧,含装配飞行期) ——
     轮/柄转角 = −sAdv/R(s 增 = 链上行西段);板位由 chainPos 解析驱动;
     st.errPos = 板 0 网格世界坐标与解析值之差,应 ≈0。 */
  var _wp = new THREE.Vector3();
  MECH.KINE = function (st) {
    var sAdv = st.sAdv || 0;
    var wheelRot = -sAdv / D.R;
    var lw = MECH.Parts.entry("lowerWheel");
    if (lw && lw.shown) lw.group.rotation.z = wheelRot;
    var uw = MECH.Parts.entry("upperWheel");
    if (uw && uw.shown) uw.group.rotation.z = wheelRot;
    var ck = MECH.Parts.entry("crank");
    if (ck && ck.shown) ck.group.rotation.z = wheelRot;

    st.errPos = 0;
    for (var i = 0; i < D.NB; i++) {
      var e = MECH.Parts.entry("bd" + i);
      if (!e || !e.shown) continue;
      var bs = KS.boardState(i, sAdv);
      if (e.sealed) {
        e.group.position.set(bs.x, bs.y, 0);
        var w = e.group.userData.water;
        if (w) w.visible = bs.wet;
        if (i === 0) {
          e.group.updateWorldMatrix(true, false);
          _wp.setFromMatrixPosition(e.group.matrixWorld);
          var dx = _wp.x - bs.x, dy = _wp.y - bs.y, dz = _wp.z - bs.z;
          st.errPos = Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
      }
    }
  };
})(window.MECH = window.MECH || {});
