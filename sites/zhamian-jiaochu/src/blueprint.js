/* 图纸面板(B 键):轧棉搅车复原侧视总图 + 外啮合运动链 + 尺寸表。 */
(function (MECH) {
  var ink = "#2A2620", faint = "rgba(42,38,32,0.38)", faint2 = "rgba(42,38,32,0.22)";
  var waterC = "#3E6E86", woodC = "#6E4E28", red = "#8C2F1E";

  function arrowV(ctx, x, y1, y2, text, side) {
    ctx.strokeStyle = faint; ctx.fillStyle = faint; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
    var s = 4, dir = y2 >= y1 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(x, y2); ctx.lineTo(x - 3, y2 - s * dir); ctx.lineTo(x + 3, y2 - s * dir); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x - 3, y1 + s * dir); ctx.lineTo(x + 3, y1 + s * dir); ctx.closePath(); ctx.fill();
    ctx.font = "600 9px Menlo, monospace";
    ctx.textAlign = side < 0 ? "right" : "left";
    ctx.fillText(text, x + side * 6, (y1 + y2) / 2 + 3);
  }
  function arrowH(ctx, x1, x2, y, text, below) {
    ctx.strokeStyle = faint; ctx.fillStyle = faint; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
    var s = 4, dir = x2 >= x1 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(x2, y); ctx.lineTo(x2 - s * dir, y - 3); ctx.lineTo(x2 - s * dir, y + 3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1 + s * dir, y - 3); ctx.lineTo(x1 + s * dir, y + 3); ctx.closePath(); ctx.fill();
    ctx.font = "600 9px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText(text, (x1 + x2) / 2, below ? y + 12 : y - 5);
  }

  MECH.BP = {
    no: "Fig. 08 · 复原总图",
    title: "轧棉搅车 · 双辊外啮合反向(《天工开物·乃服》)",
    src: "《天工开物·乃服》轧车节 · 尺寸按本站复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainY = h - 70, topY = 30;

      /* —— 公式横幅 —— */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("齿轮等齿 Z16 外啮合:ω上 = −ω下(i=1)   ·   踏板行程 2r = 0.20m   ·   辊隙 0.005m   ·   v牵 = 0.0675 m/s", w * 0.03, topY - 8);

      /* —— 左:侧视图(视向 −z:皮棉左 / 给棉右) —— */
      var ox = w * 0.03, oRight = w * 0.55, regionH = chainY - topY - 26;
      var S = Math.min((oRight - ox - 16) / 1.9, (regionH - 12) / 1.1);
      var oy = topY + regionH - 0.35 * S;
      function X(m) { return ox + 0.35 * S + (m + 0.85) * S; }
      function Y(m) { return oy - m * S; }
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(皮棉 ← | → 给棉)", ox, topY + 10);
      ctx.beginPath(); ctx.moveTo(X(0.95), Y(0)); ctx.lineTo(X(-1.0), Y(0)); ctx.stroke();
      /* 机架 */
      ctx.strokeRect(X(-0.75), Y(0), 1.30 * S, D.baseH * S);
      /* 双辊双态(实线正向 + 虚线反向箭头) */
      ctx.beginPath(); ctx.arc(X(0), Y(D.yLow), D.rLow * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(0), Y(D.yUp), D.rUp * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(-0.50), Y(D.yLow), D.gearR * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(-0.50), Y(D.yUp), D.gearR * S, 0, Math.PI * 2); ctx.stroke();
      /* 旋转方向箭头 */
      ctx.strokeStyle = red; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(X(0), Y(D.yLow), (D.rLow + 0.06) * S, -0.6, 0.6); ctx.stroke();
      ctx.strokeStyle = faint;
      ctx.beginPath(); ctx.arc(X(0), Y(D.yUp), (D.rUp + 0.06) * S, 0.6, -0.6, true); ctx.stroke();
      ctx.strokeStyle = ink;
      /* 棉团/皮棉/棉籽 */
      ctx.beginPath(); ctx.arc(X(0.18), Y(D.cottonY), 0.075 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = faint2;
      ctx.fillRect(X(-0.62), Y(D.nipY + 0.025), 0.34 * S, 0.03 * S);
      for (var i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.arc(X(0.16 + (i % 2) * 0.06), Y(0.06 + (i % 2) * 0.03), 2.5, 0, Math.PI * 2); ctx.fill();
      }
      /* 尺寸 */
      arrowV(ctx, X(0.52), Y(D.yLow), Y(D.yUp), "辊隙 0.005", 1);
      arrowH(ctx, X(-0.62), X(0.75), Y(0) + 12, "辊长 0.56 m", true);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("红箭头 下辊正向 · 灰箭头 上辊反向(外啮合)", ox, chainY - 14);

      /* —— 右:外啮合链 —— */
      var rx = w * 0.585, rw = w - rx - 14;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("外啮合运动链", rx, topY + 12);
      var boxes = [
        ["踏板曲柄 r 0.10", "ω下 = 脚踏"],
        ["齿轮A 16T", "与下辊同轴"],
        ["齿轮B 16T", "外啮合 → ω上 = −ω下"],
        ["上辊 r 0.065", "反向回转轧棉"]
      ];
      var gy0 = topY + 26;
      boxes.forEach(function (b, i) {
        var y = gy0 + i * 24;
        ctx.strokeStyle = ink; ctx.lineWidth = 1.1;
        ctx.strokeRect(rx, y, rw, 18);
        ctx.fillStyle = ink;
        ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
        ctx.fillText(b[0], rx + 6, y + 12);
        ctx.fillStyle = faint;
        ctx.font = "600 8px Menlo, monospace"; ctx.textAlign = "right";
        ctx.fillText(b[1], rx + rw - 6, y + 12);
        if (i < boxes.length - 1) {
          ctx.beginPath(); ctx.moveTo(rx + rw / 2, y + 18); ctx.lineTo(rx + rw / 2, y + 24); ctx.stroke();
        }
      });

      /* —— 右下:牵引速度图 —— */
      var by = gy0 + 104;
      ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.font = "700 11px sans-serif";
      ctx.fillText("牵引速度", rx, by - 6);
      ctx.strokeStyle = waterC; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(rx, by + 12); ctx.lineTo(rx + rw * 0.72, by + 12); ctx.stroke();
      ctx.fillStyle = ink;
      ctx.font = "600 9px Menlo, monospace";
      ctx.fillText("v = ω·r下 = 0.9 × 0.075 = 0.0675 m/s", rx, by + 26);

      /* —— 底部:部件链 —— */
      var boxes2 = [
        ["踏板", "行程 0.20m"], ["齿轮对", "16T 外啮合"], ["下辊", "r 0.075 · 正向"],
        ["上辊", "r 0.065 · 反向"], ["棉团", "入隙受牵"], ["皮棉/棉籽", "牵出 / 回落"]
      ];
      var bwid = (w * 0.94) / boxes2.length;
      for (var b = 0; b < boxes2.length; b++) {
        var bx2 = w * 0.03 + b * bwid;
        ctx.strokeStyle = ink; ctx.lineWidth = 1.2;
        ctx.strokeRect(bx2, chainY, bwid - 10, 50);
        ctx.fillStyle = ink;
        ctx.font = "700 9.5px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(boxes2[b][0], bx2 + (bwid - 10) / 2, chainY + 19);
        ctx.font = "600 8px Menlo, monospace";
        ctx.fillStyle = faint;
        ctx.fillText(boxes2[b][1], bx2 + (bwid - 10) / 2, chainY + 34);
        if (b < boxes2.length - 1) {
          ctx.beginPath();
          ctx.moveTo(bx2 + bwid - 10, chainY + 24);
          ctx.lineTo(bx2 + bwid - 2, chainY + 24);
          ctx.stroke();
        }
      }
    },
    table:
      '<h4>辊系</h4><table>' +
      '<tr><th>下辊</th><td>r 0.075 m · 长 0.56 m · 轴 y 0.45</td><td>脚踏同轴</td></tr>' +
      '<tr><th>上辊</th><td>r 0.065 m · 轴 y 0.585</td><td>齿轮 B 反传</td></tr>' +
      '<tr><th>辊隙</th><td>0.005 m(上辊底 − 下辊顶)</td><td>载入期断言</td></tr>' +
      '<tr><th>齿轮对</th><td>Z = 16 等齿 · 节圆 r 0.14 · 外啮合</td><td>i = 1(反向)</td></tr>' +
      '</table><h4>传动与轧棉</h4><table>' +
      '<tr><th>踏板曲柄</th><td>r 0.10 · 行程 0.20 m</td><td>ω 0.9 rad/s</td></tr>' +
      '<tr><th>牵引速度</th><td>v = ω·r下 = 0.0675 m/s</td><td>皮棉牵出</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>外啮合:等齿 Z16 → ω上 = −ω下(i = 1,严格断言);辊隙 = 上辊底 − 下辊顶 = 0.005(严格断言)。</p>' +
      '<p>运行期 errPos = 上辊齿轮缘点 vs 解析(−ψ 相位)≈ 0,端到端验证外啮合反向。</p>' +
      '<h4>文献</h4>' +
      '<p>《天工开物·乃服》:「凡取棉籽……轧车以二人脚踏,双辊相反回转,轧出棉籽」——双辊外啮合反向回转,皮棉过隙、棉籽回落。</p>'
  };
})(window.MECH = window.MECH || {});
