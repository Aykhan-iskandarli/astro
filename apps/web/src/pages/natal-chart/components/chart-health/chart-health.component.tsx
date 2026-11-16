import {useMemo} from 'react';
import {houseSentence} from '@astra/content';
import {Alert} from 'antd';
import {formatDegree, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import {areaHouses, significators} from 'core/helpers/areas';
import {useStore} from 'store/store.config';
import useLocalization, {useContent} from 'assets/lang';
import {useChartHealthStyles} from './chart-health.style';
import {IChartHealth} from './chart-health';

const SIGNIFICATORS = ['sun', 'moon', 'mercury', 'mars', 'saturn'];

// Health read by the traditional associations (not a diagnosis): the Ascendant sign and its ruler for the body and
// vitality, the 6th house for daily health and its ruler, the 12th house for hidden and chronic matters, and the condition
// of the planets of vitality, nerves, energy and endurance.
const ChartHealthComponent = ({chart}: IChartHealth) => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useChartHealthStyles();
    const known = !chart.timeUnknown;
    const asc = known ? chart.angles.find((a) => a.id === 'asc') ?? null : null;

    const houses = useMemo(() => areaHouses(chart, [1, 6, 12]), [chart]);
    const first = houses.find((h) => h.house === 1);
    const sixth = houses.find((h) => h.house === 6);
    const twelfth = houses.find((h) => h.house === 12);
    const sig = useMemo(() => significators(chart, SIGNIFICATORS), [chart]);
    const text = content.health as {asc: Record<string, string>; cusp: Record<string, string>; ruler: Record<string, string>; planet: Record<string, string>};

    const name = (id: string | null) => (id ? content.points[id as keyof typeof content.points]?.name ?? id : '');
    const sign = (id: string | null) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : '');
    const house = (n: number | null) => (n ? content.houses[String(n) as keyof typeof content.houses]?.name ?? '' : '');
    const dignity = (id: string | null) => (id ? content.dignities[id as keyof typeof content.dignities] : null);
    const g = (id: string | null) => glyph(POINT_GLYPHS[id ?? '']);

    const occupants = (ids: string[], n: number, empty: string) => (ids.length ? ids.map((id) => (
        <p key={id} className={classes.text}><strong>{g(id)} {name(id)}.</strong> {houseSentence(locale, id, n)}</p>
    )) : <p className={classes.text}>{empty}</p>);

    return (
        <section className={classes.wrap} aria-labelledby='sec-health'>
            <h2 id='sec-health' className={classes.title}>{translate('health_title')}</h2>
            <p className={classes.muted}>{translate('health_intro')}</p>
            <Alert type='warning' showIcon title={translate('health_disclaimer')}/>
            {!known ? <Alert type='info' showIcon title={translate('health_time_unknown')}/> : null}
            <div className={classes.grid}>
                {asc && asc.sign ? (
                    <article className={classes.card}>
                        <p className={classes.label}>{translate('health_body')}</p>
                        <h3>
                            <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[asc.sign])}</span> {sign(asc.sign)}{' '}
                            <span className={classes.fact}>{formatDegree(asc.degree, asc.minute)}</span>
                        </h3>
                        <p className={classes.text}>{text.asc[asc.sign]}</p>
                        {first?.rulers.filter((r) => r.kind !== 'modern').map((r) => (
                            <p key={r.id} className={classes.fact}>
                                {translate('health_asc_ruler')}: <span className='glyph' aria-hidden='true'>{g(r.id)}</span> {name(r.id)} · {sign(r.sign)}
                                {r.house ? ` · ${house(r.house)}` : ''}
                                {r.dignity ? ` · ${dignity(r.dignity)?.name}` : ''}
                                {r.retrograde ? ` · ${translate('retrograde')}` : ''}
                            </p>
                        ))}
                    </article>
                ) : null}

                {sixth ? (
                    <article className={classes.card}>
                        <p className={classes.label}>{translate('health_sixth')}</p>
                        <h3><span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[sixth.cuspSign ?? ''])}</span> {sign(sixth.cuspSign)}</h3>
                        {sixth.cuspSign ? <p className={classes.text}>{text.cusp[sixth.cuspSign]}</p> : null}
                        {sixth.rulers.filter((r) => r.kind !== 'modern').map((r) => (
                            <div key={r.id}>
                                <p className={classes.fact}>
                                    {translate('finance_ruler')}: <span className='glyph' aria-hidden='true'>{g(r.id)}</span> {name(r.id)} · {sign(r.sign)}
                                    {r.house ? ` · ${house(r.house)}` : ''}
                                    {r.dignity ? ` · ${dignity(r.dignity)?.name}` : ''}
                                    {r.retrograde ? ` · ${translate('retrograde')}` : ''}
                                </p>
                                {r.house ? <p className={classes.text}>{text.ruler[String(r.house)]}</p> : null}
                            </div>
                        ))}
                        {occupants(sixth.occupants, 6, translate('health_sixth_empty'))}
                    </article>
                ) : null}

                {twelfth ? (
                    <article className={classes.card}>
                        <p className={classes.label}>{translate('health_twelfth')}</p>
                        <p className={classes.fact}>{translate('career_cusp', {house: house(12), sign: sign(twelfth.cuspSign)})}</p>
                        {occupants(twelfth.occupants, 12, translate('health_twelfth_text'))}
                    </article>
                ) : null}

                <article className={classes.card}>
                    <p className={classes.label}>{translate('health_planets')}</p>
                    {sig.map((s) => (
                        <div key={s.id}>
                            <p className={classes.fact}>
                                <span className='glyph' aria-hidden='true'>{g(s.id)}</span> {name(s.id)} · {sign(s.sign)}
                                {s.house ? ` · ${house(s.house)}` : ''}
                                {s.dignity ? ` · ${dignity(s.dignity)?.name}` : ''}
                                {s.retrograde ? ` · ${translate('retrograde')}` : ''}
                            </p>
                            <p className={classes.text}>{text.planet[s.id]}</p>
                        </div>
                    ))}
                </article>
            </div>
            <p className={classes.note}>{translate('health_note')}</p>
        </section>
    );
};

export default ChartHealthComponent;
