/* 阿基米德螺旋提水器 — 几何常量与提水运动学
   文献依据:Diodorus Siculus I.34 / Athenaeus《Deipnosophistae》V 记载尼罗河
   提水螺旋(Archimedes,约前 3 世纪);现代复原试验(Bruder 复原、Rorres 几何分析)。
   几何:外筒半径 R,内芯管半径 r,螺距 P,筒长 L,倾角 θ。
   可验算核心:
   1) 水从低端爬到高端的圈数 N = L / P(转一圈前进一个螺距)——严格;
   2) 扬程 H = L·sin θ ——严格(几何);
   3) 单水室容积 V ≈ π(R²−r²)·P·f(f 为填充率,取 0.5,标注示意);
   4) 提水流量 Q = V × n(转速 rev/s)——体积守恒;
   5) 水团轴向位置 = ((φ0 + θ螺) mod N)·P ——确定性追踪,到顶端溢出回底端。 */
(function (MECH) {
  var D = {
    R: 0.62,             // 外筒半径 m
    r: 0.26,             // 内芯管半径 m
    P: 0.55,             // 螺距 m
    L: 3.0,              // 筒长 m
    tilt: 30 * Math.PI / 180,   // 倾角
    turns: 0,            // = L/P(载入计算)
    fill: 0.5,           // 水室填充率(示意标注)
    blade: 0.055,        // 螺旋叶片厚 m
    nBlobs: 10           // 追踪水团数
  };
  D.turns = D.L / D.P;                       // 5.454… 圈
  D.H = D.L * Math.sin(D.tilt);              // 1.5 m
  D.xSpan = D.L * Math.cos(D.tilt);          // 2.598 m
  D.Vpocket = Math.PI * (D.R * D.R - D.r * D.r) * D.P * D.fill;
  /* 螺旋线:轴向 s → 角 φ = s/P × 2π(单螺旋) */
  D.helixPhi = function (s) { return s / D.P * Math.PI * 2; };

  var newState = function () {
    return { days: 0, t: 0, theta: 0, lastPhase: "", dumped: 0, lifted: 0 };
  };
  /* step:dtSec 秒内螺旋转 nTurn rev/s × dt;days 作为转数累计(1 day = 1 rev) */
  var step = function (st, dtRev) {
    st.theta += dtRev * Math.PI * 2;
    st.days += dtRev;
    st.t = st.days;
  };

  /* 水团追踪:i 号水团初始螺旋相位 φ0 = i/nBlobs × N × 2π;
     当前轴向 s = ((φ0 + θ)/(2π) mod N) × P;到顶(s ≥ L)溢出回底。 */
  function blobState(i, theta) {
    var phi0 = i / D.nBlobs * D.turns * Math.PI * 2;
    var revs = (phi0 + theta) / (Math.PI * 2);
    var revsMod = revs - Math.floor(revs / D.turns) * D.turns;   // mod N
    var s = revsMod * D.P;                                       // 轴向位置
    var dumped = Math.floor(revs / D.turns);                     // 溢出次数
    return { s: Math.min(s, D.L), frac: revs / D.turns - Math.floor(revs / D.turns), dumped: dumped };
  }

  /* 提水流量(m³/s):Q = V × n;场景 n 由时间线给 */
  D.flow = function (n) { return D.Vpocket * n; };

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step, blobState: blobState };

  /* —— 载入期自检 —— */
  (function selfCheck() {
    function fail(msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
    function near(a, b, tol, msg) {
      if (!(Math.abs(a - b) <= tol)) fail(msg + ": got " + a + " expect " + b);
    }
    // 1) 圈数 N = L/P(严格)
    near(D.turns, D.L / D.P, 1e-12, "圈数 ≠ L/P");
    near(D.turns, 5.454545454545455, 1e-9, "圈数数值异常");
    // 2) 扬程 H = L·sinθ
    near(D.H, 1.5, 1e-9, "扬程 ≠ L·sin30°");
    // 3) 水室容积(公式一致性)
    near(D.Vpocket, Math.PI * (D.R * D.R - D.r * D.r) * D.P * D.fill, 1e-12, "水室容积公式不符");
    // 4) 流量守恒:Q = V·n
    near(D.flow(2), D.Vpocket * 2, 1e-12, "流量 ≠ V·n");
    // 5) 水团追踪:θ=0 时 i 号团 s = i/nBlobs × L(均匀分布)
    for (var i = 0; i < D.nBlobs; i++) {
      var b0 = blobState(i, 0);
      near(b0.s, i / D.nBlobs * D.L, 1e-9, "水团初位 #" + i);
    }
    // 6) 转一整圈:每团前进一个螺距
    var b1 = blobState(0, Math.PI * 2);
    near(b1.s - blobState(0, 0).s, D.P, 1e-9, "转一圈前进 ≠ 螺距");
    // 7) 转满 N 圈:溢出恰好一次
    var b2 = blobState(0, D.turns * Math.PI * 2);
    near(b2.s, blobState(0, 0).s, 1e-9, "N 圈后未回到起点");
    near(b2.dumped, 1, 1e-9, "N 圈溢出次数 ≠ 1");
    // 8) 倾角几何:水平跨距
    near(D.xSpan, D.L * Math.cos(D.tilt), 1e-12, "跨距 ≠ L·cosθ");
  })();
})(window.MECH = window.MECH || {});
