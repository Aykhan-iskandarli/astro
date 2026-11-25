import {useMemo} from 'react';
import {Alert} from 'antd';
import classNames from 'classnames';
import {aspectPairText} from '@astra/content';
import {ASPECT_GLYPHS, aspectTone, formatLocal, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import {DIRECTIONS_WINDOW, directionsStart, eventsIn} from 'core/helpers/directions';
import LoaderComponent from 'core/shared/loader/loader.component';
import {useStore} from 'store/store.config';
import useLocalization, {useContent} from 'assets/lang';
import {useGetDirections} from 'pages/natal-chart/actions/natal-chart.query';
import {useYearPartsStyles} from '../year-parts.style';
import {IYearDirections} from './year-directions';

interface IRow {
    key: string;
    at: string;
    age: number;
    kind: 'solarArc' | 'progressed' | 'ingress';
    from: string;
    to: string | null;
    aspect: string | null;
    sign: string | null;
}

// The Solar Arc and progression events that become exact in the chosen year (the full timeline is on the directions page).
const YearDirectionsComponent = ({input, year}: IYearDirections) => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useYearPartsStyles();
    const {data, isFetching, isError} = useGetDirections(input, directionsStart(year), DIRECTIONS_WINDOW);

    const name = (id: string) => content.points[id as keyof typeof content.points]?.name
        ?? (id === 'asc' ? content.houses['1']?.name : id === 'mc' ? 'MC' : id);
    const sign = (id: string) => content.signs[id as keyof typeof content.signs]?.name ?? id;

    const rows = useMemo<IRow[]>(() => {
        if (!data) return [];
        return eventsIn<IRow>([
            ...data.solarArc.map((h) => ({key: `sa-${h.directed}-${h.natal}-${h.aspect}`, at: h.at, age: h.age, kind: 'solarArc' as const, from: h.directed, to: h.natal, aspect: h.aspect, sign: null})),
            ...data.progressed.map((h) => ({key: `pr-${h.progressed}-${h.natal}-${h.aspect}-${h.at}`, at: h.at, age: h.age, kind: 'progressed' as const, from: h.progressed, to: h.natal, aspect: h.aspect, sign: null})),
            ...data.ingresses.map((h) => ({key: `in-${h.progressed}-${h.sign}`, at: h.at, age: h.age, kind: 'ingress' as const, from: h.progressed, to: null, aspect: null, sign: h.sign})),
        ], year);
    }, [data, year]);

    return (
        <section className={classes.wrap} aria-labelledby='sec-ydir'>
            <h2 id='sec-ydir' className={classes.title}>{translate('yd_title')}</h2>
            <p className={classes.muted}>{translate('yd_intro')}</p>
            {isError ? <Alert type='error' showIcon title={translate('yd_error')}/> : null}
            {!data && isFetching ? <LoaderComponent/> : null}
            {data ? (
                rows.length ? (
                    <ul className={classes.list}>
                        {rows.map((r) => (
                            <li key={r.key} className={classes.card}>
                                <p className={classes.label}>{translate(r.kind === 'solarArc' ? 'dir_kind_solarArc' : r.kind === 'progressed' ? 'dir_kind_progressed' : 'dir_kind_ingress')}</p>
                                {r.kind === 'ingress' ? (
                                    <>
                                        <h4>
                                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[r.from])}</span> {translate('dir_enters', {planet: name(r.from)})}{' '}
                                            <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[r.sign!])}</span> {sign(r.sign!)}
                                        </h4>
                                        <p className={classes.fact}>{formatLocal(r.at, false)} · {translate('dir_age', {age: Math.floor(r.age)})}</p>
                                        <p className={classes.text}>{translate(r.from === 'moon' ? 'dir_ingress_moon' : 'dir_ingress_other', {planet: name(r.from), sign: sign(r.sign!)})}</p>
                                    </>
                                ) : (
                                    <>
                                        <h4>
                                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[r.from])}</span>{` ${name(r.from)} `}
                                            <span className={classNames('glyph', classes[aspectTone(r.aspect!)])} aria-hidden='true'>{glyph(ASPECT_GLYPHS[r.aspect!])}</span>
                                            {` ${content.aspects[r.aspect as keyof typeof content.aspects]?.name.toLowerCase()} `}
                                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[r.to!])}</span>{` ${name(r.to!)}`}
                                        </h4>
                                        <p className={classes.fact}>{formatLocal(r.at, false)} · {translate('dir_age', {age: Math.floor(r.age)})}</p>
                                        <p className={classes.soft}>{translate(r.kind === 'solarArc' ? 'dir_solar_how' : 'dir_prog_how', {a: name(r.from), b: name(r.to!)})}</p>
                                        <p className={classes.text}>{aspectPairText(locale, r.from, r.to!, r.aspect!)}</p>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : <p className={classes.muted}>{translate('yd_none')}</p>
            ) : null}
            <p className={classes.note}>{translate('yd_note')}</p>
        </section>
    );
};

export default YearDirectionsComponent;
