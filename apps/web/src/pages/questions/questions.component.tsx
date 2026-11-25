import {useCallback, useMemo, useState} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {Alert, Button, Segmented} from 'antd';
import classNames from 'classnames';
import {aspectPairText} from '@astra/content';
import {Routes} from 'router/routes';
import {useStore} from 'store/store.config';
import {ASPECT_GLYPHS, aspectTone, formatLocal, glyph, POINT_GLYPHS} from 'core/helpers/astro';
import {firstOf, IWindow, Tone, Topic, TOPIC_MAP, TOPICS, topicIngresses, topicProfections, topicWindows} from 'core/helpers/questions';
import {useBirthSource} from 'core/helpers/use-birth-source';
import BirthSourceComponent from 'core/shared/birth-source/birth-source.component';
import SeoComponent from 'core/shared/seo/seo.component';
import LoaderComponent from 'core/shared/loader/loader.component';
import CosmicBackgroundComponent from 'core/shared/cosmic-background/cosmic-background.component';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {useGetCycles, useGetLifeline, useGetTransformations} from 'pages/natal-chart/actions/natal-chart.query';
import TransitAdviceComponent from 'core/shared/transit-advice/transit-advice.component';
import {useQuestionsStyles} from './questions.style';

const HORIZONS = [12, 24];
const TONE_CLASS: Record<Tone, 'harmonious' | 'tense' | 'neutral'> = {support: 'harmonious', challenge: 'tense', change: 'neutral'};

