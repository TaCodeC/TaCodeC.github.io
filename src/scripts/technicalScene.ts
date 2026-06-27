import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { applySentinellaToonLook, fitObjectToHero } from './sentinellaToon';

type RigJoint = THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;

const initScene = (canvas: HTMLCanvasElement) => {
  if (canvas.dataset.ready === 'true') return;
  canvas.dataset.ready = 'true';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x101113, 0.045);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x101113, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.6, 6.2);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.autoRotate = !prefersReducedMotion;
  controls.autoRotateSpeed = 0.35;
  controls.target.set(0, 0.25, 0);

  const root = new THREE.Group();
  root.name = 'ProceduralTechnicalFallback';
  root.rotation.set(-0.08, 0.45, 0.06);
  scene.add(root);

  const importedRoot = new THREE.Group();
  importedRoot.name = 'SentinellaToonShadImport';
  importedRoot.visible = false;
  scene.add(importedRoot);

  const key = new THREE.DirectionalLight(0xf2efe6, 3.4);
  key.position.set(3.4, 5, 4);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x52d6d8, 2.4);
  rim.position.set(-4, 2.5, -3);
  scene.add(rim);

  const fill = new THREE.HemisphereLight(0xff8a4c, 0x101113, 1.2);
  scene.add(fill);

  const shellMaterial = new THREE.MeshStandardMaterial({
    color: 0xd9d2be,
    roughness: 0.54,
    metalness: 0.18,
    flatShading: true,
  });
  const wireMaterial = new THREE.LineBasicMaterial({
    color: 0xc9ff44,
    transparent: true,
    opacity: 0.48,
  });
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x52d6d8,
    roughness: 0.28,
    metalness: 0.64,
    emissive: 0x123d3f,
    emissiveIntensity: 0.35,
  });
  const copperMaterial = new THREE.MeshStandardMaterial({
    color: 0xff8a4c,
    roughness: 0.34,
    metalness: 0.42,
    emissive: 0x3d1406,
    emissiveIntensity: 0.28,
  });

  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 3), shellMaterial);
  core.scale.set(1.05, 1.32, 0.78);
  root.add(core);

  const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(core.geometry), wireMaterial);
  wireframe.scale.copy(core.scale).multiplyScalar(1.012);
  root.add(wireframe);

  const halo = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.48, 0.025, 220, 12, 2, 5),
    new THREE.MeshStandardMaterial({
      color: 0xc9ff44,
      emissive: 0x536700,
      emissiveIntensity: 0.42,
      roughness: 0.2,
      metalness: 0.75,
    }),
  );
  halo.rotation.set(1.28, 0.22, -0.62);
  root.add(halo);

  const controlRing = new THREE.Mesh(new THREE.TorusGeometry(1.78, 0.01, 8, 128), accentMaterial);
  controlRing.rotation.set(Math.PI / 2, 0.12, 0);
  root.add(controlRing);

  const grid = new THREE.GridHelper(7.2, 24, 0x52d6d8, 0x2e3537);
  grid.position.y = -1.72;
  grid.material.opacity = 0.18;
  grid.material.transparent = true;
  scene.add(grid);

  const joints: RigJoint[] = [];
  const jointGeometry = new THREE.SphereGeometry(0.075, 18, 18);
  const rigPoints = [
    new THREE.Vector3(-1.55, -1.02, 0.1),
    new THREE.Vector3(-0.72, -0.24, 0.35),
    new THREE.Vector3(-1.32, 0.72, 0.15),
    new THREE.Vector3(0, 1.42, -0.18),
    new THREE.Vector3(1.32, 0.7, 0.18),
    new THREE.Vector3(0.72, -0.24, 0.34),
    new THREE.Vector3(1.55, -1.0, 0.08),
  ];

  const rodGeometry = new THREE.CylinderGeometry(0.018, 0.018, 1, 10);

  const makeRod = (start: THREE.Vector3, end: THREE.Vector3) => {
    const direction = new THREE.Vector3().subVectors(end, start);
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const rod = new THREE.Mesh(rodGeometry, copperMaterial);
    rod.position.copy(midpoint);
    rod.scale.y = direction.length();
    rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    root.add(rod);
    return rod;
  };

  rigPoints.forEach((point, index) => {
    const material = index % 2 === 0 ? accentMaterial : copperMaterial;
    const joint = new THREE.Mesh(jointGeometry, material) as RigJoint;
    joint.position.copy(point);
    root.add(joint);
    joints.push(joint);
    if (index > 0) makeRod(rigPoints[index - 1], point);
  });

  const curveMaterial = new THREE.LineBasicMaterial({
    color: 0xf2efe6,
    transparent: true,
    opacity: 0.34,
  });
  const curves = Array.from({ length: 5 }, (_, index) => {
    const offset = (index - 2) * 0.28;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.95, -0.86 + offset, -0.64),
      new THREE.Vector3(-0.82, 0.82 - offset * 0.4, 0.42),
      new THREE.Vector3(0.86, -0.12 + offset * 0.2, -0.18),
      new THREE.Vector3(1.95, 0.92 - offset, 0.58),
    ]);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(80)), curveMaterial);
    root.add(line);
    return line;
  });

  const particleCount = 260;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const palette = [new THREE.Color(0xc9ff44), new THREE.Color(0x52d6d8), new THREE.Color(0xff8a4c)];
  for (let i = 0; i < particleCount; i += 1) {
    const radius = 2.4 + Math.random() * 2.4;
    const theta = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 3.2;
    positions[i * 3] = Math.cos(theta) * radius;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(theta) * radius - 0.3;

    const color = palette[i % palette.length];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    }),
  );
  scene.add(particles);

  const mixers: THREE.AnimationMixer[] = [];
  const gltfLoader = new GLTFLoader();
  const useImportedCamera = (gltfScene: THREE.Object3D) => {
    let sourceCamera: THREE.PerspectiveCamera | null = null;
    gltfScene.traverse((object) => {
      if (!sourceCamera && object instanceof THREE.PerspectiveCamera) {
        sourceCamera = object;
      }
    });

    if (!sourceCamera) return;

    importedRoot.updateMatrixWorld(true);
    const sourcePosition = new THREE.Vector3();
    const sourceQuaternion = new THREE.Quaternion();
    sourceCamera.getWorldPosition(sourcePosition);
    sourceCamera.getWorldQuaternion(sourceQuaternion);

    camera.fov = sourceCamera.fov;
    camera.near = sourceCamera.near;
    camera.far = Math.max(sourceCamera.far, 100);
    camera.position.copy(sourcePosition);
    camera.quaternion.copy(sourceQuaternion);
    camera.updateProjectionMatrix();

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(sourceQuaternion);
    controls.target.copy(sourcePosition).add(forward.multiplyScalar(2));
    controls.autoRotate = false;
    controls.update();
  };

  gltfLoader.load(
    '/models/sentinella-toonshad.glb',
    (gltf) => {
      applySentinellaToonLook(gltf.scene);
      fitObjectToHero(gltf.scene);
      importedRoot.add(gltf.scene);
      importedRoot.visible = true;
      root.visible = false;
      useImportedCamera(gltf.scene);

      gltf.animations.forEach((clip) => {
        const mixer = new THREE.AnimationMixer(gltf.scene);
        mixer.clipAction(clip).play();
        mixers.push(mixer);
      });
    },
    undefined,
    () => {
      root.visible = true;
      importedRoot.visible = false;
    },
  );

  const pointer = new THREE.Vector2(0, 0);
  const onPointerMove = (event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    pointer.y = -((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  };
  canvas.addEventListener('pointermove', onPointerMove);

  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.floor(width));
    const nextHeight = Math.max(1, Math.floor(height));
    renderer.setSize(nextWidth, nextHeight, false);
    camera.aspect = nextWidth / nextHeight;
    camera.position.z = nextWidth < 720 ? 7.4 : 6.2;
    camera.position.x = nextWidth < 720 ? 0.1 : 0.45;
    camera.updateProjectionMatrix();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  let elapsed = 0;
  let previousTime = performance.now();
  let frameId = 0;
  const render = () => {
    const now = performance.now();
    const delta = (now - previousTime) / 1000;
    previousTime = now;
    elapsed += delta;
    const motion = prefersReducedMotion ? 0.22 : 1;
    if (!importedRoot.visible) {
      root.rotation.y += 0.0028 * motion;
    }
    root.rotation.x = -0.08 + pointer.y * 0.065;
    root.rotation.z = 0.06 - pointer.x * 0.045;
    core.rotation.y = Math.sin(elapsed * 0.28) * 0.08;
    wireframe.rotation.y = core.rotation.y;
    halo.rotation.z += 0.0045 * motion;
    halo.rotation.x = 1.28 + Math.sin(elapsed * 0.5) * 0.08;
    controlRing.rotation.z -= 0.0035 * motion;
    grid.position.z = (elapsed * 0.18) % 0.3;
    particles.rotation.y -= 0.0009 * motion;

    joints.forEach((joint, index) => {
      joint.scale.setScalar(1 + Math.sin(elapsed * 1.8 + index) * 0.12);
    });

    curves.forEach((curve, index) => {
      curve.rotation.y = Math.sin(elapsed * 0.24 + index) * 0.08;
    });
    mixers.forEach((mixer) => mixer.update(delta * motion));

    controls.update();
    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(render);
  };
  render();

  const cleanup = () => {
    window.cancelAnimationFrame(frameId);
    resizeObserver.disconnect();
    canvas.removeEventListener('pointermove', onPointerMove);
    controls.dispose();
    renderer.dispose();
    scene.traverse((object) => {
      if ('geometry' in object && object.geometry instanceof THREE.BufferGeometry) {
        object.geometry.dispose();
      }
    });
  };

  window.addEventListener('pagehide', cleanup, { once: true });
};

const boot = () => {
  document.querySelectorAll<HTMLCanvasElement>('[data-technical-scene]').forEach(initScene);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

document.addEventListener('astro:page-load', boot);
