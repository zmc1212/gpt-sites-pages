/* 时间线(46s 自动循环):前 6 段装配、后 2 段运转。
   swingT(摆钟)/ wedgeAdv(楔累计进)为 (阶段 id, 阶段内时间 pt) 的确定函数:
     阶段 1-5:swingT = 0,adv = 0;
     阶段 6(悬锤):锤摆动(空摆,不进楔);
     阶段 7(撞楔):3 击周期——每击楔进 0.03,饼束压缩,油面抬升;
     阶段 8(继续):再 3 击(累计 6 击? 规范 3 击 → 阶段 8 复用摆动,
       楔进维持 0.09 上限,击空摆,油面缓涨)。 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;
  var HIT_PERIOD = D.period;   // 2.0s 每击

  MECH.PHASES = [
    { id: "frame", name: "FRAME · 榨框", dur: 5.0, dot: "yellow", mode: "ASSEMBLY",
      cam: { theta: 0.55, phi: 1.14, r: 6.4, target: [0.2, 0.7, 0] }, drift: 0.03 },
    { id: "cakes", name: "CAKES · 麹饼束", dur: 5.0, dot: "teal", mode: "ASSEMBLY",
      cam: { theta: -0.50, phi: 1.12, r: 5.0, target: [0, 0.55, 0] }, drift: 0.02 },
    { id: "plate", name: "PLATE · 榨板油盘", dur: 4.5, dot: "orange", mode: "ASSEMBLY",
      cam: { theta: 0.85, phi: 1.10, r: 5.2, target: [0.2, 0.6, 0.3] }, drift: 0.015 },
    { id: "wedge", name: "WEDGE · 撞楔", dur: 4.5, dot: "pink", mode: "ASSEMBLY",
      cam: { theta: -0.35, phi: 1.10, r: 4.8, target: [0.7, 0.6, 0.1] }, drift: 0.015 },
    { id: "ramFrame", name: "RIG · 撞杆架悬锤", dur: 5.0, dot: "green", mode: "ASSEMBLY",
      cam: { theta: 0.40, phi: 1.08, r: 6.2, target: [0.8, 1.0, 0] }, drift: 0.015 },
    { id: "swing", name: "SWING · 悬锤空摆", dur: 5.0, dot: "blue", mode: "SWINGING",
      cam: { theta: 0.60, phi: 1.06, r: 6.6, target: [0.6, 1.0, 0] }, drift: 0.012 },
    { id: "ram", name: "RAM · 撞楔榨油", dur: 9.0, dot: "yellow", mode: "RAMMING",
      cam: { theta: 0.55, phi: 1.04, r: 6.0, target: [0.5, 0.7, 0.15] }, drift: 0.012 },
    { id: "cycle", name: "CYCLE · 继续压榨", dur: 13.0, dot: "red", mode: "RAMMING",
      cam: { theta: 0.75, phi: 1.06, r: 7.0, target: [0.4, 0.7, 0.1] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["frame", "cakes", "plate", "wedge", "ramFrame", "swing", "ram", "cycle"];

  MECH.newState = function () {
    return {
      time: 0, swingT: 0, wedgeAdv: 0, hitFlash: 0, errPos: 0,
      seated: 0, phaseId: "", _oilAcc: 0, _hits: 0, _prevPhi: 0
    };
  };

  /* swingT / wedgeAdv 脚本(纯函数) */
  function scriptPhase(ph, pt) {
    var t = 0, adv = 0;
    if (ph.id === "swing") {
      t = pt;
    } else if (ph.id === "ram") {
      t = pt;
      /* 每 2s 一击,前 3 击有效(共 6s),楔进 = 击数 × 0.03 */
      adv = Math.min(Math.floor(pt / HIT_PERIOD + 0.25), D.hitN) * D.dHit;
      adv = KS.clamp(adv, 0, D.wedgeMax);
    } else if (ph.id === "cycle") {
      t = pt;
      adv = D.wedgeMax;   // 楔已满,继续空摆保持压力
    }
    return { t: t, adv: adv };
  }

  MECH.tick = function (st, ph, pt, dt) {
    st.time += dt;
    var s = scriptPhase(ph, pt);
    st.swingT = s.t;
    /* 楔进平滑(击中瞬间 0.25s 内滑入) */
    st.wedgeAdv += (s.adv - st.wedgeAdv) * Math.min(1, dt * 9);
    st.phaseId = ph.id;

    /* 击中瞬间火花/尘 */
    var phiNow = KS.swingPhi(s.t);
    if (st._prevPhi > 0.1 && phiNow <= 0.1 && (ph.id === "ram" || ph.id === "cycle")) {
      st.hitFlash = 1;
      MECH.Scene3D.spawnPuff(D.pivotX - D.armL * 0.06 - 0.05, D.wedgeY, (Math.random() - 0.5) * 0.2,
        { max: 0.5, base: 0.26, vy: 1.1, tint: 0xD8C9A8, opacity: 0.6 });
    }
    st._prevPhi = phiNow;
    st.hitFlash = Math.max(0, st.hitFlash - dt * 2);

    /* 油滴入盘(楔进量 > 0 时滴) */
    if (st.wedgeAdv > 0.02) {
      st._oilAcc += dt;
      while (st._oilAcc > 0.22) {
        st._oilAcc -= 0.22;
        MECH.Scene3D.spawnPuff(D.cakeX0 + (Math.random() - 0.5) * 0.3, D.cakeY0 - 0.02, 0.18,
          { max: 0.55, base: 0.16, vy: -0.5, vz: 0.35, tint: 0x9C7A2E, opacity: 0.6 });
      }
    }
  };

  MECH.camAdj = function (st, ph, pt) {
    if (ph.id === "ram") {
      var c = pt % D.period;
      if (c > D.period * 0.3 && c < D.period * 0.62) return { phi: 0.78, r: 4.6, target: [0.7, 0.6, 0] };
      return null;
    }
    if (ph.id === "cycle") {
      var c2 = pt % D.period;
      if (c2 > D.period * 0.3 && c2 < D.period * 0.62) return { phi: 0.78, r: 4.6, target: [0.7, 0.6, 0] };
      return null;
    }
    return null;
  };

  MECH.status = function (st, ph, pt) {
    var hot = ph.id === "ram" || ph.id === "cycle";
    return {
      mode: ph.mode,
      hot: hot,
      pill: ph.name + " · 楔进 " + (st.wedgeAdv * 100).toFixed(0) + "cm",
      a: (st.wedgeAdv * 100).toFixed(1) + " cm",
      b: (st.wedgeAdv / D.wedgeMax * 100).toFixed(0) + " %",
      c: (D.vHammer).toFixed(2) + " m/s"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "cakes") {
      return [{ id: "p-ck", obj: E("cakes"), text: "麹饼束 · 草裹 ×7 · 压缩 18%" }];
    }
    if (ph.id === "wedge") {
      return [{ id: "p-wg", obj: E("wedge"), text: "撞楔 · 每击进 0.03m ×3", tone: "white" }];
    }
    if (ph.id === "ramFrame") {
      return [
        { id: "p-rf", obj: E("ramFrame"), text: "撞杆架 · 悬枢 2.00m" },
        { id: "p-rm", obj: E("ram"), text: "悬锤 · 臂 1.45m · 锤速 2.64 m/s", tone: "white" }
      ];
    }
    if (ph.id === "ram" || ph.id === "cycle") {
      return [
        { id: "p-wg2", obj: E("wedge"), text: "楔进 → 榨板前压 → 油出" },
        { id: "p-pn", obj: E("pan"), text: "油盘 · 油面渐涨", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
