/* 候风地动仪 — 尺寸常量与都柱倒立摆运动学
   文献依据:《后汉书·张衡传》「中有都柱,傍行八道,施关发机……龙口含铜丸,
   下有蟾蜍张口承之」;外形按王振铎复原,机构取冯锐 2005 倒立摆复原思路。
   摔向触发:摆幅达 6° 触发该方位龙钩 → 铜丸落入蟾蜍口;摆体阻尼回正。
   8 方位:k=0 北(−z),顺时针 45° 递增(1 东北 … 2 东(+x) … 4 南(+z))。 */
(function (MECH) {
  var CHI = 0.3;
  var D = {
    CHI: CHI,
    vatR: 0.72, vatH: 1.95,          // 樽体半径/高(半剖展示)
    baseR: 0.86, baseH: 0.18,
    pivotY: 1.15, pendL: 1.05,       // 都柱枢轴高/摆长
    trigDeg: 6,                      // 触发角
    riseT: 0.8,                      // 倾斜用时
    decayT: 1.2, oscT: 1.6,          // 回正阻尼
    ballR: 0.048,
    dragonY: 2.02, dragonR: 0.70,    // 龙首环高/半径
    toadR: 0.98, toadY: 0.42,        // 蟾蜍环距/口高
    flightT: 0.55,                   // 铜丸飞行时间
    noiseDeg: 0.5,
    dirs8: []
  };
  for (var i = 0; i < 8; i++) {
    var a = i * Math.PI / 4;         // 方位角(自北顺时针)
    D.dirs8.push({ k: i, name: ["北", "东北", "东", "东南", "南", "西南", "西", "西北"][i],
      ax: Math.sin(a), az: -Math.cos(a) });   // 世界向量:N=−z → (sin a, −cos a)
  }
  D.trigRad = D.trigDeg * Math.PI / 180;

  function newState() {
    return {
      time: 0, theta: 0, tiltAX: 0, tiltAZ: 0,   // 摆幅(rad)/倒向(世界向量)
      quake: null, fired: null,               // 地震事件/已触发方位
      flights: [],                            // 铜丸飞行 {dir,t0}
      caught: [0, 0, 0, 0, 0, 0, 0, 0],
      toadBounce: [0, 0, 0, 0, 0, 0, 0, 0],
      events: [],                             // {t,dir}
      selDir: 2, manual: false,
      _keyL: false, _keyR: false,
      lastPhase: "", tFall: 0
    };
  }

  /* 触发地震事件(dir = 方位 k) */
  function quake(st, dir) {
    if (st.quake && st.time - st.quake.t0 < 2.6) return;   // 摆未回正,忽略
    st.quake = { dir: dir, t0: st.time };
    st.fired = null;
  }

  function step(st, dt) {
    st.time += dt;
    var tilt = 0;
    if (st.quake) {
      var dt0 = st.time - st.quake.t0;
      st.tiltAX = D.dirs8[st.quake.dir].ax;
      st.tiltAZ = D.dirs8[st.quake.dir].az;
      if (dt0 < D.riseT) {
        tilt = D.trigRad * (dt0 / D.riseT);
      } else {
        /* 触发 + 阻尼回正 */
        if (!st.fired) {
          st.fired = st.quake.dir;
          st.flights.push({ dir: st.fired, t0: st.time });
          st.events.push({ t: st.time, dir: st.fired });
          if (st.events.length > 12) st.events.shift();
        }
        var td = dt0 - D.riseT;
        tilt = D.trigRad * Math.exp(-td / D.decayT) * Math.cos(TWO_PI(td) / D.oscT);
        if (td > 3.2) { st.quake = null; tilt = 0; }
      }
    } else {
      tilt = D.noiseDeg * Math.PI / 180 * Math.sin(st.time * 2.1) * 0.45;
      st.tiltAX = Math.sin(st.time * 0.15) * 0.8;
      st.tiltAZ = Math.cos(st.time * 0.13) * 0.8;
    }
    st.theta = tilt;
    /* 铜丸飞行推进 */
    for (var i = st.flights.length - 1; i >= 0; i--) {
      var f = st.flights[i];
      if (st.time - f.t0 >= D.flightT) {
        st.caught[f.dir] += 1;
        st.toadBounce[f.dir] = st.time;      // 蟾蜍接丸弹跳时刻
        st.flights.splice(i, 1);
      }
    }
  }
  function TWO_PI(x) { return Math.PI * 2 * x; }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step, quake: quake };

  /* 载入期自检:触发方位 = 落丸方位 严格一致;摆回正 < 3.2s;8 方位齐备 */
  (function selfCheck() {
    var errs = [];
    if (D.dirs8.length !== 8) errs.push("方位数错误");
    for (var k = 0; k < 8; k++) {
      var v = D.dirs8[k];
      if (Math.abs(Math.hypot(v.ax, v.az) - 1) > 1e-9) errs.push("方位向量非单位");
    }
    var st = newState();
    quake(st, 2);                              // 东
    for (var s = 0; s < 300; s++) step(st, 1 / 30);
    if (st.fired !== 2) errs.push("触发方位错误: " + st.fired);
    if (st.caught[2] !== 1) errs.push("铜丸未落: " + st.caught[2]);
    var others = 0;
    for (var k2 = 0; k2 < 8; k2++) if (k2 !== 2) others += st.caught[k2];
    if (others !== 0) errs.push("误触发其它方位");
    if (st.theta > D.trigRad * 0.2 && st.time > 4.2) errs.push("摆未回正");
    if (errs.length) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR("地动仪自检失败: " + errs.join(";"));
      throw new Error(errs.join(";"));
    }
  })();
})(window.MECH = window.MECH || {});
