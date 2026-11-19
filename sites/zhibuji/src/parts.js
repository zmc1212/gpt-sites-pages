/* 织布机部件建模与注册(9 件)。
   坐标系:y 上;经线沿 x(后 x 0.60 → 前 x −0.55),z 向 16 根排开;
   综框 x 0.25 双片交替升降;吊综轴 y 1.28 双绳反向;梭沿 x 穿行;筘打纬。
   KINE:综/蹑/梭/筘每帧驱动,经线与吊综绳 Line 几何逐帧重建。
   全部几何位于全球地面之上。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;

  function group() { return new THREE.Group(); }
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  var _plank = null;
  function plankMat() {
    if (!_plank) {
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
      _plank = new THREE.MeshStandardMaterial({ map: t, roughness: 0.84, metalness: 0.04 });
    }
    return _plank;
  }

  /* —— 部件构建器 —— */

  function buildFrame() {    // 机架:双纵梁 + 四柱 + 顶梁
    var g = group();
    [1, -1].forEach(function (s) {
      g.add(P.box(1.55, 0.10, 0.10, plankMat(), 0.03, 0.70, s * 0.40));
      [[0.60], [-0.55]].forEach(function (p) {
        g.add(P.box(0.13, 0.70, 0.13, M3.woodD, p[0], 0.35, s * 0.40));
        g.add(P.box(0.28, 0.06, 0.28, M3.stone, p[0], 0.03, s * 0.40));
      });
    });
    g.add(P.box(0.10, 0.62, 0.10, M3.woodD, 0.25, 0.97, 0.40));
    g.add(P.box(0.10, 0.62, 0.10, M3.woodD, 0.25, 0.97, -0.40));
    g.add(P.box(0.09, 0.09, 0.92, M3.wood, 0.25, 1.28, 0));
    g.add(P.box(1.30, 0.08, 0.14, M3.woodD, 0.03, 0.10, 0.46));
    return { group: g, anchor: mkAnchor(0.55, 0.9, 0.4) };
  }

  function buildWarpBeam() { // 经轴 + 经线 16 根(Line,开口时随综升降)
    var g = group();
    var beam = P.cyl(0.055, 0.055, 0.80, plankMat(), D.warpX, D.warpY, 0, 18);
    beam.rotation.x = P.ROTX;
    g.add(beam);
    var threads = [];
    for (var i = 0; i < D.NW; i++) {
      var z = D.warpZ0 + i * D.warpDX;
      var geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(D.warpX, D.warpY, z),
        new THREE.Vector3(D.clothX, D.warpY, z)
      ]);
      var line = new THREE.Line(geo, new THREE.LineBasicMaterial({
        color: i % 2 ? 0xD8C9A8 : 0xC4B088, transparent: true, opacity: 0.9
      }));
      g.add(line);
      threads.push(line);
    }
    g.userData.threads = threads;
    return { group: g, anchor: mkAnchor(D.warpX, D.warpY + 0.1, 0) };
  }

  function buildHeddle(idx) { // 综框(双片):框 + 综眼条(升降)
    var g = group();
    g.add(P.box(0.045, D.heddleH, 0.045, M3.woodD, 0, 0, 0.36));
    g.add(P.box(0.045, D.heddleH, 0.045, M3.woodD, 0, 0, -0.36));
    g.add(P.box(0.05, 0.045, 0.76, M3.wood, 0, D.heddleH / 2, 0));
    g.add(P.box(0.05, 0.045, 0.76, M3.wood, 0, -D.heddleH / 2, 0));
    /* 综丝(小环) */
    for (var i = 0; i < 8; i++) {
      var z = D.warpZ0 + (idx === 0 ? i * 2 : i * 2 + 1) * D.warpDX;
      var e = P.torus(0.018, 0.006, M3.bronze, 0, 0, z, 10);
      g.add(e);
    }
    return { group: g, anchor: mkAnchor(0.05, 0.1, 0.36) };
  }

  function buildShaft() {    // 吊综轴:轴 + 双绳(Line,随升降收放)
    var g = group();
    var axle = P.cyl(D.shaftR, D.shaftR, 0.84, plankMat(), 0, 0, 0, 14);
    axle.rotation.x = P.ROTX;
    g.add(axle);
    var cords = [];
    for (var i = 0; i < 2; i++) {
      var geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, i ? 0.30 : -0.30),
        new THREE.Vector3(0, -0.4, i ? 0.36 : -0.36)
      ]);
      var line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xA98B5E }));
      g.add(line);
      cords.push(line);
    }
    g.userData.cords = cords;
    return { group: g, anchor: mkAnchor(0.06, 0.08, 0.3) };
  }

  function buildClothBeam() { // 布轴 + 布面 + 纬线行(Line ×weftMax)
    var g = group();
    var beam = P.cyl(0.075, 0.075, 0.80, plankMat(), D.clothX, D.warpY, 0, 18);
    beam.rotation.x = P.ROTX;
    g.add(beam);
    var cloth = P.box(0.12, 0.012, 0.70, plankMat(), D.clothX + 0.075, D.warpY - 0.01, 0);
    g.add(cloth);
    var wefts = [];
    for (var i = 0; i < D.weftMax; i++) {
      var geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(D.clothX + 0.06, D.warpY + 0.004, -0.34),
        new THREE.Vector3(D.clothX + 0.06, D.warpY + 0.004, 0.34)
      ]);
      var line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xEDE4CC }));
      line.visible = false;
      g.add(line);
      wefts.push(line);
    }
    g.userData.wefts = wefts;
    return { group: g, anchor: mkAnchor(D.clothX - 0.1, D.warpY + 0.1, 0) };
  }

  function buildShuttle() {  // 梭:船形木梭(尖双头,沿 x 穿行)
    var g = group();
    var body = P.mesh(new THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.028, 0.10, 4, 10) : new THREE.SphereGeometry(0.05, 12, 10),
      plankMat(), 0, 0, 0);
    body.rotation.z = P.ROTZ;
    if (body.scale) body.scale.set(1, 1, 1.25);
    g.add(body);
    g.add(P.sph(0.012, M3.bronze, 0.075, 0, 0));
    g.add(P.sph(0.012, M3.bronze, -0.075, 0, 0));
    return { group: g, anchor: g };
  }

  function buildReed() {     // 筘:梳齿木框(打纬)
    var g = group();
    g.add(P.box(0.045, 0.16, 0.72, plankMat(), 0, 0, 0));
    for (var i = 0; i < 14; i++) {
      g.add(P.box(0.02, 0.12, 0.012, M3.woodD, 0.012, 0, -0.32 + i * (0.64 / 13)));
    }
    return { group: g, anchor: mkAnchor(0.05, 0.12, 0.34) };
  }

  function buildPedals() {   // 双蹑:踏板 ×2(绕销交替摆动)
    var g = group();
    [[-0.15, 0], [0.15, 1]].forEach(function (p) {
      var pin = P.cyl(0.02, 0.02, 0.14, M3.iron, p[0], D.pedalY, D.pedalZ - 0.10, 8);
      pin.rotation.x = P.ROTX;
      g.add(pin);
      var board = P.box(0.42, 0.035, 0.13, plankMat(), p[0] + 0.21, D.pedalY, D.pedalZ + 0.08);
      g.add(board);
    });
    return { group: g, anchor: mkAnchor(0.0, D.pedalY + 0.06, D.pedalZ + 0.16) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "frame", name: "FRAME · 机架", sub: "纵梁四柱 · 吊综顶梁", phase: 0, at: 0.2, dur: 1.5,
      build: buildFrame, target: [0, 0, 0], start: [0, 4.2, 0], mid: [0, 2.1, 0] });
    def({ id: "warpBeam", name: "WARP BEAM · 经轴经线", sub: "16 根 · 经纱沿 x", phase: 1, at: 5.6, dur: 1.5,
      build: buildWarpBeam, target: [0, 0, 0], start: [0.6, 3.6, 0.5], mid: [0.6, 1.8, 0.25] });
    def({ id: "heddle1", name: "HEDDLE · 综框 奇", sub: "吊奇数经 · 升 0.045", phase: 2, at: 10.6, dur: 1.3, kind: "kine",
      build: function () { return buildHeddle(0); }, target: [D.heddleX, D.warpY, 0], off: [0.5, 1.8, 0.8] });
    def({ id: "heddle2", name: "HEDDLE · 综框 偶", sub: "吊偶数经 · 交替升降", phase: 2, at: 11.5, dur: 1.3, kind: "kine",
      build: function () { return buildHeddle(1); }, target: [D.heddleX, D.warpY, 0], off: [-0.5, 1.8, 0.8] });
    def({ id: "shaft", name: "SHAFT · 吊综轴", sub: "双绳反向 · 1:1 交替", phase: 3, at: 15.6, dur: 1.3, kind: "kine",
      build: buildShaft, target: [D.shaftX, D.shaftY, 0], off: [0.4, 1.8, 0.8] });
    def({ id: "clothBeam", name: "CLOTH BEAM · 布轴", sub: "布面 + 纬线行", phase: 3, at: 16.5, dur: 1.3,
      build: buildClothBeam, target: [0, 0, 0], start: [-0.55, 3.4, 0.5], mid: [-0.55, 1.7, 0.25] });
    def({ id: "shuttle", name: "SHUTTLE · 梭", sub: "穿行 0.75m · 梭口内", phase: 4, at: 21.2, dur: 1.2, kind: "kine",
      build: buildShuttle, target: [D.shuttleX0, D.warpY, 0], off: [0.6, 1.4, 0.8] });
    def({ id: "reed", name: "REED · 筘", sub: "打纬 0.12m", phase: 4, at: 22.1, dur: 1.2, kind: "kine",
      build: buildReed, target: [D.reedX, D.warpY, 0], off: [0.4, 1.5, 0.8] });
    def({ id: "pedals", name: "PEDALS · 双蹑", sub: "交替踏板 · 综轴联动", phase: 4, at: 23.0, dur: 1.2, kind: "kine",
      build: buildPedals, target: [0, 0, 0], off: [0.3, 1.4, 0.9] });
  };

  /* —— 运动学分发 ——
     p = 织造相位(passPhase):综升降、梭飞、筘打纬、蹑交替、经线开口、
     吊综绳收放、纬线行显现;errPos = 梭世界 x vs 解析(应≈0)。 */
  var _wp = new THREE.Vector3();
  MECH.KINE = function (st) {
    var passes = st.passes || 0;
    var p = st.passP != null ? st.passP : 0;
    var ph = KS.passPhase(p);
    var dir = passes % 2 === 0 ? 1 : -1;           // 每梭换向
    var lift1 = ph.lift1;                           // 0..1(综1 升程)

    /* 综框升降(交替) */
    var h1 = MECH.Parts.entry("heddle1");
    if (h1 && h1.shown) h1.group.position.y = D.warpY + D.lift * lift1;
    var h2 = MECH.Parts.entry("heddle2");
    if (h2 && h2.shown) h2.group.position.y = D.warpY + D.lift * (1 - lift1);

    /* 梭 */
    var sx = D.shuttleX0 + (D.shuttleX1 - D.shuttleX0) * ph.shuttle * (dir > 0 ? 1 : 1);
    var sy = D.warpY + D.lift * lift1 * (ph.shuttle > 0.02 ? 1 : 1);
    var sh = MECH.Parts.entry("shuttle");
    if (sh && sh.sealed) {
      sh.group.position.set(D.shuttleX0 - D.shuttleTravel * ph.shuttle, D.warpY + 0.02 + D.lift * lift1 * 0.5, 0);
      st.errPos = 0;
      sh.group.updateWorldMatrix(true, false);
      _wp.setFromMatrixPosition(sh.group.matrixWorld);
      st.errPos = Math.abs(_wp.x - (D.shuttleX0 - D.shuttleTravel * ph.shuttle));
    }

    /* 筘打纬 */
    var rd = MECH.Parts.entry("reed");
    if (rd && rd.shown) rd.group.position.x = D.reedX + D.reedStroke * ph.reed;

    /* 蹑交替(摆角) */
    var pd = MECH.Parts.entry("pedals");
    if (pd && pd.shown) pd.group.rotation.z = (lift1 - 0.5) * 0.30;

    /* 吊综轴转角 + 绳收放 */
    var ax = MECH.Parts.entry("shaft");
    if (ax && ax.shown) {
      ax.group.rotation.x = (lift1 - 0.5) * 2.2;
      var cords = ax.group.userData.cords;
      if (cords) {
        var pos0 = cords[0].geometry.attributes.position;
        pos0.setXYZ(1, 0, -0.4 - D.lift * lift1, 0.36);
        pos0.needsUpdate = true;
        var pos1 = cords[1].geometry.attributes.position;
        pos1.setXYZ(1, 0, -0.4 - D.lift * (1 - lift1), -0.36);
        pos1.needsUpdate = true;
      }
    }

    /* 经线开口(奇线随综 1,偶线随综 2)+ 过综后回落 */
    var wb = MECH.Parts.entry("warpBeam");
    if (wb && wb.sealed && wb.group.userData.threads) {
      wb.group.userData.threads.forEach(function (line, i) {
        var z = D.warpZ0 + i * D.warpDX;
        var lift = (i % 2 === 0) ? lift1 : (1 - lift1);
        /* 综前(x 0.25..0.60)抬升,综后回落织口 */
        var pos = line.geometry.attributes.position;
        pos.setXYZ(0, D.warpX, D.warpY + D.lift * lift, z);
        pos.setXYZ(1, D.clothX, D.warpY, z);
        pos.needsUpdate = true;
      });
    }

    /* 纬线行显现(每梭一行,weftMax 循环) */
    var cb = MECH.Parts.entry("clothBeam");
    if (cb && cb.sealed && cb.group.userData.wefts) {
      cb.group.userData.wefts.forEach(function (line, i) {
        line.visible = i < (passes % D.weftMax);
      });
    }
  };
})(window.MECH = window.MECH || {});
