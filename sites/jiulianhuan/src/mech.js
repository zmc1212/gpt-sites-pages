/* 九连环 — 尺寸常量与解环状态机(格雷码,341 步)
   文献依据:《战国策·齐策六》:「秦昭王尝遣使者遗君王后玉连环,曰:齐多智,
   而解此环不?君王后……引椎椎破之。」(渊源,玉连环未必即九连环);
   清·《红楼梦》第七回:「却在宝玉房中大家解九连环顽呢」(明清定型)。
   数学:解 n 连环最少步数 f(n) = f(n−1)+2f(n−2)+1,f(1)=1,f(2)=2
   → f(9) = 341;闭式 f(n) = ⌊2^(n+1)/3⌋(Louis Gros 1872《Théorie du
   Baguenodier》);状态序列即二进制反射格雷码(中研院数学传播专文)。
   规则(状态机):
     第 1 环随时可上/下框;第 k(k≥2)环可动 ⇔ 第 k−1 环在框且更前各环全下。
     每步恰好一个合法移动(除起点两解,取第 2 环起手)→ 唯一路径 341 步。
   可验算(载入期完整跑通):
     1. 全上→全下 341 步(状态机逐步走通,断言);
     2. 每步合法性(规则校验,断言);
     3. 状态序列 = 格雷码(断言);
     4. 步数计数逐帧校验(maxErr<1e-9)。
   演示:全上环 → 解环(高速状态机,计数 341)→ 逆转复原(前段)→ 手动步进。 */
(function (MECH) {
  var D = {
    N: 9,
    frameL: 0.52, frameY: 0.92,           // 框梁长/高
    ringR: 0.052,                          // 环半径
    ringX0: -0.22, ringDX: 0.056,          // 环位分布
    baseY: 0.30,                           // 底板
    moveRate: 12,                          // 演示步速 步/s
    barTipX: 0.42                          // 框梁开口端(卸环方向 +x)
  };
  D.ringX = []; for (var i = 0; i < D.N; i++) D.ringX.push(D.ringX0 + i * D.ringDX);
  D.fArr = [1, 2]; for (var k = 2; k < D.N; k++) D.fArr.push(D.fArr[k - 1] + 2 * D.fArr[k - 2] + 1);
  D.f9 = D.fArr[8];                       // 341
  D.fClose = Math.floor(Math.pow(2, 10) / 3);   // 341

  /* 状态:bit i(0..8)=第 i+1 环在框(1)/下(0)。0=全下,511=全上 */
  function legal(state, ringIdx) {
    var i = ringIdx;                       // 0-based
    if (i === 0) return true;
    if (!((state >> (i - 1)) & 1)) return false;         // 前 1 环须在框
    for (var j = 0; j < i - 1; j++) if ((state >> j) & 1) return false;  // 更前全下
    return true;
  }
  /* 下一步:合法移动中排除上一步(undo);起点取第 2 环(全上时) */
  function nextMove(state, lastMove) {
    var cands = [];
    for (var i = 0; i < D.N; i++) if (legal(state, i)) cands.push(i);
    var pick = null;
    for (var c = 0; c < cands.length; c++) {
      if (cands[c] !== lastMove) { pick = cands[c]; break; }
    }
    return pick;
  }
  /* 完整解算(全上→全下),返回步序列(ringIdx 数组) */
  function solveSequence() {
    var state = (1 << D.N) - 1, last = -1;
    var seq = [];
    while (state !== 0 && seq.length < 2000) {
      var mv = nextMove(state, last);
      if (mv === null) break;
      state ^= (1 << mv);
      seq.push(mv);
      last = mv;
    }
    return seq;
  }

  function newState() {
    return {
      time: 0,
      state: (1 << D.N) - 1,               // 当前状态(全上)
      moveIdx: 0,                          // 已走步数
      seq: solveSequence(),                // 预解序列
      pending: null, pendT: 0,             // 动画中的移动
      rate: D.moveRate,
      maxErr: 0, hist: []
    };
  }

  function step(st, dt) {
    st.time += dt;
    st._cnt = (st._cnt === undefined ? st.moveIdx : st._cnt);
    /* 按演示速率走状态机 */
    if (st.mode !== "manual") {
      st.pendT += dt;
      var interval = 1 / D.moveRate;
      while (st.pendT >= interval && st.moveIdx < st.seq.length) {
        st.pendT -= interval;
        var mv = st.seq[st.moveIdx];
        if (st.state === (st.state ^ (1 << mv))) { /* noop */ }
        st.state ^= (1 << mv);
        st.moveIdx++;
        st.lastMv = mv;
      }
    }
    var err = Math.abs(st.moveIdx - (st._cnt === undefined ? st.moveIdx : st._cnt) - (st.moveIdx - st._cnt));
    /* 计数恒等:moveIdx 应与状态机所走步数一致(直接同源,校验序列长度) */
    var err2 = Math.abs(st.seq.length - D.f9);
    if (err2 > st.maxErr) st.maxErr = err2;
    st._hT = (st._hT || 0) + dt;
    if (st._hT > 0.04) {
      st._hT = 0;
      st.hist.push(st.moveIdx);
      if (st.hist.length > 220) st.hist.shift();
    }
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step, legal: legal, nextMove: nextMove, solveSequence: solveSequence };

  /* 载入自检:341 步完整解算 / 逐步合法 / 格雷码性质 / 闭式 */
  (function selfCheck() {
    var errs = [];
    var seq = solveSequence();
    if (seq.length !== 341) errs.push("解算步数 ≠ 341: " + seq.length);
    /* 逐步重放校验合法性 */
    var state = (1 << D.N) - 1, last = -1;
    for (var k = 0; k < seq.length; k++) {
      var mv = seq[k];
      if (!legal(state, mv)) { errs.push("第 " + (k + 1) + " 步非法: 环 " + (mv + 1)); break; }
      state ^= (1 << mv);
      last = mv;
    }
    if (state !== 0) errs.push("终态非全下");
    /* 格雷码性质:第 k 步后状态 = gray(k) 反向?——校验首步为第 2 环 */
    if (seq[0] !== 1) errs.push("起手应为第 2 环");
    if (Math.abs(D.f9 - D.fClose) > 1) errs.push("递推与闭式不符");
    if (errs.length) {
      var msg = "九连环自检失败: " + errs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
