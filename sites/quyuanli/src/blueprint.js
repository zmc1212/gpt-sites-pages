/* 图纸面板(B 键):曲辕犁复原侧视总图 + 评-耕深映射 + 部件链 + 尺寸表。
   分区:顶部公式横幅 / 左侧视(大)/ 右列(评-耕深曲线 + 部件十一名)/ 底部部件链。 */
(function (MECH) {
  var ink = "#2A2620", faint = "rgba(42,38,32,0.38)", faint2 = "rgba(42,38,32,0.22)";
  var waterC = "#3E6E86", woodC = "#6E4E28", red = "#8C2F1E";

  function arrowH(ctx, x1, x2, y, text, below) {
    ctx.strokeStyle = faint; ctx.fillStyle = faint; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
    var s = 4, dir = x2 >= x1 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(x2, y); ctx.lineTo(x2 - s * dir, y - 3); ctx.lineTo(x2 - s * dir, y + 3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1 + s * dir, y - 3); ctx.lineTo(x1 + s * dir, y + 3); ctx.closePath(); ctx.fill();
    ctx.font = "600 9px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText(text, (x1 + x2) / 2, below ? y + 12 : y - 5);
  }
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
    no: "Fig. 05 · 复原总图",
    title: "曲辕犁 · 江东犁十一部件(唐·陆龟蒙《耒耜经》)",
    src: "《耒耜经》:「犁评,进则深,退则浅」 · 尺寸按本站复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainY = h - 70, topY = 30;

      /* —— 公式横幅 —— */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("θ = 1.5° + 20°·u   ·   d = a·sinθ = 1.1·sinθ   ·   u 0→0.30m → θ 1.5°→7.5° → d 2.9→14.4cm", w * 0.03, topY - 8);

      /* —— 左:侧视图 —— */
      var ox = w * 0.03, oRight = w * 0.55, regionH = chainY - topY - 26;
      var S = Math.min((oRight - ox - 16) / 3.6, (regionH - 12) / 1.5);
      var oy = topY + regionH - 0.25 * S;
      function X(m) { return ox + 0.5 * S + (m + 0.8) * S; }
      function Y(m) { return oy - m * S; }
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(犁首 → 右)", ox, topY + 10);
      /* 土床 + 沟迹 */
      ctx.strokeStyle = faint2;
      ctx.strokeRect(X(-3.0), Y(0), 7.0 * S, 0.22 * S);
      ctx.strokeStyle = ink; ctx.lineWidth = 1.3;
      /* 犁体两态:实线浅耕 θ=1.5°,虚线深耕 θ=7.5°(绕后端翻转) */
      function plowSym(thDeg, dash) {
        var t = thDeg * Math.PI / 180;
        ctx.save();
        ctx.translate(X(0), Y(0));
        ctx.rotate(t);
        ctx.setLineDash(dash ? [5, 4] : []);
        ctx.strokeStyle = dash ? faint : ink;
        ctx.lineWidth = dash ? 1.3 : 2.2;
        ctx.beginPath(); ctx.moveTo(0, 0.05); ctx.lineTo(1.1, 0.05); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0.62, 0.09); ctx.lineTo(0.62, 0.46); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0.62, 0.44); ctx.quadraticCurveTo(1.6, 0.18, 2.35, 0.90); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0.05, 0.06); ctx.lineTo(-0.55, 0.96); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(1.1, 0.06); ctx.lineTo(1.42, 0.02); ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
      plowSym(7.5, true);
      plowSym(1.5, false);
      /* 沟深标注 */
      arrowV(ctx, X(1.55), Y(0), Y(-0.144), "深耕 14.4cm", 1);
      arrowV(ctx, X(1.55), Y(0), Y(-0.029), "浅耕 2.9cm", 1);
      arrowH(ctx, X(0), X(1.1), Y(0) + 14, "犁底 a = 1.10 m", true);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("实线 浅耕 θ=1.5° · 虚线 深耕 θ=7.5°(绕犁底后端翻转,铧尖入土)", ox, chainY - 14);

      /* —— 右上:评-耕深曲线 —— */
      var rx = w * 0.585, rw = w - rx - 14;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("评行程 u → 耕深 d", rx, topY + 12);
      var gx0 = rx + 30, gw = rw - 46, gy0 = topY + 24, gh = 86;
      function xOf(u) { return gx0 + u / D.U * gw; }
      function yOf(d) { return gy0 + (1 - (d - 0.02) / 0.14) * gh; }
      ctx.strokeStyle = faint2; ctx.lineWidth = 1;
      ctx.strokeRect(gx0, gy0, gw, gh);
      ctx.strokeStyle = woodC; ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (var i = 0; i <= 30; i++) {
        var u = i / 30 * D.U;
        var d = 1.1 * Math.sin((1.5 + 20 * u) * Math.PI / 180);
        if (i === 0) ctx.moveTo(xOf(u), yOf(d)); else ctx.lineTo(xOf(u), yOf(d));
      }
      ctx.stroke();
      ctx.fillStyle = ink;
      ctx.font = "600 8.5px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("2.9", gx0 - 24, yOf(0.029) + 3);
      ctx.fillText("14.4cm", gx0 - 36, yOf(0.144) + 3);
      ctx.textAlign = "center";
      ctx.fillText("u 0.30m", gx0 + gw / 2, gy0 + gh + 13);

      /* —— 右下:十一部件名 —— */
      var by = gy0 + gh + 30;
      ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.font = "700 11px sans-serif";
      ctx.fillText("十一部件(《耒耜经》)", rx, by - 8);
      var names = ["犁铧", "犁壁", "犁底", "压镵", "策额", "犁箭", "犁辕", "犁梢", "犁评", "犁建", "土床"];
      ctx.font = "600 9px sans-serif";
      names.forEach(function (n, i) {
        var col = i % 2, row = (i / 2) | 0;
        ctx.fillStyle = i < 10 ? ink : faint2;
        ctx.fillText((i + 1) + "." + n, rx + col * 78, by + 6 + row * 14);
      });

      /* —— 底部:部件链 —— */
      var boxes = [
        ["犁评+犁建", "行程 0.30m"], ["犁辕", "曲辕 S 曲线"], ["犁箭", "连底与辕"],
        ["犁底", "a = 1.10m"], ["犁铧", "入土 d=a·sinθ"], ["犁壁", "翻土成垄"]
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
      '<h4>犁体尺寸</h4><table>' +
      '<tr><th>犁底</th><td>长 1.10 m · 后端着地(翻转支点)</td><td>a = 1.10 m</td></tr>' +
      '<tr><th>犁铧</th><td>铁铧 0.34 m · 入土刃</td><td>床顶没入 ≤ 0.144 m</td></tr>' +
      '<tr><th>犁辕</th><td>曲辕 S 曲线 · 轭钩在前</td><td>前端高 0.90 m</td></tr>' +
      '<tr><th>犁梢</th><td>扶手斜上</td><td>高 0.98 m</td></tr>' +
      '</table><h4>耕深调节</h4><table>' +
      '<tr><th>犁评行程</th><td>u = 0 → 0.30 m(进深退浅)</td><td>k = 20°/m</td></tr>' +
      '<tr><th>倾角</th><td>θ = 1.5° + 20°·u</td><td>1.5° → 7.5°</td></tr>' +
      '<tr><th>耕深</th><td>d = a·sinθ = 1.1·sinθ</td><td>2.9 → 14.4 cm</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>耕深单调:d(0)=2.9 &lt; d(0.15)=8.5 &lt; d(0.30)=14.4(载入期断言);铧尖距土床底 &gt; 0.04 m(床厚 0.22 m,不入全球地面)。</p>' +
      '<p>运行期 errPos:铧尖世界高度 vs 解析 bedTop − d(u),应 ≈ 0(犁体绕后端翻转与线性模型一致)。</p>' +
      '<h4>文献</h4>' +
      '<p>陆龟蒙《耒耜经》:江东犁十一部件,「犁评,进则深,退则浅」—— 世界农史上最早的耕深调节机构之一。</p>'
  };
})(window.MECH = window.MECH || {});
