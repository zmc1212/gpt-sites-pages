/* 时间线(56s 循环):骨架 → 前盘 → 主轮月链 → 销槽月输出 → 背盘指针 →
   背轮系摇柄 → 运转·一年 → 运转·十九年(梅顿一周期) */
(function (MECH) {
  var D = MECH.DIM, KS = MECH.KS;
  var Y = D.Y;

  MECH.PHASES = [
    { id: "frame", name: "CASE · 骨架与铜板", dur: 5, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.70, phi: 1.25, r: 16.5, target: [0, 6.5, 0] }, drift: 0.02 },
    { id: "front", name: "DIALS · 黄道环·历法环·指针", dur: 6, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.12, phi: 1.30, r: 12.5, target: [0, 6.9, 1.2] }, drift: 0.012 },
    { id: "btrain", name: "MOON TRAIN · 主轮 b1/b2 · c·d 链", dur: 6, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: -1.00, phi: 1.02, r: 12.5, target: [-1.2, 6.8, 0.4] }, drift: 0.015 },
    { id: "etrain", name: "PIN & SLOT · 销槽装置 · 月输出", dur: 6, dot: "pink", mode: "ASSEMBLING",
      cam: { theta: 1.00, phi: 1.00, r: 12.0, target: [1.0, 6.9, 0.0] }, drift: 0.015 },
    { id: "backdials", name: "BACK DIALS · 梅顿/沙罗螺旋盘", dur: 7, dot: "blue", mode: "ASSEMBLING",
      cam: { theta: 3.1416, phi: 1.32, r: 15.0, target: [0, 6.9, -2.0] }, drift: 0.012 },
    { id: "backtrains", name: "BACK TRAINS · 历法/沙罗轮系 · 摇柄", dur: 7, dot: "green", mode: "ASSEMBLING",
      cam: { theta: -2.35, phi: 1.12, r: 11.0, target: [-1.0, 6.5, -1.0] }, drift: 0.012 },
    { id: "year", name: "ONE YEAR · 拧一整年", dur: 9, dot: "yellow", mode: "RUNNING",
      cam: { theta: 0.35, phi: 1.22, r: 14.0, target: [0, 6.8, 1.0] }, drift: 0.008 },
    { id: "cycle", name: "METONIC CYCLE · 十九年一周期", dur: 10, dot: "red", mode: "CYCLE",
      cam: { theta: 3.1416, phi: 1.30, r: 14.0, target: [0, 6.9, -1.8] }, drift: 0.008 }
  ];
  MECH.PHASE_IDS = ["frame", "front", "btrain", "etrain", "backdials", "backtrains", "year", "cycle"];

  MECH.newState = KS.newState;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      st.run = st.days;                     // 运行段从当前天数续走
      st.t0 = st.days;
    }
    if (ph.id === "year") {
      /* 第 1 年:365.25 天 / 9 s */
      st.days = st.t0 + pt / ph.dur * Y;
    } else if (ph.id === "cycle") {
      /* 第 2-19 年:续至恰 19.000 年(梅顿指针恰满 5 圈) */
      st.days = st.t0 + pt / ph.dur * (19 * Y - st.t0);
    }
    KS.step(st, 0);
  };

  MECH.status = function (st, ph, pt) {
    var th = KS.angles(st.days);
    var years = st.days / Y;
    var metTurns = (5 / 19) * years;
    var pill = ph.name;
    if (ph.id === "year" || ph.id === "cycle") {
      pill = ph.name + " · " + st.days.toFixed(1) + " d";
    }
    var ano = MECH.anomalyPct(st.days);
    return {
      mode: ph.mode,
      hot: ph.id === "cycle",
      pill: pill,
      a: (ano >= 0 ? "+" : "") + ano.toFixed(2) + "%",
      b: st.days.toFixed(1) + " d / " + years.toFixed(2) + " yr",
      c: metTurns.toFixed(3) + " / 5 转"
    };
  };

  /* 月行差(状态卡 a):瞬时销槽调制百分比(中心差分 + 解卷绕)
     w = dθk2/dθk1(无量纲),理论范围 ≈ 1 ± E0/RP → ±11.5% 附近 */
  MECH.anomalyPct = function (days) {
    var h = 0.02;
    var k1a = KS.angles(days - h).k1, k1b = KS.angles(days + h).k1;
    var t1 = KS.k2Angle(k1a), t2 = KS.k2Angle(k1b);
    var d = t2 - t1;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    var dk1 = k1b - k1a;
    if (dk1 <= 0) return 0;
    return (d / dk1 - 1) * 100;
  };

  MECH.camAdj = function (st, ph, pt) {
    return null;
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? e.group : null; }
    if (ph.id === "btrain") {
      return [
        { id: "p-b1", obj: E("b1"), text: "主轮 b1 · 223T · 一年一转" },
        { id: "p-b2", obj: E("b2"), text: "b2 · 64T · 厚轮兼驱两链", tone: "white" },
        { id: "p-d", obj: E("dArbor"), text: "d2 · 127T = 254 质因数" }
      ];
    }
    if (ph.id === "etrain") {
      return [
        { id: "p-k1", obj: E("k1"), text: "k1 销(50T)· 销槽装置" },
        { id: "p-k2", obj: E("k2"), text: "k2 槽 · 偏心轴 · ε≈0.1146", tone: "white" },
        { id: "p-b3", obj: E("b3"), text: "b3 → 中央轴管 → 月指针" }
      ];
    }
    if (ph.id === "backdials") {
      return [
        { id: "p-met", obj: E("metDial"), text: "梅顿盘 · 235 月 · 五圈螺旋" },
        { id: "p-sar", obj: E("sarDial"), text: "沙罗盘 · 223 月 · 四圈螺旋", tone: "white" }
      ];
    }
    if (ph.id === "backtrains") {
      return [
        { id: "p-e34", obj: E("e34"), text: "e3/e4 · 拱点进动 8.88 年" },
        { id: "p-g", obj: E("gArbor"), text: "沙罗指针 · 940/4237 转/年", tone: "white" },
        { id: "p-crank", obj: E("crank"), text: "摇柄 · 约 78 天/转" }
      ];
    }
    if (ph.id === "year" || ph.id === "cycle") {
      return [
        { id: "p-moon", obj: E("moonPtr"), text: "月指针 · 均速 254/19 转/年" },
        { id: "p-date", obj: E("datePtr"), text: "日期/平太阳指针 · b1", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
