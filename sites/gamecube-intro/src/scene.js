// 3D 场景装配:全部几何体与贴图均由代码生成,零外部素材。
// 结构对应原作开机动画的七个角色:
//   bigCube         大玻璃立方(舞台,env 反射,两次闪光由时间轴驱动透明度)
//   movingCube      紫色小方块(GX TEV 风格双色着色 + matcap,主角)
//   trails[15]      翻滚路径上的紫色残影平面
//   logoFaces       终格 G 标志:三块立方体面朝向的贴图平面(顶/左/前)
//   gamecubeLayers  GAMECUBE 白色字标,5 层同贴图深度回声式弹入
//   nintendoLetters NINTENDO 灰色双色字母,逐字渐显
// 字标/字母挂在面向默认相机的公告板组上,位置固定在世界(轨道时轻微视差,
// 与原作一致)。
window.GC = window.GC || {};
GC.scene = (function () {
  'use strict';

  const HALF = 64;             // 大立方半边长
  const CELL = 128 / 3;        // 格点间距(= 小方块边长 42.67)
  const CUBE_R = 2.8;          // 小方块倒角半径
  const BIG_R = 4;             // 大立方倒角半径
  const RING_W = 13;           // 终格 G 标志外环带宽
  const INNER_HALF = CELL / 2; // 内嵌小方块半边长(21.33,与小方块同款)

  // ---------- 几何:圆角立方体 ----------
  // 对细分 BoxGeometry 逐顶点做「内收 + 球面外推」得到倒角;
  // 倒角让 matcap 着色在棱边处产生高光,是方块「糖果感」的关键。
  function roundedBox(size, radius, seg) {
    const geo = new THREE.BoxGeometry(size, size, size, seg, seg, seg);
    const pos = geo.attributes.position;
    const nor = geo.attributes.normal;
    const h = size / 2;
    const inner = h - radius;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i);
      const cx = THREE.MathUtils.clamp(vx, -inner, inner);
      const cy = THREE.MathUtils.clamp(vy, -inner, inner);
      const cz = THREE.MathUtils.clamp(vz, -inner, inner);
      const dx = vx - cx, dy = vy - cy, dz = vz - cz;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      pos.setXYZ(i, cx + (dx / len) * radius, cy + (dy / len) * radius, cz + (dz / len) * radius);
      nor.setXYZ(i, dx / len, dy / len, dz / len);
    }
    pos.needsUpdate = true;
    nor.needsUpdate = true;
    return geo;
  }

  // ---------- 贴图:程序化 Canvas ----------
  function canvasTexture(w, h, paint) {
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    paint(cv.getContext('2d'), w, h);
    const tex = new THREE.CanvasTexture(cv);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    return tex;
  }

  // 小方块的 matcap:视角空间法线 -> 单通道环境强度。
  // 上方偏亮、下方偏暗、略带斜向;经 TEV 公式 clamp(mix(gxLo,gxHi,env)*2) 后
  // 顶面趋近亮薰衣草、侧面呈深靛,与原作双色观感一致。
  function makeMatcap() {
    return canvasTexture(128, 128, (ctx) => {
      // 竖向硬梯度:上半(env≈1)近白、下半压到深灰,
      // 使顶面近白、侧面深靛(TEV clamp(mix(lo,hi,env)*2) 出双色)。
      const g = ctx.createLinearGradient(0, 128, 0, 0);
      g.addColorStop(0, '#121216');
      g.addColorStop(0.42, '#232329');
      g.addColorStop(0.62, '#3c3c46');
      g.addColorStop(0.78, '#9a9aa8');
      g.addColorStop(0.92, '#e8e8ef');
      g.addColorStop(1, '#fafafc');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
      // 顶部斜向高光带(棱边倒角的高光来源)
      const r = ctx.createRadialGradient(70, 16, 4, 70, 16, 86);
      r.addColorStop(0, 'rgba(255,255,255,0.9)');
      r.addColorStop(0.55, 'rgba(255,255,255,0.28)');
      r.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = r;
      ctx.fillRect(0, 0, 128, 128);
    });
  }

  // 大立方的 env 反射图:黑底 + 几道很淡的灰白光斑 -> 黑玻璃质感
  function makeEnv() {
    return canvasTexture(128, 128, (ctx) => {
      ctx.fillStyle = '#020202';
      ctx.fillRect(0, 0, 128, 128);
      const blob = (x, y, r, a) => {
        const g = ctx.createRadialGradient(x, y, 1, x, y, r);
        g.addColorStop(0, 'rgba(255,255,255,' + a + ')');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 128, 128);
      };
      blob(30, 88, 60, 0.22);
      blob(96, 34, 52, 0.16);
      blob(70, 60, 90, 0.07);
      blob(10, 20, 40, 0.1);
    });
  }

  // ---------- 终格 G 标志贴图 ----------
  // 经典立方标:外环带 + 中央内嵌小方块 + 前脸横杠(合成「G」)。
  // 关键做法:整个标志先在「屏幕空间(等轴投影坐标系,y 向上,六边形中心为原点)」
  // 里作画,再经每块面的「面 UV -> 屏幕」仿射的逆变换反贴到面贴图上,并裁剪到
  // 该面的屏幕菱形。三块面各拿到的碎片在屏幕上精确拼合 —— 与官方平面构型一致,
  // 且内嵌小方块/横杠在屏幕上是正的(手工在面 UV 里画做不到)。
  const FACES = [
    { key: 'top', normal: [0, 1, 0], center: [0, HALF, 0] },
    { key: 'left', normal: [-1, 0, 0], center: [-HALF, 0, 0] },
    { key: 'front', normal: [0, 0, 1], center: [0, 0, HALF] },
  ];

  // 默认相机基准(单一来源;main.js 直接引用这里导出的常量)
  const CAM_POS = new THREE.Vector3(-122.63, 159.49, 122.63);
  const CAM_TARGET = new THREE.Vector3(0, -7, 0);
  const _camQuat = (() => {
    const m = new THREE.Matrix4().lookAt(CAM_POS, CAM_TARGET, new THREE.Vector3(0, 1, 0));
    return new THREE.Quaternion().setFromRotationMatrix(m);
  })();
  const _r = new THREE.Vector3(1, 0, 0).applyQuaternion(_camQuat); // 屏幕右
  const _u = new THREE.Vector3(0, 1, 0).applyQuaternion(_camQuat); // 屏幕上
  // 世界点 -> 屏幕坐标(x 右,y 上,原点=大立方中心)
  const proj = (x, y, z) => [x * _r.x + y * _r.y + z * _r.z, x * _u.x + y * _u.y + z * _u.z];

  // 面基准色(靛紫;换配色逐像素 OKLCH 重染)
  const ART_COLORS = {
    topBandHi: [0xee, 0xe8, 0xfb], topBandLo: [0xae, 0x9e, 0xeb],
    leftBandHi: [0xa9, 0x99, 0xee], leftBandLo: [0x6c, 0x59, 0xc6],
    frontBandHi: [0x9b, 0x8a, 0xe6], frontBandLo: [0x59, 0x47, 0xb2],
    cubeTopHi: [0xf5, 0xf1, 0xfd], cubeTopLo: [0xd2, 0xc6, 0xf6],
    cubeLeftHi: [0xbf, 0xb0, 0xf5], cubeLeftLo: [0x8d, 0x7b, 0xdc],
    cubeFrontHi: [0xae, 0x9f, 0xec], cubeFrontLo: [0x7f, 0x6b, 0xd3],
    barHi: [0x98, 0x86, 0xe4], barLo: [0x84, 0x71, 0xd8],
  };

  const lighten = (rgb, f) => rgb.map((c) => Math.round(Math.min(255, c + (255 - c) * f)));

  // ---------- 屏幕空间里的标志构图 ----------
  // 六边形顶点(投影三颗可见角)与中心 Y 形汇点
  const HEX = (() => {
    const T = proj(64, 64, -64);      // 顶
    const UL = proj(-64, 64, -64);    // 左上
    const UR = proj(64, 64, 64);      // 右上
    const LL = proj(-64, -64, -64);   // 左下
    const LR = proj(64, -64, 64);     // 右下
    const B = proj(-64, -64, 64);     // 底
    const C0 = proj(-64, 64, 64);     // 三面汇点(近角)
    return { T, UL, UR, LL, LR, B, C0 };
  })();
  const RING = 13;            // 环带宽(世界单位)
  const CUBE_K = 1 / 3;       // 内嵌小方块 = 整体构图缩 1/3
  const BAR_H = 10.5;         // 横杠厚(屏幕单位)
  const SLOT_H = 4.6, SLOT_GAP = 3.4;

  // 面上沿「世界棱」的环带 -> 屏幕平行四边形
  function bandQuad(a, b, inward) {
    const pa = proj(a[0], a[1], a[2]);
    const pb = proj(b[0], b[1], b[2]);
    const n = proj(inward[0], inward[1], inward[2]);
    const off = [n[0] * RING, n[1] * RING];
    return [pa, pb, [pb[0] + off[0], pb[1] + off[1]], [pa[0] + off[0], pa[1] + off[1]]];
  }

  function polyPath(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
  }
  function fillPoly(ctx, pts, g) {
    polyPath(ctx, pts);
    ctx.fillStyle = g;
    ctx.fill();
  }
  function artGrad(ctx, from, to, cA, cB) {
    const g = ctx.createLinearGradient(from[0], from[1], to[0], to[1]);
    g.addColorStop(0, GC.palette.css(cA));
    g.addColorStop(1, GC.palette.css(cB));
    return g;
  }

  // 在屏幕空间画整幅标志(每块面都会调用;裁剪决定各面拿到哪部分)
  function drawLogoArt(ctx) {
    const C = ART_COLORS;
    const { T, UL, UR, LL, LR, B, C0 } = HEX;
    const lerpPt = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

    // —— 外环带(沿六条可见棱)——
    // top:沿两条后棱,亮在顶角 T
    fillPoly(ctx, bandQuad([64, 64, -64], [-64, 64, -64], [0, 0, 1]),
      artGrad(ctx, T, UL, C.topBandHi, C.topBandLo));
    fillPoly(ctx, bandQuad([64, 64, -64], [64, 64, 64], [-1, 0, 0]),
      artGrad(ctx, T, UR, C.topBandHi, C.topBandLo));
    // left:左竖棱 + 底棱,亮在左上
    fillPoly(ctx, bandQuad([-64, 64, -64], [-64, -64, -64], [1, 0, 0]),
      artGrad(ctx, UL, LL, C.leftBandHi, C.leftBandLo));
    fillPoly(ctx, bandQuad([-64, -64, -64], [-64, -64, 64], [0, 1, 0]),
      artGrad(ctx, LL, B, C.leftBandHi, C.leftBandLo));
    // front:右竖棱 + 底棱,亮在右上
    fillPoly(ctx, bandQuad([64, 64, 64], [64, -64, 64], [-1, 0, 0]),
      artGrad(ctx, UR, LR, C.frontBandHi, C.frontBandLo));
    fillPoly(ctx, bandQuad([64, -64, 64], [-64, -64, 64], [0, 1, 0]),
      artGrad(ctx, LR, B, C.frontBandHi, C.frontBandLo));

    // —— 内嵌小方块:整体构图缩 1/3,汇点对齐 C0 ——
    const s = (p) => lerpPt(C0, p, CUBE_K);
    const sT = s(T), sUL = s(UL), sUR = s(UR), sLL = s(LL), sLR = s(LR);
    const sB = s(B);
    fillPoly(ctx, [sT, sUR, C0, sUL], artGrad(ctx, sT, C0, C.cubeTopHi, C.cubeTopLo));
    fillPoly(ctx, [sUL, C0, sB, sLL], artGrad(ctx, sUL, sLL, C.cubeLeftHi, C.cubeLeftLo));
    fillPoly(ctx, [C0, sUR, sLR, sB], artGrad(ctx, sUR, sLR, C.cubeFrontHi, C.cubeFrontLo));
    // 小方块描边:暗勾边
    for (const quad of [
      [sT, sUR, C0, sUL],
      [sUL, C0, sB, sLL],
      [C0, sUR, sLR, sB],
    ]) {
      polyPath(ctx, quad);
      ctx.strokeStyle = 'rgba(10,6,26,0.5)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    // —— G 横杠:从小方块右缘水平伸到右环带并与之融合 ——
    const barY0 = -BAR_H / 2, barY1 = BAR_H / 2;
    const barX1 = UR[0] + 2; // 越过外缘,靠面菱形裁剪齐边
    fillPoly(ctx,
      [[lerpPt(C0, sUR, 0.55)[0], barY1], [barX1, barY1], [barX1, barY0], [lerpPt(C0, sUR, 0.55)[0], barY0]],
      artGrad(ctx, [UR[0], 0], [C0[0] + 8, 0], C.barHi, C.barLo));

    // —— 上下插槽:把右竖带切开,读出「G」开口 ——
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000';
    ctx.fillRect(UR[0] - RING - 3, barY1 + SLOT_GAP, RING + 3, SLOT_H);
    ctx.fillRect(UR[0] - RING - 3, barY0 - SLOT_GAP - SLOT_H, RING + 3, SLOT_H);
    ctx.restore();

    // —— 环带内缘亮线(倒角高光)——
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1.6;
    for (const [a, b] of [[T, UL], [T, UR], [UL, LL], [LL, B], [UR, LR], [LR, B]]) {
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }
  }

  // (ax,ay)屏幕坐标 -> 面贴图像素 的仿射;返回 setTransform 六元组
  function faceArtTransform(def) {
    const R = def._R || (def._R = new THREE.Vector3(1, 0, 0).applyQuaternion(
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3().fromArray(def.normal))));
    const U = def._U || (def._U = new THREE.Vector3(0, 1, 0).applyQuaternion(
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3().fromArray(def.normal))));
    const C = new THREE.Vector3().fromArray(def.center);
    // 面 UV (α,β) -> 屏幕 (ax,ay):ax = C·r + α R·r + β U·r;ay = C·u + α R·u + β U·u
    const m11 = R.x * _r.x + R.y * _r.y + R.z * _r.z;
    const m12 = U.x * _r.x + U.y * _r.y + U.z * _r.z;
    const m21 = R.x * _u.x + R.y * _u.y + R.z * _u.z;
    const m22 = U.x * _u.x + U.y * _u.y + U.z * _u.z;
    const o1 = C.x * _r.x + C.y * _r.y + C.z * _r.z;
    const o2 = C.x * _u.x + C.y * _u.y + C.z * _u.z;
    const det = m11 * m22 - m12 * m21;
    // 逆: (ax,ay) -> (α,β);再 (α,β) -> 画布像素:px=(α+64)*2, py=(64-β)*2
    const i11 = m22 / det, i12 = -m12 / det, i21 = -m21 / det, i22 = m11 / det;
    // px = 2α + 128 = 2*(i11*(ax-o1) + i12*(ay-o2)) + 128
    // py = 128 - 2β = 128 - 2*(i21*(ax-o1) + i22*(ay-o2))
    const a = 2 * i11, c = 2 * i12, e = 128 - 2 * (i11 * o1 + i12 * o2);
    const b = -2 * i21, d = -2 * i22, f = 128 + 2 * (i21 * o1 + i22 * o2);
    return [a, b, c, d, e, f];
  }

  // 绘制一张面贴图(烘焙与重染共用同一份逻辑)
  function paintLogoFace(ctx, def, recolor) {
    ctx.clearRect(0, 0, 256, 256);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // 先设仿射,再用「屏幕空间」的面菱形裁剪,最后画屏幕空间整幅标志
    const t = faceArtTransform(def);
    ctx.transform(t[0], t[1], t[2], t[3], t[4], t[5]);
    // 面菱形 = 面心 ± 64R ± 64U 投影到屏幕
    const C = new THREE.Vector3().fromArray(def.center);
    const R = new THREE.Vector3(1, 0, 0).applyQuaternion(
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3().fromArray(def.normal)));
    const U = new THREE.Vector3(0, 1, 0).applyQuaternion(
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3().fromArray(def.normal)));
    const corner = (sa, sb) => {
      const p = C.clone().addScaledVector(R, sa).addScaledVector(U, sb);
      return proj(p.x, p.y, p.z);
    };
    polyPath(ctx, [corner(64, 64), corner(-64, 64), corner(-64, -64), corner(64, -64)]);
    ctx.clip();
    drawLogoArt(ctx);
    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (recolor) {
      const img = ctx.getImageData(0, 0, 256, 256);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] === 0) continue;
        const out = recolor([d[i], d[i + 1], d[i + 2]]);
        d[i] = out[0]; d[i + 1] = out[1]; d[i + 2] = out[2];
      }
      ctx.putImageData(img, 0, 0);
    }
  }

  const bakeLogoFace = (def, recolor) => canvasTexture(256, 256, (ctx) => paintLogoFace(ctx, def, recolor));

  // ---------- 字标贴图 ----------
  // GAMECUBE 白色字标(™ 上标),手工逐字排布保证跨平台一致。
  function bakeWordmark() {
    return canvasTexture(1024, 192, (ctx) => {
      ctx.clearRect(0, 0, 1024, 192);
      const text = 'GAMECUBE';
      ctx.font = '900 118px "Arial Black", Arial, sans-serif';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#fff';
      const track = 6;
      const widths = [];
      let total = 0;
      for (const ch of text) { const w = ctx.measureText(ch).width; widths.push(w); total += w + track; }
      total -= track;
      let x = (1024 - total) / 2;
      const baseY = 148;
      for (let i = 0; i < text.length; i++) {
        ctx.fillText(text[i], x, baseY);
        x += widths[i] + track;
      }
      ctx.font = '700 34px Arial, sans-serif';
      ctx.fillText('™', x + 6, baseY - 66);
    });
  }

  // NINTENDO 单字母白色字形(颜色交给材质 color:前 0x373737 / 后 0x666666)
  function bakeGlyph(ch) {
    const cv = document.createElement('canvas');
    cv.width = 128; cv.height = 128;
    const ctx = cv.getContext('2d');
    ctx.font = '700 92px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(ch, 64, 68);
    const w = ctx.measureText(ch).width / 92; // 以字高为 1 的宽
    const tex = new THREE.CanvasTexture(cv);
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    return { tex, width: w };
  }

  // ---------- 场景装配 ----------
  function build(scene) {
    const rig = { materials: [] };

    // —— 大玻璃立方(舞台)——
    const envTex = makeEnv();
    const envCube = new THREE.CubeTexture([envTex.image, envTex.image, envTex.image, envTex.image, envTex.image, envTex.image]);
    envCube.needsUpdate = true;
    const bigMat = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide, transparent: true, opacity: 0, envMap: envCube, depthWrite: false,
    });
    rig.bigCube = new THREE.Mesh(roundedBox(HALF * 2, BIG_R, 5), bigMat);
    rig.bigCube.renderOrder = 1;
    scene.add(rig.bigCube);
    rig.materials.push(bigMat);

    // —— 紫色小方块(GX TEV 着色)——
    rig.gxUniforms = {
      uGxLo: { value: new THREE.Color(30 / 255, 20 / 255, 60 / 255) },
      uGxHi: { value: new THREE.Color(95 / 255, 80 / 255, 190 / 255) },
      uMatcap: { value: makeMatcap() },
      uOpacity: { value: 1 },
    };
    const moveMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      uniforms: rig.gxUniforms,
      vertexShader: [
        'varying vec3 vN;',
        'void main() {',
        '  vN = normalMatrix * normal;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}',
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uGxLo;',
        'uniform vec3 uGxHi;',
        'uniform sampler2D uMatcap;',
        'uniform float uOpacity;',
        'varying vec3 vN;',
        'void main() {',
        '  vec2 uv = vN.xy * 0.495 + 0.5;',
        '  float env = texture2D(uMatcap, uv).r;',
        '  vec3 c = clamp(mix(uGxLo, uGxHi, env) * 2.0, 0.0, 1.0);',
        '  gl_FragColor = vec4(c, uOpacity);',
        '}',
      ].join('\n'),
    });
    rig.movingCube = new THREE.Mesh(roundedBox(CELL, CUBE_R, 4), moveMat);
    rig.movingCube.renderOrder = 2;
    scene.add(rig.movingCube);

    // —— 残影平面 ×15(水平放置,位置由时间轴写入)——
    rig.trails = [];
    const trailGeo = new THREE.PlaneGeometry(CELL * 0.92, CELL * 0.92);
    trailGeo.rotateX(-Math.PI / 2);
    for (let i = 0; i < 15; i++) {
      const m = new THREE.MeshBasicMaterial({
        color: 0x6350bb, side: THREE.DoubleSide, transparent: true, opacity: 0, depthWrite: false,
      });
      const mesh = new THREE.Mesh(trailGeo, m);
      mesh.renderOrder = 10;
      rig.trails.push({ mesh, mat: m });
      scene.add(mesh);
      rig.materials.push(m);
    }

    // —— 终格 G 标志:三块面朝向贴图平面 ——
    rig.logoFaces = [];
    const faceGeo = new THREE.PlaneGeometry(HALF * 2, HALF * 2);
    const zAxis = new THREE.Vector3(0, 0, 1);
    for (const def of FACES) {
      const tex = bakeLogoFace(def, null);
      const m = new THREE.MeshBasicMaterial({
        map: tex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(faceGeo, m);
      mesh.renderOrder = 20;
      mesh.position.fromArray(def.center);
      mesh.quaternion.setFromUnitVectors(zAxis, new THREE.Vector3().fromArray(def.normal));
      rig.logoFaces.push({ mesh, mat: m, tex, def });
      scene.add(mesh);
      rig.materials.push(m);
    }

    // —— 公告板组(字标/字母;位置与姿态由 main 用默认相机架设)——
    rig.billboards = new THREE.Group();

    // GAMECUBE 字标 ×5 层:同贴图,弹入时层间错位形成深度回声
    rig.gamecubeGroup = new THREE.Group();
    rig.gamecubeGroup.position.set(0, -160, 0);
    rig.wordTex = bakeWordmark();
    rig.gamecubeLayers = [];
    const wordGeo = new THREE.PlaneGeometry(242, 242 * 192 / 1024);
    for (let i = 0; i < 5; i++) {
      const m = new THREE.MeshBasicMaterial({
        map: rig.wordTex, transparent: true, opacity: 0, depthWrite: false,
      });
      const mesh = new THREE.Mesh(wordGeo, m);
      mesh.renderOrder = 40;
      rig.gamecubeLayers.push({ mesh, mat: m });
      rig.gamecubeGroup.add(mesh);
      rig.materials.push(m);
    }
    rig.billboards.add(rig.gamecubeGroup);

    // NINTENDO 字母 ×8:前深灰 / 后浅灰两块共面错位,假挤出
    rig.nintendoGroup = new THREE.Group();
    rig.nintendoGroup.position.set(0, -136, 0);
    rig.nintendoLetters = [];
    const glyphs = 'NINTENDO'.split('').map(bakeGlyph);
    const letterH = 19;
    const track = 19;
    let totalW = 0;
    for (const g of glyphs) totalW += g.width * letterH + track;
    totalW -= track;
    let cx = -totalW / 2;
    for (const g of glyphs) {
      const w = g.width * letterH;
      const geo = new THREE.PlaneGeometry(w, letterH);
      const front = new THREE.MeshBasicMaterial({
        map: g.tex, transparent: true, opacity: 0, depthWrite: false, color: 0x373737,
      });
      const back = new THREE.MeshBasicMaterial({
        map: g.tex, transparent: true, opacity: 0, depthWrite: false, color: 0x666666,
      });
      const frontMesh = new THREE.Mesh(geo, front);
      const backMesh = new THREE.Mesh(geo, back);
      frontMesh.renderOrder = 30;
      backMesh.renderOrder = 29;
      const x = cx + w / 2;
      frontMesh.position.x = x;
      backMesh.position.x = x;
      backMesh.position.z = -2.6;
      rig.nintendoLetters.push({ frontMesh, backMesh, front, back });
      rig.nintendoGroup.add(frontMesh, backMesh);
      rig.materials.push(front, back);
      cx += w + track;
    }
    rig.billboards.add(rig.nintendoGroup);
    scene.add(rig.billboards);

    // —— 线框开关(遍历全部材质)——
    rig.setWireframe = (on) => {
      for (const m of rig.materials) m.wireframe = on;
      rig.movingCube.material.wireframe = on;
    };

    // —— 配色:GX 寄存器、残影、logo 贴图逐像素重染 ——
    rig.setPalette = (pal) => {
      rig.gxUniforms.uGxLo.value.setRGB(pal.gxLo[0] / 255, pal.gxLo[1] / 255, pal.gxLo[2] / 255);
      rig.gxUniforms.uGxHi.value.setRGB(pal.gxHi[0] / 255, pal.gxHi[1] / 255, pal.gxHi[2] / 255);
      for (const t of rig.trails) t.mat.color.setRGB(pal.trail[0] / 255, pal.trail[1] / 255, pal.trail[2] / 255);
      for (const f of rig.logoFaces) {
        paintLogoFace(f.tex.image.getContext('2d'), f.def, pal.recolor);
        f.tex.needsUpdate = true;
      }
    };

    return rig;
  }

  return { build, HALF, CELL, CAM_POS, CAM_TARGET, CAM_QUAT: _camQuat };
})();
