/* 底部仪表盘:① DRIVE 传动 ② GUIDE 移丝 ③ WIND 卷绕 ④ CYCLE 阶段时序 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.45)", faint = "rgba(233,238,242,0.16)";
  var yellow = "#E9C93C", teal = "#7FD8D8", red = "#D6543A", silkC = "#EDE4CC";
  var wood = "#B08D57";

  var STARTS = (function () {
    var acc = 0, arr = [];
    MECH.PHASES.forEach(function (ph) { arr.push(acc); acc += ph.dur; });
    arr.total = acc;
    return arr;
  })();

  MECH.DASH = { panels: [
    { title: "DRIVE · 传动", meta: "踏板-框同轴 1:1", dot: "yellow", canvasH: 100,
      draw: drawDrive },
    { title: "GUIDE · 移丝", meta: "行程 0.28m · sin ψ", dot: "green",
      html: '<div class="big" id="d-hz">0.235</div><div class="k">钩位 z m(0.095↔0.375)</div><div class="chip" id="d-chip">—</div>',
      canvasH: 92, init: initGuide, draw: drawGuide },
    { title: "WIND · 卷绕", meta: "框径 0.70m", dot: "blue", canvasH: 108,
      draw: drawWind },
    { title: "CYCLE · 阶段时序", meta: "46s 自动循环", dot: "orange", canvasH: 66,
      draw: drawCycle }
  ] };

  function initGuide(sec) {
    el.hz = sec.querySelector("#d-hz");
    el.chip = sec.querySelector("#d-chip");
  }

  /* ① 传动:踏板曲柄圆 + 框圆(实时同角) */
  function drawDrive(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cy = h * 0.52;
    /* 踏板曲柄(左) */
    var cx1 = 36, r1 = 15;
    ctx.strokeStyle = soft; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(cx1, cy, r1, 0, Math.PI * 2); ctx.stroke();
    var pa = st.psi + Math.PI;
    ctx.strokeStyle = yellow; ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx1, cy);
    ctx.lineTo(cx1 + Math.cos(pa) * r1, cy + Math.sin(pa) * r1);
    ctx.stroke();
    /* 框(右) */
    var cx2 = w * 0.62, r2 = Math.min(w * 0.16, h * 0.38);
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(cx2, cy, r2, 0, Math.PI * 2); ctx.stroke();
    for (var i = 0; i < 4; i++) {
      var a = st.psi + i / 4 * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx2 + Math.cos(a) * r2 * 0.15, cy + Math.sin(a) * r2 * 0.15);
      ctx.lineTo(cx2 + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      ctx.stroke();
    }
    /* 直驱连线 */
    ctx.strokeStyle = faint; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx1 + r1, cy); ctx.lineTo(cx2 - r2, cy); ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("踏板 2r=0.22", cx1, cy + r1 + 12);
    ctx.fillText("丝框 D=0.70", cx2, cy + r2 + 12);
    ctx.fillStyle = yellow;
    ctx.fillText("1:1 同轴", (cx1 + cx2) / 2, cy - 6);
  }

  /* ② 移丝:钩位正弦迹 + 当前点 */
  function drawGuide(st, ph, pt, ctx, w, h) {
    var hz = KS.hookZ(st.psi);
    if (el.hz) el.hz.textContent = hz.toFixed(3);
    if (el.chip) {
      var run = st.omega > 0.05;
      el.chip.textContent = run ? "往复中 · 与框同频 1:1" : "待机 · 钩居中";
      el.chip.className = "chip " + (run ? "on" : "");
    }
    ctx.clearRect(0, 0, w, h);
    var x0 = 8, ww = w - 16, y0 = 8, hh = h - 34;
    var zMin = D.hookZ0 - D.A, zMax = D.hookZ0 + D.A;
    function yOf(z) { return y0 + (1 - (z - zMin) / (zMax - zMin)) * hh; }
    ctx.strokeStyle = faint; ctx.lineWidth = 1;
    ctx.strokeRect(x0, y0, ww, hh);
    /* 正弦迹(以 ψ 为横轴) */
    ctx.strokeStyle = teal; ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (var i = 0; i <= 48; i++) {
      var psi = st.psi - 6.0 + i / 48 * 6.0;
      var xx = x0 + i / 48 * ww;
      var yy = yOf(KS.hookZ(psi));
      if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("0.095", x0 + 2, y0 + 9);
    ctx.fillText("0.375", x0 + 2, y0 + hh - 2);
    /* 当前点 */
    ctx.fillStyle = yellow;
    ctx.beginPath(); ctx.arc(x0 + ww - 3, yOf(hz), 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = soft;
    ctx.textAlign = "right";
    ctx.fillText("框宽 0.37m", x0 + ww, y0 + hh + 12);
  }

  /* ③ 卷绕:框面(端面)绕丝弧生长 */
  function drawWind(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.52, R = Math.min(w * 0.30, h * 0.40);
    /* 框面 + 十字 */
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    for (var i = 0; i < 4; i++) {
      var a = st.psi + i / 4 * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * R * 0.15, cy + Math.sin(a) * R * 0.15);
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      ctx.stroke();
    }
    /* 绕丝层:随 ψ 累计弧长(扇形渐密) */
    var turns = st.psi / (2 * Math.PI);
    var frac = KS.clamp(turns / 12, 0, 1);
    ctx.strokeStyle = silkC; ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.82, st.psi, st.psi + Math.PI * 1.6 * frac + 0.2);
    ctx.stroke();
    /* 移丝包络(虚线) */
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = faint;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.82, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("框转 " + turns.toFixed(1) + " 圈 · 卷绕渐密", cx, cy + R + 14);
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
    ctx.fillText("钩 z " + KS.hookZ(st.psi).toFixed(2), x0 + ww, y1 + hh1 + 14);
  }
})(window.MECH = window.MECH || {});
