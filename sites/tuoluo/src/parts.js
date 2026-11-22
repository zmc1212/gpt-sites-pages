/* 陀螺部件建模与注册(5 件)。
   布局:地面(硬地小台)中央陀螺:嵌套组 = tipGroup(支点原点)→ precess(rotation.y
   = 进动角)→ tilt(rotation.x = 轴倾角)→ spinner(rotation.y = 自转φ),体几何
   沿局部 +Y;鞭(鞭杆+绳弧,tick 扫击动画);影盘(顶视旋转影)。
   kine:tipGroup 子组旋转由 userData.anim 驱动(支点原点,体沿倾斜轴偏移)。
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

  /* 地面小台(硬地) */
  function buildGround() {
    var g = group();
    g.add(P.box(1.1, 0.06, 1.1, new THREE.MeshStandardMaterial({ color: 0x5A4A38, roughness: 0.95 }), 0, 0.03, 0));
    g.add(P.cyl(0.30, 0.30, 0.006, new THREE.MeshStandardMaterial({ color: 0x3E3428, roughness: 0.95 }),
      0, 0.064, 0, 24));
    return { group: g, anchor: mkAnchor(0.4, 0.1, 0.4) };
  }

  /* 陀螺(嵌套四层:tip→precess→tilt→spin) */
  function buildTop() {
    var g = group();
    var tip = group(); tip.position.set(0, 0.066, 0);          // 支点(台面)
    var precess = group();
    var tiltG = group();
    var spin = group();
    /* 体:圆柱身 + 锥底 + 顶面环 */
    spin.add(P.cyl(D.Rbody, D.Rbody * 0.55, D.hBody * 0.62, M3.lacquer, 0, D.rCM + 0.008, 0, 22));
    spin.add(P.cyl(D.Rbody * 0.55, 0.008, D.hBody * 0.38, M3.woodD, 0, 0.006, 0, 18));
    spin.add(P.cyl(0.012, 0.016, 0.014, M3.brass, 0, D.hBody * 0.62 + D.rCM + 0.012, 0, 12));
    spin.add(P.cyl(0.020, 0.014, 0.010, M3.gold, 0, D.hBody * 0.62 + D.rCM + 0.024, 0, 14));
    tiltG.add(spin);
    precess.add(tiltG);
    tip.add(precess);
    g.add(tip);
    g.userData.anim = { precess: precess, tilt: tiltG, spin: spin, tip: tip };
    return { group: g, anchor: mkAnchor(0.12, 0.35, 0) };
  }

  /* 鞭(杆+绳弧,tick 扫击) */
  function buildWhip() {
    var g = group();
    g.add(P.cyl(0.012, 0.015, 0.42, M3.woodD, 0.34, 0.24, 0.10, 10));
    g.add(P.cyl(0.006, 0.006, 0.30, M3.rope, 0.22, 0.14, 0.06, 6));
    g.userData.anim = { rope: g.children[g.children.length - 1] };
    return { group: g, anchor: mkAnchor(0.4, 0.5, 0.2) };
  }

  /* 影盘(顶视旋转影,示意「影不动」——影盘不转,针形标志转) */
  function buildShadow() {
    var g = group();
    g.add(P.cyl(0.055, 0.055, 0.004, M3.dark, 0, 0.068, 0, 20));
    var pin = P.box(0.10, 0.002, 0.012, M3.paper, 0, 0.072, 0);
    g.add(pin);
    g.userData.anim = { pin: pin };
    return { group: g, anchor: mkAnchor(0.05, 0.12, 0) };
  }

  /* 鞭绳卷(案角装饰) */
  function buildCoil() {
    var g = group();
    g.add(P.torus(0.05, 0.02, M3.rope, -0.42, 0.09, 0.30, 20).rotation ? (function () {
      var t = P.torus(0.05, 0.02, M3.rope, -0.42, 0.09, 0.30, 20);
      t.rotation.x = P.ROTX;
      return t;
    })() : null);
    g.add(P.cyl(0.01, 0.012, 0.30, M3.woodD, -0.30, 0.12, 0.36, 8));
    return { group: g, anchor: mkAnchor(-0.42, 0.20, 0.30) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "ground", name: "GROUND · 硬地", sub: "「卓于地」", phase: 0, at: 0.2, dur: 1.0,
      build: buildGround, target: [0, 0, 0], start: [0, 1.4, -0.6], mid: [0, 0.8, -0.3], anchor: [0.35, 0.1, 0.35] });
    def({ id: "coil", name: "COIL · 鞭绳卷", sub: "「绕以鞭之绳而无竹尺」", phase: 0, at: 0.9, dur: 1.0,
      build: buildCoil, target: [0, 0, 0], start: [-0.6, 1.2, 0.6], mid: [-0.5, 0.6, 0.3], anchor: [0, 0.25, 0.3] });

    def({ id: "top", name: "TOP · 陀螺", sub: "木制如小空钟 · 中实无柄", phase: 1, at: 5.3, dur: 1.3, kind: "kine",
      build: buildTop, target: [0, 0, 0], off: [0.5, 1.0, 0.6] });
    def({ id: "whip", name: "WHIP · 鞭", sub: "「急掣其鞭,一掣则转」", phase: 1, at: 6.4, dur: 1.2,
      build: buildWhip, target: [0, 0, 0], start: [0.7, 1.3, 0.5], mid: [0.5, 0.7, 0.25], anchor: [0, 0.5, 0.2] });
    def({ id: "shadow", name: "SHADOW · 影盘", sub: "「顶光旋旋,影不动」", phase: 2, at: 10.3, dur: 1.2,
      build: buildShadow, target: [0, 0, 0], start: [0.4, 1.2, -0.5], mid: [0.2, 0.6, -0.25], anchor: [0, 0.15, 0] });
  };

  /* —— 运动学分发(每帧) —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("top");
    if (e && e.shown && e.group.userData.anim) {
      var a = e.group.userData.anim;
      a.precess.rotation.y = st.preT;
      a.tilt.rotation.x = st.fallen ? D.fallTilt : st.tilt;
      a.spin.rotation.y = st.omega * st.time * 0.06;
      /* 倒下后体沿倾斜轴落平:tip 平移+体位沿轴 */
      var tiltR = st.tilt;
      var hcm = D.rCM + D.hBody * 0.5;
      a.spin.position.y = Math.cos(tiltR) * hcm * 0.72 + 0.006;
    }
    e = MECH.Parts.entry("shadow");
    if (e && e.shown && e.group.userData.anim) {
      e.group.userData.anim.pin.rotation.y = st.preT * 0.35;   // 影缓转(非自转)
    }
  };
})(window.MECH = window.MECH || {});
