/* toy.js — 程序化手持水中套圈玩具:外壳(Extrude 圆角矩形 + 窗洞)、水腔、玻璃、
 * 立柱、按钮、脚架、徽标。零外部模型,贴图全部 Canvas 程序化生成。
 *
 * 几何分层(由内到外):
 *   水腔白色内胆(rounded-rect tube) → 水体(半透明蓝,renderOrder 20)
 *   → 前后玻璃片(高光反射,renderOrder 30/31) → 外壳(带窗洞的挤出体,圆角倒边)
 *   → 按钮圆盘(可按压动画) + 徽标 + 脚架 + 螺丝。
 */
(function () {
  'use strict';
  const WT = (window.WT = window.WT || {});

  // ---- 核心几何常量(物理引擎共用) ----
  WT.geom = {
    halfX: 1.5, halfY: 2.0, halfZ: 0.75, cornerR: 0.85, // 水腔内腔
    ringR: 0.42, ringTube: 0.13,                        // 圆环
    pegX: 0.62, pegBaseY: -1.9, pegH: 1.5, pegR: 0.075, // 立柱
    nozzle: [                                            // 左右喷口(位置 + 方向)
      { x: -1.06, y: -1.68, z: 0, dir: [0.42, 1, 0] },
      { x: 1.06, y: -1.68, z: 0, dir: [-0.42, 1, 0] },
    ],
  };
  const T = WT.geom;

  const C = {
    shell: 0xeda41c,      // 外壳暖黄(饱和)
    band: 0xd8422e,       // 侧带 / 脚架红
    buttonL: 0xd63b2f,    // 左按钮红
    buttonR: 0x2494c4,    // 右按钮青蓝
    inner: 0xf4efe4,      // 水腔内胆米白
    water: 0x1e9ad6,      // 水体
    peg: 0xf4efe4,        // 立柱
    capL: 0xd63b2f, capR: 0x2494c4,
    ringColors: [0xe0392b, 0xef8318, 0xf5c832, 0x3fae4a, 0x2f7fd4, 0x8f5bd0],
  };
  WT.colors = C;

  // ---- 圆角矩形 Shape ----
  function roundedRect(w, h, r) {
    const s = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
    s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
    s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
    return s;
  }
  function roundedRectPath(w, h, r) {
    // 孔洞用 Path(绕行方向与 Shape 相同,three 会自动处理)
    return new THREE.Path(roundedRect(w, h, r).getPoints(64));
  }

  // ---- 塑料材质 ----
  function plastic(color, opt) {
    return new THREE.MeshPhysicalMaterial(Object.assign({
      color, roughness: 0.4, metalness: 0.02,
      clearcoat: 0.6, clearcoatRoughness: 0.3,
      envMapIntensity: 0.5,
    }, opt || {}));
  }

  function buildToy(parent) {
    const group = new THREE.Group();
    const matShell = plastic(C.shell, { roughness: 0.38 });
    const matBand = plastic(C.band, { roughness: 0.45 });

    // ---- 外壳:圆角矩形带窗洞,前后倒圆角(单次挤出) ----
    const outline = roundedRect(4.4, 5.2, 1.3);
    outline.holes.push(roundedRectPath(3.3, 4.2, 0.8));
    const shellGeo = new THREE.ExtrudeGeometry(outline, {
      depth: 1.3, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.42,
      bevelSegments: 6, curveSegments: 28,
    });
    shellGeo.translate(0, 0, -0.65);
    const shell = new THREE.Mesh(shellGeo, [matShell, matBand]);
    shell.castShadow = true; shell.receiveShadow = true;
    group.add(shell);

    // ---- 水腔内胆:白色圆角管(可见窗缘一圈米白) ----
    const innerOut = roundedRect(3.14, 4.14, 0.88);
    innerOut.holes.push(roundedRectPath(2.98, 3.98, 0.82));
    const innerGeo = new THREE.ExtrudeGeometry(innerOut, {
      depth: 1.44, bevelEnabled: false, curveSegments: 24,
    });
    innerGeo.translate(0, 0, -0.72);
    const innerMat = plastic(C.inner, { roughness: 0.32 });
    const inner = new THREE.Mesh(innerGeo, [innerMat, innerMat]);
    group.add(inner);

    // ---- 水体:半透明圆角棱柱 ----
    const waterShape = roundedRect(2.96, 3.96, 0.8);
    const waterGeo = new THREE.ExtrudeGeometry(waterShape, {
      depth: 1.42, bevelEnabled: false, curveSegments: 24,
    });
    waterGeo.translate(0, 0, -0.71);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: C.water, transparent: true, opacity: 0.36, roughness: 0.06,
      metalness: 0, depthWrite: false, side: THREE.DoubleSide,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.renderOrder = 20;
    group.add(water);

    // ---- 顶面水光:微微起伏的水面 ----
    const surfGeo = new THREE.PlaneGeometry(2.7, 3.7, 24, 16);
    surfGeo.rotateX(-Math.PI / 2);
    const surf = new THREE.Mesh(surfGeo, new THREE.MeshPhysicalMaterial({
      color: 0x9fd8f2, transparent: true, opacity: 0.55, roughness: 0.08,
      metalness: 0.05, depthWrite: false,
    }));
    surf.position.y = 1.86;
    surf.renderOrder = 22;
    group.add(surf);

    // ---- 前后玻璃:高光片 ----
    const glassGeo = roundedRect(3.0, 4.0, 0.82);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xeaf6fc, transparent: true, opacity: 0.13, roughness: 0.04,
      metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, depthWrite: false,
      side: THREE.DoubleSide,
    });
    const glassF = new THREE.Mesh(new THREE.ShapeGeometry(glassGeo, 24), glassMat);
    glassF.position.z = 0.73; glassF.renderOrder = 30;
    const glassB = new THREE.Mesh(new THREE.ShapeGeometry(glassGeo, 24), glassMat);
    glassB.position.z = -0.73; glassB.renderOrder = 31;
    group.add(glassF, glassB);

    // ---- 立柱 ×2(底座 + 柱身 + 彩色顶帽) ----
    const pegMat = plastic(C.peg, { roughness: 0.3 });
    for (let i = 0; i < 2; i++) {
      const px = i === 0 ? -T.pegX : T.pegX;
      const peg = new THREE.Group();
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.12, 20), pegMat);
      base.position.y = T.pegBaseY + 0.06;
      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(T.pegR, T.pegR, T.pegH, 16), pegMat);
      rod.position.y = T.pegBaseY + T.pegH / 2 + 0.06;
      rod.castShadow = true;
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 12),
        plastic(i === 0 ? C.capL : C.capR, { roughness: 0.25 }));
      cap.position.y = T.pegBaseY + T.pegH + 0.06;
      peg.add(base, rod, cap);
      peg.position.x = px;
      group.add(peg);
    }

    // ---- 喷口(腔内可见的两个小锥嘴) ----
    const nozzleMat = plastic(0x3a4650, { roughness: 0.35, metalness: 0.3 });
    WT.nozzleMeshes = [];
    T.nozzle.forEach((n, i) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.3, 14), nozzleMat.clone());
      cone.position.set(n.x, n.y, n.z);
      const ang = Math.atan2(n.dir[0], n.dir[1]); // 与竖直的夹角
      cone.rotation.z = i === 0 ? ang : -ang;     // 锥尖朝上内
      cone.rotateX(Math.PI);                       // ConeGeometry 尖朝 +Y → 翻转朝外喷?尖朝上即可
      group.add(cone);
      WT.nozzleMeshes.push(cone);
    });

    // ---- 按钮(可按压) ----
    WT.buttons = {};
    const btnDefs = [
      { side: 'L', x: -1.32, color: C.buttonL },
      { side: 'R', x: 1.32, color: C.buttonR },
    ];
    for (const b of btnDefs) {
      const g = new THREE.Group();
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.14, 28),
        plastic(b.color, { roughness: 0.35 }));
      base.rotation.x = Math.PI / 2;
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2.6),
        plastic(b.color, { roughness: 0.28, clearcoat: 0.9 }));
      cap.rotation.x = Math.PI / 2;
      cap.castShadow = true;
      cap.name = 'button-' + b.side;
      g.add(base, cap);
      g.position.set(b.x, -1.62, 1.12);
      g.rotation.y = b.x < 0 ? 0.14 : -0.14; // 微微外八
      group.add(g);
      WT.buttons[b.side] = { group: g, cap, baseZ: g.position.z };
    }

    // ---- 徽标:中央白色圆贴( Canvas 文字) ----
    const badgeTex = makeBadgeTexture();
    const badge = new THREE.Mesh(
      new THREE.CircleGeometry(0.42, 32),
      new THREE.MeshStandardMaterial({ map: badgeTex, roughness: 0.5, transparent: true }));
    badge.position.set(0, -1.62, 1.185);
    group.add(badge);

    // ---- 螺丝装饰 ×4 ----
    const screwMat = plastic(0xc9c2b2, { roughness: 0.3, metalness: 0.5 });
    [[-1.86, 2.3], [1.86, 2.3], [-1.86, -0.6], [1.86, -0.6]].forEach(([sx, sy]) => {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 12), screwMat);
      s.rotation.x = Math.PI / 2;
      s.position.set(sx, sy, 1.14);
      group.add(s);
    });

    // ---- 脚架 ×2 ----
    const footGeo = new THREE.CapsuleGeometry(0.24, 0.9, 6, 14);
    footGeo.rotateZ(Math.PI / 2);
    for (const fx of [-1.35, 1.35]) {
      const foot = new THREE.Mesh(footGeo, matBand);
      foot.position.set(fx, -2.78, 0);
      foot.scale.set(1, 1, 1.9);
      foot.castShadow = true;
      group.add(foot);
    }

    parent.add(group);
    WT.toyGroup = group;
    WT.waterMesh = water;
    WT.surfMesh = surf;
    return group;
  }

  // ---- 徽标贴图 ----
  function makeBadgeTexture() {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    const g = cv.getContext('2d');
    g.clearRect(0, 0, 256, 256);
    g.beginPath(); g.arc(128, 128, 124, 0, Math.PI * 2);
    g.fillStyle = '#fdf8ee'; g.fill();
    g.lineWidth = 10; g.strokeStyle = '#2f9fd0'; g.stroke();
    g.beginPath(); g.arc(128, 128, 100, 0, Math.PI * 2);
    g.lineWidth = 3; g.strokeStyle = '#e24e3a'; g.stroke();
    g.fillStyle = '#1d5a7a'; g.textAlign = 'center';
    g.font = '700 46px "PingFang SC","Microsoft YaHei",sans-serif';
    g.fillText('水中套圈', 128, 118);
    g.font = '600 21px Manrope,Arial,sans-serif';
    g.fillStyle = '#e24e3a';
    g.fillText('AQUA RINGS', 128, 156);
    g.font = '500 16px Manrope,Arial,sans-serif';
    g.fillStyle = '#7c93a3';
    g.fillText('WATER TOY · 1968', 128, 184);
    const tex = new THREE.CanvasTexture(cv);
    tex.anisotropy = 4;
    return tex;
  }

  WT.buildToy = buildToy;
})();
