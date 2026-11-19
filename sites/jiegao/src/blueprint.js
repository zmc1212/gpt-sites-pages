/* 图纸面板(B 键):桔槔复原侧视简图 + θ 范围图 + 力矩条图 + 部件链 + 尺寸表。
   分区:顶部公式横幅 / 左侧视(大)/ 右列(θ 弧 + 力矩条)/ 底部部件链,互不重叠。 */
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
    no: "Fig. 02 · 复原总图",
    title: "桔槔 · 配重杠杆汲水机(《庄子·天地》)",
    src: "《庄子·天地》子贡语「凿木为机,后重前轻,挈水若抽」· 尺寸按本站复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainY = h - 70, topY = 30;

      /* —— 公式横幅 —— */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("k = L长/L短 = 4.125/1.875 = 2.2   ·   T石 75.0 > T满 49.5 > T空 8.25 kg·m   ·   满罐自动上提 · 下压靠人力", w * 0.03, topY - 8);

      /* —— 左:侧视图 —— */
      var ox = w * 0.03, oRight = w * 0.565, regionH = chainY - topY - 26;
      var S = Math.min((oRight - ox - 16) / 9.4, (regionH - 6) / 8.9);
      var oy = topY + regionH - 3.6 * S;
      function X(m) { return ox + (m + 2.45) * S; }
      function Y(m) { return oy - m * S; }
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(井 · 水槽 → 右)", ox, topY + 10);
      ctx.beginPath(); ctx.moveTo(X(-2.4), Y(0)); ctx.lineTo(X(6.9), Y(0)); ctx.stroke();
      /* 井台 + 井栏 + 井池 + 水 */
      ctx.strokeRect(X(1.70), Y(0.18), 3.40 * S, 0.18 * S);
      ctx.fillRect(X(1.70), Y(0.18), 3.40 * S, 0.18 * S);
      ctx.strokeRect(X(D.wellCx - D.wellA - D.kerbT), Y(D.kerbTop), D.kerbT * S, (D.kerbTop - 0.18) * S);
      ctx.strokeRect(X(D.wellCx + D.wellA), Y(D.kerbTop), D.kerbT * S, (D.kerbTop - 0.18) * S);
      ctx.strokeStyle = faint2;
      ctx.strokeRect(X(D.wellCx - D.wellA), Y(D.poolFloor), 2 * D.wellA * S, (D.waterY - D.poolFloor) * S);
      ctx.fillStyle = "rgba(62,110,134,0.28)";
      ctx.fillRect(X(D.wellCx - D.wellA), Y(D.waterY), 2 * D.wellA * S, (D.waterY - D.poolFloor) * S);
      ctx.strokeStyle = waterC; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(X(D.wellCx - D.wellA), Y(D.waterY)); ctx.lineTo(X(D.wellCx + D.wellA), Y(D.waterY)); ctx.stroke();
      ctx.strokeStyle = ink; ctx.lineWidth = 1.3;
      /* 立柱 + 斜撑 + 枢轴 */
      ctx.strokeRect(X(-0.23), Y(0.25), 0.46 * S, 0.25 * S);
      ctx.strokeRect(X(-0.09), Y(D.postTop), 0.18 * S, D.postH * S);
      ctx.beginPath(); ctx.moveTo(X(1.05), Y(0)); ctx.lineTo(X(0.1), Y(2.45)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(-1.05), Y(0)); ctx.lineTo(X(-0.1), Y(2.45)); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(0), Y(D.pivotY), 0.09 * S, 0, Math.PI * 2); ctx.stroke();
      /* 横杆两态:实线高位 −24°,虚线下压 +52° */
      function leverLine(thDeg, dash) {
        var t = thDeg * Math.PI / 180;
        var sx = -D.Ls * Math.cos(t), sy = D.pivotY + D.Ls * Math.sin(t);
        var lx = D.Ll * Math.cos(t), ly = D.pivotY - D.Ll * Math.sin(t);
        ctx.setLineDash(dash ? [5, 4] : []);
        ctx.strokeStyle = dash ? faint : ink;
        ctx.lineWidth = dash ? 1.4 : 2.4;
        ctx.beginPath(); ctx.moveTo(X(sx), Y(sy)); ctx.lineTo(X(lx), Y(ly)); ctx.stroke();
        ctx.setLineDash([]);
      }
      leverLine(D.thetaPress, true);
      leverLine(D.thetaHigh, false);
      /* 坠石与罐(高位实线 / 下压虚线) */
      function stoneSym(thDeg, dash) {
        var t = thDeg * Math.PI / 180;
        var sx = -D.Ls * Math.cos(t), sy = D.pivotY + D.Ls * Math.sin(t) - D.ropeStone - 0.26;
        ctx.setLineDash(dash ? [4, 3] : []);
        ctx.strokeStyle = dash ? faint : ink;
        ctx.beginPath(); ctx.moveTo(X(sx), Y(sy + 0.24)); ctx.lineTo(X(sx - 0.26), Y(sy - 0.22));
        ctx.lineTo(X(sx + 0.24), Y(sy - 0.24)); ctx.lineTo(X(sx + 0.27), Y(sy + 0.2)); ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
      }
      stoneSym(D.thetaPress, true);
      stoneSym(D.thetaHigh, false);
      function jugSym(thDeg, phiDeg, dash) {
        var t = thDeg * Math.PI / 180, a = phiDeg * Math.PI / 180;
        var tipx = D.Ll * Math.cos(t), tipy = D.pivotY - D.Ll * Math.sin(t);
        ctx.setLineDash(dash ? [4, 3] : []);
        ctx.strokeStyle = dash ? faint : ink;
        ctx.beginPath(); ctx.moveTo(X(tipx), Y(tipy));
        ctx.lineTo(X(tipx + D.ropeJug * Math.sin(a)), Y(tipy - D.ropeJug * Math.cos(a))); ctx.stroke();
        var cx2 = tipx + (D.ropeJug + 0.23) * Math.sin(a), cy2 = tipy - (D.ropeJug + 0.23) * Math.cos(a);
        ctx.strokeRect(X(cx2 - 0.17), Y(cy2 + 0.23), 0.34 * S, 0.46 * S);
        ctx.setLineDash([]);
      }
      jugSym(D.thetaPress, 0, true);
      jugSym(D.thetaHigh, 0, false);
      /* 水槽 */
      ctx.strokeRect(X(D.trCx - D.trHX), Y(D.trRim), 2 * D.trHX * S, D.trRim * S);
      ctx.strokeStyle = waterC;
      ctx.beginPath(); ctx.moveTo(X(D.trCx - D.trHX + 0.06), Y(D.trWater)); ctx.lineTo(X(D.trCx + D.trHX - 0.06), Y(D.trWater)); ctx.stroke();
      ctx.strokeStyle = ink;
      /* 尺寸标注 */
      var th2 = D.thetaHigh * Math.PI / 180;
      arrowH(ctx, X(0), X(D.Ll * Math.cos(th2)), Y(D.pivotY + D.Ll * Math.sin(th2)) - 14, "L长 4.125 m", true);
      arrowH(ctx, X(-D.Ls * Math.cos(th2)), X(0), Y(D.pivotY + D.Ls * Math.sin(th2)) - 14, "L短 1.875 m", true);
      arrowV(ctx, X(D.trCx + D.trHX + 0.35), Y(0.18), Y(D.kerbTop), "井栏高 1.12 m", 1);
      arrowV(ctx, X(-1.7), Y(0), Y(D.postTop), "柱高 3.30 m", -1);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("吊绳 1.6 m · 罐悬于长端端点下", X(D.Ll * Math.cos(th2)) + 8, Y(D.pivotY - 0.6));
      ctx.fillText("实线 高位态 θ=−24° · 虚线 下压态 θ=+" + D.thetaPress + "°", ox, chainY - 14);

      /* —— 右上:θ 范围弧 —— */
      var rx = w * 0.60, rw = w - rx - 14;
      var cx0 = rx + rw * 0.52, cy0 = topY + 96, R = Math.min(rw * 0.42, 74);
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("杠杆角 θ 范围", rx, topY + 12);
      ctx.strokeStyle = faint2; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx0 - R - 10, cy0); ctx.lineTo(cx0 + R + 10, cy0); ctx.stroke();
      ctx.strokeStyle = ink; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(cx0, cy0, R, -D.thetaPress * Math.PI / 180, -D.thetaHigh * Math.PI / 180, false); ctx.stroke();
      [-D.thetaPress, 0, -D.thetaHigh].forEach(function (a, i) {
        var rr = i === 1 ? R + 6 : R;
        ctx.beginPath();
        ctx.moveTo(cx0 + Math.cos(a) * (R - 6), cy0 + Math.sin(a) * (R - 6));
        ctx.lineTo(cx0 + Math.cos(a) * (rr + (i === 1 ? 4 : 0)), cy0 + Math.sin(a) * (rr + (i === 1 ? 4 : 0)));
        ctx.stroke();
      });
      ctx.fillStyle = ink; ctx.font = "600 9px Menlo, monospace"; ctx.textAlign = "center";
      ctx.fillText("+" + D.thetaPress + "° 下压", cx0 + Math.cos(-D.thetaPress * Math.PI / 180) * (R + 16), cy0 + Math.sin(-D.thetaPress * Math.PI / 180) * (R + 16) + 3);
      ctx.fillText("−24° 高位", cx0 + Math.cos(-D.thetaHigh * Math.PI / 180) * (R + 16), cy0 + Math.sin(-D.thetaHigh * Math.PI / 180) * (R + 16) + 3);
      ctx.fillStyle = faint;
      ctx.fillText("θ=0 水平", cx0, cy0 - R * 0.35);
      ctx.fillStyle = ink;
      ctx.fillText("行程 " + (D.thetaPress - D.thetaHigh).toFixed(1) + "°", cx0, cy0 + 16);

      /* —— 右下:力矩条图 —— */
      var by = cy0 + 44, bw = rw * 0.62, bx = rx + rw * 0.30;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("力矩天平 kg·m", rx, by - 10);
      var bars = [["T空 8.25", 8.25, faint], ["T满 49.50", 49.5, woodC], ["T石 75.00", 75.0, red]];
      bars.forEach(function (b, i) {
        var y = by + i * 17;
        ctx.fillStyle = b[2];
        ctx.fillRect(bx, y, b[1] / 75 * bw, 9);
        ctx.strokeStyle = ink; ctx.lineWidth = 0.8;
        ctx.strokeRect(bx, y, b[1] / 75 * bw, 9);
        ctx.fillStyle = ink;
        ctx.font = "600 8.5px Menlo, monospace"; ctx.textAlign = "right";
        ctx.fillText(b[0], bx - 6, y + 8);
      });
      ctx.fillStyle = red; ctx.textAlign = "left";
      ctx.font = "700 9px Menlo, monospace";
      ctx.fillText("T空 < T满 < T石 → 满罐可自动提起", bx - 58, by + 56);

      /* —— 底部:部件链 —— */
      var boxes = [
        ["坠石 40kg", "T石 75.0 kg·m"], ["短臂 1.875m", "绳垂 0.85m"], ["枢轴", "柱顶 · 高 3.24m"],
        ["长臂 4.125m", "支点偏置 k=2.2"], ["吊绳 1.6m + 柳条罐", "空 2kg → 满 12kg"], ["水槽", "摆出倾倒 · 波纹"]
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
      '<h4>杠杆尺寸</h4><table>' +
      '<tr><th>横木全长</th><td>支点偏置</td><td>6.000 m</td></tr>' +
      '<tr><th>短臂(坠石端)</th><td>坠石绳垂 0.85 m</td><td>L短 = 1.875 m</td></tr>' +
      '<tr><th>长臂(吊罐端)</th><td>吊绳 1.6 m · 罐自由竖悬</td><td>L长 = 4.125 m</td></tr>' +
      '<tr><th>杠杆比 k</th><td>L长 / L短</td><td>2.2(严格)</td></tr>' +
      '<tr><th>立柱 / 枢轴高</th><td>石础 + 铁箍 + 四斜撑</td><td>3.30 / 3.24 m</td></tr>' +
      '</table><h4>配重与载荷</h4><table>' +
      '<tr><th>坠石</th><td>T石 = 40 × 1.875</td><td>75.00 kg·m</td></tr>' +
      '<tr><th>柳条罐(空)</th><td>T空 = 2 × 4.125</td><td>8.25 kg·m</td></tr>' +
      '<tr><th>柳条罐(满)</th><td>T满 = 12 × 4.125</td><td>49.50 kg·m</td></tr>' +
      '<tr><th>坠石长端等效</th><td>T石 / L长</td><td>18.18 kg</td></tr>' +
      '</table><h4>行程</h4><table>' +
      '<tr><th>高位态 θ</th><td>坠石端着地前限位</td><td>−24°</td></tr>' +
      '<tr><th>下压态 θ</th><td>罐沿长绳下探没入水面</td><td>+13.5°</td></tr>' +
      '<tr><th>井</th><td>汉代陶井式高井栏 1.12 m · 口内 2.16 m</td><td>水面 +0.45 m · 池深 0.32 m</td></tr>' +
      '<tr><th>摆出倾倒</th><td>θ→+15° · 绳摆 φ=68° · 罐倾 68°</td><td>入水槽</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>T空 8.25 &lt; T满 49.50 &lt; T石 75.00(kg·m):空罐自动上提;满罐仍轻于坠石等效配重 18.18 kg(长端),故坠石可将满罐拉出井口;下压汲水须人力对长端加压,净需下压力 = (T石 − T罐)/L长,空罐 16.2 kg·f、满罐 6.2 kg·f —— 空罐下行才是做功段。</p>' +
      '<p>罐始终自由竖直悬挂于长端端点下 1.6 m 绳长处,轨迹为端点圆弧的竖垂平移;下压态罐底 0.22 m,没入水面 0.23 m、距池底 0.09 m,横杆全程不低于 2.19 m,入井口处已按自检断言避开井栏内壁。</p>' +
      '<p>井体形制取汉代陶井模型的高井栏式(井栏高出地面,水面在地面以上),池底盖板遮住地面,俯视井口可见罐没入水面。</p>' +
      '<h4>文献</h4>' +
      '<p>《庄子·天地》:子贡曰「有械于此,一日浸百畦,用力甚寡而见功多」;为圃者曰「凿木为机,后重前轻,挈水若抽,数如泆汤,其名为槔」。</p>'
  };
})(window.MECH = window.MECH || {});
