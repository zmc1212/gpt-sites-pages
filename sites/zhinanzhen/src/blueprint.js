/* 图纸面板(B 键):水浮指南针总图 — 侧视 + 罗盘面 + 传动链 */
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
    no: "Fig. 13 · 复原总图",
    title: "水浮指南针 · 沈括《梦溪笔谈》水浮法",
    src: "沈括《梦溪笔谈·卷二十四》+ 朱彧《萍洲可谈》航海记载 · 磁偏角 ε 3° 为现代量级(推算)",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainH = 46, chainY = h - chainH - 12, topY = 36;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.4;

      ctx.fillStyle = red; ctx.font = "700 11px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("θ̈ = −ω₀²sin(θ−ε) − 2ζω₀θ̇ · ω₀ 3.4 rad/s(T≈1.85s) · ζω₀ 2.6(水阻尼,研究量级) · 稳态 ε = 3° 偏东(「微偏东」)", w * 0.03, topY - 12);

      /* ============ 左:侧视(碗剖面) ============ */
      var svL = w * 0.03, svR = w * 0.50;
      var S = Math.min((svR - svL - 14) / 0.6, (chainY - topY - 30) / 0.5);
      var ox = svL + 30, oy = chainY - 18;
      var X = function (m) { return ox + m * S; };
      var Y = function (m) { return oy - (m - 0.46) * S; };
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText("侧视 SIDE(碗剖面)", svL, topY + 12);
      /* 案几 */
      ctx.strokeRect(X(-0.36), Y(0.485), 0.72 * S, 4);
      ctx.strokeRect(X(-0.33), Y(0.02), 0.06 * S, 0.44 * S);
      /* 碗剖面 */
      ctx.beginPath(); ctx.arc(X(0), Y(0.16), D.bowlR * S, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      /* 水面 */
      ctx.strokeStyle = "rgba(79,120,150,0.9)";
      ctx.beginPath(); ctx.moveTo(X(-D.bowlR * 0.82), Y(D.waterY)); ctx.lineTo(X(D.bowlR * 0.82), Y(D.waterY)); ctx.stroke();
      /* 灯草束 + 针(偏东示意) */
      ctx.strokeRect(X(-0.02), Y(D.waterY + 0.008), 0.05 * S, 0.03 * S);
      ctx.strokeStyle = ink; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X(-0.035), Y(D.waterY + 0.036)); ctx.lineTo(X(0.040), Y(D.waterY + 0.036)); ctx.stroke();
      ctx.fillStyle = red;
      ctx.beginPath(); ctx.arc(X(0.042), Y(D.waterY + 0.036), 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = ink;
      /* 磁南线(偏东虚线) */
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(X(0), Y(D.waterY - 0.05)); ctx.lineTo(X(0.06), Y(0.50)); ctx.stroke();
      ctx.setLineDash([]);
      /* 磁石 + 缸 */
      ctx.strokeRect(X(-0.29), Y(0.565), 0.13 * S, 0.09 * S);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("碗(粗陶)", X(0.16), Y(0.30));
      ctx.fillText("灯草束·针(南端红)", X(0.06), Y(D.waterY + 0.06));
      ctx.fillText("磁南偏东 ε3°(虚线)", X(-0.30), Y(0.42));
      ctx.fillText("磁石(磨针)", X(-0.30), Y(0.60));
      /* 尺寸 */
      arrow(ctx, X(-D.bowlR), Y(0.20), X(D.bowlR), Y(0.20), "碗口 0.40m", true);
      arrow(ctx, X(-0.04), Y(D.waterY + 0.06), X(0.04), Y(D.waterY + 0.06), "针 7.5cm", false);

      /* ============ 右:罗盘面(24 向 + 偏东) ============ */
      var tvL = w * 0.53, tvR = w * 0.98;
      var cx2 = tvL + (tvR - tvL) / 2 - 30, cy2 = topY + 40 + (chainY - topY - 64) / 2;
      var R2 = Math.min((tvR - tvL) / 2 - 40, (chainY - topY - 60) / 2);
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("罗盘面(24 向·浮式)", tvL, topY + 12);
      ctx.beginPath(); ctx.arc(cx2, cy2, R2, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx2, cy2, R2 * 0.82, 0, Math.PI * 2); ctx.stroke();
      for (var i = 0; i < 24; i++) {
        var a = i / 24 * Math.PI * 2;
        var major = i % 6 === 0;
        ctx.strokeStyle = major ? ink : faint;
        ctx.beginPath();
        ctx.moveTo(cx2 + Math.sin(a) * R2 * 0.82, cy2 - Math.cos(a) * R2 * 0.82);
        ctx.lineTo(cx2 + Math.sin(a) * R2, cy2 - Math.cos(a) * R2);
        ctx.stroke();
      }
      /* 针(偏东)+ 磁南虚线 */
      ctx.strokeStyle = ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx2, cy2);
      ctx.lineTo(cx2 + Math.sin(D.eps + Math.PI) * R2 * 0.7, cy2 - Math.cos(D.eps + Math.PI) * R2 * 0.7);
      ctx.stroke();
      ctx.strokeStyle = red;
      ctx.beginPath(); ctx.moveTo(cx2, cy2);
      ctx.lineTo(cx2 + Math.sin(D.eps) * R2 * 0.7, cy2 - Math.cos(D.eps) * R2 * 0.7);
      ctx.stroke();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = faint;
      ctx.beginPath(); ctx.moveTo(cx2, cy2); ctx.lineTo(cx2, cy2 - R2 * 0.95); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("针(红端指南,偏东 3°)", cx2 + R2 * 0.2, cy2 + R2 * 0.62);
      ctx.fillText("几何南(虚线)", cx2 + 6, cy2 - R2 * 0.9);
      ctx.fillText("「常微偏东,不全南也」——世界最早磁偏角记载", tvL + 4, chainY - 10);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["磁石磨针", "「则能指南」"], ["灯草浮水", "「水浮多荡摇」"],
        ["阻尼摆", "ω₀3.4 ζω₀2.6"], ["稳态偏东", "ε = 3°(现代量级)"],
        ["扰动收敛", "±35°→1°×1.2s"], ["航海应用", "「阴晦观指南针」"]
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
      '<tr><th>磁针</th><td>长 7.5cm · 穿三层灯草束</td><td>—</td></tr>' +
      '<tr><th>碗</th><td>粗陶碗口 0.40m · 水面浮定</td><td>R = 0.20 m</td></tr>' +
      '<tr><th>刻度盘</th><td>沿 24 向(浮式罗盘早期形态)</td><td>—</td></tr>' +
      '<tr><th>磁参量</th><td>μ 2×10⁻³ A·m² · B_H 3.2×10⁻⁵T · I 6.7×10⁻⁸(推算)</td><td>—</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>摆动方程:θ̈ = −ω₀²sin(θ−ε) − 2ζω₀θ̇,取 ω₀ = 3.4 rad/s(T≈1.85s)、ζω₀ = 2.6(水阻尼,研究量级;无阻尼理论值 √(μB/I) = 9.7,标示)。</p>' +
      '<p>稳态指向:θ → ε = 3°(磁南偏东,「常微偏东,不全南也」——世界最早磁偏角记载)。</p>' +
      '<p>扰动收敛:±35° 拨动 → 欠阻尼振荡 → |θ−ε|&lt;1° 保持 1.2s 判收敛(逐帧积分校验 maxErr&lt;1e-9)。</p>' +
      '<p>碗晃(航海):倾斜扰动矩下针仍回 ε(「阴晦观指南针」)。</p>' +
      '<h4>文献</h4>' +
      '<p>沈括《梦溪笔谈·卷二十四》:「方家以磁石磨针锋,则能指南,然常微偏东,不全南也。水浮多荡摇,指爪及碗唇上皆可为之,运转尤速,但坚滑易坠,不若缕悬为最善。」</p>' +
      '<p>朱彧《萍洲可谈·卷二》(约1119):「舟师识地理,夜则观星,昼则观日,阴晦观指南针。」——航海应用最早文字记载。</p>'
  };
})(window.MECH = window.MECH || {});
