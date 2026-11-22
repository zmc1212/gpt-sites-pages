/* 时间线(46s 循环):下池岸台 → 围筒支架 → 螺旋轴·枢轮 → 拐木接轮·踏台 →
   螺沟注水(口袋落位) → 踏动提水(ω拐爬至额定) → 满柜溢流 → 手动踏频(←/→) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "ground", name: "GROUND · 下池与岸台", dur: 5, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.20, r: 9.5, target: [0.3, 1.0, 2.6] }, drift: 0.03 },
    { id: "tube", name: "TUBE · 围筒与支座", dur: 5, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: -0.35, phi: 1.18, r: 7.5, target: [0, 1.8, 2.0] }, drift: 0.02 },
    { id: "screw", name: "SCREW · 螺旋轴·枢轮 8T", dur: 6, dot: "blue", mode: "ASSEMBLING",
      cam: { theta: 0.35, phi: 1.14, r: 6.5, target: [0, 1.8, 2.0] }, drift: 0.012 },
    { id: "crank", name: "CRANK · 拐木·接轮 16T·踏台", dur: 6, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: -0.90, phi: 1.16, r: 6.0, target: [-0.8, 1.6, 2.0] }, drift: 0.015 },
    { id: "fill", name: "FILL · 螺沟注水(18 口袋)", dur: 5, dot: "pink", mode: "ASSEMBLING",
      cam: { theta: 0.20, phi: 1.10, r: 5.5, target: [0, 1.6, 2.0] }, drift: 0.010 },
    { id: "power", name: "POWER · 踏动提水(拐木一转得二转)", dur: 8, dot: "teal", mode: "RUNNING",
      cam: { theta: -0.75, phi: 1.18, r: 8.0, target: [-0.5, 1.8, 1.8] }, drift: 0.02 },
    { id: "full", name: "OVERFLOW · 满柜溢流", dur: 5, dot: "green", mode: "OVERFLOW",
      cam: { theta: 0.80, phi: 1.14, r: 6.0, target: [-0.8, 3.0, 0.4] }, drift: 0.015 },
    { id: "manual", name: "MANUAL · 手动踏频(← 加速 / → 减速)", dur: 6, dot: "red", mode: "MANUAL",
      cam: { theta: -0.55, phi: 1.20, r: 8.5, target: [-0.4, 1.8, 1.8] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["ground", "tube", "screw", "crank", "fill", "power", "full", "manual"];

  MECH.newState = KS.newState;

  var _puffT = 0;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      if (ph.id === "power") st.omegaTarget = 0.45;        // 额定踏频
      if (ph.id === "full") st.omegaTarget = 0.45;
      if (ph.id === "manual") st.omegaTarget = st.omegaCrank;
    }
    if (ph.id === "manual") {
      var d = 0;
      if (MECH.keys && MECH.keys.left) d += 0.10;
      if (MECH.keys && MECH.keys.right) d -= 0.10;
      st.omegaTarget = Math.min(D.omegaCrankMax, Math.max(D.omegaCrankMin, st.omegaTarget + d * dt));
    }
    KS.step(st, dt);

    /* 螺沟水口袋:轴向爬升,过顶卸水(粒子)+ 回落再取水 */
    var wp = MECH.Parts.entry("waterPockets");
    if (wp && wp.shown && wp.group.userData.anim) {
      var pockets = wp.group.userData.anim.pockets;
      var adv = D.pocketAdv(D.i * st.omegaCrank);
      for (var i = 0; i < pockets.length; i++) {
        var m = pockets[i];
        if (!st.running) { m.visible = false; continue; }
        m.userData.u += adv * dt;
        if (m.userData.u > D.tubeLen) m.userData.u -= D.tubeLen;
        var th = m.userData.u / D.S * Math.PI * 2 + (m.userData.flight ? Math.PI : 0);
        var midY = (D.B.y + D.T.y) / 2, midZ = (D.B.z + D.T.z) / 2;
        m.position.set(
          Math.cos(th) * (D.rAxis + D.Rout) / 2,
          midY + (m.userData.u - D.tubeLen / 2) * D.dir.y,
          midZ + (m.userData.u - D.tubeLen / 2) * D.dir.z + Math.sin(th) * (D.rAxis + D.Rout) / 2);
        m.visible = true;
      }
      if (st.running) {
        _puffT += dt;
        if (_puffT > 0.22) {
          _puffT = 0;
          MECH.Scene3D.spawnPuff(D.T.x - 0.1, D.T.y + 0.15, D.T.z + (Math.random() - 0.5) * 0.2,
            { max: 0.7, base: 0.30, vy: -0.2, opacity: 0.55, tint: 0xBFD9E8 });
        }
      }
    }
    /* 柜水位 */
    var bk = MECH.Parts.entry("bank");
    if (bk && bk.shown && bk.group.userData.anim) {
      var w = bk.group.userData.anim.tankWater;
      w.scale.y = Math.max(0.01, st.tankWater / D.tank.cap);
      w.position.y = D.tank.y + 0.10 + st.tankWater / 2;
    }
  };

  /* seek 补偿:跳到运转段按踏频历程预置相位/柜水 */
  var RUN_T = 28;
  function phaseStart(i) { var a = 0; for (var k = 0; k < i; k++) a += MECH.PHASES[k].dur; return a; }
  MECH.onSeek = function (i, st) {
    var start = phaseStart(i);
    if (start < RUN_T) return;
    var tRun = start - RUN_T;
    st.omegaTarget = 0.45; st.omegaCrank = 0.45;
    st.phiCrank = 0.45 * Math.max(0, tRun - 1.0) + 0.24 * Math.min(tRun, 1.0);
    st.phiScrew = D.i * st.phiCrank;
    st.lifted = D.Qof(0.45) * tRun;
    st.tankWater = Math.min(D.tank.cap, st.lifted / 0.64);
  };

  MECH.status = function (st, ph, pt) {
    var rpm = st.omegaCrank * 60 / (2 * Math.PI);
    var pill = ph.name;
    if (st.running) pill = ph.name + " · 螺旋 " + (st.phiScrew / (2 * Math.PI)).toFixed(1) + " 转";
    return {
      mode: ph.mode,
      hot: ph.id === "manual",
      pill: pill,
      a: rpm.toFixed(2) + " rpm · ω螺旋 " + (D.i * st.omegaCrank).toFixed(2),
      b: (st.flow * 1000).toFixed(1) + " L/s · H 2.79 m",
      c: "柜 " + (st.tankWater * 640).toFixed(1) + " L / 累计 " + st.lifted.toFixed(1) + " m³"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "screw") {
      return [
        { id: "p-screw", obj: E("screw"), text: "螺旋轴 15尺 · sinθ=0.6 双头螺叶" },
        { id: "p-tube", obj: E("tube"), text: "围筒可视螺沟 · q=λπ(R²−r²)S×2", tone: "white" }
      ];
    }
    if (ph.id === "crank") {
      return [
        { id: "p-crank", obj: E("crankset"), text: "接轮 16T : 枢轮 8T → 一转得二转" },
        { id: "p-stands", obj: E("stands"), text: "踏台 · 畜力/多人轮踏", tone: "white" }
      ];
    }
    if (ph.id === "power" || ph.id === "full" || ph.id === "manual") {
      return [
        { id: "p-screw", obj: E("screw"), text: "ω螺旋=2ω拐 · 口袋爬升 ωS/2π" },
        { id: "p-bank", obj: E("bank"), text: "笧槽→柜 · H=轴长×sinθ=2.79m", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
