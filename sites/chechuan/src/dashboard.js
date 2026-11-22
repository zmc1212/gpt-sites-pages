/* 底部仪表盘:① WHEEL 明轮 ② SAIL 航行 ③ CHAIN 传动 ④ CYCLE 阶段时序 */
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
    { title: "WHEEL · 明轮", meta: "r 0.55 · 浸深 0.05", dot: "yellow", canvasH: 108,
      draw: drawWheel },
    { title: "SAIL · 航行", meta: "v = ω·r 不滑移", dot: "green",
      html: '<div class="big" id="d-v">0.00</div><div class="k">船速 m/s(v = ω·r = 0.495)</div><div class="chip" id="d-chip">—</div>',
      canvasH: 78, init: initSail, draw: drawSail },
    { title: "CHAIN · 传动", meta: "同径链轮 i=1", dot: "blue", canvasH: 108,
      draw: drawChain },
    { title: "CYCLE · 阶段时序", meta: "49s 自动循环", dot: "orange", canvasH: 66,
      draw: drawCycle }
  ] };

  function initSail(sec) {
    el.v = sec.querySelector("#d-v");
    el.chip = sec.querySelector("#d-chip");
  }

  /* ① 明轮端面(实时 ψ,8 桨 + 浸水线) */
  function drawWheel(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.42, R = Math.min(w, h * 2.0) * 0.34;
    function pxy(a, r) { return [cx + Math.sin(a) * r, cy - Math.cos(a) * r]; }
    /* 水面 */
    var wy = cy + R * ((D.waterY - (D.wheelY - D.rWheel)) / D.rWheel);
    ctx.fillStyle = "rgba(143,203,232,0.30)";
    ctx.fillRect(6, wy, w - 12, h - wy - 4);
    ctx.strokeStyle = waterC; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(6, wy); ctx.lineTo(w - 6, wy); ctx.stroke();
    /* 轮 + 桨 */
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.2, 0, Math.PI * 2); ctx.stroke();
    for (var i = 0; i < D.NP; i++) {
      var a = st.psi + i / D.NP * Math.PI * 2;
      var p0 = pxy(a, R * 0.24), p1 = pxy(a, R);
      ctx.strokeStyle = wood; ctx.lineWidth = 3.4;
      ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
    }
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("浸深 0.05m", cx + R * 0.42, wy + 10);
    ctx.fillText("ψ " + (st.psi % 6.283).toFixed(1) + " rad", 8, 10);
  }

  /* ② 航速读数 + 航程 */
  function drawSail(st, ph, pt, ctx, w, h) {
    var v = st.v || 0;
    if (el.v) el.v.textContent = v.toFixed(2);
    if (el.chip) {
      el.chip.textContent = v > 0.05 ? "踏行中 · 不滑移" : (ph.id === "ready" ? "备航 · 待踏" : "停船");
      el.chip.className = "chip " + (v > 0.05 ? "on" : "");
    }
    ctx.clearRect(0, 0, w, h);
    var bx = 8, bw = w - 16, cy = h * 0.45;
    ctx.fillStyle = "rgba(233,238,242,0.10)";
    ctx.fillRect(bx, cy - 5, bw, 10);
    ctx.fillStyle = teal;
    ctx.fillRect(bx, cy - 5, bw * KS.clamp(v / D.vSail, 0, 1), 10);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("航程 " + (st.px || 0).toFixed(2) + " m · v = ω·r = 0.9×0.55", bx, cy + 18);
  }

  /* ③ 链传动:踏轴链轮 → 明轮链轮(端面双圆 + 链线) */
  function drawChain(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cy = h * 0.5;
    /* 踏轴链轮(左) */
    var cx1 = 40, R1 = 16;
    ctx.strokeStyle = soft; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(cx1, cy, R1, 0, Math.PI * 2); ctx.stroke();
    var a1 = st.psi;
    ctx.strokeStyle = yellow; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx1, cy);
    ctx.lineTo(cx1 + Math.cos(a1) * R1, cy + Math.sin(a1) * R1);
    ctx.stroke();
    /* 明轮链轮(右,同径) */
    var cx2 = w - 40, R2 = 16;
    ctx.beginPath(); ctx.arc(cx2, cy, R2, 0, Math.PI * 2); ctx.stroke();
    var a2 = st.psi;
    ctx.beginPath();
    ctx.moveTo(cx2, cy);
    ctx.lineTo(cx2 + Math.cos(a2) * R2, cy + Math.sin(a2) * R2);
    ctx.stroke();
    /* 链线(上下切线) */
    ctx.strokeStyle = wood; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(cx1, cy - R1); ctx.lineTo(cx2, cy - R2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx1, cy + R1); ctx.lineTo(cx2, cy + R2); ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("踏轴 i=1", cx1, cy + R1 + 12);
    ctx.fillText("明轮", cx2, cy + R2 + 12);
    ctx.fillStyle = yellow;
    ctx.fillText("同径直联 · 同速", (cx1 + cx2) / 2, cy - R1 - 4);
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
    ctx.fillText("航程 " + (st.px || 0).toFixed(1) + "m", x0 + ww, y1 + hh1 + 14);
  }
})(window.MECH = window.MECH || {});
