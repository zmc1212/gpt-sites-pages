/* 安提基特拉机械 — 齿轮表与天文轮系运动学求解器
   文献依据:Freeth et al., Nature 444 (2006) / Nature 454 (2008);
   Freeth & Jones, ISAW Papers 4 (2012);齿数表按 Efstathiou et al. 实测
   (转引 Tsigkros, FU Berlin 2015, Table 1-3)与 Freeth 2006 Supplement。
   本站复原口径:
   - 主驱动 b1 = 223 齿(十字辐条,径 13cm),b2 = 64 齿同轴厚轮,同时驱动
     月轮系(c 链)与历法轮系(l 链);
   - 月轮系 b2→c1→c2→d1(=d2 同轴)→e2:64/38 × 48/24 × 127/32 = 254/19 严格;
     127 = 254 的质因数,故 d2 取 127 齿,c1 取 38(=2×19)避开 19 齿下限;
   - 月行差:单一销槽装置 k1(销)/k2(槽),k2 轴偏心装于 k1 上,平均比 1:1,
     几何调制幅度 ε = E0/RP = 2.25/19.6 ≈ 0.1146(扫描值,Gourtsoyannis);
     Freeth 2006 采用 d1/d2 + k1/k2 双销槽二阶理论,本站按 AMRP 单销槽口径实现,
     均速严格 254/19,异常幅度与扫描一致——口径差异在此明示;
   - 梅顿轮系 64/38 × 53/96 × 15/53 = 5/19(19 年指针恰转 5 圈,五圈螺旋);
   - 竞技会轮系 n2(57)→o1(60):5/19 × 57/60 = 1/4(四年一转,严格);
   - 卡利普斯轮系 n3(15)→p1(60)→p2(12)→q1(60):5/19 × 1/20 = 1/76
     (76 年一转,严格;n3/p1/p2/q1 均为遗失件复原推测,另说见 README);
   - 沙罗轮系 64/38 × 53/96 × 27/223 × 188/53 × 30/54 = 940/4237
     = (4×235)/(223×19),四圈螺旋一沙罗(223 朔望月 = 6585.32 d);
   - Exeligmos 轮系 20/60 × 15/60,三沙罗 = 54 年;
   - e3/e4 轴(223/188)即月球拱点进动轴:8.88 年一转。 */
