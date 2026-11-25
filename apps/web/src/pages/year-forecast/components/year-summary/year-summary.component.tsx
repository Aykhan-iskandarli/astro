import {useMemo} from 'react';
import {aspectPairText} from '@astra/content';
import {formatLocal} from 'core/helpers/astro';
import {busiestMonths, eclipsesOfYear, houseChanges, timeLordAt, topTransits} from 'core/helpers/year-summary';
import {useStore} from 'store/store.config';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {useYearSummaryStyles} from './year-summary.style';
import {IYearSummary} from './year-summary';

interface IItem {
    key: string;
    label: ITranslationKey;
    title: string;
    fact?: string;
    texts: (string | null | undefined)[];
}

// The things worth reading first in one year of the person's chart, gathered from the other parts of the year forecast
// (nothing new is calculated). A part that is missing (no birth time, no eclipse touching the chart) is left out.
const YearSummaryComponent = ({data}: IYearSummary) => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useYearSummaryStyles();

    const items = useMemo<IItem[]>(() => {
        const name = (id: string | null) => (id ? content.points[id as keyof typeof content.points]?.name ?? id : '');
        const sign = (id: string | null) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : '');
        const house = (n: number | null) => (n ? content.houses[String(n) as keyof typeof content.houses] : null);
        const month = (m: number) => translate(`month_${m}` as ITranslationKey);
        const aspect = (id: string | null) => content.aspects[id as keyof typeof content.aspects]?.name.toLowerCase() ?? '';
        const prof = content.profectionYear.house as Record<string, string>;
        const solar = content.solarReturn as {house: Record<string, string>; asc: Record<string, string>};
        const life = content.lifeline.house as Record<string, Record<string, string>>;
        const planetText = (content.reading as {planet: Record<string, string>}).planet;
        const lunation = content.lunationReading as {eclipse: Record<string, string>};
        const out: IItem[] = [];

        (data.profections ?? []).forEach((p) => {
            out.push({
                key: `prof-${p.age}`, label: 'sy_profection',
                title: `${translate('year_profection_line', {age: p.age, house: house(p.house)?.name ?? ''})} · ${name(p.lord)}`,
                fact: `${formatLocal(p.start, false)} – ${formatLocal(p.end, false)}`,
                texts: [p.house ? prof[String(p.house)] : null],
            });
        });

        const sun = data.solar.sun;
        if (sun?.sign) {
            const asc = data.solar.asc?.sign ?? null;
            out.push({
                key: 'solar', label: 'sy_solar',
                title: [`${translate('sy_solar_sun')} ${sun.house ? house(sun.house)?.name : sign(sun.sign)}`, asc ? `${translate('portrait_asc')} ${sign(asc)}` : null].filter(Boolean).join(' · '),
                fact: formatLocal(data.solar.at, false),
                texts: [sun.house ? solar.house[String(sun.house)] : null, asc ? solar.asc[asc] : null],
            });
        }

        const lord = timeLordAt(data.firdaria, data.year);
        if (lord) {
            out.push({
                key: 'lord', label: 'sy_timelord',
                title: [name(lord.major), lord.sub ? name(lord.sub) : null].filter(Boolean).join(' / '),
                texts: [planetText[lord.major]],
            });
        }

        const months = busiestMonths(data.months);
        if (months.length) {
            out.push({key: 'months', label: 'sy_months', title: months.map(month).join(' · '), texts: [translate('sy_months_text')]});
        }

        topTransits(data.transits).forEach((e) => {
            out.push({
                key: `tr-${e.transit}-${e.natal}-${e.aspect}`, label: 'sy_transit',
                title: `${name(e.transit)} ${aspect(e.aspect)} ${translate('natal_word')} ${name(e.natal)}`,
                fact: formatLocal(e.at, false),
                texts: [aspectPairText(locale, e.transit!, e.natal!, e.aspect!)],
            });
        });

        houseChanges(data.slowPlanets).forEach((c) => {
            out.push({
                key: `hc-${c.planet}`, label: 'sy_house',
                title: `${name(c.planet)}: ${house(c.from)?.name} → ${house(c.to)?.name}`,
                fact: formatLocal(c.at, false),
                texts: [life[c.planet]?.[String(c.to)]],
            });
        });

        eclipsesOfYear(data.lunations).forEach((l) => {
            const touched = l.aspects.slice(0, 2).map((a) => `${aspect(a.aspect)} ${name(a.point)}`).join(', ');
            out.push({
                key: `ecl-${l.at}`, label: 'sy_eclipse',
                title: `${translate(`eclipse_${l.eclipse!.kind}` as ITranslationKey)} (${translate(`eclipse_type_${l.eclipse!.type}` as ITranslationKey)})`,
                fact: [formatLocal(l.at, false), sign(l.sign), l.house ? house(l.house)?.name : null].filter(Boolean).join(' · '),
                texts: [house(l.house)?.theme, lunation.eclipse[l.eclipse!.kind], touched ? `${translate('sy_touches')} ${touched}.` : null],
            });
        });
        return out;
    }, [data, content, locale, translate]);

    return (
        <section className={classes.wrap} aria-labelledby='sec-ysummary'>
            <h2 id='sec-ysummary' className={classes.title}>{translate('sy_title')}</h2>
            <p className={classes.muted}>{translate('sy_intro')}</p>
            <ol className={classes.list}>
                {items.map((item, i) => (
                    <li key={item.key} className={classes.card}>
                        <span className={classes.num} aria-hidden='true'>{i + 1}</span>
                        <div className={classes.body}>
                            <p className={classes.label}>{translate(item.label)}</p>
                            <h3>{item.title}{item.fact ? <span className={classes.fact}> · {item.fact}</span> : null}</h3>
                            {item.texts.filter(Boolean).map((t) => <p key={t} className={classes.text}>{t}</p>)}
                        </div>
                    </li>
                ))}
            </ol>
            <p className={classes.note}>{translate('sy_note', {n: items.length})}</p>
        </section>
    );
};

export default YearSummaryComponent;
