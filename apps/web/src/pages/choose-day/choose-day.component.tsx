import {useCallback, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {Alert, Button, Segmented, Select, Switch} from 'antd';
import classNames from 'classnames';
import {Routes} from 'router/routes';
import {formatClock} from 'core/helpers/astro';
import {ElectionMode, ElectionTopic, evaluateDay, TOPICS, TOPIC_HOUSES} from 'core/helpers/electional';
import {useChartChoice} from 'core/helpers/use-chart-choice';
import SeoComponent from 'core/shared/seo/seo.component';
import LoaderComponent from 'core/shared/loader/loader.component';
import TermComponent from 'core/shared/term/term.component';
import CosmicBackgroundComponent from 'core/shared/cosmic-background/cosmic-background.component';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {useGetElectional} from 'pages/natal-chart/actions/natal-chart.query';
import {useChooseDayStyles} from './choose-day.style';

const pad = (n: number) => String(n).padStart(2, '0');
const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

// The days of one month read in one of the user's charts for a topic: when the Moon is in the houses of that topic,
// outside its void-of-course hours, with a phase that fits the intention. Rules and wording are in the footnote.
function ChooseDayComponent() {
    const translate = useLocalization();
    const content = useContent();
    const classes = useChooseDayStyles();
    const {input, options, choice, onChoice} = useChartChoice();
    const [cursor, setCursor] = useState(() => {
        const now = new Date();
        return {year: now.getFullYear(), month: now.getMonth()};
    });
    const [topic, setTopic] = useState<ElectionTopic>('career');
    const [mode, setMode] = useState<ElectionMode>('begin');
    const [onlyGood, setOnlyGood] = useState(false);

    const start = `${cursor.year}-${pad(cursor.month + 1)}-01`;
    const length = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const {data, isFetching, isError} = useGetElectional(input, start, length, TIMEZONE);

    const handlePrev = useCallback(() => {
        setCursor((c) => (c.month === 0 ? {year: c.year - 1, month: 11} : {year: c.year, month: c.month - 1}));
    }, []);
    const handleNext = useCallback(() => {
        setCursor((c) => (c.month === 11 ? {year: c.year + 1, month: 0} : {year: c.year, month: c.month + 1}));
    }, []);
    const handleTopic = useCallback((v: ElectionTopic) => {
        setTopic(v);
    }, []);
    const handleMode = useCallback((v: string | number) => {
        setMode(v as ElectionMode);
    }, []);
    const handleOnlyGood = useCallback((v: boolean) => {
        setOnlyGood(v);
    }, []);

    const sign = (id: string) => content.signs[id as keyof typeof content.signs]?.name ?? id;
    const house = (n: number) => content.houses[String(n) as keyof typeof content.houses]?.name ?? String(n);
    const phase = (id: string) => content.lunarPhases[id as keyof typeof content.lunarPhases] ?? id;
    const clock = (iso: string) => formatClock(iso);
    const clockMs = (ms: number) => formatClock(new Date(ms).toISOString());

    const topicOptions = useMemo(() => TOPICS.map((t) => ({value: t, label: translate(`ch_topic_${t}` as ITranslationKey)})), [translate]);
    const modeOptions = useMemo(() => [
        {value: 'begin', label: translate('ch_mode_begin')},
        {value: 'finish', label: translate('ch_mode_finish')},
    ], [translate]);

    const rows = useMemo(() => (data?.days ?? []).map((d) => ({day: d, verdict: evaluateDay(d, topic, mode)})), [data, topic, mode]);
    const goodCount = useMemo(() => rows.filter((r) => r.verdict.state === 'good').length, [rows]);
    const shown = onlyGood ? rows.filter((r) => r.verdict.state === 'good') : rows;

    return (
        <div className={classes.stage}>
            <div className={classes.backdrop} aria-hidden='true'><CosmicBackgroundComponent intensity={0.6}/></div>
            <div className={`container ${classes.page}`}>
                <SeoComponent titleKey='seo_choose_title' descriptionKey='seo_choose_description' path={Routes.chooseDay}/>
                <header className={classes.head}>
                    <p className={classes.eyebrow}>{translate('ch_eyebrow')}</p>
                    <h1>{translate('ch_title', {month: translate(`month_${cursor.month + 1}` as ITranslationKey), year: cursor.year})}</h1>
                    <p className={classes.muted}>{translate('ch_intro')}</p>
                </header>

                <div className={classes.toolbar}>
                    <div className={classes.monthSwitch}>
                        <Button onClick={handlePrev} aria-label={translate('ch_prev')}>‹</Button>
                        <strong aria-live='polite'>{translate(`month_${cursor.month + 1}` as ITranslationKey)} {cursor.year}</strong>
                        <Button onClick={handleNext} aria-label={translate('ch_next')}>›</Button>
                    </div>
                    {input && options.length > 1 ? (
                        <Select className={classes.select} value={choice} options={options} onChange={onChoice}
                                aria-label={translate('today_choose_chart')}/>
                    ) : null}
                </div>

                {!input ? (
                    <div className={classes.empty}>
                        <p className={classes.muted}>{translate('today_no_chart')}</p>
                        <Link to={Routes.natalChart}><Button type='primary'>{translate('hero_cta')}</Button></Link>
                    </div>
                ) : (
                    <div className={classes.controls}>
                        <label className={classes.control}>
                            <span>{translate('ch_topic')}</span>
                            <Select value={topic} options={topicOptions} onChange={handleTopic} size='large'/>
                            <small>{translate('ch_topic_houses', {houses: TOPIC_HOUSES[topic].map(house).join(', ')})}</small>
                        </label>
                        <div className={classes.control}>
                            <span>{translate('ch_mode')}</span>
                            <Segmented options={modeOptions} value={mode} onChange={handleMode} size='large'/>
                        </div>
                    </div>
                )}

                {isError ? <Alert type='error' showIcon title={translate('ch_error')}/> : null}
                {input && !data && isFetching ? <LoaderComponent/> : null}

                {data ? (
                    <div className={classNames(classes.body, {[classes.busy]: isFetching})}>
                        {data.timeUnknown ? <Alert type='info' showIcon title={translate('ch_time_unknown')}/> : null}

                        <div className={classes.summary}>
                            {data.timeUnknown ? null : <strong>{translate('ch_summary', {n: goodCount})}</strong>}
                            {data.timeUnknown ? null : (
                                <label className={classes.only}>
                                    <Switch checked={onlyGood} onChange={handleOnlyGood}/>
                                    <span>{translate('ch_only_good')}</span>
                                </label>
                            )}
                        </div>
                        {onlyGood && !shown.length ? <p className={classes.muted}>{translate('ch_none_good')}</p> : null}

                        <ol className={classes.days}>
                            {shown.map(({day, verdict}) => {
                                const dt = new Date(`${day.date}T12:00:00`);
                                return (
                                    <li key={day.date} className={classNames(classes.day, classes[`state_${verdict.state}`])}>
                                        <div className={classes.when}>
                                            <strong>{pad(dt.getDate())}.{pad(dt.getMonth() + 1)}</strong>
                                            <span>{translate(`weekday_${dt.getDay()}` as ITranslationKey)}</span>
                                        </div>
                                        <div className={classes.what}>
                                            <p className={classes.badgeRow}>
                                                <span className={classes.badge}>{translate(`ch_state_${verdict.state}` as ITranslationKey)}</span>
                                                <span className={classes.muted}>
                                                    {phase(day.phase)} · {day.signs.map((s) => sign(s.sign)).join(' → ')}
                                                </span>
                                                {day.retrograde.includes('mercury') ? (
                                                    <span className={classes.tag}>
                                                        <TermComponent id='retrograde'>{translate('ch_retro_tag', {planet: content.points.mercury.name})}</TermComponent>
                                                    </span>
                                                ) : null}
                                            </p>
                                            {verdict.windows.map((w) => (
                                                <p key={`${w.house}-${w.from}`} className={classes.window}>
                                                    {w.from === day.start && w.to === day.end
                                                        ? translate('ch_moon_all', {house: house(w.house)})
                                                        : translate('ch_moon_in', {house: house(w.house), from: clock(w.from), to: w.to === day.end ? '24:00' : clock(w.to)})}
                                                    {w.void ? (
                                                        <span className={classes.free}>
                                                            {' · '}{translate('ch_free', {parts: w.free.length ? w.free.map((p) => `${clockMs(p.from)} – ${clockMs(p.to)}`).join(', ') : '—'})}
                                                        </span>
                                                    ) : null}
                                                </p>
                                            ))}
                                            {verdict.reasons.includes('phase') ? (
                                                <p className={classes.reason}>{translate(mode === 'begin' ? 'ch_reason_phase_begin' : 'ch_reason_phase_finish')}</p>
                                            ) : null}
                                            {verdict.reasons.includes('void') || verdict.state === 'unknown' ? day.voidOfCourse.map((v) => (
                                                <p key={v.start} className={classes.reason}>
                                                    <TermComponent id='voidOfCourse'>{translate('ch_reason_void', {from: clock(v.start), to: clock(v.end)})}</TermComponent>
                                                </p>
                                            )) : null}
                                            {verdict.reasons.includes('mercury') ? <p className={classes.reason}>{translate('ch_reason_mercury')}</p> : null}
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>

                        <details className={classes.rules}>
                            <summary>{translate('ch_rules_title')}</summary>
                            <p>{translate('ch_rules_1')}</p>
                            <p>{translate('ch_rules_2')}</p>
                            <p>{translate('ch_rules_3')}</p>
                        </details>
                        <p className={classes.note}>{translate('ch_note')}</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default ChooseDayComponent;
