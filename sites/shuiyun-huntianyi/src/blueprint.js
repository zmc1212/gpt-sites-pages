/* 图纸面板(B 键):水运浑天仪复原侧视总图 + 减速链 + 尺寸表。 */
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

  MECH.BP = {
    no: "Fig. 13 · 复原总图",
    title: "水运浑天仪 · 漏水转浑象(张衡)",
    src: "《晋书·天文志》载张衡漏水转浑天仪 · 尺寸按本站复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainY = h - 70, topY = 30;

      /* —— 公式横幅 —— */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("减速 i = 3.5(28T/8T) × 4(32T/8T) × 2(16T/8T) = 28   ·   浑象 72s/转 ×1200 = 86400s = 一日(严格)", w * 0.03, topY - 8);

      /* —— 左:侧视图 —— */
      var ox = w * 0.03, oRight = w * 0.55, regionH = chainY - topY - 26;
      var S = Math.min((oRight - ox - 16) / 5.0, (regionH - 12) / 2.6);
      var oy = topY + regionH - 0.55 * S;
      function X(m) { return ox + 0.6 * S + (m + 2.6) * S; }
      function Y(m) { return oy - m * S; }
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(西 · 漏壶 → 右东浑象)", ox, topY + 10);
      ctx.beginPath(); ctx.moveTo(X(2.9), Y(0)); ctx.lineTo(X(-2.7), Y(0)); ctx.stroke();
      /* 漏壶 */
      ctx.strokeRect(X(-2.54), Y(0), 0.48 * S, D.potH * S);
      /* 水槽 */
      ctx.strokeStyle = faint2;
      ctx.strokeRect(X(-2.2), Y(0.10), 1.7 * S, 0.14 * S);
      ctx.fillStyle = "rgba(62,110,134,0.28)";
      ctx.fillRect(X(-2.05), Y(0.15), 1.44 * S, 0.06 * S);
      ctx.strokeStyle = ink;
      /* 水轮 */
      ctx.beginPath(); ctx.arc(X(D.wheelX), Y(D.wheelY), D.RWheel * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(D.wheelX), Y(D.wheelY), 0.07 * S, 0, Math.PI * 2); ctx.stroke();
      /* 齿轮链(圆示意,大小按 r) */
      var gs = [[-0.55, 0.30], [-0.28, 0.098], [-0.06, 0.32], [0.22, 0.08], [0.44, 0.16], [0.70, 0.08]];
      gs.forEach(function (g, i) {
        var gx = X(D.wheelX + 1.9 + g[0] * 2.2);
        var gy = Y(0.62 + (i > 1 ? 0.1 : 0));
        ctx.beginPath(); ctx.arc(gx, gy, g[1] * S, 0, Math.PI * 2); ctx.stroke();
      });
      /* 浑象球(倾斜) */
      var cx = X(D.globeX), cy2 = Y(D.globeY);
      ctx.beginPath(); ctx.arc(cx, cy2, D.RGlobe * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy2, D.RGlobe * S, D.RGlobe * S * 0.32, -(90 - D.tilt) * Math.PI / 180, 0, Math.PI * 2); ctx.stroke();
      /* 蓂荚 */
      var lx = X(D.leafX), ly = Y(D.leafY);
      ctx.beginPath(); ctx.arc(lx, ly, D.RLeaf * 0.5 * S, 0, Math.PI * 2); ctx.stroke();
      for (var i = 0; i < 6; i++) {
        var a = i / 6 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(lx + Math.cos(a) * D.RLeaf * 0.5 * S, ly + Math.sin(a) * D.RLeaf * 0.5 * S);
        ctx.lineTo(lx + Math.cos(a) * D.RLeaf * S, ly + Math.sin(a) * D.RLeaf * S);
        ctx.stroke();
      }
      /* 尺寸 */
      arrowV(ctx, X(-3.0), Y(0), Y(D.potH), "壶高 0.78", -1);
      arrowV(ctx, X(1.95), Y(D.globeY - D.RGlobe), Y(D.globeY + D.RGlobe), "球径 1.04", 1);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("漏壶 → 水轮 → 三级齿轮 → 浑象 → 蓂荚(15 叶按日)", ox, chainY - 14);

      /* —— 右:减速链 —— */
      var rx = w * 0.585, rw = w - rx - 14;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("三级减速链", rx, topY + 12);
      var rows = [
        ["水轮 2.443 rad/s", "ω = i × ω浑"],
        ["一级 28T→8T", "3.5×(方向翻转)"],
        ["二级 32T→8T", "4×(方向翻转)"],
        ["三级 16T→8T", "2× → 浑象"],
        ["浑象 0.0873", "= 2π/72(×1200=一日)"]
      ];
      var gy0 = topY + 26;
      rows.forEach(function (b, i) {
        var y = gy0 + i * 21;
        ctx.strokeStyle = i === 4 ? red : ink; ctx.lineWidth = 1.1;
        ctx.strokeRect(rx, y, rw, 17);
        ctx.fillStyle = ink;
        ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
        ctx.fillText(b[0], rx + 6, y + 12);
        ctx.fillStyle = faint;
        ctx.font = "600 8px Menlo, monospace"; ctx.textAlign = "right";
        ctx.fillText(b[1], rx + rw - 6, y + 12);
      });

      /* —— 右下:蓂荚 —— */
      var by = gy0 + 112;
      ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.font = "700 11px sans-serif";
      ctx.fillText("瑞轮蓂荚", rx, by - 6);
      ctx.font = "600 8.5px sans-serif";
      ctx.fillStyle = ink;
      ctx.fillText("15 叶 · ω蓂 = ω浑/15 · 每 4.8s 升一叶", rx, by + 8);
      ctx.fillStyle = faint;
      ctx.fillText("一叶一日(×1200 演示),随月盈虚依历开落", rx, by + 22);

      /* —— 底部:部件链 —— */
      var boxes = [
        ["漏壶", "恒流注水"], ["水轮", "r 0.38 · 8 桨"], ["齿轮一级", "28T→8T · 3.5"],
        ["齿轮二级", "32T→8T · 4"], ["齿轮三级", "16T→8T · 2"], ["浑象球", "一转一日"]
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
      '<tr><th>水轮</th><td>r 0.38 m · 8 桨 · 浸入水槽</td><td>ω 2.443 rad/s</td></tr>' +
      '<tr><th>一级</th><td>28T → 8T(r 0.30 → 0.098)</td><td>3.5(方向翻转)</td></tr>' +
      '<tr><th>二级</th><td>32T → 8T(r 0.32 → 0.08)</td><td>4(方向翻转)</td></tr>' +
      '<tr><th>三级</th><td>16T → 8T(r 0.16 → 0.08)</td><td>2 → 浑象轴</td></tr>' +
      '</table><h4>浑象与蓂荚</h4><table>' +
      '<tr><th>浑象球</th><td>r 0.52 · 星空 Canvas 贴图 · 极轴倾 50.1°</td><td>ω 0.0873(72s/转)</td></tr>' +
      '<tr><th>时间加速</th><td>72s × 1200 = 86400s</td><td>= 一日(严格断言)</td></tr>' +
      '<tr><th>瑞轮蓂荚</th><td>15 叶 · ω蓂 = ω浑/15</td><td>每 4.8s 升一叶</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>i = 3.5 × 4 × 2 = 28(载入期严格断言);浑象周期×时间加速 = 86400s(±1e-6 断言);蓂荚叶周期 4.8s。</p>' +
      '<p>运行期 errPos = 轮6 缘点世界位置 vs 解析(浑象轴转角)≈ 0,端到端验证全链速比。</p>' +
      '<h4>文献</h4>' +
      '<p>《晋书·天文志》:「张衡……以漏水转之于殿上室内,星中出没与天相应……又作瑞轮蓂荚……随月盈虚,依历开落。」</p>'
  };
})(window.MECH = window.MECH || {});
