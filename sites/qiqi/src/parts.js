/* 欹器部件建模与注册(8 件)。
   坐标系:y 上;枢在器腰(y 0 局部),器组原点 = 枢轴心 (0, pivotY, 0);
   倾转绕 z 轴(θ>0 口向左翻);止挡在器右侧(θrest = −58° 时倚靠);
   沥水盘在下方承接;重心指示球为世界件随解析移动。
   全部几何位于地面之上。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;

  function group() { return new THREE.Group(); }
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  var _bronze = null;
  function bronzeMat() {
    if (!_bronze) {
      var c = document.createElement("canvas");
      c.width = c.height = 128;
      var x = c.getContext("2d");
      x.fillStyle = "#8A6E3F";
      x.fillRect(0, 0, 128, 128);
      for (var i = 0; i < 300; i++) {
        var g = 110 + Math.random() * 50;
        x.fillStyle = "rgba(" + (g | 0) + "," + ((g * 0.8) | 0) + "," + ((g * 0.45) | 0) + ",0.4)";
        x.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
      }
      var t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
      t.encoding = THREE.sRGBEncoding;
      _bronze = new THREE.MeshStandardMaterial({ map: t, metalness: 0.5, roughness: 0.5 });
    }
    return _bronze;
  }

  /* —— 部件构建器 —— */

  function buildTable() {   // 案几:几面 + 四腿
    var g = group();
    g.add(P.box(1.60, 0.10, 0.66, plankLocal(), 0, D.tableH, 0));
    [[-0.65, -0.22], [0.65, -0.22], [-0.65, 0.22], [0.65, 0.22]].forEach(function (p) {
      g.add(P.box(0.11, D.tableH, 0.11, M3.woodD, p[0], D.tableH / 2, p[1]));
      g.add(P.box(0.24, 0.05, 0.24, M3.stone, p[0], 0.025, p[1]));
    });
    /* 双枢销(器耳支点,z ±0.24) */
    [1, -1].forEach(function (s) {
      g.add(P.cyl(0.022, 0.022, 0.10, M3.iron, 0, D.pivotY, s * 0.24, 8));
    });
    return { group: g, anchor: mkAnchor(0.55, D.tableH + 0.08, 0.2) };
  }

  function buildStopBasin() { // 止挡柱 + 沥水盘
    var g = group();
    g.add(P.cyl(0.035, 0.045, 0.30, M3.woodD, 0.42, D.tableH + 0.15, 0, 10));
    var slab = new THREE.MeshStandardMaterial({ color: 0x82868C, roughness: 0.88 });
    g.add(P.box(1.10, 0.05, 0.60, slab, 0, 0.025, 0.52));
    g.add(P.box(1.10, 0.10, 0.04, slab, 0, 0.10, 0.52 + 0.28));
    g.add(P.box(1.10, 0.10, 0.04, slab, 0, 0.10, 0.52 - 0.28));
    return { group: g, anchor: mkAnchor(0.45, D.tableH + 0.32, 0.1) };
  }

  function buildVessel() {  // 欹器:双锥身 + 口沿 + 双耳 + 内水面(kine 倾转)
    var g = group();
    var bm = bronzeMat();
    /* 身:下锥(尖底)+ 上锥(敞口),LatheGeometry 两段 */
    var pts = [];
    var N = 14;
    for (var i = 0; i <= N; i++) {
      var y = D.yTip + (0 - D.yTip) * i / N;
      pts.push(new THREE.Vector2(KS.innerR(y), y));
    }
    for (var j = 1; j <= N; j++) {
      var y2 = D.yMouth * j / N;
      pts.push(new THREE.Vector2(KS.innerR(y2) + 0.012, y2));
    }
    var body = P.mesh(new THREE.LatheGeometry(pts, 26), bm, 0, 0, 0);
    g.add(body);
    /* 口沿 */
    var rim = P.torus(KS.innerR(D.yMouth) + 0.02, 0.02, bm, 0, D.yMouth, 0, 24);
    rim.rotation.x = P.ROTX;
    g.add(rim);
    /* 双耳(枢环,z ±0.24) */
    [1, -1].forEach(function (s) {
      var ear = P.torus(0.045, 0.014, M3.iron, 0, 0.0, s * 0.24, 14);
      g.add(ear);
    });
    /* 尖底足 */
    g.add(P.cyl(0.03, 0.05, 0.05, bm, 0, D.yTip - 0.02, 0, 10));
    /* 内水面(圆盘,kine 缩放) */
    var water = P.mesh(new THREE.CircleGeometry(0.18, 22), M3.water, 0, 0, 0);
    water.rotation.x = -Math.PI / 2;
    water.visible = false;
    g.add(water);
    g.userData.water = water;
    return { group: g, anchor: mkAnchor(0.18, 0.15, 0.24) };
  }

  function buildEwer() {    // 注水壶:斜置执壶(外层组位由 target 管理,内层倾角)
    var outer = group();
    var tiltG = group();
    tiltG.rotation.z = 0.62;
    outer.add(tiltG);
    var body = P.sph(0.13, bronzeMat(), 0, 0, 0);
    body.scale.set(1, 0.9, 1);
    tiltG.add(body);
    tiltG.add(P.cyl(0.03, 0.042, 0.20, bronzeMat(), -0.06, 0.14, 0, 10));
    tiltG.add(P.box(0.03, 0.035, 0.10, bronzeMat(), 0.12, 0.02, 0));
    outer.userData.tiltG = tiltG;
    return { group: outer, anchor: mkAnchor(-0.55, 0.22, 0.3) };
  }

  function buildMarker() {  // 重心指示球(绿=枢下 / 红=枢上,kine)
    var g = group();
    var ball = P.sph(0.038, M3.white, 0, 0, 0);
    g.add(ball);
    var ring = P.torus(0.06, 0.008, M3.iron, 0, 0, 0, 16);
    ring.rotation.x = P.ROTX;
    g.add(ring);
    g.userData.ball = ball;
    g.userData.mats = [
      new THREE.MeshStandardMaterial({ color: 0x6FBF73, roughness: 0.5 }),   // 枢下 稳(绿)
      new THREE.MeshStandardMaterial({ color: 0xD6543A, roughness: 0.5 })    // 枢上 不稳(红)
    ];
    return { group: g, anchor: g };
  }

  var _plank = null;
  function plankLocal() {
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

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "table", name: "TABLE · 案几枢销", sub: "几面 0.92 · 双枢销", phase: 0, at: 0.2, dur: 1.4,
      build: buildTable, target: [0, 0, 0], start: [0, 4.2, 0], mid: [0, 2.1, 0] });
    def({ id: "stopBasin", name: "STOP+PAN · 止挡沥盘", sub: "倚靠止挡 · 承水盘", phase: 0, at: 1.5, dur: 1.2,
      build: buildStopBasin, target: [0, 0, 0], start: [0.3, 3.6, 0.5], mid: [0.2, 1.8, 0.25] });

    def({ id: "vessel", name: "VESSEL · 欹器", sub: "尖底敞口 · 双耳悬枢", phase: 1, at: 6.8, dur: 1.6, kind: "kine",
      build: buildVessel, target: [0, D.pivotY, 0], off: [0.5, 2.0, 0.8] });
    def({ id: "ewer", name: "EWER · 注水壶", sub: "斜执壶 · 缓注", phase: 2, at: 12.2, dur: 1.3,
      build: buildEwer, target: [-0.62, D.tableH + 0.26, 0.30], start: [-0.7, 4.0, 0.5], mid: [-0.65, 2.0, 0.25] });

    def({ id: "marker", name: "CG MARKER · 重心球", sub: "绿=枢下稳 / 红=枢上不稳", phase: 3, at: 18.4, dur: 1.2, kind: "kine",
      build: buildMarker, target: [0, D.pivotY - 0.2, 0.34], off: [0.4, 1.4, 0.6] });
  };

  /* —— 运动学分发 ——
     θ(f, flip) 纯函数;水面盘随注水升降(正立时);CG 球随解析移动,
     颜色按枢上/枢下;errPos = 口沿缘点 vs 解析(枢 + Ry·局部),应≈0。 */
  var _wp = new THREE.Vector3();
  MECH.KINE = function (st) {
    var f = st.fill != null ? st.fill : 0;
    var flip = st.flip || 0;
    var theta = KS.vesselAngle(f, flip);
    var s = KS.fillState(f);

    var vs = MECH.Parts.entry("vessel");
    if (vs && vs.shown) {
      vs.group.rotation.z = KS.rad(theta);
      /* 内水面:正立且 f>0.02 时显示,高度 = 注水面 h */
      var water = vs.group.userData.water;
      if (water) {
        var upright = Math.abs(theta) < 8;
        water.visible = upright && f > 0.02 && flip === 0;
        if (water.visible) {
          var rr = KS.innerR(s.h) - 0.02;
          water.scale.set(rr / 0.18, rr / 0.18, 1);
          water.position.y = s.h - 0.008;
        }
      }
    }

    st.errPos = 0;
    if (vs && vs.sealed) {
      vs.group.updateWorldMatrix(true, false);
      _wp.set(0, D.yMouth, 0).applyMatrix4(vs.group.matrixWorld);
      /* 口沿前缘解析:枢 + Rz(θ)·(0, yMouth) */
      var ax = -Math.sin(KS.rad(theta)) * D.yMouth;
      var ay = D.pivotY + Math.cos(KS.rad(theta)) * D.yMouth;
      st.errPos = Math.sqrt((_wp.x - ax) * (_wp.x - ax) + (_wp.y - ay) * (_wp.y - ay));
    }

    /* CG 指示球 */
    var mk = MECH.Parts.entry("marker");
    if (mk && mk.sealed) {
      mk.group.visible = st.showCG || false;
      mk.group.position.set(0.32, D.pivotY + s.yCG, 0.30);
      var ball = mk.group.userData.ball;
      if (ball) ball.material = mk.group.userData.mats[s.yCG > 0 ? 1 : 0];
    }

    /* 注水壶倾斜持握 */
    var ew = MECH.Parts.entry("ewer");
    if (ew && ew.shown && ew.group.userData.tiltG) {
      ew.group.userData.tiltG.rotation.z = 0.62 + (st.pouring ? 0.08 * Math.sin(st.time * 2.2) : 0);
    }
  };
})(window.MECH = window.MECH || {});
