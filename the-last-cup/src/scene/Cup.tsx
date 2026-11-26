import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { celadonBump, celadonColor, cupBottom, radial } from '../lib/textures';
import {
  CUP_BOTTOM_R,
  CUP_BOTTOM_Y,
  CUP_INNER,
  CUP_OUTER,
  cupPose,
  innerRadius,
  teaLevel,
  impactPoint,
  flow,
} from './poses';
import { SEC } from '../timeline';

const lathe = (pts: [number, number][], seg = 96) =>
  new THREE.LatheGeometry(
    pts.map(([r, y]) => new THREE.Vector2(r, y)),
    seg,
  );

// Tea surface: physical material with a procedural ripple normal (rings from the stream's impact,
// a slow drift, and the meniscus climbing the wall).
function makeTeaMaterial() {
  const m = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#b9a23e'),
    roughness: 0.04,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    ior: 1.34,
    specularIntensity: 1,
    normalMap: new THREE.DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1),
  });
  m.normalMap!.needsUpdate = true;
  const uniforms = {
    uTime: { value: 0 },
    uImpact: { value: new THREE.Vector2(0.4, 0.5) },
    uFlow: { value: 1 },
    uDeep: { value: new THREE.Color('#4a4a10') },
    uShallow: { value: new THREE.Color('#b9ad4c') },
  };
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, uniforms);
    s.fragmentShader = s.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uTime; uniform vec2 uImpact; uniform float uFlow; uniform vec3 uDeep; uniform vec3 uShallow;
float teaH(vec2 uv){
  vec2 c = uv - 0.5; float r = length(c)*2.0;
  float d = length(uv - uImpact);
  float rings = sin(d*150.0 - uTime*22.0) * exp(-d*7.0) * 0.012 * uFlow;
  rings += sin(d*90.0 - uTime*14.0 + 1.7) * exp(-d*4.0) * 0.006 * uFlow;
  float drift = sin(uv.x*23.0 + uTime*1.3)*sin(uv.y*19.0 - uTime*1.1)*0.0016;
  float men = smoothstep(0.86, 1.0, r) * 0.06; // meniscus
  return rings + drift + men;
}`,
      )
      .replace(
        'vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;',
        `vec2 e = vec2(0.0025, 0.0);
float h0 = teaH(vNormalMapUv);
vec3 mapN = normalize(vec3(-(teaH(vNormalMapUv+e.xy)-h0)/e.x*0.11, -(teaH(vNormalMapUv+e.yx)-h0)/e.x*0.11, 1.0));`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
{ float r = length(vNormalMapUv-0.5)*2.0;
  diffuseColor.rgb = mix(uDeep, uShallow, smoothstep(0.35, 1.0, r)*0.85 + 0.12);
  }`,
      );
  };
  return { m, uniforms };
}

function makeSteamMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uAmount: { value: 1 }, uSeed: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `
varying vec2 vUv; uniform float uTime; uniform float uAmount; uniform float uSeed;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float s=0.0,a=0.5; for(int i=0;i<5;i++){ s+=a*n(p); p*=2.07; a*=0.5;} return s; }
void main(){
  vec2 uv = vUv;
  float t = uTime*0.55 + uSeed*13.0;
  // curling column: domain-warped fbm scrolling upward, widening and fading with height
  float y = uv.y;
  vec2 q = vec2(uv.x*2.2 + sin(y*5.0 + t*1.7 + uSeed)*0.35*y, y*2.6 - t);
  float w = fbm(q*1.4 + fbm(q*2.0 + t*0.3)*1.2);
  float col = smoothstep(0.5, 0.0, abs(uv.x - 0.5 - sin(y*4.0+t+uSeed)*0.12*y) - y*0.22);
  float a = smoothstep(0.5, 0.9, w) * col * smoothstep(0.0, 0.18, y) * smoothstep(1.0, 0.45, y);
  gl_FragColor = vec4(vec3(0.95,0.93,0.88), a * 0.24 * uAmount);
}`,
  });
}

