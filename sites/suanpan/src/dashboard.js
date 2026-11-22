/* 底部仪表盘:① 盘面读数 ② 口诀步骤 ③ 四档简图 ④ 验算断言 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.5)";

  MECH.DASH = { panels: [
    { title: "VALUE · 盘面读数", meta: "Σ (上珠×5 + 下珠) × 位值", dot: "yellow",
      html: '<div class="big" id="d-val">0</div><div class="k" id="d-digits">空盘归零</div>',
      init: initValue, draw: drawValue },
    { title: "口诀 · 当前步骤", meta: "珠算口诀", dot: "teal",
      html: '<div class="big" id="d-move">—</div><div class="k" id="d-movetag">待机</div>',
      init: initMove, draw: drawMove },
    { title: "WORK · 工作四档", meta: "千百十个(rod 9-12)", dot: "blue", canvasH: 96,
      draw: drawWork },
    { title: "VERIFY · 步骤断言", meta: "1234+5678=6912 · 999+1=1000", dot: "green",
      html: '<div id="d-steps"></div><div class="chip on" id="d-lock">LOCKED · 载入断言通过</div>',
      init: initSteps }
  ] };

  function initValue(sec) {
    el.val = sec.querySelector("#d-val");
    el.digits = sec.querySelector("#d-digits");
  }
  function drawValue(st) {
    if (!el.val) return;
    var sch = KS.scheduleAt(st.days);
    var v = Math.round(KS.value(sch.up, sch.down));
    el.val.textContent = v;
    var s = String(v);
    var names = ["千", "百", "十", "个"];
    el.digits.textContent = s.length <= 4 && v > 0
      ? s.slice(-4).split("").map(function (c, i) { return names[i] + " " + c; }).join(" · ")
      : (v === 0 ? "空盘归零" : s);
  }

  function initMove(sec) {
    el.move = sec.querySelector("#d-move");
    el.movetag = sec.querySelector("#d-movetag");
  }
  function drawMove(st) {
    if (!el.move) return;
    var sch = KS.scheduleAt(st.days);
    if (sch.active) {
      el.move.textContent = sch.active.move.text;
      el.movetag.textContent = sch.active.move.tag === "SET" ? "置数" : sch.active.move.tag === "ADD" ? "加数" : "进位";
    } else {
      el.move.textContent = "—";
      el.movetag.textContent = st.days >= D.CARRY_START ? "进位链完成 · 1000" : "待机";
    }
  }

  function initSteps(sec) {
    var rows = KS.ADD.moves.map(function (m, i) {
      return '<div class="rowline"><span>' + (i + 1) + '. ' + m.text + '</span><b>' +
        (m.valueAfter !== undefined ? m.valueAfter : "…") + '</b></div>';
    }).join("");
    var rows2 = KS.CARRY.moves.map(function (m, i) {
      return '<div class="rowline"><span>C' + (i + 1) + '. ' + m.text + '</span><b>' +
        (m.valueAfter !== undefined ? m.valueAfter : "…") + '</b></div>';
    }).join("");
    sec.querySelector("#d-steps").innerHTML =
      '<div class="k">置 1234 → 加 5678</div>' + rows +
      '<div class="k" style="margin-top:6px">999 + 1(连环进位)</div>' + rows2;
  }

  /* 四档简图(千百十个) */
  function drawWork(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var sch = KS.scheduleAt(st.days);
    var rods = [9, 10, 11, 12];
    var cy = h / 2 + 2, beamY = cy - 6;
    ctx.strokeStyle = "rgba(233,238,242,0.5)";
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(14, beamY); ctx.lineTo(w - 14, beamY); ctx.stroke();
    rods.forEach(function (rod, idx) {
      var x = 34 + idx * ((w - 68) / 3);
      ctx.beginPath(); ctx.moveTo(x, beamY - 24); ctx.lineTo(x, beamY + 38); ctx.stroke();
      var uf = sch.up[rod], df = sch.down[rod];
      for (var u = 0; u < 2; u++) {
        var k = Math.max(0, Math.min(1, df - u));
        var y = -17 - u * 8 + k * 12;
        ctx.fillStyle = "#B08D57";
        ctx.fillRect(x - 7, beamY + y - 3.5, 14, 7);
      }
      for (var l = 0; l < 5; l++) {
        var k2 = Math.max(0, Math.min(1, uf - l));
        var y2 = 6 + l * 7.0 - k2 * (6 + l * 7.0 - 4);
        ctx.fillStyle = "#E9EEF2";
        ctx.fillRect(x - 7, beamY + y2 - 3.5, 14, 7);
      }
      ctx.fillStyle = soft;
      ctx.font = "600 7.5px Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(["千", "百", "十", "个"][idx], x, h - 3);
    });
    ctx.fillStyle = soft;
    ctx.textAlign = "left";
    ctx.fillText("读数 " + Math.round(KS.value(sch.up, sch.down)), 16, 9);
  }
})(window.MECH = window.MECH || {});
