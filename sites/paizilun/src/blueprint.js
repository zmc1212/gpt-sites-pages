/* 图纸面板(B 键):转轮排字盘总图 — 侧视 + 轮面正视 + 传动链 */
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
    no: "Fig. 06 · 复原总图",
    title: "转轮排字盘 · 王祯《造活字印书法》(1313)",
    src: "王祯《农书》附录《造活字印书法》 · 格数/惯量为复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainH = 46, chainY = h - chainH - 12, topY = 36;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.4;

      ctx.fillStyle = red; ctx.font = "700 11px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("轮周长 C = πD = 6.60m(径7尺≈2.1m) · 扇步进 Δθ = 45° · J = ½MR² = 24.8 kg·m² · ω(t) = ω₀e^(−t/τ), τ = J/b ≈ 10s", w * 0.03, topY - 12);

      /* ============ 左:侧视(两轮 + 中坐者) ============ */
      var svL = w * 0.03, svR = w * 0.50;
      var S = Math.min((svR - svL - 10) / 4.0, (chainY - topY - 34) / 2.6);
      var ox = svL + 4, oy = chainY - 16;
      var X = function (m) { return ox + (m + 2.0) * S; };
      var Y = function (m) { return oy - (m - 0.2) * S; };
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText("侧视 SIDE(左右双轮·中坐)", svL, topY + 12);
      /* 地面 */
      ctx.beginPath(); ctx.moveTo(X(-2.0), Y(0)); ctx.lineTo(X(2.0), Y(0)); ctx.stroke();
      /* 双轮(侧视为竖线)+ 轮面圆(右轮正视示意) */
      [-1.30, 1.30].forEach(function (xw) {
        ctx.beginPath(); ctx.moveTo(X(xw), Y(D.axleY - D.Rwheel)); ctx.lineTo(X(xw), Y(D.axleY + D.Rwheel)); ctx.stroke();
        ctx.beginPath(); ctx.arc(X(xw), Y(D.axleY), 0.06 * S, 0, Math.PI * 2); ctx.fill();
      });
      /* 右轮正视圆 + 扇线 */
      ctx.beginPath(); ctx.arc(X(1.30), Y(D.axleY), D.Rwheel * S, 0, Math.PI * 2); ctx.stroke();
      for (var s2 = 0; s2 < 8; s2++) {
        var a2 = s2 / 8 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(X(1.30), Y(D.axleY));
        ctx.lineTo(X(1.30) + Math.cos(a2) * D.Rwheel * S, Y(D.axleY) - Math.sin(a2) * D.Rwheel * S);
        ctx.stroke();
      }
      for (var r2 = 1; r2 <= 5; r2++) {
        ctx.beginPath(); ctx.arc(X(1.30), Y(D.axleY), D.Rwheel * S * r2 / 5, 0, Math.PI * 2); ctx.stroke();
      }
      /* 横架 */
      ctx.strokeRect(X(-1.65), Y(D.axleY + 0.30), 3.3 * S, 0.10 * S);
      [-1.30, 1.30].forEach(function (xw) {
        ctx.strokeRect(X(xw) - 4, Y(0), 8, (D.axleY + 0.30) * S);
      });
      /* 座凳(中坐)+ 人位示意 */
      ctx.strokeRect(X(-0.18), Y(0.48), 0.36 * S, 0.06 * S);
      ctx.strokeRect(X(-0.11), Y(0.42), 4, 0.42 * S);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("监韵轮", X(-1.30) - 22, Y(D.axleY + D.Rwheel + 0.10));
      ctx.fillText("杂字轮(扇面正视)", X(1.30) - 30, Y(D.axleY + D.Rwheel + 0.10));
      ctx.fillText("一人中坐 · 左右推转", X(-0.35), Y(0.62));
      /* 尺寸 */
      arrow(ctx, X(-1.30), Y(-0.28), X(1.30), Y(-0.28), "轮轴距 2.60m", true);
      arrow(ctx, X(1.30) - D.Rwheel * S, Y(-0.02), X(1.30) + D.Rwheel * S, Y(-0.02), "径七尺 2.1m", true);
      arrow(ctx, X(2.0), Y(D.axleY), X(2.0), Y(0), "轴高 3尺", false);

      /* ============ 右:轮面正视(扇格) ============ */
      var tvL = w * 0.53, tvR = w * 0.98;
      var S2 = Math.min((tvR - tvL - 14) / 2.5, (chainY - topY - 44) / 2.5);
      var cx2 = tvL + (tvR - tvL) / 2, cy2 = topY + 40 + (chainY - topY - 62) / 2;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("轮面正视(8扇×5环字格)", tvL, topY + 12);
      ctx.beginPath(); ctx.arc(cx2, cy2, D.Rwheel * S2, 0, Math.PI * 2); ctx.stroke();
      for (var s3 = 0; s3 < 8; s3++) {
        var a3 = s3 / 8 * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(cx2, cy2);
        ctx.lineTo(cx2 + Math.cos(a3) * D.Rwheel * S2, cy2 + Math.sin(a3) * D.Rwheel * S2);
        ctx.stroke();
      }
      for (var r3 = 1; r3 <= 5; r3++) {
        ctx.beginPath(); ctx.arc(cx2, cy2, D.Rwheel * S2 * r3 / 5, 0, Math.PI * 2); ctx.stroke();
      }
      /* 字格小方(示意 2 环) */
      ctx.fillStyle = faint;
      for (var rr = 2; rr <= 3; rr++) {
        var rMid = rr / 5 * D.Rwheel * S2;
        var n = 7;
        for (var cc = 0; cc < 8; cc++) {
          for (var k = 0; k < n; k++) {
            var ang = cc / 8 * Math.PI * 2 + (k + 0.5) / n * (Math.PI * 2 / 8);
            ctx.fillRect(cx2 + Math.cos(ang) * rMid - 3, cy2 + Math.sin(ang) * rMid - 3, 6, 6);
          }
        }
      }
      /* 取字口标记 */
      ctx.fillStyle = red;
      ctx.beginPath(); ctx.moveTo(cx2, cy2 + D.Rwheel * S2 + 5); ctx.lineTo(cx2 - 6, cy2 + D.Rwheel * S2 - 4); ctx.lineTo(cx2 + 6, cy2 + D.Rwheel * S2 - 4);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("取字口(中坐者手位)", cx2 + 10, cy2 + D.Rwheel * S2 - 2);
      ctx.fillText("格 ≈ 10cm · 约 280 格/面(推算)", tvL + 4, chainY - 10);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["一人中坐", "左右推转轮缘"], ["监韵轮", "径7尺 · 板面按韵"],
        ["杂字轮", "板面按类"], ["扇格步进", "Δθ=45° 以字就人"],
        ["取字补韵", "取讫补还韵内"], ["印版排版", "6×8=48 字成版"]
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
      '<h4>部件尺寸(文献值+推算)</h4><table>' +
      '<tr><th>轮盘</th><td>径可七尺(≈2.1m,元尺 0.31)· 轻木</td><td>R = 1.05 m</td></tr>' +
      '<tr><th>轮轴</th><td>高可三尺许(≈0.93m,复原取 1.0m 离地)</td><td>横轴沿 x</td></tr>' +
      '<tr><th>字格</th><td>8 扇 × 5 环 × 7 列 ≈ 280 格/面 · 格≈10cm(推算)</td><td>双面</td></tr>' +
      '<tr><th>架</th><td>上横架轴承 + 下钻臼(立转轮盘)</td><td>—</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>轮周长 C = πD = 6.60m(断言);扇步进 Δθ = 2π/8 = 45°(断言 Δθ×8 = 2π)。</p>' +
      '<p>推转惯量 J = ½MR² = ½×45×1.05² = 24.8 kg·m²;推冲量 25 N·m·s → Δω = 1.0 rad/s;阻尼 ω(t) = ω₀e^(−t/τ),τ = J/b ≈ 10s(b 取值)。</p>' +
      '<p>印版:每步进一格取一字,印版 6×8 = 48 字成版(逐帧校验 maxErr&lt;1e-9)。</p>' +
      '<h4>文献</h4>' +
      '<p>「用轻木造为大轮,其轮盘径可七尺,轮轴高可三尺许。用大木砧凿窍,上作横架,中贯轮轴,下有钻臼(立转轮盘)。」</p>' +
      '<p>「凡置轮两面:一轮置监韵板面,一轮置杂字板面,一人中坐,左右俱可推转摘字。盖以人寻字则难,以字就人则易……取讫,又可补还韵内。」</p>' +
      '<p>旁证:1298 年王祯以 3 万木活字排印《旌德县志》6 万字,月余印成百部。格数与惯量为复原推算值。</p>'
  };
})(window.MECH = window.MECH || {});
