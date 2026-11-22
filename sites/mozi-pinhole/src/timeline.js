/* 时间线(50s 循环):暗室 → 针孔 → 外景 → 光线直进 → 倒像屏与像距 →
   孔径对照 → 墨经条文 → 行人过孔(倒像反向) */
(function (MECH) {
  var D = MECH.DIM, KS = MECH.KS;

  MECH.PHASES = [
    { id: "chamber", name: "CHAMBER · 暗室骨架与隔墙", dur: 5, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.5, phi: 1.22, r: 19, target: [0, 5.5, 0] }, drift: 0.02 },
    { id: "aperture", name: "APERTURE · 针孔(端)与标尺", dur: 6, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.9, phi: 1.18, r: 10, target: [0.5, 4.5, 0] }, drift: 0.015 },
    { id: "scene", name: "SCENE · 外景(人·塔·日)", dur: 6, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: -0.75, phi: 1.24, r: 15, target: [-8, 5, 0] }, drift: 0.015 },
    { id: "rays", name: "RAYS · 光线直进(足上首下)", dur: 7, dot: "pink", mode: "RUNNING",
      cam: { theta: -0.55, phi: 1.2, r: 21, target: [-3, 4.5, 0] }, drift: 0.01 },
    { id: "screen", name: "SCREEN · 倒像屏与像距滑动", dur: 6, dot: "blue", mode: "RUNNING",
      cam: { theta: 1.72, phi: 1.2, r: 13, target: [7, 4.8, 0] }, drift: 0.01 },
    { id: "apsize", name: "APERTURE SIZE · 孔径对照(明与糊/暗与锐)", dur: 7, dot: "green", mode: "RUNNING",
      cam: { theta: 1.5, phi: 1.2, r: 16, target: [5, 4.8, 0] }, drift: 0.01 },
    { id: "mozi", name: "MOZI · 墨经条文(景到·在午有端)", dur: 6, dot: "yellow", mode: "RUNNING",
      cam: { theta: 0.4, phi: 1.24, r: 17, target: [2, 5.5, 0] }, drift: 0.008 },
    { id: "walk", name: "WALK · 行人过孔,倒像反向", dur: 7, dot: "red", mode: "CYCLE",
      cam: { theta: -0.35, phi: 1.22, r: 24, target: [-3, 4.5, 0] }, drift: 0.008 }
  ];
  MECH.PHASE_IDS = ["chamber", "aperture", "scene", "rays", "screen", "apsize", "mozi", "walk"];

  MECH.newState = KS.newState;

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  MECH.tick = function (st, ph, pt, dt) {
    st.a = D.A_FIG;
    st.b = D.B_DEFAULT;
    st.d = D.D_DEFAULT;
    st.figDX = 0;
    st.screenA = ph.id === "rays" ? 0 : clamp01((pt - 1) / 1.5);

    if (ph.id === "aperture") {
      /* 孔径演示:5 → 20 → 5 */
      var seg = pt < 1.5 ? 0 : pt < 3.5 ? ease((pt - 1.5) / 2) : pt < 5 ? 1 - ease((pt - 3.5) / 1.5) : 0;
      st.d = 5 + (20 - 5) * seg;
    }
    if (ph.id === "screen") {
      /* 像距滑动:90 → 150 → 60 → 90(景随 b 变大/变小) */
      var u = pt < 2 ? ease(pt / 2) : pt < 4 ? 1 - ease((pt - 2) / 2) : pt < 5 ? -ease((pt - 4) / 1) : -1 + ease((pt - 5) / 1);
      st.b = 90 + 60 * (pt < 4 ? u : -1 + ease(Math.min(1, (pt - 4)))) - (pt >= 4 ? 30 * ease(Math.min(1, (pt - 4))) : 0);
      if (pt >= 5) st.b = 60 + 30 * ease(Math.min(1, (pt - 5)));
    }
    if (ph.id === "apsize") {
      /* 孔径对照:10(亮糊)→ 4(锐)→ 2(暗)→ 5 */
      st.d = pt < 2 ? 10 : pt < 3.5 ? 10 + (4 - 10) * ease((pt - 2) / 1.5)
           : pt < 5 ? 4 + (2 - 4) * ease(Math.min(1, (pt - 3.5) / 1))
           : pt < 5.5 ? 2 : 2 + 3 * ease(Math.min(1, (pt - 5.5) / 1));
    }
    if (ph.id === "walk") {
      st.figDX = 50 * ease(clamp01((pt - 1.2) / 4.6));
    }
    KS.step(st, dt);
  };

  MECH.status = function (st, ph, pt) {
    var mag = st.b / st.a;
    var pill = ph.name;
    if (ph.id === "screen") pill = "像距 b = " + Math.round(st.b) + "mm · 景高 " + KS.imgLen(D.FIG_H, st.a, st.b).toFixed(1) + "mm";
    if (ph.id === "apsize") pill = "孔径 d = " + st.d.toFixed(1) + "mm · 半影 " + KS.penumbra(st.d, st.a, st.b).toFixed(1) + "mm";
    if (ph.id === "walk") pill = "行人 Δx=" + Math.round(st.figDX) + "mm · 景反向 Δy′=" + (-(st.figDX * st.b / st.a)).toFixed(1) + "mm";
    return {
      mode: ph.mode,
      hot: ph.id === "walk",
      pill: pill,
      a: "b=" + Math.round(st.b) + " · 放大 " + mag.toFixed(2) + " 倍",
      b: "d=" + st.d.toFixed(1) + " · 半影 " + KS.penumbra(st.d, st.a, st.b).toFixed(2) + "mm",
      c: "景高 " + KS.imgLen(D.FIG_H, st.a, st.b).toFixed(1) + "mm(倒立)"
    };
  };

  MECH.camAdj = function (st, ph, pt) {
    return null;
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? e.group : null; }
    if (ph.id === "chamber") {
      return [
        { id: "p-wall", obj: E("wallMid"), text: "隔墙 · 「在午有端」:墙为午,孔为端" },
        { id: "p-int", obj: E("chamberInt"), text: "暗室内堂 · 景成于内壁", tone: "white" }
      ];
    }
    if (ph.id === "aperture") {
      return [
        { id: "p-ap", obj: E("aperture"), text: "针孔(端)· d=2…20mm" },
        { id: "p-scale", obj: E("scaleMarks"), text: "a 物距 / b 像距 标尺", tone: "white" }
      ];
    }
    if (ph.id === "scene") {
      return [
        { id: "p-fig", obj: E("figure"), text: "行人 · 足 −30 / 首 +30" },
        { id: "p-sun", obj: E("sun"), text: "日 · 张角 0.53°", tone: "white" },
        { id: "p-tower", obj: E("pagoda"), text: "塔 · 物距 165mm" }
      ];
    }
    if (ph.id === "rays") {
      return [
        { id: "p-rays", obj: E("rays"), text: "「煦若射」· 下者之人也高" },
        { id: "p-fig2", obj: E("figure"), text: "足蔽下光,故成景于上", tone: "white" }
      ];
    }
    if (ph.id === "screen") {
      return [
        { id: "p-scr", obj: E("screen"), text: "倒像屏 · 景到(倒立实像)" },
        { id: "p-rail", obj: E("screenRail"), text: "像距 b 滑动 · 景长 = 物长·b/a", tone: "white" }
      ];
    }
    if (ph.id === "apsize") {
      return [
        { id: "p-ap2", obj: E("aperture"), text: "大孔明而糊 / 小孔暗而锐" },
        { id: "p-scr2", obj: E("screen"), text: "照度 ∝ d² · 半影 Δ=d(a+b)/a", tone: "white" }
      ];
    }
    if (ph.id === "mozi") {
      return [
        { id: "p-scroll", obj: E("scroll"), text: "《墨经》原文 · 约公元前 4 世纪" },
        { id: "p-scr3", obj: E("screen"), text: "景到,在午有端,与景长", tone: "white" }
      ];
    }
    if (ph.id === "walk") {
      return [
        { id: "p-fig3", obj: E("figure"), text: "行人向墙 → 景反向而动" },
        { id: "p-scr4", obj: E("screen"), text: "Δy′ = −Δx·b/a", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
