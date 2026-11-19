/* 图纸面板(B 键):相风铜乌复原总图 + 对风响应曲线 + 尺寸表。 */
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
    no: "Fig. 14 · 复原总图",
    title: "相风铜乌 · 欠阻尼对风(汉灵台)",
    src: "《三辅黄图》灵台相风铜乌「遇风乃动」 · 尺寸按本站复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainY = h - 70, topY = 30;

      /* —— 公式横幅 —— */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("θ(t) = θw − ΔA·e^{−ζω·τ}·cos(ωd·τ)   ·   ζω = 1.6   ·   ωd = 2.4(过冲一次)   ·   稳态误差 = 0(解析)", w * 0.03, topY - 8);

      /* —— 左:侧视图 —— */
      var ox = w * 0.03, oRight = w * 0.55, regionH = chainY - topY - 26;
      var S = Math.min((oRight - ox - 16) / 2.8, (regionH - 12) / 2.6);
      var oy = topY + regionH - 0.75 * S;
      function X(m) { return ox + 0.5 * S + (m + 1.3) * S; }
      function Y(m) { return oy - m * S; }
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(乌首 → 右)", ox, topY + 10);
      ctx.beginPath(); ctx.moveTo(X(1.5), Y(0)); ctx.lineTo(X(-1.5), Y(0)); ctx.stroke();
      /* 台基两层 */
      ctx.strokeRect(X(-1.1), Y(0), 2.2 * S, 0.9 * S);
      ctx.strokeRect(X(-0.85), Y(0.9), 1.7 * S, 0.7 * S);
      /* 方位盘 */
      ctx.beginPath(); ctx.ellipse(X(0), Y(D.baseH + 1.42), D.RDisc * S, D.RDisc * S * 0.36, 0, 0, Math.PI * 2); ctx.stroke();
      /* 枢 + 乌身 + 尾板 + 喙 */
      ctx.beginPath(); ctx.arc(X(0), Y(D.pivotY - 0.12), 0.07 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(X(0), Y(D.pivotY + 0.14), 0.14 * S * 1.4, 0.12 * S, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(0.10 * S * 0 + 0), Y(D.pivotY + 0.28), 0.075 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = faint;
      ctx.strokeRect(X(-0.02), Y(D.pivotY + 0.06), 0.03 * S, 0.16 * S);
      ctx.setLineDash([]);
      ctx.strokeStyle = ink;
      /* 尺寸 */
      arrowV(ctx, X(1.25), Y(0), Y(D.pivotY), "枢高 1.78 m", 1);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("乌首(实)指风来向 · 尾风板(虚)受风", ox, chainY - 14);

      /* —— 右:对风响应曲线 —— */
      var rx = w * 0.585, rw = w - rx - 14;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("阵风阶跃响应(±90°)", rx, topY + 12);
      var gx0 = rx + 34, gw = rw - 44, gy0 = topY + 24, gh = 84;
      function yOf(a) { return gy0 + (1 - KS.clamp(a / 100 + 0.5, 0, 1)) * gh; }
      ctx.strokeStyle = faint2; ctx.lineWidth = 1;
      ctx.strokeRect(gx0, gy0, gw, gh);
      ctx.strokeStyle = faint;
      ctx.beginPath(); ctx.moveTo(gx0, gy0 + gh / 2); ctx.lineTo(gx0 + gw, gy0 + gh / 2); ctx.stroke();
      /* 目标 ±90° 阶跃 + 响应 */
      var jumps = [0, 90, -90, 45, -72];
      ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      jumps.forEach(function (j, i) {
        var x0 = gx0 + i / jumps.length * gw;
        var x1 = gx0 + (i + 1) / jumps.length * gw;
        var y = yOf(j);
        if (i === 0) ctx.moveTo(x0, y); else ctx.lineTo(x0, y);
        ctx.lineTo(x1, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = yellow; ctx.lineWidth = 1.8;
      ctx.beginPath();
      jumps.forEach(function (j, i) {
        var x0 = gx0 + i / jumps.length * gw;
        var x1 = gx0 + (i + 1) / jumps.length * gw;
        var prev = i === 0 ? 0 : jumps[i - 1];
        for (var k = 0; k <= 20; k++) {
          var tau = k / 20 * (2.2 * jumps.length / jumps.length);
          var tt = k / 20 * 2.2;
          var v = j - (j - prev) * Math.exp(-D.zetaOmega * tt) * Math.cos(D.omegaD * tt);
          var xx = x0 + k / 20 * (x1 - x0);
          var yy = yOf(v);
          if (k === 0 && i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
        }
      });
      ctx.stroke();
      ctx.fillStyle = ink;
      ctx.font = "600 8px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("+90°", gx0 - 28, yOf(90) + 3);
      ctx.fillText("−90°", gx0 - 28, yOf(-90) + 3);
      ctx.fillStyle = yellow;
      ctx.fillText("θv 响应(过冲回落)", gx0 + 6, gy0 - 4);
      ctx.fillStyle = soft;
      ctx.fillText("θw 目标(虚线)", gx0 + 110, gy0 - 4);

      /* —— 右下:要点 —— */
      var by = gy0 + gh + 34;
      ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.font = "700 11px sans-serif";
      ctx.fillText("验算要点", rx, by - 6);
      var lines = ["稳态误差 = 0(解析严格)", "2s 后误差 < 0.5°(锁定)", "过冲一次回落(欠阻尼 ζω=1.6)"];
      ctx.font = "600 8.5px sans-serif";
      lines.forEach(function (l, i) {
        ctx.fillStyle = i === 0 ? red : ink;
        ctx.fillText(l, rx, by + 8 + i * 14);
      });

      /* —— 底部:部件链 —— */
      var boxes = [
        ["灵台台基", "两层石台"], ["方位盘", "24 刻度"], ["枢柱栖座", "配重盘"],
        ["铜乌", "乌首指风来向"], ["尾风板", "受风面"], ["风向旗", "飘向风去处"]
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
      '<h4>台与盘</h4><table>' +
      '<tr><th>灵台台基</th><td>两层石台 2.2 / 1.7 m · 高 1.60 m</td><td>台阶双面</td></tr>' +
      '<tr><th>方位盘</th><td>r 0.55 m · 24 刻度 · 铜面金字</td><td>水平</td></tr>' +
      '<tr><th>枢柱</th><td>高 0.24 + 栖座配重盘</td><td>枢高 1.78 m</td></tr>' +
      '</table><h4>铜乌</h4><table>' +
      '<tr><th>乌身</th><td>长 0.42 m · 首喙足翅齐备</td><td>铜面</td></tr>' +
      '<tr><th>尾风板</th><td>受风面长 0.55 m · 竖板</td><td>风压对风</td></tr>' +
      '</table><h4>对风运动学</h4><table>' +
      '<tr><th>欠阻尼参数</th><td>ζω = 1.6 · ωd = 2.4 rad/s</td><td>过冲一次</td></tr>' +
      '<tr><th>稳态误差</th><td>解析 0(严格断言)</td><td>2s 后 &lt; 0.5°</td></tr>' +
      '<tr><th>阵风试验</th><td>±90° 四次跳变 · 每 2.2s</td><td>振荡锁定</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>响应解析:θ(t) = θw − ΔA·e^{−ζω·τ}·cos(ωd·τ) —— 纯函数,seek 无需补偿;稳态误差恒为 0。</p>' +
      '<p>运行期 errPos = 乌喙尖世界位置 vs 解析(枢 + 首向)≈ 0;风向旗飘向风去处,与乌首相反互证。</p>' +
      '<h4>文献</h4>' +
      '<p>《三辅黄图》:汉长安灵台「相风铜乌,遇风乃动」—— 世界最早的风向仪记载之一;乌首指风来向,尾板受风平衡。</p>'
  };
})(window.MECH = window.MECH || {});
