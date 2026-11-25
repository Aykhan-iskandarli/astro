import {useCallback, useMemo, useState} from 'react';
import {Segmented} from 'antd';
import classNames from 'classnames';
import {aspectPairText} from '@astra/content';
import {ASPECT_GLYPHS, aspectTone, formatLocal, glyph, POINT_GLYPHS} from 'core/helpers/astro';
import {useStore} from 'store/store.config';
import LoaderComponent from 'core/shared/loader/loader.component';
import TransitAdviceComponent from 'core/shared/transit-advice/transit-advice.component';
import useLocalization, {useContent} from 'assets/lang';
import {useGetTimeline} from 'pages/natal-chart/actions/natal-chart.query';
import {useUpcomingPersonalStyles} from './upcoming-personal.style';
import {IUpcomingPersonal} from './upcoming-personal';

const SPANS = [7, 30];

// The coming week or month in the user's chart: every exact transit of Mars to Pluto to the natal points, by date,
// with its reading and a practical note. The dates come from the transit timeline of the engine.
const UpcomingPersonalComponent = ({input, today}: IUpcomingPersonal) => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useUpcomingPersonalStyles();
    const [days, setDays] = useState(7);
    const handleDays = useCallback((v: string | number) => {
        setDays(Number(v));
    }, []);
    const spans = useMemo(() => SPANS.map((n) => ({value: n, label: translate('up_days', {n})})), [translate]);
    const {data, isFetching, isError} = useGetTimeline(input, today, days, true, true);

    const name = (id: string | null) => (id ? content.points[id as keyof typeof content.points]?.name
        ?? (id === 'asc' ? content.houses['1']?.name : id === 'mc' ? 'MC' : id) : '');
    const events = useMemo(() => [...(data?.events ?? [])].sort((a, b) => (a.at ?? '').localeCompare(b.at ?? '')), [data]);

    return (
        <div className={classes.wrap}>
            <div className={classes.head}>
                <h3 className={classes.sub}>{translate('up_title')}</h3>
                <Segmented value={days} onChange={handleDays} options={spans}/>
            </div>
            <p className={classes.meta}>{translate('up_intro')}</p>
            {isError ? <p className={classes.meta}>{translate('up_error')}</p> : null}
            {isFetching && !data ? <LoaderComponent/> : null}
            {data ? (
                events.length ? (
                    <ul className={classNames(classes.list, {[classes.busy]: isFetching})}>
                        {events.map((e) => (
                            <li key={`${e.transit}-${e.natal}-${e.aspect}-${e.at}`} className={classes.item}>
                                <time dateTime={e.at ?? undefined} className={classes.when}>{formatLocal(e.at)}</time>
                                <p className={classes.title}>
                                    <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[e.transit!])}</span>{` ${name(e.transit)} `}
                                    <span className={classNames('glyph', classes[aspectTone(e.aspect!)])} aria-hidden='true'>{glyph(ASPECT_GLYPHS[e.aspect!])}</span>
                                    <strong>{` ${content.aspects[e.aspect as keyof typeof content.aspects]?.name.toLowerCase()} `}</strong>
                                    {`${translate('natal_word')} `}
                                    <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[e.natal!])}</span>{` ${name(e.natal)}`}
                                </p>
                                {aspectPairText(locale, e.transit!, e.natal!, e.aspect!) ? <p className={classes.text}>{aspectPairText(locale, e.transit!, e.natal!, e.aspect!)}</p> : null}
                                <TransitAdviceComponent transit={e.transit!} aspect={e.aspect!}/>
                            </li>
                        ))}
                    </ul>
                ) : <p className={classes.meta}>{translate('up_none', {n: days})}</p>
            ) : null}
        </div>
    );
};

export default UpcomingPersonalComponent;
