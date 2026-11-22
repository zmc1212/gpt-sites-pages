// 波斯柱式工厂:莲瓣钟形柱础 + 凹槽柱身 + 双牛头柱头;全部合并单几何以便 InstancedMesh
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const _m = new THREE.Matrix4();

// 双牛头(protome)侧影 → 挤压体(面朝 +X,曲线勾出背脊与头颈)
function bullProtome(len = 1.5, h = 1.0, depth = 0.8) {
  const X = (x) => (x / 1.42) * len, Y = (y) => y * h;
  const s = new THREE.Shape();
  s.moveTo(X(0), Y(0.95));                       // 尾根
  s.quadraticCurveTo(X(0.35), Y(1.05), X(0.62), Y(0.98)); // 背脊
  s.quadraticCurveTo(X(0.9), Y(0.9), X(1.05), Y(0.78));   // 颈
  s.quadraticCurveTo(X(1.22), Y(0.62), X(1.3), Y(0.42));  // 额
  s.quadraticCurveTo(X(1.36), Y(0.3), X(1.28), Y(0.24));  // 鼻吻
  s.lineTo(X(1.14), Y(0.26));                    // 下颌
  s.quadraticCurveTo(X(1.0), Y(0.28), X(0.94), Y(0.2));   // 胸
  s.lineTo(X(0.9), 0);
  s.lineTo(X(0.76), 0);
  s.lineTo(X(0.78), Y(0.3));
  s.quadraticCurveTo(X(0.6), Y(0.38), X(0.42), Y(0.36));  // 腹
  s.lineTo(X(0.38), 0);
  s.lineTo(X(0.24), 0);
  s.lineTo(X(0.28), Y(0.42));
  s.quadraticCurveTo(X(0.1), Y(0.5), X(0.05), Y(0.7));    // 臀
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 1 });
  g.translate(0, 0, -depth / 2);
  return g;
}

// 凹槽柱身
function flutedShaft(botR, topR, h, flutes = 40, radial = 56) {
  const g = new THREE.CylinderGeometry(topR, botR, h, radial, 6, false);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), y = p.getY(i);
    if (y > h / 2 - 0.05 || y < -h / 2 + 0.05) continue;
    const ang = Math.atan2(z, x);
    const f = 1 - 0.05 * Math.pow(Math.cos(ang * flutes * 0.5) * 0.5 + 0.5, 1.2);
    p.setX(i, x * f); p.setZ(i, z * f);
  }
  g.computeVertexNormals();
  g.translate(0, h / 2, 0);
  return g;
}

// 钟形莲瓣柱础(旋转体)
function bellBase(r) {
  const pts = [
    new THREE.Vector2(0, 0), new THREE.Vector2(r * 1.28, 0), new THREE.Vector2(r * 1.32, 0.25),
    new THREE.Vector2(r * 1.18, 0.55), new THREE.Vector2(r * 0.98, 0.95), new THREE.Vector2(r * 0.92, 1.3),
    new THREE.Vector2(r * 1.06, 1.55), new THREE.Vector2(r * 1.12, 1.75), new THREE.Vector2(r * 1.02, 1.9),
    new THREE.Vector2(r * 0.9, 2.0),
  ];
  const g = new THREE.LatheGeometry(pts, 40);
  return g;
}

// 缓存不同高度/风格的柱子几何
const cache = new Map();

export function columnGeometry(h, style = 'bull') {
  const key = `${h}|${style}`;
  if (cache.has(key)) return cache.get(key);
  const parts = [];
  const baseR = h * 0.055;          // 柱础半径
  parts.push(bellBase(baseR));
  const shaftBot = baseR * 0.95;    // 柱身下径
  const shaftTop = baseR * 0.62;    // 柱身上径(收分)
  const capH = style === 'bull' ? h * 0.24 : h * 0.12;
  const shaftH = h - 2.0 - capH;
  const shaft = flutedShaft(shaftBot, shaftTop, shaftH);
  shaft.translate(0, 2.0, 0);
  parts.push(shaft);
  // 环带
  const ring = new THREE.TorusGeometry(shaftTop * 1.15, shaftTop * 0.14, 8, 40);
  ring.rotateX(Math.PI / 2);
  ring.translate(0, 2.0 + shaftH + 0.1, 0);
  parts.push(ring);
  if (style === 'bull') {
    const neck = new THREE.CylinderGeometry(shaftTop * 1.08, shaftTop * 1.3, capH * 0.26, 32);
    neck.translate(0, 2.0 + shaftH + capH * 0.14, 0);
    parts.push(neck);
    const seat = new THREE.BoxGeometry(h * 0.15, capH * 0.26, h * 0.3);
    seat.translate(0, 2.0 + shaftH + capH * 0.4, 0);
    parts.push(seat);
    const bullLen = h * 0.16, bullH = h * 0.115, bullD = h * 0.07;
    for (const sgn of [1, -1]) {
      const bull = bullProtome(bullLen, bullH, bullD);
      if (sgn === -1) bull.rotateY(Math.PI); // 第二头背靠背
      bull.translate(0, 2.0 + shaftH + capH * 0.55 + bullH * 0.53, sgn * bullD * 0.55);
      parts.push(bull);
    }
  } else {
    const block = new THREE.BoxGeometry(h * 0.16, capH, h * 0.16);
    block.translate(0, 2.0 + shaftH + capH / 2, 0);
    parts.push(block);
  }
  // ExtrudeGeometry 非索引,统一转为非索引后合并
  const unified = parts.map((g) => (g.index ? g.toNonIndexed() : g));
  const g = mergeGeometries(unified, false);
  g.computeBoundingSphere();
  cache.set(key, g);
  return g;
}

// 破损柱桩(国库废墟)
export function stumpGeometry(h, r) {
  const g = new THREE.CylinderGeometry(r * 0.92, r * 1.12, h, 20, 3, false);
  const p = g.attributes.position;
  const rnd = (i) => Math.abs(Math.sin(i * 127.13 + h * 31.7)) * 0.35;
  for (let i = 0; i < p.count; i++) {
    if (p.getY(i) > h / 2 - 0.01) p.setY(i, h / 2 + (rnd(i) - 0.12) * r * 2.2);
  }
  g.computeVertexNormals();
  return g;
}

// 网格布柱:给 (cols, rows, spacing, origin) 生成 InstancedMesh
export function columnGrid(geo, mat, { cols, rows, spacing, ox = 0, oz = 0, y = 0, rotY = 0, scale = 1, align = 'center' }) {
  const count = cols * rows;
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  let i = 0;
  const startX = -(cols - 1) / 2 * spacing;
  const startZ = -(rows - 1) / 2 * spacing;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = ox + startX + c * spacing;
      const z = oz + startZ + r * spacing;
      _m.makeRotationY(rotY);
      _m.setPosition(x, y, z);
      if (scale !== 1) _m.scale(new THREE.Vector3(scale, scale, scale));
      mesh.setMatrixAt(i++, _m);
    }
  }
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// 单排柱(门廊)
export function columnRow(geo, mat, { from, to, count, y = 0 }) {
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const [x0, z0] = from, [x1, z1] = to;
  for (let i = 0; i < count; i++) {
    const k = count === 1 ? 0.5 : i / (count - 1);
    _m.identity();
    _m.setPosition(x0 + (x1 - x0) * k, y, z0 + (z1 - z0) * k);
    mesh.setMatrixAt(i, _m);
  }
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

// 石梁(横楣)
export function lintel(w, h, d, x, y, z, mat, rotY = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.rotation.y = rotY;
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
