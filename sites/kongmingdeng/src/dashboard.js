/* 底部仪表盘:① 浮力-重量 ② 内温曲线 ③ 高度时序 ④ 万毕术对照 */
(function (MECH) {
  var D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)", faint = "rgba(233,238,242,0.16)";
  var teal = "#7FD8D8", yellow = "#E9C93C", red = "#D6543A", green = "#6FBF73";

  MECH.DASH = { panels: [
    { title: "BUOY · 浮力", meta: "F vs W", dot: "teal", canvasH: 100, draw: drawBuoy },
    { title: "TEMP · 内温", meta: "起飞 73℃", dot: "blue", canvasH: 88, draw: drawTemp },
    { title: "ALT · 高度", meta: "升降时序", dot: "pink", canvasH: 100, draw: drawAlt },
    { title: "SPEC · 文献", meta: "万毕术锚点", dot: "yellow", canvasH: 66, draw: drawSpec }
  ] };

  function drawBuoy(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var F = st._F || D.Fof(st.Tin);
    var net = F - D.W;
    var mx = Math.max(F, D.W) * 1.2;
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("浮力 F = " + (F * 1000).toFixed(0) + " mN", 8, 14);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 18, w - 16, 10);
    ctx.fillStyle = teal; ctx.fillRect(8, 18, (w - 16) * F / mx, 10);
    ctx.fillText("重量 W = " + (D.W * 1000).toFixed(0) + " mN(壳55g)", 8, 40);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 44, w - 16, 10);
    ctx.fillStyle = yellow; ctx.fillRect(8, 44, (w - 16) * D.W / mx, 10);
    ctx.textAlign = "center";
    ctx.fillStyle = net > 0 ? green : soft;
    ctx.fillText(net > 0 ? "净升 " + (net * 1000).toFixed(0) + " mN ✓可飞" : "系留(F<W)", w / 2, h - 4);
  }

  function drawTemp(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var hist = st.hist || [];
    var mid = h * 0.55;
    /* 起飞温度线 */
    var yT = h - 10 - (D.Tfly / 100) * (h - 24);
    ctx.strokeStyle = yellow; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(0, yT); ctx.lineTo(w, yT); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = soft; ctx.textAlign = "right";
    ctx.fillText("起飞 " + D.Tfly.toFixed(0) + "℃", w - 8, yT - 3);
    if (hist.length > 1) {
      ctx.strokeStyle = red; ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (var i = 0; i < hist.length; i++) {
        var x = i / 219 * w;
        var y = h - 10 - Math.min(100, hist[i]) / 100 * (h - 24);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = soft; ctx.textAlign = "left";
    ctx.fillText("T内 " + st.Tin.toFixed(0) + "℃(外 20℃)", 8, 12);
  }

  function drawAlt(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    /* 灯高度示意(标杆旁) */
    var gx = w * 0.35, gy = h - 12, S = (h - 26) / 3.0;
    ctx.strokeStyle = "rgba(233,238,242,0.35)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy - 3.0 * S); ctx.stroke();
    for (var i = 0; i <= 6; i++) {
      ctx.beginPath(); ctx.moveTo(gx, gy - i * 0.5 * S); ctx.lineTo(gx + 8, gy - i * 0.5 * S); ctx.stroke();
    }
    var ly = gy - Math.min(3, st.alt) * S;
    ctx.fillStyle = "#E7D0A8";
    ctx.beginPath(); ctx.arc(gx + 10, ly, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("高度 " + st.alt.toFixed(2) + " m · 速 " + Math.abs(st.vel).toFixed(2) + " m/s", 8, 12);
    ctx.fillText(st.released ? "升空" : "系留", 8, h - 5);
    ctx.textAlign = "right";
    ctx.fillText("燃 " + Math.min(90, st.time / 1).toFixed(0) + "/90s", w - 8, 12);
  }

  function drawSpec(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = soft; ctx.font = "600 8px sans-serif"; ctx.textAlign = "left";
    ctx.fillText("《淮南万毕术》:「艾火令鸡子飞」", 8, 14);
    ctx.fillText("《太平御览》引注:燃艾纳空卵…因举之飞", 8, 28);
    ctx.fillText("孔明发明说为传说(《三国志》无载)", 8, 42);
    ctx.fillStyle = yellow; ctx.textAlign = "right";
    ctx.fillText("明清习俗锚点", w - 8, 42);
    ctx.fillStyle = faint; ctx.textAlign = "center";
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.fillText("V0.3m³ 壳55g 起飞内温73℃", w / 2, h - 4);
  }
})(window.MECH = window.MECH || {});
