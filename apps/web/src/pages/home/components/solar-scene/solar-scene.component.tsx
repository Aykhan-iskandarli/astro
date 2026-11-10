import {useMemo, useRef} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';
import {Stars} from '@react-three/drei';
import {AdditiveBlending, BackSide, Color, DoubleSide, Group, Mesh, ShaderMaterial, Vector3} from 'three';
import {IJourneyPlanet, JOURNEY, PLANET_SPACING} from '../../home.data';
import {glowFragment, glowVertex, planetFragment, planetVertex, ringFragment, ringVertex} from './solar-scene.shaders';
import {ISolarScene} from './solar-scene';

const LIGHT_DIR = new Vector3(-1, 0.3, 0.6).normalize();

const PlanetMesh = ({planet, index}: {planet: IJourneyPlanet; index: number}) => {
    const group = useRef<Group>(null);
    const body = useRef<Mesh>(null);
    const isSun = planet.id === 'sun';

    const material = useMemo(() => new ShaderMaterial({
        vertexShader: planetVertex,
        fragmentShader: planetFragment,
        uniforms: {
            uColorA: {value: new Color(planet.colorA)},
            uColorB: {value: new Color(planet.colorB)},
            uGlow: {value: new Color(planet.glow)},
            uBands: {value: planet.bands},
            uTime: {value: 0},
            uLightDir: {value: LIGHT_DIR},
            uEmissive: {value: isSun ? 1 : 0},
        },
    }), [planet, isSun]);

    const glow = useMemo(() => new ShaderMaterial({
        vertexShader: glowVertex,
        fragmentShader: glowFragment,
        uniforms: {uGlow: {value: new Color(planet.glow)}, uIntensity: {value: isSun ? 1.6 : 0.9}},
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        side: BackSide,
    }), [planet, isSun]);

    const ring = useMemo(() => (planet.ring ? new ShaderMaterial({
        vertexShader: ringVertex,
        fragmentShader: ringFragment,
        uniforms: {
            uColor: {value: new Color(planet.ring.color)},
            uInner: {value: planet.ring.inner},
            uOuter: {value: planet.ring.outer},
        },
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
    }) : null), [planet]);

    useFrame((_, dt) => {
        material.uniforms.uTime.value += dt;
        if (body.current) body.current.rotation.y += dt * (isSun ? 0.03 : 0.08);
    });

    return (
        <group ref={group} position={[index * PLANET_SPACING, 0, 0]} rotation={[0, 0, planet.tilt * 0.3]}>
            {/* Low-poly icosphere: detail 5 keeps the silhouette smooth at ~10k triangles */}
            <mesh ref={body} material={material}>
                <icosahedronGeometry args={[planet.radius, 5]}/>
            </mesh>
            <mesh material={glow} scale={isSun ? 1.7 : 1.25}>
                <icosahedronGeometry args={[planet.radius, 5]}/>
            </mesh>
            {ring && planet.ring ? (
                <mesh material={ring} rotation={[Math.PI / 2 - planet.ring.tilt * 0.35, 0, 0]}>
                    <ringGeometry args={[planet.ring.inner, planet.ring.outer, 96]}/>
                </mesh>
            ) : null}
        </group>
    );
};

const desired = new Vector3();
const look = new Vector3();

const CameraRig = ({progress}: ISolarScene) => {
    const target = useRef(new Vector3());
    useFrame(({camera}, dt) => {
        const p = Math.min(Math.max(progress.get(), 0), 1) * (JOURNEY.length - 1);
        const i = Math.floor(p);
        const f = p - i;
        // ease between stops: linger on each planet, glide between them
        const eased = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
        const x = (i + eased) * PLANET_SPACING;
        const r = JOURNEY[Math.min(i + (eased > 0.5 ? 1 : 0), JOURNEY.length - 1)].radius;
        // Planet sits right of centre (cards live on the left); distance scales with planet size
        desired.set(x - 2.2 - r * 1.1, 0.5 + r * 0.3, 7 + r * 3.4);
        look.set(x - 1.6 - r * 1.1, 0, 0);
        // Critically damped follow for a calm camera
        camera.position.lerp(desired, 1 - Math.exp(-dt * 3.5));
        target.current.lerp(look, 1 - Math.exp(-dt * 3.5));
        camera.lookAt(target.current);
    });
    return null;
};

const SolarSceneComponent = ({progress, active = true}: ISolarScene) => {
    return (
        <Canvas
            dpr={[1, 1.75]}
            frameloop={active ? 'always' : 'never'}
            camera={{position: [-2, 0.8, 9], fov: 45, near: 0.1, far: 400}}
            gl={{antialias: true, powerPreference: 'high-performance', alpha: true}}
            aria-hidden='true'
        >
            <Stars radius={120} depth={60} count={2500} factor={3} saturation={0.2} fade speed={0.4}/>
            {JOURNEY.map((planet, i) => <PlanetMesh key={planet.id} planet={planet} index={i}/>)}
            <CameraRig progress={progress}/>
        </Canvas>
    );
};

export default SolarSceneComponent;
