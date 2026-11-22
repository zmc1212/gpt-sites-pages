/**
 * 线性插值:n 越接近 1,b 的权重越大(追赶越快)
 * @param {number} a - 当前值
 * @param {number} b - 目标值
 * @param {number} n - 插值系数(0~1)
 */
export const lerp = (a, b, n) => (1 - n) * a + n * b;

/**
 * 将 x 从区间 [a, b] 映射到区间 [c, d]
 */
export const map = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;

/** 计算当前视口尺寸 */
export const calcWinsize = () => ({
	width: window.innerWidth,
	height: window.innerHeight,
});
