/* 底部仪表盘:① 轮盘端视(扇格旋转+取字口) ② 推转惯量曲线 ③ 印版填充 ④ 统计 */
(function (MECH) {
  var D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)", faint = "rgba(233,238,242,0.16)";
  var teal = "#7FD8D8", yellow = "#E9C93C", green = "#6FBF73";

  MECH.DASH = { panels: [
    { title: "WHEEL · 轮面", meta: "8扇×5环 · 端视", dot: "teal", canvasH: 100, draw: drawWheel },
    { title: "PUSH · 推转", meta: "J=½MR² · τ≈10s", dot: "blue", canvasH: 88, draw: drawPush },
    { title: "PLATE · 印版", meta: "6×8 = 48 字", dot: "green", canvasH: 100, draw: drawPlate },
    { title: "STATS · 统计", meta: "盘面 280 格/面", dot: "yellow", canvasH: 66, draw: drawStats }
  ] };

  function drawWheel(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.5, R = Math.min(cy, cx) - 8;
    ctx.strokeStyle = "rgba(233,238,242,0.30)"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = faint;
    for (var r = 1; r <= 5; r++) {
      ctx.beginPath(); ctx.arc(cx, cy, R * r / 5, 0, Math.PI * 2); ctx.stroke();
    }
    for (var s = 0; s < 8; s++) {
      var a = st.thetaL + s / 8 * Math.PI * 2;
      ctx.strokeStyle = "rgba(233,238,242,0.4)"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
    }
    /* 取字口(正下方标记,面向操作者) */
    ctx.fillStyle = yellow;
    ctx.beginPath(); ctx.moveTo(cx, cy + R + 4); ctx.lineTo(cx - 5, cy + R - 4); ctx.lineTo(cx + 5, cy + R - 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("θ " + st.thetaL.toFixed(2) + " rad · Δθ 45°/扇", 8, 12);
    ctx.fillText("取字口", cx + 14, cy + R - 2);
  }

  function drawPush(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    /* ω 历史近似:锯齿-指数衰减 */
    var pts = 60;
    ctx.strokeStyle = teal; ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (var i = 0; i <= pts; i++) {
      var t = i / pts * D.pushPeriod;
      var omega = st.omegaL * Math.exp(t / D.tau) * (t > D.pushPeriod - 0.2 ? 0 : 1);
      var x = i / pts * w, y = h - 8 - omega / 1.4 * (h - 24);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("ω " + st.omegaL.toFixed(3) + " rad/s(推冲量 " + D.pushImpulse.toFixed(0) + " N·m·s → Δω " + D.omegaPush.toFixed(2) + ")", 8, 12);
    ctx.fillText("阻尼衰减 ω(t)=ω₀e^(−t/τ)", 8, h - 5);
  }

  function drawPlate(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cols = D.plateCols, rows = D.plateRows;
    var cw = (w - 24) / cols, ch = (h - 22) / rows;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var idx = r * cols + c;
        var filled = idx < st.plateCount;
        ctx.fillStyle = filled ? "#E7DCC2" : "rgba(233,238,242,0.10)";
        ctx.fillRect(12 + c * cw + 1, 10 + r * ch + 1, cw - 2, ch - 2);
        if (filled) {
          ctx.fillStyle = "#3A2E1C";
          ctx.font = "700 " + Math.min(14, ch - 3) + "px serif";
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("字", 12 + c * cw + cw / 2, 10 + r * ch + ch / 2);
        }
      }
    }
    ctx.textBaseline = "alphabetic";
  }

  function drawStats(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("盘面 " + D.cellsPerFace + " 格/面(8扇×5环×7列)×2 面", 8, 14);
    ctx.fillText("轮周长 C = πD = " + D.C.toFixed(2) + " m", 8, 28);
    ctx.fillText("扇步进 Δθ = 45° · 惯量 J = " + D.J.toFixed(1) + " kg·m²", 8, 42);
    ctx.fillText("印版 " + st.plateCount + "/" + (D.plateCols * D.plateRows) + " 字", 8, 56);
    ctx.textAlign = "right";
    ctx.fillText("以字就人", w - 8, 28);
  }
})(window.MECH = window.MECH || {});
