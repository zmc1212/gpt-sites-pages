// 建筑公共构件:门框(铭文凹带)、墙段、残墙
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function makeDoorframe(mat, bandMat, { w, h, d, x, y, z, rotY = 0 }) {
  // 门框:两侧厚墩 + 顶梁,梁下三面凹带(铭文感)
  const g = new THREE.Group();
  const jamb = new THREE.BoxGeometry(d, h, d);
  for (const s of [-1, 1]) {
    const m = new THREE.Mesh(jamb, mat);
    m.position.set(s * (w / 2 + d / 2), h / 2, 0);
    m.castShadow = true; m.receiveShadow = true;
    g.add(m);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(w + d * 2, d * 0.9, d), mat);
  beam.position.set(0, h + d * 0.45, 0);
  beam.castShadow = true; beam.receiveShadow = true;
  g.add(beam);
  // 凹带(深色嵌条)
  for (const s of [-1, 1]) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.18, h * 0.62, 0.12), bandMat);
    strip.position.set(s * (w / 2 + 0.1), h * 0.42, d / 2 + 0.02);
    g.add(strip);
  }
  const topStrip = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, 0.18, 0.12), bandMat);
  topStrip.position.set(0, h - d * 0.7, d / 2 + 0.02);
  g.add(topStrip);
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  return g;
}

// 一段残墙(带砌缝纹理的矮墙)
export function wallStub(mat, { x, z, w, d, h, rotY = 0 }) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, h / 2, z);
  m.rotation.y = rotY;
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

// 围合大厅的四面墙(留门洞):walls = [{side:'N'|'S'|'E'|'W', gap:[a,b]可选, h}]
export function hallWalls(mat, { cx, cz, w, d, h, thickness = 1.6, gaps = {} }) {
  const g = new THREE.Group();
  const sides = {
    N: { len: w, axis: 'x', pos: [cx, cz + d / 2 - thickness / 2] },
    S: { len: w, axis: 'x', pos: [cx, cz - d / 2 + thickness / 2] },
    E: { len: d, axis: 'z', pos: [cx + w / 2 - thickness / 2, cz] },
    W: { len: d, axis: 'z', pos: [cx - w / 2 + thickness / 2, cz] },
  };
  for (const [side, info] of Object.entries(sides)) {
    const gap = gaps[side];
    const segs = [];
    if (!gap) {
      segs.push({ center: 0, len: info.len });
    } else {
      // gap = [a, b]:沿墙轴(中心为 0)的洞口区间
      const [a, b] = gap;
      if (a > -info.len / 2 + 0.5) segs.push({ center: (-info.len / 2 + a) / 2, len: a + info.len / 2 });
      if (b < info.len / 2 - 0.5) segs.push({ center: (b + info.len / 2) / 2, len: info.len / 2 - b });
    }
    for (const s of segs) {
      const geo = info.axis === 'x' ? new THREE.BoxGeometry(s.len, h, thickness) : new THREE.BoxGeometry(thickness, h, s.len);
      const m = new THREE.Mesh(geo, mat);
      if (info.axis === 'x') m.position.set(info.pos[0] + s.center, h / 2, info.pos[1]);
      else m.position.set(info.pos[0], h / 2, info.pos[1] + s.center);
      m.castShadow = true; m.receiveShadow = true;
      g.add(m);
    }
  }
  return g;
}

export function mergedMesh(geos, mat, cast = true) {
  const g = new THREE.Mesh(mergeGeometries(geos, false), mat);
  g.castShadow = cast; g.receiveShadow = true;
  return g;
}
