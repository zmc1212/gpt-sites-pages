// GLSL chunk strings shared by custom ShaderMaterials.
export const NOISE = /* glsl */`
float hash11(float p){ p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  float a = hash12(i), b = hash12(i + vec2(1, 0)), c = hash12(i + vec2(0, 1)), d = hash12(i + vec2(1, 1));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float vnoise3(vec3 p){
  vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  float n = 0.0;
  n += mix(mix(hash12(i.xy + i.z * 37.0), hash12(i.xy + vec2(1,0) + i.z * 37.0), f.x),
           mix(hash12(i.xy + vec2(0,1) + i.z * 37.0), hash12(i.xy + vec2(1,1) + i.z * 37.0), f.x), f.y);
  n += mix(mix(hash12(i.xy + (i.z + 1.0) * 37.0), hash12(i.xy + vec2(1,0) + (i.z + 1.0) * 37.0), f.x),
           mix(hash12(i.xy + vec2(0,1) + (i.z + 1.0) * 37.0), hash12(i.xy + vec2(1,1) + (i.z + 1.0) * 37.0), f.x), f.y);
  return n * 0.5;
}
float fbm(vec2 p){
  float a = 0.0, w = 0.5;
  for (int i = 0; i < 5; i++){ a += w * vnoise(p); p = p * 2.03 + 17.1; w *= 0.5; }
  return a;
}
float fbm3(vec3 p){
  float a = 0.0, w = 0.5;
  for (int i = 0; i < 4; i++){ a += w * vnoise3(p); p = p * 2.07 + 11.3; w *= 0.5; }
  return a;
}`;

// Faceted normal from screen-space derivatives (works on displaced terrain).
export const FACET = /* glsl */`
vec3 facetNormal(vec3 W){
  vec3 dx = dFdx(W), dy = dFdy(W);
  vec3 n = cross(dx, dy);
  float l = length(n);
  return l > 1e-5 ? n / l : vec3(0.0, 1.0, 0.0);
}`;

// ACES fitted curve + small grading helpers.
export const ACES = /* glsl */`
vec3 aces(vec3 x){
  x *= 0.6;
  float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}`;

// Height fog + aerial haze (same math as the standard-material patch in util.js).
export const ATM = /* glsl */`
uniform vec3 uFogColor; uniform vec3 uFogSky; uniform float uStorm;
vec3 atmFog(vec3 c, vec3 W, vec3 C, float mul){
  float d = distance(W, C);
  float h = clamp(W.y / 150.0, 0.0, 1.0);
  vec3 fogC = mix(uFogColor, uFogSky, h * h);
  float f = 1.0 - exp(-d * d * 0.0000016 * mul * (1.0 + 0.8 * uStorm));
  return mix(c, fogC, clamp(f, 0.0, 1.0));
}`;

// Wind gust response for flora: bend away from the nearest recorded dragon pass.
export const GUST = /* glsl */`
uniform vec3 uGustPos[8]; uniform float uGustStr[8];
vec3 gustPush(vec3 W){
  vec3 acc = vec3(0.0);
  for (int i = 0; i < 8; i++){
    if (uGustStr[i] <= 0.001) continue;
    vec3 d = W - uGustPos[i];
    float r = length(d);
    float s = uGustStr[i] * exp(-r * r * 0.004);
    acc += (normalize(d) + vec3(0.0, -0.3, 0.0)) * s;
  }
  return acc;
}`;
