import {useCallback, useEffect, useMemo, useState} from 'react';
import {Alert, AutoComplete} from 'antd';
import classNames from 'classnames';
import {geoEquirectangular, geoGraticule10, geoPath} from 'd3-geo';
import type {FeatureCollection, MultiPolygon} from 'geojson';
import {glyph, POINT_GLYPHS} from 'core/helpers/astro';
import {useStore} from 'store/store.config';
import {useDebouncedValue} from 'core/helpers/use-debounced-value';
import LoaderComponent from 'core/shared/loader/loader.component';
import TermComponent from 'core/shared/term/term.component';
import useLocalization, {useContent} from 'assets/lang';
import {useGetAstrocartography, useGetPlaces} from '../../actions/natal-chart.query';
import {IAcgProbe} from '../../actions/natal-chart.service';
import {AcgLineModel} from '../../models/astrocartography.model';
import {ACG_COLORS, ANGLE_DASH} from './astrocartography.helpers';
import {useAstrocartographyPanelStyles} from './astrocartography-panel.style';

const W = 960;
const H = 480;
const PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const DEFAULT_ON = ['sun', 'moon', 'venus', 'mars', 'jupiter', 'saturn'];
const projection = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2]);
const path = geoPath(projection);

const toD = (seg: [number, number][]) => seg.map((p, i) => {
    const [x, y] = projection(p)!;
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
}).join('');

// Label position, staggered by planet so neighbouring labels do not collide: MC/IC near the top/bottom of
// the map, horizon lines at a planet-specific latitude along their longest segment.
const labelAt = (line: AcgLineModel): [number, number] | null => {
    const seg = [...line.segments].sort((a, b) => b.length - a.length)[0];
    if (!seg) return null;
    const i = PLANETS.indexOf(line.planet!);
    if (line.angle === 'mc') return projection([seg[0][0], 70 - (i % 4) * 5]) as [number, number];
    if (line.angle === 'ic') return projection([seg[0][0], -56 - (i % 4) * 5]) as [number, number];
    const target = 48 - i * 9 - (line.angle === 'dsc' ? 4 : 0);
    const nearest = seg.reduce((best, p) => (Math.abs(p[1] - target) < Math.abs(best[1] - target) ? p : best), seg[0]);
    return projection(nearest) as [number, number];
};

