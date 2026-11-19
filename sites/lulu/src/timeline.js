/* 时间线(44s 自动循环):前 6 段装配、后 2 段运转。
   ψ(卷筒角,rad)轨迹为 (阶段 id, 阶段内时间 pt) 的确定函数 —— seek 无需补偿;
   L(绳长) = Lhigh + rDrum·(−ψ):ψ 负转放绳、正转收绳;
   循环段(阶段 8)内部 2 个 7s 子循环:放桶 → 汲满 → 提桶 → 摆出 → 倾倒 → 回位。
   阶段衔接 L 连续:0.51 →(下放)1.36 →(提起)0.51 →(子循环)… */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;
  var SUB = 7.0;
  var PSI_TRAVEL = (D.Llow - D.Lhigh) / D.rDrum;   // 3.864 rad ≈ 221° 单程

  MECH.PHASES = [
    { id: "well", name: "WELL · 井台井池", dur: 4.5, dot: "yellow", mode: "ASSEMBLY",
      cam: { theta: 0.50, phi: 1.15, r: 9.6, target: [0, 0.8, 2.4] }, drift: 0.03 },
    { id: "frames", name: "FRAMES · 立架瓦盆", dur: 4.0, dot: "teal", mode: "ASSEMBLY",
      cam: { theta: 0.90, phi: 1.18, r: 7.6, target: [0, 1.4, 2.2] }, drift: 0.02 },
    { id: "axle", name: "AXLE · 横轴", dur: 3.5, dot: "orange", mode: "ASSEMBLY",
      cam: { theta: -0.70, phi: 1.20, r: 5.6, target: [0, 2.5, 2.8] }, drift: 0.015 },
    { id: "drum", name: "DRUM · 卷筒上轴", dur: 3.5, dot: "pink", mode: "ASSEMBLY",
      cam: { theta: 0.60, phi: 1.10, r: 5.0, target: [0, 2.55, 2.8] }, drift: 0.015 },
    { id: "crank", name: "CRANK · 摇柄", dur: 3.5, dot: "blue", mode: "ASSEMBLY",
      cam: { theta: 0.95, phi: 1.15, r: 5.2, target: [1.0, 2.4, 2.8] }, drift: 0.015 },
    { id: "rope", name: "ROPE · 吊绳水桶", dur: 4.0, dot: "green", mode: "ASSEMBLY",
      cam: { theta: -0.40, phi: 1.12, r: 6.2, target: [0, 1.8, 2.8] }, drift: 0.015 },
    { id: "lower", name: "LOWER · 放桶汲水", dur: 7.0, dot: "yellow", mode: "LOWER",
      cam: { theta: 0.35, phi: 1.10, r: 8.6, target: [0, 1.3, 2.8] }, drift: 0.012 },
    { id: "cycle", name: "CYCLE · 循环汲水", dur: 14.0, dot: "red", mode: "CYCLE",
      cam: { theta: 0.75, phi: 1.08, r: 10.2, target: [0.3, 1.3, 2.2] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["well", "frames", "axle", "drum", "crank", "rope", "lower", "cycle"];

  MECH.newState = function () {
    return {
      time: 0, psiRad: 0, psiDeg: 0, ropeLen: D.Lhigh,
      phiRad: 0, phiDeg: 0, tiltRad: 0, tiltDeg: 0,
      fill: 0, bucketMass: D.mBucket, errPos: 0,
      lowering: false, pouring: false, seated: 0, phaseId: "",
      pourPulse: 0, _lastFill: 0, _pourAcc: 0, _dripAcc: 0
    };
  };

  /* —— ψ / φ / tilt / fill 脚本(纯函数) —— */
  function scriptPhase(ph, pt) {
    var psi = 0, phi = 0, tilt = 0, fill = 0, lowering = false, pouring = false;
    if (ph.id === "drum") {
      /* 卷筒落轴后自由惰转衰减 */
      var t1 = pt - 1.4;
      psi = t1 <= 0 ? 0 : 0.55 * (1 - Math.exp(-2.0 * t1) * Math.cos(5.0 * t1));
    } else if (ph.id === "lower") {
      /* 放桶:ψ 0 → −3.864(放绳 0.85m),桶没入后汲满,再提起 */
      if (pt < 3.2) {
        psi = -PSI_TRAVEL * KS.ease(pt / 3.2);
        lowering = true;
      } else if (pt < 4.4) {
        psi = -PSI_TRAVEL;
      } else {
        psi = -PSI_TRAVEL * (1 - KS.ease(KS.clamp((pt - 4.4) / 2.2, 0, 1)));
      }
      var L = KS.ropeFromPsi(psi);
      fill = KS.clamp((L - 1.19) / 0.17, 0, 1);
      if (pt >= 3.2 && pt < 4.4) fill = 1;
    } else if (ph.id === "cycle") {
      var c = pt % SUB;
      if (c < 1.9) {                       // 放桶
        psi = -PSI_TRAVEL * KS.ease(c / 1.9);
        lowering = true;
        var L2 = KS.ropeFromPsi(psi);
        fill = KS.clamp((L2 - 1.19) / 0.17, 0, 1);
      } else if (c < 2.6) {                // 汲满
        psi = -PSI_TRAVEL;
        fill = 1;
      } else if (c < 4.1) {                // 提桶
        psi = -PSI_TRAVEL * (1 - KS.ease((c - 2.6) / 1.5));
        fill = 1;
      } else if (c < 5.0) {                // 摆出(绳摆向瓦盆)
        var a = KS.ease((c - 4.1) / 0.9);
        phi = D.phiPour * a;
        fill = 1;
      } else if (c < 6.1) {                // 倾倒
        phi = D.phiPour;
        tilt = D.tiltPour * (1 - Math.pow(1 - KS.clamp((c - 5.0) / 0.35, 0, 1), 2));
        fill = 1 - KS.clamp((c - 5.15) / 0.55, 0, 1);
        pouring = true;
      } else {                             // 回位
        var q = c - 6.1;
        tilt = D.tiltPour * Math.max(0, 1 - q / 0.22);
        phi = D.phiPour * Math.pow(Math.max(0, 1 - q / 0.6), 1.6);
        fill = 0;
      }
    }
    return { psi: psi, phi: phi, tilt: tilt, fill: fill, lowering: lowering, pouring: pouring };
  }

  MECH.tick = function (st, ph, pt, dt) {
    st.time += dt;
    var s = scriptPhase(ph, pt);
    st.psiRad = s.psi; st.psiDeg = KS.deg(s.psi);
    st.phiRad = KS.rad(s.phi); st.phiDeg = s.phi;
    st.tiltRad = KS.rad(s.tilt); st.tiltDeg = s.tilt;
    st.ropeLen = KS.ropeFromPsi(s.psi);
    st.fill = s.fill;
    st.bucketMass = D.mBucket + (D.mWater - D.mBucket) * st.fill;
    st.lowering = s.lowering;
    st.pouring = s.pouring;
    st.phaseId = ph.id;

    /* 入水汲满水花 / 倾倒水流 / 提桶滴水 */
    if (st.fill > 0.04 && st._lastFill <= 0.02) {
      for (var i = 0; i < 6; i++) {
        MECH.Scene3D.spawnPuff((Math.random() - 0.5) * 0.3, D.waterY + 0.10, D.wellZ + (Math.random() - 0.5) * 0.3,
          { max: 0.7, base: 0.34, vy: 1.3 + Math.random() * 0.7, tint: 0x8FCBE8, opacity: 0.55 });
      }
      st.pourPulse = 1;
    }
    if (s.pouring && s.tilt > 40 && st.fill > 0.02) {
      st._pourAcc += dt;
      while (st._pourAcc > 0.085) {
        st._pourAcc -= 0.085;
        var bp = KS.bucketPos(st.ropeLen, st.phiDeg);
        var t = st.tiltRad;
        var mx = bp.x, my = bp.y + 0.225 * Math.cos(t), mz = bp.z - 0.225 * Math.sin(t);
        MECH.Scene3D.spawnPuff(mx + (Math.random() - 0.5) * 0.10, my - 0.05, mz,
          { max: 0.5, base: 0.26, vy: -1.8, vz: -0.55, vx: (Math.random() - 0.5) * 0.15, tint: 0x8FCBE8, opacity: 0.6 });
        if (Math.random() < 0.5) {
          MECH.Scene3D.spawnPuff((Math.random() - 0.5) * 0.24, D.basinWater + 0.06, D.basinZ - 0.05 + (Math.random() - 0.5) * 0.2,
            { max: 0.55, base: 0.30, vy: 0.9, tint: 0x8FCBE8, opacity: 0.55 });
        }
        st.pourPulse = 1;
      }
    }
    if (st.fill > 0.5 && KS.bucketPos(st.ropeLen, st.phiDeg).y > D.kerbTop && (ph.id === "lower" || ph.id === "cycle")) {
      st._dripAcc += dt;
      if (st._dripAcc > 0.3) {
        st._dripAcc = 0;
        var jb = KS.bucketBottom(st.ropeLen, st.phiDeg);
        MECH.Scene3D.spawnPuff(jb.x, jb.y, jb.z,
          { max: 0.45, base: 0.20, vy: -1.4, tint: 0x8FCBE8, opacity: 0.55 });
      }
    }
    st._lastFill = st.fill;
    st.pourPulse = Math.max(0, st.pourPulse - dt * 0.7);

    /* 井内水面 / 盆水面微动 */
    var pw = MECH.Parts.entry("pool");
    if (pw && pw.shown && pw.group.userData.water) {
      pw.group.userData.water.position.y = D.waterY + 0.006 * Math.sin(st.time * 1.6);
    }
    var bw = MECH.Parts.entry("basin");
    if (bw && bw.shown && bw.group.userData.water) {
      bw.group.userData.water.position.y =
        D.basinWater + 0.008 * Math.sin(st.time * 3) + st.pourPulse * 0.02 * Math.sin(st.time * 11);
    }
  };

  /* 镜头调度:放桶没入后俯冲井口近观;循环段倾倒时移向瓦盆 */
  MECH.camAdj = function (st, ph, pt) {
    var dive = { phi: 0.72, r: 6.6, target: [0, 0.7, 2.8] };
    var basinCam = { phi: 0.95, r: 6.4, target: [0, 1.0, 1.7] };
    if (ph.id === "cycle") {
      var c = pt % SUB;
      if (c < 4.1 && st.ropeLen > 0.95) return dive;
      if (c >= 4.1 && c < 6.4) return basinCam;
      return null;
    }
    if (ph.id === "lower" && st.ropeLen > 0.95 && pt < 4.4) return dive;
    return null;
  };

  MECH.status = function (st, ph, pt) {
    var hot = ph.id === "lower" || ph.id === "cycle";
    var fstate = st.fill >= 0.98 ? " ·满" : (st.fill <= 0.02 ? " ·空" : "");
    return {
      mode: ph.mode,
      hot: hot,
      pill: ph.name + " · ψ " + st.psiDeg.toFixed(0) + "°",
      a: st.psiDeg.toFixed(0) + "°",
      b: st.ropeLen.toFixed(2) + " m",
      c: "桶 " + st.bucketMass.toFixed(1) + "kg" + fstate
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "axle") {
      return [
        { id: "p-ax", obj: E("axle"), text: "横轴 · 高 2.55m · 铜套轴承" },
        { id: "p-fr", obj: E("frameL"), text: "A 形立架 · 跨距 3.24m", tone: "white" }
      ];
    }
    if (ph.id === "drum") {
      return [{ id: "p-dr", obj: E("drum"), text: "卷筒 · 径 0.22m · 绳槽沿" }];
    }
    if (ph.id === "crank") {
      return [{ id: "p-ck", obj: E("crank"), text: "摇柄 · 柄臂 0.55m · 省力比 2.5", tone: "white" }];
    }
    if (ph.id === "rope") {
      return [
        { id: "p-rp", obj: E("rope"), text: "井绳 · 悬于筒底切点" },
        { id: "p-bk", obj: E("bucket"), text: "木桶 · 提梁 + 铁箍", tone: "white" }
      ];
    }
    if (ph.id === "lower") {
      return [
        { id: "p-bk2", obj: E("bucket"), text: "放桶入井 · 没入水面汲满", tone: "white" },
        { id: "p-ck2", obj: E("crank"), text: "倒转摇柄放绳 · 桶重拉柄下坠" }
      ];
    }
    if (ph.id === "cycle") {
      return [
        { id: "p-bs", obj: E("basin"), text: "瓦盆 · 倾倒注水" },
        { id: "p-bk3", obj: E("bucket"), text: "循环汲水 · 摇柄省力 2.5", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
