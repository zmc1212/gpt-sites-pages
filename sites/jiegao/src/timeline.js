/* 时间线(44.3s 自动循环):前 5 段装配、后 3 段运转。
   θ(杠杆角)轨迹为 (阶段 id, 阶段内时间 pt) 的确定函数 —— seek 无需补偿;
   循环段(阶段 8)内部再循环 2 个 8.4s 子循环:摆出倾倒→回位→下压→汲满→提罐。
   阶段衔接角连续:18°→−12°→−24°→+13.5°→−24°→(子循环)−24°… */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  var SUB = 8.4;   // 循环段子循环时长(2 遍 = 16.8s)

  MECH.PHASES = [
    { id: "well", name: "WELL · 井台井池", dur: 3.8, dot: "yellow", mode: "ASSEMBLY",
      cam: { theta: 0.55, phi: 1.15, r: 10.5, target: [2.8, 0.7, 0] }, drift: 0.03 },
    { id: "post", name: "POST · 立柱枢轴", dur: 3.5, dot: "teal", mode: "ASSEMBLY",
      cam: { theta: 0.35, phi: 1.18, r: 8.2, target: [0.2, 1.9, 0] }, drift: 0.02 },
    { id: "lever", name: "BEAM · 横杆上轴", dur: 3.5, dot: "orange", mode: "ASSEMBLY",
      cam: { theta: 0.90, phi: 1.12, r: 8.8, target: [1.2, 2.6, 0] }, drift: 0.015 },
    { id: "stone", name: "STONE · 坠石配重", dur: 3.5, dot: "pink", mode: "ASSEMBLY",
      cam: { theta: -0.60, phi: 1.15, r: 8.0, target: [-0.8, 2.6, 0] }, drift: 0.015 },
    { id: "bucket", name: "JUG · 水罐吊绳", dur: 3.5, dot: "blue", mode: "ASSEMBLY",
      cam: { theta: 0.25, phi: 1.10, r: 8.6, target: [2.6, 2.4, 0] }, drift: 0.015 },
    { id: "press", name: "PRESS · 人力下压汲水", dur: 5.2, dot: "green", mode: "PRESS",
      cam: { theta: 0.75, phi: 1.14, r: 11.0, target: [2.4, 1.2, 0] }, drift: 0.012 },
    { id: "lift", name: "LIFT · 坠石提罐出水", dur: 4.5, dot: "red", mode: "LIFT",
      cam: { theta: -0.35, phi: 1.08, r: 10.8, target: [2.2, 2.0, 0] }, drift: 0.012 },
    { id: "cycle", name: "CYCLE · 循环汲水", dur: 16.8, dot: "yellow", mode: "CYCLE",
      cam: { theta: 0.55, phi: 1.08, r: 12.6, target: [2.4, 1.6, 0] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["well", "post", "lever", "stone", "bucket", "press", "lift", "cycle"];

  MECH.newState = function () {
    return {
      time: 0, thetaDeg: 0, thetaRad: 0, phiDeg: 0, phiRad: 0, tiltDeg: 0, tiltRad: 0,
      fill: 0, jugMass: D.mJugE, tJug: D.TEmpty, net: D.TStone - D.TEmpty,
      tipL: { x: D.Ll, y: D.pivotY }, jugC: { x: D.Ll, y: D.pivotY - D.ropeJug },
      errDeg: 0, seated: 0, phaseId: "", pourPulse: 0,
      _lastFill: 0, _pourAcc: 0, _dripAcc: 0
    };
  };

  /* —— θ / φ / tilt / fill 脚本(纯函数) —— */
  function scriptPhase(ph, pt) {
    var th, phi = 0, tilt = 0, fill = 0, pressing = false, pouring = false;
    if (ph.id === "well" || ph.id === "post") {
      th = 0;
    } else if (ph.id === "lever") {
      /* 横木搭上枢轴:短暂摆动后停在摩擦平衡角 +18° */
      var t1 = pt - 1.6;
      th = t1 <= 0 ? 0 : D.thetaLever0 * (1 - Math.exp(-1.9 * t1) * Math.cos(4.6 * t1));
    } else if (ph.id === "stone") {
      /* 系坠石:失衡摆向新平衡角 −12°(坠石端下沉、长端抬头) */
      var t2 = pt - 2.0;
      th = t2 <= 0 ? D.thetaLever0
        : D.thetaStone0 + (D.thetaLever0 - D.thetaStone0) * Math.exp(-1.5 * t2) * Math.cos(4.2 * t2);
    } else if (ph.id === "bucket") {
      /* 系空罐:坠石仍胜 → 抬头到高位态 −24° */
      var t3 = pt - 2.0;
      th = t3 <= 0 ? D.thetaStone0
        : D.thetaHigh + (D.thetaStone0 - D.thetaHigh) * Math.exp(-1.6 * t3) * Math.cos(4.0 * t3);
    } else if (ph.id === "press") {
      /* 人力下压:θ −24° → +13.5°,罐沿长绳大幅下探,入水后开始汲满 */
      var u = KS.clamp((pt - 0.4) / 4.0, 0, 1);
      th = D.thetaHigh + (D.thetaPress - D.thetaHigh) * KS.ease(u);
      pressing = pt > 0.4 && pt < 4.4;
      fill = KS.clamp((th - 10.2) / 3.3, 0, 1);
    } else if (ph.id === "lift") {
      /* 配重提升:满罐,坠石沿弧线拉起 θ +13.5° → −24° */
      var v = KS.clamp((pt - 0.4) / 3.6, 0, 1);
      th = D.thetaPress + (D.thetaHigh - D.thetaPress) * KS.ease(v);
      fill = 1;
    } else if (ph.id === "cycle") {
      var c = pt % SUB;
      if (c < 1.3) {                      // 摆出:长端微降、绳摆向水槽
        var a = KS.ease(c / 1.3);
        th = D.thetaHigh + (D.thetaPour - D.thetaHigh) * a;
        phi = D.phiPour * a;
        fill = 1;
      } else if (c < 2.5) {               // 倾倒:罐前倾,水入槽
        th = D.thetaPour; phi = D.phiPour;
        tilt = D.tiltPour * (1 - Math.pow(1 - KS.clamp((c - 1.3) / 0.35, 0, 1), 2));
        fill = 1 - KS.clamp((c - 1.45) / 0.55, 0, 1);
        pouring = true;
      } else if (c < 3.9) {               // 回位:收绳摆回井口上方,抬头
        var q = c - 2.5;
        tilt = D.tiltPour * Math.max(0, 1 - q / 0.25);
        if (q < 0.25) { th = D.thetaPour; phi = D.phiPour; }
        else if (q < 0.95) {
          var b = (q - 0.25) / 0.7;
          th = D.thetaPour - (D.thetaPour - D.thetaHigh - 10) * Math.pow(b, 1.6);
          phi = D.phiPour * Math.pow(1 - b, 1.8);
        } else {
          var w2 = (q - 0.95) / 0.45;
          th = (D.thetaPour - 24) - 10 * w2;   // −14° → −24° 收尾
          phi = 0;
        }
        fill = 0;
      } else if (c < 6.1) {               // 下压:θ −24° → +13.5°
        var p2 = KS.ease((c - 3.9) / 2.2);
        th = D.thetaHigh + (D.thetaPress - D.thetaHigh) * p2;
        pressing = true;
        fill = KS.clamp((th - 10.2) / 3.3, 0, 1);
      } else if (c < 6.7) {               // 汲满:井中注水
        th = D.thetaPress; fill = 1;
      } else {                            // 提罐:坠石拉起
        var lv = KS.ease((c - 6.7) / 1.7);
        th = D.thetaPress + (D.thetaHigh - D.thetaPress) * lv;
        fill = 1;
      }
    }
    return { th: th, phi: phi, tilt: tilt, fill: fill, pressing: pressing, pouring: pouring };
  }

  MECH.tick = function (st, ph, pt, dt) {
    st.time += dt;
    var s = scriptPhase(ph, pt);
    st.thetaDeg = s.th; st.thetaRad = KS.rad(s.th);
    st.phiDeg = s.phi; st.phiRad = KS.rad(s.phi);
    st.tiltDeg = s.tilt; st.tiltRad = KS.rad(s.tilt);
    st.fill = s.fill;
    st.jugMass = D.mJugE + (D.mJugF - D.mJugE) * st.fill;
    st.tJug = st.jugMass * D.Ll;
    st.net = D.TStone - st.tJug;
    st.tipL = KS.tipLong(st.thetaDeg);
    st.jugC = KS.jugPos(st.thetaDeg, st.phiDeg);
    st.pouring = s.pouring;
    st.pressing = s.pressing;
    st.phaseId = ph.id;

    /* 水花 / 倾倒水流 / 提罐滴水的粒子事件 */
    if (st.fill > 0.04 && st._lastFill <= 0.02) {   // 入水汲满瞬间
      var jt = KS.jugTop(st.thetaDeg, st.phiDeg);
      for (var i = 0; i < 6; i++) {
        MECH.Scene3D.spawnPuff(jt.x + (Math.random() - 0.5) * 0.25, D.waterY + 0.10, (Math.random() - 0.5) * 0.3,
          { max: 0.7, base: 0.34, vy: 1.3 + Math.random() * 0.7, tint: 0x8FCBE8, opacity: 0.55 });
      }
      st.pourPulse = 1;
    }
    if (s.pouring && s.tilt > 40 && st.fill > 0.02) {
      st._pourAcc += dt;
      while (st._pourAcc > 0.085) {
        st._pourAcc -= 0.085;
        var mouthX = st.jugC.x + 0.23 * Math.sin(st.tiltRad);
        var mouthY = st.jugC.y + 0.23 * Math.cos(st.tiltRad);
        MECH.Scene3D.spawnPuff(mouthX + 0.05, mouthY - 0.05, (Math.random() - 0.5) * 0.12,
          { max: 0.5, base: 0.26, vy: -2.4, vx: 0.25, vz: (Math.random() - 0.5) * 0.2, tint: 0x8FCBE8, opacity: 0.6 });
        if (Math.random() < 0.5) {
          MECH.Scene3D.spawnPuff(D.trCx - 0.12 + (Math.random() - 0.5) * 0.3, D.trWater + 0.06, (Math.random() - 0.5) * 0.24,
            { max: 0.55, base: 0.30, vy: 0.9, tint: 0x8FCBE8, opacity: 0.55 });
        }
        st.pourPulse = 1;
      }
    }
    if (st.fill > 0.5 && st.jugC.y > D.kerbTop && (ph.id === "lift" || ph.id === "cycle")) {
      st._dripAcc += dt;
      if (st._dripAcc > 0.3) {
        st._dripAcc = 0;
        var jb = KS.jugBottom(st.thetaDeg, st.phiDeg);
        MECH.Scene3D.spawnPuff(jb.x, jb.y, (Math.random() - 0.5) * 0.15,
          { max: 0.45, base: 0.20, vy: -1.4, tint: 0x8FCBE8, opacity: 0.55 });
      }
    }
    st._lastFill = st.fill;
    st.pourPulse = Math.max(0, st.pourPulse - dt * 0.7);

    /* 人力下压指示箭头 */
    var arrow = MECH.Parts.ref("pressArrow");
    if (arrow) {
      arrow.visible = !!s.pressing;
      if (s.pressing) {
        arrow.position.set(st.tipL.x + 0.06, st.tipL.y + 1.02, 0);
      }
    }

    /* 井内水面 / 水槽水面微动 */
    var sw = MECH.Parts.entry("shaft");
    if (sw && sw.shown && sw.group.userData.water) {
      sw.group.userData.water.position.y = D.waterY + 0.006 * Math.sin(st.time * 1.6);
    }
    var tw = MECH.Parts.entry("trough");
    if (tw && tw.shown && tw.group.userData.water) {
      tw.group.userData.water.position.y =
        0.245 + 0.008 * Math.sin(st.time * 3) + st.pourPulse * 0.02 * Math.sin(st.time * 11);
    }
  };

  /* 镜头调度:循环段倾倒时轻移向水槽;下压罐入井口(θ>0)俯冲井栏近观汲水,
     提罐段拉回 */
  MECH.camAdj = function (st, ph, pt) {
    var dive = { phi: 0.72, r: 6.8, target: [3.3, 0.7, 0] };
    if (ph.id === "cycle") {
      var c = pt % SUB;
      if (c < 3.9) return { target: [3.7, 1.5, 0], r: 12.0 };
      if (c >= 3.9 && c < 6.7 && st.thetaDeg > 0) return dive;
      return null;
    }
    if (ph.id === "press" && pt > 0.4 && st.thetaDeg > 0) return dive;
    return null;
  };

  MECH.status = function (st, ph, pt) {
    var hot = ph.id === "press" || ph.id === "lift" || ph.id === "cycle";
    var fstate = st.fill >= 0.98 ? " ·满" : (st.fill <= 0.02 ? " ·空" : "");
    return {
      mode: ph.mode,
      hot: hot,
      pill: ph.name + " · θ " + st.thetaDeg.toFixed(1) + "°",
      a: st.thetaDeg.toFixed(1) + "°",
      b: D.eqLift.toFixed(1) + " ↔ " + D.mJugE.toFixed(0) + "/" + D.mJugF.toFixed(0) + " kg",
      c: "罐 " + st.jugMass.toFixed(1) + "kg" + fstate
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "lever") {
      return [
        { id: "p-lever", obj: E("lever"), text: "横木 6m · 支点偏置 1.875/4.125" },
        { id: "p-pivot", obj: E("pivot"), text: "枢轴 · 柱顶横轴", tone: "white" }
      ];
    }
    if (ph.id === "stone") {
      return [
        { id: "p-rs", obj: E("ropeStone"), text: "坠石绳 · 短端" },
        { id: "p-st", obj: E("stone"), text: "坠石 40kg · T石 75.0 kg·m" }
      ];
    }
    if (ph.id === "bucket") {
      return [
        { id: "p-rj", obj: E("ropeJug"), text: "吊绳 2.2m · 长端" },
        { id: "p-jug", obj: E("jug"), text: "柳条罐 · 空2kg / 满12kg", tone: "white" }
      ];
    }
    if (ph.id === "press") {
      return [
        { id: "p-jug2", obj: E("jug"), text: "人力下压 · 罐沉入井", tone: "white" },
        { id: "p-st2", obj: E("stone"), text: "坠石端上翘" }
      ];
    }
    if (ph.id === "lift") {
      return [
        { id: "p-jug3", obj: E("jug"), text: "坠石提罐 · T石 75.0 > T满 49.5", tone: "white" },
        { id: "p-st3", obj: E("stone"), text: "坠石下沉" }
      ];
    }
    if (ph.id === "cycle") {
      return [
        { id: "p-tr", obj: E("trough"), text: "水槽 · 倾倒注水" },
        { id: "p-jug4", obj: E("jug"), text: "循环汲水 · 挈水若抽", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
