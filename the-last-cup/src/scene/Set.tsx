import { useMemo } from 'react';
import * as THREE from 'three';
import { hinokiBump, hinokiColor, radial, seigaiha, washi } from '../lib/textures';
import { mulberry32 } from '../lib/math';
import { SEC } from '../timeline';

const LAMP = new THREE.Vector3(0.35, 10.6, -0.9);

export function Lights({ cupTarget, intensity = 1 }: { cupTarget: THREE.Vector3; intensity?: number }) {
  const spot = useMemo(() => {
    const s = new THREE.SpotLight('#ffcf98', 950, 30, 0.42, 0.85, 2);
    s.position.copy(LAMP).add(new THREE.Vector3(0, -0.8, 0));
    s.castShadow = true;
    s.shadow.mapSize.set(2048, 2048);
    s.shadow.bias = -0.0004;
    s.shadow.normalBias = 0.02;
    s.shadow.radius = 6;
    s.shadow.camera.near = 2;
    s.shadow.camera.far = 25;
    return s;
  }, []);
  spot.intensity = 950 * intensity;
  spot.target.position.copy(cupTarget);
  spot.target.updateMatrixWorld();
  return (
    <>
      <primitive object={spot} />
      <primitive object={spot.target} />
      {/* the lamp's own glow falling on the chef's head and the back of the counter */}
      <pointLight position={LAMP.clone().add(new THREE.Vector3(0, -0.6, 0))} color="#ffc98c" intensity={40} distance={14} decay={2} />
      {/* cool pale-green rim from the garden window behind, camera-right */}
      <directionalLight position={[7, 6, -9]} color="#cfe6cf" intensity={3.2} />
      {/* soft warm fill from the guest's side, low */}
      <directionalLight position={[-3, 3, 9]} color="#ffe6c8" intensity={0.9} />
      {/* faint warm bounce from the counter */}
      <hemisphereLight args={['#3a3028', '#6b5238', 0.35]} />
    </>
  );
}

export function Counter() {
  const mats = useMemo(() => {
    const top = new THREE.MeshPhysicalMaterial({
      map: hinokiColor(),
      bumpMap: hinokiBump(),
      bumpScale: 0.35,
      roughness: 0.42,
      clearcoat: 0.35,
      clearcoatRoughness: 0.3,
    });
    const side = new THREE.MeshStandardMaterial({ color: '#8b6a48', roughness: 0.7 });
    return { top, side };
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.BoxGeometry(26, 0.62, 4.6, 1, 1, 1);
    g.translate(0, -0.31, -0.2);
    return g;
  }, []);
  // a rounded front nosing catches a line of light, like a real slab edge
  const nose = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.14, 0.14, 26, 16, 1);
    g.rotateZ(Math.PI / 2);
    g.translate(0, -0.14, 2.03);
    return g;
  }, []);
  return (
    <group>
      <mesh geometry={geo} material={[mats.side, mats.side, mats.top, mats.side, mats.side, mats.side]} receiveShadow castShadow />
      <mesh geometry={nose} material={mats.top} receiveShadow />
      {/* chef's work surface behind, a step lower */}
      <mesh position={[0, -1.4, -4.6]} receiveShadow>
        <boxGeometry args={[26, 0.4, 3.2]} />
        <meshStandardMaterial color="#5e4632" roughness={0.6} />
      </mesh>
      <Chopsticks />
    </group>
  );
}

function Chopsticks() {
  const g = useMemo(() => {
    const stick = new THREE.CylinderGeometry(0.028, 0.045, 2.3, 12);
    stick.rotateZ(Math.PI / 2);
    return stick;
  }, []);
  return (
    <group position={[-1.6, 0.12, 1.25]} rotation={[0, 0.28, 0]}>
      <mesh geometry={g} position={[0, 0.02, 0]} castShadow>
        <meshStandardMaterial color="#3b2a1e" roughness={0.45} />
      </mesh>
      <mesh geometry={g} position={[0.02, 0.02, 0.13]} castShadow>
        <meshStandardMaterial color="#3b2a1e" roughness={0.45} />
      </mesh>
      {/* hashioki: a small celadon pebble */}
      <mesh position={[0.85, -0.05, 0.06]} scale={[0.22, 0.09, 0.13]} castShadow receiveShadow>
        <sphereGeometry args={[1, 24, 16]} />
        <meshPhysicalMaterial color="#b7c7a8" roughness={0.2} clearcoat={1} />
      </mesh>
    </group>
  );
}

