import {useMemo} from 'react';
import {houseSentence} from '@astra/content';
import {Alert} from 'antd';
import {formatDegree, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import {areaHouses, significators} from 'core/helpers/areas';
import {useStore} from 'store/store.config';
import useLocalization, {useContent} from 'assets/lang';
import {useChartFinanceStyles} from './chart-finance.style';
import {IChartFinance} from './chart-finance';

const SIGNIFICATORS = ['venus', 'jupiter', 'saturn', 'mercury', 'mars'];

// Finances read the traditional way: the 2nd house (own earnings) with its ruler, the Part of Fortune, the 8th house
// (other people's money, debts, inheritance), the 11th house (gains) and the condition of the planets of money.
const ChartFinanceComponent = ({chart}: IChartFinance) => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useChartFinanceStyles();
    const known = !chart.timeUnknown;
    const fortune = known ? chart.points.find((p) => p.id === 'partOfFortune') ?? null : null;

    const houses = useMemo(() => areaHouses(chart, [2, 8, 11]), [chart]);
    const second = houses.find((h) => h.house === 2);
    const eighth = houses.find((h) => h.house === 8);
    const eleventh = houses.find((h) => h.house === 11);
    const sig = useMemo(() => significators(chart, SIGNIFICATORS), [chart]);
    const text = content.finance as {cusp: Record<string, string>; ruler: Record<string, string>; fortune: Record<string, string>; planet: Record<string, string>};

    const name = (id: string | null) => (id ? content.points[id as keyof typeof content.points]?.name ?? id : '');
    const sign = (id: string | null) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : '');
    const house = (n: number | null) => (n ? content.houses[String(n) as keyof typeof content.houses]?.name ?? '' : '');
    const dignity = (id: string | null) => (id ? content.dignities[id as keyof typeof content.dignities] : null);
    const g = (id: string | null) => glyph(POINT_GLYPHS[id ?? '']);

    const occupants = (ids: string[], n: number, empty: string) => (ids.length ? ids.map((id) => (
        <p key={id} className={classes.text}><strong>{g(id)} {name(id)}.</strong> {houseSentence(locale, id, n)}</p>
    )) : <p className={classes.text}>{empty}</p>);

    return (
        <section className={classes.wrap} aria-labelledby='sec-finance'>
            <h2 id='sec-finance' className={classes.title}>{translate('finance_title')}</h2>
            <p className={classes.muted}>{translate('finance_intro')}</p>
            {!known ? <Alert type='info' showIcon title={translate('finance_time_unknown')}/> : null}
            <div className={classes.grid}>
                {second ? (
                    <article className={classes.card}>
                        <p className={classes.label}>{translate('finance_second')}</p>
                        <h3><span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[second.cuspSign ?? ''])}</span> {sign(second.cuspSign)}</h3>
                        {second.cuspSign ? <p className={classes.text}>{text.cusp[second.cuspSign]}</p> : null}
                        {second.rulers.map((r) => (
                            <div key={`${r.id}-${r.kind}`}>
                                <p className={classes.fact}>
                                    {translate('finance_ruler')}: <span className='glyph' aria-hidden='true'>{g(r.id)}</span> {name(r.id)}
                                    {r.kind === 'modern' ? ` (${translate('career_modern')})` : ''} · {sign(r.sign)}
                                    {r.house ? ` · ${house(r.house)}` : ''}
                                    {r.dignity ? ` · ${dignity(r.dignity)?.name}` : ''}
                                    {r.retrograde ? ` · ${translate('retrograde')}` : ''}
                                </p>
                                {r.house && r.kind !== 'modern' ? <p className={classes.text}>{text.ruler[String(r.house)]}</p> : null}
                            </div>
                        ))}
                        {occupants(second.occupants, 2, translate('finance_second_empty'))}
                    </article>
                ) : null}

                {fortune && fortune.sign ? (
                    <article className={classes.card}>
                        <p className={classes.label}>{translate('finance_fortune')}</p>
                        <h3>
                            <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[fortune.sign])}</span> {sign(fortune.sign)}{' '}
                            <span className={classes.fact}>{formatDegree(fortune.degree, fortune.minute)}</span>
                        </h3>
                        {fortune.house ? (
                            <>
                                <p className={classes.fact}>{house(fortune.house)}</p>
                                <p className={classes.text}>{text.fortune[String(fortune.house)]}</p>
                            </>
                        ) : null}
                    </article>
                ) : null}

                {eighth ? (
                    <article className={classes.card}>
                        <p className={classes.label}>{translate('finance_eighth')}</p>
                        <p className={classes.fact}>
                            {translate('career_cusp', {house: house(8), sign: sign(eighth.cuspSign)})}
                            {eighth.rulers[0]?.house ? ` · ${translate('career_ruler_in', {planet: name(eighth.rulers[0].id), house: house(eighth.rulers[0].house)})}` : ''}
                        </p>
                        {occupants(eighth.occupants, 8, translate('finance_eighth_text'))}
                    </article>
                ) : null}

                {eleventh ? (
                    <article className={classes.card}>
                        <p className={classes.label}>{translate('finance_eleventh')}</p>
                        <p className={classes.fact}>
                            {translate('career_cusp', {house: house(11), sign: sign(eleventh.cuspSign)})}
                            {eleventh.rulers[0]?.house ? ` · ${translate('career_ruler_in', {planet: name(eleventh.rulers[0].id), house: house(eleventh.rulers[0].house)})}` : ''}
                        </p>
                        {occupants(eleventh.occupants, 11, translate('finance_eleventh_text'))}
                    </article>
                ) : null}

                <article className={classes.card}>
                    <p className={classes.label}>{translate('finance_planets')}</p>
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
            <p className={classes.note}>{translate('finance_note')}</p>
        </section>
    );
};

export default ChartFinanceComponent;
