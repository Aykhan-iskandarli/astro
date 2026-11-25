import {useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {Button, Select} from 'antd';
import {useQuery} from '@tanstack/react-query';
import {Routes} from 'router/routes';
import {formatLocal, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import {useChartChoice} from 'core/helpers/use-chart-choice';
import {mainThemes} from 'core/helpers/themes';
import {busiestMonths, topTransits} from 'core/helpers/year-summary';
import {TOPICS} from 'core/helpers/questions';
import SeoComponent from 'core/shared/seo/seo.component';
import LoaderComponent from 'core/shared/loader/loader.component';
import CosmicBackgroundComponent from 'core/shared/cosmic-background/cosmic-background.component';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {createNatalChart} from 'pages/natal-chart/actions/natal-chart.service';
import {useGetTimeline, useGetYear} from 'pages/natal-chart/actions/natal-chart.query';
import {useDashboardStyles} from './dashboard.style';

const PAGES: {to: Routes; key: ITranslationKey; hint: ITranslationKey}[] = [
    {to: Routes.questions, key: 'nav_questions', hint: 'dash_hint_questions'},
    {to: Routes.yearForecast, key: 'nav_year', hint: 'dash_hint_year'},
    {to: Routes.today, key: 'nav_today', hint: 'dash_hint_today'},
    {to: Routes.calendar, key: 'nav_calendar', hint: 'dash_hint_calendar'},
    {to: Routes.chooseDay, key: 'nav_choose', hint: 'dash_hint_choose'},
    {to: Routes.transformations, key: 'nav_transform', hint: 'dash_hint_transform'},
    {to: Routes.lifeTimeline, key: 'nav_life', hint: 'dash_hint_life'},
    {to: Routes.directions, key: 'nav_directions', hint: 'dash_hint_directions'},
    {to: Routes.pastEvents, key: 'nav_events', hint: 'dash_hint_events'},
    {to: Routes.rectification, key: 'nav_rect', hint: 'dash_hint_rect'},
];

// The user's starting point once a chart exists: the chart in three lines, its main themes, the year at a glance, the
// coming week, the life questions and a short guide to which page answers what. Everything links to the full page.
function DashboardComponent() {
    const translate = useLocalization();
    const content = useContent();
    const classes = useDashboardStyles();
    const {input, options, choice, onChoice} = useChartChoice();
    const [today] = useState(() => new Date().toLocaleDateString('en-CA'));
    const year = Number(today.slice(0, 4));

    const chart = useQuery({
        queryKey: ['natal', input],
        queryFn: () => createNatalChart(input!),
        enabled: !!input,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
    });
    const yearData = useGetYear(input, year);
    const week = useGetTimeline(input, today, 7, !!input, true);

    const name = (id: string | null) => (id ? content.points[id as keyof typeof content.points]?.name
        ?? (id === 'asc' ? content.houses['1']?.name : id === 'mc' ? 'MC' : id) : '');
    const sign = (id: string | null) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : '');
    const house = (n: number | null) => (n ? content.houses[String(n) as keyof typeof content.houses]?.name ?? '' : '');
    const themeTexts = content.themes as unknown as Record<string, {name: string}>;

    const c = chart.data;
    const known = c ? !c.timeUnknown : false;
    const big3 = useMemo(() => (c ? [
        {id: 'sun', sign: c.points.find((p) => p.id === 'sun')?.sign ?? null},
        {id: 'moon', sign: c.points.find((p) => p.id === 'moon')?.sign ?? null},
        ...(known ? [{id: 'asc', sign: c.angles.find((a) => a.id === 'asc')?.sign ?? null}] : []),
    ] : []), [c, known]);
    const themes = useMemo(() => (c ? mainThemes(
        c.points.map((p) => ({id: p.id, sign: p.sign, house: known ? p.house : null})),
        known ? c.angles.find((a) => a.id === 'asc')?.sign ?? null : null,
        known ? c.angles.find((a) => a.id === 'mc')?.sign ?? null : null,
    ) : []), [c, known]);

    const y = yearData.data;
    const now = Date.now();
    const profection = y?.profections?.find((p) => Date.parse(p.start!) <= now && now < Date.parse(p.end!)) ?? y?.profections?.[0] ?? null;
    const heavy = y ? topTransits(y.transits, 2) : [];
    const months = y ? busiestMonths(y.months) : [];
    const events = [...(week.data?.events ?? [])].sort((a, b) => (a.at ?? '').localeCompare(b.at ?? ''));

    return (
        <div className={classes.stage}>
            <div className={classes.backdrop} aria-hidden='true'><CosmicBackgroundComponent intensity={0.6}/></div>
            <div className={`container ${classes.page}`}>
                <SeoComponent titleKey='seo_dash_title' descriptionKey='seo_dash_description' path={Routes.dashboard}/>
                <header className={classes.head}>
                    <p className={classes.eyebrow}>{translate('dash_eyebrow')}</p>
                    <h1>{translate('dash_title')}</h1>
                    <p className={classes.muted}>{translate('dash_intro')}</p>
                </header>

                {!input ? (
                    <div className={classes.empty}>
                        <p className={classes.muted}>{translate('today_no_chart')}</p>
                        <Link to={Routes.natalChart}><Button type='primary'>{translate('hero_cta')}</Button></Link>
                    </div>
                ) : (
                    <div className={classes.body}>
                        {options.length > 1 ? (
                            <Select className={classes.select} value={choice} options={options} onChange={onChoice} aria-label={translate('today_choose_chart')}/>
                        ) : null}

                        <div className={classes.grid}>
                            <article className={classes.card}>
                                <p className={classes.label}>{translate('dash_chart')}</p>
                                {!c ? <LoaderComponent/> : (
                                    <ul className={classes.plain}>
                                        {big3.map((b) => (
                                            <li key={b.id}>
                                                <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[b.id])}</span> {name(b.id)}:{' '}
                                                <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[b.sign ?? ''])}</span> <strong>{sign(b.sign)}</strong>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <Link to={Routes.natalChart} className={classes.more}>{translate('dash_open_chart')} →</Link>
                            </article>

                            <article className={classes.card}>
                                <p className={classes.label}>{translate('dash_themes')}</p>
                                {!c ? <LoaderComponent/> : themes.length ? (
                                    <ol className={classes.plain}>
                                        {themes.map((t) => <li key={t.theme}><strong>{themeTexts[String(t.theme)]?.name}</strong></li>)}
                                    </ol>
                                ) : <p className={classes.muted}>{translate('th_none')}</p>}
                                <p className={classes.muted}>{translate('dash_themes_hint')}</p>
                                <Link to={Routes.natalChart} className={classes.more}>{translate('dash_open_deep')} →</Link>
                            </article>

                            <article className={classes.card}>
                                <p className={classes.label}>{translate('dash_year', {year})}</p>
                                {!y ? <LoaderComponent/> : (
                                    <ul className={classes.plain}>
                                        {profection ? <li>{translate('dash_year_theme', {house: house(profection.house)})}</li> : null}
                                        {months.length ? <li>{translate('dash_year_months', {months: months.map((m) => translate(`month_${m}` as ITranslationKey)).join(', ')})}</li> : null}
                                        {heavy.map((e) => (
                                            <li key={`${e.transit}-${e.natal}-${e.aspect}`}>
                                                {formatLocal(e.at, false)}: {name(e.transit)} {content.aspects[e.aspect as keyof typeof content.aspects]?.name.toLowerCase()} {name(e.natal)}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <Link to={Routes.yearForecast} className={classes.more}>{translate('dash_open_year')} →</Link>
                            </article>

                            <article className={classes.card}>
                                <p className={classes.label}>{translate('dash_week')}</p>
                                {!week.data ? <LoaderComponent/> : events.length ? (
                                    <ul className={classes.plain}>
                                        {events.slice(0, 4).map((e) => (
                                            <li key={`${e.transit}-${e.natal}-${e.aspect}-${e.at}`}>
                                                {formatLocal(e.at, false)}: {name(e.transit)} {content.aspects[e.aspect as keyof typeof content.aspects]?.name.toLowerCase()} {name(e.natal)}
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className={classes.muted}>{translate('up_none', {n: 7})}</p>}
                                <Link to={Routes.today} className={classes.more}>{translate('dash_open_today')} →</Link>
                            </article>
                        </div>

                        <section className={classes.section} aria-labelledby='dash-ask'>
                            <h2 id='dash-ask'>{translate('dash_ask')}</h2>
                            <div className={classes.buttons}>
                                {TOPICS.map((t) => (
                                    <Link key={t} to={`${Routes.questions}?topic=${t}`}><Button size='large'>{translate(`q_ask_${t}` as ITranslationKey)}</Button></Link>
                                ))}
                            </div>
                        </section>

                        <section className={classes.section} aria-labelledby='dash-guide'>
                            <h2 id='dash-guide'>{translate('dash_guide')}</h2>
                            <ul className={classes.guide}>
                                {PAGES.map((p) => (
                                    <li key={p.to}>
                                        <Link to={p.to}><strong>{translate(p.key)}</strong></Link>
                                        <span>{translate(p.hint)}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardComponent;