// Life questions answered with dates: for a topic (work, money, a move, study, health) the long transits to the topic's
// points, the slow planets entering its houses and the profection years on those houses, over the next months.
function QuestionsComponent() {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useQuestionsStyles();
    const source = useBirthSource();
    const {input, chartInput} = source;
    const [params] = useSearchParams();
    const [topic, setTopic] = useState<Topic>(() => (TOPICS as string[]).includes(params.get('topic') ?? '') ? params.get('topic') as Topic : 'career');
    const [months, setMonths] = useState(12);

    const today = useMemo(() => new Date(), []);
    const thisYear = today.getUTCFullYear();
    const from = useMemo(() => new Date(Date.UTC(thisYear, today.getUTCMonth(), today.getUTCDate())).toISOString(), [thisYear, today]);
    const to = useMemo(() => new Date(Date.UTC(thisYear, today.getUTCMonth() + months, today.getUTCDate())).toISOString(), [thisYear, today, months]);

    const transits = useGetTransformations(input, thisYear, 3);
    const lifeline = useGetLifeline(input, from.slice(0, 10), 3);
    const cycles = useGetCycles(input, true);

    const handleTopic = useCallback((v: string | number) => {
        setTopic(v as Topic);
    }, []);
    const handleMonths = useCallback((v: string | number) => {
        setMonths(Number(v));
    }, []);

    const topics = useMemo(() => TOPICS.map((k) => ({value: k, label: translate(`q_topic_${k}` as ITranslationKey)})), [translate]);
    const horizons = useMemo(() => HORIZONS.map((m) => ({value: m, label: translate('q_months', {n: m})})), [translate]);

    const windows = useMemo(() => (transits.data ? topicWindows(transits.data.episodes, topic, from, to) : []), [transits.data, topic, from, to]);
    const ingresses = useMemo(() => (lifeline.data ? topicIngresses(lifeline.data.planets, topic, from, to) : []), [lifeline.data, topic, from, to]);
    const profections = useMemo(() => (cycles.data ? topicProfections(cycles.data.years, topic, from, to) : []), [cycles.data, topic, from, to]);
    const support = firstOf(windows, 'support');
    const challenge = firstOf(windows, 'challenge');
    const change = firstOf(windows, 'change');

    const name = (id: string) => content.points[id as keyof typeof content.points]?.name
        ?? (id === 'asc' ? content.houses['1']?.name : id === 'mc' ? 'MC' : id);
    const house = (n: number) => content.houses[String(n) as keyof typeof content.houses];
    const aspectName = (a: string) => content.aspects[a as keyof typeof content.aspects]?.name.toLowerCase();
    const life = content.lifeline.house as Record<string, Record<string, string>>;
    const prof = content.profectionYear.house as Record<string, string>;
    // a period already running shows "now"; a period of a single day shows one date
    const range = (a: string, b: string | null) => {
        const start = Date.parse(a) < Date.parse(from) ? translate('q_now') : formatLocal(a, false);
        if (b && formatLocal(a, false) === formatLocal(b, false)) return start;
        return `${start} – ${b ? formatLocal(b, false) : '…'}`;
    };
    const loading = !!input && (!transits.data || !lifeline.data || !cycles.data) && (transits.isFetching || lifeline.isFetching || cycles.isFetching);
    const failed = transits.isError || lifeline.isError || cycles.isError;

    const head = (w: IWindow) => (
        <h4>
            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[w.episode.transit])}</span>{` ${name(w.episode.transit)} `}
            <span className={classNames('glyph', classes[aspectTone(w.episode.aspect)])} aria-hidden='true'>{glyph(ASPECT_GLYPHS[w.episode.aspect])}</span>
            {` ${aspectName(w.episode.aspect)} ${translate('natal_word')} `}
            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[w.episode.natal])}</span>{` ${name(w.episode.natal)}`}
        </h4>
    );
    const shortLine = (w: IWindow | null, tone: Tone) => (w ? (
        <p className={classes.text}>
            <strong className={classes[TONE_CLASS[tone]]}>{translate(`q_tone_${tone}` as ITranslationKey)}:</strong>{' '}
            {range(w.episode.start, w.episode.end)} · {name(w.episode.transit)} {aspectName(w.episode.aspect)} {name(w.episode.natal)}
        </p>
    ) : null);

    return (
        <div className={classes.stage}>
            <div className={classes.backdrop} aria-hidden='true'><CosmicBackgroundComponent intensity={0.6}/></div>
            <div className={`container ${classes.page}`}>
                <SeoComponent titleKey='seo_questions_title' descriptionKey='seo_questions_description' path={Routes.questions}/>
                <header className={classes.head}>
                    <p className={classes.eyebrow}>{translate('q_eyebrow')}</p>
                    <h1>{translate('q_title')}</h1>
                    <p className={classes.muted}>{translate('q_intro')}</p>
                </header>

                <div className={classes.toolbar}>
                    <BirthSourceComponent chartInput={chartInput} mode={source.mode} onMode={source.onMode} birth={source.birth}
                                          onBirth={source.onBirth} showDate={source.showDate}/>
                </div>

                {!input ? (
                    <div className={classes.empty}>
                        <p className={classes.muted}>{translate('dir_need_date')}</p>
                        {chartInput ? null : <Link to={Routes.natalChart}><Button>{translate('hero_cta')}</Button></Link>}
                    </div>
                ) : (
                    <div className={classes.body}>
                        <div className={classes.nav}><Segmented value={topic} onChange={handleTopic} options={topics} size='large'/></div>
                        <div className={classes.nav}><Segmented value={months} onChange={handleMonths} options={horizons}/></div>
                        {input.time === null ? <Alert type='info' showIcon title={translate('q_time_unknown')}/> : null}
                        {failed ? <Alert type='error' showIcon title={translate('dir_error')}/> : null}
                        {loading ? <LoaderComponent/> : null}

                        {!loading && transits.data ? (
                            <>
                                <section className={classes.section} aria-labelledby='q-answer'>
                                    <h2 id='q-answer'>{translate(`q_ask_${topic}` as ITranslationKey)}</h2>
                                    <div className={classes.card}>
                                        <p className={classes.label}>{translate('q_short')}</p>
                                        {shortLine(support, 'support')}
                                        {shortLine(challenge, 'challenge')}
                                        {shortLine(change, 'change')}
                                        {!support && !challenge && !change ? <p className={classes.text}>{translate('q_quiet', {n: months})}</p> : null}
                                        <p className={classes.muted}>
                                            {translate('q_counts', {n: windows.length, ing: ingresses.length, prof: profections.length})}
                                        </p>
                                        <p className={classes.muted}>
                                            {translate('q_basis', {
                                                points: TOPIC_MAP[topic].points.map(name).join(', '),
                                                houses: TOPIC_MAP[topic].houses.map((h) => house(h)?.name).join(', '),
                                            })}
                                        </p>
                                    </div>
                                </section>

                                <section className={classes.section} aria-labelledby='q-windows'>
                                    <h3 id='q-windows'>{translate('q_windows')}</h3>
                                    {windows.length ? (
                                        <ul className={classes.list}>
                                            {windows.map((w) => (
                                                <li key={`${w.episode.transit}-${w.episode.natal}-${w.episode.aspect}-${w.episode.start}`} className={classes.card}>
                                                    <p className={classNames(classes.label, classes[TONE_CLASS[w.tone]])}>{translate(`q_tone_${w.tone}` as ITranslationKey)}</p>
                                                    {head(w)}
                                                    <p className={classes.dates}>{range(w.episode.start, w.episode.end)}</p>
                                                    {w.passes.length ? <p className={classes.muted}>{translate('q_exact', {dates: w.passes.map((p) => formatLocal(p, false)).join(', ')})}</p> : null}
                                                    <p className={classes.text}>{aspectPairText(locale, w.episode.transit, w.episode.natal, w.episode.aspect)}</p>
                                                    <TransitAdviceComponent transit={w.episode.transit} aspect={w.episode.aspect}/>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <p className={classes.muted}>{translate('q_none')}</p>}
                                </section>

                                <section className={classes.section} aria-labelledby='q-houses'>
                                    <h3 id='q-houses'>{translate('q_ingresses')}</h3>
                                    {ingresses.length ? (
                                        <ul className={classes.list}>
                                            {ingresses.map((g) => (
                                                <li key={`${g.planet}-${g.start}`} className={classes.card}>
                                                    <h4><span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[g.planet])}</span> {translate('q_enters', {planet: name(g.planet), house: house(g.house)?.name ?? ''})}</h4>
                                                    <p className={classes.dates}>{range(g.start, g.end)}</p>
                                                    <p className={classes.text}>{life[g.planet]?.[String(g.house)]}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <p className={classes.muted}>{translate(input.time === null ? 'q_need_time' : 'q_none')}</p>}
                                </section>

                                <section className={classes.section} aria-labelledby='q-prof'>
                                    <h3 id='q-prof'>{translate('q_profections')}</h3>
                                    {profections.length ? (
                                        <ul className={classes.list}>
                                            {profections.map((p) => (
                                                <li key={p.age} className={classes.card}>
                                                    <h4>{translate('year_profection_line', {age: p.age, house: house(p.house)?.name ?? ''})}</h4>
                                                    <p className={classes.dates}>{range(p.start, p.end)}</p>
                                                    <p className={classes.text}>{prof[String(p.house)]}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <p className={classes.muted}>{translate(input.time === null ? 'q_need_time' : 'q_none')}</p>}
                                </section>
                            </>
                        ) : null}
                        <p className={classes.note}>{translate('q_note')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default QuestionsComponent;
