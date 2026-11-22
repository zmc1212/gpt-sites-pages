/* 时间线(48.5s 自动循环):前 4 段装配、后 4 段运转。
   psi(杆相位)/ pumping / ignited / oilUsed 为 (阶段 id, 阶段内时间 pt)
   的确定函数:
     阶段 1-3:静;
     阶段 4(点火):火楼引火苗现(ignited);
     阶段 5(试喷):ψ 匀速周期,pumping,火流随排油半周伸缩;
     阶段 6(猛火):连续快泵(周期减半,火流更猛);
     阶段 7(连喷循环):持续;
     阶段 8:循环。 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "stand", name: "STAND · 底座", dur: 4.0, dot: "yellow", mode: "ASSEMBLY",
      cam: { theta: 0.55, phi: 1.14, r: 5.6, target: [-0.1, 0.5, 0] }, drift: 0.03 },
    { id: "tank", name: "TANK · 油柜", dur: 4.0, dot: "teal", mode: "ASSEMBLY",
      cam: { theta: -0.50, phi: 1.12, r: 4.6, target: [-0.45, 0.6, 0] }, drift: 0.02 },
    { id: "cylinders", name: "CYLINDERS · 双筒喷管", dur: 4.5, dot: "orange", mode: "ASSEMBLY",
      cam: { theta: 0.60, phi: 1.10, r: 4.4, target: [0.1, 0.9, 0.1] }, drift: 0.015 },
    { id: "rods", name: "RODS · 唧杆把手", dur: 4.0, dot: "pink", mode: "ASSEMBLY",
      cam: { theta: -0.35, phi: 1.06, r: 4.0, target: [0.1, 0.95, 0.1] }, drift: 0.015 },
    { id: "tower", name: "TOWER · 火楼点火", dur: 4.5, dot: "green", mode: "IGNITING",
      cam: { theta: 0.85, phi: 1.06, r: 4.4, target: [0.55, 1.05, 0] }, drift: 0.015 },
    { id: "test", name: "TEST · 试压喷火", dur: 9.0, dot: "yellow", mode: "PUMPING",
      cam: { theta: 0.60, phi: 1.02, r: 6.0, target: [0.9, 1.05, 0.1] }, drift: 0.012 },
    { id: "blast", name: "BLAST · 猛火连喷", dur: 10.0, dot: "red", mode: "BLASTING",
      cam: { theta: 0.55, phi: 1.00, r: 5.4, target: [1.1, 1.05, 0] }, drift: 0.012 },
    { id: "cycle", name: "CYCLE · 油尽火熄", dur: 8.5, dot: "blue", mode: "DRAINING",
      cam: { theta: 0.75, phi: 1.04, r: 6.4, target: [0.3, 0.9, 0] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["stand", "tank", "cylinders", "rods", "tower", "test", "blast", "cycle"];

  MECH.newState = function () {
    return {
      time: 0, psi: 0, pumping: false, ignited: false, oilUsed: 0,
      cycleFast: false, errPos: 0, seated: 0, phaseId: "", _whoosh: 0
    };
  };

  /* ψ / pumping / ignited 脚本(纯函数) */
  function scriptPhase(ph, pt) {
    var psi = 0, pumping = false, ignited = false, fast = false, used = 0;
    if (ph.id === "tower") {
      ignited = pt > 2.0;
    } else if (ph.id === "test") {
      ignited = true;
      pumping = pt > 0.8 && pt < 8.0;
      psi = 2 * Math.PI * ((pt - 0.8) / D.cycleT);
      used = KS.clamp((pt - 0.8) / 7.2, 0, 0.5);
    } else if (ph.id === "blast") {
      ignited = true;
      fast = true;
      pumping = true;
      psi = 2 * Math.PI * (3.6 / D.cycleT) + 2 * Math.PI * (pt / (D.cycleT * 0.5));
      used = 0.5 + KS.clamp(pt / 10.0, 0, 0.5);
    } else if (ph.id === "cycle") {
      ignited = pt < 5.0;
      pumping = pt > 0.5 && pt < 4.5;
      psi = 2 * Math.PI * (5.6 / D.cycleT) + 2 * Math.PI * ((pt - 0.5) / D.cycleT) * (pt < 4.5 ? 2 : 0);
      used = KS.clamp(1.0 - pt / 5.0, 0, 1) * 0;
    }
    return { psi: psi, pumping: pumping, ignited: ignited, fast: fast, used: used };
  }

  MECH.tick = function (st, ph, pt, dt) {
    st.time += dt;
    var s = scriptPhase(ph, pt);
    st.psi = s.psi; st.pumping = s.pumping; st.ignited = s.ignited;
    st.cycleFast = s.fast; st.oilUsed = s.used;
    st.phaseId = ph.id;

    /* 喷油 whoosh 粒子(排油相) */
    if (s.pumping && s.ignited) {
      var amt = Math.abs(Math.sin(s.psi));
      st._whoosh = (st._whoosh || 0) + dt;
      if (amt > 0.4 && st._whoosh > 0.10) {
        st._whoosh = 0;
        MECH.Scene3D.spawnPuff(D.towerX + 0.25 + Math.random() * 0.5, D.towerY + 0.02 + (Math.random() - 0.5) * 0.06,
          (Math.random() - 0.5) * 0.08,
          { max: 0.45, base: 0.24, vy: 0.25, vx: 2.2, tint: 0xE98C2C, opacity: 0.6 });
        if (Math.random() < 0.5) {
          MECH.Scene3D.spawnPuff(D.towerX + 0.4 + Math.random() * 0.6, D.towerY + 0.03 + (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.06,
            { max: 0.35, base: 0.16, vy: 0.15, vx: 2.6, tint: 0xE9C93C, opacity: 0.55 });
        }
      }
    }
  };

  MECH.camAdj = function (st, ph, pt) {
    if (ph.id === "test" || ph.id === "blast") {
      return { phi: 0.85, r: 4.8, target: [0.85, 1.05, 0] };
    }
    return null;
  };

  MECH.status = function (st, ph, pt) {
    var hot = st.pumping && st.ignited;
    var amt = hot ? Math.abs(Math.sin(st.psi)) : 0;
    return {
      mode: ph.mode,
      hot: hot,
      pill: ph.name + " · " + (st.pumping && st.ignited ? "喷 " + (amt * 100 | 0) + "%" : (st.ignited ? "火楼待喷" : "未点火")),
      a: KS.deg(st.psi % (2 * Math.PI)).toFixed(0) + "°",
      b: hot ? (D.vJet * amt).toFixed(1) + " m/s" : "—",
      c: (100 - Math.round((st.oilUsed || 0) * 100)) + " %"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "tank") {
      return [{ id: "p-tk", obj: E("tank"), text: "油柜 · 体腔贮油" }];
    }
    if (ph.id === "cylinders") {
      return [
        { id: "p-cy", obj: E("cylinders"), text: "双活塞筒 · 面积比 14:1" },
        { id: "p-rd", obj: E("rods"), text: "唧杆反相 · 行程 0.22m", tone: "white" }
      ];
    }
    if (ph.id === "tower") {
      return [{ id: "p-tw", obj: E("tower"), text: "火楼 · 内置火药引燃", tone: "white" }];
    }
    if (ph.id === "test") {
      return [
        { id: "p-jt", obj: E("jet"), text: "油流喷燃 · v_jet = k·v活" },
        { id: "p-tw2", obj: E("tower"), text: "火楼引燃 · 猛火油", tone: "white" }
      ];
    }
    if (ph.id === "blast") {
      return [
        { id: "p-jt2", obj: E("jet"), text: "猛火连喷 · 快泵 ×2" },
        { id: "p-tk2", obj: E("tank"), text: "油面渐降", tone: "white" }
      ];
    }
    if (ph.id === "cycle") {
      return [{ id: "p-tk3", obj: E("tank"), text: "油尽火熄 · 补油再战", tone: "white" }];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
