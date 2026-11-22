/* 底部仪表盘:① 自转转速 ② 进动曲线(Ω∝1/ω) ③ 稳定判据 ④ 鞭击记录 */
(function (MECH) {
  var D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)", faint = "rgba(233,238,242,0.16)";
  var teal = "#7FD8D8", yellow = "#E9C93C", red = "#D6543A", green = "#6FBF73";

  MECH.DASH = { panels: [
    { title: "SPIN · 自转", meta: "阈值 598rpm", dot: "teal", canvasH: 100, draw: drawSpin },
    { title: "PRECESS · 进动", meta: "Ω=mgr/(Iω)", dot: "blue", canvasH: 88, draw: drawPrecess },
    { title: "STABILITY · 判据", meta: "ω²>4mgr/I", dot: "pink", canvasH: 100, draw: drawStab },
    { title: "WHIP · 鞭击", meta: "Δω 42/鞭", dot: "yellow", canvasH: 66, draw: drawWhip }
  ] };

  function drawSpin(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var rpm = st.omega * 60 / (2 * Math.PI);
    var f = Math.min(1, rpm / 600);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("自转 " + rpm.toFixed(0) + " rpm(" + st.omega.toFixed(0) + " rad/s)", 8, 12);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 16, w - 16, 10);
    ctx.fillStyle = rpm >= 598 ? green : (st.fallen ? red : yellow);
    ctx.fillRect(8, 16, (w - 16) * f, 10);
    var xc = 8 + (w - 16) * (598 / 600);
    ctx.strokeStyle = yellow; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(xc, 14); ctx.lineTo(xc, 28); ctx.stroke();
    ctx.fillStyle = soft; ctx.textAlign = "center";
    ctx.fillText(st.fallen ? "已倒" : (rpm >= 598 ? "睡陀螺 ✓「卓立地上」" : "缓·进动加快"), w / 2, h - 4);
  }

  function drawPrecess(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var hist = st.hist || [];
    /* Ω(ω) 理论曲线 + 当前点 */
    var cx = w * 0.5, cy = h * 0.55, R = Math.min(cy, cx) - 10;
    ctx.strokeStyle = "rgba(233,238,242,0.25)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(8, cy); ctx.lineTo(w - 8, cy); ctx.stroke();
    ctx.strokeStyle = "rgba(127,216,216,0.5)"; ctx.lineWidth = 1.4;
    ctx.beginPath();
    var plotted = false;
    for (var wv = 30; wv <= 400; wv += 8) {
      var O = D.OmegaOf(wv);
      var x = 8 + (wv - 30) / 370 * (w - 16);
      var y = cy - Math.min(1, O / 12) * (h - 30);
      if (!plotted) { ctx.moveTo(x, y); plotted = true; } else ctx.lineTo(x, y);
    }
    ctx.stroke();
    /* 当前点 */
    var xo = 8 + (st.omega - 30) / 370 * (w - 16);
    var yo = cy - Math.min(1, D.OmegaOf(Math.max(st.omega, 30)) / 12) * (h - 30);
    ctx.fillStyle = yellow;
    ctx.beginPath(); ctx.arc(Math.max(8, Math.min(w - 8, xo)), Math.max(8, yo), 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("Ω " + D.OmegaOf(st.omega).toFixed(2) + " rad/s(∝1/ω 双曲线)", 8, 12);
    ctx.fillText("ω→", w - 30, cy + 10);
  }

  function drawStab(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var ok = st.omega > D.omegaCrit && !st.fallen;
    var f = Math.min(1, st.omega / D.omegaCrit);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("ω² vs 4mgr/I = " + (D.omegaCrit * D.omegaCrit).toFixed(0), 8, 12);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 16, w - 16, 10);
    ctx.fillStyle = ok ? green : red;
    ctx.fillRect(8, 16, (w - 16) * f, 10);
    /* 轴倾角 */
    ctx.fillText("轴倾角 " + (st.tilt * 57.3).toFixed(1) + "°(稳态 8°)", 8, 40);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 44, w - 16, 9);
    ctx.fillStyle = st.fallen ? red : teal;
    ctx.fillRect(8, 44, (w - 16) * Math.min(1, st.tilt / D.fallTilt), 9);
    ctx.textAlign = "center";
    ctx.fillStyle = st.fallen ? red : (ok ? green : yellow);
    ctx.font = "700 9px Menlo, monospace";
    ctx.fillText(st.fallen ? "「转缓则倾」倒" : (ok ? "睡陀螺稳定 ✓" : "倾倒中…"), w / 2, h - 4);
  }

  function drawWhip(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("鞭击 " + st.whips + " 次 · 每鞭 Δω 42 rad/s", 8, 14);
    ctx.fillText("「视其缓而鞭之,转转无复住」", 8, 28);
    ctx.textAlign = "center";
    ctx.fillStyle = st.omega > 5 ? teal : soft;
    ctx.fillText(st.omega > 5 ? "旋" : "停", w / 2, h - 4);
  }
})(window.MECH = window.MECH || {});
