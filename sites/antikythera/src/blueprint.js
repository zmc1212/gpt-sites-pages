/* 图纸面板(B 键):安提基特拉机械 — 正面/背面布置 + 轮系链路 + 全齿轮齿数表 */
(function (MECH) {
  var ink = "#2A2620", faint = "rgba(42,38,32,0.35)", red = "#8C2F1E", brass = "#8A6E3F";

  function box(ctx, x, y, w, h, l1, l2) {
    ctx.strokeStyle = ink;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = ink;
    ctx.font = "700 9.5px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(l1, x + w / 2, y + 13);
    if (l2) {
      ctx.font = "600 7.5px Menlo, monospace";
      ctx.fillStyle = faint;
      ctx.fillText(l2, x + w / 2, y + 26);
    }
  }

  MECH.BP = {
    no: "Fig. 01 · 复原总图",
    title: "安提基特拉机械 · Freeth 2006/2008 复原模型(齿数按 Efstathiou 实测)",
    src: "Freeth et al., Nature 444 (2006) / 454 (2008) / Sci Rep 11 (2021) · Tsigkros (2015) Tab.1-3 · 布局按啮合距离推出",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = 1.3;

      /* 公式横幅(顶部) */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("月轮系 64/38 × 48/24 × 127/32 = 254/19 · 恒星月 27.321d · 月行差 ε≈0.1146(销槽 2.25:19.6)· 梅顿 5/19 · 竞技会 57/60→恰4年 · 沙罗 940/4237", w * 0.04, 26);

      /* ============ 左:正面布置(黄道环 + 历法环 + 指针) ============ */
      var cxL = w * 0.145, cyL = h * 0.36, S = Math.min(w * 0.24 / 8.5, (h * 0.62) / 8.8);
      ctx.font = "700 10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillStyle = ink;
      ctx.fillText("正面 FRONT", cxL - 2.4 * S, cyL - 4.1 * S);
      /* 前板圆孔 */
      ctx.beginPath(); ctx.arc(cxL, cyL, (D.zodiacR[0] - 0.12) * S, 0, Math.PI * 2); ctx.stroke();
      /* 黄道环 */
      ctx.beginPath(); ctx.arc(cxL, cyL, D.zodiacR[0] * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cxL, cyL, D.zodiacR[1] * S, 0, Math.PI * 2); ctx.stroke();
      /* 历法环 */
      ctx.beginPath(); ctx.arc(cxL, cyL, D.calR[0] * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cxL, cyL, D.calR[1] * S, 0, Math.PI * 2); ctx.stroke();
      /* 365 刻度 */
      ctx.strokeStyle = faint;
      ctx.lineWidth = 0.7;
      for (var i = 0; i < 73; i++) {
        var a = -Math.PI / 2 + i / 73 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cxL + Math.cos(a) * D.calR[0] * S, cyL + Math.sin(a) * D.calR[0] * S);
        ctx.lineTo(cxL + Math.cos(a) * D.calR[1] * S, cyL + Math.sin(a) * D.calR[1] * S);
        ctx.stroke();
      }
      /* 指针 */
      ctx.strokeStyle = red;
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(cxL, cyL); ctx.lineTo(cxL, cyL - 5.9 * S); ctx.stroke();
      ctx.strokeStyle = brass;
      ctx.beginPath(); ctx.moveTo(cxL, cyL); ctx.lineTo(cxL + 1.4 * S, cyL + 5.5 * S); ctx.stroke();
      ctx.fillStyle = red;
      ctx.font = "600 8px sans-serif";
      ctx.fillText("日期(b1)", cxL + 4, cyL - 5.4 * S);
      ctx.fillStyle = brass;
      ctx.fillText("月(b3)+月相球", cxL + 6, cyL + 5.2 * S);
      /* b1 主轮(孔后可见) */
      ctx.strokeStyle = faint;
      ctx.beginPath(); ctx.arc(cxL, cyL, 6.13 * S * 0.999, 0, Math.PI * 2); ctx.stroke();
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (dv) {
        ctx.beginPath(); ctx.arc(cxL + dv[0] * 2.6 * S, cyL + dv[1] * 2.6 * S, 2.0 * S, 0, Math.PI * 2); ctx.stroke();
      });

      /* ============ 中:背面布置(双螺旋 + 三副盘) ============ */
      var cxM = w * 0.435, cyM = h * 0.36;
      var SM = S * 0.92;
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = 1.3;
      ctx.font = "700 10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("背面 BACK", cxM - 3.8 * SM, cyM - 4.3 * SM);
      /* 梅顿五圈螺旋 */
      var n0 = D.AX.n, g0 = D.AX.g;
      var nx = cxM + (n0[0] - n0[0]) * SM, ny = cyM - 2.0 * SM;
      for (var t = 0; t < 5; t++) {
        var rr = (D.metSpiral[0] + (D.metSpiral[1] - D.metSpiral[0]) * t / 4) * SM * 0.62;
        ctx.beginPath(); ctx.arc(nx, ny, rr, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(nx + 2.6 * SM, ny + 2.4 * SM); ctx.stroke();
      ctx.fillStyle = red;
      ctx.font = "600 8px sans-serif";
      ctx.fillText("梅顿 235月/5圈", nx + 2.8 * SM, ny - 0.4 * SM);
      /* 沙罗四圈螺旋 */
      var sx2 = cxM + (g0[0] - n0[0]) * SM * 0.9, sy2 = cyM + 2.3 * SM;
      for (var t2 = 0; t2 < 4; t2++) {
        var rr2 = (D.sarSpiral[0] + (D.sarSpiral[1] - D.sarSpiral[0]) * t2 / 3) * SM * 0.62;
        ctx.beginPath(); ctx.arc(sx2, sy2, rr2, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = brass;
      ctx.fillText("沙罗 223月/4圈", sx2 + 1.8 * SM, sy2 - 0.6 * SM);
      /* 三副盘 */
      var o0 = D.AX.o, q0 = D.AX.q, i0 = D.AX.i;
      [["竞技会 4年", o0, D.subR.o], ["卡利普斯 76年", q0, D.subR.q], ["Exeligmos 54年", i0, D.subR.i]].forEach(function (s) {
        var px = cxM + (s[1][0] - n0[0]) * SM * 0.9, py = cyM + (s[1][1] - n0[1] + 2.2) * SM * 0.9;
        ctx.beginPath(); ctx.arc(px, py, s[2] * SM * 0.62, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - s[2] * SM * 0.5); ctx.stroke();
        ctx.fillStyle = ink;
        ctx.font = "600 7.5px sans-serif";
        ctx.fillText(s[0], px - 12, py + s[2] * SM * 0.62 + 8);
      });

      /* ============ 右:齿轮轴位布置(按 DIM.AX 推导位置) ============ */
      var cxR = w * 0.735, cyR = h * 0.36, SR = Math.min(w * 0.30 / 15, h * 0.30 / 7.5);
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.font = "700 10px sans-serif";
      ctx.fillText("轮系轴位 GEARS(顶视布局)", cxR - 3.2 * SR, cyR - 3.9 * SR);
      Object.keys(D.AX).forEach(function (key) {
        var px = cxR + D.AX[key][0] * SR, py = cyR + (D.AX[key][1] - 0.6) * SR;
        ctx.beginPath(); ctx.arc(px, py, 1.6, 0, Math.PI * 2); ctx.fill();
        ctx.font = "600 6.5px Menlo, monospace";
        ctx.fillStyle = faint;
        ctx.fillText(key.toUpperCase(), px + 3, py - 3);
        ctx.fillStyle = ink;
      });
      /* 大轮示意圈 */
      [["b", "b1"], ["Ec", "e3"], ["d", "d2"], ["m", "m1"]].forEach(function (gg) {
        var px = cxR + D.AX[gg[0]][0] * SR, py = cyR + (D.AX[gg[0]][1] - 0.6) * SR;
        ctx.strokeStyle = faint;
        ctx.beginPath(); ctx.arc(px, py, MECH.KS.r(gg[1]) * SR * 2.2, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = ink;
      });

      /* ============ 底部:轮系链路 ============ */
      var chainY = h * 0.66;
      var rows = [
        [["b1 223", "主驱·1转/年"], ["b2 64", "厚轮·兼驱"], ["c1 38+c2 48", "×64/38 ×48/24"], ["d1 24+d2 127", "×127/32·质因数"], ["e2 32+e5 50", "=254/19"], ["k1销/k2槽 50", "ε≈0.1146"], ["e6 50+e1 32", "回传"], ["b3 32→月指针", "恒星月27.32d"]],
        [["l1 38+l2 53", "×64/38 ×53/96"], ["m1 96+m2 15", "×15/53"], ["n1 53·梅顿", "=5/19·5圈/19年"], ["n2 57→o1 60", "竞技会恰4年"], ["n3 15→p 60/20", "×1/20"], ["q1 60·卡利普斯", "恰76年"]],
        [["m3 27→e3 223", "×27/223·8.88年"], ["e4 188→f 53/30", "×188/53 ×30/54"], ["g1 54·沙罗", "940/4237·4圈"], ["g2 20→h 60/15", "×1/12"], ["i1 60·Exeligmos", "54年·8/16时"]]
      ];
      rows.forEach(function (row, ri) {
        var bwid = (w * 0.92) / row.length;
        var yy = chainY + ri * 40;
        row.forEach(function (b, bi) {
          var bx = w * 0.04 + bi * bwid;
          box(ctx, bx, yy, bwid - 8, 32, b[0], b[1]);
          if (bi < row.length - 1) {
            ctx.beginPath();
            ctx.moveTo(bx + bwid - 8, yy + 16);
            ctx.lineTo(bx + bwid - 2, yy + 16);
            ctx.stroke();
          }
        });
      });
    },
    table:
      '<h4>齿轮齿数表(实测 × / 推测 ○)</h4><table>' +
      '<tr><th>b1</th><td>223 · 主驱动轮(十字辐条,径13cm)· 1转=1年</td><td>×</td></tr>' +
      '<tr><th>b2</th><td>64 · 同轴厚轮,兼驱月链与历法链</td><td>×</td></tr>' +
      '<tr><th>c1 / c2</th><td>38 / 48 · 复式轮</td><td>× / ×</td></tr>' +
      '<tr><th>d1 / d2</th><td>24 / 127 · 同轴(127 = 254 的质因数)</td><td>× / ×</td></tr>' +
      '<tr><th>e1 / e2 / e3 / e4 / e5 / e6</th><td>32 / 32 / 223 / 188 / 50 / 50</td><td>× × × × × ×</td></tr>' +
      '<tr><th>k1 / k2</th><td>50 / 50 · 销槽装置(偏心轴)</td><td>× ×</td></tr>' +
      '<tr><th>f1 / f2</th><td>53 / 30</td><td>× ×</td></tr>' +
      '<tr><th>g1 / g2</th><td>54 / 20 · g1 = 沙罗指针</td><td>× ×</td></tr>' +
      '<tr><th>h1 / h2 / i1</th><td>60 / 15 / 60 · i1 = Exeligmos 指针</td><td>× × ×</td></tr>' +
      '<tr><th>l1 / l2 / m1 / m2</th><td>38 / 53 / 96 / 15</td><td>× × × ×</td></tr>' +
      '<tr><th>m3 / n1 / n2 / n3</th><td>27 / 53 / 57 / 15(遗失件复原推测)</td><td>○ ○ ○ ○</td></tr>' +
      '<tr><th>p1 / p2 / q1</th><td>60 / 12 / 60(推测;q1 卡利普斯指针)</td><td>○ ○ ○</td></tr>' +
      '<tr><th>o1</th><td>60 · 竞技会指针(Fragment B 唯一实物齿轮)</td><td>×</td></tr>' +
      '</table><h4>轮系验算</h4>' +
      '<p>月:b2→e2 = 64/38 × 48/24 × 127/32 = 254/19 → 恒星月 19×365.25/254 = 27.3213 d(现代 27.32166 d)。</p>' +
      '<p>月相(月−日差动):254/19 − 1 = 235/19 → 朔望月 29.5306 d(现代 29.53059 d);19 年恰 235 个朔望月。</p>' +
      '<p>梅顿:64/38 × 53/96 × 15/53 = 5/19 → 19 年指针恰转 5 圈(五圈螺旋 235 格)。</p>' +
      '<p>竞技会:n2 57 → o1 60,5/19 × 57/60 = 1/4 → 恰 4 年/转(四年一循环)。</p>' +
      '<p>沙罗:64/38 × 53/96 × 27/223 × 188/53 × 30/54 = 940/4237 = 4×235/(223×19) → 4 转一沙罗 6585.3 d(现代 6585.32 d)。</p>' +
      '<p>Exeligmos:×20/60 ×15/60 = 1/12 → 54.09 年/转(三沙罗,盘面 8/16 小时修正)。</p>' +
      '<p>e3/e4 轴:64/38 × 53/96 × 27/223 → 8.8826 年/转(月球拱点进动,现代 8.85 年)。</p>' +
      '<h4>文献与口径</h4>' +
      '<p>Freeth et al. 2006/2008(Nature)、Freeth 2021(Sci Rep)、Efstathiou et al. 齿数实测(转引 Tsigkros 2015)。</p>' +
      '<p>口径明示:n/m3/p/q 系遗失件按周期关系复原;Freeth 2006 用 d1/d2+k1/k2 双销槽二阶月行差,' +
      '本站按 AMRP 单销槽口径实现(均速严格 254/19,ε 与扫描一致);背盘月名/蚀相符号为示意分布。</p>'
  };
})(window.MECH = window.MECH || {});
