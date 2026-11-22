/* sand.js — 沙粒:CPU 侧向节线聚集的动力学 + THREE.Points 渲染
 *
 * 每粒沙在板坐标 (u,v)∈[0,1]² 上,加速度:
 *   a = −G·f·∇f          (沿 ½f² 下坡,滑向节线;解析梯度,每粒每帧 4 cos + 4 sin)
 *   + 抖动 ∝ env·|f|      (波腹处沙粒被弹起"起舞",纯共振时最剧烈)
 * 速度阻尼后积分,越界夹取。N 粒全部在主线程 typed array 上逐帧更新。
 *
 * 渲染:THREE.Points + 程序化圆点贴图,暖沙色带明度方差,平铺在板面上方。 */
(function () {
  'use strict';
  const CH = window.CH;

  const PAD = 0.014;   // 板边缘留白(自由边附近沙会滑落)
  const G = 0.9;       // 节线聚拢加速度系数
  const JITTER = 1.0;  // 波腹抖动加速度系数
  const DAMP = 4.5;    // 速度阻尼 /s
  const STICK = 0.03;  // |f| 低于此值视为落在节线上,停止抖动

  const sand = {
    N: 0,
    u: null, v: null, vx: null, vz: null,
    points: null, geom: null, mat: null,
  };

  function dotTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const g = c.getContext('2d');
    const rg = g.createRadialGradient(16, 16, 2, 16, 16, 15);
    rg.addColorStop(0, 'rgba(255,255,255,1)');
    rg.addColorStop(0.65, 'rgba(255,255,255,.9)');
    rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = rg;
    g.fillRect(0, 0, 32, 32);
    const tex = new THREE.CanvasTexture(c);
    return tex;
  }

  /** 建(或重建)N 粒沙。 */
  sand.build = function (scene, n) {
    if (sand.points) {
      scene.remove(sand.points);
      sand.geom.dispose();
      sand.mat.dispose();
    }
    sand.N = n;
    sand.u = new Float32Array(n);
    sand.v = new Float32Array(n);
    sand.vx = new Float32Array(n);
    sand.vz = new Float32Array(n);
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      sand.u[i] = PAD + Math.random() * (1 - 2 * PAD);
      sand.v[i] = PAD + Math.random() * (1 - 2 * PAD);
      // 暖沙色:明度方差 + 轻微冷暖漂移
      const c = 0.74 + Math.random() * 0.32;
      const warm = 0.9 + Math.random() * 0.18;
      col[i * 3] = Math.min(1, c * 1.10);
      col[i * 3 + 1] = c * 0.88;
      col[i * 3 + 2] = c * 0.60 * warm;
    }
    sand.geom = new THREE.BufferGeometry();
    sand.geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    sand.geom.setAttribute('color', new THREE.BufferAttribute(col, 3));
    sand.mat = new THREE.PointsMaterial({
      size: 0.018, map: dotTexture(), vertexColors: true,
      transparent: true, alphaTest: 0.35, depthWrite: false, sizeAttenuation: true,
    });
    sand.points = new THREE.Points(sand.geom, sand.mat);
    sand.points.frustumCulled = false;
    sand.points.renderOrder = 2;
    scene.add(sand.points);
    sand.writePositions();
  };

  /** 把 (u,v) 写进 position attribute(初始与每帧积分后共用)。 */
  sand.writePositions = function () {
    const pos = sand.geom.attributes.position.array;
    const S = CH.CFG.PLATE, y = CH.CFG.SAND_Y;
    for (let i = 0; i < sand.N; i++) {
      pos[i * 3] = (sand.u[i] - 0.5) * S;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = (sand.v[i] - 0.5) * S;
    }
    sand.geom.attributes.position.needsUpdate = true;
  };

  /** 逐帧积分(dt 秒;m,n 连续模式指数;env 共振包络 0..1)。 */
  sand.update = function (dt, m, n, env) {
    const N = sand.N, u = sand.u, v = sand.v, vx = sand.vx, vz = sand.vz;
    const pos = sand.geom.attributes.position.array;
    const S = CH.CFG.PLATE, y = CH.CFG.SAND_Y;
    const pm = Math.PI * m, pn = Math.PI * n;
    const dampK = Math.max(0, 1 - DAMP * dt);
    const jitter = JITTER * env;
    const micro = 0.08 * env; // 节线上的细微呼吸,避免"冻结"
    const lo = PAD, hi = 1 - PAD;

    for (let i = 0; i < N; i++) {
      const ui = u[i], vi = v[i];
      // 板形 f 及其解析梯度 ∂f/∂u、∂f/∂v
      const pmu = pm * ui, pnu = pn * ui, pnv = pn * vi, pmv = pm * vi;
      const cmu = Math.cos(pmu), cnu = Math.cos(pnu), smu = Math.sin(pmu), snu = Math.sin(pnu);
      const cnv = Math.cos(pnv), cmv = Math.cos(pmv), snv = Math.sin(pnv), smv = Math.sin(pmv);
      const f = cmu * cnv - cnu * cmv;
      const fu = Math.PI * (n * snu * cmv - m * smu * cnv);
      const fv = Math.PI * (m * cnu * smv - n * cmu * snv);

      // 沿 ½f² 下坡滑向节线 + 波腹抖动(落到节线上便"贴住")+ 微呼吸
      const af = f < 0 ? -f : f;
      const j = (af > STICK ? jitter : 0) * af + micro;
      let ax = -G * f * fu + (Math.random() * 2 - 1) * j;
      let az = -G * f * fv + (Math.random() * 2 - 1) * j;

      let nvx = (vx[i] + ax * dt) * dampK;
      let nvz = (vz[i] + az * dt) * dampK;
      let nu = ui + nvx * dt;
      let nv = vi + nvz * dt;

      // 越界夹取,壁面速度清零
      if (nu < lo) { nu = lo; nvx = 0; } else if (nu > hi) { nu = hi; nvx = 0; }
      if (nv < lo) { nv = lo; nvz = 0; } else if (nv > hi) { nv = hi; nvz = 0; }
      u[i] = nu; v[i] = nv; vx[i] = nvx; vz[i] = nvz;

      pos[i * 3] = (nu - 0.5) * S;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = (nv - 0.5) * S;
    }
    sand.geom.attributes.position.needsUpdate = true;
  };

  CH.sand = sand;
})();
