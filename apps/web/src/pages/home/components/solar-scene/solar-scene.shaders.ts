// Small GLSL shaders: procedural planet surface + fresnel atmosphere. No textures to download.

const NOISE = /* glsl */ `
float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
`;

export const planetVertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vPos;
varying vec3 vViewDir;
void main() {
    vPos = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
}
`;

export const planetFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uGlow;
uniform float uBands;
uniform float uTime;
uniform vec3 uLightDir;
uniform float uEmissive;
varying vec3 vNormal;
varying vec3 vPos;
varying vec3 vViewDir;
${NOISE}
void main() {
    vec3 p = normalize(vPos);
    float n = fbm(p * 3.0 + vec3(uTime * 0.02, 0.0, 0.0));
    float pattern = uBands > 0.0
        ? 0.5 + 0.5 * sin(p.y * uBands * 3.14159 + n * 3.0)
        : smoothstep(0.35, 0.75, n);
    vec3 base = mix(uColorA, uColorB, pattern);
    float diffuse = max(dot(vNormal, normalize(uLightDir)), 0.0);
    float light = mix(0.12 + 0.88 * diffuse, 1.0, uEmissive);
    float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
    vec3 color = base * light + uGlow * fresnel * (0.6 + 0.6 * uEmissive);
    if (uEmissive > 0.5) { color += vec3(1.0, 0.85, 0.5) * (n - 0.4) * 0.5; }
    gl_FragColor = vec4(color, 1.0);
}
`;

export const glowVertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
}
`;

export const glowFragment = /* glsl */ `
uniform vec3 uGlow;
uniform float uIntensity;
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
    // Rendered on the back side of a slightly larger shell: brightest next to the planet,
    // fading to zero at the shell's silhouette, so there is no hard outer edge.
    float f = pow(clamp(-dot(vNormal, vViewDir), 0.0, 1.0), 3.0);
    gl_FragColor = vec4(uGlow, f * uIntensity);
}
`;

export const ringFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uInner;
uniform float uOuter;
varying vec2 vUv;
varying vec3 vPos;
void main() {
    float r = (length(vPos.xy) - uInner) / (uOuter - uInner);
    float bands = 0.55 + 0.45 * sin(r * 60.0) * sin(r * 13.0);
    float alpha = smoothstep(0.0, 0.08, r) * smoothstep(1.0, 0.85, r) * bands * 0.7;
    gl_FragColor = vec4(uColor, alpha);
}
`;

export const ringVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vPos;
void main() {
    vUv = uv;
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
