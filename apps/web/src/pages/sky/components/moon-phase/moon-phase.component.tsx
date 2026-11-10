import {motion, useReducedMotion} from 'framer-motion';
import {useMoonPhaseStyles} from './moon-phase.style';
import {IMoonPhase} from './moon-phase';

const R = 50;

/**
 * Moon disc lit by the engine's illuminated fraction. The terminator is an ellipse whose half-width is
 * R·|1 − 2k|; waxing lights the right side (as seen from the northern hemisphere).
 */
export const litPath = (illumination: number, waxing: boolean) => {
    const k = Math.min(1, Math.max(0, illumination));
    const rx = R * Math.abs(1 - 2 * k);
    const outer = waxing ? 1 : 0;
    const inner = waxing ? (k < 0.5 ? 0 : 1) : (k < 0.5 ? 1 : 0);
    return `M0,${-R} A${R},${R} 0 0 ${outer} 0,${R} A${rx},${R} 0 0 ${inner} 0,${-R}Z`;
};

const MoonPhaseComponent = ({illumination, waxing, size = 160}: IMoonPhase) => {
    const reduce = useReducedMotion();
    const classes = useMoonPhaseStyles();
    return (
        <motion.svg className={classes.svg} width={size} height={size} viewBox='-60 -60 120 120' aria-hidden='true'
                    initial={reduce ? false : {opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}}
                    transition={{duration: 0.9, ease: [0.22, 1, 0.36, 1]}}>
            <defs>
                <radialGradient id='moon-lit' cx='0.4' cy='0.35' r='0.75'>
                    <stop offset='0' stopColor='#FFF6DD'/>
                    <stop offset='1' stopColor='#E2C275'/>
                </radialGradient>
            </defs>
            <circle r={R + 6} className={classes.halo}/>
            <circle r={R} className={classes.dark}/>
            {illumination > 0.002 ? <path d={litPath(illumination, waxing)} fill='url(#moon-lit)'/> : null}
        </motion.svg>
    );
};

export default MoonPhaseComponent;
