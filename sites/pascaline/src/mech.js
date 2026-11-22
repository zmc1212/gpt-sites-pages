/* 帕斯卡加法器 — 十进制轮系状态机与 sautoir 进位调度
   文献依据:Blaise Pascal 1642-45(为税务官父亲设计),实物藏巴黎工艺博物馆
   (Musée des Arts et Métiers);《Lettre dédicante au monarque》(1645)。
   机构:输入轮(带辐条,36°/位)经齿轮组驱动结果鼓轮(十齿,36°/位);
   某位 9→0 时 sautoir(进位杆)抬起落下,把进位 +1 传给左档——连环进位。
   可验算核心(状态机,全步骤断言):
     置 1234 → 输入 5678(逐位)→ 6912;999 + 1 → 1000(连环进位)。
   进位次数断言:个位 4+8 越 9 一次、十位 4+7 越一次、千/百位不越——
   每步 carries 数与状态重放一致。 */
(function (MECH) {
  var DIGITS = 6;                    // 六位(万万千百十个)
  var STEP = Math.PI / 5;            // 36°/位

  function value(dg) {
    var v = 0;
    for (var i = 0; i < DIGITS; i++) v += dg[i] * Math.pow(10, DIGITS - 1 - i);
    return v;
  }
  function zeroState() { return { dg: [0, 0, 0, 0, 0, 0] }; }

  /* 应用一次「输入 add 于 wheel」(含 sautoir 连锁),返回进位次数 */
  function applyAdd(st, wheel, add) {
    var carries = 0;
    var pos = wheel, inc = add;
    while (inc > 0) {
      var before = st.dg[pos];
      var after = before + inc;
      if (after <= 9) { st.dg[pos] = after; inc = 0; }
      else {
        st.dg[pos] = after - 10;      // 越 9 回 0,进位
        carries++;
        inc = 1;                      // sautoir 落下:左档 +1
        pos = pos - 1;
        if (pos < 0) { inc = 0; }     // 超出最高位(溢出)
      }
    }
    return carries;
  }

  /* —— 调度:置 1234 → 加 5678 → 999+1 —— */
  function buildAddSchedule() {
    var moves = [];
    var st = zeroState();
    /* 置 1234:输入轮逐位拨(个位拨 4、十位拨 3…)——直接置鼓轮 */
    [[5, 4, "置个位 4"], [4, 3, "置十位 3"], [3, 2, "置百位 2"], [2, 1, "置千位 1"]].forEach(function (m) {
      var carries = applyAdd(st, m[0], m[1]);
      moves.push({ wheel: m[0], add: m[1], text: m[2], tag: "SET", carries: carries, valueAfter: value(st.dg) });
    });
    /* 加 5678:个位 +8 → 十位 +7 → 百位 +6 → 千位 +5 */
    var seq = [
      [5, 8, "个位 +8(越 9 进 1)"],
      [4, 7, "十位 +7(越 9 进 1)"],
      [3, 6, "百位 +6"],
      [2, 5, "千位 +5"]
    ];
    seq.forEach(function (m) {
      var carries = applyAdd(st, m[0], m[1]);
      moves.push({ wheel: m[0], add: m[1], text: m[2], tag: "ADD", carries: carries, valueAfter: value(st.dg) });
    });
    return { moves: moves, finalValue: value(st.dg), totalCarries: moves.reduce(function (a, m) { return a + m.carries; }, 0) };
  }

  function buildCarrySchedule() {
    var moves = [];
    var st = zeroState();
    [[5, 9, "置 999(个位 9)"], [4, 9, "置 999(十位 9)"], [3, 9, "置 999(百位 9)"]].forEach(function (m) {
      applyAdd(st, m[0], m[1]);
      moves.push({ wheel: m[0], add: m[1], text: m[2], tag: "SET", carries: 0, valueAfter: value(st.dg) });
    });
    var carries = applyAdd(st, 5, 1);
    moves.push({ wheel: 5, add: 1, text: "个位 +1(9→0 连环进位)", tag: "ADD", carries: carries, valueAfter: value(st.dg) });
    return { moves: moves, finalValue: value(st.dg), totalCarries: carries };
  }

  var ADD = buildAddSchedule();
  var CARRY = buildCarrySchedule();
  var CARRY_START = ADD.moves.length + 1.5;

  /* 调度采样:t(节拍) → {dg, active:{move,progress}, seg, carriesSoFar} */
  function scheduleAt(t) {
    function evalMoves(moves, t0) {
      var st = zeroState();
      var active = null, carries = 0;
      for (var i = 0; i < moves.length; i++) {
        var mv = moves[i];
        var m0 = t0 + i * 1.0, m1 = m0 + 0.8;
        if (t >= m1) { carries += applyAdd(st, mv.wheel, mv.add); }
        else if (t >= m0) {
          var pr = (t - m0) / 0.8;
          var e = pr < 0.5 ? 2 * pr * pr : 1 - Math.pow(-2 * pr + 2, 2) / 2;
          /* 输入轮转 add×36°;工作鼓轮数字连续走,越 9 时左档瞬时 +1(sautoir 落下) */
          var frac = mv.add * e;
          var crossed = Math.floor((st.dg[mv.wheel] + frac) / 10) -
                        Math.floor(st.dg[mv.wheel] / 10);
          var tmp = zeroState();
          for (var k = 0; k < DIGITS; k++) tmp.dg[k] = st.dg[k];
          tmp.dg[mv.wheel] = (st.dg[mv.wheel] + frac) % 10;
          if (crossed > 0 && mv.wheel > 0) {
            tmp.dg[mv.wheel - 1] = (st.dg[mv.wheel - 1] + crossed) % 10;
          }
          var carryFrac = crossed > 0
            ? Math.max(0, Math.min(1, frac - (10 - st.dg[mv.wheel])))
            : 0;
          active = { move: mv, progress: Math.min(1, e), index: i,
                     carryFrac: carryFrac, crossed: crossed };
          return { st: tmp, active: active, carries: carries };
        }
      }
      return { st: st, active: active, carries: carries };
    }
    if (t < CARRY_START) {
      var a = evalMoves(ADD.moves, 0);
      return { dg: a.st.dg, active: a.active, seg: "ADD", carries: a.carries };
    }
    var b = evalMoves(CARRY.moves, CARRY_START);
    return { dg: b.st.dg, active: b.active, seg: "CARRY", carries: b.carries };
  }

  var K = 0.5;
  var D = { K: K, DIGITS: DIGITS, STEP: STEP, CARRY_START: CARRY_START,
            caseW: 15.5, caseD: 7.0, caseH: 4.4 };

  var newState = function () { return { days: 0, t: 0, lastPhase: "", carries: 0 }; };
  var step = function (st, dtDays) { st.days += dtDays; st.t = st.days; };

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step, value: value, zeroState: zeroState,
              scheduleAt: scheduleAt, ADD: ADD, CARRY: CARRY, applyAdd: applyAdd };

  /* —— 载入期自检 —— */
  (function selfCheck() {
    function fail(msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
    function near(a, b, tol, msg) {
      if (!(Math.abs(a - b) <= tol)) fail(msg + ": got " + a + " expect " + b);   // NaN 也判失败
    }
    // 1) 空机 = 0
    near(value(zeroState().dg), 0, 1e-9, "空机读数 ≠ 0");
    // 2) 满机 = 999999
    var full = { dg: [9, 9, 9, 9, 9, 9] };
    near(value(full.dg), 999999, 1e-9, "满机读数 ≠ 999999");
    // 3) 每步 valueAfter 与重放一致;SET 尾 = 1234;ADD 尾 = 6912
    var st = zeroState();
    ADD.moves.forEach(function (mv, i) {
      var c = applyAdd(st, mv.wheel, mv.add);
      near(c, mv.carries, 0, "ADD 步 " + i + " 进位次数不符");
      near(value(st.dg), mv.valueAfter, 1e-9, "ADD 步 " + i + " " + mv.text + " 读数不符");
    });
    near(ADD.moves[3].valueAfter, 1234, 1e-9, "置数后 ≠ 1234");
    near(ADD.finalValue, 6912, 1e-9, "1234+5678 ≠ 6912");
    // 4) 进位次数断言:个位 4+8 越 9 ×1,十位 4+7 ×1,百位 +6 不越,千位 +5 不越
    var addMoves = ADD.moves.slice(4);
    near(addMoves[0].carries, 1, 0, "个位 +8 进位次数 ≠ 1");
    near(addMoves[1].carries, 1, 0, "十位 +7 进位次数 ≠ 1");
    near(addMoves[2].carries, 0, 0, "百位 +6 不应进位");
    near(addMoves[3].carries, 0, 0, "千位 +5 不应进位");
    // 5) 999 + 1 → 1000,连环进位 ×3
    var st2 = zeroState();
    CARRY.moves.forEach(function (mv) { applyAdd(st2, mv.wheel, mv.add); });
    near(CARRY.finalValue, 1000, 1e-9, "999+1 ≠ 1000");
    near(CARRY.totalCarries, 3, 0, "连环进位次数 ≠ 3");
    // 6) 调度段尾采样
    var sEnd = scheduleAt(CARRY_START - 0.2);
    near(value(sEnd.dg), 6912, 1e-6, "ADD 段尾调度读数 ≠ 6912");
    var cEnd = scheduleAt(CARRY_START + CARRY.moves.length + 1.0);
    near(value(cEnd.dg), 1000, 1e-6, "CARRY 段尾调度读数 ≠ 1000");
    // 7) 输入轮 36°/位
    near(D.STEP, Math.PI / 5, 1e-12, "步进角 ≠ 36°");
  })();
})(window.MECH = window.MECH || {});
