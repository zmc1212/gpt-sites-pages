/* Famicom 布线：手柄线（盘绕）×2 / 电源线 / RF 线 */
(function (LS8) {
  var cables = [];
  var root = null;
  var running = false, t0 = 0, done = false;

  var SPECS = [
    { // 手柄 I 线（螺旋盘绕）
      pts: [[-2.4, 0.1, 0.9], [-1.95, 0.12, 0.95], [-1.7, 0.14, 0.7], [-1.85, 0.12, 0.45],
            [-1.6, 0.12, 0.25], [-1.35, 0.12, 0.45], [-1.15, 0.12, 0.2], [-0.85, 0.1, 0.35]],
      color: 0x17181d, r: 0.011, delay: 0, strands: 1
    },
    { // 手柄 II 线
      pts: [[-2.4, 0.1, 1.25], [-1.9, 0.12, 1.35], [-1.65, 0.14, 1.1], [-1.8, 0.12, 0.85],
            [-1.55, 0.12, 0.6], [-1.35, 0.12, 0.8], [-1.1, 0.11, 0.5], [-0.85, 0.1, 0.6]],
      color: 0x17181d, r: 0.011, delay: 0.3, strands: 1
    },
    { // 电源线：适配器 → 板
      pts: [[-2.36, 0.1, 0.35], [-1.8, 0.12, 0.2], [-1.2, 0.1, 0.05], [-0.72, 0.1, 0.28]],
      color: 0x17181d, r: 0.011, delay: 0.6, strands: 1
    },
    { // RF 线：板 → RF 开关
      pts: [[0.92, 0.13, -0.4], [-0.9, 0.12, -0.5], [-2.4, 0.1, -0.5]],
      color: 0x8a8f9a, r: 0.012, delay: 0.9, strands: 1
    }
  ];

  function init() {
    root = new THREE.Group();
    LS8.Scene3D.scene.add(root);
  }

  function buildCable(spec) {
    var meshes = [];
    for (var k = 0; k < spec.strands; k++) {
      var pts = spec.pts.map(function (p) {
        return new THREE.Vector3(p[0], p[1] + k * 0.004, p[2] + k * 0.02);
      });
      var curve = new THREE.CatmullRomCurve3(pts);
      var geo = new THREE.TubeGeometry(curve, 84, spec.r, 8, false);
      var mat = new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.62, metalness: 0.12 });
      var m = new THREE.Mesh(geo, mat);
      m.castShadow = true;
      m.geometry.setDrawRange(0, 0);
      root.add(m);
      meshes.push(m);
    }
    return { spec: spec, meshes: meshes };
  }

  function begin(now) {
    running = true; done = false; t0 = now;
    cables = SPECS.map(buildCable);
  }

  function update(now) {
    if (!running || done) return;
    cables.forEach(function (c) {
      var t = (now - t0 - c.spec.delay) / 1.2;
      if (t <= 0) return;
      var f = Math.min(1, t);
      var ease = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
      c.meshes.forEach(function (m) {
        var total = m.geometry.index.count;
        m.geometry.setDrawRange(0, Math.floor(total * ease / 6) * 6);
      });
    });
    if ((now - t0) > 3.6) done = true;
  }

  function completeAll() {
    running = true; done = true;
    if (!cables.length) cables = SPECS.map(buildCable);
    cables.forEach(function (c) {
      c.meshes.forEach(function (m) {
        m.geometry.setDrawRange(0, m.geometry.index.count);
      });
    });
  }

  function reset() {
    running = false; done = false;
    root.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
    root.clear();
    cables = [];
  }

  LS8.Cables = { init: init, begin: begin, update: update, reset: reset, completeAll: completeAll };
})(window.LS8 = window.LS8 || {});
