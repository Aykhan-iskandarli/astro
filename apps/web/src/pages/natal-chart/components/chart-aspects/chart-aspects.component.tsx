import {useCallback, useMemo, useState} from 'react';
import {aspectPairText} from '@astra/content';
import {Segmented} from 'antd';
import {ASPECT_GLYPHS, aspectTone, formatOrb, glyph, POINT_GLYPHS} from 'core/helpers/astro';
import {useStore} from 'store/store.config';
import useLocalization, {useContent} from 'assets/lang';
import AspectReadingComponent from '../aspect-reading/aspect-reading.component';
import {useChartAspectsStyles} from './chart-aspects.style';
import {IChartAspects} from './chart-aspects';

type Filter = 'all' | 'easy' | 'hard' | 'conjunction';
const GROUP: Record<string, Filter> = {conjunction: 'conjunction', trine: 'easy', sextile: 'easy', square: 'hard', opposition: 'hard'};

// Every major aspect of the chart, closest first, each with a short line and the long reading to expand.
const ChartAspectsComponent = ({chart}: IChartAspects) => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useChartAspectsStyles();
    const [filter, setFilter] = useState<Filter>('all');

    const handleFilter = useCallback((v: string | number) => {
        setFilter(v as Filter);
    }, []);
    const options = useMemo(() => [
        {value: 'all', label: translate('aspects_all')},
        {value: 'easy', label: translate('aspects_easy')},
        {value: 'hard', label: translate('aspects_hard')},
        {value: 'conjunction', label: translate('aspects_conj')},
    ], [translate]);

    const list = useMemo(() => chart.aspects
        .filter((a) => a.major && a.type && GROUP[a.type])
        .filter((a) => filter === 'all' || GROUP[a.type!] === filter)
        .sort((a, b) => (a.orb ?? 99) - (b.orb ?? 99)), [chart.aspects, filter]);

    const name = (id: string | null) => (id ? content.points[id as keyof typeof content.points]?.name ?? id : '');

    return (
        <section className={classes.wrap} aria-labelledby='sec-aspects-reading'>
            <h2 id='sec-aspects-reading' className={classes.title}>{translate('aspects_title')}</h2>
            <p className={classes.muted}>{translate('aspects_intro')}</p>
            <div><Segmented value={filter} onChange={handleFilter} options={options}/></div>
            <ul className={classes.items}>
                {list.map((a) => (
                    <li key={`${a.p1}-${a.p2}-${a.type}`} className={classes.item}>
                        <span className={`glyph ${classes.tone} ${classes[aspectTone(a.type!)]}`} aria-hidden='true'>{glyph(ASPECT_GLYPHS[a.type!])}</span>
                        <div>
                            <p className={classes.head}>
                                <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[a.p1!])}</span> {name(a.p1)}{' '}
                                <strong>{content.aspects[a.type as keyof typeof content.aspects]?.name.toLowerCase()}</strong>{' '}
                                <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[a.p2!])}</span> {name(a.p2)}
                            </p>
                            <p className={classes.fact}>
                                {formatOrb(a.orb!)}
                                {a.applying !== null ? ` · ${translate(a.applying ? 'applying' : 'separating')}` : ''}
                            </p>
                            {aspectPairText(locale, a.p1!, a.p2!, a.type!) ? <p className={classes.text}>{aspectPairText(locale, a.p1!, a.p2!, a.type!)}</p> : null}
                            <AspectReadingComponent p1={a.p1!} p2={a.p2!} type={a.type!}/>
                        </div>
                    </li>
                ))}
            </ul>
            <p className={classes.note}>{translate('aspects_note')}</p>
        </section>
    );
};

export default ChartAspectsComponent;
