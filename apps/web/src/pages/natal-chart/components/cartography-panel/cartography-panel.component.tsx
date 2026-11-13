import {useMemo, useState} from 'react';
import {Checkbox} from 'antd';
import {useStore} from 'store/store.config';
import {glyph, POINT_GLYPHS} from 'core/helpers/astro';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization, {useContent} from 'assets/lang';
import {WORLD_LAND_PATH} from 'assets/data/world-land';
import {useGetCartography} from '../../actions/natal-chart.query';
import {useExtrasStyles} from '../extras-ui/extras.style';

const PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const COLORS: Record<string, string> = {
    sun: '#F2C14E', moon: '#C9D3E6', mercury: '#9CC9FF', venus: '#F49AC2', mars: '#F2725B',
    jupiter: '#B8A1FF', saturn: '#C8A96B', uranus: '#6FE3D6', neptune: '#6F8BFF', pluto: '#C77DFF',
};
const DASH: Record<string, string | undefined> = {mc: undefined, ic: '1.5 1.5', asc: undefined, dsc: '1.5 1.5'};
const x = (lon: number) => lon + 180;
const y = (lat: number) => 90 - lat;

// Split a line where it crosses the antimeridian so it is not drawn across the whole map
const toPaths = (points: [number, number][]) => {
    const parts: [number, number][][] = [[]];
    points.forEach((p, i) => {
        if (i && Math.abs(p[0] - points[i - 1][0]) > 180) parts.push([]);
        parts[parts.length - 1].push(p);
    });
    return parts.filter((p) => p.length > 1).map((p) => p.map(([lon, lat], i) => `${i ? 'L' : 'M'}${x(lon).toFixed(2)} ${y(lat).toFixed(2)}`).join(''));
};

// Astrocartography: where each planet was on the MC, IC, Ascendant or Descendant at birth, on a world map.
const CartographyPanelComponent = () => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useExtrasStyles();
    const birthInput = useStore('birthInput');
    const {data} = useGetCartography(birthInput);
    const [shown, setShown] = useState<string[]>(['sun', 'moon', 'venus', 'mars', 'jupiter', 'saturn']);
    const name = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;
    const options = useMemo(() => PLANETS.map((p) => ({
        value: p,
        label: (
            <span style={{color: COLORS[p]}}>
                <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[p])}</span> {content.points[p as keyof typeof content.points]?.name ?? p}
            </span>
        ),
    })), [content]);
    const t = content.cartography;

    if (!data) return <LoaderComponent/>;

    return (
        <div className={classes.wrapper}>
            <header className={classes.section}>
                <h2 style={{fontSize: 34}}>{translate('carto_title')}</h2>
                <p className={classes.lead}>{t.intro}</p>
            </header>
            <Checkbox.Group options={options} value={shown} onChange={(v) => setShown(v as string[])}/>
            <svg viewBox='0 0 360 180' role='img' aria-label={translate('carto_title')}
                 style={{width: '100%', height: 'auto', background: '#0B0B1E', borderRadius: 12, border: '1px solid rgba(157,140,255,0.18)'}}>
                {[-60, -30, 0, 30, 60].map((lat) => <line key={lat} x1={0} x2={360} y1={y(lat)} y2={y(lat)} stroke='rgba(157,140,255,0.12)' strokeWidth={0.2}/>)}
                {[-120, -60, 0, 60, 120].map((lon) => <line key={lon} y1={0} y2={180} x1={x(lon)} x2={x(lon)} stroke='rgba(157,140,255,0.12)' strokeWidth={0.2}/>)}
                <path d={WORLD_LAND_PATH} fill='#1C1C38' stroke='#2E2B5F' strokeWidth={0.25}/>
                {data.lines.filter((l) => shown.includes(l.planet)).map((l) => toPaths(l.points).map((d, i) => (
                    <path key={`${l.planet}-${l.type}-${i}`} d={d} fill='none' stroke={COLORS[l.planet]} strokeWidth={0.55}
                          strokeDasharray={DASH[l.type]} opacity={0.95}>
                        <title>{`${name(l.planet)} · ${t.types[l.type].name}`}</title>
                    </path>
                )))}
                {data.birthplace ? (
                    <circle cx={x(data.birthplace.longitude)} cy={y(data.birthplace.latitude)} r={1.6} fill='#fff' stroke='#E2C275' strokeWidth={0.5}>
                        <title>{translate('carto_birthplace')}</title>
                    </circle>
                ) : null}
            </svg>
            <div className={classes.grid}>
                {(['mc', 'ic', 'asc', 'dsc'] as const).map((k) => (
                    <article key={k} className={classes.card}>
                        <p className={classes.title}>{t.types[k].name} <span className={classes.small}>({translate(DASH[k] ? 'carto_dashed' : 'carto_solid')})</span></p>
                        <p className={classes.text}>{t.types[k].meaning}</p>
                    </article>
                ))}
            </div>
            <p className={classes.small}>{translate('carto_note')}</p>
        </div>
    );
};

export default CartographyPanelComponent;
