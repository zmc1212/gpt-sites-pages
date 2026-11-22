/* 图纸面板(B 键):权衡总图 — 杆秤原理侧视 + 读数原理 + 传动链 */
(function (MECH) {
  var ink = "#2A2620", faint = "rgba(42,38,32,0.35)", red = "#8C2F1E";

  function arrow(ctx, x1, y1, x2, y2, text, below) {
    ctx.strokeStyle = faint; ctx.fillStyle = faint; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    var s = 4, dir = x2 >= x1 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * dir, y2 - 3); ctx.lineTo(x2 - s * dir, y2 + 3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + s * dir, y1 - 3); ctx.lineTo(x1 + s * dir, y1 + 3); ctx.closePath(); ctx.fill();
    if (text) {
      ctx.font = "600 10px Menlo, monospace"; ctx.textAlign = "center";
      ctx.fillText(text, (x1 + x2) / 2, below ? (y1 + 13) : (y1 - 5));
    }
  }

  MECH.BP = {
    no: "Fig. 14 · 复原总图",
    title: "权衡 · 《墨经》不等臂杠杆(本短标长)",
    src: "《墨子·经说下》+ 长沙左家公山楚墓天平环权(杆 27cm) · 演示件放大 2.2 倍",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainH = 46, chainY = h - chainH - 12, topY = 36;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.4;

      ctx.fillStyle = red; ctx.font = "700 11px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("平衡:x* = (W物+W盘)·L本 / W权 · 等臂(纽居中):W物 = W权 · 杆秤(本短标长):x* 比例放大读数", w * 0.03, topY - 12);

      /* ============ 左:杆秤原理侧视 ============ */
      var svL = w * 0.03, svR = w * 0.50;
      var S = Math.min((svR - svL - 14) / 0.75, (chainY - topY - 30) / 0.55);
      var ox = svL + 30, oy = chainY - 22;
      var X = function (m) { return ox + (m + 0.30) * S; };
      var Y = function (m) { return oy - (m - 0.95) * S; };
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText("杆秤原理(纽偏左,本短标长)", svL, topY + 12);
      /* 提纽 + 绳 */
      ctx.beginPath(); ctx.moveTo(X(-0.14), Y(0.95) - 0.16 * S); ctx.lineTo(X(-0.14), Y(0.95)); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(-0.14), Y(0.95), 3, 0, Math.PI * 2); ctx.fill();
      /* 衡杆(水平) */
      ctx.beginPath(); ctx.moveTo(X(0), Y(0.95)); ctx.lineTo(X(0.60), Y(0.95)); ctx.stroke();
      /* 刻度 */
      for (var i = 0; i <= 13; i++) {
        var x = 0.14 + i * 0.02;
        ctx.beginPath(); ctx.moveTo(X(x), Y(0.95) - (i % 5 === 0 ? 7 : 4)); ctx.lineTo(X(x), Y(0.95)); ctx.stroke();
      }
      /* 物盘(本端) */
      ctx.beginPath(); ctx.moveTo(X(0), Y(0.95)); ctx.lineTo(X(0), Y(0.95) + 0.30 * S * 0.9); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(0), Y(0.95) + 0.32 * S * 0.9, 8, 0, Math.PI * 2); ctx.stroke();
      /* 权(标臂某位) */
      var qx = X(0.44);
      ctx.beginPath(); ctx.arc(qx, Y(0.95), 7, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("物盘(本端 L本 0.14)", X(0) - 10, Y(0.95) + 0.36 * S * 0.9 + 8);
      ctx.fillText("权 W 62.5g 滑动", qx - 14, Y(0.95) - 12);
      ctx.fillText("提纽(支点)", X(-0.14) - 6, Y(0.95) - 0.20 * S);
      /* 平衡式标注 */
      ctx.fillText("x* = (W物+W盘)·L本/W权", X(0.20), Y(0.72));
      /* 尺寸 */
      arrow(ctx, X(-0.14), Y(1.02), X(0), Y(1.02), "本 0.14m", false);
      arrow(ctx, X(-0.14), Y(0.90), X(0.60), Y(0.90), "标 0.46m", true);
      ctx.fillText("杆长 0.60m(演示放大,文献 0.27)", X(-0.30), Y(0.62));

      /* ============ 右:等臂天平 + 环权 ============ */
      var tvL = w * 0.53, tvR = w * 0.98;
      var cx2 = tvL + 60, cy2 = topY + 40;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("等臂验证(纽居中)", tvL, topY + 12);
      ctx.beginPath(); ctx.moveTo(cx2, cy2 - 12); ctx.lineTo(cx2, cy2 + 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx2 - 0.14 * 60, cy2); ctx.lineTo(cx2 + 0.14 * 60, cy2); ctx.stroke();
      [-0.14, 0.14].forEach(function (dx) {
        ctx.beginPath(); ctx.moveTo(cx2 + dx * 60, cy2); ctx.lineTo(cx2 + dx * 60, cy2 + 16); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx2 + dx * 60, cy2 + 20, 8, 0, Math.PI * 2); ctx.stroke();
      });
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif";
      ctx.fillText("等臂:W物 = W权", cx2 - 40, cy2 + 36);
      /* 环权排布 */
      var wx = tvL + 130;
      ctx.strokeStyle = ink;
      D.weights.forEach(function (wt, i) {
        var r = 4 + i * 1.5;
        ctx.beginPath(); ctx.arc(wx + i * 22, cy2 + 6, r, 0, Math.PI * 2); ctx.stroke();
      });
      ctx.fillText("环权:一斤 250 · 半斤 125 · 四两 62.5 · 二两 31.3 · 一两 15.6 (g)", tvL + 40, cy2 + 30);
      ctx.fillText("「两加焉,重相若,则标必下,标得权也」", tvL + 40, cy2 + 44);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["物入本盘", "盘自重计入"], ["提纽支点", "居中/偏左 两档"],
        ["权滑标臂", "W权 62.5g"], ["力矩平衡", "W物L本 = W权L标"],
        ["梁水平", "θ → 0 判平衡"], ["刻度读数", "x* 比例放大"]
      ];
      var bwid = (w * 0.94) / boxes.length;
      for (var b = 0; b < boxes.length; b++) {
        var bx = w * 0.03 + b * bwid;
        ctx.strokeStyle = ink;
        ctx.strokeRect(bx, chainY, bwid - 10, chainH);
        ctx.fillStyle = ink; ctx.font = "700 10px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(boxes[b][0], bx + (bwid - 10) / 2, chainY + 17);
        ctx.font = "600 8.5px Menlo, monospace"; ctx.fillStyle = faint;
        ctx.fillText(boxes[b][1], bx + (bwid - 10) / 2, chainY + 32);
        if (b < boxes.length - 1) {
          ctx.beginPath(); ctx.moveTo(bx + bwid - 10, chainY + 20); ctx.lineTo(bx + bwid - 2, chainY + 20); ctx.stroke();
        }
      }
    },
    table:
      '<h4>部件尺寸(文献值+演示放大)</h4><table>' +
      '<tr><th>衡杆</th><td>左家公山 0.27m · 演示放大 2.2 倍</td><td>0.60 m</td></tr>' +
      '<tr><th>提纽</th><td>两档:居中(等臂)/ 距本端 0.14(杆秤)</td><td>—</td></tr>' +
      '<tr><th>物盘</th><td>铜盘径 4cm(文献)· 自重 30g(演示)</td><td>—</td></tr>' +
      '<tr><th>权</th><td>演示权 62.5g(四两)</td><td>—</td></tr>' +
      '<tr><th>环权</th><td>九枚 一铢至一斤(250/125/62.5/31.3/15.6g 演示)</td><td>—</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>平衡滑位:x* = (W物+W盘)·L本/W权(载入断言序列单调);等臂模式(纽居中)W物 = W权。</p>' +
      '<p>梁动力:θ̈ 由净力矩驱动,阻尼收敛;「权重相若也相衡,则本短标长」(载入断言几何)。</p>' +
      '<p>力矩逐帧积分校验(maxErr&lt;1e-9);读数 = W权·L标/L本 随权位线性(断言)。</p>' +
      '<h4>文献</h4>' +
      '<p>《墨子·经说下》:「衡:加重于其一旁,必捶,权重相若也,相衡,则本短标长。两加焉,重相若,则标必下,标得权也。」</p>' +
      '<p>「衡,加重于其一旁,必捶——权重相若也相衡」(《经下》)。出土:左家公山 M15 战国晚期天平环权。</p>'
  };
})(window.MECH = window.MECH || {});
