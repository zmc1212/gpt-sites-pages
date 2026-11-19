/* 诸葛连弩部件建模与注册(14 件)。
   布局:弩床沿 +x,弓在前端(+x),箭匣在床上方,杠杆在床下沿 x 往复;
   弦由牙钩推拉;铁矢从匣底落入箭槽,击发后沿 +x 飞向靶。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM;

  function group() { return new THREE.Group(); }

  function buildBed() {   // 弩床 + 支架
    var g = group();
    g.add(P.box(D.bedL, D.bedH, 0.10, M3.woodD, 0, 0, 0));
    g.add(P.box(D.bedL * 0.5, 0.05, 0.22, M3.wood, -0.15, -D.bedH / 2 - 0.03, 0));
    g.add(P.box(0.08, 0.42, 0.22, M3.woodD, -0.30, -0.30, 0));
    g.add(P.box(0.30, 0.06, 0.26, M3.stone, -0.30, -0.54, 0));
    return g;
  }

  function buildBow() {   // 弓臂(弧)+ 弦
    var g = group();
    var bow = group();
    for (var i = -3; i <= 3; i++) {
      var seg = P.box(0.06, D.bowH / 3 + 0.02, 0.035, M3.bronze, 0, 0, 0);
      seg.position.set(0.01, i * (D.bowH / 6.5), 0);
      seg.rotation.z = i * 0.10;
      bow.add(seg);
    }
    bow.position.set(D.bedL / 2 + 0.06, 0, 0);
    g.add(bow);
    var string = P.box(0.012, 1, 0.012, M3.rope, 0, 0, 0);
    string.position.set(D.bedL / 2 - 0.10, 0, 0);
    g.add(string);
    g.userData.string = string;
    return { group: g };
  }

  function buildMagazine() {  // 箭匣(床上方,半剖)+ 匣内 10 矢
    var g = group();
    g.add(P.box(0.34, 0.16, 0.09, M3.wood, -0.18, D.bedH / 2 + 0.14, 0));
    g.add(P.box(0.30, 0.03, 0.07, M3.woodD, -0.18, D.bedH / 2 + 0.06, 0));
    var arrows = [];
    for (var k = 0; k < D.magN; k++) {
      var a = P.cyl(0.008, 0.008, D.arrowL, M3.steel, -0.30 + 0.012, D.bedH / 2 + 0.20 + k * 0.011, 0, 6);
      a.rotation.z = P.ROTZ;
      g.add(a);
      arrows.push(a);
    }
    g.userData.arrows = arrows;
    return { group: g };
  }

  function buildLever() {  // 杠杆(床下往复)+ 牙
    var g = group();
    var bar = P.box(0.9, 0.05, 0.06, M3.woodD, 0, 0, 0);
    g.add(bar);
    var grip = P.cyl(0.03, 0.03, 0.16, M3.woodL, -0.42, 0, 0, 8);
    grip.rotation.z = P.ROTZ;
    g.add(grip);
    var tooth = P.box(0.05, 0.09, 0.05, M3.iron, 0.18, 0.06, 0);
    g.add(tooth);
    g.userData.tooth = tooth;
    return { group: g };
  }

  function buildLoadedArrow() {  // 槽内待发矢
    var g = group();
    var a = P.cyl(0.009, 0.009, D.arrowL, M3.steel, 0, 0, 0, 6);
    a.rotation.z = P.ROTZ;
    g.add(a);
    var tip = P.mesh(new THREE.ConeGeometry(0.02, 0.05, 8), M3.iron, D.arrowL / 2 + 0.02, 0, 0);
    tip.rotation.z = -Math.PI / 2;
    g.add(tip);
    return { group: g };
  }

  function buildFlyingArrow() {  // 飞行矢(world 系)
    var g = group();
    var a = P.cyl(0.009, 0.009, D.arrowL, M3.steel, 0, 0, 0, 6);
    a.rotation.z = P.ROTZ;
    g.add(a);
    var tip = P.mesh(new THREE.ConeGeometry(0.02, 0.05, 8), M3.iron, D.arrowL / 2 + 0.02, 0, 0);
    tip.rotation.z = -Math.PI / 2;
    g.add(tip);
    return { group: g };
  }

  function buildTarget() {  // 靶(world 固定)
    var g = group();
    g.add(P.box(0.06, 1.0, 1.0, M3.wood, D.targetX, 0.5, 0));
    g.add(P.cyl(0.26, 0.26, 0.03, M3.white, D.targetX - 0.04, 0.5, 0, 24));
    g.children[1].rotation.z = P.ROTZ;
    return g;
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "target", name: "TARGET · 靶", sub: "8 m · world 固定", phase: 0, kind: "none", world: true,
      build: buildTarget, target: [0, 0, 0] });
    def({ id: "bed", name: "BED · 弩床", sub: "床长三尺六寸(演示)", phase: 0, at: 0.15, dur: 1.1,
      build: buildBed, target: [0, 0.62, 0], start: [0, 3.2, 2.4], mid: [0, 1.9, 1.1], anchor: [0, 0.1, 0.4] });
    def({ id: "bow", name: "BOW · 弓臂与弦", sub: "弦由牙钩推拉", phase: 0, at: 1.3, dur: 1.1, kind: "kine",
      build: buildBow, target: [0, 0.62, 0], off: [0.6, 1.6, 1.6] });
    def({ id: "magazine", name: "MAGAZINE · 矢匣 10 矢", sub: "以铁为矢,长八寸", phase: 1, at: 3.4, dur: 1.2, kind: "kine",
      build: buildMagazine, target: [0, 0.62, 0], off: [0, 1.8, 1.8] });
    def({ id: "lever", name: "LEVER · 杠杆+牙", sub: "往复装填击发", phase: 1, at: 4.2, dur: 1.1, kind: "kine",
      build: buildLever, target: [0, 0.62 - D.bedH / 2 - 0.07, 0], off: [-0.5, 1.5, 1.5] });
    def({ id: "loaded", name: "ARROW · 槽内矢", sub: "待发", phase: 2, at: 6.4, dur: 1.0, kind: "kine",
      build: buildLoadedArrow, target: [-0.10, 0.62 + 0.015, 0], off: [0, 1.5, 1.5] });
    def({ id: "flying", name: "ARROW · 击发矢", sub: "world 抛体", phase: 3, at: 9.6, dur: 0.8, kind: "kine",
      build: buildFlyingArrow, target: [0, 0.62, 0], off: [0, 1.2, 2.0] });
  };

  /* —— 运动学分发 —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("lever");
    if (e && e.shown) {
      e.group.position.x = st.lever;
      e.group.rotation.z = st.lever * 0.12;
    }
    /* 弦:被牙推拉(局部 x = string 偏移) */
    e = MECH.Parts.entry("bow");
    if (e && e.shown) e.group.userData.string.position.x = D.bedL / 2 - 0.10 + st.string;
    /* 匣内余矢可见性 */
    e = MECH.Parts.entry("magazine");
    if (e && e.shown) {
      e.group.userData.arrows.forEach(function (a, k) {
        a.visible = k < st.arrows;
      });
    }
    /* 槽内矢:有箭且非飞行时可见,位置=待发位 */
    e = MECH.Parts.entry("loaded");
    if (e && e.shown) {
      e.group.visible = st.arrows > 0 && !st.flight;
      e.group.position.set(-0.10 + st.string * 0.2, 0.62 + 0.015, 0);
    }
    /* 飞行矢:世界系直线飞靶 */
    e = MECH.Parts.entry("flying");
    if (e && e.shown) {
      if (st.flight) {
        var t = Math.min(1, (st.time - st.flight.t0) / D.flyT);
        e.group.visible = true;
        e.group.position.set(0.4 + (D.targetX - 0.4) * t, 0.62 + 0.03 * Math.sin(t * Math.PI) - 0.02 * t, 0);
      } else {
        e.group.visible = false;
      }
    }
  };
})(window.MECH = window.MECH || {});
