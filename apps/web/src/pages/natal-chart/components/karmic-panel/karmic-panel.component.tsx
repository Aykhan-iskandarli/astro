import {formatDegree, formatOrb, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import useLocalization, {useContent} from 'assets/lang';
import {ChartPointModel} from '../../models/natal-chart.model';
import {useKarmicPanelStyles} from './karmic-panel.style';
import {IKarmicPanel, INodeContact} from './karmic-panel';

const PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

// Karmic path: the lunar nodes (where you come from -> where you are going), planets on the nodal axis, Chiron
// (wound and healing) and Lilith (the shadow). Everything comes from the natal chart already calculated.
const KarmicPanelComponent = ({chart}: IKarmicPanel) => {
    const translate = useLocalization();
    const content = useContent();
    const k = content.karmic;
    const classes = useKarmicPanelStyles();

    const point = (id: string) => chart.points.find((p) => p.id === id) ?? null;
    const north = point('northNode');
    const south = point('southNode');
    const chiron = point('chiron');
    const lilith = point('lilith');
    const selena = chart.extraPoints.find((p) => p.id === 'selena') ?? null;
    const pointName = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;
    const signName = (s: string | null) => (s ? content.signs[s as keyof typeof content.signs]?.name ?? s : '');
    const houseName = (n: number | null) => (n ? content.houses[String(n) as keyof typeof content.houses]?.name ?? '' : '');

    const position = (p: ChartPointModel) => (
        <p className={classes.position}>
            <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[p.sign!])}</span>
            {` ${signName(p.sign)} ${formatDegree(p.degree, p.minute)}`}
            {p.house ? ` · ${houseName(p.house)}` : ''}
            {p.retrograde ? ` · ${translate('retrograde')}` : ''}
        </p>
    );

    const pointHead = (p: ChartPointModel) => (
        <header className={classes.pointHead}>
            <span className={`glyph ${classes.glyph}`} aria-hidden='true'>{glyph(POINT_GLYPHS[p.id!])}</span>
            <div>
                <h4>{pointName(p.id!)}</h4>
                {position(p)}
            </div>
        </header>
    );

    const axis = north ? k.nodeAxis[north.sign as keyof typeof k.nodeAxis] : null;
    const nodeHouse = north?.house ? k.nodeHouse[String(north.house) as keyof typeof k.nodeHouse] : null;

    // Planets on the nodal axis: conjunct the North or South Node, or square the axis ("skipped step")
    const contacts: INodeContact[] = chart.aspects.flatMap((a): INodeContact[] => {
        const node = a.p1 === 'northNode' || a.p1 === 'southNode' ? a.p1 : a.p2 === 'northNode' || a.p2 === 'southNode' ? a.p2 : null;
        const other = node === a.p1 ? a.p2 : a.p1;
        if (!node || !other || !PLANETS.includes(other)) return [];
        if (a.type === 'conjunction') return [{planet: other, kind: node as 'northNode' | 'southNode', orb: a.orb}];
        if (a.type === 'square' && node === 'northNode') return [{planet: other, kind: 'square', orb: a.orb}];
        return [];
    });
    const contactLabel = {northNode: 'karmic_contact_north', southNode: 'karmic_contact_south', square: 'karmic_contact_square'} as const;

    return (
        <div className={classes.wrapper}>
            <header className={classes.head}>
                <h2>{translate('karmic_title')}</h2>
                <p>{k.intro}</p>
            </header>

            {north && south && axis ? (
                <section className={classes.section} aria-labelledby='karmic-nodes'>
                    <h3 id='karmic-nodes'>{translate('karmic_nodes_title')}</h3>
                    <div className={classes.axis}>
                        <article className={classes.card}>
                            <p className={classes.eyebrow}>{translate('karmic_from')}</p>
                            {pointHead(south)}
                            <p className={classes.text}>{axis.past}</p>
                            {nodeHouse ? <p className={classes.muted}>{nodeHouse.past}</p> : null}
                        </article>
                        <span className={classes.arrow} aria-hidden='true'>→</span>
                        <article className={classes.cardFuture}>
                            <p className={classes.eyebrow}>{translate('karmic_to')}</p>
                            {pointHead(north)}
                            <p className={classes.text}>{axis.future}</p>
                            {nodeHouse ? <p className={classes.muted}>{nodeHouse.future}</p> : null}
                        </article>
                    </div>
                    <p className={classes.advice}><strong>{translate('karmic_advice')}:</strong> <span>{axis.advice}</span></p>
                    {chart.timeUnknown ? <p className={classes.note}>{translate('karmic_time_unknown')}</p> : null}
                </section>
            ) : null}

            <section className={classes.section} aria-labelledby='karmic-contacts'>
                <h3 id='karmic-contacts'>{translate('karmic_contacts_title')}</h3>
                {contacts.length ? (
                    <ul className={classes.contacts}>
                        {contacts.map((c) => (
                            <li key={`${c.planet}-${c.kind}`} className={classes.contact}>
                                <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[c.planet])}</span>
                                <div>
                                    <p className={classes.contactTitle}>
                                        {pointName(c.planet)} <span>· {translate(contactLabel[c.kind])} · {formatOrb(c.orb!)}</span>
                                    </p>
                                    <p className={classes.muted}>{k.nodeContacts[c.kind]}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : <p className={classes.muted}>{translate('karmic_contacts_none')}</p>}
            </section>

            <div className={classes.pair}>
                {chiron ? (
                    <section className={classes.card} aria-labelledby='karmic-chiron'>
                        <p className={classes.eyebrow} id='karmic-chiron'>{translate('karmic_chiron_title')}</p>
                        {pointHead(chiron)}
                        <p className={classes.text}>{k.chironSign[chiron.sign as keyof typeof k.chironSign]}</p>
                        {chiron.house ? <p className={classes.muted}>{k.chironHouse[String(chiron.house) as keyof typeof k.chironHouse]}</p> : null}
                        <p className={classes.note}>{translate('karmic_chiron_return_hint')}</p>
                    </section>
                ) : null}
                {lilith ? (
                    <section className={classes.card} aria-labelledby='karmic-lilith'>
                        <p className={classes.eyebrow} id='karmic-lilith'>{translate('karmic_lilith_title')}</p>
                        {pointHead(lilith)}
                        <p className={classes.text}>{k.lilithSign[lilith.sign as keyof typeof k.lilithSign]}</p>
                        {lilith.house ? <p className={classes.muted}>{translate('karmic_lilith_house', {house: houseName(lilith.house)})}</p> : null}
                    </section>
                ) : null}
                {selena ? (
                    <section className={classes.card} aria-labelledby='karmic-selena'>
                        <p className={classes.eyebrow} id='karmic-selena'>{translate('karmic_selena_title')}</p>
                        <header className={classes.pointHead}>
                            <span className={`glyph ${classes.glyph}`} aria-hidden='true'>✧</span>
                            <div>
                                <h4>{content.extraPoints.selena.name}</h4>
                                {position(selena)}
                            </div>
                        </header>
                        <p className={classes.text}>{k.selenaSign[selena.sign as keyof typeof k.selenaSign]}</p>
                        {selena.house ? <p className={classes.muted}>{translate('karmic_lilith_house', {house: houseName(selena.house)})}</p> : null}
                    </section>
                ) : null}
            </div>

            <p className={classes.note}>{translate('karmic_more')}</p>
        </div>
    );
};

export default KarmicPanelComponent;
