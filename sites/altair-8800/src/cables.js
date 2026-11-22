/* 布线：机箱内部线缆沿曲线生长 */
(function (LS8) {
  var cables = [];
  var root = null;
  var running = false, t0 = 0, done = false;

  var RIBBON = [0xe84f8e, 0xf2a53a, 0xf5e04b, 0x7fd8d8, 0x5b8cff, 0x8b5fd0, 0x57c46b, 0xe8e4da];

  var SPECS = [
    { // 前面板 → 主板 排线
      pts: [[0.6, 0.3, 0.5], [0.62, 0.28, 0.28], [0.58, 0.2, 0.02], [0.5, 0.16, -0.14]],
      color: 0x000000, r: 0.009, delay: 0, strands: 8, ribbon: true
    },
    { // 变压器 → 主板 电源线（红黑对）
      pts: [[-0.3, 0.2, -0.32], [-0.05, 0.18, -0.12], [0.25, 0.16, -0.08]],
      color: 0xc0392b, r: 0.011, delay: 0.5, strands: 2
    },
    { // 电容组 → 主板
      pts: [[0.02, 0.2, -0.32], [0.2, 0.17, -0.1], [0.45, 0.15, -0.1]],
      color: 0x17181d, r: 0.011, delay: 0.8, strands: 1
    },
    { // 风扇 → 主板
      pts: [[1.6, 0.3, -0.45], [1.4, 0.2, -0.15], [1.15, 0.15, -0.05]],
      color: 0x17181d, r: 0.009, delay: 1.1, strands: 1
    }
  ];

  function init() {
    root = new THREE.Group();
    LS8.Scene3D.scene.add(root);
  }

  function buildCable(spec) {
    var meshes = [];
    var offs = [];
    if (spec.ribbon) {
      for (var s = 0; s < spec.strands; s++) offs.push((s - (spec.strands - 1) / 2) * 0.02);
    } else {
      for (var k = 0; k < spec.strands; k++) offs.push(spec.strands === 2 ? (k - 0.5) * 0.024 : 0);
    }
    offs.forEach(function (off, idx) {
      var pts = spec.pts.map(function (p) {
        return new THREE.Vector3(p[0] + off * 0.5, p[1] + Math.abs(off) * 0.5, p[2] + off);
      });
      var curve = new THREE.CatmullRomCurve3(pts);
      var geo = new THREE.TubeGeometry(curve, 60, spec.r, 8, false);
      var mat = new THREE.MeshStandardMaterial({
        color: spec.ribbon ? RIBBON[idx] : spec.color,
        roughness: 0.62, metalness: 0.12
      });
      var m = new THREE.Mesh(geo, mat);
      m.castShadow = true;
      m.geometry.setDrawRange(0, 0);
      root.add(m);
      meshes.push(m);
    });
    return { spec: spec, meshes: meshes };
  }

  function begin(now) {
    running = true; done = false; t0 = now;
    cables = SPECS.map(buildCable);
  }

  function update(now) {
    if (!running || done) return;
    cables.forEach(function (c) {
      var t = (now - t0 - c.spec.delay) / 1.0;
      if (t <= 0) return;
      var f = Math.min(1, t);
      var ease = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
      c.meshes.forEach(function (m) {
        var total = m.geometry.index.count;
        m.geometry.setDrawRange(0, Math.floor(total * ease / 6) * 6);
      });
    });
    if ((now - t0) > 3.2) done = true;
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
