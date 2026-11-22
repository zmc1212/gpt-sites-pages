/* 仪表盘:①去极度读数盘 ②星表对照 ③四游环位置盘 ④巡天扫描轨迹 */
(function (MECH) {
  var el = {}, D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)";
  var sweepHist = [];

  MECH.DASH = { panels: [
    { title: "READING · 去极度", meta: "自北极量", dot: "teal",
      html: '<div class="big" id="d-qu">0.0°</div><div class="k">去极度读数</div>' +
            '<div class="rowline"><span>赤纬换算</span><b id="d-dec">0.0°</b></div>' +
            '<div class="chip" id="d-chip">—</div>',
      init: initRead, draw: drawRead },
    { title: "STARS · 演示星表", meta: "4 星对照", dot: "blue", canvasH: 96, draw: drawStars },
    { title: "RING · 四游环位置", meta: "绕极轴", dot: "yellow", canvasH: 96, draw: drawRing },
    { title: "SWEEP · 巡天轨迹", meta: "ψ 时间线", dot: "green", canvasH: 96, draw: drawSweep }
  ] };

  function initRead(sec) {
    el.qu = sec.querySelector("#d-qu");
    el.dec = sec.querySelector("#d-dec");
    el.chip = sec.querySelector("#d-chip");
  }

  function drawRead(st, ph, pt, ctx, w, h) {
    if (el.qu) el.qu.textContent = st.quJiDu.toFixed(1) + "°";
    if (el.dec) el.dec.textContent = (90 - st.quJiDu).toFixed(1) + "°";
    if (el.chip) {
      /* 与星表对照 */
      var hit = null;
      D.stars.forEach(function (s) {
        if (Math.abs(st.quJiDu - (90 - s.dec)) < 1.2) hit = s.name;
      });
      el.chip.textContent = hit ? "对准 " + hit : "扫描中";
      el.chip.className = "chip" + (hit ? " on" : "");
    }
  }

  /* ② 星表行 */
  function drawStars(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    D.stars.forEach(function (s, k) {
      var y = 14 + k * 18;
      var on = st.starIdx === k;
      ctx.fillStyle = on ? "#E9C93C" : soft;
      ctx.font = "700 9px serif";
      ctx.textAlign = "left";
      ctx.fillText(s.name, 8, y);
      ctx.font = "600 8px Menlo, monospace";
      ctx.fillText("δ " + s.dec.toFixed(1) + "°", 78, y);
      ctx.fillText("去极 " + (90 - s.dec).toFixed(1) + "°", 128, y);
      ctx.fillStyle = on ? "#E9C93C" : "rgba(233,238,242,0.2)";
      ctx.beginPath(); ctx.arc(w - 12, y - 3, 4, 0, Math.PI * 2); ctx.fill();
    });
  }

  /* ③ 四游环位置盘:极点在圆心,ψ = 角距 */
  function drawRing(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.55, R = Math.min(cx, cy) - 8;
    ctx.strokeStyle = "rgba(233,238,242,0.28)";
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "700 9px serif";
    ctx.textAlign = "center";
    ctx.fillText("北极", cx, cy + 3);
    ctx.fillText("赤道", cx, cy - R - 2);
    ctx.fillText("南极", cx, cy + R + 10);
    /* 赤道线 */
    ctx.strokeStyle = "rgba(233,238,242,0.25)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(cx - R, cy - R * 0.33); ctx.lineTo(cx + R, cy - R * 0.33); ctx.stroke();
    ctx.setLineDash([]);
    /* 窥衡方向 */
    var a = st.psi;                              // 自北极量
    var px = cx + Math.sin(a) * R, py = cy - Math.cos(a) * R;
    ctx.strokeStyle = "#7FD8D8";
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    ctx.fillStyle = "#7FD8D8";
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(233,201,60,0.6)";
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(cx, cy, Math.abs(Math.sin(0)) * R, 0, Math.PI * 2); ctx.stroke();
  }

  /* ④ ψ 时间线(扫描波形) */
  function drawSweep(st, ph, pt, ctx, w, h) {
    sweepHist.push(st.psi * 180 / Math.PI);
    if (sweepHist.length > 200) sweepHist.shift();
    ctx.clearRect(0, 0, w, h);
    var mid = h - 14, top = 8;
    ctx.strokeStyle = "rgba(233,238,242,0.16)";
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
    /* 星表参考线 */
    D.stars.forEach(function (s) {
      var y = mid - s.psi / 180 * (mid - top);
      ctx.strokeStyle = "rgba(233,201,60,0.4)";
      ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(233,201,60,0.7)";
      ctx.font = "600 7px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText(s.name, 4, y - 2);
    });
    ctx.strokeStyle = "#7FD8D8";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (var i = 0; i < sweepHist.length; i++) {
      var px = i / 199 * w, py = mid - sweepHist[i] / 180 * (mid - top);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
})(window.MECH = window.MECH || {});
