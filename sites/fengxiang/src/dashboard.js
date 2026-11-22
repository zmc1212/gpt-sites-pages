/* 仪表盘:①活塞位移+速度曲线 ②四活门状态 ③风量 ④气流路径示意 */
(function (MECH) {
  var el = {}, D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)";
  var xHist = [], vHist = [];

  MECH.DASH = { panels: [
    { title: "PISTON · 活塞", meta: "x / v 双曲线", dot: "teal", canvasH: 96, draw: drawPiston },
    { title: "VALVES · 活门状态", meta: "压差启闭", dot: "blue", canvasH: 96, draw: drawValves },
    { title: "AIRFLOW · 风量", meta: "双动恒出风", dot: "yellow",
      html: '<div class="big" id="d-air">0%</div><div class="k">相对风量</div>' +
            '<div class="bar"><i id="d-bar"></i></div>' +
            '<div class="rowline"><span>累计喷风</span><b id="d-puffs">0</b></div>',
      init: initAir, draw: drawAir },
    { title: "PATH · 气流路径", meta: "随行程换向", dot: "green", canvasH: 96, draw: drawPath }
  ] };

  function initAir(sec) {
    el.air = sec.querySelector("#d-air");
    el.bar = sec.querySelector("#d-bar");
    el.puffs = sec.querySelector("#d-puffs");
  }

  function drawPiston(st, ph, pt, ctx, w, h) {
    xHist.push(st.x / D.stroke);
    vHist.push(st.vx / (D.stroke * D.k.fast));
    if (xHist.length > 200) xHist.shift();
    if (vHist.length > 200) vHist.shift();
    ctx.clearRect(0, 0, w, h);
    var mid = h / 2;
    ctx.strokeStyle = "rgba(233,238,242,0.16)";
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
    ctx.strokeStyle = "#7FD8D8";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (var i = 0; i < xHist.length; i++) {
      var px = i / 199 * w, py = mid - xHist[i] * (mid - 6);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.strokeStyle = "#E9C93C";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (var j = 0; j < vHist.length; j++) {
      var px2 = j / 199 * w, py2 = mid - vHist[j] * (mid - 6);
      if (j === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("x(青) / v(黄,虚)", 4, 10);
  }

  /* ② 四活门开合状态图:箱体示意 + 四块色块 */
  function drawValves(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w / 2, cy = h / 2;
    var bw = w * 0.62, bh = 26;
    var bx = cx - bw / 2, by = cy - bh / 2;
    ctx.strokeStyle = "rgba(233,238,242,0.45)";
    ctx.strokeRect(bx, by, bw, bh);
    /* 活塞位置 */
    var px = bx + (st.x / (2 * D.stroke) + 0.5) * bw;
    ctx.fillStyle = "rgba(233,238,242,0.55)";
    ctx.fillRect(px - 3, by, 6, bh);
    /* 四活门色块:开=绿 闭=灰 */
    function block(x, y, open, label) {
      ctx.fillStyle = open > 0.5 ? "#6FBF73" : "rgba(233,238,242,0.25)";
      ctx.fillRect(x, y, 20, 12);
      ctx.fillStyle = soft;
      ctx.font = "600 7px Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(label, x + 10, y + 22);
    }
    block(bx + 14, by - 14, st.valves.inL, "进L");
    block(bx + bw - 34, by - 14, st.valves.inR, "进R");
    block(bx + bw - 6, cy - 20, st.valves.outR, "出R");
    block(bx - 14, cy - 20, st.valves.outL, "出L");
    /* 出风方向箭头 */
    var dir = st.vx >= 0 ? "→" : "→";
    ctx.fillStyle = "#E9C93C";
    ctx.font = "700 11px Menlo, monospace";
    ctx.fillText(dir + " 恒向炉", cx - 24, h - 5);
  }

  function drawAir(st, ph, pt, ctx, w, h) {
    if (el.air) el.air.textContent = Math.round(st.airflow * 100) + "%";
    if (el.bar) el.bar.style.width = Math.round(st.airflow * 100) + "%";
    if (el.puffs) el.puffs.textContent = String(st.puffs);
  }

  /* ④ 气流路径示意:箱体剖面 + 活塞 + 风道箭头(方向随行程) */
  function drawPath(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w / 2, cy = h / 2;
    var bw = w * 0.66, bh = 30;
    var bx = cx - bw / 2, by = cy - bh / 2;
    ctx.strokeStyle = "rgba(233,238,242,0.45)";
    ctx.strokeRect(bx, by, bw, bh);
    /* 风道隔板 */
    ctx.beginPath();
    ctx.moveTo(bx + bw - 18, by); ctx.lineTo(bx + bw - 18, by + bh * 0.32);
    ctx.moveTo(bx + bw - 18, by + bh); ctx.lineTo(bx + bw - 18, by + bh * 0.68);
    ctx.stroke();
    /* 活塞 */
    var px = bx + (st.x / (2 * D.stroke) + 0.5) * (bw - 24);
    ctx.fillStyle = "rgba(233,238,242,0.6)";
    ctx.fillRect(px, by + 2, 6, bh - 4);
    /* 气流箭头:压缩腔 → 风道 → 炉 */
    var dirRight = st.vx >= 0;
    var compX = dirRight ? px + 6 : px - 6;      // 压缩腔中心
    ctx.strokeStyle = "#7FD8D8";
    ctx.lineWidth = 1.8;
    /* 腔内箭头指向风道 */
    ctx.beginPath();
    ctx.moveTo(compX, cy);
    ctx.lineTo(dirRight ? bx + bw - 22 : bx + bw - 22, cy);
    ctx.stroke();
    /* 出风口到炉 */
    ctx.beginPath();
    ctx.moveTo(bx + bw + 2, cy);
    ctx.lineTo(bx + bw + 26, cy);
    ctx.stroke();
    ctx.fillStyle = "#7FD8D8";
    ctx.beginPath();
    ctx.moveTo(bx + bw + 30, cy);
    ctx.lineTo(bx + bw + 22, cy - 3.5);
    ctx.lineTo(bx + bw + 22, cy + 3.5);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(dirRight ? "右腔压 → 出风" : "左腔压 → 出风", 4, 10);
    ctx.fillText("炉", bx + bw + 24, cy + 16);
  }
})(window.MECH = window.MECH || {});
