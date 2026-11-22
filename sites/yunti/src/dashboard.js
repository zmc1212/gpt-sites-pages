/* 底部仪表盘:① 梯角几何 ② 绞车圈数 ③ 可达城高 ④ 阶段进程 */
(function (MECH) {
  var D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)", faint = "rgba(233,238,242,0.16)";
  var teal = "#7FD8D8", yellow = "#E9C93C", green = "#6FBF73";

  MECH.DASH = { panels: [
    { title: "LADDER · 梯角", meta: "H = L·sinθ + h₀", dot: "teal", canvasH: 100, draw: drawLadder },
    { title: "WINCH · 绞车", meta: "r0.12 圈数", dot: "blue", canvasH: 88, draw: drawWinch },
    { title: "REACH · 可达高", meta: "8.4·sin55°+1.10", dot: "green", canvasH: 100, draw: drawReach },
    { title: "STATS · 尺寸", meta: "文献值", dot: "yellow", canvasH: 66, draw: drawStats }
  ] };

  function drawLadder(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    /* 侧视:床 + 主梯(随 θ)+ 飞梯延伸 */
    var gx = 10, gy = h - 12, S = (w - 24) / 9.5;
    ctx.strokeStyle = "rgba(233,238,242,0.25)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(w - 10, gy); ctx.stroke();
    var px = gx + (0.35 + 2.6) * S, py = gy - D.cartH * S;
    ctx.strokeRect(px - 1.3 * S, gy - D.cartH * S, 2.6 * S, D.cartH * S);
    var L = D.Lmain + st.fly;
    var ex = px - L * S * Math.cos(st.theta), ey = py - L * S * Math.sin(st.theta);
    ctx.strokeStyle = teal; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.fillStyle = yellow;
    ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
    /* 城墙 */
    ctx.fillStyle = "rgba(233,238,242,0.18)";
    ctx.fillRect(gx, gy - D.wallH * S, D.wallT * S, D.wallH * S);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("θ " + (st.theta * 57.3).toFixed(1) + "°(15°→55°)", 8, 12);
    ctx.fillText("转轴 0.35,1.10", gx + 4, gy - D.cartH * S - 4);
    ctx.fillText("城墙 7.2m", gx + 4, gy - D.wallH * S + 10);
  }

  function drawWinch(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var rope = st.rope1 + st.rope2;
    var turns = rope / (2 * Math.PI * D.winchR);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("绞绳累计 " + rope.toFixed(2) + " / " + (D.dRope1 + D.dRope2).toFixed(2) + " m", 8, 14);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 18, w - 16, 10);
    ctx.fillStyle = teal; ctx.fillRect(8, 18, (w - 16) * Math.min(1, rope / (D.dRope1 + D.dRope2)), 10);
    ctx.fillText("圈数 " + turns.toFixed(2) + "(r0.12:立梯 1.86 + 飞梯 2.92)", 8, 40);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 44, w - 16, 10);
    ctx.fillStyle = yellow; ctx.fillRect(8, 44, (w - 16) * Math.min(1, turns / 4.78), 10);
  }

  function drawReach(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var H = D.Ltotal * Math.sin(st.theta) + D.cartH + st.fly * Math.sin(st.theta);
    var f = Math.min(1, H / D.Hreach);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("可达高 " + H.toFixed(2) + " / " + D.Hreach.toFixed(2) + " m", 8, 14);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 18, w - 16, 9);
    ctx.fillStyle = green; ctx.fillRect(8, 18, (w - 16) * f, 9);
    /* 城高线 */
    var yw = 18 + (h - 30) * (1 - D.wallH / D.Hreach);
    ctx.strokeStyle = "rgba(233,238,242,0.4)"; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(8, yw + 4); ctx.lineTo(w - 8, yw + 4); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = soft; ctx.textAlign = "right";
    ctx.fillText("城堞 7.2m", w - 8, yw + 3);
    ctx.textAlign = "center";
    ctx.fillStyle = H >= D.wallH ? green : yellow;
    ctx.font = "700 9px Menlo, monospace";
    ctx.fillText(H >= D.wallH ? "可抵城堞 ✓" : "绞升中…", w / 2, h - 4);
  }

  function drawStats(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("主梯 6.2m + 飞梯 2.2m = 8.4m", 8, 14);
    ctx.fillText("床高 1.10 · 六轮 r0.30", 8, 28);
    ctx.fillText("梯角 15°→55° · 绞绳 3.60m", 8, 42);
    ctx.fillText("抓钩:复原画法(推算)", 8, 56);
    ctx.textAlign = "right";
    ctx.fillText("「中施转轴」", w - 8, 28);
  }
})(window.MECH = window.MECH || {});
