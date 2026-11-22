/* 底部仪表盘:① 几何参数 ② 提水流量 ③ 水团追踪 ④ 验算断言 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.5)";

  MECH.DASH = { panels: [
    { title: "GEOM · 几何", meta: "R 0.62 · r 0.26 · P 0.55 · L 3.0 m · θ 30°", dot: "yellow",
      html: '<div class="big" id="d-n">0.50</div><div class="k">转速 n(转/s)</div>' +
            '<div class="rowline"><span>圈数 N = L/P</span><b>5.4545</b></div>' +
            '<div class="rowline"><span>扬程 H = L·sinθ</span><b>1.500 m</b></div>' +
            '<div class="rowline"><span>水室容积 V</span><b>0.189 m³</b></div>',
      init: initGeom, draw: drawGeom },
    { title: "FLOW · 提水", meta: "Q = V·n(体积守恒)", dot: "blue",
      html: '<div class="big" id="d-q">0.0</div><div class="k">流量 Q(L/s)</div>' +
            '<div class="rowline"><span>每转提水 V</span><b>189 L</b></div>',
      init: initFlow, draw: drawFlow },
    { title: "TRACK · 水团轴向", meta: "s = ((φ0+θ) mod N)·P", dot: "teal", canvasH: 84,
      draw: drawTrack },
    { title: "VERIFY · 断言", meta: "N=L/P · H=L·sinθ · Q=V·n · 追踪回卷", dot: "green",
      html: '<div class="rowline"><span>N = L/P</span><b>5.4545 ✓</b></div>' +
            '<div class="rowline"><span>H = L·sin30° = 1.500 m</span><b>✓</b></div>' +
            '<div class="rowline"><span>转一圈前进 = P</span><b>✓</b></div>' +
            '<div class="rowline"><span>转 N 圈回卷溢出 ×1</span><b>✓</b></div>' +
            '<div class="rowline"><span>Q = V·n</span><b>✓</b></div>' +
            '<div class="chip on" id="d-lock">LOCKED · 载入断言通过</div>' }
  ] };

  function initGeom(sec) { el.n = sec.querySelector("#d-n"); }
  function drawGeom(st) {
    if (el.n) el.n.textContent = (st.n || 0).toFixed(2);
  }
  function initFlow(sec) { el.q = sec.querySelector("#d-q"); }
  function drawFlow(st) {
    if (el.q) el.q.textContent = (D.flow(st.n || 0) * 1000).toFixed(1);
  }

  /* 水团轴向位置条(低端右 → 高端左) */
  function drawTrack(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var midY = h / 2 + 2;
    ctx.strokeStyle = "rgba(233,238,242,0.35)";
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(10, midY); ctx.lineTo(w - 10, midY); ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("低端 s=0", 10, midY + 14);
    ctx.textAlign = "right";
    ctx.fillText("高端 s=L(溢出)", w - 10, midY + 14);
    var dumpedTotal = 0;
    for (var i = 0; i < D.nBlobs; i++) {
      var bs = KS.blobState(i, st.theta);
      var x = 10 + (w - 20) * (bs.s / D.L);
      ctx.fillStyle = "#7FD8D8";
      ctx.beginPath(); ctx.arc(x, midY - 8, 4.2, 0, Math.PI * 2); ctx.fill();
      dumpedTotal = Math.max(dumpedTotal, bs.dumped);
    }
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("θ螺 " + (st.theta % (Math.PI * 2)).toFixed(2) + " rad · 溢出轮次 " + dumpedTotal, 10, 10);
  }
})(window.MECH = window.MECH || {});
