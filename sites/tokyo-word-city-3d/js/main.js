// 入口：装载瓦片索引 → 初始化世界 → 初始机位 → 接线 UI → 演出模式。
import { World } from './world.js';
import { setupUI, wireCanvas } from './ui.js';
import { runShow } from './show.js';
import { parseHash } from './geo.js';
import { updateWanted, getMeta } from './tiles.js';

const loadMsg = document.getElementById('loadMsg');
const setLoad = (t) => { loadMsg.textContent = t; };
const loadErr = (t) => {
  loadMsg.classList.add('err');
  loadMsg.innerHTML = `${t}<br><button type="button" class="more-btn" id="loadRetry">再试一次</button>`;
  document.getElementById('loadRetry').onclick = () => location.reload();
};

async function main() {
  const world = new World();
  setLoad('正在铺开街市…');
  await world.init(document.getElementById('stage'));
  const meta = getMeta();

  const ui = setupUI(world);
  wireCanvas(world, ui);
  window.__world = world; // 调试句柄（开发期用）
  window.__ui = ui;

  // 初始机位：?town= → hash → 默认新桥（与原站示例机位同参数）
  const params = new URLSearchParams(location.search);
  const hash = parseHash();
  const townName = params.get('town');
  const town = townName && meta.towns.find((t) => t.n === townName);
  if (town) {
    world.orbit.setState(town.lat, town.lon, 420, 0.58, 0.85);
    document.getElementById('town').value = town.n;
  } else if (hash) {
    world.orbit.setState(hash.lat, hash.lon, hash.dist, hash.el, hash.az);
  } else {
    // 开幕机位：俯瞰词之海与光点路网
    const t0 = meta.towns[0];
    world.orbit.setState(t0.lat, t0.lon, 480, 0.58, 0.9);
  }
  updateWanted(world.orbit.target.x, world.orbit.target.y);

  // 首批瓦片落地 → 揭幕
  let revealed = false;
  world.onFirstTiles = () => {
    if (revealed) return;
    revealed = true;
    setLoad('');
    const loading = document.getElementById('loading');
    loading.classList.add('gone');
    setTimeout(() => loading.remove(), 1200);
    if (params.get('show')) runShow(world, ui);
  };
  // 兜底：8 秒还没进场景就提示刷新
  setTimeout(() => {
    if (!revealed) setLoad('街区数据还在路上…（网络较慢时第一次要等一会儿）');
  }, 8000);
}

main().catch((e) => {
  console.error(e);
  loadErr(`进不了街市：${e.message}`);
});
