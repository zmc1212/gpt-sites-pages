/* 渲染:DPR 画布 / 圆环链 / 笔尖轨迹 / 目标幽灵 / 手绘捕捉 */
(function (FE) {
  function Renderer(canvas) {
    this.cv = canvas;
    this.ctx = canvas.getContext("2d");
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.resize();
    this.showCircles = true;
    this.showArms = true;
    this.showTarget = true;
    this.speed = 1;
    this.pen = [];              // 已绘轨迹
    this.drawing = [];          // 手绘中的点
    this.drawMode = false;
    this.scale = 150;           // 世界半径 1 → 像素
  }
  Renderer.prototype.resize = function () {
    var wrap = document.getElementById("stage-wrap");
    this.w = wrap.clientWidth;
    this.h = wrap.clientHeight;
    this.cv.width = this.w * this.dpr;
    this.cv.height = this.h * this.dpr;
    this.cv.style.width = this.w + "px";
    this.cv.style.height = this.h + "px";
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.cx = this.w * 0.5;
    this.cy = this.h * 0.5;
    this.scale = Math.min(this.w, this.h) * 0.34;
  };
  /* 世界 → 屏幕 */
  Renderer.prototype.toPx = function (x, y) {
    return [this.cx + x * this.scale, this.cy + y * this.scale];
  };
  Renderer.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.w, this.h);
    /* 蓝图网格 */
    var ctx = this.ctx;
    ctx.strokeStyle = "rgba(233,238,242,0.05)";
    ctx.lineWidth = 1;
    var g = 36;
    for (var x = g; x < this.w; x += g) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.h); ctx.stroke(); }
    for (var y = g; y < this.h; y += g) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.w, y); ctx.stroke(); }
    ctx.strokeStyle = "rgba(233,238,242,0.12)";
    ctx.beginPath(); ctx.moveTo(this.cx, 0); ctx.lineTo(this.cx, this.h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, this.cy); ctx.lineTo(this.w, this.cy); ctx.stroke();
  };
  Renderer.prototype.drawTarget = function (path, alpha) {
    var ctx = this.ctx;
    ctx.strokeStyle = "rgba(233,238,242," + (alpha || 0.28) + ")";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    for (var i = 0; i < FE.MATH.M; i++) {
      var p = this.toPx(path[2 * i], path[2 * i + 1]);
      if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
    }
    ctx.closePath(); ctx.stroke();
    ctx.setLineDash([]);
  };
  Renderer.prototype.drawChain = function (rings) {
    var ctx = this.ctx;
    var prev = this.toPx(0, 0);
    for (var i = 0; i < rings.length; i++) {
      var r = rings[i];
      var c = prev;
      var tip = this.toPx(r.x, r.y);
      if (this.showCircles && r.r > 0.004) {
        ctx.strokeStyle = "rgba(127,216,216," + Math.max(0.16, 0.6 - i * 0.02) + ")";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(c[0], c[1], r.r * this.scale, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (this.showArms) {
        ctx.strokeStyle = "rgba(233,201,60,0.55)";
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(tip[0], tip[1]); ctx.stroke();
      }
      prev = tip;
    }
    /* 笔尖 */
    ctx.fillStyle = "#E9C93C";
    ctx.beginPath(); ctx.arc(prev[0], prev[1], 3.2, 0, Math.PI * 2); ctx.fill();
    return prev;
  };
  Renderer.prototype.drawPen = function () {
    if (this.pen.length < 2) return;
    var ctx = this.ctx;
    ctx.strokeStyle = "#FFD34E";
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (var i = 0; i < this.pen.length; i++) {
      var p = this.toPx(this.pen[i][0], this.pen[i][1]);
      if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
    }
    ctx.stroke();
  };
  Renderer.prototype.drawStroke = function () {
    if (this.drawing.length < 2) return;
    var ctx = this.ctx;
    ctx.strokeStyle = "#7FD8D8";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    for (var i = 0; i < this.drawing.length; i++) {
      var p = this.drawing[i];
      if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  };
  Renderer.prototype.penClear = function () { this.pen = []; };
  FE.Renderer = Renderer;
})(window.FE = window.FE || {});
