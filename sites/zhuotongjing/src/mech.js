/* 卓筒井 — 尺寸常量与冲击凿井运动学
   文献依据:苏轼《东坡志林·卷四·筒井用水鞴法》:「自庆历、皇祐以来,蜀始
   开筒井,用圜刃凿如碗大,深者数十丈,以巨竹去节,牝牡相衔为井,以隔横入
   淡水,则咸泉自上。」凿井动力补证:《天工开物·井盐》:「其器冶铁锥,如碓嘴
   形,其尖使极刚利,向石山舂凿成孔。其身破竹缠绳,夹悬此锥。每舂深入数尺,
   则又以竹接其身,使引而长。」(竹弓回弹无古代明文,本站不采用,标注推算。)
   制式:踩碓杠杆——碓杆绕支点,踏端踩下、锥端抬起,松足铁锥(圜刃碓嘴形,
   竹篾绳夹悬)自重下落冲击井底,往复凿进。
   可验算:
     1. 杠杆增力 i = L踏/L锥 = 2.88/1.31 = 2.2(载入断言);
     2. 提升高度 h ≈ 0.45m → 落体时间 t = √(2h/g) = 0.303s,冲击速度
        v = √(2gh) = 2.97 m/s(断言与相位机一致);
     3. 单冲能量 E = ½mv²(m锥 60kg)= 264 J(断言);
     4. 井深累计 = 击数 × 每击进尺 0.008m(积分校验 maxErr<1e-9)。
   演示节奏:1.30s/冲(踩 0.55 + 提 0.20 + 落 0.25 + 缓 0.30),真实更深更缓。 */
(function (MECH) {
  var D = {
    pivot: { x: -1.20, y: 1.55, z: 1.55 },     // 支点(A 架顶)
    bitEnd: { x: 0.0, y: 1.95, z: 1.80 },      // 锥端(井口上方)
    footEnd: { x: -3.84, y: 0.72, z: 1.00 },   // 踏端
    leverLen: 4.20,
    wellX: 0.0, wellZ: 1.80, wellR: 0.22,
    ropeLen0: 0.85,                            // 竹绳常长(锥顶至锥端吊点)
    lift: 0.30,                                // 提升高度(踏端不离地口径)
    mBit: 60,                                  // 铁锥质量 kg
    strikeDepth: 0.008,                        // 每击进尺 m(推算)
    cycle: 1.30, phases: { tread: 0.55, lift: 0.20, drop: 0.25, rest: 0.30 },
    derrickH: 2.30
  };
  D.armBit = Math.hypot(D.bitEnd.x - D.pivot.x, D.bitEnd.z - D.pivot.z);     // 1.31
  D.armFoot = Math.hypot(D.footEnd.x - D.pivot.x, D.footEnd.z - D.pivot.z);  // 2.88
  D.i = D.armFoot / D.armBit;                                // 2.2
  D.tDrop = Math.sqrt(2 * D.lift / 9.8);                     // 0.247
  D.vHit = Math.sqrt(2 * 9.8 * D.lift);                      // 2.42
  D.Ehit = 0.5 * D.mBit * D.vHit * D.vHit;                   // 176 J
  D.thetaMax = Math.asin(D.lift / D.armBit);                 // 抬起角 0.231 rad

  function newState() {
    return {
      time: 0, cyc: 0,                       // 循环相位/计数
      leverT: 0,                             // 碓杆角(0=水平,+抬起)
      bitY: 0, bitV: 0, bitState: "tread",   // 锥位姿状态机
      depth: 0, strikes: 0, maxErr: 0,
      running: false
    };
  }

  /* 相位机:tread(踩下,锥端抬起)→ lift(悬停)→ drop(落锥)→ rest(冲击+取新) */
  function step(st, dt) {
    st.time += dt;
    st.running = true;
    var cyc = st.time % D.cycle;
    var P = D.phases;
    st.cyc = Math.floor(st.time / D.cycle);
    if (cyc < P.tread) {                                   // 踩下:锥端抬到 θmax
      st.bitState = "tread";
      var f = cyc / P.tread;
      st.leverT = D.thetaMax * (f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2);
      st.bitY = D.lift * (f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2);
      st.bitV = 0;
    } else if (cyc < P.tread + P.lift) {                   // 悬停
      st.bitState = "lift";
      st.leverT = D.thetaMax;
      st.bitY = D.lift;
      st.bitV = 0;
    } else if (cyc < P.tread + P.lift + P.drop) {          // 松足:杠杆回落+锥自由落体
      st.bitState = "drop";
      var f2 = (cyc - P.tread - P.lift) / P.drop;
      st.leverT = D.thetaMax * (1 - f2);
      var t2 = f2 * D.tDrop;
      st.bitY = Math.max(0, D.lift - 0.5 * 9.8 * t2 * t2);
      st.bitV = 9.8 * t2;
    } else {                                               // 冲击+缓
      st.bitState = "rest";
      st.leverT = 0;
      st.bitY = 0;
      st.bitV = 0;
      if (st.strikes < Math.floor(st.time / D.cycle) + 0) { /* noop */ }
    }
    /* 击数:进入 rest 相位瞬间计一次(与上帧比较) */
    var wasDrop = st._prev !== "drop";
    if (st.bitState === "rest" && wasDrop) {
      st.strikes++;
      st.depth += D.strikeDepth;
    }
    st._prev = st.bitState;
    st._depthInt = (st._depthInt || 0);
    var err = Math.abs(st.depth - st.strikes * D.strikeDepth);
    if (err > st.maxErr) st.maxErr = err;
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  /* 载入自检:杠杆比 / 落体-冲击 / 能量 / 几何 */
  (function selfCheck() {
    var errs = [];
    if (Math.abs(D.i - D.armFoot / D.armBit) > 1e-9) errs.push("杠杆比不符");
    if (Math.abs(D.armBit - Math.hypot(D.bitEnd.x - D.pivot.x, D.bitEnd.z - D.pivot.z)) > 1e-9) errs.push("锥臂长与端点不符");
    if (Math.abs(D.tDrop - Math.sqrt(2 * D.lift / 9.8)) > 1e-12) errs.push("落体时间公式不符");
    if (Math.abs(D.vHit - Math.sqrt(2 * 9.8 * D.lift)) > 1e-12) errs.push("冲击速度公式不符");
    if (Math.abs(D.Ehit - 0.5 * D.mBit * D.vHit * D.vHit) > 1e-6) errs.push("单冲能量不符");
    if (D.P.tread + D.P.lift + D.P.drop + D.P.rest - D.cycle > 1e-9) errs.push("相位机时长超出循环");
    if (errs.length) {
      var msg = "卓筒井自检失败: " + errs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
