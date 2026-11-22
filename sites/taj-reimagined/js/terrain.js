// 地形:莫卧儿四分花园(平坦草坪)+ 长池水镜 + 柏树列
import * as THREE from 'three';
import { mulberry32 } from './textures.js';

export function plainHeight(x, z) { return 0; }
export function heightAt(x, z) { return 0; }

export function buildTerrain(scene, mats) {
  const SIZE = 3200, SEG = 24; // 平坦花园,少分段
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const tmp = new THREE.Color(0xffffff);
  for (let i = 0; i < pos.count; i++) { tmp.set(0xffffff); colors[i*3]=tmp.r; colors[i*3+1]=tmp.g; colors[i*3+2]=tmp.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const ground = new THREE.Mesh(geo, mats.garden);
  ground.receiveShadow = true;
  ground.userData.noOcclude = true;
  scene.add(ground);

  // 长池水镜(z -200..130,宽 12)
  const water = new THREE.Mesh(new THREE.BoxGeometry(12, 0.5, 330), mats.water);
  water.position.set(0, 0.25, -35);
  water.receiveShadow = true;
  scene.add(water);
  // 池沿石台
  for (const s of [-1, 1]) {
    const edge = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 334), mats.marble);
    edge.position.set(s * 7, 0.55, -35);
    edge.castShadow = true; edge.receiveShadow = true;
    scene.add(edge);
  }
  // 中央步道(池两岸)
  for (const s of [-1, 1]) {
    const walk = new THREE.Mesh(new THREE.BoxGeometry(9, 0.5, 340), mats.marble);
    walk.position.set(s * 14.5, 0.25, -30);
    walk.receiveShadow = true;
    scene.add(walk);
  }
  // 南北两段中央水渠
  const canalN = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, 70), mats.water);
  canalN.position.set(0, 0.3, -235);
  scene.add(canalN);

  // 柏树列(池两岸,天坛柏树同款做法)
  const rnd = mulberry32(7);
  const treeGeo = new THREE.ConeGeometry(1.9, 12, 7);
  treeGeo.translate(0, 6, 0);
  const trunk = new THREE.CylinderGeometry(0.22, 0.3, 2.4, 6);
  trunk.translate(0, 1.2, 0);
  const trees = new THREE.InstancedMesh(treeGeo, mats.palm, 46);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion();
  let i = 0;
  for (const z of []) {}
  for (let k = 0; k < 23; k++) {
    const z = 130 - k * 12;
    for (const x of [-22, 22]) {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * 0.4);
      const s = 0.8 + rnd() * 0.5;
      m.compose(new THREE.Vector3(x + (rnd()-0.5)*2, 0, z + (rnd()-0.5)*3), q, new THREE.Vector3(s, s, s));
      trees.setMatrixAt(i++, m);
    }
  }
  trees.count = i;
  trees.castShadow = true; trees.receiveShadow = true;
  scene.add(trees);

  return { ground };
}
