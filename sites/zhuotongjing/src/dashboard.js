/* 底部仪表盘:① 碓杆杠杆 ② 冲击能量 ③ 井深进尺 ④ 节奏相位 */
(function (MECH) {
  var D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)", faint = "rgba(233,238,242,0.16)";
  var teal = "#7FD8D8", yellow = "#E9C93C", red = "#D6543A", green = "#6FBF73";

  MECH.DASH = { panels: [
    { title: "LEVER · 杠杆", meta: "i=2.2 · 侧视", dot: "teal", canvasH: 100, draw: drawLever },
    { title: "IMPACT · 冲击", meta: "v=√(2gh)", dot: "blue", canvasH: 88, draw: drawImpact },
    { title: "DEPTH · 井深", meta: "击数×进尺", dot: "green", canvasH: 100, draw: drawDepth },
    { title: "TEMPO · 相位", meta: "踩-提-落-缓", dot: "yellow", canvasH: 66, draw: drawTempo }
  ] };

  function drawLever(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var px = w * 0.72, py = h * 0.30;
    var s = (w - 30) / D.leverLen;
    ctx.strokeStyle = "rgba(233,238,242,0.35)"; ctx.lineWidth = 1.4;
    /* 杆(随 leverT 摆) */
    var th = st.leverT;
    var bx = px - D.armFoot * s * Math.cos(th), by = py + D.armFoot * s * Math.sin(th);
    var ex = px + D.armBit * s * Math.cos(th), ey = py - D.armBit * s * Math.sin(th);
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.fillStyle = teal;
    ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill();
    /* 绳 + 锥(西端) */
    ctx.strokeStyle = soft; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex, ey + 26); ctx.stroke();
    ctx.fillStyle = "#E9EEF2";
    ctx.fillRect(ex - 3, ey + 26, 6, 10);
    /* 地面 */
    ctx.strokeStyle = faint;
    ctx.beginPath(); ctx.moveTo(6, py + D.pivot.y * s * 0.9); ctx.lineTo(w - 6, py + D.pivot.y * s * 0.9); ctx.stroke();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("θ " + th.toFixed(3) + " rad · 踏臂 " + D.armFoot.toFixed(2) + " : 锥臂 " + D.armBit.toFixed(2), 8, 12);
    ctx.fillText("i = 2.2(踏端省力)", 8, h - 5);
    ctx.textAlign = "right";
    ctx.fillText("支点", px + 6, py - 6);
  }

  function drawImpact(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var f = Math.min(1, st.bitV / D.vHit);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("锥速 " + st.bitV.toFixed(2) + " / " + D.vHit.toFixed(2) + " m/s", 8, 14);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 18, w - 16, 9);
    ctx.fillStyle = st.bitV > D.vHit * 0.8 ? red : teal;
    ctx.fillRect(8, 18, (w - 16) * f, 9);
    ctx.fillText("单冲能量 E = ½mv² = " + D.Ehit.toFixed(0) + " J(m=60kg)", 8, 40);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 44, w - 16, 9);
    ctx.fillStyle = yellow; ctx.fillRect(8, 44, (w - 16) * (st.bitState === "rest" ? 1 : 0), 9);
  }

  function drawDepth(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.52, R = Math.min(cy, cx) - 8;
    ctx.strokeStyle = "rgba(233,238,242,0.30)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    /* 井深圈:满一圈 = 1m(演示) */
    var turns = st.depth / 1.0;
    ctx.strokeStyle = teal; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.72, -Math.PI / 2, -Math.PI / 2 + (turns % 1) * Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("井深 " + st.depth.toFixed(3) + " m", cx, cy - 6);
    ctx.fillText("击 " + st.strikes + " × " + (D.strikeDepth * 1000).toFixed(0) + "mm", cx, cy + 10);
    ctx.fillText("文献:深者数十丈(压缩演示)", cx, h - 5);
  }

  function drawTempo(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cyc = (st.time % D.cycle) / D.cycle;
    var segs = [["踩", D.phases.tread], ["提", D.phases.lift], ["落", D.phases.drop], ["缓", D.phases.rest]];
    var x = 8;
    segs.forEach(function (sg, i) {
      var sw = (w - 16) * sg[1] / D.cycle;
      ctx.fillStyle = i === 0 ? "rgba(127,216,216,0.5)" : i === 2 ? "rgba(214,84,58,0.6)" : "rgba(233,238,242,0.12)";
      ctx.fillRect(x, 10, sw, 14);
      ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
      ctx.fillText(sg[0], x + sw / 2, 21);
      x += sw;
    });
    ctx.strokeStyle = yellow; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(8 + cyc * (w - 16), 8); ctx.lineTo(8 + cyc * (w - 16), 26); ctx.stroke();
    ctx.fillStyle = soft; ctx.textAlign = "left";
    ctx.fillText("周期 " + D.cycle.toFixed(2) + "s · 状态 " + st.bitState, 8, 42);
    ctx.fillText("累计 " + st.strikes + " 击", 8, 56);
  }
})(window.MECH = window.MECH || {});
