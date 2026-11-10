import {useCallback, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button} from 'antd';
import {motion, useReducedMotion, useScroll, useTransform} from 'framer-motion';
import {Routes} from 'router/routes';
import {wasPrerendered} from 'core/helpers/prerender';
import StarfieldComponent from 'core/shared/starfield/starfield.component';
import useLocalization from 'assets/lang';
import {useHeroStyles} from './hero.style';
import {IHero} from './hero';

const EASE = [0.22, 1, 0.36, 1] as const;

const HeroComponent = ({journeyId}: IHero) => {
    const translate = useLocalization();
    const reduce = useReducedMotion();
    const ref = useRef<HTMLElement>(null);
    const classes = useHeroStyles();

    // Multi-layer parallax: nebulae and the orbit drift at different speeds, content fades as you leave
    const {scrollYProgress} = useScroll({target: ref, offset: ['start start', 'end start']});
    const nebulaY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '30%']);
    const nebula2Y = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-20%']);
    const orbitRotate = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 40]);
    const contentY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '40%']);
    const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0]);

    const navigate = useNavigate();

    const handleStart = useCallback(() => {
        navigate(Routes.natalChart);
    }, [navigate]);

    const handleJourney = useCallback(() => {
        document.getElementById(journeyId)?.scrollIntoView({behavior: reduce ? 'auto' : 'smooth'});
    }, [journeyId, reduce]);

    // Skip the intro when the hero was already painted from prerendered HTML
    const intro = !reduce && !wasPrerendered;
    const rise = (delay: number) => (!intro ? {} : {
        initial: {opacity: 0, y: 24, filter: 'blur(8px)'},
        animate: {opacity: 1, y: 0, filter: 'blur(0px)'},
        transition: {delay, duration: 1.1, ease: EASE},
    });

    return (
        <section ref={ref} className={classes.hero} aria-labelledby='hero-title'>
            <StarfieldComponent/>
            <motion.div className={classes.nebulaA} style={{y: nebulaY}} aria-hidden='true'/>
            <motion.div className={classes.nebulaB} style={{y: nebula2Y}} aria-hidden='true'/>
            <motion.svg className={classes.orbits} viewBox='-500 -500 1000 1000' style={{rotate: orbitRotate}} aria-hidden='true'>
                {[180, 270, 360, 450].map((r, i) => (
                    <motion.circle key={r} cx={0} cy={0} r={r} className={classes.orbit}
                                   initial={!intro ? false : {pathLength: 0, opacity: 0}}
                                   animate={{pathLength: 1, opacity: 1}}
                                   transition={{delay: 0.3 + i * 0.25, duration: 2.4, ease: EASE}}/>
                ))}
                <motion.circle cx={360} cy={0} r={6} className={classes.orbitPlanet}
                               initial={!intro ? false : {opacity: 0}} animate={{opacity: 1}} transition={{delay: 2.2, duration: 1}}/>
                <motion.circle cx={-127} cy={-127} r={4} className={classes.orbitPlanetViolet}
                               initial={!intro ? false : {opacity: 0}} animate={{opacity: 1}} transition={{delay: 2.6, duration: 1}}/>
            </motion.svg>

            <motion.div className={`container ${classes.content}`} style={{y: contentY, opacity: contentOpacity}}>
                <motion.p className={classes.eyebrow} {...rise(0.2)}>{translate('hero_eyebrow')}</motion.p>
                <motion.h1 id='hero-title' className={classes.title} {...rise(0.4)}>{translate('hero_title')}</motion.h1>
                <motion.p className={classes.subtitle} {...rise(0.6)}>{translate('hero_subtitle')}</motion.p>
                <motion.div className={classes.actions} {...rise(0.8)}>
                    <Button type='primary' size='large' className={classes.cta} onClick={handleStart}>{translate('hero_cta')}</Button>
                    <Button type='text' size='large' onClick={handleJourney} className={classes.secondary}>
                        {translate('hero_secondary')}
                    </Button>
                </motion.div>
            </motion.div>

            <motion.button
                type='button'
                className={classes.scrollHint}
                onClick={handleJourney}
                aria-label={translate('hero_scroll_hint')}
                initial={!intro ? false : {opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 1.8, duration: 1}}
            >
                <span aria-hidden='true'/>
            </motion.button>
        </section>
    );
};

export default HeroComponent;
