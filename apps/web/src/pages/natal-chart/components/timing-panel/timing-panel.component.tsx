import {useCallback, useState} from 'react';
import {DatePicker} from 'antd';
import dayjs, {Dayjs} from 'dayjs';
import {useStore} from 'store/store.config';
import {ASPECT_GLYPHS, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization, {useContent} from 'assets/lang';
import {useGetTiming} from '../../actions/natal-chart.query';
import {useExtrasStyles} from '../extras-ui/extras.style';

const dmy = (iso: string) => iso.slice(0, 10).split('-').reverse().join('.');
const MIN = dayjs('1800-01-01');
const MAX = dayjs('2999-12-31');

// Timing techniques for a chosen date: firdaria, zodiacal releasing (Fortune, Spirit) and solar arc directions.
const TimingPanelComponent = () => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useExtrasStyles();
    const birthInput = useStore('birthInput');
    const [on, setOn] = useState<Dayjs>(() => dayjs().startOf('day'));
    const {data} = useGetTiming(birthInput, on.format('YYYY-MM-DD'), true);
    const handleDate = useCallback((v: Dayjs | null) => {
        if (v) setOn(v);
    }, []);
    const disabledDate = useCallback((d: Dayjs) => d.isBefore(MIN) || d.isAfter(MAX), []);

    const name = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;
    const g = (id: string) => <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[id])}</span>;
    const sign = (s: string) => content.signs[s as keyof typeof content.signs]?.name ?? s;
    const key = on.format('YYYY-MM-DD');
    const isNow = (start: string, end: string) => start.slice(0, 10) <= key && key < end.slice(0, 10);

    return (
        <div className={classes.wrapper}>
            <div className={classes.controls}>
                <label htmlFor='timing-date'>
                    {translate('timing_date')}
                    <DatePicker id='timing-date' size='large' value={on} onChange={handleDate} format='DD.MM.YYYY'
                                disabledDate={disabledDate} allowClear={false}/>
                </label>
            </div>
            {!data ? <LoaderComponent/> : (
                <>
                    <section className={classes.section} aria-labelledby='timing-firdaria'>
                        <h3 id='timing-firdaria'>{translate('timing_firdaria')}</h3>
                        <p className={classes.lead}>{translate('timing_firdaria_info')}</p>
                        {data.firdariaCurrent ? (
                            <p className={classes.text}>
                                {translate('timing_firdaria_now')}: {g(data.firdariaCurrent)} <b className={classes.gold}>{name(data.firdariaCurrent)}</b>
                                {data.firdariaCurrentSub ? <> / {g(data.firdariaCurrentSub)} {name(data.firdariaCurrentSub)}</> : null}
                            </p>
                        ) : null}
                        <div className={classes.tableWrap}>
                            <table className={classes.table}>
                                <thead><tr><th>{translate('timing_lord')}</th><th>{translate('col_period')}</th><th>{translate('timing_years')}</th></tr></thead>
                                <tbody>
                                    {data.firdaria.slice(0, 9).map((p) => (
                                        <tr key={p.start} data-hot={isNow(p.start, p.end)}>
                                            <td>{g(p.lord)} {name(p.lord)}</td>
                                            <td>{dmy(p.start)} – {dmy(p.end)}</td>
                                            <td>{p.years}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className={classes.small}>{translate(data.firdariaDiurnal ? 'timing_firdaria_day' : 'timing_firdaria_night')}</p>
                    </section>

                    {data.zr ? (
                        <section className={classes.section} aria-labelledby='timing-zr'>
                            <h3 id='timing-zr'>{translate('timing_zr')}</h3>
                            <p className={classes.lead}>{translate('timing_zr_info')}</p>
                            <div className={classes.grid}>
                                {data.zr.map((z) => (
                                    <article key={z.lot} className={classes.card}>
                                        <p className={classes.title}>
                                            {translate(z.lot === 'fortune' ? 'timing_zr_fortune' : 'timing_zr_spirit')} ·{' '}
                                            <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[z.lotSign])}</span> {sign(z.lotSign)}
                                        </p>
                                        <ul className={classes.list}>
                                            {z.periods.map((p) => (
                                                <li key={p.start} className={isNow(p.start, p.end) ? classes.gold : undefined}>
                                                    <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[p.sign])}</span> {sign(p.sign)} · {dmy(p.start)} – {dmy(p.end)}
                                                    {p.angular ? <span className={classes.small}> · {translate('timing_zr_angular')}</span> : null}
                                                    {p.loosingTheBond ? <span className={classes.small}> · {translate('timing_zr_lb')}</span> : null}
                                                </li>
                                            ))}
                                        </ul>
                                    </article>
                                ))}
                            </div>
                        </section>
                    ) : <p className={classes.small}>{translate('timing_zr_time_unknown')}</p>}

                    <section className={classes.section} aria-labelledby='timing-arc'>
                        <h3 id='timing-arc'>{translate('timing_arc')}</h3>
                        <p className={classes.lead}>{translate('timing_arc_info', {arc: data.arc.toFixed(2), orb: data.arcOrb})}</p>
                        {data.arcAspects.length ? (
                            <ul className={classes.list}>
                                {data.arcAspects.map((a) => (
                                    <li key={`${a.directed}-${a.natal}-${a.type}`}>
                                        {translate('timing_arc_directed')} {g(a.directed)} {name(a.directed)}{' '}
                                        <span className='glyph' aria-hidden='true'>{glyph(ASPECT_GLYPHS[a.type])}</span>{' '}
                                        {content.aspects[a.type as keyof typeof content.aspects]?.name} · {translate('timing_arc_natal')} {g(a.natal)} {name(a.natal)}
                                        {' '}<span className={classes.small}>{a.orb.toFixed(2)}°</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className={classes.text}>{translate('timing_arc_none')}</p>}
                    </section>
                </>
            )}
        </div>
    );
};

export default TimingPanelComponent;
