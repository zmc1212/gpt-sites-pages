/* 底部仪表盘:① 螺旋端视 ② 齿轮 8T:16T ③ 提水流量 ④ 功率/效率 */
(function (MECH) {
  var D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)", faint = "rgba(233,238,242,0.16)";
  var teal = "#7FD8D8", yellow = "#E9C93C", red = "#D6543A", green = "#6FBF73";

  MECH.DASH = { panels: [
    { title: "SCREW · 螺旋端视", meta: "双头螺叶", dot: "teal", canvasH: 100, draw: drawScrew },
    { title: "GEAR · 8T:16T", meta: "一转得二转", dot: "blue", canvasH: 88, draw: drawGear },
    { title: "FLOW · 提水", meta: "Q = q·ω螺旋/2π", dot: "pink", canvasH: 100, draw: drawFlow },
    { title: "POWER · 功率", meta: "P = ρgQH/η", dot: "yellow", canvasH: 66, draw: drawPower }
  ] };

  /* ① 端视(A 向):轴心圆 + 双头螺叶 + 口袋点,随 φ螺旋 旋转 */
  function drawScrew(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.5, R = Math.min(cy, cx) - 8;
    var s = R / (D.Rout + 0.05);
    ctx.strokeStyle = "rgba(233,238,242,0.30)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, D.Rout * s, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = faint;
    ctx.beginPath(); ctx.arc(cx, cy, D.rAxis * s, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
    /* 双头螺叶(径向辐条 + 螺旋倾角偏摆) */
    for (var i = 0; i < 12; i++) {
      var th = st.phiScrew + i / 12 * Math.PI * 2;
      var dx = Math.cos(th), dy = -Math.sin(th);
      var sw = 0.42;                                   // 螺旋倾角引起的切向偏摆
      ctx.strokeStyle = teal; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + dx * D.rAxis * s - dy * sw * 8, cy + dy * D.rAxis * s + dx * sw * 8);
      ctx.lineTo(cx + dx * D.Rout * s - dy * sw * 16, cy + dy * D.Rout * s + dx * sw * 16);
      ctx.stroke();
    }
    /* 水口袋(端视投影:按口袋所在圈位) */
    var wp = MECH.Parts.entry("waterPockets");
    if (wp && wp.group.userData.anim) {
      var pockets = wp.group.userData.anim.pockets;
      for (var j = 0; j < pockets.length; j++) {
        var m = pockets[j];
        if (!m.visible) continue;
        var px = m.position.x * s, pz = (m.position.z - (D.B.z + D.T.z) / 2) * s;
        ctx.fillStyle = "rgba(127,216,216,0.85)";
        ctx.fillRect(cx + px * 0.8 - 2, cy + pz * 0.8 - 2, 4, 4);
      }
    }
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("φ螺旋 " + (st.phiScrew / (2 * Math.PI)).toFixed(2) + " 转", cx, h - 5);
    ctx.textAlign = "left";
    ctx.fillText("R " + D.Rout.toFixed(2) + " · S " + D.S.toFixed(2), 6, 12);
  }

  /* ② 齿轮:枢轮 8T(左)与接轮 16T(右)外啮合,ω螺旋=2ω拐 */
  function drawGear(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    function gear(cx, cy, rp, Z, ang, color, label) {
      ctx.strokeStyle = color; ctx.lineWidth = 1.7;
      ctx.beginPath(); ctx.arc(cx, cy, rp * 0.86, 0, Math.PI * 2); ctx.stroke();
      for (var i = 0; i < Z; i++) {
        var a = ang + i / Z * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * rp * 0.84, cy + Math.sin(a) * rp * 0.84);
        ctx.lineTo(cx + Math.cos(a) * rp, cy + Math.sin(a) * rp);
        ctx.stroke();
      }
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(cx, cy, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
      ctx.fillText(label, cx, cy + rp + 11);
    }
    var S = (h / 2 - 14) / (D.rj + D.rs);
    var x1 = w * 0.30 - D.rs * S, x2 = x1 + (D.rj + D.rs) * S, cy = h * 0.42;
    gear(x1, cy, D.rs * S, D.Zs, st.phiScrew, "#E9EEF2", "枢轮 8T ω" + (D.i * st.omegaCrank).toFixed(2));
    gear(x2, cy, D.rj * S, D.Zj, st.phiCrank, teal, "接轮 16T ω拐 " + st.omegaCrank.toFixed(2));
    ctx.strokeStyle = soft; ctx.lineWidth = 1;
    var mx = x1 + D.rs * S + 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(mx, cy - D.rj * S - 2); ctx.lineTo(mx, cy + D.rj * S + 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("啮合距 0.90", mx, cy - D.rj * S - 5);
    ctx.fillText("ω螺旋 = 16/8 · ω拐 = 2ω拐", w / 2, h - 4);
  }

  /* ③ 提水:口袋爬升示意(轴向位置-高度) + Q + 柜水位 */
  function drawFlow(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var x0 = 14, x1 = w - 14;
    /* 围筒斜线(下池→顶口) */
    ctx.strokeStyle = "rgba(233,238,242,0.35)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x0, h - 14); ctx.lineTo(x1, 14); ctx.stroke();
    /* 口袋点(轴向 u → 线上位置) */
    var wp = MECH.Parts.entry("waterPockets");
    if (wp && wp.group.userData.anim) {
      var pockets = wp.group.userData.anim.pockets;
      for (var i = 0; i < pockets.length; i++) {
        var m = pockets[i];
        if (!m.visible) continue;
        var f = m.userData.u / D.tubeLen;
        var px = x0 + (x1 - x0) * f, py = h - 14 - (h - 28) * f;
        ctx.fillStyle = teal;
        ctx.fillRect(px - 2, py - 2, 4, 4);
      }
    }
    /* 顶口出水 */
    ctx.fillStyle = yellow;
    ctx.fillRect(x1 - 6, 10, 5, 8);
    /* Q + 柜 */
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("Q " + (st.flow * 1000).toFixed(1) + " L/s", 6, 12);
    ctx.fillText("累计 " + st.lifted.toFixed(2) + " m³", 6, h - 4);
    var fw = st.tankWater / D.tank.cap;
    ctx.strokeStyle = faint; ctx.strokeRect(w - 30, 14, 14, h - 30);
    ctx.fillStyle = "rgba(79,163,199,0.8)";
    ctx.fillRect(w - 29, 14 + (h - 30) * (1 - fw), 12, (h - 30) * fw);
    ctx.fillText("柜", w - 27, 12);
  }

  /* ④ 功率:P轴需求 vs 踏功供给(2×120W)——龙尾车费力,历史未推广注记 */
  function drawPower(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var P = D.Pof(st.omegaCrank);
    var Pmax = D.Pof(D.omegaCrankMax) * 1.1;
    var supply = 746;                               // 畜力:1 马力(746W)
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("P需求 ρgQH/η = " + P.toFixed(0) + " W", 8, 12);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 16, w - 16, 9);
    ctx.fillStyle = yellow; ctx.fillRect(8, 16, (w - 16) * Math.min(1, P / Pmax), 9);
    ctx.fillText("畜力供给(1 马力)= " + supply + " W", 8, 38);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 42, w - 16, 9);
    ctx.fillStyle = teal; ctx.fillRect(8, 42, (w - 16) * Math.min(1, supply / Pmax), 9);
    var ok = P <= supply;
    ctx.fillStyle = ok ? green : red;
    ctx.font = "700 9px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText(ok ? "畜力可驱动 ✓(η=0.65)" : "单马不足——文献:效率低于翻车,未推广", w / 2, h - 4);
  }
})(window.MECH = window.MECH || {});
