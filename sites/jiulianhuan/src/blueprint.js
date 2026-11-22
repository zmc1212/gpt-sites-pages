/* 图纸面板(B 键):九连环总图 — 结构侧视 + 解法规格 + 传动链 */
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
    no: "Fig. 20 · 复原总图",
    title: "九连环 · 解环状态机(格雷码,f(9)=341 步)",
    src: "《战国策·齐策六》(渊源)+《红楼梦》第七回(明清定型)+ Gros 1872/格雷码(数学)",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainH = 46, chainY = h - chainH - 12, topY = 36;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.4;

      ctx.fillStyle = red; ctx.font = "700 11px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("f(n) = f(n−1)+2f(n−2)+1, f(1)=1, f(2)=2 → f(9) = 341 = ⌊2¹⁰/3⌋ · 状态序列 = 二进制反射格雷码 · 第k环可动 ⇔ k−1在框∧更前全下", w * 0.03, topY - 12);

      /* ============ 左:结构侧视(在框/下框两态) ============ */
      var svL = w * 0.03, svR = w * 0.50;
      var S = Math.min((svR - svL - 14) / 0.8, (chainY - topY - 30) / 0.75);
      var ox = svL + 30, oy = chainY - 18;
      var X = function (m) { return ox + (m + 0.42) * S; };
      var Y = function (m) { return oy - (m - 0.92) * S; };
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText("结构 SIDE(钗:柄环+框梁+底板)", svL, topY + 12);
      /* 底板 */
      ctx.strokeRect(X(-0.26), Y(0.30) - 0.014 * S, 0.62 * S, 0.028 * S);
      /* 框梁 */
      ctx.beginPath(); ctx.moveTo(X(-0.40), Y(0.92)); ctx.lineTo(X(0.42), Y(0.92)); ctx.stroke();
      /* 柄环 */
      ctx.beginPath(); ctx.arc(X(-0.40), Y(0.92), 0.075 * S, 0, Math.PI * 2); ctx.stroke();
      /* 环 1(在框态)+ 环 9(下框态)示意 */
      ctx.beginPath(); ctx.arc(X(-0.22), Y(0.92), 0.052 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(-0.22), Y(0.92) - 0.052 * S); ctx.lineTo(X(-0.22), Y(0.30)); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(0.22), Y(0.44), 0.052 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(0.22), Y(0.492)); ctx.lineTo(X(0.22), Y(0.30)); ctx.stroke();
      /* 底板孔 */
      for (var i = 0; i < 9; i++) {
        ctx.beginPath(); ctx.arc(X(D.ringX[i]), Y(0.30), 3, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("环 1(在框:套框梁,杆插孔)", X(-0.24), Y(0.66));
      ctx.fillText("环 9(下框:脱梁落孔位)", X(0.10), Y(0.52));
      ctx.fillText("钗柄环(西端)", X(-0.44), Y(1.02));
      ctx.fillText("框梁(开口端 +x,卸环方向)", X(-0.10), Y(0.98));
      /* 尺寸 */
      arrow(ctx, X(-0.26), Y(0.14), X(0.36), Y(0.14), "底板 9 孔", true);
      arrow(ctx, X(-0.40), Y(1.06), X(0.42), Y(1.06), "框梁 0.52m", false);
      ctx.fillText("环径 0.104m(演示放大)", X(-0.30), Y(0.62));

      /* ============ 右:解法规格(f(n) 表 + 规则) ============ */
      var tvL = w * 0.53, tvR = w * 0.98;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("f(n) 递推与格雷码", tvL, topY + 12);
      /* f(n) 柱状 */
      var fvals = [1, 2, 5, 10, 21, 42, 85, 170, 341];
      var bw = (tvR - tvL - 24) / 9;
      for (var k = 1; k <= 9; k++) {
        var v = fvals[k - 1];
        var hh = v / 341 * (chainY - topY - 66);
        ctx.fillStyle = k === 9 ? red : "rgba(42,38,32,0.6)";
        ctx.fillRect(tvL + 12 + (k - 1) * bw, chainY - 16 - hh, bw - 3, hh);
        ctx.fillStyle = faint; ctx.font = "600 8px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(k, tvL + 12 + (k - 1) * bw + bw / 2, chainY - 2);
        ctx.fillText(v, tvL + 12 + (k - 1) * bw + bw / 2, chainY - 20 - hh);
      }
      ctx.fillStyle = soft; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("f(n) = f(n−1)+2f(n−2)+1 = ⌊2^(n+1)/3⌋", tvL + 4, chainY - 8);
      ctx.fillText("状态序列 = 二进制反射格雷码 G(k) = k⊕(k>>1)", tvL + 4, chainY + 2);
      ctx.fillText("规则:第 1 环随时动;第 k 环可动 ⇔ k−1 在框 ∧ 更前全下", tvL + 4, chainY + 16);
      ctx.fillText("起手:全上态两解,取第 2 环(唯一 341 步路径)", tvL + 4, chainY + 30);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["全上环", "9 环 111111111"], ["起手第2环", "唯一路径起点"],
        ["状态机", "合法移动唯一(非回退)"], ["格雷码", "状态=G(k) 341步"],
        ["全下完成", "000000000 ✓"], ["逆转复原", "同路径逆走"]
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
      '<h4>部件尺寸(演示放大)</h4><table>' +
      '<tr><th>钗</th><td>柄环 + 框梁 0.52m(开口端卸环)+ 底板 9 孔</td><td>—</td></tr>' +
      '<tr><th>环</th><td>径 0.104m × 9 · 各带环杆穿底板孔</td><td>—</td></tr>' +
      '<tr><th>状态</th><td>9 位(1=在框);全上 511 → 全下 0</td><td>341 步</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>步数:f(n) = f(n−1)+2f(n−2)+1 → f(9) = 341;闭式 ⌊2^(n+1)/3⌋(载入完整解算 341 步,断言)。</p>' +
      '<p>合法性:每步按规则校验(第 k 环 ⇔ k−1 在框 ∧ 更前全下;第 1 环随时),断言全程合法。</p>' +
      '<p>格雷码:第 k 步后状态 = G(k) 反射格雷码(断言起手第 2 环)。</p>' +
      '<p>计数逐帧校验(maxErr&lt;1e-9);演示步速 12 步/s(真实手解约 20-60 分钟)。</p>' +
      '<h4>文献</h4>' +
      '<p>《战国策·齐策六》:「秦昭王尝遣使者遗君王后玉连环……君王后引椎椎破之」(渊源;玉连环未必即九连环)。</p>' +
      '<p>《红楼梦》第七回:「却在宝玉房中大家解九连环顽呢」(明清定型)。数学:Gros《Théorie du Baguenodier》(1872);格雷码对应(中研院数学传播)。</p>'
  };
})(window.MECH = window.MECH || {});
