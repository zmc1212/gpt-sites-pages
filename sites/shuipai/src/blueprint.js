/* 图纸面板(B 键):水排侧视总图 + 曲柄滑块详图 + 公式 + 尺寸表 */
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
    no: "Fig. 10 · 复原总图",
    title: "水排 · 立轮曲柄连杆 · 门式风箱",
    src: "王祯《农书》水排图 · 东汉杜诗(31 AD)发明水力鼓风",
    draw: function (ctx, w, h) {
      var D = MECH.DIM;
      ctx.clearRect(0, 0, w, h);
      var chainH = 44, chainY = h - chainH - 12, topY = 34;
      var ink = "#2A2620";
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("滑块 x = r·cosφ + √(l² − r²sin²φ) · 行程 = 2r = 0.48 · λ = r/l = 0.26", w * 0.045, topY - 10);

      /* ============ 左:侧视图 ============ */
      var S = Math.min(w * 0.44 / 5.4, (chainY - topY - 26) / 3.2);
      var ox = w * 0.05, oy = chainY - 16;
      var X = function (m) { return ox + (m + 3.2) * S; }, Y = function (m) { return oy - m * S; };
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = 1.4;
      ctx.font = "700 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE", ox, Y(3.0));
      /* 水面 */
      ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(X(-3.2), Y(D.waterY)); ctx.lineTo(X(-0.6), Y(D.waterY)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "600 9px sans-serif";
      ctx.fillText("水流 →", X(-3.1), Y(D.waterY - 0.12));
      /* 立轮 */
      ctx.beginPath(); ctx.arc(X(0), Y(D.yC), D.R * S, 0, Math.PI * 2); ctx.stroke();
      for (var i = 0; i < 10; i++) {
        var a = i / 10 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(X(0), Y(D.yC));
        ctx.lineTo(X(0) + Math.cos(a) * D.R * S, Y(D.yC) - Math.sin(a) * D.R * S);
        ctx.stroke();
      }
      /* 轴 + 曲柄销 + 连杆 + 滑块(示意位) */
      ctx.beginPath(); ctx.moveTo(X(0), Y(D.yC)); ctx.lineTo(X(1.4), Y(D.yC)); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(0.9), Y(D.yC - D.r * 0.7), 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(X(0.9), Y(D.yC - D.r * 0.7)); ctx.lineTo(X(0.15), Y(D.yC - 0.34)); ctx.stroke();
      ctx.strokeRect(X(0.1) - 4, Y(D.yC - 0.34) - 3, 9, 6);
      /* 导轨 → 风箱 */
      ctx.strokeRect(X(-0.2), Y(D.yC - 0.34) - 2, 0.6 * S, 5);
      ctx.strokeRect(X(0.55), Y(D.yC - 0.34) - D.boxH / 2 * S, D.boxW * S, D.boxH * S);
      ctx.fillText("门式风箱", X(0.62), Y(D.yC - 0.34) - D.boxH / 2 * S - 4);
      /* 冶炉 */
      ctx.beginPath(); ctx.arc(X(1.75), Y(0.28), 0.3 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.fillText("冶炉", X(1.75) - 10, Y(0.75));
      /* 风道 */
      ctx.beginPath(); ctx.moveTo(X(0.55 + D.boxW), Y(D.yC - 0.34 - 0.06)); ctx.lineTo(X(1.75), Y(D.yC - 0.34 - 0.06)); ctx.stroke();
      /* 尺寸 */
      arrow(ctx, X(0) - D.R * S, Y(-0.1), X(0) + D.R * S, Y(-0.1), "轮径 2.8m", true);
      arrow(ctx, X(0.9), Y(D.yC + 0.45), X(0.15), Y(D.yC + 0.45), "连杆 0.92", false);

      /* ============ 右:曲柄滑块详图 ============ */
      var ox2 = w * 0.55;
      ctx.font = "700 11px sans-serif";
      ctx.fillStyle = ink;
      ctx.fillText("曲柄滑块 SLIDER-CRANK", ox2, topY + 18);
      var gx = ox2, gy = topY + 32, gw = w - ox2 - 24, gh = chainY - gy - 44;
      ctx.strokeStyle = "rgba(42,38,32,0.5)";
      ctx.strokeRect(gx, gy, gw, gh);
      var ccx = gx + gw * 0.36, ccy = gy + gh * 0.72, S2 = gw * 0.20 / D.r;
      /* 曲柄圆 */
      ctx.beginPath(); ctx.arc(ccx, ccy, D.r * S2, 0, Math.PI * 2); ctx.stroke();
      /* 死点区间 */
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(ccx - (D.l + D.r) * S2 * 0.8, ccy); ctx.lineTo(ccx + (D.l + D.r) * S2 * 0.8, ccy); ctx.stroke();
      ctx.setLineDash([]);
      /* 曲柄+连杆+滑块 */
      ctx.beginPath(); ctx.moveTo(ccx, ccy); ctx.lineTo(ccx + D.r * S2 * 0.7, ccy - D.r * S2 * 0.7); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ccx + D.r * S2 * 0.7, ccy - D.r * S2 * 0.7);
      ctx.lineTo(ccx + (D.r * S2 * 0.7) - (D.l * S2 * 0.8), ccy);
      ctx.stroke();
      ctx.strokeRect(ccx + (D.r * S2 * 0.7) - (D.l * S2 * 0.8) - 4, ccy - 5, 9, 9);
      ctx.font = "600 9px sans-serif";
      ctx.fillStyle = "rgba(42,38,32,0.6)";
      ctx.fillText("曲柄 r", ccx + D.r * S2 * 0.35, ccy - D.r * S2 * 0.55);
      ctx.fillText("连杆 l", ccx - D.l * S2 * 0.42, ccy - 8);
      ctx.fillText("滑块", ccx - D.l * S2 * 0.8 - 4, ccy + 18);
      ctx.fillStyle = red;
      ctx.font = "700 10px Menlo, monospace";
      ctx.fillText("λ = r/l = 0.26 → 近匀速往复", gx + 8, gy + gh - 8);

      /* ============ 底部:参数链 ============ */
      var boxes = [
        ["水流冲轮", "R 1.4 · 立轮"], ["曲柄销", "r 0.24 · 轴端"],
        ["连杆", "l 0.92 · λ 0.26"], ["滑块", "行程 2r = 0.48"],
        ["门式风箱", "双扇开合"], ["冶炉鼓风", "水力助冶"]
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
      '<h4>轮与传动</h4><table>' +
      '<tr><th>立轮</th><td>R 1.3~1.4 · 10 辐 8 叶</td><td>径 2.8 m</td></tr>' +
      '<tr><th>碓轴/曲柄轴</th><td>轴端曲柄盘</td><td>r = 0.24 m</td></tr>' +
      '<tr><th>连杆</th><td>l = 0.92 · λ = r/l = 0.26</td><td>—</td></tr>' +
      '<tr><th>滑块行程</th><td>2r(死点间)</td><td>0.48 m</td></tr>' +
      '</table><h4>风箱与冶炉</h4><table>' +
      '<tr><th>门式风箱</th><td>双扇门 · 开角 0..32°</td><td>0.9×0.62 m</td></tr>' +
      '<tr><th>节奏</th><td>每周(2π)一鼓风 · ω=0.9/1.7</td><td>8.6/16.2 RPM</td></tr>' +
      '<tr><th>滑块公式</th><td>x = r·cosφ + √(l²−r²sin²φ)</td><td>逐帧断言</td></tr>' +
      '</table><h4>运行期自检</h4>' +
      '<p>载入即模拟 10s:滑块位移与闭式公式逐帧比较(误差 < 1e-9)、行程 = 2r、每周恰好一次鼓风,否则拒绝启动。</p>' +
      '<h4>文献</h4>' +
      '<p>《后汉书·杜诗传》:建武七年迁南阳太守,「造作水排,铸为农器,用力少,见功多」。</p>' +
      '<p>王祯《农书》水排图:「其制,当选湍流之侧,架木立轴……排即前监? 以薄板为风箱扇」——本站取曲柄连杆滑块方案演示。</p>'
  };
})(window.MECH = window.MECH || {});