/** tapered liquid thread from the spout to the surface, rebuilt each frame */
function streamGeometry(t: number, tip: THREE.Vector3, dir: THREE.Vector3, end: THREE.Vector3, f: number) {
  const SEG = 48;
  const RAD = 12;
  const pos: number[] = [];
  const idx: number[] = [];
  const ctrl = tip.clone().addScaledVector(dir, 0.22);
  const curve = new THREE.QuadraticBezierCurve3(tip, ctrl, end);
  // when the flow stops the thread detaches from the spout and falls
  const detach = 1 - f;
  const u0 = Math.min(0.98, detach * 1.05);
  for (let i = 0; i <= SEG; i++) {
    const u = u0 + (1 - u0) * (i / SEG);
    const p = curve.getPointAt(Math.min(1, u));
    const tan = curve.getTangentAt(Math.min(1, u)).normalize();
    const nrm = new THREE.Vector3(0, 0, 1).cross(tan).normalize();
    const bin = tan.clone().cross(nrm).normalize();
    // thins as it accelerates; necks with a travelling wobble
    let r = 0.034 * (1 - 0.55 * u) * Math.sqrt(Math.max(0.05, f));
    r *= 1 + 0.18 * Math.sin(u * 40 - t * 38) * u;
    if (i === 0 || i === SEG) r *= 0.6;
    for (let k = 0; k < RAD; k++) {
      const a = (k / RAD) * Math.PI * 2;
      const o = nrm.clone().multiplyScalar(Math.cos(a) * r).addScaledVector(bin, Math.sin(a) * r);
      pos.push(p.x + o.x, p.y + o.y, p.z + o.z);
    }
  }
  for (let i = 0; i < SEG; i++)
    for (let k = 0; k < RAD; k++) {
      const a = i * RAD + k;
      const b = i * RAD + ((k + 1) % RAD);
      const c = (i + 1) * RAD + k;
      const d = (i + 1) * RAD + ((k + 1) % RAD);
      idx.push(a, c, b, b, c, d);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function Cup({ t, empty, kyusuTip, kyusuDir }: { t: number; empty: boolean; kyusuTip: THREE.Vector3; kyusuDir: THREE.Vector3 }) {
  const geo = useMemo(
    () => ({
      outer: lathe(CUP_OUTER),
      inner: lathe(CUP_INNER),
      foot: new THREE.CircleGeometry(0.2, 64),
      bottom: new THREE.CircleGeometry(CUP_BOTTOM_R + 0.003, 96),
      tea: new THREE.CircleGeometry(1, 128),
      shadow: new THREE.PlaneGeometry(1, 1),
      steam: new THREE.PlaneGeometry(1, 1),
      drop: new THREE.SphereGeometry(1, 24, 16),
    }),
    [],
  );
  const mats = useMemo(() => {
    const glaze = new THREE.MeshPhysicalMaterial({
      map: celadonColor(),
      bumpMap: celadonBump(),
      bumpScale: 0.6,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      sheen: 0.2,
      sheenColor: new THREE.Color('#e8f0dc'),
    });
    const innerGlaze = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#d6cbb0'),
      roughness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      side: THREE.DoubleSide,
    });
    const clay = new THREE.MeshStandardMaterial({ color: '#b89c7c', roughness: 0.9 });
    const bottomFull = new THREE.MeshPhysicalMaterial({ map: cupBottom(0), roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.25 });
    const bottomEmpty = new THREE.MeshPhysicalMaterial({ map: cupBottom(1), roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.25 });
    const shadow = new THREE.MeshBasicMaterial({
      map: radial('shadow', [
        [0, 'rgba(30,18,8,0.75)'],
        [0.45, 'rgba(30,18,8,0.35)'],
        [1, 'rgba(30,18,8,0)'],
      ]),
      transparent: true,
      depthWrite: false,
    });
    const stream = new THREE.MeshPhysicalMaterial({
      color: '#d9c25a',
      roughness: 0.03,
      clearcoat: 1,
      emissive: new THREE.Color('#5a4a10'),
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.88,
      ior: 1.34,
    });
    const steams = [0, 1, 2, 3].map((i) => {
      const s = makeSteamMaterial();
      s.uniforms.uSeed.value = i * 1.37;
      return s;
    });
    return { glaze, innerGlaze, clay, bottomFull, bottomEmpty, shadow, stream, steams, tea: makeTeaMaterial() };
  }, []);

  const { pos, tiltX } = cupPose(t);
  const lvl = teaLevel(t);
  const r = lvl > 0 ? innerRadius(lvl) - 0.002 : 0;
  const f = flow(t);
  mats.tea.uniforms.uTime.value = t;
  mats.tea.uniforms.uFlow.value = Math.max(0.15, f) * (t < SEC.dive ? 1 : 0);
  // after the pour the surface keeps a few settling rings from the impact point
  if (t > 2.2) mats.tea.uniforms.uFlow.value = 0.15 + Math.exp(-(t - 2.2) * 2.5) * 0.85;
  // carried tea sloshes gently: rings from the centre while the cup travels
  const carry = Math.sin(Math.min(1, Math.max(0, (t - 3.4) / 1.4)) * Math.PI);
  if (t > 3.4 && t < SEC.dive) mats.tea.uniforms.uFlow.value = Math.max(mats.tea.uniforms.uFlow.value, 0.35 * carry + 0.12);

  const impact = impactPoint(t);
  const streamGeo = useMemo(
    () => (t < 2.42 && f > 0.001 ? streamGeometry(t, kyusuTip, kyusuDir, impact, f) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );
  useEffect(() => () => streamGeo?.dispose(), [streamGeo]);
  // impact point in the tea disc's uv space
  if (r > 0) {
    const lx = (impact.x - pos.x) / r;
    const lz = (impact.z - pos.z) / r;
    mats.tea.uniforms.uImpact.value.set(0.5 + lx * 0.5, 0.5 - lz * 0.5);
  }

  // drips after the pour (2.30, 2.45): fall from the spout tip to the surface
  const drips = [2.3, 2.45].map((t0, i) => {
    const k = (t - t0) / 0.16;
    if (k < 0 || k > 1) return null;
    const p = kyusuTip.clone().lerp(impact, k * k);
    return <mesh key={i} geometry={geo.drop} material={mats.stream} position={p} scale={[0.018, 0.026, 0.018]} />;
  });

  const steamOn = !empty && t < SEC.dive;
  mats.steams.forEach((s, i) => {
    s.uniforms.uTime.value = t + i * 0.7;
    s.uniforms.uAmount.value = steamOn ? Math.min(1, 0.35 + t * 0.4) : 0;
  });

  return (
    <group>
      <group position={pos} rotation={[tiltX, 0, 0]}>
        <mesh geometry={geo.outer} material={mats.glaze} castShadow receiveShadow />
        <mesh geometry={geo.inner} material={mats.innerGlaze} receiveShadow />
        <mesh geometry={geo.foot} material={mats.clay} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} />
        <mesh
          geometry={geo.bottom}
          material={empty ? mats.bottomEmpty : mats.bottomFull}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, CUP_BOTTOM_Y + 0.001, 0]}
          receiveShadow
        />
        {lvl > 0 && (
          <mesh geometry={geo.tea} material={mats.tea.m} rotation={[-Math.PI / 2, 0, 0]} position={[0, lvl, 0]} scale={[r, r, 1]} />
        )}
        {empty && (
          // the last drop, resting in the well of the cup
          <mesh geometry={geo.drop} material={mats.stream} position={[0.12, CUP_BOTTOM_Y + 0.003, 0.09]} scale={[0.016, 0.0035, 0.013]} />
        )}
        {/* steam rises from the surface, camera-facing planes at different phases */}
        {steamOn &&
          mats.steams.slice(0, 3).map((s, i) => (
            <mesh
              key={i}
              geometry={geo.steam}
              material={s}
              position={[(i - 1) * 0.07, lvl + 0.5 + i * 0.06, (i % 2) * 0.05]}
              scale={[0.42 + i * 0.06, 1.0 + i * 0.12, 1]}
              rotation={[0, 0.35 * (i - 1), 0]}
              renderOrder={10}
            />
          ))}
      </group>
      {/* soft contact shadow under the cup when it sits on the counter */}
      {pos.y < 0.3 && (
        <mesh
          geometry={geo.shadow}
          material={mats.shadow}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[pos.x + 0.04, 0.003, pos.z + 0.02]}
          scale={[1.15 - pos.y, 1.15 - pos.y, 1]}
        />
      )}
      {streamGeo && <mesh geometry={streamGeo} material={mats.stream} />}
      {drips}
    </group>
  );
}
