import {useMemo} from 'react';
import {aspectPairText, placementText} from '@astra/content';
import {formatOrb} from 'core/helpers/astro';
import {chartShape, strengths, temperament} from 'core/helpers/depth';
import {powerSummary} from 'core/helpers/power';
import {buildPortrait} from 'core/helpers/portrait';
import {useStore} from 'store/store.config';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {useChartSummaryStyles} from './chart-summary.style';
import {IChartSummary} from './chart-summary';

interface IItem {
    key: string;
    label: ITranslationKey;
    title: string;
    fact?: string;
    texts: (string | null | undefined)[];
}

// The ten things an astrologer notices first, gathered from the analyses already on this tab. Each one is counted
// from the chart; when a part is missing (no birth time, no shape) it is simply left out, so there may be fewer than ten.
const ChartSummaryComponent = ({chart}: IChartSummary) => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useChartSummaryStyles();
    const known = !chart.timeUnknown;

    const items = useMemo<IItem[]>(() => {
        const name = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;
        const sign = (id: string | null) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : '');
        const house = (n: number | null) => (n ? content.houses[String(n) as keyof typeof content.houses]?.name ?? '' : '');
        const point = (id: string) => chart.points.find((p) => p.id === id) ?? null;
        const asc = known ? chart.angles.find((a) => a.id === 'asc') ?? null : null;
        const reading = content.reading as {planet: Record<string, string>};
        const depth = content.depth as {shape: Record<string, string>; temperament: Record<string, string>};
        const portraitText = content.portrait as {chartRuler: Record<string, string>; half: Record<string, string>};
        const karmic = content.karmic;
        const sp = content.saturnPluto as unknown as Record<string, {sign: Record<string, string>; house: Record<string, string>}>;
        const out: IItem[] = [];

        const sun = point('sun');
        const moon = point('moon');
        if (sun?.sign && moon?.sign) {
            out.push({
                key: 'big3', label: 'sum_big3',
                title: [`${name('sun')} ${sign(sun.sign)}`, `${name('moon')} ${sign(moon.sign)}`, asc?.sign ? `${translate('portrait_asc')} ${sign(asc.sign)}` : null].filter(Boolean).join(' · '),
                texts: [placementText(locale, 'sun', sun.sign), placementText(locale, 'moon', moon.sign), asc?.sign ? placementText(locale, 'asc', asc.sign) : null],
            });
        }

        const portrait = buildPortrait({
            points: chart.points, firstHouseRulers: chart.houses[0]?.rulers ?? [], ascSign: asc?.sign ?? null, sect: chart.sect, timeUnknown: chart.timeUnknown,
        });
        const ruler = portrait.chartRuler.find((r) => r.kind !== 'modern') ?? portrait.chartRuler[0];
        if (ruler?.id) {
            out.push({
                key: 'ruler', label: 'sum_ruler', title: `${name(ruler.id)} · ${sign(ruler.sign)}${ruler.house ? ` · ${house(ruler.house)}` : ''}`,
                texts: [ruler.house ? portraitText.chartRuler[String(ruler.house)] : null],
            });
        }

        const power = powerSummary({
            points: chart.points, aspects: chart.aspects, ascRuler: chart.houses[0]?.rulers.find((r) => r.kind !== 'modern')?.id ?? null,
            sect: chart.sect, timeUnknown: chart.timeUnknown,
        });
        const score = (id: string) => power.rows.find((r) => r.id === id)!.score;
        const signed = (n: number) => (n > 0 ? `+${n}` : String(n));
        if (power.strongest[0]) out.push({key: 'strong', label: 'sum_strongest', title: `${name(power.strongest[0])} ${signed(score(power.strongest[0]))}`, texts: [reading.planet[power.strongest[0]]]});
        if (power.weakest[0]) out.push({key: 'weak', label: 'sum_weakest', title: `${name(power.weakest[0])} ${signed(score(power.weakest[0]))}`, texts: [reading.planet[power.weakest[0]]]});

        const shape = chartShape(chart.points);
        if (shape) out.push({key: 'shape', label: 'sum_shape', title: translate(`depth_shape_${shape.shape}` as ITranslationKey), texts: [depth.shape[shape.shape]]});

        const temper = temperament(chart.points, asc?.sign ?? null);
        out.push({
            key: 'temper', label: 'sum_temperament', title: temper.dominant.map((t) => translate(`depth_temperament_${t}` as ITranslationKey)).join(' · '),
            texts: temper.dominant.map((t) => depth.temperament[t]),
        });

        const tight = strengths(chart.points, chart.aspects).tightest[0];
        if (tight?.p1 && tight.p2 && tight.type) {
            out.push({
                key: 'aspect', label: 'sum_aspect',
                title: `${name(tight.p1)} ${content.aspects[tight.type as keyof typeof content.aspects]?.name.toLowerCase()} ${name(tight.p2)}`,
                fact: formatOrb(tight.orb ?? 0), texts: [aspectPairText(locale, tight.p1, tight.p2, tight.type)],
            });
        }

        const north = point('northNode');
        if (north?.sign) {
            const axis = karmic.nodeAxis[north.sign as keyof typeof karmic.nodeAxis];
            const nodeHouse = known && north.house ? karmic.nodeHouse[String(north.house) as keyof typeof karmic.nodeHouse] : null;
            out.push({
                key: 'node', label: 'sum_node', title: `${name('northNode')} · ${sign(north.sign)}${known && north.house ? ` · ${house(north.house)}` : ''}`,
                texts: [axis?.future, nodeHouse?.future],
            });
        }

        const saturn = point('saturn');
        if (saturn?.sign) {
            out.push({
                key: 'saturn', label: 'sum_saturn', title: `${name('saturn')} · ${sign(saturn.sign)}${known && saturn.house ? ` · ${house(saturn.house)}` : ''}`,
                texts: [sp.saturn.sign[saturn.sign], known && saturn.house ? sp.saturn.house[String(saturn.house)] : null],
            });
        }

        const stellium = portrait.stelliumSigns[0];
        if (stellium) {
            out.push({
                key: 'focus', label: 'sum_focus', title: `${sign(stellium.sign)} · ${stellium.points.map(name).join(', ')}`,
                texts: [translate('portrait_stellium_sign', {n: stellium.points.length, sign: sign(stellium.sign), planets: stellium.points.map(name).join(', '), keywords: content.signs[stellium.sign as keyof typeof content.signs]?.keywords ?? ''})],
            });
        } else if (portrait.emphasis.length) {
            out.push({key: 'focus', label: 'sum_focus', title: translate(`sum_half_${portrait.emphasis[0]}` as ITranslationKey), texts: portrait.emphasis.map((h) => portraitText.half[h])});
        } else if (portrait.retrogrades.length) {
            out.push({key: 'focus', label: 'sum_focus', title: translate('sum_retro', {n: portrait.retrogrades.length}), texts: [portrait.retrogrades.map(name).join(', ')]});
        }
        return out;
    }, [chart, content, known, locale, translate]);

    return (
        <section className={classes.wrap} aria-labelledby='sec-summary'>
            <h2 id='sec-summary' className={classes.title}>{translate('sum_title')}</h2>
            <p className={classes.muted}>{translate('sum_intro')}</p>
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
            <p className={classes.note}>{translate('sum_note', {n: items.length})}</p>
        </section>
    );
};

export default ChartSummaryComponent;
