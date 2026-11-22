/* 简仪部件建模与注册(9 件)。
   布局:北高南低的极轴支架,极轴沿斜向;百刻环(端面)+ 赤道环圈(二十四节气)
   同心卧置;四游环(竖圈,绕极轴旋转)带双窥衡;立运环(地平圈,示意)。
   KINE:四游环绕极轴转 ψ;窥衡指向随 ψ。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM;

  function group() { return new THREE.Group(); }

  function buildBase() {
    var g = group();
    g.add(P.cyl(D.baseR, D.baseR + 0.06, D.baseH, M3.stone, 0, D.baseH / 2, 0, 36));
    g.add(P.cyl(D.baseR * 0.86, D.baseR, 0.10, M3.bronze, 0, D.baseH + 0.05, 0, 32));
    /* 云柱支架 ×4(示意) */
    for (var k = 0; k < 4; k++) {
      var a = k * Math.PI / 2 + Math.PI / 4;
      var p = P.cyl(0.05, 0.06, 0.34, M3.bronze, Math.cos(a) * D.baseR * 0.72, D.baseH + 0.22, Math.sin(a) * D.baseR * 0.72, 12);
      p.rotation.z = Math.cos(a) * 0.15;
      p.rotation.x = -Math.sin(a) * 0.15;
      g.add(p);
    }
    return g;
  }

  /* 极轴组:斜轴 + 百刻环(端面圆)+ 赤道环圈 */
  function buildPolar() {
    var g = group();
    var holder = group();
    holder.rotation.z = -(Math.PI / 2 - D.polarTilt);   // 极轴仰起(指向北天极)
    holder.position.y = D.baseH + 0.42;
    var axle = P.cyl(0.05, 0.05, 1.15, M3.steelD, 0, 0, 0, 14);   // 沿局部 Y(极轴)
    g2(holder, axle);
    var bai = P.torus(D.ringBaiR, 0.03, M3.bronze, 0, -0.34, 0, 40);
    bai.rotation.x = P.ROTX;
    g2(holder, bai);
    var eq = P.torus(D.ringEqR, 0.026, M3.gold, 0, -0.16, 0, 44);
    eq.rotation.x = P.ROTX;
    g2(holder, eq);
    /* 赤道环 24 节气刻块 */
    for (var i = 0; i < 24; i++) {
      var a = i / 24 * Math.PI * 2;
      var t = P.box(0.018, 0.02, 0.05, M3.gold, Math.cos(a) * D.ringEqR, -0.16, Math.sin(a) * D.ringEqR);
      t.rotation.y = -a;
      g2(holder, t);
    }
    g.add(holder);
    g.userData.holder = holder;
    return { group: g };
  }
  function g2(parent, child) { parent.add(child); }

  function buildYou() {   // 四游环(竖圈)+ 双窥衡,child of polar holder? 独立 kine 部件
    var g = group();
    var holder = group();
    holder.rotation.z = -(Math.PI / 2 - D.polarTilt);
    holder.position.y = D.baseH + 0.42;
    var you = group();
    you.position.y = -0.16;                      // 与赤道环同心
    var ring = P.torus(D.ringYouR, 0.024, M3.bronze, 0, 0, 0, 44);
    you.add(ring);
    var hud = P.cyl(0.014, 0.014, D.ringYouR * 2 - 0.10, M3.steel, 0, 0, 0, 10);   // 窥衡(直径)
    hud.rotation.z = P.ROTZ;
    you.add(hud);
    [-1, 1].forEach(function (s) {
      var sight = P.torus(0.05, 0.012, M3.gold, s * (D.ringYouR - 0.10), 0, 0, 14);
      sight.rotation.y = P.ROTX;
      you.add(sight);
    });
    holder.add(you);
    g.add(holder);
    g.userData.you = you;
    return { group: g };
  }

  function buildStar() {   // 演示星(天球方位标记,world 固定)
    var g = group();
    g.userData.stars = [];
    /* 四颗演示星放在极轴指向的天球方位上(简化:沿四游环平面外圆) */
    D.stars.forEach(function (s, k) {
      var a = s.psi;                                // 去极度(自北极)
      var holder = group();
      holder.rotation.z = -(Math.PI / 2 - D.polarTilt);
      holder.position.y = D.baseH + 0.42;
      var star = P.sph(0.045, new THREE.MeshStandardMaterial({ color: 0xEFD9A0, emissive: 0xEFD9A0, emissiveIntensity: 0.9 }), 0, 0, 0);
      star.position.y = -0.16 + Math.cos(a) * D.ringYouR * 1.35;
      star.position.x = Math.sin(a) * D.ringYouR * 1.35 * (k % 2 ? 1 : -1) * 0.9;
      star.position.z = Math.sin(a) * D.ringYouR * 1.35 * 0.42 * (k % 2 ? -0.7 : 0.7);
      holder.add(star);
      g.add(holder);
      g.userData.stars.push(star);
    });
    return { group: g };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "base", name: "BASE · 基座云柱", sub: " stone 台座", phase: 0, at: 0.15, dur: 1.2,
      build: buildBase, target: [0, 0, 0], start: [0, 3.6, 2.4], mid: [0, 2.0, 1.1], anchor: [0, 0.4, 0.6] });
    def({ id: "polar", name: "POLAR · 极轴+百刻环+赤道环", sub: "仰角 50°(演示) · 24 节气", phase: 1, at: 2.4, dur: 1.5, kind: "kine",
      build: buildPolar, target: [0, 0, 0], off: [0, 1.8, 2.4] });
    def({ id: "you", name: "YOU · 四游环+窥衡", sub: "绕极轴旋转 · 双窥衡", phase: 2, at: 4.8, dur: 1.4, kind: "kine",
      build: buildYou, target: [0, 0, 0], off: [0, 2.0, 2.2] });
    def({ id: "star", name: "STARS · 演示星 ×4", sub: "织女一/角宿一/参宿四/心宿二", phase: 3, kind: "none", world: true,
      build: buildStar, target: [0, 0, 0] });
  };

  /* —— 运动学分发 —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("you");
    if (e && e.shown) e.group.userData.you.rotation.y = st.psi;   // 绕极轴(局部 Y)转
    /* 星表:当前瞄准星微亮 */
    var s = MECH.Parts.entry("star");
    if (s && s.shown) {
      s.group.userData.stars.forEach(function (star, k) {
        star.material.emissiveIntensity = k === st.starIdx ? 1.4 : 0.5;
        star.material.color.set(k === st.starIdx ? 0xFFE9A0 : 0xEFD9A0);
      });
    }
  };
})(window.MECH = window.MECH || {});
