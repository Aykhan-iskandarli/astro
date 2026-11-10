import {useEffect, useRef} from 'react';
import {useReducedMotion} from 'framer-motion';
import {useCosmicBackgroundStyles} from './cosmic-background.style';
import {ICosmicBackground} from './cosmic-background';

// Living nebula: a single fragment shader (domain-warped fbm + twinkling star grid) on a raw WebGL canvas.
// No three.js, no textures. Rendered at reduced resolution (soft by nature), paused off-screen / in hidden
// tabs, and drawn once (static) under prefers-reduced-motion.

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uIntensity;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){ float v = 0.0; float a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.02; a *= 0.5; } return v; }

float stars(vec2 uv, float scale, float t){
    vec2 g = uv * scale; vec2 id = floor(g); vec2 f = fract(g) - 0.5;
    float h = hash(id);
    if (h < 0.93) return 0.0;
    vec2 off = vec2(hash(id + 3.1), hash(id + 7.7)) - 0.5;
    float d = length(f - off * 0.7);
    float tw = 0.6 + 0.4 * sin(t * (1.0 + h * 3.0) + h * 40.0);
    return smoothstep(0.06, 0.0, d) * tw * (h - 0.93) * 14.0;
}

void main(){
    vec2 uv = gl_FragCoord.xy / uRes.xy;
    vec2 p = (gl_FragCoord.xy - 0.5 * uRes.xy) / uRes.y;
    p += uMouse * 0.04;
    float t = uTime * 0.025;

    vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t + 5.2));
    vec2 r = vec2(fbm(p * 1.6 + 3.0 * q + vec2(1.7, 9.2) + t * 1.3), fbm(p * 1.6 + 3.0 * q + vec2(8.3, 2.8) - t));
    float n = fbm(p * 1.2 + 2.5 * r);

    vec3 deep = vec3(0.043, 0.043, 0.118);
    vec3 violet = vec3(0.36, 0.29, 0.77);
    vec3 pink = vec3(0.78, 0.49, 1.0);
    vec3 gold = vec3(0.89, 0.76, 0.46);
    vec3 teal = vec3(0.30, 0.62, 0.78);

    vec3 col = deep;
    col = mix(col, violet, smoothstep(0.35, 0.85, n) * 0.55);
    col = mix(col, pink, smoothstep(0.55, 0.95, r.x) * 0.22);
    col = mix(col, teal, smoothstep(0.6, 1.0, q.y) * 0.16);
    col += gold * pow(smoothstep(0.62, 1.0, n * r.y), 2.0) * 0.35;

    // Vignette keeps the edges deep and the text readable
    float vig = smoothstep(1.25, 0.25, length((uv - 0.5) * vec2(1.4, 1.0)));
    col = mix(deep, col, vig * uIntensity);

    float s = stars(p + t * 0.15, 38.0, uTime) + stars(p * 1.7 - t * 0.08, 70.0, uTime * 1.3) * 0.6;
    col += vec3(1.0, 0.97, 0.92) * s;

    gl_FragColor = vec4(col, 1.0);
}`;

const compile = (gl: WebGLRenderingContext, type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
};

const CosmicBackgroundComponent = ({intensity = 1, scale = 0.5}: ICosmicBackground) => {
    const ref = useRef<HTMLCanvasElement>(null);
    const reduce = useReducedMotion();
    const {canvas} = useCosmicBackgroundStyles();

    useEffect(() => {
        const el = ref.current;
        const gl = el?.getContext('webgl', {antialias: false, depth: false, alpha: false, powerPreference: 'low-power'});
        if (!el || !gl) return;
        const vs = compile(gl, gl.VERTEX_SHADER, VERT);
        const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
        if (!vs || !fs) return;
        const prog = gl.createProgram()!;
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        gl.useProgram(prog);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, 'p');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        const uRes = gl.getUniformLocation(prog, 'uRes');
        const uTime = gl.getUniformLocation(prog, 'uTime');
        const uMouse = gl.getUniformLocation(prog, 'uMouse');
        gl.uniform1f(gl.getUniformLocation(prog, 'uIntensity'), intensity);

        const mouse = {x: 0, y: 0, tx: 0, ty: 0};
        const resize = () => {
            const w = Math.max(1, Math.floor(el.clientWidth * scale));
            const h = Math.max(1, Math.floor(el.clientHeight * scale));
            el.width = w;
            el.height = h;
            gl.viewport(0, 0, w, h);
            gl.uniform2f(uRes, w, h);
        };
        const draw = (t: number) => {
            mouse.x += (mouse.tx - mouse.x) * 0.04;
            mouse.y += (mouse.ty - mouse.y) * 0.04;
            gl.uniform1f(uTime, t / 1000);
            gl.uniform2f(uMouse, mouse.x, mouse.y);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        };

        let raf = 0;
        let visible = true;
        const start = performance.now() - Math.random() * 60000; // each visit starts at a different moment
        const loop = (now: number) => {
            if (visible && !document.hidden) draw(now - start);
            raf = requestAnimationFrame(loop);
        };
        const onMove = (e: PointerEvent) => {
            mouse.tx = e.clientX / window.innerWidth - 0.5;
            mouse.ty = 0.5 - e.clientY / window.innerHeight;
        };

        resize();
        const ro = new ResizeObserver(() => {
            resize();
            if (reduce) draw(20000);
        });
        ro.observe(el);
        const io = new IntersectionObserver(([e]) => {
            visible = e.isIntersecting;
        });
        io.observe(el);
        if (reduce) {
            draw(20000);
        } else {
            window.addEventListener('pointermove', onMove, {passive: true});
            raf = requestAnimationFrame(loop);
        }
        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            io.disconnect();
            window.removeEventListener('pointermove', onMove);
            gl.getExtension('WEBGL_lose_context')?.loseContext();
        };
    }, [reduce, intensity, scale]);

    return <canvas ref={ref} className={canvas} aria-hidden='true'/>;
};

export default CosmicBackgroundComponent;
