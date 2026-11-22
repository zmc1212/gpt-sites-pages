/* 图纸面板(B 键):摇橹总图 — 橹几何侧视 + 攻角反转原理 + 传动链 */
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
    no: "Fig. 19 · 复原总图",
    title: "摇橹 · 《释名·释船》橹(钮-杆-板 连续推进)",
    src: "东汉·刘熙《释名·释船》+ 广州东汉陶船模型 · 板速/系数为推算量级",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainH = 46, chainY = h - chainH - 12, topY = 36;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.4;

      ctx.fillStyle = red; ctx.font = "700 11px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("摆 β ±24° · 攻角 α 与 β 相位差 90°(反转) · F = ½ρA(v板·sinα)²·C_d(百牛量级) · 匀速 F = c·v² → ≈0.7m/s", w * 0.03, topY - 12);

      /* ============ 左:橹几何侧视 ============ */
      var svL = w * 0.03, svR = w * 0.50;
      var S = Math.min((svR - svL - 14) / 4.2, (chainY - topY - 30) / 1.6);
      var ox = svL + 4, oy = chainY - 16;
      var X = function (m) { return ox + (m + 2.2) * S; };
      var Y = function (m) { return oy - (m - 0.5) * S; };
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText("侧视 SIDE(船尾橹,仰摆两态)", svL, topY + 12);
      /* 水面 + 船体侧影 */
      ctx.strokeStyle = "rgba(79,120,150,0.8)";
      ctx.beginPath(); ctx.moveTo(X(-2.2), Y(0.08)); ctx.lineTo(X(2.0), Y(0.08)); ctx.stroke();
      ctx.strokeStyle = ink;
      ctx.strokeRect(X(-1.55), Y(0.62), 3.1 * S, 0.55 * S);
      /* 橹钮 */
      ctx.beginPath(); ctx.arc(X(-1.05), Y(0.62), 4, 0, Math.PI * 2); ctx.fill();
      /* 橹两态(实线=左摆,虚线=右摆) */
      ctx.beginPath(); ctx.moveTo(X(-1.05), Y(0.62)); ctx.lineTo(X(-1.05) - D.Lu * S * Math.cos(0.52), Y(0.62) + D.Lu * S * Math.sin(0.52) * 0.5); ctx.stroke();
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(X(-1.05), Y(0.62)); ctx.lineTo(X(-1.05) - D.Lu * S * Math.cos(0.30), Y(0.62) + D.Lu * S * Math.sin(0.30) * 0.5); ctx.stroke();
      ctx.setLineDash([]);
      /* 橹板(两端) */
      ctx.fillRect(X(-1.05) - D.Lu * S * Math.cos(0.52) - 5, Y(0.62) + D.Lu * S * Math.sin(0.52) * 0.5, 10, 0.34 * S);
      /* 橹手端 + 绳 */
      ctx.beginPath(); ctx.moveTo(X(-1.05) + 0.45 * S * 0.5, Y(0.62) - 0.20 * S * 0.5); ctx.lineTo(X(-0.10), Y(0.44)); ctx.stroke();
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("橹钮(球窝支点)", X(-1.05) + 8, Y(0.62) - 6);
      ctx.fillText("橹板(攻角反转)", X(-1.05) - D.Lu * S * 0.82 - 10, Y(0.62) + D.Lu * S * 0.24 + 10);
      ctx.fillText("橹手端·橹绳", X(-0.30), Y(0.55));
      ctx.fillText("船体(陶船模型制式)", X(0.3), Y(0.90));
      /* 尺寸 */
      arrow(ctx, X(-1.05), Y(0.16), X(-1.05) - D.Lu * S * 0.76, Y(0.16), "橹长 2.9m(钮至板)", true);
      arrow(ctx, X(-1.55), Y(0.95), X(1.55), Y(0.95), "船长 3.1m(示意)", true);

      /* ============ 右:攻角反转原理(摆-攻角相位图) ============ */
      var tvL = w * 0.53, tvR = w * 0.98;
      var cx2 = tvL + 46, cy2 = topY + 40 + 42;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("攻角反转(β 摆 与 α 相位差 90°)", tvL, topY + 12);
      /* 相位圆 */
      ctx.beginPath(); ctx.arc(cx2, cy2, 30, 0, Math.PI * 2); ctx.stroke();
      var ph = D.A2 * 1.0;
      ctx.strokeStyle = teal; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx2, cy2);
      ctx.lineTo(cx2 + Math.sin(D.A2 * 1.0) * 30, cy2 - Math.cos(D.A2 * 1.0) * 30);
      ctx.stroke();
      ctx.strokeStyle = yellow;
      ctx.beginPath(); ctx.moveTo(cx2, cy2);
      ctx.lineTo(cx2 + Math.cos(D.A2 * 1.0) * 26, cy2 - Math.sin(D.A2 * 1.0) * 26);
      ctx.stroke();
      ctx.fillStyle = soft; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("β 摆(teal)", cx2 + 36, cy2 - 8);
      ctx.fillText("α 攻角(yellow)", cx2 + 36, cy2 + 8);
      /* 推力示意(两半程都向前) */
      ctx.fillStyle = ink; ctx.font = "600 9px sans-serif";
      ctx.fillText("左摆:板面右倾 → 推力向前", tvL + 4, cy2 + 66);
      ctx.fillText("右摆:板面左倾 → 推力仍向前(攻角反转)", tvL + 4, cy2 + 80);
      ctx.fillText("→ 橹不出水,连续推进(「一橹抵三桨」)", tvL + 4, cy2 + 94);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["橹手推拉", "摇频 0.6-1.2Hz"], ["橹钮摆动", "β ±24°"],
        ["攻角反转", "α 相位差 90°"], ["板面推力", "½ρA(v板sinα)²"],
        ["船阻平衡", "R=c·v² 匀速"], ["连续推进", "橹不出水 抵三桨"]
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
      '<tr><th>橹</th><td>长 2.9m(钮至板中)· 橹板 1.05×0.34</td><td>—</td></tr>' +
      '<tr><th>橹板面积</th><td>A 0.30m²</td><td>—</td></tr>' +
      '<tr><th>摆幅</th><td>β ±24° · 攻角 α ±19°(与 β 差 90°)</td><td>—</td></tr>' +
      '<tr><th>摇频</th><td>0.6-1.2 Hz(演示)</td><td>—</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>板速:v板 ≈ 2πf·L摆臂·摆幅系数 ≈ 3m/s(研究量级,断言 2.5-3.6)。</p>' +
      '<p>每摆推力:F = ½ρA(v板·sinα)²·C_d(百牛量级,断言公式);平均推力 = Favg(标定系数)。</p>' +
      '<p>匀速:F_avg = c·v² → 航速 ≈ 0.7m/s(断言 0.55-0.85);功率 ≈ 150W(人力上限附近,断言 90-220)。</p>' +
      '<p>攻角与摆相位差 90°:两半程推力同向(连续推进);船速逐帧积分校验(maxErr&lt;1e-9)。</p>' +
      '<h4>文献</h4>' +
      '<p>《释名·释船》:「在旁曰橹。橹,膂也,用膂力然后舟行也。」实物:广州先烈路东汉墓陶船模型(1954,长54cm)已见橹。</p>' +
      '<p>「一橹抵三桨」为传统说法(连续推进,橹不出水);板速/系数为推算量级。</p>'
  };
})(window.MECH = window.MECH || {});
