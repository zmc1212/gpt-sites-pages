// 汉白玉圆台台基:分层圆柱 + 望柱栏板环 + 四向踏步(圜丘 / 祈年殿共用)
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// 单根望柱(柱身 + 柱头)
function postGeometry() {
  const shaft = new THREE.CylinderGeometry(0.14, 0.16, 1.1, 8);
  shaft.translate(0, 0.55, 0);
  const head = new THREE.CylinderGeometry(0.2, 0.2, 0.16, 8);
  head.translate(0, 1.18, 0);
  const cap = new THREE.SphereGeometry(0.11, 8, 6);
  cap.translate(0, 1.3, 0);
  return mergeGeometries([shaft, head, cap].map((g) => (g.index ? g.toNonIndexed() : g)), false);
}

// 栏板之间的望柱环 + 栏板环(全部实例化进一个 InstancedMesh 组)
export function balustradeRing(parent, { cx, cz, r, y, gap = 2.0, postMat, slabMat, skip = [] }) {
  const count = Math.max(8, Math.round((Math.PI * 2 * r) / gap));
  const postGeo = postGeometry();
  const posts = new THREE.InstancedMesh(postGeo, postMat, count);
  const slabGeo = new THREE.BoxGeometry(gap * 0.86, 0.52, 0.13);
  const slabs = new THREE.InstancedMesh(slabGeo, slabMat, count);
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  const inSkip = (a) => skip.some((s) => {
    const da = Math.abs(((a - s.angle + Math.PI) % (Math.PI * 2)) - Math.PI);
    return da < s.half;
  });
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    if (inSkip(a)) { posts.setMatrixAt(i, ZERO); slabs.setMatrixAt(i, ZERO); continue; }
    const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
    _e.set(0, -a + Math.PI / 2, 0);
    _q.setFromEuler(_e);
    _m.compose(new THREE.Vector3(x, y, z), _q, new THREE.Vector3(1, 1, 1));
    posts.setMatrixAt(i, _m);
    // 栏板位于两望柱之间
    const am = a + Math.PI / count;
    const xm = cx + Math.cos(am) * r, zm = cz + Math.sin(am) * r;
    _e.set(0, -am + Math.PI / 2, 0);
    _q.setFromEuler(_e);
    _m.compose(new THREE.Vector3(xm, y + 0.18, zm), _q, new THREE.Vector3(1, 1, 1));
    slabs.setMatrixAt(i, _m);
  }
  posts.castShadow = true; posts.receiveShadow = true;
  slabs.castShadow = true; slabs.receiveShadow = true;
  parent.add(posts); parent.add(slabs);
  return { posts, slabs };
}

// 一层圆柱台基
function tierCylinder(r, h, yBase, mat) {
  const g = new THREE.CylinderGeometry(r, r * 1.015, h, 64);
  g.translate(0, yBase + h / 2, 0);
  return g;
}

// 踏步:自地面 hTotal 上升到台顶;两侧随踏步抬升的垂带(阶梯式侧墙)
function stairRun({ cx, cz, dir, width, hTotal, topY, mat, matFine, stepD = 0.42, stepH = 0.3 }) {
  const n = Math.max(3, Math.round(hTotal / stepH));
  const boxes = [];
  const dx = dir[0], dz = dir[1];
  for (let i = 0; i < n; i++) {
    const h = (i + 1) * (hTotal / n);
    const t = (i + 0.5) * stepD;
    const box = new THREE.BoxGeometry(width, h, stepD);
    box.translate(cx + dx * (t + stepD * 0.2), h / 2, cz + dz * (t + stepD * 0.2));
    boxes.push(box);
    // 两侧垂带:高于踏步 1.15,随级抬升
    for (const sgn of [1, -1]) {
      const px = cx + dx * (t + stepD * 0.2) - dz * sgn * (width / 2 + 0.55);
      const pz = cz + dz * (t + stepD * 0.2) + dx * sgn * (width / 2 + 0.55);
      const rail = new THREE.BoxGeometry(1.1, h + 1.15, stepD + 0.06);
      rail.translate(px, (h + 1.15) / 2, pz);
      boxes.push(rail);
    }
  }
  const mesh = new THREE.Mesh(mergeGeometries(boxes, false), mat);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

// 完整圆台:多分层 + 每层栏板(踏步处留口) + 四向踏步(自台缘外起步向内登)
export function roundMarbleTerrace(parent, { cx, cz, tiers, mat, matFine, stairDirs = [[1, 0], [-1, 0], [0, 1], [0, -1]], stairW = 10 }) {
  let yBase = 0;
  tiers.forEach((tier) => {
    const body = new THREE.Mesh(tierCylinder(tier.r, tier.h, yBase, mat), mat);
    body.castShadow = true; body.receiveShadow = true;
    parent.add(body);
    // 上枋(挑檐窄环)
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(tier.r * 1.03, tier.r * 1.03, 0.28, 64), matFine);
    cap.position.set(cx, yBase + tier.h + 0.14, cz);
    cap.castShadow = true; cap.receiveShadow = true;
    parent.add(cap);
    // 该层顶面的栏板环(在四向踏步口留缺口)
    const skip = stairDirs.map(([dx, dz]) => {
      const a = Math.atan2(dz, dx);
      const half = Math.atan((stairW / 2 + 1.4) / tier.r);
      return { angle: a, half };
    });
    balustradeRing(parent, {
      cx, cz, r: tier.r * 0.985, y: yBase + tier.h + 0.28, gap: 2.0,
      postMat: matFine, slabMat: mat, skip,
    });
    yBase += tier.h;
  });
  const topY = yBase;
  // 四向踏步:自台缘外侧(地面处)向台缘方向逐级上升
  const outer = tiers[0].r;
  const runLen = Math.max(3, Math.round(topY / 0.3)) * 0.42;
  for (const [dx, dz] of stairDirs) {
    const stair = stairRun({
      cx: cx + dx * (outer + runLen), cz: cz + dz * (outer + runLen),
      dir: [-dx, -dz],
      width: stairW, hTotal: topY, topY,
      mat, matFine,
    });
    parent.add(stair);
  }
  return { topY };
}
