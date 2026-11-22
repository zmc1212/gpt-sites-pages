/* 图纸面板(B 键):陀螺总图 — 几何受力 + 进动公式 + 传动链 */
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
    no: "Fig. 16 · 复原总图",
    title: "陀螺 · 《帝京景物略》睡陀螺进动(刚体近似)",
    src: "明·刘侗、于奕正《帝京景物略·卷二》 · m/I/r 为推算,刚体陀螺近似",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainH = 46, chainY = h - chainH - 12, topY = 36;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.4;

      ctx.fillStyle = red; ctx.font = "700 11px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("进动 Ω = mgr/(Iω)(I=½mr²=8.0e-6, ω300 → Ω3.3 ≈ 0.5转/s) · 睡陀螺阈值 ω² > 4mgr/I → 598rpm · ω̇ = −bω(取值)", w * 0.03, topY - 12);

      /* ============ 左:几何受力 ============ */
      var svL = w * 0.03, svR = w * 0.50;
      var S = Math.min((svR - svL - 14) / 0.16, (chainY - topY - 30) / 0.16);
      var ox = svL + 70, oy = chainY - 18;
      var X = function (m) { return ox + m * S; };
      var Y = function (m) { return oy - (m - 0.08) * S; };
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText("几何与受力(轴倾斜 θ)", svL, topY + 12);
      /* 支点 + 倾斜轴 + 体 */
      ctx.beginPath(); ctx.arc(X(0), Y(0), 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(0.02), Y(0.14)); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(0.02), Y(0.11), 0.05 * S * 0.8, 0, Math.PI * 2); ctx.stroke();
      /* 重力 mg(质心向下)+ 进动方向弧 */
      ctx.strokeStyle = red;
      ctx.beginPath(); ctx.moveTo(X(0.02), Y(0.10)); ctx.lineTo(X(0.02), Y(0.10) - 22); ctx.stroke();
      ctx.fillStyle = red;
      ctx.fillText("mg", X(0.02) + 4, Y(0.10) - 22);
      ctx.strokeStyle = "rgba(42,38,32,0.65)";
      ctx.beginPath(); ctx.arc(X(0), Y(0), 0.09 * S, -0.5, 0.9); ctx.stroke();
      ctx.fillStyle = ink;
      ctx.fillText("Ω 进动(绕竖直)", X(0.075), Y(0.02));
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("支点(触地)", X(0) - 20, Y(0) + 6);
      ctx.fillText("质心 r 2cm", X(0.045), Y(0.105));
      ctx.fillText("自转 ω(轴)", X(0.05), Y(0.14));
      /* 公式块 */
      ctx.fillStyle = ink; ctx.font = "700 10px Menlo, monospace";
      ctx.fillText("Ω = mgr/(Iω)", X(-0.075), Y(0.155));
      ctx.fillText("ω² > 4mgr/I 睡稳", X(-0.075), Y(0.150));

      /* ============ 右:Ω-ω 双曲线 + 引文 ============ */
      var tvL = w * 0.53, tvR = w * 0.98;
      var gx = tvL + 40, gy = topY + 46, gw = tvR - tvL - 70, gh = chainY - gy - 20;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("Ω-ω 曲线(衰减→进动加快)", tvL, topY + 12);
      ctx.strokeStyle = "rgba(42,38,32,0.65)"; ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (var wv = 30; wv <= 400; wv += 8) {
        var x = gx + (wv - 30) / 370 * gw;
        var y = gy + gh - Math.min(1, D.OmegaOf(wv) / 12) * gh;
        if (wv === 30) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      /* 阈值竖线 */
      var xc = gx + (D.omegaCrit - 30) / 370 * gw;
      ctx.strokeStyle = red; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(xc, gy - 4); ctx.lineTo(xc, gy + gh); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("ω 300rad/s", gx - 8, gy + gh + 12);
      ctx.fillText("阈值 62.6(rad/s)", xc - 40, gy - 6);
      ctx.fillStyle = ink; ctx.font = "600 10px sans-serif";
      ctx.fillText("「转之疾,正如卓立地上,顶光旋旋,影不动也」", tvL + 4, gy + gh + 24);
      ctx.fillText("「视其缓而鞭之,转转无复住」(衰减→鞭击补能)", tvL + 4, gy + gh + 38);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["急掣其鞭", "一掣则转 Δω42"], ["卓于地", "支点触地 轴倾8°"],
        ["睡陀螺", "ω>598rpm 稳"], ["进动 Ω", "∝1/ω 慢旋"],
        ["转缓鞭之", "补能 续转"], ["转缓则倾", "章动增长 倒"]
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
      '<tr><th>陀螺体</th><td>木制如小空钟 · m 40g · R 2.8cm</td><td>I = 8.0×10⁻⁶</td></tr>' +
      '<tr><th>质心-支点</th><td>r 2cm</td><td>—</td></tr>' +
      '<tr><th>鞭</th><td>绳无竹尺 · 每鞭 Δω 42rad/s(演示)</td><td>—</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>进动:Ω = mgr/(I·ω) = 0.04×9.8×0.02/(8e-6×300) = 3.3 rad/s ≈ 0.5转/s(断言公式)。</p>' +
      '<p>睡陀螺阈值:ω² > 4mgr/I → ω > 62.6 rad/s ≈ 598rpm(「卓立地上」,断言)。</p>' +
      '<p>衰减 ω̇ = −bω(b 取值);缓而鞭之补能;低章动增长 → 翻倒(演示)。</p>' +
      '<p>进动角逐帧积分校验(maxErr&lt;1e-9)。</p>' +
      '<h4>文献</h4>' +
      '<p>《帝京景物略·卷二》:「陀螺者,木制如小空钟,中实而无柄,绕以鞭之绳而无竹尺。卓于地,急掣其鞭,一掣,陀螺则转无声也。视其缓而鞭之,转转无复住。转之疾,正如卓立地上,顶光旋旋,影不动也。」</p>'
  };
})(window.MECH = window.MECH || {});
