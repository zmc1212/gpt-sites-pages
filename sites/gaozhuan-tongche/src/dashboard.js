/* 底部仪表盘:① CHAIN 链路侧视 ② FLOW 载水板位 ③ DRIVE 传动 ④ CYCLE 阶段时序 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.45)", faint = "rgba(233,238,242,0.16)";
  var yellow = "#E9C93C", teal = "#7FD8D8", red = "#D6543A", waterC = "#8FCBE8";
  var wood = "#B08D57";

  var STARTS = (function () {
    var acc = 0, arr = [];
    MECH.PHASES.forEach(function (ph) { arr.push(acc); acc += ph.dur; });
    arr.total = acc;
    return arr;
  })();

  MECH.DASH = { panels: [
    { title: "CHAIN · 链路侧视", meta: "双轮径 0.50m · 板 14", dot: "yellow", canvasH: 118,
      draw: drawChain },
    { title: "FLOW · 载水板位", meta: "载水区 s ∈ [0.22, 4.11]", dot: "blue", canvasH: 108,
      draw: drawFlow },
    { title: "DRIVE · 传动", meta: "v = ω·R = 0.45 m/s", dot: "green",
      html: '<div class="big" id="d-v">0.00</div><div class="k">链速 m/s · 板行一周 21.8s</div><div class="chip" id="d-chip">—</div>',
      canvasH: 66, init: initDrive, draw: drawDrive },
    { title: "CYCLE · 阶段时序", meta: "46s 自动循环", dot: "orange", canvasH: 66,
      draw: drawCycle }
  ] };

  function initDrive(sec) {
    el.v = sec.querySelector("#d-v");
    el.chip = sec.querySelector("#d-chip");
  }

  /* ① 链路侧视简图(x-y 竖直平面):双轮 + 链路径 + 板位实时 */
  function drawChain(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var S = Math.min(w / 7.6, (h - 12) / 5.4);
    var cx = w * 0.42, cy = h * 0.56;
    function X(x) { return cx + (x + 2.9) * S; }
    function Y(y) { return cy - (y - 0.5) * S; }
    /* 渠水 + 田 */
    ctx.fillStyle = "rgba(143,203,232,0.28)";
    ctx.fillRect(X(D.chX0 + 0.2), Y(D.waterY), 1.5 * S, (D.waterY - 0.02) * S);
    ctx.fillRect(X(D.paddyX - D.paddyW), Y(D.paddyWater), D.paddyW * 2 * S, 0.08 * S);
    ctx.strokeStyle = soft; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(D.chX0 - 0.3), Y(0)); ctx.lineTo(X(D.paddyX + D.paddyW), Y(0)); ctx.stroke();
    /* 渡槽 */
    ctx.strokeStyle = wood; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(X(D.trX0), Y(D.trY0)); ctx.lineTo(X(D.trX1), Y(D.trY1)); ctx.stroke();
    /* 双轮圆 + 辐条(转角 −sAdv/R) */
    var rot = -st.sAdv / D.R;
    [[D.yU, "#E9EEF2"], [D.yL, "#E9EEF2"]].forEach(function (cfg) {
      var wx = X(D.xC), wy = Y(cfg[0]), r = D.R * S;
      ctx.strokeStyle = cfg[1]; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(wx, wy, r, 0, Math.PI * 2); ctx.stroke();
      for (var i = 0; i < 4; i++) {
        var a = rot + i * Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(wx + Math.cos(a) * r * 0.15, wy + Math.sin(a) * r * 0.15);
        ctx.lineTo(wx + Math.cos(a) * r, wy + Math.sin(a) * r);
        ctx.stroke();
      }
    });
    /* 链路径(细线) */
    ctx.strokeStyle = faint; ctx.lineWidth = 1;
    ctx.beginPath();
    for (var s = 0; s <= D.Ltot; s += D.Ltot / 40) {
      var p = KS.chainPos(s);
      if (s === 0) ctx.moveTo(X(p.x), Y(p.y)); else ctx.lineTo(X(p.x), Y(p.y));
    }
    ctx.stroke();
    /* 板位(载水黄点 / 空白点) */
    for (var i = 0; i < D.NB; i++) {
      var bs = KS.boardState(i, st.sAdv);
      ctx.fillStyle = bs.wet ? waterC : "rgba(233,238,242,0.55)";
      ctx.fillRect(X(bs.x) - 2.6, Y(bs.y) - 2.6, 5.2, 5.2);
    }
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("提水高 3.33m", X(D.xC - D.R) - 30, Y(2.2));
    ctx.fillText("v " + st.vChain.toFixed(2) + " m/s", X(1.0), Y(D.trY1) - 6);
  }

  /* ② 载水板位:14 板沿链行程 s 展开 */
  function drawFlow(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var x0 = 8, ww = w - 16, y0 = 10, hh = h - 40;
    /* 链行程轴:s 0..Ltot */
    ctx.strokeStyle = faint; ctx.lineWidth = 1;
    ctx.strokeRect(x0, y0, ww, hh);
    /* 载水区着色 */
    ctx.fillStyle = "rgba(143,203,232,0.16)";
    ctx.fillRect(x0 + D.fillS / D.Ltot * ww, y0, (D.dumpS - D.fillS) / D.Ltot * ww, hh);
    /* 分段线:竖段/弧段 */
    ctx.strokeStyle = faint;
    [D.Lrun, D.Lrun + D.Larc, 2 * D.Lrun + D.Larc].forEach(function (s) {
      var x = x0 + s / D.Ltot * ww;
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + hh); ctx.stroke();
    });
    ctx.fillStyle = soft;
    ctx.font = "600 7px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("西竖段↑", x0 + D.Lrun * 0.5 / D.Ltot * ww, y0 + hh + 9);
    ctx.fillText("过顶倾注", x0 + (D.Lrun + D.Larc * 0.5) / D.Ltot * ww, y0 + hh + 9);
    ctx.fillText("东竖段↓", x0 + (D.Lrun + D.Larc + D.Lrun * 0.5) / D.Ltot * ww, y0 + hh + 9);
    ctx.fillText("下弧浸水", x0 + (2 * D.Lrun + D.Larc + D.Larc * 0.5) / D.Ltot * ww, y0 + hh + 9);
    /* 14 板滑块 */
    for (var i = 0; i < D.NB; i++) {
      var bs = KS.boardState(i, st.sAdv);
      var x = x0 + bs.s / D.Ltot * ww;
      var y = y0 + hh - (i / D.NB * hh * 0.85 + 4);
      ctx.fillStyle = bs.wet ? waterC : "rgba(233,238,242,0.5)";
      ctx.fillRect(x - 3, y - 2.5, 6, 5);
    }
    ctx.fillStyle = soft;
    ctx.textAlign = "left";
    ctx.fillText("载水 " + st.wetCount + "/14", x0 + 2, y0 + 10);
  }

  /* ③ 传动:链速读数 + chip */
  function drawDrive(st, ph, pt, ctx, w, h) {
    if (el.v) {
      el.v.textContent = st.vChain.toFixed(2);
      el.v.style.color = st.vChain > 0.05 ? "#6FBF73" : soft;
    }
    if (el.chip) {
      var run = st.vChain > 0.05;
      el.chip.textContent = run ? "运转中 · ω 0.9 rad/s" : "待机 · 链静止";
      el.chip.className = "chip " + (run ? "on" : "");
    }
    ctx.clearRect(0, 0, w, h);
    /* 简单速率条 */
    var bx = 8, bw = w - 16, cy = h * 0.55;
    ctx.fillStyle = "rgba(233,238,242,0.10)";
    ctx.fillRect(bx, cy - 5, bw, 10);
    ctx.fillStyle = teal;
    ctx.fillRect(bx, cy - 5, bw * KS.clamp(st.vChain / 0.45, 0, 1), 10);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("v = ω·R = 0.9 × 0.50 = 0.45 m/s(设计)", bx, cy + 16);
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
    ctx.fillText("链行 " + st.sAdv.toFixed(2) + " m / 板一周 21.8s", x0 + ww, y1 + hh1 + 14);
  }
})(window.MECH = window.MECH || {});
