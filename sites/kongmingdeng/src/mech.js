/* 孔明灯 — 尺寸常量与热浮升动力学
   文献依据:西汉《淮南万毕术》:「艾火令鸡子飞」;《太平御览》引注:「取鸡子
   去其汁,燃艾火,纳空卵中,疾风因举之飞」(热浮升最早原理记载)。
   「孔明灯」之名与诸葛亮相系(《三国志》无载,存传说);明清习俗见
   连横《台湾通史》记台湾俗「孔明灯」;台湾平溪天灯一般记清道光年间传入。
   制式:竹篾圈架 + 棉纸球壳(敞口),燃料块(松脂/浸油布)燃于口内,
   内气温升 → 密度降 → 净浮力 (ρ外−ρ内)Vg ≥ mg 时升空。
   可验算:
     1. 浮力 F = (ρ外−ρ内)·V·g;ρ内 = ρ外·T外/T内(等压理想气体);
     2. 起飞判据 F ≥ W:V 0.30m³、壳 55g、外温 20℃ → 起飞内温 73℃(断言);
     3. 满温 90℃:F = 0.68N > W 0.54N,净升 0.14N(断言);
     4. 升速:dv/dt = (F−W−k·v)/m_shell(阻尼线性化),稳态 ≈ 0.5m/s(演示);
     5. 内温冷却回落 → 降沉(燃尽段)。
   文献口径:孔明灯发明说为传说,以《淮南万毕术》+明清习俗为锚点(README 明示)。 */
(function (MECH) {
  var D = {
    V: 0.30,                       // 灯容积 m³(底径 0.5 · 高 0.65)
    shellM: 0.055,                 // 壳+燃料架 kg
    fuelBurn: 90,                  // 燃料时长 s(演示压缩)
    T0: 20, TinMax: 90,            // 外温/内温上限 ℃
    rhoOut: 1.20,                  // 空气密度(20℃)
    g: 9.8,
    drag: 0.30,                    // 升降线性阻尼 kg/s(演示)
    eggV: 0.00006                  // 蛋壳容积(万毕术对照)cm³→m³ 60ml
  };
  D.W = D.shellM * D.g;                            // 0.539 N
  D.rhoInOf = function (T) { return D.rhoOut * (273 + 20) / (273 + T); };
  D.Fof = function (T) { return (D.rhoOut - D.rhoInOf(T)) * D.V * D.g; };
  D.Tfly = (D.rhoOut * 293) / (D.rhoOut - D.W / (D.V * D.g)) - 273;   // 起飞内温

  function newState() {
    return {
      time: 0,
      T: T0v(), Tin: T0v(),                      // 外温(略升环境)/内温
      alt: 0, vel: 0,
      released: false, burnt: false,
      maxErr: 0, hist: []
    };
  }
  function T0v() { return D.T0; }

  function step(st, dt) {
    st.time += dt;
    /* 燃烧升温/燃尽降温 */
    if (st.time < D.fuelBurn) {
      st.Tin += (D.TinMax - st.Tin) * Math.min(1, dt * 0.16);
    } else {
      st.burnt = true;
      st.Tin += (T0v() - st.Tin) * Math.min(1, dt * 0.20);
    }
    /* 浮升 */
    var F = D.Fof(st.Tin);
    var net = F - D.W;
    if (!st.released && net > 0) st.released = true;
    if (st.released) {
      var acc = net / D.shellM;
      if (st.alt > 2.2) acc -= (st.alt - 2.2) * 6.0;   // 巡航段系留软上限(悬停 ≈2.35m)
      st.vel += (acc - (D.drag / D.shellM) * st.vel) * dt;
      st.vel = Math.max(-0.8, Math.min(0.9, st.vel));
      st.alt = Math.max(0, st.alt + st.vel * dt);
    } else {
      st.vel = 0; st.alt = 0;
    }
    st._F = F;
    st._int = (st._int || 0) + st.vel * dt;
    var err = Math.abs(st.alt - (st._int || 0));
    if (err > st.maxErr) st.maxErr = err;
    st._hT = (st._hT || 0) + dt;
    if (st._hT > 0.05) {
      st._hT = 0;
      st.hist.push(st.Tin);
      if (st.hist.length > 220) st.hist.shift();
    }
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  /* 载入自检:起飞温度 / 满温浮力 / 判据 */
  (function selfCheck() {
    var errs = [];
    if (Math.abs(D.Tfly - 72.9) > 1.5) errs.push("起飞内温异常: " + D.Tfly.toFixed(1));
    if (D.Fof(90) <= D.W) errs.push("满温浮力不足以起飞");
    if (D.Fof(20) > 0.001) errs.push("常温不应有浮力");
    if (Math.abs(D.Fof(90) - D.W - 0.14) > 0.02) errs.push("满温净升不符: " + (D.Fof(90) - D.W).toFixed(3));
    if (errs.length) {
      var msg = "孔明灯自检失败: " + errs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
