// 地理投影与 URL hash。本地米制坐标（x 东、y 北）↔ 经纬度 ↔ 场景坐标（x 东、z 北为负）。
// hash 语义与原站一致：#纬度,经度,距离,高度角(rad),方位角(rad)

export let ORIGIN = [35.66, 139.753]; // 由 index.js 注入后设置
export let KX = 1, KY = 1;

export function setOrigin(lat0, lon0) {
  ORIGIN = [lat0, lon0];
  KX = 111320 * Math.cos((lat0 * Math.PI) / 180);
  KY = 110946;
}

export const project = (lat, lon) => [(lon - ORIGIN[1]) * KX, (lat - ORIGIN[0]) * KY];
export const unproject = (x, y) => [ORIGIN[0] + y / KY, ORIGIN[1] + x / KX];

// 场景坐标：北为 -z
export const toScene = (x, y) => [x, -y];
export const fromScene = (sx, sz) => [sx, -sz];

// ---- hash ----
export function parseHash() {
  const parts = location.hash.slice(1).split(',').map(Number);
  if (parts.length >= 2 && parts.every(Number.isFinite) && parts[0] > 20 && parts[0] < 46) {
    return { lat: parts[0], lon: parts[1], dist: parts[2] || undefined, el: parts[3] ?? undefined, az: parts[4] ?? undefined };
  }
  return null;
}

export function writeHash(lat, lon, dist, el, az) {
  const url = new URL(location.href);
  url.searchParams.delete('town');
  url.hash = `${lat.toFixed(5)},${lon.toFixed(5)},${Math.round(dist)},${el.toFixed(2)},${az.toFixed(2)}`;
  history.replaceState(null, '', url);
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
