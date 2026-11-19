/* 图纸面板(B 键):风扇车剖视总图 + 分级原理详图 + 尺寸表 */
(function (MECH) {
  var red = "#8C2F1E";

  MECH.BP = {
    no: "Fig. 08 · 复原剖视图",
    title: "风扇车 · 手摇风选 · 糠秕与谷粒分级",
    src: "《天工开物·乃粒》扇车图 · 风选偏移 ∝ 风速/粒重",
    draw: function (ctx, w, h) {
      var D = MECH.DIM;
      ctx.clearRect(0, 0, w, h);
      var chainH = 44, chainY = h - chainH - 12, topY = 34;
      var ink = "#2A2620";
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("偏移 = ½·(k风/粒重)·t² · 糠秕轻→远口 · 谷粒重→近口 · 分级断言(载入)", w * 0.045, topY - 10);

      /* ============ 左:剖视图 ============ */
      var S = Math.min(w * 0.44 / 1.9, (chainY - topY - 26) / 1.7);
      var ox = w * 0.05, oy = chainY - 16;
      var X = function (m) { return ox + (m + 0.85) * S; }, Y = function (m) { return oy - m * S; };
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = 1.4;
      ctx.font = "700 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("剖视 SECTION", ox, Y(1.35));
      /* 箱体 */
      ctx.strokeRect(X(-D.boxL / 2), Y(D.boxH / 2), D.boxL * S, D.boxH * S);
      /* 扇轮 */
      ctx.beginPath(); ctx.arc(X(-(D.boxL / 2 - 0.21)), Y(0), D.fanR * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(-(D.boxL / 2 - 0.21)), Y(0), 0.05 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.font = "600 8px sans-serif";
      ctx.fillText("扇轮 6 叶", X(-(D.boxL / 2 - 0.21)) - 18, Y(0) - D.fanR * S - 4);
      /* 漏斗 */
      ctx.beginPath();
      ctx.moveTo(X(-(D.boxL / 2 - 0.21) - 0.15), Y(D.hopperY - 0.42));
      ctx.lineTo(X(-(D.boxL / 2 - 0.21)), Y(D.hopperY - 0.52));
      ctx.moveTo(X(-(D.boxL / 2 - 0.21) + 0.15), Y(D.hopperY - 0.42));
      ctx.lineTo(X(-(D.boxL / 2 - 0.21)), Y(D.hopperY - 0.52));
      ctx.stroke();
      ctx.fillText("谷斗", X(-(D.boxL / 2 - 0.21)) - 14, Y(D.hopperY - 0.44) - 4);
      /* 谷流(虚线)+ 分级线 */
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(X(-(D.boxL / 2 - 0.21)), Y(D.boxH / 2));
      ctx.lineTo(X(-(D.boxL / 2 - 0.21)), Y(-D.boxH / 2 + 0.06));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(X(-(D.boxL / 2 - 0.21)), Y(0));
      ctx.quadraticCurveTo(X(0), Y(-0.12), X(D.outFar + 0.05), Y(-D.boxH / 2 + 0.06));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText("糠(远口)", X(D.outFar) - 10, Y(-D.boxH / 2 + 0.14));
      ctx.fillText("谷(近口)", X(D.outNear) - 14, Y(-D.boxH / 2 + 0.14));
      /* 出口 */
      ctx.beginPath(); ctx.arc(X(D.outFar), Y(-D.boxH / 2 + 0.06), 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(X(D.outNear), Y(-D.boxH / 2 + 0.06), 3, 0, Math.PI * 2); ctx.fill();

      /* ============ 右:分级原理详图 ============ */
      var ox2 = w * 0.55;
      ctx.font = "700 11px sans-serif";
      ctx.fillStyle = ink;
      ctx.fillText("偏移-粒重分级", ox2, topY + 18);
      var gx = ox2, gy = topY + 32, gw = w - ox2 - 24, gh = chainY - gy - 44;
      ctx.strokeStyle = "rgba(42,38,32,0.5)";
      ctx.strokeRect(gx, gy, gw, gh);
      /* 满速:糠远谷近两落点柱 */
      var base = gy + gh - 10;
      ctx.fillStyle = "rgba(233,201,60,0.75)";
      ctx.fillRect(gx + 12, base - gh * 0.55, gw * 0.3, gh * 0.55);
      ctx.fillStyle = "rgba(127,216,216,0.75)";
      ctx.fillRect(gx + gw * 0.5, base - gh * 0.22, gw * 0.3, gh * 0.22);
      ctx.font = "600 8.5px sans-serif";
      ctx.fillStyle = "rgba(42,38,32,0.6)";
      ctx.fillText("糠秕 · a=3.2(远)", gx + 12, base - gh * 0.55 - 4);
      ctx.fillText("谷粒 · a=0.9(近)", gx + gw * 0.5, base - gh * 0.22 - 4);
      ctx.fillStyle = red;
      ctx.font = "700 9.5px Menlo, monospace";
      ctx.fillText("a糠/a谷 = 3.2/0.9", gx + 12, base + 0);

      /* ============ 底部:参数链 ============ */
      var boxes = [
        ["手摇曲柄", "ω 2.2~3.4"], ["扇轮 6 叶", "R 0.30"], ["谷斗活门", "率 ∝ 开度"],
        ["穿风道下落", "t=0.44s"], ["糠入远口", "a=3.2"], ["谷落近口", "a=0.9"]
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
      '<h4>车体</h4><table>' +
      '<tr><th>风道箱</th><td>圆腔 + 渐扩风道 + 两出口</td><td>1.03×0.60 m</td></tr>' +
      '<tr><th>扇叶轮</th><td>6 叶 · R 0.30 · 绕 X 轴</td><td>手摇曲柄</td></tr>' +
      '<tr><th>谷斗</th><td>漏斗 + 活门(率 ∝ 开度)</td><td>26 粒/s</td></tr>' +
      '</table><h4>分级验算</h4><table>' +
      '<tr><th>下落时间</th><td>√(2×0.95/9.8)</td><td>0.44 s</td></tr>' +
      '<tr><th>糠偏移</th><td>½×3.2×0.44²(满速)</td><td>0.31 m → 远口</td></tr>' +
      '<tr><th>谷偏移</th><td>½×0.9×0.44²</td><td>0.09 m → 近口</td></tr>' +
      '<tr><th>糠谷比</th><td>糠 34%(生成比)· 分级显著</td><td>断言</td></tr>' +
      '</table><h4>运行期自检</h4>' +
      '<p>载入模拟 30s:糠秕必须被吹入远口、谷粒落近口(分级成立),风速减半时糠占比不升(线性),否则拒绝启动。</p>' +
      '<h4>文献</h4>' +
      '<p>《天工开物·乃粒》:扇车「凡去秕,南方尽用风车……糠秕去而谷粒存」——中国早在汉代已有风车(西汉出土陶模型)。</p>'
  };
})(window.MECH = window.MECH || {});
