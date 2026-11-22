/* 长信宫灯 — 尺寸常量与调光-导烟运动学求解器
   文献依据:西汉长信宫灯(满城汉墓窦绾墓出土,河北博物院藏)——宫女执灯,
   双弧屏板绕立轴开合调光;右袖为烟道,烟入体腔水盘溶解(环保设计)。

   调光运动学(载入期断言):
     屏板开度 α ∈ [0°, 90°](双板对开,各转 α)
     光锥角 β = 0.8·α(开度映射光束宽)∈ [0°, 72°]
     光强 I ∝ sin(α)(α=0 全遮 → 暗;α=90 全开 → 亮)
     烟路:火焰点 F → 袖道入口 S → 体腔水面 W(固定样条三段)
     断言:β = 0.8α 严格、α 上限 90、烟路终点在水面高度。
   坐标系:y 上;灯盘心 (0.28, 1.28, 0.30);屏板立轴在盘沿两侧。
   全部几何位于地面之上。 */
(function (MECH) {
  var D = {
    panX: 0.28, panY: 1.28, panZ: 0.30, panR: 0.20,
    alphaMax: 90, kCone: 0.8,
    smoke: {
      F: [0.28, 1.40, 0.30],        // 火焰
      S: [0.34, 1.86, 0.10],        // 袖道入口
      M: [0.10, 1.55, -0.12],       // 袖弯
      W: [0.02, 0.95, -0.20]        // 体腔水面
    },
    figureH: 1.05,
    flameH: 0.09
  };
  D.coneAngle = function (a) { return 0.8 * a; };
  D.brightness = function (a) { return Math.sin(a * Math.PI / 180); };
  D.smokeEndOK = Math.abs(D.smoke.W[1] - 0.95) < 1e-9;

  function deg(a) { return a * 180 / Math.PI; }
  function rad(a) { return a * Math.PI / 180; }
  function ease(t) { return MECH.P.easeInOut(t); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 三段样条取点(烟路示意) */
  function smokePoint(u) {
    var F = D.smoke.F, S = D.smoke.S, M = D.smoke.M, W = D.smoke.W;
    var p;
    if (u < 0.4) { var t = u / 0.4; p = [F[0] + (S[0] - F[0]) * t, F[1] + (S[1] - F[1]) * t * (1 + 0.3 * t), F[2] + (S[2] - F[2]) * t]; }
    else if (u < 0.7) { var t2 = (u - 0.4) / 0.3; p = [S[0] + (M[0] - S[0]) * t2, S[1] + (M[1] - S[1]) * t2, S[2] + (M[2] - S[2]) * t2]; }
    else { var t3 = (u - 0.7) / 0.3; p = [M[0] + (W[0] - M[0]) * t3, M[1] + (W[1] - M[1]) * t3, M[2] + (W[2] - M[2]) * t3]; }
    return p;
  }

  MECH.DIM = D;
  MECH.KS = { deg: deg, rad: rad, ease: ease, clamp: clamp, smokePoint: smokePoint };

  /* 载入期自检 */
  (function selfCheck() {
    var msg = null;
    if (Math.abs(D.coneAngle(90) - 72) > 1e-9) {
      msg = "长信宫灯光锥自检失败: β(90°) ≠ 72°";
    } else if (!D.smokeEndOK) {
      msg = "长信宫灯烟路自检失败: 终点不在水面";
    } else if (Math.abs(D.brightness(0)) > 1e-9 || Math.abs(D.brightness(90) - 1) > 1e-9) {
      msg = "长信宫灯光强自检失败: I(0)≠0 或 I(90)≠1";
    }
    if (msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
