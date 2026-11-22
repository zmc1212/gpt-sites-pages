/* 时间线(46.5s 自动循环):前 5 段装配、后 3 段运转(点灯/调光/循环)。
   alpha(屏板开度)/ lit / cutaway 为 (阶段 id, 阶段内时间 pt) 的确定函数:
     阶段 1-4:α = 0,未点灯;
     阶段 6(点灯):焰亮,α 0→70°,烟起入袖,剖视开;
     阶段 7(调光):α 70→15→85(暗↔亮往返),光锥随张角;
     阶段 8(循环):开合呼吸循环。 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "base", name: "BASE · 台座跪裙", dur: 6.0, dot: "yellow", mode: "ASSEMBLY",
      cam: { theta: 0.55, phi: 1.14, r: 5.6, target: [0.1, 0.6, 0] }, drift: 0.03 },
    { id: "figure", name: "FIGURE · 宫女上身", dur: 5.0, dot: "teal", mode: "ASSEMBLY",
      cam: { theta: -0.50, phi: 1.10, r: 4.6, target: [0.05, 0.9, 0] }, drift: 0.02 },
    { id: "pan", name: "PAN · 灯座灯盘", dur: 5.0, dot: "orange", mode: "ASSEMBLY",
      cam: { theta: 0.85, phi: 1.08, r: 4.0, target: [0.28, 1.3, 0.3] }, drift: 0.015 },
    { id: "panels", name: "PANELS · 双屏板", dur: 5.0, dot: "pink", mode: "ASSEMBLY",
      cam: { theta: -0.35, phi: 1.06, r: 3.8, target: [0.28, 1.32, 0.3] }, drift: 0.015 },
    { id: "duct", name: "DUCT · 烟道体腔", dur: 5.5, dot: "green", mode: "ASSEMBLY",
      cam: { theta: 0.40, phi: 1.08, r: 4.6, target: [0.1, 1.1, -0.1] }, drift: 0.015 },
    { id: "light", name: "LIGHT · 点灯开罩", dur: 8.0, dot: "yellow", mode: "LIGHTING",
      cam: { theta: 0.60, phi: 1.04, r: 5.0, target: [0.2, 1.25, 0.25] }, drift: 0.012 },
    { id: "dim", name: "DIM · 调光明暗", dur: 9.0, dot: "blue", mode: "DIMMING",
      cam: { theta: 0.55, phi: 1.02, r: 4.6, target: [0.28, 1.32, 0.35] }, drift: 0.012 },
    { id: "cycle", name: "CYCLE · 开合呼吸", dur: 8.5, dot: "red", mode: "BREATHING",
      cam: { theta: 0.75, phi: 1.04, r: 5.4, target: [0.2, 1.25, 0.25] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["base", "figure", "pan", "panels", "duct", "light", "dim", "cycle"];

  MECH.newState = function () {
    return {
      time: 0, alpha: 0, lit: false, cutaway: false, errPos: 0,
      seated: 0, phaseId: "", _smokeAcc: 0, _ductAcc: 0
    };
  };

  /* alpha / lit / cutaway 脚本(纯函数) */
  function scriptPhase(ph, pt) {
    var a = 0, lit = false, cut = false;
    if (ph.id === "light") {
      lit = pt > 0.8;
      a = 70 * KS.ease(KS.clamp((pt - 1.5) / 3.5, 0, 1));
      cut = pt > 4.5;
    } else if (ph.id === "dim") {
      lit = true; cut = true;
      /* 70 → 15 → 85 往返 */
      if (pt < 2.5) a = 70 - 55 * KS.ease(pt / 2.5);
      else if (pt < 5.5) a = 15 + 70 * KS.ease((pt - 2.5) / 3.0);
      else a = 85;
    } else if (ph.id === "cycle") {
      lit = true; cut = true;
      var c = pt % 4.25;
      a = 42.5 - 42.5 * Math.cos(c / 4.25 * Math.PI * 2) * 0 + 42.5 * Math.sin(c / 4.25 * Math.PI) - 0;
      a = 42.5 + 42.5 * Math.sin(c / 4.25 * Math.PI * 2 - Math.PI / 2);
    }
    return { a: a, lit: lit, cut: cut };
  }

  MECH.tick = function (st, ph, pt, dt) {
    st.time += dt;
    var s = scriptPhase(ph, pt);
    st.alpha = s.a; st.lit = s.lit; st.cutaway = s.cut;
    st.phaseId = ph.id;

    /* 烟:焰 → 袖口(上段);袖内:袖弯 → 腔水(剖视可见) */
    if (s.lit) {
      st._smokeAcc += dt;
      while (st._smokeAcc > 0.16) {
        st._smokeAcc -= 0.16;
        var p0 = KS.smokePoint(Math.random() * 0.38);
        MECH.Scene3D.spawnPuff(p0[0], p0[1], p0[2],
          { max: 1.0, base: 0.20 + Math.random() * 0.10, vy: 0.35, vx: (Math.random() - 0.5) * 0.08, vz: (Math.random() - 0.5) * 0.08, grow: 1.9, tint: 0xBFC6CE, opacity: 0.42 });
      }
      st._ductAcc += dt;
      while (st._ductAcc > 0.20) {
        st._ductAcc -= 0.20;
        var p1 = KS.smokePoint(0.72 + Math.random() * 0.26);
        MECH.Scene3D.spawnPuff(p1[0], p1[1], p1[2],
          { max: 0.8, base: 0.16, vy: -0.25, vx: 0, vz: 0, grow: 1.5, tint: 0xA9B4BE, opacity: 0.5 });
      }
    }
  };

  MECH.camAdj = function (st, ph, pt) {
    if (ph.id === "light") {
      if (pt > 2.0 && pt < 6.5) return { phi: 0.75, r: 3.6, target: [0.28, 1.35, 0.3] };
      return null;
    }
    if (ph.id === "dim") {
      return { phi: 0.78, r: 3.8, target: [0.3, 1.35, 0.4] };
    }
    return null;
  };

  MECH.status = function (st, ph, pt) {
    var hot = st.lit;
    return {
      mode: ph.mode,
      hot: hot,
      pill: ph.name + " · α " + st.alpha.toFixed(0) + "°",
      a: st.alpha.toFixed(0) + "°",
      b: D.coneAngle(st.alpha).toFixed(0) + "°",
      c: st.lit ? "焰亮 · 烟入水" : "未点灯"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "pan") {
      return [{ id: "p-pn", obj: E("pan"), text: "灯盘 R 0.20 · 双立轴铰点" }];
    }
    if (ph.id === "panels") {
      return [
        { id: "p-pl", obj: E("panelL"), text: "屏板 L · 绕立轴 −α" },
        { id: "p-pr", obj: E("panelR"), text: "屏板 R · 开合调光 0→90°", tone: "white" }
      ];
    }
    if (ph.id === "duct") {
      return [
        { id: "p-du", obj: E("duct"), text: "右袖烟道 · 剖视体腔" },
        { id: "p-wt", obj: E("duct"), text: "体腔水盘 · 溶烟", tone: "white" }
      ];
    }
    if (ph.id === "light") {
      return [
        { id: "p-fm", obj: E("flame"), text: "点灯 · 烟自焰起入袖" },
        { id: "p-cn", obj: E("cone"), text: "光锥 β = 0.8α", tone: "white" }
      ];
    }
    if (ph.id === "dim") {
      return [{ id: "p-cn2", obj: E("cone"), text: "调光:α 15° 暗 ↔ 85° 亮", tone: "white" }];
    }
    if (ph.id === "cycle") {
      return [{ id: "p-pr2", obj: E("panelR"), text: "开合呼吸 · 循环调光", tone: "white" }];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
