/* 路径模型:预设参数曲线 + 手绘采样 → 统一 256 点闭合路径(DFT 输入) */
(function (FE) {
  var M = FE.MATH.M;

  function resample(pts) {
    /* pts: [[x,y],…](任意密度)→ 弧长均匀重采样 M 点闭合路径 */
    var segs = [], total = 0;
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i], b = pts[(i + 1) % pts.length];
      var d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      segs.push(d); total += d;
    }
    var out = new Float64Array(M * 2);
    var step = total / M, want = 0, acc = 0, j = 0;
    for (var n = 0; n < M; n++) {
      want = n * step;
      while (acc + segs[j] < want) { acc += segs[j]; j = (j + 1) % pts.length; }
      var a2 = pts[j], b2 = pts[(j + 1) % pts.length];
      var f = segs[j] > 0 ? (want - acc) / segs[j] : 0;
      out[2 * n] = a2[0] + (b2[0] - a2[0]) * f;
      out[2 * n + 1] = a2[1] + (b2[1] - a2[1]) * f;
    }
    return out;
  }

  /* 归一化:路径中心移到原点,尺度缩到半径 ~1 */
  function normalize(path) {
    var mx = 0, my = 0, M = FE.MATH.M;
    for (var i = 0; i < M; i++) { mx += path[2 * i]; my += path[2 * i + 1]; }
    mx /= M; my /= M;
    var rmax = 0;
    for (var j = 0; j < M; j++) {
      path[2 * j] -= mx; path[2 * j + 1] -= my;
      rmax = Math.max(rmax, Math.hypot(path[2 * j], path[2 * j + 1]));
    }
    if (rmax > 0) for (var k = 0; k < M * 2; k++) path[k] /= rmax;
    return path;
  }

  /* —— 预设(参数曲线,512 采样点后重采样)—— */
  function heart() {
    var pts = [];
    for (var i = 0; i < 512; i++) {
      var t = i / 512 * Math.PI * 2;
      pts.push([16 * Math.pow(Math.sin(t), 3),
                -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]);
    }
    return normalize(resample(pts));
  }
  function star(n, rIn) {
    var pts = [];
    for (var i = 0; i <= 512; i++) {
      var t = i / 512 * Math.PI * 2;
      var frac = (t / (Math.PI * 2) * n) % 1;
      var tri = Math.abs(frac * 2 - 1);                 // 0..1 三角波
      var r = rIn + (1 - rIn) * tri;
      pts.push([r * Math.sin(t), -r * Math.cos(t)]);
    }
    pts.pop();
    return normalize(resample(pts));
  }
  function gear(harm, amp) {
    var pts = [];
    for (var i = 0; i < 512; i++) {
      var t = i / 512 * Math.PI * 2;
      var r = 1 + amp * Math.cos(harm * t);
      pts.push([r * Math.cos(t), r * Math.sin(t)]);
    }
    return normalize(resample(pts));
  }

  FE.SIM = { resample: resample, normalize: normalize, heart: heart, star: star, gear: gear };
})(window.FE = window.FE || {});
