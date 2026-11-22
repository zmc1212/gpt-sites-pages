/* 时间线(44s 循环):井口井架 → 支点碓杆 → 铁锥竹绳 → 踩碓凿进 → 深凿 →
   汲卤 → 满桶 → 手动节奏(← 加频 / → 减频) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "ground", name: "GROUND · 井口井架", dur: 5, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.20, r: 7.5, target: [0, 1.2, 1.6] }, drift: 0.03 },
    { id: "lever", name: "LEVER · 支点碓杆", dur: 6, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: -0.45, phi: 1.16, r: 6.0, target: [-1.2, 1.3, 1.4] }, drift: 0.02 },
    { id: "bit", name: "BIT · 竹绳铁锥", dur: 5, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: 0.30, phi: 1.14, r: 4.6, target: [0, 1.4, 1.8] }, drift: 0.012 },
    { id: "drill", name: "DRILL · 踩碓凿进", dur: 8, dot: "teal", mode: "DRILLING",
      cam: { theta: -0.30, phi: 1.16, r: 7.0, target: [-0.8, 1.3, 1.6] }, drift: 0.02 },
    { id: "deep", name: "DEEP · 深凿(数十丈·压缩)", dur: 6, dot: "green", mode: "DRILLING",
      cam: { theta: 0.35, phi: 1.12, r: 5.5, target: [0, 1.2, 1.8] }, drift: 0.015 },
    { id: "bail", name: "BAIL · 汲卤筒", dur: 5, dot: "pink", mode: "BAILING",
      cam: { theta: 0.90, phi: 1.14, r: 4.8, target: [0, 1.0, 1.8] }, drift: 0.012 },
    { id: "full", name: "FULL · 满桶卤水", dur: 4, dot: "blue", mode: "SHOWCASE",
      cam: { theta: 1.10, phi: 1.10, r: 3.6, target: [0.8, 0.5, 1.0] }, drift: 0.010 },
    { id: "manual", name: "MANUAL · 手动节奏(← 加频 / → 减频)", dur: 5, dot: "red", mode: "MANUAL",
      cam: { theta: -0.55, phi: 1.18, r: 7.2, target: [-0.8, 1.3, 1.5] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["ground", "lever", "bit", "drill", "deep", "bail", "full", "manual"];

  MECH.newState = KS.newState;
  var rateScale = 1.0;

  var _puffT = 0, _bailT = 0;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      rateScale = (ph.id === "manual") ? 0.75 : 1.0;
    }
    if (ph.id === "manual") {
      var d = 0;
      if (MECH.keys && MECH.keys.left) d += 0.25;
      if (MECH.keys && MECH.keys.right) d -= 0.25;
      rateScale = Math.min(2.0, Math.max(0.5, rateScale + d * dt));
    }
    /* 时间缩放节奏(相位机按缩放时间推进) */
    KS.step(st, dt * rateScale);

    /* 冲击石屑粒子(进入 rest 相位瞬间) */
    if (st.bitState === "rest" && st._prev2 !== "rest") {
      MECH.Scene3D.spawnPuff(D.wellX, 0.55, D.wellZ,
        { max: 0.55, base: 0.30, vy: 1.0, opacity: 0.55, tint: 0x8A8578 });
    }
    st._prev2 = st.bitState;
  };

  /* seek 补偿:运转段按节奏预置循环计数/井深 */
  var RUN_T = 16;
  function phaseStart(i) { var a = 0; for (var k = 0; k < i; k++) a += MECH.PHASES[k].dur; return a; }
  MECH.onSeek = function (i, st) {
    var start = phaseStart(i);
    if (start < RUN_T) return;
    var tRun = start - RUN_T;
    st.time = tRun;
    st.strikes = Math.floor(tRun / D.cycle);
    st.depth = st.strikes * D.strikeDepth;
    st.cyc = st.strikes;
    st.bitState = "rest";
  };

  MECH.status = function (st, ph, pt) {
    var pill = ph.name;
    if (st.running) pill = ph.name + " · " + st.bitState.toUpperCase() + " · " + (1 / D.cycle * rateScale).toFixed(2) + " Hz";
    return {
      mode: ph.mode,
      hot: ph.id === "manual",
      pill: pill,
      a: "击 " + st.strikes + " · " + (rateScale).toFixed(2) + "×",
      b: "v冲 " + D.vHit.toFixed(2) + " m/s · E " + D.Ehit.toFixed(0) + " J",
      c: "井深 " + (st.depth).toFixed(3) + " m(压缩)"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "lever") {
      return [
        { id: "p-lever", obj: E("lever"), text: "碓杆 4.2m · 杠杆增力 i=2.2" },
        { id: "p-trestle", obj: E("trestle"), text: "支点铁销", tone: "white" }
      ];
    }
    if (ph.id === "bit") {
      return [
        { id: "p-bit", obj: E("bit"), text: "圜刃锥 60kg · 竹篾夹悬" }
      ];
    }
    if (ph.id === "drill" || ph.id === "deep" || ph.id === "manual") {
      return [
        { id: "p-bit", obj: E("bit"), text: "v=√(2gh)=2.42 · E=½mv²=176J" },
        { id: "p-well", obj: E("wellhead"), text: "「深者数十丈」· 进尺压缩", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
