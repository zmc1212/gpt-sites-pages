/* 时间线(48.5s 自动循环):前 4 段装配、后 4 段运转。
   draw(张弦行程)/ fired / fireT 为 (阶段 id, 阶段内时间 pt) 的确定函数:
     阶段 1-4:draw = 0;
     阶段 5(张弦):绞车摇柄,draw 0→0.9(大牙锁定);
     阶段 6(击发):pt 0.8 击发(弦弹回,箭弹道 1.2s),pt 5.0 复位;
     阶段 7(再张):draw 0→0.9;
     阶段 8(连发):pt 1.0 击发 → 复位 → pt 7.0 再击发。 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "bed", name: "BED · 弩床砧柱", dur: 4.5, dot: "yellow", mode: "ASSEMBLY",
      cam: { theta: 0.55, phi: 1.14, r: 6.2, target: [0.2, 0.6, 0] }, drift: 0.03 },
    { id: "bows", name: "BOWS · 前双弓反弓", dur: 6.0, dot: "teal", mode: "ASSEMBLY",
      cam: { theta: -0.45, phi: 1.10, r: 5.8, target: [0, 0.8, 0] }, drift: 0.02 },
    { id: "string", name: "STRING · 弦与大牙", dur: 5.0, dot: "orange", mode: "ASSEMBLY",
      cam: { theta: 0.60, phi: 1.08, r: 4.8, target: [0.0, 0.85, 0.2] }, drift: 0.015 },
    { id: "bolt", name: "BOLT · 一枪三剑箭", dur: 5.0, dot: "pink", mode: "ASSEMBLY",
      cam: { theta: 0.30, phi: 1.06, r: 4.6, target: [0.1, 0.85, 0.1] }, drift: 0.015 },
    { id: "winch", name: "WINCH · 绞车张弦", dur: 8.0, dot: "green", mode: "WINCHING",
      cam: { theta: 0.60, phi: 1.04, r: 6.0, target: [0.3, 0.8, 0.15] }, drift: 0.012 },
    { id: "fire", name: "FIRE · 击发弹道", dur: 8.0, dot: "yellow", mode: "FIRING",
      cam: { theta: -0.15, phi: 1.04, r: 7.0, target: [1.0, 0.75, 0] }, drift: 0.012 },
    { id: "rewind", name: "REWIND · 再张弦", dur: 5.0, dot: "blue", mode: "WINCHING",
      cam: { theta: 0.55, phi: 1.04, r: 5.8, target: [0.3, 0.8, 0.15] }, drift: 0.012 },
    { id: "cycle", name: "CYCLE · 连发射击", dur: 12.0, dot: "red", mode: "FIRING",
      cam: { theta: 0.70, phi: 1.02, r: 7.4, target: [0.8, 0.8, 0] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["bed", "bows", "string", "bolt", "winch", "fire", "rewind", "cycle"];

  MECH.newState = function () {
    return {
      time: 0, draw: 0, fired: false, fireT: 0, errPos: 0,
      seated: 0, phaseId: "", _clapDone: false
    };
  };

  /* draw / fired / fireT 脚本(纯函数) */
  function scriptPhase(ph, pt) {
    var draw = 0, fired = false, fireT = 0;
    if (ph.id === "winch") {
      draw = D.drawMax * KS.ease(KS.clamp((pt - 0.8) / 5.0, 0, 1));
    } else if (ph.id === "fire") {
      draw = D.drawMax;
      if (pt > 0.8) {
        fired = true;
        fireT = Math.min(pt - 0.8, 1.2);
        if (fireT >= 1.2) draw = 0;
      }
      if (pt > 5.0) { draw = D.drawMax * KS.ease(KS.clamp((pt - 5.0) / 2.0, 0, 1)); fired = false; }
    } else if (ph.id === "rewind") {
      draw = D.drawMax * KS.ease(KS.clamp(pt / 4.0, 0, 1));
    } else if (ph.id === "cycle") {
      draw = D.drawMax;
      if (pt > 1.0 && pt < 2.2) { fired = true; fireT = pt - 1.0; }
      else if (pt >= 2.2 && pt < 5.0) { draw = D.drawMax * KS.ease(KS.clamp((pt - 2.2) / 2.4, 0, 1)); }
      else if (pt >= 5.0) draw = D.drawMax;
      if (pt > 7.0 && pt < 8.2) { fired = true; fireT = pt - 7.0; }
      else if (pt >= 8.2) { draw = D.drawMax * KS.ease(KS.clamp((pt - 8.2) / 2.4, 0, 1)); }
    }
    return { draw: draw, fired: fired, fireT: fireT };
  }

  MECH.tick = function (st, ph, pt, dt) {
    st.time += dt;
    var s = scriptPhase(ph, pt);
    /* 击发瞬间(检测 fired 上升沿)打拍 */
    if (s.fired && !st.fired && !st._clapDone) {
      MECH.Scene3D.spawnPuff(0.15, D.bedY + 0.30, 0,
        { max: 0.4, base: 0.30, vy: 0.6, vx: 1.0, tint: 0xD8C9A8, opacity: 0.6 });
      st._clapDone = true;
    }
    if (!s.fired) st._clapDone = false;
    st.draw = s.draw; st.fired = s.fired; st.fireT = s.fireT;
    st.phaseId = ph.id;
  };

  MECH.camAdj = function (st, ph, pt) {
    if (ph.id === "fire" && st.fired) {
      var t = st.fireT;
      return { target: [KS.nockX(st.draw) + D.v0 * t * 0.35, 0.75, 0] };
    }
    return null;
  };

  MECH.status = function (st, ph, pt) {
    var hot = st.fired;
    var drawPct = (st.draw / D.drawMax * 100) | 0;
    return {
      mode: ph.mode,
      hot: hot,
      pill: ph.name + " · 张弦 " + drawPct + "%",
      a: KS.nockX(st.draw).toFixed(2) + " m",
      b: st.draw > 0.05 ? "600 kgf" : "0(卸力)",
      c: st.fired ? D.v0.toFixed(0) + " m/s" : "—"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "bows") {
      return [
        { id: "p-fb", obj: E("frontBows"), text: "前双弓 · 正向叠张 ×2" },
        { id: "p-bb", obj: E("backBow"), text: "反弓 · 反向顶弦", tone: "white" }
      ];
    }
    if (ph.id === "string") {
      return [{ id: "p-sg", obj: E("string"), text: "六梢聚钩 · 大牙锁弦", tone: "white" }];
    }
    if (ph.id === "bolt") {
      return [{ id: "p-bt", obj: E("bolt"), text: "一枪三剑箭 · m 1.5kg" }];
    }
    if (ph.id === "winch") {
      return [{ id: "p-wn", obj: E("winch"), text: "绞车 MA 3.33 · 张弦 0.9m", tone: "white" }];
    }
    if (ph.id === "fire") {
      return [
        { id: "p-bt2", obj: E("bolt"), text: "击发 v = √(2Fx/m) ≈ 59 m/s" },
        { id: "p-sg2", obj: E("string"), text: "弦弹回 · 大牙复位", tone: "white" }
      ];
    }
    if (ph.id === "rewind") {
      return [{ id: "p-wn2", obj: E("winch"), text: "再张弦 · 待击发", tone: "white" }];
    }
    if (ph.id === "cycle") {
      return [{ id: "p-bt3", obj: E("bolt"), text: "连发射击 · 三弓叠张", tone: "white" }];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
