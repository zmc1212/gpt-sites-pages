/* 底部仪表盘:① 转速表(≥90rpm 判据) ② 拨-衰减曲线 ③ 泥料剖面成形 ④ 统计 */
(function (MECH) {
  var D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)", faint = "rgba(233,238,242,0.16)";
  var teal = "#7FD8D8", yellow = "#E9C93C", red = "#D6543A", green = "#6FBF73";

  MECH.DASH = { panels: [
    { title: "RPM · 转速", meta: "临界 90rpm", dot: "teal", canvasH: 100, draw: drawRpm },
    { title: "DECAY · 拨-衰减", meta: "τ=I/b", dot: "blue", canvasH: 88, draw: drawDecay },
    { title: "PROFILE · 泥料", meta: "筒→碗收口", dot: "pink", canvasH: 100, draw: drawProfile },
    { title: "STATS · 统计", meta: "I/τ/成形", dot: "yellow", canvasH: 66, draw: drawStats }
  ] };

  function drawRpm(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var rpm = st.omega * 60 / (2 * Math.PI);
    var f = Math.min(1, rpm / 130);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("转速 " + rpm.toFixed(0) + " rpm", 8, 12);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 16, w - 16, 10);
    ctx.fillStyle = rpm >= 90 ? green : red;
    ctx.fillRect(8, 16, (w - 16) * f, 10);
    var xc = 8 + (w - 16) * (90 / 130);
    ctx.strokeStyle = yellow; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(xc, 14); ctx.lineTo(xc, 28); ctx.stroke();
    ctx.fillStyle = rpm >= 90 ? green : red; ctx.font = "700 9px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText(rpm >= 90 ? "≥90rpm 可拉坯 ✓" : "<90rpm 仅慢轮修整", w / 2, h - 4);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("90", xc + 3, 36);
  }

  function drawDecay(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var hist = st.hist || [];
    var mid = h / 2;
    ctx.strokeStyle = "rgba(233,238,242,0.16)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
    if (hist.length > 1) {
      ctx.strokeStyle = teal; ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (var i = 0; i < hist.length; i++) {
        var x = i / 239 * w;
        var y = h - 8 - Math.min(1, hist[i] / D.omegaMax) * (h - 24);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      /* 临界线 */
      var yc = h - 8 - (D.omegaC / D.omegaMax) * (h - 24);
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = yellow;
      ctx.beginPath(); ctx.moveTo(0, yc); ctx.lineTo(w, yc); ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("拨冲量 " + D.pushTorque + "N·m×" + D.pushTime + "s → Δω " + D.dOmega.toFixed(2), 8, 12);
    ctx.fillText("周期 " + D.pushPeriod + "s · 衰减 ω̇=−bω/I", 8, h - 5);
  }

  function drawProfile(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var p = st.shape;
    var cx = w * 0.42, cy = h * 0.78, S = (h - 30) / 0.30;
    /* 转轴中心线 */
    ctx.strokeStyle = faint; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, 16); ctx.lineTo(cx, h - 12); ctx.stroke();
    /* 泥料半剖面(筒→碗收口) */
    ctx.strokeStyle = "#A9836B"; ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx + 0.02 * S, cy - 0.02 * S);
    for (var t = 0; t <= 1.001; t += 0.05) {
      var y = 0.06 + 0.13 * t + 0.03 * p * t;
      var r = 0.15 - 0.05 * p * t - 0.02 * p * (1 - t);
      ctx.lineTo(cx + Math.max(0.02, r) * S, cy - y * S);
    }
    ctx.stroke();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("半剖面 · 成形 " + (p * 100).toFixed(0) + "%", 8, 12);
    ctx.fillText("过利刀二次(文献)", 8, h - 5);
  }

  function drawStats(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("I = ½MR² = " + D.I.toFixed(2) + " kg·m²(M35 R0.34)", 8, 14);
    ctx.fillText("τ = I/b = " + D.tau.toFixed(1) + "s · 可用 " + D.tUsable.toFixed(1) + "s", 8, 28);
    ctx.fillText("稳态 ω " + D.omegaSS.toFixed(1) + " rad/s(" + (D.omegaSS * 60 / 6.283).toFixed(0) + "rpm)", 8, 42);
    ctx.fillText("成形 " + (st.shape * 100).toFixed(0) + "%", 8, 56);
    ctx.textAlign = "right";
    ctx.fillText("埋三尺 上高二尺", w - 8, 28);
  }
})(window.MECH = window.MECH || {});