const AstrocartographyPanelComponent = () => {
    const translate = useLocalization();
    const content = useContent();
    const birthInput = useStore('birthInput');
    const classes = useAstrocartographyPanelStyles();
    const [land, setLand] = useState<string | null>(null);
    const [planets, setPlanets] = useState<string[]>(DEFAULT_ON);
    const [active, setActive] = useState<string | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [placeQuery, setPlaceQuery] = useState('');
    const [probe, setProbe] = useState<IAcgProbe | null>(null);

    const debounced = useDebouncedValue(placeQuery, 250);
    const {data: places} = useGetPlaces(debounced);
    const {data, isFetching, isError} = useGetAstrocartography(birthInput, probe);

    // Coastlines are loaded only when this tab is opened (separate chunk)
    useEffect(() => {
        let alive = true;
        Promise.all([import('world-atlas/land-110m.json'), import('topojson-client')]).then(([atlas, topo]) => {
            const topology = (atlas as any).default ?? atlas;
            const geo = topo.feature(topology, topology.objects.land) as unknown as FeatureCollection<MultiPolygon>;
            if (alive) setLand(path(geo) ?? null);
        });
        return () => {
            alive = false;
        };
    }, []);

    const name = useCallback((id: string | null) => (id ? content.points[id as keyof typeof content.points]?.name ?? id : ''), [content]);
    const angleName = useCallback((a: string | null) => translate(`acg_${a}` as Parameters<typeof translate>[0]), [translate]);

    const handleToggle = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const id = e.currentTarget.dataset.id!;
        setPlanets((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
    }, []);
    const handleEnter = useCallback((e: React.SyntheticEvent<SVGElement>) => {
        setActive(e.currentTarget.dataset.key ?? null);
    }, []);
    const handleLeave = useCallback(() => {
        setActive(null);
    }, []);
    const handleClick = useCallback((e: React.SyntheticEvent<SVGElement | HTMLElement>) => {
        setSelected(e.currentTarget.dataset.key ?? null);
    }, []);
    const handleKey = useCallback((e: React.KeyboardEvent<SVGElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelected(e.currentTarget.dataset.key ?? null);
        }
    }, []);
    const handlePlaceSearch = useCallback((v: string) => {
        setPlaceQuery(v);
    }, []);
    const handlePlaceSelect = useCallback((v: string) => {
        const p = places?.find((x) => String(x.id) === v);
        if (p) {
            setProbe({latitude: p.latitude!, longitude: p.longitude!, timezone: p.timezone!, name: p.name ?? ''});
            setPlaceQuery(p.name ?? '');
        }
    }, [places]);

    const placeOptions = useMemo(() => (places ?? []).map((p) => ({
        value: String(p.id), label: [p.name, p.admin1, p.country].filter(Boolean).join(', '),
    })), [places]);

    const visible = useMemo(() => (data?.lines ?? []).filter((l) => planets.includes(l.planet!)), [data, planets]);
    const focus = active ?? selected;
    const [fp, fa] = focus ? focus.split('-') : [null, null];
    const graticule = useMemo(() => path(geoGraticule10()) ?? '', []);

    if (!birthInput?.time) return <Alert type='info' showIcon title={translate('acg_needs_time')}/>;
    if (isError) return <Alert type='error' showIcon title={translate('acg_error')}/>;
    if (!data) return <LoaderComponent/>;

    const birth = data.birthplace ? projection([data.birthplace.longitude, data.birthplace.latitude]) : null;
    const probePt = probe ? projection([probe.longitude, probe.latitude]) : null;

    return (
        <div className={classNames(classes.wrap, {[classes.busy]: isFetching})}>
            <header className={classes.head}>
                <div>
                    <h2><TermComponent id='astrocartography'>{translate('acg_title')}</TermComponent></h2>
                    <p className={classes.muted}>{translate('acg_intro')}</p>
                </div>
            </header>

            <div className={classes.toggles} role='group' aria-label={translate('acg_planets')}>
                {PLANETS.map((p) => (
                    <button key={p} type='button' data-id={p} aria-pressed={planets.includes(p)} onClick={handleToggle}
                            className={classes.toggle} style={{'--c': ACG_COLORS[p]} as React.CSSProperties}>
                        <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[p])}</span>{name(p)}
                    </button>
                ))}
            </div>

            <div className={classes.legend} aria-hidden='true'>
                {(['mc', 'ic', 'asc', 'dsc'] as const).map((a) => (
                    <span key={a}><svg width='28' height='8'><line x1='0' y1='4' x2='28' y2='4' stroke='currentColor' strokeWidth='2' strokeDasharray={ANGLE_DASH[a]}/></svg>{angleName(a)}</span>
                ))}
            </div>

            <div className={classes.mapScroll}>
                <svg className={classes.map} viewBox={`0 0 ${W} ${H}`} role='img' aria-label={translate('acg_map_label')}>
                    <rect width={W} height={H} className={classes.ocean}/>
                    <path d={graticule} className={classes.graticule}/>
                    {land ? <path d={land} className={classes.land}/> : null}
                    {visible.map((l) => {
                        const key = `${l.planet}-${l.angle}`;
                        const d = l.segments.map(toD).join('');
                        const dim = focus && focus !== key;
                        return (
                            <g key={key} className={classNames(classes.line, {[classes.dim]: dim})} data-key={key} tabIndex={0}
                               role='button' aria-label={`${name(l.planet)} · ${angleName(l.angle)}`}
                               onMouseEnter={handleEnter} onMouseLeave={handleLeave} onFocus={handleEnter} onBlur={handleLeave}
                               onClick={handleClick} onKeyDown={handleKey}>
                                <path d={d} className={classes.hit}/>
                                <path d={d} stroke={ACG_COLORS[l.planet!]} strokeDasharray={ANGLE_DASH[l.angle!]}
                                      className={classNames(classes.stroke, {[classes.strokeActive]: focus === key})}/>
                            </g>
                        );
                    })}
                    {visible.map((l) => {
                        const at = labelAt(l);
                        return at ? (
                            <text key={`t-${l.planet}-${l.angle}`} x={at[0]} y={at[1]} className={`glyph ${classes.label}`}
                                  fill={ACG_COLORS[l.planet!]} aria-hidden='true'>
                                {glyph(POINT_GLYPHS[l.planet!])}{l.angle!.toUpperCase()}
                            </text>
                        ) : null;
                    })}
                    {birth ? <circle cx={birth[0]} cy={birth[1]} r={4} className={classes.birth}><title>{translate('acg_birthplace')}</title></circle> : null}
                    {probePt ? <circle cx={probePt[0]} cy={probePt[1]} r={5} className={classes.probe}><title>{probe?.name}</title></circle> : null}
                </svg>
            </div>

            <div className={classes.grid}>
                <section className={classes.card} aria-live='polite'>
                    {fp && fa ? (
                        <>
                            <h3 style={{color: ACG_COLORS[fp]}}>
                                <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[fp])}</span> {name(fp)} · {angleName(fa)}
                            </h3>
                            <p>{(content.acg as Record<string, Record<string, string>>)[fp]?.[fa]}</p>
                        </>
                    ) : <p className={classes.muted}>{translate('acg_hint')}</p>}
                </section>

                <section className={classes.card}>
                    <h3>{translate('acg_place_title')}</h3>
                    <AutoComplete options={placeOptions} value={placeQuery} onSearch={handlePlaceSearch} onSelect={handlePlaceSelect}
                                  placeholder={translate('field_place_placeholder')} className={classes.place}
                                  aria-label={translate('acg_place_title')}/>
                    {data.near ? (
                        data.near.length ? (
                            <ul className={classes.near}>
                                {data.near.map((n) => (
                                    <li key={`${n.planet}-${n.angle}`}>
                                        <button type='button' data-key={`${n.planet}-${n.angle}`} onClick={handleClick} className={classes.nearBtn}>
                                            <span style={{color: ACG_COLORS[n.planet!]}} className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[n.planet!])}</span>
                                            <span>{name(n.planet)} · {angleName(n.angle)}</span>
                                            <span className={classes.muted}>{translate('acg_km', {km: n.distanceKm})}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className={classes.muted}>{translate('acg_none_near')}</p>
                    ) : <p className={classes.muted}>{translate('acg_place_hint')}</p>}
                </section>
            </div>
            <p className={classes.muted}>{translate('acg_note')}</p>
        </div>
    );
};

export default AstrocartographyPanelComponent;
