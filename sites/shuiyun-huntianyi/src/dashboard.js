/* 底部仪表盘:① TRAIN 三级齿轮 ② DAY 日转进度 ③ LEAF 蓂荚 ④ CYCLE 阶段时序 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.45)", faint = "rgba(233,238,242,0.16)";
  var yellow = "#E9C93C", teal = "#7FD8D8", red = "#D6543A", starC = "#7FA8E8";
  var wood = "#B08D57";

  var STARTS = (function () {
    var acc = 0, arr = [];
    MECH.PHASES.forEach(function (ph) { arr.push(acc); acc += ph.dur; });
    arr.total = acc;
    return arr;
  })();

  MECH.DASH = { panels: [
    { title: "TRAIN · 三级齿轮", meta: "3.5×4×2 = 28", dot: "yellow", canvasH: 96,
      draw: drawTrain },
    { title: "DAY · 日转", meta: "72s/转 ×1200 = 一日", dot: "green",
      html: '<div class="big" id="d-d">0%</div><div class="k">浑象日转进度(一转 = 一日)</div><div class="chip" id="d-chip">—</div>',
      canvasH: 78, init: initDay, draw: drawDay },
    { title: "LEAF · 蓂荚", meta: "15 叶 · 4.8s/叶", dot: "blue", canvasH: 108,
      draw: drawLeaf },
    { title: "CYCLE · 阶段时序", meta: "54.5s 自动循环", dot: "orange", canvasH: 66,
      draw: drawCycle }
  ] };

  function initDay(sec) {
    el.d = sec.querySelector("#d-d");
    el.chip = sec.querySelector("#d-chip");
  }

  /* ① 三级齿轮端面(实时角,方向交替) */
  function drawTrain(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cy = h * 0.5;
    var psiW = st.psiW || 0;
    var psiA = -psiW / 3.5, psiB = -psiA / 4, psiG = -psiW / D.iTotal;
    var omW = st.omegaW || 0;
    var omA = -omW / 3.5, omB = -omA / 4, omG = -omW / D.iTotal;
    /* 六齿轮横排:轮1 大 / 轮2 小 / 轮3 大 / 轮4 小 / 轮5 中 / 轮6 小 */
    var rs = [0.30, 0.098, 0.32, 0.08, 0.16, 0.08];
    var omegas = [omW, omA, omA, omB, omB, omG];
    var angs = [psiW, psiA, psiA, psiB, psiB, psiG];
    var xs = [26, 58, 92, 126, 158, 190];
    var S = 60;
    for (var i = 0; i < 6; i++) {
      var r = Math.max(rs[i] * S, 6);
      ctx.strokeStyle = i === 0 ? yellow : (i === 5 ? teal : soft);
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(xs[i], cy, r, 0, Math.PI * 2); ctx.stroke();
      var a0 = angs[i];
      ctx.beginPath();
      ctx.moveTo(xs[i], cy);
      ctx.lineTo(xs[i] + Math.cos(a0) * r, cy + Math.sin(a0) * r);
      ctx.stroke();
    }
    /* 速比标注 */
    ctx.fillStyle = soft;
    ctx.font = "600 7px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("28T", 26, cy - Math.max(rs[0] * S, 6) - 4);
    ctx.fillText("8T", 58, cy + Math.max(rs[1] * S, 6) + 10);
    ctx.fillText("32T", 92, cy - Math.max(rs[2] * S, 6) - 4);
    ctx.fillText("8T", 126, cy + Math.max(rs[3] * S, 6) + 10);
    ctx.fillText("16T", 158, cy - Math.max(rs[4] * S, 6) - 4);
    ctx.fillText("8T", 190, cy + Math.max(rs[5] * S, 6) + 10);
    ctx.fillStyle = yellow;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.fillText("i = 3.5 × 4 × 2 = 28", w / 2, 10);
  }

  /* ② 日转进度 */
  function drawDay(st, ph, pt, ctx, w, h) {
    var frac = ((st.psiW || 0) / D.iTotal / (2 * Math.PI)) % 1;
    if (el.d) el.d.textContent = Math.round(frac * 100) + "%";
    if (el.chip) {
      var run = (st.omegaW || 0) > 0.05;
      el.chip.textContent = run ? "运转中 · 漏水恒流" : "待机 · 未引水";
      el.chip.className = "chip " + (run ? "on" : "");
    }
    ctx.clearRect(0, 0, w, h);
    var bx = 8, bw = w - 16, cy = h * 0.45;
    ctx.fillStyle = "rgba(233,238,242,0.10)";
    ctx.fillRect(bx, cy - 6, bw, 12);
    ctx.fillStyle = starC;
    ctx.fillRect(bx, cy - 6, bw * frac, 12);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("72s × 1200 = 86400s = 一日(严格)", bx, cy + 18);
    ctx.textAlign = "right";
    ctx.fillText("ω浑 " + ((st.omegaW || 0) / D.iTotal).toFixed(3), bx + bw, cy - 12);
  }

  /* ③ 蓂荚:15 叶升起状态(圆周) */
  function drawLeaf(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.48, R = Math.min(w, h) * 0.36;
    var psiL = (st.psiW || 0) / D.iTotal / D.leafN;
    var phase = (psiL % 1) * D.leafN;
    ctx.strokeStyle = soft; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.55, 0, Math.PI * 2); ctx.stroke();
    for (var i = 0; i < D.leafN; i++) {
      var a = i / D.leafN * Math.PI * 2 - Math.PI / 2;
      var up = KS.clamp(phase - i, 0, 1);
      var rr = R * (0.55 + up * 0.38);
      ctx.strokeStyle = up > 0.5 ? yellow : (up > 0 ? teal : soft);
      ctx.lineWidth = up > 0 ? 2.4 : 1.2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * R * 0.55, cy + Math.sin(a) * R * 0.55);
      ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      ctx.stroke();
    }
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("叶 " + Math.round(phase) + " / 15 升起中", cx, cy + R + 16);
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
    ctx.fillText("ψW " + (st.psiW || 0).toFixed(1) + " rad", x0 + ww, y1 + hh1 + 14);
  }
})(window.MECH = window.MECH || {});
