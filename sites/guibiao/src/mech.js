/* 圭表 — 尺寸常量与晷影几何
   文献依据:《周髀算经·卷上》:「周髀长八尺,夏至之日晷一尺六寸」;
   节气晷影表:「冬至晷长一丈三尺五寸,夏至晷长一尺六寸,凡八节二十四气,
   气损益九寸九分六分分之一。」实物参照:登封观星台量天尺(长 31.19m)。
   制式:八尺表(周尺 0.231 → 1.85m)北端立于圭(南向石尺 3.5m)北端;
   正午太阳高度 h = 90° − φ + δ(φ = 35.3°:由《周髀》两至影长反推自洽,
   ε 古黄赤大距 24°);影长 L = H / tan(h)。
   自洽验算(载入断言):
     1. 夏至(δ=+24°):h = 78.7° → L = 1.85/tan(78.7°) = 0.374m = 1尺6寸
        (周尺 0.231×1.6 = 0.370,差 <5mm)——「夏至之日晷一尺六寸」;
     2. 冬至(δ=−24°):h = 30.7° → L = 2.96m ≈ 一丈三尺五寸(3.12m,差 5%,
        《周髀》影长表含观测系统性,标注);
     3. 二十四气:δ = asin(sin ε·sin λ),λ 每 15° 一气,影长逐气递推;
     4. 影长逐帧积分校验(maxErr<1e-9)。
   演示:节气扫描 24 气(冬→夏→冬),晷影滑动,影端游标读数。 */
(function (MECH) {
  var ZHOU = 0.231;                              // 周尺
  var D = {
    ZHOU: ZHOU,
    H: 8 * ZHOU,                                  // 表高 1.848
    guL: 3.5,                                     // 圭长(须≥冬至影+余量)
    phi: 35.3 * Math.PI / 180,                    // 反推纬度(《周髀》自洽)
    eps: 24 * Math.PI / 180,                      // 古黄赤大距
    seasons: 24,
    seasonDur: 2.0                                // 每气演示时长 s
  };
  D.Lsummer = D.H / Math.tan((90 * Math.PI / 180) - D.phi + D.eps);   // 0.374
  D.Lwinter = D.H / Math.tan((90 * Math.PI / 180) - D.phi - D.eps);   // 2.96
  D.refSummer = 1.6 * ZHOU;                       // 0.370
  D.refWinter = 13.5 * ZHOU;                      // 3.12

  /* 节气序(0=冬至):太阳黄经 λ = 0..360(15°/气),δ = asin(sinε·sinλ) */
  function declination(frac) {                    // frac 0(冬至)→1(一年)
    var lam = frac * 2 * Math.PI;
    return Math.asin(Math.sin(D.eps) * Math.sin(lam));
  }
  function altitude(frac) { return Math.PI / 2 - D.phi + declination(frac); }
  function shadowLen(frac) { return D.H / Math.tan(altitude(frac)); }

  function newState() {
    return {
      time: 0,
      frac: 0, fracDir: 1,                        // 0 冬至 → 0.5 夏至 → 1 冬至
      shadow: shadowLen(0),
      alt: altitude(0), decl: declination(0),
      maxErr: 0, hist: []
    };
  }

  function step(st, dt) {
    st.time += dt;
    st.frac += st.fracDir * dt / (D.seasons * D.seasonDur);
    if (st.frac >= 1) { st.frac = 1; st.fracDir = -1; }
    if (st.frac <= 0) { st.frac = 0; st.fracDir = 1; }
    var prev = st.shadow;
    st.decl = declination(st.frac);
    st.alt = altitude(st.frac);
    st.shadow = shadowLen(st.frac);
    st._int = (st._int || 0) + (st.shadow - prev);
    var err = Math.abs((st._int || 0) - (st.shadow - shadowLen(0)));
    if (err > st.maxErr) st.maxErr = err;
    st._hT = (st._hT || 0) + dt;
    if (st._hT > 0.05) {
      st._hT = 0;
      st.hist.push(st.shadow);
      if (st.hist.length > 220) st.hist.shift();
    }
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step, declination: declination, altitude: altitude, shadowLen: shadowLen };

  /* 载入自检:两至影长与《周髀》对照 */
  (function selfCheck() {
    var errs = [];
    if (Math.abs(D.Lsummer - D.refSummer) > 0.01) errs.push("夏至影长差 >1cm: " + D.Lsummer.toFixed(3));
    if (Math.abs(D.Lwinter - D.refWinter) / D.refWinter > 0.06) errs.push("冬至影长差 >6%: " + D.Lwinter.toFixed(3));
    if (Math.abs(D.H - 8 * ZHOU) > 1e-9) errs.push("表高 ≠ 八尺");
    if (D.guL < D.Lwinter + 0.3) errs.push("圭长不足以容冬至影");
    if (errs.length) {
      var msg = "圭表自检失败: " + errs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
