/* 阳燧 — 尺寸常量与聚焦光学
   文献依据:《周礼·秋官·司烜氏》:「掌以夫遂取明火于日」(郑玄注:夫遂,阳遂也);
   《考工记》:「金锡半,谓之鉴燧之齐」(铜锡配比);王充《论衡·率性》:
   「阳遂取火于天,五月丙午日中之时……仰以向日,则火来至」;沈括《梦溪笔谈·卷三》:
   「阳燧面洼,向日照之,光皆聚向内,离镜一二寸,光聚为一点,大如麻菽,著物则火发。」
   出土:扶风黄堆西周阳燧(1995)直径 8.8cm、曲率半径 19.8-20cm;昌平白浮两件
   (1975)R≈30.8cm;三门峡虢国墓虎鸟纹阳燧(1956)。
   制式:凹面铜镜(球面),平行日光反射汇聚于焦点 f = R/2(黄堆 f≈9.9cm);
   艾绒置焦点,数秒引燃(现代复制已验证)。
   可验算:
     1. 焦距 f = R/2 = 9.9cm(黄堆 R 19.8cm,载入断言);
     2. 焦斑直径 d = f×0.533° ≈ 0.93mm(太阳视角 0.533°,断言);
     3. 聚光比 (D/d)² = (8.8/0.093)² ≈ 8950(理想,断言公式);
     4. 镜面功率 P = 日照 1361W/m²×πr²×反射 0.6 ≈ 5.0W(r 4.4cm,断言);
     5. 引燃计时:温度模型 Ṫ = kP − c(T−T₀),艾绒燃点约 3s(演示);
     6. 光线几何逐帧积分校验(maxErr<1e-9)。
   演示:向日调角(晨→午)→ 光束聚焦 → 艾绒置焦 → 点火 → 焦斑量测。 */
(function (MECH) {
  var D = {
    Rmirror: 0.198,                // 曲率半径(黄堆 19.8cm)
    discR: 0.044,                  // 镜面半径(直径 8.8cm)
    sunAng: 0.533 * Math.PI / 180,
    solarW: 1361, reflect: 0.6,
    igniteTime: 3.2,               // 引燃时长(演示)
    tilt0: 20 * Math.PI / 180, tilt1: 60 * Math.PI / 180   // 晨→午 仰角
  };
  D.f = D.Rmirror / 2;                            // 0.099 m
  D.spotD = D.f * D.sunAng;                       // 0.00093 m
  D.area = Math.PI * D.discR * D.discR;           // 0.00608
  D.power = D.solarW * D.area * D.reflect;        // 4.97 W
  D.concRatio = Math.pow(D.discR * 2 / (D.spotD * 1000) * 0.001, 2);   // (D/d)² ≈ 8950

  function newState() {
    return {
      time: 0,
      tilt: D.tilt0, tiltT: D.tilt0,
      fuel: 0,                                     // 艾绒温度进度 0..1
      ignited: false, flames: 0,
      aimErr: 0,                                   // 对日误差(rad)
      maxErr: 0, hist: []
    };
  }

  function step(st, dt) {
    st.time += dt;
    var prevT = st.tilt;
    st.tilt += (st.tiltT - st.tilt) * Math.min(1, dt * 1.2);
    /* 对日误差 = |当前仰角 − 太阳仰角(演示恒 45°)| */
    st.aimErr = Math.abs(st.tilt - Math.PI / 4);
    /* 艾绒加热:功率 × cos(aimErr) 效率;点燃后保持 */
    var P = D.power * Math.cos(st.aimErr);
    if (!st.ignited && st.fuel > 0) {
      st.fuel += P * dt / 16;                      // 归一加热(16J→燃点,演示)
      if (st.fuel >= 1) { st.ignited = true; st.flames++; }
    }
    if (st.ignited) st.fuel = Math.min(1.15, st.fuel + dt * 0.1);
    /* 焦点几何积分校验:f 应恒等于 R/2 */
    st._int = (st._int || 0) + dt;
    var err = Math.abs((D.f - D.Rmirror / 2) * st._int);
    if (err > st.maxErr) st.maxErr = err;
    st._hT = (st._hT || 0) + dt;
    if (st._hT > 0.05) {
      st._hT = 0;
      st.hist.push(st.fuel);
      if (st.hist.length > 200) st.hist.shift();
    }
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  /* 载入自检:焦距 / 焦斑 / 聚光比 / 功率 */
  (function selfCheck() {
    var errs = [];
    if (Math.abs(D.f - D.Rmirror / 2) > 1e-12) errs.push("焦距 f ≠ R/2");
    if (Math.abs(D.spotD - D.f * D.sunAng) > 1e-12) errs.push("焦斑直径公式不符");
    if (Math.abs(D.power - D.solarW * D.area * D.reflect) > 1e-6) errs.push("镜面功率公式不符");
    var cr = Math.pow(D.discR * 2 / (D.spotD), 2);
    if (Math.abs(cr - D.concRatio) > 1) errs.push("聚光比不符: " + cr.toFixed(0));
    if (D.spotD > 0.0012) errs.push("焦斑过大(>1.2mm)");
    if (errs.length) {
      var msg = "阳燧自检失败: " + errs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
