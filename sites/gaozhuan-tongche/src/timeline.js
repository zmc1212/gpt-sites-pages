/* 时间线(46s 自动循环):前 6 段装配、后 2 段运转。
   sAdv(链行进距离)为 (阶段 id, 阶段内时间 pt) 的确定函数 —— seek 无需补偿:
     阶段 1-5:sAdv = 0;
     阶段 7(lift):ω 二次坡起 1.5s 后恒速 0.9 rad/s → sAdv = 0.225·τ³(τ≤1)
               + 0.45·(pt−2.3);
     阶段 8(cycle):恒速续行 sAdv = S7end + 0.45·pt。
   阶段衔接连续;循环重启时全部复位重装。 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;
  var S7END = 0.225 + 0.45 * 5.7;   // 阶段 7 结束时链行 = 2.79 m

  MECH.PHASES = [
    { id: "stream", name: "STREAM · 溪渠田渡槽", dur: 5.0, dot: "yellow", mode: "ASSEMBLY",
      cam: { theta: 0.50, phi: 1.15, r: 10.0, target: [-1.2, 1.0, 0] }, drift: 0.03 },
    { id: "piers", name: "PIERS · 下轮石墩", dur: 5.0, dot: "teal", mode: "ASSEMBLY",
      cam: { theta: -0.55, phi: 1.18, r: 6.8, target: [-2.5, 0.8, 0] }, drift: 0.02 },
    { id: "frame", name: "FRAME · 上轮高架", dur: 5.0, dot: "orange", mode: "ASSEMBLY",
      cam: { theta: 0.40, phi: 1.10, r: 8.8, target: [-2.5, 2.6, 0] }, drift: 0.015 },
    { id: "wheels", name: "WHEELS · 双链轮上轴", dur: 5.5, dot: "pink", mode: "ASSEMBLY",
      cam: { theta: 0.90, phi: 1.12, r: 6.4, target: [-2.5, 2.2, 0] }, drift: 0.015 },
    { id: "boards", name: "BOARDS · 刮板挂链", dur: 6.5, dot: "green", mode: "ASSEMBLY",
      cam: { theta: -0.35, phi: 1.10, r: 7.8, target: [-2.5, 2.2, 0] }, drift: 0.015 },
    { id: "crank", name: "CRANK · 摇柄踏转", dur: 4.0, dot: "blue", mode: "ASSEMBLY",
      cam: { theta: -0.95, phi: 1.18, r: 5.6, target: [-1.9, 0.8, 0.3] }, drift: 0.015 },
    { id: "lift", name: "LIFT · 汲水越顶", dur: 8.0, dot: "yellow", mode: "LIFT",
      cam: { theta: 0.55, phi: 1.05, r: 9.4, target: [-1.8, 2.4, 0] }, drift: 0.012 },
    { id: "cycle", name: "CYCLE · 周而复始", dur: 7.0, dot: "red", mode: "CYCLE",
      cam: { theta: 0.75, phi: 1.08, r: 11.0, target: [-1.0, 2.0, 0] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["stream", "piers", "frame", "wheels", "boards", "crank", "lift", "cycle"];

  MECH.newState = function () {
    return {
      time: 0, sAdv: 0, vChain: 0, errPos: 0,
      wetCount: 0, seated: 0, phaseId: "",
      _splashAcc: 0, _dumpAcc: 0, _exitAcc: 0, _prevWet: [], _prevS: 0
    };
  };

  /* —— sAdv 脚本(纯函数) —— */
  function scriptPhase(ph, pt) {
    var s = 0, v = 0;
    if (ph.id === "lift") {
      var tau = KS.clamp((pt - 0.8) / 1.5, 0, 1);
      if (tau < 1) {
        s = 0.225 * tau * tau * tau;          // ∫v dt,v = 0.45·τ² → s = 0.45·1.5·τ³/3
        v = 0.45 * tau * tau;
      } else {
        s = 0.225 + 0.45 * (pt - 2.3);
        v = 0.45;
      }
    } else if (ph.id === "cycle") {
      s = S7END + 0.45 * pt;
      v = 0.45;
    }
    return { s: s, v: v };
  }

  MECH.tick = function (st, ph, pt, dt) {
    st.time += dt;
    var r = scriptPhase(ph, pt);
    st.sAdv = r.s;
    st.vChain = r.v;
    st.phaseId = ph.id;

    /* 板载水统计 + 入水/倾倒事件 */
    var wet = 0;
    var splash = false, dump = false;
    for (var i = 0; i < D.NB; i++) {
      var e = MECH.Parts.entry("bd" + i);
      if (!e || !e.sealed) continue;
      var bs = KS.boardState(i, st.sAdv);
      if (bs.wet) wet++;
      if (bs.seg === 3 && bs.y < D.waterY - 0.02) splash = true;
      var ps = (i * D.pitch + (st._prevS || 0)) % D.Ltot;
      var pd = (i * D.pitch + D.dumpS) % D.Ltot;
      /* 倾倒事件:板位 s 越过 dumpS */
      var sNow = bs.s, sPrev = ps;
      if ((sPrev < pd && sNow >= pd) || (sPrev > sNow && (sNow >= pd || sPrev < pd))) dump = true;
    }
    st.wetCount = wet;
    st._prevS = st.sAdv;

    if (splash && st.vChain > 0) {
      st._splashAcc += dt;
      while (st._splashAcc > 0.12) {
        st._splashAcc -= 0.12;
        MECH.Scene3D.spawnPuff(D.xC + (Math.random() - 0.5) * 0.5, D.waterY + 0.08, (Math.random() - 0.5) * 0.5,
          { max: 0.6, base: 0.30, vy: 1.0 + Math.random() * 0.5, tint: 0x8FCBE8, opacity: 0.5 });
      }
    }
    if (dump && st.vChain > 0) {
      st._dumpAcc += dt;
      while (st._dumpAcc > 0.10) {
        st._dumpAcc -= 0.10;
        /* 倾注:板过顶倒空,水花落入渡槽口上方(槽口 x=−1.80,与下行板缘留 0.05) */
        MECH.Scene3D.spawnPuff(D.trX0 - 0.02, D.trY0 + 0.12, (Math.random() - 0.5) * 0.10,
          { max: 0.5, base: 0.24, vy: -1.1, vx: 0.3, vz: (Math.random() - 0.5) * 0.12, tint: 0x8FCBE8, opacity: 0.6 });
      }
      st._exitAcc = 0.4;
    }
    /* 渡槽出口注田 */
    if (st.vChain > 0) {
      st._exitAcc += dt;
      if (st._exitAcc > 0.38) {
        st._exitAcc = 0;
        MECH.Scene3D.spawnPuff(D.trX1 + 0.05, D.trY1 - 0.08, (Math.random() - 0.5) * 0.10,
          { max: 0.55, base: 0.24, vy: -1.9, vx: 0.5, tint: 0x8FCBE8, opacity: 0.55 });
      }
    }

    /* 渠/田/槽水面微动 */
    var sw = MECH.Parts.entry("stream");
    if (sw && sw.shown && sw.group.userData.water) {
      sw.group.userData.water.position.y = D.waterY + 0.006 * Math.sin(st.time * 1.6);
    }
    var pw = MECH.Parts.entry("paddy");
    if (pw && pw.shown && pw.group.userData.water) {
      pw.group.userData.water.position.y = D.paddyWater + 0.005 * Math.sin(st.time * 2.2);
    }
  };

  /* 镜头调度:汲水段越过顶时近观倾倒入槽 */
  MECH.camAdj = function (st, ph, pt) {
    var dumpCam = { phi: 0.85, r: 5.2, target: [D.xC, D.yU + 0.35, 0] };
    if (ph.id === "lift") {
      var tau = KS.clamp((pt - 0.8) / 1.5, 0, 1);
      if (tau >= 1) return dumpCam;
      return null;
    }
    if (ph.id === "cycle") {
      var c = pt % 3.5;
      if (c < 2.0) return dumpCam;
      return null;
    }
    return null;
  };

  MECH.status = function (st, ph, pt) {
    var hot = ph.id === "lift" || ph.id === "cycle";
    return {
      mode: ph.mode,
      hot: hot,
      pill: ph.name + " · v " + st.vChain.toFixed(2) + " m/s",
      a: st.vChain.toFixed(2) + " m/s",
      b: st.sAdv.toFixed(2) + " m",
      c: "载水板 " + st.wetCount + "/" + D.NB
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "piers") {
      return [{ id: "p-pi", obj: E("pierN"), text: "石柱墩 · 承下轮轴 0.62m", tone: "white" }];
    }
    if (ph.id === "frame") {
      return [{ id: "p-fr", obj: E("upperFrame"), text: "高架 · 轴高 3.95m · 交叉撑" }];
    }
    if (ph.id === "wheels") {
      return [
        { id: "p-lw", obj: E("lowerWheel"), text: "下链轮 · 径 1.0m · 浸水 0.06m" },
        { id: "p-uw", obj: E("upperWheel"), text: "上链轮 · 同径 · 竖段对齐", tone: "white" }
      ];
    }
    if (ph.id === "boards") {
      return [
        { id: "p-bd", obj: E("bd0"), text: "刮板小筒 · 板距 0.70m" },
        { id: "p-bd2", obj: E("bd7"), text: "14 筒循环 · 载水上行", tone: "white" }
      ];
    }
    if (ph.id === "crank") {
      return [{ id: "p-ck", obj: E("crank"), text: "摇柄 · ω 0.9 rad/s → v 0.45 m/s", tone: "white" }];
    }
    if (ph.id === "lift" || ph.id === "cycle") {
      return [
        { id: "p-tr", obj: E("trough"), text: "渡槽 · 越顶倾注 → 田" },
        { id: "p-st", obj: E("stream"), text: "溪渠 · 下轮取水", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
