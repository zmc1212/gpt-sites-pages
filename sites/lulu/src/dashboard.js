/* 底部仪表盘:① WINCH 卷筒传动 ② FORCE 省力比 ③ ROPE 绳长行程 ④ CYCLE 阶段时序 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.45)", faint = "rgba(233,238,242,0.16)";
  var yellow = "#E9C93C", teal = "#7FD8D8", red = "#D6543A", waterC = "#8FCBE8";
  var wood = "#B08D57";

  var SUB = 7.0;
  var SUB_SEGS = [["放桶", 1.9], ["汲满", 0.7], ["提桶", 1.5], ["摆出", 0.9], ["倾倒", 1.1], ["回位", 0.9]];
  var STARTS = (function () {
    var acc = 0, arr = [];
    MECH.PHASES.forEach(function (ph) { arr.push(acc); acc += ph.dur; });
    arr.total = acc;
    return arr;
  })();

  MECH.DASH = { panels: [
    { title: "WINCH · 卷筒传动", meta: "径 0.22m · ψ 实时", dot: "yellow", canvasH: 118,
      draw: drawWinch },
    { title: "FORCE · 省力比", meta: "i = 0.55/0.22 = 2.5", dot: "green",
      html: '<div class="big" id="d-f">5.6</div><div class="k">摇柄力 kg·f(满载 5.6 / 空载 0.8)</div><div class="chip" id="d-fchip">—</div>',
      canvasH: 72, init: initForce, draw: drawForce },
    { title: "ROPE · 绳长行程", meta: "0.51 ↔ 1.36 m", dot: "blue", canvasH: 108,
      draw: drawRope },
    { title: "CYCLE · 阶段时序", meta: "44s 自动循环", dot: "orange", canvasH: 86,
      draw: drawCycle }
  ] };

  function initForce(sec) {
    el.f = sec.querySelector("#d-f");
    el.fchip = sec.querySelector("#d-fchip");
  }

  /* ① 侧视简图(视向 +x:z 向左为南),卷筒端面 + 辐条实时旋转 */
  function drawWinch(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var S = Math.min(w / 6.4, (h - 14) / 6.6);
    var cx = w * 0.5, cy = h * 0.52;
    function X(z) { return cx + (D.wellZ - z) * S; }
    function Y(y) { return cy - (y - 1.15) * S; }
    /* 地面 + 井栏截面 */
    ctx.strokeStyle = soft; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(4.7), Y(0)); ctx.lineTo(X(-0.4), Y(0)); ctx.stroke();
    ctx.strokeStyle = soft;
    [[D.wellZ - D.wellA - D.kerbT, D.wellZ - D.wellA], [D.wellZ + D.wellA, D.wellZ + D.wellA + D.kerbT]].forEach(function (zb) {
      ctx.strokeRect(X(zb[1]), Y(D.kerbTop), (zb[1] - zb[0]) * S, (D.kerbTop - 0.18) * S);
    });
    ctx.fillStyle = "rgba(143,203,232,0.30)";
    ctx.fillRect(X(D.wellZ + D.wellA), Y(D.waterY), 2 * D.wellA * S, (D.waterY - D.poolFloor) * S);
    ctx.strokeStyle = waterC; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(X(D.wellZ + D.wellA), Y(D.waterY)); ctx.lineTo(X(D.wellZ - D.wellA), Y(D.waterY)); ctx.stroke();
    /* 立架(截面 A 形) */
    ctx.strokeStyle = wood; ctx.lineWidth = 1.6;
    [D.axleHalf, -D.axleHalf].forEach(function (fx) {
      /* 立架在 x 向,侧视中重合于井中线 —— 画轴承座示意 */
    });
    ctx.strokeRect(X(D.wellZ) - 0.12 * S, Y(D.axleY + 0.11), 0.24 * S, 0.22 * S);
    /* 卷筒端面圆 + 辐条(ψ 实时,rotation.x=ψ:+y 转向 −z=画布右) */
    function px(a, r) { return [X(D.wellZ) + Math.sin(a) * r * S, Y(D.axleY) - Math.cos(a) * r * S]; }
    var dr = D.rDrum * S;
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(X(D.wellZ), Y(D.axleY), dr, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(X(D.wellZ), Y(D.axleY), dr * 0.42, 0, Math.PI * 2); ctx.stroke();
    for (var i = 0; i < 6; i++) {
      var a = st.psiRad + i / 6 * Math.PI * 2;
      var p0 = px(a, D.rDrum * 0.42), p1 = px(a, D.rDrum);
      ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
    }
    /* 摇柄(同轴端面,臂长 0.55) */
    var pc = px(st.psiRad, D.rCrank);
    ctx.strokeStyle = yellow; ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(X(D.wellZ), Y(D.axleY));
    ctx.lineTo(pc[0], pc[1]);
    ctx.stroke();
    /* 绳 + 桶(φ 摆出) */
    var jt = KS.bailTop(st.ropeLen, st.phiDeg);
    ctx.strokeStyle = soft; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(D.wellZ), Y(D.axleY - D.rDrum)); ctx.lineTo(X(jt.z), Y(jt.y)); ctx.stroke();
    ctx.save();
    ctx.translate(X(jt.z), Y(jt.y));
    ctx.rotate(st.tiltRad);
    ctx.strokeStyle = soft;
    ctx.strokeRect(-0.20 * S, 0, 0.40 * S, 0.45 * S);
    ctx.fillStyle = "rgba(143,203,232,0.75)";
    ctx.fillRect(-0.18 * S, 0.05 * S + (1 - st.fill) * 0.38 * S, 0.36 * S, 0.38 * S * st.fill);
    ctx.restore();
    /* 瓦盆 */
    ctx.strokeStyle = soft;
    ctx.strokeRect(X(D.basinZ + D.basinR), Y(D.basinRim), 2 * D.basinR * S, (D.basinRim - D.stoolH) * S);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("ψ " + st.psiDeg.toFixed(0) + "°", X(D.wellZ), Y(D.axleY) - dr - 6);
    ctx.fillText("L " + st.ropeLen.toFixed(2) + "m", X(jt.z) + 0.5 * S, Y(jt.y) + 0.5 * S);
  }

  /* ② 省力比:双圆半径比 + 柄力读数 */
  function drawForce(st, ph, pt, ctx, w, h) {
    if (el.f) {
      var f = st.bucketMass / D.iAdv;
      el.f.textContent = f.toFixed(1);
      el.f.style.color = f < 8 ? "#6FBF73" : red;
    }
    if (el.fchip) {
      var pulling = ph.id === "lower" || (ph.id === "cycle" && (pt % SUB) < 4.1);
      el.fchip.textContent = pulling ? "提桶做功 · " + st.bucketMass.toFixed(1) + "kg / " + D.iAdv.toFixed(1) : "省力比 2.5 · 单手可摇";
      el.fchip.className = "chip " + (pulling ? "warn" : "on");
    }
    ctx.clearRect(0, 0, w, h);
    var cy = h * 0.52;
    /* 筒圆 vs 柄臂圆(同圆心,半径比 0.22:0.55) */
    var cx = w * 0.30, R = Math.min(w * 0.16, h * 0.36);
    ctx.strokeStyle = soft; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(cx, cy, R * (D.rDrum / D.rCrank), 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#E9EEF2";
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    var ca = st.psiRad;
    ctx.strokeStyle = yellow; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.sin(ca) * R, cy - Math.cos(ca) * R);
    ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("筒 0.22", cx + R * 0.30, cy - R * 0.42);
    ctx.fillText("柄 0.55", cx + R * 0.72, cy + 4);
    /* 载荷条 */
    var bx = w * 0.56, bw = w * 0.38;
    ctx.fillStyle = "rgba(233,238,242,0.10)";
    ctx.fillRect(bx, cy - 9, bw, 7);
    ctx.fillStyle = waterC;
    ctx.fillRect(bx, cy - 9, bw * KS.clamp(st.bucketMass / 14, 0, 1), 7);
    ctx.fillStyle = "rgba(233,238,242,0.10)";
    ctx.fillRect(bx, cy + 3, bw, 7);
    ctx.fillStyle = yellow;
    ctx.fillRect(bx, cy + 3, bw * KS.clamp((st.bucketMass / D.iAdv) / 8, 0, 1), 7);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.fillText("载荷 " + st.bucketMass.toFixed(1) + "kg", bx, cy - 13);
    ctx.fillText("柄力 " + (st.bucketMass / D.iAdv).toFixed(1) + "kg·f", bx, cy + 20);
  }

  /* ③ 绳长-行程竖尺 */
  function drawRope(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var x0 = w * 0.34, ww = w * 0.16, y0 = 8, hh = h - 30;
    /* 量程:桶底 0(高位)…1.0(池底)映射 L 0.51..1.36 */
    function yOf(L) { return y0 + (L - D.Lhigh) / (D.Llow - D.Lhigh) * hh; }
    ctx.strokeStyle = faint; ctx.lineWidth = 1;
    ctx.strokeRect(x0, y0, ww, hh);
    /* 水面线:桶底触水 L=1.19 */
    var yw = yOf(1.19);
    ctx.strokeStyle = waterC; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x0 - 8, yw); ctx.lineTo(x0 + ww + 8, yw); ctx.stroke();
    ctx.fillStyle = waterC;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("水面", x0 + ww + 12, yw + 3);
    /* 汲满区着色 */
    ctx.fillStyle = "rgba(143,203,232,0.14)";
    ctx.fillRect(x0, yw, ww, y0 + hh - yw);
    /* 绳 + 桶标记 */
    var yL = yOf(st.ropeLen);
    ctx.strokeStyle = soft; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(x0 - 6, y0); ctx.lineTo(x0 - 6, yL); ctx.stroke();
    ctx.fillStyle = yellow;
    ctx.fillRect(x0 - 3, yL - 5, ww + 6, 10);
    ctx.fillStyle = yellow;
    ctx.beginPath(); ctx.arc(x0 + ww / 2, yL, 3.2, 0, Math.PI * 2); ctx.fill();
    /* 刻度 */
    ctx.fillStyle = soft;
    ctx.textAlign = "right";
    [D.Lhigh, 1.19, D.Llow].forEach(function (L) {
      ctx.fillText(L.toFixed(2), x0 - 10, yOf(L) + 3);
    });
    ctx.textAlign = "left";
    ctx.fillText("ψ " + st.psiDeg.toFixed(0) + "° · 转数 " + (Math.abs(st.psiRad) / (2 * Math.PI)).toFixed(2), 4, h - 6);
    ctx.fillText("桶 " + (st.fill >= 0.98 ? "满" : (st.fill <= 0.02 ? "空" : "汲水中")), x0 + ww + 12, yL + 3);
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
    var y2 = y1 + hh1 + 8, hh2 = 14;
    var acc = 0, cur = -1;
    var cIn = ph.id === "cycle" ? pt % SUB : -1;
    SUB_SEGS.forEach(function (sg, i) {
      var x = x0 + acc / SUB * ww, seg = sg[1] / SUB * ww;
      var on = cIn >= acc && cIn < acc + sg[1];
      if (on) cur = i;
      ctx.fillStyle = on ? "rgba(127,216,216,0.28)" : "rgba(233,238,242,0.08)";
      ctx.fillRect(x, y2, seg - 1.5, hh2);
      ctx.strokeStyle = on ? teal : faint;
      ctx.strokeRect(x, y2, seg - 1.5, hh2);
      ctx.fillStyle = on ? teal : "rgba(233,238,242,0.35)";
      ctx.font = "600 7px Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(sg[0], x + seg / 2 - 0.75, y2 + hh2 / 2 + 2.5);
      acc += sg[1];
    });
    ctx.fillStyle = soft;
    ctx.font = "600 7px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("t=" + gt.toFixed(1) + "s / " + total.toFixed(1) + "s", x0, y2 + hh2 + 10);
    ctx.textAlign = "right";
    ctx.fillText("子循环 " + (ph.id === "cycle" ? (Math.floor(pt / SUB) + 1) + "/2" : "—"), x0 + ww, y2 + hh2 + 10);
  }
})(window.MECH = window.MECH || {});
