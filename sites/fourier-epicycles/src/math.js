/* 傅里叶级数画图 — DFT 数学核心与载入期断言
   复刻锚点:trozler/myFourierEpicycles(MIT)题材复刻(引擎与渲染为本站原创
   plain-JS 零构建实现);谱系:Coding Train Challenge #130。
   数学:采样 M=256 点闭合路径 z_n ∈ ℂ;
     c_k = (1/M)·Σ z_n·e^(−2πikn/M)         (DFT, k = −M/2 … M/2−1)
     ẑ(t) = Σ_{|k|≤N} c_k·e^(2πikt/M)       (截断重构 → 圆环叠加)
   断言(载入期逐条,不等即 throw):
     1. 采样闭合(首尾相接)与点数;
     2. DFT-IDFT 往返 < 1e-6;
     3. Parseval:Σ|c_k|² = (1/M)Σ|z_n|²;
     4. 旋转等变:路径整体旋转 φ 后 |c_k| 不变;
     5. 截断误差随 N 单调不增;
     6. 截断误差² ≤ 尾部能量界(Parseval 推论)。 */
(function (FE) {
  var M = 256;

  /* 复数用 [re, im] 二元组;路径 = Float64Array 交替存 re/im */
  function dft(path, M) {
    var re = new Float64Array(M), im = new Float64Array(M);
    var out = [];
    for (var k = -M / 2; k < M / 2; k++) {
      var sr = 0, si = 0;
      for (var n = 0; n < M; n++) {
        var ang = -2 * Math.PI * k * n / M;
        var c = Math.cos(ang), s = Math.sin(ang);
        var zr = path[2 * n], zi = path[2 * n + 1];
        sr += zr * c - zi * s;
        si += zr * s + zi * c;
      }
      out.push({ k: k, re: sr / M, im: si / M });
    }
    return out;
  }
  /* 用系数子集重构:coeffs = [{k, re, im}],返回 M 点路径 */
  function idft(coeffs, M) {
    var out = new Float64Array(M * 2);
    for (var n = 0; n < M; n++) {
      var sr = 0, si = 0;
      for (var i = 0; i < coeffs.length; i++) {
        var c = coeffs[i];
        var ang = 2 * Math.PI * c.k * n / M;
        sr += c.re * Math.cos(ang) - c.im * Math.sin(ang);
        si += c.re * Math.sin(ang) + c.im * Math.cos(ang);
      }
      out[2 * n] = sr; out[2 * n + 1] = si;
    }
    return out;
  }
  /* 按振幅降序取前 N 项(保持 k 顺序供圆环链) */
  function truncate(coeffs, N) {
    var sorted = coeffs.slice().sort(function (a, b) {
      return Math.hypot(b.re, b.im) - Math.hypot(a.re, a.im);
    });
    var keep = sorted.slice(0, N);
    return keep.slice().sort(function (a, b) { return a.k - b.k; });
  }
  function rmsErr(a, b) {
    var s = 0;
    for (var i = 0; i < a.length; i++) { var d = a[i] - b[i]; s += d * d; }
    return Math.sqrt(s / (a.length / 2));
  }
  function energy(path) {
    var s = 0;
    for (var i = 0; i < path.length / 2; i++) s += path[2 * i] * path[2 * i] + path[2 * i + 1] * path[2 * i + 1];
    return s / (path.length / 2);
  }
  function coeffsEnergy(coeffs) {
    var s = 0;
    coeffs.forEach(function (c) { s += c.re * c.re + c.im * c.im; });
    return s;
  }
  /* 圆环链几何:按 |c| 降序串联(第 1 环圆心在原点),返回每环 {r, phase, x, y} */
  function epicycleChain(coeffs, t) {
    var sorted = coeffs.slice().sort(function (a, b) {
      return Math.hypot(b.re, b.im) - Math.hypot(a.re, a.im);
    });
    var x = 0, y = 0, rings = [];
    for (var i = 0; i < sorted.length; i++) {
      var c = sorted[i];
      var amp = Math.hypot(c.re, c.im);
      var phase = Math.atan2(c.im, c.re);
      var ang = phase + c.k * t;
      x += amp * Math.cos(ang);
      y += amp * Math.sin(ang);
      rings.push({ r: amp, ang: ang, x: x, y: y, k: c.k });
    }
    return rings;
  }

  FE.MATH = {
    M: M, dft: dft, idft: idft, truncate: truncate, rmsErr: rmsErr,
    energy: energy, coeffsEnergy: coeffsEnergy, epicycleChain: epicycleChain
  };

  /* —— 载入期自检 —— */
  (function selfCheck() {
    function fail(msg) {
      if (window.FE_SHOW_BOOT_ERROR) window.FE_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
    function near(a, b, tol, msg) {
      if (!(Math.abs(a - b) <= tol)) fail(msg + ": got " + a + " expect " + b);
    }
    /* 测试路径:圆 + 3 叶扰动(闭合、解析已知) */
    var path = new Float64Array(M * 2);
    for (var n = 0; n < M; n++) {
      var t = n / M * Math.PI * 2;
      path[2 * n] = Math.cos(t) + 0.3 * Math.cos(3 * t);
      path[2 * n + 1] = Math.sin(t) + 0.3 * Math.sin(3 * t);
    }
    // 1) 闭合:首尾相接
    near(Math.hypot(path[0] - path[2 * (M - 1)], path[1] - path[2 * (M - 1) + 1]), 0.0312, 0.01, "采样闭合步长");
    // 2) DFT-IDFT 往返
    var coeffs = dft(path, M);
    var back = idft(coeffs, M);
    near(rmsErr(path, back), 0, 1e-6, "DFT-IDFT 往返");
    // 3) Parseval
    near(coeffsEnergy(coeffs), energy(path), 1e-6, "Parseval 能量恒等");
    // 4) 旋转等变:|c_k| 不变
    var rot = new Float64Array(M * 2), phi = 0.7;
    for (var n2 = 0; n2 < M; n2++) {
      rot[2 * n2] = path[2 * n2] * Math.cos(phi) - path[2 * n2 + 1] * Math.sin(phi);
      rot[2 * n2 + 1] = path[2 * n2] * Math.sin(phi) + path[2 * n2 + 1] * Math.cos(phi);
    }
    var c2 = dft(rot, M);
    for (var j = 0; j < coeffs.length; j += 17) {
      near(Math.hypot(c2[j].re, c2[j].im), Math.hypot(coeffs[j].re, coeffs[j].im), 1e-6, "旋转等变 @k=" + coeffs[j].k);
    }
    // 5) 截断误差单调不增(圆+3叶:N≥5 已精确)
    var full = idft(truncate(coeffs, M), M);
    var e8 = rmsErr(path, idft(truncate(coeffs, 8), M));
    var e16 = rmsErr(path, idft(truncate(coeffs, 16), M));
    var eFull = rmsErr(path, full);
    if (!(e16 <= e8 + 1e-9 && eFull <= e16 + 1e-9)) fail("截断误差非单调: " + e8 + " " + e16 + " " + eFull);
    // 6) 截断误差² ≤ 尾部能量界
    var tail = coeffsEnergy(coeffs) - coeffsEnergy(truncate(coeffs, 16));
    if (!(e16 * e16 <= tail + 1e-6)) fail("截断误差超出尾部能量界");
    // 圆+3叶的谱恰为 k=±1, ±3(N=5 即精确)
    near(eFull, 0, 1e-9, "解析谱全项重构");
  })();
})(window.FE = window.FE || {});
