/* 底部仪表盘:① ROLL 辊系 ② GIN 轧棉进度 ③ PEDAL 踏板 ④ CYCLE 阶段时序 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.45)", faint = "rgba(233,238,242,0.16)";
  var yellow = "#E9C93C", teal = "#7FD8D8", red = "#D6543A", cottonC = "#EDEAE0";
  var wood = "#B08D57";

  var STARTS = (function () {
    var acc = 0, arr = [];
    MECH.PHASES.forEach(function (ph) { arr.push(acc); acc += ph.dur; });
    arr.total = acc;
    return arr;
  })();

  MECH.DASH = { panels: [
    { title: "ROLL · 辊系", meta: "外啮合 i=1 · 反向", dot: "yellow", canvasH: 108,
      draw: drawRoll },
    { title: "GIN · 轧棉", meta: "皮棉牵出", dot: "green",
      html: '<div class="big" id="d-p">0%</div><div class="k">棉团牵引进度</div><div class="chip" id="d-chip">—</div>',
      canvasH: 80, init: initGin, draw: drawGin },
    { title: "PEDAL · 踏板", meta: "行程 0.20m", dot: "blue", canvasH: 108,
      draw: drawPedal },
    { title: "CYCLE · 阶段时序", meta: "44s 自动循环", dot: "orange", canvasH: 66,
      draw: drawCycle }
  ] };

  function initGin(sec) {
    el.p = sec.querySelector("#d-p");
    el.chip = sec.querySelector("#d-chip");
  }

  /* ① 辊系:双辊端面圆反向旋转 + 齿轮对 + 辊隙 */
  function drawRoll(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var S = Math.min(w / 1.0, (h - 12) / 1.05);
    var cx = w * 0.34, cy = h * 0.56;
    function X(x) { return cx + x * S; }
    function Y(y) { return cy - (y - 0.52) * S; }
    /* 双辊 */
    [[D.yLow, D.rLow, st.psi], [D.yUp, D.rUp, -st.psi]].forEach(function (c) {
      var r = c[1] * S;
      ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(X(0), Y(c[0]), r, 0, Math.PI * 2); ctx.stroke();
      var a0 = c[2];
      ctx.strokeStyle = wood;
      ctx.beginPath();
      ctx.moveTo(X(0), Y(c[0]));
      ctx.lineTo(X(0) + Math.cos(a0) * r, Y(c[0]) + Math.sin(a0) * r);
      ctx.stroke();
    });
    /* 辊隙标注 */
    ctx.strokeStyle = red; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(X(0.09), Y(D.nipY)); ctx.lineTo(X(0.15), Y(D.nipY)); ctx.stroke();
    ctx.fillStyle = red;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("隙 0.005", X(0.16), Y(D.nipY) + 3);
    /* 齿轮对 */
    [[D.yLow, st.psi, "#E9EEF2"], [D.yUp, -st.psi, yellow]].forEach(function (c) {
      var r = D.gearR * S;
      ctx.strokeStyle = c[2]; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(X(-0.36), Y(c[0]), r, 0, Math.PI * 2); ctx.stroke();
      for (var i = 0; i < 8; i++) {
        var a = c[1] + i / 8 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(X(-0.36) + Math.cos(a) * r * 0.78, Y(c[0]) + Math.sin(a) * r * 0.78);
        ctx.lineTo(X(-0.36) + Math.cos(a) * r, Y(c[0]) + Math.sin(a) * r);
        ctx.stroke();
      }
    });
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.fillText("齿轮 16T ×2 · ω上=−ω下", X(-0.62), Y(D.yUp) - D.gearR * S - 6);
  }

  /* ② 轧棉进度 + 皮棉条 */
  function drawGin(st, ph, pt, ctx, w, h) {
    var p = st.drawProg || 0;
    if (el.p) el.p.textContent = Math.round(p * 100) + "%";
    if (el.chip) {
      var ginning = p > 0.02 && p < 0.98;
      el.chip.textContent = ginning ? "牵引中 · 皮棉过隙" : (p >= 0.98 ? "轧毕 · 籽落棉出" : "待喂");
      el.chip.className = "chip " + (ginning ? "hot" : "on");
    }
    ctx.clearRect(0, 0, w, h);
    var bx = 8, bw = w - 16, cy = h * 0.45;
    ctx.fillStyle = "rgba(233,238,242,0.10)";
    ctx.fillRect(bx, cy - 6, bw, 12);
    ctx.fillStyle = cottonC;
    ctx.fillRect(bx, cy - 6, bw * p, 12);
    /* 皮棉示意条 */
    ctx.fillStyle = cottonC;
    ctx.fillRect(bx, cy + 10, bw * p * 0.94, 3);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("皮棉 ←牵出 0.34m", bx, cy + 24);
    ctx.textAlign = "right";
    ctx.fillText("v牵 " + (st.omega * D.rLow).toFixed(3) + " m/s", bx + bw, cy - 12);
  }

  /* ③ 踏板行程(曲柄端面) */
  function drawPedal(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.46, r = Math.min(w, h) * 0.26;
    ctx.strokeStyle = soft; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    var pa = st.psi + Math.PI;
    ctx.strokeStyle = yellow; ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(pa) * r, cy + Math.sin(pa) * r);
    ctx.stroke();
    ctx.fillStyle = yellow;
    ctx.beginPath(); ctx.arc(cx + Math.cos(pa) * r, cy + Math.sin(pa) * r, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("踏板行程 2r = 0.20m", cx, cy + r + 14);
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
    ctx.fillText("ψ " + st.psi.toFixed(1) + " rad", x0 + ww, y1 + hh1 + 14);
  }
})(window.MECH = window.MECH || {});
