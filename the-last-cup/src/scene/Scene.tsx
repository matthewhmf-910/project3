import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { EffectComposer, DepthOfField, Bloom, Vignette, ToneMapping, ChromaticAberration } from '@react-three/postprocessing';
import { ToneMappingMode, BlendFunction } from 'postprocessing';
import { shotAt } from './camera';
import { Cup } from './Cup';
import { Kyusu } from './Kyusu';
import { Chef } from './Chef';
import { BackWall, Counter, Furin, Lamp, Lights } from './Set';
import { Memory } from './Memory';
import { kyusuPose, cupPose } from './poses';
import { SEC } from '../timeline';

export type SceneProps = { t: number; quality?: 'final' | 'preview' | 'raw'; freeCamera?: boolean };

function CameraRig({ t, freeCamera }: { t: number; freeCamera?: boolean }) {
  const { camera } = useThree();
  const shot = shotAt(t);
  const ref = useRef(shot);
  ref.current = shot;
  const apply = () => {
    if (freeCamera) return;
    const s = ref.current;
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.copy(s.pos);
    // stable up vector: when looking (nearly) straight down, 'up' is the far side of the counter (-z),
    // so the frame never flips as the camera passes the vertical
    const fwd = s.target.clone().sub(s.pos).normalize();
    const v = THREE.MathUtils.smoothstep(Math.abs(fwd.y), 0.75, 0.97);
    const up = new THREE.Vector3(Math.sin(s.roll), Math.cos(s.roll), 0).lerp(new THREE.Vector3(Math.sin(s.roll), 0, -Math.cos(s.roll)), v).normalize();
    cam.up.copy(up);
    cam.lookAt(s.target);
    cam.fov = s.fov;
    cam.near = s.world === 'memory' ? 0.05 : 0.03;
    cam.far = 120;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
  };
  apply();
  useFrame(apply, -1);
  return null;
}

export function Scene({ t, quality = 'final', freeCamera }: SceneProps) {
  const shot = shotAt(t);
  const { scene } = useThree();
  const memory = shot.world === 'memory';
  useEffect(() => {
    scene.background = new THREE.Color(memory ? '#3a2a0c' : '#120c08');
    scene.fog = memory ? new THREE.Fog('#5a4414', 7, 24) : new THREE.Fog('#140e0a', 16, 42);
  }, [memory, scene]);

  const k = kyusuPose(t);
  const cup = cupPose(t).pos;
  const spotTarget = useMemo(() => new THREE.Vector3(), []);
  spotTarget.set(cup.x, Math.min(cup.y, 1.0), cup.z);

  const dofRef = useRef<any>(null);
  const focus = useMemo(() => new THREE.Vector3(), []);
  focus.copy(shot.focus);
  useFrame(() => {
    const dof = dofRef.current;
    if (!dof) return;
    dof.target = focus;
    dof.cocMaterial.worldFocusRange = shot.focusRange;
    dof.bokehScale = freeCamera ? 0 : shot.bokeh;
  }, 0);

  const final = quality === 'final';
  return (
    <>
      <CameraRig t={t} freeCamera={freeCamera} />
      <Environment resolution={256} frames={1} background={false} environmentIntensity={1.35}>
        <color attach="background" args={['#140e09']} />
        {/* warm overhead softbox (the lamp's bounce) */}
        <Lightformer form="rect" intensity={2.4} color="#ffd6a0" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[6, 3, 1]} />
        {/* pale green window strip, camera right-back: the cool rim in glazes */}
        <Lightformer form="rect" intensity={1.6} color="#d4ead2" position={[6, 2, -4]} rotation-y={-Math.PI / 3} scale={[2, 6, 1]} />
        {/* faint cream card left, for a second glint on the cup */}
        <Lightformer form="rect" intensity={0.7} color="#f3e6cc" position={[-6, 2, 3]} rotation-y={Math.PI / 2.5} scale={[3, 4, 1]} />
        {/* broad cream card behind the guest: the long soft reflection that makes glaze read as glaze */}
        <Lightformer form="rect" intensity={1.1} color="#fff1dc" position={[1, 2.5, 8]} rotation-y={Math.PI} scale={[7, 2.2, 1]} />
      </Environment>

      <group visible={!memory}>
        <Lights cupTarget={spotTarget} intensity={shot.cupEmpty ? 0.38 + 0.5 * Math.min(1, Math.max(0, (t - 8.0) / 1.0)) : 1} />
        <Counter />
        <BackWall />
        <Lamp />
        <Chef t={t} />
        <Kyusu t={t} />
        <Cup t={t} empty={shot.cupEmpty} kyusuTip={k.tip} kyusuDir={k.spoutDir} />
        <Furin t={t} />
      </group>
      <group visible={memory}>
        <Memory t={t} />
      </group>

      {quality !== 'raw' && <EffectComposer multisampling={final ? 4 : 0} enableNormalPass={false}>
        <DepthOfField ref={dofRef} target={focus} worldFocusRange={0.6} bokehScale={3} resolutionScale={final ? 1 : 0.5} />
        <Bloom intensity={memory ? 0.9 : shot.cupEmpty && t < 8.2 ? 0.25 : 0.55} luminanceThreshold={0.82} luminanceSmoothing={0.2} mipmapBlur radius={0.7} />
        <ChromaticAberration offset={new THREE.Vector2(0.0006, 0.0004)} radialModulation modulationOffset={0.3} blendFunction={BlendFunction.NORMAL} />
        <ToneMapping mode={ToneMappingMode.AGX} />
        <Vignette offset={0.32} darkness={0.62} />
      </EffectComposer>}
    </>
  );
}

export { SEC };
