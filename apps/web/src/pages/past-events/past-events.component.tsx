import {useCallback, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {Alert, Button, DatePicker, Select} from 'antd';
import dayjs, {Dayjs} from 'dayjs';
import classNames from 'classnames';
import {aspectPairText} from '@astra/content';
import {useQueries} from '@tanstack/react-query';
import {Routes} from 'router/routes';
import {useStore} from 'store/store.config';
import {ASPECT_GLYPHS, aspectTone, formatLocal, glyph, POINT_GLYPHS} from 'core/helpers/astro';
import {
    CATEGORIES, CATEGORY_BODIES, EventCategory, heavier, IMatch, MAX_EVENTS, MAX_SHOWN, nearMatches, transitMatches, WINDOWS,
} from 'core/helpers/event-check';
import {DIRECTIONS_WINDOW, directionsStart} from 'core/helpers/directions';
import {useBirthSource} from 'core/helpers/use-birth-source';
import BirthSourceComponent from 'core/shared/birth-source/birth-source.component';
import SeoComponent from 'core/shared/seo/seo.component';
import LoaderComponent from 'core/shared/loader/loader.component';
import CosmicBackgroundComponent from 'core/shared/cosmic-background/cosmic-background.component';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {getDirections, getTransformations} from 'pages/natal-chart/actions/natal-chart.service';
import {IEpisode} from 'pages/natal-chart/models/transformations.model';
import AspectReadingComponent from 'pages/natal-chart/components/aspect-reading/aspect-reading.component';
import {useDirectionsStyles} from '../directions/directions.style';

interface IEvent {
    id: number;
    date: Dayjs | null;
    category: EventCategory;
}

const MIN_DATE = dayjs('1801-01-01');
const ymd = (d: Dayjs) => d.format('YYYY-MM-DD');

// A look back at dated life events: for each date the long transits, Solar Arc hits and progressions that were exact
// around it. The dates are used only to choose which years to ask the engine for; they are not stored or sent as events.
function PastEventsComponent() {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useDirectionsStyles();
    const source = useBirthSource();
    const {input, chartInput} = source;
    const [events, setEvents] = useState<IEvent[]>([{id: 1, date: null, category: 'other'}]);
    const [nextId, setNextId] = useState(2);

    const birth = input ? dayjs(input.date) : null;
    const disabled = useCallback((d: Dayjs) => d.isBefore(MIN_DATE) || d.isAfter(dayjs()) || (birth ? d.isBefore(birth) : false), [birth]);

    const handleDate = useCallback((id: number) => (d: Dayjs | null) => {
        setEvents((list) => list.map((e) => (e.id === id ? {...e, date: d} : e)));
    }, []);
    const handleCategory = useCallback((id: number) => (v: EventCategory) => {
        setEvents((list) => list.map((e) => (e.id === id ? {...e, category: v} : e)));
    }, []);
    const handleAdd = useCallback(() => {
        setEvents((list) => (list.length < MAX_EVENTS ? [...list, {id: nextId, date: null, category: 'other'}] : list));
        setNextId((n) => n + 1);
    }, [nextId]);
    const handleRemove = useCallback((id: number) => () => {
        setEvents((list) => (list.length > 1 ? list.filter((e) => e.id !== id) : list));
    }, []);

    const dated = useMemo(() => events.filter((e) => e.date && (!birth || !e.date.isBefore(birth))), [events, birth]);
    const starts = useMemo(() => [...new Set(dated.map((e) => directionsStart(e.date!.year())))], [dated]);
    const options = {staleTime: Infinity, gcTime: 5 * 60 * 1000, retry: false, refetchOnReconnect: false, refetchOnWindowFocus: false};
    const transitQueries = useQueries({queries: starts.map((s) => ({
        queryKey: ['transformations', input, s, DIRECTIONS_WINDOW], queryFn: () => getTransformations(input!, s, DIRECTIONS_WINDOW), enabled: !!input, ...options,
    }))});
    const directionQueries = useQueries({queries: starts.map((s) => ({
        queryKey: ['directions', input, s, DIRECTIONS_WINDOW], queryFn: () => getDirections(input!, s, DIRECTIONS_WINDOW), enabled: !!input, ...options,
    }))});
    const failed = [...transitQueries, ...directionQueries].some((q) => q.isError);

    const name = (id: string) => content.points[id as keyof typeof content.points]?.name
        ?? (id === 'asc' ? content.houses['1']?.name : id === 'mc' ? 'MC' : id);
    const sign = (id: string) => content.signs[id as keyof typeof content.signs]?.name ?? id;
    const when = (days: number) => (days === 0 ? translate('ev_same_day') : translate(days < 0 ? 'ev_days_before' : 'ev_days_after', {n: Math.abs(days)}));
    const aspectName = (a: string) => content.aspects[a as keyof typeof content.aspects]?.name.toLowerCase();

    const head = (from: string, aspect: string, to: string) => (
        <h4>
            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[from])}</span>{` ${name(from)} `}
            <span className={classNames('glyph', classes[aspectTone(aspect)])} aria-hidden='true'>{glyph(ASPECT_GLYPHS[aspect])}</span>
            {` ${aspectName(aspect)} `}
            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[to])}</span>{` ${name(to)}`}
        </h4>
    );
    const star = (m: IMatch<unknown>) => (m.relevant ? <span className={classes.dates} title={translate('ev_relevant_hint')}> ★</span> : null);

    const report = (e: IEvent) => {
        const date = ymd(e.date!);
        const start = directionsStart(e.date!.year());
        const ti = starts.indexOf(start);
        const t = transitQueries[ti]?.data;
        const d = directionQueries[ti]?.data;
        if (!t || !d) return <LoaderComponent/>;
        const bodies = CATEGORY_BODIES[e.category];
        const transits = transitMatches(t.episodes, date, e.category).sort((a, b) => Number(b.relevant) - Number(a.relevant) || Math.abs(a.days) - Math.abs(b.days) || heavier(a.item, b.item));
        const arcs = nearMatches(d.solarArc, date, WINDOWS.solarArc, bodies, (h) => [h.directed, h.natal]);
        const prog = nearMatches(d.progressed, date, WINDOWS.progressed, bodies, (h) => [h.progressed, h.natal]);
        const ingress = nearMatches(d.ingresses, date, WINDOWS.ingress, bodies, (h) => [h.progressed]);
        const total = transits.length + arcs.length + prog.length + ingress.length;
        const age = Math.floor(e.date!.diff(birth!, 'year', true));
        const episode = (m: IMatch<IEpisode>) => (
            <li key={`${m.item.transit}-${m.item.natal}-${m.item.aspect}-${m.item.start}`} className={classes.card}>
                {head(m.item.transit, m.item.aspect, m.item.natal)}
                <p className={classes.dates}>{translate('ev_closest_pass', {when: when(m.days)})}{star(m)}</p>
                <p className={classes.muted}>{translate('ev_natal_in', {name: name(m.item.natal), sign: sign(m.item.natalSign)})}</p>
                <p className={classes.text}>{aspectPairText(locale, m.item.transit, m.item.natal, m.item.aspect)}</p>
                <AspectReadingComponent p1={m.item.transit} p2={m.item.natal} type={m.item.aspect}/>
            </li>
        );
        const line = (key: string, m: IMatch<{at: string}>, title: React.ReactNode, text: string | null) => (
            <li key={key} className={classes.card}>
                {title}
                <p className={classes.dates}>{formatLocal(m.item.at, false)} · {when(m.days)}{star(m)}</p>
                {text ? <p className={classes.text}>{text}</p> : null}
            </li>
        );
        return (
            <>
                <p className={classes.muted}>{translate('ev_summary', {n: total, rel: [...transits, ...arcs, ...prog, ...ingress].filter((m) => m.relevant).length})}</p>
                <section className={classes.section}>
                    <h3>{translate('ev_transits', {days: WINDOWS.transit})}</h3>
                    {transits.length ? <ul className={classes.list}>{transits.slice(0, MAX_SHOWN).map(episode)}</ul> : <p className={classes.muted}>{translate('ev_none')}</p>}
                </section>
                <section className={classes.section}>
                    <h3>{translate('ev_solar_arc', {days: WINDOWS.solarArc})}</h3>
                    {arcs.length ? <ul className={classes.list}>{arcs.slice(0, MAX_SHOWN).map((m) => line(`${m.item.directed}-${m.item.natal}-${m.item.aspect}`, m, head(m.item.directed, m.item.aspect, m.item.natal), aspectPairText(locale, m.item.directed, m.item.natal, m.item.aspect)))}</ul> : <p className={classes.muted}>{translate('ev_none')}</p>}
                </section>
                <section className={classes.section}>
                    <h3>{translate('ev_progressed', {days: WINDOWS.progressed})}</h3>
                    {prog.length || ingress.length ? (
                        <ul className={classes.list}>
                            {prog.slice(0, MAX_SHOWN).map((m) => line(`${m.item.progressed}-${m.item.natal}-${m.item.aspect}-${m.item.at}`, m, head(m.item.progressed, m.item.aspect, m.item.natal), aspectPairText(locale, m.item.progressed, m.item.natal, m.item.aspect)))}
                            {ingress.slice(0, MAX_SHOWN).map((m) => line(`in-${m.item.progressed}-${m.item.sign}`, m,
                                <h4><span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[m.item.progressed])}</span> {translate('dir_enters', {planet: name(m.item.progressed)})} {sign(m.item.sign)}</h4>, null))}
                        </ul>
                    ) : <p className={classes.muted}>{translate('ev_none')}</p>}
                </section>
                <p className={classes.age}>{translate('ev_age', {age})}</p>
            </>
        );
    };

    return (
        <div className={classes.stage}>
            <div className={classes.backdrop} aria-hidden='true'><CosmicBackgroundComponent intensity={0.6}/></div>
            <div className={`container ${classes.page}`}>
                <SeoComponent titleKey='seo_events_title' descriptionKey='seo_events_description' path={Routes.pastEvents}/>
                <header className={classes.head}>
                    <p className={classes.eyebrow}>{translate('ev_eyebrow')}</p>
                    <h1>{translate('ev_title')}</h1>
                    <p className={classes.muted}>{translate('ev_intro')}</p>
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
                        {input.time === null ? <Alert type='info' showIcon title={translate('dir_date_only_note')}/> : null}
                        {events.map((e, i) => (
                            <section key={e.id} className={classes.section} aria-label={translate('ev_event_n', {n: i + 1})}>
                                <div className={classes.toolbar}>
                                    <label className={classes.dateField}>
                                        <span>{translate('ev_event_date')}</span>
                                        <DatePicker value={e.date} onChange={handleDate(e.id)} format='DD.MM.YYYY' disabledDate={disabled} size='large'
                                                    placeholder={translate('field_date_placeholder')} inputReadOnly={false}/>
                                    </label>
                                    <label className={classes.dateField}>
                                        <span>{translate('ev_event_type')}</span>
                                        <Select<EventCategory> value={e.category} onChange={handleCategory(e.id)} size='large' style={{minWidth: 200}}
                                                               options={CATEGORIES.map((c) => ({value: c, label: translate(`ev_cat_${c}` as ITranslationKey)}))}/>
                                    </label>
                                    {events.length > 1 ? <Button onClick={handleRemove(e.id)}>{translate('ev_remove')}</Button> : null}
                                </div>
                                {e.date && !e.date.isBefore(birth ?? MIN_DATE) ? report(e) : <p className={classes.muted}>{translate('ev_pick_date')}</p>}
                            </section>
                        ))}
                        {failed ? <Alert type='error' showIcon title={translate('dir_error')}/> : null}
                        {events.length < MAX_EVENTS ? <div><Button onClick={handleAdd}>{translate('ev_add')}</Button></div> : null}
                        <p className={classes.note}>{translate('ev_note')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PastEventsComponent;
