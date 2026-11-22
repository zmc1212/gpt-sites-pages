/* 图纸面板(B 键):纺车侧视总图 + 传动比详图 + 尺寸表 */
(function (MECH) {
  var red = "#8C2F1E";

  function arrow(ctx, x1, y1, x2, y2, text, below) {
    ctx.strokeStyle = "rgba(42,38,32,0.4)";
    ctx.fillStyle = "rgba(42,38,32,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    var s = 4, dir = x2 >= x1 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * dir, y2 - 3); ctx.lineTo(x2 - s * dir, y2 + 3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + s * dir, y1 - 3); ctx.lineTo(x1 + s * dir, y1 + 3); ctx.closePath(); ctx.fill();
    ctx.font = "600 10px Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText(text, (x1 + x2) / 2, below ? (y1 + 13) : (y1 - 5));
  }

  MECH.BP = {
    no: "Fig. 13 · 复原总图",
    title: "三锭脚踏纺车 · 绳传动 ×16.7",
    src: "王祯《农书》卷二十三木棉纺车图 · 《天工开物·乃服》",
    draw: function (ctx, w, h) {
      var D = MECH.DIM;
      ctx.clearRect(0, 0, w, h);
      var chainH = 44, chainY = h - chainH - 12, topY = 34;
      var ink = "#2A2620";
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("锭速 = 轮速 × (R轮/r锭) = ω × (0.35/0.021) = ω × 16.7 · 三锭同轴同绳同速", w * 0.045, topY - 10);

      /* ============ 左:俯视布局图 ============ */
      var S = Math.min(w * 0.42 / 3.2, (chainY - topY - 26) / 1.6);
      var ox = w * 0.05, oy = chainY - 20;
      var X = function (m) { return ox + (m + 1.0) * S; }, Y = function (m) { return oy - m * S; };
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = 1.4;
      ctx.font = "700 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("俯视 PLAN(轮右 · 锭左)", ox, Y(0.78));
      /* 机架 */
      ctx.strokeRect(X(-0.75), Y(0.46), 1.5 * S, 0.1 * S);
      /* 大绳轮(正视圆) */
      ctx.beginPath(); ctx.arc(X(0.62), Y(0.62), D.R * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(0.62), Y(0.62), 0.06 * S, 0, Math.PI * 2); ctx.stroke();
      /* 三锭(轴线沿 X,锭轮小圆) */
      D.zSpindles.forEach(function (z, k) {
        ctx.beginPath();
        ctx.moveTo(X(-0.68), Y(0.42));
        ctx.lineTo(X(-0.70), Y(0.42 + z * 0 + 0));
        ctx.stroke();
        ctx.beginPath(); ctx.arc(X(-0.20), Y(0.42 + z * 0.0), Math.max(2, D.rSp * S), 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(X(-0.20), Y(0.42));
        ctx.lineTo(X(-0.68), Y(0.42));
        ctx.stroke();
        ctx.font = "600 8px sans-serif";
        ctx.fillStyle = "rgba(42,38,32,0.6)";
        ctx.fillText("锭" + (k + 1), X(-0.68), Y(0.42 + z * 0) - 4);
        ctx.fillStyle = ink;
        /* 绳圈连线 */
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(X(0.62) + Math.cos(k) * D.R * S * 0.7, Y(0.62) - Math.sin(k) * D.R * S * 0.7);
        ctx.lineTo(X(-0.20), Y(0.42));
        ctx.stroke();
        ctx.setLineDash([]);
      });
      /* 踏板 */
      arrow(ctx, X(0.62 + D.crankR), Y(0.24), X(0.62 + D.crankR + D.pedalL), Y(0.24), "踏板", true);
      /* 标注 */
      arrow(ctx, X(0.62) - D.R * S, Y(0.62) - D.R * S - 8, X(0.62) + D.R * S, Y(0.62) - D.R * S - 8, "轮径二尺三寸", false);

      /* ============ 右:传动比详图 ============ */
      var ox2 = w * 0.56;
      ctx.font = "700 11px sans-serif";
      ctx.fillStyle = ink;
      ctx.fillText("绳传动 RATIO", ox2, topY + 18);
      var gx = ox2, gy = topY + 32, gw = w - ox2 - 24, gh = chainY - gy - 44;
      ctx.strokeStyle = "rgba(42,38,32,0.5)";
      ctx.strokeRect(gx, gy, gw, gh);
      var ccx = gx + gw * 0.30, ccy = gy + gh * 0.52;
      ctx.beginPath(); ctx.arc(ccx, ccy, gw * 0.20, 0, Math.PI * 2); ctx.stroke();
      ctx.fillText("大绳轮 R 0.35", ccx - gw * 0.14, ccy + gw * 0.20 + 14);
      var scx = gx + gw * 0.74;
      ctx.beginPath(); ctx.arc(scx, ccy, Math.max(3, gw * 0.012), 0, Math.PI * 2); ctx.stroke();
      ctx.fillText("锭轮 r 0.021", scx - 24, ccy + gw * 0.20 + 14);
      ctx.strokeStyle = "rgba(42,38,32,0.45)";
      ctx.beginPath();
      ctx.moveTo(ccx + gw * 0.20 * Math.cos(0.6), ccy - gw * 0.20 * Math.sin(0.6));
      ctx.lineTo(scx, ccy - Math.max(3, gw * 0.012));
      ctx.stroke();
      ctx.fillStyle = red;
      ctx.font = "700 10px Menlo, monospace";
      ctx.fillText("×16.7", (ccx + scx) / 2 - 16, ccy - gw * 0.18);
      ctx.fillStyle = "rgba(42,38,32,0.6)";
      ctx.font = "600 9px sans-serif";
      ctx.fillText("脚踏 22 RPM → 锭 368 RPM", gx + 8, gy + gh - 8);

      /* ============ 底部:参数链 ============ */
      var boxes = [
        ["脚踏曲柄", "双踏板相位 90°"], ["大绳轮", "R 0.35 · 12 辐"],
        ["绳圈 ×3", "分传三锭"], ["锭轮", "r 0.021"],
        ["锭速 ×16.7", "22→368 RPM"], ["加捻成纱", "三锭同纺"]
      ];
      var bwid = (w * 0.91) / boxes.length;
      for (var b = 0; b < boxes.length; b++) {
        var bx2 = w * 0.045 + b * bwid;
        ctx.strokeStyle = ink;
        ctx.fillStyle = ink;
        ctx.strokeRect(bx2, chainY, bwid - 10, chainH);
        ctx.font = "700 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(boxes[b][0], bx2 + (bwid - 10) / 2, chainY + 17);
        ctx.font = "600 8.5px Menlo, monospace";
        ctx.fillStyle = "rgba(42,38,32,0.55)";
        ctx.fillText(boxes[b][1], bx2 + (bwid - 10) / 2, chainY + 32);
        if (b < boxes.length - 1) {
          ctx.beginPath();
          ctx.moveTo(bx2 + bwid - 10, chainY + 20);
          ctx.lineTo(bx2 + bwid - 2, chainY + 20);
          ctx.stroke();
        }
      }
    },
    table:
      '<h4>轮系</h4><table>' +
      '<tr><th>大绳轮</th><td>径二尺三寸 · 12 辐</td><td>R = 0.35 m</td></tr>' +
      '<tr><th>锭轮(×3)</th><td>r = 0.021 m</td><td>同轴三锭</td></tr>' +
      '<tr><th>传动比</th><td>R/r = 0.35/0.021</td><td>×16.7</td></tr>' +
      '<tr><th>踏板曲柄</th><td>r 0.09 · 双踏板相位差 90°</td><td>—</td></tr>' +
      '</table><h4>转速</h4><table>' +
      '<tr><th>轻踏 ω=1.6</th><td>轮 15 RPM → 锭 256 RPM</td><td>—</td></tr>' +
      '<tr><th>快踏 ω=2.9</th><td>轮 28 RPM → 锭 464 RPM</td><td>—</td></tr>' +
      '</table><h4>运行期自检</h4>' +
      '<p>传动比 = R/r = 16.7 载入断言;三锭同轴同绳,SPINDLES 面板三转速条应恒等。</p>' +
      '<h4>文献</h4>' +
      '<p>王祯《农书》:「木棉纺车,其制比麻苎纺车颇小……轮与弦带三锭,左右持纺」;《天工开物·乃服》纺车图。</p>'
  };
})(window.MECH = window.MECH || {});
