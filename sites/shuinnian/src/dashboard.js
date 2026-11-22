/* 底部仪表盘:① 水轮俯视 ② 轮系啮合 ③ 碾槽碾压 ④ 功率 */
(function (MECH) {
  var D = MECH.DIM, KS = MECH.KS;
  var ink = "#23252A", soft = "rgba(233,238,242,0.5)", faint = "rgba(233,238,242,0.16)";
  var teal = "#7FD8D8", yellow = "#E9C93C", red = "#D6543A", blue = "#6FA3E8";

  MECH.DASH = { panels: [
    { title: "WHEEL · 水轮", meta: "16 斜叶 · 俯视", dot: "teal", canvasH: 100, draw: drawWheel },
    { title: "DRIVE · 直驱", meta: "轮轴穿碢干 1:1", dot: "blue", canvasH: 88, draw: drawDrive },
    { title: "GROOVE · 碾槽", meta: "谷粒过辊碾白", dot: "green", canvasH: 100, draw: drawGroove },
    { title: "POWER · 功率", meta: "P=ηρQgh", dot: "yellow", canvasH: 66, draw: drawPower }
  ] };

  /* ① 水轮俯视:轮逆时针转(θ轮↑),槽与闸门在左 */
  function drawWheel(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.62, cy = h * 0.52, R = Math.min(h * 0.40, w * 0.22);
    var s = R / D.rWheel;
    /* 引水槽(左) */
    ctx.strokeStyle = soft; ctx.lineWidth = 1.4;
    var fy0 = cy - R * 0.42, fy1 = cy + R * 0.42;
    var fx0 = 6, fx1 = cx - R * 0.62;
    ctx.strokeRect(fx0, fy0, fx1 - fx0, fy1 - fy0);
    ctx.fillStyle = "rgba(79,163,199,0.35)";
    if (st.gate > 0.04 && st.running) ctx.fillRect(fx0, fy0 + 2, (fx1 - fx0) * 0.8, fy1 - fy0 - 4);
    /* 闸门(位置随开度) */
    var gx = fx0 + (D.gateX - D.flumeX0) / (D.flumeX1 - D.flumeX0) * (fx1 - fx0);
    ctx.strokeStyle = yellow; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(gx, fy0 - 1); ctx.lineTo(gx, fy1 + 1); ctx.stroke();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("闸 " + (st.gate * 100).toFixed(0) + "%", gx + 3, fy0 - 2);
    /* 水轮:轮毂 + 16 斜叶 */
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = faint;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.12, 0, Math.PI * 2); ctx.stroke();
    for (var i = 0; i < D.nBlade; i++) {
      var a = st.thetaWheel + i / D.nBlade * Math.PI * 2;
      var r0 = R * 0.14, r1 = R * 0.96;
      var dx = Math.cos(a), dy = -Math.sin(a);          // 俯视:y 向下=世界 −z
      var px = -dy, py = dx;                             // 切向
      var tilt = 0.55;                                   // 斜叶示意偏角
      ctx.strokeStyle = teal; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + dx * r0 - px * 3, cy + dy * r0 - py * 3);
      ctx.lineTo(cx + dx * r1 - px * 6 * tilt, cy + dy * r1 - py * 6 * tilt);
      ctx.stroke();
    }
    ctx.fillStyle = soft; ctx.textAlign = "center";
    ctx.fillText("ω轮 " + st.omegaWheel.toFixed(2) + " rad/s", cx, cy + R + 12);
    /* 转向箭头 */
    if (st.running) {
      ctx.strokeStyle = yellow; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(cx, cy, R + 7, 0.4, 1.6); ctx.stroke();
      var ax = cx + Math.cos(1.66) * (R + 7), ay = cy - Math.sin(1.66) * (R + 7);
      ctx.fillStyle = yellow;
      ctx.beginPath(); ctx.arc(ax, ay, 2.4, 0, Math.PI * 2); ctx.fill();
    }
  }

  /* ② 直驱校验:轮轴=碢干同角(左盘),石辊自转(右盘),无滑移等式实时核对 */
  function drawDrive(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    function dial(cx, cy, R, ang, color, label) {
      ctx.strokeStyle = "rgba(233,238,242,0.22)"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      for (var i = 0; i < 12; i++) {
        var a = i / 12 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * R * 0.84, cy + Math.sin(a) * R * 0.84);
        ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        ctx.stroke();
      }
      var dx = Math.sin(ang), dy = Math.cos(ang);
      ctx.strokeStyle = color; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(cx - dx * R * 0.2, cy - dy * R * 0.2);
      ctx.lineTo(cx + dx * R * 0.8, cy + dy * R * 0.8); ctx.stroke();
      ctx.fillStyle = soft; ctx.font = "600 8px Menlo, monospace"; ctx.textAlign = "center";
      ctx.fillText(label, cx, cy + R + 11);
    }
    dial(w * 0.22, h * 0.44, h * 0.30, st.thetaWheel, "#E9EEF2", "轮轴 ω " + st.omegaWheel.toFixed(2));
    dial(w * 0.55, h * 0.44, h * 0.30, st.thetaYoke, teal, "碢干 ω公 " + st.omegaYoke.toFixed(2));
    dial(w * 0.85, h * 0.44, h * 0.30, st.phiRoller, yellow, "石辊 ω自 " + st.omegaRoller.toFixed(2));
    /* 直驱连线 + 无滑移等式 */
    ctx.strokeStyle = "rgba(233,238,242,0.30)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w * 0.22 + h * 0.30, h * 0.44); ctx.lineTo(w * 0.55 - h * 0.30, h * 0.44); ctx.stroke();
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(w * 0.55 + h * 0.30, h * 0.44); ctx.lineTo(w * 0.85 - h * 0.30, h * 0.44); ctx.stroke();
    ctx.setLineDash([]);
    var ok = Math.abs(st.maxErr) < 1e-9;
    ctx.fillStyle = ok ? "#6FBF73" : red; ctx.textAlign = "center";
    ctx.font = "700 9px Menlo, monospace";
    ctx.fillText(ok ? "v=ω公·R=ω自·r ✓ 无滑移" : "滑移异常!", w * 0.5, h - 4);
  }

  /* ③ 碾槽俯视:碾盘+槽环+公转圆+双辊+谷粒(碾白变浅) */
  function drawGroove(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.52, S = (Math.min(cy, cx) - 6) / D.panR;
    /* 碾盘 */
    ctx.strokeStyle = "rgba(233,238,242,0.30)"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(cx, cy, D.panR * S, 0, Math.PI * 2); ctx.stroke();
    /* 碾槽环 */
    ctx.strokeStyle = faint; ctx.lineWidth = D.grooveW * S;
    ctx.beginPath(); ctx.arc(cx, cy, D.grooveR * S, 0, Math.PI * 2); ctx.stroke();
    /* 溜槽卸料口标记 */
    var aC = -0.415;
    ctx.fillStyle = "#C9A86B";
    ctx.beginPath();
    ctx.arc(cx + Math.cos(aC) * D.grooveR * S, cy - Math.sin(aC) * D.grooveR * S, 3, 0, Math.PI * 2);
    ctx.fill();
    /* 谷粒 */
    var g = MECH.Parts.entry("grain");
    if (g && g.group.userData.anim) {
      var grains = g.group.userData.anim.grains;
      for (var i = 0; i < grains.length; i++) {
        var m = grains[i];
        var px = cx + Math.cos(m.userData.alpha) * D.grooveR * S;
        var py = cy - Math.sin(m.userData.alpha) * D.grooveR * S;
        ctx.fillStyle = m.userData.crushed ? "rgba(231,223,200,0.95)" : "#C9A86B";
        ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
      }
    }
    /* 公转虚线圆 + 双辊位置 */
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "rgba(233,238,242,0.22)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, D.grooveR * S, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    [0, Math.PI].forEach(function (off) {
      var a = st.thetaYoke + off;
      var px = cx + Math.cos(a) * D.grooveR * S, py = cy - Math.sin(a) * D.grooveR * S;
      ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(px - Math.sin(a) * 5, py - Math.cos(a) * 5);
      ctx.lineTo(px + Math.sin(a) * 5, py + Math.cos(a) * 5);
      ctx.stroke();
      ctx.fillStyle = teal;
      ctx.beginPath(); ctx.arc(px, py, 2.2, 0, Math.PI * 2); ctx.fill();
    });
    /* 碾臂线 */
    ctx.strokeStyle = "rgba(176,141,87,0.6)"; ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(st.thetaYoke) * 4, cy - Math.sin(st.thetaYoke) * 4);
    ctx.lineTo(cx + Math.cos(st.thetaYoke + Math.PI) * 4, cy - Math.sin(st.thetaYoke + Math.PI) * 4);
    ctx.stroke();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("碾白 " + st.crushed + "/30", 6, 10);
    ctx.fillText("辊自转 " + st.omegaRoller.toFixed(2) + " rad/s", 6, h - 6);
  }

  /* ④ 功率:闸门/流量/轴功率估计 */
  function drawPower(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var Q = st.gate * D.QK;
    var P = D.eta * 1000 * Q * 9.8 * D.head;
    var Pmax = D.eta * 1000 * D.QK * 9.8 * D.head;
    /* 闸门竖条 */
    var gx = 10, gw = 12, gh = h - 18;
    ctx.strokeStyle = soft; ctx.lineWidth = 1;
    ctx.strokeRect(gx, 8, gw, gh);
    ctx.fillStyle = yellow;
    ctx.fillRect(gx, 8 + gh * (1 - st.gate), gw, gh * st.gate);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("闸", gx + 2, 7);
    /* 功率横条 */
    var bx = gx + gw + 12, bw = w - bx - 10;
    ctx.strokeStyle = faint;
    ctx.strokeRect(bx, 12, bw, 10);
    ctx.fillStyle = teal;
    ctx.fillRect(bx, 12, bw * Math.min(1, P / Pmax), 10);
    ctx.fillStyle = soft;
    ctx.fillText("Q " + (Q * 1000).toFixed(1) + " L/s", bx, 34);
    ctx.fillText("P轴 ≈ " + P.toFixed(0) + " W (η=0.6)", bx, 46);
    ctx.fillText("叶尖速 " + (st.omegaWheel * D.rWheel).toFixed(2) + " m/s", bx, 58);
  }
})(window.MECH = window.MECH || {});
