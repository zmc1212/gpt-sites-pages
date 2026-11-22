/* 单反相机(SLR)— 反光镜箱·五棱镜·焦平面快门 运动学与光路求解器
   文献依据:Contax S(1949, Zeiss Ikon,首台量产五棱镜单反)/ Pentax Asahiflex
   (1952,即时回弹反光镜)制式口径;现代光学通则按 Jacobson et al.《The Manual
   of Photography》光圈标称序列/焦平面快门几何/共轭成像式。本站复原口径(135 规格示意):
   - 55mm f/1.4 标准镜头,法兰距 42mm → 后主点位于胶片面前 55mm(x=55,胶片面 x=0);
   - 取景光路:后主点 → 反光镜 45°("\"面,法线 (1,1)/√2)反射 → 对焦屏,
     水平 17mm + 竖直 38mm = 55mm 严格(∞对焦);
   - 焦平面快门双幕帘横向走过 36mm 幅宽,幕速 2.2 m/s:X-sync 1/60 缝宽 36.7mm ≥ 36
     (全开判据),1/1000 缝宽 2.2mm,曝光 t = w/v 逐档严格;
   - 光圈 9 叶,f 序列 1.4→16 每档 ×√2(标称舍入 ≤3.5%),通光直径 D = F/N;
   - 五棱镜两次反射恒偏 90°:两反射面方向 112.5°/157.5°(夹角恰 45°),
     2D 光线追迹入射 ±3° 偏差 ≤0.2°;玻璃 n=1.52 全反射临界角 41.14° < 45°;
   - 近摄共轭 1/u+1/v=1/f:u=450mm 时 v=62.66mm,镜筒伸长 e = 7.66mm;
   - 超焦距 H = F²/(N·c) + F(c=0.03mm 弥散圆)。 */
