/**
 * 图片拖尾效果(Image Motion Trail)
 *
 * 复刻自 Codrops Sketches 005–007(Ahmed Kabbej / Codrops,MIT License)
 * https://github.com/codrops/codrops-sketches
 *
 * 原理:同一张图堆叠 N 层,把鼠标位置从视口区间映射到位移区间作为各层
 * 的共同目标;每层用不同的插值系数 amt 向目标缓动——越深的层系数越小、
 * 滞后越多,于是形成"回声拖尾"。可选透视旋转与逐层透明度。
 *
 * 与原版的差异:改为 pointermove(支持触屏/触控笔);图片由 options
 * 直接传入而非解析容器背景;不再原地修改默认配置(避免实例间串参数);
 * 增加 destroy() 以支持变体/图片切换时重建实例。
 */
import { lerp, map, calcWinsize } from './utils.js';

const defaults = {
	// 堆叠图层数
	totalTrailElements: 5,
	// 各层位移/旋转的映射区间:鼠标从视口 [0, w] 映射到该区间
	valuesFromTo: {
		x: [-90, 90],
		y: [-90, 90],
		rx: [0, 0],
		ry: [0, 0],
		rz: [0, 0],
	},
	// 逐层透明度递增(底层最实,顶层的层=1)
	opacityChange: false,
	// 透视距离(px);为 0 时不启用 rotateX/rotateY
	perspective: 0,
	// 第 i 层的插值系数:越大跟得越紧(顶层默认最快)
	amt: (pos) => 0.02 * pos + 0.05,
	// 覆盖最上层(栈顶)的插值系数;默认取 amt(totalTrailElements - 1)
	amtMain: null,
	// 图片地址数组,各层循环取用
	images: [],
};

export class ImageTrailEffect {
	/**
	 * @param {Element} el - 容器元素(.trail)
	 * @param {Partial<typeof defaults>} options
	 */
	constructor(el, options = {}) {
		if (!el) throw new Error('ImageTrailEffect: 需要一个容器元素');
		if (!options.images || options.images.length === 0) {
			throw new Error('ImageTrailEffect: options.images 不能为空');
		}

		this.DOM = { el, trailElems: [] };
		this.options = {
			...defaults,
			...options,
			valuesFromTo: { ...defaults.valuesFromTo, ...(options.valuesFromTo || {}) },
		};

		this.winsize = calcWinsize();
		this.cursor = { x: this.winsize.width / 2, y: this.winsize.height / 2 };
		this.imgTransforms = Array.from(
			{ length: this.options.totalTrailElements },
			() => ({ x: 0, y: 0, rx: 0, ry: 0, rz: 0 })
		);
		this.rafId = null;
		this.destroyed = false;

		this.layout();

		this._onResize = () => { this.winsize = calcWinsize(); };
		this._onPointerMove = (ev) => { this.cursor = { x: ev.clientX, y: ev.clientY }; };
		window.addEventListener('resize', this._onResize);
		window.addEventListener('pointermove', this._onPointerMove, { passive: true });

		this.rafId = requestAnimationFrame(() => this.render());
		// 供 index.html 的入口加载器确认场景已启动
		window.__APP_READY = true;
	}

	/** 生成堆叠图层:全部放在同一个网格单元中居中叠放 */
	layout() {
		const n = this.options.totalTrailElements;
		let innerHTML = '';
		for (let i = 0; i < n; ++i) {
			const opacityVal = i === n - 1 ? 1 : (1 / n) * i + 1 / n;
			const src = this.options.images[i % this.options.images.length];
			innerHTML += `<img class="trail__img" src="${src}" alt="" draggable="false" style="opacity:${this.options.opacityChange ? opacityVal : 1}">`;
		}
		this.DOM.el.innerHTML = innerHTML;
		this.DOM.trailElems = [...this.DOM.el.querySelectorAll('.trail__img')];
		if (this.options.perspective) {
			this.DOM.el.style.perspective = `${this.options.perspective}px`;
		}
	}

	/** 主循环:每层向映射目标做插值并写回 transform */
	render() {
		if (this.destroyed) return;
		const n = this.options.totalTrailElements;
		const { x, y, rx, ry, rz } = this.options.valuesFromTo;
		const usePerspective = this.options.perspective > 0;
		const mainAmt = this.options.amtMain ?? this.options.amt(n - 1);

		for (let i = 0; i < n; ++i) {
			const amt = i < n - 1 ? this.options.amt(i) : mainAmt;
			const t = this.imgTransforms[i];
			t.x = lerp(t.x, map(this.cursor.x, 0, this.winsize.width, x[0], x[1]), amt);
			t.y = lerp(t.y, map(this.cursor.y, 0, this.winsize.height, y[0], y[1]), amt);
			t.rx = usePerspective ? lerp(t.rx, map(this.cursor.y, 0, this.winsize.height, rx[0], rx[1]), amt) : 0;
			t.ry = usePerspective ? lerp(t.ry, map(this.cursor.x, 0, this.winsize.width, ry[0], ry[1]), amt) : 0;
			t.rz = lerp(t.rz, map(this.cursor.x, 0, this.winsize.width, rz[0], rz[1]), amt);
			this.DOM.trailElems[i].style.transform =
				`translateX(${t.x}px) translateY(${t.y}px) rotateX(${t.rx}deg) rotateY(${t.ry}deg) rotateZ(${t.rz}deg)`;
		}

		this.rafId = requestAnimationFrame(() => this.render());
	}

	/** 销毁实例:停掉循环、解绑事件、清空图层 */
	destroy() {
		this.destroyed = true;
		if (this.rafId) cancelAnimationFrame(this.rafId);
		window.removeEventListener('resize', this._onResize);
		window.removeEventListener('pointermove', this._onPointerMove);
		this.DOM.el.innerHTML = '';
		this.DOM.el.style.perspective = '';
	}
}
