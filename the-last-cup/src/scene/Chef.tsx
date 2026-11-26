// The itamae: a stylised sculptural figure (soft clay skin, cotton kappogi, sage apron, hachimaki).
// Arms are solved with two-bone IK every frame; every pose is blended with easing (no pose switching).
import { useMemo } from 'react';
import * as THREE from 'three';
import { weaveBump } from '../lib/textures';
import { cupPose, kyusuPose } from './poses';
import { SEC } from '../timeline';
import { range, smoother, track, n1, easeInOutCubic, lerp } from '../lib/math';

const ROOT = new THREE.Vector3(0, -1.6, -3.25); // hip pivot (hidden below the counter)
const SHOULDER_Y = 5.55;
const SHOULDER_X = 1.62;
const UPPER = 2.65;
const FORE = 2.55;
const HEAD_Y = 7.45; // head centre in hip space

// ---------- pose ----------
export function chefPose(t: number) {
  const takeC = t >= SEC.rise;
  // forward lean while pouring / reaching, upright when offering
  let lean = track(t, [
    [0, 0.2],
    [2.3, 0.2],
    [2.7, 0.14],
    [3.15, 0.24], // anticipation: settles into the reach
    [3.45, 0.22],
    [4.3, 0.05],
    [5, 0.06],
  ]);
  let bow = 0;
  if (takeC) {
    lean = 0.02;
    // ojigi: tiny rise (anticipation) → bow → hold, with the head trailing (follow-through)
    bow = track(t, [
      [7.9, 0],
      [8.15, -0.04],
      [8.95, 0.46],
      [9.4, 0.44],
      [10, 0.43],
    ]);
  }
  // head: watches the pour, then lifts to meet the guest; brows rise with delight
  const headPitch = takeC
    ? 0.1 + track(t, [[8.1, 0], [8.5, 0], [9.2, 0.22], [10, 0.2]]) // head trails the bow
    : track(t, [
        [0, 0.42],
        [2.4, 0.42],
        [3.2, 0.5],
        [3.75, 0.08],
        [4.6, 0.02],
      ]);
  const headRoll = takeC ? 0.03 : track(t, [[3.6, 0], [4.1, 0.09], [5, 0.07]]);
  const headYaw = takeC ? 0 : track(t, [[0, 0.12], [2.4, 0.08], [3.4, 0.0]]);
  const brow = takeC ? 0.5 : track(t, [[0, 0.0], [3.6, 0.0], [3.95, 1.0], [4.4, 0.75]]); // 0 calm focus → 1 raised delight
  const smile = takeC ? 0.85 : track(t, [[0, 0.25], [3.7, 0.25], [4.15, 1.0]]);
  const breath = Math.sin(t * 2.1) * 0.5 + 0.5;
  return { lean, bow, headPitch, headRoll, headYaw, brow, smile, breath, takeC };
}

// ---------- IK ----------
function solveArm(S: THREE.Vector3, H: THREE.Vector3, pole: THREE.Vector3) {
  const d = H.clone().sub(S);
  const len = THREE.MathUtils.clamp(d.length(), 0.6, UPPER + FORE - 0.02);
  const dir = d.normalize();
  const cosA = (UPPER * UPPER + len * len - FORE * FORE) / (2 * UPPER * len);
  const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  const p = pole.clone().sub(S);
  const perp = p.sub(dir.clone().multiplyScalar(p.dot(dir))).normalize();
  const E = S.clone().addScaledVector(dir, UPPER * cosA).addScaledVector(perp, UPPER * sinA);
  const W = S.clone().addScaledVector(dir, len);
  return { E, W };
}

const UP = new THREE.Vector3(0, 1, 0);
function segment(a: THREE.Vector3, b: THREE.Vector3) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const dir = b.clone().sub(a);
  const len = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize());
  return { mid, q, len };
}

