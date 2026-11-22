/* 时间线(46.5s 自动循环):前 5 段装配、后 3 段运转。
   thetaV(铜乌角)由 mech.js 解析欠阻尼公式给出(纯函数);
   thetaW(风向)由脚本给出:阶段 7 缓扫 −60°→+60°,阶段 8 阵风 ±90°。 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "base", name: "BASE · 灵台台基", dur: 5.0, dot: "yellow", mode: "ASSEMBLY",
      cam: { theta: 0.55, phi: 1.14, r: 6.6, target: [0, 0.8, 0] }, drift: 0.03 },
    { id: "disc", name: "DISC · 二十四方位盘", dur: 4.5, dot: "teal", mode: "ASSEMBLY",
      cam: { theta: -0.50, phi: 1.10, r: 5.0, target: [0, 2.35, 0] }, drift: 0.02 },
    { id: "pivot", name: "PIVOT · 枢柱栖座", dur: 4.5, dot: "orange", mode: "ASSEMBLY",
      cam: { theta: 0.85, phi: 1.08, r: 4.0, target: [0, 1.85, 0] }, drift: 0.015 },
    { id: "crow", name: "CROW · 铜乌", dur: 5.0, dot: "pink", mode: "ASSEMBLY",
      cam: { theta: -0.35, phi: 1.06, r: 3.8, target: [0, 1.9, 0] }, drift: 0.015 },
    { id: "tail", name: "TAIL · 尾风板", dur: 4.5, dot: "green", mode: "ASSEMBLY",
      cam: { theta: 0.70, phi: 1.06, r: 4.2, target: [0, 1.9, -0.2] }, drift: 0.015 },
    { id: "flag", name: "FLAG · 幡杆风向旗", dur: 4.5, dot: "blue", mode: "ASSEMBLY",
      cam: { theta: -0.40, phi: 1.08, r: 5.4, target: [0.9, 1.2, 0.4] }, drift: 0.015 },
    { id: "turn", name: "TURN · 和风转乌", dur: 9.0, dot: "yellow", mode: "TURNING",
      cam: { theta: 0.60, phi: 1.02, r: 5.8, target: [0.1, 1.9, 0] }, drift: 0.012 },
    { id: "gust", name: "GUST · 阵风急转", dur: 11.0, dot: "red", mode: "GUSTING",
      cam: { theta: 0.75, phi: 1.02, r: 6.2, target: [0.1, 1.9, 0] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["base", "disc", "pivot", "crow", "tail", "flag", "turn", "gust"];

  MECH.newState = function () {
    return {
      time: 0, thetaV: 0, thetaW: 0, errPos: 0, settleErr: 0,
      seated: 0, phaseId: "", _windAcc: 0, _settleT: 0
    };
  };

  MECH.tick = function (st, ph, pt, dt) {
    st.time += dt;
    st.thetaW = KS.windDir(ph, pt);
    st.thetaV = KS.vaneAngle(ph, pt);
    st.phaseId = ph.id;

    /* 稳态误差(运转段:目标稳定 1s 后的 |θv−θw|) */
    if (ph.id === "gust") {
      var idx = Math.min(Math.floor(pt / 2.2), 4);
      var tau = pt - idx * 2.2;
      st.settleErr = tau > 1.0 ? Math.abs(KS.deg(st.thetaV - st.thetaW)) : st.settleErr;
    } else if (ph.id === "turn") {
      st.settleErr = Math.abs(KS.deg(st.thetaV - st.thetaW));
    } else {
      st.settleErr = 0;
    }

    /* 风花:沿风向漂移(运转段) */
    if (ph.id === "turn" || ph.id === "gust") {
      st._windAcc += dt;
      var wv = KS.windVec(st.thetaW);
      while (st._windAcc > 0.12) {
        st._windAcc -= 0.12;
        var sx = -wv[0] * 2.6 + (Math.random() - 0.5) * 0.8;
        var sz = -wv[1] * 2.6 + (Math.random() - 0.5) * 0.8;
        MECH.Scene3D.spawnPuff(sx, 1.9 + Math.random() * 0.5, sz,
          { max: 1.1, base: 0.30, vy: 0.12, vx: wv[0] * 1.7, vz: wv[1] * 1.7, grow: 1.6, tint: 0xBFD8E8, opacity: 0.4 });
      }
    }
  };

  MECH.camAdj = function (st, ph, pt) {
    if (ph.id === "gust") {
      var c = pt % 2.2;
      if (c > 0.1 && c < 1.1) return { phi: 0.72, r: 4.4, target: [0, 2.0, 0] };
      return null;
    }
    return null;
  };

  MECH.status = function (st, ph, pt) {
    var hot = ph.id === "gust";
    var errDeg = Math.abs(KS.deg(st.thetaV - st.thetaW));
    return {
      mode: ph.mode,
      hot: hot,
      pill: ph.name + " · θw " + KS.deg(st.thetaW).toFixed(0) + "°",
      a: KS.deg(st.thetaW).toFixed(1) + "°",
      b: KS.deg(st.thetaV).toFixed(1) + "°",
      c: errDeg.toFixed(2) + "°"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "disc") {
      return [{ id: "p-ds", obj: E("disc"), text: "二十四方位盘 · 八方字位" }];
    }
    if (ph.id === "crow") {
      return [{ id: "p-cr", obj: E("crow"), text: "铜乌 · 乌首恒指风来向", tone: "white" }];
    }
    if (ph.id === "tail") {
      return [{ id: "p-tl", obj: E("tail"), text: "尾风板 · 受风面 0.55m" }];
    }
    if (ph.id === "flag") {
      return [{ id: "p-fg", obj: E("flag"), text: "风向旗 · 飘向风去处", tone: "white" }];
    }
    if (ph.id === "turn") {
      return [
        { id: "p-cr2", obj: E("crow"), text: "欠阻尼对风 · 过冲一次回落" },
        { id: "p-ds2", obj: E("disc"), text: "θv → θw · 稳态误差 → 0", tone: "white" }
      ];
    }
    if (ph.id === "gust") {
      return [
        { id: "p-cr3", obj: E("crow"), text: "阵风 ±90° · 振荡后锁定" },
        { id: "p-fg2", obj: E("flag"), text: "旗扑向风去处", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
