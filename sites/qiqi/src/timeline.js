/* 时间线(50s 自动循环):前 3 段装配、后 5 段运转(注水叙事)。
   f(注水比)/ flip(倾覆进度)/ pouring / showCG 为 (阶段 id, 阶段内时间 pt)
   的确定函数;θ 由 mech.js vesselAngle(f, flip) 纯函数解出:
     阶段 1-3:装配,器空悬倚挡(虚则欹);
     阶段 4(缓注):f 0→0.50,过 f欹 器自正(中则正);
     阶段 5(满覆):f 0.50→0.95,过 f覆 倾覆 142° 沥水(满则覆)→ 回倚;
     阶段 6(再注):f→0.50 保持正立;
     阶段 7(CG 轨迹):f 0→0.95 慢速,重心球可视化;
     阶段 8(循环):f→0.95 → 倾覆 → 回倚。 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "table", name: "TABLE · 案几枢销", dur: 4.5, dot: "yellow", mode: "ASSEMBLY",
      cam: { theta: 0.55, phi: 1.14, r: 6.0, target: [0, 0.9, 0] }, drift: 0.03 },
    { id: "stop", name: "STOP · 止挡沥盘", dur: 3.5, dot: "teal", mode: "ASSEMBLY",
      cam: { theta: -0.50, phi: 1.12, r: 5.2, target: [0.2, 1.0, 0.3] }, drift: 0.02 },
    { id: "hang", name: "HANG · 欹器空悬", dur: 4.5, dot: "orange", mode: "EMPTY",
      cam: { theta: -0.35, phi: 1.08, r: 4.4, target: [0, 1.4, 0] }, drift: 0.015 },
    { id: "fill", name: "FILL · 缓注半满", dur: 8.0, dot: "green", mode: "FILLING",
      cam: { theta: 0.60, phi: 1.06, r: 4.8, target: [0, 1.3, 0.1] }, drift: 0.012 },
    { id: "flip", name: "FLIP · 满则覆", dur: 9.0, dot: "red", mode: "OVERTURN",
      cam: { theta: 0.55, phi: 1.04, r: 5.4, target: [0.1, 1.3, 0.15] }, drift: 0.012 },
    { id: "refill", name: "REFILL · 再注半满", dur: 5.5, dot: "blue", mode: "FILLING",
      cam: { theta: 0.60, phi: 1.06, r: 4.8, target: [0, 1.3, 0.1] }, drift: 0.012 },
    { id: "cg", name: "CG · 重心轨迹", dur: 8.0, dot: "pink", mode: "CG TRACE",
      cam: { theta: 0.30, phi: 1.02, r: 5.0, target: [0.2, 1.2, 0.2] }, drift: 0.015 },
    { id: "cycle", name: "CYCLE · 满覆循环", dur: 10.0, dot: "red", mode: "CYCLE",
      cam: { theta: 0.75, phi: 1.04, r: 6.2, target: [0.1, 1.3, 0.1] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["table", "stop", "hang", "fill", "flip", "refill", "cg", "cycle"];

  MECH.newState = function () {
    return {
      time: 0, fill: 0, flip: 0, pouring: false, showCG: false, errPos: 0,
      seated: 0, phaseId: "", _pourAcc: 0, _spillDone: false
    };
  };

  /* f / flip 脚本(纯函数) */
  function scriptPhase(ph, pt) {
    var f = 0, flip = 0, pouring = false, showCG = false;
    if (ph.id === "fill") {
      f = 0.50 * KS.ease(KS.clamp(pt / 6.0, 0, 1));
      pouring = pt < 6.0;
      showCG = true;
    } else if (ph.id === "flip") {
      f = 0.50 + 0.45 * KS.ease(KS.clamp(pt / 4.0, 0, 1));
      pouring = pt < 4.0;
      /* 过 f覆 后倾覆进度(0.35→0.75 区间翻转) */
      if (f > D.fFu) flip = KS.clamp((f - D.fFu) / 0.10, 0, 1);
      showCG = true;
    } else if (ph.id === "refill") {
      f = 0.50 * KS.ease(KS.clamp(pt / 4.0, 0, 1));
      pouring = pt < 4.0;
      showCG = true;
    } else if (ph.id === "cg") {
      f = 0.95 * KS.ease(KS.clamp(pt / 7.0, 0, 1));
      if (f > D.fFu) flip = KS.clamp((f - D.fFu) / 0.10, 0, 1);
      showCG = true;
    } else if (ph.id === "cycle") {
      var c = pt % 6.5;
      if (c < 4.5) { f = 0.95 * KS.ease(KS.clamp(c / 4.0, 0, 1)); if (f > D.fFu) flip = KS.clamp((f - D.fFu) / 0.10, 0, 1); }
      else { f = 0; flip = 0; }
      pouring = c < 4.2;
      showCG = true;
    }
    return { f: f, flip: flip, pouring: pouring, showCG: showCG };
  }

  MECH.tick = function (st, ph, pt, dt) {
    st.time += dt;
    var s = scriptPhase(ph, pt);
    st.fill = s.f; st.flip = s.flip; st.pouring = s.pouring; st.showCG = s.showCG;
    st.phaseId = ph.id;

    /* 注水水花(壶口 → 器口) */
    if (s.pouring) {
      st._pourAcc += dt;
      while (st._pourAcc > 0.12) {
        st._pourAcc -= 0.12;
        MECH.Scene3D.spawnPuff(-0.28, D.pivotY + 0.42, 0.16,
          { max: 0.5, base: 0.15, vy: -1.3, vx: 0.22, tint: 0x8FCBE8, opacity: 0.6 });
      }
    }
    /* 倾覆沥水 */
    if (s.flip > 0.2 && st.fill > 0.3) {
      st._pourAcc += dt;
      while (st._pourAcc > 0.10) {
        st._pourAcc -= 0.10;
        MECH.Scene3D.spawnPuff(-0.15 + (Math.random() - 0.5) * 0.3, 0.55, 0.18,
          { max: 0.6, base: 0.18, vy: -1.6, vx: -0.15, tint: 0x8FCBE8, opacity: 0.55 });
      }
    }
  };

  MECH.camAdj = function (st, ph, pt) {
    if (ph.id === "flip") {
      if (pt > 4.0 && pt < 7.5) return { phi: 0.72, r: 4.0, target: [0.05, 1.25, 0.1] };
      return null;
    }
    if (ph.id === "cg") {
      return { phi: 0.9, r: 4.4, target: [0.25, 1.2, 0.25] };
    }
    return null;
  };

  MECH.status = function (st, ph, pt) {
    var s = KS.fillState(st.fill);
    var hot = st.fill > D.fFu;
    return {
      mode: ph.mode,
      hot: hot,
      pill: ph.name + " · f " + (st.fill * 100).toFixed(0) + "%",
      a: (st.fill * 100).toFixed(0) + " %",
      b: KS.vesselAngle(st.fill, st.flip).toFixed(0) + "°",
      c: s.yCG.toFixed(3) + " m"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "hang") {
      return [
        { id: "p-vs", obj: E("vessel"), text: "虚则欹 · 空器倚挡 θ −58°" },
        { id: "p-sb", obj: E("stopBasin"), text: "止挡 + 沥水盘", tone: "white" }
      ];
    }
    if (ph.id === "fill") {
      return [
        { id: "p-ew", obj: E("ewer"), text: "缓注 · 过 f欹 自正" },
        { id: "p-vs2", obj: E("vessel"), text: "中则正 · yCG 过枢向下", tone: "white" }
      ];
    }
    if (ph.id === "flip") {
      return [
        { id: "p-vs3", obj: E("vessel"), text: "满则覆 · yCG 过枢向上" },
        { id: "p-sb2", obj: E("stopBasin"), text: "水沥入盘", tone: "white" }
      ];
    }
    if (ph.id === "cg") {
      return [
        { id: "p-mk", obj: E("marker"), text: "重心球 · 绿稳/红不稳" },
        { id: "p-vs4", obj: E("vessel"), text: "f欹≈0.02 · f覆≈0.64(积分解)", tone: "white" }
      ];
    }
    if (ph.id === "cycle") {
      return [{ id: "p-vs5", obj: E("vessel"), text: "满而不覆者未之有也", tone: "white" }];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
