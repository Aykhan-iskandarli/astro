import {useCallback, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {Alert, Button, Select} from 'antd';
import classNames from 'classnames';
import {aspectPairText} from '@astra/content';
import {Routes} from 'router/routes';
import {ASPECT_GLYPHS, aspectTone, formatDegree, formatLocal, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import {useChartChoice} from 'core/helpers/use-chart-choice';
import {useStore} from 'store/store.config';
import SeoComponent from 'core/shared/seo/seo.component';
import LoaderComponent from 'core/shared/loader/loader.component';
import TermComponent from 'core/shared/term/term.component';
import CosmicBackgroundComponent from 'core/shared/cosmic-background/cosmic-background.component';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {useGetYear} from 'pages/natal-chart/actions/natal-chart.query';
import RetrogradeListComponent from 'pages/natal-chart/components/retrograde-list/retrograde-list.component';
import LunationListComponent from 'pages/sky/components/lunation-list/lunation-list.component';
import TransitReadingComponent from 'pages/natal-chart/components/transit-reading/transit-reading.component';
import {useYearForecastStyles} from './year-forecast.style';

const MIN_YEAR = 1801;
const MAX_YEAR = 2997;
const TOP_MONTHS = 3;

// One calendar year read in one of the user's charts: the year's character, the busiest months, the slow
// planets' houses, Moon phases and eclipses, and retrogrades.
function YearForecastComponent() {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useYearForecastStyles();
    const {input, options, choice, onChoice} = useChartChoice();
    const [year, setYear] = useState(() => new Date().getFullYear());
    const [month, setMonth] = useState<number | null>(null);
    const {data, isFetching, isError} = useGetYear(input, year);

    const handlePrev = useCallback(() => {
        setYear((y) => Math.max(MIN_YEAR, y - 1));
        setMonth(null);
    }, []);
    const handleNext = useCallback(() => {
        setYear((y) => Math.min(MAX_YEAR, y + 1));
        setMonth(null);
    }, []);
    const handleMonth = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        setMonth(Number(e.currentTarget.dataset.month));
    }, []);

    const name = (id: string | null) => (id ? content.points[id as keyof typeof content.points]?.name ?? id : '');
    const sign = (id: string | null) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : '');
    const house = (n: number | null) => (n ? content.houses[String(n) as keyof typeof content.houses] : null);
    const monthName = (m: number) => translate(`month_${m}` as ITranslationKey);

    const top = useMemo(() => (data ? [...data.months].filter((m) => m.slowHits > 0)
        .sort((a, b) => b.slowHits - a.slowHits || a.month - b.month).slice(0, TOP_MONTHS).map((m) => m.month) : []), [data]);
    const maxHits = useMemo(() => Math.max(1, ...(data?.months ?? []).map((m) => m.slowHits)), [data]);
    const shownMonth = month ?? top[0] ?? null;
    const monthEvents = useMemo(() => (data && shownMonth
        ? data.transits.filter((e) => Number(e.at!.slice(5, 7)) === shownMonth) : []), [data, shownMonth]);

    const profText = (n: number | null) => (n ? (content.profectionYear.house as Record<string, string>)[String(n)] : null);
    const solar = content.solarReturn as {house: Record<string, string>; asc: Record<string, string>};
    const lifeText = (pid: string, n: number | null) => (n ? (content.lifeline.house as Record<string, Record<string, string>>)[pid]?.[String(n)] : null);

    return (
        <div className={classes.stage}>
            <div className={classes.backdrop} aria-hidden='true'><CosmicBackgroundComponent intensity={0.6}/></div>
            <div className={`container ${classes.page}`}>
                <SeoComponent titleKey='seo_year_title' descriptionKey='seo_year_description' path={Routes.yearForecast}/>
                <header className={classes.head}>
                    <p className={classes.eyebrow}>{translate('year_eyebrow')}</p>
                    <h1>{translate('year_title', {year})}</h1>
                    <p className={classes.muted}>{translate('year_intro')}</p>
                </header>

                <div className={classes.toolbar}>
                    <div className={classes.yearSwitch}>
                        <Button onClick={handlePrev} aria-label={translate('calendar_prev')} disabled={year <= MIN_YEAR}>‹</Button>
                        <strong aria-live='polite'>{year}</strong>
                        <Button onClick={handleNext} aria-label={translate('calendar_next')} disabled={year >= MAX_YEAR}>›</Button>
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
                ) : null}
                {isError ? <Alert type='error' showIcon title={translate('year_error')}/> : null}
                {input && !data && isFetching ? <LoaderComponent/> : null}

                {data ? (
                    <div className={classNames(classes.body, {[classes.busy]: isFetching})}>
                        {data.timeUnknown ? <Alert type='info' showIcon title={translate('year_time_unknown')}/> : null}

                        <section className={classes.section} aria-labelledby='sec-character'>
                            <h2 id='sec-character'>{translate('year_character')}</h2>
                            <div className={classes.cards}>
                                {(data.profections ?? []).map((p) => (
                                    <article key={p.age} className={classes.card}>
                                        <p className={classes.label}><TermComponent id='profection'>{translate('year_profection')}</TermComponent></p>
                                        <h3>{translate('year_profection_line', {age: p.age, house: house(p.house)?.name ?? ''})}</h3>
                                        <p className={classes.range}>{formatLocal(p.start, false)} – {formatLocal(p.end, false)}</p>
                                        <p>
                                            <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[p.sign!])}</span> {sign(p.sign)}
                                            {' · '}{translate('tl_lord_label')}{' '}
                                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[p.lord!])}</span> {name(p.lord)}
                                        </p>
                                        <p className={classes.text}>{profText(p.house)}</p>
                                    </article>
                                ))}
                                {data.solar.sun ? (
                                    <article className={classes.card}>
                                        <p className={classes.label}>{translate('year_solar')}</p>
                                        <h3>{formatLocal(data.solar.at, false)}</h3>
                                        <p>
                                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS.sun)}</span>{' '}
                                            <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[data.solar.sun.sign!])}</span>
                                            {` ${sign(data.solar.sun.sign)} ${formatDegree(data.solar.sun.degree, data.solar.sun.minute)}`}
                                            {data.solar.sun.house ? ` · ${house(data.solar.sun.house)?.name}` : ''}
                                        </p>
                                        {data.solar.sun.house ? <p className={classes.text}>{solar.house[String(data.solar.sun.house)]}</p> : null}
                                        {data.solar.asc ? <p className={classes.text}>{solar.asc[data.solar.asc.sign!]}</p> : null}
                                    </article>
                                ) : null}
                                {data.firdaria.length ? (
                                    <article className={classes.card}>
                                        <p className={classes.label}><TermComponent id='firdaria'>{translate('year_firdaria')}</TermComponent></p>
                                        {data.firdaria.map((p) => (
                                            <div key={p.start}>
                                                <h3><span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[p.lord!])}</span> {name(p.lord)}</h3>
                                                <ul className={classes.plain}>
                                                    {p.sub.map((s) => (
                                                        <li key={s.start}>
                                                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[s.lord])}</span> {name(s.lord)}
                                                            <span className={classes.muted}>{` · ${formatLocal(s.start, false)} – ${formatLocal(s.end, false)}`}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </article>
                                ) : null}
                            </div>
                        </section>

                        <section className={classes.section} aria-labelledby='sec-months'>
                            <h2 id='sec-months'>{translate('year_key_months')}</h2>
                            <p className={classes.muted}>{translate('year_key_months_intro')}</p>
                            <div className={classes.months} role='group' aria-label={translate('year_key_months')}>
                                {data.months.map((m) => (
                                    <button key={m.month} type='button' data-month={m.month} onClick={handleMonth}
                                            aria-pressed={shownMonth === m.month}
                                            aria-label={`${monthName(m.month)}: ${translate('year_month_hits', {n: m.slowHits})}`}
                                            className={classNames(classes.month, {[classes.monthTop]: top.includes(m.month), [classes.monthOn]: shownMonth === m.month})}>
                                        <span className={classes.monthBar} style={{height: `${(m.slowHits / maxHits) * 100}%`}}/>
                                        <span className={classes.monthName}>{monthName(m.month).slice(0, 3)}</span>
                                        <span className={classes.monthN}>{m.slowHits}</span>
                                    </button>
                                ))}
                            </div>
                            {shownMonth ? (
                                <div>
                                    <h3 className={classes.sub}>{translate('year_month_transits', {month: monthName(shownMonth)})}</h3>
                                    {monthEvents.length ? (
                                        <ul className={classes.events}>
                                            {monthEvents.map((e) => (
                                                <li key={`${e.transit}-${e.natal}-${e.aspect}-${e.at}`} className={classes.event}>
                                                    <time dateTime={e.at ?? undefined} className={classes.when}>{formatLocal(e.at, false)}</time>
                                                    <span className={classNames('glyph', classes[aspectTone(e.aspect!)])} aria-hidden='true'>{glyph(ASPECT_GLYPHS[e.aspect!])}</span>
                                                    <div>
                                                        <p>
                                                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[e.transit!])}</span>
                                                            {` ${name(e.transit)} `}
                                                            <strong>{content.aspects[e.aspect as keyof typeof content.aspects]?.name.toLowerCase()}</strong>
                                                            {` ${translate('natal_word')} `}
                                                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[e.natal!])}</span>
                                                            {` ${name(e.natal)}`}
                                                            {e.passes > 1 ? <span className={classes.muted}>{` · ${translate('timeline_pass', {n: e.pass, total: e.passes})}`}</span> : null}
                                                        </p>
                                                        {aspectPairText(locale, e.transit!, e.natal!, e.aspect!) ? <p className={classes.text}>{aspectPairText(locale, e.transit!, e.natal!, e.aspect!)}</p> : null}
                                                        <TransitReadingComponent transit={e.transit!} natal={e.natal!} aspect={e.aspect!}/>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <p className={classes.muted}>{translate('year_no_transits')}</p>}
                                </div>
                            ) : null}
                        </section>

                        <section className={classes.section} aria-labelledby='sec-slow'>
                            <h2 id='sec-slow'>{translate('year_slow')}</h2>
                            <p className={classes.muted}>{translate('year_slow_intro')}</p>
                            <ul className={classes.slow}>
                                {Object.entries(data.slowPlanets).map(([pid, v]) => (
                                    <li key={pid} className={classes.slowItem}>
                                        <h3><span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[pid])}</span> {name(pid)}</h3>
                                        {(v.houses ?? v.signs).map((s) => {
                                            const h = house(s.region);
                                            return (
                                                <div key={s.start} className={classes.slowSeg}>
                                                    <p><strong>{h?.name ?? sign(s.sign)}</strong>
                                                        <span className={classes.muted}>{` · ${s.startClipped ? translate('year_from_start') : formatLocal(s.start, false)} – ${s.endClipped ? translate('year_to_end') : formatLocal(s.end, false)}`}</span>
                                                    </p>
                                                    {h ? <p className={classes.text}>{lifeText(pid, s.region)}</p> : null}
                                                </div>
                                            );
                                        })}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className={classes.section} aria-labelledby='sec-lunations'>
                            <h2 id='sec-lunations'>{translate('year_lunations')}</h2>
                            <LunationListComponent lunations={data.lunations} timeUnknown={data.timeUnknown} limit={8} expandable/>
                        </section>

                        <section className={classes.section} aria-labelledby='sec-retro'>
                            <h2 id='sec-retro'>{translate('year_retro')}</h2>
                            <RetrogradeListComponent retrogrades={data.retrogrades} from={`${year}-01-01`} to={`${year + 1}-01-01`}/>
                        </section>

                        <p className={classes.muted}>{translate('year_note')}</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default YearForecastComponent;
