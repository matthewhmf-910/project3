// Camera choreography: three continuous takes joined by object-driven transitions.
// A: pour (macro) → crane back to the chef → push into the offered cup → breach the tea surface (0 – 5.0)
// B: inside the tea: the evening's dishes drift past (5.0 – 6.67)
// C: rise out of the now-empty cup → pull back to the bow and the title (6.67 – 10)
import * as THREE from 'three';
import { spline3, spline1, n1, V3, range, smoother } from '../lib/math';
import { CUP0, MEM, SEC } from '../timeline';
import { cupPose } from './poses';

export type Shot = {
  pos: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
  focus: THREE.Vector3; // world point in focus
  focusRange: number; // world units of acceptable sharpness
  bokeh: number;
  roll: number;
  world: 'counter' | 'memory';
  cupEmpty: boolean;
};

const C = CUP0;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const M = (x: number, y: number, z: number): V3 => [MEM[0] + x, MEM[1] + y, MEM[2] + z];

// Take A ------------------------------------------------------------------------------------
const A_POS = [
  { t: 0.0, v: add(C, [1.35, 1.95, 3.15]) },
  { t: 1.3, v: add(C, [1.0, 1.72, 2.6]) },
  { t: 2.45, v: add(C, [0.55, 1.62, 2.1]) },
  { t: 3.0, v: add(C, [0.4, 2.55, 4.4]) },
  { t: 3.55, v: [0.48, 3.9, 7.6] as V3 },
  { t: 4.05, v: [0.42, 4.7, 9.4] as V3 },
  { t: 4.55, v: [0.32, 4.45, 6.2] as V3 },
];
const A_TGT = [
  { t: 0.0, v: add(C, [-0.18, 0.86, 0.0]) },
  { t: 1.3, v: add(C, [-0.08, 0.74, 0.0]) },
  { t: 2.45, v: add(C, [0.0, 0.6, 0.0]) },
  { t: 3.0, v: add(C, [0.0, 1.6, -1.2]) },
  { t: 3.55, v: [0.18, 4.4, -2.4] as V3 },
  { t: 4.05, v: [0.12, 4.45, -2.4] as V3 },
  { t: 4.55, v: [0.2, 3.7, -0.6] as V3 },
];

// Take B (memory world) -----------------------------------------------------------------------
const B_POS = [
  { t: SEC.dive, v: M(0.2, 2.2, 3.9) },
  { t: 5.85, v: M(0.35, 1.7, 3.3) },
  { t: 6.35, v: M(0.25, 2.3, 2.6) },
  { t: SEC.rise, v: M(0.0, 3.6, 1.2) },
];
const B_TGT = [
  { t: SEC.dive, v: M(-0.1, 0.4, 0.0) },
  { t: 5.85, v: M(0.1, 1.6, -1.4) },
  { t: 6.35, v: M(0.0, 3.4, -2.6) },
  { t: SEC.rise, v: M(0.0, 8.5, -1.6) },
];
export const DISHES = { nigiri: M(-0.1, 0.45, 0.6), chawan: M(0.2, 1.45, -1.3), sashimi: M(-0.1, 2.65, -3.1) };

// Take C ------------------------------------------------------------------------------------
const C_POS = [
  { t: SEC.rise, v: add(C, [0.0, 0.6, 0.012]) },
  { t: 7.45, v: add(C, [0.0, 1.12, 0.03]) },
  { t: 8.15, v: add(C, [0.08, 1.55, 1.4]) },
  { t: 8.95, v: [0.42, 3.55, 9.4] as V3 },
  { t: 9.75, v: [0.45, 4.0, 12.0] as V3 },
];
const C_TGT = [
  { t: SEC.rise, v: add(C, [0.0, 0.0, 0.0]) },
  { t: 7.45, v: add(C, [0.0, 0.1, -0.01]) },
  { t: 8.15, v: add(C, [0.0, 0.45, -0.6]) },
  { t: 8.95, v: [0.12, 3.75, -6.0] as V3 },
  { t: 9.75, v: [0.1, 4.0, -6.0] as V3 },
];

const tmp = new THREE.Vector3();

