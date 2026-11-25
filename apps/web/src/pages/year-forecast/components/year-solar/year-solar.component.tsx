import {formatDegree, formatLocal, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import useLocalization, {useContent} from 'assets/lang';
import {useYearPartsStyles} from '../year-parts.style';
import {IYearSolar} from './year-solar';

const PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

// The solar return chart read in full: the Ascendant, then every planet of the return chart with its sign and the natal
// house it falls in. The return chart is set for the moment the Sun comes back to its natal place; it colours the year.
const YearSolarComponent = ({data}: IYearSolar) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useYearPartsStyles();
    const solar = content.solarReturn as {house: Record<string, string>; asc: Record<string, string>};
    const inHouse = content.inHouse as unknown as Record<string, Record<string, string>>;
    const name = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;
    const sign = (id: string | null) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : '');
    const house = (n: number | null) => (n ? content.houses[String(n) as keyof typeof content.houses] : null);
    const rows = PLANETS.flatMap((id) => {
        const p = data.solar.points.find((x) => x.id === id);
        return p ? [{id, p}] : [];
    });
    const asc = data.solar.asc;

    return (
        <section className={classes.wrap} aria-labelledby='sec-solar'>
            <h2 id='sec-solar' className={classes.title}>{translate('ys_title')}</h2>
            <p className={classes.muted}>{translate('ys_intro', {at: formatLocal(data.solar.at)})}</p>
            <ul className={classes.list}>
                {asc?.sign ? (
                    <li className={classes.card}>
                        <p className={classes.label}>{translate('solar_return_asc')}</p>
                        <h3><span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[asc.sign])}</span> {sign(asc.sign)} {formatDegree(asc.degree, asc.minute)}</h3>
                        <p className={classes.text}>{solar.asc[asc.sign]}</p>
                    </li>
                ) : null}
                {rows.map(({id, p}) => {
                    const h = house(p.house);
                    return (
                        <li key={id} className={classes.card}>
                            <p className={classes.label}>{name(id)}</p>
                            <h3>
                                <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[id])}</span>
                                {' '}<span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[p.sign!])}</span>
                                {` ${sign(p.sign)} ${formatDegree(p.degree, p.minute)}`}{h ? ` · ${h.name}` : ''}
                            </h3>
                            {h ? <p className={classes.soft}>{h.theme}</p> : null}
                            {id === 'sun' && p.house ? <p className={classes.text}>{solar.house[String(p.house)]}</p> : null}
                            {id !== 'sun' && p.house && inHouse[id]?.[String(p.house)] ? <p className={classes.text}>{inHouse[id][String(p.house)]}</p> : null}
                        </li>
                    );
                })}
            </ul>
            <p className={classes.note}>{translate('ys_note')}</p>
        </section>
    );
};

export default YearSolarComponent;
