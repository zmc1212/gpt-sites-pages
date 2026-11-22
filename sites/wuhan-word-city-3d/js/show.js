// 演出：?show=1 的自动运镜导览（约 40 秒，可跳过）。
const CAP = (t) => `<div class="cap-in">${t}</div>`;

export function runShow(world, ui) {
  document.body.classList.add('show');
  ui.closeDrawer();
  world.orbit.enabled = false;

  const center = world.meta.towns[0];

  // 时间线：每段 {at(ms), dx,dy(相对街区中心的位移), dist, el, az, ms, cap}
  const SEG = [
    { at: 400,    dx: 0,   dy: 0,   dist: 1600, el: 1.42, az: 2.3,  ms: 7000, cap: '俯瞰武汉三镇。词语贴在长江两岸的楼与路上。' },
    { at: 7600,   dx: 60,  dy: 40,  dist: 700,  el: 0.95, az: 1.9,  ms: 6500, cap: '金色的字，是这条街说给路人的话。' },
    { at: 14300,  dx: 130, dy: 90,  dist: 55,   el: 0.2,  az: 2.6,  ms: 7000, cap: '降到街面 — 过早摊、轮渡码头、热干面香……' },
    { at: 21500,  dx: 190, dy: 140, dist: 40,   el: 0.18, az: 3.3,  ms: 7000, cap: '每一个词，都是这座城市长出来的记忆。' },
    { at: 28700,  dx: 90,  dy: 70,  dist: 340,  el: 0.72, az: 4.3,  ms: 7000, cap: '拉起来，再看一眼长江。' },
    { at: 35900,  dx: 0,   dy: 0,   dist: 1000, el: 1.3,  az: 5.2,  ms: 7600, cap: '—— 词语筑成的街 · 武汉' },
  ];
  const END = 44000;

  const capBox = document.createElement('div');
  capBox.id = 'cap';
  document.body.append(capBox);
  const skip = document.createElement('button');
  skip.id = 'showSkip';
  skip.textContent = '跳过演出';
  document.body.append(skip);

  let done = false;
  const timers = [];
  const finish = () => {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    capBox.remove();
    skip.remove();
    document.body.classList.remove('show');
    world.orbit.enabled = true;
    const url = new URL(location.href);
    url.searchParams.delete('show');
    history.replaceState(null, '', url);
  };

  for (const s of SEG) {
    timers.push(setTimeout(() => {
      world.orbit.flyTo(center.x + s.dx, center.y + s.dy, s.dist, s.el, s.az, s.ms);
      if (s.cap) capBox.innerHTML = CAP(s.cap);
    }, s.at));
  }
  // 字幕渐隐
  for (const s of SEG) {
    if (s.cap) timers.push(setTimeout(() => { capBox.innerHTML = ''; }, s.at + s.ms - 600));
  }
  timers.push(setTimeout(finish, END));
  skip.addEventListener('click', finish);
}
