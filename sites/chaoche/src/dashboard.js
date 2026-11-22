/* 底部仪表盘:① SCISSOR 剪叉 ② WINCH 绞盘 ③ HEIGHT 高度 ④ CYCLE 阶段时序 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.45)", faint = "rgba(233,238,242,0.16)";
  var yellow = "#E9C93C", teal = "#7FD8D8", red = "#D6543A";
  var wood = "#B08D57";

  var STARTS = (function () {
    var acc = 0, arr = [];
    MECH.PHASES.forEach(function (ph) { arr.push(acc); acc += ph.dur; });
    arr.total = acc;
    return arr;
  })();

  MECH.DASH = { panels: [
    { title: "SCISSOR · 剪叉", meta: "四臂 L1.2 双级", dot: "yellow", canvasH: 112,
      draw: drawScissor },
    { title: "WINCH · 绞盘", meta: "收绳 1.04m", dot: "green",
      html: '<div class="big" id="d-t">0.00</div><div class="k">绞盘圈数(2.07 圈满)</div><div class="chip" id="d-chip">—</div>',
      canvasH: 74, init: initWinch, draw: drawWinch },
    { title: "HEIGHT · 高度", meta: "升 2.26 倍", dot: "blue", canvasH: 108,
      draw: drawHeight },
    { title: "CYCLE · 阶段时序", meta: "48.5s 自动循环", dot: "orange", canvasH: 66,
      draw: drawCycle }
  ] };

  function initWinch(sec) {
    el.t = sec.querySelector("#d-t");
    el.chip = sec.querySelector("#d-chip");
  }

  /* ① 剪叉侧视简图(实时 φ) */
  function drawScissor(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var S = Math.min(w / 2.6, (h - 12) / 2.9);
    var cx = w * 0.42, gy = h * 0.80;
    function X(m) { return cx + m * S; }
    function Y(m) { return gy - (m - 0.4) * S; }
    var sc = KS.scissor(st.phi);
    /* 台面 + 导轨 */
    ctx.strokeStyle = soft; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(X(-0.6), Y(D.deckY)); ctx.lineTo(X(1.2), Y(D.deckY)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(0.05), Y(D.deckY)); ctx.lineTo(X(0.05), Y(D.deckY + 1.6)); ctx.stroke();
    /* 四臂 */
    var segs = [sc.A, sc.C, sc.B, sc.Dp, sc.Dp, sc.F, sc.C, sc.E];
    ctx.strokeStyle = wood; ctx.lineWidth = 3;
    for (var i = 0; i < 4; i++) {
      var p1 = segs[i * 2], p2 = segs[i * 2 + 1];
      ctx.beginPath(); ctx.moveTo(X(p1[0]), Y(p1[1])); ctx.lineTo(X(p2[0]), Y(p2[1])); ctx.stroke();
    }
    /* 望楼舱 */
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 1.2;
    ctx.strokeRect(X((sc.E[0] + sc.F[0]) / 2 - 0.4), Y(sc.cabinFloor + D.cabinH), 0.80 * S, D.cabinH * S);
    /* 绞盘 */
    ctx.beginPath(); ctx.arc(X(D.winchX), Y(D.winchY), 4, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("φ " + KS.deg(st.phi).toFixed(1) + "°", X(0.12), Y(0.5));
  }

  /* ② 绞盘圈数 */
  function drawWinch(st, ph, pt, ctx, w, h) {
    var sc = KS.scissor(st.phi);
    var turns = (D.s0 - sc.s) / (2 * Math.PI * D.drumR);
    if (el.t) el.t.textContent = turns.toFixed(2);
    if (el.chip) {
      var winching = st.winching;
      el.chip.textContent = winching ? "摇绞中 · 收绳" : (turns > 2 ? "高位 · 保绳" : "松绳待绞");
      el.chip.className = "chip " + (winching ? "hot" : "on");
    }
    ctx.clearRect(0, 0, w, h);
    var bx = 8, bw = w - 16, cy = h * 0.5;
    ctx.fillStyle = "rgba(233,238,242,0.10)";
    ctx.fillRect(bx, cy - 5, bw, 10);
    ctx.fillStyle = teal;
    ctx.fillRect(bx, cy - 5, bw * KS.clamp(turns / 2.07, 0, 1), 10);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("收绳 " + (D.s0 - sc.s).toFixed(2) + "m / 鼓 r 0.08", bx, cy + 18);
  }

  /* ③ 高度对比柱(折↔展) */
  function drawHeight(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var sc = KS.scissor(st.phi);
    var h0 = D.cabinFloor0, h1 = D.cabinFloor1;
    var bx = w * 0.28, bw = w * 0.14, y0 = 10, hh = h - 30;
    var ymax = h1 + D.cabinH + 0.2;
    function yOf(v) { return y0 + (1 - v / ymax) * hh; }
    /* 折叠柱 */
    ctx.fillStyle = "rgba(233,238,242,0.16)";
    ctx.fillRect(bx, yOf(h0), bw, y0 + hh - yOf(h0));
    ctx.strokeStyle = soft; ctx.lineWidth = 1;
    ctx.strokeRect(bx, yOf(h0), bw, y0 + hh - yOf(h0));
    /* 展开柱 */
    ctx.fillStyle = "rgba(127,216,216,0.45)";
    ctx.fillRect(bx + bw * 1.6, yOf(h1), bw, y0 + hh - yOf(h1));
    ctx.strokeRect(bx + bw * 1.6, yOf(h1), bw, y0 + hh - yOf(h1));
    /* 当前指示线 */
    var cur = sc.cabinFloor + D.cabinH;
    ctx.strokeStyle = yellow; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(bx - 4, yOf(cur)); ctx.lineTo(bx + bw * 2.6 + 4, yOf(cur)); ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("折", bx + bw / 2, y0 + hh + 12);
    ctx.fillText("展", bx + bw * 1.6 + bw / 2, y0 + hh + 12);
    ctx.textAlign = "left";
    ctx.fillText("H " + cur.toFixed(2) + "m(升高比 2.26)", bx + bw * 2.7, yOf(cur) + 3);
  }

  /* ④ 阶段时序 */
  function drawCycle(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var total = STARTS.total, x0 = 4, ww = w - 8;
    var idx = MECH.PHASES.indexOf(ph);
    var gt = STARTS[idx] + pt;
    var y1 = 6, hh1 = 18;
    MECH.PHASES.forEach(function (p, i) {
      var x = x0 + STARTS[i] / total * ww, seg = p.dur / total * ww;
      ctx.fillStyle = i === idx ? "rgba(233,201,60,0.30)" : "rgba(233,238,242,0.10)";
      ctx.fillRect(x, y1, seg - 1.5, hh1);
      ctx.strokeStyle = i === idx ? yellow : faint;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y1, seg - 1.5, hh1);
      ctx.fillStyle = i === idx ? yellow : soft;
      ctx.font = "600 7.5px Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(i + 1), x + seg / 2 - 0.75, y1 + hh1 / 2 + 3);
    });
    var gx = x0 + gt / total * ww;
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(gx, y1 - 3); ctx.lineTo(gx, y1 + hh1 + 3); ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("t=" + gt.toFixed(1) + "s / " + total.toFixed(1) + "s", x0, y1 + hh1 + 14);
    ctx.textAlign = "right";
    ctx.fillText("φ " + KS.deg(st.phi).toFixed(0) + "°", x0 + ww, y1 + hh1 + 14);
  }
})(window.MECH = window.MECH || {});
