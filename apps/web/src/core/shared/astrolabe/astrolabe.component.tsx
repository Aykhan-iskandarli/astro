import {motion, useReducedMotion} from 'framer-motion';
import {glyph, SIGN_GLYPHS, SIGNS} from 'core/helpers/astro';
import {useAstrolabeStyles} from './astrolabe.style';
import {IAstrolabe} from './astrolabe';

const EASE = [0.22, 1, 0.36, 1] as const;

const polar = (r: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    return {x: r * Math.cos(a), y: r * Math.sin(a)};
};

// Decorative golden astrolabe: rings draw themselves in, then the zodiac ring and the inner rete turn slowly
// in opposite directions. Purely ornamental (aria-hidden); static under reduced motion.
const AstrolabeComponent = ({className, opacity = 1}: IAstrolabe) => {
    const reduce = useReducedMotion();
    const classes = useAstrolabeStyles();
    const spin = (seconds: number, dir: 1 | -1) => (reduce ? {} : {
        animate: {rotate: 360 * dir},
        transition: {duration: seconds, ease: 'linear' as const, repeat: Infinity},
    });
    const draw = (delay: number) => (reduce ? {initial: false as const} : {
        initial: {pathLength: 0, opacity: 0},
        animate: {pathLength: 1, opacity: 1},
        transition: {delay, duration: 2.2, ease: EASE},
    });

    return (
        <svg className={`${classes.svg} ${className ?? ''}`} viewBox='-520 -520 1040 1040' aria-hidden='true' style={{opacity}}>
            <defs>
                <radialGradient id='astro-core' r='0.5'>
                    <stop offset='0' stopColor='#E2C275' stopOpacity='0.35'/>
                    <stop offset='1' stopColor='#E2C275' stopOpacity='0'/>
                </radialGradient>
            </defs>
            <circle r='170' fill='url(#astro-core)'/>

            {/* Outer zodiac ring: glyphs + degree ticks, slow clockwise turn */}
            <motion.g {...spin(420, 1)}>
                <motion.circle r='470' className={classes.ring} {...draw(0.1)}/>
                <motion.circle r='410' className={classes.ring} {...draw(0.3)}/>
                {Array.from({length: 72}, (_, i) => {
                    const a = i * 5;
                    const p1 = polar(410, a);
                    const p2 = polar(i % 6 === 0 ? 440 : 422, a);
                    return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className={classes.tick}/>;
                })}
                {SIGNS.map((s, i) => {
                    const p = polar(445, i * 30 + 15);
                    return (
                        <motion.text key={s} x={p.x} y={p.y} className={`glyph ${classes.glyph}`} textAnchor='middle'
                                     dominantBaseline='central'
                                     initial={reduce ? false : {opacity: 0}} animate={{opacity: 1}}
                                     transition={{delay: 1.2 + i * 0.08, duration: 0.8}}>
                            {glyph(SIGN_GLYPHS[s])}
                        </motion.text>
                    );
                })}
            </motion.g>

            {/* Inner rete: counter-rotating rings, a star polygon and orbiting dots */}
            <motion.g {...spin(260, -1)}>
                <motion.circle r='330' className={classes.ringSoft} {...draw(0.6)}/>
                <motion.circle r='250' className={classes.ringDashed} {...draw(0.8)}/>
                <motion.path
                    d={Array.from({length: 12}, (_, i) => {
                        const p = polar(i % 2 === 0 ? 330 : 150, i * 30);
                        return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                    }).join(' ') + 'Z'}
                    className={classes.star} {...draw(1.0)}/>
                <circle cx='330' cy='0' r='6' className={classes.dotGold}/>
                <circle cx='-250' cy='0' r='4' className={classes.dotViolet}/>
            </motion.g>

            <motion.g {...spin(140, 1)}>
                <motion.circle r='150' className={classes.ring} {...draw(1.2)}/>
                {Array.from({length: 24}, (_, i) => {
                    const p1 = polar(150, i * 15);
                    const p2 = polar(138, i * 15);
                    return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className={classes.tick}/>;
                })}
                <circle cx='0' cy='-150' r='5' className={classes.dotGold}/>
            </motion.g>
        </svg>
    );
};

export default AstrolabeComponent;
