/* 底部仪表盘:① SHED 梭口 ② SHUTTLE 投梭 ③ CLOTH 织造 ④ CYCLE 阶段时序 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.45)", faint = "rgba(233,238,242,0.16)";
  var yellow = "#E9C93C", teal = "#7FD8D8", red = "#D6543A", silkC = "#EDE4CC";
  var wood = "#B08D57";

  var STARTS = (function () {
    var acc = 0, arr = [];
    MECH.PHASES.forEach(function (ph) { arr.push(acc); acc += ph.dur; });
    arr.total = acc;
    return arr;
  })();

  MECH.DASH = { panels: [
    { title: "SHED · 梭口", meta: "2×0.045 = 0.09m", dot: "yellow", canvasH: 104,
      draw: drawShed },
    { title: "SHUTTLE · 投梭", meta: "行程 0.75m", dot: "green",
      html: '<div class="big" id="d-n">0</div><div class="k">已织纬线(梭)</div><div class="chip" id="d-chip">—</div>',
      canvasH: 88, init: initShuttle, draw: drawShuttle },
    { title: "CLOTH · 织面", meta: "纬线逐梭成布", dot: "blue", canvasH: 108,
      draw: drawCloth },
    { title: "CYCLE · 阶段时序", meta: "54.5s 自动循环", dot: "orange", canvasH: 66,
      draw: drawCycle }
  ] };

  function initShuttle(sec) {
    el.n = sec.querySelector("#d-n");
    el.chip = sec.querySelector("#d-chip");
  }

  /* ① 梭口侧视:经线开口 V 形(实时) */
  function drawShed(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var S = Math.min(w / 1.5, (h - 12) / 0.5);
    var cx = w * 0.44, cy = h * 0.62;
    function X(x) { return cx + (x - 0.05) * S; }
    function Y(y) { return cy - (y - 0.72) * S; }
    var p = st.passP || 0;
    var ph2 = KS.passPhase(p);
    var lift1 = ph2.lift1;
    var weaving = ph.id === "weave" || ph.id === "cycle" || ph.id === "pedals";
    var l1 = weaving ? lift1 : 0;
    /* 经线(奇升偶降) */
    for (var i = 0; i < D.NW; i++) {
      var z = D.warpZ0 + i * D.warpDX;
      var lift = (i % 2 === 0) ? l1 : (1 - l1);
      ctx.strokeStyle = lift > 0.5 ? yellow : soft;
      ctx.lineWidth = lift > 0.5 ? 1.6 : 1;
      ctx.beginPath();
      ctx.moveTo(X(D.warpX), Y(D.warpY + D.lift * lift));
      ctx.lineTo(X(D.clothX), Y(D.warpY));
      ctx.stroke();
    }
    /* 梭 */
    if (ph2.shuttle > 0 && ph2.shuttle < 1) {
      var sx = X(D.shuttleX0 - D.shuttleTravel * ph2.shuttle);
      ctx.fillStyle = wood;
      ctx.beginPath(); ctx.ellipse(sx, Y(D.warpY + D.lift * l1 * 0.5 + 0.02), 10, 5, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("梭口 " + (2 * D.lift * (weaving ? l1 : 0)).toFixed(2) + " m", X(-0.55), Y(0.86));
    ctx.fillText("经轴 →", X(0.42), Y(0.60));
    ctx.fillText("← 布轴", X(-0.55) - 6, Y(0.60));
  }

  /* ② 投梭:梭位进度 + 纬线计数 */
  function drawShuttle(st, ph, pt, ctx, w, h) {
    var ph2 = KS.passPhase(st.passP || 0);
    if (el.n) el.n.textContent = String(st.passes);
    if (el.chip) {
      var phase = ph2.shuttle > 0 && ph2.shuttle < 1 ? "投梭中" : (ph2.reed > 0 && ph2.reed < 1 ? "打纬中" : (ph2.lift1 > 0 && ph2.lift1 < 1 ? "开口中" : "交织中"));
      el.chip.textContent = (ph.id === "weave" || ph.id === "cycle") ? phase + " · " + ((st.passP % 1) * 100 | 0) + "%" : "待机";
      el.chip.className = "chip " + ((ph.id === "weave" || ph.id === "cycle") ? "on" : "");
    }
    ctx.clearRect(0, 0, w, h);
    var bx = 8, bw = w - 16, cy = h * 0.42;
    /* 梭位条 */
    ctx.fillStyle = "rgba(233,238,242,0.10)";
    ctx.fillRect(bx, cy - 5, bw, 10);
    ctx.fillStyle = teal;
    ctx.fillRect(bx, cy - 5, bw * ph2.shuttle, 10);
    /* 筘位条 */
    ctx.fillStyle = "rgba(233,238,242,0.10)";
    ctx.fillRect(bx, cy + 9, bw, 8);
    ctx.fillStyle = yellow;
    ctx.fillRect(bx, cy + 9, bw * ph2.reed, 8);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("梭 x " + (D.shuttleX0 - D.shuttleTravel * ph2.shuttle).toFixed(2), bx, cy - 10);
    ctx.fillText("筘打纬 " + (D.reedStroke * ph2.reed).toFixed(2) + "m", bx, cy + 26);
  }

  /* ③ 织面:纬线行生长(前视布面) */
  function drawCloth(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var bx = w * 0.30, bw = w * 0.40, y0 = 8, hh = h - 34;
    ctx.strokeStyle = soft; ctx.lineWidth = 1;
    ctx.strokeRect(bx, y0, bw, hh);
    /* 经线(竖) */
    ctx.strokeStyle = faint;
    for (var i = 0; i < 10; i++) {
      var x = bx + (i + 0.5) * bw / 10;
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + hh); ctx.stroke();
    }
    /* 纬线(横,逐梭生长) */
    var n = st.passes % D.weftMax;
    for (var j = 0; j < n; j++) {
      var y = y0 + hh - (j + 1) * hh / D.weftMax;
      ctx.strokeStyle = silkC;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx + 1, y); ctx.lineTo(bx + bw - 1, y); ctx.stroke();
    }
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("布幅 0.70m", bx, y0 + hh + 12);
    ctx.textAlign = "right";
    ctx.fillText("纬密 1/梭", bx + bw, y0 + hh + 12);
  }

  /* ④ 阶段时序 */
  function drawCycle(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var total = STARTS.total, x0 = 4, ww = w - 8;
    var idx = MECH.PHASES.indexOf(ph);
    var gt = STARTS[idx] + pt;
    var y1 = 6, hh1 = 18;
    MECH.PHASES.forEach(function (p, i) {
      var x = x0 + STARTS[i] / total * ww, seg = p.dur / total * ww;
      ctx.fillStyle = i === idx ? "rgba(233,201,60,0.30)" : "rgba(233,238,242,0.10)";
      ctx.fillRect(x, y1, seg - 1.5, hh1);
      ctx.strokeStyle = i === idx ? yellow : faint;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y1, seg - 1.5, hh1);
      ctx.fillStyle = i === idx ? yellow : soft;
      ctx.font = "600 7.5px Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(i + 1), x + seg / 2 - 0.75, y1 + hh1 / 2 + 3);
    });
    var gx = x0 + gt / total * ww;
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(gx, y1 - 3); ctx.lineTo(gx, y1 + hh1 + 3); ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("t=" + gt.toFixed(1) + "s / " + total.toFixed(1) + "s", x0, y1 + hh1 + 14);
    ctx.textAlign = "right";
    ctx.fillText("梭内相位 " + ((st.passP % 1) * 100 | 0) + "%", x0 + ww, y1 + hh1 + 14);
  }
})(window.MECH = window.MECH || {});
