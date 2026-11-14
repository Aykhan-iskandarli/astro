import {useCallback, useMemo, useState} from 'react';
import {Alert, Segmented} from 'antd';
import classNames from 'classnames';
import {formatLocal, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import {useStore} from 'store/store.config';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization, {useContent} from 'assets/lang';
import {useGetLifeline} from '../../actions/natal-chart.query';
import {SegmentModel} from '../../models/forecast-year.model';
import {useLifelineStyles} from './lifeline.style';

const PLANETS = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const SPANS = [10, 15, 25];
const ELEMENT_CLASS = ['fire', 'earth', 'air', 'water'] as const; // house 1 fire, 2 earth, 3 air, 4 water, 5 fire ...

const ms = (iso: string | null) => (iso ? new Date(iso).getTime() : 0);

// The years each slow planet spends in each natal house: one bar per planet, a segment per house.
const LifelineComponent = () => {
    const translate = useLocalization();
    const content = useContent();
    const birthInput = useStore('birthInput');
    const classes = useLifelineStyles();
    const [years, setYears] = useState(15);
    const [start] = useState(() => new Date().toLocaleDateString('en-CA'));
    const [selected, setSelected] = useState<string>('saturn:0');
    const {data, isFetching, isError} = useGetLifeline(birthInput, start, years);

    const handleYears = useCallback((v: string | number) => {
        setYears(Number(v));
        setSelected('saturn:0');
    }, []);
    const handleSelect = useCallback((e: React.SyntheticEvent<HTMLElement>) => {
        setSelected(e.currentTarget.dataset.key ?? 'saturn:0');
    }, []);

    const name = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;
    const sign = (id: string | null) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : '');
    const house = (n: number | null) => (n ? content.houses[String(n) as keyof typeof content.houses] : null);
    const text = (pid: string, n: number | null) => (n ? (content.lifeline.house as Record<string, Record<string, string>>)[pid]?.[String(n)] : null);

    const span = useMemo(() => (data ? {from: ms(data.start), to: ms(data.end)} : {from: 0, to: 1}), [data]);
    const ticks = useMemo(() => {
        if (!data) return [];
        const first = new Date(span.from).getFullYear() + 1;
        const last = new Date(span.to).getFullYear();
        return Array.from({length: Math.max(0, last - first + 1)}, (_, i) => {
            const y = first + i;
            return {year: y, left: ((new Date(y, 0, 1).getTime() - span.from) / (span.to - span.from)) * 100};
        }).filter((t) => t.left > 2 && t.left < 98);
    }, [data, span]);

    if (!birthInput) return null;
    if (isError) return <Alert type='error' showIcon title={translate('lifeline_error')}/>;
    if (!data) return <LoaderComponent/>;

    const [selPlanet, selIndex] = selected.split(':');
    const selSeg = (data.planets[selPlanet]?.houses ?? data.planets[selPlanet]?.signs)?.[Number(selIndex)] ?? null;
    const selHouse = data.timeUnknown ? null : selSeg?.region ?? null;

    const segLabel = (s: SegmentModel) => (data.timeUnknown ? glyph(SIGN_GLYPHS[s.sign!]) : String(s.region));
    const segClass = (s: SegmentModel) => (data.timeUnknown ? '' : classes[ELEMENT_CLASS[((s.region ?? 1) - 1) % 4]]);

    return (
        <div className={classNames(classes.wrap, {[classes.busy]: isFetching})}>
            <header className={classes.head}>
                <div>
                    <h3>{translate('lifeline_title')}</h3>
                    <p className={classes.muted}>{translate('lifeline_intro')}</p>
                </div>
                <Segmented options={SPANS.map((n) => ({value: n, label: translate('lifeline_years', {n})}))} value={years}
                           onChange={handleYears}/>
            </header>
            {data.timeUnknown ? <Alert type='info' showIcon title={translate('lifeline_no_houses')}/> : null}

            <div className={classes.chart}>
                {PLANETS.map((pid) => {
                    const segs = data.planets[pid]?.houses ?? data.planets[pid]?.signs ?? [];
                    return (
                        <div key={pid} className={classes.row}>
                            <span className={classes.who}>
                                <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[pid])}</span>{name(pid)}
                            </span>
                            <div className={classes.bar} role='group' aria-label={name(pid)}>
                                {segs.map((s, i) => {
                                    const key = `${pid}:${i}`;
                                    const h = house(s.region);
                                    return (
                                        <button key={key} type='button' data-key={key} onClick={handleSelect} onMouseEnter={handleSelect}
                                                onFocus={handleSelect}
                                                className={classNames(classes.seg, segClass(s), {[classes.segOn]: selected === key})}
                                                style={{flexGrow: Math.max(ms(s.end) - ms(s.start), 1)}}
                                                aria-pressed={selected === key}
                                                aria-label={`${name(pid)}: ${data.timeUnknown ? sign(s.sign) : h?.name}, ${formatLocal(s.start, false)} – ${formatLocal(s.end, false)}`}>
                                            <span className={classes.segText}>{segLabel(s)}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
                <div className={classes.axis} aria-hidden='true'>
                    <span className={classes.axisLabel} style={{left: 0}}>{new Date(span.from).getFullYear()}</span>
                    {ticks.map((t) => <span key={t.year} className={classes.axisLabel} style={{left: `${t.left}%`}}>{t.year}</span>)}
                </div>
            </div>

            <section className={classes.card} aria-live='polite'>
                {selSeg ? (
                    <>
                        <h4>
                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[selPlanet])}</span> {name(selPlanet)}
                            {' · '}{data.timeUnknown ? sign(selSeg.sign) : house(selHouse)?.name}
                        </h4>
                        <p className={classes.range}>
                            {selSeg.startClipped ? translate('lifeline_now') : formatLocal(selSeg.start, false)}
                            {' – '}
                            {selSeg.endClipped ? translate('lifeline_after', {year: new Date(span.to).getFullYear()}) : formatLocal(selSeg.end, false)}
                        </p>
                        {selHouse ? (
                            <>
                                <p className={classes.theme}>{house(selHouse)?.theme}</p>
                                <p>{text(selPlanet, selHouse)}</p>
                            </>
                        ) : null}
                    </>
                ) : <p className={classes.muted}>{translate('lifeline_select_hint')}</p>}
            </section>

            <details className={classes.details}>
                <summary>{translate('lifeline_signs')}</summary>
                <ul className={classes.signs}>
                    {PLANETS.map((pid) => (
                        <li key={pid}>
                            <strong><span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[pid])}</span> {name(pid)}</strong>
                            {': '}
                            {(data.planets[pid]?.signs ?? []).map((s, i) => (
                                <span key={`${s.sign}-${s.start}`}>
                                    {i ? ' → ' : ''}
                                    <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[s.sign!])}</span>{` ${sign(s.sign)} `}
                                    <span className={classes.muted}>({s.startClipped ? translate('lifeline_now') : formatLocal(s.start, false)})</span>
                                </span>
                            ))}
                        </li>
                    ))}
                </ul>
            </details>
        </div>
    );
};

export default LifelineComponent;
