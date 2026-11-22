/* 权衡部件建模与注册(7 件)。
   布局:立架吊提纽(两档:居中/偏左,stage 切换);衡杆(kine rotation.z 绕提纽);
   物盘悬本端(盘+物);权(铜环)套标臂滑动(tick 定位);刻度杆身纹理;
   案 + 环权架(五枚环权排布)。
   标签锚点:build 返回 anchor。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM;
  var Y0 = 0.95;                                   // 衡杆挂高

  function group() { return new THREE.Group(); }
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  /* 立架:双柱 + 顶横梁 + 提纽吊绳(两档钩) */
  function buildStand() {
    var g = group();
    g.add(P.box(0.08, Y0 + 0.25, 0.08, M3.woodD, -0.42, (Y0 + 0.25) / 2, -0.14));
    g.add(P.box(0.08, Y0 + 0.25, 0.08, M3.woodD, -0.42, (Y0 + 0.25) / 2, 0.14));
    g.add(P.box(0.10, 0.10, 0.40, M3.stone, -0.42, 0.05, 0));
    g.add(P.box(0.06, 0.16, 0.06, M3.woodD, 0.72, Y0 + 0.08, 0));
    g.add(P.box(0.10, 0.34, 0.10, M3.woodD, 0.72, 0.17, 0));
    /* 提纽两档钩 */
    [[-0.14, true], [0.30, false]].forEach(function (p) {
      g.add(P.torus(0.022, 0.005, M3.bronze, -0.14 + (p[0] + 0.14), Y0 + 0.16, 0, 12));
    });
    return { group: g, anchor: mkAnchor(-0.42, Y0 + 0.3, 0) };
  }

  /* 衡杆(kine:rotation.z 绕提纽;原点=提纽位置,杆沿 x:本端 -LarmObj,标端 +) */
  function buildBeam() {
    var g = group();
    var holder = group();
    holder.position.set(0, Y0, 0);
    var beam = P.box(D.beamL, 0.026, 0.036, M3.woodD, D.beamL / 2 - D.pinC, 0, 0);
    holder.add(beam);
    /* 刻度(标臂段) */
    for (var i = 0; i <= 26; i++) {
      var x = D.pinC + i * D.gradStep;
      holder.add(P.box(0.004, 0.030, 0.038, i % 5 === 0 ? M3.gold : M3.iron, x, 0, 0));
    }
    holder.add(mkAnchor(0, 0, 0));
    g.add(holder);
    g.userData.anim = { holder: holder };
    return { group: g, anchor: mkAnchor(0, Y0, 0) };
  }

  /* 提纽绳(kine:随 pinMode 换钩位——绳位置 tick 驱动) */
  function buildPin() {
    var g = group();
    var rope = P.cyl(0.006, 0.006, 0.14, M3.rope, -D.pinC, Y0 + 0.07, 0, 6);
    g.add(rope);
    g.userData.anim = { rope: rope };
    return { group: g, anchor: mkAnchor(-D.pinC, Y0 + 0.15, 0) };
  }

  /* 物盘(悬本端;盘内物块随 objW) */
  function buildPan() {
    var g = group();
    var rope = P.cyl(0.005, 0.005, 0.30, M3.rope, -D.pinC, Y0 - 0.16, 0, 6);
    rope.castShadow = false;
    g.add(rope);
    var pan = P.cyl(0.075, 0.055, 0.03, M3.bronze, -D.pinC, Y0 - 0.32, 0, 18);
    g.add(pan);
    var obj = P.box(0.085, 0.05, 0.085, new THREE.MeshStandardMaterial({ color: 0x7C6A50, roughness: 0.85 }),
      -D.pinC, Y0 - 0.36, 0);
    obj.visible = false;
    g.add(obj);
    g.userData.anim = { obj: obj };
    return { group: g, anchor: mkAnchor(-D.pinC, Y0 - 0.28, 0.08) };
  }

  /* 权(铜环,套标臂滑动)——tick 定位 */
  function buildWeight() {
    var g = group();
    var ring = P.torus(0.032, 0.010, M3.bronze, 0.44, Y0, 0, 20);
    ring.rotation.y = P.ROTX;
    g.add(ring);
    g.userData.anim = { ring: ring };
    return { group: g, anchor: mkAnchor(0.44, Y0 + 0.05, 0) };
  }

  /* 环权架(五枚排布)+ 名牌 */
  function buildWeights() {
    var g = group();
    g.add(P.box(0.34, 0.05, 0.14, M3.woodD, 0.72, 0.30, 0.42));
    D.weights.forEach(function (w, i) {
      var r = 0.018 + i * 0.004;
      var ring = P.torus(r, 0.008, M3.bronze, 0.60 + i * 0.06, 0.36, 0.42, 16);
      ring.rotation.y = P.ROTX;
      g.add(ring);
    });
    g.add(P.box(0.10, 0.14, 0.02, M3.paper, 0.72, 0.42, 0.42));
    return { group: g, anchor: mkAnchor(0.72, 0.50, 0.42) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "stand", name: "STAND · 立架", sub: "提纽两档:居中/偏左", phase: 0, at: 0.2, dur: 1.2,
      build: buildStand, target: [0, 0, 0], start: [0, 2.2, -0.8], mid: [0, 1.4, -0.4], anchor: [0, 1.3, 0] });
    def({ id: "beam", name: "BEAM · 衡杆", sub: "本短标长 · 26 刻度", phase: 0, at: 1.0, dur: 1.2, kind: "kine",
      build: buildBeam, target: [0, 0, 0], off: [0.6, 1.6, 0.7] });
    def({ id: "pin", name: "PIN · 提纽绳", sub: "「本短标长」切换", phase: 1, at: 5.3, dur: 1.1,
      build: buildPin, target: [0, 0, 0], start: [-0.3, 1.8, 0.3], mid: [-0.2, 1.2, 0.15], anchor: [0, 1.05, 0] });
    def({ id: "pan", name: "PAN · 物盘", sub: "本端悬盘+物", phase: 1, at: 6.4, dur: 1.2,
      build: buildPan, target: [0, 0, 0], start: [-0.5, 1.6, 0.5], mid: [-0.3, 1.0, 0.25], anchor: [0, 0.75, 0] });
    def({ id: "weight", name: "WEIGHT · 权(滑环)", sub: "W 62.5g 四两", phase: 1, at: 7.3, dur: 1.1,
      build: buildWeight, target: [0, 0, 0], start: [0.6, 1.7, 0.4], mid: [0.5, 1.2, 0.2], anchor: [0, 1.1, 0] });
    def({ id: "weights", name: "WEIGHTS · 环权架", sub: "九枚制式五展示(铢-斤)", phase: 2, at: 10.3, dur: 1.2,
      build: buildWeights, target: [0, 0, 0], start: [1.2, 2.0, 0.8], mid: [1.0, 1.2, 0.5], anchor: [0, 0.6, 0.42] });
  };

  /* —— 运动学分发(每帧) —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("beam");
    if (e && e.shown && e.group.userData.anim) {
      e.group.userData.anim.holder.rotation.z = st.theta;
    }
    e = MECH.Parts.entry("weight");
    if (e && e.shown && e.group.userData.anim) {
      e.group.userData.anim.ring.position.x = st.qx;
    }
  };
})(window.MECH = window.MECH || {});
