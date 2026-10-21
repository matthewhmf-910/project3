/**
 * Export Bread Mascot Model to glTF Binary (.glb)
 * Usage: node export-glb.js
 */

const THREE = require('three');
const fs = require('fs');
const path = require('path');

// GLTFExporter from three examples
const GLTFExporter = require('three/examples/jsm/exporters/GLTFExporter').GLTFExporter;

/**
 * Create bread texture
 */
function createBreadTexture() {
  const canvas = require('canvas').createCanvas(512, 512);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#F5E6D3';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
  for (let i = 0; i < canvas.width; i += 4) {
    ctx.fillRect(i, 0, 2, canvas.height);
  }
  for (let i = 0; i < canvas.height; i += 4) {
    ctx.fillRect(0, i, canvas.width, 2);
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 20;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Build the bread mascot scene
 */
function buildScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  const breadTexture = createBreadTexture();

  // === TOAST BODY ===
  const width = 1.0, height = 1.4, depth = 0.6, radius = 0.15;
  const shape = new THREE.Shape();
  const halfW = width / 2, halfH = height / 2;

  shape.moveTo(-halfW + radius, -halfH);
  shape.lineTo(halfW - radius, -halfH);
  shape.quadraticCurveTo(halfW, -halfH, halfW, -halfH + radius);
  shape.lineTo(halfW, halfH - radius);
  shape.quadraticCurveTo(halfW, halfH, halfW - radius, halfH);
  shape.lineTo(-halfW + radius, halfH);
  shape.quadraticCurveTo(-halfW, halfH, -halfW, halfH - radius);
  shape.lineTo(-halfW, -halfH + radius);
  shape.quadraticCurveTo(-halfW, -halfH, -halfW + radius, -halfH);

  const bodyGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: depth,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 6,
    steps: 8
  });
  bodyGeometry.center();

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xF5E6D3,
    roughness: 0.85,
    metallic: 0.0,
    map: breadTexture
  });

  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.castShadow = true;
  body.receiveShadow = true;
  scene.add(body);

  // === EYES ===
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metallic: 0.1 });
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x0066cc, roughness: 0.2, metallic: 0.15 });
  const catchlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.8 });

  for (let i = 0; i < 2; i++) {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set((i === 0 ? -0.25 : 0.25), 0.1, 0.32);

    const whiteGeom = new THREE.SphereGeometry(0.12, 32, 16);
    const eyeWhite = new THREE.Mesh(whiteGeom, eyeWhiteMat);
    eyeWhite.castShadow = true;
    eyeGroup.add(eyeWhite);

    const irisGeom = new THREE.SphereGeometry(0.08, 24, 12);
    const iris = new THREE.Mesh(irisGeom, irisMat);
    iris.position.z = 0.08;
    iris.castShadow = true;
    eyeGroup.add(iris);

    const catchGeom = new THREE.SphereGeometry(0.025, 16, 8);
    const catchlight = new THREE.Mesh(catchGeom, catchlightMat);
    catchlight.position.set(0.03, 0.03, 0.12);
    eyeGroup.add(catchlight);

    body.add(eyeGroup);
  }

  // === NOSE ===
  const noseGeom = new THREE.SphereGeometry(0.08, 20, 16);
  noseGeom.scale(1, 1.1, 1);
  const noseMat = new THREE.MeshStandardMaterial({ color: 0xdd3333, roughness: 0.6, metallic: 0.0, emissive: 0x8b0000, emissiveIntensity: 0.1 });
  const nose = new THREE.Mesh(noseGeom, noseMat);
  nose.position.set(0, -0.08, 0.35);
  nose.castShadow = true;
  nose.receiveShadow = true;
  body.add(nose);

  // === MOUTH ===
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.15, 0, 0),
    new THREE.Vector3(-0.1, -0.03, 0),
    new THREE.Vector3(0, -0.05, 0),
    new THREE.Vector3(0.1, -0.03, 0),
    new THREE.Vector3(0.15, 0, 0)
  ]);
  const mouthGeom = new THREE.TubeGeometry(curve, 20, 0.02, 8);
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0xdd3333, roughness: 0.7, metallic: 0.0 });
  const mouth = new THREE.Mesh(mouthGeom, mouthMat);
  mouth.position.set(0, -0.28, 0.35);
  mouth.castShadow = true;
  mouth.receiveShadow = true;
  body.add(mouth);

  // === HAT ===
  const hatGroup = new THREE.Group();
  hatGroup.position.z = 0;

  const hatGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 32, 8);
  const hatMat = new THREE.MeshStandardMaterial({ color: 0x8b6e47, roughness: 0.75, metallic: 0.0 });
  const hat = new THREE.Mesh(hatGeom, hatMat);
  hat.position.y = 0.65;
  hat.castShadow = true;
  hat.receiveShadow = true;
  hatGroup.add(hat);

  const bandGeom = new THREE.TorusGeometry(0.5, 0.02, 32, 16);
  const bandMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.5, metallic: 0.2 });
  const band = new THREE.Mesh(bandGeom, bandMat);
  band.position.set(0, 0.5, 0);
  band.castShadow = true;
  band.receiveShadow = true;
  hatGroup.add(band);

  const topCylGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 24, 4);
  const topMat = new THREE.MeshStandardMaterial({ color: 0xffdd00, roughness: 0.6, metallic: 0.15 });
  const topCyl = new THREE.Mesh(topCylGeom, topMat);
  topCyl.position.y = 0.95;
  topCyl.castShadow = true;
  topCyl.receiveShadow = true;
  hatGroup.add(topCyl);

  const redGeom = new THREE.SphereGeometry(0.05, 16, 8);
  const redMat = new THREE.MeshStandardMaterial({ color: 0xdd3333, roughness: 0.55, metallic: 0.1 });
  for (let x of [-0.08, 0.08]) {
    const sphere = new THREE.Mesh(redGeom, redMat);
    sphere.position.set(x, 0.9, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    hatGroup.add(sphere);
  }

  body.add(hatGroup);

  // === JACKET ===
  const jacketGroup = new THREE.Group();
  jacketGroup.position.set(0, -0.15, 0.31);
  jacketGroup.name = 'jacket';

  const panelGeom = new THREE.BoxGeometry(1.05, 0.85, 0.05, 16, 8, 1);
  const jacketMat = new THREE.MeshStandardMaterial({ color: 0x8b6e47, roughness: 0.78, metallic: 0.0 });
  const frontPanel = new THREE.Mesh(panelGeom, jacketMat);
  frontPanel.castShadow = true;
  frontPanel.receiveShadow = true;
  jacketGroup.add(frontPanel);

  const lapelGeom = new THREE.ConeGeometry(0.1, 0.3, 8);
  for (let x of [-0.35, 0.35]) {
    const lapel = new THREE.Mesh(lapelGeom, jacketMat);
    lapel.position.set(x, 0.15, 0.08);
    lapel.rotation.z = (x < 0) ? Math.PI / 4 : -Math.PI / 4;
    lapel.castShadow = true;
    lapel.receiveShadow = true;
    jacketGroup.add(lapel);
  }

  body.add(jacketGroup);

  // === SNEAKERS ===
  const sneakersGroup = new THREE.Group();
  sneakersGroup.position.set(0, -0.95, 0);
  sneakersGroup.name = 'sneakers';

  const footGeom = new THREE.BoxGeometry(0.2, 0.15, 0.35, 8, 4, 8);
  const shoesMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8, metallic: 0.0 });

  for (let x of [-0.15, 0.15]) {
    const foot = new THREE.Mesh(footGeom, shoesMat);
    foot.position.x = x;
    foot.castShadow = true;
    foot.receiveShadow = true;
    sneakersGroup.add(foot);
  }

  body.add(sneakersGroup);

  // === PEDESTAL ===
  const pedestalGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32, 1);
  const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9, metallic: 0.05 });
  const pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
  pedestal.position.y = -1.1;
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  scene.add(pedestal);

  // === LIGHTING ===
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
  keyLight.position.set(2.0, 1.5, 2.0);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.bias = -0.001;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xccddff, 0.5);
  fillLight.position.set(-1.0, 0.8, 1.0);
  scene.add(fillLight);

  const backLight = new THREE.DirectionalLight(0xffddcc, 0.4);
  backLight.position.set(0, 0.5, -1.5);
  scene.add(backLight);

  return scene;
}

/**
 * Export to glTF Binary (.glb)
 */
async function exportToGLB() {
  console.log('🍞 Building bread mascot scene...');
  const scene = buildScene();

  console.log('📦 Exporting to glTF Binary format...');
  const exporter = new GLTFExporter();

  exporter.parse(scene, (gltf) => {
    const glbBuffer = gltf;
    const outputPath = path.join(__dirname, 'bread_mascot.glb');

    fs.writeFileSync(outputPath, glbBuffer);
    console.log(`✅ Successfully exported to: ${outputPath}`);
    console.log(`📊 File size: ${(glbBuffer.byteLength / 1024).toFixed(2)} KB`);
  }, (error) => {
    console.error('❌ Export failed:', error);
  });
}

// Run export
exportToGLB();
