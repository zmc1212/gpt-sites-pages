/* 时间线(41s 循环):木臂郭 → 机件(牙/悬刀/牛/望山) → 弓弦挂牙 → 箭入槽 →
   张弦瞄准(望山) → 扣悬刀击发(联动脱弦·箭飞) → 弹道落点 → 手动连发(←/→) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "ground", name: "GROUND · 木臂与青铜郭", dur: 5, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.18, r: 1.9, target: [-0.1, 0.42, 0] }, drift: 0.03 },
    { id: "works", name: "WORKS · 牙·悬刀·牛·望山", dur: 6, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.30, phi: 1.10, r: 0.85, target: [0.0, 0.44, 0] }, drift: 0.012 },
    { id: "bow", name: "BOW · 六石弓弦挂牙", dur: 5, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: -0.50, phi: 1.14, r: 1.5, target: [-0.25, 0.44, 0] }, drift: 0.015 },
    { id: "bolt", name: "BOLT · 箭入槽瞄准", dur: 5, dot: "pink", mode: "ASSEMBLING",
      cam: { theta: 0.90, phi: 1.10, r: 0.9, target: [-0.05, 0.45, 0] }, drift: 0.012 },
    { id: "fire", name: "FIRE · 扣悬刀击发(联动脱弦)", dur: 6, dot: "teal", mode: "FIRING",
      cam: { theta: 0.35, phi: 1.10, r: 1.0, target: [0.0, 0.44, 0] }, drift: 0.010 },
    { id: "flight", name: "FLIGHT · 弹道与落点", dur: 6, dot: "green", mode: "BALLISTICS",
      cam: { theta: -0.70, phi: 1.16, r: 3.6, target: [-1.4, 0.45, 0] }, drift: 0.02 },
    { id: "sight", name: "SIGHT · 望山刻度", dur: 4, dot: "blue", mode: "AIMING",
      cam: { theta: 0.55, phi: 1.08, r: 0.62, target: [0.02, 0.47, 0] }, drift: 0.008 },
    { id: "manual", name: "MANUAL · 手动连发(空格击发 · ← 张弦)", dur: 6, dot: "red", mode: "MANUAL",
      cam: { theta: -0.35, phi: 1.14, r: 1.6, target: [-0.05, 0.44, 0] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["ground", "works", "bow", "bolt", "fire", "flight", "sight", "manual"];

  MECH.newState = KS.newState;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      if (ph.id === "fire") KS.setCocked(st, true);
      if (ph.id === "flight") { st.firing = true; st.fireT = 0; }
      if (ph.id === "sight") { st.cocked = true; st.firing = false; st.boltFlying = false; }
      if (ph.id === "manual") { st.cocked = false; st.boltFlying = false; }
    }
    /* 手动:← 张弦挂牙;空格击发(用 pushT 记录) */
    if (ph.id === "manual") {
      if (MECH.keys && MECH.keys.left && !st.cocked && !st.firing) {
        st.cocked = true;
      }
      if (st._spaceFire && st.cocked && !st.firing) {
        st.firing = true; st.fireT = 0;
        st._spaceFire = false;
      }
    }
    KS.step(st, dt);

    /* 箭:装填态置槽;击发后沿 -x 飞(压缩 20:1)加抛物弧;落点留位(只增不减) */
    var bt = MECH.Parts.entry("bolt");
    if (bt && bt.shown) {
      if (st.boltFlying) {
        var f = st.boltDist;
        bt.group.position.set(-f * 2.85, Math.sin(f * Math.PI) * 0.10, 0);
        bt.group.rotation.z = -f * 0.35;
        bt.group.visible = true;
        if (f >= 1) st._landed = true;
      } else if (st.cocked || st.firing) {
        st._landed = false;
        bt.group.position.set(0, 0, 0);
        bt.group.rotation.z = 0;
        bt.group.visible = true;
      } else if (st._landed) {
        bt.group.position.set(-2.85, 0, 0);
        bt.group.rotation.z = -0.35;
        bt.group.visible = true;
      }
    }
    /* 击发瞬间弦声粒子 */
    if (st.boltFlying && st.boltT < 0.1) {
      MECH.Scene3D.spawnPuff(-0.35, 0.46, 0, { max: 0.4, base: 0.20, vy: 0.4, opacity: 0.5, tint: 0xE8E4DA });
    }
    /* 落点标记命中闪 */
    var tg = MECH.Parts.entry("target");
    if (tg && st.boltFlying && st.boltDist > 0.98) {
      MECH.Scene3D.spawnPuff(-3.05, 0.30, 0, { max: 0.5, base: 0.26, vy: 0.8, opacity: 0.6, tint: 0xD8C87A });
    }
  };

  /* seek 补偿:机件段预置挂弦;击发段重演 */
  MECH.onSeek = function (i, st) {
    if (i >= 4) st.cocked = true;
    if (i === 5) { st.firing = true; st.fireT = 0.26; st.boltFlying = true; st.boltDist = 0.4; }
    if (i === 6) { st.cocked = true; st.boltFlying = false; }
  };

  MECH.status = function (st, ph, pt) {
    var pill = ph.name;
    if (st.cocked) pill = ph.name + " · 挂弦待发";
    return {
      mode: ph.mode,
      hot: ph.id === "manual",
      pill: pill,
      a: "联动 k=1.5 · θ牙 " + st.yaT.toFixed(3),
      b: "v箭 " + D.vBolt.toFixed(1) + " m/s · E " + D.Estr.toFixed(0) + " J",
      c: "射 " + st.shots + " · 望山格 " + st.grad + "(Δθ≈" + (D.gradStep * st.grad).toFixed(0) + "°)"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "works") {
      return [
        { id: "p-ya", obj: E("ya"), text: "牙 L牙 3cm · 上键" },
        { id: "p-sd", obj: E("sd"), text: "悬刀 L悬 4.5cm · 下键", tone: "white" },
        { id: "p-niu", obj: E("niu"), text: "牛 联动 k=θ牙/θ悬=1.5" }
      ];
    }
    if (ph.id === "bow" || ph.id === "bolt") {
      return [
        { id: "p-bow", obj: E("bow"), text: "六石弦力 1774N · 储能 142J" },
        { id: "p-wang", obj: E("wang"), text: "望山 6 刻度(瞄具说)", tone: "white" }
      ];
    }
    if (ph.id === "fire" || ph.id === "flight" || ph.id === "manual") {
      return [
        { id: "p-guo", obj: E("guo"), text: "郭半剖 · 机之巧也" },
        { id: "p-bolt", obj: E("bolt"), text: "v=√(2E/m)=75.4 · R理想=580m(压缩20:1)", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
