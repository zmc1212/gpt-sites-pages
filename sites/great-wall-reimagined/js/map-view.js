// 地图视图:SVG 俯视示意图(山脊墙线、敌楼、烽火台、村舍、导览路线、章节跳转、相机标记)
import { RIDGE_PTS, STRUCTS } from './config.js';
import { CHAPTERS } from './chapters.js';

const VW = 560, VH = 400, SC = 0.24, CX = -70, CZ = 0;
const wx = (x) => VW / 2 + (x - CX) * SC;
const wz = (z) => VH / 2 - (z - CZ) * SC;

export function buildMapSvg(root, { onJump }) {
  const ns = 'http://www.w3.org/2000/svg';
  root.innerHTML = '';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
  svg.classList.add('map-svg');

  const circle = (x, z, r, cls) => {
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', wx(x)); c.setAttribute('cy', wz(z));
    c.setAttribute('r', r);
    c.setAttribute('class', cls);
    svg.appendChild(c);
    return c;
  };
  const square = (x, z, s, cls) => {
    const r = document.createElementNS(ns, 'rect');
    r.setAttribute('x', wx(x) - s / 2); r.setAttribute('y', wz(z) - s / 2);
    r.setAttribute('width', s); r.setAttribute('height', s);
    r.setAttribute('class', cls);
    svg.appendChild(r);
    return r;
  };
  const label = (x, z, text, cls = 'map-label') => {
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', wx(x)); t.setAttribute('y', wz(z) + 4);
    t.setAttribute('class', cls);
    t.textContent = text;
    svg.appendChild(t);
    return t;
  };

  // 等高意象环(山体群示意)
  for (const [hx, hz, hr] of [
    [-90, -320, 46], [-30, -180, 52], [-140, -40, 56], [-80, 100, 50],
    [-170, 230, 58], [-90, 360, 60], [-20, 480, 50], [40, 600, 44],
    [160, -480, 62], [230, -260, 58], [280, 20, 60], [240, 300, 64],
    [140, 540, 58], [-320, -420, 60], [-360, -120, 66], [-380, 180, 62],
    [-320, 480, 64], [80, -680, 56], [-240, 620, 58],
  ]) {
    circle(hx, hz, hr, 'map-hill');
  }

  // 墙线(山脊折线)
  const wall = document.createElementNS(ns, 'polyline');
  wall.setAttribute('points', RIDGE_PTS.map(([x, z]) => `${wx(x)},${wz(z)}`).join(' '));
  wall.setAttribute('class', 'map-wall-line');
  svg.appendChild(wall);

  // 敌楼 / 烽火台 / 村舍
  for (const t of STRUCTS.towers) square(t.x, t.z, 13, 'map-bldg');
  square(STRUCTS.beacon.x, STRUCTS.beacon.z, 15, 'map-beacon');
  square(STRUCTS.village.x, STRUCTS.village.z, 10, 'map-village');
  label(STRUCTS.towers[0].x - 40, STRUCTS.towers[0].z, '东五眼楼');
  label(STRUCTS.towers[2].x + 52, STRUCTS.towers[2].z, '望京楼');
  label(STRUCTS.beacon.x - 44, STRUCTS.beacon.z, '烽火台');
  label(STRUCTS.village.x + 46, STRUCTS.village.z, '山脚村舍');

  // 导览路线
  const route = document.createElementNS(ns, 'polyline');
  const pts = [];
  CHAPTERS.forEach((c) => c.kfs.forEach((kf) => pts.push(`${wx(kf.p[0])},${wz(kf.p[2])}`)));
  route.setAttribute('points', pts.join(' '));
  route.setAttribute('class', 'map-route');
  svg.appendChild(route);

  // 章节热点
  const HOT = [
    { i: 0, x: 200, z: -560 }, { i: 1, x: 55, z: -590 }, { i: 2, x: -10, z: -460 },
    { i: 3, x: -78, z: -350 }, { i: 4, x: -80, z: -280 }, { i: 5, x: -140, z: -40 },
    { i: 6, x: -90, z: 360 }, { i: 7, x: 40, z: -160 },
  ];
  const hotEls = [];
  for (const h of HOT) {
    const gEl = document.createElementNS(ns, 'g');
    gEl.setAttribute('class', 'map-hot');
    gEl.addEventListener('click', () => onJump(h.i));
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', wx(h.x)); c.setAttribute('cy', wz(h.z)); c.setAttribute('r', 11);
    gEl.appendChild(c);
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', wx(h.x)); t.setAttribute('y', wz(h.z) - 15);
    t.setAttribute('text-anchor', 'middle');
    t.textContent = CHAPTERS[h.i].title.split(' · ')[0];
    gEl.appendChild(t);
    svg.appendChild(gEl);
    hotEls.push(gEl);
  }

  // 相机标记
  const marker = document.createElementNS(ns, 'g');
  const mk = document.createElementNS(ns, 'circle');
  mk.setAttribute('r', 5);
  mk.setAttribute('class', 'map-marker');
  marker.appendChild(mk);
  svg.appendChild(marker);

  root.appendChild(svg);
  return {
    svg, marker,
    update(camX, camZ, chapterIndex) {
      mk.setAttribute('cx', wx(Math.max(-1000, Math.min(1000, camX))));
      mk.setAttribute('cy', wz(Math.max(-1000, Math.min(1000, camZ))));
      hotEls.forEach((el, i) => el.classList.toggle('active', i === chapterIndex));
    },
  };
}
