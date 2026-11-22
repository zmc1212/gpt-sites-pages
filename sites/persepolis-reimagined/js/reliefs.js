// 浮雕队列:使节行进人形剪影(挤压体,实例化) + 玫瑰纹楣带 + 边条
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { rosetteTexture } from './textures.js';

// 人形剪影(侧视,面朝 +X)。variant 0:捧贡品使节;1:持矛卫兵
function figureShape(variant) {
  const s = new THREE.Shape();
  // 头冠
  s.moveTo(-0.13, 1.42); s.lineTo(0.13, 1.42); s.lineTo(0.13, 1.5); s.lineTo(-0.13, 1.5); s.closePath();
  const head = new THREE.Path();
  head.absarc(0, 1.28, 0.15, 0, Math.PI * 2, false);
  s.holes.push(head);
  // 身体轮廓(长袍,行进状)
  s.moveTo(0.16, 1.16);
  s.lineTo(0.28, 0.98); // 前臂(捧物)
  s.lineTo(0.5, 0.92);
  s.lineTo(0.5, 0.78);
  s.lineTo(0.3, 0.8);
  s.lineTo(0.22, 0.72);
  s.lineTo(0.34, 0.36); // 前腿
  s.lineTo(0.24, 0.0);
  s.lineTo(0.08, 0.0);
  s.lineTo(0.12, 0.3);
  s.lineTo(-0.14, 0.0); // 后腿(迈步)
  s.lineTo(-0.3, 0.0);
  s.lineTo(-0.2, 0.42);
  s.lineTo(-0.3, 0.78);
  s.lineTo(-0.24, 1.16);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false });
  const join = (extra) => mergeGeometries([g, extra.index ? extra.toNonIndexed() : extra], false);
  if (variant === 1) { // 持矛:加一根竖杆
    const spear = new THREE.BoxGeometry(0.05, 1.7, 0.05);
    spear.translate(0.38, 0.85, 0.06);
    return join(spear);
  }
  // 捧盘
  const tray = new THREE.BoxGeometry(0.34, 0.05, 0.14);
  tray.translate(0.42, 0.95, 0.06);
  return join(tray);
}

const figCache = new Map();

// 沿墙面布浮雕:face = [fx, fz] 为人形正面朝向;offset 沿 face 外推;
// rise:沿 from→to 方向的抬升(阶梯护墙浮雕随坡起)
export function frieze(scene, mat, {
  from, to, count = 12, y = 0, variant = 0, face = [0, 1], offset = 0.08, rise = 0,
}) {
  const key = `f${variant}`;
  if (!figCache.has(key)) figCache.set(key, figureShape(variant));
  const geo = figCache.get(key); // 1.35m 高,统一比例
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const yaw = Math.atan2(-face[1], face[0]);
  for (let i = 0; i < count; i++) {
    const k = count === 1 ? 0.5 : i / (count - 1);
    const x = from[0] + (to[0] - from[0]) * k + face[0] * offset;
    const z = from[1] + (to[1] - from[1]) * k + face[1] * offset;
    const m = new THREE.Matrix4().makeRotationY(yaw);
    m.setPosition(x, y + rise * k, z);
    mesh.setMatrixAt(i, m);
  }
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

// 玫瑰纹一行:圆盘玫瑰花饰,面朝 face 方向
export function rosetteBand(scene, mat, { from, to, y, face = [0, 1], count = 14, radius = 0.22 }) {
  const geo = new THREE.CylinderGeometry(radius, radius, 0.08, 14);
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  // 圆盘轴向 → face 方向:先绕 X 转轴至 +Z,再绕 Y 转
  const pitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
  const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(face[0], face[1]));
  const q = yaw.multiply(pitch);
  const m = new THREE.Matrix4();
  for (let i = 0; i < count; i++) {
    const k = count === 1 ? 0.5 : i / (count - 1);
    const x = from[0] + (to[0] - from[0]) * k + face[0] * 0.02;
    const z = from[1] + (to[1] - from[1]) * k + face[1] * 0.02;
    m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(1, 1, 1));
    mesh.setMatrixAt(i, m);
  }
  scene.add(mesh);
  return mesh;
}

// 框带(浮雕带上下边条;rise 使边条随阶梯起坡)
export function bandStrip(scene, mat, { from, to, y, face = [0, 1], width = 0.3, depth = 0.1, rise = 0 }) {
  const dx = to[0] - from[0], dz = to[1] - from[1];
  const len = Math.hypot(dx, dz);
  const g = new THREE.BoxGeometry(len, width, depth);
  const mesh = new THREE.Mesh(g, mat);
  const yMid = y + rise / 2;
  const slope = Math.atan2(rise, len);
  mesh.position.set((from[0] + to[0]) / 2 + face[0] * depth, yMid, (from[1] + to[1]) / 2 + face[1] * depth);
  mesh.rotation.y = Math.atan2(-dz, dx);
  // 绕墙面水平轴旋转以贴合坡度
  const axis = new THREE.Vector3(0, 1, 0).cross(new THREE.Vector3(dx, 0, dz).normalize());
  if (rise !== 0) mesh.rotateOnWorldAxis(axis.normalize(), -slope);
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}
