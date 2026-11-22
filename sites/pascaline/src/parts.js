/* 帕斯卡加法器 — 部件建模与注册(6 件)。
   黄铜匣横卧于支架上:顶面一排 6 个鼓轮读数窗(转鼓数字 Canvas 贴图),
   前面一排 6 个输入辐条轮(36°/位),每对轮之间的 sautoir 进位杆(动画),
   内部齿轮示意(顶盖开窗)。数字随 scheduleAt(st.days) 状态翻转。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;
  var CY = 6.6;                        // 匣中心 y(底座上)

  function group() { return new THREE.Group(); }
  function anchored(g) { g.userData.tagAnchor = new THREE.Vector3(0, 0, 0); return { group: g }; }

  /* 数字画布(0-9 预生成,黄铜底白字) */
  var digitTex = [];
  function digitTexture(d) {
    if (digitTex[d]) return digitTex[d];
    var c = document.createElement("canvas");
    c.width = 128; c.height = 128;
    var x = c.getContext("2d");
    x.fillStyle = "#1A1408";
    x.fillRect(0, 0, 128, 128);
    x.fillStyle = "#E9EEF2";
    x.font = "800 86px Menlo, monospace";
    x.textAlign = "center"; x.textBaseline = "middle";
    x.fillText(String(d), 64, 70);
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    digitTex[d] = t;
    return t;
  }

  function digitMaterial(d) {
    return new THREE.MeshBasicMaterial({ map: digitTexture(d) });
  }

  /* —— 部件 —— */
  function buildCase() {
    var g = group();
    /* 黄铜匣 */
    g.add(P.box(D.caseW, D.caseH, D.caseD, M3.brass, 0, CY, 0));
    g.add(P.box(D.caseW - 0.6, D.caseH - 0.5, 0.2, M3.brass, 0, CY, D.caseD / 2 - 0.05));
    /* 顶面读数窗带(深色槽) */
    g.add(P.box(D.caseW - 1.2, 1.5, 0.1, M3.dark, 0, CY + D.caseH / 2 + 0.06, -1.4));
    /* 侧面装饰线 */
    [-1, 1].forEach(function (s) {
      g.add(P.box(D.caseW - 1.0, 0.08, 0.08, M3.gold, 0, CY + s * 1.4, D.caseD / 2 + 0.02));
    });
    /* 支脚 ×4 + 底板 */
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (sxz) {
      g.add(P.cyl(0.18, 0.24, 3.4, M3.woodD, sxz[0] * (D.caseW / 2 - 0.8), CY - D.caseH / 2 - 1.7, sxz[1] * 2.2, 12));
    });
    g.add(P.box(17.5, 0.3, 8.5, M3.stone, 0, CY - D.caseH / 2 - 3.55, 0));
    return anchored(g);
  }

  /* 六位读数鼓轮:每窗一个平面(贴数字),窗框;KINE 翻面换数字 */
  function buildDrums() {
    var g = group();
    var windows = [];
    for (var i = 0; i < D.DIGITS; i++) {
      var x = (i - (D.DIGITS - 1) / 2) * 2.2;
      var frame = P.box(1.7, 1.15, 0.12, M3.gold, x, CY + D.caseH / 2 + 0.12, -1.4);
      g.add(frame);
      var face = P.mesh(new THREE.PlaneGeometry(1.5, 0.95), digitMaterial(0), x, CY + D.caseH / 2 + 0.13, -1.31);
      face.rotation.x = -Math.PI / 2;       // 朝 +y(俯视读数窗),文字正向
      g.add(face);
      windows.push(face);
    }
    g.userData.windows = windows;
    g.userData.lastShown = [0, 0, 0, 0, 0, 0];
    return anchored(g);
  }

  /* 输入辐条轮 ×6(前面)+ sautoir 进位杆 ×5 + 内部齿轮示意 */
  function buildInputs() {
    var g = group();
    var wheels = [];
    var sautoirs = [];
    for (var i = 0; i < D.DIGITS; i++) {
      var x = (i - (D.DIGITS - 1) / 2) * 2.2;
      /* 输入轮:环 + 辐条 ×8 + 轴销 */
      var w = group();
      w.add(P.torus(0.62, 0.075, M3.brass, 0, 0, 0, 24));
      for (var sp = 0; sp < 8; sp++) {
        var a = sp / 8 * Math.PI * 2;
        var spoke = P.box(0.075, 1.1, 0.075, M3.brass, Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0);
        spoke.rotation.z = a + Math.PI / 2;
        w.add(spoke);
      }
      w.add(P.cyl(0.10, 0.10, 0.3, M3.steel, 0, 0, 0, 12));
      w.position.set(x, CY - 0.9, D.caseD / 2 + 0.18);
      w.rotation.y = 0;
      g.add(w);
      wheels.push(w);
      /* sautoir 进位杆(在该轮与左轮之间,立于匣顶) */
      if (i > 0) {
        var s = group();
        var arm = P.box(0.10, 0.62, 0.10, M3.steel, 0, 0.31, 0);
        s.add(arm);
        var foot = P.box(0.34, 0.10, 0.34, M3.steel, 0, -0.05, 0);
        s.add(foot);
        s.position.set(x - 1.1, CY + D.caseH / 2 + 0.05, -1.4);
        s.rotation.z = 0;                 // 0 = 平放;进位时立起再落下
        g.add(s);
        sautoirs.push(s);
      }
    }
    /* 内部齿轮示意(顶面观察圆 ×2) */
    [[-3.3, 0], [3.3, 0]].forEach(function (p) {
      var gear = P.torus(0.55, 0.06, M3.gold, p[0], CY + D.caseH / 2 + 0.05, 1.4, 22);
      g.add(gear);
    });
    g.userData.wheels = wheels;
    g.userData.sautoirs = sautoirs;
    return anchored(g);
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }
    function fly(dx, dy, dz) { return [dx, dy, dz]; }

    def({ id: "case", name: "CASE · 黄铜匣", sub: "30×12 cm 制式 · 桃木匣黄铜件(示意)", phase: 0, at: 0.2, dur: 1.4,
      build: buildCase, target: [0, 0, 0], start: [0, 8.5, -3.0], mid: [0, 4.5, -1.2] });
    def({ id: "drums", name: "DRUMS · 结果鼓轮 ×6", sub: "读数窗 · 36°/位 · sautoir 联动", phase: 1, at: 5.6, dur: 1.4, kind: "kine",
      build: buildDrums, target: [0, 0, 0], off: fly(0, 2.5, 1.6) });
    def({ id: "inputs", name: "INPUTS · 输入轮 + 进位杆", sub: "辐条轮 36°/位 · sautoir ×5", phase: 2, at: 11.8, dur: 1.4, kind: "kine",
      build: buildInputs, target: [0, 0, 0], off: fly(0, 2.5, 1.6) });
  };

  /* —— 运动学分发(每帧)—— */
  MECH.KINE = function (st) {
    var sch = KS.scheduleAt(st.days);
    /* 输入轮:rotation.z = −(wheel 数字 + 活动进度)×36° */
    var inp = MECH.Parts.entry("inputs");
    if (inp && inp.shown) {
      inp.group.userData.wheels.forEach(function (w, i) {
        var dg = sch.dg[i];
        var extra = 0;
        if (sch.active && sch.active.move.wheel === i) {
          extra = sch.active.move.add * sch.active.progress;
        }
        w.rotation.z = (dg + extra) * D.STEP;   // 轮面朝 +z,绕 z 轴自转
      });
      /* sautoir:carryFrac 0→1 立起再落下 */
      inp.group.userData.sautoirs.forEach(function (s, i) {
        var f = 0;
        if (sch.active && sch.active.move.wheel === i + 1 && sch.active.crossed > 0) {
          var cf = sch.active.carryFrac;
          f = Math.sin(cf * Math.PI);       // 立起-落下
        }
        s.rotation.z = f * 1.1;
      });
    }
    /* 读数窗数字(变更时换贴图) */
    var dr = MECH.Parts.entry("drums");
    if (dr && dr.shown) {
      var shown = dr.group.userData.lastShown;
      for (var i = 0; i < D.DIGITS; i++) {
        var d = Math.round(sch.dg[i]) % 10;
        if (d !== shown[i]) {
          shown[i] = d;
          dr.group.userData.windows[i].material = digitMaterial(d);
        }
      }
    }
  };
})(window.MECH = window.MECH || {});
