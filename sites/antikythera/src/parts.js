/* 安提基特拉机械 — 部件建模与注册(31 件)。
   机构竖立于基座上:表盘面朝 +z,齿轮沿 z 分层(背板 −5.3 … 前盘 +4.9)。
   场景单位 = cm × K(0.5)。齿轮以 ExtrudeGeometry 程序化成型(齿数按实测表),
   全部绕自身 z 轴旋转;表盘贴图 Canvas 程序化生成。
   轴位坐标由 mech.js 按啮合距离严格推出(DIM.AX);z 分层避让见各部件注释。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;
  var K = D.K;
  var CY = 7.1;                    // 案中心 y(基座顶 2.6 + 案半高 4.5)

  function group() { return new THREE.Group(); }
  function wx(x) { return x * K; }
  function wy(y) { return CY + y * K; }
  function anchored(g) { g.userData.tagAnchor = new THREE.Vector3(0, 0, 0); return { group: g }; }

  /* —— 齿轮几何(Shape + Extrude,XY 平面,z 居中)—— */
  function gearGeo(Z, rPitch, thick, opts) {
    opts = opts || {};
    var pitch = 2 * Math.PI * rPitch / Z;
    var toothH = Math.min(0.10, pitch * 0.45);
    var rTip = rPitch + toothH / 2, rRoot = rPitch - toothH / 2;
    var tW = pitch * 0.34, gW = pitch * 0.42;
    var shp = new THREE.Shape();
    for (var i = 0; i < Z; i++) {
      var a = i / Z * Math.PI * 2;
      var a0 = a - gW / 2, a1 = a - tW / 2, a2 = a + tW / 2, a3 = a + gW / 2;
      if (i === 0) shp.moveTo(Math.cos(a0) * rRoot, Math.sin(a0) * rRoot);
      else shp.lineTo(Math.cos(a0) * rRoot, Math.sin(a0) * rRoot);
      shp.lineTo(Math.cos(a1) * rTip, Math.sin(a1) * rTip);
      shp.lineTo(Math.cos(a2) * rTip, Math.sin(a2) * rTip);
      shp.lineTo(Math.cos(a3) * rRoot, Math.sin(a3) * rRoot);
    }
    shp.closePath();
    if (opts.hub) {
      var hole = new THREE.Path();
      hole.absarc(0, 0, opts.hub, 0, Math.PI * 2, true);
      shp.holes.push(hole);
    }
    if (opts.spokes) {               // b1 十字辐条:4 扇形孔
      var rIn = opts.spokes[0], rOut = opts.spokes[1];
      for (var s = 0; s < 4; s++) {
        var b0 = s * Math.PI / 2 + 0.30, b1a = (s + 1) * Math.PI / 2 - 0.30;
        var hp = new THREE.Path();
        hp.absarc(0, 0, rOut, b0, b1a, false);
        hp.absarc(0, 0, rIn, b1a, b0, true);
        hp.closePath();
        shp.holes.push(hp);
      }
    }
    var geo = new THREE.ExtrudeGeometry(shp, { depth: thick, bevelEnabled: false, curveSegments: 6 });
    geo.translate(0, 0, -thick / 2);
    return geo;
  }

  /* 表内齿轮:按齿数取半径 */
  function gearMesh(id, mat, opts) {
    opts = opts || {};
    return P.mesh(gearGeo(D.TEETH[id], KS.r(id), opts.thick || D.gearT,
      { hub: opts.hub, spokes: opts.spokes }), mat, 0, 0, 0);
  }

  function gearPart(id, mat, extra) {
    var g = group();
    g.add(gearMesh(id, mat, extra || {}));
    if (extra && extra.pin) {        // k1 销:朝 +z 伸至 k2 层
      g.add(P.cyl(0.045, 0.045, 0.45, M3.steel,
        Math.cos(D.PHI0) * D.RP * K, Math.sin(D.PHI0) * D.RP * K, 0.20 * K, 10));
    }
    if (extra && extra.slot) {       // k2 正面刻槽示意
      g.add(P.box(0.10, D.RP * 2.3 * K, 0.03, M3.ironD, 0, 0,
        ((extra.thick || D.gearT) / 2 + 0.02) * K));
    }
    return anchored(g);
  }

  /* 同轴复式轮:it = [id, z 相对偏移(cm), 材质, 厚] */
  function compoundPart(list) {
    var g = group();
    list.forEach(function (it) {
      var m = gearMesh(it[0], it[2] || M3.bronze, { thick: it[3] || D.gearT, hub: 0.09 });
      m.position.z = it[1] * K;
      g.add(m);
    });
    return anchored(g);
  }

  /* —— 表盘 Canvas 贴图 —— */
  function ctex(size, draw) {
    var c = document.createElement("canvas");
    c.width = c.height = size;
    draw(c.getContext("2d"), size);
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    return t;
  }

  function ringBase(x, S, rIn, rOut, bg) {
    var c = S / 2, s = (S / 2 - 8) / rOut;
    x.fillStyle = bg;
    x.beginPath(); x.arc(c, c, rOut * s + 8, 0, Math.PI * 2); x.fill();
    x.strokeStyle = "#B08D57"; x.lineWidth = 2.5;
    x.beginPath(); x.arc(c, c, rOut * s, 0, Math.PI * 2); x.stroke();
    x.beginPath(); x.arc(c, c, rIn * s, 0, Math.PI * 2); x.stroke();
    return s;
  }

  var ZODIAC = ["ΚΡΙΟΣ", "ΤΑΥΡΟΣ", "ΔΙΔΥΜΟΙ", "ΚΑΡΚΙΝΟΣ", "ΛΕΩΝ", "ΠΑΡΘΕΝΟΣ",
                "ΧΗΛΑΙ", "ΣΚΟΡΠΙΟΣ", "ΤΟΞΟΤΗΣ", "ΑΙΓΟΚΕΡΩΣ", "ΥΔΡΟΧΟΟΣ", "ΙΧΘΥΕΣ"];
  function zodiacTex() {
    return ctex(1024, function (x, S) {
      var s = ringBase(x, S, D.zodiacR[0], D.zodiacR[1], "#0F2133");
      var c = S / 2;
      x.strokeStyle = "rgba(233,238,242,0.5)";
      x.lineWidth = 1;
      for (var i = 0; i < 36; i++) {
        var a = -Math.PI / 2 + i / 36 * Math.PI * 2;
        x.beginPath();
        x.moveTo(c + Math.cos(a) * D.zodiacR[0] * s, c + Math.sin(a) * D.zodiacR[0] * s);
        x.lineTo(c + Math.cos(a) * D.zodiacR[1] * s, c + Math.sin(a) * D.zodiacR[1] * s);
        x.stroke();
      }
      x.fillStyle = "#E9EEF2";
      x.font = "700 30px serif";
      x.textAlign = "center"; x.textBaseline = "middle";
      for (var z = 0; z < 12; z++) {
        var az = -Math.PI / 2 + (z + 0.5) / 12 * Math.PI * 2;
        x.save();
        x.translate(c + Math.cos(az) * (D.zodiacR[0] + 0.55) * s, c + Math.sin(az) * (D.zodiacR[0] + 0.55) * s);
        x.rotate(az + Math.PI / 2);
        x.fillText(ZODIAC[z], 0, 0);
        x.restore();
      }
      x.fillStyle = "rgba(233,238,242,0.55)";
      x.font = "600 15px serif";
      x.fillText("ΖΩΔΙΟΝ · 黄道十二宫", c, c - (D.zodiacR[0] - 0.62) * s);
    });
  }

  var EGYP = ["ΘΩΘ", "ΦΑΩΦΙ", "ΑΘΥΡ", "ΧΟΙΑΚ", "ΤΥΒΙ", "ΜΕΧΙΡ",
              "ΦΑΜΕΝΩΘ", "ΦΑΡΜΟΥΘΙ", "ΠΑΧΩΝ", "ΠΑΥΝΙ", "ΕΠΙΦΙ", "ΜΕΣΩΡΗ"];
  function calTex() {
    return ctex(1024, function (x, S) {
      var s = ringBase(x, S, D.calR[0], D.calR[1], "#12283C");
      var c = S / 2;
      x.strokeStyle = "rgba(233,238,242,0.42)";
      x.lineWidth = 1;
      for (var i = 0; i < 365; i++) {
        var a = -Math.PI / 2 + i / 365 * Math.PI * 2;
        var r1 = (D.calR[0] + (i % 30 === 0 ? 0.06 : 0.16)) * s;
        x.beginPath();
        x.moveTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1);
        x.lineTo(c + Math.cos(a) * D.calR[1] * s, c + Math.sin(a) * D.calR[1] * s);
        x.stroke();
      }
      x.fillStyle = "#E9EEF2";
      x.font = "700 17px serif";
      x.textAlign = "center"; x.textBaseline = "middle";
      for (var m = 0; m < 12; m++) {
        var am = -Math.PI / 2 + (m + 0.5) / 12 * Math.PI * 2;
        x.save();
        x.translate(c + Math.cos(am) * (D.calR[0] + 0.45) * s, c + Math.sin(am) * (D.calR[0] + 0.45) * s);
        x.rotate(am + Math.PI / 2);
        x.fillText(EGYP[m], 0, 0);
        x.restore();
      }
      x.fillStyle = "rgba(233,238,242,0.6)";
      x.font = "600 13px serif";
      x.fillText("5 ΕΠΑΓΟΜΕΝΑΙ", c, c + (D.calR[1] - 0.22) * s);
    });
  }

  /* 螺旋盘:阿基米德螺旋 r(u) = r0+(r1−r0)u,u = 圈内累计/总圈数 */
  var METONIC_MONTHS = ["ΦΟΙΝΙΚΑΙΟΣ", "ΚΡΑΝΕΙΟΣ", "ΛΑΝΟΤΡΟΠΙΟΣ", "ΜΑΧΑΝΕΥΣ", "ΔΩΔΕΚΑΤΕΥΣ", "ΕΥΚΛΕΙΟΣ",
                        "ΑΡΤΕΜΙΣΙΟΣ", "ΨΥΔΡΕΥΣ", "ΓΑΜΕΙΛΙΟΣ", "ΑΓΡΙΑΝΙΟΣ", "ΠΑΝΑΜΟΣ", "ΑΠΕΛΛΑΙΟΣ"];
  function spiralTex(S, turns, r0, r1, cells, monthLabels, glyphMode) {
    return ctex(S, function (x) {
      var c = S / 2, s = (S / 2 - 10) / (r1 + 0.3);
      var PHI = turns * Math.PI * 2;
      function rad(u) { return r0 + (r1 - r0) * u; }
      function pt(u) {
        var a = -Math.PI / 2 + u * PHI;
        return [c + Math.cos(a) * rad(u) * s, c + Math.sin(a) * rad(u) * s];
      }
      x.fillStyle = "#0F2133";
      x.beginPath(); x.arc(c, c, r1 * s + 10, 0, Math.PI * 2); x.fill();
      x.strokeStyle = "#B08D57"; x.lineWidth = 2;
      x.beginPath(); x.arc(c, c, r1 * s, 0, Math.PI * 2); x.stroke();
      /* 双螺旋槽 */
      var dr = (r1 - r0) / turns * 0.15;
      x.lineWidth = 1.6;
      [-1, 1].forEach(function (sg) {
        x.strokeStyle = "rgba(176,141,87,0.85)";
        x.beginPath();
        for (var i = 0; i <= 720; i++) {
          var u = i / 720;
          var a = -Math.PI / 2 + u * PHI;
          var rr = Math.min(Math.max(rad(u) + sg * dr, 0), r1 * 1.02);
          var px = c + Math.cos(a) * rr * s, py = c + Math.sin(a) * rr * s;
          if (i === 0) x.moveTo(px, py); else x.lineTo(px, py);
        }
        x.stroke();
      });
      /* 格分线:cells 格,每格径向短线跨槽 */
      x.strokeStyle = "rgba(233,238,242,0.30)";
      x.lineWidth = 1;
      for (var k = 0; k <= cells; k++) {
        var u = k / cells;
        var a = -Math.PI / 2 + u * PHI;
        var rr0 = Math.max(rad(u) - dr - 0.02, r0 - dr * 1.4), rr1 = rad(u) + dr + 0.02;
        x.beginPath();
        x.moveTo(c + Math.cos(a) * rr0 * s, c + Math.sin(a) * rr0 * s);
        x.lineTo(c + Math.cos(a) * rr1 * s, c + Math.sin(a) * rr1 * s);
        x.stroke();
      }
      /* 月份名(每圈 12 处) */
      if (monthLabels) {
        x.fillStyle = "#E9EEF2";
        x.font = "600 13px serif";
        x.textAlign = "center"; x.textBaseline = "middle";
        var per = cells / turns;
        for (var t = 0; t < turns; t++) {
          for (var m = 0; m < 12; m++) {
            var u2 = (t * per + (m + 0.5) * per / 12) / cells;
            if (u2 >= 1) continue;
            var a2 = -Math.PI / 2 + u2 * PHI;
            var rr2 = rad(u2) - dr * 2.6;
            x.save();
            x.translate(c + Math.cos(a2) * rr2 * s, c + Math.sin(a2) * rr2 * s);
            x.rotate(a2 + Math.PI / 2);
            x.fillText(monthLabels[m], 0, 0);
            x.restore();
          }
        }
      }
      /* 蚀相符号(示意分布:Σ 月蚀 38 / Η 日蚀 27 / 223 格) */
      if (glyphMode) {
        x.font = "700 12px serif";
        x.textAlign = "center"; x.textBaseline = "middle";
        for (var gI = 0; gI < cells; gI++) {
          var uG = (gI + 0.5) / cells;
          var aG = -Math.PI / 2 + uG * PHI;
          var isL = ((gI * 7) % cells) < 38, isS = ((gI * 11) % cells) < 27;
          if (!isL && !isS) continue;
          x.fillStyle = isL ? "#E9C93C" : "#D6543A";
          x.fillText(isL && isS ? "ΣΗ" : (isL ? "Σ" : "Η"),
            c + Math.cos(aG) * rad(uG) * s, c + Math.sin(aG) * rad(uG) * s);
        }
        x.fillStyle = "#E9C93C";
        x.font = "700 14px serif";
        x.textAlign = "center";
        x.fillText("ΣΕΛΗΝΗ Σ · ΗΛΙΟΣ Η · 223 ΜΗΝΕΣ", c, 16);
      } else {
        x.fillStyle = "#E9C93C";
        x.font = "700 14px serif";
        x.textAlign = "center";
        x.fillText("235 ΜΗΝΕΣ · 5 ΕΛΙΚΕΣ", c, 16);
      }
    });
  }

  function subTex(kind) {
    return ctex(256, function (x, S) {
      var c = S / 2;
      x.fillStyle = "#12283C";
      x.beginPath(); x.arc(c, c, c - 4, 0, Math.PI * 2); x.fill();
      x.strokeStyle = "#B08D57"; x.lineWidth = 3;
      x.beginPath(); x.arc(c, c, c - 6, 0, Math.PI * 2); x.stroke();
      x.strokeStyle = "rgba(233,238,242,0.4)"; x.lineWidth = 1.5;
      var n = kind === "exe" ? 3 : 4;
      for (var i = 0; i < n; i++) {
        var a = -Math.PI / 2 + i / n * Math.PI * 2;
        x.beginPath(); x.moveTo(c, c);
        x.lineTo(c + Math.cos(a) * (c - 6), c + Math.sin(a) * (c - 6));
        x.stroke();
      }
      var labs = kind === "games" ? ["ΙΣΘΜΙΑ", "ΝΕΜΕΑ", "ΠΥΘΙΑ", "ΑΛΙΕΙΑ"]
               : kind === "call" ? ["ΛΑ", "ΛΒ", "ΛΓ", "ΛΔ"]
               : ["—", "Η 8", "ΙϚ 16"];
      var yrs = ["ΛΑ", "ΛΒ", "ΛΓ", "ΛΔ"];
      x.textAlign = "center"; x.textBaseline = "middle";
      for (var j = 0; j < n; j++) {
        var aj = -Math.PI / 2 + (j + 0.5) / n * Math.PI * 2;
        x.fillStyle = "#E9EEF2";
        x.font = "700 20px serif";
        x.fillText(labs[j], c + Math.cos(aj) * c * 0.52, c + Math.sin(aj) * c * 0.52);
        if (kind === "games") {
          x.fillStyle = "rgba(233,201,60,0.9)";
          x.font = "600 15px serif";
          x.fillText(yrs[j], c + Math.cos(aj) * c * 0.24, c + Math.sin(aj) * c * 0.24);
        }
      }
    });
  }

  function moonBallTex() {
    return ctex(128, function (x, S) {
      x.fillStyle = "#E9EEF2"; x.fillRect(0, 0, S, S);
      x.fillStyle = "#14161B"; x.fillRect(S / 2, 0, S / 2, S);
    });
  }

  /* —— 部件构建器 —— */
  function plateGeo(w, h, cr, holeR) {
    var shp = new THREE.Shape();
    shp.moveTo(-w + cr, -h);
    shp.lineTo(w - cr, -h); shp.quadraticCurveTo(w, -h, w, -h + cr);
    shp.lineTo(w, h - cr); shp.quadraticCurveTo(w, h, w - cr, h);
    shp.lineTo(-w + cr, h); shp.quadraticCurveTo(-w, h, -w, h - cr);
    shp.lineTo(-w, -h + cr); shp.quadraticCurveTo(-w, -h, -w + cr, -h);
    if (holeR) {
      var hole = new THREE.Path();
      hole.absarc(0, D.dialCY, holeR, 0, Math.PI * 2, true);
      shp.holes.push(hole);
    }
    var geo = new THREE.ExtrudeGeometry(shp, { depth: 0.24, bevelEnabled: false });
    geo.translate(0, 0, -0.12);
    return geo;
  }

  function buildCase() {
    var g = group();
    g.add(P.box(20, 2.6, 7, M3.stone, 0, 1.3, 0));
    g.add(P.box(18.6, 0.22, 6.2, M3.dark, 0, 2.7, 0));
    var hw = 17, hh = 4.5, hd = 2.75;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (sxz) {
      g.add(P.box(0.55, hh * 2, 0.55, M3.woodD, sxz[0] * (hw - 0.4), CY, sxz[1] * (hd - 0.4)));
    });
    [-1, 1].forEach(function (sy) {
      g.add(P.box(hw * 2 - 0.8, 0.5, 0.7, M3.wood, 0, CY + sy * (hh - 0.25), hd - 0.4));
      g.add(P.box(hw * 2 - 0.8, 0.5, 0.7, M3.wood, 0, CY + sy * (hh - 0.25), -(hd - 0.4)));
      [-1, 1].forEach(function (sx) {
        g.add(P.box(0.7, 0.5, hd * 2 - 0.8, M3.wood, sx * (hw - 0.4), CY + sy * (hh - 0.25), 0));
      });
    });
    g.userData.tagAnchor = new THREE.Vector3(0, -2.2, 0);
    return { group: g };
  }

  function buildFrontPlate() {
    var g = group();
    g.add(P.mesh(plateGeo(16, 8, 1.2, D.zodiacR[0] - 0.12), M3.bronze, 0, 0, 0));
    g.userData.tagAnchor = new THREE.Vector3(-13, 0, 0);
    return { group: g };
  }

  function buildBackPlate() {
    var g = group();
    g.add(P.mesh(plateGeo(16, 8, 1.2, 0), M3.bronze, 0, 0, 0));
    g.add(P.box(9, 0.8, 0.1, M3.dark, 0, 6.9, -0.35));
    g.userData.tagAnchor = new THREE.Vector3(-13, 0, 0);
    return { group: g };
  }

  function ringDisc(rIn, rOut, tex) {
    var g = group();
    g.add(P.mesh(new THREE.RingGeometry(rIn * K, rOut * K, 96),
      new THREE.MeshBasicMaterial({ map: tex }), 0, 0, 0, false, false));
    return g;
  }

  function buildZodiac() { return anchored(ringDisc(D.zodiacR[0], D.zodiacR[1], zodiacTex())); }
  function buildCal() { return anchored(ringDisc(D.calR[0], D.calR[1], calTex())); }

  function buildDatePtr() {
    var g = group();
    g.add(P.cyl(0.30 * K, 0.34 * K, 0.16, M3.gold, 0, 0, 0, 20));
    g.add(P.box(0.09, 6.0 * K, 0.05, M3.gold, 0, 2.6 * K, 0));
    g.add(P.box(0.16, 1.1 * K, 0.06, M3.gold, 0, -0.9 * K, 0));
    g.add(P.cyl(0.045, 0.045, 2.6, M3.steelD, 0, 0, -1.3, 10));
    return anchored(g);
  }

  function buildMoonPtr() {
    var g = group();
    g.add(P.cyl(0.24 * K, 0.26 * K, 0.14, M3.steel, 0, 0, 0, 20));
    g.add(P.box(0.075, 5.7 * K, 0.045, M3.steel, 0, 2.5 * K, 0));
    var ball = P.sph(0.42 * K, new THREE.MeshStandardMaterial({ map: moonBallTex(), roughness: 0.4, metalness: 0.1 }), 0, 5.15 * K, 0.10);
    g.add(ball);
    g.add(P.cyl(0.03, 0.03, 2.9, M3.steelD, 0, 0, -1.45, 10));
    g.userData.ball = ball;
    return anchored(g);
  }

  function handPart(len, color, hubR, follower) {
    var g = group();
    g.add(P.cyl(hubR * K, hubR * K, 0.14, color, 0, 0, 0, 16));
    g.add(P.box(0.09, len * K, 0.05, color, 0, len * K / 2 + 0.2 * K, 0));
    if (follower) g.add(P.cyl(0.06 * K, 0.06 * K, 0.5, M3.steel, 0, len * K, -0.18, 8));
    g.add(P.box(0.13, 0.9 * K, 0.05, color, 0, -0.65 * K, 0));
    return g;
  }

  function buildSpiralDisc(rOut, tex) {
    var g = group();
    var disc = P.mesh(new THREE.CircleGeometry(rOut * K, 96),
      new THREE.MeshBasicMaterial({ map: tex }), 0, 0, 0, false, false);
    disc.rotation.y = Math.PI;          // 盘面朝 -z(背面观察者),文字不镜像;不受光保证可读
    g.add(disc);
    return anchored(g);
  }

  function pointerArbor(gearId, zGear, handLen, handColor, handZLocal, follower, hub) {
    /* 齿轮 + 指针同轴(指针经轴管伸至背面盘面) */
    var g = group();
    g.add(gearMesh(gearId, M3.bronze, { thick: D.gearT, hub: hub || 0.08 }));
    var hand = handPart(handLen, handColor, 0.12, follower);
    hand.position.z = handZLocal * K;
    g.add(hand);
    return anchored(g);
  }

  function buildSubFaces() {
    var g = group();
    [["o", subTex("games")], ["q", subTex("call")], ["i", subTex("exe")]].forEach(function (it) {
      var axk = D.AX[it[0]];
      var sub = P.mesh(new THREE.CircleGeometry(D.subR[it[0]] * K, 64),
        new THREE.MeshBasicMaterial({ map: it[1] }),
        wx(axk[0]), wy(axk[1]) - CY, -0.02, false, false);
      sub.rotation.y = Math.PI;         // 朝向背面观察者
      g.add(sub);
    });
    g.userData.tagAnchor = new THREE.Vector3(wx(D.AX.o[0]), wy(D.AX.o[1]) - CY, 0.2);
    return { group: g };
  }

  function buildCrank() {
    var g = group();
    var crown = P.mesh(gearGeo(48, 0.66, 0.5, { hub: 0.12 }), M3.bronze, 0, 0, 0);
    crown.rotation.y = Math.PI / 2;
    g.add(crown);
    g.add(P.cyl(0.10, 0.10, 1.5, M3.steel, 0.75, 0, 0, 10));
    var grip = P.cyl(0.16, 0.16, 1.0, M3.woodD, 1.5, 0, 0, 12);
    grip.rotation.z = Math.PI / 2;
    g.add(grip);
    g.add(P.sph(0.20, M3.woodD, 1.5, 0.5, 0));
    g.userData.tagAnchor = new THREE.Vector3(1.5, 0.5, 0);
    return { group: g };
  }

  /* —— 注册 ——
     z 分层(cm):b1 +3.4 | b2 +1.6(厚2.0 跨0.6-2.6) | c1 +1.6 c2 +2.8 | d1 +2.8 d2 +0.4
     e2 +0.4 e5 −0.2 | k1 −0.2 k2 +0.2 | e6 +0.2 e1 −0.4 | b3 −0.4 |
     l1 +0.8 l2 +0.2 | m1 +0.2 m2 −0.4 m3 −1.0 | n1 −0.4 n2 +0.8 n3 −2.2 | o1 +0.8 |
     p1 −2.2 p2 −2.8 | q1 −2.8 | e3 −1.0 e4 −1.6 | f1 −1.6 f2 −2.2 | g1 −2.2 g2 −2.8 |
     h1 −2.8 h2 −3.4 | i1 −3.4;背盘面 −4.95 副盘 −4.7 指针 −4.5 背板 −5.3 */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }
    function ax(key, z) { return [wx(D.AX[key][0]), wy(D.AX[key][1]), z * K]; }
    function fly(dx, dy, dz) { return [dx * K, dy * K, dz * K]; }

    /* 阶段 0:骨架 */
    def({ id: "case", name: "CASE · 木框基座", sub: "34×18×11 cm 示意 · 敞开展示框架", phase: 0, at: 0.2, dur: 1.3,
      build: buildCase, target: [0, 0, 0], start: [0, 9.5, -4.5], mid: [0, 5.5, -2.0] });
    def({ id: "frontPlate", name: "FRONT PLATE · 前铜板", sub: "中孔 r6.1 · 黄道/历法环承座", phase: 0, at: 1.0, dur: 1.2,
      build: buildFrontPlate, target: [0, CY, 4.2 * K], start: [0, 13.5, 4.2 * K], mid: [0, 11.0, 4.2 * K] });
    def({ id: "backPlate", name: "BACK PLATE · 背铜板", sub: "背双螺旋盘 + 三副盘承载", phase: 0, at: 1.6, dur: 1.2,
      build: buildBackPlate, target: [0, CY, -4.1 * K], start: [0, 13.5, -4.1 * K], mid: [0, 11.0, -4.1 * K] });

    /* 阶段 1:前盘 */
    def({ id: "zodiac", name: "ZODIAC · 黄道环", sub: "十二宫 · 360° · 内圈固定", phase: 1, at: 5.8, dur: 1.1,
      build: buildZodiac, target: [0, CY, 4.6 * K], start: [0, 12.5, 4.6 * K], mid: [0, 10.0, 4.6 * K] });
    def({ id: "cal", name: "CALENDAR · 历法环", sub: "埃及历 365 格 · 可手动校正", phase: 1, at: 6.5, dur: 1.1,
      build: buildCal, target: [0, CY, 4.9 * K], start: [0, 12.5, 4.9 * K], mid: [0, 10.0, 4.9 * K] });
    def({ id: "datePtr", name: "DATE HAND · 日期指针", sub: "b1 轴前端 · 平太阳/日期", phase: 1, at: 7.3, dur: 1.0, kind: "kine",
      build: buildDatePtr, target: [0, wy(D.dialCY), 5.2 * K], off: [0, 3.0, 1.2] });
    def({ id: "moonPtr", name: "MOON HAND · 月指针", sub: "中央轴管 · 尖端月相球", phase: 1, at: 7.9, dur: 1.0, kind: "kine",
      build: buildMoonPtr, target: [0, wy(D.dialCY), 5.4 * K], off: [0, 3.4, 1.4] });

    /* 阶段 2:主轮与月轮系前段 */
    def({ id: "b1", name: "MAIN WHEEL · 主轮 b1 223T", sub: "十字辐条 · 1 转 = 1 年", phase: 2, at: 11.6, dur: 1.2, kind: "kine",
      build: function () { return gearPart("b1", M3.bronze, { thick: 0.22, spokes: [0.55, 5.30], hub: 0.12 }); },
      target: ax("b", 3.4), off: fly(2.5, 3.0, 2.5) });
    def({ id: "b2", name: "DRIVE WHEEL · b2 64T", sub: "同轴厚轮 · 兼驱月链/历链", phase: 2, at: 12.4, dur: 1.1, kind: "kine",
      build: function () { return gearPart("b2", M3.brass, { thick: 2.0 }); },
      target: ax("b", 1.6), off: fly(-2.5, 3.0, 2.5) });
    def({ id: "cArbor", name: "C ARBOR · c1 38T + c2 48T", sub: "复式轮 · ×64/38 ×48/24", phase: 2, at: 13.3, dur: 1.1, kind: "kine",
      build: function () { return compoundPart([["c1", 0.0, M3.bronze], ["c2", 1.2, M3.brass]]); },
      target: ax("c", 1.6), off: fly(2.0, 3.2, 1.5) });
    def({ id: "dArbor", name: "D ARBOR · d1 24T + d2 127T", sub: "127 = 254 质因数 · ×127/32", phase: 2, at: 14.2, dur: 1.1, kind: "kine",
      build: function () { return compoundPart([["d1", 0.0, M3.brass], ["d2", -2.4, M3.bronze]]); },
      target: ax("d", 2.8), off: fly(-2.0, 3.4, 1.5) });

    /* 阶段 3:销槽装置与月输出 */
    def({ id: "eaArbor", name: "E-a ARBOR · e2 32T + e5 50T", sub: "月链输出 = 254/19 转/年", phase: 3, at: 17.8, dur: 1.1, kind: "kine",
      build: function () { return compoundPart([["e2", 0.0, M3.bronze], ["e5", -0.6, M3.brass]]); },
      target: ax("Ea", 0.4), off: fly(2.2, 2.6, 1.2) });
    def({ id: "k1", name: "PIN GEAR · k1 50T(销)", sub: "销:槽半径比 2.25:19.6(扫描)", phase: 3, at: 18.7, dur: 1.0, kind: "kine",
      build: function () { return gearPart("k1", M3.bronze, { pin: true }); },
      target: ax("k", -0.2), off: fly(1.8, 2.8, 1.0) });
    def({ id: "k2", name: "SLOT GEAR · k2 50T(槽)", sub: "轴心固定偏置 E0 · ε≈0.1146", phase: 3, at: 19.4, dur: 1.0, kind: "kine",
      build: function () { return gearPart("k2", M3.brass, { slot: true }); },
      target: [wx(D.AX.k2[0]), wy(D.AX.k2[1]), 0.2 * K], off: fly(-1.8, 3.0, 1.0) });
    def({ id: "ebArbor", name: "E-b ARBOR · e6 50T + e1 32T", sub: "销槽输出回传", phase: 3, at: 20.2, dur: 1.0, kind: "kine",
      build: function () { return compoundPart([["e6", 0.0, M3.brass], ["e1", -0.6, M3.bronze]]); },
      target: ax("Eb", 0.2), off: fly(-2.2, 2.4, 1.2) });
    def({ id: "b3", name: "MOON WHEEL · b3 32T", sub: "中央轴管 → 月指针", phase: 3, at: 21.0, dur: 1.0, kind: "kine",
      build: function () { return gearPart("b3", M3.steel, {}); },
      target: ax("b", -0.4), off: fly(0, 2.6, 1.0) });

    /* 阶段 4:背面盘与指针 */
    def({ id: "metDial", name: "METONIC DIAL · 梅顿盘", sub: "235 朔望月 · 五圈螺旋", phase: 4, at: 24.6, dur: 1.2,
      build: function () { return buildSpiralDisc(4.75, spiralTex(1024, 5, D.metSpiral[0], D.metSpiral[1], 235, METONIC_MONTHS, null)); },
      target: [wx(D.AX.n[0]), wy(D.AX.n[1]), -4.5 * K], start: [wx(D.AX.n[0]), 13.0, -4.5 * K], mid: [wx(D.AX.n[0]), 10.5, -4.5 * K] });
    def({ id: "nArbor", name: "N ARBOR · n1 53T(梅顿指针)", sub: "5/19 转/年 · 齿数为推测件", phase: 4, at: 25.5, dur: 1.0, kind: "kine",
      build: function () {
        var g = compoundPart([["n1", 0.0, M3.bronze], ["n2", 1.2, M3.brass], ["n3", -1.8, M3.bronze]]).group;
        var hand = handPart(4.5, M3.brass, 0.14, true);
        hand.position.z = -4.45 * K;
        g.add(hand);
        return anchored(g);
      },
      target: ax("n", -0.4), off: fly(1.6, 2.4, 1.0) });
    def({ id: "sarDial", name: "SAROS DIAL · 沙罗盘", sub: "223 月 · 四圈螺旋 · 蚀相符号", phase: 4, at: 26.3, dur: 1.2,
      build: function () { return buildSpiralDisc(3.65, spiralTex(1024, 4, D.sarSpiral[0], D.sarSpiral[1], 223, null, "saros")); },
      target: [wx(D.AX.g[0]), wy(D.AX.g[1]), -4.5 * K], start: [wx(D.AX.g[0]), 12.5, -4.5 * K], mid: [wx(D.AX.g[0]), 10.0, -4.5 * K] });
    def({ id: "gArbor", name: "G ARBOR · g1 54T(沙罗指针)", sub: "940/4237 转/年 · 四圈一沙罗", phase: 4, at: 27.2, dur: 1.0, kind: "kine",
      build: function () {
        var g = compoundPart([["g1", 0.0, M3.bronze], ["g2", -0.6, M3.brass]]).group;
        var hand = handPart(3.4, M3.gold, 0.12, true);
        hand.position.z = -2.65 * K;
        g.add(hand);
        return anchored(g);
      },
      target: ax("g", -2.2), off: fly(1.6, 2.6, 1.0) });
    def({ id: "subFaces", name: "SUB DIALS · 三副盘", sub: "竞技会 / 卡利普斯 / Exeligmos", phase: 4, at: 28.0, dur: 1.1,
      build: buildSubFaces, target: [0, CY, -4.42 * K], start: [0, 12.0, -4.42 * K], mid: [0, 9.6, -4.42 * K] });
    def({ id: "oArbor", name: "O ARBOR · o1 60T(竞技会)", sub: "n2 57 → o1:恰 4 年/转 · Frag B 实物", phase: 4, at: 28.8, dur: 1.0, kind: "kine",
      build: function () { return pointerArbor("o1", 0.8, 1.85, M3.steel, -5.3, false); },
      target: ax("o", 0.8), off: fly(1.2, 2.2, 0.8) });
    def({ id: "qArbor", name: "Q ARBOR · q1 60T(卡利普斯)", sub: "5/19 × 1/20 = 1/76 · 推测件", phase: 4, at: 29.5, dur: 1.0, kind: "kine",
      build: function () { return pointerArbor("q1", -2.8, 1.45, M3.steel, -1.7, false); },
      target: ax("q", -2.8), off: fly(-1.2, 2.2, 0.8) });
    def({ id: "iArbor", name: "I ARBOR · i1 60T(Exeligmos)", sub: "54 年/转 · 修正 8/16 小时", phase: 4, at: 30.2, dur: 1.0, kind: "kine",
      build: function () { return pointerArbor("i1", -3.4, 1.45, M3.steel, -1.1, false); },
      target: ax("i", -3.4), off: fly(1.2, -2.2, 0.8) });

    /* 阶段 5:背轮系 + 摇柄 */
    def({ id: "lArbor", name: "L ARBOR · l1 38T + l2 53T", sub: "历法链一级 ×64/38", phase: 5, at: 33.0, dur: 1.0, kind: "kine",
      build: function () { return compoundPart([["l1", 0.0, M3.bronze], ["l2", -0.6, M3.brass]]); },
      target: ax("l", 0.8), off: fly(-1.8, 2.6, 1.0) });
    def({ id: "mArbor", name: "M ARBOR · m1 96T + m2 15T + m3 27T", sub: "三联同轴 · m3 为推测件", phase: 5, at: 33.8, dur: 1.0, kind: "kine",
      build: function () { return compoundPart([["m1", 0.0, M3.bronze], ["m2", -0.6, M3.brass], ["m3", -1.2, M3.bronze]]); },
      target: ax("m", 0.2), off: fly(1.8, 2.8, 1.0) });
    def({ id: "pArbor", name: "P ARBOR · p1 60T + p2 20T", sub: "卡利普斯链 ×15/60 ×20/60", phase: 5, at: 34.5, dur: 0.9, kind: "kine",
      build: function () { return compoundPart([["p1", 0.0, M3.bronze], ["p2", -0.6, M3.brass]]); },
      target: ax("p", -2.2), off: fly(-1.4, 2.4, 0.8) });
    def({ id: "e34", name: "E-c ARBOR · e3 223T + e4 188T", sub: "拱点进动轴 8.88 年 · 沙罗级", phase: 5, at: 35.3, dur: 1.1, kind: "kine",
      build: function () { return compoundPart([["e3", 0.0, M3.bronze], ["e4", -0.6, M3.brass]]); },
      target: ax("Ec", -1.0), off: fly(-2.4, 2.8, 1.2) });
    def({ id: "fArbor", name: "F ARBOR · f1 53T + f2 30T", sub: "×188/53 ×30/54 → 沙罗", phase: 5, at: 36.1, dur: 0.9, kind: "kine",
      build: function () { return compoundPart([["f1", 0.0, M3.brass], ["f2", -0.6, M3.bronze]]); },
      target: ax("f", -1.6), off: fly(1.6, -2.4, 1.0) });
    def({ id: "hArbor", name: "H ARBOR · h1 60T + h2 15T", sub: "Exeligmos 链 ×20/60 ×15/60", phase: 5, at: 36.8, dur: 0.9, kind: "kine",
      build: function () { return compoundPart([["h1", 0.0, M3.bronze], ["h2", -0.6, M3.brass]]); },
      target: ax("h", -2.8), off: fly(1.4, -2.6, 0.8) });
    def({ id: "crank", name: "CRANK · 侧摇柄", sub: "冠轮啮合 b1 · 约 78 天/转", phase: 5, at: 37.6, dur: 1.0, kind: "kine",
      build: buildCrank, target: [wx(6.79), wy(D.dialCY), 3.4 * K], off: fly(3.0, 0.5, 0.8) });
  };

  /* —— 运动学分发(每帧)—— */
  var KINE_MAP = { cArbor: "c1", dArbor: "d1", eaArbor: "e2", ebArbor: "e6",
                   lArbor: "l1", mArbor: "m1", nArbor: "n1", pArbor: "p1", e34: "e3",
                   fArbor: "f1", gArbor: "g1", hArbor: "h1", iArbor: "i1", oArbor: "o1", qArbor: "q1",
                   datePtr: "b1", moonPtr: "b3" };
  MECH.KINE = function (st) {
    var th = KS.angles(st.days);
    for (var id in KINE_MAP) {
      var e = MECH.Parts.entry(id);
      if (e && e.shown) e.group.rotation.z = th[KINE_MAP[id]];
    }
    ["b1", "b2", "k1"].forEach(function (id) {
      var e = MECH.Parts.entry(id);
      if (e && e.shown) e.group.rotation.z = th[id];
    });
    /* k2:轴心固定(落位于 C_k2),每帧只写槽角 */
    var k2 = MECH.Parts.entry("k2");
    if (k2 && k2.shown) k2.group.rotation.z = th.k2;
    /* 月相球:月−日 相对角(朔望) */
    var mp = MECH.Parts.entry("moonPtr");
    if (mp && mp.shown && mp.group.userData.ball) {
      mp.group.userData.ball.rotation.z = th.b3 - th.b1;
    }
    /* 摇柄:冠轮 48T 啮合 b1 → 约 78 天/转 */
    var ck = MECH.Parts.entry("crank");
    if (ck && ck.shown) ck.group.rotation.z = -th.b1 * 48 / 223;
  };
})(window.MECH = window.MECH || {});
