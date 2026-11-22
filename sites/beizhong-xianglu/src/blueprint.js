/* 图纸面板(B 键):被中香炉剖视图 + 万向支架补偿链 + 尺寸表 */
(function (MECH) {
  var red = "#8C2F1E";

  MECH.BP = {
    no: "Fig. 20 · 复原剖视图",
    title: "被中香炉 · 机环转运四周 而炉体常平",
    src: "《西京杂记》卷一 · 长安巧工丁缓 · 万向支架(cardan)之先声",
    draw: function (ctx, w, h) {
      var D = MECH.DIM;
      ctx.clearRect(0, 0, w, h);
      var chainH = 44, chainY = h - chainH - 12, topY = 34;
      var ink = "#2A2620";
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("world = qz(b)·qx(a)·qx(−a)·qz(−b) = I ⇒ 炉体世界恒水平(重力下垂,香灰不洒)", w * 0.045, topY - 10);

      /* ============ 左:剖视图 ============ */
      var S = Math.min(w * 0.42 / 1.3, (chainY - topY - 26) / 1.4);
      var ox = w * 0.05, oy = chainY - 16;
      var X = function (m) { return ox + (m + 0.65) * S; }, Y = function (m) { return oy - m * S; };
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = 1.4;
      ctx.font = "700 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("剖视 SECTION", ox, Y(1.15));
      /* 外壳(圆 + 铰耳) */
      ctx.beginPath(); ctx.arc(X(0), Y(D.shellR * 0.55), D.shellR * S, 0, Math.PI * 2); ctx.stroke();
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (v) {
        ctx.beginPath(); ctx.arc(X(v[0] * D.shellR), Y(D.shellR * 0.55 + v[1] * D.shellR), 3, 0, Math.PI * 2); ctx.stroke();
      });
      /* 环1(横环) */
      ctx.beginPath();
      ctx.ellipse(X(0), Y(D.shellR * 0.55), D.ring1R * S, D.ring1R * S * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
      /* 环2(竖环) */
      ctx.beginPath();
      ctx.ellipse(X(0), Y(D.shellR * 0.55), D.ring2R * S * 0.35, D.ring2R * S, 0, 0, Math.PI * 2);
      ctx.stroke();
      /* 炉体(碗,下垂) */
      ctx.beginPath();
      ctx.moveTo(X(-D.burnerR), Y(D.shellR * 0.55 - 0.02));
      ctx.lineTo(X(-D.burnerR * 0.72), Y(D.shellR * 0.55 - D.burnerH));
      ctx.lineTo(X(D.burnerR * 0.72), Y(D.shellR * 0.55 - D.burnerH));
      ctx.lineTo(X(D.burnerR), Y(D.shellR * 0.55 - 0.02));
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "rgba(42,38,32,0.55)";
      ctx.font = "600 8px sans-serif";
      ctx.fillText("炉体(重心在下)", X(0) - 0.42 * S, Y(D.shellR * 0.55 - D.burnerH) + 12);
      /* 标注 */
      ctx.fillStyle = ink;
      ctx.fillText("外壳(镂空)", X(-0.55) - 0.1 * S, Y(D.shellR * 1.15));
      ctx.fillText("机环一", X(0.45) * 1 + X(0), Y(D.shellR * 0.55 - D.ring1R * 0.9));
      ctx.fillText("机环二", X(-0.62) * 1 + X(0), Y(D.shellR * 0.55 + D.ring2R * 0.6));

      /* ============ 右:补偿链详图 ============ */
      var ox2 = w * 0.55;
      ctx.font = "700 11px sans-serif";
      ctx.fillStyle = ink;
      ctx.fillText("补偿链 COMPENSATION", ox2, topY + 18);
      var gx = ox2, gy = topY + 32, gw = w - ox2 - 24, gh = chainY - gy - 44;
      ctx.strokeStyle = "rgba(42,38,32,0.5)";
      ctx.strokeRect(gx, gy, gw, gh);
      var rows = [
        ["外壳", "qz(b)·qx(a)", "翻转 φ/θ"],
        ["机环一", "qx(−a)", "绕 ±X 反转"],
        ["机环二", "qz(−b)", "绕 ±Z 反转"],
        ["炉体", "= I", "世界恒平"]
      ];
      for (var k = 0; k < rows.length; k++) {
        var y = gy + 10 + k * 24;
        ctx.font = "700 10px sans-serif";
        ctx.fillStyle = k === 3 ? red : ink;
        ctx.fillText(rows[k][0], gx + 10, y);
        ctx.font = "700 10px Menlo, monospace";
        ctx.fillText(rows[k][1], gx + 78, y);
        ctx.font = "600 8.5px sans-serif";
        ctx.fillStyle = "rgba(42,38,32,0.55)";
        ctx.fillText(rows[k][2], gx + 176, y);
        if (k < 3) {
          ctx.strokeStyle = "rgba(42,38,32,0.45)";
          ctx.beginPath();
          ctx.moveTo(gx + 22, y + 4);
          ctx.lineTo(gx + 22, y + 20);
          ctx.stroke();
        }
      }

      /* ============ 底部:参数链 ============ */
      var boxes = [
        ["翻转外壳", "任意姿态"], ["机环一", "qx(−a) 反补"], ["机环二", "qz(−b) 反补"],
        ["炉体下垂", "重心恒低"], ["香灰不洒", "水平恒 0°"], ["可置被褥", "安全燃香"]
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
      '<h4>炉体</h4><table>' +
      '<tr><th>外壳</th><td>径 0.60(演示)· 镂空纹 + 铰耳 ×4</td><td>铜鎏金</td></tr>' +
      '<tr><th>机环一</th><td>枢轴 ±X · R 0.52</td><td>—</td></tr>' +
      '<tr><th>机环二</th><td>枢轴 ±Z · R 0.42</td><td>—</td></tr>' +
      '<tr><th>炉体</th><td>碗径 0.30 · 重心下垂</td><td>香灰/火点</td></tr>' +
      '</table><h4>万向支架(cardan)</h4><table>' +
      '<tr><th>补偿链</th><td>壳=qz(b)qx(a);环1=qx(−a);环2=qz(−b)</td><td>—</td></tr>' +
      '<tr><th>炉体世界姿态</th><td>四元数连乘 = I</td><td>恒平(0.000°)</td></tr>' +
      '<tr><th>自检</th><td>三组 (a,b) 恒等式断言</td><td>&lt;1e-12</td></tr>' +
      '</table><h4>文献</h4>' +
      '<p>《西京杂记》卷一:「长安巧工丁缓者……又作卧褥香炉,一名被中香炉。本出房风,其法后绝,至缓始更为之。为机环转运四周,而炉体常平,可置之被褥,故以为名。」</p>' +
      '<p>此即万向支架(gimbal)之最早文字记载,早于欧洲同类装置约一千三百年。</p>'
  };
})(window.MECH = window.MECH || {});