function handTargets(t: number, hip: THREE.Matrix4) {
  const P = chefPose(t);
  const toWorld = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyMatrix4(hip);
  const k = kyusuPose(t);
  const cup = cupPose(t);
  const cupC = cup.pos.clone().add(new THREE.Vector3(0, 0.45, 0));
  // RIGHT hand (chef's right = world -x): kyusu handle → released → cup's right side
  const rRest = toWorld(-0.75, 3.1, 1.75);
  const rCup = cupC.clone().add(new THREE.Vector3(-0.47, 0, -0.02));
  const lCup = cupC.clone().add(new THREE.Vector3(0.47, 0, -0.02));
  const lLid = k.lid.clone().add(new THREE.Vector3(0.0, 0.07, 0.0));
  const lRest = toWorld(0.75, 3.1, 1.75);
  let R: THREE.Vector3;
  let L: THREE.Vector3;
  if (P.takeC) {
    // formal ojigi posture: hands slide together onto the apron front, they travel with the bow
    R = toWorld(-0.3, 2.35, 1.5);
    L = toWorld(0.3, 2.45, 1.56);
  } else {
    // right: grip until 2.6, to the cup by grasp (3.33)
    const r1 = smoother(range(t, 2.58, SEC.grasp));
    const rMid = rRest.clone().lerp(rCup, 0.5).add(new THREE.Vector3(0, 0.45, 0));
    R = r1 <= 0 ? k.grip : r1 < 0.5 ? k.grip.clone().lerp(rMid, r1 * 2) : rMid.clone().lerp(rCup, (r1 - 0.5) * 2);
    // left: fingertips on the lid while pouring (etiquette), then to the cup
    const l0 = smoother(range(t, 2.12, 2.5));
    const l1 = smoother(range(t, 2.75, SEC.grasp + 0.03));
    L = lLid.clone().lerp(lRest, l0).lerp(lCup, l1);
    // anticipation: both hands dip a touch before closing on the cup
    const dip = Math.sin(range(t, 3.0, SEC.grasp) * Math.PI) * 0.12;
    R.y += dip;
    L.y += dip;
  }
  return { R, L, cupC };
}

// ---------- face pieces ----------
function arcTube(pts: THREE.Vector3[], r: number) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, r, 8, false);
}

