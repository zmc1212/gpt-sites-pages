/* 图纸面板(B 键):阳燧总图 — 光路原理 + 出土对照 + 传动链 */
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
    no: "Fig. 15 · 复原总图",
    title: "阳燧 · 凹面铜镜取火(黄堆西周型,f = R/2)",
    src: "《周礼·司烜氏》+《考工记》+ 沈括《梦溪笔谈·卷三》+ 扶风黄堆出土实测",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainH = 46, chainY = h - chainH - 12, topY = 36;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.4;

      ctx.fillStyle = red; ctx.font = "700 11px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("f = R/2 = 9.9cm(黄堆 R19.8) · 焦斑 d = f×0.533° = 0.93mm · 聚光比 (D/d)² ≈ 8950 · 镜面功率 ≈ 5.0W(反射0.6)", w * 0.03, topY - 12);

      /* ============ 左:光路原理(凹面镜纵剖) ============ */
      var svL = w * 0.03, svR = w * 0.50;
      var S = Math.min((svR - svL - 14) / 0.30, (chainY - topY - 30) / 0.24);
      var mx = svL + 20, myy = topY + 24;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText("光路原理(凹面镜纵剖,平行日光)", svL, topY + 12);
      /* 镜弧 */
      ctx.beginPath(); ctx.arc(mx - D.Rmirror * S, myy, D.Rmirror * S, -0.85, 0.85); ctx.stroke();
      /* 主光轴 */
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(mx + D.Rmirror * S, myy); ctx.lineTo(mx - D.f * S * 1.6, myy); ctx.stroke();
      ctx.setLineDash([]);
      /* 3 平行光线 + 反射汇聚 */
      for (var i = -1; i <= 1; i++) {
        var off = i * 0.032;
        var hy = myy + off * S, hx = mx - D.Rmirror * S + Math.cos(Math.asin(off / D.Rmirror)) * D.Rmirror * S;
        ctx.strokeStyle = "rgba(140,47,30,0.9)";
        ctx.beginPath(); ctx.moveTo(hx + 0.09 * S, hy); ctx.lineTo(hx, hy); ctx.stroke();
        ctx.strokeStyle = ink;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(mx - D.f * S, myy); ctx.stroke();
      }
      /* 焦点 */
      ctx.fillStyle = red;
      ctx.beginPath(); ctx.arc(mx - D.f * S, myy, 4, 0, Math.PI * 2); ctx.fill();
      /* 标注 */
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("平行日光(自上右)", mx + 10, myy - 0.06 * S);
      ctx.fillText("焦点(艾绒置此)", mx - D.f * S - 14, myy + 14);
      ctx.fillText("凹面镜(「面洼」)", mx + 6, myy + 0.06 * S);
      ctx.fillText("主光轴", mx + 14, myy + 0.055 * S);
      /* 尺寸 */
      arrow(ctx, mx - D.f * S, myy + 0.075 * S, mx - D.Rmirror * S + 0.01 * S, myy + 0.075 * S, "f = R/2 = 9.9cm", true);
      arrow(ctx, mx - D.Rmirror * S + 0.01 * S, myy - 0.085 * S, mx - D.Rmirror * S + 0.01 * S, myy + 0.085 * S, "口径 8.8cm", false);

      /* ============ 右:出土对照 + 沈括引文 ============ */
      var tvL = w * 0.53, tvR = w * 0.98;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("出土阳燧对照", tvL, topY + 12);
      var rows = [["扶风黄堆 西周中期(1995)", "径 8.8cm · R 19.8-20cm · f≈9.9cm"],
                  ["昌平白浮 西周(1975)", "径 9.9/9.5cm · R≈30.8cm"],
                  ["三门峡虢国墓 春秋早期(1956)", "径 7.5cm 虎鸟纹"],
                  ["天津博物馆 东汉铭文", "「五月五丙午,火燧可取天火」"]];
      rows.forEach(function (r, i) {
        var y = topY + 34 + i * 16;
        ctx.fillStyle = i === 0 ? red : faint;
        ctx.fillText(r[0], tvL + 4, y);
        ctx.fillText(r[1], tvR - 8, y);
      });
      ctx.strokeStyle = faint;
      ctx.beginPath(); ctx.moveTo(tvL, topY + 30); ctx.lineTo(tvR, topY + 30); ctx.stroke();
      /* 沈括引文块 */
      ctx.fillStyle = ink; ctx.font = "600 10px sans-serif";
      ctx.fillText("《梦溪笔谈·卷三》:", tvL + 4, topY + 96);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif";
      ctx.fillText("「阳燧面洼,向日照之,光皆聚向内,离镜一二寸,", tvL + 14, topY + 112);
      ctx.fillText("光聚为一点,大如麻菽,著物则火发。」(离镜一二寸 ≈ f 9.9cm ✓)", tvL + 14, topY + 126);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("艾绒燃点约 3s(现代复制已验证)· 「金锡半,谓之鉴燧之齐」(铜锡配比)", tvL + 4, chainY - 10);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["平行日光", "1361W/m²"], ["凹面镜反射", "f = R/2 = 9.9cm"],
        ["焦斑 0.93mm", "「大如麻菽」"], ["聚光比 ~8950", "理想值(计球差数千)"],
        ["艾绒置焦", "P≈5W 数秒引燃"], ["「取明火于日」", "司烜氏 职掌"]
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
      '<h4>部件尺寸(出土实测)</h4><table>' +
      '<tr><th>阳燧(演示件)</th><td>黄堆西周型 · 径 8.8cm · 曲率半径 19.8cm</td><td>f = 9.9 cm</td></tr>' +
      '<tr><th>焦斑</th><td>d = f×0.533°(太阳视角)</td><td>0.93 mm</td></tr>' +
      '<tr><th>聚光比</th><td>(D/d)² 理想(计球差数千)</td><td>≈ 8950</td></tr>' +
      '<tr><th>镜面功率</th><td>1361W/m²×6.08cm²×0.6</td><td>≈ 5.0 W</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>焦距:f = R/2 = 9.9cm(载入断言);焦斑 d = f×0.533° = 0.93mm(断言)。</p>' +
      '<p>聚光比 (D/d)² = 8950(理想,断言公式);镜面功率 P = 1361×0.00608×0.6 = 5.0W(断言)。</p>' +
      '<p>引燃:温度模型 Ṫ = kP − c(T−T₀),艾绒燃点约 3s(演示);沈括「离镜一二寸」与 f=9.9cm 相合 ✓。</p>' +
      '<p>光路逐帧积分校验(maxErr&lt;1e-9);对日误差 cos 效率入功率(「仰以向日」)。</p>' +
      '<h4>文献</h4>' +
      '<p>《周礼·秋官·司烜氏》:「掌以夫遂取明火于日」(郑注:夫遂即阳遂);《考工记》:「金锡半,谓之鉴燧之齐」。</p>' +
      '<p>《论衡·率性》:「阳遂取火于天……仰以向日,则火来至」;《梦溪笔谈·卷三》:「阳燧面洼……光聚为一点,大如麻菽,著物则火发。」</p>'
  };
})(window.MECH = window.MECH || {});
