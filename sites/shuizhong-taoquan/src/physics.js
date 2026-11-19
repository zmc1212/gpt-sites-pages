/* physics.js — 圆环水体物理:微沉浮力 + 喷流力场 + 圆角矩形容器碰撞 + 套柱状态机
 *
 * 简化模型(与真实玩具一致的行为,不追求数值精确):
 *  - 圆环静止时缓慢下沉(塑料略重于水),落到腔底轻轻堆积;
 *  - 按按钮 → 左/右下角喷口 0.42 s 冲量脉冲,沿喷口方向把圆环抛起,附随机湍流与翻滚;
 *  - 圆环接近立柱顶端且接近水平时,水流"导流"辅助对中(小引力 + 回正力矩),进入孔位即套上;
 *  - 套上的环沿柱轴滑到底部堆叠;柱顶的环被高压喷流连续冲击会累积应力被顶出(手太猛会前功尽弃)。
 */
(function () {
  'use strict';
  const WT = (window.WT = window.WT || {});
  const T = WT.geom;

  const V3 = () => new THREE.Vector3();
  const _acc = V3(), _tmp = V3(), _ray = V3(), _dir = V3(), _axis = V3(), _tor = V3();

  // ---- 参数(场景单位:水腔半高 2.0 ≈ 真实玩具 ~8 cm) ----
  const P = {
    sink: 0.62,          // 静水净下沉加速度
    dragK: 2.05,         // 线性水阻(速度)
    angK: 2.7,           // 角阻尼
    flatK: 0.55,         // 水平回正力矩(平放阻力和浮心让环爱躺平)
    jetJ: 22,            // 喷流峰值加速度
    jetLen: 3.1,         // 喷流有效射程
    jetSpread: 0.52,     // 喷流近端扩散半径
    turb: 2.6,           // 湍流随机加速度
    pulseT: 0.42,        // 单次脉冲时长
    holdGap: 0.5,        // 按住时脉冲间隔
    rest: 0.38,          // 碰壁恢复系数
    ringSphere: 0.44,    // 环-环碰撞球半径
    capAxis: 0.21,       // 套柱判定:环心离柱轴距离(环孔 0.29 − 柱帽 0.075 余量)
    capTilt: 0.72,       // 套柱判定:环面法线与竖直夹角余弦
    capBand: 0.35,       // 判定带:柱顶上方/柱身范围内的竖直余量
    pegPush: 0.5,        // 未对齐的环被柱身推离的距离
    assistR: 0.5,        // 导流辅助半径
    assistPull: 2.6,     // 对中加速度
    assistTorque: 6.0,   // 回正力矩增益
    stackH: 0.26,        // 柱上叠环间距(管径 0.26)
    popStress: 1.0,      // 顶出应力阈值
    popGain: 6.5,        // 应力累积增益(仅柱顶环、喷流激活时)
    popDecay: 0.45,
  };
  WT.P = P;

  // ---- 圆角矩形容器 SDF(XY 平面圆角矩形,沿 Z 拉伸) ----
  // 返回 [d, nx, ny]:d<0 在腔内,(nx,ny) 为该点腔壁外法线(指向腔内为负方向)
  function chamberSDF(p) {
    const r = T.cornerR;
    const qx = Math.abs(p.x) - (T.halfX - r);
    const qy = Math.abs(p.y) - (T.halfY - r);
    const ax = Math.max(qx, 0), ay = Math.max(qy, 0);
    const outside = Math.hypot(ax, ay);
    const d = outside + Math.min(Math.max(qx, qy), 0) - r;
    let nx, ny;
    if (outside > 1e-9) {
      const il = 1 / outside;
      nx = ax * il * Math.sign(p.x); ny = ay * il * Math.sign(p.y);
    } else if (qx > qy) { nx = Math.sign(p.x); ny = 0; }
    else { nx = 0; ny = Math.sign(p.y); }
    return [d, nx, ny];
  }

  // 环在方向 u 上的支撑半径(准确):ext = R·sin(法线与 u 夹角) + 管半径
  function supportAlong(n, ux, uy, uz) {
    const c = n.x * ux + n.y * uy + n.z * uz;
    return T.ringR * Math.sqrt(Math.max(0, 1 - c * c)) + T.ringTube;
  }

  // 腔壁碰撞(支撑函数,凸腔精确):推回 + 反弹。返回是否碰撞。
  function wallCollide(r, restitution) {
    let hitAny = false;
    const p = r.pos, v = r.vel;
    // Z 直壁
    const extZ = supportAlong(r.axisN, 0, 0, 1);
    const zLim = T.halfZ - extZ;
    if (Math.abs(p.z) > zLim) {
      const s = Math.sign(p.z);
      p.z = zLim * s;
      const vn = v.z * s;
      if (vn > 0) v.z = -v.z * restitution;
      v.x *= 0.86; v.y *= 0.86;
      r.angVel.multiplyScalar(0.9);
      hitAny = true;
    }
    // XY 圆角壁
    const [d, nx, ny] = chamberSDF(p);
    const ext = supportAlong(r.axisN, nx, ny, 0);
    if (d > -ext) {
      const push = d + ext;
      p.x -= nx * push; p.y -= ny * push;
      const vn = v.x * nx + v.y * ny;
      if (vn > 0) {
        v.x -= (1 + restitution) * vn * nx;
        v.y -= (1 + restitution) * vn * ny;
        v.x *= 0.86; v.y *= 0.86;
        r.angVel.multiplyScalar(0.9);
      }
      hitAny = true;
    }
    return hitAny;
  }

  // ---- 喷流脉冲包络 ----
  function pulseEnv(age) {
    const t = Math.min(age / P.pulseT, 1);
    return Math.pow(Math.sin(Math.PI * t), 1.15);
  }

  // ---- Ring ----
  class Ring {
    constructor(color, idx) {
      this.idx = idx;
      this.pos = V3(); this.vel = V3();
      this.quat = new THREE.Quaternion();
      this.angVel = V3();
      this.state = 'free';
      this.peg = -1; this.stackIdx = 0; this.stress = 0;
      this.wobble = Math.random() * Math.PI * 2;
      this.axisN = V3();           // 环面法线(世界系),用于支撑函数碰撞
      this.buildMesh(color);
    }
    buildMesh(color) {
      const g = new THREE.TorusGeometry(T.ringR, T.ringTube, 22, 40);
      g.rotateX(Math.PI / 2); // 默认环面在 XY(法线 Z)→ 转为法线 Y:平放
      const m = new THREE.MeshPhysicalMaterial({
        color, roughness: 0.3, clearcoat: 0.85, clearcoatRoughness: 0.22,
        envMapIntensity: 0.55,
      });
      this.mesh = new THREE.Mesh(g, m);
      this.mesh.castShadow = true;
      this.mesh.renderOrder = 10;
    }
    reset(rng) {
      this.state = 'free';
      this.pos.set((rng() * 2 - 1) * 1.05, -1.3 + rng() * 1.6, (rng() * 2 - 1) * 0.38);
      this.vel.set((rng() * 2 - 1) * 0.5, (rng() * 2 - 1) * 0.4, (rng() * 2 - 1) * 0.3);
      this.quat.setFromEuler(new THREE.Euler(
        (rng() * 2 - 1) * 1.4, rng() * Math.PI * 2, (rng() * 2 - 1) * 1.4));
      this.angVel.set((rng() * 2 - 1) * 3, (rng() * 2 - 1) * 3, (rng() * 2 - 1) * 3);
      this.stress = 0; this.peg = -1; this.noCapT = 0;
    }
  }

  // ---- 引擎 ----
  class WaterPhysics {
    constructor(colors) {
      this.rings = colors.map((c, i) => new Ring(c, i));
      this.pulses = [];            // {side:'L'|'R', age}
      this.holding = { L: false, R: false };
      this.holdTimer = { L: 0, R: 0 };
      this.stacks = [0, 0];        // 每柱已套环数
      this.rng = Math.random;
      this.onCapture = null; this.onPop = null;   // 回调(main 接音效/计分)
      this.resetAll();
    }
    resetAll() {
      this.stacks = [0, 0];
      this.pulses.length = 0;
      for (const r of this.rings) r.reset(this.rng);
      this.resolveOverlaps(12);
    }
    press(side) {
      if (!this.pulses.some((p) => p.side === side && p.age < P.pulseT)) {
        this.pulses.push({ side, age: 0 });
        return true;   // 新脉冲(main 播喷水音/冒泡)
      }
      return false;
    }
    setHold(side, on) {
      this.holding[side] = on;
      if (on) { this.press(side); this.holdTimer[side] = P.holdGap; }
    }
    countCaptured() {
      return this.rings.reduce((n, r) => n + (r.state === 'peg' ? 1 : 0), 0);
    }

    step(dt) {
      // 脉冲推进 / 按住补发
      for (let i = this.pulses.length - 1; i >= 0; i--) {
        this.pulses[i].age += dt;
        if (this.pulses[i].age > P.pulseT) this.pulses.splice(i, 1);
      }
      for (const s of ['L', 'R']) {
        if (this.holding[s]) {
          this.holdTimer[s] -= dt;
          if (this.holdTimer[s] <= 0) { this.press(s); this.holdTimer[s] = P.holdGap; }
        }
      }

      for (const r of this.rings) {
        if (r.state === 'peg') this.stepPegged(r, dt);
        else this.stepFree(r, dt);
      }
      this.ringRingCollide();
      this.resolveOverlaps(2);
    }

    stepFree(r, dt) {
      _acc.set((this.rng() * 2 - 1) * 0.14, -P.sink, (this.rng() * 2 - 1) * 0.14);

      // 喷流(取最强一侧方向)
      const sL = this.jetSide(r.pos, 'L'), sR = this.jetSide(r.pos, 'R');
      let strength = 0, side = null;
      if (sL > 0 || sR > 0) { side = sL >= sR ? 'L' : 'R'; strength = Math.max(sL, sR); }
      if (side) {
        const nz = T.nozzle[side === 'L' ? 0 : 1];
        _dir.set(nz.dir[0], nz.dir[1], nz.dir[2]).normalize();
        _acc.addScaledVector(_dir, P.jetJ * strength);
        _acc.x += (this.rng() * 2 - 1) * P.turb * strength;
        _acc.y += (this.rng() * 2 - 1) * P.turb * strength * 0.6;
        _acc.z += (this.rng() * 2 - 1) * P.turb * strength * 0.8;
        // 翻滚力矩:方向 × 力 → 角速度扰动
        _axis.set(this.rng() - 0.5, this.rng() - 0.5, this.rng() - 0.5).cross(_dir);
        r.angVel.addScaledVector(_axis, 7.5 * strength * dt);
        r.jetSide = side; r.jetInf = strength;
      } else { r.jetSide = null; r.jetInf = 0; }

      // 导流辅助:接近柱顶且较平时,轻微对中 + 回正
      for (let pi = 0; pi < 2; pi++) {
        const px = pi === 0 ? -T.pegX : T.pegX;
        const axd = Math.hypot(r.pos.x - px, r.pos.z);
        const topY = T.pegBaseY + T.pegH;
        if (axd < P.assistR && r.pos.y > topY - 0.6 && r.pos.y < topY + 0.5) {
          const tilt = this.tiltCos(r);
          if (tilt > 0.5) {
            const k = 1 - axd / P.assistR;
            _acc.x += (px - r.pos.x) * P.assistPull * k;
            _acc.z += (0 - r.pos.z) * P.assistPull * k;
            // 回正力矩:当前法线 → 竖直
            _axis.set(0, 1, 0).applyQuaternion(r.quat);
            _tor.crossVectors(_axis, _tmp.set(0, 1, 0));
            r.angVel.addScaledVector(_tor, P.assistTorque * dt);
          }
        }
      }

      // 弱水平回正(水中平躺趋势)+ 积分
      _axis.set(0, 1, 0).applyQuaternion(r.quat);
      _tor.crossVectors(_axis, _tmp.set(0, 1, 0));
      r.angVel.addScaledVector(_tor, P.flatK * dt);
      r.vel.addScaledVector(_acc, dt);
      r.vel.multiplyScalar(Math.exp(-P.dragK * dt));
      r.pos.addScaledVector(r.vel, dt);
      r.angVel.multiplyScalar(Math.exp(-P.angK * dt));
      this.integrateQuat(r, dt);
      r.axisN.set(0, 1, 0).applyQuaternion(r.quat);

      // 边界(支撑函数精确腔壁)
      wallCollide(r, P.rest);

      // 立柱交互(推离 / 捕获)
      if (r.noCapT > 0) r.noCapT -= dt;
      this.pegInteract(r);
    }

    jetSide(pos, side) {
      let total = 0;
      const nz = T.nozzle[side === 'L' ? 0 : 1];
      _ray.set(pos.x - nz.x, pos.y - nz.y, pos.z - nz.z);
      _dir.set(nz.dir[0], nz.dir[1], nz.dir[2]).normalize();
      const proj = _ray.dot(_dir);
      if (proj < -0.1 || proj > P.jetLen) return 0;
      _tmp.copy(_dir).multiplyScalar(proj).sub(_ray);
      const lat = _tmp.length();
      const spread = P.jetSpread + 0.24 * Math.max(proj, 0);
      if (lat > spread) return 0;
      for (const p of this.pulses) {
        if (p.side !== side) continue;
        const env = pulseEnv(p.age);
        if (env <= 0) continue;
        const infl = env * (1 - Math.max(proj, 0) / P.jetLen) *
          (1 - (lat / spread) * (lat / spread));
        total += infl;
      }
      return Math.min(total, 1.35);
    }

    tiltCos(r) {
      _axis.set(0, 1, 0).applyQuaternion(r.quat);
      return _axis.y;
    }

    integrateQuat(r, dt) {
      // q̇ = ½ ω q(ω 世界系)
      const w = r.angVel, q = r.quat;
      const h = 0.5 * dt;
      const wx = w.x * h, wy = w.y * h, wz = w.z * h;
      const qx = q.x, qy = q.y, qz = q.z, qw = q.w;
      q.x += wx * qw + wy * qz - wz * qy;
      q.y += wy * qw + wz * qx - wx * qz;
      q.z += wz * qw + wx * qy - wy * qx;
      q.w += -wx * qx - wy * qy - wz * qz;
      q.normalize();
    }

    // 立柱交互:对齐(近水平)的环 — 孔位套上柱轴即捕获;未对齐的环被柱身横向推离
    pegInteract(r) {
      const topY = T.pegBaseY + T.pegH;
      const tilt = this.tiltCos(r);
      if (r.noCapT > 0) return;
      if (tilt >= P.capTilt) {
        if (r.pos.y > topY + P.capBand || r.pos.y < T.pegBaseY + 0.35) return;
        for (let pi = 0; pi < 2; pi++) {
          const px = pi === 0 ? -T.pegX : T.pegX;
          if (Math.hypot(r.pos.x - px, r.pos.z) < P.capAxis) {
            r.state = 'peg'; r.peg = pi;
            r.stackIdx = this.stacks[pi]++;
            r.stress = 0;
            // 首环坐在柱基座上(基座顶 +0.12,管半径 0.13),之后按管径堆叠
            r.restY = T.pegBaseY + 0.25 + r.stackIdx * P.stackH;
            r.restYaw = this.rng() * Math.PI * 2;
            r.vel.set(0, 0, 0); r.angVel.set(0, 0, 0);
            if (this.onCapture) this.onCapture(r);
            return;
          }
        }
        return;
      }
      // 未对齐:柱身范围内的环推离柱轴
      if (r.pos.y > T.pegBaseY - 0.05 && r.pos.y < topY + 0.2) {
        for (let pi = 0; pi < 2; pi++) {
          const px = pi === 0 ? -T.pegX : T.pegX;
          const dx = r.pos.x - px, dz = r.pos.z;
          const axd = Math.hypot(dx, dz);
          if (axd < P.pegPush) {
            const il = axd > 1e-4 ? 1 / axd : 0;
            const ox = dx * il || (px > 0 ? -1 : 1), oz = dz * il;
            const push = P.pegPush - axd;
            r.pos.x += ox * push; r.pos.z += oz * push;
            const vo = r.vel.x * ox + r.vel.z * oz;
            if (vo < 0) { r.vel.x -= 1.4 * vo * ox; r.vel.z -= 1.4 * vo * oz; }
          }
        }
      }
    }

    stepPegged(r, dt) {
      const px = r.peg === 0 ? -T.pegX : T.pegX;
      // 对位:滑向堆叠位置,朝向转平(保留随机朝向)
      const k = 1 - Math.exp(-9 * dt);
      r.pos.x += (px - r.pos.x) * k;
      r.pos.z += (0 - r.pos.z) * k;
      r.pos.y += (r.restY - r.pos.y) * k;
      _tmp.set(0, 1, 0);
      r.quat.setFromAxisAngle(_tmp, r.restYaw);
      // 微晃(水流感)
      r.wobble += dt * 3.1;
      // 顶柱应力:只有柱顶环会被顶出
      const isTop = r.stackIdx === this.stacks[r.peg] - 1;
      if (isTop) {
        const s = this.jetSide(r.pos, 'L') + this.jetSide(r.pos, 'R');
        r.stress += s * P.popGain * dt - P.popDecay * dt;
        r.stress = Math.max(0, r.stress);
        if (r.stress > P.popStress) {
          // 顶出:向上外抛,并给 0.6 s 捕获冷却(否则会在原位被立刻重新套住)
          r.state = 'free';
          this.stacks[r.peg]--;
          r.noCapT = 0.6;
          const out = r.peg === 0 ? 1 : -1;
          r.vel.set(out * (0.8 + this.rng() * 0.7), 2.0 + this.rng() * 0.9, (this.rng() - 0.5) * 1.0);
          r.angVel.set((this.rng() - 0.5) * 8, (this.rng() - 0.5) * 8, (this.rng() - 0.5) * 8);
          if (this.onPop) this.onPop(r);
          return;
        }
      } else r.stress = 0;
      // 微小视觉摆动(不写入物理 quat,直接摆 mesh)
      r.mesh.position.copy(r.pos);
      r.mesh.quaternion.copy(r.quat);
      r.mesh.rotateOnAxis(_axis.set(0, 0, 1), Math.sin(r.wobble) * 0.05);
      r.mesh.position.y += Math.sin(r.wobble * 0.7) * 0.012;
    }

    ringRingCollide() {
      const rs = this.rings;
      for (let i = 0; i < rs.length; i++) {
        for (let j = i + 1; j < rs.length; j++) {
          const a = rs[i], b = rs[j];
          if (a.state !== 'free' || b.state !== 'free') continue;
          _tmp.subVectors(b.pos, a.pos);
          const d = _tmp.length(), min = P.ringSphere * 2;
          if (d > 1e-5 && d < min) {
            const push = (min - d) / d * 0.5;
            a.pos.addScaledVector(_tmp, -push);
            b.pos.addScaledVector(_tmp, push);
            // 速度交换(沿连线,阻尼)
            const rel = _ray.subVectors(b.vel, a.vel).dot(_tmp.normalize());
            if (rel < 0) {
              a.vel.addScaledVector(_tmp, rel * 0.5);
              b.vel.addScaledVector(_tmp, -rel * 0.5);
            }
          }
        }
      }
    }

    // 粗对分:让初始/重置不穿模
    resolveOverlaps(iters) {
      const rs = this.rings;
      for (let it = 0; it < iters; it++) {
        for (let i = 0; i < rs.length; i++) {
          for (let j = i + 1; j < rs.length; j++) {
            const a = rs[i], b = rs[j];
            if (a.state !== 'free' || b.state !== 'free') continue;
            _tmp.subVectors(b.pos, a.pos);
            const d = _tmp.length(), min = P.ringSphere * 2;
            if (d > 1e-5 && d < min) {
              const push = (min - d) / d * 0.5;
              a.pos.addScaledVector(_tmp, -push);
              b.pos.addScaledVector(_tmp, push);
            }
          }
        }
      }
    }

    syncMeshes() {
      for (const r of this.rings) {
        if (r.state === 'free') {
          r.mesh.position.copy(r.pos);
          r.mesh.quaternion.copy(r.quat);
        }
        // pegged 的 mesh 已在 stepPegged 里同步
      }
    }
  }

  WT.WaterPhysics = WaterPhysics;
})();
