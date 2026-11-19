/* 三锭脚踏纺车部件建模与注册(15 件)。
   布局:机架横放,大绳轮右侧(平面 Y-Z,绕 X 轴),左端三锭并列(锭轴沿 X);
   三条绳圈自大轮分绕三锭轮;踏板×2 经曲柄连杆驱动大轮。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM;

  function group() { return new THREE.Group(); }

  function buildFrame() {
    var g = group();
    [-0.55, 0.55].forEach(function (z) {
      g.add(P.box(1.5, 0.08, 0.10, M3.woodD, 0, 0.42, z));
      g.add(P.box(0.08, 0.42, 0.10, M3.woodD, -0.68, 0.21, z));
      g.add(P.box(0.08, 0.42, 0.10, M3.woodD, 0.62, 0.21, z));
    });
    g.add(P.box(1.3, 0.05, 1.2, M3.woodL, 0, 0.03, 0));
    return g;
  }

  function buildWheel() {   // 大绳轮:双圈 + 12 辐 + 绳槽
    var g = group();
    g.add(P.torus(D.R, 0.028, M3.woodD, 0, 0, 0, 40));
    g.add(P.torus(D.R - 0.05, 0.022, M3.wood, 0, 0, 0, 38));
    for (var i = 0; i < D.spokeN; i++) {
      var a = i / D.spokeN * Math.PI * 2;
      var s = P.box(0.04, D.R - 0.06, 0.04, M3.wood, 0, 0, 0);
      s.position.set(Math.cos(a) * (0.05 + (D.R - 0.06) / 2), Math.sin(a) * (0.05 + (D.R - 0.06) / 2), 0);
      s.rotation.z = a - Math.PI / 2;
      g.add(s);
    }
    var hub = P.cyl(0.06, 0.06, 0.20, M3.woodD, 0, 0, 0, 14);
    hub.rotation.x = P.ROTX;
    g.add(hub);
    var crank = group();
    crank.add(P.box(0.06, D.crankR + 0.03, 0.045, M3.woodD, 0, (D.crankR + 0.03) / 2 - 0.01, 0));
    crank.add(P.cyl(0.02, 0.02, 0.12, M3.steelD, 0, D.crankR, 0, 8));
    g.add(crank);
    g.userData.crank = crank;
    return { group: g };
  }

  function buildSpindle(k) {   // 锭子:锭轴(沿 X)+ 锭轮 + 纱团
    var g = group();
    var axle = P.cyl(0.014, 0.014, 0.62, M3.steel, -0.31, 0, 0, 8);
    axle.rotation.z = P.ROTZ;
    g.add(axle);
    var tip = P.cyl(0.004, 0.014, 0.10, M3.iron, -0.64, 0, 0, 6);
    tip.rotation.z = P.ROTZ;
    g.add(tip);
    var wh = P.cyl(D.rSp, D.rSp, 0.05, M3.woodD, -0.10, 0, 0, 14);
    wh.rotation.z = P.ROTZ;
    g.add(wh);
    var yarn = P.cyl(1, 1, 0.09, new THREE.MeshStandardMaterial({ color: 0xD8C08E, roughness: 0.9 }), -0.55, 0, 0, 10);
    yarn.rotation.z = P.ROTZ;
    yarn.scale.setScalar(Math.max(0.001, 0.05));
    g.add(yarn);
    g.userData.spindle = g;
    g.userData.wh = wh;
    g.userData.yarn = yarn;
    g.userData.k = k;
    return { group: g };
  }

  function buildPedal(side) {  // 踏板 + 连杆
    var g = group();
    var pedal = P.box(D.pedalL, 0.04, 0.11, M3.woodD, 0, 0, 0);
    g.add(pedal);
    g.userData.side = side;
    return { group: g };
  }

  function buildRopes() {  // 三条绳圈(示意,张力线)
    var g = group();
    var lines = [];
    D.zSpindles.forEach(function (z) {
      var geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.62, 0.62, z * 0.9),
        new THREE.Vector3(-0.20, 0.42, z)
      ]);
      var line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xC8B896, transparent: true, opacity: 0.75 }));
      g.add(line);
      lines.push(line);
    });
    g.userData.lines = lines;
    return { group: g };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "frame", name: "FRAME · 机架", sub: "横架双足", phase: 0, at: 0.15, dur: 1.1,
      build: buildFrame, target: [0, 0, 0], start: [0, 3.4, 2.6], mid: [0, 2.0, 1.2], anchor: [0, 0.45, 0.6] });
    def({ id: "wheel", name: "WHEEL · 大绳轮", sub: "径二尺三寸 · 12 辐", phase: 0, at: 1.4, dur: 1.3, kind: "kine",
      build: buildWheel, target: [0.62, 0.62, 0], off: [0, 1.4, 2.8] });
    def({ id: "pedalL", name: "PEDAL · 踏板 L", sub: "曲柄摇杆(相位 0)", phase: 1, at: 3.6, dur: 1.0, kind: "kine",
      build: function () { return buildPedal(0); }, target: [0.62 + D.crankR, 0.24, 0.30], off: [0.4, 1.2, 1.6] });
    def({ id: "pedalR", name: "PEDAL · 踏板 R", sub: "曲柄摇杆(相位 90°)", phase: 1, at: 4.2, dur: 1.0, kind: "kine",
      build: function () { return buildPedal(1); }, target: [0.62 + D.crankR, 0.24, -0.30], off: [-0.4, 1.2, 1.6] });

    for (var k = 0; k < D.nSp; k++) {
      def({ id: "sp" + k, name: "SPINDLE · 锭子 " + (k + 1), sub: "锭轮 r 0.021 · 绳圈传动", phase: 2, at: 6.3 + k * 0.6, dur: 1.0, kind: "kine",
        build: (function (kk) { return function () { return buildSpindle(kk); }; })(k),
        target: [-0.20, 0.42, D.zSpindles[k]], off: [0, 1.3, 2.2] });
    }
    def({ id: "ropes", name: "ROPES · 绳圈 ×3", sub: "大轮→锭轮 传动", phase: 3, kind: "none",
      build: buildRopes, target: [0, 0, 0], anchor: null });
  };

  /* —— 运动学分发 —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("wheel");
    if (e && e.shown) {
      e.group.rotation.x = st.phi;
      e.group.userData.crank.rotation.x = st.phi;
      e.group.userData.crank.children[1].position.set(0, D.crankR * Math.cos(st.phi) * 0, 0);
      e.group.userData.crank.children[1].position.y = D.crankR;
      e.group.userData.crank.children[1].position.z = 0;
      e.group.userData.crank.children[1].rotation.x = st.phi;
    }
    /* 踏板:曲柄销位置(随相位),踏板水平 */
    var pl = MECH.Parts.entry("pedalL");
    if (pl && pl.shown) {
      var a0 = st.pedal[0];
      pl.group.position.set(0.62 + D.crankR * Math.cos(a0) * 0.9, 0.62 - D.crankR + D.crankR * Math.sin(a0) * 0.6, 0.30);
      pl.group.rotation.z = Math.sin(a0) * 0.18;
    }
    var pr = MECH.Parts.entry("pedalR");
    if (pr && pr.shown) {
      var a1 = st.pedal[1];
      pr.group.position.set(0.62 + D.crankR * Math.cos(a1) * 0.9, 0.62 - D.crankR + D.crankR * Math.sin(a1) * 0.6, -0.30);
      pr.group.rotation.z = Math.sin(a1) * 0.18;
    }
    /* 三锭:锭轮轴 = 锭轴(沿 X)→ rotation.x = phi×ratio */
    var spw = D.spOmegaOf(st.omega);
    for (var k = 0; k < D.nSp; k++) {
      var s = MECH.Parts.entry("sp" + k);
      if (s && s.shown) {
        s.group.userData.wh.rotation.x = st.phi * D.ratio;
        s.group.userData.yarn.rotation.x = st.phi * D.ratio;
        s.group.userData.yarn.scale.set(Math.max(0.001, st.spYarn[k]), 1, Math.max(0.001, st.spYarn[k]));
      }
    }
  };
})(window.MECH = window.MECH || {});
