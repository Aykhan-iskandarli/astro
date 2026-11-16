import {aspectPairText} from '@astra/content';
import {formatOrb, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import LoaderComponent from 'core/shared/loader/loader.component';
import {useStore} from 'store/store.config';
import useLocalization, {useContent} from 'assets/lang';
import {useGetGeneration} from '../../actions/natal-chart.query';
import {useChartGenerationStyles} from './chart-generation.style';
import {IChartGeneration} from './chart-generation';

const OUTER = ['saturn', 'uranus', 'neptune', 'pluto'];
const EDGE_DAYS = 90;
const dmy = (iso: string | null) => (iso ? iso.slice(0, 10).split('-').reverse().join('.') : '');

// The generation: how long each slow planet and the Moon's node stood in the sign they occupy in this chart, so who
// shares the placement, and the contacts between the slow planets that all peers carry. Dates come from the engine
// (first entry to last exit, short retrograde dips included); only the birth date is used.
const ChartGenerationComponent = ({chart}: IChartGeneration) => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const birthInput = useStore('birthInput');
    const classes = useChartGenerationStyles();
    const {data, isError} = useGetGeneration(birthInput);

    if (isError) return <p className={classes.muted}>{translate('gen_error')}</p>;
    if (!data) return <LoaderComponent/>;

    const name = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;
    const sign = (id: string) => content.signs[id as keyof typeof content.signs]?.name ?? id;
    const g = (id: string) => glyph(POINT_GLYPHS[id]);
    const sp = content.saturnPluto as unknown as Record<string, {sign: Record<string, string>}>;
    const gen = content.generation as unknown as Record<string, Record<string, string>>;
    const axis = content.karmic.nodeAxis as Record<string, {past: string; future: string}>;
    const text = (id: string, s: string) => (id === 'northNode' ? axis[s]?.future : id === 'uranus' || id === 'neptune' ? gen[id][s] : sp[id]?.sign[s]);

    const pairs = chart.aspects.filter((a) => a.major && a.type && a.p1 && a.p2 && OUTER.includes(a.p1) && OUTER.includes(a.p2) && a.p1 !== a.p2)
        .sort((a, b) => (a.orb ?? 99) - (b.orb ?? 99));

    return (
        <section className={classes.wrap} aria-labelledby='sec-generation'>
            <h2 id='sec-generation' className={classes.title}>{translate('gen_title')}</h2>
            <p className={classes.muted}>{translate('gen_intro')}</p>
            <div className={classes.grid}>
                {data.planets.map((p) => {
                    const edge = (p.daysFromStart !== null && p.daysFromStart < EDGE_DAYS) || (p.daysToEnd !== null && p.daysToEnd < EDGE_DAYS);
                    return (
                        <article key={p.id} className={classes.card}>
                            <p className={classes.label}>{translate(p.id === 'northNode' ? 'gen_node' : 'gen_planet', {planet: name(p.id)})}</p>
                            <h3>
                                <span className='glyph' aria-hidden='true'>{g(p.id)}</span> {name(p.id)} · <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[p.sign])}</span> {sign(p.sign)}
                            </h3>
                            {p.start && p.end ? (
                                <p className={classes.fact}>{dmy(p.start)} – {dmy(p.end)} · {translate('gen_years', {n: p.years ?? 0})}</p>
                            ) : <p className={classes.fact}>{translate('gen_unbounded')}</p>}
                            {p.dips ? <p className={classes.muted}>{translate('gen_dips', {n: p.dips})}</p> : null}
                            {edge ? <p className={classes.muted}>{translate('gen_edge', {days: EDGE_DAYS})}</p> : null}
                            <p className={classes.text}>{text(p.id, p.sign)}</p>
                        </article>
                    );
                })}
            </div>
            <h3>{translate('gen_pairs')}</h3>
            {pairs.length ? (
                <ul className={classes.list}>
                    {pairs.map((a) => (
                        <li key={`${a.p1}-${a.p2}`}>
                            <strong>{g(a.p1!)} {name(a.p1!)} {content.aspects[a.type as keyof typeof content.aspects]?.name.toLowerCase()} {g(a.p2!)} {name(a.p2!)}</strong> · {formatOrb(a.orb ?? 0)}
                            <br/><span className={classes.text}>{aspectPairText(locale, a.p1!, a.p2!, a.type!)}</span>
                        </li>
                    ))}
                </ul>
            ) : <p className={classes.text}>{translate('gen_pairs_none')}</p>}
            <p className={classes.note}>{translate('gen_note')}</p>
        </section>
    );
};

export default ChartGenerationComponent;
