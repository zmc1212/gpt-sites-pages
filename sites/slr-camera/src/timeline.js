/* 时间线(51s 循环):机身 → 镜头 → 光圈 → 镜箱五棱镜 → 幕帘快门 → 胶卷 →
   取景光路 → 曝光全程(翻镜-缩光圈-幕帘扫缝-落像-回弹)。
   曝光段真实时标:9s 相位 = 140ms 实拍(幕速 2.2 m/s、翻镜 30ms、1/1000 缝 2.2mm)。 */
(function (MECH) {
  var D = MECH.DIM, KS = MECH.KS;
  var MS_SCALE = 140 / 9;              // 曝光段:相位秒 → 实拍 ms

  MECH.PHASES = [
    { id: "body", name: "BODY · 机身骨架与片门", dur: 5, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.5, phi: 1.22, r: 18, target: [2.5, 4.2, 0] }, drift: 0.02 },
    { id: "lens", name: "LENS · 55mm f/1.4 镜头组", dur: 6, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: -0.8, phi: 1.24, r: 13, target: [9, 3.6, 0] }, drift: 0.015 },
    { id: "iris", name: "IRIS · 九叶光圈", dur: 6, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: -1.2, phi: 1.15, r: 10, target: [9.3, 3.6, 0] }, drift: 0.015 },
    { id: "viewbox", name: "VIEWBOX · 反光镜·对焦屏·五棱镜", dur: 7, dot: "pink", mode: "ASSEMBLING",
      cam: { theta: 0.95, phi: 1.2, r: 15, target: [3.2, 5.2, 0] }, drift: 0.012 },
    { id: "shutter", name: "SHUTTER · 幕帘快门与速度盘", dur: 6, dot: "blue", mode: "ASSEMBLING",
      cam: { theta: 1.45, phi: 1.22, r: 13, target: [0, 3.6, 0] }, drift: 0.012 },
    { id: "film", name: "FILM · 35mm 胶卷与卷片", dur: 5, dot: "green", mode: "ASSEMBLING",
      cam: { theta: -1.4, phi: 1.22, r: 13, target: [0, 3.6, 0] }, drift: 0.012 },
    { id: "viewing", name: "VIEWING · 取景光路(正立无镜像)", dur: 7, dot: "yellow", mode: "RUNNING",
      cam: { theta: 0.95, phi: 1.22, r: 28, target: [9, 4.5, 0] }, drift: 0.008 },
    { id: "exposure", name: "EXPOSURE · 曝光全程(翻镜→扫缝→落像)", dur: 9, dot: "red", mode: "CYCLE",
      cam: { theta: 1.25, phi: 1.2, r: 19, target: [4, 4.2, 0] }, drift: 0.008 }
  ];
  MECH.PHASE_IDS = ["body", "lens", "iris", "viewbox", "shutter", "film", "viewing", "exposure"];

  MECH.newState = KS.newState;

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  MECH.tick = function (st, ph, pt, dt) {
    /* 默认态:取景 45°、全开 f/1.4、前帘全遮(c1=−18)/后帘收拢(c2=−18)、∞ 对焦
       幕帘模型:双帘同向 (+z) 行进,c1 尾缘 p1 开启(覆 [p1,+18]),
       c2 前缘 p2 追随关闭(覆 [−18,p2]);缝 = p1−p2 = v·gap;曝光后帧面由后帘覆盖 */
    st.mirror = 0;
    st.irisN = 1.4;
    st.fIdx = 0;
    st.c1 = -18;
    st.c2 = -18;
    st.focusU = Infinity;
    st.screenA = 0;
    st.filmExposed = 0;
    st.exT = 0;
    st.speedIdx = 0;

    if (ph.id === "lens" && pt > 2 && pt < 4) {
      st.focusU = D.FOCUS_DEMO_U;              // 近摄 0.45m:镜筒伸长 7.66mm
    }
    if (ph.id === "iris") {
      var seg = pt < 1.5 ? 0 : pt < 3 ? (pt - 1.5) / 1.5
              : pt < 3.5 ? 1 : pt < 5 ? 1 - (pt - 3.5) / 1.5 : 0;
      var idx = Math.round(seg * (D.FSTOPS.length - 1));
      st.irisN = D.FSTOPS[idx];
      st.fIdx = idx;
    }
    if (ph.id === "shutter") {
      st.speedIdx = pt < 1.5 ? 0 : pt < 5.5 ? Math.min(3, Math.floor((pt - 1.5) / 4 * 4)) : 0;
      if (pt >= 1.5 && pt < 5.5) {
        var td = (pt - 1.5) % 1;               // 每秒一次扫缝演示
        var S = D.SPEEDS[st.speedIdx];
        var gap = Math.min(0.5, Math.max(0.03, KS.slitMm(S) / 36.667 * 0.5));
        st.c1 = -18 + clamp01(td / 0.5) * 36;
        st.c2 = -18 + clamp01((td - gap) / 0.5) * 36;
        if (td >= 0.5 + gap + 0.5) { st.c1 = -18; st.c2 = -18; }  // 循环复位
      }
    }
    if (ph.id === "viewing") {
      st.focusU = D.FOCUS_DEMO_U;
      st.screenA = clamp01((pt - 2.2) / 1.4);
    }
    if (ph.id === "exposure") {
      var T = pt * MS_SCALE;                   // 实拍 ms
      st.exT = T;
      /* 反光镜:0-30ms 翻起,90-120ms 回落 */
      st.mirror = T < 30 ? T / 30 : T < 90 ? 1 : T < 120 ? 1 - (T - 90) / 30 : 0;
      /* 光圈:f/1.4 → f/8(10-40ms),回收(100-130ms) */
      var k = T < 10 ? 0 : T < 40 ? (T - 10) / 30 : T < 100 ? 1 : T < 130 ? 1 - (T - 100) / 30 : 0;
      st.irisN = 1.4 + (8 - 1.4) * k;
      st.fIdx = D.FSTOPS.indexOf(nearestStop(st.irisN));
      /* 幕帘:1/1000 → 缝 2.2mm;前帘 50ms 释放,走幅 16.36ms,后帘追随(同向) */
      var gapMs = KS.slitMm(1000) / D.V_CURT * 1000;
      st.c1 = -18 + clamp01((T - 50) / KS.travelMs()) * 36;
      st.c2 = -18 + clamp01((T - 50 - gapMs) / KS.travelMs()) * 36;
      st.filmExposed = clamp01((T - 55) / 35);
      st.screenA = T < 25 ? 1 : 0;             // 翻镜即取景全黑
    }
    KS.step(st, dt);
  };

  function nearestStop(N) {
    var best = D.FSTOPS[0], bd = 1e9;
    D.FSTOPS.forEach(function (s) {
      var d = Math.abs(Math.log(s / N));
      if (d < bd) { bd = d; best = s; }
    });
    return best;
  }

  MECH.status = function (st, ph, pt) {
    var S = D.SPEEDS[st.speedIdx || 0];
    var pill = ph.name;
    if (ph.id === "exposure") pill = "EXPOSURE · t = " + Math.round(st.exT) + " ms";
    if (ph.id === "shutter" && pt >= 1.5 && pt < 5.5) pill = "SHUTTER DEMO · 1/" + S;
    if (ph.id === "viewing") pill = "VIEWING · 屏像正立 · 无镜像";
    var c;
    if (ph.id === "exposure") {
      c = "EV " + KS.ev(8, 1 / 1000).toFixed(1) + " @ f/8 · 1/1000";
    } else {
      var u = st.focusU === undefined ? Infinity : st.focusU;
      c = u === Infinity ? "对焦 ∞ · v=55.0 · e=0"
        : "对焦 0.45m · v=" + KS.conjV(u).toFixed(1) + " · e=" + KS.extension(u).toFixed(2) + "mm";
    }
    return {
      mode: ph.mode,
      hot: ph.id === "exposure",
      pill: pill,
      a: "f/" + (Math.round(st.irisN * 10) / 10) + " · D " + KS.dia(st.irisN).toFixed(1) + "mm",
      b: "1/" + S + " · 缝 " + KS.slitMm(S).toFixed(1) + "mm",
      c: c
    };
  };

  MECH.camAdj = function (st, ph, pt) {
    return null;
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? e.group : null; }
    if (ph.id === "body") {
      return [
        { id: "p-shell", obj: E("bodyShell"), text: "机身壳 · 法兰距 42mm" },
        { id: "p-gate", obj: E("filmGate"), text: "片门 36×24 · 3:2", tone: "white" }
      ];
    }
    if (ph.id === "lens") {
      return [
        { id: "p-front", obj: E("lensFront"), text: "前组 55mm f/1.4 · D=39.3mm" },
        { id: "p-heli", obj: E("helicoid"), text: "调焦螺旋 · 伸长 e=v−55", tone: "white" }
      ];
    }
    if (ph.id === "iris") {
      return [
        { id: "p-blades", obj: E("irisBlades"), text: "9 叶 · a=(F/2N)·cos(π/9)" },
        { id: "p-fring", obj: E("fRing"), text: "f 序列 ×√2 · 1.4→16", tone: "white" }
      ];
    }
    if (ph.id === "viewbox") {
      return [
        { id: "p-mirror", obj: E("mirror"), text: "反光镜 45° · 翻起 30ms" },
        { id: "p-penta", obj: E("pentaprism"), text: "五棱镜 · 恒偏 90°", tone: "white" },
        { id: "p-screen", obj: E("focusScreen"), text: "对焦屏 · 路径 17+38=55mm" }
      ];
    }
    if (ph.id === "shutter") {
      return [
        { id: "p-c1", obj: E("curtain1"), text: "前帘 · t=w/v · v=2.2m/s" },
        { id: "p-c2", obj: E("curtain2"), text: "后帘 · 缝随速差", tone: "white" },
        { id: "p-dial", obj: E("speedDial"), text: "X-sync 1/60 · 缝 36.7mm≥36" }
      ];
    }
    if (ph.id === "film") {
      return [
        { id: "p-cas", obj: E("cassette"), text: "35mm 暗盒" },
        { id: "p-strip", obj: E("filmStrip"), text: "胶片 · 片门 36×24", tone: "white" }
      ];
    }
    if (ph.id === "viewing") {
      return [
        { id: "p-subj", obj: E("subjectCard"), text: "被摄目标(远景压缩)" },
        { id: "p-rays", obj: E("viewRays"), text: "取景光路 · 镜→镜→屏→棱镜→目镜", tone: "white" }
      ];
    }
    if (ph.id === "exposure") {
      return [
        { id: "p-film", obj: E("filmImage"), text: "胶片倒立实像 · 3:2" },
        { id: "p-mir2", obj: E("mirror"), text: "翻镜让路 · 取景全黑", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
