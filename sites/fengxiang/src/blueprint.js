/* 图纸面板(B 键):风箱剖视图 + 双动原理详图 + 公式 + 尺寸表 */
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
    no: "Fig. 11 · 复原剖视图",
    title: "活塞风箱 · 双动往复恒出风",
    src: "《天工开物》(宋应星) 冶铸篇所绘风箱 · 双动活塞原理",
    draw: function (ctx, w, h) {
      var D = MECH.DIM;
      ctx.clearRect(0, 0, w, h);
      var chainH = 44, chainY = h - chainH - 12, topY = 34;
      var ink = "#2A2620";
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("双动:活塞右行 → 右腔压(出R开/进R闭)· 左腔扩(进L开/出L闭)——任一行程恒出风", w * 0.045, topY - 10);

      /* ============ 左:剖视图 ============ */
      var S = Math.min(w * 0.44 / 2.8, (chainY - topY - 26) / 1.4);
      var ox = w * 0.05, oy = chainY - 20;
      var X = function (m) { return ox + (m + 1.3) * S; }, Y = function (m) { return oy - m * S; };
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = 1.4;
      ctx.font = "700 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("剖视 SECTION", ox, Y(0.72));
      /* 箱体 */
      ctx.strokeRect(X(-D.boxL / 2), Y(D.boxH / 2), D.boxL * S, D.boxH * S);
      /* 活塞(右行位)+ 拉杆 + 手柄 */
      var px = X(D.stroke * 0.5);
      ctx.strokeRect(px - D.pistonT * S, Y(D.boxH / 2 - 0.02), D.pistonT * 2 * S, (D.boxH - 0.04) * S);
      ctx.beginPath(); ctx.moveTo(px + D.pistonT * S, Y(D.boxH / 2 - 0.055)); ctx.lineTo(X(D.stroke * 0.5 + D.rodL), Y(D.boxH / 2 - 0.055)); ctx.stroke();
      /* 四活门(方块) */
      ctx.strokeRect(X(-D.boxL / 2 + 0.28) - 5, Y(D.boxH / 2) - 9, 10, 7);
      ctx.strokeRect(X(D.boxL / 2 - 0.28) - 5, Y(D.boxH / 2) - 9, 10, 7);
      ctx.strokeRect(X(D.boxL / 2 - 0.14) - 4, Y(D.boxH / 2 - 0.10), 8, 8);
      ctx.strokeRect(X(D.boxL / 2 - 0.14) - 4, Y(-D.boxH / 2 + 0.10), 8, 8);
      ctx.font = "600 8px sans-serif";
      ctx.fillStyle = "rgba(42,38,32,0.6)";
      ctx.fillText("进风活门×2(顶)", X(-D.boxL / 2 + 0.18), Y(D.boxH / 2) - 13);
      ctx.fillText("出气活门×2(风道)", X(D.boxL / 2 - 0.20), Y(D.boxH / 2 + 0.14));
      /* 鼓风管 + 炉 */
      ctx.beginPath(); ctx.moveTo(X(D.boxL / 2), Y(D.boxH / 2 - 0.06)); ctx.lineTo(X(D.boxL / 2 + 0.9), Y(D.boxH / 2 - 0.06)); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(D.boxL / 2 + 1.75), Y(0.28), 0.3 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.fillText("炉", X(D.boxL / 2 + 1.75) - 5, Y(0.72));
      /* 行程标注 */
      arrow(ctx, X(-D.stroke * 0.88), Y(-D.boxH / 2) + 14, X(D.stroke * 0.88), Y(-D.boxH / 2) + 14, "行程 0.276 m(×2)", true);

      /* ============ 右:双动原理详图 ============ */
      var ox2 = w * 0.55;
      ctx.font = "700 11px sans-serif";
      ctx.fillStyle = ink;
      ctx.fillText("双动原理(任一行程出风)", ox2, topY + 18);
      var gx = ox2, gy = topY + 30, gw = w - ox2 - 24, gh = (chainY - gy) / 2 - 12;
      /* 上:活塞右行 */
      ctx.strokeStyle = "rgba(42,38,32,0.5)";
      ctx.strokeRect(gx, gy, gw * 0.62, gh);
      var ppx = gx + gw * 0.42;
      ctx.beginPath(); ctx.moveTo(ppx, gy); ctx.lineTo(ppx, gy + gh); ctx.stroke();
      ctx.font = "600 8.5px sans-serif";
      ctx.fillText("→ 右腔压:出R 开", gx + gw * 0.44, gy + 12);
      ctx.fillText("   左腔扩:进L 开", gx + gw * 0.44, gy + 24);
      ctx.fillText("活塞右行", gx + 4, gy + gh / 2);
      /* 下:活塞左行 */
      var gy2 = gy + gh + 10;
      ctx.strokeRect(gx, gy2, gw * 0.62, gh);
      var ppx2 = gx + gw * 0.18;
      ctx.beginPath(); ctx.moveTo(ppx2, gy2); ctx.lineTo(ppx2, gy2 + gh); ctx.stroke();
      ctx.fillText("← 左腔压:出L 开", gx + gw * 0.44, gy2 + 12);
      ctx.fillText("   右腔扩:进R 开", gx + gw * 0.44, gy2 + 24);
      ctx.fillText("活塞左行", gx + 4, gy2 + gh / 2);

      /* ============ 底部:参数链 ============ */
      var boxes = [
        ["推拉活塞", "ω 1.5~2.6"], ["压腔出风", "出气活门开"], ["扩腔进气", "进气活门开"],
        ["风道换向", "两枚薄板阀"], ["鼓风管", "恒向供风"], ["炉火旺", "风助燃"]
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
      '<h4>箱体</h4><table>' +
      '<tr><th>箱体</th><td>长 1.24 · 高 0.36 · 宽 0.36(演示)</td><td>木</td></tr>' +
      '<tr><th>活塞</th><td>板厚 0.05 · 全行程 0.552</td><td>羽毛密封</td></tr>' +
      '<tr><th>拉杆</th><td>长 0.95 + 手柄</td><td>—</td></tr>' +
      '<tr><th>活门</th><td>进风×2(顶)+ 出气×2(风道)</td><td>薄板</td></tr>' +
      '</table><h4>双动原理</h4><table>' +
      '<tr><th>活塞右行</th><td>右腔压→出R 开;左腔扩→进L 开</td><td>出风</td></tr>' +
      '<tr><th>活塞左行</th><td>左腔压→出L 开;右腔扩→进R 开</td><td>出风</td></tr>' +
      '<tr><th>出风连续性</th><td>任一行程恒出风(载入 400 步断言)</td><td>100%</td></tr>' +
      '<tr><th>节奏</th><td>ω=1.5 → 0.48 往返/s · ω=2.6 → 0.83 往返/s</td><td>—</td></tr>' +
      '</table><h4>运行期自检</h4>' +
      '<p>载入即模拟一整周期:出气活门开启时间覆盖率必须 100%(双动),活门方向与活塞速度方向逐帧一致,否则拒绝启动。</p>' +
      '<h4>文献</h4>' +
      '<p>《天工开物》冶铸篇绘有活塞风箱(木𥲅):「其风箱用铁为𨨏?……两鞲鞴交替鼓风」——双动活塞为宋应星时代成熟技术。</p>'
  };
})(window.MECH = window.MECH || {});
