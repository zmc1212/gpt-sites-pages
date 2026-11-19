/* 底部仪表盘:① DRIVE 传动链 ② SPEED 锭速 ③ WHEEL 水轮 ④ CYCLE 阶段时序 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.45)", faint = "rgba(233,238,242,0.16)";
  var yellow = "#E9C93C", teal = "#7FD8D8", red = "#D6543A", waterC = "#8FCBE8";
  var wood = "#B08D57";

  var STARTS = (function () {
    var acc = 0, arr = [];
    MECH.PHASES.forEach(function (ph) { arr.push(acc); acc += ph.dur; });
    arr.total = acc;
    return arr;
  })();

  MECH.DASH = { panels: [
    { title: "DRIVE · 传动链", meta: "i = 0.448/0.032 = 14", dot: "yellow", canvasH: 96,
      draw: drawDrive },
    { title: "SPEED · 锭速", meta: "ω锭 = 14·ω轮", dot: "green",
      html: '<div class="big" id="d-sp">0.0</div><div class="k">锭速 rad/s(1.11 转/s)</div><div class="chip" id="d-chip">—</div>',
      canvasH: 66, init: initSpeed, draw: drawSpeed },
    { title: "WHEEL · 水轮", meta: "径 2.6m · 12 桨", dot: "blue", canvasH: 108,
      draw: drawWheel },
    { title: "CYCLE · 阶段时序", meta: "45.5s 自动循环", dot: "orange", canvasH: 66,
      draw: drawCycle }
  ] };

  function initSpeed(sec) {
    el.sp = sec.querySelector("#d-sp");
    el.chip = sec.querySelector("#d-chip");
  }

  /* ① 传动链:大绳轮端面 + 弦 + 锭盘端面,实时角 */
  function drawDrive(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cy = h * 0.5;
    /* 大绳轮(左) */
    var cx1 = 34, R1 = 24;
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(cx1, cy, R1, 0, Math.PI * 2); ctx.stroke();
    for (var i = 0; i < 6; i++) {
      var a = st.psiW + i / 6 * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx1 + Math.cos(a) * R1 * 0.2, cy + Math.sin(a) * R1 * 0.2);
      ctx.lineTo(cx1 + Math.cos(a) * R1, cy + Math.sin(a) * R1);
      ctx.stroke();
    }
    /* 弦(下缘直列) */
    ctx.strokeStyle = wood; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(cx1 + R1 * 0.85, cy + R1 * 0.5); ctx.lineTo(70, cy + 6); ctx.lineTo(w - 14, cy + 6); ctx.stroke();
    /* 锭盘(右,8 只端面小圆 ×14 角) */
    for (var j = 0; j < 4; j++) {
      var cx2 = 78 + j * 30, R2 = 7;
      ctx.strokeStyle = j === 0 ? yellow : soft;
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(cx2, cy + 6, R2, 0, Math.PI * 2); ctx.stroke();
      var a2 = st.psiW * D.i + j;
      ctx.beginPath();
      ctx.moveTo(cx2 + Math.cos(a2) * R2 * 0.2, cy + 6 + Math.sin(a2) * R2 * 0.2);
      ctx.lineTo(cx2 + Math.cos(a2) * R2, cy + 6 + Math.sin(a2) * R2);
      ctx.stroke();
    }
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("大绳轮 0.448", cx1 - 22, cy - R1 - 6);
    ctx.fillText("锭盘 ×8 · r 0.032", 74, cy + 24);
    ctx.fillStyle = yellow;
    ctx.fillText("i = 14", w - 40, cy - 14);
  }

  /* ② 锭速读数 */
  function drawSpeed(st, ph, pt, ctx, w, h) {
    var sp = st.omegaW * D.i;
    if (el.sp) {
      el.sp.textContent = sp.toFixed(1);
      el.sp.style.color = sp > 0.05 ? "#6FBF73" : soft;
    }
    if (el.chip) {
      var run = sp > 0.05;
      el.chip.textContent = run ? "纺纱中 · 8 锭同向" : "待机 · 弦未张";
      el.chip.className = "chip " + (run ? "on" : "");
    }
    ctx.clearRect(0, 0, w, h);
    var bx = 8, bw = w - 16, cy = h * 0.55;
    ctx.fillStyle = "rgba(233,238,242,0.10)";
    ctx.fillRect(bx, cy - 5, bw, 10);
    ctx.fillStyle = teal;
    ctx.fillRect(bx, cy - 5, bw * KS.clamp(sp / 7.0, 0, 1), 10);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("ω锭 = 14 × ω轮 = 14 × 0.50 = 7.0 rad/s(设计)", bx, cy + 16);
  }

  /* ③ 水轮侧视(端面):轮辋 + 桨 + 水面,实时角 */
  function drawWheel(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.46, R = Math.min(w, h * 2.2) * 0.30;
    function pxy(a, r) { return [cx + Math.sin(a) * r, cy - Math.cos(a) * r]; }
    /* 水面 */
    var wy = cy + R * (1 - 0.08 / D.RWheel);
    ctx.fillStyle = "rgba(143,203,232,0.30)";
    ctx.fillRect(6, wy, w - 12, h - wy - 4);
    ctx.strokeStyle = waterC; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(6, wy); ctx.lineTo(w - 6, wy); ctx.stroke();
    /* 轮辋 + 桨(实时) */
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.2, 0, Math.PI * 2); ctx.stroke();
    for (var i = 0; i < D.NP; i++) {
      var a = st.psiW + i / D.NP * Math.PI * 2;
      var p0 = pxy(a, R * 0.28), p1 = pxy(a, R);
      ctx.strokeStyle = wood; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
    }
    /* 浸深标注 */
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("浸深 0.08m", cx + R * 0.5, wy + 10);
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
    ctx.fillText("ψ " + st.psiW.toFixed(2) + " rad", x0 + ww, y1 + hh1 + 14);
  }
})(window.MECH = window.MECH || {});
