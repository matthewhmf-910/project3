import { useMemo } from 'react';
import * as THREE from 'three';
import { kyusuColor } from '../lib/textures';
import { kyusuPose } from './poses';

const V2 = (r: number, y: number) => new THREE.Vector2(r, y);

/** Tokoname-style side-handle kyusu, built from lathes and tubes. */
export function Kyusu({ t }: { t: number }) {
  const parts = useMemo(() => {
    const body = new THREE.LatheGeometry(
      [V2(0.0, 0.0), V2(0.3, 0.0), V2(0.36, 0.03), V2(0.47, 0.16), V2(0.53, 0.32), V2(0.5, 0.48), V2(0.42, 0.58), V2(0.34, 0.61), V2(0.33, 0.6)],
      64,
    );
    const lid = new THREE.LatheGeometry(
      [V2(0.0, 0.66), V2(0.12, 0.665), V2(0.3, 0.63), V2(0.355, 0.605), V2(0.35, 0.59)],
      64,
    );
    const knob = new THREE.LatheGeometry([V2(0, 0.66), V2(0.06, 0.67), V2(0.075, 0.72), V2(0.05, 0.77), V2(0, 0.785)], 32);
    // spout: a tapered tube along a gentle curve
    const spoutCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.38, 0.2, 0),
      new THREE.Vector3(0.62, 0.3, 0),
      new THREE.Vector3(0.82, 0.42, 0),
      new THREE.Vector3(0.98, 0.5, 0),
    ]);
    const spout = new THREE.TubeGeometry(spoutCurve, 24, 0.07, 20, false);
    const pa = spout.attributes.position;
    // taper the tube toward the tip
    for (let i = 0; i < pa.count; i++) {
      const ring = Math.floor(i / 21) / 24;
      const c = spoutCurve.getPointAt(Math.min(1, ring));
      const v = new THREE.Vector3().fromBufferAttribute(pa, i).sub(c);
      v.multiplyScalar(1 - ring * 0.55);
      pa.setXYZ(i, c.x + v.x, c.y + v.y, c.z + v.z);
    }
    spout.computeVertexNormals();
    const handle = new THREE.CylinderGeometry(0.075, 0.095, 0.78, 24, 1);
    handle.rotateX(Math.PI / 2);
    handle.translate(0, 0.32, -0.78);
    const handleCap = new THREE.SphereGeometry(0.076, 20, 12);
    handleCap.translate(0, 0.32, -1.17);
    const mat = new THREE.MeshPhysicalMaterial({
      map: kyusuColor(),
      roughness: 0.5,
      clearcoat: 0.35,
      clearcoatRoughness: 0.4,
      sheen: 0.3,
      sheenColor: new THREE.Color('#d08a60'),
    });
    return { body, lid, knob, spout, handle, handleCap, mat };
  }, []);
  const k = kyusuPose(t);
  return (
    <group position={k.pos} quaternion={k.q}>
      {[parts.body, parts.lid, parts.knob, parts.spout, parts.handle, parts.handleCap].map((g, i) => (
        <mesh key={i} geometry={g} material={parts.mat} castShadow receiveShadow />
      ))}
    </group>
  );
}
