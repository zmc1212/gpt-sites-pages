/* 算盘 — 位值状态机与口诀步骤表
   文献依据:明·程大位《算法统宗》(1592,盘式 2:5 珠、十三档);
   加法口诀与进位规则为珠算通行口诀(一上一下…九上九、去 X 进一)。
   可验算核心:珠态 → 数值 state machine,全步骤数值断言:
     置 1234 → 加 5678 → 6912(逐位口诀);999 + 1 → 1000(连环进位)。
   档位:13 档,rod i(0=最左)位值 10^(12-i),个位 = rod 12。
   珠态:up[i] = 下珠靠梁数(0-5),down[i] = 上珠靠梁数(0-2),
   数值 = Σ (down[i]×5 + up[i]) × 10^(12-i)。 */
(function (MECH) {
  var RODS = 13;
  var BEAT = 1.0;                    // 步骤节拍单位(时间线换算)

  /* —— 珠态 → 数值 —— */
  function value(up, down) {
    var v = 0;
    for (var i = 0; i < RODS; i++) {
      v += (down[i] * 5 + up[i]) * Math.pow(10, RODS - 1 - i);
    }
    return v;
  }
  function zeroState() {
    return { up: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], down: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
  }
  function cloneState(s) { return { up: s.up.slice(), down: s.down.slice() }; }

  /* —— 口诀步骤(type:rod,deltaUp,deltaDown,carry,口诀)—— */
  /* 应用一步:改珠态,进位立即落到左档(作为下一步骤呈现) */
  function applyMove(st, mv) {
    st.up[mv.rod] += mv.dUp;
    st.down[mv.rod] += mv.dDown;
    if (mv.carry) { /* carry 由序列中显式的「进一」步骤呈现 */ }
    return st;
  }

  /* 生成 1234 + 5678 = 6912 的完整步骤表(右→左,先进位后加数) */
  function buildAddSchedule() {
    var moves = [];
    var st = zeroState();
    /* 置 1234(rods 9-12 = 千百十个) */
    [[9, 1, "一置一"], [10, 2, "二置二"], [11, 3, "三置三"], [12, 4, "四置四"]].forEach(function (m) {
      moves.push({ rod: m[0], dUp: m[1], dDown: 0, text: m[2], tag: "SET" });
      applyMove(st, moves[moves.length - 1]);
      moves[moves.length - 1].valueAfter = value(st.up, st.down);
    });
    /* 加 5678:个位 4+8 → 十位 3+7 → 百位 2+6 → 千位 1+5,进位先落
       valueAfter 在每步 applyMove 后立即记账(含进位步) */
    var seq = [
      { rod: 12, dUp: -2, dDown: 0, text: "八去二进一", tag: "ADD", carry: 1 },
      { rod: 11, dUp: 1, dDown: 0, text: "进一 · 一上1", tag: "CARRY" },
      { rod: 11, dUp: -3, dDown: 0, text: "七去三进一", tag: "ADD", carry: 1 },
      { rod: 10, dUp: 1, dDown: 0, text: "进一 · 一上1", tag: "CARRY" },
      { rod: 10, dUp: 1, dDown: 1, text: "六上六", tag: "ADD" },
      { rod: 9, dUp: 0, dDown: 1, text: "五上五", tag: "ADD" }
    ];
    seq.forEach(function (m) {
      moves.push(m);
      applyMove(st, m);
      m.valueAfter = value(st.up, st.down);
    });
    return { moves: moves, finalValue: value(st.up, st.down) };
  }

  /* 生成 999 + 1 = 1000 连环进位步骤表 */
  function buildCarrySchedule() {
    var moves = [];
    var st = zeroState();
    [[10, "九上九"], [11, "九上九"], [12, "九上九"]].forEach(function (m) {
      moves.push({ rod: m[0], dUp: 4, dDown: 1, text: m[1], tag: "SET" });
      applyMove(st, moves[moves.length - 1]);
      moves[moves.length - 1].valueAfter = value(st.up, st.down);
    });
    var seq2 = [
      { rod: 12, dUp: -4, dDown: -1, text: "一去九进一", tag: "ADD", carry: 1 },
      { rod: 11, dUp: -4, dDown: -1, text: "一去九进一", tag: "CARRY", carry: 1 },
      { rod: 10, dUp: -4, dDown: -1, text: "一去九进一", tag: "CARRY", carry: 1 },
      { rod: 9, dUp: 1, dDown: 0, text: "进一 · 一上1", tag: "CARRY" }
    ];
    seq2.forEach(function (m) {
      moves.push(m);
      applyMove(st, m);
      m.valueAfter = value(st.up, st.down);
    });
    return { moves: moves, finalValue: value(st.up, st.down) };
  }

  var ADD = buildAddSchedule();
  var CARRY = buildCarrySchedule();

  /* —— 调度:days(节拍) → 当前珠态 + 活动步骤 —— */
  /* 各段落起点(节拍):SET-ADD 从 0 起,CARRY 段接在后面 */
  var ADD_START = 0;
  var CARRY_START = ADD_START + ADD.moves.length + 1.5;

  function scheduleAt(t) {
    /* 返回 {up, down, active: {move, progress} | null, seg} */
    function evalMoves(moves, t0) {
      var st = zeroState();
      var active = null;
      for (var i = 0; i < moves.length; i++) {
        var mv = moves[i];
        var m0 = t0 + i * 1.0, m1 = m0 + 0.55;
        if (t >= m1) { applyMove(st, mv); }
        else if (t >= m0) {
          var pr = (t - m0) / 0.55;
          var e = pr < 0.5 ? 2 * pr * pr : 1 - Math.pow(-2 * pr + 2, 2) / 2;
          active = { move: mv, progress: Math.min(1, e), index: i };
          /* 半程珠态:正在移动的档按 progress 插值 */
          st.up[mv.rod] += mv.dUp * e;
          st.down[mv.rod] += mv.dDown * e;
        }
      }
      return { st: st, active: active };
    }
    if (t < CARRY_START) {
      var a = evalMoves(ADD.moves, ADD_START);
      return { up: a.st.up, down: a.st.down, active: a.active, seg: "ADD", lastValue: ADD.moves[ADD.moves.length - 1].valueAfter };
    }
    var b = evalMoves(CARRY.moves, CARRY_START);
    return { up: b.st.up, down: b.st.down, active: b.active, seg: "CARRY", lastValue: CARRY.moves[CARRY.moves.length - 1].valueAfter };
  }

  /* 珠几何(cm;场景 ×K)—— 竖立盘面:梁水平,档竖直 */
  var K = 0.5;
  var D = {
    K: K, RODS: RODS, BEAT: BEAT,
    rodGap: 1.15,                    // 档距 u(场景单位)
    beamY: 0,                        // 梁 y(盘面局部)
    upper: { activeY: [0.34, 0.78], restY: [1.30, 1.74] },   // 上珠(2)
    lower: { upY: function (i) { return -(0.30 + i * 0.47); },
             restY: function (i) { return -(1.42 + i * 0.47); } },  // 下珠(5)
    bead: { rx: 0.30, ry: 0.20, rz: 0.30 },
    frameW: 16.2, frameH: 6.4,
    ADD_START: ADD_START, CARRY_START: CARRY_START
  };

  var newState = function () {
    return { days: 0, t: 0, lastPhase: "" };
  };
  var step = function (st, dtDays) {
    st.days += dtDays;
    st.t = st.days;
  };

  MECH.DIM = D;
  MECH.KS = {
    newState: newState, step: step,
    value: value, zeroState: zeroState, scheduleAt: scheduleAt,
    ADD: ADD, CARRY: CARRY
  };

  /* —— 载入期自检:全步骤数值断言 —— */
  (function selfCheck() {
    function fail(msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
    function near(a, b, tol, msg) {
      if (!(Math.abs(a - b) <= tol)) fail(msg + ": got " + a + " expect " + b);   // NaN 也判失败
    }
    // 1) 空盘 = 0
    near(value(zeroState().up, zeroState().down), 0, 1e-9, "空盘读数 ≠ 0");
    // 2) 满盘 = 13 位全 9(2:5 珠每档最大 9)
    var full = zeroState();
    for (var i = 0; i < RODS; i++) { full.up[i] = 4; full.down[i] = 1; }
    near(value(full.up, full.down), 9999999999999, 1e-3, "满盘读数 ≠ 9999999999999");
    // 3) 置 1234:SET 步后读数
    var setMoves = ADD.moves.filter(function (m) { return m.tag === "SET"; });
    near(setMoves[setMoves.length - 1].valueAfter, 1234, 1e-9, "置数后读数 ≠ 1234");
    // 4) 每步 valueAfter 与珠态一致(重放校验)
    var st = zeroState();
    ADD.moves.forEach(function (mv, i) {
      applyMove(st, mv);
      if (mv.valueAfter !== undefined) {
        near(value(st.up, st.down), mv.valueAfter, 1e-9, "ADD 步 " + i + " " + mv.text + " 读数不符");
      }
    });
    // 5) 最终 6912
    near(ADD.finalValue, 6912, 1e-9, "1234+5678 ≠ 6912");
    // 6) 999 → 1000 连环进位
    var st2 = zeroState();
    CARRY.moves.forEach(function (mv) { applyMove(st2, mv); });
    near(CARRY.finalValue, 1000, 1e-9, "999+1 ≠ 1000");
    near(value(st2.up, st2.down), 1000, 1e-9, "进位链终态 ≠ 1000");
    // 7) 调度采样:ADD 段尾读数 = 6912,CARRY 段尾读数 = 1000
    var sEnd = scheduleAt(CARRY_START - 0.2);
    near(value(sEnd.up, sEnd.down), 6912, 1e-6, "ADD 段尾调度读数 ≠ 6912");
    var cEnd = scheduleAt(CARRY_START + CARRY.moves.length + 1.0);
    near(value(cEnd.up, cEnd.down), 1000, 1e-6, "CARRY 段尾调度读数 ≠ 1000");
  })();
})(window.MECH = window.MECH || {});
