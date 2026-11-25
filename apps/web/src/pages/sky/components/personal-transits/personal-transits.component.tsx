import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Button, Select} from 'antd';
import {aspectPairText} from '@astra/content';
import {ASPECT_GLYPHS, aspectTone, formatOrb, glyph, POINT_GLYPHS} from 'core/helpers/astro';
import {useStore} from 'store/store.config';
import {Routes} from 'router/routes';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization, {useContent} from 'assets/lang';
import {useChartChoice} from 'core/helpers/use-chart-choice';
import {useGetTransits} from 'pages/natal-chart/actions/natal-chart.query';
import PersonalMoonDayComponent from '../personal-moon-day/personal-moon-day.component';
import PersonalLunationsComponent from '../personal-lunations/personal-lunations.component';
import UpcomingPersonalComponent from '../upcoming-personal/upcoming-personal.component';
import TransitReadingComponent from 'pages/natal-chart/components/transit-reading/transit-reading.component';
import {usePersonalTransitsStyles} from './personal-transits.style';

const MAX_ITEMS = 8;

// Today's transits to one of the user's charts: the chart open in this session, or one they saved.
const PersonalTransitsComponent = () => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = usePersonalTransitsStyles();
    const {input, options, choice, onChoice} = useChartChoice();
    const [now] = useState(() => new Date().toISOString());
    const [today] = useState(() => new Date().toLocaleDateString('en-CA')); // local date, YYYY-MM-DD
    const {data, isFetching} = useGetTransits(input, now);

    const name = (id: string | null) => (id ? content.points[id as keyof typeof content.points]?.name ?? id : '');
    const aspects = [...(data?.aspects ?? [])].sort((a, b) => (a.orb ?? 9) - (b.orb ?? 9)).slice(0, MAX_ITEMS);

    if (!input) {
        return (
            <div className={classes.empty}>
                <p>{translate('today_no_chart')}</p>
                <Link to={Routes.natalChart}><Button type='primary'>{translate('hero_cta')}</Button></Link>
            </div>
        );
    }

    return (
        <div className={classes.wrap}>
            {options.length > 1 ? (
                <Select className={classes.select} value={choice} options={options} onChange={onChoice}
                        aria-label={translate('today_choose_chart')}/>
            ) : null}
            <PersonalMoonDayComponent input={input}/>
            <h3 className={classes.sub}>{translate('transits_today_title')}</h3>
            {isFetching && !data ? <LoaderComponent/> : aspects.length ? (
                <ul className={classes.list}>
                    {aspects.map((a) => (
                        <li key={`${a.p1}-${a.p2}-${a.type}`} className={classes.item}>
                            <span className={`glyph ${classes.tone} ${classes[aspectTone(a.type!)]}`} aria-hidden='true'>
                                {glyph(ASPECT_GLYPHS[a.type!])}
                            </span>
                            <div>
                                <p className={classes.title}>
                                    <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[a.p1!])}</span>
                                    {` ${name(a.p1)} `}
                                    <strong>{content.aspects[a.type as keyof typeof content.aspects]?.name.toLowerCase()}</strong>
                                    {` ${translate('natal_word')} `}
                                    <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[a.p2!])}</span>
                                    {` ${name(a.p2)}`}
                                </p>
                                <p className={classes.meta}>
                                    {formatOrb(a.orb!)}
                                    {a.applying !== null ? ` · ${translate(a.applying ? 'applying' : 'separating')}` : ''}
                                </p>
                                {aspectPairText(locale, a.p1!, a.p2!, a.type!) ? <p className={classes.text}>{aspectPairText(locale, a.p1!, a.p2!, a.type!)}</p> : null}
                                <TransitReadingComponent transit={a.p1!} natal={a.p2!} aspect={a.type!}/>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : <p className={classes.meta}>{translate('today_no_transits')}</p>}
            <UpcomingPersonalComponent input={input} today={today}/>
            <h3 className={classes.sub}>{translate('lunations_personal_title')}</h3>
            <p className={classes.meta}>{translate('lunations_personal_intro')}</p>
            <PersonalLunationsComponent input={input} start={today} days={62} limit={4}/>
        </div>
    );
};

export default PersonalTransitsComponent;
