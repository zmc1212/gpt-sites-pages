// 瓦片注册与按需加载。瓦片以 <script> 注入（HTTP 与 file:// 同一条路径）：
//   dist/tiles/index.js  → reg("i", 元数据)
//   dist/tiles/t/x_y.js  → reg("t","x_y", 数据)
// 三个回调：onMeta / onTile / onStats（加载完成/卸载后回调刷新统计）。

const REG = { i: null, t: new Map() };
window.__ktReg = (kind, key, data) => {
  // index 是两参调用 __ktReg("i", meta)；瓦片是三参 __ktReg("t", key, data)
  if (kind === 'i') REG.i = data ?? key;
  else if (kind === 't') REG.t.set(key, data);
};

let onMetaCb = null, onTileCb = null, onStatsCb = null;
export function setCallbacks({ onMeta, onTile, onStats }) {
  onMetaCb = onMeta; onTileCb = onTile; onStatsCb = onStats;
}

const injected = new Set();
const failed = new Set();
let pending = [];      // [{key, dist}]
let active = 0;
const MAX_ACTIVE = 5;
let meta = null;

export function getMeta() { return meta; }
export function getTile(key) { return REG.t.get(key) || null; }
export const loadedCount = () => REG.t.size;

function loadMeta() {
  if (REG.i) return Promise.resolve(REG.i);
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'tiles/index.js';
    s.onload = () => setTimeout(() => (REG.i ? res(REG.i) : rej(new Error('index.js 未注册数据'))), 0);
    s.onerror = () => rej(new Error('无法加载 tiles/index.js'));
    document.head.append(s);
  });
}

function injectTile(key) {
  if (injected.has(key)) return;
  injected.add(key);
  active++;
  const s = document.createElement('script');
  s.src = `tiles/t/${key}.js`;
  const done = (ok) => {
    active--;
    if (ok) {
      const data = REG.t.get(key);
      if (data && onTileCb) onTileCb(key, data);
      if (onStatsCb) onStatsCb();
    } else {
      failed.add(key);
      console.warn('瓦片加载失败:', key);
    }
    pump();
  };
  s.onload = () => done(true);
  s.onerror = () => done(false);
  document.head.append(s);
}

function pump() {
  if (!meta) return;
  pending = pending.filter((p) => !injected.has(p.key));
  while (active < MAX_ACTIVE && pending.length) {
    const p = pending.shift();
    injectTile(p.key);
  }
}

// 相机目标点（本地米制坐标）附近的瓦片进出队列
export function updateWanted(x, y, radiusIn = 950, radiusOut = 1500) {
  if (!meta) return;
  const T = meta.tile;
  const tx = Math.floor(x / T), ty = Math.floor(y / T);
  const list = [];
  for (const [key, tx0, ty0] of meta.tiles) {
    const cx = (tx0 + 0.5) * T, cy = (ty0 + 0.5) * T;
    const d = Math.hypot(cx - x, cy - y);
    if (d < radiusIn) list.push({ key, d, tx: tx0, ty: ty0 });
  }
  // 近的优先；已注入的不重复排队
  pending = list.sort((a, b) => a.d - b.d).filter((p) => !injected.has(p.key));
  pump();
  // 卸载远瓦片（释放几何与纹理）
  for (const [key] of REG.t) {
    const t = meta.tiles.find((row) => row[0] === key);
    if (!t) continue;
    const cx = (t[1] + 0.5) * T, cy = (t[2] + 0.5) * T;
    if (Math.hypot(cx - x, cy - y) > radiusOut && onTileCb) {
      REG.t.delete(key);
      onTileCb(key, null); // null = 卸载
      if (onStatsCb) onStatsCb();
    }
  }
}

export async function boot() {
  meta = await loadMeta();
  if (onMetaCb) onMetaCb(meta);
  return meta;
}
