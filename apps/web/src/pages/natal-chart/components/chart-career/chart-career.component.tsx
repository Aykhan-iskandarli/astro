import {useMemo} from 'react';
import {houseSentence} from '@astra/content';
import {Alert} from 'antd';
import {ASPECT_GLYPHS, formatDegree, formatOrb, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import {areaHouses, aspectsToPoint, significators} from 'core/helpers/areas';
import {useStore} from 'store/store.config';
import useLocalization, {useContent} from 'assets/lang';
import {useChartCareerStyles} from './chart-career.style';
import {IChartCareer} from './chart-career';

const SIGNIFICATORS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

// Career read the traditional way: the Midheaven (sign, planets touching it) and the ruler of the 10th house with where
// it stands, the planets in the 10th, the 6th house of daily work, and the condition of the planets that signify work.
const ChartCareerComponent = ({chart}: IChartCareer) => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useChartCareerStyles();
    const known = !chart.timeUnknown;
    const mc = chart.angles.find((a) => a.id === 'mc') ?? null;

    const houses = useMemo(() => areaHouses(chart, [10, 6]), [chart]);
    const tenth = houses.find((h) => h.house === 10);
    const sixth = houses.find((h) => h.house === 6);
    const touching = useMemo(() => (known ? aspectsToPoint(chart.points, mc?.longitude) : []), [chart.points, mc, known]);
    const sig = useMemo(() => significators(chart, SIGNIFICATORS), [chart]);
    const text = content.career as unknown as {
        mc: Record<string, string>; ruler: Record<string, string>; planet: Record<string, string>;
        professions: {sign: Record<string, string>; planet: Record<string, string>};
    };
    const sun = chart.points.find((p) => p.id === 'sun') ?? null;
    // Where the suggestions come from: the MC sign, the ruler of the 10th, the planets in it (or the Sun sign without a birth time)
    const professions = useMemo(() => {
        const out: {key: string; label: string; list: string}[] = [];
        const p = (content.career as unknown as {professions: {sign: Record<string, string>; planet: Record<string, string>}}).professions;
        const nm = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;
        const sg = (id: string) => content.signs[id as keyof typeof content.signs]?.name ?? id;
        if (known && mc?.sign) out.push({key: 'mc', label: translate('career_prof_mc', {sign: sg(mc.sign)}), list: p.sign[mc.sign]});
        const ruler = tenth?.rulers.find((r) => r.kind !== 'modern');
        if (ruler?.id && p.planet[ruler.id]) out.push({key: 'ruler', label: translate('career_prof_ruler', {planet: nm(ruler.id)}), list: p.planet[ruler.id]});
        (tenth?.occupants ?? []).filter((id) => p.planet[id] && id !== ruler?.id)
            .forEach((id) => out.push({key: `in-${id}`, label: translate('career_prof_in', {planet: nm(id)}), list: p.planet[id]}));
        if (!known && sun?.sign) out.push({key: 'sun', label: translate('career_prof_sun', {sign: sg(sun.sign)}), list: p.sign[sun.sign]});
        return out;
    }, [content, known, mc, tenth, sun, translate]);

    const name = (id: string | null) => (id ? content.points[id as keyof typeof content.points]?.name ?? id : '');
    const sign = (id: string | null) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : '');
    const house = (n: number | null) => (n ? content.houses[String(n) as keyof typeof content.houses]?.name ?? '' : '');
    const dignity = (id: string | null) => (id ? content.dignities[id as keyof typeof content.dignities] : null);
    const g = (id: string | null) => glyph(POINT_GLYPHS[id ?? '']);

    return (
        <section className={classes.wrap} aria-labelledby='sec-career'>
            <h2 id='sec-career' className={classes.title}>{translate('career_title')}</h2>
            <p className={classes.muted}>{translate('career_intro')}</p>
            {!known ? <Alert type='info' showIcon title={translate('career_time_unknown')}/> : null}
            <div className={classes.grid}>
                {professions.length ? (
                    <article className={classes.card}>
                        <p className={classes.label}>{translate('career_prof_title')}</p>
                        {professions.map((x) => (
                            <div key={x.key}>
                                <p className={classes.fact}>{x.label}</p>
                                <p className={classes.text}>{x.list}</p>
                            </div>
                        ))}
                        <p className={classes.muted}>{translate('career_prof_note')}</p>
                    </article>
                ) : null}

                {known && mc ? (
                    <article className={classes.card}>
                        <p className={classes.label}>{translate('career_mc')}</p>
                        <h3>
                            <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[mc.sign!])}</span> {sign(mc.sign)}{' '}
                            <span className={classes.fact}>{formatDegree(mc.degree, mc.minute)}</span>
                        </h3>
                        <p className={classes.text}>{text.mc[mc.sign!]}</p>
                        {touching.length ? (
                            <>
                                <h3>{translate('career_mc_aspects')}</h3>
                                <ul className={classes.list}>
                                    {touching.map((t) => (
                                        <li key={t.id}>
                                            <span className='glyph' aria-hidden='true'>{g(t.id)}</span> {name(t.id)}{' '}
                                            <span className='glyph' aria-hidden='true'>{glyph(ASPECT_GLYPHS[t.aspect])}</span>{' '}
                                            {content.aspects[t.aspect as keyof typeof content.aspects]?.name.toLowerCase()} · {formatOrb(t.orb)}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : null}
                    </article>
                ) : null}

                {tenth ? (
                    <article className={classes.card}>
                        <p className={classes.label}>{translate('career_ruler')}</p>
                        {tenth.rulers.map((r) => (
                            <div key={`${r.id}-${r.kind}`}>
                                <h3>
                                    <span className='glyph' aria-hidden='true'>{g(r.id)}</span> {name(r.id)}
                                    {r.kind === 'modern' ? ` (${translate('career_modern')})` : ''}
                                </h3>
                                <p className={classes.fact}>
                                    <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[r.sign ?? ''])}</span> {sign(r.sign)}
                                    {r.house ? ` · ${house(r.house)}` : ''}
                                    {r.dignity ? ` · ${dignity(r.dignity)?.name}` : ''}
                                    {r.retrograde ? ` · ${translate('retrograde')}` : ''}
                                </p>
                                {r.house && r.kind !== 'modern' ? <p className={classes.text}>{text.ruler[String(r.house)]}</p> : null}
                            </div>
                        ))}
                    </article>
                ) : null}

                {tenth ? (
                    <article className={classes.card}>
                        <p className={classes.label}>{translate('career_tenth')}</p>
                        <p className={classes.fact}>{translate('career_cusp', {house: house(10), sign: sign(tenth.cuspSign)})}</p>
                        {tenth.occupants.length ? tenth.occupants.map((id) => (
                            <p key={id} className={classes.text}>
                                <strong>{g(id)} {name(id)}.</strong> {houseSentence(locale, id, 10)}
                            </p>
                        )) : <p className={classes.text}>{translate('career_tenth_empty')}</p>}
                    </article>
                ) : null}

                {sixth ? (
                    <article className={classes.card}>
                        <p className={classes.label}>{translate('career_sixth')}</p>
                        <p className={classes.fact}>
                            {translate('career_cusp', {house: house(6), sign: sign(sixth.cuspSign)})}
                            {sixth.rulers[0]?.house ? ` · ${translate('career_ruler_in', {planet: name(sixth.rulers[0].id), house: house(sixth.rulers[0].house)})}` : ''}
                        </p>
                        {sixth.occupants.length ? sixth.occupants.map((id) => (
                            <p key={id} className={classes.text}>
                                <strong>{g(id)} {name(id)}.</strong> {houseSentence(locale, id, 6)}
                            </p>
                        )) : <p className={classes.text}>{translate('career_sixth_text')}</p>}
                    </article>
                ) : null}

                <article className={classes.card}>
                    <p className={classes.label}>{translate('career_planets')}</p>
                    {sig.map((s) => (
                        <div key={s.id}>
                            <p className={classes.fact}>
                                <span className='glyph' aria-hidden='true'>{g(s.id)}</span> {name(s.id)} · {sign(s.sign)}
                                {s.house ? ` · ${house(s.house)}` : ''}
                                {s.dignity ? ` · ${dignity(s.dignity)?.name}` : ''}
                                {s.retrograde ? ` · ${translate('retrograde')}` : ''}
                            </p>
                            <p className={classes.text}>{text.planet[s.id]}</p>
                        </div>
                    ))}
                </article>
            </div>
            <p className={classes.note}>{translate('career_note')}</p>
        </section>
    );
};

export default ChartCareerComponent;
