import {useMemo} from 'react';
import {aspectPairText} from '@astra/content';
import {formatDegree, formatOrb, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import useLocalization, {useContent} from 'assets/lang';
import {useStore} from 'store/store.config';
import {useChartSaturnPlutoStyles} from './chart-saturn-pluto.style';
import {IChartSaturnPluto} from './chart-saturn-pluto';

const PLANETS = ['saturn', 'pluto'] as const;
const OTHERS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'uranus', 'neptune', 'saturn', 'pluto', 'asc', 'mc'];

type IText = {sign: Record<string, string>; house: Record<string, string>; retro: string};

// Saturn (the lesson, the structure) and Pluto (the transformation) in this chart: sign, house, retrograde and the
// major aspects they make. The texts are written for each sign and house; the aspect texts are the pair readings.
const ChartSaturnPlutoComponent = ({chart}: IChartSaturnPluto) => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useChartSaturnPlutoStyles();
    const text = content.saturnPluto as unknown as Record<string, IText>;

    const aspects = useMemo(() => Object.fromEntries(PLANETS.map((id) => [id, chart.aspects
        .filter((a) => a.major && a.type && ((a.p1 === id && a.p2 && OTHERS.includes(a.p2)) || (a.p2 === id && a.p1 && OTHERS.includes(a.p1))))
        .map((a) => ({other: (a.p1 === id ? a.p2 : a.p1)!, type: a.type!, orb: a.orb ?? 0}))
        .sort((x, y) => x.orb - y.orb)])), [chart.aspects]);

    const name = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;
    const sign = (id: string | null) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : '');
    const house = (n: number | null) => (n ? content.houses[String(n) as keyof typeof content.houses]?.name ?? '' : '');
    const g = (id: string) => glyph(POINT_GLYPHS[id]);

    return (
        <section className={classes.wrap} aria-labelledby='sec-sp'>
            <h2 id='sec-sp' className={classes.title}>{translate('sp_title')}</h2>
            <p className={classes.muted}>{translate('sp_intro')}</p>
            <div className={classes.grid}>
                {PLANETS.map((id) => {
                    const p = chart.points.find((x) => x.id === id);
                    if (!p || !p.sign) return null;
                    const t = text[id];
                    const showHouse = !chart.timeUnknown && p.house;
                    return (
                        <article key={id} className={classes.card}>
                            <p className={classes.label}>{translate(`sp_${id}` as 'sp_saturn')}</p>
                            <h3>
                                <span className='glyph' aria-hidden='true'>{g(id)}</span> {name(id)} · <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[p.sign])}</span> {sign(p.sign)}{' '}
                                <span className={classes.fact}>{formatDegree(p.degree, p.minute)}</span>
                            </h3>
                            <p className={classes.fact}>{showHouse ? house(p.house) : translate('sp_house_unknown')}{p.retrograde ? ` · ${translate('retrograde')}` : ''}</p>
                            <p className={classes.text}>{t.sign[p.sign]}</p>
                            {showHouse ? <p className={classes.text}>{t.house[String(p.house)]}</p> : null}
                            {p.retrograde ? <p className={classes.text}>{t.retro}</p> : null}
                            <h4>{translate('sp_aspects')}</h4>
                            {aspects[id].length ? (
                                <ul className={classes.list}>
                                    {aspects[id].map((a) => (
                                        <li key={a.other}>
                                            <strong>{content.aspects[a.type as keyof typeof content.aspects]?.name} {g(a.other)} {name(a.other)}</strong> · {formatOrb(a.orb)}
                                            <br/><span className={classes.text}>{aspectPairText(locale, id, a.other, a.type)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className={classes.text}>{translate('sp_aspects_none')}</p>}
                        </article>
                    );
                })}
            </div>
            <p className={classes.note}>{translate('sp_note')}</p>
        </section>
    );
};

export default ChartSaturnPlutoComponent;
