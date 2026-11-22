/* 底部仪表盘:① 聚焦光路 ② 焦斑/聚光比 ③ 引燃计时 ④ 出土对照 */
(function (MECH) {
  var D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)", faint = "rgba(233,238,242,0.16)";
  var teal = "#7FD8D8", yellow = "#E9C93C", red = "#D6543A", green = "#6FBF73";

  MECH.DASH = { panels: [
    { title: "RAY · 光路", meta: "平行→焦点", dot: "teal", canvasH: 100, draw: drawRay },
    { title: "FOCUS · 焦斑", meta: "d=f×0.533°", dot: "blue", canvasH: 88, draw: drawFocus },
    { title: "IGNITE · 引燃", meta: "艾绒计时", dot: "red", canvasH: 100, draw: drawIgnite },
    { title: "SPEC · 出土", meta: "黄堆/白浮", dot: "yellow", canvasH: 66, draw: drawSpec }
  ] };

  function drawRay(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    /* 光路示意:凹面弧 + 3 平行入射 + 汇聚 */
    var mx = w * 0.30, myy = h * 0.42, R = (h - 30) / 1.1;
    ctx.strokeStyle = "rgba(233,238,242,0.4)"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(mx - R * 0.35, myy, R, -0.9, 0.9); ctx.stroke();
    var fx = mx + D.f / D.Rmirror * R * 0.55, fy = myy;
    for (var i = -1; i <= 1; i++) {
      var off = i * R * 0.16;
      var hy = myy + off, hx = mx + Math.cos(Math.asin(off / R)) * R * 0.55;
      ctx.strokeStyle = "rgba(242,193,78,0.6)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(hx + 20, hy); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.strokeStyle = "rgba(255,233,168,0.8)";
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(fx, fy); ctx.stroke();
    }
    ctx.fillStyle = "#FFE9A8";
    ctx.beginPath(); ctx.arc(fx, fy, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("f = R/2 = " + (D.f * 100).toFixed(1) + "cm", 8, 12);
    ctx.fillText("「光聚为一点,大如麻菽」", 8, h - 5);
    ctx.textAlign = "right";
    ctx.fillText("艾绒", fx + 14, fy + 3);
  }

  function drawFocus(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var eff = Math.cos(st.aimErr);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("焦斑 d = f×0.533° = " + (D.spotD * 1000).toFixed(2) + "mm", 8, 14);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 18, w - 16, 9);
    ctx.fillStyle = yellow; ctx.fillRect(8, 18, (w - 16) * Math.max(0.03, eff), 9);
    ctx.fillText("聚光比 (D/d)² ≈ " + D.concRatio.toFixed(0), 8, 40);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 44, w - 16, 9);
    ctx.fillStyle = teal; ctx.fillRect(8, 44, (w - 16) * Math.max(0.03, eff), 9);
    ctx.fillStyle = soft; ctx.textAlign = "right";
    ctx.fillText("效率 ×" + eff.toFixed(2), w - 8, 58);
  }

  function drawIgnite(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var f = Math.min(1, st.fuel);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("艾绒 " + (f * 100).toFixed(0) + "% · 镜面功率 " + D.power.toFixed(1) + "W", 8, 14);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 18, w - 16, 10);
    ctx.fillStyle = f >= 1 ? red : yellow;
    ctx.fillRect(8, 18, (w - 16) * f, 10);
    /* 燃点刻线 */
    ctx.strokeStyle = green; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(8 + (w - 16) * (1 / 1.15), 16); ctx.lineTo(8 + (w - 16) * (1 / 1.15), 30); ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = st.ignited ? red : soft;
    ctx.font = "700 9px Menlo, monospace";
    ctx.fillText(st.ignited ? "「则火来至」已燃" : "聚热中…", w / 2, h - 4);
  }

  function drawSpec(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var rows = [["黄堆西周", "径8.8 R19.8-20cm", "f≈9.9cm"],
                ["昌平白浮", "径9.9/9.5cm", "R≈30.8cm"],
                ["虢国墓", "径7.5cm 虎鸟纹", "春秋早期"]];
    ctx.font = "600 8px sans-serif";
    rows.forEach(function (r, i) {
      var y = 16 + i * 14;
      ctx.fillStyle = i === 0 ? yellow : soft;
      ctx.textAlign = "left";
      ctx.fillText(r[0], 8, y);
      ctx.textAlign = "right";
      ctx.fillText(r[1] + " · " + r[2], w - 8, y);
    });
    ctx.fillStyle = faint; ctx.textAlign = "center";
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.fillText("「金锡半,谓之鉴燧之齐」——《考工记》", w / 2, h - 4);
  }
})(window.MECH = window.MECH || {});
