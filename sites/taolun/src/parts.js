/* 快轮制陶部件建模与注册(7 件)。
   布局:陶车立轴居原点(石硖座埋地示意),下拨盘(y0.28 r0.42)+ 上工作盘
   (y0.62 r0.34)同轴;泥料(三层圆柱 morph)居上盘中;拨棍自西南斜指下盘沿
   (tick 拨角摆动);利刀+刀架在东;水盆在东南。kine:wheel 只写 rotation.y。
   标签锚点:build 返回 anchor。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM;

  function group() { return new THREE.Group(); }
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  function buildBase() {
    var g = group();
    g.add(P.cyl(0.48, 0.55, 0.16, new THREE.MeshStandardMaterial({ color: 0x4E5258, roughness: 0.94 }), 0, 0.08, 0, 32));
    g.add(P.cyl(0.14, 0.16, 0.34, M3.woodD, 0, 0.33, 0, 14));
    g.add(P.cyl(0.075, 0.075, 0.10, M3.bronze, 0, 0.52, 0, 12));
    return { group: g, anchor: mkAnchor(0.55, 0.35, 0) };
  }

  /* 立轴 + 双盘(kine:rotation.y = θ) */
  function buildWheel() {
    var g = group();
    g.add(P.cyl(0.065, 0.065, 0.52, M3.woodD, 0, 0.26, 0, 12));
    var drive = P.cyl(D.Rdrive, D.Rdrive, 0.06, M3.woodD, 0, -0.34, 0, 40);
    drive.position.y = 0.28 - 0.62 + 0.26;
    drive.position.y = -0.34;
    g.add(drive);
    var work = P.cyl(D.Rwork, D.Rwork, 0.05, M3.woodL, 0, 0.0, 0, 40);
    g.add(work);
    /* 拨槽刻痕(下盘沿 8 槽) */
    for (var i = 0; i < 8; i++) {
      var a = i / 8 * Math.PI * 2;
      var slot = P.box(0.03, 0.05, 0.05, M3.wood, Math.cos(a) * (D.Rdrive - 0.02), -0.33, Math.sin(a) * (D.Rdrive - 0.02));
      slot.rotation.y = -a;
      g.add(slot);
    }
    return { group: g, anchor: mkAnchor(D.Rwork, 0.12, 0) };
  }

  /* 泥料:三层圆柱 morph(拉坯:筒→碗,收口)——tick 经 userData.anim 驱动 */
  function buildClay() {
    var g = group();
    var mat = new THREE.MeshStandardMaterial({ color: 0xA9836B, roughness: 0.92 });
    var layers = [];
    for (var i = 0; i < 3; i++) {
      var m = P.cyl(0.13, 0.15, 0.045, mat, 0, 0.045 + i * 0.048, 0, 22);
      m.castShadow = true;
      g.add(m);
      layers.push(m);
    }
    g.userData.anim = { layers: layers };
    return { group: g, anchor: mkAnchor(0, 0.30, 0) };
  }

  /* 拨棍:斜持竹棍指向下盘沿(tick 拨角摆动) */
  function buildStick() {
    var g = group();
    var holder = group();
    holder.position.set(-0.78, 0.42, 0.30);
    holder.rotation.set(0.9, 0.75, 0);
    var stick = P.cyl(0.022, 0.028, 0.85, M3.woodL, 0, 0.30, 0, 10);
    holder.add(stick);
    g.add(holder);
    g.userData.anim = { holder: holder, baseRotX: 0.9 };
    return { group: g, anchor: mkAnchor(-0.78, 0.75, 0.30) };
  }

  /* 利刀+刀架(东缘,过利刀二次) */
  function buildKnife() {
    var g = group();
    g.add(P.box(0.07, 0.50, 0.07, M3.woodD, 0.62, 0.25, 0));
    g.add(P.box(0.26, 0.05, 0.10, M3.woodD, 0.50, 0.60, 0));
    var blade = P.box(0.05, 0.10, 0.015, M3.steel, 0.40, 0.545, 0);
    blade.rotation.z = -0.2;
    g.add(blade);
    g.userData.anim = { blade: blade };
    return { group: g, anchor: mkAnchor(0.62, 0.62, 0) };
  }

  /* 水盆(东南,拉坯蘸水) */
  function buildPot() {
    var g = group();
    g.add(P.cyl(0.20, 0.16, 0.14, M3.woodD, 0.55, 0.10, 0.55, 18));
    g.add(P.cyl(0.16, 0.16, 0.04, M3.water, 0.55, 0.16, 0.55, 18));
    return { group: g, anchor: mkAnchor(0.55, 0.30, 0.55) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "base", name: "BASE · 陶车座", sub: "竖木埋三尺 · 石硖座", phase: 0, at: 0.2, dur: 1.2,
      build: buildBase, target: [0, 0, 0], start: [0, 3.0, -1.0], mid: [0, 1.6, -0.5], anchor: [0, 0.5, 0] });
    def({ id: "wheel", name: "WHEEL · 立轴双盘", sub: "下拨盘 r0.42 · 上工作盘 r0.34", phase: 1, at: 5.3, dur: 1.3, kind: "kine",
      build: buildWheel, target: [0, D.axleH, 0], off: [0.8, 2.2, 1.0] });
    def({ id: "clay", name: "CLAY · 泥料拉坯", sub: "筒→碗 收口成形", phase: 2, at: 10.3, dur: 1.3,
      build: buildClay, target: [0, 0, 0], start: [0, 2.6, 0.6], mid: [0, 1.5, 0.3], anchor: [0, 0.85, 0] });
    def({ id: "stick", name: "STICK · 拨棍", sub: "短竹棍拨运盘沿", phase: 3, at: 16.3, dur: 1.2,
      build: buildStick, target: [0, 0, 0], start: [-1.5, 2.4, 1.0], mid: [-1.0, 1.3, 0.6], anchor: [0, 1.1, 0.3] });
    def({ id: "knife", name: "KNIFE · 利刀刀架", sub: "过利刀二次", phase: 3, at: 17.4, dur: 1.1,
      build: buildKnife, target: [0, 0, 0], start: [1.5, 2.6, -0.6], mid: [1.0, 1.4, -0.3], anchor: [0, 0.8, 0] });
    def({ id: "pot", name: "WATER · 水盆", sub: "拉坯蘸水", phase: 3, at: 18.3, dur: 1.0,
      build: buildPot, target: [0, 0, 0], start: [1.3, 2.0, 1.2], mid: [0.9, 1.0, 0.8], anchor: [0, 0.4, 0.55] });
  };

  /* —— 运动学分发(每帧) —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("wheel");
    if (e && e.shown) e.group.rotation.y = st.theta;
  };
})(window.MECH = window.MECH || {});
