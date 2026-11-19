/* 风扇车部件建模与注册(10 件)。
   布局:立式圆箱风道(沿 X 放置:左端进谷漏斗,右端两出口);
   扇叶轮在箱左腔(绕 X 轴);谷粒自漏斗经活门落入风道,被风右吹分级。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM;

  function group() { return new THREE.Group(); }

  function buildStand() {
    var g = group();
    [[-0.30, 0.22], [-0.30, -0.22], [0.28, 0.22], [0.28, -0.22]].forEach(function (c) {
      g.add(P.box(0.07, 0.42, 0.07, M3.woodD, c[0], 0.21, c[1]));
    });
    g.add(P.box(0.9, 0.05, 0.62, M3.woodL, 0, 0.03, 0));
    return g;
  }

  function buildBox() {   // 风道箱(半透顶盖):圆腔左 + 渐扩风道右
    var g = group();
    for (var s = -1; s <= 1; s += 2) {
      g.add(P.box(D.boxL + 0.08, D.boxH, 0.03, M3.wood, 0, 0, s * (D.boxW / 2 + 0.02)));
    }
    g.add(P.box(0.05, D.boxH, D.boxW, M3.woodD, -(D.boxL / 2 + 0.02), 0, 0));   // 左端板
    var round = P.cyl(D.boxW / 2, D.boxW / 2, 0.03, M3.woodD, -(D.boxL / 2 - 0.21), D.boxH / 2 + 0.015, 0, 30);
    g.add(round);   // 圆腔顶(半透感)
    /* 右端两出口隔板 */
    g.add(P.box(0.03, D.boxH, D.boxW, M3.wood, D.boxL / 2 + 0.02, 0, 0));
    g.add(P.box(0.03, D.boxH * 0.42, D.boxW, M3.woodD, D.boxL / 2 - 0.30, D.boxH / 2 - D.boxH * 0.21, 0));  // 中隔(远口上)
    return g;
  }

  function buildFan() {   // 扇叶轮:6 叶(绕 X 轴)
    var g = group();
    var hub = P.cyl(0.05, 0.05, 0.24, M3.woodD, 0, 0, 0, 14);
    hub.rotation.x = P.ROTX;
    g.add(hub);
    var axle = P.cyl(0.025, 0.025, 0.62, M3.steelD, 0, 0, 0, 8);
    axle.rotation.x = P.ROTX;
    g.add(axle);
    var handle = P.cyl(0.03, 0.03, 0.10, M3.woodL, 0.34, 0, 0, 8);
    handle.rotation.z = P.ROTZ;
    g.add(handle);
    var blades = [];
    for (var i = 0; i < D.blades; i++) {
      var a = i / D.blades * Math.PI * 2;
      var b = P.box(0.02, D.fanR - 0.05, 0.15, M3.woodL, 0, 0, 0);
      b.position.set(0, Math.cos(a) * D.fanR * 0.55, Math.sin(a) * D.fanR * 0.55);
      b.rotation.x = a + 0.6;   // 叶片安装角
      g.add(b);
      blades.push(b);
    }
    g.userData.blades = blades;
    return { group: g };
  }

  function buildHopper() {   // 上漏斗 + 活门
    var g = group();
    var funnel = group();
    funnel.add(P.box(0.30, 0.04, 0.26, M3.woodD, 0, 0, 0));
    for (var s = -1; s <= 1; s += 2) {
      var wall = P.box(0.30, 0.14, 0.03, M3.wood, 0, 0.07, s * 0.115);
      wall.rotation.x = s * 0.35;
      funnel.add(wall);
    }
    [-1, 1].forEach(function (s) {
      var wall = P.box(0.03, 0.14, 0.26, M3.wood, s * 0.135, 0.07, 0);
      wall.rotation.z = -s * 0.35;
      funnel.add(wall);
    });
    funnel.position.set(-(D.boxL / 2 - 0.21), D.hopperY - D.boxH / 2 - 0.42 - 0.10, 0);
    var gate = P.box(0.20, 0.015, 0.16, M3.iron, -(D.boxL / 2 - 0.21), D.hopperY - D.boxH / 2 - 0.55, 0);
    g.add(funnel);
    g.add(gate);
    g.userData.gate = gate;
    return { group: g };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "stand", name: "STAND · 支架", sub: "四足底板", phase: 0, kind: "none",
      build: buildStand, target: [0, 0, 0] });
    def({ id: "box", name: "BOX · 风道箱", sub: "圆腔 + 渐扩风道 + 两出口", phase: 0, at: 0.15, dur: 1.3,
      build: buildBox, target: [0, D.boxH / 2 + 0.42, 0], start: [0, 3.6, 2.2], mid: [0, 2.4, 1.1], anchor: [0, 0.3, 0.5] });
    def({ id: "fan", name: "FAN · 扇叶轮 6 叶", sub: "手摇曲柄 · 绕 X 轴", phase: 1, at: 3.4, dur: 1.2, kind: "kine",
      build: buildFan, target: [-(D.boxL / 2 - 0.21), D.boxH / 2 + 0.42, 0], off: [-0.8, 1.6, 1.8] });
    def({ id: "hopper", name: "HOPPER · 谷斗+活门", sub: "率 ∝ 活门", phase: 2, at: 5.6, dur: 1.2, kind: "kine",
      build: buildHopper, target: [0, 0, 0], off: [0, 1.8, 1.8] });
  };

  /* —— 运动学分发 —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("fan");
    if (e && e.shown) e.group.rotation.x = st.phi;
    e = MECH.Parts.entry("hopper");
    if (e && e.shown) e.group.userData.gate.rotation.x = -st.gate * 0.6;
    /* 出口糠尘 */
    if (st.airOut && Math.random() < 0.25) {
      MECH.Scene3D.spawnPuff(D.boxL / 2 + 0.12, D.boxH / 2 + 0.42 + 0.18, (Math.random() - 0.5) * 0.2, {
        max: 0.8, base: 0.2, vx: 0.6 + Math.random() * 0.4, vy: 0.25, vz: (Math.random() - 0.5) * 0.2,
        opacity: 0.4, tint: 0xD8C8A8, grow: 1.6
      });
    }
  };
})(window.MECH = window.MECH || {});
