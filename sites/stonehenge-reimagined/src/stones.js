/* 程序化巨石阵 —— 全部几何由代码生成,无外部模型
 *
 * 布局参照真实平面图:
 *  - 外圈砂石圈:30 槽位,中轴线(方位角 49.3°)处为东北入口豁口,现存格局按
 *    "站立/带楣/倒伏/残桩/缺失" 排布,形似今天的遗迹剪影
 *  - 马蹄形三石塔 ×5(开口朝东北),最高一组"大三石塔"立于中轴线西南端并带楣
 *  - 青石马蹄 ×8(威尔士运来的小石)、祭坛石(倒伏)、宰牲石(倒伏)
 *  - 脚跟石:中轴延长线 77m 处,向石圈方向倾斜 ~20°,夏至日出的"准星"
 *
 * 石面风化:分段盒体顶点做 fbm 噪声位移 + 边缘剥落,顶点色携带
 * 每块石的色差 / 地衣斑块 / 埋土以下的白垩浅色 / 顶部曝晒褪色。
 */
(function (global) {
  'use strict';
  var U = global.STUtil;
  var S = global.STSolar;

  /* ---------- 配色(顶点色按线性空间使用,先做 sRGB→线性) ---------- */
  function lin(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
  var PAL = {
    sarsen: lin('#82837a'),    // 砂岩灰
    blue: lin('#5f6875'),      // 青石蓝灰
    heel: lin('#8a867a'),      // 脚跟石(略暖)
    altar: lin('#a39078'),     // 祭坛石(云母砂岩,暖沙色)
    lichen: lin('#75875a'),    // 地衣绿
    chalk: lin('#c9c2b2')      // 白垩(埋土部分)
  };

  var AXIS_AZ = S.AXIS_AZ; // 49.3°
  function azRad(azDeg) { return azDeg * Math.PI / 180; }
  function azPos(r, azDeg, y) {
    return new THREE.Vector3(Math.sin(azRad(azDeg)) * r, y || 0, -Math.cos(azRad(azDeg)) * r);
  }

  /* ---------- 石材几何 ---------- */
  /* 盒体 + 锥度 + 噪声风化 + 边缘剥落 + 顶点色 */
  function rockBox(w, h, d, seed, opts) {
    opts = opts || {};
    var seg = opts.seg || [4, 9, 2];
    var g = new THREE.BoxGeometry(w, h, d, seg[0], seg[1], seg[2]);
    var pos = g.attributes.position;
    var n = pos.count, i, v = new THREE.Vector3();
    var amp = opts.amp !== undefined ? opts.amp : 0.14;
    var taper = opts.taper !== undefined ? opts.taper : 0.14;
    var half = Math.PI * 2 * (seed % 97);
    for (i = 0; i < n; i++) {
      v.fromBufferAttribute(pos, i);
      // 锥度:上部略收
      var tt = U.smoothstep(h * 0.25, h * 0.62, v.y + h / 2);
      var sc = 1 - taper * tt;
      v.x *= sc; v.z *= sc;
      // 低频风化起伏
      var f1 = U.fbm3(v.x * 0.62 + seed * 0.731, (v.y + half) * 0.55, v.z * 0.62 + seed * 0.173, 3);
      var f2 = U.noise3(v.x * 2.6 + seed * 1.13, (v.y + half) * 2.2, v.z * 2.6 + seed * 0.41);
      var disp = (f1 - 0.5) * amp + (f2 - 0.5) * amp * 0.42;
      // 边缘剥落:靠棱角处多凹
      var edge = Math.max(
        Math.abs(v.x) / (w / 2), Math.abs(v.z) / (d / 2)
      );
      var chip = Math.max(0, edge - 0.72) * (0.45 + 0.55 * f2) * amp * 1.6;
      disp -= chip;
      // 顶面随机凹坑
      if (v.y > h / 2 - 0.01) disp -= Math.max(0, f1 - 0.55) * amp * 1.8;
      v.x += disp * 0.82; v.y += disp * 0.55; v.z += disp;
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    return g;
  }

  /* 顶点色:基色 × 石差 + 地衣 + 埋土白垩 + 顶部褪色 + 雨痕
   * h 为几何名义高度(居中于原点),用于把"埋土以下白垩"约束在底部 10% */
  function paintVerts(g, base, seed, opts) {
    opts = opts || {};
    var pos = g.attributes.position;
    var n = pos.count, i, v = new THREE.Vector3();
    var colors = new Float32Array(n * 3);
    var jitter = opts.jitter !== undefined ? opts.jitter : 1;
    var buried = opts.buried !== undefined ? opts.buried : true;
    var h = opts.h || Math.abs(g.boundingBox ? (g.boundingBox.max.y - g.boundingBox.min.y) : 2);
    if (opts.h === undefined) g.computeBoundingBox();
    var bbMin = g.boundingBox.min.y, bbH = Math.max(0.3, g.boundingBox.max.y - bbMin);
    var c = new THREE.Color(), tint = new THREE.Color();
    var jr = (U.noise3(seed * 3.1, 7.7, 2.2) - 0.5) * 0.16 * jitter;
    for (i = 0; i < n; i++) {
      v.fromBufferAttribute(pos, i);
      c.copy(base).offsetHSL(0, 0, jr);
      // 地衣斑块(下半更多)
      var li = U.fbm3(v.x * 0.5 + seed * 1.7, v.y * 0.5 + seed * 0.9, v.z * 0.5 + seed * 2.3, 3);
      var liAmt = U.smoothstep(0.60, 0.80, li) * (0.75 - 0.35 * U.smoothstep(bbMin, bbMin + bbH * 0.6, v.y));
      // 埋土以下白垩浅色(仅立石:底部 ~12%)
      var tUp = (v.y - bbMin) / bbH;
      var ch = buried ? U.smoothstep(0.18, 0.05, tUp) * 0.85 : 0;
      // 雨痕竖条
      var streak = U.noise3(v.x * 1.1 + seed, (v.y + seed * 9) * 0.22, v.z * 1.1 + seed * 3);
      var stAmt = U.smoothstep(0.30, 0.12, streak) * 0.13;
      tint.copy(PAL.lichen);
      c.lerp(tint, liAmt);
      c.lerp(PAL.chalk, ch);
      c.multiplyScalar(1 - stAmt);
      if (v.y > bbMin + bbH * 0.72) c.multiplyScalar(1.05); // 顶部曝晒
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }

  /* 小凸榫(立石顶 / 楣石顶的凸舌) */
  function tenonBox(size, x, y, z, base, seed) {
    var g = rockBox(size[0], size[1], size[2], seed + x * 13 + 5, { seg: [1, 2, 1], amp: 0.06, taper: 0.25 });
    g.translate(x, y, z);
    paintVerts(g, base, seed + 31, { buried: false, jitter: 0.5 });
    return g;
  }

  /* 立石:含顶部双榫(可选) */
  function makeUpright(w, h, d, base, seed, opts) {
    opts = opts || {};
    var parts = [];
    var body = rockBox(w, h, d, seed, { amp: opts.amp, taper: opts.taper });
    paintVerts(body, base, seed, { buried: opts.buried });
    parts.push(body);
    if (opts.tenons) {
      var ty = h / 2 - 0.05, tx = w / 4.6;
      parts.push(tenonBox([0.42, 0.4, 0.4], tx, ty + 0.16, 0, base, seed));
      parts.push(tenonBox([0.42, 0.4, 0.4], -tx, ty + 0.16, 0, base, seed));
    }
    var g = parts.length === 1 ? parts[0] : U.mergeGeoms(parts);
    g.computeVertexNormals();
    return g;
  }

  /* 楣石:上拱 + 沿圆弧外鼓(可选)+ 顶面凸舌 */
  function makeLintel(len, h, dep, base, seed, opts) {
    opts = opts || {};
    var g = new THREE.BoxGeometry(len, h, dep, 8, 2, 2);
    var pos = g.attributes.position, n = pos.count, i, v = new THREE.Vector3();
    var arch = opts.arch !== undefined ? opts.arch : 0.22;
    var bulge = opts.bulge !== undefined ? opts.bulge : 0; // 正值 = 中心向外(-z)鼓
    var half = Math.PI * 2 * (seed % 89);
    for (i = 0; i < n; i++) {
      v.fromBufferAttribute(pos, i);
      var t = 2 * v.x / len;
      v.y += arch * (1 - t * t);
      if (bulge) v.z -= bulge * (1 - t * t);
      var f1 = U.fbm3(v.x * 0.7 + seed * 0.61, (v.y + half) * 0.7, v.z * 0.7 + seed * 0.29, 3);
      var disp = (f1 - 0.5) * (opts.amp !== undefined ? opts.amp : 0.12);
      var edge = Math.max(Math.abs(v.z) / (dep / 2), Math.abs(v.y) / (h / 2));
      disp -= Math.max(0, edge - 0.7) * 0.1 * f1;
      v.x += disp * 0.7; v.y += disp * 0.5; v.z += disp;
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    paintVerts(g, base, seed + 17, { buried: false });
    var parts = [g];
    if (opts.tongues !== false) {
      parts.push(tenonBox([0.5, 0.26, 0.5], len / 4, h / 2 + 0.09, 0, base, seed));
      parts.push(tenonBox([0.5, 0.26, 0.5], -len / 4, h / 2 + 0.09, 0, base, seed));
    }
    var merged = parts.length === 1 ? parts[0] : U.mergeGeoms(parts);
    merged.computeVertexNormals();
    return merged;
  }

  /* ---------- 石材工厂 ---------- */
  function stoneMesh(g, material) {
    var m = new THREE.Mesh(g, material);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  /* 倒伏石:躺平 + 随机扭转 */
  function fallen(mesh, len, sunk, rngF) {
    mesh.rotation.set(
      Math.PI / 2 + (rngF() - 0.5) * 0.14,
      rngF() * Math.PI * 2,
      (rngF() - 0.5) * 0.3
    );
    mesh.position.y = sunk + 0.55;
    return mesh;
  }

  /* ---------- 建阵 ---------- */
  function buildStones(scene, material) {
    var group = new THREE.Group();
    var rand = U.rng(20260621);
    var anchors = {};

    /* --- 外圈砂石圈:30 槽位,i0 为东北入口豁口 --- */
    var R_OUT = 14.2;
    var H_OUT = 6.6;
    var SURV = ['E', 'S', 'L', 'L', 'S', 'S', 'F', 'M', 'S', 'T', 'F', 'M', 'S', 'T', 'F', 'M', 'S', 'L', 'L', 'S', 'S', 'F', 'M', 'T', 'S', 'L', 'L', 'S', 'S', 'S'];
    var i, az, m, sd;
    for (i = 0; i < 30; i++) {
      var kind = SURV[i];
      if (kind === 'E' || kind === 'M') continue;
      az = AXIS_AZ + i * 12;
      // 东北入口的两块翼石(i1/i29)外移让出视廊,并略收窄,保证中轴看向脚跟石
      var flanker = (i === 1 || i === 29);
      if (i === 1) az = AXIS_AZ + 16;
      if (i === 29) az = AXIS_AZ - 16;
      sd = (i * 137 + 11) | 0;
      var pos = azPos(R_OUT, az);
      if (kind === 'S' || kind === 'L') {
        m = stoneMesh(makeUpright(flanker ? 3.4 : 4.1, H_OUT, 2.1, PAL.sarsen, sd, { tenons: true }), material);
        m.position.set(pos.x, H_OUT / 2 - 0.18, pos.z);
        m.rotation.y = -azRad(az);
        m.rotation.z = (rand() - 0.5) * 0.10;  // 轻微侧倾
        m.rotation.x = (rand() - 0.5) * 0.09;
        group.add(m);
        if (kind === 'L') {
          var azMid = az + 6; // 楣石骑在自身与下一槽位之间
          var li = stoneMesh(makeLintel(5.9, 1.05, 2.7, PAL.sarsen, sd + 55, { bulge: 0.26 }), material);
          var lp = azPos(R_OUT, azMid);
          li.position.set(lp.x, H_OUT - 0.28, lp.z);
          li.rotation.y = -azRad(azMid);
          group.add(li);
        }
      } else if (kind === 'T') {
        m = stoneMesh(makeUpright(4.0, 1.1 + rand() * 0.7, 2.0, PAL.sarsen, sd, { amp: 0.16, taper: 0.3, tenons: false }), material);
        m.position.set(pos.x, 0.45, pos.z);
        m.rotation.y = -azRad(az) + (rand() - 0.5) * 0.3;
        group.add(m);
      } else if (kind === 'F') {
        m = stoneMesh(makeUpright(4.1, H_OUT - 0.4, 2.1, PAL.sarsen, sd, { tenons: rand() > 0.5 }), material);
        var fp = azPos(R_OUT + 1.4 + rand() * 2.4, az + (rand() - 0.5) * 10);
        m.position.set(fp.x, 0, fp.z);
        fallen(m, 4.1, 0.42, rand);
        m.position.y = 0.42;
        group.add(m);
      }
    }

    /* 倒伏的楣石 3 条 */
    var fallenLintels = [125, 292, 200];
    for (i = 0; i < fallenLintels.length; i++) {
      sd = 900 + i * 71;
      m = stoneMesh(makeLintel(5.7, 1.0, 2.6, PAL.sarsen, sd, { tongues: false, bulge: 0 }), material);
      var flp = azPos(R_OUT + 2.0 + rand() * 1.5, fallenLintels[i] + (rand() - 0.5) * 6);
      m.position.set(flp.x, 0, flp.z);
      fallen(m, 5.7, 0.4, rand);
      m.position.y = 0.38;
      group.add(m);
    }

    /* --- 马蹄三石塔 ×5:中轴线西南为最高的大三石塔 --- */
    var R_TRI = 12.6;
    var tris = [
      { off: 0, h: 9.0, lintel: true },    // 大三石塔(轴上,SW)
      { off: -32, h: 7.4, lintel: false },
      { off: 32, h: 7.4, lintel: false },
      { off: -64, h: 6.4, fallenPair: true }, // 马蹄东南臂:一根倒伏
      { off: 64, h: 6.4, stumps: true }       // 西北臂:残桩
    ];
    tris.forEach(function (t, ti) {
      var azC = AXIS_AZ + 180 + t.off; // 马蹄开口朝东北 → 塔在西南半边
      if (t.fallenPair) {
        // 一根站立、一根倒伏(倒石收在圈内,避开外圈倒石)
        var s1 = stoneMesh(makeUpright(4.5, t.h, 2.5, PAL.sarsen, 700 + ti * 31, { tenons: true }), material);
        var p1 = azPos(R_TRI, azC - 2.6);
        s1.position.set(p1.x, t.h / 2 - 0.2, p1.z);
        s1.rotation.y = -azRad(azC - 2.6);
        group.add(s1);
        var s2 = stoneMesh(makeUpright(4.5, t.h - 0.6, 2.5, PAL.sarsen, 740 + ti * 17, { tenons: false }), material);
        var p2 = azPos(R_TRI - 1.0, azC + 2.6);
        s2.position.set(p2.x, 0, p2.z);
        fallen(s2, 4.5, 0.5, rand);
        s2.position.y = 0.5;
        group.add(s2);
        return;
      }
      if (t.stumps) {
        [-2.9, 2.9].forEach(function (dt) {
          m = stoneMesh(makeUpright(4.3, 1.0 + rand() * 0.5, 2.4, PAL.sarsen, 780 + ti * 23 + (dt > 0 ? 9 : 0), { amp: 0.16, taper: 0.32, tenons: false }), material);
          var p = azPos(R_TRI, azC + (dt * 360) / (2 * Math.PI * R_TRI));
          m.position.set(p.x, 0.42, p.z);
          m.rotation.y = -azRad(azC) + (rand() - 0.5) * 0.25;
          group.add(m);
        });
        return;
      }
      [-2.9, 2.9].forEach(function (dt) {
        sd = 600 + ti * 97 + (dt > 0 ? 41 : 3);
        m = stoneMesh(makeUpright(4.5, t.h, 2.5, PAL.sarsen, sd, { tenons: true }), material);
        var p = azPos(R_TRI, azC + (dt * 360) / (2 * Math.PI * R_TRI));
        m.position.set(p.x, t.h / 2 - 0.2, p.z);
        m.rotation.y = -azRad(azC);
        m.rotation.z = (rand() - 0.5) * 0.07;
        group.add(m);
      });
      if (t.lintel) {
        var gl = stoneMesh(makeLintel(8.2, 1.5, 3.0, PAL.sarsen, 633, { arch: 0.3, amp: 0.13 }), material);
        var gp = azPos(R_TRI, azC);
        gl.position.set(gp.x, t.h - 0.35, gp.z);
        gl.rotation.y = -azRad(azC);
        group.add(gl);
      } else {
        // 倒伏的三石塔楣石落在马蹄内侧(祭坛石附近)
        var dl = stoneMesh(makeLintel(7.6, 1.4, 2.8, PAL.sarsen, 680 + ti * 13, { tongues: false }), material);
        var dp = azPos(t.off > 0 ? 6.9 : 7.6, azC + (t.off > 0 ? -16 : 16));
        dl.position.set(dp.x, 0, dp.z);
        fallen(dl, 7.6, 0.45, rand);
        dl.position.y = 0.5;
        group.add(dl);
      }
      anchors['trilithon' + ti] = azPos(R_TRI, azC).setY(t.h * 0.75);
    });

    /* --- 青石马蹄(小,深色) --- */
    var R_BLUE = 8.2;
    var blues = [
      { off: 96, kind: 'S' }, { off: 120, kind: 'T' }, { off: 144, kind: 'S' },
      { off: 168, kind: 'F' }, { off: 192, kind: 'S' }, { off: 216, kind: 'F' },
      { off: 240, kind: 'S' }, { off: 264, kind: 'S' }
    ];
    blues.forEach(function (b, bi) {
      var azB = AXIS_AZ + b.off;
      var sd = 400 + bi * 53;
      if (b.kind === 'S' || b.kind === 'T') {
        m = stoneMesh(makeUpright(1.5, b.kind === 'S' ? 2.3 : 0.9, 1.0, PAL.blue, sd, { amp: 0.10, taper: 0.22, tenons: false, seg: [2, 5, 1] }), material);
        var p = azPos(R_BLUE, azB);
        m.position.set(p.x, b.kind === 'S' ? 1.0 : 0.35, p.z);
        m.rotation.y = -azRad(azB);
        group.add(m);
      } else {
        m = stoneMesh(makeUpright(1.6, 2.2, 1.0, PAL.blue, sd, { amp: 0.10, tenons: false, seg: [2, 5, 1] }), material);
        var fp = azPos(R_BLUE + 1.2, azB + 3);
        m.position.set(fp.x, 0, fp.z);
        fallen(m, 1.6, 0.3, rand);
        m.position.y = 0.3;
        group.add(m);
      }
    });

    /* --- 祭坛石:中心偏西南的倒伏云母砂岩(暖色) --- */
    var altar = stoneMesh(makeUpright(3.6, 0.62, 2.0, PAL.altar, 888, { amp: 0.07, taper: 0.12, tenons: false, seg: [5, 2, 2] }), material);
    var ap = azPos(3.6, AXIS_AZ + 180);
    altar.position.set(ap.x, 0.24, ap.z);
    altar.rotation.y = -azRad(AXIS_AZ + 66);
    altar.rotation.x = Math.PI / 2 - 0.06;
    group.add(altar);
    anchors.altar = ap.clone().setY(0.9);

    /* --- 宰牲石:入口内侧倒伏(严重风化下沉,不遮挡中轴望向脚跟石的视线) --- */
    var sl = stoneMesh(makeUpright(3.5, 0.9, 1.1, PAL.sarsen, 921, { tenons: false, amp: 0.15, taper: 0.2 }), material);
    var sp = azPos(17.5, AXIS_AZ + 2.2);
    sl.position.set(sp.x, -0.32, sp.z);
    sl.rotation.y = -azRad(AXIS_AZ) + 0.25;
    sl.rotation.x = Math.PI / 2 - 0.05;
    group.add(sl);
    anchors.slaughter = sp.clone().setY(0.5);

    /* --- 站石残桩 ×2 --- */
    [[94.3, 24.5], [274.3, 24.5]].forEach(function (st, si) {
      m = stoneMesh(makeUpright(1.3, 1.5, 0.9, PAL.sarsen, 950 + si * 37, { amp: 0.12, taper: 0.2, tenons: false, seg: [2, 4, 1] }), material);
      var p = azPos(st[1], st[0]);
      m.position.set(p.x, 0.6, p.z);
      m.rotation.y = -azRad(st[0]);
      group.add(m);
    });

    /* --- 脚跟石:中轴线 77m,向石圈倾斜 --- */
    var heelW = 3.3, heelH = 5.0, heelD = 2.5;
    var heel = stoneMesh(makeUpright(heelW, heelH, heelD, PAL.heel, 1024, { amp: 0.20, taper: 0.30, tenons: false }), material);
    var hp = azPos(77, AXIS_AZ);
    heel.position.set(hp.x, heelH / 2 - 0.35, hp.z);
    heel.rotation.y = -azRad(AXIS_AZ);
    // 绕水平切向轴倾斜 ~20°(顶端倒向石圈)
    var tangent = new THREE.Vector3(Math.cos(azRad(AXIS_AZ)), 0, Math.sin(azRad(AXIS_AZ)));
    heel.rotateOnWorldAxis(tangent, azRad(20));
    group.add(heel);
    var heelTop = new THREE.Vector3(hp.x, heelH * 0.82, hp.z).addScaledVector(new THREE.Vector3(Math.sin(azRad(AXIS_AZ)), 0, -Math.cos(azRad(AXIS_AZ))), -1.6);
    anchors.heel = hp.clone();
    anchors.heelTop = heelTop;

    scene.add(group);
    anchors.axisAz = AXIS_AZ;
    return { group: group, anchors: anchors };
  }

  global.STStones = { buildStones: buildStones, PAL: PAL, azPos: azPos };
})(window);
