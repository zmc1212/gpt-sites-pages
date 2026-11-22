// 地图视图:SVG 俯视示意图(土楼群/茶山、导览路线、章节跳转、相机标记)
import { LAYOUT } from './config.js';
import { CHAPTERS } from './chapters.js';

const VW = 560, VH = 400, SC = 0.6, CX = -60, CZ = 0;
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

  // 茶山意象环
  for (const [dx, dz, rr] of [[120, -160, 70], [180, 60, 64], [60, 180, 58], [-60, -200, 62], [-260, 180, 60], [40, 240, 56], [-300, -80, 58]]) {
    circle(dx, dz, rr, 'map-hill');
  }

  // 主楼三环
  circle(LAYOUT.main.x, LAYOUT.main.z, LAYOUT.main.outerR, 'map-land');
  circle(LAYOUT.main.x, LAYOUT.main.z, LAYOUT.main.midR, 'map-land');
  circle(LAYOUT.main.x, LAYOUT.main.z, LAYOUT.main.innerR, 'map-bldg');
  label(LAYOUT.main.x, LAYOUT.main.z + LAYOUT.main.outerR + 12, '主楼(承启意象)');
  // 群楼
  for (const c of LAYOUT.cluster) {
    if (c.oval) {
      const e = document.createElementNS(ns, 'ellipse');
      e.setAttribute('cx', wx(c.x)); e.setAttribute('cy', wz(c.z));
      e.setAttribute('rx', c.rx * SC); e.setAttribute('ry', c.rz * SC);
      e.setAttribute('class', 'map-land');
      svg.appendChild(e);
    } else {
      circle(c.x, c.z, c.r, 'map-land');
    }
  }
  label(-155, 110, '四菜一汤');

  // 导览路线
  const route = document.createElementNS(ns, 'polyline');
  const pts = [];
  CHAPTERS.forEach((c) => c.kfs.forEach((kf) => pts.push(`${wx(kf.p[0])},${wz(kf.p[2])}`)));
  route.setAttribute('points', pts.join(' '));
  route.setAttribute('class', 'map-route');
  svg.appendChild(route);

  // 章节热点
  const HOT = [
    { i: 0, x: 200, z: -220 }, { i: 1, x: 16, z: -60 }, { i: 2, x: 26, z: 12 },
    { i: 3, x: 0, z: 0 }, { i: 4, x: 24, z: -12 }, { i: 5, x: -26, z: 8 },
    { i: 6, x: -152, z: 30 }, { i: 7, x: -60, z: 16 },
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
      mk.setAttribute('cx', wx(Math.max(-500, Math.min(500, camX))));
      mk.setAttribute('cy', wz(Math.max(-400, Math.min(400, camZ))));
      hotEls.forEach((el, i) => el.classList.toggle('active', i === chapterIndex));
    },
  };
}
