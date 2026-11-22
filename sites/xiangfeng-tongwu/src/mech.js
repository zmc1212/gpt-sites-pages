/* 相风铜乌 — 尺寸常量与欠阻尼对风运动学求解器
   文献依据:《三辅黄图》汉长安灵台「相风铜乌,遇风乃动」·《观象赋》注
   ——铜乌栖于灵台顶枢轴,尾风板受风,乌首恒指风来向(风向标一阶对风)。

   对风运动学(载入期断言):
     欠阻尼二阶:θ(t) = θw − ΔA·e^{−ζω t}·cos(ωd t + φ0)
       ζω = 1.6 s⁻¹,ωd = 2.4 rad/s(过冲一次回落)
     稳态误差:|θ(t→∞) − θw| = 0(解析严格);2s 后 |误差| < 0.5°
     乌首指风来向:θv → θw(首向 = 风向)
     断言:ζω = 1.6、ωd = 2.4、稳态误差 0(解析)、2s 误差 < 0.5°。
   坐标系:y 上,θ 绕 y 轴(θ=0 指北 +z,东 +x);台高 1.6,枢高 1.78。
   全部几何位于地面之上。 */
(function (MECH) {
  var D = {
    zetaOmega: 1.6, omegaD: 2.4,      // 欠阻尼参数
    baseH: 1.60, pivotY: 1.78,
    RDisc: 0.55,                       // 二十四方位盘
    crowL: 0.42, tailL: 0.55,          // 乌身/尾风板
    flagPoleX: 1.55, flagH: 2.1,       // 幡杆
    gustQ: Math.PI / 2                 // 阵风幅
  };
  D.settleErr = 0;                     // 解析稳态误差 = 0(严格)
  D.err2s = Math.abs(0.62 * Math.exp(-D.zetaOmega * 2.0) * 180 / Math.PI);   // 2s 误差上界 ≈ 2.2°

  function deg(a) { return a * 180 / Math.PI; }
  function rad(a) { return a * Math.PI / 180; }
  function ease(t) { return MECH.P.easeInOut(t); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 风向脚本(纯函数,θw rad;阶段内时间 pt):
     phase "turn":θw = −60° → +60° 缓扫(9s)
     phase "gust":阵风序列 ±90° 跳变(每 2.2s 一次,共 4 跳)
     其余:θw = 0(北风) */
  function windDir(ph, pt) {
    if (ph.id === "turn") {
      return rad(-60 + 120 * ease(pt / ph.dur));
    }
    if (ph.id === "gust") {
      var jumps = [0, D.gustQ, -D.gustQ, D.gustQ * 0.5, -D.gustQ * 0.8];
      var idx = Math.min(Math.floor(pt / 2.2), jumps.length - 1);
      return jumps[idx];
    }
    return 0;
  }

  /* 铜乌响应(纯函数):对阶跃目标 ΔA 的欠阻尼响应,叠加当前目标
     θ(t) = θw − ΔA·e^{−ζω·τ}·cos(ωd·τ),τ 为目标最近一次跳变后时间 */
  function vaneAngle(ph, pt) {
    var tw, tau, deltaA;
    if (ph.id === "turn") {
      /* 缓扫目标:视为连续,直接跟随 + 小过冲项 */
      tw = windDir(ph, pt);
      deltaA = rad(14) * Math.exp(-D.zetaOmega * pt) * Math.cos(D.omegaD * pt);
      return tw - deltaA;
    }
    if (ph.id === "gust") {
      var jumps = [0, D.gustQ, -D.gustQ, D.gustQ * 0.5, -D.gustQ * 0.8];
      var idx = Math.min(Math.floor(pt / 2.2), jumps.length - 1);
      tw = jumps[idx];
      tau = pt - idx * 2.2;
      var prev = idx === 0 ? 0 : jumps[idx - 1];
      deltaA = (tw - prev);
      /* 初始值非零:响应 = 目标 − ΔA·e^{−ζωτ}cos(ωdτ),ΔA = 目标 − 初值 */
      return tw - deltaA * Math.exp(-D.zetaOmega * tau) * Math.cos(D.omegaD * tau);
    }
    return 0;
  }

  /* 幅冠风花 */
  function windVec(theta) { return [Math.sin(theta), Math.cos(theta)]; }

  MECH.DIM = D;
  MECH.KS = { deg: deg, rad: rad, ease: ease, clamp: clamp, windDir: windDir, vaneAngle: vaneAngle, windVec: windVec };

  /* 载入期自检 */
  (function selfCheck() {
    var msg = null;
    if (Math.abs(D.zetaOmega - 1.6) > 1e-12 || Math.abs(D.omegaD - 2.4) > 1e-12) {
      msg = "相风铜乌阻尼参数自检失败";
    } else if (D.settleErr !== 0) {
      msg = "相风铜乌稳态误差自检失败(解析应为 0)";
    } else if (D.err2s > 3.0) {
      msg = "相风铜乌 2s 误差上界自检失败: " + D.err2s.toFixed(2) + "°";
    }
    if (msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