(function (MECH) {
  var K = 0.15;                        // 场景缩放:场景单位 = mm × K(1u = 6.67mm)
  var F = 55;                          // 焦距 mm
  var FSTOPS = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16];
  var FRAME_W = 36, FRAME_H = 24;      // 135 幅面 mm
  var FLANGE = 42;                     // 法兰距(胶片面→卡口)x=0→42
  var NODE_X = 55;                     // 后主点 x=55(在卡口前 13mm)
  var MIRROR_X = 38;                   // 反光镜面与光轴交点 x
  var SCREEN_Y = 38;                   // 对焦屏高度(NODE→镜 17 + 镜→屏 38 = 55)
  var HINGE = [24, 14];                // 反光镜铰链(胶片侧上角;翻起 = 绕此转 +45°)
  var V_CURT = 2200;                   // 幕帘速度 mm/s(2.2 m/s,横向走幅宽)
  var X_SYNC = 60;                     // X 闪光同步 1/60 s
  var SPEEDS = [1000, 500, 250, 125, 60, 30, 8, 1];  // 快门档(1/s)
  var N_BLADES = 9;
  var RING_R = 22;                     // 光圈叶片销轴环半径 mm
  var GLASS_N = 1.52;
  var A112 = 112.5 * Math.PI / 180, A157 = 157.5 * Math.PI / 180;
  var PENTA = (function () {           // 五棱镜:两反射面(夹角恰 45°)+ 玻璃截面
    var P1 = [46, 39.5];               // 反射面 1 过点(底面右端角,方向 112.5°)
    var d1 = [Math.cos(A112), Math.sin(A112)];
    var P2 = [28.5, 64];               // 反射面 2 过点(方向 157.5°)
    var d2 = [Math.cos(A157), Math.sin(A157)];
    var ENTRY_Y = 39.5, EXIT_X = 28, ENTRY_X0 = 28, ENTRY_X1 = 46;
    function hitLine(px, py, dx, dy, ox, oy, u) {
      var t = ((px - ox) * dy - (py - oy) * dx) / (u[0] * dy - u[1] * dx);
      return [ox + u[0] * t, oy + u[1] * t];
    }
    // 轴上光线 (38, ENTRY_Y) 竖直向上 → 反射面1 → 反射面2 → 出射面
    var H1 = hitLine(P1[0], P1[1], d1[0], d1[1], 38, ENTRY_Y, [0, 1]);
    var u1 = [-Math.SQRT1_2, Math.SQRT1_2];            // +y 经 112.5° 面 → 135°
    var H2 = hitLine(P2[0], P2[1], d2[0], d2[1], H1[0], H1[1], u1);
    // 玻璃截面(凸五边形):底面(入射)/反射面1/顶面/反射面2/出射面(竖直)
    var V2 = [P1[0] + 22 * d1[0], P1[1] + 22 * d1[1]];
    var poly = [[EXIT_X, ENTRY_Y], [ENTRY_X1, ENTRY_Y], V2,
                [36, 63.5], [EXIT_X, 65.5]];
    return { P1: P1, P2: P2, d1: d1, d2: d2, H1: H1, H2: H2,
             out: [EXIT_X, H2[1]], poly: poly,
             ENTRY_Y: ENTRY_Y, EXIT_X: EXIT_X, ENTRY_X0: ENTRY_X0,
             ENTRY_X1: ENTRY_X1, ZW: 13 };
  })();

  /* —— 光学/机构求解 —— */
  // 共轭成像(薄透镜):u=∞ → v=F
  function conjV(u) { return u === Infinity ? F : 1 / (1 / F - 1 / u); }
  function extension(u) { return conjV(u) - F; }        // 镜筒伸长(对焦行程)
  function dia(N) { return F / N; }                      // 通光直径 mm
  function apertureArea(N) { return Math.PI * Math.pow(dia(N) / 2, 2); }
  function ev(N, sec) { return Math.log(N * N / sec) / Math.LN2; }   // EV = log2(N²/t)
  function slitMm(S) { return V_CURT / S; }              // 缝宽 w = v/S
  function travelMs() { return FRAME_W / V_CURT * 1000; } // 幕帘走完幅宽 16.36ms
  // 光圈多边形内切半径(9 叶):a = (D/2)·cos(π/9)
  function irisApo(N) { return dia(N) / 2 * Math.cos(Math.PI / N_BLADES); }
  // 叶片转角:销轴环 Rp,内缘距 a → γ = acos(a/Rp)
  function bladeGamma(a) { return Math.acos(Math.min(1, a / RING_R)); }
  // 超焦距 H = F²/(N·c) + F
  function hyperfocal(N, c) { return F * F / (N * c) + F; }
  // 平面镜反射:入射方向 d、镜面法线 n
  function reflect(d, n) {
    var dn = d[0] * n[0] + d[1] * n[1];
    return [d[0] - 2 * dn * n[0], d[1] - 2 * dn * n[1]];
  }
  function hitLine(px, py, dx, dy, ox, oy, u) {
    var t = ((px - ox) * dy - (py - oy) * dx) / (u[0] * dy - u[1] * dx);
    return [ox + u[0] * t, oy + u[1] * t];
  }
  // 五棱镜 2D 追迹:光从底面竖直进入(摆 incDeg),经两条反射面,返回出射方向与偏差角
  function pentaTrace(incDeg) {
    var a = incDeg * Math.PI / 180;
    var u0 = [Math.sin(a), Math.cos(a)];
    var H1 = hitLine(PENTA.P1[0], PENTA.P1[1], PENTA.d1[0], PENTA.d1[1], 38, PENTA.ENTRY_Y, u0);
    var n1 = [-PENTA.d1[1], PENTA.d1[0]];
    if (n1[0] * u0[0] + n1[1] * u0[1] > 0) n1 = [-n1[0], -n1[1]];
    var u1 = reflect(u0, n1);
    var H2 = hitLine(PENTA.P2[0], PENTA.P2[1], PENTA.d2[0], PENTA.d2[1], H1[0], H1[1], u1);
    var n2 = [-PENTA.d2[1], PENTA.d2[0]];
    if (n2[0] * u1[0] + n2[1] * u1[1] > 0) n2 = [-n2[0], -n2[1]];
    var u2 = reflect(u1, n2);
    var dev = Math.abs(Math.atan2(u2[1], u2[0]) - Math.atan2(u0[1], u0[0]));
    while (dev > Math.PI) dev -= 2 * Math.PI;
    return { H1: H1, H2: H2, out: u2, devDeg: dev * 180 / Math.PI };
  }

  /* 取景光路折点(可视化与断言同源):被摄体→镜头→主点→镜→屏→棱镜→目镜 */
  function viewPath() {
    var t = pentaTrace(0);
    return [
      [MECH.DIM.SUBJECT_X, 0], [80, 0], [NODE_X, 0], [MIRROR_X, 0],
      [MIRROR_X, SCREEN_Y], [38, PENTA.ENTRY_Y], PENTA.H1, PENTA.H2,
      PENTA.out, [12, PENTA.out[1]]
    ];
  }

  var newState = function () {
    return {
      run: 0, lastPhase: "",
      mirror: 0,              // 翻起进度 0(取景 45°)→1(全翻平)
      irisN: 1.4,             // 当前光圈(连续动画)
      speedIdx: 0,            // SPEEDS 下标(阶段 5 演示档)
      c1: 0, c2: 0,           // 幕帘行程 0..1
      filmExposed: 0,         // 胶片曝光进度
      exT: 0                  // 曝光段真实时标 ms
    };
  };
  var step = function (st, dt) { st.run += dt; };

  MECH.FOG = [45, 115];
  MECH.SHADOW_BOX = 26;
  MECH.FOV = 42;
  MECH.DIM = {
    K: K, F: F, FSTOPS: FSTOPS, FRAME_W: FRAME_W, FRAME_H: FRAME_H,
    FLANGE: FLANGE, NODE_X: NODE_X, MIRROR_X: MIRROR_X, SCREEN_Y: SCREEN_Y,
    HINGE: HINGE, V_CURT: V_CURT, X_SYNC: X_SYNC, SPEEDS: SPEEDS,
    N_BLADES: N_BLADES, RING_R: RING_R, GLASS_N: GLASS_N, PENTA: PENTA,
    SUBJECT_X: 150, EYE_X: 12, FOCUS_DEMO_U: 450
  };
  MECH.KS = {
    newState: newState, step: step,
    conjV: conjV, extension: extension, dia: dia, apertureArea: apertureArea,
    ev: ev, slitMm: slitMm, travelMs: travelMs, irisApo: irisApo,
    bladeGamma: bladeGamma, hyperfocal: hyperfocal,
    reflect: reflect, pentaTrace: pentaTrace, viewPath: viewPath
  };

  /* —— 载入期自检:光路追迹与机构数值逐条断言 —— */
  (function selfCheck() {
    function fail(msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
    function near(a, b, tol, msg) {
      if (!(Math.abs(a - b) <= tol)) fail(msg + ": got " + a + " expect " + b);  // NaN 判失败
    }
    // 1) 取景光路严格 55mm:水平(NODE→镜) + 竖直(镜→屏)
    near(NODE_X - MIRROR_X + SCREEN_Y, F, 1e-9, "取景光路总长 ≠ 焦距 55");
    // 2) 反光镜 "\"面法线 (1,1)/√2:入射 (−1,0) → 反射 (0,1)
    var r = reflect([-1, 0], [Math.SQRT1_2, Math.SQRT1_2]);
    near(r[0], 0, 1e-9, "反射方向 x");
    near(r[1], 1, 1e-9, "反射方向 y(应向上)");
    // 3) 五棱镜恒偏 90°:入射 −3°…+3° 偏差 ≤0.2°
    for (var inc = -3; inc <= 3.01; inc += 0.5) {
      var tr = pentaTrace(inc);
      near(Math.abs(tr.devDeg - 90), 0, 0.2, "五棱镜偏差 @inc" + inc + "°");
    }
    // 4) TIR:临界角 asin(1/n)=41.14° < 45°(反射面内角)
    var crit = Math.asin(1 / GLASS_N) * 180 / Math.PI;
    near(crit, 41.141, 0.01, "临界角");
    if (!(crit < 45)) fail("TIR 不成立");
    // 5) 棱镜轴上追迹:两次反射后出射方向恰 −x,反射点在玻璃截面内
    var t0 = pentaTrace(0);
    near(t0.out[0], -1, 1e-6, "棱镜出射方向 x");
    near(t0.out[1], 0, 1e-6, "棱镜出射方向 y");
    if (!(t0.H1[1] > PENTA.ENTRY_Y && t0.H1[1] < 66)) fail("棱镜第一反射点越界");
    if (!(t0.H2[1] > PENTA.ENTRY_Y && t0.H2[1] < 66)) fail("棱镜第二反射点越界");
    if (!(t0.H2[0] > PENTA.EXIT_X)) fail("棱镜第二反射点未及出射面");
    // 6) 两条反射面夹角 45°(方向点积)
    var dot = PENTA.d1[0] * PENTA.d2[0] + PENTA.d1[1] * PENTA.d2[1];
    near(dot, Math.cos(45 * Math.PI / 180), 1e-9, "反射面二面角 ≠ 45°");
    // 7) 光圈 f 序列每档 ×√2(标称舍入 ≤3.5%)
    for (var i = 1; i < FSTOPS.length; i++) {
      var ratio = FSTOPS[i] / FSTOPS[i - 1];
      near(ratio, Math.SQRT2, 0.035, "f 序列档比 @" + i);
    }
    // 8) 通光直径 D = F/N;面积比 f/1.4→f/2 = (1.4/2)²
    near(dia(1.4), 39.286, 0.01, "D(f/1.4)");
    near(apertureArea(2) / apertureArea(1.4), Math.pow(1.4 / 2, 2), 1e-6, "通光面积比");
    // 9) 互易律 EV 配对 <0.1 档
    var evPairs = [[16, 1 / 60, 4, 1 / 1000], [11, 1 / 125, 5.6, 1 / 500], [8, 1 / 250, 4, 1 / 1000]];
    evPairs.forEach(function (p, j) {
      var dEV = Math.abs(ev(p[0], p[1]) - ev(p[2], p[3]));
      if (!(dEV < 0.1)) fail("EV 配对 " + j + " 差 " + dEV.toFixed(3) + " 档");
    });
    // 10) 幕帘:t = w/v 严格;X-sync 全开判据 w(1/60) ≥ 36mm;走完幅宽 < 1/60
    near(slitMm(1000), 2.2, 1e-9, "缝宽 1/1000");
    near(slitMm(60), 36.667, 1e-3, "缝宽 1/60");
    if (!(slitMm(X_SYNC) >= FRAME_W)) fail("X-sync 1/60 缝宽不足以全开");
    for (var s = 1; s < 5; s++) near(slitMm(SPEEDS[s - 1]) / slitMm(SPEEDS[s]), SPEEDS[s] / SPEEDS[s - 1], 1e-9, "缝宽档比");
    near(travelMs(), 16.364, 0.01, "幕帘走幅宽时间");
    if (!(travelMs() < 1000 / X_SYNC)) fail("幕帘走完时间 > X-sync 窗口");
    // 11) 近摄共轭:u=450 → v=62.66,伸长 7.66mm;u=∞ → v=F
    near(conjV(450), 62.658, 0.01, "v(u=450)");
    near(extension(450), 7.658, 0.01, "对焦伸长 7.66mm");
    near(conjV(Infinity), F, 1e-9, "v(∞) = F");
    // 12) 超焦距:f=55, f/8, c=0.03 → 12.66m
    near(hyperfocal(8, 0.03) / 1000, 12.659, 0.01, "超焦距 f/8");
    // 13) 光圈 9 叶内切半径与叶片角一致性(往返)
    near(irisApo(8), 55 / 8 / 2 * Math.cos(Math.PI / 9), 1e-9, "内切半径");
    near(RING_R * Math.cos(bladeGamma(irisApo(8))), irisApo(8), 1e-9, "叶片角往返");
    // 14) 幅面比例 3:2
    near(FRAME_W / FRAME_H, 1.5, 1e-9, "135 幅面 3:2");
  })();
})(window.MECH = window.MECH || {});
