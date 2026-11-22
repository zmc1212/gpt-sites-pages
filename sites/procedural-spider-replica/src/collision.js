/* 解析碰撞世界：球（圆润可攀爬）与盒（高大成墙）的闭合式射线求交，
 * 加一条地形光线步进 + 二分求根。castAll 是机身、脚点、相机的唯一查询入口。
 * 另有 clearance（点-几何有符号距离，用于去穿透）与 occluded（线段遮挡测试，
 * 用于"腿是否跨在障碍上"的判定）。
 */
'use strict';

window.SpiderLib = window.SpiderLib || {};
(function (L) {

  // {kind:'sphere', c, r, br} | {kind:'box', p, h(半长), q/iq(姿态), br, wall}
  const colliders = [];
  L.colliders = colliders;

  L.addSphere = function (c, r) { colliders.push({ kind: 'sphere', c: c.clone(), r, br: r, wall: false }); };
  L.addBox = function (p, h, q) {
    const qq = q ? q.clone() : L.Q();
    colliders.push({ kind: 'box', p: p.clone(), h: h.clone(), q: qq, iq: qq.clone().invert(), br: h.length(), wall: h.y > 1.2 });
  };
  L.clearColliders = function () { colliders.length = 0; };

  function clamp3(v, a, b) { return v < a ? a : v > b ? b : v; }

  L.raySphere = function (o, d, s, maxD) {
    const oc = o.clone().sub(s.c); const b = oc.dot(d); const c = oc.dot(oc) - s.r * s.r;
    const di = b * b - c; if (di < 0) return null;
    const sq = Math.sqrt(di); let t = -b - sq; if (t < 0) t = -b + sq; if (t < 0 || t > maxD) return null;
    const pt = o.clone().addScaledVector(d, t); return { t, n: pt.clone().sub(s.c).normalize(), point: pt };
  };

  L.rayBox = function (o, d, bx, maxD) {
    const lo = o.clone().sub(bx.p).applyQuaternion(bx.iq), ld = d.clone().applyQuaternion(bx.iq);
    const loA = [lo.x, lo.y, lo.z], ldA = [ld.x, ld.y, ld.z], lh = [bx.h.x, bx.h.y, bx.h.z];
    let tmin = -Infinity, tmax = Infinity, na = 0, ns = 1;
    for (let i = 0; i < 3; i++) {
      if (Math.abs(ldA[i]) < 1e-8) { if (loA[i] < -lh[i] || loA[i] > lh[i]) return null; }
      else {
        let t1 = (-lh[i] - loA[i]) / ldA[i], t2 = (lh[i] - loA[i]) / ldA[i];
        if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
        if (t1 > tmin) { tmin = t1; na = i; ns = ldA[i] < 0 ? 1 : -1; }
        if (t2 < tmax) tmax = t2;
        if (tmin > tmax) return null;
      }
    }
    let t = tmin; if (t < 0) t = tmax; if (t < 0 || t > maxD) return null;
    const nl = [0, 0, 0]; nl[na] = ns;
    const nrm = L.V3(nl[0], nl[1], nl[2]).applyQuaternion(bx.q).normalize();
    return { t, n: nrm, point: o.clone().addScaledVector(d, t) };
  };

  /* 全场射线：先测全部解析体取最近；向下方向的射线再对地形做步进，
   * 命中后二分 5 次把根收敛到 <0.15 步长。步进上限 260×0.45≈117u，
   * 保证"从高处起探"（teleport +80、自检 +60）也能落到地面。 */
  L.castAll = function (o, d, maxD) {
    let best = null, bd = maxD;
    for (const c of colliders) {
      const h = c.kind === 'sphere' ? L.raySphere(o, d, c, bd) : L.rayBox(o, d, c, bd);
      if (h && h.t < bd) { best = h; bd = h.t; }
    }
    if (d.y < 0.3) {
      const ds = 0.45, steps = Math.min(Math.ceil(bd / ds), 260);
      for (let s = 1; s <= steps; s++) {
        const t = s * ds; if (t > bd) break;
        const x = o.x + d.x * t, y = o.y + d.y * t, z = o.z + d.z * t;
        if (y - L.terrainH(x, z) <= 0) {
          let a = t - ds, b = t;
          for (let k = 0; k < 5; k++) { const m = (a + b) * 0.5; if (o.y + d.y * m - L.terrainH(o.x + d.x * m, o.z + d.z * m) <= 0) b = m; else a = m; }
          const x2 = o.x + d.x * b, z2 = o.z + d.z * b;
          if (b < bd) { best = { t: b, n: L.terrainN(x2, z2), point: L.V3(x2, L.terrainH(x2, z2), z2) }; bd = b; }
          break;
        }
      }
    }
    return best;
  };

  /* 点到几何体的有符号距离：球为 |p-c|-r；盒在内部给出到最近面的负距离。
   * 返回 {d, n}，n 是外推方向。球心与查询点重合时给单位外推方向，避免除零。 */
  L.clearance = function (p, c) {
    if (c.kind === 'sphere') {
      const v = p.clone().sub(c.c); const l = v.length();
      if (l < 1e-6) return { d: -c.r, n: L.V3(0, 1, 0) };
      return { d: l - c.r, n: v.multiplyScalar(1 / l) };
    }
    const lp = p.clone().sub(c.p).applyQuaternion(c.iq);
    const inside = Math.abs(lp.x) < c.h.x && Math.abs(lp.y) < c.h.y && Math.abs(lp.z) < c.h.z;
    if (inside) {
      const dx = c.h.x - Math.abs(lp.x), dy = c.h.y - Math.abs(lp.y), dz = c.h.z - Math.abs(lp.z); let nl, pen;
      if (dx <= dy && dx <= dz) { nl = L.V3(Math.sign(lp.x) || 1, 0, 0); pen = dx; }
      else if (dy <= dz) { nl = L.V3(0, Math.sign(lp.y) || 1, 0); pen = dy; }
      else { nl = L.V3(0, 0, Math.sign(lp.z) || 1); pen = dz; }
      return { d: -pen, n: nl.applyQuaternion(c.q).normalize() };
    }
    const cp = L.V3(clamp3(lp.x, -c.h.x, c.h.x), clamp3(lp.y, -c.h.y, c.h.y), clamp3(lp.z, -c.h.z, c.h.z));
    const v = lp.clone().sub(cp); const l = v.length() || 1e-6;
    return { d: l, n: v.multiplyScalar(1 / l).applyQuaternion(c.q).normalize() };
  };

  /** 线段 a→b 是否被障碍几何挡住？（端点略收边；地形不计入） */
  L.occluded = function (a, b) {
    const dir = b.clone().sub(a); const dist = dir.length(); if (dist < 0.5) return false;
    dir.multiplyScalar(1 / dist);
    const o = a.clone().addScaledVector(dir, 0.18), md = dist - 0.2; if (md <= 0) return false;
    for (const c of colliders) { const h = c.kind === 'sphere' ? L.raySphere(o, dir, c, md) : L.rayBox(o, dir, c, md); if (h) return true; }
    return false;
  };

})(window.SpiderLib);
