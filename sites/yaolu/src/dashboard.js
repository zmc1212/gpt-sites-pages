/* 底部仪表盘:① 橹摆相位 ② 推力时序 ③ 航速-阻力平衡 ④ 功率 */
(function (MECH) {
  var D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)", faint = "rgba(233,238,242,0.16)";
  var teal = "#7FD8D8", yellow = "#E9C93C", green = "#6FBF73";

  MECH.DASH = { panels: [
    { title: "OAR · 橹摆", meta: "β+攻角反转", dot: "teal", canvasH: 100, draw: drawOar },
    { title: "THRUST · 推力", meta: "每摆百牛量级", dot: "blue", canvasH: 88, draw: drawThrust },
    { title: "SPEED · 航速", meta: "F=R 匀速", dot: "green", canvasH: 100, draw: drawSpeed },
    { title: "POWER · 功率", meta: "「一橹抵三桨」", dot: "yellow", canvasH: 66, draw: drawPower }
  ] };

  function drawOar(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    /* 摆角 β(t) 正弦 + 攻角 α(t) 余弦(相位差 90°) */
    var mid = h / 2, n = 60;
    ctx.strokeStyle = "rgba(233,238,242,0.16)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
    ctx.strokeStyle = teal; ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (var i = 0; i <= n; i++) {
      var x = i / n * w;
      var t = st.ph - (n - i) / n * 2 * Math.PI / st.freq * 0.24;
      var b = D.A2 * Math.sin(t);
      var y = mid - b / D.A2 * h * 0.36;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    /* 当前攻角矢量 */
    ctx.strokeStyle = yellow; ctx.lineWidth = 2.4;
    var cx = w * 0.5, cy2 = h * 0.5;
    ctx.beginPath(); ctx.moveTo(cx, cy2);
    ctx.lineTo(cx + Math.sin(st.alpha) * 30, cy2 - Math.cos(st.alpha) * 26);
    ctx.stroke();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("β " + (st.beta * 57.3).toFixed(0) + "° · α " + (st.alpha * 57.3).toFixed(0) + "°(反转)", 8, 12);
    ctx.fillText("摇频 " + st.freq.toFixed(2) + " Hz", 8, h - 5);
    ctx.textAlign = "right";
    ctx.fillText("攻角(黄)", w - 8, mid - 18);
  }

  function drawThrust(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var F = st.Fnow;
    var f = Math.min(1, F / 130);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("瞬时推力 " + F.toFixed(0) + " N", 8, 14);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 18, w - 16, 10);
    ctx.fillStyle = F > 0 ? teal : "rgba(233,238,242,0.3)";
    ctx.fillRect(8, 18, (w - 16) * f, 10);
    var favg = D.FavgOf(st.freq);
    ctx.fillText("平均 " + favg.toFixed(0) + " N(百牛量级)", 8, 40);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 44, w - 16, 9);
    ctx.fillStyle = "rgba(127,216,216,0.5)";
    ctx.fillRect(8, 44, (w - 16) * Math.min(1, favg / 130), 9);
  }

  function drawSpeed(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var hist = st.hist || [];
    var vss = Math.sqrt(D.FavgOf(st.freq) / D.cDrag);
    /* 阻力平衡线 */
    var yb = h - 10 - vss / 1.0 * (h - 24);
    ctx.strokeStyle = yellow; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(0, yb); ctx.lineTo(w, yb); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = soft; ctx.textAlign = "right";
    ctx.fillText("匀速 " + vss.toFixed(2) + " m/s", w - 8, yb - 3);
    if (hist.length > 1) {
      ctx.strokeStyle = teal; ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (var i = 0; i < hist.length; i++) {
        var x = i / 219 * w;
        var y = h - 10 - Math.min(1, hist[i]) * (h - 24);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = soft; ctx.textAlign = "left";
    ctx.fillText("船速 " + st.vBoat.toFixed(2) + " m/s", 8, 12);
    ctx.fillText("R = c·v²", 8, h - 5);
  }

  function drawPower(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var P = st.Fnow * st.vBoat;
    var f = Math.min(1, P / 200);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("功率 " + P.toFixed(0) + " W(人力上限附近)", 8, 14);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 18, w - 16, 10);
    ctx.fillStyle = P > 100 ? green : yellow;
    ctx.fillRect(8, 18, (w - 16) * f, 10);
    ctx.textAlign = "center";
    ctx.fillStyle = soft;
    ctx.fillText("橹不出水 · 连续推进(脉冲频率=摇频×2)", w / 2, h - 4);
  }
})(window.MECH = window.MECH || {});
