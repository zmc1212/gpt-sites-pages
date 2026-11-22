/* 底部仪表盘:① 像位投影( bowl 剖面) ② 太阳几何 ③ 网格读数 ④ 统计 */
(function (MECH) {
  var D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)", faint = "rgba(233,238,242,0.16)";
  var teal = "#7FD8D8", yellow = "#E9C93C", green = "#6FBF73";

  MECH.DASH = { panels: [
    { title: "PROJ · 投影", meta: "像距天顶", dot: "teal", canvasH: 100, draw: drawProj },
    { title: "SUN · 太阳", meta: "h 与方位", dot: "blue", canvasH: 88, draw: drawSun },
    { title: "GRID · 网格", meta: "节气×时辰", dot: "pink", canvasH: 100, draw: drawGrid },
    { title: "STATS · 尺寸", meta: "R1.5 像径14mm", dot: "yellow", canvasH: 66, draw: drawStats }
  ] };

  function drawProj(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    /* 子午剖面:釜弧 + 天顶点 + 针孔 + 像点 */
    var cx = w * 0.5, cy = h * 0.16, R = Math.min(w * 0.4, h * 0.72);
    ctx.strokeStyle = "rgba(233,238,242,0.35)"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI); ctx.stroke();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("天顶点(釜底)", cx, h - 4);
    /* 针孔(圆心) */
    ctx.fillStyle = yellow;
    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
    /* 像点(方位偏 + 天顶距,投影到剖面:用天顶距画) */
    var ang = st.zenDist;
    var px = cx + Math.sin(ang) * R * Math.sin(st.azi + Math.PI / 2) * 0.2;
    var py = cy + Math.cos(ang) * R;
    ctx.fillStyle = "#FFE9A8";
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(242,193,78,0.6)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    ctx.fillStyle = soft; ctx.textAlign = "left";
    ctx.fillText("像距天顶 " + (st.zenDist * 57.3).toFixed(1) + "°", 8, 12);
    ctx.fillText("像径 14mm", 8, h - 5);
  }

  function drawSun(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    /* 高度角 + 方位偏仪表 */
    var cx = w * 0.30, cy = h * 0.52, R = Math.min(cy, cx) - 6;
    ctx.strokeStyle = "rgba(233,238,242,0.25)"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, Math.PI * 2); ctx.stroke();
    var h = Math.PI / 2 - st.zenDist;
    ctx.strokeStyle = yellow; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx - Math.cos(h) * R, cy - Math.sin(h) * R);
    ctx.stroke();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("h " + (h * 57.3).toFixed(1) + "°", 8, 12);
    ctx.fillText("φ 34.5°(登封)", 8, h - 5);
    /* 方位刻度 */
    var azx = w * 0.72;
    ctx.strokeStyle = "rgba(233,238,242,0.25)";
    ctx.beginPath(); ctx.moveTo(azx - 30, h - 14); ctx.lineTo(azx + 30, h - 14); ctx.stroke();
    ctx.fillStyle = teal;
    ctx.beginPath(); ctx.arc(azx + st.azi / (Math.PI * 0.25) * 30, h - 14, 4, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = "center";
    ctx.fillText("方位偏 ±45°", azx, h - 4);
  }

  function drawGrid(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    /* 内壁展开:节气圈(横) × 时辰(纵) + 像点 */
    var x0 = 10, y0 = 8, gw = w - 20, gh = h - 18;
    ctx.strokeStyle = faint; ctx.lineWidth = 1;
    for (var r = 1; r <= 8; r++) {
      ctx.beginPath(); ctx.moveTo(x0, y0 + gh * r / 8); ctx.lineTo(x0 + gw, y0 + gh * r / 8); ctx.stroke();
    }
    for (var c = 0; c <= 12; c++) {
      ctx.beginPath(); ctx.moveTo(x0 + gw * c / 12, y0); ctx.lineTo(x0 + gw * c / 12, y0 + gh); ctx.stroke();
    }
    /* 像点:天顶距→环,方位→列 */
    var ring = st.zenDist / (Math.PI / 2);
    var col = 0.5 + st.azi / (Math.PI / 2) * 0.5;
    ctx.fillStyle = "#FFE9A8";
    ctx.beginPath(); ctx.arc(x0 + gw * Math.min(1, Math.max(0, col)), y0 + gh * Math.min(1, ring), 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("节气圈(天顶→唇)", x0, 7);
    ctx.textAlign = "right";
    ctx.fillText("时辰经线(12 辰)", x0 + gw, 7);
  }

  function drawStats(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("釜 R 1.5m(口径一丈二尺推算)", 8, 14);
    ctx.fillText("像径 d = R×0.533° = " + (D.imgDia * 1000).toFixed(0) + "mm", 8, 28);
    ctx.fillText("夏至像距 10.5° · 冬至 58.5°", 8, 42);
    ctx.fillText("时辰线 15° = 1 小时", 8, 56);
    ctx.textAlign = "right";
    ctx.fillText("「窾纳芥也」", w - 8, 28);
  }
})(window.MECH = window.MECH || {});
