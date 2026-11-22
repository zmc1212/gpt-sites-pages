/* 图纸面板(B 键):风力水车总图 — 侧视(风车+翻车+水池+田) + 俯视 + 传动链
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
    no: "Fig. 02 · 复原总图",
    title: "风力水车 · 扬郡八帆立轴式(《天工开物·乃粒》)",
    src: "《天工开物·乃粒》「扬郡以风帆数扇」+《物理小识》 · 帆数/偏装角为复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainH = 46, chainY = h - chainH - 12, topY = 36;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.4;

      ctx.fillStyle = red; ctx.font = "700 11px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("ω泵 = 24/16 · ω轮 = 1.5ω轮 · ω轮 = 0.385·v风(λ=0.5) · Q = v链·A·φ · 能量: ½ρAv³Cp ≥ ρgQH/η(额定6m/s裕度×" + D.marginOf(6).toFixed(2) + ")", w * 0.03, topY - 12);

      /* ============ 左:侧视(z-y 剖面,南右北左) ============ */
      var svL = w * 0.03, svR = w * 0.50;
      var S = Math.min((svR - svL - 10) / 6.4, (chainY - topY - 34) / 5.0);
      var ox = svL + 4, oy = chainY - 14;
      var X = function (m) { return ox + (m + 1.4) * S; };
      var Y = function (m) { return oy - m * S; };
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText("侧视 SIDE(过立轴·翻车剖面)", svL, topY + 12);
      /* 地面 */
      ctx.beginPath(); ctx.moveTo(X(-1.4), Y(0)); ctx.lineTo(X(5.0), Y(0)); ctx.stroke();
      /* 风车:立轴 + 帆带 + 卧轮 + 座 */
      ctx.strokeRect(X(-0.09), Y(D.shaftHi), 0.18 * S, (D.shaftHi - D.shaftLo) * S);
      ctx.strokeRect(X(-D.Rwheel), Y(D.sailHi), 2 * D.Rwheel * S, (D.sailHi - D.sailLo) * S);
      for (var k = 0; k <= 16; k++) {
        var tx = X(-D.Rwheel) + k / 16 * 2 * D.Rwheel * S;
        ctx.beginPath(); ctx.moveTo(tx, Y(D.sailHi)); ctx.lineTo(tx, Y(D.sailLo)); ctx.stroke();
      }
      ctx.strokeRect(X(-0.30), Y(0.45), 0.60 * S, 0.30 * S);
      ctx.beginPath(); ctx.arc(X(0), Y(D.crownY), 0.14 * S, 0, Math.PI * 2); ctx.stroke();
      /* 翻车:上/下链轮 + 斜槽双线 + 刮板刻度 + 浸水箱 */
      ctx.beginPath(); ctx.arc(X(D.Pb.z), Y(D.Pb.y), 0.13 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(D.Pa.z), Y(D.Pa.y), 0.13 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(D.Pa.z - 0.2), Y(D.Pa.y - 0.28)); ctx.lineTo(X(D.Pb.z - 0.2), Y(D.Pb.y + 0.10)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(D.Pa.z + 0.2), Y(D.Pa.y - 0.28)); ctx.lineTo(X(D.Pb.z + 0.2), Y(D.Pb.y + 0.10)); ctx.stroke();
      for (var j = 1; j < 12; j++) {
        var f = j / 12;
        var jx = X(D.Pa.z + (D.Pb.z - D.Pa.z) * f);
        var jy = Y(D.Pa.y + (D.Pb.y - D.Pa.y) * f);
        ctx.beginPath(); ctx.moveTo(jx - 3, jy + 4); ctx.lineTo(jx + 3, jy - 4); ctx.stroke();
      }
      ctx.strokeRect(X(D.Pa.z - 0.28), Y(D.Pa.y + 0.10), 0.56 * S, 0.34 * S);
      /* 水池 */
      ctx.strokeStyle = "rgba(79,120,150,0.8)";
      ctx.strokeRect(X(D.pond.x0), Y(D.pond.water), (D.pond.x1 - D.pond.x0) * S, 0.12 * S);
      ctx.strokeStyle = ink;
      ctx.strokeRect(X(D.pond.x0 - 0.06), Y(D.pond.wallH), (D.pond.x1 - D.pond.x0 + 0.12) * S, D.pond.wallH * S);
      /* 笧槽(承上端出水,沿 -x 出图左) */
      ctx.beginPath(); ctx.moveTo(X(0.4), Y(D.troughY + 0.07)); ctx.lineTo(X(-1.4), Y(D.troughY + 0.07)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(0.4), Y(D.troughY - 0.05)); ctx.lineTo(X(-1.4), Y(D.troughY - 0.05)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(-1.4), Y(D.troughY)); ctx.lineTo(X(-1.4), Y(0.4)); ctx.stroke();
      /* 西田 */
      ctx.strokeRect(X(-1.4), Y(0.35), 0.95 * S, 0.30 * S);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("八帆带 y1.75-3.95", X(-D.Rwheel), Y(D.sailHi + 0.12));
      ctx.fillText("卧轮 Z24 y1.30", X(0.15), Y(D.crownY + 0.10));
      ctx.fillText("立轮 Z16", X(D.Pb.z) + 4, Y(D.Pb.y + 0.22));
      ctx.fillText("笧槽 y1.52", X(-1.30), Y(D.troughY + 0.18));
      ctx.fillText("水池 +0.35", X(D.pond.x0), Y(D.pond.water - 0.10));
      /* 尺寸 */
      arrow(ctx, X(-D.Rwheel), Y(4.55), X(D.Rwheel), Y(4.55), "帆轮径 2.6m", true);
      arrow(ctx, X(D.Pa.z), Y(-0.35), X(D.Pb.z), Y(-0.35), "轮心斜距 3.32m · sinα=0.265", true);
      arrow(ctx, X(D.Pb.z) + 14, Y(D.pond.water), X(D.Pb.z) + 14, Y(D.Pb.y), "H=0.95", false);

      /* ============ 右:俯视(风车 + 翻车 + 池 + 田) ============ */
      var tvL = w * 0.53, tvR = w * 0.98;
      var S2 = Math.min((tvR - tvL - 12) / 7.4, (chainY - topY - 44) / 6.4);
      var X2 = function (m) { return tvL + 8 + (m + 2.2) * S2; };
      var Z2 = function (m) { return topY + 34 + (m + 1.4) * S2; };
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("俯视 PLAN(南 ↓)", tvL, topY + 12);
      /* 风车八帆(45° 偏装弦线) + 卧轮 + 链轮 */
      ctx.beginPath(); ctx.arc(X2(0), Z2(0), D.Rwheel * S2, 0, Math.PI * 2); ctx.stroke();
      for (var i2 = 0; i2 < 8; i2++) {
        var a2 = i2 / 8 * Math.PI * 2;
        var cx2 = X2(Math.sin(a2) * D.mastR), cz2 = Z2(Math.cos(a2) * D.mastR);
        ctx.strokeRect(cx2 - 2, cz2 - 2, 4, 4);
        var px = Math.cos(a2) * 0.38 * D.Rwheel * S2, py = Math.sin(a2) * 0.38 * D.Rwheel * S2;
        ctx.beginPath(); ctx.moveTo(cx2 - px, cz2 - py); ctx.lineTo(cx2 + px, cz2 + py); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(X2(0), Z2(0), D.r1 * S2, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X2(0), Z2(D.Pb.z), D.r2 * S2, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X2(0), Z2(D.Pa.z), D.Rsp * S2, 0, Math.PI * 2); ctx.stroke();
      /* 翻车中线 */
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(X2(0), Z2(D.Pb.z)); ctx.lineTo(X2(0), Z2(D.Pa.z)); ctx.stroke();
      ctx.setLineDash([]);
      /* 笧槽 + 田 + 池 */
      ctx.strokeRect(X2(-2.4), Z2(D.troughZ - 0.15), 2.7 * S2, 0.30 * S2);
      ctx.strokeRect(X2(D.field.x0), Z2(D.field.z0), (D.field.x1 - D.field.x0) * S2, (D.field.z1 - D.field.z0) * S2);
      ctx.strokeRect(X2(D.pond.x0), Z2(D.pond.z0), (D.pond.x1 - D.pond.x0) * S2, (D.pond.z1 - D.pond.z0) * S2);
      /* 尺寸 */
      arrow(ctx, X2(-D.mastR), Z2(D.mastR + 0.35), X2(D.mastR), Z2(D.mastR + 0.35), "帆轮径 2.6m", true);
      arrow(ctx, X2(0), Z2(0) - 2, X2(0), Z2(D.Pb.z) - 2, "");
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("卧轮 r0.60(原点) · 立轮 r0.40(上轴)", tvL + 4, chainY - 22);
      ctx.fillText("啮合距 1.00 = 0.60+0.40 · 翻车沿 +z 南行", tvL + 4, chainY - 10);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["八帆受风", "ω轮=0.385·v风"], ["立轴直传", "同轴 · 底置卧轮"],
        ["卧轮 24T", "r0.60 齿面朝上"], ["立轮 16T", "r0.40 翻车上轴"],
        ["龙骨链", "26 节 · v链=1.5ω轮·R"], ["笧槽灌田", "Q=v链·A·φ"]
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
      '<h4>部件尺寸(复原推算)</h4><table>' +
      '<tr><th>八帆立轴</th><td>帆轮 R1.30 · 帆带高 2.2 · 八桅</td><td>径 2.6 m</td></tr>' +
      '<tr><th>帆</th><td>布面 1.02×2.04 · 偏装 45°(复原值)</td><td>8 面</td></tr>' +
      '<tr><th>卧轮</th><td>Z24 · 齿面朝上 · y+1.30</td><td>r = 0.60 m</td></tr>' +
      '<tr><th>立轮</th><td>Z16 · 翻车上轴(竖直盘)</td><td>r = 0.40 m</td></tr>' +
      '<tr><th>翻车</th><td>斜升 15.4° · 轮心斜距 3.32</td><td>扬程 0.95 m</td></tr>' +
      '<tr><th>龙骨链</th><td>26 节 · 销距 0.287 · 刮板 0.26×0.10</td><td>R链轮 0.13</td></tr>' +
      '</table><h4>风能与核算</h4><table>' +
      '<tr><th>有效扫掠面积</th><td>A = 2R×H帆×占空比0.52</td><td>2.97 m²</td></tr>' +
      '<tr><th>功率系数</th><td>布帆 Cp(复原取值)</td><td>0.215</td></tr>' +
      '<tr><th>额定工况</th><td>v=6 m/s: P风 83W vs ρgQH/η 58W</td><td>裕度 ×1.42</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>传动:ω泵 = (Z卧/Z立)·ω轮 = 24/16 = 1.5·ω轮(载入断言);链速 v链 = ω泵·R链轮。</p>' +
      '<p>流量:Q = v链·A·φ,A = 水柱0.05×板宽0.26,φ = 0.75(撒漏系数);30s 过板计数实测 ≈ 公式(载入自检 ±15%)。</p>' +
      '<p>能量:½ρ·A·v³·Cp ≥ ρgQH/η 在额定 6 m/s 成立(×1.42);v &lt; 5 m/s 出现赤字,POWER 面板明示。</p>' +
      '<p>闭合链:loopLen = 2×3.318 + 2π×0.13 = 7.456,26 节节距 0.2868(载入断言 N·p = loopLen)。</p>' +
      '<h4>文献</h4>' +
      '<p>《天工开物·乃粒》:「扬郡以风帆数扇,俟风转车,风息则止,此车为救潦,欲去泽水,以便栽种。」</p>' +
      '<p>方以智《物理小识》:「用风帆六幅,车水灌田者,淮扬海堧皆为之。」帆数六/八并存,本站取八帆(扬州式);偏装 45° 为现代复原值。</p>'
  };
})(window.MECH = window.MECH || {});
