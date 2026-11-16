import {useMemo} from 'react';
import {Alert} from 'antd';
import classNames from 'classnames';
import {glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import {ANGULAR_HOUSES, PROMINENT_MIN, powerSummary} from 'core/helpers/power';
import {SCORES} from 'core/helpers/dignity';
import TermComponent from 'core/shared/term/term.component';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {useChartPowerStyles} from './chart-power.style';
import {IChartPower} from './chart-power';

// The strength of the seven traditional planets: Lilly's essential dignity score, whether each is angular, how many
// major aspects it makes and which planet rules the Ascendant or the Sun and Moon signs. The rules are listed below.
const ChartPowerComponent = ({chart}: IChartPower) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useChartPowerStyles();

    const power = useMemo(() => powerSummary({
        points: chart.points,
        aspects: chart.aspects,
        ascRuler: chart.houses[0]?.rulers.find((r) => r.kind !== 'modern')?.id ?? null,
        sect: chart.sect,
        timeUnknown: chart.timeUnknown,
    }), [chart]);
    const reading = content.reading as {planet: Record<string, string>};

    const name = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;
    const sign = (id: string) => content.signs[id as keyof typeof content.signs]?.name ?? id;
    const g = (id: string) => glyph(POINT_GLYPHS[id]);
    const house = (n: number | null) => (n ? content.houses[String(n) as keyof typeof content.houses]?.name ?? '' : '');
    const signed = (n: number) => (n > 0 ? `+${n}` : String(n));

    const card = (labelKey: ITranslationKey, ids: string[]) => (ids.length ? (
        <article className={classes.card}>
            <p className={classes.label}>{translate(labelKey)}</p>
            {ids.map((id) => (
                <div key={id}>
                    <h3><span className='glyph' aria-hidden='true'>{g(id)}</span> {name(id)} <span className={classes.fact}>{signed(power.rows.find((r) => r.id === id)!.score)}</span></h3>
                    <p className={classes.text}>{reading.planet[id]}</p>
                </div>
            ))}
        </article>
    ) : null);

    return (
        <section className={classes.wrap} aria-labelledby='sec-power'>
            <h2 id='sec-power' className={classes.title}>{translate('power_title')}</h2>
            <p className={classes.muted}>{translate('power_intro')}</p>
            {!power.sectKnown ? <Alert type='info' showIcon title={translate('power_time_unknown')}/> : null}

            <div className={classes.scroll}>
                <table className={classes.table}>
                    <thead>
                        <tr>
                            <th>{translate('power_planet')}</th>
                            <th>{translate('power_position')}</th>
                            <th><TermComponent id='dignity'>{translate('power_dignities')}</TermComponent></th>
                            <th>{translate('power_score')}</th>
                            <th>{translate('power_markers')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {power.rows.map((r) => (
                            <tr key={r.id}>
                                <td><span className='glyph' aria-hidden='true'>{g(r.id)}</span> {name(r.id)}</td>
                                <td>
                                    <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[r.sign])}</span> {sign(r.sign)} {Math.floor(r.degree)}°
                                    {r.house ? ` · ${house(r.house)}` : ''}{r.retrograde ? ` · ${translate('retrograde')}` : ''}
                                </td>
                                <td>
                                    {r.dignities.map((d) => <span key={d} className={classes.chip}>{translate(`dig_${d}` as ITranslationKey)} {signed(SCORES[d])}</span>)}
                                    {r.detriment ? <span className={classNames(classes.chip, classes.chipBad)}>{translate('dig_detriment')} {signed(SCORES.detriment)}</span> : null}
                                    {r.fall ? <span className={classNames(classes.chip, classes.chipBad)}>{translate('dig_fall')} {signed(SCORES.fall)}</span> : null}
                                    {r.peregrine ? <span className={classNames(classes.chip, classes.chipBad)}>{translate('dig_peregrine')} {signed(SCORES.peregrine)}</span> : null}
                                    {!r.dignities.length && !r.detriment && !r.fall && !r.peregrine ? '—' : null}
                                </td>
                                <td><span className={classNames(classes.score, r.score > 0 ? classes.plus : r.score < 0 ? classes.minus : '')}>{signed(r.score)}</span></td>
                                <td>
                                    {r.markers.map((m) => <span key={m} className={classes.chip}>{translate(`marker_${m}` as ITranslationKey)}</span>)}
                                    {r.markers.length ? '' : '—'}
                                    {` · ${translate('power_aspect_count', {n: r.aspects})}`}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={classes.grid}>
                {card('power_strongest', power.strongest)}
                {card('power_weakest', power.weakest)}
                {card('power_prominent', power.prominent)}
            </div>

            <details className={classes.rules}>
                <summary>{translate('power_rules_title')}</summary>
                <p>{translate('power_rules_scores', {
                    domicile: signed(SCORES.domicile), exaltation: signed(SCORES.exaltation), triplicity: signed(SCORES.triplicity), term: signed(SCORES.term),
                    face: signed(SCORES.face), detriment: signed(SCORES.detriment), fall: signed(SCORES.fall), peregrine: signed(SCORES.peregrine),
                })}</p>
                <p>{translate('power_rules_tables')}</p>
                <p>{translate('power_rules_markers', {min: PROMINENT_MIN, angular: ANGULAR_HOUSES.join(', ')})}</p>
            </details>
            <p className={classes.note}>{translate('power_note')}</p>
        </section>
    );
};

export default ChartPowerComponent;
