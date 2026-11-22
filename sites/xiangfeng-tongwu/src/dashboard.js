/* 底部仪表盘:① VANE 乌向 ② WIND 风向 ③ TRACE 响应迹 ④ CYCLE 阶段时序 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.45)", faint = "rgba(233,238,242,0.16)";
  var yellow = "#E9C93C", teal = "#7FD8D8", red = "#D6543A";
  var bronze = "#B08D57";

  var STARTS = (function () {
    var acc = 0, arr = [];
    MECH.PHASES.forEach(function (ph) { arr.push(acc); acc += ph.dur; });
    arr.total = acc;
    return arr;
  })();

  MECH.DASH = { panels: [
    { title: "VANE · 乌向", meta: "乌首指风来向", dot: "yellow", canvasH: 112,
      draw: drawVane },
    { title: "WIND · 对风", meta: "稳态误差 → 0", dot: "green",
      html: '<div class="big" id="d-e">0.00°</div><div class="k">|θv − θw| 当前误差</div><div class="chip" id="d-chip">—</div>',
      canvasH: 78, init: initWind, draw: drawWind },
    { title: "TRACE · 响应迹", meta: "θv/θw 时序", dot: "blue", canvasH: 108,
      draw: drawTrace },
    { title: "CYCLE · 阶段时序", meta: "46.5s 自动循环", dot: "orange", canvasH: 66,
      draw: drawCycle }
  ] };

  function initWind(sec) {
    el.e = sec.querySelector("#d-e");
    el.chip = sec.querySelector("#d-chip");
  }

  /* ① 乌向罗盘:方位盘 + 乌首针 + 风向针 */
  function drawVane(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.52, R = Math.min(w, h) * 0.40;
    ctx.strokeStyle = soft; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    for (var i = 0; i < 24; i++) {
      var a = i / 24 * Math.PI * 2;
      ctx.strokeStyle = i % 3 === 0 ? soft : faint;
      ctx.lineWidth = i % 3 === 0 ? 1.4 : 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.sin(a) * R * 0.9, cy - Math.cos(a) * R * 0.9);
      ctx.lineTo(cx + Math.sin(a) * R, cy - Math.cos(a) * R);
      ctx.stroke();
    }
    ctx.fillStyle = soft;
    ctx.font = "700 9px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("北", cx, cy - R + 12);
    ctx.fillText("南", cx, cy + R - 4);
    /* 风向针(细,白) */
    var wx = Math.sin(st.thetaW), wy = Math.cos(st.thetaW);
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - wx * R * 0.2, cy + wy * R * 0.2);
    ctx.lineTo(cx + wx * R * 0.72, cy - wy * R * 0.72);
    ctx.stroke();
    /* 乌首针(粗,金) */
    var vx = Math.sin(st.thetaV), vy = Math.cos(st.thetaV);
    ctx.strokeStyle = yellow; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - vx * R * 0.35, cy + vy * R * 0.35);
    ctx.lineTo(cx + vx * R * 0.62, cy - vy * R * 0.62);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + vx * R * 0.62, cy - vy * R * 0.62, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = soft;
    ctx.font = "600 7px Menlo, monospace";
    ctx.fillText("风", cx + wx * R * 0.78, cy - wy * R * 0.78 + 3);
    ctx.fillText("乌", cx + vx * R * 0.70, cy - vy * R * 0.70 + 3);
  }

  /* ② 对风误差 */
  function drawWind(st, ph, pt, ctx, w, h) {
    var err = Math.abs(KS.deg(st.thetaV - st.thetaW));
    if (el.e) {
      el.e.textContent = err.toFixed(2) + "°";
      el.e.style.color = err < 0.5 ? "#6FBF73" : (err < 3 ? "#E9C93C" : red);
    }
    if (el.chip) {
      var settling = err >= 0.5;
      el.chip.textContent = settling ? "对风中 · 欠阻尼过冲" : "锁定 · 乌首指风";
      el.chip.className = "chip " + (settling ? "hot" : "on");
    }
    ctx.clearRect(0, 0, w, h);
    var bx = 8, bw = w - 16, cy = h * 0.5;
    ctx.fillStyle = "rgba(233,238,242,0.10)";
    ctx.fillRect(bx, cy - 5, bw, 10);
    ctx.fillStyle = teal;
    ctx.fillRect(bx, cy - 5, bw * KS.clamp(1 - err / 30, 0, 1), 10);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("ζω = 1.6 · ωd = 2.4 · 稳态误差 0(解析)", bx, cy + 18);
  }

  /* ③ 响应迹:θv(金)/ θw(白) 时序 */
  function drawTrace(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var x0 = 8, ww = w - 16, y0 = 8, hh = h - 30;
    ctx.strokeStyle = faint; ctx.lineWidth = 1;
    ctx.strokeRect(x0, y0, ww, hh);
    ctx.strokeStyle = faint;
    ctx.beginPath(); ctx.moveTo(x0, y0 + hh / 2); ctx.lineTo(x0 + ww, y0 + hh / 2); ctx.stroke();
    /* 重放最近 6s:直接按解析公式重算 */
    var phId = MECH.Timeline.phaseId;
    var cur = MECH.PHASES[MECH.PHASES.map(function (p) { return p.id; }).indexOf(phId)];
    var gt = STARTS[MECH.PHASES.indexOf(cur)] + (MECH.Timeline.state ? pt : 0);
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 1.2;
    ctx.beginPath();
    var started = false;
    for (var i = 0; i <= 60; i++) {
      var tt = gt - 6.0 + i / 60 * 6.0;
      if (tt < 0) continue;
      /* 反推该时刻所在阶段(仅支持当前阶段近似) */
      var pt2 = tt - STARTS[MECH.PHASES.indexOf(cur)];
      if (pt2 < 0 || pt2 > cur.dur) continue;
      var tw = KS.windDir(cur, pt2);
      var xx = x0 + i / 60 * ww;
      var yy = y0 + hh / 2 - KS.clamp(KS.deg(tw) / 100, -1, 1) * hh / 2;
      if (!started) { ctx.moveTo(xx, yy); started = true; } else ctx.lineTo(xx, yy);
    }
    ctx.stroke();
    /* 当前点 */
    var vy2 = y0 + hh / 2 - KS.clamp(KS.deg(st.thetaV) / 100, -1, 1) * hh / 2;
    var vx2 = x0 + ww - 3;
    ctx.fillStyle = yellow;
    ctx.beginPath(); ctx.arc(vx2, vy2, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = soft;
    ctx.font = "600 7px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("+90°", x0 + 2, y0 + 9);
    ctx.fillText("−90°", x0 + 2, y0 + hh - 2);
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
    ctx.fillText("误差 " + Math.abs(KS.deg(st.thetaV - st.thetaW)).toFixed(1) + "°", x0 + ww, y1 + hh1 + 14);
  }
})(window.MECH = window.MECH || {});
