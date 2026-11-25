import {useMemo} from 'react';
import {aspectPairText} from '@astra/content';
import {formatLocal} from 'core/helpers/astro';
import {dominantHouse, inMonth, staysInMonth} from 'core/helpers/year-rhythm';
import {topTransits} from 'core/helpers/year-summary';
import {useStore} from 'store/store.config';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import TransitAdviceComponent from 'core/shared/transit-advice/transit-advice.component';
import {useYearPartsStyles} from '../year-parts.style';
import {IYearRhythm} from './year-rhythm';

const QUICK = ['mercury', 'venus', 'mars'];

// The year month by month: the house the Sun passes through (the month's focus), the New and Full Moon with their
// house, the quick planets' houses and the heaviest exact transit. Everything is cut from the year forecast.
const YearRhythmComponent = ({data}: IYearRhythm) => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useYearPartsStyles();

    const months = useMemo(() => {
        const house = (n: number | null) => (n ? content.houses[String(n) as keyof typeof content.houses] : null);
        const read = content.lunationReading as {new: Record<string, string>; full: Record<string, string>};
        return Array.from({length: 12}, (_, i) => {
            const m = i + 1;
            const sunStays = data.fastPlanets?.sun ? staysInMonth(data.fastPlanets.sun, data.year, m) : [];
            const focus = house(dominantHouse(sunStays));
            return {
                m,
                sunStays,
                focus,
                moons: inMonth(data.lunations.filter((l) => l.phase === 'new' || l.phase === 'full'), m),
                quick: QUICK.map((id) => ({id, house: house(dominantHouse(data.fastPlanets?.[id] ? staysInMonth(data.fastPlanets[id], data.year, m) : []))})),
                top: topTransits(inMonth(data.transits, m), 1)[0] ?? null,
                hits: data.months.find((x) => x.month === m)?.slowHits ?? 0,
                reading: (l: {phase: string | null; house: number | null}) => (l.house && (l.phase === 'new' || l.phase === 'full') ? read[l.phase][String(l.house)] : null),
            };
        });
    }, [data, content]);

    const house = (n: number) => content.houses[String(n) as keyof typeof content.houses]?.name ?? '';
    const name = (id: string | null) => (id ? content.points[id as keyof typeof content.points]?.name ?? id : '');
    // the month cuts are UTC instants, so the day and month are read from the stamp itself
    const day = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;

    return (
        <section className={classes.wrap} aria-labelledby='sec-rhythm'>
            <h2 id='sec-rhythm' className={classes.title}>{translate('yr_title')}</h2>
            <p className={classes.muted}>{translate('yr_intro')}</p>
            <ol className={classes.list}>
                {months.map((x) => (
                    <li key={x.m} className={classes.card}>
                        <h3>{translate(`month_${x.m}` as ITranslationKey)}</h3>
                        {x.focus ? (
                            <div>
                                <p className={classes.label}>{translate('yr_focus')}</p>
                                <h4>
                                    {x.sunStays.map((s) => `${house(s.house)} (${day(s.from)}–${day(new Date(Date.parse(s.to) - 1).toISOString())})`).join(' → ')}
                                </h4>
                                <p className={classes.text}>{x.focus.theme}</p>
                            </div>
                        ) : null}
                        {x.moons.map((l) => (
                            <div key={`${l.phase}-${l.at}`}>
                                <p className={classes.label}>{translate(`lunation_${l.phase}` as ITranslationKey)} · {formatLocal(l.at, false)}{l.eclipse ? ` · ${translate(`eclipse_${l.eclipse.kind}` as ITranslationKey)}` : ''}</p>
                                {l.house ? <h4>{content.houses[String(l.house) as keyof typeof content.houses]?.name}</h4> : null}
                                {x.reading(l) ? <p className={classes.text}>{x.reading(l)}</p> : null}
                            </div>
                        ))}
                        {x.quick.some((q) => q.house) ? (
                            <div>
                                <p className={classes.label}>{translate('yr_quick')}</p>
                                <p className={classes.chips}>
                                    {x.quick.filter((q) => q.house).map((q) => <span key={q.id} className={classes.chip}>{name(q.id)} · {q.house!.name}</span>)}
                                </p>
                            </div>
                        ) : null}
                        {x.top ? (
                            <div>
                                <p className={classes.label}>{translate('yr_top_transit')} · {formatLocal(x.top.at, false)}</p>
                                <h4>{name(x.top.transit)} {content.aspects[x.top.aspect as keyof typeof content.aspects]?.name.toLowerCase()} {translate('natal_word')} {name(x.top.natal)}</h4>
                                <p className={classes.text}>{aspectPairText(locale, x.top.transit!, x.top.natal!, x.top.aspect!)}</p>
                                <TransitAdviceComponent transit={x.top.transit!} aspect={x.top.aspect!}/>
                            </div>
                        ) : null}
                        <p className={classes.muted}>{translate('year_month_hits', {n: x.hits})}</p>
                    </li>
                ))}
            </ol>
            <p className={classes.note}>{translate('yr_note')}</p>
        </section>
    );

};

export default YearRhythmComponent;
