/* 指南车 — 尺寸常量与差动运动学求解器
   文献依据:《宋史·舆服志》燕肃造指南车(1027,独辕双轮,木人举指南)。
   齿轮系为差动轮系方案(与 1902 Lanchester 专利同思路):
     足轮 → 立轮(同轴,16齿) → 冠轮(立轴,40齿),传动比 a = 16/40 = 0.4;
     冠轮轴顶为差动太阳轮:左链经惰轮换向 sunL = +a·ψL,右链 sunR = −a·ψR;
     行星轮 ×2,差动壳输出 case = (sunL + sunR)/2 = a(ψL − ψR)/2。
     木仙人立于差动壳轴上:ptrRel = 0.2(ψL − ψR)。
   滚动运动学:航向 ψ = (r/W)(ψR − ψL) = 0.2(ψR − ψL)
     ⇒ ptrRel = −ψ,木人指向世界系严格恒定(两式同源于 ψL/ψR,无积分漂移)。
   尺寸:宋营造尺按 0.3 m;足轮径六尺 r=0.9;辙广一丈五尺 W=4.5(复原推算值)。 */
(function (MECH) {
  var CHI = 0.3;
  var D = {
    CHI: CHI,
    rWheel: 3 * CHI,        // 足轮半径 3尺(径六尺)
    W: 15 * CHI,            // 辙距 15尺(轮平面 x = ±W/2)
    e: 0.19,                // 立轮平面相对轮平面的内移
    xC: 2.06,               // 冠轮立轴距(±2.06,与立轮偏置啮合)
    Z立: 16, Z冠: 40,
    r立: 8 * 0.03, r冠: 20 * 0.03,       // 模数 0.03
    rSB: 0.30, bh: 0.34,    // 太阳/行星斜锥半径与锥高(示意)
    spiderX: 1.72,          // 行星锥轴位(与太阳锥共享顶点)
    a: 16 / 40,             // 立轮→冠轮 传动比 0.4(左齿面朝上→+aψL,右朝下→−aψR)
    // 车体(尺 → m)
    boxL: 9 * CHI, boxW: 5.6 * CHI, boxH: 6.3 * CHI,
    floorY: 2.2 * CHI, roofY: 8.6 * CHI, manY: 8.74 * CHI,
    crownY: 4.0 * CHI, axleY: 3 * CHI,
    sunY: 6.6 * CHI, diffY: 6.6 * CHI,   // 太阳锥/差动器高度
    shaftZ: 8.7 * CHI       // 独辕探出长
  };
  D.ratio = D.rWheel / D.W;              // 0.2 需求补偿比
  D.comp = D.a / 2;                      // 0.2 机构补偿比

  /* 状态:航向 ψ 绕 +y(车首方向 (sinψ, cosψ));左转 δ>0 */
  function newState() {
    return {
      time: 0, x: 0, z: 0, psi: 0,
      psiL: 0, psiR: 0,
      v: 0, delta: 0,
      ptrRel: 0, gearPtr: 0, spiderSpin: 0,
      crownL: 0, crownR: 0, sunL: 0, sunR: 0,
      headingDeg: 0, ptrErrDeg: 0, wheelDeltaDeg: 0, dist: 0,
      errHist: [],
      manual: false, keyL: false, keyR: false,
      lastPhase: "", seg: null, trail: []
    };
  }

  function deg(a) { return a * 180 / Math.PI; }

  /* 单步运动学:v/delta 为本帧输入;齿轮各级角一并解出(三维 + 仪表共用) */
  function step(st, dt) {
    st.psi += st.delta * dt;
    st.x += Math.sin(st.psi) * st.v * dt;
    st.z += Math.cos(st.psi) * st.v * dt;
    st.dist += Math.abs(st.v) * dt;
    st.psiL += (st.v - st.delta * D.W / 2) / D.rWheel * dt;
    st.psiR += (st.v + st.delta * D.W / 2) / D.rWheel * dt;

    st.crownL = D.a * st.psiL;            // 左冠轮齿面朝上 → +a·ψL
    st.crownR = -D.a * st.psiR;           // 右冠轮齿面朝下 → −a·ψR
    st.sunL = st.crownL;
    st.sunR = st.crownR;
    st.gearPtr = (st.sunL + st.sunR) / 2; // 差动壳 = 木人轴
    st.ptrRel = D.comp * (st.psiL - st.psiR);   // 与 gearPtr 恒等(自检)
    st.spiderSpin = (st.sunL - st.sunR) / 2;    // 行星轮自转(直行时最快)

    st.headingDeg = deg(st.psi);
    st.ptrErrDeg = deg(st.psi + st.ptrRel);     // 木人世界指向误差(应≈0)
    st.wheelDeltaDeg = deg(st.psiR - st.psiL);
    st._errAcc = (st._errAcc || 0) + dt;
    if (st._errAcc > 0.05) {
      st._errAcc = 0;
      st.errHist.push(st.ptrErrDeg);
      if (st.errHist.length > 260) st.errHist.shift();
    }
    if (st.trail.length === 0 ||
        Math.hypot(st.x - st.trail[st.trail.length - 1][0], st.z - st.trail[st.trail.length - 1][1]) > 0.09) {
      st.trail.push([st.x, st.z]);
      if (st.trail.length > 640) st.trail.shift();
    }
  }

  /* 蛇行试验路径:左90° → 右180° → 左90°(等半径 R),解析式:
     seg1 中心 (R,0) 逆时针;seg2 中心 (R,0) 顺时针;seg3 中心 (R,2R) 逆时针 */
  var SC = { R: 2.4 };
  SC.L1 = Math.PI / 2 * SC.R;
  SC.L2 = Math.PI * SC.R;
  SC.L = SC.L1 + SC.L2 + SC.L1;
  function scurvePose(s) {
    var R = SC.R;
    if (s <= SC.L1) {
      var f = s / R;
      return { x: R - R * Math.cos(f), z: -R * Math.sin(f), psi: f };
    }
    if (s <= SC.L1 + SC.L2) {
      var f2 = (s - SC.L1) / R;
      return { x: R - R * Math.sin(f2), z: -R * Math.cos(f2), psi: Math.PI / 2 - f2 };
    }
    var f3 = Math.min((s - SC.L1 - SC.L2) / R, Math.PI / 2);
    return { x: R + R * Math.sin(f3), z: 2 * R - R * Math.cos(f3), psi: -Math.PI / 2 + f3 };
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step, deg: deg, scurvePose: scurvePose, SC: SC };

  /* 载入期自检:补偿比与需求比严格一致 */
  (function selfCheck() {
    if (Math.abs(D.comp - D.ratio) > 1e-12) {
      var msg = "指南车补偿比自检失败: comp=" + D.comp + " ratio=" + D.ratio;
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
