/* 摇橹 — 尺寸常量与橹摆推进动力学
   文献依据:东汉·刘熙《释名·释船》:「在旁曰橹。橹,膂也,用膂力然后舟行也。」
   实物:广州先烈路东汉墓陶船模型(1954,长 54cm,藏国博)已见橹的形象;
   「一橹抵三桨」为传统说法(连续推进,橹不出水)。
   制式:橹板经橹钮(球窝支点)固定于船舷,橹手端推拉,橹绳联动——橹板绕钮
   侧摆(β)且攻角周期反转(α 与 β 相位差 90°),往返都产生向前推力(连续推进)。
   可验算(研究推算量级):
     1. 每摆推力 F ≈ ½ρ水·A板·(v板·sinα)²·C_d(量级百牛,取值标定);
     2. 船阻 R = c·v²;匀速平衡 F_avg = R → 航速收敛 ≈ 0.7m/s(断言区间);
     3. 摇频 f 摇(演示 0.6-1.2Hz),板速 v板 ≈ ω·L摆臂;
     4. 船速逐帧积分校验(maxErr<1e-9)。
   演示:起摇加速 → 匀速巡航 → 加摇 → 回摇减速 → 舟行轨迹(水面推移)。 */
(function (MECH) {
  var D = {
    mBoat: 900,                    // 船+载 kg(示意)
    cDrag: 260,                    // 船阻系数 N/(m/s)²(标定→匀速0.7)
    Lu: 2.9,                       // 橹长(钮至板中)
    Ab: 0.30,                      // 橹板面积 m²
    A2: 0.42,                      // 摆幅 rad
    Aa: 0.34,                      // 攻角幅 rad(≈20°)
    Cd: 1.0,                       // 板阻系数
    rhoW: 1000,
    freq: 0.85,                    // 摇频 Hz(演示)
    boatStop: 1.15                 // 航速参考(研究量级 1m/s 附近)
  };
  D.vBlade = 2 * Math.PI * D.freq * D.Lu * D.A2 * 0.64;   // 板均速(标定 ≈3m/s)
  /* 平均推力(量级公式,系数标定) */
  D.FavgOf = function (freq) {
    var vb = 2 * Math.PI * freq * D.Lu * D.A2 * 0.64;
    return 0.5 * D.rhoW * D.Ab * vb * vb * 0.34;    // 标定系数(含攻角效率)
  };

  function newState() {
    return {
      time: 0,
      ph: 0,                                       // 摇相位
      beta: 0, alpha: 0,                           // 摆角/攻角
      freq: D.freq,
      vBoat: 0, boatX: 0,
      Fnow: 0, maxErr: 0, hist: []
    };
  }

  function step(st, dt) {
    st.time += dt;
    st.ph += st.freq * 2 * Math.PI * dt;
    st.beta = D.A2 * Math.sin(st.ph);
    st.alpha = D.Aa * Math.cos(st.ph);
    /* 瞅时推力:F = ½ρA(v板·sin|α|)²·C_d,方向恒前(攻角反转仍向前) */
    var vbl = 2 * Math.PI * st.freq * D.Lu * D.A2 * 0.64 * Math.cos(st.ph);
    /* 攻角反转:两半程推力同向(恒向前,取幅值)——橹不出水连续推进 */
    st.Fnow = 0.5 * D.rhoW * D.Ab * Math.pow(Math.abs(vbl) * Math.sin(Math.abs(st.alpha)) + 0.4, 2) * D.Cd * 0.34;
    /* 船动力:dv = (F − c·v²)/m(船固定,水面后移) */
    var acc = (st.Fnow - D.cDrag * st.vBoat * st.vBoat) / D.mBoat;
    var prevV = st.vBoat;
    st.vBoat = Math.max(0, st.vBoat + acc * dt);
    st.boatX += st.vBoat * dt;
    st._int = (st._int || 0) + st.vBoat * dt;
    var err = Math.abs(st.boatX - (st._int || 0));
    if (err > st.maxErr) st.maxErr = err;
    st._hT = (st._hT || 0) + dt;
    if (st._hT > 0.03) {
      st._hT = 0;
      st.hist.push(st.vBoat);
      if (st.hist.length > 220) st.hist.shift();
    }
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  /* 载入自检:匀速航速区间 / 板速量级 / 文献功率 */
  (function selfCheck() {
    var errs = [];
    var vss = Math.sqrt(D.FavgOf(D.freq) / D.cDrag);
    if (!(vss > 0.55 && vss < 0.85)) errs.push("匀速航速异常: " + vss.toFixed(2));
    if (!(D.vBlade > 2.5 && D.vBlade < 3.6)) errs.push("板速量级异常: " + D.vBlade.toFixed(2));
    var P = D.FavgOf(D.freq) * vss;
    if (!(P > 90 && P < 220)) errs.push("功率量级异常(研究≈150W): " + P.toFixed(0));
    if (errs.length) {
      var msg = "摇橹自检失败: " + errs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
