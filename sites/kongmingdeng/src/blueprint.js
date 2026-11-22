/* 图纸面板(B 键):孔明灯总图 — 受力剖面 + 升温时序 + 传动链 */
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
    no: "Fig. 17 · 复原总图",
    title: "孔明灯 · 热浮升(《淮南万毕术》锚点+明清习俗)",
    src: "《淮南万毕术》「艾火令鸡子飞」(《太平御览》引注) · 发明说为传说,参数为推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainH = 46, chainY = h - chainH - 12, topY = 36;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.4;

      ctx.fillStyle = red; ctx.font = "700 11px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("F = (ρ外−ρ内)Vg · ρ内 = ρ外·T外/T内 · 起飞判据 F ≥ W(V0.3 壳55g → 起飞内温 73℃) · 满温90℃ F=0.68N 净升0.14N", w * 0.03, topY - 12);

      /* ============ 左:受力剖面 ============ */
      var svL = w * 0.03, svR = w * 0.50;
      var S = Math.min((svR - svL - 14) / 0.9, (chainY - topY - 30) / 0.95);
      var cx = svL + (svR - svL) / 2, cy = topY + 26;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText("受力剖面(等压升温)", svL, topY + 12);
      /* 灯壳剖面(球缺) */
      ctx.beginPath(); ctx.arc(cx, cy + 0.62 * S, 0.31 * S, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke();
      /* 口部 */
      ctx.beginPath(); ctx.moveTo(cx - 0.235 * S, cy + 0.62 * S); ctx.lineTo(cx + 0.235 * S, cy + 0.62 * S); ctx.stroke();
      /* 内箭头(升)外箭头(压) */
      ctx.strokeStyle = red;
      ctx.beginPath(); ctx.moveTo(cx, cy + 0.45 * S); ctx.lineTo(cx, cy + 0.25 * S); ctx.stroke();
      ctx.strokeStyle = ink;
      for (var i = 0; i < 3; i++) {
        var ax = cx - 0.30 * S + i * 0.30 * S;
        ctx.beginPath(); ctx.moveTo(ax, cy + 0.75 * S); ctx.lineTo(ax, cy + 0.55 * S); ctx.stroke();
      }
      /* 燃料 */
      ctx.strokeRect(cx - 0.06 * S, cy + 0.60 * S, 0.12 * S, 0.05 * S);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("净浮力↑", cx + 4, cy + 0.30 * S);
      ctx.fillText("外压↓", cx - 0.42 * S, cy + 0.58 * S);
      ctx.fillText("燃料块(口内)", cx + 6, cy + 0.66 * S);
      ctx.fillText("壳+架 55g", cx - 0.42 * S, cy + 0.36 * S);
      /* 尺寸 */
      arrow(ctx, cx - 0.31 * S, cy + 0.10 * S, cx + 0.31 * S, cy + 0.10 * S, "底径 0.5m", false);
      arrow(ctx, cx + 0.36 * S, cy + 0.62 * S, cx + 0.36 * S, cy + 0.10 * S, "高 0.65m", false);

      /* ============ 右:升温-起飞时序 ============ */
      var tvL = w * 0.53, tvR = w * 0.98;
      var gx = tvL + 34, gy = topY + 40, gw = tvR - gx - 14, gh = chainY - gy - 18;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("内温-时序(起飞判据)", tvL, topY + 12);
      ctx.strokeStyle = faint;
      ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke();
      /* 内温曲线(指数升至90) */
      ctx.strokeStyle = red; ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (var t = 0; t <= 90; t += 2) {
        var T = 20 + 70 * (1 - Math.exp(-t * 0.16));
        var x = gx + t / 90 * gw;
        var y = gy + gh - T / 100 * gh;
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      /* 起飞线 */
      var yF = gy + gh - D.Tfly / 100 * gh;
      ctx.strokeStyle = yellow; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(gx, yF); ctx.lineTo(gx + gw, yF); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("T内 ℃", tvL + 4, topY + 30);
      ctx.fillText("起飞内温 73℃(F=W)", gx + 6, yF - 5);
      ctx.fillText("时间 0→90s(燃尽回落)", gx + gw / 2 - 40, gy + gh + 12);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["燃料点燃", "口内 松脂/浸油布"], ["内气温升", "等压 ρ内=ρ外T外/T内"],
        ["判据 F≥W", "起飞内温 73℃"], ["离地升空", "净升 0.14N 缓升"],
        ["巡航", "浮-重-阻尼平衡"], ["燃尽回落", "冷却 降沉回收"]
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
      '<tr><th>灯体</th><td>竹圈纸罩 · 底径 0.5m · 高 0.65m</td><td>V = 0.30 m³</td></tr>' +
      '<tr><th>壳+架</th><td>棉纸+竹篾</td><td>m = 55 g</td></tr>' +
      '<tr><th>燃料</th><td>松脂/浸油布块(燃 90s 演示)</td><td>—</td></tr>' +
      '<tr><th>环境</th><td>外温 20℃ · ρ外 1.20 kg/m³</td><td>—</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>浮力:F = (ρ外−ρ内)·V·g;ρ内 = ρ外·T外/T内(等压理想气体,断言)。</p>' +
      '<p>起飞判据:F ≥ W(0.539N)⇒ 起飞内温 73℃(断言 ±1.5℃);满温 90℃ F = 0.68N,净升 0.14N(断言)。</p>' +
      '<p>升速:dv/dt = (F−W−kv)/m,稳态 ≈ 0.5m/s(演示);燃尽冷却回落。</p>' +
      '<p>高度逐帧积分校验(maxErr&lt;1e-9)。文献口径:孔明发明说为传说;以《淮南万毕术》「艾火令鸡子飞」(《太平御览》引注)+明清习俗为锚点。</p>' +
      '<h4>文献</h4>' +
      '<p>《淮南万毕术》:「艾火令鸡子飞」;《太平御览》引注:「取鸡子去其汁,燃艾火,纳空卵中,疾风因举之飞。」(热浮升最早原理记载)</p>' +
      '<p>连横《台湾通史》记台湾俗「孔明灯」;平溪天灯一般记清道光年间传入(习俗锚点)。</p>'
  };
})(window.MECH = window.MECH || {});
