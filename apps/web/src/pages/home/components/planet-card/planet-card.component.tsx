import {motion, useMotionValue, useTransform} from 'framer-motion';
import {glyph, POINT_GLYPHS} from 'core/helpers/astro';
import useLocalization, {useContent} from 'assets/lang';
import {usePlanetCardStyles} from './planet-card.style';
import {IPlanetCard} from './planet-card';

const pad = (n: number) => String(n).padStart(2, '0');

const PlanetCardComponent = ({planet, index, total, progress, hidden}: IPlanetCard) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = usePlanetCardStyles();
    const info = content.points[planet.id];

    // Each card owns a window of the scroll: fade/slide in, hold, fade/slide out.
    // Offsets must stay inside [0, 1] and increase strictly (framer-motion hands them to WAAPI):
    // the first card starts fully visible, the last one stays visible to the end.
    const step = 1 / (total - 1);
    const c = index * step;
    const first = index === 0;
    const last = index === total - 1;
    const range = first ? [0, step * 0.2, step * 0.55]
        : last ? [1 - step * 0.55, 1 - step * 0.2, 1]
            : [c - step * 0.55, c - step * 0.2, c + step * 0.2, c + step * 0.55];
    const pick = <T, >(inV: T, on: T, outV: T): T[] => (first ? [on, on, outV] : last ? [inV, on, on] : [inV, on, on, outV]);
    const still = useMotionValue(0);
    const source = progress ?? still;
    const opacity = useTransform(source, range, pick(0, 1, 0));
    const y = useTransform(source, range, pick(40, 0, -40));
    const blur = useTransform(source, range, pick('blur(8px)', 'blur(0px)', 'blur(8px)'));

    const body = (
        <>
            <div className={classes.top}>
                <span className={classes.orb} style={{background: `radial-gradient(circle at 35% 35%, ${planet.colorB}, ${planet.colorA} 55%, #0b0b1e 110%)`, boxShadow: `0 0 28px ${planet.glow}55`}} aria-hidden='true'/>
                <span className={classes.counter}>{translate('journey_planet_label')} {pad(index + 1)} / {pad(total)}</span>
            </div>
            <h3 className={classes.name}>
                <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[planet.id])}</span>
                {info.name}
            </h3>
            <p className={classes.archetype}>{info.archetype}</p>
            <ul className={classes.keywords}>
                {info.keywords.split(',').map((k) => <li key={k}>{k.trim()}</li>)}
            </ul>
        </>
    );

    if (!progress) {
        return <article className={`${classes.card} ${classes.static}`}>{body}</article>;
    }

    return (
        <motion.article
            className={classes.card}
            style={{opacity, y, filter: blur}}
            aria-hidden={hidden}
        >
            {body}
        </motion.article>
    );
};

export default PlanetCardComponent;
