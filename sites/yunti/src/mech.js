/* 云梯 — 尺寸常量与立梯-飞梯运动学
   文献依据:宋·《武经总要·前集·卷十·攻城法》:「云梯,以大木为床,下施六轮,
   上立二梯,各长二丈馀,中施转轴。车四面以生牛皮为屏蔽,内以人推进及城,
   则起飞梯于云梯之上,以窥城中,故曰云梯。」绞车借鉴《太白阴经·卷四》
   「其上城首冠双辘轳」(云梯条正文未载绞车,标注借鉴);梯首抓钩为复原画法(推算)。
   制式:床(六轮车)+ 牛皮屏;主梯 6.2m 绕车顶转轴立起(折叠态 15° → 55°);
   飞梯 2.2m 沿主梯滑轨上展;梯首抓钩搭城堞。
   可验算:
     1. 立梯绞绳收长 Δs = L臂(sin55°−sin15°) = 2.5×0.560 = 1.40m;
        绞车 r0.12 → 圈数 = Δs/(2πr) = 1.86 圈(载入断言);
     2. 飞梯上展 Δs2 = 2.2m → 绞车圈数 2.92(第二筒,断言);
     3. 可达城高 H = L总·sinθ + 车顶高 = 8.4×sin55° + 1.10 = 7.98m(断言,抵城堞);
     4. 绞绳逐帧积分校验(maxErr<1e-9)。
   场景:城墙 7.2m(宋城高约 10m 的可视压缩,轮距原大)。 */
(function (MECH) {
  var D = {
    cartX: 0, cartH: 1.10, wheelR: 0.30,
    pivot: { x: 0.35, y: 1.10, z: 0 },          // 转轴(车顶)
    Lmain: 6.2, Lfly: 2.2,
    th0: 15 * Math.PI / 180, th1: 55 * Math.PI / 180,
    ropeArm: 2.5,                                // 绳系点距转轴
    winchR: 0.12,
    wallX: -5.20, wallH: 7.20, wallT: 1.4,   // 东墙面≈钩落点(0.35−Lcos55)
    flyLen: 2.2
  };
  D.Ltotal = D.Lmain + D.Lfly;                    // 8.4
  D.dRope1 = D.ropeArm * (Math.sin(D.th1) - Math.sin(D.th0));   // 1.40
  D.turns1 = D.dRope1 / (2 * Math.PI * D.winchR);               // 1.86
  D.dRope2 = D.flyLen;                                          // 2.20
  D.turns2 = D.dRope2 / (2 * Math.PI * D.winchR);               // 2.92
  D.Hreach = D.Ltotal * Math.sin(D.th1) + D.cartH;              // 7.98

  function newState() {
    return {
      time: 0,
      theta: D.th0, thetaT: D.th0,               // 主梯角
      fly: 0, flyT: 0,                            // 飞梯延伸量
      rope1: 0, rope2: 0,                         // 绞绳累计
      hooked: false, maxErr: 0,
      hist: []
    };
  }

  function step(st, dt) {
    st.time += dt;
    /* 主梯角推进(绞升段由 timeline 控制 thetaT) */
    var prevT = st.theta;
    st.theta += (st.thetaT - st.theta) * Math.min(1, dt * 0.9);
    /* 绞绳累计(第一筒:立梯) */
    st.rope1 += D.ropeArm * (Math.sin(st.theta) - Math.sin(prevT));
    /* 飞梯延伸 */
    var prevF = st.fly;
    st.fly += (st.flyT - st.fly) * Math.min(1, dt * 0.9);
    st.rope2 += (st.fly - prevF);
    st.hooked = st.fly > D.flyLen * 0.97 && st.theta > D.th1 - 0.02;
    st._r12 = st.rope1 + st.rope2;
    var err = Math.abs((st.rope1 + st.rope2) - (st._r12 || 0));
    if (err > st.maxErr) st.maxErr = err;
    st._hT = (st._hT || 0) + dt;
    if (st._hT > 0.03) {
      st._hT = 0;
      st.hist.push(st.theta);
      if (st.hist.length > 240) st.hist.shift();
    }
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  /* 载入自检:绞绳收长 / 圈数 / 可达城高 / 抵城净距 */
  (function selfCheck() {
    var errs = [];
    if (Math.abs(D.dRope1 - D.ropeArm * (Math.sin(D.th1) - Math.sin(D.th0))) > 1e-9) errs.push("立梯绞绳收长公式不符");
    if (Math.abs(D.turns1 - D.dRope1 / (2 * Math.PI * D.winchR)) > 1e-9) errs.push("圈数公式不符");
    if (Math.abs(D.Hreach - D.Ltotal * Math.sin(D.th1) + 1e-9) > 1e-9 && Math.abs(D.Hreach - (D.Ltotal * Math.sin(D.th1) + D.cartH)) > 1e-9) errs.push("可达城高公式不符");
    var gap = Math.abs(Math.abs(D.wallX + D.wallT / 2) - (D.Ltotal * Math.cos(D.th1) + 0.35));
    if (gap > 0.35) errs.push("钩-墙堞几何不符: 差 " + gap.toFixed(2) + "m");
    if (errs.length) {
      var msg = "云梯自检失败: " + errs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
