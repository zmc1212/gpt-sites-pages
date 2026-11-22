/* 算盘 — 部件建模与注册(16 件)。
   竖立盘面:梁水平,13 档竖直,档距 1.15u;上珠 2(深色)/下珠 5(浅色)。
   每档一个部件(7 珠),KINE 依 scheduleAt(st.days) 珠态逐珠定位(确定性)。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;
  var CY = 7.0;                       // 盘面中心 y(基座顶 2.6 + 盘半高 3.2)
  var U = MECH.Scene3D ? 1 : 1;

  function group() { return new THREE.Group(); }
  function anchored(g) { g.userData.tagAnchor = new THREE.Vector3(0, 0, 0); return { group: g }; }

  /* 算珠:扁椭球(孔沿档,档竖直 y) */
  function beadGeo() {
    var geo = new THREE.SphereGeometry(1, 14, 10);
    geo.scale(D.bead.rx, D.bead.ry, D.bead.rz);
    return geo;
  }

  /* —— 部件构建器 —— */
  function buildFrame() {
    var g = group();
    var hw = D.frameW / 2, top = 2.3, bot = -3.7;
    /* 外框四边 */
    g.add(P.box(D.frameW, 0.42, 0.62, M3.woodD, 0, top, 0));
    g.add(P.box(D.frameW, 0.46, 0.62, M3.woodD, 0, bot, 0));
    [-1, 1].forEach(function (s) {
      g.add(P.box(0.42, top - bot, 0.62, M3.woodD, s * (hw - 0.21), (top + bot) / 2, 0));
    });
    /* 梁(横梁,2:5 分界) */
    g.add(P.box(D.frameW - 0.5, 0.30, 0.66, M3.woodL, 0, D.beamY, 0));
    g.add(P.box(D.frameW - 0.5, 0.06, 0.70, M3.brass, 0, D.beamY + 0.18, 0));
    /* 展示座 */
    g.add(P.box(18, 0.5, 5, M3.stone, 0, -CY + 0.25, 0));
    g.add(P.box(2.2, 2.4, 2.2, M3.stone, -6.4, -CY + 1.7, 0));
    g.add(P.box(2.2, 2.4, 2.2, M3.stone, 6.4, -CY + 1.7, 0));
    g.userData.tagAnchor = new THREE.Vector3(-7.4, 0, 0);
    return { group: g };
  }

  function buildRods() {
    var g = group();
    for (var i = 0; i < D.RODS; i++) {
      var x = (i - 6) * D.rodGap;
      g.add(P.cyl(0.05, 0.05, 5.7, M3.brass, x, (2.1 + (-3.5)) / 2, 0, 10));
    }
    g.userData.tagAnchor = new THREE.Vector3(-(6) * D.rodGap, 2.0, 0);
    return { group: g };
  }

  function buildRod(i) {
    var g = group();
    var beads = [];
    /* 上珠 ×2(深)children 0-1;下珠 ×5(浅)children 2-6 */
    for (var u = 0; u < 2; u++) {
      var b = P.mesh(beadGeo(), M3.woodD, 0, D.upper.restY[u], 0);
      g.add(b);
      beads.push(b);
    }
    for (var l = 0; l < 5; l++) {
      var b2 = P.mesh(beadGeo(), M3.wood, 0, D.lower.restY(l), 0);
      g.add(b2);
      beads.push(b2);
    }
    g.userData.beads = beads;
    var PLACE = { 9: "千位", 10: "百位", 11: "十位", 12: "个位" };
    var sub = PLACE[i] ? PLACE[i] + " · 位值 10^" + (12 - i) : "位值 10^" + (12 - i);
    return { group: g, sub: sub };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }
    function rodX(i) { return [(i - 6) * D.rodGap, CY, 0]; }
    function fly(dx, dy, dz) { return [dx, dy, dz]; }

    def({ id: "frame", name: "FRAME · 框梁座", sub: "外框 + 横梁(2:5 分界)+ 展示座", phase: 0, at: 0.2, dur: 1.4,
      build: buildFrame, target: [0, CY, 0], start: [0, 14.5, -3.5], mid: [0, 10.5, -1.5] });
    def({ id: "rods", name: "RODS · 十三档", sub: "黄铜档 · 位值 10^0…10^12", phase: 0, at: 1.4, dur: 1.2,
      build: buildRods, target: [0, CY, 0], start: [0, 15.0, -3.0], mid: [0, 11.0, -1.2] });
    for (var i = 0; i < 6; i++) {
      (function (i) {
        def({ id: "rod" + i, name: "ROD " + i + " · 第" + (i + 1) + "档", phase: 1, at: 5.6 + i * 0.55, dur: 0.9, kind: "kine",
          build: function () { return buildRod(i); },
          target: rodX(i), off: fly(0, 3.2, 1.6) });
      })(i);
    }
    for (var j = 6; j < 13; j++) {
      (function (j) {
        def({ id: "rod" + j, name: "ROD " + j + " · 第" + (j + 1) + "档" + (j === 12 ? "(个位)" : j === 11 ? "(十位)" : j === 10 ? "(百位)" : j === 9 ? "(千位)" : ""), phase: 2, at: 12.2 + (j - 6) * 0.55, dur: 0.9, kind: "kine",
          build: function () { return buildRod(j); },
          target: rodX(j), off: fly(0, 3.2, 1.6) });
      })(j);
    }
  };

  /* —— 运动学分发(每帧):珠态 → 逐珠 y —— */
  var ROD_IDS = [];
  for (var ri = 0; ri < 13; ri++) ROD_IDS.push("rod" + ri);
  MECH.KINE = function (st) {
    var sch = KS.scheduleAt(st.days);
    for (var i = 0; i < 13; i++) {
      var e = MECH.Parts.entry("rod" + i);
      if (!e || !e.shown || !e.group.userData.beads) continue;
      var beads = e.group.userData.beads;
      var uf = sch.up[i], df = sch.down[i];          // 分数珠态(含移动插值)
      /* 上珠 j:rest → active,插值 = clamp(df − j, 0, 1) */
      for (var u = 0; u < 2; u++) {
        var k = Math.max(0, Math.min(1, df - u));
        var y0 = D.upper.restY[u], y1 = D.upper.activeY[u];
        beads[u].position.y = y0 + (y1 - y0) * k;
      }
      /* 下珠 j:rest → up,插值 = clamp(uf − j, 0, 1) */
      for (var l = 0; l < 5; l++) {
        var k2 = Math.max(0, Math.min(1, uf - l));
        var yy0 = D.lower.restY(l), yy1 = D.lower.upY(l);
        beads[2 + l].position.y = yy0 + (yy1 - yy0) * k2;
      }
    }
  };
})(window.MECH = window.MECH || {});
