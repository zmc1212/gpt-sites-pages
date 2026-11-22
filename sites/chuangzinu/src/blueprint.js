/* 图纸面板(B 键):三弓床弩复原侧视总图 + 叠张-弹道验算 + 尺寸表。 */
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
    no: "Fig. 20 · 复原总图",
    title: "三弓床弩 · 三弓叠张绞车击发(《武经总要》)",
    src: "《武经总要》三弓床弩(三弓八牛弩)节 · 尺寸按本站复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainY = h - 70, topY = 30;

      /* —— 公式横幅 —— */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("叠张 F = 3F0 = 600 kgf   ·   绞车 MA = 0.30/0.09 = 3.33   ·   E = ½Fx = 2646 J   ·   v = √(2E/m) ≈ 59 m/s", w * 0.03, topY - 8);

      /* —— 左:侧视图 —— */
      var ox = w * 0.03, oRight = w * 0.55, regionH = chainY - topY - 26;
      var S = Math.min((oRight - ox - 16) / 2.9, (regionH - 12) / 1.2);
      var oy = topY + regionH - 0.75 * S;
      function X(m) { return ox + 0.4 * S + (m + 1.3) * S; }
      function Y(m) { return oy - m * S; }
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(射向 +x →)", ox, topY + 10);
      ctx.beginPath(); ctx.moveTo(X(1.7), Y(0)); ctx.lineTo(X(-1.5), Y(0)); ctx.stroke();
      /* 弩床 */
      ctx.strokeRect(X(-1.05), Y(0.44), 2.3 * S, 0.14 * S);
      /* 三弓(前双弧 + 反弧) */
      ctx.beginPath(); ctx.arc(X(D.bowFrontX), Y(D.bedY + 0.30), 0.46 * S, -1.1, 1.1); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(D.bowFrontX), Y(D.bedY + 0.30), 0.44 * S, -1.0, 1.0); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(D.bowBackX), Y(D.bedY + 0.30), 0.50 * S, Math.PI - 1.1, Math.PI + 1.1); ctx.stroke();
      /* 张弦双态(实线满张 / 虚线原位) */
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = faint;
      ctx.beginPath(); ctx.moveTo(X(D.bowFrontX - 0.36), Y(D.bedY + 0.30)); ctx.lineTo(X(D.catchX0), Y(D.bedY + 0.30)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = red;
      ctx.beginPath(); ctx.moveTo(X(D.bowFrontX - 0.36), Y(D.bedY + 0.30)); ctx.lineTo(X(D.catchX0 - D.drawMax), Y(D.bedY + 0.30)); ctx.stroke();
      ctx.strokeStyle = ink;
      /* 箭 */
      ctx.beginPath(); ctx.moveTo(X(D.catchX0 - D.drawMax), Y(D.bedY + 0.30));
      ctx.lineTo(X(D.catchX0 - D.drawMax + D.boltL), Y(D.bedY + 0.30)); ctx.stroke();
      /* 绞车 */
      ctx.strokeRect(X(0.95), Y(D.bedY + 0.24), 0.30 * S, 0.20 * S);
      ctx.beginPath(); ctx.arc(X(1.10 + D.rCrank), Y(D.bedY + 0.34), 0.05 * S, 0, Math.PI * 2); ctx.stroke();
      /* 尺寸 */
      arrowV(ctx, X(-1.35), Y(D.catchX0 - D.drawMax), Y(D.bedY + 0.30), "张弦 0.90", -1);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("红线 满张弦位(大牙 −0.75)· 虚线 卸弦位 · 三弓叠张串联", ox, chainY - 14);

      /* —— 右:能量-弹速 —— */
      var rx = w * 0.585, rw = w - rx - 14;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("叠张 → 弹速", rx, topY + 12);
      var rows = [
        ["单弓 F0 = 200 kgf", "×3 弓"],
        ["叠张 F = 600 kgf", "= 5880 N"],
        ["张弦 x = 0.90 m", "E = ½Fx = 2646 J"],
        ["箭 m = 1.5 kg", "v = √(2E/m) ≈ 59 m/s"]
      ];
      var gy0 = topY + 26;
      rows.forEach(function (b, i) {
        var y = gy0 + i * 22;
        ctx.strokeStyle = i === 3 ? red : ink; ctx.lineWidth = 1.1;
        ctx.strokeRect(rx, y, rw, 18);
        ctx.fillStyle = ink;
        ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
        ctx.fillText(b[0], rx + 6, y + 12);
        ctx.fillStyle = faint;
        ctx.font = "600 8px Menlo, monospace"; ctx.textAlign = "right";
        ctx.fillText(b[1], rx + rw - 6, y + 12);
      });

      /* —— 右下:绞车省力 —— */
      var by = gy0 + 96;
      ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.font = "700 11px sans-serif";
      ctx.fillText("绞车省力", rx, by - 6);
      var lines = [["MA = r柄/r鼓", "= 0.30/0.09 = 3.33"], ["柄端力", "= 600/3.33 = 180 kgf"], ["六人绞", "各 30 kgf(可及)"]];
      ctx.font = "600 8.5px sans-serif";
      lines.forEach(function (l, i) {
        ctx.fillStyle = i === 1 ? red : ink;
        ctx.fillText(l[0] + " " + l[1], rx, by + 8 + i * 14);
      });

      /* —— 底部:部件链 —— */
      var boxes = [
        ["弩床砧柱", "重木床"], ["前双弓", "F0 ×2 正向"], ["反弓", "顶弦助力 ×1"],
        ["弦+大牙", "六梢聚钩 锁弦"], ["一枪三剑箭", "m 1.5 · v 59"], ["绞车", "MA 3.33 张弦"]
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
      '<h4>弩体</h4><table>' +
      '<tr><th>弩床</th><td>重木床 2.30 × 0.70 · 床面 0.52</td><td>砧柱双座</td></tr>' +
      '<tr><th>三弓</th><td>前双弓(正向)+ 反弓(反向)</td><td>叠张串联</td></tr>' +
      '<tr><th>弦与大牙</th><td>六梢聚钩 · 大牙锁弦</td><td>张弦 0.90 m</td></tr>' +
      '</table><h4>力与弹道</h4><table>' +
      '<tr><th>叠张力</th><td>F = 3 × F0 = 3 × 200</td><td>600 kgf(5880 N)</td></tr>' +
      '<tr><th>绞车省力</th><td>MA = r柄/r鼓 = 0.30/0.09</td><td>3.33(严格)</td></tr>' +
      '<tr><th>弦储能</th><td>E = ½·F·x = ½×5880×0.90</td><td>2646 J</td></tr>' +
      '<tr><th>弹速</th><td>v = √(2E/m箭) = √(2×2646/1.5)</td><td>59.4 m/s</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>三弓叠张 F = 600(严格断言);MA = 10/3(严格断言);v ≈ 59.4 ∈ (50,70)(断言)。</p>' +
      '<p>运行期 errPos = 弦钩世界 x 与解析(catchX0 − draw)之差 ≈ 0;箭弹道匀速 + 12% 线性重力(示意平射)。</p>' +
      '<h4>文献</h4>' +
      '<p>《武经总要》三弓床弩(三弓八牛弩):「一枪三剑箭」——张弦需数十人绞车合力,射七百步,为城防重器。</p>'
  };
})(window.MECH = window.MECH || {});
