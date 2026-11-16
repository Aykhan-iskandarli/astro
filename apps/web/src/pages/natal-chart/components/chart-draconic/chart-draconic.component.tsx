import {useMemo} from 'react';
import {placementText} from '@astra/content';
import {formatOrb, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import {DRACONIC_ORB, draconicContacts, draconicPoints} from 'core/helpers/draconic';
import TermComponent from 'core/shared/term/term.component';
import {useStore} from 'store/store.config';
import useLocalization, {useContent} from 'assets/lang';
import {useChartDraconicStyles} from './chart-draconic.style';
import {IChartDraconic} from './chart-draconic';

const READ = ['sun', 'moon', 'asc'];

// The draconic chart: the same sky turned so that the North Node stands at 0° Aries. It is read as the soul-level
// pattern behind the natal chart. Only positions are shifted; draconic houses are not drawn.
const ChartDraconicComponent = ({chart}: IChartDraconic) => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useChartDraconicStyles();
    const input = useMemo(() => chart.points.concat(chart.angles as never[]).map((p) => ({id: p.id, longitude: p.longitude})), [chart.points, chart.angles]);
    const points = useMemo(() => draconicPoints(input).filter((p) => !(chart.timeUnknown && (p.id === 'asc' || p.id === 'mc'))), [input, chart.timeUnknown]);
    const contacts = useMemo(() => draconicContacts(input).filter((c) => !(chart.timeUnknown && [c.draconic, c.natal].some((x) => x === 'asc' || x === 'mc'))), [input, chart.timeUnknown]);

    const name = (id: string) => (id === 'asc' ? translate('portrait_asc') : id === 'mc' ? content.points.mc?.name ?? 'MC' : content.points[id as keyof typeof content.points]?.name ?? id);
    const sign = (id: string) => content.signs[id as keyof typeof content.signs]?.name ?? id;
    const g = (id: string) => glyph(POINT_GLYPHS[id]);
    const natal = (id: string) => [...chart.points, ...chart.angles].find((p) => p.id === id)?.sign ?? null;

    if (!points.length) return <p className={classes.muted}>{translate('dr_no_node')}</p>;

    return (
        <section className={classes.wrap} aria-labelledby='sec-draconic'>
            <h2 id='sec-draconic' className={classes.title}>{translate('dr_title')}</h2>
            <p className={classes.muted}>{translate('dr_intro')}</p>
            <p className={classes.muted}>{translate('dr_how')}</p>

            <div className={classes.scroll}>
                <table className={classes.table}>
                    <thead>
                        <tr><th>{translate('power_planet')}</th><th>{translate('dr_natal')}</th><th><TermComponent id='draconic'>{translate('dr_draconic')}</TermComponent></th></tr>
                    </thead>
                    <tbody>
                        {points.map((p) => (
                            <tr key={p.id}>
                                <td><span className='glyph' aria-hidden='true'>{g(p.id)}</span> {name(p.id)}</td>
                                <td>{natal(p.id) ? <><span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[natal(p.id)!])}</span> {sign(natal(p.id)!)}</> : '—'}</td>
                                <td><span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[p.sign])}</span> {sign(p.sign)} {Math.floor(p.degree)}°</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={classes.grid}>
                {points.filter((p) => READ.includes(p.id)).map((p) => (
                    <article key={p.id} className={classes.card}>
                        <p className={classes.label}>{translate('dr_reading', {planet: name(p.id)})}</p>
                        <h3><span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[p.sign])}</span> {sign(p.sign)}</h3>
                        <p className={classes.text}>{placementText(locale, p.id, p.sign)}</p>
                    </article>
                ))}
                <article className={classes.card}>
                    <p className={classes.label}>{translate('dr_contacts', {orb: DRACONIC_ORB})}</p>
                    {contacts.length ? (
                        <>
                            <ul className={classes.list}>
                                {contacts.map((c) => (
                                    <li key={`${c.draconic}-${c.natal}`}>
                                        <span className='glyph' aria-hidden='true'>{g(c.draconic)}</span> {translate('dr_contact', {a: name(c.draconic), b: name(c.natal)})} · {formatOrb(c.orb)}
                                    </li>
                                ))}
                            </ul>
                            <p className={classes.text}>{translate('dr_contact_text')}</p>
                        </>
                    ) : <p className={classes.text}>{translate('dr_contacts_none')}</p>}
                </article>
            </div>
            <p className={classes.note}>{translate('dr_note')}</p>
        </section>
    );
};

export default ChartDraconicComponent;
