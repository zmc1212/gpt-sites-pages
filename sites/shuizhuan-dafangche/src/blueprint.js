/* 图纸面板(B 键):水转大纺车复原侧视总图 + 增速链 + 尺寸表。
   分区:顶部公式横幅 / 左侧视(大)/ 右列(增速链 + 锭排)/ 底部部件链。 */
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
    no: "Fig. 06 · 复原总图",
    title: "水转大纺车 · 水轮增速十四锭(王祯《农书》)",
    src: "王祯《农书》「水轮……大绳轮……诸锭自随」 · 尺寸按本站复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainY = h - 70, topY = 30;

      /* —— 公式横幅 —— */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("增速比 i = R大/r锭 = 0.448/0.032 = 14   ·   ω锭 = 14 × 0.5 = 7.0 rad/s   ·   8 锭同向", w * 0.03, topY - 8);

      /* —— 左:侧视图 —— */
      var ox = w * 0.03, oRight = w * 0.55, regionH = chainY - topY - 26;
      var S = Math.min((oRight - ox - 16) / 5.6, (regionH - 12) / 3.1);
      var oy = topY + regionH - 0.75 * S;
      function X(m) { return ox + 0.9 * S + (m + 1.15) * S; }
      function Y(m) { return oy - m * S; }
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(西 · 溪渠 → 右东)", ox, topY + 10);
      /* 渠 + 水 */
      ctx.strokeStyle = faint2;
      ctx.strokeRect(X(-1.05), Y(0), 0.35 * S, D.bankTop * S);
      ctx.strokeRect(X(0.70), Y(0), 0.35 * S, D.bankTop * S);
      ctx.fillStyle = "rgba(62,110,134,0.28)";
      ctx.fillRect(X(-0.85), Y(D.waterY), 1.5 * S, (D.waterY - 0.06) * S);
      /* 排架 */
      ctx.strokeRect(X(-0.14), Y(0), 0.28 * S, (D.wheelY + 0.02) * S);
      /* 水轮 + 大绳轮(同轴双圆) */
      ctx.beginPath(); ctx.arc(X(0), Y(D.wheelY), D.RWheel * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(0), Y(D.wheelY), D.RWheel * 0.16 * S, 0, Math.PI * 2); ctx.stroke();
      for (var i = 0; i < D.NP; i++) {
        var a = i / D.NP * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(X(0) + Math.cos(a) * D.RWheel * 0.16 * S, Y(D.wheelY) + Math.sin(a) * D.RWheel * 0.16 * S);
        ctx.lineTo(X(0) + Math.cos(a) * D.RWheel * S, Y(D.wheelY) + Math.sin(a) * D.RWheel * S);
        ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(X(0), Y(D.wheelY), D.RBig * S, 0, Math.PI * 2); ctx.stroke();
      /* 传动弦 + 锭排 */
      ctx.strokeStyle = faint;
      ctx.beginPath(); ctx.moveTo(X(0), Y(D.wheelY - D.RBig)); ctx.lineTo(X(D.spX[0]), Y(D.spY - D.rSpindle));
      ctx.lineTo(X(D.spX[D.NS - 1]), Y(D.spY - D.rSpindle)); ctx.stroke();
      ctx.strokeStyle = ink;
      var bl = Math.min((D.spX[D.NS - 1] - D.spX[0]) * 0.06, 0.24);
      ctx.strokeRect(X(D.frameX0), Y(0.18), (D.frameX1 - D.frameX0) * S, 0.18 * S);
      D.spX.forEach(function (x) {
        ctx.beginPath(); ctx.arc(X(x), Y(D.spY), D.rSpindle * S + 2.5, 0, Math.PI * 2); ctx.stroke();
        ctx.fillRect(X(x) - 1.5, Y(D.spY) - bl * S, 3, bl * S);
      });
      /* 纱架 */
      ctx.strokeRect(X(D.frameX0) - 4, Y(D.railY), 4, (D.railY - 0.02) * S);
      ctx.strokeRect(X(D.frameX1), Y(D.railY), 4, (D.railY - 0.02) * S);
      ctx.beginPath(); ctx.moveTo(X(D.frameX0), Y(D.railY)); ctx.lineTo(X(D.frameX1), Y(D.railY)); ctx.stroke();
      /* 尺寸 */
      arrowV(ctx, X(-1.55), Y(D.waterY - 0.06), Y(D.wheelY - D.RWheel), "浸深 0.08", 1);
      arrowH(ctx, X(D.spX[0]), X(D.spX[D.NS - 1]), Y(0) + 12, "锭距 0.32 ×8", true);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("弦绕大绳轮与诸锭盘下缘 · 同向增速 ×14", ox, chainY - 14);

      /* —— 右上:增速链 —— */
      var rx = w * 0.585, rw = w - rx - 14;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("增速链 ω → ω锭", rx, topY + 12);
      var bars = [
        ["水轮 ω 0.50", 0.5 / 7.0, woodC],
        ["弦 直联", 0.5 / 7.0, faint2],
        ["锭盘 r 0.032", 1.0, red]
      ];
      var gx0 = rx + 6, gw = rw - 12, gy0 = topY + 24, gh = 22;
      bars.forEach(function (b, i) {
        var y = gy0 + i * 26;
        ctx.fillStyle = b[2];
        ctx.fillRect(gx0, y, b[1] * gw, 12);
        ctx.strokeStyle = ink; ctx.lineWidth = 0.8;
        ctx.strokeRect(gx0, y, b[1] * gw, 12);
        ctx.fillStyle = ink;
        ctx.font = "600 8.5px Menlo, monospace"; ctx.textAlign = "right";
        ctx.fillText(b[0], gx0 + b[1] * gw - 4, y + 9);
      });
      ctx.fillStyle = red; ctx.textAlign = "left";
      ctx.font = "700 9px Menlo, monospace";
      ctx.fillText("ω锭 = i × ω轮 = 14 × 0.50 = 7.0 rad/s", gx0, gy0 + 82);

      /* —— 右下:锭排 8 盘 —— */
      var by = gy0 + gh + 52;
      ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.font = "700 11px sans-serif";
      ctx.fillText("锭排 8 盘(等距 0.32m)", rx, by - 8);
      for (var j = 0; j < D.NS; j++) {
        var x = gx0 + j * (gw / 7.4);
        ctx.strokeStyle = j === 0 ? red : ink;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x + 8, by + 10, 7, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = ink;
        ctx.font = "600 7px Menlo, monospace"; ctx.textAlign = "center";
        ctx.fillText(String(j + 1), x + 8, by + 26);
      }

      /* —— 底部:部件链 —— */
      var boxes = [
        ["水轮", "径 2.6m · 12 桨"], ["大绳轮", "径 0.896m · 同轴"], ["传动弦", "绕锭盘下缘 · 同向"],
        ["锭盘 ×8", "r 0.032 · ×14 增速"], ["锭轴", "麻缕锥端"], ["纱架", "横杆引缕"]
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
      '<h4>轮系</h4><table>' +
      '<tr><th>水轮</th><td>径 2.60 m · 12 桨 · 浸深 0.08 m</td><td>轴高 1.40 m</td></tr>' +
      '<tr><th>大绳轮</th><td>径 0.896 m · 同轴(增速源)</td><td>R大 = 0.448</td></tr>' +
      '<tr><th>锭盘</th><td>r = 0.032 m × 8 · 等距 0.32 m</td><td>i = 14(严格)</td></tr>' +
      '<tr><th>锭轴</th><td>长 0.62 m · 麻缕锥端</td><td>8 锭同向</td></tr>' +
      '</table><h4>传动与水</h4><table>' +
      '<tr><th>增速比</th><td>i = R大/r锭 = 0.448/0.032</td><td>14.0</td></tr>' +
      '<tr><th>锭速</th><td>ω锭 = 14 × 0.50</td><td>7.0 rad/s(1.11 转/s)</td></tr>' +
      '<tr><th>渠</th><td>水面 0.18 · 渠底 0.06(不透明)</td><td>浸深 0.08 m</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>增速比 i = 14.0(载入期断言严格成立);ω锭 = i·ω轮 = 7.0 rad/s。</p>' +
      '<p>浸水:轮缘底 0.10 m 低于水面 0.18 m,高于渠底+0.02 —— 断言不触底。</p>' +
      '<p>弦回程上缘高于锭盘顶 0.05 m —— 断言不擦锭;运行期 errPos = 锭 0 盘缘点端到端误差(应≈0)。</p>' +
      '<h4>文献</h4>' +
      '<p>王祯《农书》水转大纺车:「水轮……大绳轮……弦……诸锭自随」—— 中国古代最早的水力多锭纺纱机械,比西方同类早四百余年的记载。</p>'
  };
})(window.MECH = window.MECH || {});
