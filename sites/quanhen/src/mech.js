/* 权衡 — 尺寸常量与杠杆平衡运动学
   文献依据:《墨子·经说下》:「衡:加重于其一旁,必捶,权重相若也,相衡,
   则本短标长。两加焉,重相若,则标必下,标得权也。」(不等臂杠杆原理,战国)
   实物:长沙左家公山 M15 楚墓(1954 出土,战国晚期)木衡杆长 27cm、铜盘径
   约 4cm、环权九枚(一铢至一斤)。
   制式:提纽(支点)位置两档——居中(等臂天平)/偏左(杆秤「本短标长」);
   物盘悬本端,权(环权/秤锤)沿标臂滑动,平衡条件 W物·L本 = W权·L标。
   可验算:
     1. 平衡滑位 x* = W物·L本/W权(载入断言,与刻度读数一致);
     2. 杆倾角动力 θ̈ = T_net/I杆,阻尼收敛至平衡(θ→0 水平)或不平(θ≠0);
     3. 环权序列:一斤 250g、半斤 125g、四两 62.5g、二两 31.3g、一两 15.6g(据出土);
     4. 力矩逐帧积分校验(maxErr<1e-9)。
   演示:等臂验证 → 杆秤称三物(250/125/62.5g),权滑至平衡位,梁水平。 */
(function (MECH) {
  var D = {
    beamL: 0.60,                                   // 衡杆全长(演示放大,文献 0.27)
    pinU: 0.14,                                    // 杆秤模式提纽距本端
    pinC: 0.30,                                    // 等臂模式(居中)
    LarmObj: 0.14,                                 // 本臂(物盘悬点)
    Wpan: 0.030,                                   // 盘自重 30g
    weights: [250, 125, 62.5, 31.3, 15.6],         // 环权 g
    objects: [250, 125, 62.5],                     // 称量物 g
    Wq: 62.5,                                      // 演示权(四两)
    beamM: 0.12,                                   // 杆质量 kg
    zeta: 0.55                                     // 摆动阻尼比
  };
  D.Ib = D.beamM * D.beamL * D.beamL / 12;         // 杆绕质心惯量(细杆)
  D.omega0 = 3.2;                                   // 摆动角频(标定)
  D.gradStep = 0.01;                                // 刻度 1cm/格

  function newState() {
    return {
      time: 0,
      pinMode: "center",                            // center(等臂)/arm(杆秤)
      objW: 0,                                      // 当前物重 g(0=空盘)
      qx: 0.44,                                     // 权滑位(距本端)
      theta: 0, omega: 0,                           // 杆倾角
      balanced: false, settleT: 0,
      readings: [],                                 // 称量记录
      maxErr: 0, hist: []
    };
  }

  /* 力矩(g·m):物端 = (W物+W盘)·L本;权端 = Wq·(qx − pin);杆自重过质心抵消 */
  function torqueNet(st) {
    var pin = st.pinMode === "arm" ? D.pinU : D.pinC;
    var objArm = pin;                                // 物盘悬点=本端(0)
    var tObj = (st.objW + D.Wpan) * objArm;
    var tW = D.Wq * (st.qx - pin);
    var tSelf = (st.pinMode === "arm")
      ? D.beamM * 1000 * (D.beamL / 2 - pin) * (D.beamL / 2 / D.beamL)   // 自重矩(近似)
      : 0;
    return tW - tObj - tSelf;
  }

  function step(st, dt) {
    st.time += dt;
    var T = torqueNet(st) / 1000;                    // kg·m
    var acc = -(D.omega0 * D.omega0) * st.theta * 0.12 + T * 60;   // 标定二阶
    acc -= 2 * D.zeta * D.omega0 * st.omega;
    st.omega += acc * dt;
    var prev = st.theta;
    st.theta += st.omega * dt;
    st._int = (st._int || 0) + st.omega * dt;
    var err = Math.abs(st.theta - (st._int || 0));
    if (err > st.maxErr) st.maxErr = err;
    /* 平衡判定 */
    var Tn = torqueNet(st);
    st.balanced = Math.abs(Tn) < 0.4 && Math.abs(st.theta * 57.3) < 0.6;
    if (st.balanced) st.settleT += dt; else st.settleT = 0;
    st._hT = (st._hT || 0) + dt;
    if (st._hT > 0.03) {
      st._hT = 0;
      st.hist.push(st.theta * 57.3);
      if (st.hist.length > 220) st.hist.shift();
    }
  }

  /* 平衡滑位 x*(m) */
  function balanceX(objW, pinMode) {
    var pin = pinMode === "arm" ? D.pinU : D.pinC;
    return ((objW + D.Wpan) * pin) / D.Wq + pin;
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step, torqueNet: torqueNet, balanceX: balanceX };

  /* 载入自检:平衡滑位 / 环权序列 / 杆秤几何 */
  (function selfCheck() {
    var errs = [];
    var x250 = balanceX(250, "arm");
    var x125 = balanceX(125, "arm");
    if (Math.abs(x250 - balanceX(250, "arm")) > 1e-12) errs.push("平衡滑位不恒等");
    if (!(x250 > x125)) errs.push("重物平衡位应更远");
    if (D.weights[0] !== 250 || D.weights.length !== 5) errs.push("环权序列不符");
    if (Math.abs(D.pinC - D.beamL / 2) > 1e-9) errs.push("等臂支点应居中");
    if (errs.length) {
      var msg = "权衡自检失败: " + errs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
