import {useCallback, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {Alert, Button} from 'antd';
import classNames from 'classnames';
import {aspectPairText} from '@astra/content';
import {Routes} from 'router/routes';
import {useStore} from 'store/store.config';
import {ASPECT_GLYPHS, aspectTone, formatDegree, formatLocal, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import {activeIn, byImportance, cycleKey, EpisodeGroup, groupOf, WINDOW_YEARS, windowStart} from 'core/helpers/transformations';
import {useBirthSource} from 'core/helpers/use-birth-source';
import BirthSourceComponent from 'core/shared/birth-source/birth-source.component';
import SeoComponent from 'core/shared/seo/seo.component';
import LoaderComponent from 'core/shared/loader/loader.component';
import CosmicBackgroundComponent from 'core/shared/cosmic-background/cosmic-background.component';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {useGetTransformations} from 'pages/natal-chart/actions/natal-chart.query';
import {IEpisode} from 'pages/natal-chart/models/transformations.model';
import {useTransformationsStyles} from './transformations.style';

const MIN_YEAR = 1801;
const MAX_YEAR = 2960;
const GROUPS: EpisodeGroup[] = ['cycle', 'major', 'other'];

// What a birth date points to in a chosen year: the long transits of Jupiter-Pluto to the natal planets, grouped as
// life cycles, major changes and other contacts. Each contact has a short line and a full reading to expand.
function TransformationsComponent() {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useTransformationsStyles();
    const source = useBirthSource();
    const {input, chartInput} = source;
    const [year, setYear] = useState(() => new Date().getFullYear());

    const birthYear = input ? Number(input.date.slice(0, 4)) : null;

    const {data, isFetching, isError} = useGetTransformations(input, windowStart(year), WINDOW_YEARS);

    const handlePrev = useCallback(() => {
        setYear((y) => Math.max(MIN_YEAR, y - 1));
    }, []);
    const handleNext = useCallback(() => {
        setYear((y) => Math.min(MAX_YEAR, y + 1));
    }, []);
    const handlePickYear = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        setYear(Number(e.currentTarget.dataset.year));
    }, []);

    const name = (id: string) => content.points[id as keyof typeof content.points]?.name
        ?? (id === 'asc' ? content.houses['1']?.name : id === 'mc' ? 'MC' : id);
    const sign = (id: string) => content.signs[id as keyof typeof content.signs]?.name ?? id;
    const tr = content.transformations as {
        planet: Record<string, string>; aspect: Record<string, string>; target: Record<string, string>;
        cycle: Record<string, {name: string; text: string}>;
    };

    const inYear = useMemo(() => (data?.episodes ?? []).filter((e) => activeIn(e, year)).sort(byImportance), [data, year]);
    const grouped = useMemo(() => GROUPS.map((g) => ({group: g, items: inYear.filter((e) => groupOf(e) === g)})), [inYear]);
    const strip = useMemo(() => Array.from({length: 9}, (_, i) => year - 2 + i).filter((y) => y >= MIN_YEAR && y <= MAX_YEAR).map((y) => ({
        year: y,
        count: (data?.episodes ?? []).filter((e) => activeIn(e, y) && groupOf(e) !== 'other').length,
        cycle: (data?.episodes ?? []).some((e) => activeIn(e, y) && groupOf(e) === 'cycle'),
    })), [data, year]);

    const episodeCard = (e: IEpisode) => {
        const key = cycleKey(e);
        const cycle = key ? tr.cycle[key] : undefined;
        const pair = aspectPairText(locale, e.transit, e.natal, e.aspect);
        const short = pair ?? `${tr.aspect[e.aspect]?.split('. ')[0]}.`;
        const sameAge = Math.floor(e.ageAtStart) === Math.floor(e.ageAtEnd);
        return (
            <li key={`${e.transit}-${e.natal}-${e.aspect}-${e.start}`} className={classes.card}>
                <h4>
                    <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[e.transit])}</span>
                    {` ${name(e.transit)} `}
                    <span className={classNames('glyph', classes[aspectTone(e.aspect)])} aria-hidden='true'>{glyph(ASPECT_GLYPHS[e.aspect])}</span>
                    {` ${content.aspects[e.aspect as keyof typeof content.aspects]?.name.toLowerCase()} `}
                    <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[e.natal])}</span>
                    {` ${name(e.natal)}`}
                </h4>
                {cycle ? <p className={classes.cycleName}>{cycle.name}</p> : null}
                <p className={classes.dates}>
                    {translate('tr_when', {from: formatLocal(e.start, false), to: formatLocal(e.end, false)})}
                    {' · '}
                    {sameAge
                        ? translate('tr_age_single', {age: Math.floor(e.ageAtStart)})
                        : translate('tr_age_range', {from: Math.floor(e.ageAtStart), to: Math.floor(e.ageAtEnd)})}
                </p>
                <p className={classes.muted}>
                    {translate('tr_natal_at', {
                        name: name(e.natal),
                        sign: `${glyph(SIGN_GLYPHS[e.natalSign])} ${sign(e.natalSign)}`,
                        degree: formatDegree(e.natalDegree, e.natalMinute),
                    })}
                </p>
                <p className={classes.text}>{short}</p>
                <details className={classes.full}>
                    <summary>{translate('tr_read_full')}</summary>
                    {cycle ? (
                        <section>
                            <h5>{translate('tr_part_cycle')}: {cycle.name}</h5>
                            <p>{cycle.text}</p>
                        </section>
                    ) : null}
                    <section>
                        <h5>{translate('tr_part_planet')}: {name(e.transit)}</h5>
                        <p>{tr.planet[e.transit]}</p>
                    </section>
                    <section>
                        <h5>{translate('tr_part_aspect')}: {content.aspects[e.aspect as keyof typeof content.aspects]?.name}</h5>
                        <p>{tr.aspect[e.aspect]}</p>
                    </section>
                    <section>
                        <h5>{translate('tr_part_target')}: {name(e.natal)}</h5>
                        <p>{tr.target[e.natal]}</p>
                    </section>
                    <section>
                        <h5>{translate('tr_passes')}</h5>
                        <ul className={classes.passes}>
                            {e.passes.map((p) => (
                                <li key={p.at}>
                                    <time dateTime={p.at}>{formatLocal(p.at, false)}</time>
                                    {' · '}{p.retrograde ? translate('tr_pass_retro') : translate('tr_pass_direct')}
                                </li>
                            ))}
                        </ul>
                    </section>
                </details>
            </li>
        );
    };

    return (
        <div className={classes.stage}>
            <div className={classes.backdrop} aria-hidden='true'><CosmicBackgroundComponent intensity={0.6}/></div>
            <div className={`container ${classes.page}`}>
                <SeoComponent titleKey='seo_transform_title' descriptionKey='seo_transform_description' path={Routes.transformations}/>
                <header className={classes.head}>
                    <p className={classes.eyebrow}>{translate('tr_eyebrow')}</p>
                    <h1>{translate('tr_title', {year})}</h1>
                    <p className={classes.muted}>{translate('tr_intro')}</p>
                </header>

                <div className={classes.toolbar}>
                    <BirthSourceComponent chartInput={chartInput} mode={source.mode} onMode={source.onMode} birth={source.birth}
                                          onBirth={source.onBirth} showDate={source.showDate}/>
                    <div className={classes.yearSwitch}>
                        <Button onClick={handlePrev} aria-label={translate('calendar_prev')} disabled={year <= MIN_YEAR}>‹</Button>
                        <strong aria-live='polite'>{year}</strong>
                        <Button onClick={handleNext} aria-label={translate('calendar_next')} disabled={year >= MAX_YEAR}>›</Button>
                    </div>
                </div>

                {!input ? (
                    <div className={classes.empty}>
                        <p className={classes.muted}>{translate('tr_need_date')}</p>
                        {chartInput ? null : <Link to={Routes.natalChart}><Button>{translate('hero_cta')}</Button></Link>}
                    </div>
                ) : null}
                {isError ? <Alert type='error' showIcon title={translate('tr_error')}/> : null}
                {input && !data && isFetching ? <LoaderComponent/> : null}

                {input && data ? (
                    <div className={classNames(classes.body, {[classes.busy]: isFetching})}>
                        {birthYear ? <p className={classes.age}>{translate('tr_age_in_year', {year, age: year - birthYear})}</p> : null}
                        {data.timeUnknown ? <Alert type='info' showIcon title={translate('tr_date_only_note')}/> : null}

                        <div className={classes.strip} role='group' aria-label={translate('tr_years_strip')}>
                            {strip.map((s) => (
                                <button key={s.year} type='button' data-year={s.year} onClick={handlePickYear} aria-pressed={s.year === year}
                                        className={classNames(classes.stripYear, {[classes.stripOn]: s.year === year})}>
                                    <strong>{s.year}</strong>
                                    <span>{translate('tr_year_count', {n: s.count})}</span>
                                    {s.cycle ? <span className={classes.cycleDot}>★ {translate('tr_cycle_year')}</span> : null}
                                </button>
                            ))}
                        </div>

                        {grouped.map(({group, items}) => (
                            <section key={group} className={classes.section} aria-labelledby={`tr-${group}`}>
                                <h2 id={`tr-${group}`}>{translate(`tr_group_${group}` as ITranslationKey)}</h2>
                                <p className={classes.muted}>{translate(`tr_group_${group}_intro` as ITranslationKey)}</p>
                                {items.length ? <ul className={classes.list}>{items.map(episodeCard)}</ul> : <p className={classes.muted}>{translate('tr_none')}</p>}
                            </section>
                        ))}
                        <p className={classes.note}>{translate('tr_note')}</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default TransformationsComponent;
