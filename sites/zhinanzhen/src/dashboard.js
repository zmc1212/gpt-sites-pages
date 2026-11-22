/* 底部仪表盘:① 罗盘针位 ② 摆动曲线 ③ 收敛判据 ④ 四法对比 */
(function (MECH) {
  var D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)", faint = "rgba(233,238,242,0.16)";
  var teal = "#7FD8D8", yellow = "#E9C93C", green = "#6FBF73";

  MECH.DASH = { panels: [
    { title: "ROSE · 针位", meta: "24 向罗盘", dot: "teal", canvasH: 100, draw: drawRose },
    { title: "SWING · 摆动", meta: "θ(t) 曲线", dot: "blue", canvasH: 88, draw: drawSwing },
    { title: "SETTLE · 收敛", meta: "±1°×1.2s 判据", dot: "pink", canvasH: 100, draw: drawSettle },
    { title: "FOUR · 四法", meta: "沈括", dot: "yellow", canvasH: 66, draw: drawFour }
  ] };

  function drawRose(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.5, R = Math.min(cy, cx) - 10;
    ctx.strokeStyle = "rgba(233,238,242,0.30)"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    for (var i = 0; i < 24; i++) {
      var a = i / 24 * Math.PI * 2;
      var major = i % 6 === 0;
      ctx.strokeStyle = major ? "rgba(233,238,242,0.6)" : faint;
      ctx.lineWidth = major ? 1.6 : 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.sin(a) * R * 0.86, cy - Math.cos(a) * R * 0.86);
      ctx.lineTo(cx + Math.sin(a) * R, cy - Math.cos(a) * R);
      ctx.stroke();
      if (major) {
        var names = ["北","东","南","西"];
        var k = i / 6;
        ctx.fillStyle = soft; ctx.font = "700 9px sans-serif"; ctx.textAlign = "center";
        var nx = cx + Math.sin(a) * R * 0.74, ny = cy - Math.cos(a) * R * 0.74;
        ctx.fillText(names[k], nx, ny + 3);
      }
    }
    /* 针(白:北端;红:南端)+ 偏东角 */
    var th = st.theta;
    var dx = Math.sin(th), dy = Math.cos(th);
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - dx * R * 0.62, cy - dy * R * 0.62);
    ctx.lineTo(cx, cy); ctx.stroke();
    ctx.strokeStyle = red = "#D6543A"; 
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + dx * R * 0.62, cy + dy * R * 0.62);
    ctx.stroke();
    /* 磁南线(虚) */
    ctx.strokeStyle = yellow; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(D.eps) * R, cy + Math.cos(D.eps) * R); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("针角 " + (th * 57.3).toFixed(1) + "° · ε=3°", 8, 12);
    ctx.textAlign = "center";
    ctx.fillText("磁南", cx + Math.sin(D.eps) * R * 0.55, cy + Math.cos(D.eps) * R * 0.55 + 10);
  }

  function drawSwing(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var mid = h / 2;
    ctx.strokeStyle = faint; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
    var hist = st.hist || [];
    if (hist.length > 1) {
      ctx.strokeStyle = teal; ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (var i = 0; i < hist.length; i++) {
        var x = i / 219 * w;
        var y = mid - Math.max(-40, Math.min(40, hist[i])) / 40 * h * 0.4;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    /* 磁偏线 ε */
    var yE = mid - D.eps * 57.3 / 40 * h * 0.4;
    ctx.strokeStyle = yellow; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(0, yE); ctx.lineTo(w, yE); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("θ(t) 度 · 黄线=磁偏 ε 3°", 8, 12);
    ctx.fillText("T≈1.85s · ζω₀=2.6(欠阻尼)", 8, h - 5);
  }

  function drawSettle(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var d = Math.abs(st.theta - D.eps) * 57.3;
    var ok = d < 1;
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("|θ−磁南| = " + d.toFixed(2) + "°(判据 <1°)", 8, 14);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 18, w - 16, 10);
    ctx.fillStyle = ok ? green : "rgba(233,238,242,0.3)";
    ctx.fillRect(8, 18, (w - 16) * Math.min(1, st.settleT / 1.2), 10);
    ctx.textAlign = "center";
    ctx.fillStyle = (ok && st.settleT > 1.2) ? green : soft;
    ctx.font = "700 9px Menlo, monospace";
    ctx.fillText(ok && st.settleT > 1.2 ? "收敛 ✓" : (ok ? "保持中 " + st.settleT.toFixed(1) + "s" : "偏离"), w / 2, h - 4);
  }

  function drawFour(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var rows = [["水浮", "多荡摇 · 便于航海", st.mode === "sway"],
                ["指爪", "运转尤速 · 易坠", false],
                ["碗唇", "可为之 · 坚滑", false],
                ["缕悬", "「不若缕悬为最善」", false]];
    ctx.font = "600 8.5px sans-serif";
    rows.forEach(function (r, i) {
      var y = 16 + i * 15;
      ctx.fillStyle = r[2] ? yellow : soft;
      ctx.textAlign = "left";
      ctx.fillText(r[0], 10, y);
      ctx.textAlign = "right";
      ctx.fillText(r[1], w - 10, y);
    });
  }
})(window.MECH = window.MECH || {});
