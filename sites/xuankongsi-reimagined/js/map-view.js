// 地图视图:SVG 俯视示意图(峡谷/崖壁/悬寺、导览路线、章节跳转、相机标记)
import { LAYOUT } from './config.js';
import { CHAPTERS } from './chapters.js';

const VW = 560, VH = 400, SC = 0.55, CX = 60, CZ = 10;
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
    c.setAttribute('r', r * SC);
    c.setAttribute('class', cls);
    svg.appendChild(c);
    return c;
  };
  const label = (x, z, text, cls = 'map-label') => {
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', wx(x)); t.setAttribute('y', wz(z) + 4);
    t.setAttribute('class', cls);
    t.textContent = text;
    svg.appendChild(t);
    return t;
  };

  // 峡谷意象(两岸山环)
  for (const [dx, dz, rr] of [[140, -120, 60], [220, 40, 64], [180, 180, 58], [60, 220, 56], [40, -190, 58], [280, 110, 58]]) {
    circle(dx, dz, rr, 'map-hill');
  }
  // 崖壁
  const cliff = document.createElementNS(ns, 'rect');
  cliff.setAttribute('x', wx(-70)); cliff.setAttribute('y', wz(LAYOUT.cliff.z1));
  cliff.setAttribute('width', 70 * SC); cliff.setAttribute('height', (LAYOUT.cliff.z1 - LAYOUT.cliff.z0) * SC);
  cliff.setAttribute('class', 'map-cliff');
  svg.appendChild(cliff);
  // 溪流
  const stream = document.createElementNS(ns, 'line');
  stream.setAttribute('x1', wx(26)); stream.setAttribute('y1', wz(-160));
  stream.setAttribute('x2', wx(26)); stream.setAttribute('y2', wz(160));
  stream.setAttribute('class', 'map-water-line');
  svg.appendChild(stream);
  // 悬寺(栈道 + 殿)
  const temple = document.createElementNS(ns, 'rect');
  temple.setAttribute('x', wx(-9)); temple.setAttribute('y', wz(48));
  temple.setAttribute('width', 13 * SC); temple.setAttribute('height', 96 * SC);
  temple.setAttribute('class', 'map-bldg');
  svg.appendChild(temple);
  label(-30, 40, '悬空寺');
  label(-45, -120, '翠屏峰');
  label(120, 120, '金龙峡');

  // 导览路线
  const route = document.createElementNS(ns, 'polyline');
  const pts = [];
  CHAPTERS.forEach((c) => c.kfs.forEach((kf) => pts.push(`${wx(kf.p[0])},${wz(kf.p[2])}`)));
  route.setAttribute('points', pts.join(' '));
  route.setAttribute('class', 'map-route');
  svg.appendChild(route);

  // 章节热点
  const HOT = [
    { i: 0, x: 170, z: -80 }, { i: 1, x: 40, z: -4 }, { i: 2, x: 2, z: -18 },
    { i: 3, x: -4, z: 18 }, { i: 4, x: -6, z: 38 }, { i: 5, x: -2, z: 10 },
    { i: 6, x: 160, z: 160 }, { i: 7, x: 110, z: 120 },
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
      mk.setAttribute('cx', wx(Math.max(-300, Math.min(420, camX))));
      mk.setAttribute('cy', wz(Math.max(-300, Math.min(300, camZ))));
      hotEls.forEach((el, i) => el.classList.toggle('active', i === chapterIndex));
    },
  };
}
