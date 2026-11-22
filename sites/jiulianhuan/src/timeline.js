/* 时间线(53s 循环):案几钗环 → 九环全上 → 解环(状态机 341 步,高速+计数)
   → 全解完成 → 逆转复原(前段演示) → 规则讲解 → 手动步进(←/→) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "ground", name: "GROUND · 案几钗环", dur: 4, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.50, phi: 1.16, r: 1.9, target: [0.05, 0.7, 0] }, drift: 0.03 },
    { id: "rings", name: "RINGS · 九环全上", dur: 5, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.25, phi: 1.10, r: 1.3, target: [0.05, 0.72, 0] }, drift: 0.012 },
    { id: "solveA", name: "SOLVE · 解环(状态机·计数)", dur: 14, dot: "teal", mode: "SOLVING",
      cam: { theta: -0.35, phi: 1.10, r: 1.1, target: [0.05, 0.70, 0] }, drift: 0.008 },
    { id: "solveB", name: "SOLVE · 继解(格雷码路径)", dur: 14, dot: "teal", mode: "SOLVING",
      cam: { theta: 0.60, phi: 1.08, r: 1.0, target: [0.05, 0.68, 0] }, drift: 0.008 },
    { id: "done", name: "DONE · 全解(341 步)", dur: 4, dot: "green", mode: "SOLVED",
      cam: { theta: 0.55, phi: 1.10, r: 1.2, target: [0.05, 0.55, 0] }, drift: 0.008 },
    { id: "back", name: "BACK · 逆转复原(前段)", dur: 8, dot: "blue", mode: "RESTORING",
      cam: { theta: -0.40, phi: 1.10, r: 1.2, target: [0.05, 0.70, 0] }, drift: 0.010 },
    { id: "rule", name: "RULE · 规则(第 k 环可动条件)", dur: 5, dot: "pink", mode: "EXPLAINING",
      cam: { theta: 0.40, phi: 1.06, r: 0.85, target: [-0.1, 0.72, 0] }, drift: 0.006 },
    { id: "manual", name: "MANUAL · 手动步进(← 上环 / → 下环)", dur: 7, dot: "red", mode: "MANUAL",
      cam: { theta: -0.30, phi: 1.12, r: 1.3, target: [0.05, 0.70, 0] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["ground", "rings", "solveA", "solveB", "done", "back", "rule", "manual"];

  MECH.newState = KS.newState;
  var stepHold = 0;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      if (ph.id === "rings") { st.state = (1 << D.N) - 1; st.moveIdx = 0; st.mode = "auto"; }
      if (ph.id === "solveA") { st.state = (1 << D.N) - 1; st.moveIdx = 0; st.mode = "auto"; }
      if (ph.id === "solveB") { st.mode = "auto"; }
      if (ph.id === "done") { st.mode = "auto"; }
      if (ph.id === "back") { st.state = 0; st.moveIdx = 0; st.mode = "restore"; st._rseq = st.seq.slice().reverse(); st._rmv = 0; }
      if (ph.id === "rule") { st.mode = "manual"; st.state = (1 << 4) - 1; }
      if (ph.id === "manual") { st.mode = "manual"; }
    }
    st._dt2 = Math.min(0.5, dt * 3);
    if (ph.id === "back" && st.mode === "restore") {
      /* 逆转:按复原序列(解序列的逆步)走前段 */
      st.pendT += dt;
      var iv = 1 / D.moveRate;
      while (st.pendT >= iv && st._rmv < st._rseq.length) {
        st.pendT -= iv;
        var mv = st._rseq[st._rmv];
        st.state ^= (1 << mv);
        st._rmv++;
        st.moveIdx++;
        st.lastMv = mv;
        if (st._rmv >= 96) { st._rmv = st._rseq.length; }   // 演示前段后跳切复原
      }
      if (st._rmv >= st._rseq.length) st.state = (1 << D.N) - 1;
    } else if (st.mode === "manual") {
      /* 手动:← 上环 / → 下环(合法则走) */
      stepHold -= dt;
      var dir = null;
      if (MECH.keys && MECH.keys.left) dir = "up";
      if (MECH.keys && MECH.keys.right) dir = "down";
      if (dir && stepHold <= 0) {
        /* 找合法环:上环取最低可上;下环取最高可下 */
        var cand = -1;
        if (dir === "down") {
          for (var i2 = D.N - 1; i2 >= 0; i2--) if (KS.legal(st.state, i2)) { cand = i2; break; }
        } else {
          for (var i3 = 0; i3 < D.N; i3++) if (KS.legal(st.state, i3) && !((st.state >> i3) & 1)) { cand = i3; break; }
        }
        if (cand >= 0) { st.state ^= (1 << cand); st.lastMv = cand; st.moveIdx += (dir === "down" ? 1 : -1) > 0 ? 1 : 0; stepHold = 0.18; }
      }
    } else {
      KS.step(st, dt);
    }
  };

  MECH.onSeek = function (i, st) {
    if (i >= 2) { st.state = (1 << D.N) - 1; st.moveIdx = 0; st.mode = "auto"; }
    if (i === 4) { st.state = 0; st.moveIdx = 341; st.mode = "auto"; }
    if (i === 5) { st.state = 0; st.moveIdx = 0; st.mode = "restore"; st._rseq = st.seq.slice().reverse(); st._rmv = 0; }
    if (i >= 6) { st.mode = "manual"; st.state = (1 << 4) - 1; }
    st._int = st.moveIdx;
  };

  MECH.status = function (st, ph, pt) {
    var bits = "";
    for (var i = D.N - 1; i >= 0; i--) bits += ((st.state >> i) & 1) ? "1" : "0";
    var pill = ph.name;
    if (st.mode !== "manual") pill = ph.name + " · 步 " + st.moveIdx + "/341";
    return {
      mode: ph.mode,
      hot: ph.id === "manual",
      pill: pill,
      a: "状态 " + bits + "(1=在框)",
      b: "在框 " + (st.state.toString(2).split("1").length - 1) + " 环 · 步 " + st.moveIdx,
      c: "f(9)=⌊2¹⁰/3⌋=341 ✓"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "ground" || ph.id === "rings") {
      return [
        { id: "p-chai", obj: E("chai"), text: "钗(柄环+框梁+底板)· 「玉连环」渊源" }
      ];
    }
    if (ph.id === "solveA" || ph.id === "solveB") {
      return [
        { id: "p-chai", obj: E("chai"), text: "第1环随时动 · 第k环须k−1在框且更前全下" },
        { id: "p-r0", obj: E("ring0"), text: "f(9) = 341 步 = ⌊2¹⁰/3⌋(Gros 1872)", tone: "white" }
      ];
    }
    if (ph.id === "done") {
      return [
        { id: "p-chai", obj: E("chai"), text: "全下 ✓ 341 步(格雷码路径遍历)" }
      ];
    }
    if (ph.id === "back") {
      return [
        { id: "p-chai", obj: E("chai"), text: "逆转复原:同路径逆走(格雷码回卷)", tone: "white" }
      ];
    }
    if (ph.id === "rule" || ph.id === "manual") {
      return [
        { id: "p-chai", obj: E("chai"), text: "规则:第k环可动 ⇔ k−1 在框 ∧ 更前全下" },
        { id: "p-r0", obj: E("ring0"), text: "「以人寻字则难」→ 状态机唯一路径", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
