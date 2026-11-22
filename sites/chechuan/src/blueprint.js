/* 图纸面板(B 键):车船复原侧视总图 + 传动链 + 尺寸表。 */
(function (MECH) {
  var ink = "#2A2620", faint = "rgba(42,38,32,0.38)", faint2 = "rgba(42,38,32,0.22)";
  var waterC = "#3E6E86", woodC = "#6E4E28", red = "#8C2F1E";
  var KS = MECH.KS;

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
    no: "Fig. 18 · 复原总图",
    title: "车船 · 双明轮踏行战舰(唐·李皋)",
    src: "《旧唐书·李皋传》「挟二轮蹈之,翔风鼓浪,疾若挂帆席」 · 尺寸按本站复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainY = h - 70, topY = 30;

      /* —— 公式横幅 —— */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("不滑移船速 v = ω·r = 0.9 × 0.55 = 0.495 m/s   ·   踏板行程 2r = 0.24m   ·   链同径 i=1   ·   明轮浸深 0.05m", w * 0.03, topY - 8);

      /* —— 左:侧视图 —— */
      var ox = w * 0.03, oRight = w * 0.55, regionH = chainY - topY - 26;
      var S = Math.min((oRight - ox - 16) / 4.0, (regionH - 12) / 2.3);
      var oy = topY + regionH - 0.75 * S;
      function X(m) { return ox + 0.5 * S + (m + 1.7) * S; }
      function Y(m) { return oy - m * S; }
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(船首 → 右)", ox, topY + 10);
      /* 水面 */
      ctx.strokeStyle = waterC; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(X(-1.9), Y(D.waterY)); ctx.lineTo(X(2.2), Y(D.waterY)); ctx.stroke();
      ctx.strokeStyle = ink; ctx.lineWidth = 1.3;
      /* 船体 */
      ctx.strokeRect(X(-1.3), Y(0.12), 2.6 * S, 0.42 * S);
      ctx.beginPath(); ctx.moveTo(X(1.3), Y(0.54)); ctx.lineTo(X(1.52), Y(0.72)); ctx.stroke();
      /* 舱棚 + 桅 */
      ctx.strokeRect(X(-1.05), Y(0.54), 0.80 * S, 0.42 * S);
      ctx.beginPath(); ctx.moveTo(X(0.55), Y(0.54)); ctx.lineTo(X(0.55), Y(1.75)); ctx.stroke();
      /* 双明轮(实线 ψ 当前,虚线参照) */
      ctx.beginPath(); ctx.arc(X(0), Y(D.wheelY), D.rWheel * S, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = faint;
      ctx.beginPath(); ctx.arc(X(0), Y(D.wheelY), (D.rWheel - 0.06) * S, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = ink;
      /* 踏轴 + 曲柄 */
      ctx.beginPath(); ctx.arc(X(D.treadX), Y(D.treadY), 0.12 * S, 0, Math.PI * 2); ctx.stroke();
      /* 链线 */
      ctx.strokeStyle = faint;
      ctx.beginPath(); ctx.moveTo(X(D.treadX), Y(D.treadY + D.sprocketR)); ctx.lineTo(X(0), Y(D.wheelY + D.sprocketR)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(D.treadX), Y(D.treadY - D.sprocketR)); ctx.lineTo(X(0), Y(D.wheelY - D.sprocketR)); ctx.stroke();
      ctx.strokeStyle = ink;
      /* 尺寸 */
      arrowV(ctx, X(0.62), Y(D.wheelY - D.rWheel), Y(D.waterY), "浸深 0.05", 1);
      arrowH(ctx, X(-1.3), X(1.3), Y(0) + 12, "船长 2.60 m", true);
      arrowV(ctx, X(-1.72), Y(D.waterY), Y(D.wheelY + D.rWheel), "轮径 1.10", -1);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("实线 轮辋 + 8 桨 · 虚线 桨尖圆 · 水面 y 0.12", ox, chainY - 14);

      /* —— 右:传动链 —— */
      var rx = w * 0.585, rw = w - rx - 14;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("传动链", rx, topY + 12);
      var boxes = [
        ["踏板 ×4(双曲柄 180°)", "行程 0.24m"],
        ["踏板轴", "ω踏 = 脚踏节奏"],
        ["链轮 ×2 同径 i=1", "链直联"],
        ["明轮 ×2", "ω轮 = ω踏 · 8 桨击水"]
      ];
      var gy0 = topY + 26;
      boxes.forEach(function (b, i) {
        var y = gy0 + i * 24;
        ctx.strokeStyle = ink; ctx.lineWidth = 1.1;
        ctx.strokeRect(rx, y, rw, 18);
        ctx.fillStyle = ink;
        ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
        ctx.fillText(b[0], rx + 6, y + 12);
        ctx.fillStyle = faint;
        ctx.font = "600 8px Menlo, monospace"; ctx.textAlign = "right";
        ctx.fillText(b[1], rx + rw - 6, y + 12);
        if (i < boxes.length - 1) {
          ctx.beginPath(); ctx.moveTo(rx + rw / 2, y + 18); ctx.lineTo(rx + rw / 2, y + 24); ctx.stroke();
        }
      });

      /* —— 右下:航速 —— */
      var by2 = gy0 + 104;
      ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.font = "700 11px sans-serif";
      ctx.fillText("不滑移航速", rx, by2 - 6);
      ctx.strokeStyle = waterC; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(rx, by2 + 12); ctx.lineTo(rx + rw * 0.72, by2 + 12); ctx.stroke();
      ctx.fillStyle = ink;
      ctx.font = "600 9px Menlo, monospace";
      ctx.fillText("v = ω·r = 0.9 × 0.55 = 0.495 m/s", rx, by2 + 26);

      /* —— 底部:部件链 —— */
      var boxes2 = [
        ["船体", "长 2.6m 浮水面"], ["舱棚桅杆", "帅旗扑动"], ["明轮 ×2", "r 0.55 · 8 桨"],
        ["踏板轴", "双曲柄 180°"], ["链传动", "同径 i=1"], ["帅旗", "翔风鼓浪"]
      ];
      var bwid = (w * 0.94) / boxes2.length;
      for (var b = 0; b < boxes2.length; b++) {
        var bx2 = w * 0.03 + b * bwid;
        ctx.strokeStyle = ink; ctx.lineWidth = 1.2;
        ctx.strokeRect(bx2, chainY, bwid - 10, 50);
        ctx.fillStyle = ink;
        ctx.font = "700 9.5px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(boxes2[b][0], bx2 + (bwid - 10) / 2, chainY + 19);
        ctx.font = "600 8px Menlo, monospace";
        ctx.fillStyle = faint;
        ctx.fillText(boxes2[b][1], bx2 + (bwid - 10) / 2, chainY + 34);
        if (b < boxes2.length - 1) {
          ctx.beginPath();
          ctx.moveTo(bx2 + bwid - 10, chainY + 24);
          ctx.lineTo(bx2 + bwid - 2, chainY + 24);
          ctx.stroke();
        }
      }
    },
    table:
      '<h4>船体</h4><table>' +
      '<tr><th>船体</th><td>长 2.60 m · 舷板 + 甲板</td><td>浮水面 y 0.12</td></tr>' +
      '<tr><th>舱棚桅杆</th><td>舱棚 0.80×0.42 · 桅高 1.30</td><td>帅旗扑动</td></tr>' +
      '</table><h4>明轮与传动</h4><table>' +
      '<tr><th>明轮 ×2</th><td>r 0.55 m · 8 桨 · 浸深 0.05 m</td><td>轴高 0.62</td></tr>' +
      '<tr><th>踏板轴</th><td>双曲柄 180° 反相 · r 0.12</td><td>行程 0.24 m</td></tr>' +
      '<tr><th>链传动</th><td>同径链轮 r 0.10 · i = 1</td><td>链直联</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>不滑移航速 v = ω·r = 0.9 × 0.55 = 0.495 m/s ∈ (0.4, 0.6) —— 载入期断言。</p>' +
      '<p>浸深 = 水面 − 轮缘底 = 0.12 − 0.07 = 0.05(严格断言);踏板行程 0.24(严格断言)。</p>' +
      '<p>运行期 errPos = 明轮桨尖世界位置 vs 解析(root.x + R·cos/sin ψ)≈ 0 —— 船体平移与轮转合成端到端验证。</p>' +
      '<h4>文献</h4>' +
      '<p>《旧唐书·李皋传》:「常运心巧思为战舰,挟二轮蹈之,翔风鼓浪,疾若挂帆席」—— 中国最早的明轮船记载之一。</p>'
  };
})(window.MECH = window.MECH || {});
