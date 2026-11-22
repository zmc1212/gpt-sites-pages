/* 时间线(49s 自动循环):前 5 段装配、后 3 段航行。
   ψ(明轮角)/ px(船位)/ v 为 (阶段 id, 阶段内时间 pt) 的确定函数:
     ψ = ∫ω dt,ω 脚本坡起(τ²)→ 恒速;px = ∫v dt,v = ω·r(不滑移);
     阶段 7(试航):坡起 1.5s + 恒速;阶段 8(巡航):恒速续航。 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;
  var S7 = { t0: 0.5, ramp: 1.5 };
  var S7END_PSI = (D.omega * S7.ramp / 3) + D.omega * (8.0 - S7.t0 - S7.ramp);
  var S7END_PX = D.vSail * (S7.ramp / 3) + D.vSail * (8.0 - S7.t0 - S7.ramp);

  MECH.PHASES = [
    { id: "water", name: "RIVER · 河面船体", dur: 5.0, dot: "yellow", mode: "ASSEMBLY",
      cam: { theta: 0.55, phi: 1.14, r: 7.4, target: [0.2, 0.4, 0] }, drift: 0.03 },
    { id: "cabin", name: "CABIN · 桅杆舱棚", dur: 4.5, dot: "teal", mode: "ASSEMBLY",
      cam: { theta: -0.50, phi: 1.12, r: 5.6, target: [-0.4, 0.8, 0] }, drift: 0.02 },
    { id: "wheels", name: "WHEELS · 双明轮", dur: 6.0, dot: "orange", mode: "ASSEMBLY",
      cam: { theta: -0.40, phi: 1.10, r: 5.4, target: [0, 0.62, 0.6] }, drift: 0.015 },
    { id: "treadle", name: "TREADLE · 踏板轴链", dur: 5.0, dot: "pink", mode: "ASSEMBLY",
      cam: { theta: 0.60, phi: 1.08, r: 4.8, target: [0.3, 0.85, 0.3] }, drift: 0.015 },
    { id: "flag", name: "FLAG · 帅旗", dur: 4.5, dot: "green", mode: "ASSEMBLY",
      cam: { theta: -0.35, phi: 1.06, r: 5.0, target: [0.5, 1.5, 0] }, drift: 0.015 },
    { id: "ready", name: "READY · 备航", dur: 4.0, dot: "blue", mode: "READY",
      cam: { theta: 0.60, phi: 1.06, r: 6.4, target: [0.2, 0.7, 0.2] }, drift: 0.012 },
    { id: "sail", name: "SAIL · 踏行试航", dur: 10.0, dot: "yellow", mode: "SAILING",
      cam: { theta: 0.55, phi: 1.04, r: 7.0, target: [1.0, 0.6, 0.2] }, drift: 0.012 },
    { id: "cruise", name: "CRUISE · 疾若挂帆", dur: 12.0, dot: "red", mode: "CRUISING",
      cam: { theta: 0.75, phi: 1.04, r: 7.8, target: [1.5, 0.6, 0] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["water", "cabin", "wheels", "treadle", "flag", "ready", "sail", "cruise"];

  MECH.newState = function () {
    return {
      time: 0, psi: 0, omega: 0, px: 0, v: 0, errPos: 0,
      seated: 0, phaseId: "", _splashAcc: 0, _wakeAcc: 0
    };
  };

  /* ψ / px / v 脚本(纯函数,τ² 坡起积分) */
  function scriptPhase(ph, pt) {
    var psi = 0, px = 0, om = 0, v = 0;
    if (ph.id === "sail") {
      var u = KS.clamp((pt - S7.t0) / S7.ramp, 0, 1);
      if (u < 1) {
        psi = D.omega * S7.ramp * u * u * u / 3;
        om = D.omega * u * u;
      } else {
        psi = D.omega * S7.ramp / 3 + D.omega * (pt - S7.t0 - S7.ramp);
        om = D.omega;
      }
      var vu = KS.clamp((pt - S7.t0) / S7.ramp, 0, 1);
      if (vu < 1) { px = D.vSail * S7.ramp * vu * vu * vu / 3; v = D.vSail * vu * vu; }
      else { px = D.vSail * S7.ramp / 3 + D.vSail * (pt - S7.t0 - S7.ramp); v = D.vSail; }
    } else if (ph.id === "cruise") {
      psi = S7END_PSI + D.omega * pt;
      om = D.omega;
      px = S7END_PX + D.vSail * pt;
      v = D.vSail;
    }
    return { psi: psi, px: px, om: om, v: v };
  }

  MECH.tick = function (st, ph, pt, dt) {
    st.time += dt;
    var s = scriptPhase(ph, pt);
    st.psi = s.psi; st.px = s.px; st.omega = s.om; st.v = s.v;
    st.phaseId = ph.id;

    /* 桨尖击水水花(明轮下部,随船位) */
    if (s.om > 0.05) {
      st._splashAcc += dt;
      while (st._splashAcc > 0.12) {
        st._splashAcc -= 0.12;
        [D.wheelZ, -D.wheelZ].forEach(function (z) {
          MECH.Scene3D.spawnPuff(st.px + (Math.random() - 0.5) * 0.5, D.waterY + 0.08, z + (Math.random() - 0.5) * 0.2,
            { max: 0.5, base: 0.24, vy: 0.9 + Math.random() * 0.4, vx: 0.15, tint: 0x8FCBE8, opacity: 0.5 });
        });
      }
    }
    /* 尾流(船尾) */
    if (s.v > 0.05) {
      st._wakeAcc += dt;
      while (st._wakeAcc > 0.18) {
        st._wakeAcc -= 0.18;
        MECH.Scene3D.spawnPuff(st.px - D.hullL / 2 - 0.2, D.waterY + 0.05, (Math.random() - 0.5) * 0.7,
          { max: 0.9, base: 0.34, vy: 0.10, vx: -0.5, grow: 1.8, tint: 0xCFE4EE, opacity: 0.4 });
      }
    }

    /* 水面微波 */
    var wt = MECH.Parts.entry("water");
    if (wt && wt.shown && wt.group.userData.water) {
      wt.group.userData.water.position.y = D.waterY + 0.004 * Math.sin(st.time * 2.0);
    }
  };

  MECH.camAdj = function (st, ph, pt) {
    if (ph.id === "sail") {
      return { target: [st.px + 0.4, 0.6, 0.2] };
    }
    if (ph.id === "cruise") {
      var c = pt % 6.0;
      if (c < 3.0) return { phi: 0.9, r: 5.0, target: [st.px + 0.5, 0.55, D.wheelZ * 0.8] };  // 近观明轮
      return { target: [st.px + 0.5, 0.6, 0] };
    }
    return null;
  };

  MECH.status = function (st, ph, pt) {
    var hot = (st.v || 0) > 0.05;
    return {
      mode: ph.mode,
      hot: hot,
      pill: ph.name + " · v " + (st.v || 0).toFixed(2) + " m/s",
      a: (st.omega || 0).toFixed(2) + " rad/s",
      b: (st.v || 0).toFixed(2) + " m/s",
      c: (st.px || 0).toFixed(1) + " m"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "wheels") {
      return [
        { id: "p-wl", obj: E("wheelL"), text: "明轮 L · r 0.55 · 8 桨" },
        { id: "p-wr", obj: E("wheelR"), text: "明轮 R · 浸深 0.05m", tone: "white" }
      ];
    }
    if (ph.id === "treadle") {
      return [
        { id: "p-td", obj: E("treadle"), text: "踏板轴 · 双曲柄反相" },
        { id: "p-dv", obj: E("drive"), text: "链传动 · 同径 i=1", tone: "white" }
      ];
    }
    if (ph.id === "flag") {
      return [{ id: "p-fg", obj: E("flag"), text: "帅旗 · 翔风鼓浪", tone: "white" }];
    }
    if (ph.id === "sail" || ph.id === "cruise") {
      return [
        { id: "p-wr2", obj: E("wheelR"), text: "v = ω·r = 0.5 m/s 不滑移" },
        { id: "p-wt", obj: E("water"), text: "尾流 + 桨尖击水", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
