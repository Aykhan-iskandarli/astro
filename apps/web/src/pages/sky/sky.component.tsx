import {useCallback, useMemo} from 'react';
import {Link} from 'react-router-dom';
import {Alert, Button} from 'antd';
import {motion, useReducedMotion} from 'framer-motion';
import {Routes} from 'router/routes';
import {formatDegree, formatLocal, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import SeoComponent from 'core/shared/seo/seo.component';
import LoaderComponent from 'core/shared/loader/loader.component';
import CosmicBackgroundComponent from 'core/shared/cosmic-background/cosmic-background.component';
import useLocalization, {useContent} from 'assets/lang';
import {useGetSky} from './actions/sky.query';
import DayPanelComponent from './components/day-panel/day-panel.component';
import MoonPhaseComponent from './components/moon-phase/moon-phase.component';
import PersonalTransitsComponent from './components/personal-transits/personal-transits.component';
import {eventLabel} from './components/event-label/event-label';
import {useSkyStyles} from './sky.style';

const EASE = [0.22, 1, 0.36, 1] as const;

// "Today": the sky right now for everyone, plus today's transits to the user's own chart.
function SkyComponent() {
    const translate = useLocalization();
    const content = useContent();
    const reduce = useReducedMotion();
    const classes = useSkyStyles();
    const {data: sky, isLoading, isError} = useGetSky();

    const point = useCallback((id: string | null) => (id ? content.points[id as keyof typeof content.points]?.name ?? id : ''), [content]);
    const sign = useCallback((id: string | null) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : ''), [content]);

    const upcoming = useMemo(() => (sky ? [...sky.lunations, ...sky.stations]
        .sort((a, b) => (a.at ?? '').localeCompare(b.at ?? '')).slice(0, 8) : []), [sky]);

    const rise = (delay: number) => (reduce ? {} : {
        initial: {opacity: 0, y: 16}, animate: {opacity: 1, y: 0}, transition: {delay, duration: 0.7, ease: EASE},
    });

    const moon = sky?.moon;
    const voc = moon?.voidOfCourse;

    return (
        <div className={classes.stage}>
            <div className={classes.backdrop} aria-hidden='true'><CosmicBackgroundComponent intensity={0.7}/></div>
            <div className={`container ${classes.page}`}>
                <SeoComponent titleKey='seo_today_title' descriptionKey='seo_today_description' path={Routes.today}/>
                <header className={classes.head}>
                    <p className={classes.eyebrow}>{translate('today_eyebrow')}</p>
                    <h1>{translate('today_title')}</h1>
                    {sky?.at ? <p className={classes.muted}>{formatLocal(sky.at)}</p> : null}
                </header>

                {isError ? <Alert type='error' showIcon title={translate('today_error')}/> : null}
                {isLoading ? <LoaderComponent/> : null}

                {sky && moon && voc ? (
                    <>
                        <section className={classes.hero} aria-labelledby='sec-moon'>
                            <motion.div className={classes.moonArt} {...rise(0)}>
                                <MoonPhaseComponent illumination={moon.illumination} waxing={moon.waxing} size={200}/>
                            </motion.div>
                            <motion.div className={classes.moonInfo} {...rise(0.1)}>
                                <h2 id='sec-moon'>
                                    {moon.phase ? content.lunarPhases[moon.phase as keyof typeof content.lunarPhases] : ''}
                                </h2>
                                <p className={classes.big}>
                                    <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[moon.sign!])}</span>
                                    {' '}{translate('today_moon_in', {sign: sign(moon.sign)})}
                                </p>
                                <p className={classes.muted}>
                                    {translate('today_illumination', {value: Math.round(moon.illumination * 100)})}
                                    {' · '}{translate(moon.waxing ? 'today_waxing' : 'today_waning')}
                                </p>
                                <div className={`${classes.voc} ${voc.active ? classes.vocActive : ''}`}>
                                    <strong>{translate(voc.active ? 'voc_active_title' : 'voc_next_title')}</strong>
                                    <p>
                                        {voc.active
                                            ? translate('voc_active', {end: formatLocal(voc.end), sign: sign(voc.nextSign)})
                                            : translate('voc_next', {start: formatLocal(voc.start), end: formatLocal(voc.end), sign: sign(voc.nextSign)})}
                                    </p>
                                    <p className={classes.muted}>{translate('voc_explain')}</p>
                                </div>
                            </motion.div>
                        </section>

                        <section className={classes.section} aria-labelledby='sec-retro'>
                            <h2 id='sec-retro'>{translate('today_retrogrades')}</h2>
                            {sky.retrogrades.length ? (
                                <ul className={classes.chips}>
                                    {sky.retrogrades.map((id) => (
                                        <li key={id} className={classes.chip}>
                                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[id])}</span>
                                            {point(id)} ℞
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className={classes.muted}>{translate('today_no_retrogrades')}</p>}
                            <p className={classes.muted}>{translate('retrograde_explain')}</p>
                        </section>

                        <section className={classes.section} aria-labelledby='sec-personal'>
                            <h2 id='sec-personal'>{translate('today_personal')}</h2>
                            <PersonalTransitsComponent/>
                        </section>

                        <section className={classes.section} aria-labelledby='sec-sky'>
                            <h2 id='sec-sky'>{translate('today_planets')}</h2>
                            <ul className={classes.planets}>
                                {sky.points.map((p) => (
                                    <li key={p.id} className={classes.planet}>
                                        <span className={`glyph ${classes.planetGlyph}`} aria-hidden='true'>{glyph(POINT_GLYPHS[p.id!])}</span>
                                        <span className={classes.planetName}>{point(p.id)}</span>
                                        <span className={classes.planetPos}>
                                            <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[p.sign!])}</span>
                                            {` ${sign(p.sign)} ${formatDegree(p.degree, p.minute)}`}
                                            {p.retrograde && p.id !== 'northNode' ? ' ℞' : ''}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className={classes.section} aria-labelledby='sec-upcoming'>
                            <h2 id='sec-upcoming'>{translate('today_upcoming')}</h2>
                            <ul className={classes.events}>
                                {upcoming.map((e) => (
                                    <li key={`${e.kind}-${e.planet}-${e.at}`} className={classes.event}>
                                        <time dateTime={e.at ?? undefined} className={classes.when}>{formatLocal(e.at)}</time>
                                        <span>{eventLabel(e, translate, {point, sign})}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link to={Routes.calendar}><Button>{translate('today_open_calendar')}</Button></Link>
                        </section>

                        <DayPanelComponent/>
                    </>
                ) : null}
            </div>
        </div>
    );
}

export default SkyComponent;
