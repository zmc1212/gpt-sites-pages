/* 底部仪表盘:① CG 重心曲线 ② STATE 器态 ③ FLIP 倾覆 ④ CYCLE 阶段时序 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.45)", faint = "rgba(233,238,242,0.16)", faint2 = faint, wood = "#B08D57";
  var faint2 = "rgba(233,238,242,0.16)";
  var yellow = "#E9C93C", teal = "#7FD8D8", red = "#D6543A", green = "#6FBF73";

  var STARTS = (function () {
    var acc = 0, arr = [];
    MECH.PHASES.forEach(function (ph) { arr.push(acc); acc += ph.dur; });
    arr.total = acc;
    return arr;
  })();

  MECH.DASH = { panels: [
    { title: "CG · 重心曲线", meta: "yCG(f) 数值积分", dot: "yellow", canvasH: 112,
      draw: drawCG },
    { title: "STATE · 器态", meta: "虚欹/中正/满覆", dot: "green",
      html: '<div class="big" id="d-s">—</div><div class="k">f欹≈0.02 · f覆≈0.64</div><div class="chip" id="d-chip">—</div>',
      canvasH: 74, init: initState, draw: drawState },
    { title: "ANGLE · 倾角", meta: "−58° / 0° / 142°", dot: "blue", canvasH: 108,
      draw: drawAngle },
    { title: "CYCLE · 阶段时序", meta: "50s 自动循环", dot: "orange", canvasH: 66,
      draw: drawCycle }
  ] };

  function initState(sec) {
    el.s = sec.querySelector("#d-s");
    el.chip = sec.querySelector("#d-chip");
  }

  /* ① yCG(f) 曲线 + 零线 + 当前点(重心球可视化) */
  function drawCG(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var x0 = 30, ww = w - 46, y0 = 8, hh = h - 30;
    var yMin = -0.12, yMax = 0.12;
    function xOf(f) { return x0 + f * ww; }
    function yOf(v) { return y0 + (1 - (v - yMin) / (yMax - yMin)) * hh; }
    /* 不稳(上)/稳(下)区着色 */
    ctx.fillStyle = "rgba(214,84,58,0.10)";
    ctx.fillRect(x0, y0, ww, yOf(0) - y0);
    ctx.fillStyle = "rgba(111,191,115,0.10)";
    ctx.fillRect(x0, yOf(0), ww, y0 + hh - yOf(0));
    ctx.strokeStyle = faint2; ctx.lineWidth = 1;
    ctx.strokeRect(x0, y0, ww, hh);
    /* 零线 */
    ctx.strokeStyle = soft;
    ctx.beginPath(); ctx.moveTo(x0, yOf(0)); ctx.lineTo(x0 + ww, yOf(0)); ctx.stroke();
    /* yCG(f) 曲线 */
    ctx.strokeStyle = teal; ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (var i = 0; i <= 60; i++) {
      var f = i / 60;
      var s = KS.fillState(f);
      if (i === 0) ctx.moveTo(xOf(f), yOf(s.yCG)); else ctx.lineTo(xOf(f), yOf(s.yCG));
    }
    ctx.stroke();
    /* f欹/f覆 标线 */
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = soft;
    [D.fKai, D.fFu].forEach(function (f) {
      ctx.beginPath(); ctx.moveTo(xOf(f), y0); ctx.lineTo(xOf(f), y0 + hh); ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.fillStyle = soft;
    ctx.font = "600 7px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("不稳 yCG>0", x0 + 4, y0 + 9);
    ctx.fillText("稳 yCG<0", x0 + 4, y0 + hh - 4);
    ctx.textAlign = "center";
    ctx.fillText("f欹 " + D.fKai.toFixed(2), xOf(D.fKai), y0 + hh + 10);
    ctx.fillText("f覆 " + D.fFu.toFixed(2), xOf(D.fFu), y0 + hh + 10);
    /* 当前点 */
    var s2 = KS.fillState(st.fill || 0);
    ctx.fillStyle = s2.yCG > 0 ? red : green;
    ctx.beginPath(); ctx.arc(xOf(st.fill || 0), yOf(s2.yCG), 4.5, 0, Math.PI * 2); ctx.fill();
  }

  /* ② 器态读数 */
  function drawState(st, ph, pt, ctx, w, h) {
    var f = st.fill || 0;
    var s = KS.fillState(f);
    var state;
    if ((st.flip || 0) > 0) state = "满则覆";
    else if (f < 0.02) state = "虚则欹";
    else if (s.yCG > 0) state = "虚则欹";
    else if (f > D.fFu) state = "满则覆";
    else state = "中则正";
    if (el.s) {
      el.s.textContent = state;
      el.s.style.color = state === "满则覆" ? red : (state === "中则正" ? green : yellow);
    }
    if (el.chip) {
      el.chip.textContent = st.pouring ? "注水中 · f " + (f * 100 | 0) + "%" : "静置 · θ " + KS.vesselAngle(f, st.flip || 0).toFixed(0) + "°";
      el.chip.className = "chip " + (state === "满则覆" ? "hot" : "on");
    }
    ctx.clearRect(0, 0, w, h);
    var bx = 8, bw = w - 16, cy = h * 0.5;
    ctx.fillStyle = "rgba(233,238,242,0.10)";
    ctx.fillRect(bx, cy - 5, bw, 10);
    ctx.fillStyle = state === "满则覆" ? red : (state === "中则正" ? green : yellow);
    ctx.fillRect(bx, cy - 5, bw * f, 10);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("注水 " + (f * 100).toFixed(0) + "% · 壁 2.0kg@+0.08 · 水 ρ1000", bx, cy + 18);
  }

  /* ③ 倾角:器姿态小图(实时 θ) */
  function drawAngle(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.34, r = Math.min(w, h) * 0.30;
    var theta = KS.vesselAngle(st.fill || 0, st.flip || 0);
    var tr = KS.rad(theta);
    /* 枢点 + 器姿态(简化双锥) */
    ctx.strokeStyle = soft; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.stroke();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tr);
    ctx.strokeStyle = wood; ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(r * 0.18, 0);
    ctx.lineTo(r * 0.12, r * 0.62);
    ctx.stroke();
    ctx.strokeStyle = "#E9EEF2";
    ctx.beginPath(); ctx.moveTo(r * 0.12, r * 0.62); ctx.lineTo(r * 0.10, r * 0.66); ctx.stroke();
    ctx.restore();
    /* 止挡 */
    ctx.strokeStyle = faint;
    ctx.beginPath(); ctx.moveTo(cx + r * 0.52, cy + r * 0.9); ctx.lineTo(cx + r * 0.52, cy - r * 0.1); ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("θ " + theta.toFixed(1) + "°", cx, cy + r * 0.9 + 14);
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
      ctx.strokeStyle = i === idx ? yellow : faint2;
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
    ctx.fillText("f " + ((st.fill || 0) * 100 | 0) + "%", x0 + ww, y1 + hh1 + 14);
  }
})(window.MECH = window.MECH || {});
