/* 轨道相机 —— 拖动旋转 / 滚轮与双指缩放 / 阻尼 / 预设机位飞行
 * theta 为相机绕目标的方位角(度,自正北顺时针),phi 为仰角(弧度) */
(function (global) {
  'use strict';
  var U = global.STUtil;

  function azRad(d) { return d * Math.PI / 180; }

  function create(camera, dom) {
    var st = {
      target: new THREE.Vector3(0, 3, 0),
      radius: 98,
      theta: 49.3,      // 相机所在方位角(度)
      phi: 0.14,
      // 阻尼追值
      dTarget: new THREE.Vector3(0, 3, 0),
      dRadius: 98, dTheta: 49.3, dPhi: 0.14,
      minR: 3, maxR: 420, minPhi: 0.004, maxPhi: 1.32
    };
    var tween = null;
    var pointers = new Map();
    var lastPinch = 0, moved = 0;

    function clampPhi(p) { return U.clamp(p, st.minPhi, st.maxPhi); }

    function flyTo(p, dur) {
      tween = {
        t: 0, dur: dur || 2.2,
        from: { t: st.theta, p: st.phi, r: st.radius, tg: st.target.clone() },
        to: { t: p.theta, p: p.phi, r: p.radius, tg: p.target.clone() }
      };
      // 方位角走最短路径
      var d = ((to360(p.theta) - to360(st.theta)) % 360 + 540) % 360 - 180;
      tween.to.t = to360(st.theta) + d;
    }
    function to360(x) { return ((x % 360) + 360) % 360; }

    function setImmediate(p) {
      tween = null;
      st.theta = st.dTheta = p.theta;
      st.phi = st.dPhi = p.phi;
      st.radius = st.dRadius = p.radius;
      st.target.copy(p.target); st.dTarget.copy(p.target);
    }

    /* 输入 */
    dom.addEventListener('pointerdown', function (e) {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved = 0;
      try { dom.setPointerCapture && dom.setPointerCapture(e.pointerId); } catch (err) { /* 合成事件无活跃指针 */ }
      tween = null;
    });
    dom.addEventListener('pointermove', function (e) {
      if (!pointers.has(e.pointerId)) return;
      var pr = pointers.get(e.pointerId);
      var dx = e.clientX - pr.x, dy = e.clientY - pr.y;
      pr.x = e.clientX; pr.y = e.clientY;
      if (pointers.size === 1) {
        moved += Math.abs(dx) + Math.abs(dy);
        st.dTheta += dx * 0.23;
        st.dPhi = clampPhi(st.dPhi + dy * 0.0016);
      } else if (pointers.size === 2) {
        var arr = Array.from(pointers.values());
        var dist = Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y);
        if (lastPinch > 0) {
          st.dRadius = U.clamp(st.dRadius * (lastPinch / Math.max(1, dist)), st.minR, st.maxR);
        }
        lastPinch = dist;
      }
    });
    function up(e) {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) lastPinch = 0;
    }
    dom.addEventListener('pointerup', up);
    dom.addEventListener('pointercancel', up);
    dom.addEventListener('wheel', function (e) {
      e.preventDefault();
      tween = null;
      var f = Math.pow(1.0016, e.deltaY);
      st.dRadius = U.clamp(st.dRadius * f, st.minR, st.maxR);
    }, { passive: false });
    dom.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    function tick(dt, onMoved) {
      if (tween) {
        tween.t += dt;
        var k = U.smoothstep(0, 1, Math.min(1, tween.t / tween.dur));
        st.dTheta = U.lerp(tween.from.t, tween.to.t, k);
        st.dPhi = U.lerp(tween.from.p, tween.to.p, k);
        st.dRadius = U.lerp(tween.from.r, tween.to.r, k);
        st.dTarget.lerpVectors(tween.from.tg, tween.to.tg, k);
        if (tween.t >= tween.dur) tween = null;
      }
      var k2 = 1 - Math.exp(-dt * 7);
      st.theta += (st.dTheta - st.theta) * k2;
      st.phi += (st.dPhi - st.phi) * k2;
      st.radius += (st.dRadius - st.radius) * k2;
      st.target.lerp(st.dTarget, k2);

      var th = azRad(st.theta);
      var cp = Math.cos(st.phi);
      camera.position.set(
        st.target.x + st.radius * cp * Math.sin(th),
        Math.max(0.8, st.target.y + st.radius * Math.sin(st.phi)),
        st.target.z - st.radius * cp * Math.cos(th)
      );
      camera.lookAt(st.target);
      if (onMoved) onMoved(st);
    }

    return { tick: tick, flyTo: flyTo, setImmediate: setImmediate, state: st };
  }

  global.STCameraCtl = { create: create };
})(window);