export function Chef({ t }: { t: number }) {
  const parts = useMemo(() => {
    const coat = new THREE.MeshPhysicalMaterial({
      color: '#f1ede2',
      roughness: 0.82,
      sheen: 1,
      sheenColor: new THREE.Color('#ffffff'),
      sheenRoughness: 0.6,
      bumpMap: weaveBump(),
      bumpScale: 0.25,
    });
    const apron = new THREE.MeshPhysicalMaterial({
      color: '#8e9f80',
      roughness: 0.88,
      sheen: 0.8,
      sheenColor: new THREE.Color('#c9d6bb'),
      bumpMap: weaveBump(),
      bumpScale: 0.3,
      side: THREE.DoubleSide,
    });
    const skin = new THREE.MeshPhysicalMaterial({
      color: '#d9a585',
      roughness: 0.58,
      sheen: 0.7,
      sheenColor: new THREE.Color('#ffc4a8'),
      sheenRoughness: 0.45,
      clearcoat: 0.08,
    });
    const hair = new THREE.MeshPhysicalMaterial({ color: '#6f6b65', roughness: 0.9, sheen: 1, sheenColor: new THREE.Color('#d8d2c8'), bumpMap: weaveBump(), bumpScale: 0.6 });
    const brow = new THREE.MeshStandardMaterial({ color: '#d8d3c8', roughness: 0.9 });
    const line = new THREE.MeshStandardMaterial({ color: '#3a2418', roughness: 0.7 });
    const band = new THREE.MeshPhysicalMaterial({ color: '#f6f3ea', roughness: 0.85, sheen: 1, sheenColor: new THREE.Color('#ffffff') });
    const indigo = new THREE.MeshStandardMaterial({ color: '#2f3d55', roughness: 0.85 });

    const torso = new THREE.LatheGeometry(
      [
        [0.0, -0.2],
        [1.5, -0.2],
        [1.52, 0.6],
        [1.42, 1.8],
        [1.55, 3.2],
        [1.72, 4.4],
        [1.78, 5.25],
        [1.55, 5.75],
        [1.05, 6.05],
        [0.5, 6.2],
        [0.0, 6.22],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
      64,
    );
    torso.scale(1, 1, 0.64);
    // apron: a gently curved panel hanging from the chest, ties over the shoulders
    const apronG = new THREE.CylinderGeometry(1.62, 1.72, 5.0, 40, 8, true, -0.95, 1.9);
    apronG.translate(0, 1.85, 0);
    apronG.scale(1, 1, 0.68);
    const strap = (s: number) =>
      arcTube(
        [new THREE.Vector3(0.62 * s, 4.3, 1.08), new THREE.Vector3(0.75 * s, 5.4, 0.85), new THREE.Vector3(0.62 * s, 6.05, 0.1)],
        0.07,
      );
    // kappogi crossed collar (left over right), a raised band
    const collarL = arcTube(
      [new THREE.Vector3(-0.55, 6.1, 0.15), new THREE.Vector3(-0.35, 5.6, 0.8), new THREE.Vector3(0.15, 4.75, 1.13)],
      0.11,
    );
    const collarR = arcTube(
      [new THREE.Vector3(0.55, 6.1, 0.15), new THREE.Vector3(0.38, 5.55, 0.82), new THREE.Vector3(-0.05, 4.95, 1.1)],
      0.11,
    );
    const collar = new THREE.TorusGeometry(0.62, 0.13, 14, 48);
    collar.rotateX(Math.PI / 2 - 0.12);
    collar.scale(1, 1, 0.85);
    const neck = new THREE.CylinderGeometry(0.46, 0.52, 0.8, 24);
    neck.translate(0, 6.3, 0.02);
    const head = new THREE.SphereGeometry(1, 64, 48);
    head.scale(0.94, 1.1, 0.98);
    const ear = new THREE.SphereGeometry(0.22, 20, 16);
    ear.scale(0.5, 1, 0.8);
    const hairCap = new THREE.SphereGeometry(1.012, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.42);
    hairCap.rotateX(-0.3);
    hairCap.scale(0.95, 1.1, 0.99);
    const hachimaki = new THREE.TorusGeometry(0.975, 0.07, 16, 72);
    hachimaki.rotateX(Math.PI / 2);
    hachimaki.scale(0.885, 1.5, 0.92);
    const knot = new THREE.SphereGeometry(0.2, 16, 12);
    const nose = new THREE.SphereGeometry(0.135, 24, 16);
    nose.scale(0.9, 1, 0.85);
    const cheek = new THREE.SphereGeometry(0.28, 24, 16);
    cheek.scale(1, 0.75, 0.5);
    // closed, smiling eyes (∩ arcs) on the face surface
    const eye = (s: number) =>
      arcTube(
        [-0.17, -0.06, 0.0, 0.06, 0.17].map((dx) => {
          const x = s * 0.36 + dx;
          const y = 0.06 + 0.07 * (1 - (dx / 0.17) ** 2);
          return new THREE.Vector3(x, y, Math.sqrt(Math.max(0, 1 - (x / 0.94) ** 2 - (y / 1.1) ** 2)) * 0.98 + 0.012);
        }),
        0.024,
      );
    const browG = arcTube(
      [-0.2, -0.07, 0.07, 0.2].map((dx) => new THREE.Vector3(dx, 0.04 * (1 - (dx / 0.2) ** 2), 0)),
      0.055,
    );
    const mustache = arcTube(
      [-0.34, -0.18, 0, 0.18, 0.34].map((x) => new THREE.Vector3(x, -0.33 - Math.abs(x) * 0.35 + (x === 0 ? 0.03 : 0), 0.9 - x * x * 0.5)),
      0.06,
    );
    const mouth = arcTube(
      [-0.14, -0.05, 0.05, 0.14].map((x) => new THREE.Vector3(x, -0.5 - 0.05 * (1 - (x / 0.14) ** 2), 0.86 - x * x)),
      0.02,
    );
    // arm pieces (unit length, scaled per frame)
    const upperSleeve = new THREE.CylinderGeometry(0.5, 0.47, 1, 24, 1, true);
    const foreSleeve = new THREE.CylinderGeometry(0.47, 0.44, 1, 24, 1, true);
    const forearm = new THREE.CylinderGeometry(0.2, 0.17, 1, 20);
    const joint = new THREE.SphereGeometry(1, 24, 16);
    const cuff = new THREE.TorusGeometry(0.44, 0.05, 10, 32);
    cuff.rotateX(Math.PI / 2);
    // mitten hand: palm + thumb
    const palm = new THREE.SphereGeometry(1, 32, 24);
    palm.scale(0.16, 0.3, 0.27);
    palm.translate(0, 0.22, 0);
    const thumb = new THREE.CapsuleGeometry(0.075, 0.18, 6, 12);
    const finger = new THREE.CapsuleGeometry(0.056, 0.17, 6, 10);
    return {
      mats: { coat, apron, skin, hair, brow, line, band, indigo },
      g: { finger, collar, torso, apronG, strapL: strap(-1), strapR: strap(1), collarL, collarR, neck, head, ear, hairCap, hachimaki, knot, nose, cheek, eyeL: eye(-1), eyeR: eye(1), browG, mustache, mouth, upperSleeve, foreSleeve, forearm, joint, cuff, palm, thumb },
    };
  }, []);
  const { mats, g } = parts;
  const P = chefPose(t);

  // hip transform
  const hipQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(P.lean + P.bow, 0, 0));
  const hipPos = ROOT.clone();
  if (P.takeC) hipPos.z -= 4.2; // he has stepped back to his station to bow the guest out
  hipPos.y += P.breath * 0.02;
  const hip = new THREE.Matrix4().compose(hipPos, hipQ, new THREE.Vector3(1, 1, 1));
  const { R, L, cupC } = handTargets(t, hip);

  const arms = ([-1, 1] as const).map((side) => {
    const S = new THREE.Vector3(side * SHOULDER_X, SHOULDER_Y + P.breath * 0.03, 0.05).applyMatrix4(hip);
    const H = side < 0 ? R : L;
    // wrist sits behind the palm centre, so aim the wrist a little back along the reach
    const pole = S.clone().add(new THREE.Vector3(side * 2.6, -2.4, -2.2));
    // the IK target is the palm centre; the wrist sits a little behind it along the reach
    const Hw = H.clone().addScaledVector(H.clone().sub(S).normalize(), -0.26);
    const { E, W } = solveArm(S, Hw, pole);
    const elbowSleeve = E.clone().lerp(W, 0.58);
    const up = segment(S, E);
    const fs = segment(E, elbowSleeve);
    const fa = segment(elbowSleeve, W);
    // hand basis: fingers continue the forearm, palm faces the cup (or the apron)
    const fwd = W.clone().sub(E).normalize();
    const facing = P.takeC
      ? new THREE.Vector3(0, 0, -1).applyQuaternion(hipQ)
      : cupC.clone().sub(W).setY(0).normalize();
    const n = facing.sub(fwd.clone().multiplyScalar(facing.dot(fwd))).normalize();
    const x = n.clone();
    const y = fwd.clone();
    const z = x.clone().cross(y).normalize();
    const handQ = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
    // the palm's thickness axis is local x: flip for the right hand so both palms face inward
    return { side, S, E, W, up, fs, fa, handQ };
  });

  const headQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(P.headPitch, P.headYaw, P.headRoll, 'YXZ'));
  const browLift = lerp(0.36, 0.47, P.brow);
  const browTilt = lerp(0.18, 0.06, P.brow); // inner ends raised = kind, softened as they lift
  const blink = 0; // eyes stay closed in a smile: the old man's warmth reads at thumbnail size
  void blink;

  return (
    <group>
      {/* body in hip space */}
      <group position={hipPos} quaternion={hipQ}>
        <mesh geometry={g.torso} material={mats.coat} castShadow receiveShadow scale={[1, 1, 1 + P.breath * 0.012]} />
        <mesh geometry={g.apronG} material={mats.apron} castShadow receiveShadow position={[0, 0, 0.05]} />

        <mesh geometry={g.neck} material={mats.skin} />
        <mesh geometry={g.collar} material={mats.band} position={[0, 6.08, 0.05]} castShadow />
        {/* head */}
        <group position={[0, HEAD_Y, 0.08]} quaternion={headQ}>
          <mesh geometry={g.head} material={mats.skin} castShadow receiveShadow />
          <mesh geometry={g.hairCap} material={mats.hair} position={[0, 0.02, -0.04]} />
          <mesh geometry={g.hachimaki} material={mats.band} position={[0, 0.44, -0.02]} rotation={[-0.14, 0, 0]} castShadow />
          <mesh geometry={g.hachimaki} material={mats.indigo} position={[0, 0.44, -0.02]} rotation={[-0.14, 0, 0]} scale={[1.006, 0.22, 1.006]} />
          <mesh geometry={g.knot} material={mats.band} position={[0.12, 0.52, -0.9]} />
          <mesh geometry={g.ear} material={mats.skin} position={[-0.92, -0.02, -0.05]} />
          <mesh geometry={g.ear} material={mats.skin} position={[0.92, -0.02, -0.05]} />
          <mesh geometry={g.nose} material={mats.skin} position={[0, -0.14, 1.0]} castShadow />
          <mesh geometry={g.cheek} material={mats.skin} position={[-0.42, -0.24, 0.8]} scale={1 + P.smile * 0.15} rotation={[0, -0.45, 0]} />
          <mesh geometry={g.cheek} material={mats.skin} position={[0.42, -0.24, 0.8]} scale={1 + P.smile * 0.15} rotation={[0, 0.45, 0]} />
          <mesh geometry={g.eyeL} material={mats.line} position={[0, P.smile * 0.02, 0]} />
          <mesh geometry={g.eyeR} material={mats.line} position={[0, P.smile * 0.02, 0]} />
          <mesh geometry={g.browG} material={mats.brow} position={[-0.37, browLift, 0.93]} rotation={[-0.3, -0.38, -browTilt]} castShadow />
          <mesh geometry={g.browG} material={mats.brow} position={[0.37, browLift, 0.93]} rotation={[-0.3, 0.38, browTilt]} castShadow />
          <mesh geometry={g.mustache} material={mats.brow} position={[0, 0.04 + P.smile * 0.02, 0.06]} castShadow />
          <mesh geometry={g.mouth} material={mats.line} position={[0, P.smile * 0.015, 0.03]} scale={[0.6 + P.smile * 0.6, 0.6 + P.smile * 0.8, 1]} />
        </group>
      </group>
      {/* arms in world space */}
      {arms.map((a) => (
        <group key={a.side}>
          <mesh geometry={g.joint} material={mats.coat} position={a.S} scale={0.46} castShadow />
          <mesh geometry={g.upperSleeve} material={mats.coat} position={a.up.mid} quaternion={a.up.q} scale={[1, a.up.len, 1]} castShadow />
          <mesh geometry={g.joint} material={mats.coat} position={a.E} scale={0.39} castShadow />
          <mesh geometry={g.foreSleeve} material={mats.coat} position={a.fs.mid} quaternion={a.fs.q} scale={[1, a.fs.len, 1]} castShadow />
          <mesh geometry={g.cuff} material={mats.coat} position={a.fs.mid.clone().add(a.E.clone().sub(a.fs.mid).multiplyScalar(-1))} quaternion={a.fs.q} />
          <mesh geometry={g.forearm} material={mats.skin} position={a.fa.mid} quaternion={a.fa.q} scale={[1, a.fa.len, 1]} castShadow />
          <group position={a.W} quaternion={a.handQ}>
            <mesh geometry={g.palm} material={mats.skin} castShadow />
            {/* four fingers, curled toward the palm (around the cup, or resting on the apron) */}
            {[-0.17, -0.06, 0.05, 0.155].map((z, i) => (
              <group key={i} position={[0.02, 0.5 - Math.abs(z) * 0.25, z]} rotation={[0, 0, -0.35]}>
                <mesh geometry={g.finger} material={mats.skin} position={[0, 0.1, 0]} castShadow />
                <mesh geometry={g.finger} material={mats.skin} position={[0.07, 0.24, 0]} rotation={[0, 0, -0.7]} scale={[0.92, 0.75, 0.92]} castShadow />
              </group>
            ))}
            <mesh geometry={g.thumb} material={mats.skin} position={[0.05, 0.2, 0.2 * a.side * -1]} rotation={[a.side * 0.6, 0, 0.3]} castShadow />
          </group>
        </group>
      ))}
    </group>
  );
}

export const CHEF_FACE = () => new THREE.Vector3(0, ROOT.y + HEAD_Y, ROOT.z + 0.9);
void easeInOutCubic;
void n1;