export function shotAt(t: number): Shot {
  const pos = new THREE.Vector3();
  const target = new THREE.Vector3();
  const focus = new THREE.Vector3();
  let fov = 30;
  let focusRange = 0.6;
  let bokeh = 3;
  let roll = 0;
  let world: Shot['world'] = 'counter';
  let cupEmpty = false;

  if (t < SEC.dive) {
    spline3(t, A_POS, pos);
    spline3(t, A_TGT, target);
    fov = spline1(t, [
      { t: 0, v: 27 },
      { t: 2.45, v: 24 },
      { t: 3.6, v: 30 },
      { t: 4.4, v: 31 },
      { t: 5.0, v: 40 },
    ]);
    // push into the offered cup: final 0.45 s locks onto the cup mouth and dives
    const cup = cupPose(t).pos;
    const dive = smoother(range(t, 4.55, SEC.dive));
    if (dive > 0) {
      const top = tmp.set(cup.x, cup.y + 0.8, cup.z);
      const above = new THREE.Vector3(top.x, top.y + 0.95, top.z + 0.6);
      const inside = new THREE.Vector3(top.x, top.y + 0.035, top.z + 0.012);
      const p = above.clone().lerp(inside, dive * dive);
      pos.lerp(p, Math.min(1, dive * 1.6));
      target.lerp(new THREE.Vector3(top.x, top.y - 0.6, top.z - 0.05), Math.min(1, dive * 1.6));
    }
    // focus: stream/surface → cup → chef's face → cup
    const face = new THREE.Vector3(0, 6.3, -3.2);
    const cupMid = new THREE.Vector3(cup.x, cup.y + 0.55, cup.z);
    const pull = smoother(range(t, 3.35, 3.85)) * (1 - smoother(range(t, 4.15, 4.5)));
    focus.copy(cupMid).lerp(face, pull);
    focusRange = t < 2.6 ? 0.35 : 0.35 + pull * 1.6;
    bokeh = t < 2.6 ? 4.5 : 3.5;
    roll = n1(t * 0.35, 1) * 0.006 + 0.018 * Math.sin(range(t, 0, 2.5) * Math.PI);
  } else if (t < SEC.rise) {
    world = 'memory';
    spline3(t, B_POS, pos);
    spline3(t, B_TGT, target);
    fov = spline1(t, [
      { t: SEC.dive, v: 42 },
      { t: 5.85, v: 36 },
      { t: 6.35, v: 38 },
      { t: SEC.rise, v: 52 },
    ]);
    // rack focus up the column on the beats: nigiri → chawanmushi → sashimi
    const a = new THREE.Vector3(...DISHES.nigiri);
    const b = new THREE.Vector3(...DISHES.chawan);
    const c = new THREE.Vector3(...DISHES.sashimi);
    focus.copy(a).lerp(b, smoother(range(t, 5.62, 5.92))).lerp(c, smoother(range(t, 6.1, 6.4)));
    focusRange = 0.5;
    bokeh = 6;
    roll = -0.04 + range(t, SEC.dive, SEC.rise) * 0.08;
  } else {
    cupEmpty = true;
    spline3(t, C_POS, pos);
    spline3(t, C_TGT, target);
    fov = spline1(t, [
      { t: SEC.rise, v: 50 },
      { t: 7.45, v: 40 },
      { t: 8.15, v: 40 },
      { t: 10, v: 42 },
    ]);
    // focus: cup bottom (一期一会) → the chef
    const pull = smoother(range(t, 8.0, 8.9));
    focus.set(C[0], C[1] + 0.15, C[2]).lerp(new THREE.Vector3(0, 4.4, -7.2), pull);
    focusRange = 0.3 + pull * 5.5;
    bokeh = 3.2;
    roll = n1(t * 0.3, 4) * 0.004;
  }

  // breathing hand-held drift (very small; this is a still, attentive camera)
  const drift = new THREE.Vector3(n1(t * 0.6, 11), n1(t * 0.55, 12), n1(t * 0.5, 13)).multiplyScalar(
    world === 'memory' ? 0.04 : 0.012,
  );
  pos.add(drift);

  return { pos, target, fov, focus, focusRange, bokeh, roll, world, cupEmpty };
}
