/* 底部仪表盘:① PISTON 双活塞 ② JET 喷速 ③ OIL 油量 ④ CYCLE 阶段时序 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.45)", faint = "rgba(233,238,242,0.16)", faint2 = faint;
  var yellow = "#E9C93C", teal = "#7FD8D8", red = "#D6543A";
  var bronze = "#B08D57", fireC = "#E98C2C", wood = "#B08D57";

  var STARTS = (function () {
    var acc = 0, arr = [];
    MECH.PHASES.forEach(function (ph) { arr.push(acc); acc += ph.dur; });
    arr.total = acc;
    return arr;
  })();

  MECH.DASH = { panels: [
    { title: "PISTON · 双活塞", meta: "反相 ±0.11m", dot: "yellow", canvasH: 104,
      draw: drawPiston },
    { title: "JET · 喷速", meta: "v = k·v活 · k=14.06", dot: "green",
      html: '<div class="big" id="d-j">0.0</div><div class="k">喷速 m/s(增压 14:1)</div><div class="chip" id="d-chip">—</div>',
      canvasH: 74, init: initJet, draw: drawJet },
    { title: "OIL · 油量", meta: "柜内余量", dot: "blue", canvasH: 108,
      draw: drawOil },
    { title: "CYCLE · 阶段时序", meta: "48.5s 自动循环", dot: "orange", canvasH: 66,
      draw: drawCycle }
  ] };

  function initJet(sec) {
    el.j = sec.querySelector("#d-j");
    el.chip = sec.querySelector("#d-chip");
  }

  /* ① 双活塞俯视:双筒 + 杆位(实时反相) */
  function drawPiston(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cy = h * 0.5;
    var psi = st.psi || 0;
    var off = (D.stroke / 2) * Math.sin(psi);
    var S = Math.min(w / 1.2, 60);
    var cx = w * 0.28;
    /* 双筒 */
    [-0.10, 0.10].forEach(function (z, i) {
      var y = cy + (i === 0 ? -14 : 14);
      ctx.strokeStyle = bronze; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx + 0.30 * S, y); ctx.stroke();
      /* 杆 + 把手 */
      var rx = cx + 0.16 * S + off * S * (i === 0 ? 1 : -1);
      ctx.strokeStyle = wood;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx + 0.14 * S, y); ctx.lineTo(rx, y); ctx.stroke();
      ctx.fillStyle = yellow;
      ctx.fillRect(rx, y - 5, 8, 10);
    });
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("油柜", cx - 0.15 * S, cy - 24);
    ctx.fillText("双筒推拉 · 反相 ±0.11m", cx + 0.30 * S, cy + 32);
    ctx.fillStyle = yellow;
    ctx.fillText("ψ " + KS.deg(psi % (2 * Math.PI)).toFixed(0) + "°", cx + 0.30 * S, cy - 24);
  }

  /* ② 喷速读数 */
  function drawJet(st, ph, pt, ctx, w, h) {
    var pump = st.pumping && st.ignited;
    var amt = pump ? Math.abs(Math.sin(st.psi || 0)) : 0;
    var v = D.vJet * amt;
    if (el.j) el.j.textContent = v.toFixed(1);
    if (el.chip) {
      el.chip.textContent = !st.ignited ? "火楼未点火" : (v > 1.5 ? "喷燃中 · 油流成炬" : (st.pumping ? "增压中" : "待喷"));
      el.chip.className = "chip " + (v > 1.5 ? "hot" : (st.ignited ? "on" : ""));
    }
    ctx.clearRect(0, 0, w, h);
    var bx = 8, bw = w - 16, cy = h * 0.5;
    ctx.fillStyle = "rgba(233,238,242,0.10)";
    ctx.fillRect(bx, cy - 5, bw, 10);
    ctx.fillStyle = fireC;
    ctx.fillRect(bx, cy - 5, bw * KS.clamp(v / D.vJet, 0, 1), 10);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("v_jet = k·v活 = 14.06 × 0.22 = 3.09 m/s", bx, cy + 18);
  }

  /* ③ 油量:柜剖面油面 */
  function drawOil(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var used = st.oilUsed || 0;
    var cx = w * 0.5, cy = h * 0.40, R = Math.min(w, h) * 0.30;
    ctx.strokeStyle = bronze; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    var level = 1 - used;
    ctx.fillStyle = "rgba(122,80,40,0.75)";
    ctx.beginPath();
    ctx.rect(cx - R + 2, cy + R - 2 - (2 * R - 4) * level, 2 * R - 4, (2 * R - 4) * level);
    ctx.fill();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("余油 " + Math.round(level * 100) + "%", cx, cy + R + 14);
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
    ctx.fillText("余油 " + (100 - Math.round((st.oilUsed || 0) * 100)) + "%", x0 + ww, y1 + hh1 + 14);
  }
})(window.MECH = window.MECH || {});
