/* 摇橹部件建模与注册(6 件)。
   布局:船体(半剖舷侧朝观察者,+x 船首),水面 plane(tick 后移=船行进);
   船尾橹:橹钮座(舷支点)+ 橹杆(2.9m 斜入水)+ 橹板(端部横板)+ 橹手端 +
   橹绳(摇点联动);橹套嵌套:钮原点 → swing(rotation.z = β 摆)→ twist
   (rotation.x = α 攻角)→ 板体;橹手位推拉由绳位 tick 驱动。
   kine:橹套旋转由 userData.anim 驱动(钮原点,板体沿局部 -X 入水)。
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

  /* 船体(半剖侧视:舷板 + 底 + 船头尾)+ 甲板 */
  function buildHull() {
    var g = group();
    g.add(P.box(3.2, 0.55, 0.10, M3.woodD, 0, 0.35, 0.55));     // 舷板(近侧)
    g.add(P.box(3.2, 0.10, 1.1, M3.woodL, 0, 0.12, 0));          // 底
    g.add(P.box(3.2, 0.30, 0.10, M3.woodD, 0, 0.30, -0.55));     // 舷板(远侧,低视)
    g.add(P.box(0.10, 0.50, 1.1, M3.woodD, 1.55, 0.35, 0));      // 船头
    g.add(P.box(0.10, 0.44, 1.1, M3.woodD, -1.55, 0.32, 0));     // 船尾
    g.add(P.box(2.9, 0.05, 0.9, M3.woodL, 0, 0.44, 0));          // 甲板
    g.add(P.box(0.42, 0.10, 0.5, M3.woodD, -1.2, 0.55, 0));      // 尾舱
    return { group: g, anchor: mkAnchor(1.6, 0.8, 0) };
  }

  /* 橹(kine:钮原点 → swing → twist → 板;杆沿局部 -X 斜入水) */
  function buildLu() {
    var g = group();
    /* 橹钮座(舷支点) */
    g.add(P.box(0.10, 0.16, 0.10, M3.woodD, -1.05, 0.62, 0.58));
    var holder = group();
    holder.position.set(-1.05, 0.62, 0.58);
    var swing = group();
    /* 橹杆:沿局部 -X 斜向下入水(俯角 ~28°) */
    swing.add(P.box(D.Lu, 0.055, 0.055, M3.woodD, -D.Lu / 2, -D.Lu * 0.26, 0));
    var twist = group();
    twist.position.set(-D.Lu, -D.Lu * 0.52, 0);
    /* 橹板:横板(宽 1.1 沿 z?板面垂直行进方向) */
    twist.add(P.box(0.06, 0.34, 1.05, M3.woodL, 0, -0.05, 0));
    twist.add(P.box(0.05, 0.05, 1.10, M3.woodD, 0, -0.20, 0));
    swing.add(twist);
    /* 橹手端(钮上段) */
    swing.add(P.box(0.85, 0.05, 0.05, M3.woodD, 0.45, 0.20, 0));
    holder.add(swing);
    g.add(holder);
    g.userData.anim = { holder: holder, swing: swing, twist: twist };
    return { group: g, anchor: mkAnchor(-1.05, 0.85, 0.58) };
  }

  /* 橹绳(橹手端→甲板摇点,tick 摆位) */
  function buildRope() {
    var g = group();
    var rope = P.cyl(0.010, 0.010, 1.05, M3.rope, -0.35, 0.62, 0.30, 6);
    rope.castShadow = false;
    g.add(rope);
    g.userData.anim = { rope: rope };
    return { group: g, anchor: mkAnchor(-0.35, 0.85, 0.30) };
  }

  /* 水面(tick 后移,= 船行进)+ 舷波纹粒子 */
  function buildWater() {
    var g = group();
    var water = P.box(9.0, 0.06, 6.0, M3.water, 0, -0.10, 0);
    water.castShadow = false; water.receiveShadow = true;
    g.add(water);
    return { group: g, anchor: mkAnchor(0, 0.05, 2.2) };
  }

  /* 尾舱货筐(装饰) */
  function buildCrate() {
    var g = group();
    g.add(P.box(0.34, 0.22, 0.30, M3.wood, 0.55, 0.62, 0));
    g.add(P.box(0.28, 0.16, 0.24, M3.woodD, 0.05, 0.60, -0.05));
    return { group: g, anchor: mkAnchor(0.55, 0.80, 0) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "hull", name: "HULL · 船体", sub: "「一橹抵三桨」(传统说法)", phase: 0, at: 0.2, dur: 1.3,
      build: buildHull, target: [0, 0, 0], start: [0, 1.6, -0.6], mid: [0, 0.9, -0.3], anchor: [1.6, 0.9, 0] });
    def({ id: "water", name: "WATER · 水面", sub: "行进=水面后移", phase: 0, at: 1.2, dur: 1.2,
      build: buildWater, target: [0, 0, 0], start: [0, 1.2, 1.6], mid: [0, 0.6, 0.8], anchor: [0, 0.05, 2.2] });
    def({ id: "crate", name: "CRATE · 尾舱货筐", sub: "装饰", phase: 0, at: 1.9, dur: 1.0,
      build: buildCrate, target: [0, 0, 0], start: [0.9, 1.6, 0.5], mid: [0.7, 1.0, 0.25], anchor: [0, 0.85, 0] });

    def({ id: "lu", name: "LU · 橹(钮-杆-板)", sub: "「橹,膂也,用膂力然后舟行」", phase: 1, at: 5.3, dur: 1.4, kind: "kine",
      build: buildLu, target: [0, 0, 0], off: [-0.7, 1.4, 0.8] });
    def({ id: "rope", name: "ROPE · 橹绳", sub: "摇点联动 · 攻角反转", phase: 1, at: 6.6, dur: 1.2,
      build: buildRope, target: [0, 0, 0], start: [-0.4, 1.8, 0.6], mid: [-0.3, 1.1, 0.3], anchor: [0, 0.9, 0.3] });
  };

  /* —— 运动学分发(每帧) —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("lu");
    if (e && e.shown && e.group.userData.anim) {
      var a = e.group.userData.anim;
      a.swing.rotation.z = st.beta;            // 摆(绕钮,竖直面)
      a.twist.rotation.x = st.alpha;           // 攻角(板自身轴扭转)
    }
    e = MECH.Parts.entry("rope");
    if (e && e.shown && e.group.userData.anim) {
      var r = e.group.userData.anim.rope;
      var hx = -0.62, hy = 0.82;               // 橹手端近似位
      r.position.set((hx - 0.10) / 2, (hy + 0.44) / 2, 0.30);
      r.rotation.z = Math.atan2(hx + 0.10, hy - 0.44);
    }
  };
})(window.MECH = window.MECH || {});
