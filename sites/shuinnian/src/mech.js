/* 水碾 — 尺寸常量与运动学求解器
   文献依据:王祯《农书·农器图谱》水碾(维基文库四库本卷十九):
     「水碾,水轮转碾也。《后魏书》:崔亮教民为碾,奏于张方桥东堰谷水造水碾数十区……
      但下作卧轮或立轮,如水磨之法。轮轴上端穿其碢干,水激则碢随轮转,循槽轹谷,
      疾若风雨,日所毇米比于陆碾,功利过倍。」
   制式:卧轮式——水轮(卧轮,16 斜叶)立于井筒(石囷)水面上方,轮轴上端直接
   穿碢干(碾臂):ω公 = ω轮(同轴直驱,1:1,载入断言);碢(石辊,轴沿半径)
   被碢干拖行绕碾槽公转,槽面摩擦使其滚动无滑移自转:
     ω自 = |ω公|·R槽/r辊 = (1.30/0.15)·|ω公| = 8.67|ω公|
   (内缘实际存在滑动,见《力学与实践》碾磙力学注记,本站取中线纯滚动简化。)
   闸门开度 g∈[0.3,1.0]:ω轮 = 0.75·g(流量线性模型 Q=0.014g m³/s)。
   布局:井筒(石囷)内水面 +0.30,轮盘面 +0.50;碾盘架于井筒壁顶(+0.95..1.19),
   轮轴穿盘心直上碢干;引水木枧跨越井筒西壁,跌水注叶。 */
(function (MECH) {
  var D = {
    ax: -3.0, az: 0.6,            // 轮轴=碾盘中心(同一立轴)
    wheelY: 0.50, rWheel: 1.30, nBlade: 16,   // 卧轮盘面高/半径/叶数
    shaftTop: 1.95, armY: 1.55,   // 立轴顶 / 碢干高度
    panR: 1.75, panY0: 0.95, panH: 0.24,      // 碾盘半径/底高/厚(顶 1.19)
    grooveR: 1.30, grooveW: 0.42, grooveD: 0.07,  // 碾槽环心半径/宽/深
    rollerR: 0.15, rollerL: 0.34, rollerY: 1.27,  // 石辊半径/长/轴心高
    cisRIn: 1.55, cisROut: 1.85, cisH: 0.95,      // 井筒内/外半径/壁顶高
    cisFloor: 0.15, cisWater: 0.30,               // 井筒底/水面
    flumeX0: -5.55, flumeX1: -4.15, flumeY0: 1.10, flumeY1: 0.72, gateX: -4.85,
    hopperX: -1.73, hopperZ: -1.38,
    omegaK: 0.75,                 // ω轮 = 0.75·闸门开度 (rad/s)
    QK: 0.014,                    // 流量 Q = 0.014·g (m³/s)
    head: 0.40, eta: 0.6          // 枧口至水面跌水差 / 效率(功率估算)
  };
  D.panTop = D.panY0 + D.panH;                 // 1.19
  D.grooveFloor = D.panTop - D.grooveD;        // 1.12
  D.rollRatio = D.grooveR / D.rollerR;         // 8.667

  function newState() {
    return {
      time: 0,
      thetaWheel: 0, omegaWheel: 0,     // 水轮角/角速度(=碾臂公转角)
      thetaYoke: 0, omegaYoke: 0,       // 碢干公转(=θ轮,直驱)
      phiRoller: 0, omegaRoller: 0,     // 石辊自转(滚动无滑移)
      gate: 0, gateTarget: 0,
      revs: 0, crushed: 0, maxErr: 0,
      running: false
    };
  }

  function wrapPi(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }

  /* 单步运动学:立轴直驱,碢干与水轮同角 */
  function step(st, dt) {
    st.omegaWheel += (D.omegaK * st.gate - st.omegaWheel) * Math.min(1, dt * 1.4);
    st.thetaWheel += st.omegaWheel * dt;
    st.omegaYoke = st.omegaWheel;
    st.thetaYoke = st.thetaWheel;
    st.omegaRoller = -st.omegaYoke * D.rollRatio;   // 滚动无滑移:公转 CCW ⇒ 自转绕半径轴负向
    st.phiRoller += st.omegaRoller * dt;
    st.revs = st.thetaYoke / (2 * Math.PI);
    st.running = Math.abs(st.omegaWheel) > 0.05;
    /* 滚动无滑移积分校验:φ自 应严格等于 (−θ公)·R/r */
    var err = Math.abs(st.phiRoller - (-st.thetaYoke) * D.rollRatio);
    if (err > st.maxErr) st.maxErr = err;
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step, wrapPi: wrapPi };

  /* 载入期自检:直驱同轴 / 辊槽配合 / 井筒与轮盘配合 / 净空 */
  (function selfCheck() {
    var msgs = [];
    if (Math.abs(D.rollRatio - D.grooveR / D.rollerR) > 1e-12) msgs.push("自转比与 R/r 不符");
    if (D.rollerL / 2 > D.grooveW / 2 - 0.02) msgs.push("辊长超出槽宽");
    if (Math.abs(D.rollerY - (D.grooveFloor + D.rollerR)) > 1e-9) msgs.push("辊心高与槽底不符");
    if (D.grooveR + D.grooveW / 2 > D.panR - 0.08) msgs.push("碾槽超出盘缘");
    if (D.rWheel > D.cisRIn - 0.15) msgs.push("水轮触及井筒内壁");
    if (D.wheelY - 0.16 < D.cisWater) msgs.push("轮叶没入水面(应为跌水驱动)");
    if (D.cisFloor > D.cisWater - 0.10) msgs.push("井筒底高于水面");
    if (!(D.panR > D.cisRIn && D.panR < D.cisROut + 0.3)) msgs.push("碾盘与井筒壁顶搭接不当");
    if (D.armY - D.panTop < 0.25) msgs.push("碢干与碾盘净空不足");
    if (msgs.length) {
      var msg = "水碾自检失败: " + msgs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
