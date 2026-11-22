/* 仪表盘:①八方位罗盘+摆向 ②都柱摆角曲线 ③落丸计数 ④事件记录 */
(function (MECH) {
  var el = {}, D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)";

  MECH.DASH = { panels: [
    { title: "COMPASS · 八方位", meta: "摆倒向实时", dot: "yellow", canvasH: 100, draw: drawCompass },
    { title: "PENDULUM · 都柱摆角", meta: "触发角 6°", dot: "teal", canvasH: 100, draw: drawPend },
    { title: "BALLS · 落丸计数", meta: "八方八格", dot: "blue", canvasH: 100, draw: drawBalls },
    { title: "LOG · 地震记录", meta: "时序方位", dot: "green", canvasH: 100, draw: drawLog }
  ] };

  /* ① 罗盘:8 方位刻度 + 摆倒向指针(幅值=摆角) */
  function drawCompass(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w / 2, cy = h / 2, R = Math.min(cx, cy) - 8;
    ctx.strokeStyle = "rgba(233,238,242,0.28)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "700 10px serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var names = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
    for (var k = 0; k < 8; k++) {
      var a = k * Math.PI / 4;                 // 自北顺时针;画布北=上(−y),顺时针=+x
      var px = cx + Math.sin(a) * R * 0.80, py = cy - Math.cos(a) * R * 0.80;
      ctx.fillStyle = (st.quake && st.quake.dir === k) ? "#E9C93C" : soft;
      ctx.fillText(names[k], px, py);
      ctx.strokeStyle = "rgba(233,238,242,0.25)";
      ctx.beginPath();
      ctx.moveTo(cx + Math.sin(a) * R * 0.62, cy - Math.cos(a) * R * 0.62);
      ctx.lineTo(cx + Math.sin(a) * R * 0.72, cy - Math.cos(a) * R * 0.72);
      ctx.stroke();
    }
    /* 摆倒向指针(世界系:东=+x → 画布 +x;北=−z → 画布 −y) */
    var mag = Math.min(1, Math.abs(st.theta) / (D.trigRad * 1.4));
    var dx = st.tiltAX * mag, dy = st.tiltAZ * mag;
    ctx.strokeStyle = "#7FD8D8";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + dx * R * 0.55, cy + dy * R * 0.55);
    ctx.stroke();
    ctx.fillStyle = "#7FD8D8";
    ctx.beginPath(); ctx.arc(cx + dx * R * 0.55, cy + dy * R * 0.55, 3.4, 0, Math.PI * 2); ctx.fill();
    /* 触发圈 */
    ctx.strokeStyle = "rgba(233,201,60,0.7)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.40, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }

  /* ② 摆角时间历史(触发脉冲可见) */
  var pendHist = [];
  function drawPend(st, ph, pt, ctx, w, h) {
    pendHist.push(st.theta);
    if (pendHist.length > 240) pendHist.shift();
    ctx.clearRect(0, 0, w, h);
    var mid = h / 2;
    ctx.strokeStyle = "rgba(233,238,242,0.16)";
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
    var scale = D.trigRad * 1.4;
    ctx.setLineDash([3, 3]);
    [mid - (D.trigRad / scale) * mid, mid + (D.trigRad / scale) * mid].forEach(function (y) {
      ctx.strokeStyle = "rgba(233,201,60,0.5)";
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.strokeStyle = "#7FD8D8";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (var i = 0; i < pendHist.length; i++) {
      var px = i / 239 * w, py = mid - pendHist[i] / scale * (mid - 6);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("触发 6°", 4, mid - (D.trigRad / scale) * (mid - 6) - 3);
    ctx.fillText("±9.6° 量程", 4, top()+8);
    function top() { return 10; }
  }

  /* ③ 落丸计数:8 格 */
  function drawBalls(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var names = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
    var cw = w / 4, ch = (h - 16) / 2;
    for (var k = 0; k < 8; k++) {
      var col = k % 4, row = Math.floor(k / 4);
      var x = col * cw, y = row * ch + 4;
      var on = st.caught[k] > 0;
      ctx.strokeStyle = on ? "#E9C93C" : "rgba(233,238,242,0.25)";
      ctx.lineWidth = on ? 2 : 1;
      ctx.strokeRect(x + 3, y + 2, cw - 8, ch - 8);
      ctx.fillStyle = on ? "#E9C93C" : "rgba(233,238,242,0.35)";
      ctx.font = "700 10px serif";
      ctx.textAlign = "center";
      ctx.fillText(names[k], x + cw / 2 - 2, y + ch / 2 - 2);
      ctx.font = "700 11px Menlo, monospace";
      ctx.fillStyle = on ? "#6FBF73" : soft;
      ctx.fillText(String(st.caught[k]), x + cw / 2 - 2, y + ch - 8);
    }
  }

  /* ④ 事件记录 */
  function drawLog(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("t(s)   方位   摆角", 6, 12);
    var n = st.events.length;
    for (var i = 0; i < n; i++) {
      var ev = st.events[n - 1 - i];
      var y = 26 + i * 13;
      if (y > h - 4) break;
      ctx.fillStyle = "#E9C93C";
      ctx.fillText(st.time.toFixed(1).padStart(5, " "), 6, y);
      ctx.fillText(D.dirs8[ev.dir].name, 44, y);
      ctx.fillStyle = "#7FD8D8";
      ctx.fillText("6.00°", 82, y);
    }
    if (n === 0) {
      ctx.fillStyle = soft;
      ctx.fillText("静候地动……", 6, 30);
    }
  }
})(window.MECH = window.MECH || {});
