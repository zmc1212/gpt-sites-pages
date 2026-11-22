/* 图纸面板(B 键):墨经小孔成像 — 相似三角光路 / 半影带 / 三孔径 / 条文与数表 */
(function (MECH) {
  var ink = "#2A2620", faint = "rgba(42,38,32,0.35)", red = "#8C2F1E", brass = "#8A6E3F";
  var D = MECH.DIM, KS = MECH.KS;

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
    no: "Fig. 01 · 小孔成像光路与几何总图",
    title: "墨经小孔成像 · 暗室暗箱(景到,在午有端)",
    src: "《墨经·经下/经说下》(约 BC 4 世纪)+ 谭戒甫《墨经分类译注》/ Needham《中国科学技术史》光学卷 · 对照:西方 camera obscura",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = 1.3;
      var a = D.A_FIG, b = D.B_DEFAULT, d = D.D_DEFAULT;

      /* 公式横幅 */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("倒像 y′=−y·b/a(足上首下) · 半影 Δ=d(a+b)/a · 照度 ∝ d² · 日像 ≈ b·tan0.53°+d · 景长=物长·b/a · 行走 Δy′=−Δx·b/a", w * 0.03, 24);

      /* ===== 左:光路主图(相似三角) ===== */
      var gx0 = w * 0.04, gy0 = 48, gw = w * 0.44, gh = h * 0.52;
      ctx.font = "700 10px sans-serif";
      ctx.fillText("① 光线直进 · 相似三角(足上首下)", gx0, gy0);
      var oy = gy0 + gh * 0.56;
      var px = function (xmm) { return gx0 + (xmm + 260) / 430 * gw; };
      var sc = (gh * 0.72) / 120;
      /* 墙 */
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(px(0), oy - 52 * sc); ctx.lineTo(px(0), oy - 2.5 * sc);
      ctx.moveTo(px(0), oy + 2.5 * sc); ctx.lineTo(px(0), oy + 52 * sc);
      ctx.stroke();
      ctx.fillStyle = faint;
      ctx.font = "600 7.5px sans-serif";
      ctx.fillText("墙(午)· 孔(端)", px(0) - 30, oy - 54 * sc);
      /* 光线 */
      [["足", -30, red], ["首", 30, brass]].forEach(function (it) {
        [-1, 1].forEach(function (rim) {
          var r = KS.rayTo(it[1], rim * d / 2, a, b);
          ctx.strokeStyle = it[2];
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(px(-a), oy - r.pts[0][1] * sc);
          ctx.lineTo(px(0), oy - r.pts[1][1] * sc);
          ctx.lineTo(px(b), oy - r.pts[2][1] * sc);
          ctx.stroke();
        });
      });
      /* 物/景 */
      function arrow(xAt, y0, y1, color, label) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(xAt, oy - y0 * sc); ctx.lineTo(xAt, oy - y1 * sc); ctx.stroke();
        ctx.fillStyle = color;
        var tip = oy - y1 * sc, dirn = y1 > y0 ? 1 : -1;
        ctx.beginPath(); ctx.moveTo(xAt, tip); ctx.lineTo(xAt - 4, tip - dirn * 6); ctx.lineTo(xAt + 4, tip - dirn * 6);
        ctx.closePath(); ctx.fill();
        ctx.font = "600 8px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(label, xAt, tip - dirn * 10);
      }
      arrow(px(-a), -30, 30, ink, "人(正立)");
      arrow(px(b), KS.imgY(-30, a, b), KS.imgY(30, a, b), red, "景(倒立)");
      /* 屏 */
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px(b), oy - 48 * sc); ctx.lineTo(px(b), oy + 48 * sc); ctx.stroke();
      ctx.fillStyle = ink;
      ctx.font = "600 8px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("屏 x=b=" + b, px(b) + 4, oy - 40 * sc);
      ctx.fillStyle = faint;
      ctx.fillText("a=" + a, px(-a / 2) - 12, oy + 56 * sc);
      ctx.fillText("b=" + b, px(b / 2) - 10, oy + 56 * sc);

      /* ===== 中:半影带 ===== */
      var bx0 = w * 0.51, by0 = 48, bw = w * 0.22, bh = h * 0.52;
      ctx.fillStyle = ink;
      ctx.font = "700 10px sans-serif";
      ctx.fillText("② 点物半影 Δ=d(a+b)/a", bx0, by0);
      var py0 = by0 + 30, pw = bw - 20;
      /* 点物发散锥 + 孔 + 模糊圆 */
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.2;
      var cxO = bx0 + 14, cyO = py0 + 30, cxS = bx0 + pw - 14;
      var holeX = cxO + (cxS - cxO) * a / (a + b);
      var rH = d / 2 * 1.6, rB = KS.penumbra(d, a, b) / 2 * 1.6;
      ctx.beginPath(); ctx.moveTo(cxO, cyO - 1); ctx.lineTo(holeX, cyO - rH); ctx.lineTo(cxS, cyO - rB); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cxO, cyO + 1); ctx.lineTo(holeX, cyO + rH); ctx.lineTo(cxS, cyO + rB); ctx.stroke();
      ctx.fillStyle = "rgba(140,47,30,0.25)";
      ctx.beginPath(); ctx.arc(cxS, cyO, rB, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = red;
      ctx.beginPath(); ctx.arc(cxS, cyO, rB, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = red;
      ctx.font = "700 8.5px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("Δ=" + KS.penumbra(d, a, b).toFixed(1) + "mm", cxS - 22, cyO + rB + 12);
      ctx.fillStyle = faint;
      ctx.font = "600 7.5px sans-serif";
      ctx.fillText("点物 · 孔 d=" + d, cxO - 8, cyO + 24);
      ctx.fillText("屏 · 模糊圆", cxS - 24, cyO - rB - 6);
      ctx.fillStyle = ink;
      ctx.font = "700 9.5px sans-serif";
      ctx.fillText("大孔 → 亮而糊", bx0, by0 + bh * 0.62);
      ctx.fillText("小孔 → 暗而锐", bx0, by0 + bh * 0.72);
      ctx.fillStyle = faint;
      ctx.font = "600 8px sans-serif";
      ctx.fillText("照度 ∝ d²(面积)", bx0, by0 + bh * 0.84);

      /* ===== 右:三孔径对照 ===== */
      var cx0 = w * 0.76, cy0 = 48, cw2 = w * 0.21, ch2 = h * 0.52;
      ctx.fillStyle = ink;
      ctx.font = "700 10px sans-serif";
      ctx.fillText("③ 孔径三例(b=90)", cx0, cy0);
      [[20, "亮 · 极糊"], [5, "均衡"], [2, "暗 · 极锐"]].forEach(function (r, i) {
        var yy = cy0 + 28 + i * 44;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(cx0 + 16, yy, Math.min(11, r[0] * 0.85), 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = "rgba(140,47,30,0.2)";
        ctx.beginPath(); ctx.arc(cx0 + 16, yy, Math.min(11, r[0] * 0.85), 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = ink;
        ctx.font = "700 9px sans-serif"; ctx.textAlign = "left";
        ctx.fillText("d=" + r[0] + "mm", cx0 + 36, yy - 2);
        ctx.fillStyle = faint;
        ctx.font = "600 7.5px Menlo, monospace";
        ctx.fillText("Δ=" + KS.penumbra(r[0], a, b).toFixed(1) + " 亮" + KS.lumRatio(r[0], 10).toFixed(2) + "×", cx0 + 36, yy + 10);
        ctx.fillText(r[1], cx0 + 36, yy + 21);
      });

      /* ===== 底部:条文与链路 ===== */
      var chainY = h * 0.72;
      var rows = [
        [["《经下》景到", "倒立于内壁"], ["在午有端", "墙=午 · 孔=端"], ["与景长", "景长=物长·b/a"], ["足蔽下光", "成景于上(倒)"], ["首蔽上光", "成景于下"], ["煦若射", "光直进"], ["端与景长", "点物有端则形具"]],
        [["物距 a=110", "人到孔"], ["像距 b=60…150", "屏在轨上滑"], ["孔径 d=2…20", "端之大小"], ["照度 ∝ d²", "(d/10)² 基准"], ["日像 b·tan+5", "=5.83mm"], ["对照 camera", "obscura 同型几何"]]
      ];
      rows.forEach(function (row, ri) {
        var bwid = (w * 0.94) / row.length;
        var yy = chainY + ri * 44;
        row.forEach(function (bb, bi) {
          box(ctx, w * 0.03 + bi * bwid, yy, bwid - 8, 36, bb[0], bb[1]);
          if (bi < row.length - 1) {
            ctx.beginPath();
            ctx.moveTo(w * 0.03 + bi * bwid + bwid - 8, yy + 18);
            ctx.lineTo(w * 0.03 + bi * bwid + bwid - 2, yy + 18);
            ctx.stroke();
          }
        });
      });
    },
    table:
      '<h4>几何验算(a=110,b=90,d=5)</h4><table>' +
      '<tr><th>足之景(−30)</th><td>y′ = −(−30)·90/110 = +24.55mm(于上)</td></tr>' +
      '<tr><th>首之景(+30)</th><td>y′ = −16.36mm(于下)· 倒立成立</td></tr>' +
      '<tr><th>景长(人 60mm)</th><td>60×90/110 = 49.09mm(放大 0.82 倍)</td></tr>' +
      '<tr><th>半影 Δ</th><td>5×(110+90)/110 = 9.09mm(追迹复核一致)</td></tr>' +
      '<tr><th>日像直径</th><td>90×tan0.53° + 5 = 0.83+5 = 5.83mm</td></tr>' +
      '<tr><th>照度比</th><td>d=10 : d=5 : d=2 = 1 : 0.25 : 0.04(∝d²)</td></tr>' +
      '</table><h4>像距滑动(b)</h4><table>' +
      '<tr><th>b mm</th><td>60</td><td>90</td><td>150</td></tr>' +
      '<tr><th>景长 mm</th><td>32.73</td><td>49.09</td><td>81.82</td></tr>' +
      '<tr><th>半影 mm</th><td>7.36</td><td>9.09</td><td>13.36</td></tr>' +
      '</table><p>b 增大:像变大、照度按 1/b² 衰减、半影变宽;原型演示以 d 与 b 联动补偿。</p>' +
      '<h4>墨经条文与本站口径</h4>' +
      '<p>《经下》「景到,在午有端,与景长,说在端」:景(像)倒立;光线经「端」(小孔)而成;' +
      '像之大小随物-孔-屏之距而变。《经说下》「光之人,煦若射,下者之人也高;高者之人也下。' +
      '足蔽下光,故成景于上;首蔽上光,故成景于下」——足部光线射向上方成景于上,正即相似三角形倒像。</p>' +
      '<p>本站将条文逐句对应为可验算几何:端=孔径 d,午=隔墙,景长=物长·b/a;半影与照度两式为现代口径,' +
      '用于演示「大孔明而糊/小孔暗而锐」的权衡,不属《墨经》原文主张。对照:西方 camera obscura 同型几何,' +
      '《墨经》早约两千年。</p>'
  };
})(window.MECH = window.MECH || {});
