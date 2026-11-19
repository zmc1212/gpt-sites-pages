/* 诸葛连弩(元戎弩) — 尺寸常量与杠杆往复状态机
   文献依据:《三国志》注引《魏氏春秋》:「损益连弩,谓之元戎,以铁为矢,
   长八寸,一弩十矢俱发」;《武备志》卷一百零三有连弩图(杠杆往复装填击发)。
   一个杠杆循环 = 落矢(匣底箭入槽)→ 后拉(弦钩于牙)→ 前推(牙脱,弦弹回击发)。
   状态机逐帧断言:每循环恰射一矢、10 矢后空匣停射。 */
(function (MECH) {
  var CHI = 0.3;
  var D = {
    CHI: CHI,
    bedL: 1.10, bedH: 0.12,          // 弩床
    bowH: 0.62,                      // 弓臂半高
    leverA: 0.20,                    // 杠杆往复半行程
    stringRest: -0.10,               // 弦静止位(钩牙处,相对床中)
    stringPull: 0.30,                // 后拉量
    arrowL: 0.27,                    // 铁矢长(八寸)
    magN: 10,                        // 矢匣容量
    targetX: 8.0,                    // 靶距(演示)
    flyT: 0.32,                      // 矢飞行时间
    omega: 2.4,                      // 杠杆往复频率
    cycleT: 2.0                      // 一循环时长( scripted 段累加)
  };
  D.phases = [                       // 状态机:名称/时长/杠杆动作
    { id: "loading", t: 0.45, lever: -0.05 },   // 落矢(杆微前)
    { id: "cocking", t: 0.65, lever: -D.leverA },  // 后拉(弦钩牙)
    { id: "pushing", t: 0.55, lever: +D.leverA },  // 前推(牙脱击发)
    { id: "flying", t: 0.35, lever: +D.leverA * 0.6 }
  ];
  D.cycleT = D.phases.reduce(function (a, p) { return a + p.t; }, 0);

  function newState() {
    return {
      time: 0, tCycle: 0, cycleIdx: 0,
      lever: D.phases[0].lever, string: D.stringRest,
      arrows: D.magN,                   // 匣内余矢
      shotN: 0, shots: [],
      flight: null,                     // {t0, x0, y0}
      mode: "loading", modeT: 0,
      lastPhase: "", manual: false, _key: false
    };
  }

  /* 一步:状态机推进 + 杠杆/弦位置 */
  function step(st, dt) {
    st.time += dt;
    st.modeT += dt;
    var ph = D.phases[st.cycleIdx];
    if (st.modeT >= ph.t) {
      st.modeT = 0;
      st.cycleIdx = (st.cycleIdx + 1) % D.phases.length;
      ph = D.phases[st.cycleIdx];
      if (st.cycleIdx === 0) {          // 新循环开始:上一循环是否射出?
        /* 由 pushing 段末已处理 */
      }
    }
    st.mode = ph.id;
    /* 杠杆位置:段内平滑趋近目标 */
    var target = ph.lever;
    st.lever += (target - st.lever) * Math.min(1, dt * 9);
    /* 弦位置随状态机 */
    if (ph.id === "loading") st.string = D.stringRest;
    else if (ph.id === "cocking") st.string = D.stringRest + (st.modeT / ph.t) * D.stringPull;
    else if (ph.id === "pushing") {
      /* 弦被牙推至 x>+0.06 脱钩弹回 */
      var pushed = D.stringRest + D.stringPull - (st.modeT / ph.t) * (D.stringPull + 0.16);
      if (pushed < D.stringRest + 0.06) {
        /* 脱钩:击发! */
        st.string = D.stringRest - 0.16 * Math.exp(-st.modeT * 14) * Math.sin(st.modeT * 40);
        if (!st._shotThisCycle) {
          st._shotThisCycle = true;
          if (st.arrows > 0) {
            st.arrows -= 1;
            st.shotN += 1;
            st.flight = { t0: st.time, arrowN: st.shotN };
            st.shots.push({ t: st.time, n: st.shotN });
            if (st.shots.length > 8) st.shots.shift();
          }
        }
      } else {
        st.string = pushed;
      }
    } else { // flying
      st.string += (D.stringRest - st.string) * Math.min(1, dt * 8);
      if (st.modeT > ph.t * 0.5) st._shotThisCycle = false;
    }
    /* 飞行推进 */
    if (st.flight) {
      if (st.time - st.flight.t0 >= D.flyT) st.flight = null;
    }
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  /* 载入期自检:三循环恰射三矢;10 矢后空匣停射 */
  (function selfCheck() {
    var errs = [];
    var st = newState();
    for (var i = 0; i < 2600; i++) {
      step(st, 1 / 120);
      if (st.time > 7.2) break;          // ~3.5 循环
    }
    if (st.shotN !== 3) errs.push("循环击发数异常: " + st.shotN);
    /* 空匣:连跑 20 循环 */
    var st2 = newState();
    for (var j = 0; j < 20000 && st2.time < D.cycleT * 12; j++) step(st2, 1 / 120);
    if (st2.shotN !== D.magN) errs.push("矢匣计数异常: " + st2.shotN);
    var extra = st2.time > D.cycleT * 11.5;
    if (extra && st2.shotN > D.magN) errs.push("空匣仍射");
    if (errs.length) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR("连弩自检失败: " + errs.join(";"));
      throw new Error(errs.join(";"));
    }
  })();
})(window.MECH = window.MECH || {});