(function (MECH) {
  var U = 0.0275;                     // 齿轮模数:半径 = 齿数 × U(cm),周节 ≈ 0.173 cm
  var Y = 365.25;                     // 一年(Callippic 儒略年)
  var K = 0.5;                        // 场景缩放:场景单位 = cm × K
  var E0C = 0.1374;                   // k2 轴心偏心距 cm(销槽 2.25:19.6 同比缩放)

  /* —— 齿数表(实测/推测标记)—— */
  var TEETH = {
    b1: 223, b2: 64, b3: 32, c1: 38, c2: 48, d1: 24, d2: 127,
    e1: 32, e2: 32, e3: 223, e4: 188, e5: 50, e6: 50,
    f1: 53, f2: 30, g1: 54, g2: 20, h1: 60, h2: 15, i1: 60,
    k1: 50, k2: 50, l1: 38, l2: 53, m1: 96, m2: 15, m3: 27,
    n1: 53, n2: 57, n3: 15, p1: 60, p2: 12, o1: 60, q1: 60
  };
  var PROPOSED = { m3: 1, n1: 1, n2: 1, n3: 1, p1: 1, p2: 1, q1: 1 };  // 遗失件(复原推测)

  function r(g) { return TEETH[g] * U; }

  /* —— 传动边(外啮合:每次乘 驱动/被驱 并反号;同轴组同角)—— */
  var EDGES = [
    ["b2", "c1", TEETH.b2 / TEETH.c1],
    ["c2", "d1", TEETH.c2 / TEETH.d1],
    ["d2", "e2", TEETH.d2 / TEETH.e2],
    ["e5", "k1", 1],
    ["k2", "e6", 1],                  // k1/k2 为销槽(几何解,均比 1)
    ["e1", "b3", 1],
    ["b2", "l1", TEETH.b2 / TEETH.l1],
    ["l2", "m1", TEETH.l2 / TEETH.m1],
    ["m2", "n1", TEETH.m2 / TEETH.n1],
    ["n2", "o1", TEETH.n2 / TEETH.o1],
    ["n3", "p1", TEETH.n3 / TEETH.p1],
    ["p2", "q1", TEETH.p2 / TEETH.q1],
    ["m3", "e3", TEETH.m3 / TEETH.e3],
    ["e4", "f1", TEETH.e4 / TEETH.f1],
    ["f2", "g1", TEETH.f2 / TEETH.g1],
    ["g2", "h1", TEETH.g2 / TEETH.h1],
    ["h2", "i1", TEETH.h2 / TEETH.i1]
  ];
  var COAX = [["b1", "b2"], ["c1", "c2"], ["d1", "d2"], ["e2", "e5"], ["e6", "e1"],
              ["l1", "l2"], ["m1", "m2", "m3"], ["n1", "n2", "n3"], ["p1", "p2"],
              ["f1", "f2"], ["g1", "g2"], ["h1", "h2"]];

  /* —— 轮系布局:轴向位置由啮合距离 u(Za+Zb) 与布置角严格推出(cm)—— */
  var AX = {};
  // 显式链表(新轴名 → 基轴名 → 布置角 → [驱动齿, 被驱齿])
  var CHAIN = [
    ["b", null, null, null],                                  // C_b = (0, 0.6)
    ["c", "b", 205, ["b2", "c1"]],
    ["d", "c", -15, ["c2", "d1"]],
    ["Ea", "d", 25, ["d2", "e2"]],
    ["k", "Ea", 100, ["e5", "k1"]],
    ["l", "b", 150, ["b2", "l1"]],
    ["m", "l", 65, ["l2", "m1"]],
    ["n", "m", -45, ["m2", "n1"]],
    ["Ec", "m", 215, ["m3", "e3"]],
    ["f", "Ec", -50, ["e4", "f1"]],
    ["g", "f", -75, ["f2", "g1"]],
    ["h", "g", -15, ["g2", "h1"]],
    ["i", "h", 35, ["h2", "i1"]],
    ["o", "n", -10, ["n2", "o1"]],
    ["p", "n", 160, ["n3", "p1"]],
    ["q", "p", 115, ["p2", "q1"]]
  ];
  AX.b = [0, 0.6];
  for (var ci = 1; ci < CHAIN.length; ci++) {
    var st = CHAIN[ci];
    var base = AX[st[1]];
    var dist = r(st[3][0]) + r(st[3][1]);
    var ang = st[2] * Math.PI / 180;
    AX[st[0]] = [base[0] + dist * Math.cos(ang), base[1] + dist * Math.sin(ang)];
  }
  /* C_Eb(k2→e6 与 e1→b3 双约束圆交点;取靠 Ea 一侧的解)。
     注意 k2 轴心固定于 C_k2 = C_k + E0∠0(偏心距不随 k1 旋转),啮合距按 C_k2 算。 */
  var Ck = AX.k, Cb = AX.b;
  var Ck2 = [Ck[0] + E0C, Ck[1]];
  AX.k2 = Ck2;
  var dkb = Math.hypot(Ck2[0] - Cb[0], Ck2[1] - Cb[1]);
  var r1 = r("k2") + r("e6"), r2 = r("e1") + r("b3");
  var aa = (dkb * dkb + r2 * r2 - r1 * r1) / (2 * dkb);
  var hh = Math.sqrt(Math.max(0, r2 * r2 - aa * aa));
  var dirX = (Ck2[0] - Cb[0]) / dkb, dirY = (Ck2[1] - Cb[1]) / dkb;
  var px = Cb[0] + aa * dirX, py = Cb[1] + aa * dirY;
  var candA = [px - hh * dirY, py + hh * dirX], candB = [px + hh * dirY, py - hh * dirX];
  var dA = Math.hypot(candA[0] - AX.Ea[0], candA[1] - AX.Ea[1]);
  var dB = Math.hypot(candB[0] - AX.Ea[0], candB[1] - AX.Ea[1]);
  AX.Eb = dA < dB ? candA : candB;

  /* 尺寸常量(cm;场景层 ×K) */
  var D = {
    U: U, Y: Y, K: K,
    TEETH: TEETH, PROPOSED: PROPOSED, EDGES: EDGES, COAX: COAX, AX: AX,
    RP: 1.2,            // k1 销半径(销槽装置,几何)
    E0: E0C,         // k2 轴偏心 = RP/8.73 → 调制幅度 ≈ 0.1146(扫描比 2.25:19.6)
    PHI0: 0.9,          // 销初相(校准,任意)
    gearT: 0.14,        // 齿轮厚 cm
    caseW: 34, caseH: 18, caseD: 11,
    dialCY: 0.6,        // 表盘中心相对机构几何中心 y 偏移
    zodiacR: [6.2, 7.4], calR: [7.4, 8.3],
    metSpiral: [1.5, 4.5, 5], sarSpiral: [1.3, 3.4, 4],
    subR: { o: 1.9, q: 1.5, i: 1.5 }
  };
  D.eps = D.E0 / D.RP;                  // 0.1145 销槽调制幅度

  /* —— 轮系传播:t(天) → 各轴角(rad,绕 +z)—— */
  /* k1/k2 销槽几何:两轴心均固定(相距 E0,方向取 ∠0);销在 k1 上半径 RP 角
     θk1+PHI0,槽沿销方向 → θk2 = atan2(销 − C_k2)。销圆(RP)包住 C_k2
     (E0 < RP),绕行数严格 1:1;调制幅度 ≈ E0/RP ≈ 0.1146。 */
  function k2Angle(thk1) {
    var dx = Math.cos(thk1 + D.PHI0) * D.RP - E0C;
    var dy = Math.sin(thk1 + D.PHI0) * D.RP;
    return Math.atan2(dy, dx);                 // 槽指向销:相对 k2 固定轴心
  }

  function angles(t) {
    var th = {};
    var w = {};          // 瞬时角速度(相对 b1 均值,倍率)
    th.b1 = t / Y * Math.PI * 2;
    w.b1 = 1;
    th.b2 = th.b1;
    // 月轮系(含销槽几何)
    th.c1 = -th.b2 * EDGES[0][2]; th.c2 = th.c1;
    th.d1 = -th.c2 * EDGES[1][2]; th.d2 = th.d1;
    th.e2 = -th.d2 * EDGES[2][2]; th.e5 = th.e2;
    th.k1 = -th.e5 * 1;
    th.k2 = k2Angle(th.k1);
    th.e6 = -th.k2 * 1; th.e1 = th.e6;
    th.b3 = -th.e1 * 1;                       // 月指针(与日同向:6 次外啮合)
    // 历法轮系(梅顿分支)
    th.l1 = -th.b2 * EDGES[6][2]; th.l2 = th.l1;
    th.m1 = -th.l2 * EDGES[7][2]; th.m2 = th.m1; th.m3 = th.m1;
    th.n1 = -th.m2 * EDGES[8][2]; th.n2 = th.n1; th.n3 = th.n1;
    th.o1 = -th.n2 * EDGES[9][2];             // 竞技会指针
    th.p1 = -th.n3 * EDGES[10][2]; th.p2 = th.p1;
    th.q1 = -th.p2 * EDGES[11][2];            // 卡利普斯指针
    // 沙罗分支
    th.e3 = -th.m3 * EDGES[12][2]; th.e4 = th.e3;
    th.f1 = -th.e4 * EDGES[13][2]; th.f2 = th.f1;
    th.g1 = -th.f2 * EDGES[14][2]; th.g2 = th.g1;
    th.h1 = -th.g2 * EDGES[15][2]; th.h2 = th.h1;
    th.i1 = -th.h2 * EDGES[16][2];            // Exeligmos 指针
    return th;
  }

  var newState = function () {
    return { t: 0, days: 0, turns: {}, run: 0, lastPhase: "" };
  };
  var step = function (st, dtDays) {
    st.days += dtDays;
    st.t = st.days;
  };

  MECH.FOG = [30, 90];          // 远雾:场景宽 34cm×K=17u,相机 r~14u
  MECH.SHADOW_BOX = 14;
  MECH.DIM = D;
  MECH.KS = {
    newState: newState, step: step, angles: angles, k2Angle: k2Angle,
    r: r
  };

  /* —— 载入期自检:轮系比与天文周期逐条断言 —— */
  (function selfCheck() {
    function fail(msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
    function near(a, b, tol, msg) {
      if (!(Math.abs(a - b) <= tol)) fail(msg + ": got " + a + " expect " + b);   // NaN 也判失败
    }
    var P2 = Math.PI * 2;
    // 1) 月轮系均比 = 254/19(严格)
    var moon = EDGES[0][2] * EDGES[1][2] * EDGES[2][2];
    near(moon, 254 / 19, 1e-9, "月轮系比 ≠ 254/19");
    // 2) 恒星月周期
    near(Y * 19 / 254, 27.321661, 0.005, "恒星月周期偏差过大");
    // 3) 朔望月(月相球 = 月−日):254/19 − 1 = 235/19
    near(Y * 19 / 235, 29.530589, 0.005, "朔望月周期偏差过大");
    // 4) 梅顿指针 5 转 / 19 年(严格)
    var met = EDGES[6][2] * EDGES[7][2] * EDGES[8][2];
    near(met, 5 / 19, 1e-9, "梅顿比 ≠ 5/19");
    near(met * 19, 5, 1e-9, "梅顿指针 19 年 ≠ 5 转");
    // 5) 竞技会 4 年/转(严格)
    var games = met * EDGES[9][2];
    near(games, 1 / 4, 1e-9, "竞技会比 ≠ 1/4");
    // 6) 卡利普斯 76 年/转(严格)
    var call = met * EDGES[10][2] * EDGES[11][2];
    near(call, 1 / 76, 1e-9, "卡利普斯比 ≠ 1/76");
    // 7) 沙罗指针 4 转 / 沙罗
    var sar = EDGES[6][2] * EDGES[7][2] * EDGES[12][2] * EDGES[13][2] * EDGES[14][2];
    near(sar, 940 / 4237, 1e-9, "沙罗比 ≠ 940/4237");
    var sarYears = 4 / sar;                      // 一沙罗 = 18.0298 年(指针四圈)
    near(sarYears * Y, 6585.3211, 1.0, "沙罗周期(天)偏差过大");
    // 8) Exeligmos 指针周期 = g1 周期 × 12(20/60 × 15/60 减速)= 54.09 年
    var exeYears = (1 / sar) / (EDGES[15][2] * EDGES[16][2]);
    near(exeYears, 54.0, 0.5, "Exeligmos 周期(年)偏差过大");
    // 9) e3/e4 轴 = 拱点进动 8.88 年(周期年数 = 1/均比)
    var prec = EDGES[6][2] * EDGES[7][2] * EDGES[12][2];
    near(1 / prec, 8.8826, 0.02, "拱点进动轴周期偏差");
    // 10) 销槽绕行数 = 1(数值积分 720 样本展开)
    var N = 720, acc = 0, prev = k2Angle(0);
    for (var i = 1; i <= N; i++) {
      var cur = k2Angle(i / N * P2);
      var d = cur - prev;
      while (d > Math.PI) d -= P2;
      while (d < -Math.PI) d += P2;
      acc += d; prev = cur;
    }
    near(acc, P2, 1e-6, "销槽绕行数 ≠ 1");
    // 11) 布局啮合距(由构造成立,此处复核 c/d/Ea/k/Eb 与 Eb 约束)
    function dist(a, b) { return Math.hypot(AX[a][0] - AX[b][0], AX[a][1] - AX[b][1]); }
    near(dist("b", "c"), r("b2") + r("c1"), 1e-9, "b2-c1 啮合距");
    near(dist("c", "d"), r("c2") + r("d1"), 1e-9, "c2-d1 啮合距");
    near(dist("d", "Ea"), r("d2") + r("e2"), 1e-9, "d2-e2 啮合距");
    near(dist("Ea", "k"), r("e5") + r("k1"), 1e-9, "e5-k1 啮合距");
    near(dist("k2", "Eb"), r("k2") + r("e6"), 1e-9, "k2-e6 啮合距(按 k2 固定轴心)");
    near(dist("Eb", "b"), r("e1") + r("b3"), 1e-9, "e1-b3 啮合距");
    near(dist("b", "l"), r("b2") + r("l1"), 1e-9, "b2-l1 啮合距");
    near(dist("l", "m"), r("l2") + r("m1"), 1e-9, "l2-m1 啮合距");
    near(dist("m", "n"), r("m2") + r("n1"), 1e-9, "m2-n1 啮合距");
    near(dist("m", "Ec"), r("m3") + r("e3"), 1e-9, "m3-e3 啮合距");
    near(dist("Ec", "f"), r("e4") + r("f1"), 1e-9, "e4-f1 啮合距");
    near(dist("f", "g"), r("f2") + r("g1"), 1e-9, "f2-g1 啮合距");
    near(dist("g", "h"), r("g2") + r("h1"), 1e-9, "g2-h1 啮合距");
    near(dist("h", "i"), r("h2") + r("i1"), 1e-9, "h2-i1 啮合距");
    near(dist("n", "o"), r("n2") + r("o1"), 1e-9, "n2-o1 啮合距");
    near(dist("n", "p"), r("n3") + r("p1"), 1e-9, "n3-p1 啮合距");
    near(dist("p", "q"), r("p2") + r("q1"), 1e-9, "p2-q1 啮合距");
  })();
})(window.MECH = window.MECH || {});
