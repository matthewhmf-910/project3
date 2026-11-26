// Inside the tea: the evening's courses drift past in amber light, like memories suspended in liquid.
import { useMemo } from 'react';
import * as THREE from 'three';
import { MEM, SEC } from '../timeline';
import { DISHES } from './camera';
import { mulberry32, range, smoother } from '../lib/math';
import { otoro, radial, stone } from '../lib/textures';

const M = new THREE.Vector3(...MEM);

function bgMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `
varying vec3 vP; uniform float uTime;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
void main(){
  float y = vP.y;
  vec3 deep = vec3(0.13,0.075,0.02);
  vec3 mid = vec3(0.78,0.5,0.14);
  vec3 top = vec3(1.5,1.12,0.6);
  vec3 c = mix(deep, mid, smoothstep(-0.6, 0.35, y));
  c = mix(c, top, smoothstep(0.35, 0.95, y));
  // caustic veins drifting overhead
  vec2 q = vP.xz / max(0.2, y + 1.2) * 6.0;
  float ca = n(q + uTime*0.6) * n(q*1.7 - uTime*0.4);
  c += vec3(1.0,0.82,0.4) * pow(ca, 2.5) * 2.2 * smoothstep(-0.3, 0.6, y);
  c *= 0.85 + 0.3 * n(vP.xy*3.0 + uTime*0.2);
  gl_FragColor = vec4(c, 1.0);
}`,
  });
}

