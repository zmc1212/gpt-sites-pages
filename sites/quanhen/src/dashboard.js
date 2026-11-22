/* 底部仪表盘:① 力矩天平 ② 梁倾角曲线 ③ 权位-读数 ④ 环权序列 */
(function (MECH) {
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.5)", faint = "rgba(233,238,242,0.16)";
  var teal = "#7FD8D8", yellow = "#E9C93C", red = "#D6543A", green = "#6FBF73";

  MECH.DASH = { panels: [
    { title: "TORQUE · 力矩", meta: "物矩 vs 权矩", dot: "teal", canvasH: 100, draw: drawTorque },
    { title: "BEAM · 梁角", meta: "θ(t)", dot: "blue", canvasH: 88, draw: drawBeam },
    { title: "SCALE · 读数", meta: "权位→克", dot: "pink", canvasH: 100, draw: drawScale },
    { title: "WEIGHTS · 环权", meta: "铢-斤", dot: "yellow", canvasH: 66, draw: drawWeights }
  ] };

  function drawTorque(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var pin = st.pinMode === "arm" ? D.pinU : D.pinC;
    var tObj = (st.objW + D.Wpan) * pin / 1000;
    var tW = D.Wq * (st.qx - pin) / 1000;
    var mx = Math.max(tObj, tW, 0.06);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("物矩 (W物+W盘)×L本 = " + tObj.toFixed(3), 8, 14);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 18, w - 16, 10);
    ctx.fillStyle = teal; ctx.fillRect(8, 18, (w - 16) * tObj / mx, 10);
    ctx.fillText("权矩 W权×L标 = " + tW.toFixed(3), 8, 40);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 44, w - 16, 10);
    ctx.fillStyle = yellow; ctx.fillRect(8, 44, (w - 16) * tW / mx, 10);
    ctx.textAlign = "center";
    ctx.fillStyle = Math.abs(tObj - tW) < 0.0008 ? green : soft;
    ctx.fillText(Math.abs(tObj - tW) < 0.0008 ? "力矩相等 ✓「衡」" : "未衡", w / 2, h - 4);
  }

  function drawBeam(st, ph, pt, ctx, w, h) {
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
        var y = mid - Math.max(-4, Math.min(4, hist[i])) / 4 * h * 0.4;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("梁倾角 θ " + (st.theta * 57.3).toFixed(2) + "°", 8, 12);
    ctx.fillText("ζ 0.55(阻尼收敛)", 8, h - 5);
  }

  function drawScale(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    /* 标尺:0-44cm 滑位 → 读数 */
    var gx = 10, gy = h * 0.40, gw = w - 20;
    ctx.strokeStyle = "rgba(233,238,242,0.35)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    for (var i = 0; i <= 22; i++) {
      var x = gx + i / 22 * gw;
      var major = i % 5 === 0;
      ctx.beginPath(); ctx.moveTo(x, gy - (major ? 8 : 4)); ctx.lineTo(x, gy); ctx.stroke();
    }
    /* 权位游标 */
    var fx = gx + (st.qx - 0.30) / 0.28 * gw;
    ctx.fillStyle = yellow;
    ctx.beginPath(); ctx.arc(Math.min(gx + gw, Math.max(gx, fx)), gy - 12, 4, 0, Math.PI * 2); ctx.fill();
    /* 平衡位标记 */
    if (st.objW > 0) {
      var bx = gx + (KS.balanceX(st.objW, "arm") - 0.30) / 0.28 * gw;
      ctx.strokeStyle = green; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(bx, gy - 16); ctx.lineTo(bx, gy + 4); ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("权位 " + ((st.qx - D.pinU) * 100).toFixed(1) + "cm → 读数 " + (D.Wq * (st.qx - D.pinU) / D.pinU).toFixed(0) + "g", 8, 12);
    ctx.fillText("x* = (W物+W盘)·L本/W权", 8, h - 5);
  }

  function drawWeights(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var names = ["一斤", "半斤", "四两", "二两", "一两"];
    D.weights.forEach(function (wt, i) {
      var y = 16 + i * 11;
      ctx.fillStyle = i === 2 ? yellow : soft;
      ctx.font = "600 8.5px sans-serif"; ctx.textAlign = "left";
      ctx.fillText(names[i], 10, y);
      ctx.textAlign = "right";
      ctx.fillText(wt + " g", w - 10, y);
    });
    ctx.fillStyle = faint; ctx.textAlign = "center";
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.fillText("左家公山环权九枚(制式)", w / 2, h - 4);
  }
})(window.MECH = window.MECH || {});
