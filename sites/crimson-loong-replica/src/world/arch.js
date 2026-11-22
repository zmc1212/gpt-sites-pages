// Vermilion architecture: terrace hall with a swept curved roof, shore gate
// (paifang), hexagonal pavilion on the side spire, hanging lanterns.
import * as THREE from 'three';
import { SH, R, groundH, enhance } from '../lib/util.js';
import { Tex } from '../lib/tex.js';

export const Arch = { group: new THREE.Group(), lanterns: [] };

function mat(opts, eo = {}) {
  return enhance(new THREE.MeshStandardMaterial(opts), eo);
}

// Curved gable roof: profile t -> (z, y) swept along x, ends taper for hips.
function curvedRoof(w, d, h, overhang, tiles) {
  const NX = 26, NT = 9;
  const pos = [], uv = [], idx = [];
  const prof = (t) => [t * (d / 2 + overhang), h * Math.pow(1 - t, 1.45) - 0.16 * Math.pow(t, 3) + 0.22 * Math.pow(t, 5)];
  for (let ix = 0; ix <= NX; ix++) {
    const u = ix / NX;
    const x = (u - 0.5) * w;
    const hip = 1 - Math.pow(Math.abs(u - 0.5) * 2, 3.2) * 0.55;   // hip taper at ends
    for (let it = 0; it <= NT; it++) {
      const t = it / NT;
      const [z0, y0] = prof(t);
      for (const sgn of [1, -1]) {
        pos.push(x, y0 * hip + (t === 0 ? -0.12 : 0), z0 * sgn * hip);
        uv.push(u * 3, t * 1.6);
      }
    }
  }
  const rowLen = (NT + 1) * 2;
  for (let ix = 0; ix < NX; ix++) {
    for (let it = 0; it < NT; it++) {
      const a = ix * rowLen + it * 2;
      // right side strip
      idx.push(a, a + 2, a + rowLen, a + 2, a + 2 + rowLen, a + rowLen);
      // left side strip
      idx.push(a + 1, a + 1 + rowLen, a + 3, a + 1 + rowLen, a + 3 + rowLen, a + 3);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat({ map: tiles, color: 0xcfd6e4, roughness: 0.55, side: THREE.DoubleSide }, { fogMul: 1 }));
  m.castShadow = true;
  return m;
}

function lanternPair(x, y, z, scale = 1) {
  const grp = new THREE.Group();
  const geo = new THREE.SphereGeometry(0.5 * scale, 12, 10);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    map: Tex.lantern, emissive: 0xff8a3c, emissiveIntensity: 1.6, roughness: 0.7,
  }));
  m.scale.set(1, 1.25, 1);
  grp.add(m);
  const cord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015 * scale, 0.015 * scale, 1.1 * scale, 4),
    mat({ color: 0x1a0f0a, roughness: 1 })
  );
  cord.position.y = 0.85 * scale;
  grp.add(cord);
  grp.userData.swing = 0;
  grp.position.set(x, y, z);
  Arch.lanterns.push(grp);
  return grp;
}

