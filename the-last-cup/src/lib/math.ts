// Deterministic math helpers: easing, keyed tracks, splines, seeded noise.
import * as THREE from 'three';

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const range = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const smooth = (x: number) => {
  const c = clamp(x);
  return c * c * (3 - 2 * c);
};
export const smoother = (x: number) => {
  const c = clamp(x);
  return c * c * c * (c * (c * 6 - 15) + 10);
};
export const easeInOutCubic = (x: number) => {
  const c = clamp(x);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const easeInCubic = (x: number) => Math.pow(clamp(x), 3);
export const easeOutBack = (x: number, s = 1.4) => {
  const c = clamp(x) - 1;
  return 1 + c * c * ((s + 1) * c + s);
};
/** damped spring response 0→1 with overshoot, for follow-through */
export const springOut = (x: number, freq = 2.2, damp = 4.5) => {
  if (x <= 0) return 0;
  return 1 - Math.exp(-damp * x) * Math.cos(freq * Math.PI * 2 * x);
};

/** Scalar keyframe track; each segment eased with smoother (zero velocity at keys). */
export function track(t: number, keys: [number, number][], ease: (x: number) => number = smoother) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t <= t1) return lerp(v0, v1, ease((t - t0) / (t1 - t0)));
  }
  return keys[keys.length - 1][1];
}

export type V3 = [number, number, number];

/**
 * Time-parameterised cubic Hermite spline with Catmull-Rom tangents.
 * Velocity is continuous through the keys (no stop at every key) — used for camera moves.
 * End tangents are zero (ease in/out of the whole move).
 */
export function spline3(t: number, keys: { t: number; v: V3 }[], out = new THREE.Vector3()) {
  const n = keys.length;
  if (t <= keys[0].t) return out.set(...keys[0].v);
  if (t >= keys[n - 1].t) return out.set(...keys[n - 1].v);
  let i = 0;
  while (i < n - 2 && t > keys[i + 1].t) i++;
  const k0 = keys[i];
  const k1 = keys[i + 1];
  const h = k1.t - k0.t;
  const s = (t - k0.t) / h;
  const tan = (j: number, c: number) => {
    if (j === 0 || j === n - 1) return 0;
    return ((keys[j + 1].v[c] - keys[j - 1].v[c]) / (keys[j + 1].t - keys[j - 1].t)) * h;
  };
  const h00 = 2 * s ** 3 - 3 * s ** 2 + 1;
  const h10 = s ** 3 - 2 * s ** 2 + s;
  const h01 = -2 * s ** 3 + 3 * s ** 2;
  const h11 = s ** 3 - s ** 2;
  const v = [0, 0, 0].map(
    (_, c) => h00 * k0.v[c] + h10 * tan(i, c) + h01 * k1.v[c] + h11 * tan(i + 1, c),
  );
  return out.set(v[0], v[1], v[2]);
}

export function spline1(t: number, keys: { t: number; v: number }[]) {
  return spline3(
    t,
    keys.map((k) => ({ t: k.t, v: [k.v, 0, 0] as V3 })),
  ).x;
}

// ---------- seeded randomness & noise ----------
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash2 = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
};
export function vnoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
export function fbm(x: number, y: number, oct = 5) {
  let s = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    s += a * vnoise(x * f, y * f);
    f *= 2.03;
    a *= 0.5;
  }
  return s;
}
/** smooth 1-D noise in [-1,1] for hand-held drift and wobble */
export const n1 = (x: number, seed = 0) => vnoise(x, seed * 17.13) * 2 - 1;
