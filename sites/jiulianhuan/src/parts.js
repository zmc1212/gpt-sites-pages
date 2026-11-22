/* 九连环部件建模与注册(11 件)。
   布局:案几上横置钗(柄环+框梁沿 x,开口端 +x)+ 底板(9 孔);
   9 环(kine,逐环):在框=环套框梁(x=ringX, y=frameY, 框梁穿环);
   下框=环滑离开口端落至底板孔位(x 同,y=baseY,杆插孔);
   环杆自环下沿伸至底板。环位/杆长由 tick 经 userData.anim 驱动(lerp)。
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

  /* 案几 */
  function buildDesk() {
    var g = group();
    g.add(P.box(0.95, 0.05, 0.6, M3.woodD, 0.05, 0.5, 0));
    [[-0.38, -0.24], [0.42, -0.24], [-0.38, 0.24], [0.42, 0.24]].forEach(function (p) {
      g.add(P.box(0.06, 0.48, 0.06, M3.wood, 0.05 + p[0], 0.24, p[1]));
    });
    return { group: g, anchor: mkAnchor(0, 0.68, -0.24) };
  }

  /* 钗:柄环 + 柄杆 + 框梁(沿 x,开口端 +x)+ 底板(9 孔) */
  function buildChai() {
    var g = group();
    var y = D.frameY;
    /* 柄环(竖环,西端) */
    g.add(P.torus(0.075, 0.012, M3.bronze, -0.40, y, 0, 22));
    g.add(P.box(0.10, 0.022, 0.022, M3.bronze, -0.315, y, 0));
    /* 框梁(长杆,开口端 +x) */
    g.add(P.cyl(0.011, 0.011, D.frameL, M3.bronze, -(D.frameL / 2) + 0.06 + D.frameL / 2 - D.frameL / 2, y, 0, 10).rotation ? (function () {
      var bar = P.cyl(0.011, 0.011, D.frameL, M3.bronze, -(D.frameL / 2) + 0.06, y, 0, 10);
      bar.rotation.z = P.ROTZ;
      return bar;
    })() : null);
    g.add(P.box(0.06, 0.022, 0.022, M3.bronze, -(D.frameL / 2) + 0.03, y, 0));
    /* 底板(9 孔) */
    g.add(P.box(0.62, 0.028, 0.20, M3.ironD, 0.05, D.baseY, 0));
    for (var i = 0; i < D.N; i++) {
      g.add(P.cyl(0.018, 0.018, 0.032, M3.dark, D.ringX[i], D.baseY, 0, 10));
    }
    return { group: g, anchor: mkAnchor(-0.40, y + 0.12, 0) };
  }

  /* 环 i(含环杆;kine:位置/杆长由 userData.anim lerp) */
  function buildRing(i) {
    var g = group();
    var holder = group();
    holder.position.set(D.ringX[i], D.frameY, 0);
    var ring = P.torus(D.ringR, 0.010, M3.bronze, 0, 0, 0, 22);
    ring.rotation.y = P.ROTX;              // 环面朝 ±z?——环套框梁:梁沿 x,环面含 x 轴 → 环面在 x-y 平面(法线 z)
    holder.add(ring);
    /* 环杆(自环下沿伸至底板孔) */
    var rod = P.cyl(0.008, 0.008, D.frameY - D.baseY, M3.bronze, 0, -(D.frameY - D.baseY) / 2, 0, 8);
    holder.add(rod);
    g.add(holder);
    g.userData.anim = { holder: holder, ring: ring, rod: rod, i: i };
    return { group: g, anchor: mkAnchor(D.ringX[i], D.frameY + 0.10, 0) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "desk", name: "DESK · 案几", sub: "「大家解九连环顽呢」", phase: 0, at: 0.2, dur: 1.1,
      build: buildDesk, target: [0, 0, 0], start: [0, 1.8, 0.7], mid: [0, 1.1, 0.35], anchor: [0, 0.68, -0.24] });
    def({ id: "chai", name: "CHAI · 钗(柄+框梁+底板)", sub: "「秦昭王遗君王后玉连环」渊源", phase: 0, at: 1.0, dur: 1.3,
      build: buildChai, target: [0, 0, 0], start: [-0.3, 2.2, -0.6], mid: [-0.15, 1.3, -0.3], anchor: [-0.40, 1.05, 0] });

    /* 9 环(阶段 2 全上) */
    for (var i = 0; i < D.N; i++) {
      def({ id: "ring" + i, name: "RING · 环 " + (i + 1), sub: "环杆穿底板孔", phase: 1, at: 5.3 + i * 0.4, dur: 0.6, kind: "kine",
        build: (function (k) { return function () { return buildRing(k); }; })(i),
        target: [0, 0, 0], off: [0.3, 1.0, 0.4] });
    }
  };

  /* —— 运动学分发(每帧) —— */
  MECH.KINE = function (st) {
    for (var i = 0; i < D.N; i++) {
      var e = MECH.Parts.entry("ring" + i);
      if (!e || !e.shown || !e.group.userData.anim) continue;
      var a = e.group.userData.anim;
      var on = (st.state >> i) & 1;
      /* 在框:(ringX, frameY, 杆长至底板);下框:同 x,y=底板孔上,杆短 */
      var tx = D.ringX[i], ty = on ? D.frameY : D.baseY + 0.055;
      var tl = on ? (D.frameY - D.baseY) : 0.10;
      /* lerp 快速趋近(12步/s 下即视切换) */
      a.holder.position.x += (tx - a.holder.position.x) * Math.min(1, st._dt2 || 0.35);
      a.holder.position.y += (ty - a.holder.position.y) * Math.min(1, st._dt2 || 0.35);
      a.rod.scale.y = (a.holder.position.y - D.baseY) / (D.frameY - D.baseY);
      a.rod.position.y = -(D.frameY - D.baseY) * a.rod.scale.y / 2;
    }
  };
})(window.MECH = window.MECH || {});
