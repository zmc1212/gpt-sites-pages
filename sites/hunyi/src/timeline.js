/* 时间线(47.5s 自动循环):前 5 段装配、后 3 段运转。
   alpha(三辰转角)/ delta(窥管赤纬)为 (阶段 id, 阶段内时间 pt) 的确定函数:
     阶段 1-5:α=0, δ=0(竖直);
     阶段 6(校准):水槽涟漪,极轴标示;
     阶段 7(周天):α 匀速扫 0→4.3 rad(二至圈/四游环绕极轴);
     阶段 8(指星):α→280°,δ→+38.8°,星标现于窥管指向。 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;
  var S7END = 0.05 + 4.3;

  MECH.PHASES = [
    { id: "base", name: "BASE · 十字水槽座", dur: 5.0, dot: "yellow", mode: "ASSEMBLY",
      cam: { theta: 0.55, phi: 1.16, r: 6.4, target: [0, 0.4, 0] }, drift: 0.03 },
    { id: "columns", name: "COLUMNS · 龙柱", dur: 5.0, dot: "teal", mode: "ASSEMBLY",
      cam: { theta: 0.85, phi: 1.14, r: 6.2, target: [0, 0.8, 0] }, drift: 0.02 },
    { id: "liuhe", name: "LIUHE · 六合仪", dur: 5.5, dot: "orange", mode: "ASSEMBLY",
      cam: { theta: -0.50, phi: 1.10, r: 5.6, target: [0, 1.45, 0] }, drift: 0.015 },
    { id: "sanchen", name: "SANCHEN · 三辰仪", dur: 5.5, dot: "pink", mode: "ASSEMBLY",
      cam: { theta: 0.85, phi: 1.08, r: 5.0, target: [0, 1.45, 0] }, drift: 0.015 },
    { id: "siyou", name: "SIYOU · 四游仪窥管", dur: 5.5, dot: "green", mode: "ASSEMBLY",
      cam: { theta: -0.35, phi: 1.08, r: 4.6, target: [0, 1.45, 0] }, drift: 0.015 },
    { id: "calib", name: "CALIB · 极轴校准", dur: 4.5, dot: "blue", mode: "CALIBRATING",
      cam: { theta: 0.60, phi: 1.06, r: 6.0, target: [0, 1.30, 0.4] }, drift: 0.012 },
    { id: "turn", name: "TURN · 周天运转", dur: 8.0, dot: "yellow", mode: "TURNING",
      cam: { theta: 0.55, phi: 1.04, r: 6.2, target: [0, 1.45, 0] }, drift: 0.012 },
    { id: "aim", name: "AIM · 窥管指星", dur: 9.5, dot: "red", mode: "AIMING",
      cam: { theta: 0.75, phi: 1.02, r: 6.6, target: [0, 1.45, 0] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["base", "columns", "liuhe", "sanchen", "siyou", "calib", "turn", "aim"];

  MECH.newState = function () {
    return {
      time: 0, alpha: 0, delta: 0, aiming: false, errPos: 0,
      seated: 0, phaseId: "", _rippleT: 0
    };
  };

  /* alpha / delta 脚本(纯函数) */
  function scriptPhase(ph, pt) {
    var a = 0, d2 = 0, aiming = false;
    if (ph.id === "turn") {
      a = 0.05 + D.omega * pt;
    } else if (ph.id === "aim") {
      a = S7END + (D.alphaVega - S7END) * KS.ease(KS.clamp(pt / 3.5, 0, 1));
      d2 = KS.rad(D.deltaVega) * KS.ease(KS.clamp((pt - 2.0) / 3.0, 0, 1));
      aiming = pt > 5.4;
    }
    return { a: a, d: d2, aiming: aiming };
  }

  MECH.tick = function (st, ph, pt, dt) {
    st.time += dt;
    var s = scriptPhase(ph, pt);
    st.alpha = s.a; st.delta = s.d; st.aiming = s.aiming;
    st.phaseId = ph.id;

    /* 水槽涟漪(校准段) */
    var bs = MECH.Parts.entry("base");
    if (bs && bs.shown && bs.group.children) {
      bs.group.traverse(function (o) {
        if (o.isMesh && o.geometry.type === 'PlaneGeometry' && o.material.transparent) {
          o.position.y = 0.16 + 0.004 * Math.sin(st.time * 2.2 + (o.position.z > 0 ? 0 : 1));
        }
      });
    }
  };

  MECH.camAdj = function (st, ph, pt) {
    if (ph.id === "aim" && st.aiming) {
      var d = KS.aimDir(st.alpha, st.delta);
      return { phi: 0.9, r: 5.2, target: [d[0] * 1.1, D.hubY + d[1] * 1.1, d[2] * 1.1] };
    }
    return null;
  };

  MECH.status = function (st, ph, pt) {
    var hot = st.aiming;
    return {
      mode: ph.mode,
      hot: hot,
      pill: ph.name + " · α " + KS.deg(st.alpha).toFixed(0) + "° δ " + KS.deg(st.delta).toFixed(1) + "°",
      a: "50.1°",
      b: KS.deg(st.alpha).toFixed(0) + "°",
      c: KS.deg(st.delta).toFixed(1) + "°"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "liuhe") {
      return [
        { id: "p-md", obj: E("meridian"), text: "子午双环 · 固定" },
        { id: "p-hz", obj: E("horizon"), text: "地平环 · 24 刻度", tone: "white" }
      ];
    }
    if (ph.id === "sanchen") {
      return [{ id: "p-eq", obj: E("equator"), text: "赤道环⊥极轴 + 黄道环 23.5°" }];
    }
    if (ph.id === "siyou") {
      return [{ id: "p-fr", obj: E("four"), text: "四游环 + 窥管 · 指任意 δ", tone: "white" }];
    }
    if (ph.id === "calib") {
      return [{ id: "p-bs", obj: E("base"), text: "十字水槽调平 · 极倾 50.1°", tone: "white" }];
    }
    if (ph.id === "turn") {
      return [{ id: "p-so", obj: E("solstice"), text: "二至圈绕极轴 · α 扫描" }];
    }
    if (ph.id === "aim") {
      return [
        { id: "p-fr2", obj: E("four"), text: "窥管指织女星 δ +38.8°" },
        { id: "p-sr", obj: E("star"), text: "织女星标 · 管口正对", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
