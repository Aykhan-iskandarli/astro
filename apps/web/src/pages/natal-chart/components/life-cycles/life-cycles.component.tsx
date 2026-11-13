import classNames from 'classnames';
import {useStore} from 'store/store.config';
import {glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization, {useContent} from 'assets/lang';
import {useGetCycles} from '../../actions/natal-chart.query';
import {IPlanetReturn} from '../../models/cycles.model';
import {useLifeCyclesStyles} from './life-cycles.style';

const BODIES = ['jupiter', 'saturn', 'chiron'] as const;
const dmy = (iso: string) => iso.slice(0, 10).split('-').reverse().join('.');
const nextIndex = (list: IPlanetReturn[]) => list.findIndex((r) => r.status !== 'past');

// Planetary returns (Jupiter, Saturn, Chiron) and the annual profection, from /api/charts/cycles.
const LifeCyclesComponent = () => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useLifeCyclesStyles();
    const birthInput = useStore('birthInput');
    const {data, isError} = useGetCycles(birthInput, true);

    if (isError) return <p className={classes.muted}>{translate('cycles_error')}</p>;
    if (!data) return <LoaderComponent/>;

    const pointName = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;
    const signName = (s: string) => content.signs[s as keyof typeof content.signs]?.name ?? s;
    const house = (n: number) => content.houses[String(n) as keyof typeof content.houses];
    const cur = data.current;
    const lordInfo = cur ? content.points[cur.lord as keyof typeof content.points] : null;

    return (
        <div className={classes.wrapper}>
            <p className={classes.info}>{translate('cycles_info', {years: data.horizonYears})}</p>

            <section className={classes.section} aria-labelledby='cycles-profection'>
                <h3 id='cycles-profection'>{content.cycles.profection.name}</h3>
                {cur ? (
                    <>
                        <article className={classes.profection}>
                            <p className={classes.eyebrow}>
                                {translate('cycles_age', {age: cur.age})} · {dmy(cur.start)} – {dmy(cur.end)}
                            </p>
                            <p className={classes.big}>
                                {house(cur.house)?.name} · <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[cur.sign])}</span> {signName(cur.sign)}
                            </p>
                            <p className={classes.muted}>{translate('cycles_house_theme')}: {house(cur.house)?.theme}</p>
                            <p>
                                <span className={classes.gold}>{translate('cycles_lord')}: </span>
                                <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[cur.lord])}</span> {pointName(cur.lord)}
                                {cur.lordNatal ? (
                                    <span className={classes.muted}>
                                        {' '}{translate('cycles_lord_natal', {
                                            sign: signName(cur.lordNatal.sign),
                                            house: cur.lordNatal.house ? house(cur.lordNatal.house)?.name ?? '' : '—',
                                        })}
                                    </span>
                                ) : null}
                            </p>
                            {lordInfo ? <p className={classes.muted}>{lordInfo.short}</p> : null}
                            <p className={classes.subtle}>{content.cycles.profection.meaning}</p>
                        </article>

                        <div className={classes.tableWrap}>
                            <table className={classes.table}>
                                <caption className={classes.caption}>{translate('cycles_years_title')}</caption>
                                <thead>
                                    <tr>
                                        <th>{translate('col_age')}</th>
                                        <th>{translate('col_period')}</th>
                                        <th>{translate('col_house')}</th>
                                        <th>{translate('col_sign')}</th>
                                        <th>{translate('cycles_lord')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.years.map((y) => (
                                        <tr key={y.age} data-current={y.age === cur.age}>
                                            <td>{y.age}</td>
                                            <td>{dmy(y.start)} – {dmy(y.end)}</td>
                                            <td>{y.house}</td>
                                            <td><span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[y.sign])}</span> {signName(y.sign)}</td>
                                            <td><span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[y.lord])}</span> {pointName(y.lord)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : <p className={classes.muted}>{translate('cycles_time_unknown')}</p>}
            </section>

            <section className={classes.section} aria-labelledby='cycles-returns'>
                <h3 id='cycles-returns'>{translate('cycles_returns_title')}</h3>
                <div className={classes.returns}>
                    {BODIES.map((id) => {
                        const list = data.returns[id] ?? [];
                        const next = nextIndex(list);
                        const info = content.cycles.returns[id];
                        return (
                            <article key={id} className={classes.returnCard}>
                                <header className={classes.returnHead}>
                                    <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[id])}</span>
                                    <h4>{info.name}</h4>
                                </header>
                                <p className={classes.muted}>{info.meaning}</p>
                                <ol className={classes.list}>
                                    {list.map((r, i) => (
                                        <li key={r.number} className={classNames(classes.item, {
                                            [classes.itemNext]: i === next,
                                            [classes.itemPast]: r.status === 'past',
                                        })}>
                                            <span className={classes.num}>№{r.number}</span>
                                            <span className={classes.dates}>
                                                <span>{dmy(r.passes[0].at)} · {translate('cycles_age_years', {age: r.ageYears})}</span>
                                                {r.passes.length > 1 ? (
                                                    <small>
                                                        {r.passes.map((p) => (
                                                            <span key={p.at} className={p.retrograde ? classes.retro : undefined}>
                                                                {dmy(p.at)}{p.retrograde ? ` ${translate('retrograde_short')}` : ''}{' '}
                                                            </span>
                                                        ))}
                                                    </small>
                                                ) : null}
                                            </span>
                                            <span className={classNames(classes.badge, {[classes.badgeNext]: i === next})}>
                                                {translate(r.status === 'past' ? 'cycles_status_past' : r.status === 'now' ? 'cycles_status_now' : 'cycles_status_future')}
                                            </span>
                                        </li>
                                    ))}
                                </ol>
                            </article>
                        );
                    })}
                </div>
                <p className={classes.subtle}>{translate('cycles_passes_note')}</p>
            </section>
        </div>
    );
};

export default LifeCyclesComponent;
