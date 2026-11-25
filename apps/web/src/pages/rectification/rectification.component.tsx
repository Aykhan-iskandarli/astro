import {useCallback, useMemo, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {Alert, Button, DatePicker, Segmented} from 'antd';
import dayjs, {Dayjs} from 'dayjs';
import classNames from 'classnames';
import {useQuery} from '@tanstack/react-query';
import {Routes} from 'router/routes';
import {formatDegree, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import {useBirthSource} from 'core/helpers/use-birth-source';
import BirthSourceComponent from 'core/shared/birth-source/birth-source.component';
import SeoComponent from 'core/shared/seo/seo.component';
import LoaderComponent from 'core/shared/loader/loader.component';
import CosmicBackgroundComponent from 'core/shared/cosmic-background/cosmic-background.component';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {getRectification} from 'pages/natal-chart/actions/natal-chart.service';
import {IRectificationRequest} from 'pages/natal-chart/models/rectification.model';
import {useRectificationStyles} from './rectification.style';

interface IEvent {
    id: number;
    date: Dayjs | null;
}

const MAX_EVENTS = 12;
const MIN_EVENTS = 3;
const WINDOW_HOURS = 2;
const pad = (n: number) => String(n).padStart(2, '0');
const shift = (hhmm: string, hours: number) => {
    const [h, m] = hhmm.split(':').map(Number);
    const t = Math.min(23 * 60 + 59, Math.max(0, h * 60 + m + hours * 60));
    return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
};

// Rectification: which birth times of the birth day fit the dates of important life events best. The engine checks
// every few minutes of the day for slow-planet transits and Solar Arc contacts to the angles on each event date.
// The event dates are sent only for the calculation and are not stored.
function RectificationComponent() {
    const translate = useLocalization();
    const content = useContent();
    const classes = useRectificationStyles();
    const navigate = useNavigate();
    const source = useBirthSource();
    const {input, chartInput} = source;
    const [events, setEvents] = useState<IEvent[]>([{id: 1, date: null}, {id: 2, date: null}, {id: 3, date: null}]);
    const [nextId, setNextId] = useState(4);
    const [span, setSpan] = useState<'day' | 'near'>('day');
    const [request, setRequest] = useState<IRectificationRequest | null>(null);

    const birth = input ? dayjs(input.date) : null;
    const disabled = useCallback((d: Dayjs) => d.isAfter(dayjs()) || (birth ? !d.isAfter(birth, 'day') : false), [birth]);
    const handleDate = useCallback((id: number) => (d: Dayjs | null) => {
        setEvents((list) => list.map((e) => (e.id === id ? {...e, date: d} : e)));
    }, []);
    const handleAdd = useCallback(() => {
        setEvents((list) => (list.length < MAX_EVENTS ? [...list, {id: nextId, date: null}] : list));
        setNextId((n) => n + 1);
    }, [nextId]);
    const handleRemove = useCallback((id: number) => () => {
        setEvents((list) => (list.length > 1 ? list.filter((e) => e.id !== id) : list));
    }, []);
    const handleWindow = useCallback((v: string | number) => {
        setSpan(v as 'day' | 'near');
    }, []);

    const dates = useMemo(() => [...new Set(events.filter((e) => e.date && birth && e.date.isAfter(birth, 'day')).map((e) => e.date!.format('YYYY-MM-DD')))].sort(), [events, birth]);
    const near = span === 'near' && !!input?.time;
    const handleRun = useCallback(() => {
        if (!input) return;
        setRequest({
            input: {...input, time: null},
            events: dates,
            windowStart: near ? shift(input.time!, -WINDOW_HOURS) : null,
            windowEnd: near ? shift(input.time!, WINDOW_HOURS) : null,
        });
    }, [input, dates, near]);

    const {data, isFetching, isError} = useQuery({
        queryKey: ['rectification', request],
        queryFn: () => getRectification(request!),
        enabled: !!request,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
    });

    const handleUse = useCallback((time: string) => () => {
        navigate(`${Routes.natalChart}?time=${time}`);
    }, [navigate]);

    const name = (id: string) => content.points[id as keyof typeof content.points]?.name
        ?? (id === 'asc' ? content.houses['1']?.name : id === 'mc' ? 'MC' : id);
    const sign = (id: string) => content.signs[id as keyof typeof content.signs]?.name ?? id;
    const aspect = (id: string) => content.aspects[id as keyof typeof content.aspects]?.name.toLowerCase() ?? id;
    const max = Math.max(1, ...(data?.curve ?? []).map((c) => c.score));
    const best = data?.top[0]?.time ?? null;

    return (
        <div className={classes.stage}>
            <div className={classes.backdrop} aria-hidden='true'><CosmicBackgroundComponent intensity={0.6}/></div>
            <div className={`container ${classes.page}`}>
                <SeoComponent titleKey='seo_rect_title' descriptionKey='seo_rect_description' path={Routes.rectification}/>
                <header className={classes.head}>
                    <p className={classes.eyebrow}>{translate('rect_eyebrow')}</p>
                    <h1>{translate('rect_title')}</h1>
                    <p className={classes.muted}>{translate('rect_intro')}</p>
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
                        <section className={classes.section} aria-labelledby='rect-events'>
                            <h2 id='rect-events'>{translate('rect_events')}</h2>
                            <p className={classes.muted}>{translate('rect_events_hint', {n: MIN_EVENTS})}</p>
                            <ul className={classes.eventList}>
                                {events.map((e, i) => (
                                    <li key={e.id}>
                                        <span className={classes.num}>{i + 1}</span>
                                        <DatePicker value={e.date} onChange={handleDate(e.id)} format='DD.MM.YYYY' disabledDate={disabled} size='large'
                                                    placeholder={translate('field_date_placeholder')} aria-label={translate('ev_event_n', {n: i + 1})}/>
                                        {events.length > 1 ? <Button onClick={handleRemove(e.id)}>{translate('ev_remove')}</Button> : null}
                                    </li>
                                ))}
                            </ul>
                            {events.length < MAX_EVENTS ? <div><Button onClick={handleAdd}>{translate('ev_add')}</Button></div> : null}
                            {input.time ? (
                                <div className={classes.window}>
                                    <span>{translate('rect_window')}</span>
                                    <Segmented value={span} onChange={handleWindow} options={[
                                        {value: 'day', label: translate('rect_window_day')},
                                        {value: 'near', label: translate('rect_window_near', {time: input.time, h: WINDOW_HOURS})},
                                    ]}/>
                                </div>
                            ) : null}
                            <div>
                                <Button type='primary' size='large' onClick={handleRun} disabled={dates.length < 1} loading={isFetching}>
                                    {translate('rect_run')}
                                </Button>
                            </div>
                            {dates.length > 0 && dates.length < MIN_EVENTS ? <Alert type='warning' showIcon title={translate('rect_few', {n: MIN_EVENTS})}/> : null}
                            <p className={classes.note}>{translate('rect_privacy')}</p>
                        </section>

                        {isError ? <Alert type='error' showIcon title={translate('rect_error')}/> : null}
                        {isFetching && !data ? <LoaderComponent/> : null}

                        {data ? (
                            <section className={classNames(classes.section, {[classes.busy]: isFetching})} aria-labelledby='rect-result'>
                                <h2 id='rect-result'>{translate('rect_result')}</h2>
                                <p className={classes.muted}>{translate('rect_curve_hint')}</p>
                                <div className={classes.curve} role='img' aria-label={translate('rect_curve_label', {time: best ?? ''})}>
                                    {data.curve.map((c) => (
                                        <span key={c.time} title={`${c.time} · ${sign(c.asc)} · ${c.score}`}
                                              className={classNames(classes.bar, {[classes.barTop]: data.top.some((t) => t.time === c.time)})}
                                              style={{height: `${Math.max(2, (c.score / max) * 100)}%`}}/>
                                    ))}
                                </div>
                                <div className={classes.axis}>
                                    <span>{data.curve[0]?.time}</span>
                                    <span>{data.curve[Math.floor(data.curve.length / 2)]?.time}</span>
                                    <span>{data.curve[data.curve.length - 1]?.time}</span>
                                </div>

                                <ol className={classes.list}>
                                    {data.top.map((c, i) => (
                                        <li key={c.time} className={classes.card}>
                                            <p className={classes.label}>{translate('rect_rank', {n: i + 1})}</p>
                                            <h3>{c.time}</h3>
                                            <p className={classes.dates}>
                                                {translate('portrait_asc')} <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[c.asc.sign])}</span> {sign(c.asc.sign)} {formatDegree(c.asc.degree, c.asc.minute)}
                                                {' · MC '}<span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[c.mc.sign])}</span> {sign(c.mc.sign)} {formatDegree(c.mc.degree, c.mc.minute)}
                                            </p>
                                            <p className={classes.muted}>{translate('rect_score', {score: c.score, n: c.events, total: data.events.length})}</p>
                                            <details className={classes.more}>
                                                <summary>{translate('rect_hits', {n: c.hits.length})}</summary>
                                                <ul>
                                                    {c.hits.map((h, k) => (
                                                        <li key={k}>
                                                            <b>{dayjs(data.events[h.event]).format('DD.MM.YYYY')}</b>{' · '}
                                                            {translate(`rect_kind_${h.kind}` as ITranslationKey)}:{' '}
                                                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[h.from])}</span> {name(h.from)} {aspect(h.aspect)}{' '}
                                                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[h.to])}</span> {name(h.to)}
                                                            {` · ${h.orb.toFixed(2)}°`}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </details>
                                            <div><Button onClick={handleUse(c.time)}>{translate('rect_use', {time: c.time})}</Button></div>
                                        </li>
                                    ))}
                                </ol>
                                <p className={classes.note}>{translate('rect_note')}</p>
                            </section>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RectificationComponent;