export function initArch(scene) {
  const g = Arch.group;
  const plaster = () => mat({ map: Tex.plaster, roughness: 0.85 });
  const wood = () => mat({ map: Tex.wood, color: 0xb08a6a, roughness: 0.8 });
  const gold = () => mat({ color: 0xd8a03c, metalness: 0.75, roughness: 0.35 });
  const stone = () => mat({ map: Tex.stone, roughness: 0.9 });
  const lattice = () => mat({
    map: Tex.lattice, emissive: 0xffb35e, emissiveMap: Tex.lattice,
    emissiveIntensity: 1.1, side: THREE.DoubleSide,
  });

  // ---------- the hall on its terrace ----------
  {
    const hx = 95, hz = 58, hy = 6.0;
    const hall = new THREE.Group();
    const platform = new THREE.Mesh(new THREE.BoxGeometry(46, 2.4, 30), stone());
    platform.position.y = 1.2;
    const platform2 = new THREE.Mesh(new THREE.BoxGeometry(52, 1.6, 36), stone());
    platform2.position.y = -0.4;
    hall.add(platform, platform2);
    for (const s of [-1, 1]) {
      const stair = new THREE.Mesh(new THREE.BoxGeometry(9, 0.8, 5), stone());
      stair.position.set(s * 0, -0.9 + 0.4, 0);
      stair.position.z = 19.5; stair.rotation.x = 0;
      hall.add(stair);
    }
    // columns + walls
    const colGeo = new THREE.CylinderGeometry(0.85, 0.9, 10.5, 10);
    const cols = [];
    for (const sx of [-16, 0, 16]) for (const sz of [-10, 10]) cols.push([sx, sz]);
    for (const [cx, cz] of cols) {
      const c = new THREE.Mesh(colGeo, wood());
      c.position.set(cx, 6.6, cz);
      c.castShadow = true;
      hall.add(c);
    }
    const wallL = new THREE.Mesh(new THREE.BoxGeometry(36, 7.4, 1.0), plaster());
    wallL.position.set(0, 6.9, -11);
    wallL.castShadow = true;
    const winL = new THREE.Mesh(new THREE.PlaneGeometry(22, 3.4), lattice());
    winL.position.set(0, 7.0, -10.45);
    const winR = winL.clone(); winR.position.set(0, 7.0, 11); winR.rotation.y = Math.PI;
    hall.add(wallL, winL, winR);
    // beams
    for (const by of [9.4, 10.6, 11.8]) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(40, 0.9, 2.2), by > 10 ? gold() : wood());
      beam.position.set(0, by, 0);
      beam.castShadow = true;
      hall.add(beam);
    }
    // roof (two stacked sweeps)
    const roof = curvedRoof(44, 34, 7.5, 5, Tex.tile);
    roof.position.y = 12.4;
    const roof2 = curvedRoof(30, 22, 5.5, 3.5, Tex.tile);
    roof2.position.y = 16.8;
    hall.add(roof, roof2);
    // ridge ornaments
    for (const s of [-1, 1]) {
      const fin = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.6, 6), gold());
      fin.position.set(s * 13, 25.2, 0);
      fin.rotation.z = s * -0.25;
      hall.add(fin);
    }
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(27, 0.8, 1.1), gold());
    ridge.position.y = 22.6;
    hall.add(ridge);
    hall.position.set(hx, hy - 1.6, hz);
    hall.rotation.y = -0.6;
    g.add(hall);
    lanternPair(hx - 14, hy + 10.5, hz + 13, 0.9);
    lanternPair(hx + 14, hy + 10.5, hz + 13, 0.9);
  }

  // ---------- gate (paifang) at the shore ----------
  {
    const gate = new THREE.Group();
    const gx = 40, gz = -20;
    const colGeo = new THREE.CylinderGeometry(0.55, 0.62, 9.5, 8);
    for (const s of [-1, 1]) for (const t of [-1, 1]) {
      const c = new THREE.Mesh(colGeo, wood());
      c.position.set(s * 5.5, 4.75, t * 2.2);
      c.castShadow = true;
      gate.add(c);
    }
    for (const [by, mw] of [[6.4, 14], [8.2, 15.4], [9.9, 13]]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(mw, 0.85, 2.6), by > 9 ? gold() : wood());
      b.position.y = by;
      b.castShadow = true;
      gate.add(b);
    }
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.7, 0.3), mat({ color: 0x2c1410, roughness: 0.6 }));
    plaque.position.set(0, 7.35, 0);
    gate.add(plaque);
    const roof = curvedRoof(17, 8, 2.6, 2.6, Tex.tile);
    roof.position.y = 10.6;
    roof.rotation.y = Math.PI / 2;
    gate.add(roof);
    gate.position.set(gx, groundH(gx, gz), gz);
    gate.rotation.y = 0.9;
    g.add(gate);
    lanternPair(gx - 4.6, groundH(gx, gz) + 5.6, gz + 1.5, 0.75);
    lanternPair(gx + 4.6, groundH(gx, gz) + 5.6, gz + 1.5, 0.75);
  }

  // ---------- pavilion on the side spire ----------
  {
    const px = 150, pz = -95, py = 74;
    const pav = new THREE.Group();
    const colGeo = new THREE.CylinderGeometry(0.42, 0.48, 6.5, 8);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const c = new THREE.Mesh(colGeo, wood());
      c.position.set(Math.cos(a) * 4.4, 3.25, Math.sin(a) * 4.4);
      c.castShadow = true;
      pav.add(c);
    }
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(5.1, 5.1, 0.5, 6, 1, true), wood());
    ring.position.y = 6.4;
    pav.add(ring);
    const roof = curvedRoof(15.5, 15.5, 5.2, 3.2, Tex.tile);
    roof.position.y = 7.0;
    roof.rotation.y = Math.PI / 6;
    pav.add(roof);
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.75, 10, 8), gold());
    finial.position.y = 12.9;
    pav.add(finial);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(6.4, 7.2, 1.6, 6), stone());
    base.position.y = -0.8;
    pav.add(base);
    pav.position.set(px, py, pz);
    g.add(pav);
    lanternPair(px + 4.2, py + 6.2, pz + 2.2, 0.6);
    lanternPair(px - 4.2, py + 6.2, pz - 2.2, 0.6);
  }

  scene.add(g);
}

export function updateArch(t) {
  const wind = 0.05 + SH.uWindPow.value * 0.5;
  for (const l of Arch.lanterns) {
    const ph = l.position.x * 0.7 + l.position.z * 1.3;
    l.rotation.z = Math.sin(t * 1.5 + ph) * wind;
    l.rotation.x = Math.cos(t * 1.13 + ph) * wind * 0.7;
  }
}
