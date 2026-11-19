/* 仪表盘:①杠杆/弦位移曲线 ②矢匣余量 ③射速记录 ④循环相位 */
(function (MECH) {
  var el = {}, D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)";
  var leverHist = [], strHist = [];

  MECH.DASH = { panels: [
    { title: "LEVER · 杠杆与弦", meta: "双曲线实时", dot: "teal", canvasH: 96, draw: drawLever },
    { title: "QUIVER · 矢匣余量", meta: "10 矢", dot: "blue",
      html: '<div class="big" id="d-arrows">10</div><div class="k">余矢 / 10</div>' +
            '<div class="bar"><i id="d-bar"></i></div>' +
            '<div class="rowline"><span>累计击发</span><b id="d-shots">0</b></div>',
      init: initQuiver, draw: drawQuiver },
    { title: "SHOTS · 击发记录", meta: "时序", dot: "yellow", canvasH: 96, draw: drawShots },
    { title: "CYCLE · 循环相位", meta: "落矢→钩弦→击发", dot: "green", canvasH: 96, draw: drawCycle }
  ] };

  function initQuiver(sec) {
    el.arrows = sec.querySelector("#d-arrows");
    el.bar = sec.querySelector("#d-bar");
    el.shots = sec.querySelector("#d-shots");
  }

  function drawLever(st, ph, pt, ctx, w, h) {
    leverHist.push(st.lever / D.leverA);
    strHist.push(st.string / D.stringPull);
    if (leverHist.length > 200) leverHist.shift();
    if (strHist.length > 200) strHist.shift();
    ctx.clearRect(0, 0, w, h);
    var mid = h / 2;
    ctx.strokeStyle = "rgba(233,238,242,0.16)";
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
    ctx.strokeStyle = "#7FD8D8";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (var i = 0; i < leverHist.length; i++) {
      var px = i / 199 * w, py = mid - leverHist[i] * (mid - 6);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.strokeStyle = "#E9C93C";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (var j = 0; j < strHist.length; j++) {
      var px2 = j / 199 * w, py2 = mid - strHist[j] * (mid - 6);
      if (j === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("杠杆(青) / 弦(黄,虚)", 4, 10);
  }

  function drawQuiver(st, ph, pt, ctx, w, h) {
    if (el.arrows) el.arrows.textContent = String(st.arrows);
    if (el.bar) el.bar.style.width = (st.arrows / D.magN * 100) + "%";
    if (el.shots) el.shots.textContent = String(st.shotN);
  }

  function drawShots(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(233,238,242,0.16)";
    ctx.beginPath(); ctx.moveTo(0, h - 14); ctx.lineTo(w, h - 14); ctx.stroke();
    var span = 12;
    for (var i = 0; i < st.shots.length; i++) {
      var dt = st.time - st.shots[i].t;
      if (dt > span) continue;
      var x = w - dt / span * w;
      ctx.fillStyle = "#E9C93C";
      ctx.beginPath(); ctx.arc(x, h - 20, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = soft;
      ctx.font = "600 7px Menlo, monospace";
      ctx.fillText("#" + st.shots[i].n, x - 6, h - 30);
    }
    var rate = st.shots.length >= 2 ? st.shots.length / span : 0;
    ctx.fillStyle = "#E9EEF2";
    ctx.font = "800 15px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(String(st.shotN), 4, 20);
    ctx.fillStyle = soft;
    ctx.font = "600 8px Menlo, monospace";
    ctx.fillText("累计发 · 窗口 12s", 34, 20);
  }

  function drawCycle(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var names = ["落矢", "钩弦", "击发", "飞行"];
    var widths = [0.45, 0.65, 0.55, 0.35];
    var total = D.cycleT;
    var acc = 0;
    for (var k = 0; k < 4; k++) {
      var f = widths[k] / total;
      var x = acc / total * w, ww = f * w;
      var active = D.phases[k].id === st.mode;
      ctx.fillStyle = active ? "rgba(127,216,216,0.75)" : "rgba(233,238,242,0.14)";
      ctx.fillRect(x + 1, h / 2 - 12, ww - 2, 24);
      ctx.fillStyle = active ? "#17140a" : soft;
      ctx.font = "700 8.5px serif";
      ctx.textAlign = "center";
      ctx.fillText(names[k], x + ww / 2, h / 2 + 3);
      acc += widths[k];
    }
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("循环 " + (st.time / D.cycleT).toFixed(1) + " · 状态机 " + st.mode, 4, h - 8);
  }
})(window.MECH = window.MECH || {});
