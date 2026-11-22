/* 记里鼓车 — 尺寸常量与齿轮系运动学
   文献依据:《宋史·舆服志》卢道隆制(1027):足轮径六尺(周 18 尺),行一里
   100 转;立轮 100 齿 → 下平轮 10 齿 → 旋风轮 10 齿 → 中平轮 100 齿,
   总比 100:1,中平轮轴每里一转,凸轮拨木人击鼓(左右交替)。
   演示压缩:每 5 足轮转记一「演示里」(20:1,状态卡与图纸明示),
   击鼓左右交替、每 4 演示里上层木人击镯(对应真实十里击镯)。 */
(function (MECH) {
  var CHI = 0.3;
  var D = {
    CHI: CHI,
    rWheel: 0.9,               // 足轮半径(径六尺)
    W: 2.2,                    // 辙距
    Z立: 100, Z下: 10, Z旋: 10, Z中: 100,
    r立: 0.60, r下: 0.16, r旋: 0.16, r中: 0.60,   // 模数一致 0.012
    demoChiPerRev: 2,          // 演示:每 2 转一里(压缩 50:1,真实 100 转/里)
    realChiPerRev: 100,
    vK: { slow: 1.2, fast: 2.8 },
    boxL: 2.6, boxW: 1.6, boxH1: 0.78, boxH2: 0.62,
    axleY: 0.9,
    drums: { drumY: 2.18, braceY: 2.30 }
  };
  D.ratio = D.Z中 * D.Z旋 * 0 + (D.Z立 / D.Z下) * (D.Z旋 / D.Z中) * (D.Z中 / D.Z旋) * 1;  // 100/10*10/100*... 展示链
  D.ratioReal = 100;                                  // 真实总比(文献)
  D.midPerRev = 1 / D.ratioReal;                      // 中平轮每足轮转角(转)
  D.revPerChi = D.demoChiPerRev;                      // 演示里所需转数

  function newState() {
    return {
      time: 0, dist: 0, psi: 0,                       // 里程/轮转角
      v: 0, vTarget: 0,
      chiCount: 0, lastChiRev: 0,                     // 演示里计数
      drumSide: 0,                                    // 0=左 1=右(交替)
      armSwing: [0, 0], armT: [-1, -1],               // 左/右木人臂摆动
      gongArm: 0, gongT: -1,                          // 击镯
      events: [],                                     // {t, side, chi}
      midAngle: 0, camAdj2: 0,
      lastPhase: "", manual: false,
      trail: 0
    };
  }

  function step(st, dt) {
    st.v += (st.vTarget - st.v) * Math.min(1, dt * 2.0);
    st.dist += st.v * dt;
    st.psi = st.dist / D.rWheel;                      // 足轮转角(rad)
    st.midAngle = st.psi / D.ratioReal;               // 中平轮转角(真实比)
    var rev = st.psi / (2 * Math.PI);
    var chi = Math.floor(rev / D.revPerChi);
    if (chi > st.chiCount) {                          // 过演示里界 → 击鼓
      st.chiCount = chi;
      st.drumSide = (chi - 1) % 2;                    // 左右交替
      st.armT[st.drumSide] = st.time;
      st.events.push({ t: st.time, side: st.drumSide, chi: chi, rev: +rev.toFixed(1) });
      if (st.events.length > 10) st.events.shift();
      if (chi % 2 === 0) st.gongT = st.time;          // 每 2 演示里击镯
    }
    for (var k = 0; k < 2; k++) {
      var a = st.time - st.armT[k];
      st.armSwing[k] = a >= 0 && a < 0.55 ? Math.sin(a / 0.55 * Math.PI) : 0;
    }
    var ga = st.time - st.gongT;
    st.gongArm = ga >= 0 && ga < 0.55 ? Math.sin(ga / 0.55 * Math.PI) : 0;
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  /* 载入期自检:总比 + 击鼓转数间隔 + 左右交替 */
  (function selfCheck() {
    var errs = [];
    if (Math.abs(D.ratioReal - 100) > 1e-9) errs.push("总比非 100");
    if (Math.abs((D.Z立 / D.Z下) * (D.Z旋 / D.Z中)) > 1 + 1e-9 ||
        Math.abs((D.Z立 / D.Z下) * (D.Z旋 / D.Z中) - 10) > 1e-9) errs.push("两级比非 10:1");
    /* 40s 模拟:击鼓间隔(转数)应为演示值 ±0.02,左右交替 */
    var st = newState();
    st.vTarget = D.vK.slow;
    st.v = D.vK.slow;
    var lastRev = -1, sideSeq = [];
    for (var i = 0; i < 1200; i++) {
      step(st, 1 / 30);
      var rev = st.psi / (2 * Math.PI);
      if (st.events.length && st.events[st.events.length - 1].rev !== lastRev) {
        var ev = st.events[st.events.length - 1];
        if (lastRev >= 0 && Math.abs(ev.rev - lastRev - D.revPerChi) > 0.02) errs.push("击鼓间隔异常");
        sideSeq.push(ev.side);
        lastRev = ev.rev;
      }
    }
    for (var k = 1; k < sideSeq.length; k++) if (sideSeq[k] === sideSeq[k - 1]) errs.push("未交替");
    if (errs.length) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR("记里鼓车自检失败: " + errs.join(";"));
      throw new Error(errs.join(";"));
    }
  })();
})(window.MECH = window.MECH || {});
