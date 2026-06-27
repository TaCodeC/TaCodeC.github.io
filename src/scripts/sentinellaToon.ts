import * as THREE from 'three';

const whiteTexture = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
whiteTexture.colorSpace = THREE.SRGBColorSpace;
whiteTexture.needsUpdate = true;

const getMaterialColor = (material: THREE.Material | THREE.Material[], fallback: THREE.ColorRepresentation) => {
  const source = Array.isArray(material) ? material[0] : material;
  if (source && 'color' in source && source.color instanceof THREE.Color) {
    return source.color.clone();
  }
  return new THREE.Color(fallback);
};

const getMaterialMap = (material: THREE.Material | THREE.Material[]) => {
  const source = Array.isArray(material) ? material[0] : material;
  if (source && 'map' in source && source.map instanceof THREE.Texture) {
    source.map.colorSpace = THREE.SRGBColorSpace;
    source.map.needsUpdate = true;
    return source.map;
  }
  return whiteTexture;
};

const createToonMaterial = (sourceMaterial: THREE.Material | THREE.Material[]) => {
  const tint = getMaterialColor(sourceMaterial, 0xffffff);
  const baseMap = getMaterialMap(sourceMaterial);
  const source = Array.isArray(sourceMaterial) ? sourceMaterial[0] : sourceMaterial;

  return new THREE.ShaderMaterial({
    name: `Three_${source?.name || 'SentinellaToon'}`,
    uniforms: {
      baseMap: { value: baseMap },
      tint: { value: tint },
      lightDirection: { value: new THREE.Vector3(0.42, 0.74, 0.52).normalize() },
      lightColor: { value: new THREE.Color(0xf7f0dc) },
      shadowColor: { value: new THREE.Color(0x313345) },
      shadowThreshold: { value: 0.53 },
      shadowSmoothness: { value: 0.055 },
      ambientStrength: { value: 0.58 },
      rimColor: { value: new THREE.Color(0xfff25e) },
      rimIntensity: { value: 0.46 },
      rimMin: { value: 0.58 },
      rimMax: { value: 0.96 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;

      void main() {
        vUv = uv;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D baseMap;
      uniform vec3 tint;
      uniform vec3 lightDirection;
      uniform vec3 lightColor;
      uniform vec3 shadowColor;
      uniform float shadowThreshold;
      uniform float shadowSmoothness;
      uniform float ambientStrength;
      uniform vec3 rimColor;
      uniform float rimIntensity;
      uniform float rimMin;
      uniform float rimMax;

      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;

      void main() {
        vec4 texel = texture2D(baseMap, vUv);
        if (texel.a < 0.02) discard;

        vec3 normal = normalize(vWorldNormal);
        vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
        float ndotl = dot(normal, normalize(lightDirection)) * 0.5 + 0.5;
        float cel = smoothstep(
          shadowThreshold - max(shadowSmoothness, 0.0001),
          shadowThreshold + max(shadowSmoothness, 0.0001),
          ndotl
        );

        vec3 baseColor = texel.rgb * tint;
        vec3 litColor = baseColor * lightColor;
        vec3 shadedColor = baseColor * shadowColor;
        float fresnel = 1.0 - clamp(dot(normal, viewDirection), 0.0, 1.0);
        float rim = smoothstep(rimMin, max(rimMax, rimMin + 0.001), fresnel) * rimIntensity;
        vec3 finalColor = mix(shadedColor, litColor, cel) + baseColor * ambientStrength + rimColor * rim;

        gl_FragColor = vec4(finalColor, texel.a);
      }
    `,
  });
};

const createOutlineMaterial = () =>
  new THREE.MeshBasicMaterial({
    color: 0x060607,
    side: THREE.BackSide,
    depthWrite: true,
  });

const addOutline = (mesh: THREE.Mesh, thickness: number) => {
  const outline = new THREE.Mesh(mesh.geometry, createOutlineMaterial());
  outline.name = `${mesh.name || 'mesh'}_ToonOutline`;
  outline.scale.setScalar(1 + thickness);
  outline.renderOrder = -1;
  mesh.add(outline);
};

export const applySentinellaToonLook = (root: THREE.Object3D) => {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    if (object.name.endsWith('_ToonOutline')) return;

    object.castShadow = true;
    object.receiveShadow = true;
    object.material = createToonMaterial(object.material);
    addOutline(object, 0.024);
  });
};

export const fitObjectToHero = (object: THREE.Object3D, targetSize = 4.15) => {
  const bounds = new THREE.Box3().setFromObject(object);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z);
  const scale = maxDimension > 0 ? targetSize / maxDimension : 1;

  object.scale.multiplyScalar(scale);
  object.position.copy(center).multiplyScalar(-scale);
  object.position.y -= 0.05;
};
