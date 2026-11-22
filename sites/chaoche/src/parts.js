/* 巢车部件建模与注册(8 件)。
   坐标系:y 上;车台面 y 0.55;剪叉四臂 A-C/B-D/D-F/C-E 每帧按 scissor()
   解析摆放(臂 mesh 长 L,中点定位 + 旋转);望楼舱骑顶层滑块;
   绞盘摇柄 rotation.z = 收绳角;绳 Line 每帧更新。
   errPos = 望楼舱底角 vs 解析(顶层滑块),应≈0。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;

  function group() { return new THREE.Group(); }
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  var _plank = null;
  function plankMat() {
    if (!_plank) {
      var c = document.createElement("canvas");
      c.width = c.height = 128;
      var x = c.getContext("2d");
      x.fillStyle = "#8A5A2B";
      x.fillRect(0, 0, 128, 128);
      for (var i = 0; i < 10; i++) {
        var y = i * 13 + 4;
        x.fillStyle = (i % 2) ? "#7A4E24" : "#9A6B33";
        x.fillRect(0, y, 128, 11);
        x.strokeStyle = "rgba(50,30,10,0.6)";
        x.lineWidth = 1.4;
        x.strokeRect(0, y, 128, 11);
      }
      var t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 1);
      t.encoding = THREE.sRGBEncoding;
      _plank = new THREE.MeshStandardMaterial({ map: t, roughness: 0.84, metalness: 0.04 });
    }
    return _plank;
  }

  /* —— 部件构建器 —— */

  function buildCart() {    // 车体:底架 + 四轮 + 推杆
    var g = group();
    g.add(P.box(D.cartL, 0.10, D.cartW, plankMat(), 0, D.deckY - 0.05, 0));
    [[-0.85, 0.5], [0.85, 0.5], [-0.85, -0.5], [0.85, -0.5]].forEach(function (p) {
      g.add(P.box(0.12, 0.42, 0.12, M3.woodD, p[0], 0.21, p[1]));
    });
    [[-0.62, 0.5], [0.62, 0.5], [-0.62, -0.5], [0.62, -0.5]].forEach(function (p) {
      var wheel = P.cyl(D.wheelR, D.wheelR, 0.07, plankMat(), p[0], D.wheelR, p[1], 18);
      wheel.rotation.x = P.ROTX;
      g.add(wheel);
    });
    g.add(P.box(0.07, 0.07, 0.70, M3.woodD, -1.15, 0.62, 0));
    return { group: g, anchor: mkAnchor(-1.0, 0.8, 0.4) };
  }

  function buildRails() {   // 立柱导轨:双竖轨(剪叉端部滑轨)
    var g = group();
    [[0.05], [0.85]].forEach(function (p) {
      g.add(P.box(0.10, 1.60, 0.10, M3.woodD, p[0], D.deckY + 0.80, 0));
    });
    return { group: g, anchor: mkAnchor(0.1, 1.6, 0.08) };
  }

  function buildScissor() { // 剪叉:四臂(kine 每帧解析摆位)
    var g = group();
    var arms = [];
    for (var i = 0; i < 4; i++) {
      var arm = P.box(D.L, 0.055, 0.075, plankMat(), 0, 0, 0);
      g.add(arm);
      arms.push(arm);
    }
    /* 销轴点(装饰,KINE 摆到剪叉中点) */
    var mid = P.cyl(0.025, 0.025, 0.18, M3.iron, 0, 0, 0, 8);
    g.add(mid);
    g.userData.arms = arms;
    g.userData.mid = mid;
    return { group: g, anchor: mkAnchor(0.3, 1.4, 0.1) };
  }

  function buildCabin() {   // 望楼舱:六面小屋 + 探窗 + 小旗(kine 随顶层滑块)
    var g = group();
    g.add(P.box(D.cabinW, 0.06, D.cabinD, plankMat(), 0, 0, 0));          // 底
    g.add(P.box(D.cabinW, D.cabinH, 0.05, plankMat(), 0, D.cabinH / 2, -D.cabinD / 2));
    g.add(P.box(D.cabinW, D.cabinH, 0.05, plankMat(), 0, D.cabinH / 2, D.cabinD / 2));
    g.add(P.box(0.05, D.cabinH, D.cabinD, plankMat(), -D.cabinW / 2, D.cabinH / 2, 0));
    g.add(P.box(0.05, D.cabinH, D.cabinD, plankMat(), D.cabinW / 2, D.cabinH / 2, 0));
    /* 探窗(前开) */
    g.add(P.box(0.30, 0.20, 0.02, new THREE.MeshStandardMaterial({ color: 0x1A1C20, roughness: 0.9 }), 0, D.cabinH * 0.6, D.cabinD / 2 + 0.01));
    /* 顶 + 小旗 */
    g.add(P.box(D.cabinW + 0.12, 0.05, D.cabinD + 0.12, plankMat(), 0, D.cabinH + 0.02, 0));
    var pole = P.cyl(0.015, 0.015, 0.30, M3.woodD, 0, D.cabinH + 0.20, 0, 8);
    g.add(pole);
    var flag = P.mesh(new THREE.PlaneGeometry(0.26, 0.14),
      new THREE.MeshStandardMaterial({ color: 0xB05A3A, side: THREE.DoubleSide, roughness: 0.8 }),
      0.14, D.cabinH + 0.30, 0);
    g.add(flag);
    g.userData.flag = flag;
    return { group: g, anchor: mkAnchor(0.35, D.cabinH + 0.3, 0.05) };
  }

  function buildWinch() {   // 绞盘:鼓 + 摇柄 + 绳(Line 每帧更新到滑块)
    var g = group();
    g.add(P.box(0.10, 0.10, 0.10, M3.woodD, D.winchX, D.winchY - 0.30, D.winchZ));
    var drum = P.cyl(D.drumR, D.drumR, 0.20, plankMat(), D.winchX, D.winchY, D.winchZ, 14);
    drum.rotation.z = P.ROTZ;
    g.add(drum);
    var crank = P.box(D.crankR * 2, 0.05, 0.04, M3.woodD, D.winchX + D.crankR, D.winchY, D.winchZ + 0.14);
    g.add(crank);
    g.userData.crank = crank;
    var rope = P.mesh(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(D.winchX + D.drumR, D.winchY, D.winchZ),
      new THREE.Vector3(0.4, D.deckY + 0.10, 0)
    ]), new THREE.LineBasicMaterial({ color: 0xA98B5E }));
    g.add(rope);
    g.userData.rope = rope;
    return { group: g, anchor: mkAnchor(D.winchX + 0.2, D.winchY + 0.12, D.winchZ) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "cart", name: "CART · 车体轮轴", sub: "底盘四轮 · 台面 0.55", phase: 0, at: 0.2, dur: 1.5,
      build: buildCart, target: [0, 0, 0], start: [0, 4.0, 0], mid: [0, 2.0, 0] });
    def({ id: "rails", name: "RAILS · 立柱导轨", sub: "双竖滑轨", phase: 0, at: 1.6, dur: 1.3,
      build: buildRails, target: [0, 0, 0], start: [0, 3.6, 0.3], mid: [0, 1.8, 0.15] });

    def({ id: "scissor", name: "SCISSOR · 双级剪叉", sub: "四臂 L1.2 · φ 25°↔62°", phase: 1, at: 7.2, dur: 1.6, kind: "kine",
      build: buildScissor, target: [0, 0, 0], off: [0.5, 1.8, 0.7] });
    def({ id: "cabin", name: "CABIN · 望楼舱", sub: "探窗 + 小旗 · 升 2.26 倍", phase: 2, at: 12.4, dur: 1.5, kind: "kine",
      build: buildCabin, target: [0, 0, 0], off: [0.5, 2.0, 0.8] });

    def({ id: "winch", name: "WINCH · 绞盘摇柄", sub: "鼓 r 0.08 · 收绳 2.07 圈", phase: 3, at: 17.6, dur: 1.4, kind: "kine",
      build: buildWinch, target: [0, 0, 0], off: [0.4, 1.3, 0.7] });
  };

  /* —— 运动学分发 ——
     φ(t) 解析 → 四臂中点/旋转、舱位、绳端;摇柄转角 = 收绳/鼓半径;
     errPos = 舱底角 vs 解析(顶层滑块),应≈0。 */
  var _wp = new THREE.Vector3();
  MECH.KINE = function (st) {
    var phi = st.phi != null ? st.phi : D.phi0;
    var sc = KS.scissor(phi);
    var A = sc.A, B = sc.B, C = sc.C, Dp = sc.Dp, E = sc.E, F = sc.F;

    var scs = MECH.Parts.entry("scissor");
    if (scs && scs.shown && scs.group.userData.arms) {
      var arms = scs.group.userData.arms;
      /* 四臂:A-C / B-D / D-F / C-E */
      var segs = [A, C, B, Dp, Dp, F, C, E];
      for (var i = 0; i < 4; i++) {
        var p1 = segs[i * 2], p2 = segs[i * 2 + 1];
        var mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
        var arm = arms[i];
        arm.position.set(mx, my, 0);
        arm.rotation.z = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
      }
      var mid = scs.group.userData.mid;
      if (mid) mid.position.set((A[0] + C[0]) / 2, (A[1] + C[1]) / 2, 0);
    }

    /* 望楼舱:骑顶层滑块中心 */
    var cb = MECH.Parts.entry("cabin");
    if (cb && cb.sealed) {
      var cx2 = (E[0] + F[0]) / 2;
      cb.group.position.set(cx2, sc.cabinFloor, 0);
      var flag = cb.group.userData.flag;
      if (flag) flag.rotation.y = Math.sin(st.time * 5.5) * 0.35;
    }

    st.errPos = 0;
    if (cb && cb.sealed) {
      cb.group.updateWorldMatrix(true, false);
      _wp.set(-D.cabinW / 2, 0, -D.cabinD / 2).applyMatrix4(cb.group.matrixWorld);
      var ex = cx2 - D.cabinW / 2, ey = sc.cabinFloor, ez = -D.cabinD / 2;
      st.errPos = Math.sqrt((_wp.x - ex) * (_wp.x - ex) + (_wp.y - ey) * (_wp.y - ey) + (_wp.z - ez) * (_wp.z - ez));
    }

    /* 绞盘摇柄 + 绳 */
    var wn = MECH.Parts.entry("winch");
    if (wn && wn.shown) {
      var pulled = D.s0 - sc.s;                     // 已收绳
      var turns = pulled / (2 * Math.PI * D.drumR);
      var crank = wn.group.userData.crank;
      if (crank) crank.rotation.y = -turns * 2 * Math.PI;
      var rope = wn.group.userData.rope;
      if (rope) {
        var pos = rope.geometry.attributes.position;
        pos.setXYZ(1, B[0] - 0.1, B[1], 0);
        pos.needsUpdate = true;
      }
    }
  };
})(window.MECH = window.MECH || {});
