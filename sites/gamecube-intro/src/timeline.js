// 动画时间轴:总长 7.117s(与原作一致)。节拍结构:
//   0.00-0.30  小方块从画面右上自由落体,砸在大立方顶面
//   0.30-3.55  沿格点路线翻滚 18 格(每格 = 一个 90° 滚转 + 一次小跳),
//              途经 15 个残影点依次点亮;大立方在开场闪现一次后隐去
//   3.55-4.15  大跳跃:抛物线跃向 dock 点,空中翻滚,落定成 180°Y
//   4.07-4.80  GAMECUBE 字标 5 层深度回声式弹入;NINTENDO 字母逐字渐显;
//              大立方第二次闪光
//   4.75-5.25  交叉淡变:小方块/残影淡出,三块 G 标志面淡入
//   5.25-7.12  定格:G 标志 + 双行字标
window.GC = window.GC || {};
GC.timeline = (function () {
  'use strict';

  const CELL = 128 / 3;
  const DUR = 7.1167;
  const HOP = 8.5;      // 每格小跳高度
  const ROLL_TOP = 64 + CELL / 2;    // 顶面滚转时的中心高度 85.33
  const ROLL_LEFT = -(64 + CELL / 2); // 左面(x=-64)滚转时的中心 x
  const ROLL_FRONT = 64 + CELL / 2;   // 前面(z=64)滚转时的中心 z

  // 滚转路线(大立方中心为原点,半边长 64):
  // 每段:起止时刻 / 起点自动接上一段终点 / 方向 / 格数 / 滚转轴(世界系) / 跳跃方向
  // 轴 = 面法线 × 行进方向,每格转 90° —— 格长 = 边长,物理上精确。
  const LEGS = [
    { t0: 0.30, t1: 0.75, dir: [0, 0, -1], cells: 2, axis: [-1, 0, 0], hop: [0, 1, 0], p0: [CELL, ROLL_TOP, CELL] },
    { t0: 0.75, t1: 1.25, dir: [-1, 0, 0], cells: 3, axis: [0, 0, 1], hop: [0, 1, 0] },
    { t0: 1.25, t1: 1.75, dir: [0, -1, 0], cells: 3, axis: [0, 0, 1], hop: [-1, 0, 0] },
    { t0: 1.75, t1: 2.30, dir: [0, 0, 1], cells: 3, axis: [0, 1, 0], hop: [-1, 0, 0] },
    { t0: 2.30, t1: 2.80, dir: [1, 0, 0], cells: 3, axis: [0, 1, 0], hop: [0, 0, 1] },
    { t0: 2.80, t1: 3.30, dir: [0, 1, 0], cells: 2, axis: [-1, 0, 0], hop: [0, 0, 1] },
    { t0: 3.30, t1: 3.55, dir: [-1, 0, 0], cells: 2, axis: [0, -1, 0], hop: [0, 0, 1] },
  ];

  const P_LAND = [CELL, ROLL_TOP, CELL];
  const P_DOCK = [-34, 34, 34];
  const LEAP_T0 = 3.55, LEAP_T1 = 4.15;
  const LEAP_FROM = [-42.667, 42.667, 85.333];
  const LEAP_H = 128; // 跳跃抛物线峰高
  const Q_DOCK = new THREE.Quaternion(0, -1, 0, 0); // 落定姿态(与原作一致)

  // 残影点(沿路线的格点,与原作布局一致)
  const TRAILS = [
    [42.667, 64, 0], [42.667, 64, -42.667], [0, 64, -42.667], [-42.667, 64, -42.667],
    [-64, 42.667, -42.667], [-64, 0, -42.667], [-64, -42.667, -42.667],
    [-64, -42.667, 0], [-64, -42.667, 42.667],
    [-42.667, -42.667, 64], [0, -42.667, 64], [42.667, -42.667, 64],
    [42.667, 0, 64], [42.667, 42.667, 64],
    [0, 42.667, 64],
  ];
  // 残影点亮时刻(小方块途经该点的时刻,由上面的格子推算)
  const TRAIL_REVEAL = [0.515, 0.75, 0.917, 1.083, 1.417, 1.583, 1.75, 1.933, 2.117, 2.467, 2.633, 2.8, 3.05, 3.3, 3.425];

  // ---------- 工具 ----------
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const easeInOutSine = (f) => (1 - Math.cos(Math.PI * f)) / 2;
  const easeOutCubic = (f) => 1 - Math.pow(1 - f, 3);

  // 分段线性包络
  function env(t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (t <= b[0]) return a[1] + ((b[1] - a[1]) * (t - a[0])) / (b[0] - a[0]);
    }
    return keys[keys.length - 1][1];
  }

  // 平滑关键帧插值(相邻键之间用余弦缓动,供字标弹簧曲线用)
  function smoothKeys(t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (t <= b[0]) {
        const f = (t - a[0]) / (b[0] - a[0]);
        return a[1] + (b[1] - a[1]) * easeInOutSine(f);
      }
    }
    return keys[keys.length - 1][1];
  }

  // ---------- 预计算滚转关键帧 ----------
  // cells[i] = { t0, t1, p0, p1, axis, hop, qStart, qEnd }
  const CELLS = [];
  {
    const q = new THREE.Quaternion();
    let prevEnd = P_LAND.slice();
    for (const leg of LEGS) {
      const p = prevEnd.slice();
      const step = [leg.dir[0] * CELL, leg.dir[1] * CELL, leg.dir[2] * CELL];
      const dt = (leg.t1 - leg.t0) / leg.cells;
      const axisV = new THREE.Vector3().fromArray(leg.axis).normalize();
      const quarter = new THREE.Quaternion().setFromAxisAngle(axisV, Math.PI / 2);
      for (let c = 0; c < leg.cells; c++) {
        const p1 = [p[0] + step[0], p[1] + step[1], p[2] + step[2]];
        const qEnd = q.clone().premultiply(quarter);
        CELLS.push({
          t0: leg.t0 + c * dt, t1: leg.t0 + (c + 1) * dt,
          p0: p.slice(), p1, hop: leg.hop,
          axis: axisV.clone(), qStart: q.clone(), qEnd,
        });
        p[0] += step[0]; p[1] += step[1]; p[2] += step[2];
        q.copy(qEnd);
      }
      prevEnd = p;
    }
  }

  const _q = new THREE.Quaternion();
  const _axis = new THREE.Vector3();
  const _pos = new THREE.Vector3();

  // t 时刻小方块状态:位置 + 姿态
  function cubeStateAt(t, outPos, outQuat) {
    if (t < 0.30) {
      // 自由落体(easeIn 加速)
      const f = clamp01(t / 0.30);
      const yy = 149.6 + (ROLL_TOP - 149.6) * (f * f);
      outPos.set(CELL, yy, CELL);
      outQuat.identity();
      return;
    }
    if (t < LEAP_T0) {
      for (const c of CELLS) {
        if (t >= c.t0 && t < c.t1) {
          const f = clamp01((t - c.t0) / (c.t1 - c.t0));
          const e = easeInOutSine(f);
          outPos.set(
            c.p0[0] + (c.p1[0] - c.p0[0]) * e,
            c.p0[1] + (c.p1[1] - c.p0[1]) * e,
            c.p0[2] + (c.p1[2] - c.p0[2]) * e,
          );
          outPos.x += c.hop[0] * HOP * Math.sin(Math.PI * f);
          outPos.y += c.hop[1] * HOP * Math.sin(Math.PI * f);
          outPos.z += c.hop[2] * HOP * Math.sin(Math.PI * f);
          // 本格滚转:绕世界轴从 0 -> 90°(格长 = 边长,物理精确)
          _q.setFromAxisAngle(c.axis, (Math.PI / 2) * e);
          outQuat.copy(_q).multiply(c.qStart);
          return;
        }
      }
      outPos.fromArray(P_LAND);
      outQuat.identity();
      return;
    }
    if (t < LEAP_T1) {
      const f = clamp01((t - LEAP_T0) / (LEAP_T1 - LEAP_T0));
      // 水平:z 快出( easeOut ),x 带过冲后回正
      const z = 85.333 + (34 - 85.333) * easeOutCubic(f);
      const xKeys = [[0, -42.667], [0.3, -18], [0.55, -31], [1, -34]];
      const x = smoothKeys(f, xKeys);
      const y = 42.667 + (34 - 42.667) * f + LEAP_H * Math.pow(Math.sin(Math.PI * f), 1.1);
      outPos.set(x, y, z);
      // 空中翻滚:前 40% 顺行进方向再翻 90°,后段收敛到落定姿态
      const qStart = CELLS[CELLS.length - 1].qEnd;
      if (f < 0.4) {
        const g = f / 0.4;
        _q.setFromAxisAngle(_axis.set(-1, 0, 0), (Math.PI / 2) * easeOutCubic(g));
        outQuat.copy(_q).multiply(qStart);
      } else {
        _q.setFromAxisAngle(_axis.set(-1, 0, 0), Math.PI / 2);
        const qMid = _q.clone().multiply(qStart);
        const g = easeInOutSine((f - 0.4) / 0.6);
        outQuat.copy(qMid).slerp(Q_DOCK, g);
      }
      return;
    }
    outPos.fromArray(P_DOCK);
    outQuat.copy(Q_DOCK);
  }

  // ---------- 字标弹簧曲线 ----------
  // GAMECUBE 字标层:z 从 -41.7 弹到 0(过冲 +2.6 再回稳),实测节奏拟合
  const LAYER_Z_KEYS = [[0, -41.7], [0.12, -19], [0.24, -4.5], [0.34, 2.6], [0.46, 0.8], [0.58, -1.2], [0.72, -0.3], [0.9, 0]];
  const LAYER_T0 = 4.07, LAYER_STAG = 0.045;

  // ---------- 逐帧应用 ----------
  function applyTime(t, rig) {
    // 小方块
    cubeStateAt(t, _pos, _q);
    rig.movingCube.position.copy(_pos);
    rig.movingCube.quaternion.copy(_q);
    rig.gxUniforms.uOpacity.value = env(t, [[0, 1], [4.55, 1], [5.25, 0]]);

    // 大立方两次闪光(×0.55 = 半透玻璃)
    const flash = env(t, [[0, 0], [0.08, 0], [0.12, 1], [0.22, 0.9], [1.0, 0], [4.2, 0], [4.26, 1], [5.25, 0], [DUR, 0]]);
    rig.bigCube.material.opacity = flash * 0.55;

    // 残影:个体点亮 + 全体随小方块淡出
    const trailFade = env(t, [[0, 1], [4.55, 1], [5.25, 0]]);
    for (let i = 0; i < rig.trails.length; i++) {
      const tr = rig.trails[i];
      tr.mesh.position.fromArray(TRAILS[i]);
      tr.mesh.position.x += -0.01; tr.mesh.position.y += 0.01; tr.mesh.position.z += 0.01; // 防 z-fighting
      const on = clamp01((t - (TRAIL_REVEAL[i] - 0.08)) / 0.2);
      tr.mat.opacity = on * trailFade;
    }

    // G 标志三面:交叉淡入
    const logoOn = env(t, [[0, 0], [4.72, 0], [5.25, 1]]);
    for (const f of rig.logoFaces) f.mat.opacity = logoOn;

    // GAMECUBE 字标 5 层:错峰弹簧弹入
    for (let i = 0; i < rig.gamecubeLayers.length; i++) {
      const l = rig.gamecubeLayers[i];
      const t0 = LAYER_T0 + i * LAYER_STAG;
      const tau = t - t0;
      l.mesh.position.z = tau <= 0 ? -41.7 : smoothKeys(tau, LAYER_Z_KEYS);
      l.mat.opacity = clamp01((t - (t0 - 0.14)) / 0.2);
    }

    // NINTENDO 字母:逐字渐显 + 轻微上浮
    for (let i = 0; i < rig.nintendoLetters.length; i++) {
      const nl = rig.nintendoLetters[i];
      const t0 = 4.22 + i * 0.035;
      const f = clamp01((t - t0) / 0.26);
      const e = easeInOutSine(f);
      const o = e;
      nl.front.opacity = o;
      nl.back.opacity = o;
      nl.frontMesh.position.y = -5 * (1 - e);
      nl.backMesh.position.y = -5 * (1 - e);
    }
  }

  // 构建期即完成预计算(CELLS 已含 qEnd,无需额外步骤)

  return { DUR, applyTime, TRAILS, P_DOCK };
})();
