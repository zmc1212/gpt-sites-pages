/* 图纸面板(B 键):琢玉水凳总图 — 侧视 + 俯视 + 传动链
   分区:公式横幅(顶) / 侧视(左 0.03-0.50w) / 俯视(右 0.53-0.98w) / 传动链(底) */
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
    no: "Fig. 05 · 复原总图",
    title: "琢玉水凳 · 《天工开物·珠玉》横轴砣机(扎碢制式)",
    src: "《天工开物·珠玉》+ 清·李澄渊《玉作图》(1891)扎碢幅 · 配重回位为推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainH = 46, chainY = h - chainH - 12, topY = 36;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.4;

      ctx.fillStyle = red; ctx.font = "700 11px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("缘速比 i = R碢/r鼓 = 0.14/0.045 = 3.11 · φ轴 = L踏·sinφ踏/r鼓(±3.5rad) · 踏频 45/min(文献 40-60) · 划痕 ∝ ∫|φ̇|·R碢dt", w * 0.03, topY - 12);

      /* ============ 左:侧视(x-y,西左东右) ============ */
      var svL = w * 0.03, svR = w * 0.50;
      var S = Math.min((svR - svL - 10) / 1.9, (chainY - topY - 30) / 1.5);
      var ox = svL + 4, oy = chainY - 16;
      var X = function (m) { return ox + (m + 0.95) * S; };
      var Y = function (m) { return oy - m * S; };
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText("侧视 SIDE(碢轮-踏板)", svL, topY + 12);
      /* 地面 */
      ctx.beginPath(); ctx.moveTo(X(-0.95), Y(0)); ctx.lineTo(X(0.95), Y(0)); ctx.stroke();
      /* 凳面 + 腿 */
      ctx.strokeRect(X(-0.75), Y(D.benchY + 0.035), D.benchL * S, 0.07 * S);
      [-0.62, 0.62].forEach(function (px) {
        ctx.strokeRect(X(px) - 3, Y(D.benchY - 0.10), 6, (D.benchY - 0.10) * S);
      });
      /* 主轴 + 碢轮 + 轴鼓 */
      ctx.strokeRect(X(-0.575), Y(D.axleY) - 2, 1.15 * S, 4);
      ctx.beginPath(); ctx.arc(X(D.discX), Y(D.axleY), D.Rdisc * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(D.drumX), Y(D.axleY), (D.rdrum + 0.01) * S, 0, Math.PI * 2); ctx.stroke();
      /* 绳(轴鼓→踏板尾) + 踏板 + 配重 */
      ctx.beginPath(); ctx.moveTo(X(D.drumX), Y(D.axleY)); ctx.lineTo(X(D.pedalX), Y(D.pedalY + 0.05)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(D.pedalPivotX), Y(D.pedalY + 0.05));
      ctx.lineTo(X(D.pedalPivotX + D.pedalL - 0.1), Y(D.pedalY + 0.05 + 0.15 * 0.44)); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(D.pedalPivotX), Y(D.pedalY + 0.05), 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(X(D.drumX) - 4, Y(D.axleY)); ctx.lineTo(X(D.drumX) - 4, Y(D.axleY - 0.55)); ctx.stroke();
      ctx.strokeRect(X(D.drumX) - 9, Y(D.axleY - 0.55), 10, 0.14 * S);
      /* 玉料 + 锅架 + 砂浆 */
      ctx.strokeRect(X(D.jadeX - 0.04), Y(D.jadeY), 0.075 * S, 0.16 * S);
      ctx.strokeRect(X(D.discX - 0.1), Y(1.05 + 0.06), 0.44 * S, 5);
      ctx.beginPath(); ctx.arc(X(D.discX + 0.12), Y(1.17), 0.11 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("铁碢 r0.14", X(D.discX) - 8, Y(D.axleY + 0.24));
      ctx.fillText("轴鼓 r0.045", X(D.drumX) + 6, Y(D.axleY - 0.10));
      ctx.fillText("玉料·划痕", X(D.jadeX) - 8, Y(D.jadeY + 0.24));
      ctx.fillText("解玉砂浆盆", X(D.discX + 0.24), Y(1.20));
      /* 尺寸 */
      arrow(ctx, X(D.discX) - D.Rdisc * S, Y(D.axleY + 0.34), X(D.discX) + D.Rdisc * S, Y(D.axleY + 0.34), "碢径 0.28m", false);
      arrow(ctx, X(-0.95), Y(-0.30), X(0.95), Y(-0.30), "凳长 1.5m", true);

      /* ============ 右:俯视(凳面布局) ============ */
      var tvL = w * 0.53, tvR = w * 0.98;
      var S2 = Math.min((tvR - tvL - 12) / 2.3, (chainY - topY - 44) / 1.6);
      var X2 = function (m) { return tvL + 8 + (m + 1.15) * S2; };
      var Z2 = function (m) { return topY + 40 + (m + 0.8) * S2; };
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("俯视 PLAN", tvL, topY + 12);
      ctx.strokeRect(X2(-0.75), Z2(-0.31), D.benchL * S2, D.benchW * S2);
      ctx.strokeRect(X2(-0.75 + 0.05), Z2(-0.23), (D.benchL - 0.1) * S2, (D.benchW - 0.16) * S2);
      ctx.beginPath(); ctx.arc(X2(D.discX), Z2(0), D.Rdisc * S2, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X2(D.drumX), Z2(0), (D.rdrum + 0.01) * S2, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X2(D.discX), Z2(0)); ctx.lineTo(X2(D.drumX), Z2(0)); ctx.stroke();
      ctx.strokeRect(X2(D.pedalPivotX), Z2(-0.08), D.pedalL * S2, 0.16 * S2);
      ctx.strokeRect(X2(D.jadeX - 0.10), Z2(-0.12), 0.075 * S2, 0.16 * S2);
      ctx.strokeRect(X2(0.80), Z2(-0.17), 0.34 * S2, 0.34 * S2);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("碢轮(操作者左手侧)· 轴鼓 · 踏板", tvL + 4, chainY - 22);
      ctx.fillText("玉料抵碢西缘 · 座凳(操作位)", tvL + 4, chainY - 10);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["足踏踏板", "φ踏 ±25° · 45/min"], ["绳鼓 r0.045", "绳长不变几何"],
        ["主轴往复", "φ轴 = ±3.5rad 摆"], ["铁碢 r0.14", "缘速=3.11×绳速"],
        ["解玉砂浆", "砂+水 滴注碢缘"], ["剖玉划痕", "逐忽划断 渐深"]
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
      '<tr><th>水凳</th><td>凳长 1.5m · 凳面高 0.55</td><td>—</td></tr>' +
      '<tr><th>主轴</th><td>横置 · 长 1.15m</td><td>y = 0.62 m</td></tr>' +
      '<tr><th>碢轮(扎碢)</th><td>铁盘 · D≈0.28m(文献 25-30cm)</td><td>r = 0.14 m</td></tr>' +
      '<tr><th>绳鼓</th><td>轴端木鼓</td><td>r = 0.045 m</td></tr>' +
      '<tr><th>踏板</th><td>长 0.72 · 摆幅 ±25° · 频 45/min(文献 40-60)</td><td>—</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>缘速比:i = R碢/r绳鼓 = 0.14/0.045 = 3.11 —— 碢缘线速为绳速 3.1 倍(载入断言)。</p>' +
      '<p>轴摆角:φ轴 = L踏·sinφ踏 / r绳鼓,行程 ±3.5 rad(绳长不变弦长几何,断言)。</p>' +
      '<p>划痕:深 ∝ ∫|φ̇轴|·R碢·dt(玉料恒压+双程有效,简化标示;逐帧积分校验 maxErr&lt;1e-9)。</p>' +
      '<p>往复换向:每半行程反向;回位配重为推算(回位方式无文献明文)。</p>' +
      '<h4>文献</h4>' +
      '<p>《天工开物·珠玉》:「凡玉初剖时,冶铁为圆盘,以盆水盛沙,足踏圆盘使转,添沙剖玉,逐忽划断。」</p>' +
      '<p>李澄渊《玉作图》扎碢幅(1891)、故宫「砣机」词条:凳面、凳槽、锅架、支撑轴架、座凳、踩板六要素齐备。</p>'
  };
})(window.MECH = window.MECH || {});
