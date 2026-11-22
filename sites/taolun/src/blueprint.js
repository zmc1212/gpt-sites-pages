/* 图纸面板(B 键):快轮制陶总图 — 侧视 + 俯视 + 传动链 */
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
    no: "Fig. 08 · 复原总图",
    title: "快轮制陶 · 《天工开物·陶埏》陶车(立轴双盘)",
    src: "《天工开物·陶埏·白瓷附》+ 李文杰快轮研究(≥90rpm 拉坯) · 尺寸为复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainH = 46, chainY = h - chainH - 12, topY = 36;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.4;

      ctx.fillStyle = red; ctx.font = "700 11px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("I = ½MR² = 2.02 kg·m²(M35 R0.34) · 拨冲量 18.5N·m×0.35s → Δω 3.22 · τ = I/b = 6.0s · 临界 ωc = 90rpm(李文杰)", w * 0.03, topY - 12);

      /* ============ 左:侧视(陶车剖面) ============ */
      var svL = w * 0.03, svR = w * 0.50;
      var S = Math.min((svR - svL - 10) / 1.7, (chainY - topY - 30) / 1.3);
      var ox = svL + 4, oy = chainY - 16;
      var X = function (m) { return ox + (m + 0.85) * S; };
      var Y = function (m) { return oy - m * S; };
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText("侧视 SIDE", svL, topY + 12);
      /* 地面 */
      ctx.beginPath(); ctx.moveTo(X(-0.85), Y(0)); ctx.lineTo(X(0.85), Y(0)); ctx.stroke();
      /* 座 + 轴 + 双盘 + 泥料 */
      ctx.strokeRect(X(-0.5), Y(0.16), 1.0 * S, 0.16 * S);
      ctx.strokeRect(X(-0.07), Y(0.50), 0.14 * S, 0.42 * S);
      ctx.strokeRect(X(-0.42), Y(0.42), 0.84 * S, 0.06 * S);
      ctx.strokeRect(X(-0.34), Y(0.76), 0.68 * S, 0.05 * S);
      /* 泥料半剖(收口示意) */
      ctx.beginPath();
      ctx.moveTo(X(0), Y(0.78));
      ctx.quadraticCurveTo(X(0.14), Y(0.72), X(0.12), Y(0.64));
      ctx.quadraticCurveTo(X(0.10), Y(0.58), X(0.05), Y(0.575));
      ctx.stroke();
      /* 拨棍 + 利刀 + 水盆 */
      ctx.beginPath(); ctx.moveTo(X(-0.78), Y(0.42)); ctx.lineTo(X(-0.36), Y(0.34)); ctx.stroke();
      ctx.strokeRect(X(0.56), Y(0.50), 5, 0.50 * S);
      ctx.beginPath(); ctx.moveTo(X(0.60), Y(0.62)); ctx.lineTo(X(0.40), Y(0.60)); ctx.stroke();
      ctx.strokeRect(X(0.42), Y(0.24), 0.30 * S, 0.14 * S);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("上工作盘 r0.34", X(-0.34), Y(0.84));
      ctx.fillText("下拨盘 r0.42(拨槽)", X(-0.42), Y(0.30));
      ctx.fillText("泥料 收口成形", X(0.14), Y(0.70));
      ctx.fillText("拨棍(竹)", X(-0.80), Y(0.55));
      ctx.fillText("利刀+刀架", X(0.62), Y(0.70));
      ctx.fillText("水盆", X(0.52), Y(0.20));
      /* 尺寸 */
      arrow(ctx, X(-0.42), Y(0.02), X(0.42), Y(0.02), "下盘径 0.84m", true);
      arrow(ctx, X(0.72), Y(0), X(0.72), Y(0.62), "轴高 0.62(上高二尺)", false);

      /* ============ 右:俯视(双盘+拨位) ============ */
      var tvL = w * 0.53, tvR = w * 0.98;
      var S2 = Math.min((tvR - tvL - 12) / 1.6, (chainY - topY - 44) / 1.6);
      var cx2 = tvL + (tvR - tvL) / 2, cy2 = topY + 40 + (chainY - topY - 62) / 2;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("俯视 PLAN", tvL, topY + 12);
      ctx.beginPath(); ctx.arc(cx2, cy2, D.Rdrive * S2, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx2, cy2, D.Rwork * S2, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx2, cy2, 0.14 * S2, 0, Math.PI * 2); ctx.stroke();
      for (var i = 0; i < 8; i++) {
        var a = i / 8 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx2 + Math.cos(a) * D.Rwork * S2, cy2 + Math.sin(a) * D.Rwork * S2);
        ctx.lineTo(cx2 + Math.cos(a) * D.Rdrive * S2, cy2 + Math.sin(a) * D.Rdrive * S2);
        ctx.stroke();
      }
      ctx.fillStyle = faint;
      for (var k = 0; k < 8; k++) {
        var a2 = (k + 0.5) / 8 * Math.PI * 2;
        ctx.fillRect(cx2 + Math.cos(a2) * (D.Rdrive - 0.05) * S2 - 3, cy2 + Math.sin(a2) * (D.Rdrive - 0.05) * S2 - 3, 6, 6);
      }
      ctx.fillStyle = red;
      ctx.fillRect(X2(-0.80), cy2 - 3, 12, 6);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("拨棍位(西南) · 泥料居中 r0.14", tvL + 4, chainY - 10);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["竹棍拨沿", "冲量 18.5N·m×0.35s"], ["下拨盘", "r0.42 8拨槽"],
        ["立轴同轴", "上下盘 1:1 直传"], ["上工作盘", "r0.34 泥料拉坯"],
        ["临界转速", "≥90rpm 可拉坯"], ["过利刀二次", "旋削修坯 成器"]
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
      '<tr><th>陶车立轴</th><td>「竖直木一根,埋三尺入土,上高二尺许」</td><td>轴高 0.62 m</td></tr>' +
      '<tr><th>下拨盘</th><td>r 0.42 · 盘沿 8 拨槽(「盘沿以短竹棍拨运」)</td><td>—</td></tr>' +
      '<tr><th>上工作盘</th><td>r 0.34 · 泥料拉坯面</td><td>—</td></tr>' +
      '<tr><th>泥料</th><td>3.2kg · 筒→碗收口(成形进度 0→100%)</td><td>—</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>惯量 I = ½MR² = ½×35×0.34² = 2.02 kg·m²(载入断言);拨冲量 18.5N·m×0.35s → Δω = TΔt/I = 3.22 rad/s。</p>' +
      '<p>衰减 ω̇ = −bω/I,τ = I/b = 4.8s;满拨 ω₀ ≈ 12.5 rad/s(119rpm),衰减至临界 9.42(90rpm)可用时长 τ·ln(ω₀/ωc) ≈ 4.4s(断言 >4s)。</p>' +
      '<p>临界转速 ωc = 90rpm = 9.42 rad/s(李文杰:低于此仅慢轮修整,载入断言)。</p>' +
      '<p>成形进度 ∝ ∫ω dt(逐帧积分校验 maxErr&lt;1e-9)。</p>' +
      '<h4>文献</h4>' +
      '<p>《天工开物·陶埏·白瓷附》:「造此器坯,先制陶车。车竖直木一根,埋三尺入土内,使之安稳,上高二尺许,上下列圆盘,盘沿以短竹棍拨运旋转……过利刀二次。」</p>' +
      '<p>李文杰《中国古代制陶工艺研究》:快轮拉坯须 ≥90rpm。尺寸/质量为复原推算。</p>'
  };
})(window.MECH = window.MECH || {});
