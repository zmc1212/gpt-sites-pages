/* V8 核心机构:曲柄连杆运动学 / 凸轮-气门正时 / 点火火花 / 排气热浪
   曲拐角 Θ → 活塞位移 s = r·cosα + sqrt(L² − r²sin²α),α 为该缸曲拐相对本缸轴的夹角
   十字曲轴:左右列共享曲拐,相位差 90°;点火间隔 90°,顺序 1-8-4-3-6-5-7-2 */
(function (V8SB) {
  var D2R = Math.PI / 180;

  /* ---- 几何常量(1 单位 ≈ 100 mm) ---- */
  var CRANK_R = 0.44;      // 曲柄半径(行程 3.48 in)
  var ROD_L = 1.45;        // 连杆长 5.7 in
  var CRANK_Y = 1.55;      // 曲轴中心高度
  var MAX_LIFT = 0.115;    // 气门最大升程
  var X_OF = { 1: -1.7, 2: -1.7, 3: -0.565, 4: -0.565, 5: 0.565, 6: 0.565, 7: 1.7, 8: 1.7 };
  var THROW = { 1: -45, 2: -45, 3: 225, 4: 225, 5: 45, 6: 45, 7: 135, 8: 135 };  // 十字曲拐相位(度)
  var BANK_OF = { 1: "L", 2: "R", 3: "L", 4: "R", 5: "L", 6: "R", 7: "L", 8: "R" };
  var PSI_BANK = { L: -45, R: 45 };                    // 缸列轴线方向(度)
  var PSI_BANK_RAD = { L: -Math.PI / 4, R: Math.PI / 4 };
  var FIRE_ORDER = [1, 8, 4, 3, 6, 5, 7, 2];           // 点火顺序
  var FIRE_AT = { 1: 0, 8: 90, 4: 180, 3: 270, 6: 360, 5: 450, 7: 540, 2: 630 };

  /* ---- 运动学公式(供 parts/dashboard 复用) ---- */
  function cylAlpha(cyl, thetaDeg) {
    return THROW[cyl] - thetaDeg - PSI_BANK[BANK_OF[cyl]];
  }
  function pistonS(alphaDeg) {
    var a = alphaDeg * D2R;
    var q = ROD_L * ROD_L - CRANK_R * CRANK_R * Math.sin(a) * Math.sin(a);
    return CRANK_R * Math.cos(a) + Math.sqrt(Math.max(0.0001, q));
  }
  function rodTilt(alphaDeg) {
    var a = alphaDeg * D2R;
    var q = ROD_L * ROD_L - CRANK_R * CRANK_R * Math.sin(a) * Math.sin(a);
    return Math.atan2(-CRANK_R * Math.sin(a), Math.sqrt(Math.max(0.0001, q)));
  }
  function cyclePos(cyl, thetaDeg) {
    var c = (thetaDeg - FIRE_AT[cyl]) % 720;
    if (c < 0) c += 720;
    return c;
  }
  /* 气门升程:cos 凸台,真实 L48 凸轮卡:排气 132°–367°(峰 249.5°),
     进气 352°–581°(峰 466.5°),重叠角 ~15°(进气提前 8°BTDC 开、排气滞后 7°ATDC 关);
     凸轮轴半速于曲轴,按 720° 周期只开一次 */
  function bump(c, peak, half) {
    var d = Math.abs(c - peak);
    if (d > half) return 0;
    return MAX_LIFT * Math.cos(d / half * Math.PI / 2);
  }
  function liftIntake(c) {
    return bump(c, 466.5, 114.5);
  }
  function liftExhaust(c) {
    return bump(c, 249.5, 117.5);
  }

  /* ---- 运行时 ---- */
  var ref = {
    crank: null, pulley: null, fan: null,
    pistons: {}, rods: {},            // cyl -> group
    valves: [],                       // {group, spring, rocker, cyl, type, rockerSign}
    lobeMap: {},                      // "cyl:type" -> {sub, lambda}
    sparks: {},                       // cyl -> {mesh, tip}
    sparkLight: null,
    heat: []                          // {points, mat, origin, dir, ages, speeds, seeds}
  };
  var pistonOn = {}, valveOn = [];
  var theta = 0, rpm = 0, targetRpm = 0, ignitionOn = false;
  var prevC = {};
  var fireCb = null;
  var timeAcc = 0;

  function mod720(x) { var c = x % 720; return c < 0 ? c + 720 : c; }

  /* 每帧根据 Θ 摆好所有机构(只处理已装配的活塞/气门) */
  function positionAll() {
    var thRad = theta * D2R;
    if (ref.crank) ref.crank.rotation.x = -thRad;
    if (ref.pulley) ref.pulley.rotation.x = -thRad;
    if (ref.fan) ref.fan.rotation.x = -thRad;

    for (var c = 1; c <= 8; c++) {
      if (!pistonOn[c]) continue;
      var alpha = cylAlpha(c, theta);
      var s = pistonS(alpha);
      var x = X_OF[c];
      var p = ref.pistons[c];
      if (p) p.position.set(x, s, 0);
      var r = ref.rods[c];
      if (r) {
        /* 同轴颈左右列连杆沿曲柄销并置(L −0.08 / R +0.08,真实 bank stagger) */
        r.position.set(x + (BANK_OF[c] === "L" ? -0.08 : 0.08), s, 0);
        r.rotation.x = rodTilt(alpha);
      }
    }

    for (var v = 0; v < ref.valves.length; v++) {
      var vv = ref.valves[v];
      if (!valveOn[v]) continue;
      var cyc = cyclePos(vv.cyl, theta);
      var lift = vv.type === "in" ? liftIntake(cyc) : liftExhaust(cyc);
      var sc = Math.max(0.42, 1 - lift / 0.30);
      vv.group.position.y = 2.30 - lift;
      vv.spring.scale.y = sc;
      if (vv.retainer) vv.retainer.position.y = 0.275 + 0.30 * sc;   // 弹簧座随簧顶
      if (vv.rocker) {
        vv.rocker.position.y = 0.62 + lift;                          // 摇臂固定在缸盖上,不随气门组下移
        vv.rocker.rotation.x = vv.rockerSign * (lift / MAX_LIFT) * 0.42;
      }
      if (vv.lifter) vv.lifter.position.y = 1.92 + lift;             // 挺柱随凸轮基圆
      var lb = ref.lobeMap[vv.cyl + ":" + vv.type];
      if (lb) lb.sub.rotation.x = thRad / 2 + lb.lambda;
    }
  }

  /* 点火事件:火花塞闪 + 回调仪表 */
  function fireCyl(cyl, dt) {
    var sp = ref.sparks[cyl];
    if (sp && ignitionOn) {
      sp.mesh.material.emissiveIntensity = 4.2;
      sp.mesh.scale.setScalar(1.7);
      if (ref.sparkLight) {
        ref.sparkLight.position.copy(sp.tip);
        ref.sparkLight.intensity = 3.2;
      }
    }
    if (fireCb) fireCb(cyl);
  }

  function step(dt) {
    timeAcc += dt;
    /* 转速惯性:向目标转速收敛 */
    rpm += (targetRpm - rpm) * Math.min(1, dt * 2.8);
    if (targetRpm === 0 && rpm < 4) rpm = 0;

    /* 视觉减速:800rpm 观感 ≈ 720°/s(12°/帧@60fps),转速越高视觉加速越缓 */
    if (rpm > 0.5) {
      var vis = 720 * Math.sqrt(Math.max(0, rpm) / 800);
      if (vis > 2300) vis = 2300;
      if (rpm < 750) vis += Math.sin(timeAcc * 42) * (750 - rpm) * 0.16;  // 起动抖动
      theta += vis * dt;
    }

    /* 点火检测:某缸周期角回落即越过压缩上止点 */
    for (var c = 1; c <= 8; c++) {
      var cyc = cyclePos(c, theta);
      if (prevC[c] !== undefined && cyc < prevC[c]) fireCyl(c);
      prevC[c] = cyc;
    }

    /* 火花衰减 */
    for (var k = 1; k <= 8; k++) {
      var sp = ref.sparks[k];
      if (sp && sp.mesh.material.emissiveIntensity > 0.01) {
        sp.mesh.material.emissiveIntensity *= Math.exp(-dt * 9);
        sp.mesh.scale.multiplyScalar(Math.exp(-dt * 6));
      }
    }
    if (ref.sparkLight && ref.sparkLight.intensity > 0.01) {
      ref.sparkLight.intensity *= Math.exp(-dt * 11);
    }

    /* 排气热浪粒子 */
    var heatOn = rpm > 60;
    for (var h = 0; h < ref.heat.length; h++) {
      var sys = ref.heat[h];
      sys.mat.opacity += ((heatOn ? 0.3 : 0) - sys.mat.opacity) * Math.min(1, dt * 3);
      if (sys.mat.opacity < 0.01) continue;
      var posAttr = sys.points.geometry.attributes.position;
      for (var i = 0; i < sys.ages.length; i++) {
        sys.ages[i] += dt * sys.speeds[i];
        if (sys.ages[i] > 1.6) sys.ages[i] -= 1.6;
        var a = sys.ages[i];
        var wob = Math.sin(a * 9 + sys.seeds[i]) * 0.13 * a;
        var wob2 = Math.cos(a * 7 + sys.seeds[i] * 1.7) * 0.1 * a;
        posAttr.setXYZ(i,
          sys.origin.x + sys.dir.x * a * 1.5 + wob * sys.perp.x,
          sys.origin.y + sys.dir.y * a * 1.5 + wob2,
          sys.origin.z + sys.dir.z * a * 1.5 + wob * sys.perp.z);
      }
      posAttr.needsUpdate = true;
    }

    positionAll();
  }

  function makeHeat(scene, origin, dir) {
    var N = 30;
    var geo = new THREE.BufferGeometry();
    var arr = new Float32Array(N * 3);
    var ages = [], speeds = [], seeds = [];
    for (var i = 0; i < N; i++) {
      ages.push(Math.random() * 1.6);
      speeds.push(0.55 + Math.random() * 0.5);
      seeds.push(Math.random() * Math.PI * 2);
      arr[i * 3] = origin.x; arr[i * 3 + 1] = origin.y; arr[i * 3 + 2] = origin.z;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    var mat = new THREE.PointsMaterial({
      map: V8SB.Textures.glow(), color: 0xe8814a, size: 0.5,
      transparent: true, opacity: 0, depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    var pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    scene.add(pts);
    var perp = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
    ref.heat.push({ points: pts, mat: mat, origin: origin.clone(), dir: dir.clone().normalize(), ages: ages, speeds: speeds, seeds: seeds, perp: perp });
  }

  /* ---- 对外 API ---- */
  V8SB.Engine = {
    math: {
      CRANK_R: CRANK_R, ROD_L: ROD_L, CRANK_Y: CRANK_Y, MAX_LIFT: MAX_LIFT,
      X_OF: X_OF, THROW: THROW, BANK_OF: BANK_OF, PSI_BANK: PSI_BANK,
      PSI_BANK_RAD: PSI_BANK_RAD, FIRE_ORDER: FIRE_ORDER, FIRE_AT: FIRE_AT,
      cylAlpha: cylAlpha, pistonS: pistonS, rodTilt: rodTilt,
      cyclePos: cyclePos, liftIntake: liftIntake, liftExhaust: liftExhaust,
      D2R: D2R
    },
    register: function (r) {
      ref.crank = r.crank || ref.crank;
      ref.pulley = r.pulley || ref.pulley;
      ref.fan = r.fan || ref.fan;
      ref.pistons = r.pistons || ref.pistons;
      ref.rods = r.rods || ref.rods;
      ref.valves = r.valves || ref.valves;
      ref.lobeMap = {};
      (r.lobes || []).forEach(function (lb) {
        ref.lobeMap[lb.cyl + ":" + lb.type] = lb;
      });
      ref.sparks = r.sparks || ref.sparks;
      valveOn = [];
      for (var i = 0; i < ref.valves.length; i++) valveOn.push(false);
      for (var c = 1; c <= 8; c++) pistonOn[c] = false;
      if (r.sparkLight) { ref.sparkLight = r.sparkLight; }
      if (r.scene && r.heatOutlets) {
        for (var h = 0; h < r.heatOutlets.length; h++) {
          makeHeat(r.scene, r.heatOutlets[h].pos, r.heatOutlets[h].dir);
        }
      }
    },
    markPiston: function (cyl, on) { pistonOn[cyl] = on; },
    markValve: function (idx, on) { valveOn[idx] = on; },
    setTheta: function (deg) { theta = deg; positionAll(); },
    setTarget: function (r) { targetRpm = r; },
    setIgnition: function (on) { ignitionOn = on; },
    onFire: function (cb) { fireCb = cb; },
    step: step,
    reset: function () {
      theta = 0; rpm = 0; targetRpm = 0; ignitionOn = false;
      prevC = {}; timeAcc = 0;
      for (var c = 1; c <= 8; c++) pistonOn[c] = false;
      for (var i = 0; i < valveOn.length; i++) valveOn[i] = false;
      for (var k = 1; k <= 8; k++) {
        var sp = ref.sparks[k];
        if (sp) { sp.mesh.material.emissiveIntensity = 0; sp.mesh.scale.setScalar(0.001); }
      }
      if (ref.sparkLight) ref.sparkLight.intensity = 0;
      for (var h = 0; h < ref.heat.length; h++) ref.heat[h].mat.opacity = 0;
      positionAll();
    },
    get theta() { return theta; },
    get rpm() { return rpm; }
  };
})(window.V8SB = window.V8SB || {});
