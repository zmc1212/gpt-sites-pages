/* CSS 标签层:暗金零件标签(飞行宣告 + 阶段固定标签),世界坐标投影 */
(function (C64B) {
  var container = null;
  var active = new Map();
  var pinned = new Map();

  function init() {
    container = document.createElement("div");
    container.id = "tags";
    document.getElementById("stage").appendChild(container);
  }

  function makeEl(text, sub, tone) {
    var el = document.createElement("div");
    el.className = "tag" + (tone === "white" ? " white" : "");
    el.textContent = text;
    if (sub) {
      var s = document.createElement("span");
      s.className = "sub";
      s.textContent = sub;
      el.appendChild(s);
    }
    container.appendChild(el);
    return el;
  }

  var _v = new THREE.Vector3();

  function anchorToWorld(obj) {
    /* 无预置锚点的对象(如板上小件)默认用其局部原点上方一点 */
    if (!obj.userData.tagAnchor) obj.userData.tagAnchor = new THREE.Vector3(0, 0.06, 0);
    return obj.localToWorld(_v.copy(obj.userData.tagAnchor));
  }

  function place(el, worldPos) {
    _v.copy(worldPos).project(C64B.Scene3D.camera);
    if (_v.z > 1) { el.style.display = "none"; return; }
    var x = (_v.x * 0.5 + 0.5) * container.clientWidth;
    var y = (-_v.y * 0.5 + 0.5) * container.clientHeight;
    el.style.display = "";
    el.style.left = x + "px";
    el.style.top = (y - 14) + "px";
  }

  /* 短暂宣告标签:飞行开始时出现,holdMs 后消失 */
  function announce(id, obj, text, sub, now, holdMs, tone) {
    var a = active.get(id);
    if (!a) {
      a = { obj: obj, el: makeEl(text, sub, tone), until: now + holdMs };
      active.set(id, a);
    } else {
      a.until = now + holdMs;
      a.obj = obj;
    }
  }

  /* 阶段固定标签 */
  function setPinned(list) {
    pinned.forEach(function (p) { p.el.remove(); });
    pinned.clear();
    (list || []).forEach(function (item) {
      pinned.set(item.id, {
        obj: item.obj,
        el: makeEl(item.text, item.sub || null, item.tone || "yellow")
      });
    });
  }

  function clearAnnounce() {
    active.forEach(function (a) { a.el.remove(); });
    active.clear();
  }

  function update() {
    var now = performance.now();
    active.forEach(function (a, id) {
      if (now > a.until) { a.el.remove(); active.delete(id); return; }
      var w = anchorToWorld(a.obj);
      if (w) place(a.el, w);
    });
    pinned.forEach(function (p) {
      var w = anchorToWorld(p.obj);
      if (w) place(p.el, w);
    });
  }

  C64B.Labels = { init: init, announce: announce, setPinned: setPinned, update: update, clearAnnounce: clearAnnounce };
})(window.C64B = window.C64B || {});
