/* 时间线(48.5s 自动循环):前 3 段装配、后 5 段运转。
   phi(剪叉角)为 (阶段 id, 阶段内时间 pt) 的确定函数:
     阶段 1-2:φ = φ0(折);阶段 3(展开校验):φ 折→展→折 快速;
     阶段 4(摇绞):φ 25→62 慢升(绞盘 2.07 圈同步);
     阶段 5(瞭望):高位保持,旗扑;
     阶段 6(降回):φ 62→25 缓降;
     阶段 7/8:循环升降。 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "cart", name: "CART · 车体轮轴", dur: 4.5, dot: "yellow", mode: "ASSEMBLY",
      cam: { theta: 0.55, phi: 1.14, r: 6.0, target: [0.2, 0.5, 0] }, drift: 0.03 },
    { id: "rails", name: "RAILS · 立柱导轨", dur: 3.5, dot: "teal", mode: "ASSEMBLY",
      cam: { theta: -0.50, phi: 1.12, r: 4.8, target: [0.45, 1.0, 0] }, drift: 0.02 },
    { id: "check", name: "CHECK · 展开校验", dur: 4.0, dot: "orange", mode: "CHECK",
      cam: { theta: 0.85, phi: 1.08, r: 5.4, target: [0.35, 1.6, 0] }, drift: 0.015 },
    { id: "winch", name: "WINCH · 摇绞升楼", dur: 9.0, dot: "green", mode: "WINCHING",
      cam: { theta: 0.60, phi: 1.04, r: 6.2, target: [0.4, 1.8, 0.2] }, drift: 0.012 },
    { id: "watch", name: "WATCH · 高位瞭望", dur: 5.5, dot: "pink", mode: "WATCHING",
      cam: { theta: -0.35, phi: 0.98, r: 6.0, target: [0.4, 3.0, 0] }, drift: 0.015 },
    { id: "lower", name: "LOWER · 缓降回折", dur: 5.5, dot: "blue", mode: "LOWERING",
      cam: { theta: 0.60, phi: 1.06, r: 6.0, target: [0.3, 1.8, 0.1] }, drift: 0.012 },
    { id: "cycle", name: "CYCLE · 升降循环", dur: 10.0, dot: "red", mode: "CYCLE",
      cam: { theta: 0.75, phi: 1.04, r: 6.8, target: [0.3, 1.8, 0.1] }, drift: 0.01 },
    { id: "cabin", name: "CABIN · 望楼舱近观", dur: 6.5, dot: "yellow", mode: "WATCHING",
      cam: { theta: 0.85, phi: 0.95, r: 4.4, target: [0.35, 2.9, 0] }, drift: 0.015 }
  ];
  MECH.PHASE_IDS = ["cart", "rails", "check", "winch", "watch", "lower", "cycle", "cabin"];

  MECH.newState = function () {
    return {
      time: 0, phi: D.phi0, winching: false, errPos: 0,
      seated: 0, phaseId: ""
    };
  };

  /* φ 脚本(纯函数) */
  function scriptPhase(ph, pt) {
    var phi = D.phi0, winch = false;
    if (ph.id === "check") {
      if (pt < 1.2) phi = D.phi0 + (D.phi1 - D.phi0) * KS.ease(pt / 1.2);
      else if (pt < 2.6) phi = D.phi1;
      else phi = D.phi1 - (D.phi1 - D.phi0) * KS.ease(KS.clamp((pt - 2.6) / 1.4, 0, 1));
      winch = pt < 1.2;
    } else if (ph.id === "winch") {
      phi = D.phi0 + (D.phi1 - D.phi0) * KS.ease(KS.clamp((pt - 0.8) / 6.0, 0, 1));
      winch = pt > 0.8 && pt < 6.8;
    } else if (ph.id === "watch") {
      phi = D.phi1;
    } else if (ph.id === "lower") {
      phi = D.phi1 - (D.phi1 - D.phi0) * KS.ease(KS.clamp((pt - 0.5) / 3.5, 0, 1));
      winch = pt > 0.5 && pt < 4.0;
    } else if (ph.id === "cycle") {
      var c = pt % 7.0;
      if (c < 4.2) phi = D.phi0 + (D.phi1 - D.phi0) * KS.ease(KS.clamp(c / 3.8, 0, 1));
      else phi = D.phi1 - (D.phi1 - D.phi0) * KS.ease(KS.clamp((c - 4.2) / 2.8, 0, 1));
      winch = (c >= 0.5 && c < 4.0) || (c >= 4.4 && c < 6.8);
    } else if (ph.id === "cabin") {
      phi = D.phi1;
    }
    return { phi: phi, winch: winching(ph, winch) };
    function winching(ph2, w) { return w; }
  }

  MECH.tick = function (st, ph, pt, dt) {
    st.time += dt;
    var s = scriptPhase(ph, pt);
    st.phi = s.phi; st.winching = s.winch;
    st.phaseId = ph.id;
  };

  MECH.camAdj = function (st, ph, pt) {
    if (ph.id === "winch") {
      var s = KS.scissor(st.phi);
      return { target: [s.cabinFloor * 0.35, 1.2 + (s.cabinFloor - D.cabinFloor0) * 0.9, 0.2] };
    }
    if (ph.id === "watch") {
      return { phi: 0.85, r: 5.6, target: [0.35, 3.1, 0] };
    }
    return null;
  };

  MECH.status = function (st, ph, pt) {
    var sc = KS.scissor(st.phi);
    var hot = st.winching;
    return {
      mode: ph.mode,
      hot: hot,
      pill: ph.name + " · H " + sc.cabinFloor.toFixed(2) + "m",
      a: KS.deg(st.phi).toFixed(1) + "°",
      b: sc.cabinFloor.toFixed(2) + " m",
      c: ((D.s0 - sc.s) / (2 * Math.PI * D.drumR)).toFixed(2) + " 圈"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "check") {
      return [{ id: "p-sc", obj: E("scissor"), text: "双级剪叉 · 四臂 φ 25°↔62°" }];
    }
    if (ph.id === "winch") {
      return [
        { id: "p-wn", obj: E("winch"), text: "绞盘 · 收绳 1.04m = 2.07 圈" },
        { id: "p-cb", obj: E("cabin"), text: "望楼舱升 2.26 倍", tone: "white" }
      ];
    }
    if (ph.id === "watch" || ph.id === "cabin") {
      return [
        { id: "p-cb2", obj: E("cabin"), text: "高位瞭望 · 瞰城内虚实" },
        { id: "p-sc2", obj: E("scissor"), text: "H = y0 + 2L·sinφ", tone: "white" }
      ];
    }
    if (ph.id === "lower") {
      return [{ id: "p-sc3", obj: E("scissor"), text: "缓降回折 · φ → 25°", tone: "white" }];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