export function BackWall() {
  const data = useMemo(() => {
    const rnd = mulberry32(42);
    const slats: [number, number][] = [];
    for (let x = -9; x <= 9; x += 0.42) slats.push([x, 0.18 + rnd() * 0.05]);
    const bokeh: { p: [number, number, number]; s: number; c: string }[] = [];
    for (let i = 0; i < 22; i++) {
      bokeh.push({
        p: [(rnd() - 0.5) * 16, 1.5 + rnd() * 9, -7.2 - rnd() * 3],
        s: 0.05 + rnd() * 0.08,
        c: rnd() < 0.8 ? '#ffb877' : '#d6eccd',
      });
    }
    const bottles: { x: number; h: number; r: number; c: string }[] = [];
    for (let i = 0; i < 9; i++) bottles.push({ x: -6.5 + i * 1.55 + rnd() * 0.4, h: 1.1 + rnd() * 1.3, r: 0.28 + rnd() * 0.18, c: ['#2e3b2a', '#4a3a2a', '#6f6a5c', '#2a2622'][i % 4] });
    return { slats, bokeh, bottles };
  }, []);
  const slat = useMemo(() => new THREE.BoxGeometry(0.3, 14, 0.2), []);
  const slatMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3a2a1e', roughness: 0.75 }), []);
  const glow = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: radial('wallglow', [
          [0, 'rgba(255,190,120,1)'],
          [0.5, 'rgba(200,120,60,0.45)'],
          [1, 'rgba(60,30,15,0)'],
        ]),
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  return (
    <group>
      <mesh position={[0, 4, -9.4]}>
        <planeGeometry args={[40, 24]} />
        <meshStandardMaterial color="#1c140e" roughness={1} />
      </mesh>
      {/* warm light washing the wall behind the slats */}
      <mesh position={[0, 5.2, -9.3]} scale={[18, 9, 1]} material={glow}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      {data.slats.map(([x, d], i) => (
        <mesh key={i} geometry={slat} material={slatMat} position={[x, 4, -8.9 + d]} />
      ))}
      {/* shelf with sake bottles and ceramics, out of focus */}
      <mesh position={[0, 3.0, -8.2]}>
        <boxGeometry args={[18, 0.15, 1.2]} />
        <meshStandardMaterial color="#4a3524" roughness={0.6} />
      </mesh>
      {data.bottles.map((b, i) => (
        <mesh key={i} position={[b.x, 3.07 + b.h / 2, -8.1]}>
          <cylinderGeometry args={[b.r * 0.55, b.r, b.h, 20]} />
          <meshPhysicalMaterial color={b.c} roughness={0.25} clearcoat={0.8} />
        </mesh>
      ))}
      {data.bokeh.map((b, i) => (
        <mesh key={i} position={b.p} scale={b.s}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshBasicMaterial color={b.c} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export function Lamp() {
  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: washi([250, 238, 214]),
      emissive: new THREE.Color('#ffc78a'),
      emissiveMap: washi([255, 220, 170]),
      emissiveIntensity: 2.2,
      roughness: 1,
      side: THREE.DoubleSide,
    });
    return m;
  }, []);
  return (
    <group position={LAMP}>
      <mesh material={mat}>
        <cylinderGeometry args={[0.95, 1.05, 1.5, 48, 1, true]} />
      </mesh>
      <mesh position={[0, 0.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.96, 0.03, 8, 48]} />
        <meshStandardMaterial color="#2b2018" />
      </mesh>
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 5.5, 6]} />
        <meshStandardMaterial color="#1a120c" />
      </mesh>
    </group>
  );
}

/** Furin (glass wind chime): glass bell, clapper, washi tanzaku. Swings after the strike. */
export function Furin({ t }: { t: number }) {
  const parts = useMemo(() => {
    const bell = new THREE.LatheGeometry(
      [
        [0.0, 0.62],
        [0.18, 0.6],
        [0.36, 0.48],
        [0.46, 0.25],
        [0.5, 0.02],
        [0.47, 0.0],
        [0.44, 0.03],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
      48,
    );
    const glass = new THREE.MeshPhysicalMaterial({
      color: '#eef5ee',
      roughness: 0.04,
      metalness: 0,
      transmission: 0,
      transparent: true,
      opacity: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const paint = new THREE.MeshBasicMaterial({ map: seigaiha(), transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: 0.8 });
    const paper = new THREE.MeshStandardMaterial({ map: washi([246, 240, 226]), roughness: 0.95, side: THREE.DoubleSide });
    const red = new THREE.MeshStandardMaterial({ color: '#a8342a', roughness: 0.8 });
    const tanzaku = new THREE.PlaneGeometry(0.42, 1.35, 1, 12);
    tanzaku.translate(0, -0.675, 0);
    return { bell, glass, paint, paper, red, tanzaku };
  }, []);
  // swing: struck by a breeze at the chime cue, decays; tanzaku lags behind (follow-through)
  const k = t - (SEC.chime - 0.12);
  const swing = k > 0 ? Math.sin(k * 5.2) * Math.exp(-k * 0.9) * 0.16 : Math.sin(t * 1.3) * 0.012;
  const lag = k > 0 ? Math.sin((k - 0.12) * 5.2) * Math.exp(-k * 0.8) * 0.32 : Math.sin(t * 1.3 - 0.4) * 0.03;
  return (
    <group position={[2.05, 8.6, -1.2]} rotation={[0, 0, swing]}>
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 1.4, 4]} />
        <meshStandardMaterial color="#d7cfbf" />
      </mesh>
      <group position={[0, -2.0, 0]}>
        <mesh geometry={parts.bell} material={parts.glass} />
        <mesh geometry={parts.bell} material={parts.paint} scale={1.003} />
        {/* clapper and string */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.7, 4]} />
          <meshStandardMaterial color="#d7cfbf" />
        </mesh>
        <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
          <meshPhysicalMaterial color="#dfe9df" roughness={0.1} transparent opacity={0.7} />
        </mesh>
        <group position={[0, -0.45, 0]} rotation={[0, 0.3, lag - swing]}>
          <mesh geometry={parts.tanzaku} material={parts.paper} castShadow />
          <mesh position={[0, -1.15, 0.003]} material={parts.red}>
            <planeGeometry args={[0.08, 0.1]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export { LAMP };
