/* 图纸面板(B 键):织布机复原侧视总图 + 开口-投梭时序 + 尺寸表。 */
(function (MECH) {
  var ink = "#2A2620", faint = "rgba(42,38,32,0.38)", faint2 = "rgba(42,38,32,0.22)";
  var waterC = "#3E6E86", woodC = "#6E4E28", red = "#8C2F1E";
  var KS = MECH.KS;

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
    no: "Fig. 11 · 复原总图",
    title: "织布机 · 双蹑双综斜织机(汉画像石)",
    src: "汉画像石织机图 · 《天工开物·乃服》机节 · 尺寸按本站复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainY = h - 70, topY = 30;

      /* —— 公式横幅 —— */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("梭口 = 2×0.045 = 0.09m   ·   梭行 0.75m   ·   筘打纬 0.12m   ·   双蹑 1:1 交替(吊综轴反向缠绕)", w * 0.03, topY - 8);

      /* —— 左:侧视图 —— */
      var ox = w * 0.03, oRight = w * 0.55, regionH = chainY - topY - 26;
      var S = Math.min((oRight - ox - 16) / 1.7, (regionH - 12) / 1.5);
      var oy = topY + regionH - 0.55 * S;
      function X(m) { return ox + 0.4 * S + (m + 0.75) * S; }
      function Y(m) { return oy - m * S; }
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(布轴 ← | → 经轴)", ox, topY + 10);
      ctx.beginPath(); ctx.moveTo(X(0.85), Y(0)); ctx.lineTo(X(-0.85), Y(0)); ctx.stroke();
      /* 机架柱 */
      ctx.strokeRect(X(0.535), Y(0), 0.13 * S, 0.70 * S);
      ctx.strokeRect(X(-0.615), Y(0), 0.13 * S, 0.70 * S);
      /* 经轴 + 布轴 */
      ctx.beginPath(); ctx.arc(X(D.warpX), Y(D.warpY), 0.055 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(D.clothX), Y(D.warpY), 0.075 * S, 0, Math.PI * 2); ctx.stroke();
      /* 经线(开口双态) */
      ctx.strokeStyle = faint2;
      ctx.beginPath(); ctx.moveTo(X(D.warpX), Y(D.warpY + D.lift)); ctx.lineTo(X(D.clothX), Y(D.warpY)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(D.warpX), Y(D.warpY - D.lift)); ctx.lineTo(X(D.clothX), Y(D.warpY)); ctx.stroke();
      ctx.strokeStyle = ink;
      /* 综框(双片交替位) */
      ctx.strokeRect(X(D.heddleX - 0.03), Y(D.warpY + D.lift - D.heddleH / 2), 0.06 * S, D.heddleH * S);
      ctx.strokeRect(X(D.heddleX + 0.03), Y(D.warpY - D.lift - D.heddleH / 2), 0.06 * S, D.heddleH * S);
      /* 吊综轴 + 绳 */
      ctx.beginPath(); ctx.arc(X(D.shaftX), Y(D.shaftY), D.shaftR * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(D.shaftX), Y(D.shaftY)); ctx.lineTo(X(D.heddleX - 0.03), Y(D.warpY + D.lift + D.heddleH / 2)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(D.shaftX), Y(D.shaftY)); ctx.lineTo(X(D.heddleX + 0.03), Y(D.warpY - D.lift + D.heddleH / 2)); ctx.stroke();
      /* 筘 + 梭 */
      ctx.strokeRect(X(D.reedX - 0.02), Y(D.warpY - 0.08), 0.045 * S, 0.16 * S);
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = faint;
      ctx.strokeRect(X(D.reedX - 0.02 - D.reedStroke), Y(D.warpY - 0.08), 0.045 * S, 0.16 * S);
      ctx.setLineDash([]);
      ctx.strokeStyle = ink;
      ctx.beginPath(); ctx.ellipse(X(D.shuttleX0), Y(D.warpY + 0.02), 0.09 * S, 0.03 * S, 0, 0, Math.PI * 2); ctx.stroke();
      /* 双蹑 */
      ctx.beginPath(); ctx.moveTo(X(-0.15), Y(D.pedalY)); ctx.lineTo(X(0.10), Y(D.pedalY - 0.06)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(0.15), Y(D.pedalY)); ctx.lineTo(X(-0.10), Y(D.pedalY - 0.06)); ctx.stroke();
      /* 尺寸 */
      arrowV(ctx, X(0.72), Y(D.warpY - D.lift), Y(D.warpY + D.lift), "梭口 0.09", 1);
      arrowH(ctx, X(D.shuttleX1), X(D.shuttleX0), Y(D.warpY) - 10, "梭行 0.75 m", true);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("双态梭口:奇经升 0.045 / 偶经降 0.045(交替)", ox, chainY - 14);

      /* —— 右:一梭时序 —— */
      var rx = w * 0.585, rw = w - rx - 14;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("一梭时序(3.0s)", rx, topY + 12);
      var segs = [["开口", 25, faint2], ["投梭", 30, "rgba(62,110,134,0.4)"], ["打纬", 20, woodC], ["交织", 25, faint2]];
      var gx0 = rx + 6, gw = rw - 12, gy0 = topY + 26, gh = 26;
      var acc = 0;
      segs.forEach(function (sg) {
        var x = gx0 + acc / 100 * gw;
        ctx.fillStyle = sg[2];
        ctx.fillRect(x, gy0, sg[1] / 100 * gw - 2, gh);
        ctx.strokeStyle = ink; ctx.lineWidth = 0.8;
        ctx.strokeRect(x, gy0, sg[1] / 100 * gw - 2, gh);
        ctx.fillStyle = ink;
        ctx.font = "600 8px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(sg[0], x + sg[1] / 100 * gw / 2, gy0 + gh + 11);
        acc += sg[1];
      });
      ctx.fillStyle = ink;
      ctx.font = "600 8.5px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("踏板交替 → 综升降 → 梭飞 → 筘击 → 纬线成行", gx0, gy0 + gh + 26);

      /* —— 右下:部件名 —— */
      var by = gy0 + gh + 48;
      ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.font = "700 11px sans-serif";
      ctx.fillText("运动链", rx, by - 6);
      var names = [["双蹑", "交替踏"], ["吊综轴", "1:1 反向"], ["双综框", "升 0.045"], ["梭口", "0.09m"],
                   ["梭", "0.75m 穿行"], ["筘", "打纬 0.12"], ["布轴", "纬线成布"]];
      ctx.font = "600 8.5px sans-serif";
      names.forEach(function (n, i) {
        var col = i % 2, row = (i / 2) | 0;
        ctx.fillText(n[0] + " · " + n[1], rx + col * 112, by + 6 + row * 13);
      });

      /* —— 底部:部件链 —— */
      var boxes = [
        ["双蹑踏板", "交替 ±0.20"], ["吊综轴", "双绳反向"], ["双综框", "升 0.045 交替"],
        ["梭口", "0.09m"], ["梭+筘", "穿行+打纬"], ["布轴", "纬线逐梭成布"]
      ];
      var bwid = (w * 0.94) / boxes.length;
      for (var b = 0; b < boxes.length; b++) {
        var bx2 = w * 0.03 + b * bwid;
        ctx.strokeStyle = ink; ctx.lineWidth = 1.2;
        ctx.strokeRect(bx2, chainY, bwid - 10, 50);
        ctx.fillStyle = ink;
        ctx.font = "700 9.5px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(boxes[b][0], bx2 + (bwid - 10) / 2, chainY + 19);
        ctx.font = "600 8px Menlo, monospace";
        ctx.fillStyle = faint;
        ctx.fillText(boxes[b][1], bx2 + (bwid - 10) / 2, chainY + 34);
        if (b < boxes.length - 1) {
          ctx.beginPath();
          ctx.moveTo(bx2 + bwid - 10, chainY + 24);
          ctx.lineTo(bx2 + bwid - 2, chainY + 24);
          ctx.stroke();
        }
      }
    },
    table:
      '<h4>机与经纬</h4><table>' +
      '<tr><th>经轴 → 布轴</th><td>跨距 1.15 m · 经线 16 根(z 向 0.64)</td><td>机面高 0.72</td></tr>' +
      '<tr><th>综框 ×2</th><td>高 0.50 · 分别吊奇/偶数经</td><td>升降 ±0.045</td></tr>' +
      '<tr><th>梭口</th><td>2 × 0.045 = 0.09 m(梭高 0.05 可过)</td><td>载入期断言</td></tr>' +
      '</table><h4>传动与织造</h4><table>' +
      '<tr><th>双蹑</th><td>交替踏板 · 吊综轴双绳反向</td><td>1:1 交替</td></tr>' +
      '<tr><th>梭</th><td>穿行 0.75 m(布幅)</td><td>每梭一纬</td></tr>' +
      '<tr><th>筘</th><td>打纬行程 0.12 m</td><td>纬线成行</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>梭口 0.09(严格断言);梭高 0.05 &lt; 梭口(可过,断言);梭行 0.75、筘程 0.12(严格断言)。</p>' +
      '<p>一梭时序:开口 25% → 投梭 30% → 打纬 20% → 交织 25%;纬线逐梭显现(weftMax 循环)。</p>' +
      '<h4>文献</h4>' +
      '<p>汉画像石已有双蹑双综斜织机图;《天工开物·乃服》:「凡机……蹑投诸综……»——脚踏开口、投梭打纬的完整织造运动链。</p>'
  };
})(window.MECH = window.MECH || {});
