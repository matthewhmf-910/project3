/**
 * Bread Mascot Character - Procedural Three.js Model
 * Reconstructed from reference image as code-only procedural geometry
 * Features: Orbit camera, dolly motion, scroll-based animation, component separation
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

/**
 * Canvas texture generator for bread surface texture
 */
function createBreadTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base bread color
  ctx.fillStyle = '#F5E6D3';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add subtle fabric weave pattern
  ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
  for (let i = 0; i < canvas.width; i += 4) {
    ctx.fillRect(i, 0, 2, canvas.height);
  }
  for (let i = 0; i < canvas.height; i += 4) {
    ctx.fillRect(0, i, canvas.width, 2);
  }

  // Add subtle noise
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
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

class BreadMascotBuilder {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);
    this.scene.fog = new THREE.Fog(0xf0f0f0, 10, 50);

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 3.5);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);

    // Setup post-processing with outline
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.outlinePass = new OutlinePass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      this.scene,
      this.camera
    );
    this.outlinePass.edgeStrength = 2.5;
    this.outlinePass.edgeGlow = 0.1;
    this.outlinePass.edgeThickness = 2;
    this.outlinePass.pulsePeriod = 0;
    this.outlinePass.visibleEdgeColor.set(0x333333);
    this.outlinePass.hiddenEdgeColor.set(0x222222);
    this.composer.addPass(this.outlinePass);

    // Components storage
    this.components = {};
    this.breadTexture = createBreadTexture();

    // Animation state
    this.scrollY = 0;
    this.scrollTarget = 0;
    this.animation = {
      jacketRotation: 0,
      sneakersRotation: 0,
      time: 0
    };
  }

  /**
   * Build the complete bread mascot character
   */
  build() {
    this.setupLighting();
    this.createToastBody();
    this.createFacialFeatures();
    this.createHatAndDecorations();
    this.createJacket();
    this.createSneakers();
    this.createPedestal();
    this.setupControls();
    this.setupInteraction();
    this.startAnimation();
  }

  /**
   * Setup three-point lighting
   */
  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Key light (directional)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(2.0, 1.5, 2.0);
    keyLight.target.position.set(0, 0, 0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.001;
    this.scene.add(keyLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0xccddff, 0.5);
    fillLight.position.set(-1.0, 0.8, 1.0);
    this.scene.add(fillLight);

    // Back light
    const backLight = new THREE.DirectionalLight(0xffddcc, 0.4);
    backLight.position.set(0, 0.5, -1.5);
    this.scene.add(backLight);
  }

  /**
   * Create the main bread/toast body
   */
  createToastBody() {
    // Rounded rectangle extruded geometry for bread
    const width = 1.0;
    const height = 1.4;
    const depth = 0.6;
    const radius = 0.15;

    // Create rounded rectangle shape
    const shape = new THREE.Shape();
    const halfW = width / 2;
    const halfH = height / 2;

    shape.moveTo(-halfW + radius, -halfH);
    shape.lineTo(halfW - radius, -halfH);
    shape.quadraticCurveTo(halfW, -halfH, halfW, -halfH + radius);
    shape.lineTo(halfW, halfH - radius);
    shape.quadraticCurveTo(halfW, halfH, halfW - radius, halfH);
    shape.lineTo(-halfW + radius, halfH);
    shape.quadraticCurveTo(-halfW, halfH, -halfW, halfH - radius);
    shape.lineTo(-halfW, -halfH + radius);
    shape.quadraticCurveTo(-halfW, -halfH, -halfW + radius, -halfH);

    // Extrude geometry
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: depth,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 6,
      steps: 8
    });
    geometry.center();

    // Material with subtle texture
    const material = new THREE.MeshStandardMaterial({
      color: 0xF5E6D3,
      roughness: 0.85,
      metallic: 0.0,
      map: this.breadTexture,
      side: THREE.FrontSide,
      flatShading: false
    });

    const body = new THREE.Mesh(geometry, material);
    body.castShadow = true;
    body.receiveShadow = true;
    body.position.z = 0;

    this.components.body = body;
    this.scene.add(body);

    // Add to outline
    this.outlinePass.selectedObjects.push(body);
  }

  /**
   * Create facial features (eyes, nose, mouth)
   */
  createFacialFeatures() {
    const faceGroup = new THREE.Group();
    faceGroup.position.z = 0.32;

    // Left eye
    this.createEye(faceGroup, -0.25, 0.1, 'left');

    // Right eye
    this.createEye(faceGroup, 0.25, 0.1, 'right');

    // Nose
    this.createNose(faceGroup);

    // Mouth
    this.createMouth(faceGroup);

    this.components.face = faceGroup;
    this.components.body.add(faceGroup);
  }

  /**
   * Create a single eye with iris and catchlight
   */
  createEye(parent, x, y, side) {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(x, y, 0);

    // Eye white (sclera)
    const whiteGeometry = new THREE.SphereGeometry(0.12, 32, 16);
    const whiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      metallic: 0.1
    });
    const eyeWhite = new THREE.Mesh(whiteGeometry, whiteMaterial);
    eyeWhite.castShadow = true;
    eyeWhite.receiveShadow = true;
    eyeGroup.add(eyeWhite);

    // Iris
    const irisGeometry = new THREE.SphereGeometry(0.08, 24, 12);
    const irisMaterial = new THREE.MeshStandardMaterial({
      color: 0x0066cc,
      roughness: 0.2,
      metallic: 0.15
    });
    const iris = new THREE.Mesh(irisGeometry, irisMaterial);
    iris.position.z = 0.08;
    iris.castShadow = true;
    eyeGroup.add(iris);

    // Catchlight
    const catchlightGeometry = new THREE.SphereGeometry(0.025, 16, 8);
    const catchlightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.8
    });
    const catchlight = new THREE.Mesh(catchlightGeometry, catchlightMaterial);
    catchlight.position.set(0.03, 0.03, 0.12);
    eyeGroup.add(catchlight);

    // Outline around eye
    const outlineGeometry = new THREE.BufferGeometry();
    const outlineVertices = [];
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      outlineVertices.push(
        Math.cos(angle) * 0.125,
        Math.sin(angle) * 0.125,
        0
      );
    }
    outlineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(outlineVertices), 3));
    const outlineMaterial = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 3 });
    const outline = new THREE.LineLoop(outlineGeometry, outlineMaterial);
    outline.position.z = 0.01;
    eyeGroup.add(outline);

    parent.add(eyeGroup);
    this.components[`eye_${side}`] = eyeGroup;
  }

  /**
   * Create nose
   */
  createNose(parent) {
    const geometry = new THREE.SphereGeometry(0.08, 20, 16);
    // Scale to make it bulbous
    geometry.scale(1, 1.1, 1);

    const material = new THREE.MeshStandardMaterial({
      color: 0xdd3333,
      roughness: 0.6,
      metallic: 0.0,
      emissive: 0x8b0000,
      emissiveIntensity: 0.1
    });

    const nose = new THREE.Mesh(geometry, material);
    nose.position.set(0, -0.08, 0.03);
    nose.castShadow = true;
    nose.receiveShadow = true;

    parent.add(nose);
    this.components.nose = nose;
  }

  /**
   * Create smile/mouth
   */
  createMouth(parent) {
    // Create a curved smile line
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 0, 0),
      new THREE.Vector3(-0.1, -0.03, 0),
      new THREE.Vector3(0, -0.05, 0),
      new THREE.Vector3(0.1, -0.03, 0),
      new THREE.Vector3(0.15, 0, 0)
    ]);

    const geometry = new THREE.TubeGeometry(curve, 20, 0.02, 8);
    const material = new THREE.MeshStandardMaterial({
      color: 0xdd3333,
      roughness: 0.7,
      metallic: 0.0
    });

    const mouth = new THREE.Mesh(geometry, material);
    mouth.position.set(0, -0.28, 0.03);
    mouth.castShadow = true;
    mouth.receiveShadow = true;

    parent.add(mouth);
    this.components.mouth = mouth;
  }

  /**
   * Create hat and decorations
   */
  createHatAndDecorations() {
    const hatGroup = new THREE.Group();
    hatGroup.position.z = 0;

    // Hat crown (cylinder)
    const hatGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 32, 8);
    const hatMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b6e47,
      roughness: 0.75,
      metallic: 0.0
    });

    const hat = new THREE.Mesh(hatGeometry, hatMaterial);
    hat.position.y = 0.65;
    hat.castShadow = true;
    hat.receiveShadow = true;
    hatGroup.add(hat);

    // Hat band (torus)
    const bandGeometry = new THREE.TorusGeometry(0.5, 0.02, 32, 16);
    const bandMaterial = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      roughness: 0.5,
      metallic: 0.2
    });

    const band = new THREE.Mesh(bandGeometry, bandMaterial);
    band.position.set(0, 0.5, 0);
    band.castShadow = true;
    band.receiveShadow = true;
    hatGroup.add(band);

    // Top decoration - yellow cylinder
    const topCylGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 24, 4);
    const topMaterial = new THREE.MeshStandardMaterial({
      color: 0xffdd00,
      roughness: 0.6,
      metallic: 0.15
    });

    const topCylinder = new THREE.Mesh(topCylGeometry, topMaterial);
    topCylinder.position.y = 0.95;
    topCylinder.castShadow = true;
    topCylinder.receiveShadow = true;
    hatGroup.add(topCylinder);

    // Red spheres on sides
    const redSphereGeometry = new THREE.SphereGeometry(0.05, 16, 8);
    const redMaterial = new THREE.MeshStandardMaterial({
      color: 0xdd3333,
      roughness: 0.55,
      metallic: 0.1
    });

    const redLeft = new THREE.Mesh(redSphereGeometry, redMaterial);
    redLeft.position.set(-0.08, 0.9, 0);
    redLeft.castShadow = true;
    redLeft.receiveShadow = true;
    hatGroup.add(redLeft);

    const redRight = new THREE.Mesh(redSphereGeometry, redMaterial);
    redRight.position.set(0.08, 0.9, 0);
    redRight.castShadow = true;
    redRight.receiveShadow = true;
    hatGroup.add(redRight);

    this.components.hat = hatGroup;
    this.components.body.add(hatGroup);
  }

  /**
   * Create brown jacket (controllable component)
   */
  createJacket() {
    const jacketGroup = new THREE.Group();
    jacketGroup.position.set(0, -0.15, 0.31);
    jacketGroup.name = 'jacket';

    // Front panel
    const panelGeometry = new THREE.BoxGeometry(1.05, 0.85, 0.05, 16, 8, 1);
    const jacketMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b6e47,
      roughness: 0.78,
      metallic: 0.0,
      side: THREE.FrontSide
    });

    const frontPanel = new THREE.Mesh(panelGeometry, jacketMaterial);
    frontPanel.castShadow = true;
    frontPanel.receiveShadow = true;
    jacketGroup.add(frontPanel);

    // Lapels (geometry hint)
    const lapelGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
    const lapelLeft = new THREE.Mesh(lapelGeometry, jacketMaterial);
    lapelLeft.position.set(-0.35, 0.15, 0.08);
    lapelLeft.rotation.z = Math.PI / 4;
    lapelLeft.castShadow = true;
    lapelLeft.receiveShadow = true;
    jacketGroup.add(lapelLeft);

    const lapelRight = new THREE.Mesh(lapelGeometry, jacketMaterial);
    lapelRight.position.set(0.35, 0.15, 0.08);
    lapelRight.rotation.z = -Math.PI / 4;
    lapelRight.castShadow = true;
    lapelRight.receiveShadow = true;
    jacketGroup.add(lapelRight);

    this.components.jacket = jacketGroup;
    this.components.body.add(jacketGroup);
  }

  /**
   * Create sneakers/feet (controllable component)
   */
  createSneakers() {
    const sneakersGroup = new THREE.Group();
    sneakersGroup.position.set(0, -0.95, 0);
    sneakersGroup.name = 'sneakers';

    // Left foot
    const footGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.35, 8, 4, 8);
    const shoesMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.8,
      metallic: 0.0
    });

    const leftFoot = new THREE.Mesh(footGeometry, shoesMaterial);
    leftFoot.position.x = -0.15;
    leftFoot.castShadow = true;
    leftFoot.receiveShadow = true;
    sneakersGroup.add(leftFoot);

    // Right foot
    const rightFoot = new THREE.Mesh(footGeometry, shoesMaterial);
    rightFoot.position.x = 0.15;
    rightFoot.castShadow = true;
    rightFoot.receiveShadow = true;
    sneakersGroup.add(rightFoot);

    this.components.sneakers = sneakersGroup;
    this.components.body.add(sneakersGroup);
  }

  /**
   * Create display pedestal
   */
  createPedestal() {
    const pedestalGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32, 1);
    const pedestalMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.9,
      metallic: 0.05
    });

    const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
    pedestal.position.y = -1.1;
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;

    this.scene.add(pedestal);
    this.components.pedestal = pedestal;
  }

  /**
   * Setup orbit controls
   */
  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 2.0;
    this.controls.maxDistance = 6.0;
    this.controls.minDistance = 1.5;
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  /**
   * Setup scroll-based animation and interaction
   */
  setupInteraction() {
    window.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.scrollTarget += e.deltaY * 0.001;
    }, { passive: false });

    window.addEventListener('resize', () => this.onWindowResize());
  }

  /**
   * Start animation loop
   */
  startAnimation() {
    const animate = () => {
      requestAnimationFrame(animate);

      this.animation.time += 0.016; // ~60fps

      // Smooth scroll animation
      this.scrollY += (this.scrollTarget - this.scrollY) * 0.1;

      // Jacket rotation based on scroll
      this.animation.jacketRotation = Math.sin(this.scrollY * 2) * 0.3;
      this.components.jacket.rotation.y = this.animation.jacketRotation;

      // Sneakers rotation based on scroll
      this.animation.sneakersRotation = Math.cos(this.scrollY * 2) * 0.2;
      this.components.sneakers.rotation.x = this.animation.sneakersRotation;

      // Update controls
      this.controls.update();

      // Render
      this.composer.render();
    };

    animate();
  }

  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  }
}

export { BreadMascotBuilder };
