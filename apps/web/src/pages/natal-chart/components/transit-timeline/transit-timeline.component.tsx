import {useCallback, useMemo, useState} from 'react';
import {Button, Checkbox} from 'antd';
import classNames from 'classnames';
import {aspectPairText} from '@astra/content';
import {ASPECT_GLYPHS, aspectTone, formatLocal, glyph, POINT_GLYPHS} from 'core/helpers/astro';
import {useStore} from 'store/store.config';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {useGetTimeline} from '../../actions/natal-chart.query';
import {TimelineEventModel} from '../../models/timeline.model';
import {useTransitTimelineStyles} from './transit-timeline.style';

const PLANETS = ['mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const DAYS = 365;

// Exact transit dates for the next 12 months, grouped by month. Mars is off by default (it is frequent).
const TransitTimelineComponent = () => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const birthInput = useStore('birthInput');
    const classes = useTransitTimelineStyles();
    const [start] = useState(() => new Date().toISOString().slice(0, 10));
    const [planets, setPlanets] = useState<string[]>(PLANETS.slice(1));
    const {data, isFetching, isError, refetch} = useGetTimeline(birthInput, start, DAYS, true);

    const name = useCallback((id: string | null) => (id ? content.points[id as keyof typeof content.points]?.name ?? id : ''), [content]);
    const handlePlanets = useCallback((v: string[]) => setPlanets(v), []);
    const handleRetry = useCallback(() => {
        refetch();
    }, [refetch]);

    const options = useMemo(() => PLANETS.map((p) => ({value: p, label: name(p)})), [name]);

    const months = useMemo(() => {
        const groups = new Map<string, TimelineEventModel[]>();
        (data?.events ?? []).filter((e) => planets.includes(e.transit!)).forEach((e) => {
            const d = new Date(e.at!);
            const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
            groups.set(key, [...(groups.get(key) ?? []), e]);
        });
        return [...groups.entries()];
    }, [data, planets]);

    if (isError && !data) {
        return (
            <div className={classes.wrap}>
                <p className={classes.muted}>{translate('timeline_error')}</p>
                <Button onClick={handleRetry} loading={isFetching} className={classes.retry}>{translate('retry')}</Button>
            </div>
        );
    }
    if (!data) return <LoaderComponent/>;

    return (
        <div className={classNames(classes.wrap, {[classes.busy]: isFetching})}>
            <p className={classes.muted}>{translate('timeline_info')}</p>
            <Checkbox.Group options={options} value={planets} onChange={handlePlanets}/>
            {months.length ? months.map(([key, list]) => {
                const [y, m] = key.split('-').map(Number);
                return (
                    <section key={key} className={classes.month} aria-label={`${translate(`month_${m + 1}` as ITranslationKey)} ${y}`}>
                        <h3>{translate(`month_${m + 1}` as ITranslationKey)} <span className={classes.muted}>{y}</span></h3>
                        <ul className={classes.list}>
                            {list.map((e) => (
                                <li key={`${e.transit}-${e.natal}-${e.aspect}-${e.at}`} className={classes.item}>
                                    <time dateTime={e.at ?? undefined} className={classes.when}>{formatLocal(e.at, false)}</time>
                                    <span className={classNames('glyph', classes.aspect, classes[aspectTone(e.aspect!)])} aria-hidden='true'>
                                        {glyph(ASPECT_GLYPHS[e.aspect!])}
                                    </span>
                                    <div>
                                        <p>
                                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[e.transit!])}</span>
                                            {` ${name(e.transit)} `}
                                            <strong>{content.aspects[e.aspect as keyof typeof content.aspects]?.name.toLowerCase()}</strong>
                                            {` ${translate('natal_word')} `}
                                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[e.natal!])}</span>
                                            {` ${name(e.natal)}`}
                                        </p>
                                        <p className={classes.muted}>
                                            {e.passes > 1 ? translate('timeline_pass', {n: e.pass, total: e.passes}) : translate('timeline_single')}
                                            {e.retrograde ? ` · ${translate('retrograde_word')}` : ''}
                                        </p>
                                        {aspectPairText(locale, e.transit!, e.natal!) ? (
                                            <p className={classes.text}>{aspectPairText(locale, e.transit!, e.natal!)}</p>
                                        ) : null}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                );
            }) : <p className={classes.muted}>{translate('timeline_empty')}</p>}
        </div>
    );
};

export default TransitTimelineComponent;