function Nigiri() {
  const parts = useMemo(() => {
    const rnd = mulberry32(5);
    const grain = new THREE.CapsuleGeometry(0.022, 0.045, 4, 8);
    const rice = new THREE.InstancedMesh(
      grain,
      new THREE.MeshPhysicalMaterial({ color: '#f6f1e6', roughness: 0.38, sheen: 0.6, sheenColor: new THREE.Color('#ffffff'), clearcoat: 0.3 }),
      520,
    );
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    let i = 0;
    while (i < 520) {
      const p = new THREE.Vector3(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1);
      const r = p.length();
      if (r > 1 || r < 0.72) continue; // grains on the shell only
      p.multiply(new THREE.Vector3(0.36, 0.15, 0.19));
      if (p.y < -0.12) continue;
      q.setFromEuler(new THREE.Euler(rnd() * 3, rnd() * 3, rnd() * 3));
      m.compose(p, q, new THREE.Vector3(1, 1, 1));
      rice.setMatrixAt(i++, m);
    }
    rice.castShadow = true;
    // fish slab draped over the rice
    const fish = new THREE.BoxGeometry(0.95, 0.075, 0.44, 40, 2, 16);
    const pa = fish.attributes.position;
    for (let k = 0; k < pa.count; k++) {
      const x = pa.getX(k);
      const z = pa.getZ(k);
      const y = pa.getY(k);
      const drape = -1.1 * x * x - 0.9 * z * z;
      const taper = 1 - 0.15 * Math.abs(x) / 0.475;
      pa.setXYZ(k, x, y * taper + drape + 0.17, z * (0.95 + 0.05 * Math.cos(x * 6)));
    }
    fish.computeVertexNormals();
    const fishMat = new THREE.MeshPhysicalMaterial({ map: otoro('otoro'), roughness: 0.22, clearcoat: 0.9, clearcoatRoughness: 0.12, sheen: 0.4 });
    return { rice, fish, fishMat };
  }, []);
  return (
    <group>
      <primitive object={parts.rice} />
      <mesh geometry={parts.fish} material={parts.fishMat} castShadow />
      <mesh position={[0.05, 0.24, 0.02]} scale={[0.07, 0.04, 0.06]}>
        <icosahedronGeometry args={[1, 3]} />
        <meshPhysicalMaterial color="#8fa448" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Chawanmushi() {
  const cup = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          [0.24, 0],
          [0.3, 0.02],
          [0.36, 0.3],
          [0.38, 0.55],
          [0.36, 0.56],
          [0.34, 0.5],
          [0.32, 0.45],
        ].map(([r, y]) => new THREE.Vector2(r, y)),
        64,
      ),
    [],
  );
  return (
    <group>
      <mesh geometry={cup} castShadow>
        <meshPhysicalMaterial color="#f1ece0" roughness={0.18} clearcoat={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.47, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.33, 48]} />
        <meshPhysicalMaterial color="#f0d98f" roughness={0.12} clearcoat={1} sheen={0.5} />
      </mesh>
      {[-0.06, 0.03, 0.1].map((x, i) => (
        <mesh key={i} position={[x, 0.5, (i - 1) * 0.05]} rotation={[0, i * 0.8, Math.PI / 2]} scale={[1, 1, 0.8]}>
          <capsuleGeometry args={[0.045, 0.12, 6, 12]} />
          <meshPhysicalMaterial color="#e8952f" roughness={0.45} sheen={0.6} sheenColor="#ffc070" />
        </mesh>
      ))}
      <mesh position={[0.08, 0.53, 0.12]} rotation={[-1.2, 0.3, 0]} scale={[0.07, 0.045, 1]}>
        <circleGeometry args={[1, 16]} />
        <meshStandardMaterial color="#5f8a3a" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Sashimi() {
  const slab = useMemo(() => {
    const g = new THREE.BoxGeometry(0.55, 0.08, 0.26, 12, 1, 6);
    const pa = g.attributes.position;
    for (let k = 0; k < pa.count; k++) pa.setY(k, pa.getY(k) - 0.25 * pa.getX(k) ** 2);
    g.computeVertexNormals();
    return g;
  }, []);
  const kinds = ['akami', 'hirame', 'saba'] as const;
  return (
    <group>
      {/* shiso leaf */}
      <mesh position={[0, 0.02, -0.05]} rotation={[-Math.PI / 2 + 0.25, 0, 0.4]} scale={[0.42, 0.3, 1]}>
        <circleGeometry args={[1, 24]} />
        <meshStandardMaterial color="#3f7a2e" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {kinds.map((k, i) => (
        <mesh key={k} geometry={slab} position={[(i - 1) * 0.3, 0.1 + i * 0.03, 0.05 - i * 0.04]} rotation={[0.25, 0.5 - i * 0.25, 0.35]} castShadow>
          <meshPhysicalMaterial map={otoro(k)} roughness={0.2} clearcoat={0.9} clearcoatRoughness={0.1} />
        </mesh>
      ))}
      <mesh position={[0.42, 0.06, 0.15]} scale={[0.06, 0.035, 0.05]}>
        <icosahedronGeometry args={[1, 3]} />
        <meshPhysicalMaterial color="#8fa448" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Plate({ seed, w, d }: { seed: number; w: number; d: number }) {
  return (
    <mesh position={[0, -0.05, 0]} receiveShadow castShadow>
      <boxGeometry args={[w, 0.1, d, 1, 1, 1]} />
      <meshStandardMaterial map={stone(seed)} roughness={0.85} />
    </mesh>
  );
}

export function Memory({ t }: { t: number }) {
  const bg = useMemo(bgMaterial, []);
  bg.uniforms.uTime.value = t;
  const motes = useMemo(() => {
    const rnd = mulberry32(77);
    return Array.from({ length: 70 }, () => ({
      p: new THREE.Vector3((rnd() - 0.3) * 9, rnd() * 7 - 1, (rnd() - 0.6) * 6),
      s: 0.02 + rnd() * 0.05,
      v: 0.2 + rnd() * 0.5,
      ph: rnd() * 6.28,
    }));
  }, []);
  const moteMat = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: radial('mote', [
          [0, 'rgba(255,240,200,1)'],
          [0.3, 'rgba(255,210,120,0.6)'],
          [1, 'rgba(255,180,80,0)'],
        ]),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );
  const shafts = useMemo(() => {
    const rnd = mulberry32(31);
    return Array.from({ length: 7 }, (_, i) => ({
      p: [-2.2 + i * 0.8 + rnd() * 0.4, 4.5, -1.5 - rnd() * 3.5] as [number, number, number],
      w: 0.35 + rnd() * 0.6,
      ry: rnd() * 0.6 - 0.3,
      rz: 0.18 + rnd() * 0.08,
    }));
  }, []);
  const shaftMat = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 256;
    const x = c.getContext('2d')!;
    const g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, 'rgba(255,235,170,0.9)');
    g.addColorStop(0.6, 'rgba(255,200,110,0.12)');
    g.addColorStop(1, 'rgba(255,190,90,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 256);
    const h = x.createLinearGradient(0, 0, 64, 0);
    h.addColorStop(0, 'rgba(0,0,0,1)');
    h.addColorStop(0.5, 'rgba(0,0,0,0)');
    h.addColorStop(1, 'rgba(0,0,0,1)');
    x.globalCompositeOperation = 'destination-out';
    x.fillStyle = h;
    x.fillRect(0, 0, 64, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false, opacity: 0.95 });
  }, []);
  const local = t - SEC.dive;
  // dishes drift and slowly turn; each rises into its pool of light as the camera arrives
  const bob = (i: number) => Math.sin(t * 1.6 + i * 2) * 0.05;
  const enter = smoother(range(t, SEC.dive - 0.05, SEC.dive + 0.35));
  return (
    <group position={M}>
      <mesh material={bg} scale={40}>
        <sphereGeometry args={[1, 48, 32]} />
      </mesh>
      <ambientLight color="#8a6a30" intensity={0.6} />
      <directionalLight position={[-3, 8, 4]} color="#ffe2a8" intensity={4.5} />
      <directionalLight position={[4, 2, -6]} color="#d8f0c8" intensity={2.2} />
      <pointLight position={[1, 3.5, 2]} color="#ffcf80" intensity={25} distance={9} />
      {/* the surface overhead (we fell through it; we will rise through it) */}
      <mesh position={[0, 9.2, -1.8]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.6, 64]} />
        <meshBasicMaterial color="#fff2cf" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <group position={[DISHES.nigiri[0] - M.x, DISHES.nigiri[1] - M.y + bob(0) - (1 - enter) * 0.3, DISHES.nigiri[2] - M.z]} rotation={[0.08, -0.35 + local * 0.3, 0.03]} scale={1.2}>
        <Plate seed={3} w={1.3} d={0.7} />
        <Nigiri />
      </group>
      <group position={[DISHES.chawan[0] - M.x, DISHES.chawan[1] - M.y + bob(1), DISHES.chawan[2] - M.z]} rotation={[0.12, 0.4 - local * 0.25, -0.05]} scale={1.25}>
        <mesh position={[0, -0.04, 0]} receiveShadow>
          <cylinderGeometry args={[0.6, 0.62, 0.06, 48]} />
          <meshPhysicalMaterial color="#20201c" roughness={0.25} clearcoat={1} />
        </mesh>
        <Chawanmushi />
      </group>
      <group position={[DISHES.sashimi[0] - M.x, DISHES.sashimi[1] - M.y + bob(2), DISHES.sashimi[2] - M.z]} rotation={[0.18, 0.7 - local * 0.25, 0.04]} scale={1.3}>
        <Plate seed={9} w={1.35} d={0.8} />
        <Sashimi />
      </group>
      {/* light shafts falling through the tea from the surface */}
      {shafts.map((s, i) => (
        <mesh key={`s${i}`} material={shaftMat} position={s.p} rotation={[0.12 * Math.sin(t * 0.4 + i), s.ry, s.rz + Math.sin(t * 0.5 + i) * 0.03]} scale={[s.w, 9, 1]}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
      {motes.map((m, i) => {
        const y = m.p.y + ((local * m.v + m.ph) % 6);
        return <sprite key={i} material={moteMat} position={[m.p.x + Math.sin(t + m.ph) * 0.1, y, m.p.z]} scale={m.s * 4} />;
      })}
    </group>
  );
}
