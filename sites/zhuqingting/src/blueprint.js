/* 图纸面板(B 键):竹蜻蜓总图 — 翼剖面受力 + 拉力公式 + 史源 */
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
    no: "Fig. 18 · 复原总图",
    title: "竹蜻蜓 · 双翼旋翼(《抱朴子》飞车传说关联)",
    src: "《抱朴子·内篇·杂应》(传说锚点)+ 1784 中国陀螺西传 + 现代旋翼公式 · 本体无明文(口径明示)",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainH = 46, chainY = h - chainH - 12, topY = 36;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.4;

      ctx.fillStyle = red; ctx.font = "700 11px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("拉力 T = C_T·ρ·A·(ωR)²(C_T0.1, R0.08, A0.0201) · 悬停 ω = √(mg/(C_TρAR²)) = 112.7rad/s(mg196mN) · 安装角 18°", w * 0.03, topY - 12);

      /* ============ 左:翼剖面受力 ============ */
      var svL = w * 0.03, svR = w * 0.50;
      var S = Math.min((svR - svL - 14) / 0.30, (chainY - topY - 30) / 0.24);
      var cx = svL + (svR - svL) / 2, cy = topY + 24;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText("翼叶剖面(安装角 18°,双翼反向)", svL, topY + 12);
      /* 顶视双翼 */
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(D.pitch);
      ctx.fillRect(-D.R * S, -2, D.R * S, 4);
      ctx.rotate(-2 * D.pitch);
      ctx.fillRect(0, -2, D.R * S, 4);
      ctx.restore();
      /* 轴 */
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + 0.10 * S); ctx.stroke();
      /* 合速度与拉力矢量(翼尖) */
      ctx.strokeStyle = red; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(cx + D.R * S * 0.8, cy); ctx.lineTo(cx + D.R * S * 0.8 + 14, cy - 6); ctx.stroke();
      ctx.fillStyle = red;
      ctx.fillText("合气流", cx + D.R * S * 0.8 + 16, cy - 6);
      ctx.strokeStyle = "rgba(127,216,216,0.9)";
      ctx.beginPath(); ctx.moveTo(cx + D.R * S * 0.8 + 14, cy - 6); ctx.lineTo(cx + D.R * S * 0.8 + 14, cy + 10); ctx.stroke();
      ctx.fillStyle = teal;
      ctx.fillText("拉力 T", cx + D.R * S * 0.8 + 16, cy + 22);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("轴(搓转)", cx - 10, cy + 0.13 * S);
      ctx.fillText("翼展 2R 16cm", cx - 0.06 * S, cy - 0.075 * S);
      /* 尺寸 */
      arrow(ctx, cx - D.R * S, cy + 0.085 * S, cx + D.R * S, cy + 0.085 * S, "翼展 16cm", true);
      arrow(ctx, cx + 0.05 * S, cy + 0.10 * S, cx + 0.05 * S, cy + 0.175 * S, "轴长 20cm", false);

      /* ============ 右:拉力-转速曲线 + 史源 ============ */
      var tvL = w * 0.53, tvR = w * 0.98;
      var gx = tvL + 36, gy = topY + 40, gw = tvR - gx - 16, gh = 62;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("T-ω 曲线(二次)与悬停判据", tvL, topY + 12);
      ctx.strokeStyle = faint;
      ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke();
      ctx.strokeStyle = teal; ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (var w2 = 0; w2 <= 55; w2 += 2) {
        var T = D.CT * D.rho * D.A * Math.pow(w2 * D.R, 2);
        var x = gx + w2 / 55 * gw;
        var y = gy + gh - Math.min(1, T / 0.30) * gh;
        if (w2 === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      /* mg 线 */
      var yW = gy + gh - (D.W / 0.30) * gh;
      ctx.strokeStyle = yellow; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(gx, yW); ctx.lineTo(gx + gw, yW); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("T N", tvL + 4, topY + 30);
      ctx.fillText("mg 0.196N(交点=悬停 ω35.7)", gx + 8, yW - 5);
      ctx.fillStyle = soft; ctx.font = "600 8px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("《抱朴子·杂应》:「或用枣心木为飞车,以牛革结环剑以引其机……上升四十里」(传说器物)", tvL + 4, gy + gh + 20);
      ctx.fillText("1784 Launoy & Bienvenu「中国陀螺」演示于法国科学院;1796 凯利发条旋翼模型(直升机史前史)", tvL + 4, gy + gh + 34);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["双掌搓轴", "τ 0.028N·m 起旋"], ["翼面气流", "安装角 18° 切气"],
        ["拉力 T", "C_T·ρ·A·(ωR)²"], ["判据 T>mg", "悬停 ω 112.7"],
        ["升空-衰减", "ω̇=−k空气ω²/I"], ["落掌再搓", "「中国陀螺」西传"]
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
      '<h4>部件尺寸(推算)</h4><table>' +
      '<tr><th>双翼</th><td>翼展半径 8cm · 弦 3cm · 安装角 18°(15-25 最佳)</td><td>A = 0.0201 m²</td></tr>' +
      '<tr><th>轴</th><td>长 20cm · 竹木</td><td>—</td></tr>' +
      '<tr><th>总重</th><td>竹翼+轴</td><td>m = 20 g</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>拉力:T = C_T·ρ·A·(ωR)² = 0.1×1.2×0.0201×(ω×0.08)²(载入断言公式)。</p>' +
      '<p>悬停:T = mg = 0.196N ⇒ ω悬 = 112.7 rad/s ≈ 1076rpm(断言 100-125 区间)。</p>' +
      '<p>起旋:ω̇ = τ搓/I − k空气ω²/I(I 双翼 1.28×10⁻⁵,τ搓 0.028N·m 推算)。</p>' +
      '<p>升降:dv/dt = (T−mg−k阻v)/m;高度逐帧积分校验(maxErr&lt;1e-9)。</p>' +
      '<p>口径:竹蜻蜓本体明代以前无直接文字记载;《抱朴子》「飞车」为传说关联;西传史(1784/1796)为研究结论。</p>' +
      '<h4>文献</h4>' +
      '<p>《抱朴子·内篇·杂应》:「或用枣心木为飞车,以牛革结环剑以引其机……上升四十里,名为太清。」</p>'
  };
})(window.MECH = window.MECH || {});
