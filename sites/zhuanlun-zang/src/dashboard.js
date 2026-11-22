/* 底部仪表盘:① SPIN 转速 ② SIDES 八棱面 ③ DECAY 惯转曲线 ④ CYCLE 阶段时序 */
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
    { title: "SPIN · 转速", meta: "ω 衰减 k=0.08", dot: "yellow",
      html: '<div class="big" id="d-w">0.00</div><div class="k">角速度 rad/s(惯转 13.6 rad)</div><div class="chip" id="d-chip">—</div>',
      canvasH: 78, init: initSpin, draw: drawSpin },
    { title: "SIDES · 八棱面", meta: "每棱 45°", dot: "green", canvasH: 112,
      draw: drawSides },
    { title: "DECAY · 惯转曲线", meta: "ψ(τ) = (ω0/k)(1−e^{−kτ})", dot: "blue", canvasH: 108,
      draw: drawDecay },
    { title: "CYCLE · 阶段时序", meta: "48.5s 自动循环", dot: "orange", canvasH: 66,
      draw: drawCycle }
  ] };

  function initSpin(sec) {
    el.w = sec.querySelector("#d-w");
    el.chip = sec.querySelector("#d-chip");
  }

  /* ① 转速读数 */
  function drawSpin(st, ph, pt, ctx, w, h) {
    var om = st.omega || 0;
    if (el.w) el.w.textContent = om.toFixed(2);
    if (el.chip) {
      el.chip.textContent = om > 0.05 ? "巡转中 · 低摩擦" : "静止 · 待推";
      el.chip.className = "chip " + (om > 0.05 ? "on" : "");
    }
    ctx.clearRect(0, 0, w, h);
    var bx = 8, bw = w - 16, cy = h * 0.5;
    ctx.fillStyle = "rgba(233,238,242,0.10)";
    ctx.fillRect(bx, cy - 5, bw, 10);
    ctx.fillStyle = teal;
    ctx.fillRect(bx, cy - 5, bw * KS.clamp(om / D.omega0, 0, 1), 10);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("推后 ω0 = 1.2 rad/s · 指数衰减 e^{−0.08τ}", bx, cy + 18);
  }

  /* ② 八棱面俯视:八面 + 当前面高亮 */
  function drawSides(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.52, R = Math.min(w, h) * 0.36;
    var N = D.NS;
    var psi = st.psi || 0;
    for (var i = 0; i < N; i++) {
      var a0 = i / N * Math.PI * 2 + psi;
      var a1 = (i + 1) / N * Math.PI * 2 + psi;
      var p0x = cx + Math.sin(a0) * R, p0y = cy - Math.cos(a0) * R;
      var p1x = cx + Math.sin(a1) * R, p1y = cy - Math.cos(a1) * R;
      /* 当前正对视角(朝 −z 观察者)的面高亮 */
      var facing = Math.abs(((a0 + a1) / 2 - psi - Math.PI) % (2 * Math.PI)) < D.sideAngle / 2;
      ctx.strokeStyle = facing ? yellow : soft;
      ctx.lineWidth = facing ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(p0x, p0y); ctx.lineTo(p1x, p1y); ctx.stroke();
      ctx.fillStyle = facing ? yellow : faint;
      ctx.font = "600 7px Menlo, monospace";
      ctx.fillText(String(i + 1), (p0x + p1x) / 2, (p0y + p1y) / 2 + 3);
    }
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("第 " + (Math.floor((((psi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / D.sideAngle) + 1) + " 面朝外", cx, cy + R + 14);
  }

  /* ③ 惯转曲线 ψ(τ) */
  function drawDecay(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var x0 = 30, ww = w - 44, y0 = 10, hh = h - 34;
    function xOf(t) { return x0 + t / D.coastT * ww; }
    function yOf(v) { return y0 + (1 - v / D.coastAngle) * hh; }
    ctx.strokeStyle = faint; ctx.lineWidth = 1;
    ctx.strokeRect(x0, y0, ww, hh);
    /* 曲线 */
    ctx.strokeStyle = teal; ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (var i = 0; i <= 60; i++) {
      var t = i / 60 * D.coastT;
      var v = KS.coastPsi(t);
      if (i === 0) ctx.moveTo(xOf(t), yOf(v)); else ctx.lineTo(xOf(t), yOf(v));
    }
    ctx.stroke();
    /* 渐近线 */
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = faint;
    ctx.beginPath(); ctx.moveTo(x0, yOf(D.coastAngle)); ctx.lineTo(x0 + ww, yOf(D.coastAngle)); ctx.stroke();
    ctx.setLineDash([]);
    /* 当前推后时间(近似:取 ψ 反查) */
    var psi = st.psi || 0;
    var tau = psi > 0 ? -Math.log(1 - psi * D.k / D.omega0) / D.k : 0;
    if (tau > 0 && tau < D.coastT) {
      ctx.strokeStyle = yellow; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(xOf(tau), y0); ctx.lineTo(xOf(tau), y0 + hh); ctx.stroke();
      ctx.fillStyle = yellow;
      ctx.beginPath(); ctx.arc(xOf(tau), yOf(KS.coastPsi(tau)), 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = soft;
    ctx.font = "600 7px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("0", x0 - 10, y0 + hh + 3);
    ctx.fillText("τ 30s", x0 + ww - 16, y0 + hh + 3);
    ctx.fillText("ψ 13.6 rad(>2 圈)", x0 + ww - 60, yOf(D.coastAngle) - 4);
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
    ctx.fillText("ψ " + (st.psi || 0).toFixed(1) + " rad", x0 + ww, y1 + hh1 + 14);
  }
})(window.MECH = window.MECH || {});
