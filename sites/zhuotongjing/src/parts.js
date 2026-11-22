/* 卓筒井部件建模与注册(7 件)。
   布局:井口石圈(0,·,1.80)+ 井筒暗井;井架双柱横梁(跨井口,高 2.30);
   碓架支点 A 架(-1.20,1.55,1.55),碓杆 4.2m 绕支点摆(rotation.z 局部),
   杆体沿局部 X 建:西端踏板、东端锥端吊环;竹篾绳+铁圜刃锥挂锥端,
   绳长/锥位由 tick 经 userData.anim 驱动(状态机);卤水桶+石屑池装饰。
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

  /* 井口:石圈 + 井筒暗面 + 地表台 */
  function buildWellhead() {
    var g = group();
    g.add(P.cyl(0.34, 0.36, 0.22, graniteMat(), D.wellX, 0.11, D.wellZ, 24));
    g.add(P.cyl(D.wellR, D.wellR, 0.24, new THREE.MeshStandardMaterial({ color: 0x14161A, roughness: 0.95 }),
      D.wellX, 0.12, D.wellZ, 20));
    g.add(P.box(1.6, 0.08, 1.6, graniteMat(), D.wellX, 0.04, D.wellZ));
    return { group: g, anchor: mkAnchor(D.wellX + 0.5, 0.4, D.wellZ) };
  }
  function graniteMat() {
    return new THREE.MeshStandardMaterial({ color: 0x4E5258, roughness: 0.94 });
  }

  /* 井架:双柱 + 顶横梁 + 导正环 */
  function buildDerrick() {
    var g = group();
    var H = D.derrickH;
    [[-0.55, -0.5], [0.55, -0.5], [-0.55, 0.5], [0.55, 0.5]].forEach(function (p) {
      g.add(P.box(0.10, H, 0.10, M3.woodD, D.wellX + p[0], H / 2, D.wellZ + p[1]));
    });
    g.add(P.box(1.3, 0.10, 0.10, M3.woodD, D.wellX, H - 0.05, D.wellZ - 0.5));
    g.add(P.box(1.3, 0.10, 0.10, M3.woodD, D.wellX, H - 0.05, D.wellZ + 0.5));
    g.add(P.torus(0.09, 0.02, M3.iron, D.wellX, H - 0.14, D.wellZ, 16));
    return { group: g, anchor: mkAnchor(D.wellX, H + 0.15, D.wellZ) };
  }

  /* 碓杆(kine:绕支点摆 rotation.z)——原点=支点,杆沿局部 +X;
     西段踏板配重块,东端吊环 */
  function buildLever() {
    var g = group();
    var holder = group();
    holder.position.set(D.pivot.x, D.pivot.y, D.pivot.z);
    /* 轴向:支点→锥端 方向 (1.20, ·, 0.25)/1.226 —— 摆动面取 x-z 竖直面近似:
       杆沿局部 X 建,holder.rotation.z = leverT,再以 rotation.y 对准水平方位 */
    var yaw = Math.atan2(-(D.bitEnd.z - D.pivot.z), D.bitEnd.x - D.pivot.x);
    holder.rotation.y = yaw;
    var arm = P.box(D.armBit + 0.15, 0.11, 0.13, M3.woodD, D.armBit / 2, 0, 0);
    holder.add(arm);
    var foot = P.box(D.armFoot, 0.09, 0.11, M3.woodD, -D.armFoot / 2, -0.02, 0);
    holder.add(foot);
    var pin = P.cyl(0.05, 0.05, 0.30, M3.iron, 0, 0, 0, 10);
    pin.rotation.x = P.ROTX;
    holder.add(pin);
    holder.add(P.box(0.30, 0.05, 0.18, M3.lacquer, -D.armFoot + 0.10, -0.12, 0));   // 踏板
    holder.add(P.box(0.09, 0.09, 0.09, M3.iron, D.armBit - 0.05, 0.03, 0));         // 端箍
    /* 锥端吊环锚(供 tick 挂绳) */
    var anchorPt = mkAnchor(D.armBit, 0.10, 0);
    holder.add(anchorPt);
    g.add(holder);
    g.userData.anim = { holder: holder, anchorPt: anchorPt };
    return { group: g, anchor: mkAnchor(D.pivot.x - 1.0, D.pivot.y + 0.2, D.pivot.z) };
  }

  /* 竹绳 + 铁锥(kine 部件:原点=井口上方;绳锥位姿由 tick 经 userData.anim 驱动) */
  function buildBit() {
    var g = group();
    var rope = P.cyl(0.022, 0.022, D.ropeLen0, M3.rope, 0, D.ropeLen0 / 2, 0, 8);
    rope.castShadow = false;
    var bit = group();
    bit.add(P.cyl(0.085, 0.085, 0.42, M3.iron, 0, -0.21, 0, 12));
    bit.add(P.mesh(new THREE.ConeGeometry(0.075, 0.16, 10), M3.steel, 0, -0.50, 0));
    bit.add(P.cyl(0.05, 0.05, 0.10, M3.woodD, 0, 0.06, 0, 10));
    var ropeTop = mkAnchor(0, D.ropeLen0, 0);
    g.add(rope); g.add(bit); g.add(ropeTop);
    g.userData.anim = { rope: rope, bit: bit, ropeTop: ropeTop, baseY: D.bitEnd.y - 0.1 };
    return { group: g, anchor: mkAnchor(0, 1.0, 0) };
  }

  /* 支点 A 架 */
  function buildTrestle() {
    var g = group();
    var px = D.pivot.x, py = D.pivot.y, pz = D.pivot.z;
    [[-0.30, -0.24], [0.30, -0.24], [-0.30, 0.24], [0.30, 0.24]].forEach(function (o) {
      g.add(P.box(0.10, py, 0.10, M3.woodD, px + o[0], py / 2, pz + o[1]));
    });
    g.add(P.box(0.85, 0.10, 0.60, M3.stone, px, 0.05, pz));
    var pin = P.cyl(0.055, 0.055, 0.34, M3.iron, px, py, pz, 10);
    pin.rotation.x = P.ROTX;
    g.add(pin);
    return { group: g, anchor: mkAnchor(px, py + 0.25, pz) };
  }

  /* 卤水桶 + 石屑堆(装饰) */
  function buildBrine() {
    var g = group();
    g.add(P.cyl(0.20, 0.17, 0.44, M3.woodD, 1.35, 0.22, 0.55, 16));
    g.add(P.torus(0.19, 0.02, M3.iron, 1.35, 0.42, 0.55, 18));
    g.add(P.box(0.6, 0.10, 0.6, graniteMat(), -1.9, 0.05, 2.4));
    g.add(P.sph(0.16, new THREE.MeshStandardMaterial({ color: 0x5A5148, roughness: 0.95 }), -1.9, 0.16, 2.4));
    return { group: g, anchor: mkAnchor(1.35, 0.55, 0.55) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "wellhead", name: "WELLHEAD · 井口石圈", sub: "圜刃凿如碗大 · 深数十丈", phase: 0, at: 0.2, dur: 1.2,
      build: buildWellhead, target: [0, 0, 0], start: [0, 3.0, 1.8], mid: [0, 1.6, 1.0], anchor: [0, 0.5, 1.8] });
    def({ id: "derrick", name: "DERRICK · 井架", sub: "双柱横梁 · 导正环", phase: 0, at: 1.0, dur: 1.2,
      build: buildDerrick, target: [0, 0, 0], start: [0, 4.2, 1.2], mid: [0, 2.4, 1.0], anchor: [0, 2.5, 1.8] });
    def({ id: "brine", name: "BRINE · 卤桶·石屑", sub: "凿出盐卤 · 石屑堆", phase: 0, at: 1.8, dur: 1.0,
      build: buildBrine, target: [0, 0, 0], start: [1.6, 2.4, 1.0], mid: [1.4, 1.2, 0.6], anchor: [0, 0.6, 0.55] });

    def({ id: "trestle", name: "TRESTLE · 支点架", sub: "碓杆支点 · 铁销", phase: 1, at: 5.3, dur: 1.2,
      build: buildTrestle, target: [0, 0, 0], start: [-1.6, 3.4, 1.0], mid: [-1.4, 2.0, 1.2], anchor: [0, 1.8, 1.55] });
    def({ id: "lever", name: "LEVER · 碓杆", sub: "杠杆增力 i=2.2 · 4.2m", phase: 1, at: 6.4, dur: 1.3, kind: "kine",
      build: buildLever, target: [0, 0, 0], off: [-0.8, 2.2, 1.0] });

    def({ id: "bit", name: "BIT · 竹绳·铁圜刃锥", sub: "碓嘴形 · 竹篾夹悬", phase: 2, at: 10.3, dur: 1.3, kind: "kine",
      build: buildBit, target: [0, 0, 0], off: [0.9, 2.2, 1.1] });
  };

  /* —— 运动学分发(每帧) —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("lever");
    if (e && e.shown && e.group.userData.anim) {
      e.group.userData.anim.holder.rotation.z = st.leverT;     // 锥端抬起(+θ 局部)
    }
    e = MECH.Parts.entry("bit");
    if (e && e.shown && e.group.userData.anim) {
      var a = e.group.userData.anim;
      /* 锥顶吊点 = 锥端位 + bitY 抬升;绳长恒定,锥随吊点平移 */
      var hookY = D.bitEnd.y - 0.10 + st.bitY;
      a.rope.position.y = hookY - D.ropeLen0 / 2;
      a.bit.position.y = hookY - D.ropeLen0;
      a.ropeTop.position.y = hookY;
    }
  };
})(window.MECH = window.MECH || {});
