/* 图纸面板(B 键):欹器复原侧视总图 + 重心曲线 + 尺寸表。 */
(function (MECH) {
  var ink = "#2A2620", faint = "rgba(42,38,32,0.38)", faint2 = "rgba(42,38,32,0.22)";
  var waterC = "#3E6E86", woodC = "#6E4E28", red = "#8C2F1E";
  var KS = MECH.KS;

  function arrowV(ctx, x, y1, y2, text, side) {
    ctx.strokeStyle = faint; ctx.fillStyle = faint; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
    var s = 4, dir = y2 >= y1 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(x, y2); ctx.lineTo(x - 3, y2 - s * dir); ctx.lineTo(x + 3, y2 - s * dir); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x - 3, y1 + s * dir); ctx.lineTo(x + 3, y1 + s * dir); ctx.closePath(); ctx.fill();
    ctx.font = "600 9px Menlo, monospace";
    ctx.textAlign = side < 0 ? "right" : "left";
    ctx.fillText(text, x + side * 6, (y1 + y2) / 2 + 3);
  }

  MECH.BP = {
    no: "Fig. 15 · 复原总图",
    title: "欹器 · 虚则欹 中则正 满则覆(《荀子·宥坐》)",
    src: "《荀子·宥坐》孔子观欹器 · 尺寸按本站复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainY = h - 70, topY = 30;

      /* —— 公式横幅 —— */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("yCG(f) = (mW·yW + ρV(f)·yC(f)) / (mW + ρV(f))   ·   yCG>0 不稳(欹/覆) · yCG<0 稳(正)   ·   数值积分定 f欹/f覆", w * 0.03, topY - 8);

      /* —— 左:三态侧视图 —— */
      var ox = w * 0.03, oRight = w * 0.55, regionH = chainY - topY - 26;
      var S = Math.min((oRight - ox - 16) / 3.4, (regionH - 12) / 1.7);
      var oy = topY + regionH - 0.72 * S;
      function X(m) { return ox + 0.5 * S + (m + 1.7) * S; }
      function Y(m) { return oy - m * S; }
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("三态侧视(虚欹 −58° / 中正 0° / 满覆 142°)", ox, topY + 10);
      ctx.beginPath(); ctx.moveTo(X(1.8), Y(0)); ctx.lineTo(X(-1.8), Y(0)); ctx.stroke();
      /* 案几 + 枢 */
      ctx.strokeRect(X(-1.05), Y(0.92), 1.60 * S, 0.10 * S);
      [-0.85, 0.55].forEach(function (px) {
        ctx.strokeRect(X(px), Y(0), 0.11 * S, 0.92 * S);
      });
      /* 器三态:虚欹(倚挡)/ 中正(半水)/ 满覆(口朝下) */
      function vesselSym(thetaDeg, fillF, dash) {
        ctx.save();
        ctx.translate(X(0), Y(D.pivotY));
        ctx.rotate(thetaDeg * Math.PI / 180);
        ctx.setLineDash(dash ? [4, 3] : []);
        ctx.strokeStyle = dash ? faint : ink;
        ctx.lineWidth = dash ? 1.2 : 1.8;
        ctx.beginPath();
        ctx.moveTo(0, -0.30);
        ctx.lineTo(0.22, 0);
        ctx.lineTo(0.15, 0.32);
        ctx.stroke();
        if (fillF > 0) {
          ctx.beginPath();
          ctx.moveTo(0.02, -0.12);
          ctx.lineTo(0.20, 0);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.restore();
        ctx.strokeStyle = ink;
      }
      vesselSym(-58, 0, false);
      vesselSym(0, 0.5, false);
      vesselSym(142, 0, true);
      /* 枢点 */
      [0].forEach(function () {
        ctx.beginPath(); ctx.arc(X(0), Y(D.pivotY), 3, 0, Math.PI * 2); ctx.fill();
      });
      /* 止挡 */
      ctx.beginPath(); ctx.moveTo(X(0.30), Y(D.tableH + 0.42)); ctx.lineTo(X(0.30), Y(0.92)); ctx.stroke();
      /* 尺寸 */
      arrowV(ctx, X(-1.15), Y(D.pivotY - 0.30), Y(D.pivotY + 0.32), "器高 0.62", -1);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("枢在腰(y 0)· 尖底锥 y −0.30(r0)→ 腰(r 0.22)→ 口 +0.32(r 0.15)", ox, chainY - 14);

      /* —— 右:yCG 曲线 —— */
      var rx = w * 0.585, rw = w - rx - 14;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("合重心 yCG(f)", rx, topY + 12);
      var gx0 = rx + 30, gw = rw - 42, gy0 = topY + 24, gh = 88;
      function yOf(v) { return gy0 + (1 - (v + 0.12) / 0.24) * gh; }
      ctx.strokeStyle = faint2; ctx.lineWidth = 1;
      ctx.strokeRect(gx0, gy0, gw, gh);
      ctx.strokeStyle = faint;
      ctx.beginPath(); ctx.moveTo(gx0, gy0 + gh / 2); ctx.lineTo(gx0 + gw, gy0 + gh / 2); ctx.stroke();
      ctx.strokeStyle = woodC; ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (var i = 0; i <= 48; i++) {
        var f = i / 48;
        var s = KS.fillState(f);
        var xx = gx0 + f * gw;
        var yy = gy0 + (1 - (s.yCG + 0.12) / 0.24) * gh;
        if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = red;
      [D.fKai, D.fFu].forEach(function (f) {
        ctx.beginPath(); ctx.moveTo(gx0 + f * gw, gy0); ctx.lineTo(gx0 + f * gw, gy0 + gh); ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.fillStyle = ink;
      ctx.font = "600 8px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("yCG = +0.08", gx0 - 26, gy0 + 8);
      ctx.fillText("−0.12", gx0 - 20, gy0 + gh - 2);
      ctx.textAlign = "center";
      ctx.fillText("注水比 f →", gx0 + gw / 2, gy0 + gh + 13);

      /* —— 右下:三态口诀 —— */
      var by = gy0 + gh + 36;
      ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.font = "700 11px sans-serif";
      ctx.fillText("三态", rx, by - 6);
      var lines = [["虚则欹", "yCG>0 · 倚挡 −58°"], ["中则正", "yCG<0 · 直立 0°"], ["满则覆", "yCG>0 · 翻覆 142°"]];
      ctx.font = "600 8.5px sans-serif";
      lines.forEach(function (l, i) {
        ctx.fillStyle = i === 2 ? red : ink;
        ctx.fillText(l[0] + " · " + l[1], rx, by + 8 + i * 14);
      });

      /* —— 底部:部件链 —— */
      var boxes = [
        ["案几枢销", "枢在腰 y 0"], ["止挡沥盘", "倚靠 + 承水"], ["欹器", "尖底敞口 双耳"],
        ["注水壶", "缓注 f 0→0.95"], ["重心球", "绿稳/红不稳"], ["数值积分", "f欹/f覆 载入解"]
      ];
      var bwid = (w * 0.94) / boxes.length;
      for (var b = 0; b < boxes.length; b++) {
        var bx2 = w * 0.03 + b * bwid;
        ctx.strokeStyle = ink; ctx.lineWidth = 1.2;
        ctx.strokeRect(bx2, chainY, bwid - 10, 50);
        ctx.fillStyle = ink;
        ctx.font = "700 9.5px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(boxes[b][0], bx2 + (bwid - 10) / 2, chainY + 19);
        ctx.font = "600 8px Menlo, monospace";
        ctx.fillStyle = faint;
        ctx.fillText(boxes[b][1], bx2 + (bwid - 10) / 2, chainY + 34);
        if (b < boxes.length - 1) {
          ctx.beginPath();
          ctx.moveTo(bx2 + bwid - 10, chainY + 24);
          ctx.lineTo(bx2 + bwid - 2, chainY + 24);
          ctx.stroke();
        }
      }
    },
    table:
      '<h4>器体</h4><table>' +
      '<tr><th>内腔</th><td>尖底锥(y −0.30,r 0)→ 腰(y 0,r 0.22)→ 口(y +0.32,r 0.15)</td><td>高 0.62 m</td></tr>' +
      '<tr><th>器壁</th><td>mW = 2.0 kg · 重心 yW = +0.08(质偏口腹)</td><td>枢在腰 y 0</td></tr>' +
      '<tr><th>总容积</th><td>V_total 数值积分(N=60 层圆台)</td><td>≈ 0.042 m³</td></tr>' +
      '</table><h4>三态阈值(载入期数值解)</h4><table>' +
      '<tr><th>f欹</th><td>yCG 上→下过零(空器倚挡 ↔ 注水自正)</td><td>≈ 0.02(尖底深臂,一杯即正)</td></tr>' +
      '<tr><th>f覆</th><td>yCG 下→上过零(正立 ↔ 倾覆)</td><td>≈ 0.64</td></tr>' +
      '<tr><th>三态</th><td>虚则欹 −58° · 中则正 0° · 满则覆 142°</td><td>翻转后水全沥</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>yCG(f) = (mW·yW + ρV(f)·yC(f)) / (mW + ρV(f)):空器 yCG = +0.08 &gt; 0(不稳);半满水重心在枢下(稳);满器水重心升回枢上(覆)。</p>' +
      '<p>运行期 errPos = 口沿缘点世界位置 vs 解析(枢 + Rz(θ)·(0, yMouth))≈ 0;重心球位置即解析 yCG(绿稳/红不稳)。</p>' +
      '<h4>文献</h4>' +
      '<p>《荀子·宥坐》:「孔子观于鲁桓公之庙,有欹器焉……虚则欹,中则正,满则覆……恶有满而不覆者哉!」—— 以器喻「持满之道,挹而抑之」。</p>'
  };
})(window.MECH = window.MECH || {});
