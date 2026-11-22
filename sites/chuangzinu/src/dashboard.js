/* 底部仪表盘:① DRAW 张弦 ② FORCE 叠张力 ③ TRAJ 弹道 ④ CYCLE 阶段时序 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.45)", faint = "rgba(233,238,242,0.16)", faint2 = "rgba(233,238,242,0.10)", woodC = "#6E4E28", waterC = "#8FCBE8";
  var yellow = "#E9C93C", teal = "#7FD8D8", red = "#D6543A";
  var wood = "#B08D57";

  var STARTS = (function () {
    var acc = 0, arr = [];
    MECH.PHASES.forEach(function (ph) { arr.push(acc); acc += ph.dur; });
    arr.total = acc;
    return arr;
  })();

  MECH.DASH = { panels: [
    { title: "DRAW · 张弦", meta: "行程 0.90m", dot: "yellow", canvasH: 108,
      draw: drawDraw },
    { title: "FORCE · 叠张", meta: "F = 3F0 = 600kgf", dot: "green",
      html: '<div class="big" id="d-m">3.33</div><div class="k">绞车省力 MA = 0.30/0.09</div><div class="chip" id="d-chip">—</div>',
      canvasH: 74, init: initForce, draw: drawForce },
    { title: "TRAJ · 弹道", meta: "v0 59 m/s · 平射", dot: "blue", canvasH: 108,
      draw: drawTraj },
    { title: "CYCLE · 阶段时序", meta: "48.5s 自动循环", dot: "orange", canvasH: 66,
      draw: drawCycle }
  ] };

  function initForce(sec) {
    el.m = sec.querySelector("#d-m");
    el.chip = sec.querySelector("#d-chip");
  }

  /* ① 张弦侧视:弓床 + 弦位(实时) */
  function drawDraw(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var S = Math.min(w / 2.6, (h - 12) / 1.1);
    var cx = w * 0.34, gy = h * 0.72;
    function X(m) { return cx + m * S; }
    function Y(m) { return gy - (m - 0.52) * S; }
    var draw = st.draw || 0;
    var nock = KS.nockX(draw);
    /* 床 */
    ctx.strokeStyle = soft; ctx.lineWidth = 1.2;
    ctx.strokeRect(X(-1.0), Y(0.44), 2.3 * S, 0.16 * S);
    /* 弓(三弓简化:前双弧 + 反弧) */
    ctx.strokeStyle = wood; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.arc(X(D.bowFrontX), Y(D.bedY + 0.30), 0.46 * S, -1.1, 1.1); ctx.stroke();
    ctx.beginPath(); ctx.arc(X(D.bowBackX), Y(D.bedY + 0.30), 0.50 * S, Math.PI - 1.1, Math.PI + 1.1); ctx.stroke();
    /* 弦(三线聚钩) */
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(X(D.bowFrontX) - 0.36 * S, Y(D.bedY + 0.30));
    ctx.lineTo(X(nock), Y(D.bedY + 0.30));
    ctx.stroke();
    /* 箭 */
    ctx.strokeStyle = yellow; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(X(nock), Y(D.bedY + 0.30));
    ctx.lineTo(X(nock + D.boltL), Y(D.bedY + 0.30));
    ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("弦钩 x " + nock.toFixed(2) + " m", X(nock), Y(D.bedY + 0.52));
    ctx.fillStyle = yellow;
    ctx.fillText("张弦 " + (draw * 100 / D.drawMax | 0) + "%", X(-0.9), Y(0.72));
  }

  /* ② 叠张读数 */
  function drawForce(st, ph, pt, ctx, w, h) {
    if (el.m) el.m.textContent = D.MA.toFixed(2);
    if (el.chip) {
      var loaded = (st.draw || 0) > 0.5;
      el.chip.textContent = st.fired ? "击发!" : (loaded ? "满张 600kgf · 大牙锁定" : (st.draw > 0.05 ? "张弦中" : "卸力"));
      el.chip.className = "chip " + (st.fired ? "hot" : (loaded ? "on" : ""));
    }
    ctx.clearRect(0, 0, w, h);
    var bx = 8, bw = w - 16, cy = h * 0.5;
    /* 三弓叠张柱 */
    for (var i = 0; i < 3; i++) {
      var x = bx + i * (bw / 3.4);
      var hh2 = 24;
      ctx.fillStyle = (st.draw || 0) > 0.5 ? woodC : faint2;
      ctx.fillRect(x, cy - hh2 / 2 - 6, bw / 4.4, hh2);
      ctx.fillStyle = soft;
      ctx.font = "600 7px Menlo, monospace";
      ctx.fillText("F0 200", x + bw / 8.8, cy + hh2 / 2 + 10);
    }
    ctx.fillStyle = red;
    ctx.font = "700 9px Menlo, monospace";
    ctx.fillText("Σ600", bx + bw - 30, cy - hh2 / 2 - 8);
    ctx.fillStyle = soft;
    ctx.font = "600 7px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("三弓叠张 · 串联力叠加", bx, cy + hh2 / 2 + 20);
  }

  /* ③ 弹道:击发后箭位置轨迹 */
  function drawTraj(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var x0 = 8, ww = w - 16, y0 = 8, hh = h - 30;
    ctx.strokeStyle = faint; ctx.lineWidth = 1;
    ctx.strokeRect(x0, y0, ww, hh);
    /* 平射轨迹线(近似) */
    ctx.strokeStyle = faint;
    ctx.beginPath(); ctx.moveTo(x0, y0 + hh * 0.3); ctx.lineTo(x0 + ww, y0 + hh * 0.42); ctx.stroke();
    /* 击发后箭位置点 */
    if (st.fired) {
      var t = st.fireT;
      var dist = D.v0 * t;
      var drop = 0.5 * D.g * t * t * 0.12;
      var px = x0 + KS.clamp(dist / 40, 0, 1) * ww;
      var py = y0 + hh * 0.3 + KS.clamp(drop / 2, 0, 1) * hh * 0.6;
      ctx.fillStyle = yellow;
      ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = soft;
      ctx.font = "600 7px Menlo, monospace";
      ctx.fillText(dist.toFixed(0) + "m", px + 6, py + 3);
    }
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("射程 700 步(宋制,示意)", x0 + 2, y0 + hh + 12);
    ctx.textAlign = "right";
    ctx.fillText("v0 " + D.v0.toFixed(1) + " m/s", x0 + ww, y0 + hh + 12);
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
    ctx.fillText("张弦 " + ((st.draw || 0) * 100 / D.drawMax | 0) + "%", x0 + ww, y1 + hh1 + 14);
  }
})(window.MECH = window.MECH || {});
