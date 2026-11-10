import {lazy, Suspense, useCallback, useMemo, useRef, useState} from 'react';
import {motion, useInView, useMotionValueEvent, useReducedMotion, useScroll} from 'framer-motion';
import classNames from 'classnames';
import useLocalization, {useContent} from 'assets/lang';
import {JOURNEY} from '../../home.data';
import PlanetCardComponent from '../planet-card/planet-card.component';
import {useSolarJourneyStyles} from './solar-journey.style';
import {ISolarJourney} from './solar-journey';

// The 3D scene (three.js + R3F) is code-split and only fetched when this section approaches the viewport.
const SolarSceneComponent = lazy(() => import('../solar-scene/solar-scene.component'));

const hasWebGL = () => {
    try {
        const c = document.createElement('canvas');
        return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
        return false;
    }
};

const SolarJourneyComponent = ({id}: ISolarJourney) => {
    const translate = useLocalization();
    const content = useContent();
    const reduce = useReducedMotion();
    const classes = useSolarJourneyStyles();
    const sectionRef = useRef<HTMLElement>(null);
    const near = useInView(sectionRef, {margin: '600px 0px 600px 0px'});
    const onScreen = useInView(sectionRef, {margin: '0px'});
    const webgl = useMemo(() => hasWebGL(), []);
    const immersive = !reduce;
    const [current, setCurrent] = useState(0);

    const {scrollYProgress} = useScroll({target: sectionRef, offset: ['start start', 'end end']});

    useMotionValueEvent(scrollYProgress, 'change', (v) => {
        setCurrent(Math.round(Math.min(Math.max(v, 0), 1) * (JOURNEY.length - 1)));
    });

    const handleDot = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const i = Number(e.currentTarget.dataset.index);
        const el = sectionRef.current;
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY;
        const travel = el.offsetHeight - window.innerHeight;
        window.scrollTo({top: top + (travel * i) / (JOURNEY.length - 1), behavior: reduce ? 'auto' : 'smooth'});
    }, [reduce]);

    // Reduced motion: no sticky camera travel, no 3D — the same content as a calm, readable list.
    if (!immersive) {
        return (
            <section id={id} className={classes.staticSection} aria-labelledby='journey-title'>
                <div className='container'>
                    <h2 id='journey-title' className={classes.heading}>{translate('journey_title')}</h2>
                    <p className={classes.subheading}>{translate('journey_subtitle')}</p>
                    <ol className={classes.staticList}>
                        {JOURNEY.map((p, i) => (
                            <li key={p.id}>
                                <PlanetCardComponent planet={p} index={i} total={JOURNEY.length} progress={null}/>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
        );
    }

    return (
        <section
            id={id}
            ref={sectionRef}
            className={classes.section}
            style={{height: `${JOURNEY.length * 100}svh`}}
            aria-labelledby='journey-title'
        >
            <div className={classes.sticky}>
                <div className={classes.scene}>
                    {near && webgl ? (
                        <Suspense fallback={<div className={classes.sceneFallback}/>}>
                            <SolarSceneComponent progress={scrollYProgress} active={onScreen}/>
                        </Suspense>
                    ) : <div className={classes.sceneFallback}/>}
                </div>
                <div className={classes.vignette} aria-hidden='true'/>

                <div className={`container ${classes.overlay}`}>
                    <motion.header className={classes.intro}
                                   initial={{opacity: 0, y: 16}}
                                   whileInView={{opacity: 1, y: 0}}
                                   viewport={{once: true}}
                                   transition={{duration: 0.8}}>
                        <h2 id='journey-title' className={classes.heading}>{translate('journey_title')}</h2>
                        <p className={classes.subheading}>{translate('journey_subtitle')}</p>
                    </motion.header>

                    <div className={classes.cards}>
                        {JOURNEY.map((p, i) => (
                            <PlanetCardComponent key={p.id} planet={p} index={i} total={JOURNEY.length}
                                                 progress={scrollYProgress} hidden={i !== current}/>
                        ))}
                    </div>

                    <nav className={classes.dots} aria-label={translate('journey_title')}>
                        {JOURNEY.map((p, i) => {
                            const name = content.points[p.id].name;
                            return (
                                <button
                                    key={p.id}
                                    type='button'
                                    data-index={i}
                                    className={classNames(classes.dot, {[classes.dotActive]: i === current})}
                                    aria-label={name}
                                    aria-current={i === current ? 'step' : undefined}
                                    title={name}
                                    onClick={handleDot}
                                >
                                    <span aria-hidden='true'/>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </section>
    );
};

export default SolarJourneyComponent;
