import {useCallback, useMemo, useState} from 'react';
import {Alert, Button, Checkbox, Segmented} from 'antd';
import type {CheckboxOptionType} from 'antd';
import {Routes} from 'router/routes';
import {formatLocal, glyph, POINT_GLYPHS} from 'core/helpers/astro';
import SeoComponent from 'core/shared/seo/seo.component';
import LoaderComponent from 'core/shared/loader/loader.component';
import CosmicBackgroundComponent from 'core/shared/cosmic-background/cosmic-background.component';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {useGetCalendar} from 'pages/sky/actions/sky.query';
import {SkyEventModel} from 'pages/sky/models/sky.model';
import {eventLabel} from 'pages/sky/components/event-label/event-label';
import MoonCalendarComponent from './components/moon-calendar/moon-calendar.component';
import {useCalendarStyles} from './calendar.style';

type Kind = 'lunations' | 'eclipses' | 'ingresses' | 'stations';
const KINDS: Kind[] = ['lunations', 'eclipses', 'ingresses', 'stations'];
const MIN_YEAR = 1800;
const MAX_YEAR = 2998;

// Astro calendar for a year: lunations, eclipses, sign ingresses, stations and retrograde periods.
function CalendarComponent() {
    const translate = useLocalization();
    const content = useContent();
    const classes = useCalendarStyles();
    const [year, setYear] = useState(() => new Date().getFullYear());
    const [kinds, setKinds] = useState<Kind[]>(['lunations', 'eclipses', 'stations']);
    const [mode, setMode] = useState<'events' | 'moon'>('events');
    const {data, isFetching, isError} = useGetCalendar(`${year}-01-01`, `${year + 1}-01-01`);
    const handleMode = useCallback((v: string | number) => setMode(v as 'events' | 'moon'), []);
    const modes = useMemo(() => [
        {value: 'events', label: translate('calendar_mode_events')},
        {value: 'moon', label: translate('calendar_mode_moon')},
    ], [translate]);

    const point = useCallback((id: string | null) => (id ? content.points[id as keyof typeof content.points]?.name ?? id : ''), [content]);
    const sign = useCallback((id: string | null) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : ''), [content]);

    const handlePrev = useCallback(() => setYear((y) => Math.max(MIN_YEAR, y - 1)), []);
    const handleNext = useCallback(() => setYear((y) => Math.min(MAX_YEAR, y + 1)), []);
    const handleKinds = useCallback((v: Kind[]) => setKinds(v), []);

    const options: CheckboxOptionType<Kind>[] = useMemo(() => KINDS.map((k) => ({value: k, label: translate(`calendar_${k}`)})), [translate]);

    // Events grouped by the viewer's local month
    const months = useMemo(() => {
        if (!data) return [];
        const all: SkyEventModel[] = kinds.flatMap((k) => data[k]);
        const groups = new Map<number, SkyEventModel[]>();
        all.forEach((e) => {
            const m = new Date(e.at!).getMonth();
            if (new Date(e.at!).getFullYear() !== year) return;
            groups.set(m, [...(groups.get(m) ?? []), e]);
        });
        return [...groups.entries()].sort((a, b) => a[0] - b[0])
            .map(([m, list]) => ({m, list: list.sort((a, b) => a.at!.localeCompare(b.at!))}));
    }, [data, kinds, year]);

    const monthName = (m: number) => translate(`month_${m + 1}` as ITranslationKey);

    return (
        <div className={classes.stage}>
            <div className={classes.backdrop} aria-hidden='true'><CosmicBackgroundComponent intensity={0.6}/></div>
            <div className={`container ${classes.page}`}>
                <SeoComponent titleKey='seo_calendar_title' descriptionKey='seo_calendar_description' path={Routes.calendar}/>
                <header className={classes.head}>
                    <p className={classes.eyebrow}>{translate('calendar_eyebrow')}</p>
                    <h1>{translate('calendar_title')}</h1>
                    <p className={classes.muted}>{translate('calendar_intro')}</p>
                </header>

                <Segmented options={modes} value={mode} onChange={handleMode} size='large'/>

                {mode === 'moon' ? <MoonCalendarComponent/> : null}

                {mode === 'events' ? <>
                <div className={classes.toolbar}>
                    <div className={classes.yearSwitch}>
                        <Button onClick={handlePrev} aria-label={translate('calendar_prev')} disabled={year <= MIN_YEAR}>‹</Button>
                        <strong aria-live='polite'>{year}</strong>
                        <Button onClick={handleNext} aria-label={translate('calendar_next')} disabled={year >= MAX_YEAR}>›</Button>
                    </div>
                    <Checkbox.Group<Kind> options={options} value={kinds} onChange={handleKinds}/>
                </div>

                {isError ? <Alert type='error' showIcon title={translate('today_error')}/> : null}
                {isFetching && !data ? <LoaderComponent/> : null}

                {data ? (
                    <>
                        <section className={classes.section} aria-labelledby='sec-retro-periods'>
                            <h2 id='sec-retro-periods'>{translate('calendar_retro_periods')}</h2>
                            <ul className={classes.periods}>
                                {data.retrogradePeriods.map((r) => (
                                    <li key={`${r.planet}-${r.start}`} className={classes.period}>
                                        <span className={classes.periodName}>
                                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[r.planet!])}</span>
                                            {point(r.planet)} ℞
                                        </span>
                                        <span className={classes.muted}>
                                            {r.startClipped ? translate('calendar_before') : formatLocal(r.start, false)}
                                            {' – '}
                                            {r.endClipped ? translate('calendar_after') : formatLocal(r.end, false)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <div className={classes.months}>
                            {months.map(({m, list}) => (
                                <section key={m} className={classes.month} aria-labelledby={`month-${m}`}>
                                    <h2 id={`month-${m}`}>{monthName(m)}</h2>
                                    <ul className={classes.events}>
                                        {list.map((e) => (
                                            <li key={`${e.kind}-${e.planet}-${e.at}`} className={`${classes.event} ${e.kind === 'solar' || e.kind === 'lunar' ? classes.eclipse : ''}`}>
                                                <time dateTime={e.at ?? undefined} className={classes.when}>{formatLocal(e.at)}</time>
                                                <span>{eventLabel(e, translate, {point, sign})}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ))}
                        </div>
                        <p className={classes.muted}>{translate('calendar_timezone_note')}</p>
                    </>
                ) : null}
                </> : null}
            </div>
        </div>
    );
}

export default CalendarComponent;
