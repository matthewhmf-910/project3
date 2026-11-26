// Pure functions of time for every prop: cup, kyusu, tea. Shared by meshes, hands, camera and stream.
import * as THREE from 'three';
import { CUP0, SEC } from '../timeline';
import { range, smoother, easeInOutCubic, track, lerp, springOut, clamp } from '../lib/math';

// ---------------- Yunomi profile (units: 1 = 10 cm) ----------------
export const CUP_OUTER: [number, number][] = [
  [0.2, 0.0],
  [0.29, 0.0],
  [0.305, 0.03],
  [0.3, 0.075],
  [0.325, 0.12],
  [0.355, 0.22],
  [0.38, 0.36],
  [0.393, 0.5],
  [0.394, 0.64],
  [0.388, 0.78],
  [0.383, 0.88],
  [0.384, 0.93],
  [0.378, 0.952],
];
export const CUP_INNER: [number, number][] = [
  [0.37, 0.958],
  [0.36, 0.95],
  [0.352, 0.9],
  [0.355, 0.75],
  [0.357, 0.6],
  [0.345, 0.45],
  [0.318, 0.32],
  [0.28, 0.21],
  [0.25, 0.155],
  [0.235, 0.14],
];
export const CUP_BOTTOM_Y = 0.141;
export const CUP_BOTTOM_R = 0.236;
export const CUP_RIM_Y = 0.955;

/** inner radius of the cup at local height y */
export function innerRadius(y: number) {
  const pts = [...CUP_INNER].reverse(); // ascending y
  if (y <= pts[0][1]) return pts[0][0];
  for (let i = 0; i < pts.length - 1; i++) {
    const [r0, y0] = pts[i];
    const [r1, y1] = pts[i + 1];
    if (y <= y1) return lerp(r0, r1, (y - y0) / (y1 - y0));
  }
  return pts[pts.length - 1][0];
}

// ---------------- Cup ----------------
export function cupPose(t: number) {
  const base = new THREE.Vector3(...CUP0);
  const pos = base.clone();
  let tiltX = 0;
  if (t >= SEC.grasp && t < SEC.rise) {
    const lift = easeInOutCubic(range(t, SEC.grasp + 0.12, 4.4));
    // rises first, then comes forward (an offering arc), settles with a small follow-through
    const up = smoother(range(lift, 0, 0.7));
    const fwd = smoother(range(lift, 0.25, 1));
    pos.x = lerp(base.x, 0.24, lift);
    pos.y = lerp(0, 3.0, up) + (springOut(range(t, 4.35, 5.0), 1.6, 5) - range(t, 4.35, 5.0)) * 0.0;
    pos.z = lerp(base.z, 0.55, fwd);
    const settle = t > 4.4 ? Math.exp(-(t - 4.4) * 6) * Math.sin((t - 4.4) * 18) * 0.035 : 0;
    pos.y -= settle;
    tiltX = Math.sin(lift * Math.PI) * 0.12 + fwd * 0.06; // a gentle presenting tilt toward the guest
  }
  return { pos, tiltX };
}

// ---------------- Tea ----------------
export const flow = (t: number) => 1 - smoother(range(t, 2.02, 2.24));
export function teaLevel(t: number) {
  if (t >= SEC.rise) return -1; // empty
  return lerp(0.47, 0.8, smoother(range(t, -0.4, 2.3)));
}

// ---------------- Kyusu (side-handle teapot) ----------------
// Local frame: body sits on y = 0, spout points +x, side handle points -z (toward the chef).
export const SPOUT_TIP = new THREE.Vector3(0.98, 0.5, 0);
export const SPOUT_DIR = new THREE.Vector3(0.85, 0.45, 0).normalize();
export const HANDLE_GRIP = new THREE.Vector3(0.0, 0.32, -1.0);
export const LID_TOP = new THREE.Vector3(0.0, 0.78, 0.0);

const POUR_POS = new THREE.Vector3(CUP0[0] - 1.18, 1.52, CUP0[2]);
const REST_POS = new THREE.Vector3(-1.85, 0, -1.05);

export function kyusuPose(t: number) {
  // pour angle about local z (negative = spout down)
  const tilt = track(t, [
    [0, -0.74],
    [1.9, -0.8],
    [2.22, -0.3],
    [2.42, 0.0],
  ]);
  const p = smoother(range(t, 2.15, SEC.setDown));
  const pos = POUR_POS.clone().lerp(REST_POS, p);
  // lift a little before travelling down (arc), land exactly at setDown
  pos.y += Math.sin(p * Math.PI) * 0.25;
  // a whisper of hand tremor while pouring (an old hand, steady but alive)
  if (t < 2.1) pos.y += Math.sin(t * 9.0) * 0.004;
  const yaw = lerp(0, 0.5, p);
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, tilt, 'YXZ'));
  const toWorld = (v: THREE.Vector3) => v.clone().applyQuaternion(q).add(pos);
  return {
    pos,
    q,
    tilt,
    tip: toWorld(SPOUT_TIP),
    spoutDir: SPOUT_DIR.clone().applyQuaternion(q),
    grip: toWorld(HANDLE_GRIP),
    lid: toWorld(LID_TOP),
  };
}

/** where the stream meets the tea */
export function impactPoint(t: number) {
  const cup = cupPose(t).pos;
  const lvl = Math.max(0, teaLevel(t));
  return new THREE.Vector3(cup.x - 0.1, cup.y + lvl, cup.z + 0.02);
}

export const steamAmount = (t: number) => (t < SEC.rise ? clamp(0.25 + range(t, 0, 1.6) * 0.75) : 0.0);
