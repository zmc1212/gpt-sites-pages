/* 双摆混沌 — 拉格朗日方程 · RK4 · 载入期断言
   题材复刻:skeeto/double-pendulum(Unlicense 公有领域)— JavaScript 双摆
   RK4 模拟;本站引擎与渲染为原创 plain-JS 零构建实现,未复制上游源码。
   物理量:θ1,θ2(自竖直向下量起),ω1,ω2;摆长 L1,L2;质量 m1,m2;重力 g。
   运动方程(点质量双摆,拉格朗日法):
     α1 = [ −g(2m1+m2)sinθ1 − m2 g sin(θ1−2θ2) − 2 sin(θ1−θ2) m2 (ω2²L2 + ω1²L1 cos(θ1−θ2)) ]
          / [ L1 (2m1 + m2 − m2 cos(2θ1−2θ2)) ]
     α2 = [ 2 sin(θ1−θ2) (ω1²L1(m1+m2) + g(m1+m2)cosθ1 + ω2²L2 m2 cos(θ1−θ2)) ]
          / [ L2 (2m1 + m2 − m2 cos(2θ1−2θ2)) ]
   断言(载入期逐条):
     1. m2=0 退化为单摆:α1 = −(g/L1)sinθ1(解析极限);
     2. 运动方程数值自洽:d/dt(∂L/∂ωᵢ) − ∂L/∂θᵢ ≈ 0(沿短轨迹有限差分复核);
     3. 小摆角本征频率:线性化矩阵特征值 vs 数值振荡周期;
     4. RK4 能量漂移:h=1/600 步进 20s,|ΔE|/E < 5e-6;
     5. 确定性:同初值两次积分逐位一致;
     6. 发散饱和:初值差 1e-6 的双轨 |Δθ| 有界(混沌放大但不发散出界)。 */
