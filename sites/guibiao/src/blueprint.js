/* 图纸面板(B 键):圭表总图 — 侧视几何 + 廿四气影长表 + 传动链 */
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
    no: "Fig. 11 · 复原总图",
    title: "圭表 · 《周髀算经》八尺表(两至影长自洽)",
    src: "《周髀算经·卷上》+ 登封观星台量天尺(31.19m) · φ=35.3°反推 · 尺寸为复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM, KS = MECH.KS;
      var chainH = 46, chainY = h - chainH - 12, topY = 36;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.4;

      ctx.fillStyle = red; ctx.font = "700 11px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("h = 90°−φ+δ(φ=35.3°反推自洽, ε=24°) · L = H/tan(h) · 夏至 0.374m ≈ 一尺六寸 ✓ · 冬至 2.96m ≈ 一丈三尺五寸(差5%)", w * 0.03, topY - 12);

      /* ============ 左:侧视几何(夏至/冬至两光线) ============ */
      var svL = w * 0.03, svR = w * 0.50;
      var S = Math.min((svR - svL - 14) / 4.0, (chainY - topY - 30) / 2.3);
      var ox = svL + 4, oy = chainY - 14;
      var X = function (m) { return ox + (m + 3.4) * S; };
      var Y = function (m) { return oy - m * S; };
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText("侧视 SIDE(子午面,南左北右)", svL, topY + 12);
      /* 地面 + 圭 + 表 */
      ctx.beginPath(); ctx.moveTo(X(-3.4), Y(0)); ctx.lineTo(X(0.6), Y(0)); ctx.stroke();
      ctx.strokeRect(X(-3.4), Y(0.22), 3.9 * S, 0.22 * S);
      ctx.beginPath(); ctx.moveTo(X(0.30), Y(0.22)); ctx.lineTo(X(0.30), Y(D.H)); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(0.30), Y(D.H), 3, 0, Math.PI * 2); ctx.fill();
      /* 两至光线 */
      var Ls = KS.shadowLen(0.5), Lw = KS.shadowLen(0);
      ctx.strokeStyle = "rgba(140,47,30,0.9)"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(X(0.30 - Ls), Y(D.H + Ls)); ctx.lineTo(X(0.30), Y(D.H)); ctx.lineTo(X(0.30 - Ls), Y(0.22)); ctx.stroke();
      ctx.strokeStyle = "rgba(42,38,32,0.55)"; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(X(0.30 - Lw), Y(D.H + Lw)); ctx.lineTo(X(0.30), Y(D.H)); ctx.lineTo(X(0.30 - Lw), Y(0.22)); ctx.stroke();
      ctx.setLineDash([]);
      /* 影端标记 */
      ctx.fillStyle = ink;
      ctx.fillRect(X(0.30 - Ls) - 2, Y(0.22) - 4, 4, 8);
      ctx.beginPath(); ctx.arc(X(0.30 - Lw), Y(0.22) - 4, 3, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("夏至光线(红)影 0.374m", X(0.30 - Ls) - 30, Y(1.15));
      ctx.fillText("冬至光线(虚)影 2.96m", X(0.30 - Lw) - 20, Y(2.6));
      ctx.fillText("八尺表 H=1.848m", X(0.36), Y(1.3));
      ctx.fillText("圭(南向)3.5m", X(-2.6), Y(0.35));
      /* 尺寸 */
      arrow(ctx, X(0.30), Y(0.9), X(0.30 - Ls), Y(0.9), "夏至影 一尺六寸", false);
      arrow(ctx, X(0.30 - Lw), Y(0.10), X(0.30), Y(0.10), "冬至影 一丈三尺五寸", true);
      arrow(ctx, X(0.42), Y(D.H), X(0.42), Y(0.22), "八尺", false);

      /* ============ 右:廿四气影长表(周髀对照) ============ */
      var tvL = w * 0.53, tvR = w * 0.98;
      var n = 24, bw = (tvR - tvL - 20) / n;
      var maxL = KS.shadowLen(0);
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("廿四气影长(模型 tan 几何 vs 《周髀》损益表)", tvL, topY + 12);
      var names = ["冬","小","大","立","雨","惊","春","清","谷","立","小","芒","夏","小","大","立","处","白","秋","寒","霜","立","小","大"];
      for (var i = 0; i < n; i++) {
        var f = i / 24;
        var L = KS.shadowLen(f);
        var hh = L / maxL * (chainY - topY - 64);
        ctx.fillStyle = i === 0 || i === 12 ? red : "rgba(42,38,32,0.65)";
        ctx.fillRect(tvL + 10 + i * bw, chainY - 16 - hh, bw - 2, hh);
        ctx.fillStyle = faint; ctx.font = "600 8px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(names[i], tvL + 10 + i * bw + bw / 2, chainY - 2);
      }
      /* 夏至参考线 */
      var yS = chainY - 16 - KS.shadowLen(0.5) / maxL * (chainY - topY - 64);
      ctx.strokeStyle = red; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(tvL + 8, yS); ctx.lineTo(tvR - 8, yS); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("虚线:夏至 1.6尺(周髀)—— 模型柱高与之齐(红柱=两至)", tvL + 4, chainY - 18);
      ctx.fillText("「气损益九寸九分六分分之一」——《周髀》影长表为等差近似,模型取精确 tan 几何", tvL + 4, chainY - 8);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["八尺表", "周髀 8×0.231=1.848m"], ["圭 量天尺", "南向 3.5m 水槽校平"],
        ["正午太阳", "h = 90°−φ+δ"], ["影长几何", "L = H/tan(h)"],
        ["廿四气", "δ=asin(sin24°·sinλ)"], ["两至自洽", "夏至1.6尺 冬至13.5尺"]
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
      '<tr><th>表</th><td>「周髀长八尺」周尺 0.231</td><td>H = 1.848 m</td></tr>' +
      '<tr><th>圭</th><td>南向石尺(须容冬至影)</td><td>3.5 m</td></tr>' +
      '<tr><th>纬度</th><td>由两至影长反推(阳城一带)</td><td>φ = 35.3°</td></tr>' +
      '<tr><th>黄赤大距</th><td>古值</td><td>ε = 24°</td></tr>' +
      '<tr><th>量天尺</th><td>登封观星台(郭守敬高表)</td><td>31.19 m</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>太阳高度:h = 90°−φ+δ,δ = asin(sin24°·sinλ),λ 每 15° 一气。</p>' +
      '<p>夏至(δ=+24°):h = 78.7°,L = 1.848/tan78.7° = 0.374m = 1尺6寸(周尺)——「夏至之日晷一尺六寸」,差 &lt;5mm(载入断言)。</p>' +
      '<p>冬至(δ=−24°):h = 30.7°,L = 2.96m ≈ 一丈三尺五寸(3.12m,差 5%,《周髀》影长表含观测系统差,标注)。</p>' +
      '<p>影长逐帧积分校验(maxErr&lt;1e-9);「千里差一寸」假设已被唐一行证伪(仅作文献背景)。</p>' +
      '<h4>文献</h4>' +
      '<p>《周髀算经·卷上》:「周髀长八尺,夏至之日晷一尺六寸。髀者,股也;正晷者,句也。」「冬至晷长一丈三尺五寸……凡八节二十四气,气损益九寸九分六分分之一。」</p>'
  };
})(window.MECH = window.MECH || {});
