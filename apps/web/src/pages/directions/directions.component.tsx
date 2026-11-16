import {useCallback, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {Alert, Button, Segmented} from 'antd';
import classNames from 'classnames';
import {aspectPairText, placementText} from '@astra/content';
import {Routes} from 'router/routes';
import {useStore} from 'store/store.config';
import {ASPECT_GLYPHS, aspectTone, formatLocal, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import {byMonth, DIRECTIONS_WINDOW, directionsStart, eventsIn} from 'core/helpers/directions';
import {useBirthSource} from 'core/helpers/use-birth-source';
import BirthSourceComponent from 'core/shared/birth-source/birth-source.component';
import SeoComponent from 'core/shared/seo/seo.component';
import LoaderComponent from 'core/shared/loader/loader.component';
import CosmicBackgroundComponent from 'core/shared/cosmic-background/cosmic-background.component';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {useGetDirections} from 'pages/natal-chart/actions/natal-chart.query';
import AspectReadingComponent from 'pages/natal-chart/components/aspect-reading/aspect-reading.component';
import {useDirectionsStyles} from './directions.style';

const MIN_YEAR = 1801;
const MAX_YEAR = 2960;
type Kind = 'all' | 'solarArc' | 'progressed' | 'ingress';

interface IRow {
    key: string;
    at: string;
    age: number;
    kind: Exclude<Kind, 'all'>;
    from: string;
    to: string | null;
    aspect: string | null;
    sign: string | null;
    retrograde: boolean;
}

// Solar Arc and secondary progressions on a timeline: the exact dates when a directed or progressed point touches a
// natal one, and when a progressed planet enters a new sign. Dates come from the engine; the texts are the pair readings.
function DirectionsComponent() {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useDirectionsStyles();
    const source = useBirthSource();
    const {input, chartInput} = source;
    const [year, setYear] = useState(() => new Date().getFullYear());
    const [kind, setKind] = useState<Kind>('all');

    const birthYear = input ? Number(input.date.slice(0, 4)) : null;
    const {data, isFetching, isError} = useGetDirections(input, directionsStart(year), DIRECTIONS_WINDOW);

    const handlePrev = useCallback(() => setYear((y) => Math.max(MIN_YEAR, y - 1)), []);
    const handleNext = useCallback(() => setYear((y) => Math.min(MAX_YEAR, y + 1)), []);
    const handleKind = useCallback((v: string | number) => setKind(v as Kind), []);

    const name = (id: string) => content.points[id as keyof typeof content.points]?.name
        ?? (id === 'asc' ? content.houses['1']?.name : id === 'mc' ? 'MC' : id);
    const sign = (id: string) => content.signs[id as keyof typeof content.signs]?.name ?? id;
    const month = (m: number) => translate(`month_${m + 1}` as ITranslationKey);

    const rows = useMemo<IRow[]>(() => {
        if (!data) return [];
        const all: IRow[] = [
            ...data.solarArc.map((h) => ({key: `sa-${h.directed}-${h.natal}-${h.aspect}`, at: h.at, age: h.age, kind: 'solarArc' as const, from: h.directed, to: h.natal, aspect: h.aspect, sign: null, retrograde: false})),
            ...data.progressed.map((h) => ({key: `pr-${h.progressed}-${h.natal}-${h.aspect}-${h.at}`, at: h.at, age: h.age, kind: 'progressed' as const, from: h.progressed, to: h.natal, aspect: h.aspect, sign: null, retrograde: h.retrograde})),
            ...data.ingresses.map((h) => ({key: `in-${h.progressed}-${h.sign}`, at: h.at, age: h.age, kind: 'ingress' as const, from: h.progressed, to: null, aspect: null, sign: h.sign, retrograde: h.retrograde})),
        ];
        return eventsIn(all, year).filter((r) => kind === 'all' || r.kind === kind);
    }, [data, year, kind]);
    const months = useMemo(() => byMonth(rows), [rows]);

    const options = useMemo(() => (['all', 'solarArc', 'progressed', 'ingress'] as Kind[])
        .map((k) => ({value: k, label: translate(`dir_kind_${k}` as ITranslationKey)})), [translate]);

    const card = (r: IRow) => (
        <li key={r.key} className={classes.card}>
            <p className={classes.label}>{translate(`dir_kind_${r.kind}` as ITranslationKey)}</p>
            {r.kind === 'ingress' ? (
                <>
                    <h4>
                        <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[r.from])}</span> {translate('dir_enters', {planet: name(r.from)})}{' '}
                        <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[r.sign!])}</span> {sign(r.sign!)}
                    </h4>
                    <p className={classes.dates}>{formatLocal(r.at, false)} · {translate('dir_age', {age: Math.floor(r.age)})}{r.retrograde ? ` · ${translate('retrograde')}` : ''}</p>
                    <p className={classes.text}>{translate(r.from === 'moon' ? 'dir_ingress_moon' : 'dir_ingress_other', {planet: name(r.from), sign: sign(r.sign!)})}</p>
                    <p className={classes.text}>{placementText(locale, r.from, r.sign!)}</p>
                </>
            ) : (
                <>
                    <h4>
                        <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[r.from])}</span>
                        {` ${name(r.from)} `}
                        <span className={classNames('glyph', classes[aspectTone(r.aspect!)])} aria-hidden='true'>{glyph(ASPECT_GLYPHS[r.aspect!])}</span>
                        {` ${content.aspects[r.aspect as keyof typeof content.aspects]?.name.toLowerCase()} `}
                        <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[r.to!])}</span>
                        {` ${name(r.to!)}`}
                    </h4>
                    <p className={classes.dates}>{formatLocal(r.at, false)} · {translate('dir_age', {age: Math.floor(r.age)})}{r.retrograde ? ` · ${translate('retrograde')}` : ''}</p>
                    <p className={classes.muted}>{translate(r.kind === 'solarArc' ? 'dir_solar_how' : 'dir_prog_how', {a: name(r.from), b: name(r.to!)})}</p>
                    <p className={classes.text}>{aspectPairText(locale, r.from, r.to!, r.aspect!)}</p>
                    <AspectReadingComponent p1={r.from} p2={r.to!} type={r.aspect!}/>
                </>
            )}
        </li>
    );

    return (
        <div className={classes.stage}>
            <div className={classes.backdrop} aria-hidden='true'><CosmicBackgroundComponent intensity={0.6}/></div>
            <div className={`container ${classes.page}`}>
                <SeoComponent titleKey='seo_directions_title' descriptionKey='seo_directions_description' path={Routes.directions}/>
                <header className={classes.head}>
                    <p className={classes.eyebrow}>{translate('dir_eyebrow')}</p>
                    <h1>{translate('dir_title', {year})}</h1>
                    <p className={classes.muted}>{translate('dir_intro')}</p>
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
                        <p className={classes.muted}>{translate('dir_need_date')}</p>
                        {chartInput ? null : <Link to={Routes.natalChart}><Button>{translate('hero_cta')}</Button></Link>}
                    </div>
                ) : null}
                {isError ? <Alert type='error' showIcon title={translate('dir_error')}/> : null}
                {input && !data && isFetching ? <LoaderComponent/> : null}

                {input && data ? (
                    <div className={classNames(classes.body, {[classes.busy]: isFetching})}>
                        {birthYear ? <p className={classes.age}>{translate('tr_age_in_year', {year, age: year - birthYear})}</p> : null}
                        {data.timeUnknown ? <Alert type='info' showIcon title={translate('dir_date_only_note')}/> : null}
                        <Segmented value={kind} onChange={handleKind} options={options} size='large'/>
                        {months.length ? months.map((m) => (
                            <section key={m.month} className={classes.section} aria-labelledby={`dir-m-${m.month}`}>
                                <h2 id={`dir-m-${m.month}`}>{month(m.month)}</h2>
                                <ul className={classes.list}>{m.items.map(card)}</ul>
                            </section>
                        )) : <p className={classes.muted}>{translate('dir_none')}</p>}
                        <p className={classes.note}>{translate('dir_note')}</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default DirectionsComponent;
