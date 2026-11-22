/* 底部仪表盘:① 帆轮俯视 ② 传动(三盘同角核对) ③ 龙骨链剖面 ④ 能量核算 */
(function (MECH) {
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.5)", faint = "rgba(233,238,242,0.16)";
  var teal = "#7FD8D8", yellow = "#E9C93C", red = "#D6543A", green = "#6FBF73";

  MECH.DASH = { panels: [
    { title: "WIND · 帆轮", meta: "八帆 · 俯视", dot: "teal", canvasH: 100, draw: drawWind },
    { title: "DRIVE · 传动", meta: "24T:16T = 1.5", dot: "blue", canvasH: 88, draw: drawDrive },
    { title: "PUMP · 龙骨链", meta: "26 节 · 爬升 15.4°", dot: "pink", canvasH: 100, draw: drawPump },
    { title: "POWER · 能量", meta: "P风 ≥ ρgQH/η", dot: "yellow", canvasH: 66, draw: drawPower }
  ] };

  /* ① 帆轮俯视:八帆弦线随 θ轮 转,风向箭头 + 尖速比 */
  function drawWind(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.56, cy = h * 0.5, R = Math.min(h * 0.40, w * 0.20);
    ctx.strokeStyle = "rgba(233,238,242,0.25)"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = faint;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.35, 0, Math.PI * 2); ctx.stroke();
    for (var i = 0; i < 8; i++) {
      var a = st.thetaWheel + i / 8 * Math.PI * 2;
      var dx = Math.cos(a), dy = -Math.sin(a);
      var px = -dy, py = dx;
      ctx.strokeStyle = teal; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + dx * R * 0.92 - px * 8, cy + dy * R * 0.92 - py * 8);
      ctx.lineTo(cx + dx * R * 0.92 + px * 8, cy + dy * R * 0.92 + py * 8);
      ctx.stroke();
      ctx.strokeStyle = "rgba(233,238,242,0.5)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx + dx * R * 0.35, cy + dy * R * 0.35);
      ctx.lineTo(cx + dx * R * 0.92, cy + dy * R * 0.92); ctx.stroke();
    }
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("ω轮 " + st.omegaWheel.toFixed(2) + " rad/s", cx, cy + R + 13);
    /* 风箭头(自南) */
    var wy0 = 10, wy1 = h - 10;
    ctx.strokeStyle = "rgba(127,216,216,0.7)"; ctx.lineWidth = 1.6;
    for (var k = 0; k < 3; k++) {
      var wx = 14 + k * 10;
      ctx.beginPath(); ctx.moveTo(wx, wy1); ctx.lineTo(wx, wy0 + 6); ctx.stroke();
      ctx.fillStyle = "rgba(127,216,216,0.7)";
      ctx.beginPath(); ctx.moveTo(wx, wy0); ctx.lineTo(wx - 3, wy0 + 6); ctx.lineTo(wx + 3, wy0 + 6);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = soft; ctx.textAlign = "left";
    ctx.fillText("v " + st.wind.toFixed(1) + " m/s", 8, h - 4);
    ctx.fillText("λ尖速 0.5", 8, 14);
  }

  /* ② 传动:帆轮/立轮/链轮三盘同角核对,比例标注 */
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
      ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
      ctx.fillText(label, cx, cy + R + 11);
    }
    dial(w * 0.20, h * 0.42, h * 0.28, st.thetaWheel, "#E9EEF2", "帆轮 " + st.omegaWheel.toFixed(2));
    dial(w * 0.52, h * 0.42, h * 0.28, st.omegaPump > 0 ? st.thetaWheel * D.i : 0, teal, "立轮 ×1.5");
    dial(w * 0.82, h * 0.42, h * 0.28, -st.sOff / D.Rsp, yellow, "链轮");
    ctx.strokeStyle = "rgba(233,238,242,0.30)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w * 0.20 + h * 0.28, h * 0.42); ctx.lineTo(w * 0.52 - h * 0.28, h * 0.42); ctx.stroke();
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(w * 0.52 + h * 0.28, h * 0.42); ctx.lineTo(w * 0.82 - h * 0.28, h * 0.42); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = soft; ctx.font = "600 8px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("ω泵 = 24/16 · ω轮 = 1.5ω轮", w * 0.5, h - 4);
  }

  /* ③ 龙骨链剖面:斜槽线 + 刮板刻度随链前进 + 池/槽水位 */
  function drawPump(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var zA = 12, zB = w - 30;                       // z: Pa→Pb 映射
    var zx = function (z) { return zA + (D.Pa.z - z) / (D.Pa.z - D.Pb.z) * (zB - zA); };
    var yv = function (y) { return h - 10 - (y - 0.2) / 1.5 * (h - 24); };
    /* 池水 */
    ctx.strokeStyle = "rgba(79,163,199,0.8)"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(zA - 14, yv(D.pond.water)); ctx.lineTo(zx(D.pond.z0) + 8, yv(D.pond.water)); ctx.stroke();
    ctx.fillStyle = "rgba(79,163,199,0.25)";
    ctx.fillRect(zA - 14, yv(D.pond.water), zx(D.pond.z0) + 8 - (zA - 14), h - 8 - yv(D.pond.water));
    /* 槽线 */
    ctx.strokeStyle = "rgba(233,238,242,0.35)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(zx(D.Pa.z), yv(D.Pa.y)); ctx.lineTo(zx(D.Pb.z), yv(D.Pb.y)); ctx.stroke();
    /* 刮板刻度 */
    for (var i = 0; i < D.N; i++) {
      var wp = KS.loopPose(i * D.p + st.sOff);
      var onRise = wp.tz < 0;                       // 上行(朝 -z)
      ctx.strokeStyle = onRise ? teal : "rgba(233,238,242,0.3)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(zx(wp.z), yv(wp.y) - 3);
      ctx.lineTo(zx(wp.z), yv(wp.y) + 3);
      ctx.stroke();
    }
    /* 出水口 */
    ctx.fillStyle = yellow;
    ctx.fillRect(zx(D.Pb.z) - 3, yv(D.Pb.y) - 10, 4, 8);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("池 " + D.pond.water.toFixed(2), 4, h - 4);
    ctx.fillText("链速 " + (st.omegaPump * D.Rsp).toFixed(3) + " m/s · Q " + (st.flow * 1000).toFixed(1) + " L/s", 4, 12);
    ctx.fillText("扬程 H " + D.H.toFixed(2) + " m", zB - 96, h - 4);
  }

  /* ④ 能量核算:P风 vs ρgQH/η 双条 + 裕度 */
  function drawPower(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var Pw = D.PwindOf(st.wind), Pl = D.PliftOf(st.wind);
    var Pmax = D.PwindOf(D.windMax);
    var bx = 8, bw = w - 16;
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("P风 ½ρAv³Cp", bx, 9);
    ctx.strokeStyle = faint; ctx.strokeRect(bx, 13, bw, 9);
    ctx.fillStyle = teal; ctx.fillRect(bx, 13, bw * Math.min(1, Pw / Pmax), 9);
    ctx.fillText("ρgQH/η", bx, 33);
    ctx.strokeStyle = faint; ctx.strokeRect(bx, 37, bw, 9);
    ctx.fillStyle = yellow; ctx.fillRect(bx, 37, bw * Math.min(1, Pl / Pmax), 9);
    var margin = D.marginOf(Math.max(st.wind, 0.01));
    var ok = margin >= 1.0;
    ctx.fillStyle = ok ? green : red;
    ctx.font = "700 10px Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText(ok ? "裕度 ×" + margin.toFixed(2) + " ✓" : "赤字 ×" + margin.toFixed(2) + " 风速不足", w / 2, h - 5);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "right";
    ctx.fillText("P " + Pw.toFixed(0) + " / " + Pl.toFixed(0) + " W", w - 6, 33);
  }
})(window.MECH = window.MECH || {});
