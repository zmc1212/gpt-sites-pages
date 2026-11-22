/* 连杆系部件构建:十字头 / 主连杆 / 结合杆 / 简化 Walschaerts 阀动。
   全部返回 {group, anchor, kine},由 parts.js 的 def() 注册,
   每帧由 kine(S) 依据 ST28.GEAR.solve 的精确解摆放。 */
(function (ST28) {
  var ROTX = Math.PI / 2, ROTZ = Math.PI / 2;

  function mesh(geo, mat, x, y, z) {
    var m = new THREE.Mesh(geo, mat);
    if (x !== undefined) m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }
  function box(w, h, d, mat, x, y, z) { return mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z); }
  function cyl(rt, rb, h, mat, x, y, z, seg) { return mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 20), mat, x, y, z); }

  /* 可变长圆杆(鞲鞴杆 / 阀杆):单位几何,X 向缩放 */
  function makeUnitRod(rad, mat) {
    var geo = new THREE.CylinderGeometry(rad, rad, 1, 10);
    geo.rotateZ(ROTZ);
    var m = new THREE.Mesh(geo, mat);
    m.castShadow = true; m.receiveShadow = true;
    m.place = function (x1, y1, x2, y2, z) {
      var dx = x2 - x1, dy = y2 - y1;
      var l = Math.sqrt(dx * dx + dy * dy) || 0.0001;
      m.scale.x = l;
      m.position.set((x1 + x2) / 2, (y1 + y2) / 2, z || 0);
      m.rotation.z = Math.atan2(dy, dx);
    };
    return m;
  }

  /* 定长连杆:杆身 + 两端轴眼,place() 按两端点摆放(长度微变靠缩放吸收) */
  function makeRod(len, thick, tall, mat, eyeR1, eyeR2) {
    var M = ST28.Scene3D.M;
    var g = new THREE.Group();
    var shaft = box(1, tall, thick, mat, 0, 0, 0);
    shaft.scale.x = len;
    g.add(shaft);
    var e1 = cyl(eyeR1, eyeR1, thick + 0.028, M.steelD, -len / 2, 0, 0, 12);
    e1.rotation.x = ROTX;
    var e2 = cyl(eyeR2, eyeR2, thick + 0.028, M.steelD, len / 2, 0, 0, 12);
    e2.rotation.x = ROTX;
    g.add(e1); g.add(e2);
    g.place = function (x1, y1, x2, y2, z) {
      var dx = x2 - x1, dy = y2 - y1;
      var l = Math.sqrt(dx * dx + dy * dy) || 0.0001;
      g.position.set((x1 + x2) / 2, (y1 + y2) / 2, z || 0);
      g.rotation.z = Math.atan2(dy, dx);
      shaft.scale.x = l;
      e1.position.x = -l / 2;
      e2.position.x = l / 2;
    };
    return g;
  }

  /* 鞲鞴杆 + 十字头滑块(随滑块-曲柄公式沿导路滑动) */
  function buildXhead(zRod) {
    var M = ST28.Scene3D.M, D = ST28.GEAR.D;
    var g = new THREE.Group();
    var blk = new THREE.Group();
    blk.add(box(0.22, 0.12, 0.11, M.steel, 0, 0, 0));
    var pin = cyl(0.03, 0.03, 0.12, M.steelD, 0, 0, 0.06, 10);
    pin.rotation.x = ROTX;
    blk.add(pin);
    blk.userData.tagAnchor = new THREE.Vector3(0, 0.12, 0);
    g.add(blk);
    var rod = makeUnitRod(0.035, M.steel);
    g.add(rod);
    return {
      group: g, anchor: blk,
      kine: function (S) {
        var s = zRod > 0 ? S.A : S.B;
        blk.position.set(s.xc, D.yA, zRod - 0.06);
        rod.place(s.xc + 0.05, D.yA, D.cylRear, D.yA, zRod);
      }
    };
  }

  /* 主连杆:前动轮曲拐销 → 十字头(长度恒为 L,精确闭合) */
  function buildMRod(zRod) {
    var M = ST28.Scene3D.M, D = ST28.GEAR.D;
    var rod = makeRod(D.L, 0.06, 0.075, M.steel, 0.062, 0.05);
    var g = new THREE.Group();
    g.add(rod);
    rod.userData.tagAnchor = new THREE.Vector3(0, 0.14, 0);
    return {
      group: g, anchor: rod,
      kine: function (S) {
        var s = zRod > 0 ? S.A : S.B;
        rod.place(s.pinX, s.pinY, s.xc, D.yA, zRod);
      }
    };
  }

  /* 结合杆:连接四根动轮曲拐销(同侧同相位,杆身保持水平) */
  function buildCRod(zCoup) {
    var M = ST28.Scene3D.M, D = ST28.GEAR.D;
    var g = new THREE.Group();
    var shaft = box(1, 0.085, 0.05, M.steel, 0, 0, 0);
    g.add(shaft);
    for (var i = 0; i < 4; i++) {
      var e = cyl(0.058, 0.058, 0.082, M.steelD, -1.95 + i * D.spacing, 0, 0, 14);
      e.rotation.x = ROTX;
      g.add(e);
    }
    g.userData.tagAnchor = new THREE.Vector3(0, 0.12, 0);
    g.place = function (x1, y1, x2, y2, z) {
      var dx = x2 - x1, dy = y2 - y1;
      var l = Math.sqrt(dx * dx + dy * dy) || 0.001;
      g.position.set((x1 + x2) / 2, (y1 + y2) / 2, z || 0);
      g.rotation.z = Math.atan2(dy, dx);
      shaft.scale.x = l;
    };
    return {
      group: g, anchor: g,
      kine: function (S) {
        var s = zCoup > 0 ? S.A : S.B;
        g.place(s.pinX, s.pinY, D.rdX + D.r * Math.cos(s.psi), s.pinY, zCoup);
      }
    };
  }

  /* 简化 Walschaerts:回动曲拐 + 偏心杆 + 膨胀链接杆 + 半径杆 + 结合杠杆 + 结合杆 + 阀杆 */
  function buildGear(zs) {
    var M = ST28.Scene3D.M, D = ST28.GEAR.D;
    var g = new THREE.Group();
    var rcArm = makeRod(0.384, 0.055, 0.07, M.steelD, 0.05, 0.045);
    g.add(rcArm);
    var ecc = makeRod(D.Le, 0.05, 0.055, M.steelD, 0.05, 0.042);
    ecc.userData.tagAnchor = new THREE.Vector3(0, 0.12, 0);
    g.add(ecc);
    var link = makeRod(D.Rl + D.LToff, 0.045, 0.05, M.iron, 0.04, 0.04);
    g.add(link);
    var boss = cyl(0.048, 0.048, 0.06, M.brass, D.Hx, D.Hy, zs, 14);
    boss.rotation.x = ROTX;
    g.add(boss);
    g.add(box(0.035, 0.16, 0.03, M.iron, D.Hx, 1.10, zs));
    g.add(box(0.09, 0.03, 0.07, M.iron, D.Hx, 1.13, zs));
    var rrod = makeRod(D.Lr, 0.05, 0.06, M.steel, 0.042, 0.045);
    g.add(rrod);
    var clev = new THREE.Group();
    clev.add(box(0.045, 0.52, 0.04, M.steel, 0, 0.20, 0));
    var cbEye = cyl(0.045, 0.045, 0.055, M.brass, 0, 0.30, 0, 12);
    cbEye.rotation.x = ROTX;
    clev.add(cbEye);
    var cvEye = cyl(0.038, 0.038, 0.05, M.brass, 0, 0.44, 0, 12);
    cvEye.rotation.x = ROTX;
    clev.add(cvEye);
    var cStub = cyl(0.03, 0.03, 0.05, M.steelD, 0, -0.05, 0, 10);
    cStub.rotation.x = ROTX;
    clev.add(cStub);
    g.add(clev);
    var ulink = makeRod(0.1485, 0.04, 0.05, M.steelD, 0.032, 0.032);
    g.add(ulink);
    var vrod = makeUnitRod(0.026, M.brass);
    g.add(vrod);
    var side = zs > 0 ? "A" : "B";
    return {
      group: g, anchor: ecc,
      kine: function (S) {
        var s = S[side], z = D.zGear;
        rcArm.place(s.pinX, s.pinY, s.rcX, s.rcY, z);
        ecc.place(s.rcX, s.rcY, s.lbX, s.lbY, z);
        link.place(s.ltX, s.ltY, s.lbX, s.lbY, z);
        rrod.place(s.ltX, s.ltY, s.bx, s.by, z);
        clev.position.set(s.ux, s.uy, z);
        clev.rotation.z = Math.atan2(s.by - s.uy, s.bx - s.ux) - Math.PI / 2;
        ulink.place(s.xc, 0.86, s.ux, s.uy, z);
        vrod.place(s.vx, s.vy, D.valveCx, D.valveCy, z);
      }
    };
  }

  ST28.Rods = { buildXhead: buildXhead, buildMRod: buildMRod, buildCRod: buildCRod, buildGear: buildGear };
})(window.ST28 = window.ST28 || {});
