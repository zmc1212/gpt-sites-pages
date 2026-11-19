/* 底部仪表盘:① PLOW 犁体侧视 ② ADJUST 评-耕深映射 ③ FURROW 沟迹 ④ CYCLE 阶段时序 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.45)", faint = "rgba(233,238,242,0.16)";
  var yellow = "#E9C93C", teal = "#7FD8D8", red = "#D6543A", waterC = "#8FCBE8", soilC = "#8A6E4A";
  var wood = "#B08D57";

  var STARTS = (function () {
    var acc = 0, arr = [];
    MECH.PHASES.forEach(function (ph) { arr.push(acc); acc += ph.dur; });
    arr.total = acc;
    return arr;
  })();

  MECH.DASH = { panels: [
    { title: "PLOW · 犁体侧视", meta: "d = a·sinθ · a=1.1", dot: "yellow", canvasH: 118,
      draw: drawPlow },
    { title: "ADJUST · 评-耕深", meta: "u 0→0.30m", dot: "green",
      html: '<div class="big" id="d-d">2.9</div><div class="k">耕深 cm · 评进则深</div><div class="chip" id="d-chip">—</div>',
      canvasH: 96, init: initAdj, draw: drawAdj },
    { title: "FURROW · 沟迹", meta: "耕深-里程", dot: "blue", canvasH: 108,
      draw: drawFurrow },
    { title: "CYCLE · 阶段时序", meta: "48s 自动循环", dot: "orange", canvasH: 66,
      draw: drawCycle }
  ] };

  function initAdj(sec) {
    el.d = sec.querySelector("#d-d");
    el.chip = sec.querySelector("#d-chip");
  }

  /* ① 犁体侧视简图(实时 θ 与沟深) */
  function drawPlow(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var S = Math.min(w / 4.4, (h - 12) / 2.4);
    var cx = w * 0.30, cy = h * 0.72;
    function X(x) { return cx + x * S; }
    function Y(y) { return cy - y * S; }
    /* 土床 + 沟迹 */
    ctx.fillStyle = "rgba(138,110,74,0.35)";
    ctx.fillRect(X(-1.6), Y(D.bedTop), 5.6 * S, D.bedTop * S);
    ctx.strokeStyle = soilC; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(X(-1.6), Y(D.bedTop)); ctx.lineTo(X(4.0), Y(D.bedTop)); ctx.stroke();
    /* 沟迹(犁后) */
    var fur = st.px - D.xStart;
    if (fur > 0.02) {
      ctx.fillStyle = "rgba(51,38,26,0.9)";
      ctx.fillRect(X(D.xStart), Y(D.bedTop), fur * S, 3);
    }
    /* 犁体简化轮廓(绕后端翻转 −θ) */
    var th = KS.rad(KS.thetaOf(st.u));
    ctx.save();
    ctx.translate(X(0), Y(0));
    ctx.rotate(th);
    ctx.strokeStyle = wood; ctx.lineWidth = Math.max(2, 0.09 * S);
    ctx.beginPath(); ctx.moveTo(0, 0.05); ctx.lineTo(1.1, 0.05); ctx.stroke();      // 犁底
    ctx.beginPath(); ctx.moveTo(0.62, 0.09); ctx.lineTo(0.62, 0.46); ctx.stroke();  // 犁箭
    ctx.lineWidth = Math.max(1.6, 0.05 * S);
    ctx.beginPath();
    ctx.moveTo(0.62, 0.44); ctx.quadraticCurveTo(1.6, 0.18, 2.35, 0.90); ctx.stroke();  // 曲辕
    ctx.beginPath(); ctx.moveTo(0.05, 0.06); ctx.lineTo(-0.55, 0.96); ctx.stroke();  // 犁梢
    ctx.strokeStyle = "#E9EEF2";
    ctx.beginPath(); ctx.moveTo(1.1, 0.06); ctx.lineTo(1.42, 0.03); ctx.stroke();    // 犁铧
    /* 犁评(实时滑移) */
    var ex = 0.66 + st.u;
    ctx.fillStyle = yellow;
    ctx.fillRect(X(ex) - 0.05 * S, Y(0.44 - 0.30 * (ex - 0.62)) - 0.05 * S, 0.16 * S, 0.09 * S);
    ctx.restore();
    /* 铧尖深度标尺 */
    var tipY = Y(-st.depth);
    ctx.strokeStyle = red; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(X(1.16), Y(0)); ctx.lineTo(X(1.16), tipY); ctx.stroke();
    ctx.fillStyle = red;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("d " + (st.depth * 100).toFixed(1) + "cm", X(1.16) + 5, tipY + 3);
    ctx.fillStyle = soft;
    ctx.fillText("θ " + st.thetaDeg.toFixed(1) + "°", X(0.1), Y(0.98));
  }

  /* ② 评-耕深映射曲线 + 当前点 */
  function drawAdj(st, ph, pt, ctx, w, h) {
    if (el.d) {
      el.d.textContent = (st.depth * 100).toFixed(1);
      el.d.style.color = st.u > 0.02 ? "#6FBF73" : soft;
    }
    if (el.chip) {
      var adj = ph.id === "deep" && pt < 2.6;
      el.chip.textContent = adj ? "调评中 · 进则深" : (st.walking ? "行进 · u " + (st.u * 100).toFixed(0) + "cm" : "锁定 · 犁建固定");
      el.chip.className = "chip " + (adj ? "hot" : "on");
    }
    ctx.clearRect(0, 0, w, h);
    var x0 = 26, ww = w - 40, y0 = 8, hh = h - 34;
    function xOf(u) { return x0 + u / D.U * ww; }
    function yOf(d) { return y0 + (1 - (d - 0.02) / 0.14) * hh; }
    ctx.strokeStyle = faint; ctx.lineWidth = 1;
    ctx.strokeRect(x0, y0, ww, hh);
    /* d(u) 曲线 */
    ctx.strokeStyle = teal; ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (var i = 0; i <= 30; i++) {
      var u = i / 30 * D.U;
      var d = KS.depthOf(u);
      if (i === 0) ctx.moveTo(xOf(u), yOf(d)); else ctx.lineTo(xOf(u), yOf(d));
    }
    ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("2.9cm", x0 - 22, yOf(0.029) + 3);
    ctx.fillText("14.4", x0 - 22, yOf(0.144) + 3);
    ctx.textAlign = "center";
    ctx.fillText("评行程 u →", x0 + ww / 2, y0 + hh + 12);
    /* 当前点 */
    ctx.fillStyle = yellow;
    ctx.beginPath(); ctx.arc(xOf(st.u), yOf(st.depth), 4, 0, Math.PI * 2); ctx.fill();
  }

  /* ③ 沟迹:耕深历程(随里程) */
  function drawFurrow(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var x0 = 8, ww = w - 16, y0 = 8, hh = h - 34;
    var span = D.xFar - D.xStart + 0.6;
    ctx.strokeStyle = faint; ctx.lineWidth = 1;
    ctx.strokeRect(x0, y0, ww, hh);
    /* 深度历程:由 px 反推(浅耕段 2.9 → 深耕段 14.4 → 回落) */
    ctx.strokeStyle = waterC; ctx.lineWidth = 1.8;
    ctx.beginPath();
    var started = false;
    for (var i = 0; i <= 60; i++) {
      var xx = D.xStart + (i / 60) * span;
      if (xx > st.px) break;
      var u;
      if (xx < D.xStart + 2.0) u = 0;
      else if (xx < D.xStart + 3.5) u = 0.30;
      else u = 0.08;
      var d = KS.depthOf(u);
      var px2 = x0 + (xx - D.xStart) / span * ww;
      var py2 = y0 + (1 - (d - 0.02) / 0.14) * hh;
      if (!started) { ctx.moveTo(px2, py2); started = true; } else ctx.lineTo(px2, py2);
    }
    if (started) ctx.stroke();
    /* 当前犁位游标 */
    var gx = x0 + (st.px - D.xStart) / span * ww;
    ctx.strokeStyle = yellow; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(gx, y0 - 2); ctx.lineTo(gx, y0 + hh + 2); ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("里程 " + (st.px - D.xStart).toFixed(1) + " m", x0 + 2, y0 + hh + 12);
    ctx.textAlign = "right";
    ctx.fillText("v " + st.vWalk.toFixed(2) + " m/s", x0 + ww, y0 + hh + 12);
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
    ctx.fillText("u " + (st.u * 100).toFixed(0) + "cm · d " + (st.depth * 100).toFixed(1) + "cm", x0 + ww, y1 + hh1 + 14);
  }
})(window.MECH = window.MECH || {});
