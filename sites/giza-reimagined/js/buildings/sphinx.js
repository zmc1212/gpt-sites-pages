// 狮身人面像:程序化风格化(73m 长 / 20m 高,朝东)
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { LAYOUT } from '../config.js';

export function buildSphinx(ctx) {
  const { scene, mats } = ctx;
  const S = LAYOUT[4]; // 狮身人面像
  const [cx, cz] = [S.x, S.z];
  const g = new THREE.Group();
  const parts = [];

  // 卧狮身体(长 46,朝 +X 东)
  const body = new THREE.BoxGeometry(46, 11, 16);
  body.translate(6, 5.5, 0);
  parts.push(body);
  // 后臀隆起
  const hip = new THREE.BoxGeometry(16, 14, 16);
  hip.translate(-16, 7, 0);
  parts.push(hip);
  // 尾巴(沿身侧)
  const tail = new THREE.BoxGeometry(34, 1.6, 1.6);
  tail.translate(4, 12.2, 8.4);
  parts.push(tail);
  // 前爪 ×2(前伸 14m)
  for (const s of [-1, 1]) {
    const paw = new THREE.BoxGeometry(16, 5.5, 6);
    paw.translate(34, 2.75, s * 4.2);
    parts.push(paw);
    const leg = new THREE.BoxGeometry(12, 7, 7);
    leg.translate(26, 5.2, s * 4.2);
    parts.push(leg);
  }
  // 胸部
  const chest = new THREE.BoxGeometry(10, 10, 14);
  chest.translate(26, 8.5, 0);
  parts.push(chest);
  // 颈
  const neck = new THREE.BoxGeometry(6, 9, 10);
  neck.translate(30, 11.5, 0);
  parts.push(neck);
  // nemes 头巾(梯形柱,下宽上窄)
  const nemes = new THREE.CylinderGeometry(3.6, 5.8, 9.5, 4);
  nemes.rotateY(Math.PI / 4);
  nemes.rotateZ(-0.06);
  nemes.translate(34, 15.8, 0);
  parts.push(nemes);
  // 头巾后垂布
  const back = new THREE.BoxGeometry(5, 10, 9);
  back.translate(28.5, 13.5, 0);
  parts.push(back);
  // 面部(浅色 box 贴前脸)
  const face = new THREE.BoxGeometry(1.2, 5.5, 5.2);
  face.translate(37.2, 16.2, 0);
  parts.push(face);

  const solid = mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g)), false);
  solid.computeVertexNormals();
  const mesh = new THREE.Mesh(solid, mats.sandstone);
  mesh.castShadow = true; mesh.receiveShadow = true;
  g.add(mesh);
  // 面部浅色
  const faceMat = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 5.5, 5.2),
    new THREE.MeshStandardMaterial({ color: 0xe0c090, roughness: 0.75 }),
  );
  faceMat.position.set(37.4, 16.2, 0);
  g.add(faceMat);


  g.position.set(cx - 20, 0, cz);
  scene.add(g);

  ctx.addCollider({
    minX: cx - 30, maxX: cx + 20, minZ: cz - 9, maxZ: cz + 9,
  });
  return { group: g };
}
