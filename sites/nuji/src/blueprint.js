/* 图纸面板(B 键):弩机总图 — 郭剖面(核心)+ 侧视 + 传动链 */
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
    no: "Fig. 09 · 复原总图",
    title: "弩机 · 青铜触发机构(汉制,镇原/满城型)",
    src: "《释名·释兵》+ 镇原东汉弩机(郭14.2 悬刀9 望山6.6cm)+ 满城错金银弩机",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainH = 46, chainY = h - chainH - 12, topY = 36;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.4;

      ctx.fillStyle = red; ctx.font = "700 11px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("联动 k = θ牙/θ悬刀 = L悬/L牙 = 0.045/0.030 = 1.5 · E弦 = ½Fx = ½×1774×0.16 = 142J · v箭 = √(2E/m) = 75.4m/s", w * 0.03, topY - 12);

      /* ============ 左:郭剖面放大(核心机构) ============ */
      var svL = w * 0.03, svR = w * 0.50;
      var S = Math.min((svR - svL - 10) / 0.22, (chainY - topY - 30) / 0.20);
      var ox = svL + 30, oy = chainY - 20;
      var X = function (m) { return ox + (m + 0.10) * S; };
      var Y = function (m) { return oy - (m - 0.42) * S; };
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText("郭剖面(放大,西弦东箭)", svL, topY + 12);
      /* 郭轮廓 */
      ctx.strokeRect(X(-0.085), Y(0.42 - 0.02), 0.19 * S, 0.09 * S);
      /* 牙(绕上键) */
      ctx.beginPath(); ctx.arc(X(0.028), Y(0.45), 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(X(0.028), Y(0.45)); ctx.lineTo(X(0.028) - 5, Y(0.45) + 0.05 * S * 0.7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(0.028), Y(0.45)); ctx.lineTo(X(0.028) + 0.02 * S, Y(0.45) + 0.03 * S); ctx.stroke();
      /* 悬刀(绕下键,下垂) */
      ctx.beginPath(); ctx.arc(X(0.0), Y(0.414), 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(X(0.0), Y(0.414)); ctx.lineTo(X(0.0) + 3, Y(0.414) - 0.07 * S * 0.55); ctx.stroke();
      /* 牛(斜连) */
      ctx.beginPath(); ctx.moveTo(X(0.018), Y(0.442)); ctx.lineTo(X(0.003), Y(0.418)); ctx.stroke();
      /* 望山 */
      ctx.strokeRect(X(0.062), Y(0.475), 5, 0.066 * S);
      for (var i = 1; i <= 6; i++) {
        ctx.beginPath(); ctx.moveTo(X(0.062), Y(0.475) - i * D.gradH * S * 0.55); ctx.lineTo(X(0.062) + 10, Y(0.475) - i * D.gradH * S * 0.55); ctx.stroke();
      }
      /* 弦(挂牙)+ 箭槽 */
      ctx.strokeStyle = "rgba(120,100,60,0.9)";
      ctx.beginPath(); ctx.moveTo(X(-0.085), Y(0.452)); ctx.lineTo(X(0.026), Y(0.458)); ctx.stroke();
      ctx.strokeStyle = ink;
      ctx.strokeRect(X(-0.02), Y(0.462), 0.16 * S, 4);
      /* 木臂 */
      ctx.strokeRect(X(-0.10), Y(0.36), 0.30 * S, 0.05 * S);
      /* 标注 */
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("牙(钩弦,上键)", X(0.028) + 6, Y(0.45) - 2);
      ctx.fillText("牛(联动件)", X(-0.055), Y(0.435));
      ctx.fillText("悬刀(下键,形然也)", X(0.008), Y(0.36));
      ctx.fillText("望山 6 刻度", X(0.075), Y(0.50));
      ctx.fillText("弦", X(-0.083), Y(0.452) - 6);
      /* 尺寸 */
      arrow(ctx, X(-0.071), Y(0.535), X(0.071), Y(0.535), "郭长 14.2cm", false);
      arrow(ctx, X(0.096), Y(0.36), X(0.096), Y(0.475), "郭高 7.6cm", false);

      /* ============ 右:整机侧视(木臂-弓-箭道) ============ */
      var tvL = w * 0.53, tvR = w * 0.98;
      var S2 = Math.min((tvR - tvL - 12) / 1.4, (chainY - topY - 44) / 0.9);
      var ox2 = tvL + 10, oy2 = chainY - 20;
      var X2 = function (m) { return ox2 + (m + 0.60) * S2; };
      var Y2 = function (m) { return oy2 - (m - 0.42) * S2; };
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("整机侧视(弓-臂-郭)", tvL, topY + 12);
      ctx.beginPath(); ctx.moveTo(X2(-0.60), Y2(0)); ctx.lineTo(X2(0.8), Y2(0)); ctx.stroke();
      /* 木臂 */
      ctx.strokeRect(X2(-0.30), Y2(0.36), 0.60 * S2, 0.05 * S2);
      /* 弓弧 */
      ctx.beginPath(); ctx.arc(X2(-0.42), Y2(0.44), D.bowR * S2, -1.25, 1.25, true); ctx.stroke();
      /* 弦(挂牙) */
      ctx.beginPath(); ctx.moveTo(X2(-0.42) + D.bowR * S2 * Math.cos(1.25), Y2(0.44) - D.bowR * S2 * Math.sin(1.25));
      ctx.lineTo(X2(0.16), Y2(0.44)); ctx.lineTo(X2(-0.42) + D.bowR * S2 * Math.cos(1.25), Y2(0.44) + D.bowR * S2 * Math.sin(1.25));
      ctx.stroke();
      /* 郭 + 箭 */
      ctx.strokeRect(X2(-0.02), Y2(0.40), 0.19 * S2, 0.05 * S2);
      ctx.strokeRect(X2(-0.10), Y2(0.445), 0.28 * S2, 3);
      /* 落点(远端压缩) */
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(X2(0.16), Y2(0.44)); ctx.lineTo(X2(0.72), Y2(0.30)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(X2(0.72), Y2(0.30), 4, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("弓(六石) · 弦挂牙 · 箭槽", tvL + 4, chainY - 22);
      ctx.fillText("弹道(压缩 20:1)· 落点 R 580m", tvL + 4, chainY - 10);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["拉悬刀", "θ悬 0→0.42rad"], ["牛传动", "k = L悬/L牙 = 1.5"],
        ["牙下旋脱弦", "弦回弹 F 1774N"], ["箭出 v75", "E=½Fx=142J"],
        ["望山瞄准", "6 格 · 每格 Δθ 8.8°"], ["理想射程", "R = v²/g = 580m"]
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
      '<h4>部件尺寸(出土实测)</h4><table>' +
      '<tr><th>郭</th><td>青铜机匣 · 镇原东汉 14.2cm / 满城 12.1cm</td><td>0.142 m</td></tr>' +
      '<tr><th>悬刀</th><td>镇原 9cm</td><td>L悬 = 0.045 m</td></tr>' +
      '<tr><th>望山</th><td>镇原 6.6cm · 满城错金银刻度</td><td>6 格 × 8mm</td></tr>' +
      '<tr><th>牙</th><td>钩弦件 · L牙 3cm(联动几何推算)</td><td>k = 1.5</td></tr>' +
      '<tr><th>弩力</th><td>六石 ≈ 181kgf(居延汉简弩力序列)</td><td>F = 1774 N</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>联动:θ牙 = −(L悬/L牙)·θ悬刀 = −1.5·θ悬刀(销轴杠杆,载入断言)。</p>' +
      '<p>储能:E = ½Fx = ½×1774×0.16 = 142 J(断言);箭速 v = √(2E/m) = 75.4 m/s(m 50g,断言)。</p>' +
      '<p>理想射程 R = v²sin2θ/g,45° 极大 580m(研究推算 167-278m 有效,演示压缩 20:1)。</p>' +
      '<p>望山:每格 Δh 8mm → Δθ ≈ 8.8°(抛射瞄具说为主流结论之一)。</p>' +
      '<h4>文献</h4>' +
      '<p>《释名·释兵》:「其柄曰臂,似人臂也。钩弦者曰牙,似齿牙也。牙外曰郭,为牙之规郭也。下曰悬刀,其形然也。含括之口曰机,言如机之巧也。」</p>' +
      '<p>《吴越春秋》陈音:「弩生于弓,弓生于弹……横弓著臂,施机设枢,加之以力。」</p>'
  };
})(window.MECH = window.MECH || {});
