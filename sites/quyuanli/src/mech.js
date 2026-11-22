/* 曲辕犁 — 尺寸常量与犁评-耕深运动学求解器
   文献依据:唐·陆龟蒙《耒耜经》江东犁十一部件:犁铧、犁壁、犁底、压镵、
   策额、犁箭、犁辕、犁梢、犁评、犁建。「犁评,进则深,退则浅」——
   犁评沿犁辕前段滑移,犁建锁定,经犁箭改变犁体对地倾角 → 耕深调节。

   耕深运动学(载入期断言):
     犁体绕犁底后端着地点翻转,铧尖没入土床:
       倾角 θ(u) = θ0 + k·u,u ∈ [0, U] 评行程
       θ0 = 1.5°,k = 20°/m,U = 0.30 m → θ ∈ [1.5°, 7.5°]
       耕深 d = a·tanθ,a = 1.1 m(犁底长)→ d ∈ [0.029, 0.145] m
     断言:d 单调递增、d ∈ [0.02, 0.16]、铧尖不低于土床底(0.22−0.16 > 0)。
   土床:抬高土床顶 0.22(不透明),铧入土为设计性没入,不入全球地面。
   犁行进:x 向步行 v = 0.55 m/s,沟迹随行延伸(只增不减)。 */
(function (MECH) {
  var D = {
    /* 犁体(m) */
    aSole: 1.10,            // 犁底长(铧尖到后端着地)
    theta0: 1.5, kTheta: 20, U: 0.30,   // 评行程 → 倾角
    shareL: 0.34, shareW: 0.30,         // 犁铧
    moldL: 0.42,                        // 犁壁
    shaftRise: 0.62,                    // 辕前端高(轭位)
    handleH: 0.98,                      // 犁梢高
    /* 土床 */
    bedTop: 0.22, bedX0: -3.6, bedX1: 5.6, bedZ: 1.05,
    furrowW: 0.16, furrowD: 0.05,
    /* 行进 */
    vWalk: 0.55, xStart: -0.6, xFar: 3.2,
    /* 呼吸起伏 */
    bobA: 0.004, bobF: 2.6
  };
  D.bedBase = 0.0;
  D.dMax = D.aSole * Math.tan((D.theta0 + D.kTheta * D.U) * Math.PI / 180);   // 0.145
  D.dMin = D.aSole * Math.tan(D.theta0 * Math.PI / 180);                      // 0.029

  function deg(a) { return a * 180 / Math.PI; }
  function rad(a) { return a * Math.PI / 180; }
  function ease(t) { return MECH.P.easeInOut(t); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 评行程 u → 倾角/耕深 */
  function thetaOf(u) { return D.theta0 + D.kTheta * clamp(u, 0, D.U); }
  function depthOf(u) { return D.aSole * Math.tan(rad(thetaOf(u))); }

  MECH.DIM = D;
  MECH.KS = { deg: deg, rad: rad, ease: ease, clamp: clamp, thetaOf: thetaOf, depthOf: depthOf };

  /* 载入期自检:耕深单调、量程、铧尖不入土床底、评行程闭合 */
  (function selfCheck() {
    var msg = null;
    var d0 = depthOf(0), d1 = depthOf(D.U), dMid = depthOf(D.U / 2);
    if (!(D.dMin < dMid && dMid < D.dMax)) {
      msg = "曲辕犁耕深单调自检失败: d(0)=" + d0.toFixed(3) + " d(U/2)=" + dMid.toFixed(3) + " d(U)=" + d1.toFixed(3);
    } else if (!(d0 >= 0.02 && d1 <= 0.16)) {
      msg = "曲辕犁耕深量程自检失败: d ∈ [" + d0.toFixed(3) + ", " + d1.toFixed(3) + "]";
    } else if (D.bedTop - d1 <= D.bedBase + 0.04) {
      msg = "曲辕犁入土自检失败: 铧尖距土床底不足(d=" + d1.toFixed(3) + ")";
    } else if (Math.abs(thetaOf(D.U) - (D.theta0 + D.kTheta * D.U)) > 1e-9) {
      msg = "曲辕犁评行程自检失败: θ(U) ≠ θ0 + k·U";
    }
    if (msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
