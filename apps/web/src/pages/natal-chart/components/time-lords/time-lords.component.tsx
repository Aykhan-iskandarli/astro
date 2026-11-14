import {useCallback, useState} from 'react';
import {Alert, DatePicker} from 'antd';
import dayjs, {Dayjs} from 'dayjs';
import classNames from 'classnames';
import {aspectPairText} from '@astra/content';
import {ASPECT_GLYPHS, aspectTone, formatDegree, formatLocal, formatOrb, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import {useStore} from 'store/store.config';
import LoaderComponent from 'core/shared/loader/loader.component';
import TermComponent from 'core/shared/term/term.component';
import useLocalization, {useContent} from 'assets/lang';
import {useGetTimeLords} from '../../actions/natal-chart.query';
import {useTimeLordsStyles} from './time-lords.style';

const MIN = dayjs('1800-01-01');
const MAX = dayjs('2998-12-31');

// Traditional timing: who "rules" the current year (profections), the current life chapter (firdaria),
// and which natal points the solar-arc directions are touching now.
const TimeLordsComponent = () => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const birthInput = useStore('birthInput');
    const classes = useTimeLordsStyles();
    const [on, setOn] = useState<Dayjs>(() => dayjs().startOf('day'));
    const {data, isFetching, isError} = useGetTimeLords(birthInput, on.format('YYYY-MM-DD'), true);

    const handleOn = useCallback((v: Dayjs | null) => {
        if (v) setOn(v);
    }, []);
    const disabledDate = useCallback((d: Dayjs) => d.isBefore(MIN) || d.isAfter(MAX), []);

    const name = (id: string | null) => (id ? content.points[id as keyof typeof content.points]?.name ?? id : '');
    const sign = (id: string | null) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : '');
    const houseInfo = (n: number | null) => (n ? content.houses[String(n) as keyof typeof content.houses] : null);

    if (!birthInput?.time) return <Alert type='info' showIcon title={translate('tl_needs_time')}/>;
    if (isError) return <Alert type='error' showIcon title={translate('tl_error')}/>;
    if (!data) return <LoaderComponent/>;

    const year = data.profections.find((y) => y.age === data.currentAge);
    const period = data.firdaria.find((p) => p.current);
    const sub = period?.subPeriods.find((s) => s.current);
    const lifeEnd = data.firdaria.length ? data.firdaria[data.firdaria.length - 1].ageEnd : 90;

    return (
        <div className={classNames(classes.wrap, {[classes.busy]: isFetching})}>
            <p className={classes.muted}>{translate('tl_info')}</p>
            <label className={classes.control}>
                <span>{translate('tl_date')}</span>
                <DatePicker value={on} onChange={handleOn} format='DD.MM.YYYY' allowClear={false} disabledDate={disabledDate} size='large'/>
            </label>

            <div className={classes.cards}>
                {year ? (
                    <section className={classes.card} aria-labelledby='tl-prof'>
                        <p className={classes.eyebrow}><TermComponent id='profection'>{translate('tl_profection')}</TermComponent></p>
                        <h3 id='tl-prof'>{translate('tl_profection_year', {age: year.age, house: houseInfo(year.house)?.name ?? ''})}</h3>
                        <p className={classes.big}>
                            <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[year.sign!])}</span> {sign(year.sign)}
                            {' · '}{translate('tl_lord')}: <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[year.lord!])}</span> {name(year.lord)}
                        </p>
                        <p className={classes.muted}>{formatLocal(year.start, false)} – {formatLocal(year.end, false)}</p>
                        <p>{translate('tl_profection_text', {theme: houseInfo(year.house)?.theme ?? '', lord: name(year.lord)})}</p>
                    </section>
                ) : null}

                {period ? (
                    <section className={classes.card} aria-labelledby='tl-fird'>
                        <p className={classes.eyebrow}><TermComponent id='firdaria'>{translate('tl_firdaria')}</TermComponent> · {translate(data.firdariaDiurnal ? 'tl_day_chart' : 'tl_night_chart')}</p>
                        <h3 id='tl-fird'>
                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[period.lord!])}</span> {name(period.lord)}
                            {sub ? <> / <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[sub.lord!])}</span> {name(sub.lord)}</> : null}
                        </h3>
                        <p className={classes.muted}>
                            {translate('tl_period_ages', {from: period.ageStart, to: period.ageEnd})}
                            {sub ? ` · ${translate('tl_sub_until', {date: formatLocal(sub.end, false)})}` : ''}
                        </p>
                        <p>{translate('tl_firdaria_text', {lord: name(period.lord), sub: sub ? name(sub.lord) : '—'})}</p>
                    </section>
                ) : null}

                <section className={classes.card} aria-labelledby='tl-arc'>
                    <p className={classes.eyebrow}><TermComponent id='solarArc'>{translate('tl_solar_arc')}</TermComponent></p>
                    <h3 id='tl-arc'>{translate('tl_arc_value', {arc: `${Math.floor(data.arc)}°${String(Math.floor((data.arc % 1) * 60)).padStart(2, '0')}′`})}</h3>
                    <p className={classes.muted}>{translate('tl_arc_text')}</p>
                </section>
            </div>

            <section className={classes.section} aria-labelledby='tl-life'>
                <h3 id='tl-life'>{translate('tl_life_title')}</h3>
                <div className={classes.timeline} role='list'>
                    {data.firdaria.map((p) => (
                        <div key={`${p.lord}-${p.start}`} role='listitem' className={classNames(classes.segment, {[classes.segmentCurrent]: p.current})}
                             style={{flexGrow: p.years}} title={`${name(p.lord)} · ${p.ageStart}–${p.ageEnd}`}>
                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[p.lord!])}</span>
                            <span className={classes.segAge}>{p.ageStart}</span>
                        </div>
                    ))}
                </div>
                <p className={classes.muted}>{translate('tl_life_note', {years: lifeEnd})}</p>
            </section>

            <section className={classes.section} aria-labelledby='tl-years'>
                <h3 id='tl-years'>{translate('tl_years_title')}</h3>
                <ul className={classes.years}>
                    {data.profections.map((y) => (
                        <li key={y.age} className={classNames(classes.yearItem, {[classes.yearCurrent]: y.age === data.currentAge})}>
                            <span className={classes.yearAge}>{y.age}</span>
                            <span>{houseInfo(y.house)?.name}</span>
                            <span><span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[y.sign!])}</span> {sign(y.sign)}</span>
                            <span><span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[y.lord!])}</span> {name(y.lord)}</span>
                        </li>
                    ))}
                </ul>
            </section>

            <section className={classes.section} aria-labelledby='tl-arc-asp'>
                <h3 id='tl-arc-asp'>{translate('tl_arc_aspects')}</h3>
                {data.arcAspects.length ? (
                    <ul className={classes.aspects}>
                        {data.arcAspects.map((a) => (
                            <li key={`${a.p1}-${a.p2}-${a.type}`}>
                                <span className={classNames('glyph', classes.aspGlyph, classes[aspectTone(a.type!)])} aria-hidden='true'>{glyph(ASPECT_GLYPHS[a.type!])}</span>
                                <div>
                                    <p>
                                        {translate('tl_directed')} <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[a.p1!])}</span> {name(a.p1)}{' '}
                                        <strong>{content.aspects[a.type as keyof typeof content.aspects]?.name.toLowerCase()}</strong>{' '}
                                        {translate('natal_word')} <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[a.p2!])}</span> {name(a.p2)}
                                    </p>
                                    <p className={classes.muted}>
                                        {formatOrb(a.orb!)}{a.applying !== null ? ` · ${translate(a.applying ? 'applying' : 'separating')}` : ''}
                                    </p>
                                    {aspectPairText(locale, a.p1!, a.p2!) ? <p className={classes.muted}>{aspectPairText(locale, a.p1!, a.p2!)}</p> : null}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : <p className={classes.muted}>{translate('tl_no_arc_aspects')}</p>}
                <details className={classes.details}>
                    <summary>{translate('tl_directed_positions')}</summary>
                    <ul className={classes.directed}>
                        {data.directed.map((p) => (
                            <li key={p.id}>
                                <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[p.id!])}</span> {name(p.id)}
                                <span className={classes.muted}> · <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[p.sign!])}</span> {sign(p.sign)} {formatDegree(p.degree, p.minute)}</span>
                            </li>
                        ))}
                    </ul>
                </details>
            </section>
        </div>
    );
};

export default TimeLordsComponent;
