import * as THREE from 'three';
import {
  createLemonHalfModel,
  createLemonHalfLookDevLights,
  createLemonHalfEnvironment,
  frameLemonHalfCamera,
  configureLemonHalfRenderer,
} from './createLemonHalfModel.js';

const canvas = document.getElementById('c') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(1024, 1024);
configureLemonHalfRenderer(renderer);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#9b9088');

const model = createLemonHalfModel({});
scene.add(model);

const lights = createLemonHalfLookDevLights();
for (const light of Object.values(lights)) {
  if (light instanceof THREE.Object3D) scene.add(light);
}

try {
  scene.environment = createLemonHalfEnvironment(renderer);
} catch (e) {
  // environment optional
}

const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.set(0, 0.1, 3);
camera.lookAt(0, 0, 0);
try {
  frameLemonHalfCamera(camera, model);
} catch (e) {}

(window as any).__scene = scene;
(window as any).__camera = camera;
(window as any).__renderer = renderer;
(window as any).__model = model;

function setAzimuth(deg: number) {
  const rad = (deg * Math.PI) / 180;
  const radius = camera.position.length() || 3;
  camera.position.set(Math.sin(rad) * radius, camera.position.y, Math.cos(rad) * radius);
  camera.lookAt(0, 0, 0);
}
(window as any).__setAzimuth = setAzimuth;

function render() {
  renderer.render(scene, camera);
}
(window as any).__render = render;
render();
(window as any).__ready = true;
