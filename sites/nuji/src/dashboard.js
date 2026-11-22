/* 底部仪表盘:① 联动机构 ② 弦储能-箭速 ③ 望山刻度 ④ 击发记录 */
(function (MECH) {
  var D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)", faint = "rgba(233,238,242,0.16)";
  var teal = "#7FD8D8", yellow = "#E9C93C", red = "#D6543A", green = "#6FBF73";

  MECH.DASH = { panels: [
    { title: "LINK · 联动", meta: "k=1.5", dot: "teal", canvasH: 100, draw: drawLink },
    { title: "ENERGY · 储能", meta: "E=½Fx=142J", dot: "blue", canvasH: 88, draw: drawEnergy },
    { title: "SIGHT · 望山", meta: "6 格瞄具", dot: "pink", canvasH: 100, draw: drawSight },
    { title: "LOG · 击发", meta: "v/R 记录", dot: "yellow", canvasH: 66, draw: drawLog }
  ] };

  function drawLink(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    /* 郭 剖面示意:牙(上)+ 牛(斜)+ 悬刀(下) */
    var px = w * 0.30, py = h * 0.30;
    ctx.strokeStyle = "rgba(233,238,242,0.30)"; ctx.lineWidth = 1.2;
    ctx.strokeRect(px - 26, py - 6, 52, 64);
    /* 牙(绕上键转 yaT) */
    var yaA = -st.yaT;
    ctx.strokeStyle = teal; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.sin(yaA) * 22, py - Math.cos(yaA) * 22);
    ctx.stroke();
    /* 悬刀(绕下键) */
    var sdA = st.sdT * 0.85;
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px, py + 16);
    ctx.lineTo(px + Math.sin(sdA) * 26, py + 16 + Math.cos(sdA) * 26);
    ctx.stroke();
    /* 牛(斜连) */
    ctx.strokeStyle = yellow; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + Math.sin(yaA) * 6, py - Math.cos(yaA) * 6 + 2);
    ctx.lineTo(px + Math.sin(sdA) * 5 + 2, py + 14);
    ctx.stroke();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("θ牙 " + st.yaT.toFixed(3) + " · θ悬 " + st.sdT.toFixed(3), 8, 12);
    ctx.fillText("|θ牙| = 1.5×θ悬 ✓", 8, h - 5);
    ctx.textAlign = "right";
    ctx.fillText("郭剖面", w - 8, h - 5);
  }

  function drawEnergy(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("弦力 F 六石 ≈ 1774N · 行程 x 0.16m", 8, 14);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 18, w - 16, 10);
    ctx.fillStyle = teal; ctx.fillRect(8, 18, (w - 16) * (st.cocked ? 1 : 0.06), 10);
    ctx.fillText("弦储能 E = ½Fx = " + D.Estr.toFixed(0) + " J", 8, 40);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 44, w - 16, 10);
    ctx.fillStyle = yellow; ctx.fillRect(8, 44, (w - 16) * (st.boltFlying ? 1 : 0.06), 10);
    ctx.textAlign = "center";
    ctx.fillStyle = st.cocked ? green : soft;
    ctx.fillText(st.cocked ? "挂弦待发 E 满载 ✓" : "未挂弦", w / 2, h - 4);
  }

  function drawSight(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    /* 望山侧视:立柱 + 6 刻度 + 当前瞄准角 */
    var px = w * 0.35, base = h - 14;
    ctx.strokeStyle = "rgba(233,238,242,0.35)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(px, base); ctx.lineTo(px, base - 44); ctx.stroke();
    for (var i = 1; i <= D.gradN; i++) {
      var y = base - 8 - (i - 1) * 7;
      ctx.strokeStyle = i === st.grad ? yellow : "rgba(233,238,242,0.5)";
      ctx.lineWidth = i === st.grad ? 2.4 : 1.2;
      ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px + 14, y); ctx.stroke();
      ctx.fillStyle = i === st.grad ? yellow : soft;
      ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("格" + i + " Δθ" + (D.gradStep * i).toFixed(0) + "°", px + 17, y + 3);
    }
    /* 瞄准线 */
    ctx.strokeStyle = red; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(px - 20, base); ctx.lineTo(px + 30, base - 8 - (st.grad - 1) * 7); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = soft; ctx.textAlign = "left";
    ctx.fillText("望山高 6.6cm(镇原)", 8, 12);
    ctx.fillText("箭重 50g → v 75.4 m/s", 8, h - 5);
  }

  function drawLog(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("击发 " + st.shots + " 次 · v 75.4 m/s 恒定", 8, 14);
    ctx.fillText("理想射程 R = v²/g = " + D.Rideal.toFixed(0) + " m(45° 极大)", 8, 28);
    ctx.fillText("演示压缩 20:1 → 场内 2.9m", 8, 42);
    ctx.fillStyle = st.boltFlying ? yellow : soft;
    ctx.font = "700 9px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText(st.boltFlying ? "箭在途" : (st.cocked ? "待发" : "空机"), w / 2, h - 4);
  }
})(window.MECH = window.MECH || {});
