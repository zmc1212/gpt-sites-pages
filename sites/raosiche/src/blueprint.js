/* 图纸面板(B 键):缫丝车复原侧视总图 + 移丝行程图 + 部件链 + 尺寸表。 */
(function (MECH) {
  var KS = MECH.KS;
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
    no: "Fig. 07 · 复原总图",
    title: "缫丝车 · 脚踏曲柄移丝(《天工开物·乃服》)",
    src: "《天工开物·乃服》缫丝节 · 尺寸按本站复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainY = h - 70, topY = 30;

      /* —— 公式横幅 —— */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("移丝 z钩 = z0 + 0.14·sinψ   ·   行程 0.28m(框宽 0.37)   ·   踏板行程 0.22m   ·   同轴直驱 1:1", w * 0.03, topY - 8);

      /* —— 左:侧视图 —— */
      var ox = w * 0.03, oRight = w * 0.55, regionH = chainY - topY - 26;
      var S = Math.min((oRight - ox - 16) / 3.6, (regionH - 12) / 1.9);
      var oy = topY + regionH - 0.45 * S;
      function X(m) { return ox + 0.45 * S + (m + 1.5) * S; }
      function Y(m) { return oy - m * S; }
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(西 · 灶锅 → 右东)", ox, topY + 10);
      ctx.beginPath(); ctx.moveTo(X(2.0), Y(0)); ctx.lineTo(X(-1.7), Y(0)); ctx.stroke();
      /* 灶锅 */
      ctx.strokeRect(X(-1.51), Y(0), 0.72 * S, D.stoveTop * S);
      ctx.beginPath(); ctx.arc(X(D.stoveX), Y(D.stoveTop + 0.08), 0.30 * S, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      ctx.strokeStyle = waterC;
      ctx.beginPath(); ctx.moveTo(X(D.stoveX - 0.24), Y(D.basinWater)); ctx.lineTo(X(D.stoveX + 0.24), Y(D.basinWater)); ctx.stroke();
      ctx.strokeStyle = ink;
      /* 机架 + 框轴 + 丝框双态 */
      ctx.strokeRect(X(D.frameX - 0.085), Y(0), 0.13 * S, (D.frameY + 0.10) * S);
      ctx.beginPath(); ctx.arc(X(D.frameX), Y(D.frameY), D.rFrame * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(D.frameX), Y(D.frameY), 0.09 * S, 0, Math.PI * 2); ctx.stroke();
      for (var i = 0; i < 4; i++) {
        var a = i / 4 * Math.PI * 2 + 0.4;
        ctx.beginPath();
        ctx.moveTo(X(D.frameX) + Math.cos(a) * 0.09 * S, Y(D.frameY) + Math.sin(a) * 0.09 * S);
        ctx.lineTo(X(D.frameX) + Math.cos(a) * D.rFrame * S, Y(D.frameY) + Math.sin(a) * D.rFrame * S);
        ctx.stroke();
      }
      /* 送丝竿 + 移丝钩双态 */
      ctx.beginPath(); ctx.moveTo(X(D.guideX - 0.28), Y(0)); ctx.lineTo(X(D.guideX - 0.28), Y(D.guideY)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(D.guideX - 0.28), Y(D.guideY)); ctx.lineTo(X(D.guideX + 0.42), Y(D.guideY)); ctx.stroke();
      ctx.strokeStyle = faint2;
      ctx.beginPath(); ctx.arc(X(D.hookX), Y(D.hookY - 0.02), D.A * S, Math.PI * 0.9, Math.PI * 2.1); ctx.stroke();
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(X(D.hookX), Y(D.hookY - 0.05)); ctx.lineTo(X(D.frameX + 0.33), Y(D.frameY + 0.2)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = ink;
      /* 踏板曲柄双态 */
      ctx.beginPath(); ctx.arc(X(D.frameX), Y(D.frameY), D.rTread * S, 0, Math.PI * 2); ctx.stroke();
      /* 尺寸 */
      arrowH(ctx, X(D.frameX - D.rFrame), X(D.frameX + D.rFrame), Y(0) - 8, "框径 0.70 m", true);
      arrowV(ctx, X(-0.35), Y(D.hookY - D.A), Y(D.hookY + D.A), "移丝 0.28 m", -1);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("丝线:茧→移丝钩→框缘动点(虚线示绕丝)", ox, chainY - 14);

      /* —— 右:行程-角度图 —— */
      var rx = w * 0.585, rw = w - rx - 14;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("移丝钩正弦行程", rx, topY + 12);
      var gx0 = rx + 34, gw = rw - 44, gy0 = topY + 24, gh = 76;
      function yOf(z) { return gy0 + (1 - (z - (D.hookZ0 - D.A)) / (2 * D.A)) * gh; }
      ctx.strokeStyle = faint2; ctx.lineWidth = 1;
      ctx.strokeRect(gx0, gy0, gw, gh);
      ctx.strokeStyle = woodC; ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (var j = 0; j <= 36; j++) {
        var psi = j / 36 * Math.PI * 2;
        var xx = gx0 + j / 36 * gw;
        var yy = yOf(KS.hookZ(psi));
        if (j === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      ctx.fillStyle = ink;
      ctx.font = "600 8.5px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("0.095", gx0 - 28, yOf(D.hookZ0 - D.A) + 3);
      ctx.fillText("0.375", gx0 - 28, yOf(D.hookZ0 + D.A) + 3);
      ctx.textAlign = "center";
      ctx.fillText("ψ 0 → 2π(与框同频 1:1)", gx0 + gw / 2, gy0 + gh + 13);

      /* —— 右下:部件名 —— */
      var by = gy0 + gh + 32;
      ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.font = "700 11px sans-serif";
      ctx.fillText("运动链", rx, by - 8);
      var names = [["脚踏板", "往复 ±0.11"], ["曲柄 r 0.11", "同轴直驱"], ["丝框 D 0.70", "2.4 rad/s"],
                   ["移丝钩", "0.14·sinψ"], ["送丝眼", "定位"], ["茧汤", "三缕并缫"]];
      ctx.font = "600 8.5px sans-serif";
      names.forEach(function (n, i) {
        var col = i % 2, row = (i / 2) | 0;
        ctx.fillStyle = ink;
        ctx.fillText(n[0] + " · " + n[1], rx + col * 110, by + 6 + row * 14);
      });

      /* —— 底部:部件链 —— */
      var boxes = [
        ["脚踏板", "行程 0.22m"], ["曲柄", "r 0.11 · 同轴"], ["丝框", "径 0.70m · 转 2.4"],
        ["移丝钩", "0.28m 往复"], ["送丝眼", "过丝定位"], ["灶锅", "缫汤浮茧 · 蒸汽"]
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
      '<h4>框与传动</h4><table>' +
      '<tr><th>丝框</th><td>径 0.70 m · 双十字轮 · 框宽 0.37 m</td><td>轴高 0.85 m</td></tr>' +
      '<tr><th>踏板曲柄</th><td>r = 0.11 m · 行程 0.22 m</td><td>同轴直驱 1:1</td></tr>' +
      '<tr><th>框转速度</th><td>脚踏 ω(示意恒定)</td><td>2.4 rad/s</td></tr>' +
      '</table><h4>移丝机构</h4><table>' +
      '<tr><th>移丝钩</th><td>z钩 = 0.235 + 0.14·sinψ</td><td>行程 0.28 m</td></tr>' +
      '<tr><th>往复频率</th><td>与框同频(1:1 偏摆)</td><td>每转一程</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>行程断言:2A = 0.28(严格)、2r踏 = 0.22;钩位 0.095..0.375 ∈ 框宽 0.05..0.42 —— 载入期断言。</p>' +
      '<p>运行期 errPos = 移丝钩世界位置与解析值之差 ≈ 0;丝线几何每帧由解析点重建(茧→钩→框缘)。</p>' +
      '<h4>文献</h4>' +
      '<p>《天工开物·乃服》:缫丝「二人执爨……以二脚踏板,框自转,丝自浮转上」——脚踏曲柄同轴驱动,偏摆机构往复匀铺丝于框面。</p>'
  };
})(window.MECH = window.MECH || {});
