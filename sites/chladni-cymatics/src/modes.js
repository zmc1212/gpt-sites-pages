/* modes.js — 方形薄板克拉尼模式:解析板形、共振频率梯与连续插值
 *
 * 板形函数  f(u,v;m,n) = cos(πm·u)·cos(πn·v) − cos(πn·u)·cos(πm·v),  u,v ∈ [0,1]
 * 节线即 f=0 的等值线,沙粒在此聚集;中心 (0.5,0.5) 恒为节线,与中央螺栓相容。
 *
 * 薄板弯曲共振频率近似 f ∝ (m²+n²)。取 C=69 Hz,使最低非简并模式 (1,2)→345 Hz、
 * 最高收录 (6,7)→5865 Hz,与原作的 345–5907 Hz 频段基本一致。
 *
 * 频率落在相邻两个共振之间时,对 (m,n) 做连续插值(smoothstep)→ 花纹随旋钮
 * 连续变形;t=0/1 恰为纯共振,|cos(πt)| 作为共振强度包络(纯共振处沙粒最"欢")。 */
(function () {
  'use strict';
  const CH = (window.CH = window.CH || {});

  // ---- 共享常量(场景 / 沙粒 / 热图统一使用) ----
  CH.CFG = {
    PLATE: 1.44,     // 板边长(世界单位)
    PLATE_TOP: 0.98, // 板面(上表面)高度
    SAND_Y: 0.988,   // 沙粒悬浮高度(略高于板面与热图平面)
  };

  const C = 69;        // Hz / (m²+n²)
  const SUM_MAX = 86;  // 收录 m²+n² ≤ 86 的全部模式(最高 (6,7)=85)

  // 共振梯:m ≤ 8 且 m>n≥1 且 m²+n² ≤ SUM_MAX,按频率排序(同频按 n、m)
  const ladder = [];
  for (let m = 2; m <= 8 && m * m + 1 <= SUM_MAX; m++)
    for (let n = 1; n < m && m * m + n * n <= SUM_MAX; n++)
      ladder.push({ m, n, freq: C * (m * m + n * n) });
  ladder.sort((a, b) => a.freq - b.freq || a.n - b.n || a.m - b.m);

  const F_MIN = ladder[0].freq, F_MAX = ladder[ladder.length - 1].freq;

  // 复用对象,避免每帧分配
  const modes = { m: 1, n: 2, lo: ladder[0], hi: ladder[1], t: 0, env: 1 };

  /** 频率 → 连续模式参数 {m, n, lo, t, env}。lo 为频率下方最近的整数共振。 */
  function modesAt(freq) {
    let f = freq;
    if (f < F_MIN) f = F_MIN; else if (f > F_MAX) f = F_MAX;
    let i = 0;
    while (i < ladder.length - 2 && ladder[i + 1].freq < f) i++;
    const a = ladder[i], b = ladder[i + 1];
    let t = 0;
    if (b.freq > a.freq) {
      t = (f - a.freq) / (b.freq - a.freq);
      if (t < 0) t = 0; else if (t > 1) t = 1;
      t = t * t * (3 - 2 * t); // smoothstep:在纯共振附近停留更久
    }
    modes.m = a.m + (b.m - a.m) * t;
    modes.n = a.n + (b.n - a.n) * t;
    modes.lo = a;
    modes.hi = b;
    modes.t = t;
    modes.env = Math.abs(Math.cos(Math.PI * t));
    return modes;
  }

  /** 板形函数(场景顶点位移与热图使用,调用频率低,不追求零分配)。 */
  function shape(u, v, m, n) {
    const pm = Math.PI * m, pn = Math.PI * n;
    return Math.cos(pm * u) * Math.cos(pn * v) - Math.cos(pn * u) * Math.cos(pm * v);
  }

  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  /** 最近十二平均律音名,如 "F#6"。 */
  function noteName(freq) {
    const n = Math.round(Math.log2(freq / 440) * 12) + 69; // MIDI 编号
    return NOTE_NAMES[((n % 12) + 12) % 12] + (Math.floor(n / 12) - 1);
  }

  CH.C = C;
  CH.ladder = ladder;
  CH.F_MIN = F_MIN;
  CH.F_MAX = F_MAX;
  CH.modesAt = modesAt;
  CH.shape = shape;
  CH.noteName = noteName;
})();
