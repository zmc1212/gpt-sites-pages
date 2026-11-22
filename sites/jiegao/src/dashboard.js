/* 底部仪表盘:① TRAIN 杠杆臂几何 ② TORQUE 力矩天平 ③ PATH 罐端轨迹 ④ CYCLE 阶段时序 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.45)", faint = "rgba(233,238,242,0.16)";
  var yellow = "#E9C93C", teal = "#7FD8D8", red = "#D6543A", waterC = "#8FCBE8";
  var wood = "#B08D57";

  var SUB = 8.4;
  var SUB_SEGS = [["摆出", 1.3], ["倾倒", 1.2], ["回位", 1.4], ["下压", 2.2], ["汲满", 0.6], ["提罐", 1.7]];
  var STARTS = (function () {
    var acc = 0, arr = [];
    MECH.PHASES.forEach(function (ph) { arr.push(acc); acc += ph.dur; });
    arr.total = acc;
    return arr;
  })();

  MECH.DASH = { panels: [
    { title: "TRAIN · 杠杆几何", meta: "L短1.875 / L长4.125 · k=2.2", dot: "yellow", canvasH: 118,
      draw: drawTrain },
    { title: "TORQUE · 力矩天平", meta: "T石 75.0 kg·m", dot: "green",
      html: '<div class="big" id="d-net">+66.8</div><div class="k">净力矩 T石 − T罐(kg·m)</div><div class="chip" id="d-tchip">—</div>',
      canvasH: 84, init: initTorque, draw: drawTorque },
    { title: "PATH · 罐端轨迹", meta: "汲水弧 · 入井口 → 摆出倾倒", dot: "blue", canvasH: 108,
      draw: drawPath },
    { title: "CYCLE · 阶段时序", meta: "44.3s 自动循环", dot: "orange", canvasH: 86,
      draw: drawCycle }
  ] };

  function initTorque(sec) {
    el.net = sec.querySelector("#d-net");
    el.tchip = sec.querySelector("#d-tchip");
  }

  /* ① 杠杆几何简图(实时 θ/φ/tilt) */
  function drawTrain(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var S = Math.min(w / 9.8, (h - 14) / 8.8);
    var cx = w * 0.5, cy = h * 0.56;
    function X(x) { return cx + (x - 1.9) * S; }
    function Y(y) { return cy - (y - 0.9) * S; }
    /* 地面 / 井 */
    ctx.strokeStyle = soft; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(-2.5), Y(0)); ctx.lineTo(X(6.5), Y(0)); ctx.stroke();
    ctx.strokeStyle = faint;
    ctx.strokeRect(X(1.70), Y(0.18), 3.40 * S, 0.18 * S);
    ctx.fillStyle = "rgba(143,203,232,0.30)";
    ctx.fillRect(X(D.wellCx - D.wellA), Y(D.waterY), 2 * D.wellA * S, (D.waterY - D.poolFloor) * S);
    ctx.strokeStyle = waterC; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(X(D.wellCx - D.wellA), Y(D.waterY)); ctx.lineTo(X(D.wellCx + D.wellA), Y(D.waterY)); ctx.stroke();
    ctx.strokeStyle = soft;
    ctx.strokeRect(X(D.wellCx - D.wellA - D.kerbT), Y(D.kerbTop), D.kerbT * S, (D.kerbTop - 0.18) * S);
    ctx.strokeRect(X(D.wellCx + D.wellA), Y(D.kerbTop), D.kerbT * S, (D.kerbTop - 0.18) * S);
    /* 立柱 + 斜撑 + 枢轴 */
    ctx.strokeStyle = wood; ctx.lineWidth = Math.max(2, 0.18 * S);
    ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(0), Y(D.postTop)); ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(X(1.05), Y(0)); ctx.lineTo(X(0.1), Y(2.45)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(-1.05), Y(0)); ctx.lineTo(X(-0.1), Y(2.45)); ctx.stroke();
    ctx.fillStyle = yellow;
    ctx.beginPath(); ctx.arc(X(0), Y(D.pivotY), 2.6, 0, Math.PI * 2); ctx.fill();
    /* 横杆(实时 θ) */
    var tipS = KS.tipShort(st.thetaDeg), tipL = st.tipL;
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = Math.max(2, 0.10 * S);
    ctx.beginPath(); ctx.moveTo(X(tipS.x), Y(tipS.y)); ctx.lineTo(X(tipL.x), Y(tipL.y)); ctx.stroke();
    /* 坠石绳 + 坠石 */
    var stn = KS.stonePos(st.thetaDeg);
    ctx.strokeStyle = soft; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(tipS.x), Y(tipS.y)); ctx.lineTo(X(stn.x), Y(stn.y)); ctx.stroke();
    ctx.fillStyle = "#9FA3AA";
    ctx.fillRect(X(stn.x) - 0.26 * S, Y(stn.y + 0.24), 0.52 * S, 0.48 * S);
    /* 吊绳 + 罐(含摆出 φ 与倾角) */
    var jt = KS.jugTop(st.thetaDeg, st.phiDeg);
    ctx.beginPath(); ctx.moveTo(X(tipL.x), Y(tipL.y)); ctx.lineTo(X(jt.x), Y(jt.y)); ctx.stroke();
    ctx.save();
    ctx.translate(X(st.jugC.x), Y(st.jugC.y));
    ctx.rotate(-st.tiltRad);
    ctx.fillStyle = "rgba(185,138,78,0.85)";
    ctx.fillRect(-0.17 * S, -0.23 * S, 0.34 * S, 0.46 * S);
    ctx.fillStyle = "rgba(143,203,232,0.75)";
    ctx.fillRect(-0.15 * S, (0.23 - 0.46 * st.fill) * S, 0.30 * S, 0.44 * S * st.fill);
    ctx.restore();
    /* 水槽 */
    ctx.strokeStyle = soft;
    ctx.strokeRect(X(D.trCx - D.trHX), Y(D.trRim), 2 * D.trHX * S, D.trRim * S);
    ctx.strokeStyle = waterC;
    ctx.beginPath(); ctx.moveTo(X(D.trCx - D.trHX + 0.08), Y(D.trWater)); ctx.lineTo(X(D.trCx + D.trHX - 0.08), Y(D.trWater)); ctx.stroke();
    /* 杠杆臂标注 */
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("L短 1.875", X(tipS.x * 0.5), Y(tipS.y * 0.55) - 6);
    ctx.fillText("L长 4.125", X(tipL.x * 0.55), Y(tipL.y * 0.55) - 6);
    ctx.fillStyle = yellow;
    ctx.fillText("θ " + st.thetaDeg.toFixed(0) + "°", X(0) + 14, Y(D.pivotY) - 8);
  }

  /* ② 力矩天平(数值 + 跷梁) */
  function drawTorque(st, ph, pt, ctx, w, h) {
    if (el.net) {
      el.net.textContent = (st.net >= 0 ? "+" : "") + st.net.toFixed(1);
      el.net.style.color = st.net > 0.5 ? "#6FBF73" : red;
    }
    if (el.tchip) {
      if (st.pressing) {
        el.tchip.textContent = "人力下压 · F=" + KS.pressForce(st.fill).toFixed(1) + " kg·f";
        el.tchip.className = "chip hot";
      } else {
        el.tchip.textContent = "坠石胜 · 罐自动上提";
        el.tchip.className = "chip on";
      }
    }
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.52, L = w * 0.40;
    var tiltA = KS.clamp(st.net / 40, -1, 1) * 0.15;
    /* 支点 */
    ctx.strokeStyle = soft; ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 4); ctx.lineTo(cx - 7, cy + 12); ctx.lineTo(cx + 7, cy + 12);
    ctx.closePath(); ctx.stroke();
    /* 跷梁(石侧下沉 = net>0) */
    var dx = Math.sin(tiltA), dyv = Math.cos(tiltA);
    var lx = cx - L * dx, ly = cy + L * (1 - dyv), rx = cx + L * dx, ry = cy - L * (1 - dyv);
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ry); ctx.stroke();
    /* 两端吊罐与读数 */
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly + 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx, ry + 8); ctx.stroke();
    ctx.fillStyle = yellow;
    ctx.font = "700 9px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("石 75.0", lx, ly + 14);
    ctx.fillStyle = st.fill > 0.9 ? waterC : soft;
    ctx.fillText("罐 " + st.tJug.toFixed(1), rx, ry + 14);
    if (st.pressing) {
      ctx.strokeStyle = red; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(rx, ry - 4); ctx.lineTo(rx, ry - 18); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx - 3.5, ry - 13); ctx.lineTo(rx, ry - 19); ctx.lineTo(rx + 3.5, ry - 13); ctx.stroke();
      ctx.fillStyle = red;
      ctx.fillText("人力", rx, ry - 22);
    }
    ctx.fillStyle = faint;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.fillText("T空 8.3 < T满 49.5 < T石 75.0", cx, h - 5);
  }

  /* ③ 罐端轨迹弧线(汲水弧 + 摆出弧 + 当前点) */
  function drawPath(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var S = Math.min(w / 4.6, (h - 12) / 5.9);
    var cx = w * 0.52, cy = h * 0.5;
    function X(x) { return cx + (x - 4.2) * S; }
    function Y(y) { return cy - (y - 0.1) * S; }
    /* 井栏带 + 水面 */
    ctx.fillStyle = "rgba(233,238,242,0.07)";
    ctx.fillRect(X(D.wellCx - D.wellA), Y(D.kerbTop), 2 * D.wellA * S, (D.kerbTop - D.poolFloor) * S);
    ctx.strokeStyle = waterC; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(D.wellCx - D.wellA), Y(D.waterY)); ctx.lineTo(X(D.wellCx + D.wellA), Y(D.waterY)); ctx.stroke();
    ctx.strokeStyle = soft;
    ctx.strokeRect(X(D.trCx - D.trHX), Y(D.trRim), 2 * D.trHX * S, D.trRim * S);
    /* 汲水弧:θ −24°→+13.5°(φ=0,罐中心轨迹) */
    ctx.strokeStyle = "rgba(233,238,242,0.85)"; ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (var i = 0; i <= 40; i++) {
      var p = KS.jugPos(D.thetaHigh + (D.thetaPress - D.thetaHigh) * i / 40, 0);
      if (i === 0) ctx.moveTo(X(p.x), Y(p.y)); else ctx.lineTo(X(p.x), Y(p.y));
    }
    ctx.stroke();
    /* 摆出弧:θ −24→+15 与 φ 0→68 同步(carry-out 段) */
    ctx.strokeStyle = teal; ctx.lineWidth = 1.3;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (var j = 0; j <= 24; j++) {
      var u = KS.ease(j / 24);
      var p2 = KS.jugPos(D.thetaHigh + (D.thetaPour - D.thetaHigh) * u, D.phiPour * u);
      if (j === 0) ctx.moveTo(X(p2.x), Y(p2.y)); else ctx.lineTo(X(p2.x), Y(p2.y));
    }
    ctx.stroke();
    ctx.setLineDash([]);
    /* 当前罐位 */
    ctx.fillStyle = yellow;
    ctx.beginPath(); ctx.arc(X(st.jugC.x), Y(st.jugC.y), 3.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = yellow; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(X(st.jugC.x), Y(st.jugC.y), 6.5, 0, Math.PI * 2); ctx.stroke();
    /* 关键点标注 */
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    var hi = KS.jugPos(D.thetaHigh, 0), pr = KS.jugPos(D.thetaPress, 0);
    ctx.fillText("高位 −24°", X(hi.x) + 6, Y(hi.y) - 3);
    ctx.fillText("下压 +" + D.thetaPress + "°", X(pr.x) + 6, Y(pr.y) + 10);
    ctx.fillStyle = teal;
    ctx.fillText("摆出倾倒", X(D.trCx - D.trHX) - 4, Y(D.trRim) - 5);
  }

  /* ④ 阶段时序(8 段 + 循环段子循环) */
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
    /* 游标 */
    var gx = x0 + gt / total * ww;
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(gx, y1 - 3); ctx.lineTo(gx, y1 + hh1 + 3); ctx.stroke();
    /* 循环段子循环细分(始终显示,当前段高亮) */
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
