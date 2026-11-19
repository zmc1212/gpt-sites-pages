/* 图纸面板(B 键):油榨复原侧视总图 + 摆-击时序 + 尺寸表。 */
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
    no: "Fig. 10 · 复原总图",
    title: "油榨 · 悬锤撞楔压榨(《天工开物·膏液》)",
    src: "《天工开物·膏液》榨节 · 尺寸按本站复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainY = h - 70, topY = 30;

      /* —— 公式横幅 —— */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("v锤 = L·φ̇max = 1.45×0.58×π = 2.64 m/s   ·   每击楔进 0.03 ×3   ·   饼束压缩 0.09/0.50 = 18%", w * 0.03, topY - 8);

      /* —— 左:侧视图 —— */
      var ox = w * 0.03, oRight = w * 0.55, regionH = chainY - topY - 26;
      var S = Math.min((oRight - ox - 16) / 3.2, (regionH - 12) / 2.4);
      var oy = topY + regionH - 0.5 * S;
      function X(m) { return ox + 0.6 * S + (m + 1.3) * S; }
      function Y(m) { return oy - m * S; }
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(楔 ← | → 悬锤)", ox, topY + 10);
      ctx.beginPath(); ctx.moveTo(X(2.2), Y(0)); ctx.lineTo(X(-1.4), Y(0)); ctx.stroke();
      /* 榨框 */
      ctx.strokeRect(X(D.frameX0 - 0.15), Y(0), 0.30 * S, D.frameH * S);
      ctx.strokeRect(X(D.frameX1 - 0.15), Y(0), 0.30 * S, D.frameH * S);
      ctx.strokeRect(X(D.frameX0 - 0.15), Y(D.frameH), 1.44 * S, 0.16 * S);
      ctx.strokeRect(X(D.frameX0 - 0.15), Y(0.16), 1.44 * S, 0.16 * S);
      /* 饼束双态(实线未压 / 虚线压后) */
      ctx.strokeRect(X(D.cakeX0), Y(D.cakeY0), (D.cakeX1 - D.cakeX0) * S, (D.cakeY1 - D.cakeY0) * S);
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = faint;
      ctx.strokeRect(X(D.cakeX0 - 0.09), Y(D.cakeY0), (D.cakeX1 - D.cakeX0 - 0.09) * S, (D.cakeY1 - D.cakeY0) * S);
      ctx.setLineDash([]);
      ctx.strokeStyle = ink;
      /* 楔双态 */
      ctx.strokeRect(X(D.wedgeX0), Y(D.wedgeY - 0.08), D.wedgeLen * S, 0.16 * S);
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = faint;
      ctx.strokeRect(X(D.wedgeX0 - 0.09), Y(D.wedgeY - 0.08), D.wedgeLen * S, 0.16 * S);
      ctx.setLineDash([]);
      ctx.strokeStyle = ink;
      /* 悬锤双态(实线摆底 / 虚线抬起) */
      ctx.beginPath(); ctx.moveTo(X(D.pivotX), Y(D.pivotY));
      ctx.lineTo(X(D.pivotX), Y(D.pivotY - D.armL)); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(D.pivotX), Y(D.pivotY - D.armL), 0.13 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = faint;
      ctx.beginPath(); ctx.moveTo(X(D.pivotX), Y(D.pivotY));
      ctx.lineTo(X(D.pivotX + Math.sin(D.swingA) * D.armL), Y(D.pivotY - Math.cos(D.swingA) * D.armL)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = ink;
      ctx.beginPath(); ctx.arc(X(D.pivotX), Y(D.pivotY), 0.05 * S, 0, Math.PI * 2); ctx.stroke();
      /* 油盘 */
      ctx.strokeRect(X(-0.55), Y(0), D.panW * S, D.panH * S);
      /* 尺寸 */
      arrowV(ctx, X(-1.15), Y(D.cakeY0), Y(D.cakeY1), "饼束 0.50", -1);
      arrowV(ctx, X(2.05), Y(D.pivotY - D.armL), Y(D.pivotY), "臂 1.45 m", 1);
      arrowH(ctx, X(D.wedgeX0), X(D.wedgeX0 + D.wedgeLen), Y(D.wedgeY) + 14, "楔 0.62 m", true);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("实线 未压/摆底 · 虚线 压后/抬起 · 油自饼底渗出入盘", ox, chainY - 14);

      /* —— 右:击楔时序 —— */
      var rx = w * 0.585, rw = w - rx - 14;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("撞楔时序(3 击 × 0.03)", rx, topY + 12);
      var gx0 = rx + 6, gw = rw - 12, gy0 = topY + 26, gh = 40;
      ctx.strokeStyle = faint2; ctx.lineWidth = 1;
      ctx.strokeRect(gx0, gy0, gw, gh);
      /* 楔进阶梯线 */
      ctx.strokeStyle = woodC; ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(gx0, gy0 + gh - 4);
      for (var i = 1; i <= 3; i++) {
        var x = gx0 + (i * D.period * 0.8) / (3 * D.period * 0.8 + 1.2) * gw;
        var y = gy0 + gh - 4 - i / 3 * (gh - 8);
        ctx.lineTo(x, gy0 + gh - 4);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = ink;
      ctx.font = "600 8.5px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("击 1..3 → 楔进 3/6/9cm", gx0, gy0 + gh + 13);

      /* —— 右下:验算要点 —— */
      var by = gy0 + gh + 40;
      ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.font = "700 11px sans-serif";
      ctx.fillText("验算要点", rx, by - 6);
      var lines = ["v锤 = L·φ̇ = 2.64 m/s ∈ (2,4)", "压缩率 = 0.09/0.50 = 18% ∈ (0.1,0.3)", "锤面-楔尾间隙 ≥ 0.02(不穿模)"];
      ctx.font = "600 8.5px sans-serif";
      lines.forEach(function (l, i) {
        ctx.fillStyle = i === 2 ? red : ink;
        ctx.fillText(l, rx, by + 8 + i * 14);
      });

      /* —— 底部:部件链 —— */
      var boxes = [
        ["悬锤", "摆幅 33° · v 2.64"], ["撞楔", "每击进 0.03 ×3"], ["榨板垫木", "随楔前压"],
        ["麹饼束", "草裹 ×7 · 压缩 18%"], ["油槽渗出", "饼底渗油"], ["油盘", "油面渐涨"]
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
      '<h4>榨体</h4><table>' +
      '<tr><th>榨框</th><td>双立柱 0.30 × 0.56 · 高 1.15 m</td><td>承楔口在 +x</td></tr>' +
      '<tr><th>麹饼束</th><td>草裹饼 ×7 · 束 0.70 × 0.50</td><td>压缩 18%</td></tr>' +
      '<tr><th>撞楔</th><td>长 0.62 m · 每击进 0.03 ×3</td><td>累计 0.09</td></tr>' +
      '</table><h4>悬锤</h4><table>' +
      '<tr><th>枢</th><td>(1.35, 2.00) · 臂 L = 1.45 m</td><td>摆幅 0.58 rad(33°)</td></tr>' +
      '<tr><th>锤速</th><td>v = L·φ̇max = 1.45×0.58×π</td><td>2.64 m/s</td></tr>' +
      '<tr><th>周期</th><td>2.0 s/击 · 3 击撞楔</td><td>此后保压空摆</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>锤速:v = L·φ̇max = 1.45 × 0.58 × π = 2.64 m/s ∈ (2,4) —— 载入期断言。</p>' +
      '<p>压缩率:楔进 0.09 / 饼厚 0.50 = 18% ∈ (0.1,0.3);锤面-楔尾最小间隙 = 0.045 ≥ 0.02(不穿模断言)。</p>' +
      '<p>运行期 errPos = 锤头世界位置 vs 解析(pivot + L·sinφ)≈ 0;油面随压缩抬升。</p>' +
      '<h4>文献</h4>' +
      '<p>《天工开物·膏液》:「撞楔既进,则油自隙流出」——悬锤撞楔、楔进板压的重力压榨机构,油自饼底渗出入盘。</p>'
  };
})(window.MECH = window.MECH || {});
