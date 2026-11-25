import {useMemo} from 'react';
import {Alert} from 'antd';
import {formatLocal, glyph, POINT_GLYPHS} from 'core/helpers/astro';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization, {useContent} from 'assets/lang';
import {useGetLifetime} from 'pages/natal-chart/actions/natal-chart.query';
import {useYearPartsStyles} from '../year-parts.style';
import {IYearStages} from './year-stages';

// Life stages (returns, squares and oppositions of the slow planets to themselves) running in the chosen year. Dates and
// ages come from the life-timeline cycles; the readings are the ones used on the life-timeline page. The luck pillars,
// which need a gender, are not used here, so the gender sent only fills the request.
const YearStagesComponent = ({input, year}: IYearStages) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useYearPartsStyles();
    const {data, isFetching, isError} = useGetLifetime(input, 'male');
    const cycleText = content.transformations.cycle as Record<string, {name: string; text: string}>;
    const name = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;

    const stages = useMemo(() => {
        const lo = Date.UTC(year, 0, 1);
        const hi = Date.UTC(year + 1, 0, 1);
        return (data?.cycles ?? []).filter((c) => Date.parse(c.start) < hi && Date.parse(c.end) >= lo);
    }, [data, year]);

    return (
        <section className={classes.wrap} aria-labelledby='sec-stages'>
            <h2 id='sec-stages' className={classes.title}>{translate('yg_title')}</h2>
            <p className={classes.muted}>{translate('yg_intro')}</p>
            {isError ? <Alert type='error' showIcon title={translate('yg_error')}/> : null}
            {!data && isFetching ? <LoaderComponent/> : null}
            {data ? (
                stages.length ? (
                    <ul className={classes.list}>
                        {stages.map((c) => {
                            const t = cycleText[`${c.transit}-${c.aspect}`];
                            return (
                                <li key={`${c.transit}-${c.aspect}-${c.start}`} className={classes.card}>
                                    <p className={classes.label}>{Math.floor(c.ageAtStart) === Math.floor(c.ageAtEnd) ? translate('dir_age', {age: Math.floor(c.ageAtStart)}) : translate('yg_age', {from: Math.floor(c.ageAtStart), to: Math.floor(c.ageAtEnd)})}</p>
                                    <h3><span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[c.transit])}</span> {t?.name ?? name(c.transit)}</h3>
                                    <p className={classes.fact}>{formatLocal(c.start, false)} – {formatLocal(c.end, false)}</p>
                                    {t?.text ? <p className={classes.text}>{t.text}</p> : null}
                                </li>
                            );
                        })}
                    </ul>
                ) : <p className={classes.muted}>{translate('yg_none')}</p>
            ) : null}
            <p className={classes.note}>{translate('yg_note')}</p>
        </section>
    );
};

export default YearStagesComponent;
