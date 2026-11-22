/* 底部仪表盘:① 鼓轮读数 ② 当前输入 ③ 轮系简图 ④ 步骤断言 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var yellow = "#E9C93C";
  var soft = "rgba(233,238,242,0.5)";

  MECH.DASH = { panels: [
    { title: "READOUT · 鼓轮读数", meta: "六位十进制 · 36°/位", dot: "yellow",
      html: '<div class="big" id="d-val">0</div><div class="k" id="d-digits">万 万 千 百 十 个 —</div>',
      init: initValue, draw: drawValue },
    { title: "INPUT · 当前输入", meta: "输入辐条轮", dot: "teal",
      html: '<div class="big" id="d-move">—</div><div class="k" id="d-movetag">待机</div>',
      init: initMove, draw: drawMove },
    { title: "GEARS · 轮系简图", meta: "输入轮 → 鼓轮 → sautoir", dot: "blue", canvasH: 92,
      draw: drawGears },
    { title: "VERIFY · 步骤断言", meta: "1234+5678=6912 · 999+1=1000 · 进位次数", dot: "green",
      html: '<div id="d-steps"></div><div class="chip on" id="d-lock">LOCKED · 载入断言通过</div>',
      init: initSteps }
  ] };

  function initValue(sec) { el.val = sec.querySelector("#d-val"); el.digits = sec.querySelector("#d-digits"); }
  function drawValue(st) {
    if (!el.val) return;
    var sch = KS.scheduleAt(st.days);
    var dgR = sch.dg.map(function (d) { return Math.round(d) % 10; });
    var v = KS.value(dgR);
    el.val.textContent = v;
    var s = String(v);
    var names = ["个", "十", "百", "千", "万"];
    el.digits.textContent = v > 0 && s.length <= 5
      ? s.split("").reverse().map(function (c, i) { return names[i] + " " + c; }).reverse().join(" · ")
      : (v === 0 ? "空机归零" : s);
  }
  function initMove(sec) { el.move = sec.querySelector("#d-move"); el.movetag = sec.querySelector("#d-movetag"); }
  function drawMove(st) {
    if (!el.move) return;
    var sch = KS.scheduleAt(st.days);
    if (sch.active) {
      el.move.textContent = "+" + sch.active.move.add + " @ 位 " + (sch.active.move.wheel + 1);
      el.movetag.textContent = sch.active.move.tag === "SET" ? "置数" : "加数" + (sch.active.crossed > 0 ? " · sautoir 进位!" : "");
    } else {
      el.move.textContent = "—";
      el.movetag.textContent = st.days >= D.CARRY_START ? "进位链完成 · 1000" : "待机";
    }
  }

  /* 轮系简图:六列(输入轮/进位杆/鼓轮),活状态 */
  function drawGears(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var sch = KS.scheduleAt(st.days);
    var cy = h / 2 + 2;
    ctx.strokeStyle = "rgba(233,238,242,0.5)";
    ctx.lineWidth = 1.2;
    for (var i = 0; i < D.DIGITS; i++) {
      var x = 24 + i * ((w - 48) / (D.DIGITS - 1));
      /* 输入轮(下) */
      ctx.beginPath(); ctx.arc(x, cy + 22, 11, 0, Math.PI * 2); ctx.stroke();
      for (var sp = 0; sp < 6; sp++) {
        var a = (sch.dg[i] + (sch.active && sch.active.move.wheel === i ? sch.active.move.add * sch.active.progress : 0)) * D.STEP + sp / 6 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * 4, cy + 22 + Math.sin(a) * 4);
        ctx.lineTo(x + Math.cos(a) * 10.5, cy + 22 + Math.sin(a) * 10.5);
        ctx.stroke();
      }
      /* 鼓轮数字(上) */
      ctx.fillStyle = "#E9EEF2";
      ctx.font = "700 13px Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(Math.round(sch.dg[i])), x, cy - 16);
      /* sautoir 杆(列间) */
      if (i > 0) {
        var f = (sch.active && sch.active.move.wheel === i && sch.active.crossed > 0)
          ? Math.sin(sch.active.carryFrac * Math.PI) : 0;
        ctx.strokeStyle = f > 0 ? yellow : "rgba(233,238,242,0.28)";
        ctx.beginPath();
        ctx.moveTo(x - (w - 48) / (D.DIGITS - 1) / 2, cy - 4);
        ctx.lineTo(x - (w - 48) / (D.DIGITS - 1) / 2 + 3, cy - 4 - 10 * f);
        ctx.stroke();
        ctx.strokeStyle = "rgba(233,238,242,0.5)";
      }
      /* 联轴竖线 */
      ctx.beginPath(); ctx.moveTo(x, cy - 11); ctx.lineTo(x, cy + 9); ctx.stroke();
    }
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("输入轮(下)· sautoir(杆)· 鼓轮读数(上)", 16, 9);
  }

  function initSteps(sec) {
    var rows = KS.ADD.moves.map(function (m, i) {
      return '<div class="rowline"><span>' + (i + 1) + '. ' + m.text + (m.carries > 0 ? " · 进位×" + m.carries : "") + '</span><b>' + m.valueAfter + '</b></div>';
    }).join("");
    var rows2 = '<div class="rowline"><span>C. 个位 +1(9→0 连环)</span><b>' + KS.CARRY.finalValue + '</b></div>';
    sec.querySelector("#d-steps").innerHTML =
      '<div class="k">置 1234 → 输入 5678</div>' + rows +
      '<div class="k" style="margin-top:6px">999 + 1(连环进位 ×' + KS.CARRY.totalCarries + ')</div>' + rows2;
  }
})(window.MECH = window.MECH || {});
