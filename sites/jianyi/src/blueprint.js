/* 图纸面板(B 键):简仪侧视总图 + 赤道装置详图 + 尺寸表 */
(function (MECH) {
  var red = "#8C2F1E";

  MECH.BP = {
    no: "Fig. 18 · 复原总图",
    title: "简仪 · 赤道式装置 · 四游环窥衡",
    src: "郭守敬至元十三年(1276)创制 · 紫金山天文台存明仿制原器 · 演示星表为现代值",
    draw: function (ctx, w, h) {
      var D = MECH.DIM;
      ctx.clearRect(0, 0, w, h);
      var chainH = 44, chainY = h - chainH - 12, topY = 34;
      var ink = "#2A2620";
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("去极度 = 四游环转角 ψ(自北极量)= 90° − 赤纬 · 赤道装置早于第谷 300 年", w * 0.045, topY - 10);

      /* ============ 左:侧视图 ============ */
      var S = Math.min(w * 0.44 / 3.4, (chainY - topY - 26) / 3.0);
      var ox = w * 0.05, oy = chainY - 16;
      var X = function (m) { return ox + (m + 1.5) * S; }, Y = function (m) { return oy - m * S; };
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = 1.4;
      ctx.font = "700 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(极轴斜指北天极)", ox, Y(2.9));
      /* 基座 */
      ctx.strokeRect(X(-0.72), Y(D.baseH), 1.44 * S, D.baseH * S);
      /* 极轴(斜线)+ 双环 */
      ctx.save();
      ctx.translate(X(0), Y(D.baseH + 0.42));
      ctx.rotate(-(Math.PI / 2 - D.polarTilt) * 0 + (D.polarTilt - Math.PI / 2));
      ctx.beginPath();
      ctx.moveTo(0, 0.58 * S); ctx.lineTo(0, -0.58 * S);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -0.16 * S, D.ringEqR * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -0.34 * S, D.ringBaiR * S, 0, Math.PI * 2); ctx.stroke();
      /* 四游环(竖圈,示意椭圆)+ 窥衡 */
      ctx.beginPath();
      ctx.ellipse(0, -0.16 * S, D.ringYouR * S * 0.36, D.ringYouR * S, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-D.ringYouR * S * 0.30, -0.16 * S + D.ringYouR * S * 0.92);
      ctx.lineTo(D.ringYouR * S * 0.30, -0.16 * S - D.ringYouR * S * 0.92);
      ctx.stroke();
      ctx.restore();
      ctx.font = "600 8px sans-serif";
      ctx.fillStyle = "rgba(42,38,32,0.6)";
      ctx.fillText("百刻环", X(0) + 0.5 * S, Y(D.baseH + 0.42 - 0.34) + 10);
      ctx.fillText("赤道环(24 节气)", X(0) + 0.5 * S, Y(D.baseH + 0.42 - 0.16) - 4);
      ctx.fillText("四游环+窥衡", X(-1.1), Y(D.baseH + 0.42 + 0.5));
      /* 极轴仰角标注 */
      ctx.strokeStyle = "rgba(42,38,32,0.45)";
      ctx.beginPath();
      ctx.moveTo(X(0), Y(D.baseH + 0.42));
      ctx.lineTo(X(0.9), Y(D.baseH + 0.42));
      ctx.stroke();
      ctx.fillText("极轴仰角(演示 50°)", X(0.16), Y(D.baseH + 0.30));

      /* ============ 右:去极度换算详图 ============ */
      var ox2 = w * 0.55;
      ctx.font = "700 11px sans-serif";
      ctx.fillStyle = ink;
      ctx.fillText("去极度换算(演示星表)", ox2, topY + 18);
      var gx = ox2, gy = topY + 32, gw = w - ox2 - 24, gh = chainY - gy - 44;
      ctx.strokeStyle = "rgba(42,38,32,0.5)";
      ctx.strokeRect(gx, gy, gw, gh);
      /* 子午线示意:北极-赤道-南极 */
      ctx.beginPath(); ctx.moveTo(gx + gw / 2, gy + 10); ctx.lineTo(gx + gw / 2, gy + gh - 10); ctx.stroke();
      ctx.fillStyle = "rgba(42,38,32,0.6)";
      ctx.font = "600 8.5px sans-serif";
      ctx.fillText("北极", gx + gw / 2 + 5, gy + 14);
      ctx.fillText("南极", gx + gw / 2 + 5, gy + gh - 12);
      /* 四星刻点 */
      D.stars.forEach(function (s, k) {
        var y = gy + 10 + (90 - s.dec) / 180 * (gh - 20) * 0.5 + (s.dec < 0 ? (gh - 20) * 0.25 : 0);
        y = gy + 14 + (s.psi / Math.PI) * (gh - 24);
        ctx.fillStyle = k === 0 ? "#8C2F1E" : ink;
        ctx.beginPath(); ctx.arc(gx + gw / 2, y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.font = "700 9px sans-serif";
        ctx.fillText(s.name, gx + gw / 2 + 8, y + 3);
        ctx.font = "600 8px Menlo, monospace";
        ctx.fillStyle = "rgba(42,38,32,0.55)";
        ctx.fillText("去极 " + (90 - s.dec).toFixed(1) + "°", gx + gw / 2 + 70, y + 3);
      });
      ctx.strokeStyle = "rgba(42,38,32,0.4)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(gx + 8, gy + gh / 2); ctx.lineTo(gx + gw - 8, gy + gh / 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(42,38,32,0.55)";
      ctx.font = "600 8.5px sans-serif";
      ctx.fillText("赤道圈", gx + 10, gy + gh / 2 - 4);

      /* ============ 底部:参数链 ============ */
      var boxes = [
        ["极轴斜置", "指北天极"], ["百刻环", "端面时刻"], ["赤道环圈", "24 节气"],
        ["四游环", "绕极轴旋转"], ["双窥衡", "夹星定纬"], ["去极度", "ψ = 90°−δ"]
      ];
      var bwid = (w * 0.91) / boxes.length;
      for (var b = 0; b < boxes.length; b++) {
        var bx2 = w * 0.045 + b * bwid;
        ctx.strokeStyle = ink;
        ctx.fillStyle = ink;
        ctx.strokeRect(bx2, chainY, bwid - 10, chainH);
        ctx.font = "700 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(boxes[b][0], bx2 + (bwid - 10) / 2, chainY + 17);
        ctx.font = "600 8.5px Menlo, monospace";
        ctx.fillStyle = "rgba(42,38,32,0.55)";
        ctx.fillText(boxes[b][1], bx2 + (bwid - 10) / 2, chainY + 32);
        if (b < boxes.length - 1) {
          ctx.beginPath();
          ctx.moveTo(bx2 + bwid - 10, chainY + 20);
          ctx.lineTo(bx2 + bwid - 2, chainY + 20);
          ctx.stroke();
        }
      }
    },
    table:
      '<h4>环圈尺寸</h4><table>' +
      '<tr><th>百刻环</th><td>R 0.44(演示)· 端面时刻刻度</td><td>—</td></tr>' +
      '<tr><th>赤道环圈</th><td>R 0.58 · 二十四节气刻块</td><td>—</td></tr>' +
      '<tr><th>四游环</th><td>R 0.66 · 双窥衡 · 绕极轴旋转</td><td>—</td></tr>' +
      '<tr><th>极轴仰角</th><td>演示 50°(南京实为 32°)</td><td>—</td></tr>' +
      '</table><h4>演示星表(现代值)</h4><table>' +
      '<tr><th>织女一</th><td>δ +38.8°</td><td>去极 51.2°</td></tr>' +
      '<tr><th>角宿一</th><td>δ −11.2°</td><td>去极 101.2°</td></tr>' +
      '<tr><th>参宿四</th><td>δ +7.4°</td><td>去极 82.6°</td></tr>' +
      '<tr><th>心宿二</th><td>δ −26.4°</td><td>去极 116.4°</td></tr>' +
      '</table><h4>运行期自检</h4>' +
      '<p>载入断言:四星 ψ = 90°−δ 严格换算;瞄准织女一后读数收敛至 51.2°±0.5°。</p>' +
      '<h4>文献</h4>' +
      '<p>《元史·天文志》:郭守敬“简仪” abolition of 浑仪双环,“绰然简便,有古浑仪之遗制焉”——赤道装置比第谷早三百年。</p>'
  };
})(window.MECH = window.MECH || {});
