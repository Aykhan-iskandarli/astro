import {useMemo} from 'react';
import {glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import {buildPortrait, EMPHASIS_MIN, Half} from 'core/helpers/portrait';
import TermComponent from 'core/shared/term/term.component';
import useLocalization, {useContent} from 'assets/lang';
import {useChartPortraitStyles} from './chart-portrait.style';
import {IChartPortrait} from './chart-portrait';

// The first things an astrologer reads in a chart, counted from it: the chart ruler, the sect, where the planets are
// gathered (halves, stelliums), the retrograde planets and a planet that rules several of the Big Three.
const ChartPortraitComponent = ({chart}: IChartPortrait) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useChartPortraitStyles();
    const portrait = useMemo(() => buildPortrait({
        points: chart.points,
        firstHouseRulers: chart.houses[0]?.rulers ?? [],
        ascSign: chart.angles.find((a) => a.id === 'asc')?.sign ?? null,
        sect: chart.sect,
        timeUnknown: chart.timeUnknown,
    }), [chart]);
    const text = content.portrait as {chartRuler: Record<string, string>; sect: Record<string, string>; half: Record<string, string>; retrograde: Record<string, string>};

    const name = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;
    const sign = (id: string | null) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : '');
    const house = (n: number) => content.houses[String(n) as keyof typeof content.houses];
    const glyphs = (ids: string[]) => ids.map((id) => glyph(POINT_GLYPHS[id])).join(' ');
    const names = (ids: string[]) => ids.map(name).join(', ');

    const hasAny = portrait.chartRuler.length || portrait.sect || portrait.halves || portrait.stelliumSigns.length
        || portrait.retrogrades.length || portrait.rulersOfBigThree.length;
    if (!hasAny) return null;

    return (
        <section className={classes.wrap} aria-labelledby='sec-portrait'>
            <h2 id='sec-portrait' className={classes.title}>{translate('portrait_title')}</h2>
            <p className={classes.muted}>{translate('portrait_intro')}</p>
            <div className={classes.grid}>
                {portrait.chartRuler.map((r) => (
                    <article key={`${r.id}-${r.kind}`} className={classes.card}>
                        <p className={classes.label}>{translate(r.kind === 'modern' ? 'portrait_ruler_modern' : 'portrait_ruler')}</p>
                        <h3>
                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[r.id!])}</span> {name(r.id!)}
                        </h3>
                        <p className={classes.fact}>
                            <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[r.sign!])}</span> {sign(r.sign)}
                            {r.house ? ` · ${house(r.house)?.name}` : ''}
                        </p>
                        {r.house ? <p className={classes.text}>{text.chartRuler[String(r.house)]}</p> : null}
                    </article>
                ))}

                {portrait.sect ? (
                    <article className={classes.card}>
                        <p className={classes.label}><TermComponent id='sect'>{translate('portrait_sect')}</TermComponent></p>
                        <h3>{translate(portrait.sect === 'day' ? 'portrait_sect_day' : 'portrait_sect_night')}</h3>
                        <p className={classes.text}>{text.sect[portrait.sect]}</p>
                    </article>
                ) : null}

                {portrait.halves ? (
                    <article className={classes.card}>
                        <p className={classes.label}>{translate('portrait_halves')}</p>
                        <p className={classes.fact}>{translate('portrait_halves_counts', portrait.halves)}</p>
                        {portrait.emphasis.length
                            ? portrait.emphasis.map((h: Half) => <p key={h} className={classes.text}>{text.half[h]}</p>)
                            : <p className={classes.text}>{translate('portrait_balanced', {n: EMPHASIS_MIN})}</p>}
                    </article>
                ) : null}

                {portrait.stelliumSigns.map((s) => (
                    <article key={s.sign} className={classes.card}>
                        <p className={classes.label}>{translate('portrait_stellium')}</p>
                        <h3>
                            <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[s.sign])}</span> {sign(s.sign)}
                            {' '}<span className='glyph' aria-hidden='true'>{glyphs(s.points)}</span>
                        </h3>
                        <p className={classes.text}>
                            {translate('portrait_stellium_sign', {
                                n: s.points.length,
                                sign: sign(s.sign),
                                planets: names(s.points),
                                keywords: content.signs[s.sign as keyof typeof content.signs]?.keywords ?? '',
                            })}
                        </p>
                    </article>
                ))}
                {portrait.stelliumHouses.map((s) => (
                    <article key={`h${s.house}`} className={classes.card}>
                        <p className={classes.label}>{translate('portrait_stellium')}</p>
                        <h3>{house(s.house)?.name} <span className='glyph' aria-hidden='true'>{glyphs(s.points)}</span></h3>
                        <p className={classes.text}>
                            {translate('portrait_stellium_house', {n: s.points.length, house: house(s.house)?.name ?? '', planets: names(s.points), theme: house(s.house)?.theme ?? ''})}
                        </p>
                    </article>
                ))}

                {portrait.rulersOfBigThree.map((r) => (
                    <article key={r.id} className={classes.card}>
                        <p className={classes.label}>{translate('portrait_dominant')}</p>
                        <h3><span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[r.id])}</span> {name(r.id)}</h3>
                        <p className={classes.text}>
                            {translate('portrait_dominant_text', {planet: name(r.id), of: r.of.map((b) => (b === 'asc' ? translate('portrait_asc') : name(b))).join(', ')})}
                        </p>
                    </article>
                ))}

                {portrait.retrogrades.length ? (
                    <article className={classes.card}>
                        <p className={classes.label}><TermComponent id='retrograde'>{translate('portrait_retro')}</TermComponent></p>
                        {portrait.retrogrades.map((id) => (
                            <p key={id} className={classes.text}>
                                <strong>{glyph(POINT_GLYPHS[id])} {name(id)}.</strong> {text.retrograde[id]}
                            </p>
                        ))}
                    </article>
                ) : null}
            </div>
            <p className={classes.note}>{translate(chart.timeUnknown ? 'portrait_time_unknown' : 'portrait_note', {n: EMPHASIS_MIN})}</p>
        </section>
    );
};

export default ChartPortraitComponent;
