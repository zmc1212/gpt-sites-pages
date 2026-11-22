/* 底部仪表盘:① 拉力-重量 ② ω 曲线 ③ 高度 ④ 史源 */
(function (MECH) {
  var D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)", faint = "rgba(233,238,242,0.16)";
  var teal = "#7FD8D8", yellow = "#E9C93C", red = "#D6543A", green = "#6FBF73";

  MECH.DASH = { panels: [
    { title: "THRUST · 拉力", meta: "T vs mg", dot: "teal", canvasH: 100, draw: drawThrust },
    { title: "OMEGA · 转速", meta: "悬停 35.7", dot: "blue", canvasH: 88, draw: drawOmega },
    { title: "ALT · 高度", meta: "升降", dot: "pink", canvasH: 100, draw: drawAlt },
    { title: "HIST · 史源", meta: "抱朴子+西传", dot: "yellow", canvasH: 66, draw: drawHist }
  ] };

  function drawThrust(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var T = st._F || D.Tof(st.omega);
    var mx = Math.max(T, D.W) * 1.25;
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("拉力 T = " + (T * 1000).toFixed(0) + " mN", 8, 14);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 18, w - 16, 10);
    ctx.fillStyle = T > D.W ? green : yellow;
    ctx.fillRect(8, 18, (w - 16) * T / mx, 10);
    ctx.fillText("重量 mg = 196 mN", 8, 40);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 44, w - 16, 10);
    ctx.fillStyle = soft; ctx.fillRect(8, 44, (w - 16) * D.W / mx, 10);
    ctx.textAlign = "center";
    ctx.fillStyle = T > D.W ? green : soft;
    ctx.fillText(T > D.W ? "T > mg ✓ 可升" : "T < mg 下落", w / 2, h - 4);
  }

  function drawOmega(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var hist = st.hist || [];
    var yH = h - 10 - (D.omegaHover / 135) * (h - 24);
    ctx.strokeStyle = yellow; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(0, yH); ctx.lineTo(w, yH); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = soft; ctx.textAlign = "right";
    ctx.fillText("悬停 " + D.omegaHover.toFixed(1), w - 8, yH - 3);
    if (hist.length > 1) {
      ctx.strokeStyle = teal; ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (var i = 0; i < hist.length; i++) {
        var x = i / 219 * w;
        var y = h - 10 - Math.min(135, hist[i]) / 135 * (h - 24);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = soft; ctx.textAlign = "left";
    ctx.fillText("ω " + st.omega.toFixed(0) + " rad/s(悬停 " + D.omegaHover.toFixed(0) + ")", 8, 12);
  }

  function drawAlt(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var gx = w * 0.35, gy = h - 12, S = (h - 26) / 1.6;
    ctx.strokeStyle = "rgba(233,238,242,0.35)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy - 1.6 * S); ctx.stroke();
    var ly = gy - Math.min(1.6, st.alt) * S;
    ctx.fillStyle = "#C9A86B";
    ctx.beginPath(); ctx.arc(gx + 10, ly, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("高度 " + st.alt.toFixed(2) + " m · 速 " + st.vel.toFixed(2) + " m/s", 8, 12);
    ctx.fillText(st.inHand ? "掌上" : "空中", 8, h - 5);
    ctx.textAlign = "right";
    ctx.fillText("翼展 R 8cm", w - 8, 12);
  }

  function drawHist(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = soft; ctx.font = "600 8px sans-serif"; ctx.textAlign = "left";
    ctx.fillText("《抱朴子·杂应》飞车(传说)", 8, 14);
    ctx.fillText("1784 法国科学院「中国陀螺」", 8, 28);
    ctx.fillText("1796 凯利发条旋翼模型", 8, 42);
    ctx.fillStyle = yellow; ctx.textAlign = "right";
    ctx.fillText("直升机史前史", w - 8, 28);
    ctx.fillStyle = faint; ctx.textAlign = "center";
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.fillText("本体明代前无直接文字(口径明示)", w / 2, h - 4);
  }
})(window.MECH = window.MECH || {});
