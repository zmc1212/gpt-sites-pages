(() => {
  // src/utils.js
  var lerp = (a, b, n) => (1 - n) * a + n * b;
  var map = (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c;
  var calcWinsize = () => ({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // src/image-trail.js
  var defaults = {
    totalTrailElements: 5,
    valuesFromTo: {
      x: [-90, 90],
      y: [-90, 90],
      rx: [0, 0],
      ry: [0, 0],
      rz: [0, 0]
    },
    opacityChange: false,
    perspective: 0,
    amt: (pos) => 0.02 * pos + 0.05,
    amtMain: null,
    images: []
  };

  class ImageTrailEffect {
    constructor(el, options = {}) {
      if (!el)
        throw new Error("ImageTrailEffect: 需要一个容器元素");
      if (!options.images || options.images.length === 0) {
        throw new Error("ImageTrailEffect: options.images 不能为空");
      }
      this.DOM = { el, trailElems: [] };
      this.options = {
        ...defaults,
        ...options,
        valuesFromTo: { ...defaults.valuesFromTo, ...options.valuesFromTo || {} }
      };
      this.winsize = calcWinsize();
      this.cursor = { x: this.winsize.width / 2, y: this.winsize.height / 2 };
      this.imgTransforms = Array.from({ length: this.options.totalTrailElements }, () => ({ x: 0, y: 0, rx: 0, ry: 0, rz: 0 }));
      this.rafId = null;
      this.destroyed = false;
      this.layout();
      this._onResize = () => {
        this.winsize = calcWinsize();
      };
      this._onPointerMove = (ev) => {
        this.cursor = { x: ev.clientX, y: ev.clientY };
      };
      window.addEventListener("resize", this._onResize);
      window.addEventListener("pointermove", this._onPointerMove, { passive: true });
      this.rafId = requestAnimationFrame(() => this.render());
      window.__APP_READY = true;
    }
    layout() {
      const n = this.options.totalTrailElements;
      let innerHTML = "";
      for (let i = 0;i < n; ++i) {
        const opacityVal = i === n - 1 ? 1 : 1 / n * i + 1 / n;
        const src = this.options.images[i % this.options.images.length];
        innerHTML += `<img class="trail__img" src="${src}" alt="" draggable="false" style="opacity:${this.options.opacityChange ? opacityVal : 1}">`;
      }
      this.DOM.el.innerHTML = innerHTML;
      this.DOM.trailElems = [...this.DOM.el.querySelectorAll(".trail__img")];
      if (this.options.perspective) {
        this.DOM.el.style.perspective = `${this.options.perspective}px`;
      }
    }
    render() {
      if (this.destroyed)
        return;
      const n = this.options.totalTrailElements;
      const { x, y, rx, ry, rz } = this.options.valuesFromTo;
      const usePerspective = this.options.perspective > 0;
      const mainAmt = this.options.amtMain ?? this.options.amt(n - 1);
      for (let i = 0;i < n; ++i) {
        const amt = i < n - 1 ? this.options.amt(i) : mainAmt;
        const t = this.imgTransforms[i];
        t.x = lerp(t.x, map(this.cursor.x, 0, this.winsize.width, x[0], x[1]), amt);
        t.y = lerp(t.y, map(this.cursor.y, 0, this.winsize.height, y[0], y[1]), amt);
        t.rx = usePerspective ? lerp(t.rx, map(this.cursor.y, 0, this.winsize.height, rx[0], rx[1]), amt) : 0;
        t.ry = usePerspective ? lerp(t.ry, map(this.cursor.x, 0, this.winsize.width, ry[0], ry[1]), amt) : 0;
        t.rz = lerp(t.rz, map(this.cursor.x, 0, this.winsize.width, rz[0], rz[1]), amt);
        this.DOM.trailElems[i].style.transform = `translateX(${t.x}px) translateY(${t.y}px) rotateX(${t.rx}deg) rotateY(${t.ry}deg) rotateZ(${t.rz}deg)`;
      }
      this.rafId = requestAnimationFrame(() => this.render());
    }
    destroy() {
      this.destroyed = true;
      if (this.rafId)
        cancelAnimationFrame(this.rafId);
      window.removeEventListener("resize", this._onResize);
      window.removeEventListener("pointermove", this._onPointerMove);
      this.DOM.el.innerHTML = "";
      this.DOM.el.style.perspective = "";
    }
  }

  // src/main.js
  var IMAGES = ["assets/art-1.svg", "assets/art-2.svg", "assets/art-3.svg"];
  var VARIANTS = {
    opaque: {
      totalTrailElements: 5,
      valuesFromTo: { x: [-90, 90], y: [-90, 90], rz: [0, 0] }
    },
    semitransparent: {
      totalTrailElements: 9,
      valuesFromTo: { x: [-100, 100], y: [-100, 100], rz: [0, 0] },
      opacityChange: true
    },
    rotation: {
      totalTrailElements: 9,
      valuesFromTo: { x: [-200, 200], y: [-70, 70], rz: [-10, 10] },
      opacityChange: true
    }
  };
  var state = { variant: "opaque", imageIndex: 0 };
  var trail = null;
  function mount() {
    if (trail)
      trail.destroy();
    trail = new ImageTrailEffect(document.querySelector(".trail"), {
      ...VARIANTS[state.variant],
      images: [IMAGES[state.imageIndex]]
    });
    window.__trail = trail;
  }
  for (const button of document.querySelectorAll("[data-variant]")) {
    button.addEventListener("click", () => {
      state.variant = button.dataset.variant;
      for (const b of document.querySelectorAll("[data-variant]")) {
        const active = b === button;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      }
      mount();
    });
  }
  document.getElementById("next-image").addEventListener("click", () => {
    state.imageIndex = (state.imageIndex + 1) % IMAGES.length;
    mount();
  });
  mount();
})();
