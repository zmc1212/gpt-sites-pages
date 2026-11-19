/* 被中香炉 — 尺寸常量与万向支架补偿运动学
   文献依据:《西京杂记》卷一:长安巧工丁缓「又作卧褥香炉,一名被中香炉……
   为机环转运四周,而炉体常平,可置之被褥,故以为名」——万向支架(cardan)。
   补偿链(四元数严格解):壳 = qz(b)·qx(a);环1 = qx(−a);环2 = qz(−b)
   ⇒ 炉体世界姿态恒为 I(水平),载入期逐帧断言 |rot|<1e-9。 */
(function (MECH) {
  var CHI = 0.3;
  var D = {
    CHI: CHI,
    shellR: 0.30,           // 外壳半径
    ring1R: 0.26, ring2R: 0.21,
    burnerR: 0.15, burnerH: 0.13,
    tumbleA: 30 * Math.PI / 180,   // 缓翻 pitch 幅
    tumbleB: 25 * Math.PI / 180,   // 缓翻 roll 幅
    wSlow: 0.55, wFast: 1.15,
    k: { slow: 0.55, fast: 1.15 }
  };

  function newState() {
    return {
      time: 0, a: 0, b: 0,             // 壳姿态角(pitch/roll)
      drift: 0, kick: 0,               // 手动冲量
      smoke: 0,
      lastPhase: "", manual: false, _keyL: false, _keyR: false,
      lit: false
    };
  }

  function step(st, dt) {
    st.time += dt;
    var w = D.k[st.lastPhase] && (st.lastPhase === "fast" || st.lastPhase === "manual") ? D.k.fast : D.k.slow;
    st.drift += (st.kick - st.drift) * Math.min(1, dt * 1.4);
    st.kick *= Math.exp(-dt * 1.1);
    st.a = D.tumbleA * Math.sin(st.time * w * 0.9) + st.drift * 0.6;
    st.b = D.tumbleB * Math.cos(st.time * w * 0.7) + st.drift;
    st.smoke += dt;
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  (function selfCheck() {
    /* 四元数恒等式自检:qz(b)·qx(a)·qx(−a)·qz(−b) = I(任取 a,b) */
    var errs = [];
    function qz(t) { var c = Math.cos(t / 2), s = Math.sin(t / 2); return { w: c, x: 0, y: 0, z: s }; }
    function qx(t) { var c = Math.cos(t / 2), s = Math.sin(t / 2); return { w: c, x: s, y: 0, z: 0 }; }
    function mul(p, q) {
      return {
        w: p.w * q.w - p.x * q.x - p.y * q.y - p.z * q.z,
        x: p.w * q.x + p.x * q.w + p.y * q.z - p.z * q.y,
        y: p.w * q.y - p.x * q.z + p.y * q.w + p.z * q.x,
        z: p.w * q.z + p.x * q.y - p.y * q.x + p.z * q.w
      };
    }
    [[0.5, 0.3], [1.2, -0.7], [-0.9, 1.5]].forEach(function (ab) {
      var a = ab[0], b = ab[1];
      var world = mul(qz(b), mul(qx(a), mul(qx(-a), qz(-b))));
      if (Math.abs(world.x) > 1e-12 || Math.abs(world.y) > 1e-12 || Math.abs(world.z) > 1e-12 ||
          Math.abs(Math.abs(world.w) - 1) > 1e-12) {
        errs.push("补偿链不恒等 @" + a + "," + b);
      }
    });
    if (errs.length) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR("被中香炉自检失败: " + errs.join(";"));
      throw new Error(errs.join(";"));
    }
  })();
})(window.MECH = window.MECH || {});
