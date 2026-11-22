/* 数学层：向量/缓动/闭式两骨 IK/圆柱定向。
 *
 * 本站的 locomotion 数学全部是解析式（闭合公式）——没有物理引擎、没有骨骼动画、
 * 没有迭代收敛：IK 一条余弦定理公式逐帧精确解出膝关节位置。
 * 经典 script（非 ES 模块），挂到全局 SpiderLib 命名空间，file:// 直接可用。
 */
'use strict';

window.SpiderLib = window.SpiderLib || {};
(function (L) {

  L.V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  L.Q = () => new THREE.Quaternion();
  L.Y_UP = L.V3(0, 1, 0);
  L.DOWN = L.V3(0, -1, 0);
  L.TAU = Math.PI * 2;

  L.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  L.clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  L.frac = (v) => v - Math.floor(v);
  L.lerp = (a, b, t) => a + (b - a) * t;
  L.smooth = (t) => t * t * (3 - 2 * t);            // smoothstep 缓动（抬脚弧线的进退）
  L.wrapPi = (a) => { while (a > Math.PI) a -= L.TAU; while (a < -Math.PI) a += L.TAU; return a; };

  /** a→b 的带符号夹角，绕 axis 右手定则取正负（机身转向用）。 */
  L.signedAngle = function (a, b, axis) {
    const c = L.clamp(a.dot(b), -1, 1);
    let ang = Math.acos(c);
    if (a.clone().cross(b).dot(axis) < 0) ang = -ang;
    return ang;
  };

  /* 经典闭式两骨 IK：给定髋、足目标、股/胫长度和"膝盖朝向"极向量，
   * 余弦定理解出膝关节位置（向 poleDir 一侧弯）。精确、一次成型。 */
  const _t = L.V3(), _d = L.V3(), _bend = L.V3();
  L.twoBoneKnee = function (root, target, l1, l2, poleDir, out) {
    _t.subVectors(target, root);
    const dist = L.clamp(_t.length(), 1e-3, l1 + l2 - 1e-3);
    _d.copy(_t).normalize();
    _bend.copy(poleDir).addScaledVector(_d, -poleDir.dot(_d));   // 极向量投影到目标平面
    if (_bend.lengthSq() < 1e-6) _bend.set(0, 1, 0).addScaledVector(_d, -_d.y);
    _bend.normalize();
    const a = Math.acos(L.clamp((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist), -1, 1));
    out.copy(root).addScaledVector(_d, Math.cos(a) * l1).addScaledVector(_bend, Math.sin(a) * l1);
    return out;
  };

  /* 分解式两骨 IK（Kiaran Ritchie 2026 的 length-then-aim 思路）：
   *  (1) 链长 —— 在肢体的"静止方向"规范系里按余弦定理摆好弯折，使 |根→端| 等于 |根→目标|；
   *  (2) 链向 —— 绕髋关节一次旋转把整条链对准目标（delta = fromTo(restAxis, targetDir)）。
   * 端点落点与经典解完全一致，但弯折"由髋关节带动"——更像真实髋臼的驱动方式。
   * restAxis = 该腿静止姿态下的链方向（世界系）。 */
  const _dt2 = L.V3(), _dir2 = L.V3(), _a0 = L.V3(), _b0 = L.V3(), _kn0 = L.V3();
  const _qd = new THREE.Quaternion();
  L.twoBoneKneeDecomposed = function (root, target, l1, l2, poleDir, restAxis, out) {
    _dt2.subVectors(target, root);
    const dist = L.clamp(_dt2.length(), 1e-3, l1 + l2 - 1e-3);
    _dir2.copy(_dt2).normalize();
    _a0.copy(restAxis);
    if (_a0.lengthSq() < 1e-8) _a0.copy(_dir2); else _a0.normalize();
    _b0.copy(poleDir).addScaledVector(_a0, -poleDir.dot(_a0));
    if (_b0.lengthSq() < 1e-6) { _b0.set(0, 1, 0).addScaledVector(_a0, -_a0.y); if (_b0.lengthSq() < 1e-6) _b0.set(1, 0, 0); }
    _b0.normalize();
    const a = Math.acos(L.clamp((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist), -1, 1));
    _kn0.copy(root).addScaledVector(_a0, Math.cos(a) * l1).addScaledVector(_b0, Math.sin(a) * l1);
    _qd.setFromUnitVectors(_a0, _dir2);
    out.copy(_kn0).sub(root).applyQuaternion(_qd).add(root);
    return out;
  };

  /** 把单位 Y 轴圆柱摆成 a→b 之间、半径 radius 的骨段。 */
  const _ov = L.V3();
  L.orientCyl = function (mesh, a, b, radius) {
    _ov.subVectors(b, a);
    const len = _ov.length() || 1e-3;
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.scale.set(radius, len, radius);
    mesh.quaternion.setFromUnitVectors(L.Y_UP, _ov.normalize());
  };

})(window.SpiderLib);
