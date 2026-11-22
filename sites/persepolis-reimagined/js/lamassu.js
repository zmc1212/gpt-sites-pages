// 人首翼牛像 Lamassu:基本体组合的程序化风格化(合并单几何)
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// 翼羽剪影
function wingShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.5, 0.65, 1.4, 0.9, 2.3, 0.62);
  s.lineTo(2.3, 0.28);
  s.bezierCurveTo(1.5, 0.42, 0.7, 0.22, 0.12, -0.28);
  s.closePath();
  return s;
}

export function lamassuGeometry(scale = 1) {
  const parts = [];
  const push = (g, x, y, z, rx = 0, ry = 0) => {
    if (rx) g.rotateX(rx);
    if (ry) g.rotateY(ry);
    g.translate(x, y, z);
    parts.push(g);
  };
  const H = 4.6; // 总高
  // 身体:低矮长圆体(胸部略高,避免"圆桶"感)
  const body = new THREE.CylinderGeometry(0.78, 0.92, 3.8, 12);
  body.rotateZ(Math.PI / 2);
  body.scale(1, 1, 0.62);
  push(body, -0.3, H * 0.5, 0);
  const chest = new THREE.CylinderGeometry(0.82, 0.95, 1.5, 12);
  chest.rotateZ(Math.PI / 2);
  chest.scale(1, 1, 0.72);
  push(chest, 1.55, H * 0.47, 0);
  // 背部平脊
  const back = new THREE.BoxGeometry(4.3, 0.42, 1.3);
  push(back, -0.3, H * 0.67, 0);
  // 四腿(前腿位于胸部两侧,后腿粗壮)
  const legG = new THREE.BoxGeometry(0.5, H * 0.42, 0.52);
  push(legG.clone(), 1.5, H * 0.21, 0.44);
  push(legG.clone(), 1.5, H * 0.21, -0.44);
  push(legG.clone(), -1.8, H * 0.21, 0.5);
  push(legG.clone(), -1.8, H * 0.21, -0.5);
  const hoof = new THREE.BoxGeometry(0.58, 0.2, 0.58);
  push(hoof.clone(), 1.5, 0.1, 0.44);
  push(hoof.clone(), 1.5, 0.1, -0.44);
  push(hoof.clone(), -1.8, 0.1, 0.5);
  push(hoof.clone(), -1.8, 0.1, -0.5);
  // 头颈部(前伸)
  const neck = new THREE.CylinderGeometry(0.42, 0.5, 1.3, 10);
  neck.rotateZ(0.5);
  push(neck, 1.95, H * 0.68, 0);
  const head = new THREE.SphereGeometry(0.46, 12, 10);
  push(head, 2.35, H * 0.82, 0);
  const face = new THREE.BoxGeometry(0.34, 0.5, 0.34);
  push(face, 2.62, H * 0.79, 0);
  // 须 + 冠
  const beard = new THREE.BoxGeometry(0.22, 0.72, 0.3);
  push(beard, 2.55, H * 0.6, 0);
  const crown1 = new THREE.CylinderGeometry(0.42, 0.44, 0.5, 12);
  push(crown1, 2.35, H * 0.96, 0);
  const crown2 = new THREE.CylinderGeometry(0.5, 0.42, 0.34, 12);
  push(crown2, 2.35, H * 1.12, 0);
  // 双角(小弯柱)
  for (const sz of [0.14, -0.14]) {
    const horn = new THREE.CylinderGeometry(0.09, 0.13, 0.44, 8);
    horn.rotateX(Math.PI / 2.6);
    push(horn, 2.42, H * 1.2, sz);
  }
  // 双翼(贴体侧)
  const w = new THREE.ExtrudeGeometry(wingShape(), { depth: 0.16, bevelEnabled: false });
  w.scale(1.6, 1.9, 1);
  push(w, -1.0, H * 0.52, 0.78);
  push(w.clone(), -1.0, H * 0.52, -0.94);
  // 尾
  const tail = new THREE.CylinderGeometry(0.16, 0.1, 0.9, 8);
  tail.rotateX(Math.PI / 2.4);
  push(tail, -2.5, H * 0.62, 0);

  // ExtrudeGeometry(翼)非索引,统一转非索引合并
  const unified = parts.map((g) => (g.index ? g.toNonIndexed() : g));
  const g = mergeGeometries(unified, false);
  g.computeVertexNormals();
  g.computeBoundingSphere();
  if (scale !== 1) g.scale(scale, scale, scale);
  return g;
}

// 摆放一对(门洞两侧,面朝 ±dirX;off 为离门洞中心线的横向距离)
export function lamassuPair(geo, mat, x, y, z, faceX = 1, off = 5.5) {
  const g = new THREE.Group();
  for (const side of [1, -1]) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z + side * off);
    m.rotation.y = faceX > 0 ? -Math.PI / 2 : Math.PI / 2;
    m.castShadow = true; m.receiveShadow = true;
    g.add(m);
  }
  return g;
}
