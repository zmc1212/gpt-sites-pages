/* 蜘蛛本体：脚驱动机身 + 解析 IK 八腿。
 *
 * 每一帧整机姿态都从世界重新推导，不放任何动画片段：
 *  1) 输入 → 切平面上的意图；
 *  2) 机身控制器：转向/前进，靠"已落脚支撑面"(Newell 法线 + 贴足加权质心) 定骑高与倾角，
 *     斜坡前倾、立墙攀附、越阶不沉；
 *  3) 步态状态机：相位轮盘 + Cruse 规则 + 紧急度排序，脚钉在世界系里，
 *     机身"跑过"脚时该腿抬步划弧落新点；
 *  4) 落足点搜索：沿 -up 解析下探 + 向机身后撤重试；
 *  5) 两骨闭式 IK + 膝摆动避障搜索 + 硬去穿透；
 *  6) 腹部在腰轴（pedicel）上弹簧弯折，触肢 Verlet 摆动。
 */
'use strict';

window.SpiderLib = window.SpiderLib || {};
(function (L) {

  const V3 = L.V3, Q = L.Q, Y_UP = L.Y_UP, DOWN = L.DOWN;
  const clamp = L.clamp, clamp01 = L.clamp01, frac = L.frac, lerp = L.lerp, smooth = L.smooth;
  const wrapPi = L.wrapPi, signedAngle = L.signedAngle, orientCyl = L.orientCyl;
  const terrainH = L.terrainH, terrainN = L.terrainN;
  const colliders = L.colliders, castAll = L.castAll, clearance = L.clearance, occluded = L.occluded;

  // 膝摆动避障搜索的实时参数；decomposed 选分解式（length-then-aim）IK，false 为经典解析式
  const TUNE = { aRange: 3.14, aSamp: 8, decomposed: true };
  L.TUNE = TUNE;

  function ikKnee(root, target, l1, l2, pole, restAxis, out) {
    return TUNE.decomposed
      ? L.twoBoneKneeDecomposed(root, target, l1, l2, pole, restAxis, out)
      : L.twoBoneKnee(root, target, l1, l2, pole, out);
  }

  const GEO = { cyl: new THREE.CylinderGeometry(1, 1, 1, 8), joint: new THREE.SphereGeometry(1, 10, 8) };
  function limbMat(c, e) {
    const col = new THREE.Color(c).convertSRGBToLinear();
    return new THREE.MeshStandardMaterial({
      color: col, roughness: 0.45, metalness: 0.25,
      emissive: e !== undefined ? new THREE.Color(e).convertSRGBToLinear() : col,
      emissiveIntensity: e !== undefined ? 0.5 : 0.08,
    });
  }

  const _t = V3(), _sp = V3(), _depP = V3(), _kUp = V3(0, 1, 0);
  const _wUp = V3(), _lUp = V3();
  const _qT = new THREE.Quaternion(), _qDroop = new THREE.Quaternion(), _qI = new THREE.Quaternion(), _qInv = new THREE.Quaternion();
  const _XAX = V3(1, 0, 0), _YAX = V3(0, 1, 0);

  /* ---- Verlet 触肢（须状感受器，随动带重力拖尾） ---- */
  const _vt = V3();
  class Verlet {
    constructor(scene, anchor, localOff, n, seg, stiffDir, grav, color, rad) {
      this.anchor = anchor; this.localOff = localOff.clone(); this.n = n; this.seg = seg;
      this.stiff = stiffDir.clone(); this.grav = grav; this.rad = rad;
      this.pts = []; this.prev = [];
      const base = anchor.localToWorld(localOff.clone());
      for (let i = 0; i < n; i++) { const p = base.clone().addScaledVector(stiffDir, seg * i); this.pts.push(p); this.prev.push(p.clone()); }
      this.seg_m = [];
      const M = limbMat(color, color);
      for (let i = 0; i < n - 1; i++) { const c = new THREE.Mesh(GEO.cyl, M); c.castShadow = true; scene.add(c); this.seg_m.push(c); }
    }
    step(dt) {
      this.anchor.updateMatrixWorld();
      const head = this.anchor.localToWorld(this.localOff.clone());
      this.pts[0].copy(head); this.prev[0].copy(head);
      const sw = this.stiff.clone().applyQuaternion(this.anchor.quaternion).normalize();
      const g = this.grav * dt * dt;
      for (let i = 1; i < this.n; i++) {
        const p = this.pts[i], pr = this.prev[i];
        const vx = (p.x - pr.x) * 0.9, vy = (p.y - pr.y) * 0.9, vz = (p.z - pr.z) * 0.9;
        pr.copy(p); p.x += vx; p.y += vy - g; p.z += vz;
        const par = this.pts[i - 1];
        p.x += (par.x + sw.x * this.seg - p.x) * 0.2; p.y += (par.y + sw.y * this.seg - p.y) * 0.2; p.z += (par.z + sw.z * this.seg - p.z) * 0.2;
      }
      for (let k = 0; k < 3; k++) for (let i = 1; i < this.n; i++) {
        const a = this.pts[i - 1], b = this.pts[i];
        _vt.subVectors(b, a); const d = _vt.length() || 1e-3;
        _vt.multiplyScalar((d - this.seg) / d * 0.5);
        if (i > 1) a.add(_vt); b.sub(_vt);
      }
      for (let i = 0; i < this.n - 1; i++) orientCyl(this.seg_m[i], this.pts[i], this.pts[i + 1], this.rad);
    }
  }

  /* 段-碰撞体穿透量：a→b 采样 6 点，返回最大吃深（膝避障评分用） */
  function segPen(a, b, nearC, rad) {
    let pen = 0;
    for (let s = 0; s <= 5; s++) { _sp.copy(a).lerp(b, s * 0.2); for (const c of nearC) { const cl = clearance(_sp, c); const dd = rad - cl.d; if (dd > pen) pen = dd; } }
    return pen;
  }

  /* ============================================================
     SPIDER —— 机身由脚支撑面驱动，八腿闭式 IK
     ============================================================ */
  class Spider {
    constructor(scene, world) {
      this.scene = scene; this.world = world;
      this.baseSpeed = 6.0; this.sprintMul = 1.85; this.turnRate = 1.9;
      this.femur = 2.05; this.tibia = 2.05; this.legReach = 4.1; this.tarsus = 0.42; this.legRad = 0.155;
      this.rideClear = 3.0; this.minClear = 1.6; this.baseFreq = 1.55; this.duty = 0.7; this.stepH = 0.65; this.stepThresh = 0.85;
      this.maxStride = 2.7; this.bodyR = 1.6; this.minFoot = 1.1;
      this.up = Y_UP.clone(); this.fwd = V3(0, 0, 1); this.right = V3(1, 0, 0); this.heading = 0; this.moveDir = V3(0, 0, 1);
      this.curSpeed = 0; this.activity = 0; this.gaitPhase = 0;
      this.simT = 0;                      // 累计模拟时间：呼吸等视觉节律用它而非墙钟，保证确定性回放
      // 简化跳跃：抛体 + 自动落面（不含原作的游戏挂点摆荡）
      this.airborne = false; this.vel = V3();
      this.fill = 0.5;                    // 腹部饱满度（视觉常数）
      this.bodyConform = true;            // 骑/倾跟随落脚支撑面
      this.conformTiltW = 0.5;            // 支撑面法线在 body up 中的权重
      this.bodyFlex = true;               // 腹部腰轴弯折开关
      this.abHang = 0.55;                 // 腹部朝"世界重力方向"下垂的程度（爬墙折叠）
      this.abDroop = 0.14;                // 常驻后坠（腹部更重）
      this.abMax = 0.8;                   // 腰轴最大弯折（弧度，≈46° 解剖上限）
      this.stepCount = 0;                 // 自检用：累计完成抬步次数
      this.pos = V3(0, terrainH(0, 0), 0); this.bodyOrigin = V3(0, terrainH(0, 0) + this.rideClear, 0); this.quat = Q();
      this.root = new THREE.Group(); scene.add(this.root);
      this.buildBody(); this.buildLegs();
      this.antennae = [
        new Verlet(scene, this.root, V3(-0.3, 0.34, 1.25), 5, 0.34, V3(-0.25, 0.5, 0.9), 5.0, 0x22d3ee, 0.045),
        new Verlet(scene, this.root, V3(0.3, 0.34, 1.25), 5, 0.34, V3(0.25, 0.5, 0.9), 5.0, 0x22d3ee, 0.045),
      ];
      this.reset();
    }

    partOn(parent, geo, mat, x, y, z, sx, sy, sz) {
      const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
      if (sx !== undefined) m.scale.set(sx, sy, sz);
      m.castShadow = true; parent.add(m); return m;
    }
    part(geo, mat, x, y, z, sx, sy, sz) { return this.partOn(this.root, geo, mat, x, y, z, sx, sy, sz); }

    buildBody() {
      const shell = limbMat(0x1f4250), shellDk = limbMat(0x142a33), accent = limbMat(0x22d3ee, 0x22d3ee);
      // 机身两段式：头胸部（与 locomotion 根刚性连接，驮着腿/眼/螯）+ 腹部（挂在腰轴 Group
      // 下随弹簧弯折）。爬墙时腹部下垂、越脊时上扬——蜘蛛的"折腰"体态而非刚性一块。
      this.PEDICEL = V3(0, 0.02, -0.85);
      this.abdomen = new THREE.Group(); this.abdomen.position.copy(this.PEDICEL); this.root.add(this.abdomen);
      this._abQ = new THREE.Quaternion();
      // 头胸部（前段）
      this.part(GEO.joint, shell, 0, 0, 0.15, 1.05, 0.72, 1.25);               // 背甲
      this.part(GEO.joint, shell, 0, 0.05, -0.7, 0.55, 0.5, 0.7);              // 腰前隆起
      this.part(GEO.joint, limbMat(0x265562), 0, 0.18, 1.0, 0.62, 0.5, 0.55);  // 头突
      const eye = limbMat(0xff3bd4, 0xff3bd4);
      for (const e of [[-0.26, 0.32, 1.32, 0.12], [0.26, 0.32, 1.32, 0.12], [-0.13, 0.42, 1.36, 0.09], [0.13, 0.42, 1.36, 0.09], [-0.32, 0.2, 1.28, 0.08], [0.32, 0.2, 1.28, 0.08]])
        this.part(GEO.joint, eye, e[0], e[1], e[2], e[3], e[3], e[3]);
      const fang = limbMat(0x0f1c24);
      const f1 = this.part(new THREE.ConeGeometry(0.12, 0.6, 6), fang, -0.16, -0.05, 1.5); f1.rotation.x = 2.5;
      const f2 = this.part(new THREE.ConeGeometry(0.12, 0.6, 6), fang, 0.16, -0.05, 1.5); f2.rotation.x = 2.5;
      // 腹部（后段，腰轴相对坐标）
      const py = this.PEDICEL.y, pz = this.PEDICEL.z;
      this.body = this.partOn(this.abdomen, GEO.joint, shellDk, 0, -0.02 - py, -1.65 - pz, 1.18, 0.82, 1.5);
      this.partOn(this.abdomen, GEO.joint, accent, 0, 0.2 - py, -1.55 - pz, 0.34, 0.7, 1.42);
    }

    buildLegs() {
      const fem = limbMat(0x2aa7c4), tib = limbMat(0x1d7f96), tar = limbMat(0x12606f), jnt = limbMat(0x0f1c24);
      // 八腿方位角（前两对朝前，后两对朝后）与相位轮偏置（异侧交替 → 交替四足组）
      const spec = [
        { az: 0.50, off: 0.50 }, { az: 1.12, off: 0.33 }, { az: 1.78, off: 0.17 }, { az: 2.42, off: 0.00 },
        { az: -2.42, off: 0.50 }, { az: -1.78, off: 0.67 }, { az: -1.12, off: 0.83 }, { az: -0.50, off: 0.00 },
      ];
      const rHip = 1.15, rHome = 3.35; this.legs = [];
      for (const s of spec) {
        const ox = Math.sin(s.az), oz = Math.cos(s.az);
        const home = V3(ox * rHome, 0, oz * rHome);
        const Lo = {
          hip: V3(ox * rHip, 0.0, oz * rHip), home, off: s.off,
          pole: V3(ox * 0.85, 1.45, oz * 0.85).normalize(),
          restAz: Math.atan2(home.x, home.z), restR: rHome, rMin: rHome * 0.78, rMax: rHome * 1.2, ccw: 0.3, cw: 0.3,
          femurM: new THREE.Mesh(GEO.cyl, fem), tibiaM: new THREE.Mesh(GEO.cyl, tib), tarsusM: new THREE.Mesh(GEO.cyl, tar),
          kneeM: new THREE.Mesh(GEO.joint, jnt), hipM: new THREE.Mesh(GEO.joint, jnt),
          plant: V3(), from: V3(), to: V3(), surfN: Y_UP.clone(), toN: Y_UP.clone(), t: 1, stepping: false, lift: 0,
        };
        Lo.restAxisL = home.clone().sub(Lo.hip).normalize();   // 分解式 IK 的静止链方向
        Lo.femurM.castShadow = Lo.tibiaM.castShadow = Lo.tarsusM.castShadow = Lo.kneeM.castShadow = Lo.hipM.castShadow = true;
        Lo.kneeM.scale.setScalar(0.2); Lo.hipM.scale.setScalar(0.26);
        this.scene.add(Lo.femurM, Lo.tibiaM, Lo.tarsusM, Lo.kneeM, Lo.hipM);
        this.legs.push(Lo);
      }
      // 各腿的活动扇区：相邻腿静止方位角之差的一半（留 margin），落足目标方位角被 clamp 在扇区内
      const margin = 0.06;
      for (let i = 0; i < 8; i++) {
        const Lo = this.legs[i], nx = this.legs[(i + 1) % 8], pv = this.legs[(i + 7) % 8];
        Lo.ccw = Math.max(0.12, Math.abs(wrapPi(nx.restAz - Lo.restAz)) * 0.5 - margin);
        Lo.cw = Math.max(0.12, Math.abs(wrapPi(pv.restAz - Lo.restAz)) * 0.5 - margin);
      }
    }

    rebuild() {
      let r = this.up.clone().cross(this.fwd);
      if (r.lengthSq() < 1e-6) r = this.up.clone().cross(V3(1, 0, 0.001));
      r.normalize();
      this.fwd.copy(r.clone().cross(this.up).normalize()); this.right.copy(r);
      this.quat.setFromRotationMatrix(new THREE.Matrix4().makeBasis(this.right, this.up, this.fwd));
    }
    setRoot() {
      this.root.position.copy(this.bodyOrigin); this.root.quaternion.copy(this.quat);
      const br = 1 + Math.sin(this.simT * 3.1) * 0.013;              // 微呼吸（模拟时间驱动）
      const f = 1 + clamp01(this.fill) * 0.55;                        // 腹部饱满
      this.body.scale.set(1.18 * (0.85 + 0.15 * f), 0.82 * br * f, 1.5 * f);
      this.root.updateMatrixWorld(true);
    }

    /* 沿 -up 在世界 xz 点 pW 下探，返回第一个"有效"落足面，或 null。
     * 有效 = 面朝上（非天花板）+ 在腿可达范围内 + 未埋进别的碰撞体。
     * 起点抬高 4：巨石穹顶下方低起点可能已在岩石内部，会漏测。 */
    _castFoothold(pW) {
      const down = this.up.clone().negate();
      const maxAbove = this.legReach + 0.5;
      const origin = pW.clone().addScaledVector(this.up, 4);
      for (let a = 0; a < 6; a++) {
        const g = castAll(origin, down, this.rideClear + 12);
        if (!g) break;
        const upish = g.n.dot(this.up) > 0.1;
        const reachable = g.point.clone().sub(this.pos).dot(this.up) < maxAbove;
        let buried = false;
        for (const c of colliders) { if (clearance(g.point, c).d < -0.15) { buried = true; break; } }
        if (upish && reachable && !buried) return g;
        origin.copy(g.point).addScaledVector(down, 0.15);   // 跳过该命中，继续向下
      }
      return null;
    }

    /* 落足点搜索：先试理想站位点；无可达面（目标 xz 深陷石印内等）时朝机身方向
     * 水平后撤重试——把脚"撤"到石旁的净地上，而不是栽进岩石。平地首试即中。 */
    footProbe(pW) {
      let g = this._castFoothold(pW);
      if (g) return g;
      const retreat = this.pos.clone().sub(pW);
      retreat.addScaledVector(this.up, -retreat.dot(this.up));   // 只留水平分量
      for (let k = 1; k <= 6; k++) {
        g = this._castFoothold(pW.clone().addScaledVector(retreat, (k / 6) * 0.85));
        if (g) return g;
      }
      // 兜底：纯地形点（所有命中都被拒绝时的最后手段）
      const y = terrainH(pW.x, pW.z);
      return { point: V3(pW.x, y, pW.z), n: terrainN(pW.x, pW.z) };
    }

    /* 触肢链随锚点重建：瞬移/重置后 Verlet 节点若留在旧位置，会拉出横跨全场的长丝 */
    _resetAntennae() {
      for (const aa of this.antennae) {
        aa.anchor.updateMatrixWorld();
        const base = aa.anchor.localToWorld(aa.localOff.clone());
        const sw = aa.stiff.clone().applyQuaternion(aa.anchor.quaternion).normalize();
        for (let i = 0; i < aa.n; i++) { aa.pts[i].copy(base).addScaledVector(sw, aa.seg * i); aa.prev[i].copy(aa.pts[i]); }
      }
    }

    reset() {
      if (this._abQ) { this._abQ.identity(); this.abdomen.quaternion.identity(); }
      this.up.copy(Y_UP); this.fwd.set(0, 0, 1); this.right.set(1, 0, 0); this.heading = 0;
      this.moveDir.set(0, 0, 1); this.curSpeed = 0; this.activity = 0; this.gaitPhase = 0;
      this.airborne = false; this.vel.set(0, 0, 0);
      this.pos.set(0, terrainH(0, 0), 0);
      this.bodyOrigin.copy(this.pos).addScaledVector(this.up, this.rideClear);
      this.rebuild(); this.setRoot();
      for (const Lo of this.legs) {
        const hw = this.root.localToWorld(Lo.home.clone());
        const g = this.footProbe(hw);
        Lo.plant.copy(g.point); Lo.surfN.copy(g.n); Lo.toN.copy(g.n); Lo.from.copy(g.point); Lo.to.copy(g.point);
        Lo.t = 1; Lo.stepping = false;
      }
      this._resetAntennae();
    }

    /* 放到 (x,z) 处的表面上、面向 headingVec，重探八脚（测试挂点）。 */
    teleport(x, z, headingVec) {
      this.up.copy(Y_UP); this.airborne = false; this.vel.set(0, 0, 0);
      if (headingVec) { this.fwd.copy(headingVec); this.fwd.y = 0; if (this.fwd.lengthSq() < 1e-6) this.fwd.set(0, 0, 1); this.fwd.normalize(); }
      else this.fwd.set(0, 0, 1);
      this.right.set(1, 0, 0); this.curSpeed = 0; this.activity = 0; this.gaitPhase = 0; this.moveDir.copy(this.fwd);
      const y = terrainH(x, z); this.pos.set(x, y, z);
      const g = castAll(V3(x, y + 80, z), DOWN, 120); if (g) this.pos.copy(g.point);   // 从高处起探，落上任何几何体
      this.bodyOrigin.copy(this.pos).addScaledVector(this.up, this.rideClear);
      this.rebuild(); this.setRoot();
      for (const Lo of this.legs) {
        const hw = this.root.localToWorld(Lo.home.clone());
        const gg = this.footProbe(hw);
        Lo.plant.copy(gg.point); Lo.surfN.copy(gg.n); Lo.toN.copy(gg.n); Lo.from.copy(gg.point); Lo.to.copy(gg.point);
        Lo.t = 1; Lo.stepping = false;
      }
      this._resetAntennae();
    }

    /* 腹部绕腰轴弯折：腹部"上方向"偏向世界重力（爬墙时下垂、越脊上扬），外加常驻后坠。
     * 弹簧滞后 + 解剖锥角 clamp。纯装饰性，不影响 locomotion。 */
    _updateAbdomen(dt) {
      if (!this.abdomen) return;
      if (!this.bodyFlex) { this._abQ.identity(); this.abdomen.quaternion.identity(); return; }
      _wUp.copy(this.up).lerp(Y_UP, this.abHang);
      if (_wUp.lengthSq() < 1e-6) _wUp.copy(Y_UP);
      _wUp.normalize();
      _qInv.copy(this.quat).invert();
      _lUp.copy(_wUp).applyQuaternion(_qInv);
      _qT.setFromUnitVectors(_YAX, _lUp);
      _qDroop.setFromAxisAngle(_XAX, -this.abDroop);
      _qT.multiply(_qDroop);
      const ang = 2 * Math.acos(clamp(Math.abs(_qT.w), 0, 1));
      if (ang > this.abMax) { _qI.identity(); _qT.copy(_qI.slerp(_qT, this.abMax / ang)); }
      this._abQ.slerp(_qT, 1 - Math.pow(0.02, Math.min(dt, 0.05)));
      this.abdomen.quaternion.copy(this._abQ);
    }

    /** 跳跃：沿表面法线的起跳冲量 + 前向分量（简单抛体，落地自动吸合）。 */
    jump() {
      if (this.airborne) return;
      this.pos.copy(this.bodyOrigin);                    // 空中约定：pos = 身体中心
      const moving = this.moveDir.lengthSq() > 0.04;
      const fwd = (moving ? this.moveDir : this.fwd).clone();
      fwd.addScaledVector(this.up, -fwd.dot(this.up));   // 前向冲量限制在切平面内
      if (fwd.lengthSq() < 1e-5) fwd.copy(this.fwd);
      fwd.normalize();
      this.vel.copy(this.up).multiplyScalar(10).addScaledVector(fwd, (moving ? 3 : 0) + this.curSpeed * 0.7);
      this.airborne = true;
    }

    /** 落面（点 P、法线 N）：身体中心 pos → 脚支撑面 pos。 */
    land(P, N) {
      this.airborne = false; this.vel.set(0, 0, 0);
      if (N) this.up.copy(N).normalize();
      this.pos.copy(P);
      this.bodyOrigin.copy(this.pos).addScaledVector(this.up, this.rideClear);
      this.rebuild(); this.setRoot();
      for (const Lo of this.legs) {
        const hw = this.root.localToWorld(Lo.home.clone());
        const g = this.footProbe(hw);
        Lo.plant.copy(g.point); Lo.surfN.copy(g.n); Lo.toN.copy(g.n); Lo.from.copy(g.point); Lo.to.copy(g.point);
        Lo.t = 1; Lo.stepping = false;
      }
    }

    /* 空中积分：抛体 + 空气阻力 + 碰撞去穿透 + 自动落面；腿收拢悬垂。 */
    updateAirborne(dt, inp) {
      if (dt <= 0) { this.bodyOrigin.copy(this.pos); this.rebuild(); this.setRoot(); return; }
      this.simT += dt;
      const G = 26;
      this.vel.y -= G * dt;
      if (inp && (inp.ix || inp.iy)) {   // 空中微操
        const camF = V3(-Math.sin(inp.camYaw || 0), 0, -Math.cos(inp.camYaw || 0));
        const camR = V3(-camF.z, 0, camF.x);
        this.vel.addScaledVector(camF.multiplyScalar(inp.iy).addScaledVector(camR, inp.ix), 16 * dt);
      }
      this.vel.multiplyScalar(1 - 0.09 * dt);
      this.pos.addScaledVector(this.vel, dt);
      // 身体去穿透
      for (const c of colliders) {
        const cl = clearance(this.pos, c);
        if (cl.d < 0.7) { this.pos.addScaledVector(cl.n, 0.7 - cl.d); const vn = this.vel.dot(cl.n); if (vn < 0) this.vel.addScaledVector(cl.n, -vn); }
      }
      this.up.lerp(Y_UP, 1 - Math.pow(0.015, dt)); this.up.normalize();   // 空中回到世界朝上
      const vh = V3(this.vel.x, 0, this.vel.z);
      if (vh.lengthSq() > 0.6) { this.fwd.lerp(vh.normalize(), 1 - Math.pow(0.12, dt)); this.fwd.y = 0; this.fwd.normalize(); }
      // 下方表面进入骑高即落
      const downHit = castAll(this.pos.clone().add(V3(0, 0.5, 0)), DOWN, this.rideClear + 2.5);
      const tH = terrainH(this.pos.x, this.pos.z);
      if (this.vel.y < 0 && downHit && this.pos.y - downHit.point.y < this.rideClear * 0.7) { this.land(downHit.point, downHit.n); return; }
      if (this.pos.y - this.rideClear < tH + 0.1) { this.land(V3(this.pos.x, tH, this.pos.z), terrainN(this.pos.x, this.pos.z)); return; }
      this.pos.x = clamp(this.pos.x, -L.FIELD / 2 + 3, L.FIELD / 2 - 3);
      this.pos.z = clamp(this.pos.z, -L.FIELD / 2 + 3, L.FIELD / 2 - 3);
      this.heading = Math.atan2(this.fwd.x, this.fwd.z); this.rebuild();
      this.bodyOrigin.copy(this.pos);
      this._updateAbdomen(dt > 0 ? dt : 1e-4); this.setRoot();
      this.poseAirborneLegs();
      for (const aa of this.antennae) aa.step(dt);
    }

    /** 空中姿态：腿自髋部收拢悬垂（不做步态）。 */
    poseAirborneLegs() {
      const down = this.up.clone().negate();
      for (const Lo of this.legs) {
        const hipW = this.root.localToWorld(Lo.hip.clone());
        const out = hipW.clone().sub(this.bodyOrigin);
        out.addScaledVector(this.up, -out.dot(this.up));
        if (out.lengthSq() < 1e-4) out.copy(this.fwd);
        out.normalize();
        const knee = hipW.clone().addScaledVector(out, this.femur * 0.55).addScaledVector(down, this.femur * 0.5);
        const ankle = knee.clone().addScaledVector(down, this.tibia * 0.7).addScaledVector(out, -this.tibia * 0.2);
        const foot = ankle.clone().addScaledVector(down, this.tarsus);
        Lo.plant.copy(foot);
        orientCyl(Lo.femurM, hipW, knee, this.legRad);
        orientCyl(Lo.tibiaM, knee, ankle, this.legRad * 0.8);
        orientCyl(Lo.tarsusM, ankle, foot, this.legRad * 0.62);
        Lo.kneeM.position.copy(knee); Lo.hipM.position.copy(hipW);
      }
    }

    update(dt, inp) {
      if (this.airborne) { this.updateAirborne(dt, inp); return; }
      if (dt > 0) {
        this.simT += dt;
        this.rebuild();
        // 1) 切平面内的即时移动（机身先走，腿随后）
        const mag = Math.min(1, Math.hypot(inp.ix, inp.iy));
        if (mag > 0.08) {
          const camF = V3(-Math.sin(inp.camYaw), 0, -Math.cos(inp.camYaw));
          const camR = V3(-camF.z, 0, camF.x);
          const intent = camF.multiplyScalar(inp.iy).addScaledVector(camR, inp.ix);   // 世界系水平意图
          const dir = intent.clone().addScaledVector(this.up, -intent.dot(this.up));  // 投影到切平面
          // 陡面（墙）上：水平输入推不上去，把"顶入/拉离墙面"的分量转成沿墙爬升/下降
          const steep = 1 - Math.abs(this.up.y);
          if (steep > 0.25) {
            const climbAmt = -intent.dot(this.up);
            const upWall = V3(0, 1, 0).addScaledVector(this.up, -this.up.y);   // 世界-up 在切平面内的投影
            if (upWall.lengthSq() > 1e-4) dir.addScaledVector(upWall.normalize(), climbAmt * steep);
          }
          if (dir.lengthSq() > 1e-5) {
            dir.normalize(); this.moveDir.copy(dir);
            this.curSpeed = this.baseSpeed * mag * (inp.sprint ? this.sprintMul : 1);
            this.pos.addScaledVector(dir, this.curSpeed * dt);
            const turn = clamp(signedAngle(this.fwd, dir, this.up), -this.turnRate * dt, this.turnRate * dt);
            this.fwd.applyAxisAngle(this.up, turn); this.rebuild();
          }
        } else {
          this.curSpeed = lerp(this.curSpeed, 0, 1 - Math.pow(0.0008, dt));
          this.moveDir.multiplyScalar(0.86);
        }
        this.activity = this.curSpeed / this.baseSpeed;
        // 1b) 已落脚的支撑面（质心 + Newell 法线）：决定骑高(4)与倾角(5)。
        // 质心按"脚离其本位多近"加权：被 stranded 在远处的脚（跨台/留墙）不可靠，不托底。
        let feetC = null, feetN;
        {
          let cx = 0, cy = 0, cz = 0, wsum = 0, nx = 0, ny = 0, nz = 0;
          for (let i = 0; i < 8; i++) {
            const A = this.legs[i].plant, B = this.legs[(i + 1) % 8].plant;
            nx += (A.y - B.y) * (A.z + B.z); ny += (A.z - B.z) * (A.x + B.x); nz += (A.x - B.x) * (A.y + B.y);
            const Lo = this.legs[i];
            if (!Lo.stepping) {
              const homeW = this.root.localToWorld(Lo.home.clone());
              const w = clamp01(1 - A.distanceTo(homeW) / (this.maxStride * 1.4));
              cx += A.x * w; cy += A.y * w; cz += A.z * w; wsum += w;
            }
          }
          if (wsum > 1e-3) feetC = V3(cx / wsum, cy / wsum, cz / wsum);
          feetN = V3(nx, ny, nz);
          if (feetN.dot(this.up) < 0) feetN.negate();
          if (feetN.lengthSq() < 1e-6) feetN.copy(this.up);
          feetN.normalize();
        }
        // 2) 机身正下方表面（相对 body up 下探）
        let g = castAll(this.pos.clone().addScaledVector(this.up, 1.6), this.up.clone().negate(), this.rideClear + 7);
        if (!g) g = castAll(this.pos.clone().add(V3(0, 3.5, 0)), DOWN, 22);
        // 2b) 前瞻更高表面 → 现在就开始爬（台阶/台地变成平滑坡，而不是被地形钳制一帧拽上去）。
        // 只对向上抬升起作用；抬升上限 rideClear，高墙仍垂直攀爬。
        if (g && this.curSpeed > 0.5) {
          const ahO = this.pos.clone().addScaledVector(this.moveDir, 1.2).addScaledVector(this.up, this.rideClear);
          const ah = castAll(ahO, this.up.clone().negate(), this.rideClear + 9);
          if (ah) { const dh = ah.point.clone().sub(g.point).dot(this.up); if (dh > 0) g.point.addScaledVector(this.up, Math.min(dh, this.rideClear)); }
        }
        // 3) 前向探须：正驶入的表面 → 倾身贴上（爬升/下降/越脊统一）
        let aheadN = null;
        if (this.curSpeed > 0.4) {
          const a = castAll(this.pos.clone().addScaledVector(this.up, 0.5), this.moveDir, this.bodyR + 1.4);
          if (a && a.n.dot(this.moveDir) < -0.2) aheadN = a.n.clone();
        }
        // 4) 骑乘表面（带帽快照）；无面则下坠
        if (g) {
          const d = g.point.clone().sub(this.pos); const dl = d.length();
          const cap = (this.curSpeed * 1.7 + 9) * dt;
          if (dl > cap) this.pos.addScaledVector(d.multiplyScalar(1 / dl), cap); else this.pos.copy(g.point);
        } else this.pos.y -= 9 * dt;
        const tH = terrainH(this.pos.x, this.pos.z);
        if (this.pos.y < tH - 0.3) this.pos.y = tH - 0.3;
        this.pos.x = clamp(this.pos.x, -L.FIELD / 2 + 3, L.FIELD / 2 - 3);
        this.pos.z = clamp(this.pos.z, -L.FIELD / 2 + 3, L.FIELD / 2 - 3);
        this.pos.y = clamp(this.pos.y, -12, 46);
        // 4b) 机身去穿透：只处理侧向侵入（法线大致水平）——顶棚交给抬脚、地面交给骑乘
        {
          const R = this.bodyR + this.legRad + 0.2;
          const push = V3(); let sidePen = 0;
          const p = this.pos.clone().addScaledVector(this.up, this.rideClear);   // 只看躯干高度
          for (const c of colliders) {
            const cc = c.kind === 'sphere' ? c.c : c.p;
            if (p.distanceTo(cc) > R + c.br + 1) continue;
            const cl = clearance(p, c);
            const nu = cl.n.dot(this.up);
            if (cl.d < R && nu > -0.3 && nu < 0.7) {
              const amt = R - cl.d;
              push.addScaledVector(cl.n, amt);
              if (amt > sidePen) sidePen = amt;
            }
          }
          if (sidePen > 1e-4) {
            push.addScaledVector(this.up, -push.dot(this.up));   // 逃逸保持水平
            // 正对障碍走不出去时，把向后分量转成向上抬——机身翻越而非卡死
            let lift = sidePen;
            const back = push.dot(this.moveDir);
            if (back < 0) { push.addScaledVector(this.moveDir, -back); lift -= back; }
            push.addScaledVector(this.up, lift);
            const m2 = Math.min(push.length(), 0.4);
            if (push.lengthSq() > 1e-9) this.pos.addScaledVector(push.normalize(), m2);
            this.pos.y = clamp(this.pos.y, -12, 46);
          }
        }
        // 5) body up = 表面法线，混入前向表面 + 落脚支撑面
        let surfN = g ? g.n.clone() : Y_UP.clone();
        if (aheadN) surfN.multiplyScalar(0.35).addScaledVector(aheadN, 0.65).normalize();
        const fw = this.bodyConform ? this.conformTiltW : 0.2;
        const targetUp = surfN.multiplyScalar(1 - fw).addScaledVector(feetN, fw).normalize();
        this.up.lerp(targetUp, aheadN ? 1 - Math.pow(0.05, dt) : 1 - Math.pow(0.09, dt));
        if (this.up.lengthSq() < 1e-6 || !isFinite(this.up.x)) this.up.copy(Y_UP);
        this.up.normalize();
      }
      // 6) 骑在表面上方；腿随后
      this.rebuild();
      this.bodyOrigin.copy(this.pos).addScaledVector(this.up, this.rideClear);
      this.heading = Math.atan2(this.fwd.x, this.fwd.z);
      this._updateAbdomen(dt > 0 ? dt : 1e-4);
      this.setRoot();
      this.updateLegs(dt > 0 ? dt : 1e-4);
      if (dt > 0) for (const a of this.antennae) a.step(dt);
    }

    updateLegs(dt) {
      const act = Math.max(this.activity || 0, 0.0001);
      const freq = this.baseFreq * act;
      if (act > 0.12) this.gaitPhase = frac((this.gaitPhase || 0) + dt * freq);
      const duty = this.duty;
      const stride = clamp((this.curSpeed / Math.max(freq, 0.25)) * 0.82, 0.35, this.maxStride);
      const swingDur = Math.max((1 - duty) / Math.max(freq, 0.3), 0.05), maxReach = this.femur + this.tibia;
      // 抬步请求（越扇区 / 超伸展 / 相位到点 / 被遮挡）
      let swinging = 0; const reqs = [];
      for (let i = 0; i < 8; i++) {
        const Lo = this.legs[i];
        if (Lo.stepping) { swinging++; continue; }
        const homeW = this.root.localToWorld(Lo.home.clone());
        const hg = this.footProbe(homeW); Lo._home = hg.point;
        const hipW = this.root.localToWorld(Lo.hip.clone());
        const reachFrac = hipW.distanceTo(Lo.plant) / maxReach;
        const lp = this.root.worldToLocal(Lo.plant.clone());
        const dAz = wrapPi(Math.atan2(lp.x, lp.z) - Lo.restAz), r = Math.hypot(lp.x, lp.z);
        const blocked = occluded(hipW, Lo.plant);
        const outSec = dAz > Lo.ccw || dAz < -Lo.cw || r > Lo.rMax * 1.05 || r < Lo.rMin * 0.9 || reachFrac > 0.9 || blocked;
        const dHome = Lo.plant.distanceTo(hg.point);
        const legPhase = frac((this.gaitPhase || 0) + Lo.off);
        const phaseDue = act > 0.15 && legPhase > duty;
        if (phaseDue || dHome > this.stepThresh || outSec)
          reqs.push({ i, rf: reachFrac, bl: blocked, u: (outSec ? 2.4 : 0) + dHome * 0.45 + (phaseDue ? 1 : 0) + (reachFrac > 0.9 ? 3 : 0) + (blocked ? 2.5 : 0) });
      }
      reqs.sort((a, b) => b.u - a.u);
      const maxConc = act > 0.7 ? 4 : 3;
      for (const q of reqs) {
        const crit = q.rf > 0.95 || q.bl;                       // 超伸展/被跨 → 紧急重落
        const cap = q.bl ? 8 : (crit ? maxConc + 2 : maxConc);
        if (swinging >= cap) continue;
        const i = q.i, Lo = this.legs[i];
        // Cruse 规则 1：相邻腿不同时抬（紧急时豁免）
        if (!crit && (this.legs[(i + 1) % 8].stepping || this.legs[(i + 7) % 8].stepping)) continue;
        // 落足目标 = 本位 + 移动方向 × 步幅；方位/半径 clamp 在该腿扇区
        const desired = Lo._home.clone().addScaledVector(this.moveDir, stride);
        let dl = this.root.worldToLocal(desired.clone());
        let az = Lo.restAz + clamp(wrapPi(Math.atan2(dl.x, dl.z) - Lo.restAz), -Lo.cw, Lo.ccw);
        let rr = clamp(Math.hypot(dl.x, dl.z), Lo.rMin, Lo.rMax);
        let w = this.root.localToWorld(V3(Math.sin(az) * rr, dl.y, Math.cos(az) * rr));
        // 与已落脚保持最小间距
        for (let j = 0; j < 8; j++) {
          if (j === i || this.legs[j].stepping) continue;
          const f = this.legs[j].plant;
          const dx = w.x - f.x, dy = w.y - f.y, dz = w.z - f.z, d = Math.hypot(dx, dy, dz);
          if (d < this.minFoot && d > 1e-3) { w.x = f.x + dx / d * this.minFoot; w.y = f.y + dy / d * this.minFoot; w.z = f.z + dz / d * this.minFoot; }
        }
        dl = this.root.worldToLocal(w.clone());
        az = Lo.restAz + clamp(wrapPi(Math.atan2(dl.x, dl.z) - Lo.restAz), -Lo.cw, Lo.ccw);
        rr = clamp(Math.hypot(dl.x, dl.z), Lo.rMin, Lo.rMax);
        w = this.root.localToWorld(V3(Math.sin(az) * rr, dl.y, Math.cos(az) * rr));
        const hipC = this.root.localToWorld(Lo.hip.clone());
        let g2 = this.footProbe(w), foot = g2.point.clone();
        // 腿跨障碍 / 脚落得远低于髋（伸过台缘够到低地）→ 把脚向内收
        const spans = () => occluded(hipC, foot) || hipC.clone().sub(foot).dot(this.up) > this.rideClear + 1.3;
        for (let ti = 0; ti < 8 && spans(); ti++) {
          rr = Math.max(Lo.rMin * 0.7, rr * 0.66);
          const wc = this.root.localToWorld(V3(Math.sin(az) * rr, dl.y, Math.cos(az) * rr));
          g2 = this.footProbe(wc); foot = g2.point.clone();
        }
        const tv = foot.clone().sub(hipC); const dd = tv.length();
        const safe = maxReach * 0.86;
        if (dd > safe) foot = hipC.clone().addScaledVector(tv.multiplyScalar(1 / dd), safe);
        Lo.stepping = true; Lo.t = 0; Lo.from.copy(Lo.plant); Lo.to.copy(foot); Lo.toN.copy(g2.n);
        swinging++;
        // 自适应抬脚弧高：恰好越过路径上的低障碍，但受头顶净空钳制、绝不够翻上高墙
        let mp = 0;
        for (let s = 1; s < 6; s++) { _depP.copy(Lo.from).lerp(Lo.to, s / 6); for (const c of colliders) { const d = clearance(_depP, c).d; if (-d > mp) mp = -d; } }
        let lift = Math.min(this.stepH + mp * 1.1, this.stepH + 1.3);
        const head = castAll(_depP.copy(Lo.from).lerp(Lo.to, 0.5).addScaledVector(this.up, 0.2), this.up, lift + 0.6);
        if (head) lift = Math.min(lift, Math.max(0.2, head.t - 0.3));
        Lo.lift = lift;
      }
      // 摆动积分 + 解析 IK + 膝摆动避障 + 可达保护
      const upv = this.up;
      for (let i = 0; i < 8; i++) {
        const Lo = this.legs[i];
        if (Lo.stepping) {
          Lo.t += dt / swingDur; const t2 = clamp01(Lo.t);
          Lo.plant.lerpVectors(Lo.from, Lo.to, smooth(t2));
          Lo.plant.addScaledVector(upv, (Lo.lift || this.stepH) * Math.sin(Math.PI * Math.pow(t2, 0.82)));
          if (t2 >= 1) {
            Lo.stepping = false; Lo.plant.copy(Lo.to); Lo.surfN.copy(Lo.toN); Lo.t = 1; this.stepCount++;
            if (this.curSpeed > 1.2) this.world.puff(Lo.plant);
          }
        }
        const hipW = this.root.localToWorld(Lo.hip.clone());
        // 踝沿表面法线抬起，使跗节与（可能倾斜的）表面垂直；留一点 body-up 防倒置
        let sN = Lo.surfN.clone(); sN.multiplyScalar(0.7).addScaledVector(upv, 0.3).normalize();
        if (sN.dot(upv) < 0.15) sN.copy(upv);
        const basePole = Lo.pole.clone().applyQuaternion(this.root.quaternion);
        let nearC = null;
        const restAxisW = Lo.restAxisL.clone().applyQuaternion(this.root.quaternion);
        for (const c of colliders) {
          const cc = c.kind === 'sphere' ? c.c : c.p;
          if (hipW.distanceTo(cc) < this.legReach + c.br + 1.2) (nearC || (nearC = [])).push(c);
        }
        // 脚留在已落定的接触点上；渲染脚做硬去穿透；踝沿法线抬起；IK 链超出可达时 clamp
        let foot = Lo.plant.clone();
        if (nearC) for (const c of nearC) { const cl = clearance(foot, c); const want = this.legRad * 0.6; if (cl.d < want) foot.addScaledVector(cl.n, want - cl.d); }
        { const th = terrainH(foot.x, foot.z); if (foot.y < th) foot.y = th; }
        let ankle = foot.clone().addScaledVector(sN, this.tarsus);
        const maxR = maxReach - 0.03;
        { const to = ankle.clone().sub(hipW); const da = to.length(); if (da > maxR) ankle = hipW.clone().addScaledVector(to.multiplyScalar(1 / da), maxR); }
        // 膝求解：摆动搜索碰撞最小穿透的朝向（评股+胫+跗三段吃深）
        const solveKnee = (ank) => {
          if (!nearC) return { knee: ikKnee(hipW, ank, this.femur, this.tibia, basePole.clone().normalize(), restAxisW, V3()), pen: 0 };
          const axis = ank.clone().sub(hipW); const al = axis.length() || 1e-6; axis.multiplyScalar(1 / al);
          const rng = TUNE.aRange, ns = Math.max(1, TUNE.aSamp | 0);
          let best = 1e9, bk = null;
          for (let a = 0; a <= ns * 2; a++) {
            const ang = a === 0 ? 0 : (a & 1 ? 1 : -1) * Math.ceil(a / 2) * (rng / ns);
            const pole = basePole.clone().applyAxisAngle(axis, ang).normalize();
            const kk = ikKnee(hipW, ank, this.femur, this.tibia, pole, restAxisW, V3());
            const pen = segPen(hipW, kk, nearC, this.legRad + 0.05) + segPen(kk, ank, nearC, this.legRad + 0.05) + segPen(ank, foot, nearC, this.legRad + 0.05);
            const score = pen + Math.abs(ang) * 0.008;
            if (score < best) { best = score; bk = kk; }
          }
          return { knee: bk, pen: best };
        };
        const sol = solveKnee(ankle);
        let knee = sol.knee || ikKnee(hipW, ankle, this.femur, this.tibia, basePole.clone().normalize(), restAxisW, V3());
        const kneeIK = knee.clone();
        // 硬去穿透：渲染关节推出实体；股/胫弦穿时推膝绕行（骨长微展，不闪断）
        if (nearC) {
          const rad = this.legRad + 0.02;
          const depen = (pt) => {
            for (const c of nearC) { const cl = clearance(pt, c); if (cl.d < rad) pt.addScaledVector(cl.n, rad - cl.d); }
            const th = terrainH(pt.x, pt.z) + rad * 0.5; if (pt.y < th) pt.y = th;
          };
          depen(ankle);
          { const to = ankle.clone().sub(hipW); const da = to.length(); if (da > maxR) ankle = hipW.clone().addScaledVector(to.multiplyScalar(1 / da), maxR); }
          depen(knee);
          const th2 = (p) => terrainH(p.x, p.z) + rad * 0.5;
          for (let it = 0; it < 16; it++) {
            let kP = 0, kN = null, aP = 0, aN = null;
            for (const [a, b] of [[hipW, knee], [knee, ankle]]) for (let s = 1; s < 10; s++) {
              _depP.copy(a).lerp(b, s / 10);
              for (const c of nearC) { const cl = clearance(_depP, c); const p2 = rad - cl.d; if (p2 > kP) { kP = p2; kN = cl.n; } }
              const tp = th2(_depP) - _depP.y; if (tp > kP) { kP = tp; kN = _kUp; }
            }
            for (let s = 0; s < 6; s++) {
              _depP.copy(ankle).lerp(foot, s / 6);
              for (const c of nearC) { const cl = clearance(_depP, c); const p2 = rad - cl.d; if (p2 > aP) { aP = p2; aN = cl.n; } }
            }
            let moved = false;
            if (kN && kP > 0.01) { knee.addScaledVector(kN, Math.min(kP * 1.4 + 0.02, 0.5)); depen(knee); moved = true; }
            if (aN && aP > 0.01) {
              ankle.addScaledVector(aN, Math.min(aP + 0.02, 0.12));
              const tt = th2(ankle); if (ankle.y < tt) ankle.y = tt;
              const to = ankle.clone().sub(hipW); const da = to.length();
              if (da > maxR) ankle = hipW.clone().addScaledVector(to.multiplyScalar(1 / da), maxR);
              moved = true;
            }
            if (!moved) break;
          }
          // 膝的去穿透位移封顶：股/胫可微展绕行，绝不夸张甩腿
          const kd = knee.clone().sub(kneeIK); const kdl = kd.length();
          if (kdl > 1.3) { knee.copy(kneeIK).addScaledVector(kd, 1.3 / kdl); depen(knee); }
        }
        orientCyl(Lo.femurM, hipW, knee, this.legRad);
        orientCyl(Lo.tibiaM, knee, ankle, this.legRad * 0.8);
        orientCyl(Lo.tarsusM, ankle, foot, this.legRad * 0.62);
        Lo.kneeM.position.copy(knee); Lo.hipM.position.copy(hipW);
        Lo._hipW = hipW; Lo._knee = knee; Lo._ankle = ankle; Lo._foot = foot;
      }
    }

    get position() { return this.root.position; }
  }

  L.Spider = Spider;

})(window.SpiderLib);
