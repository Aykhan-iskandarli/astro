import {useCallback, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {Button, Select} from 'antd';
import {aspectPairText} from '@astra/content';
import {ASPECT_GLYPHS, aspectTone, formatOrb, glyph, POINT_GLYPHS} from 'core/helpers/astro';
import {useStore} from 'store/store.config';
import {IBirthInput} from 'store/store';
import {Routes} from 'router/routes';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization, {useContent} from 'assets/lang';
import {useGetTransits} from 'pages/natal-chart/actions/natal-chart.query';
import {usePersonalTransitsStyles} from './personal-transits.style';

const CURRENT = 'current';
const MAX_ITEMS = 8;

// Today's transits to one of the user's charts: the chart open in this session, or one they saved.
const PersonalTransitsComponent = () => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const birthInput = useStore('birthInput');
    const saved = useStore('savedCharts');
    const classes = usePersonalTransitsStyles();
    const [choice, setChoice] = useState<string>(birthInput ? CURRENT : saved[0]?.id ?? CURRENT);
    const [now] = useState(() => new Date().toISOString());

    const input: IBirthInput | null = choice === CURRENT ? birthInput : saved.find((s) => s.id === choice)?.input ?? null;
    const {data, isFetching} = useGetTransits(input, now);

    const options = useMemo(() => [
        ...(birthInput ? [{value: CURRENT, label: birthInput.name || translate('today_current_chart')}] : []),
        ...saved.map((s) => ({value: s.id, label: `${s.input.name || translate('unnamed_chart')} · ${s.input.date.split('-').reverse().join('.')}`})),
    ], [birthInput, saved, translate]);

    const handleChoice = useCallback((v: string) => {
        setChoice(v);
    }, []);

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
                <Select className={classes.select} value={choice} options={options} onChange={handleChoice}
                        aria-label={translate('today_choose_chart')}/>
            ) : null}
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
                                {aspectPairText(locale, a.p1!, a.p2!) ? <p className={classes.text}>{aspectPairText(locale, a.p1!, a.p2!)}</p> : null}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : <p className={classes.meta}>{translate('today_no_transits')}</p>}
        </div>
    );
};

export default PersonalTransitsComponent;
