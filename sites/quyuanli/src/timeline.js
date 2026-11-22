/* 时间线(48s 自动循环):前 5 段装配、后 3 段耕作。
   px(犁位)/ u(评行程)为 (阶段 id, 阶段内时间 pt) 的确定函数 —— seek 无需补偿:
     阶段 1-5:px = xStart,u = 0(装配,犁静置于浅耕态);
     阶段 6(浅耕):px 步行 +2.0m,u = 0,d = 0.029;
     阶段 7(深耕):停步调评 u 0→0.30(θ→7.5°,d→0.144),再续行 1.5m;
     阶段 8(循环):续行 1.2m → 收评回 0.08 → 静置,循环重启复位重装。 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "sole", name: "SOLE · 犁底犁铧", dur: 5.0, dot: "yellow", mode: "ASSEMBLY",
      cam: { theta: 0.55, phi: 1.15, r: 6.8, target: [0.4, 0.5, 0] }, drift: 0.03 },
    { id: "mold", name: "MOLD · 犁壁压镵", dur: 4.5, dot: "teal", mode: "ASSEMBLY",
      cam: { theta: -0.50, phi: 1.15, r: 5.6, target: [0.5, 0.5, 0] }, drift: 0.02 },
    { id: "shaft", name: "SHAFT · 曲辕上犁", dur: 4.5, dot: "orange", mode: "ASSEMBLY",
      cam: { theta: 0.90, phi: 1.10, r: 6.2, target: [0.9, 0.6, 0] }, drift: 0.015 },
    { id: "handle", name: "HANDLE · 犁梢犁箭", dur: 4.5, dot: "pink", mode: "ASSEMBLY",
      cam: { theta: -0.85, phi: 1.12, r: 5.8, target: [-0.1, 0.6, 0] }, drift: 0.015 },
    { id: "eval", name: "EVAL · 犁评犁建", dur: 5.0, dot: "green", mode: "ASSEMBLY",
      cam: { theta: 0.30, phi: 1.05, r: 4.6, target: [0.75, 0.55, 0] }, drift: 0.015 },
    { id: "shallow", name: "SHALLOW · 浅耕试验", dur: 7.0, dot: "blue", mode: "SHALLOW",
      cam: { theta: 0.55, phi: 1.10, r: 7.2, target: [0.6, 0.4, 0] }, drift: 0.012 },
    { id: "deep", name: "DEEP · 调评深耕", dur: 8.0, dot: "red", mode: "ADJUST→DEEP",
      cam: { theta: 0.55, phi: 1.08, r: 7.6, target: [1.2, 0.4, 0] }, drift: 0.012 },
    { id: "cycle", name: "CYCLE · 循环耕作", dur: 10.0, dot: "yellow", mode: "CYCLE",
      cam: { theta: 0.75, phi: 1.08, r: 8.6, target: [1.2, 0.4, 0] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["sole", "mold", "shaft", "handle", "eval", "shallow", "deep", "cycle"];

  MECH.newState = function () {
    return {
      time: 0, px: D.xStart, u: 0, vWalk: 0, walking: false,
      errPos: 0, seated: 0, phaseId: "", _prevPx: D.xStart
    };
  };

  /* —— px / u 脚本(纯函数) —— */
  function scriptPhase(ph, pt) {
    var px = D.xStart, u = 0, walking = false;
    if (ph.id === "shallow") {
      px = D.xStart + 2.0 * KS.ease(pt / ph.dur);
      walking = true;
    } else if (ph.id === "deep") {
      px = D.xStart + 2.0;
      if (pt > 2.5) {
        px += 1.5 * KS.ease(KS.clamp((pt - 2.5) / 5.0, 0, 1));
        walking = pt > 2.9 && pt < 7.2;
      }
      u = 0.30 * KS.ease(KS.clamp(pt / 2.5, 0, 1));
    } else if (ph.id === "cycle") {
      px = D.xStart + 3.5 + 1.2 * KS.ease(KS.clamp(pt / 5.0, 0, 1));
      walking = pt < 5.2;
      u = 0.30 - 0.22 * KS.ease(KS.clamp((pt - 6.0) / 2.2, 0, 1));
    }
    return { px: px, u: u, walking: walking };
  }

  MECH.tick = function (st, ph, pt, dt) {
    st.time += dt;
    var s = scriptPhase(ph, pt);
    st.px = s.px; st.u = s.u; st.walking = s.walking;
    st.vWalk = Math.abs(st.px - st._prevPx) / Math.max(dt, 1e-4);
    st._prevPx = st.px;
    st.thetaDeg = KS.thetaOf(st.u);
    st.depth = KS.depthOf(st.u);
    st.phaseId = ph.id;

    /* 行走扬尘 */
    if (s.walking && st.vWalk > 0.1 && Math.random() < 0.25) {
      MECH.Scene3D.spawnPuff(st.px - 0.4 + (Math.random() - 0.5) * 0.2, D.bedTop + 0.10, (Math.random() - 0.5) * 0.3,
        { max: 0.8, base: 0.30, vy: 0.55, tint: 0xA8926E, opacity: 0.4 });
    }
    /* 调评瞬间的金属碰击示意 */
    if (ph.id === "deep" && pt < 2.5 && Math.random() < 0.1) {
      MECH.Scene3D.spawnPuff(0.66 + st.u + 0.2, D.bedTop + 0.5, 0.08,
        { max: 0.4, base: 0.16, vy: 0.8, tint: 0xC9CDD4, opacity: 0.45 });
    }
  };

  MECH.camAdj = function (st, ph, pt) {
    return { target: [st.px * 0.55 + ph.cam.target[0] * 0.45, ph.cam.target[1], ph.cam.target[2]] };
  };

  MECH.status = function (st, ph, pt) {
    var hot = ph.id === "deep";
    return {
      mode: ph.mode,
      hot: hot,
      pill: ph.name + " · d " + (st.depth * 100).toFixed(1) + "cm",
      a: st.thetaDeg.toFixed(2) + "°",
      b: (st.depth * 100).toFixed(1) + " cm",
      c: (st.u * 100).toFixed(0) + " / 30 cm"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "sole") {
      return [
        { id: "p-so", obj: E("sole"), text: "犁底 1.10m · 后端着地" },
        { id: "p-sh", obj: E("share"), text: "犁铧 · 入土刃 · d = a·sinθ", tone: "white" }
      ];
    }
    if (ph.id === "mold") {
      return [{ id: "p-mo", obj: E("mold"), text: "犁壁 · 铁曲板翻土" }];
    }
    if (ph.id === "shaft") {
      return [{ id: "p-sf", obj: E("shaft"), text: "曲辕 · S 曲线 · 轭钩在前", tone: "white" }];
    }
    if (ph.id === "handle") {
      return [
        { id: "p-ha", obj: E("handle"), text: "犁梢 · 扶手" },
        { id: "p-ar", obj: E("arrow"), text: "犁箭 · 连底与辕", tone: "white" }
      ];
    }
    if (ph.id === "eval") {
      return [{ id: "p-ev", obj: E("eval"), text: "犁评+犁建 · 进深退浅 · 行程 0.30m", tone: "white" }];
    }
    if (ph.id === "shallow") {
      return [{ id: "p-ev2", obj: E("eval"), text: "浅耕 θ 1.5° · d 2.9cm", tone: "white" }];
    }
    if (ph.id === "deep") {
      return [
        { id: "p-ev3", obj: E("eval"), text: "评进 → θ 7.5° → d 14.4cm" },
        { id: "p-so2", obj: E("sole"), text: "绕后端翻转 · 铧尖入土", tone: "white" }
      ];
    }
    if (ph.id === "cycle") {
      return [{ id: "p-so3", obj: E("sole"), text: "循环耕作 · 沟迹随行", tone: "white" }];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