(function (DP) {
  /* —— 运动方程(点质量双摆标准形)—— */
  function accel(s, p) {
    var t1 = s[0], t2 = s[1], w1 = s[2], w2 = s[3];
    var m1 = p.m1, m2 = p.m2, L1 = p.L1, L2 = p.L2, g = p.g;
    var d = t1 - t2;
    var den = 2 * m1 + m2 - m2 * Math.cos(2 * d);
    var a1 = (-g * (2 * m1 + m2) * Math.sin(t1)
      - m2 * g * Math.sin(t1 - 2 * t2)
      - 2 * Math.sin(d) * m2 * (w2 * w2 * L2 + w1 * w1 * L1 * Math.cos(d)))
      / (L1 * den);
    var a2 = (2 * Math.sin(d) * (w1 * w1 * L1 * (m1 + m2)
      + g * (m1 + m2) * Math.cos(t1)
      + w2 * w2 * L2 * m2 * Math.cos(d)))
      / (L2 * den);
    return [a1, a2];
  }
  /* 拉格朗日量(供自洽复核) */
  function lagrangian(s, p) {
    var t1 = s[0], t2 = s[1], w1 = s[2], w2 = s[3];
    var m1 = p.m1, m2 = p.m2, L1 = p.L1, L2 = p.L2, g = p.g;
    var T = 0.5 * (m1 + m2) * L1 * L1 * w1 * w1 + 0.5 * m2 * L2 * L2 * w2 * w2
      + m2 * L1 * L2 * w1 * w2 * Math.cos(t1 - t2);
    var V = -(m1 + m2) * g * L1 * Math.cos(t1) - m2 * g * L2 * Math.cos(t2);
    return T + V;   // L = T − V,V 已取负,直接相加
  }
  /* 能量(守恒量,T + V) */
  function energy(s, p) {
    var t1 = s[0], t2 = s[1], w1 = s[2], w2 = s[3];
    var m1 = p.m1, m2 = p.m2, L1 = p.L1, L2 = p.L2, g = p.g;
    var T = 0.5 * (m1 + m2) * L1 * L1 * w1 * w1 + 0.5 * m2 * L2 * L2 * w2 * w2
      + m2 * L1 * L2 * w1 * w2 * Math.cos(t1 - t2);
    var V = -(m1 + m2) * g * L1 * Math.cos(t1) - m2 * g * L2 * Math.cos(t2);
    return T + V;
  }
  /* RK4 定步长 */
  function rk4(s, p, h) {
    function f(S) {
      var a = accel(S, p);
      return [S[2], S[3], a[0], a[1]];
    }
    var k1 = f(s);
    var s2 = new Float64Array(4), s3 = new Float64Array(4), s4 = new Float64Array(4);
    for (var i = 0; i < 4; i++) s2[i] = s[i] + 0.5 * h * k1[i];
    var k2 = f(s2);
    for (var i2 = 0; i2 < 4; i2++) s3[i2] = s[i2] + 0.5 * h * k2[i2];
    var k3 = f(s3);
    for (var i3 = 0; i3 < 4; i3++) s4[i3] = s[i3] + h * k3[i3];
    var k4 = f(s4);
    var out = new Float64Array(4);
    for (var j = 0; j < 4; j++) out[j] = s[j] + h / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]);
    return out;
  }
  /* 小摆角线性化本征频率:det(K − ω²M) = 0(两正模) */
  function linModes(p) {
    var m1 = p.m1, m2 = p.m2, L1 = p.L1, L2 = p.L2, g = p.g;
    /* T = ½a·ω1² + ½b·ω2² + c·ω1ω2;V ≈ ½A·θ1² + ½B·θ2²(a=… 线性化) */
    var a = (m1 + m2) * L1 * L1, b = m2 * L2 * L2, c = m2 * L1 * L2;
    var A = (m1 + m2) * g * L1, B = m2 * g * L2;
    /* 广义特征值 det(K − λM)=0,K=[[A,0],[0,B]], M=[[a,c],[c,b]] */
    var tK = A * b + B * a;
    var r = Math.sqrt(tK * tK - 4 * (A * B) * (a * b - c * c));
    var l1 = (tK - r) / (2 * (a * b - c * c)), l2 = (tK + r) / (2 * (a * b - c * c));
    return [Math.sqrt(l1), Math.sqrt(l2)];
  }

  DP.MATH = { accel: accel, lagrangian: lagrangian, energy: energy, rk4: rk4, linModes: linModes };

  /* —— 载入期自检 —— */
  (function selfCheck() {
    function fail(msg) {
      if (window.DP_SHOW_BOOT_ERROR) window.DP_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
    function near(a, b, tol, msg) {
      if (!(Math.abs(a - b) <= tol)) fail(msg + ": got " + a + " expect " + b);
    }
    var p0 = { m1: 1, m2: 1, L1: 1, L2: 1, g: 9.81 };
    // 1) m2=0 → 单摆极限 α1 = −(g/L1)sinθ1
    var pS = { m1: 1, m2: 0, L1: 1, L2: 0.7, g: 9.81 };
    var aS = accel([0.6, 0.4, 0, 0], pS);
    near(aS[0], -9.81 * Math.sin(0.6), 1e-9, "单摆极限 α1");
    // 2) 运动方程自洽:沿短轨迹数值验证 d/dt(∂L/∂ωi) − ∂L/∂θi = 0
    /* ∂L/∂ω1 = (m1+m2)L1²ω1 + m2 L1 L2 ω2 cos(θ1−θ2)
       ∂L/∂ω2 = m2 L2² ω2 + m2 L1 L2 ω1 cos(θ1−θ2) */
    function pdw(s, p, i) {
      var t1 = s[0], t2 = s[1], w1 = s[2], w2 = s[3];
      var m1 = p.m1, m2 = p.m2, L1 = p.L1, L2 = p.L2;
      if (i === 0) return (m1 + m2) * L1 * L1 * w1 + m2 * L1 * L2 * w2 * Math.cos(t1 - t2);
      return m2 * L2 * L2 * w2 + m2 * L1 * L2 * w1 * Math.cos(t1 - t2);
    }
    function pdth(s, p, i, hfd) {
      function Lat(tt) {
        var ss = [tt[0], tt[1], s[2], s[3]];
        return lagrangian(ss, p);
      }
      var up = [s[0] + (i === 0 ? hfd : 0), s[1] + (i === 1 ? hfd : 0)];
      var dn = [s[0] - (i === 0 ? hfd : 0), s[1] - (i === 1 ? hfd : 0)];
      return (Lat(up) - Lat(dn)) / (2 * hfd);
    }
    function dPwDt(s, p, i, h) {
      /* d/dt(∂L/∂ωi) = (∂²L/∂ω∂θ)·ω + (∂²L/∂ω∂ω)·α — 直接差分走一步状态 */
      var s2 = rk4(s, p, h);
      return (pdw(s2, p, i) - pdw(s, p, i)) / h;
    }
    var s0 = new Float64Array([1.1, 0.6, 0.4, -0.7]);
    var hfd = 1e-6;
    for (var i = 0; i < 2; i++) {
      var residual = dPwDt(s0, p0, i, 1 / 600) - pdth(s0, p0, i, hfd);
      near(residual, 0, 2e-3, "拉格朗日自洽 @i=" + i);
    }
    // 3) 小摆角本征周期:数值振荡 vs 线性化特征值
    var pS2 = { m1: 1, m2: 1, L1: 1, L2: 1, g: 9.81 };
    var modes = linModes(pS2);
    /* 数值:θ1=0.02,θ2=0.018·? 初值取纯慢模比例… 直接验证:总能量近似守恒 + 周期匹配 */
    var h = 1 / 600;
    var s = new Float64Array([0.02, 0.024, 0, 0]);   // 近似慢模激励
    var T = 60, prevSign = 1, crossings = 0, tCross = [];
    for (var k = 0; k < T / h; k++) {
      s = rk4(s, pS2, h);
      if (s[2] * prevSign < 0 && k > 10) { crossings++; tCross.push(k * h); }
      prevSign = s[2];
    }
    if (crossings >= 4) {
      var Tnum = 2 * (tCross[tCross.length - 1] - tCross[0]) / (crossings - 1);
      near(Tnum, 2 * Math.PI / modes[0], 0.35, "慢模周期(数值 vs 线性化)");
    }
    // 4) RK4 能量漂移:混沌初值 20s
    var sc = new Float64Array([2.1, 1.4, 0, 0]);
    var E0 = energy(sc, p0), drift = 0;
    for (var k2 = 0; k2 < 20 / h; k2++) {
      sc = rk4(sc, p0, h);
      drift = Math.max(drift, Math.abs(energy(sc, p0) - E0));
    }
    if (!(drift / Math.abs(E0) < 5e-6)) fail("能量漂移超界: " + (drift / Math.abs(E0)).toExponential(2));
    // 5) 确定性:同初值两次逐位一致
    var sA = new Float64Array([2.1, 1.4, 0, 0]), sB = new Float64Array([2.1, 1.4, 0, 0]);
    for (var k3 = 0; k3 < 3000; k3++) { sA = rk4(sA, p0, h); sB = rk4(sB, p0, h); }
    for (var j = 0; j < 4; j++) if (sA[j] !== sB[j]) fail("确定性破坏 @j=" + j);
    // 6) 发散饱和:δθ=1e-6 双轨 |Δθ| 有界(< 2π·2)
    var sC = new Float64Array([2.1, 1.4, 0, 0]);
    var sD = new Float64Array([2.1 + 1e-6, 1.4, 0, 0]);
    var maxDiv = 0;
    for (var k4 = 0; k4 < 40 / h; k4++) {
      sC = rk4(sC, p0, h); sD = rk4(sD, p0, h);
      maxDiv = Math.max(maxDiv, Math.abs(sD[0] - sC[0]) + Math.abs(sD[1] - sC[1]));
    }
    if (!(maxDiv > 0.5)) fail("混沌未放大初值差(发散曲线异常)");
    if (!(maxDiv < 4 * Math.PI)) fail("发散越界(积分不稳)");
  })();
})(window.DP = window.DP || {});
