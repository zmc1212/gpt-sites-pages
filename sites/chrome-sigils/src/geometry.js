/* chrome-sigils — 几何管线(双路径)
 *
 * 【成品路径】距离场并集(对齐原作 three-sigils 的核心思路):
 *   笔画 → 定半径角圆化 → 弧长重采样 → 平滑 → 带半径骨架点云
 *   → 2D 距离场(h = max_i √(r_i² − d_i²),即全部「变半径球」的并集高度)
 *   → 双片高度场网格 z = ±h + 轮廓缝合(z 归零 + 沿 ∇h 外推到等值线)
 *   交叉处天然光滑融合,无自交接缝;法线由场梯度解析给出。
 *
 * 【预览路径】绘制进行中用经典扫掠管(单笔,快),松手即融合进并集网格。
 *
 * 平面笔画位于 XY 面;骨架/场/网格全部在模型空间 z=0 平面上。
 */
(function (global) {
  'use strict';

  // ---------- 基础:去重 / 重采样 / 平滑 ----------
  function dedupe(points, minDist) {
    var out = [];
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      if (!out.length || Math.hypot(p.x - out[out.length - 1].x, p.y - out[out.length - 1].y) >= minDist) {
        out.push({ x: p.x, y: p.y });
      }
    }
    return out;
  }

  function resamplePath(points, spacing, closed) {
    var path = closed ? points.concat([points[0]]) : points;
    if (path.length < 2) return path.slice();
    var out = [{ x: path[0].x, y: path[0].y }];
    var target = spacing, acc = 0;
    for (var i = 1; i < path.length; i++) {
      var ax = path[i - 1].x, ay = path[i - 1].y;
      var bx = path[i].x, by = path[i].y;
      var d = Math.hypot(bx - ax, by - ay);
      if (d < 1e-9) continue;
      while (target <= acc + d) {
        var t = (target - acc) / d;
        out.push({ x: ax + (bx - ax) * t, y: ay + (by - ay) * t });
        target += spacing;
      }
      acc += d;
    }
    if (closed && out.length > 1) {
      var tail = out[out.length - 1];
      if (Math.hypot(tail.x - out[0].x, tail.y - out[0].y) < spacing * 0.5) out.pop();
    }
    return out;
  }

  function smooth(points, passes, closed) {
    var pts = points;
    for (var p = 0; p < passes; p++) {
      var next = new Array(pts.length);
      for (var i = 0; i < pts.length; i++) {
        var a = pts[(i - 1 + pts.length) % pts.length];
        var b = pts[i];
        var c = pts[(i + 1) % pts.length];
        if (!closed && (i === 0 || i === pts.length - 1)) { next[i] = { x: b.x, y: b.y }; continue; }
        next[i] = {
          x: b.x * 0.5 + (a.x + c.x) * 0.25,
          y: b.y * 0.5 + (a.y + c.y) * 0.25
        };
      }
      pts = next;
    }
    return pts;
  }

  // ---------- 定半径角圆化 ----------
  function roundCorners(points, closed, maxR) {
    var n = points.length;
    if (n < 3) return points;
    var out = [];
    if (!closed) out.push({ x: points[0].x, y: points[0].y });
    var start = closed ? 0 : 1;
    var end = closed ? n : n - 1;
    for (var i = start; i < end; i++) {
      var pPrev = points[(i - 1 + n) % n];
      var pCur = points[i];
      var pNext = points[(i + 1) % n];
      var v1x = pCur.x - pPrev.x, v1y = pCur.y - pPrev.y;
      var v2x = pNext.x - pCur.x, v2y = pNext.y - pCur.y;
      var l1 = Math.hypot(v1x, v1y), l2 = Math.hypot(v2x, v2y);
      if (l1 < 1e-9 || l2 < 1e-9) { out.push({ x: pCur.x, y: pCur.y }); continue; }
      var d1x = v1x / l1, d1y = v1y / l1;
      var d2x = v2x / l2, d2y = v2y / l2;
      if (d1x * d2x + d1y * d2y > 0.995) { out.push({ x: pCur.x, y: pCur.y }); continue; }
      var rc = Math.min(maxR, l1 * 0.42, l2 * 0.42);
      var ax = pCur.x - d1x * rc, ay = pCur.y - d1y * rc;
      var bx = pCur.x + d2x * rc, by = pCur.y + d2y * rc;
      for (var t = 0; t <= 4; t++) {
        var u = t / 4;
        var m1x = ax + (pCur.x - ax) * u, m1y = ay + (pCur.y - ay) * u;
        var m2x = pCur.x + (bx - pCur.x) * u, m2y = pCur.y + (by - pCur.y) * u;
        out.push({ x: m1x + (m2x - m1x) * u, y: m1y + (m2y - m1y) * u });
      }
    }
    if (!closed) out.push({ x: points[n - 1].x, y: points[n - 1].y });
    return out;
  }

  // ---------- 半径包络 ----------
  function radiusAt(s, L, R, open) {
    if (!open) return R;
    var cap = Math.min(R * 1.08, L * 0.30);
    var r = R;
    if (s < cap) r = R * Math.sqrt(Math.max(0, 1 - Math.pow(1 - s / cap, 2)));
    else if (s > L - cap) r = R * Math.sqrt(Math.max(0, 1 - Math.pow(1 - (L - s) / cap, 2)));
    else r = R * (1 + 0.05 * Math.sin(Math.PI * (s - cap) / Math.max(1e-6, L - 2 * cap)));
    return Math.max(0, r);
  }

  // ---------- 骨架构建:点云 [{x, y, r}] ----------
  function buildSkeleton(rawPts, width, closed) {
    var R = width / 2;
    var pts = rawPts;
    if (pts.length < 2) {
      return [{ x: pts[0].x, y: pts[0].y, r: R }];
    }
    var rounded = roundCorners(pts, closed, R * 2.2);
    var spacing = Math.max(R * 0.35, 0.010);
    var skeleton = resamplePath(rounded, spacing, closed);
    skeleton = smooth(skeleton, closed ? 3 : 4, closed);

    // 弧长 → 每点半径(端帽收口 + 中段轻鼓)
    var out = [];
    var n = skeleton.length;
    if (n === 1) return [{ x: skeleton[0].x, y: skeleton[0].y, r: R }];
    // 先算累计弧长
    var total = 0;
    var cum = [0];
    for (var i = 1; i < n; i++) {
      total += Math.hypot(skeleton[i].x - skeleton[i - 1].x, skeleton[i].y - skeleton[i - 1].y);
      cum.push(total);
    }
    if (closed) {
      total += Math.hypot(skeleton[0].x - skeleton[n - 1].x, skeleton[0].y - skeleton[n - 1].y);
    }
    for (i = 0; i < n; i++) {
      var s = closed ? cum[i] : cum[i];
      out.push({
        x: skeleton[i].x, y: skeleton[i].y,
        r: radiusAt(s, total, R, !closed)
      });
    }
    // 闭合环:补上首点副本,距离场沿「末点 → 首点」连段封口
    if (closed && out.length > 1) {
      out.push({ x: out[0].x, y: out[0].y, r: out[0].r });
    }
    return out;
  }

  // ---------- 距离场 ----------
  /* skel: 所有骨架点(含镜像) [{x,y,r}]
   * 返回 { h: Float32Array, nx, ny, ox, oy, g, maxR }
   */
  function buildField(skel) {
    var minR = Infinity, maxR = 0;
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    var j, c;
    for (var i = 0; i < skel.length; i++) {
      var p = skel[i];
      if (p.r <= 0) continue;
      if (p.r < minR) minR = p.r;
      if (p.r > maxR) maxR = p.r;
      if (p.x - p.r < minX) minX = p.x - p.r;
      if (p.y - p.r < minY) minY = p.y - p.r;
      if (p.x + p.r > maxX) maxX = p.x + p.r;
      if (p.y + p.r > maxY) maxY = p.y + p.r;
    }
    if (!isFinite(minR)) return null;

    // 网格步长:跟随最细笔画,总单元数超限时自动放粗
    var g = Math.min(0.02, Math.max(0.005, minR * 0.10));
    var spanX = maxX - minX + maxR * 2, spanY = maxY - minY + maxR * 2;
    var MAXCELLS = 340 * 340;
    if ((spanX / g) * (spanY / g) > MAXCELLS) {
      g = Math.max(spanX, spanY) / Math.sqrt(MAXCELLS);
    }
    var ox = minX - maxR, oy = minY - maxR;
    var nx = Math.min(760, Math.ceil(spanX / g) + 2);
    var ny = Math.min(760, Math.ceil(spanY / g) + 2);

    var h = new Float32Array(nx * ny);

    // 线段基元:相邻骨架点连成胶囊段,距离连续、半径线性插值,
    // 消除「点球并集」沿笔画方向的 max 皱褶(铬面会放大成绗缝纹)。
    function stampSegment(ax, ay, ar, bx, by, br) {
      var loX = Math.min(ax, bx) - Math.max(ar, br);
      var hiX = Math.max(ax, bx) + Math.max(ar, br);
      var loY = Math.min(ay, by) - Math.max(ar, br);
      var hiY = Math.max(ay, by) + Math.max(ar, br);
      var i0 = Math.max(0, Math.floor((loX - ox) / g));
      var i1 = Math.min(nx - 1, Math.ceil((hiX - ox) / g));
      var j0 = Math.max(0, Math.floor((loY - oy) / g));
      var j1 = Math.min(ny - 1, Math.ceil((hiY - oy) / g));
      var vx = bx - ax, vy = by - ay;
      var vLen2 = vx * vx + vy * vy;
      for (var j = j0; j <= j1; j++) {
        var cy = oy + j * g;
        var row = j * nx;
        for (var c = i0; c <= i1; c++) {
          var cx = ox + c * g;
          var t = vLen2 > 1e-12 ? ((cx - ax) * vx + (cy - ay) * vy) / vLen2 : 0;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          var px = ax + vx * t, py = ay + vy * t;
          var dx = cx - px, dy = cy - py;
          var d2 = dx * dx + dy * dy;
          var r = ar + (br - ar) * t;
          if (r <= 0) continue;
          var r2 = r * r;
          if (d2 < r2) {
            var hh = Math.sqrt(r2 - d2);
            var idx = row + c;
            if (hh > h[idx]) h[idx] = hh;
          }
        }
      }
    }

    // 单独的孤立点(单点笔画圆珠)
    for (i = 0; i < skel.length; i++) {
      if (skel[i].r > 0) stampSegment(skel[i].x, skel[i].y, skel[i].r, skel[i].x, skel[i].y, skel[i].r);
    }
    // 相邻骨架点连段(开放笔画不接首尾;闭合环由 buildSkeleton 保证首尾不重复)
    for (i = 0; i + 1 < skel.length; i++) {
      // 仅当两点属于同一笔画才连段;跨笔画首尾误连会画出横穿的长胶囊。
      // 约定:skel 数组内笔画之间以 r===-1 的分隔点标记。
      if (skel[i + 1].r === -1 || skel[i].r === -1) continue;
      stampSegment(skel[i].x, skel[i].y, skel[i].r, skel[i + 1].x, skel[i + 1].y, skel[i + 1].r);
    }

    // 轻高斯平滑:软化残留的网格纹与交叉并集皱褶(可分离 [1 2 1] 两趟)
    var tmp = new Float32Array(h.length);
    for (var pass = 0; pass < 2; pass++) {
      for (j = 0; j < ny; j++) {
        var row = j * nx;
        for (c = 0; c < nx; c++) {
          var l = c > 0 ? h[row + c - 1] : 0;
          var m = h[row + c];
          var r = c < nx - 1 ? h[row + c + 1] : 0;
          tmp[row + c] = (l + 2 * m + r) * 0.25;
        }
      }
      for (j = 0; j < ny; j++) {
        var row2 = j * nx;
        for (c = 0; c < nx; c++) {
          var u2 = j > 0 ? tmp[row2 - nx + c] : 0;
          var m2 = tmp[row2 + c];
          var d2v = j < ny - 1 ? tmp[row2 + nx + c] : 0;
          h[row2 + c] = (u2 + 2 * m2 + d2v) * 0.25;
        }
      }
    }

    return { h: h, nx: nx, ny: ny, ox: ox, oy: oy, g: g, maxR: maxR };
  }

  // ---------- 场 → 网格(双片 + 轮廓缝合) ----------
  function fieldToGeometry(field) {
    if (!field) return new THREE.BufferGeometry();
    var h = field.h, nx = field.nx, ny = field.ny, g = field.g;
    var ox = field.ox, oy = field.oy;

    var inside = new Uint8Array(nx * ny);
    var upperIdx = new Int32Array(nx * ny).fill(-1);  // 上片顶点索引
    var lowerIdx = new Int32Array(nx * ny).fill(-1);
    var positions = [], normals = [];
    var i, j, c, idx;

    for (idx = 0; idx < nx * ny; idx++) inside[idx] = h[idx] > 0 ? 1 : 0;

    function cellX(cIdx) { return ox + (cIdx % nx) * g; }
    function cellY(cIdx) { return oy + Math.floor(cIdx / nx) * g; }

    // 场梯度(中心差分,界外作 0)
    function gradAt(cIdx, out) {
      var ci = cIdx % nx, cj = (cIdx / nx) | 0;
      var l = ci > 0 ? h[cIdx - 1] : 0;
      var r = ci < nx - 1 ? h[cIdx + 1] : 0;
      var d = cj > 0 ? h[cIdx - nx] : 0;
      var u = cj < ny - 1 ? h[cIdx + nx] : 0;
      out.x = (r - l) / (2 * g);
      out.y = (u - d) / (2 * g);
      return out;
    }

    var grad = { x: 0, y: 0 };

    // 顶点:内部单元上下片;边界单元顶点外推到轮廓(z 归零)
    for (j = 0; j < ny; j++) {
      for (c = 0; c < nx; c++) {
        idx = j * nx + c;
        if (!inside[idx]) continue;
        var x = cellX(idx), y = cellY(idx);
        gradAt(idx, grad);
        var gl = Math.hypot(grad.x, grad.y);

        // 边界判定:四邻有外部单元
        var boundary =
          (c === 0 || !inside[idx - 1]) || (c === nx - 1 || !inside[idx + 1]) ||
          (j === 0 || !inside[idx - nx]) || (j === ny - 1 || !inside[idx + nx]);

        var iU, iL;
        if (boundary) {
          // 沿 -∇h(朝外)外推到 h=0 等值线:dist = h / |∇h|
          var dist = gl > 1e-6 ? Math.min(1.15 * g, Math.max(0.2 * g, h[idx] / gl)) : 0.5 * g;
          var bx = x - (gl > 1e-6 ? grad.x / gl : 0) * dist;
          var by = y - (gl > 1e-6 ? grad.y / gl : 0) * dist;
          // 轮廓处法线:接近水平朝外
          var nxr = gl > 1e-6 ? -grad.x / gl : 0;
          var nyr = gl > 1e-6 ? -grad.y / gl : 0;
          var invN = 1 / Math.max(1e-6, Math.hypot(nxr, nyr, 0.28));
          iU = positions.length / 3;
          positions.push(bx, by, 0);
          normals.push(nxr * invN, nyr * invN, 0.28 * invN);
          iL = positions.length / 3;
          positions.push(bx, by, 0);
          normals.push(nxr * invN, nyr * invN, -0.28 * invN);
        } else {
          gradAt(idx, grad);
          var inv = 1 / Math.max(1e-9, Math.hypot(grad.x, grad.y, 1));
          iU = positions.length / 3;
          positions.push(x, y, h[idx]);
          normals.push(-grad.x * inv, -grad.y * inv, inv);
          iL = positions.length / 3;
          positions.push(x, y, -h[idx]);
          normals.push(grad.x * inv, grad.y * inv, -inv);
        }
        upperIdx[idx] = iU;
        lowerIdx[idx] = iL;
      }
    }

    // 三角化:按 2×2 单元块分类。
    //  k=4:标准四边形(上片 CCW,下片反向);
    //  k=3:L 形三单元 → 一片内一个三角,绕向按单元中心符号面积自动翻转;
    //  k≤2:跳过。边界单元顶点已外推到轮廓并 z 归零,端帽/收口自动闭合。
    var indices = [];
    function tri(sheet, i0, i1, i2) {
      var U = sheet === 0 ? upperIdx : lowerIdx;
      indices.push(U[i0], U[i1], U[i2]);
    }
    for (j = 0; j < ny - 1; j++) {
      for (c = 0; c < nx - 1; c++) {
        var a = j * nx + c;
        var b = a + 1;
        var d2i = a + nx;
        var e = d2i + 1;
        var ka = inside[a], kb = inside[b], kd = inside[d2i], ke = inside[e];
        var k = ka + kb + kd + ke;
        if (k === 4) {
          tri(0, a, b, e); tri(0, a, e, d2i);
          tri(1, a, e, b); tri(1, a, d2i, e);
        } else if (k === 3) {
          var cs = [a, b, d2i, e].filter(function (q) { return inside[q]; });
          var x0 = cellX(cs[0]), y0 = cellY(cs[0]);
          var x1 = cellX(cs[1]), y1 = cellY(cs[1]);
          var x2 = cellX(cs[2]), y2 = cellY(cs[2]);
          var crossV = (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
          if (crossV > 0) { tri(0, cs[0], cs[1], cs[2]); tri(1, cs[0], cs[2], cs[1]); }
          else { tri(0, cs[0], cs[2], cs[1]); tri(1, cs[0], cs[1], cs[2]); }
        }
      }
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setIndex(indices);
    geo.computeBoundingSphere();
    geo.computeBoundingBox();
    return geo;
  }

  // ---------- 预览路径:经典扫掠管(进行中的笔画) ----------
  function buildSigilGeometry(strokePts, width, opts) {
    opts = opts || {};
    var closed = !!opts.closed;
    var R = width / 2;
    var radialSegs = opts.radialSegs || 20;

    if (strokePts.length < 2) {
      var bead = new THREE.SphereGeometry(R, 20, 14);
      bead.translate(strokePts[0].x, strokePts[0].y, 0);
      return bead;
    }

    var skeleton = buildSkeleton(strokePts, width, closed);
    var vecs = skeleton.map(function (p) { return new THREE.Vector3(p.x, p.y, 0); });
    var curve = new THREE.CatmullRomCurve3(vecs, closed, 'catmullrom', 0.5);
    var L = curve.getLength();

    var ringCount = closed
      ? Math.min(200, Math.max(24, Math.round(L / (R * 0.5))))
      : Math.min(240, Math.max(20, Math.round(L / (R * 0.42))));
    var us = new Array(ringCount);
    for (var j = 0; j < ringCount; j++) {
      us[j] = closed ? j / ringCount : 0.5 - 0.5 * Math.cos(Math.PI * j / (ringCount - 1));
    }

    var Z_AXIS = new THREE.Vector3(0, 0, 1);
    var positions = [], normals = [], indices = [];
    var ringStart = new Array(ringCount), ringVerts = new Array(ringCount);

    for (j = 0; j < ringCount; j++) {
      var u = us[j];
      var C = curve.getPointAt(u);
      var T = curve.getTangentAt(u);
      if (T.lengthSq() < 1e-9) T.set(1, 0, 0); else T.normalize();
      var N = new THREE.Vector3().crossVectors(T, Z_AXIS).normalize();
      var B = new THREE.Vector3().crossVectors(T, N);
      var r = radiusAt(u * L, L, R, !closed);
      var ringR = Math.max(r, R * 0.02);
      ringStart[j] = positions.length / 3;
      if (r < R * 0.02) {
        ringVerts[j] = 1;
        positions.push(C.x, C.y, C.z);
        var pn = u < 0.5 ? -1 : 1;
        normals.push(T.x * pn, T.y * pn, T.z * pn);
      } else {
        ringVerts[j] = radialSegs;
        for (var k = 0; k < radialSegs; k++) {
          var th = (k / radialSegs) * Math.PI * 2;
          var rad = new THREE.Vector3()
            .addScaledVector(N, Math.cos(th))
            .addScaledVector(B, Math.sin(th));
          positions.push(C.x + rad.x * ringR, C.y + rad.y * ringR, C.z + rad.z * ringR);
          var nrm = new THREE.Vector3().addScaledVector(rad, 1).normalize();
          normals.push(nrm.x, nrm.y, nrm.z);
        }
      }
    }

    var stripCount = closed ? ringCount : ringCount - 1;
    for (j = 0; j < stripCount; j++) {
      var a0 = ringStart[j], aSeg = ringVerts[j];
      var b0 = ringStart[(j + 1) % ringCount], bSeg = ringVerts[(j + 1) % ringCount];
      for (k = 0; k < radialSegs; k++) {
        var k1 = (k + 1) % radialSegs;
        var ai0 = a0 + (aSeg === 1 ? 0 : k);
        var ai1 = a0 + (aSeg === 1 ? 0 : k1);
        var bi0 = b0 + (bSeg === 1 ? 0 : k);
        var bi1 = b0 + (bSeg === 1 ? 0 : k1);
        indices.push(ai0, bi0, bi1);
        indices.push(ai0, bi1, ai1);
      }
    }

    var geo2 = new THREE.BufferGeometry();
    geo2.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo2.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo2.setIndex(indices);
    geo2.computeBoundingSphere();
    return geo2;
  }

  // ---------- 镜像 / 拾取辅助 ----------
  function mirrorStroke(pts) {
    return pts.map(function (p) { return { x: -p.x, y: p.y }; }).reverse();
  }

  var _ray = null, _plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  function screenToPlane(clientNdcX, clientNdcY, camera) {
    _ray = _ray || new THREE.Raycaster();
    _ray.setFromCamera({ x: clientNdcX, y: clientNdcY }, camera);
    var hit = new THREE.Vector3();
    return _ray.ray.intersectPlane(_plane, hit) ? { x: hit.x, y: hit.y } : null;
  }

  global.SigilGeom = {
    build: buildSigilGeometry,          // 预览扫掠管
    buildSkeleton: buildSkeleton,
    buildField: buildField,
    fieldToGeometry: fieldToGeometry,   // 成品并集网格
    mirrorStroke: mirrorStroke,
    screenToPlane: screenToPlane
  };
})(window);
