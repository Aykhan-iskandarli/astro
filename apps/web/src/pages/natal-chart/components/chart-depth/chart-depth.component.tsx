import {useMemo} from 'react';
import {formatOrb, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import {
    chartShape, criticalDegrees, CRITICAL_DEGREES, dispositors, SHAPE_RULES, strengths, TEMPERAMENT_WEIGHTS, temperament, Temperament,
} from 'core/helpers/depth';
import TermComponent from 'core/shared/term/term.component';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {useChartDepthStyles} from './chart-depth.style';
import {IChartDepth} from './chart-depth';

const TEMPERAMENTS: Temperament[] = ['choleric', 'sanguine', 'melancholic', 'phlegmatic'];

// The deeper reading of a natal chart, counted from the planets: who rules whom (dispositors), the shape the planets
// make, the temperament, critical degrees, and the strong and difficult sides. Every rule used is listed at the end.
const ChartDepthComponent = ({chart}: IChartDepth) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useChartDepthStyles();
    const points = chart.points;
    const ascSign = chart.timeUnknown ? null : chart.angles.find((a) => a.id === 'asc')?.sign ?? null;

    const disp = useMemo(() => dispositors(points), [points]);
    const shape = useMemo(() => chartShape(points), [points]);
    const temper = useMemo(() => temperament(points, ascSign), [points, ascSign]);
    const critical = useMemo(() => criticalDegrees(points), [points]);
    const strong = useMemo(() => strengths(points, chart.aspects), [points, chart.aspects]);
    const text = content.depth as {shape: Record<string, string>; temperament: Record<string, string>; critical: Record<string, string>; dispositor: Record<string, string>};

    const name = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;
    const sign = (id: string | null) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : '');
    const g = (id: string) => glyph(POINT_GLYPHS[id]);
    const dignity = (id: string) => content.dignities[id as keyof typeof content.dignities];
    const topScore = Math.max(1, ...Object.values(temper.scores));
    const criticalKinds = [...new Set(critical.map((c) => c.kind))];

    return (
        <section className={classes.wrap} aria-labelledby='sec-depth'>
            <h2 id='sec-depth' className={classes.title}>{translate('depth_title')}</h2>
            <p className={classes.muted}>{translate('depth_intro')}</p>
            <div className={classes.grid}>
                <article className={classes.card}>
                    <p className={classes.label}><TermComponent id='dispositor'>{translate('depth_dispositors')}</TermComponent></p>
                    <ul className={classes.list}>
                        {Object.entries(disp.next).map(([from, to]) => (
                            <li key={from}>
                                <span className='glyph' aria-hidden='true'>{g(from)}</span> {name(from)} → <span className='glyph' aria-hidden='true'>{g(to)}</span> {name(to)}
                            </li>
                        ))}
                    </ul>
                    {disp.finalDispositor ? (
                        <>
                            <h3>{translate('depth_final', {planet: name(disp.finalDispositor)})}</h3>
                            <p className={classes.text}>{text.dispositor.final}</p>
                        </>
                    ) : <p className={classes.fact}>{translate('depth_no_final')}</p>}
                    {disp.receptions.length ? (
                        <>
                            <h3>{translate('depth_receptions')}</h3>
                            <p className={classes.fact}>{disp.receptions.map(([a, b]) => `${g(a)} ${name(a)} ↔ ${g(b)} ${name(b)}`).join(' · ')}</p>
                            <p className={classes.text}>{text.dispositor.reception}</p>
                        </>
                    ) : null}
                    {disp.loops.length ? (
                        <>
                            <h3>{translate('depth_loops')}</h3>
                            <p className={classes.fact}>{disp.loops.map((l) => l.map(name).join(' → ')).join(' · ')}</p>
                            <p className={classes.text}>{text.dispositor.loop}</p>
                        </>
                    ) : null}
                </article>

                {shape ? (
                    <article className={classes.card}>
                        <p className={classes.label}>{translate('depth_shape')}</p>
                        <h3>{translate(`depth_shape_${shape.shape}` as ITranslationKey)}</h3>
                        <p className={classes.fact}>{translate('depth_shape_facts', {span: Math.round(shape.span), gap: Math.round(shape.largestGap)})}</p>
                        {shape.handle ? <p className={classes.fact}>{translate('depth_handle', {planet: `${g(shape.handle)} ${name(shape.handle)}`})}</p> : null}
                        <p className={classes.text}>{text.shape[shape.shape]}</p>
                    </article>
                ) : null}

                <article className={classes.card}>
                    <p className={classes.label}>{translate('depth_temperament')}</p>
                    <div className={classes.bars}>
                        {TEMPERAMENTS.map((t) => (
                            <div key={t} className={classes.bar}>
                                <span>{translate(`depth_temperament_${t}` as ITranslationKey)}</span>
                                <span><i style={{width: `${(temper.scores[t] / topScore) * 100}%`}}/></span>
                                <b>{temper.scores[t]}</b>
                            </div>
                        ))}
                    </div>
                    {temper.dominant.map((t) => <p key={t} className={classes.text}>{text.temperament[t]}</p>)}
                </article>

                <article className={classes.card}>
                    <p className={classes.label}>{translate('depth_critical')}</p>
                    {critical.length ? (
                        <>
                            <ul className={classes.list}>
                                {critical.map((c) => (
                                    <li key={c.id}>
                                        <span className='glyph' aria-hidden='true'>{g(c.id)}</span> {name(c.id)} · <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[c.sign])}</span> {sign(c.sign)} {c.degree}°
                                        {' · '}{translate(c.kind === 'anaretic' ? 'depth_anaretic' : 'depth_critical_word')}
                                    </li>
                                ))}
                            </ul>
                            {criticalKinds.map((k) => <p key={k} className={classes.text}>{text.critical[k]}</p>)}
                        </>
                    ) : <p className={classes.text}>{translate('depth_critical_none')}</p>}
                </article>

                <article className={classes.card}>
                    <p className={classes.label}>{translate('depth_strengths')}</p>
                    {strong.strong.length ? (
                        <>
                            <h3>{translate('depth_strong')}</h3>
                            {strong.strong.map((s) => (
                                <p key={s.id} className={classes.text}>
                                    <strong>{g(s.id)} {name(s.id)}: {dignity(s.dignity)?.name}.</strong> {dignity(s.dignity)?.meaning}
                                </p>
                            ))}
                        </>
                    ) : null}
                    {strong.weak.length ? (
                        <>
                            <h3>{translate('depth_weak')}</h3>
                            {strong.weak.map((s) => (
                                <p key={s.id} className={classes.text}>
                                    <strong>{g(s.id)} {name(s.id)}: {dignity(s.dignity)?.name}.</strong> {dignity(s.dignity)?.meaning}
                                </p>
                            ))}
                        </>
                    ) : null}
                    <p className={classes.fact}>{translate('depth_aspect_counts', {easy: strong.easy, hard: strong.hard, conj: strong.conjunctions})}</p>
                    {strong.tightest.length ? (
                        <>
                            <h3>{translate('depth_tightest')}</h3>
                            <ul className={classes.list}>
                                {strong.tightest.map((a) => (
                                    <li key={`${a.p1}-${a.p2}`}>
                                        {g(a.p1!)} {name(a.p1!)} {content.aspects[a.type as keyof typeof content.aspects]?.name.toLowerCase()} {g(a.p2!)} {name(a.p2!)} · {formatOrb(a.orb!)}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : null}
                </article>
            </div>

            <details className={classes.rules}>
                <summary>{translate('depth_rules_title')}</summary>
                <p>{translate('depth_rules_shape', {bundle: SHAPE_RULES.bundle, bowl: SHAPE_RULES.bowl, even: SHAPE_RULES.evenGap, handle: SHAPE_RULES.handleGap})}</p>
                <p>{translate('depth_rules_temperament', {w: TEMPERAMENT_WEIGHTS.luminaries})}</p>
                <p>{translate('depth_rules_critical', {
                    cardinal: CRITICAL_DEGREES.cardinal.join(', '), fixed: CRITICAL_DEGREES.fixed.join(', '), mutable: CRITICAL_DEGREES.mutable.join(', '),
                })}</p>
                <p>{translate('depth_rules_dispositor')}</p>
            </details>
            <p className={classes.note}>{translate('depth_note')}</p>
        </section>
    );
};

export default ChartDepthComponent;
