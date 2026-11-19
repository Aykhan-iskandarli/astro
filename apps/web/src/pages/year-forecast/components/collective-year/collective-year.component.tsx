import {Alert} from 'antd';
import {ASPECT_GLYPHS, aspectTone, formatLocal, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization, {useContent} from 'assets/lang';
import {useGetCollective} from 'pages/sky/actions/sky.query';
import {CollectiveStayModel} from 'pages/sky/models/collective.model';
import {useCollectiveYearStyles} from './collective-year.style';
import {ICollectiveYear} from './collective-year';

// From the slowest (deepest) planet to the quickest: the order in which the year's tone is read.
const ORDER = ['pluto', 'neptune', 'uranus', 'saturn', 'jupiter', 'northNode'];

type Texts = {
    role: Record<string, string>;
    areas: Record<string, string>;
    signs: Record<string, Record<string, string>>;
    pairs: Record<string, string>;
    kinds: Record<string, string>;
    eclipse: Record<string, string>;
    retro: Record<string, string>;
};

// What the year holds for society, independent of any birth chart: the sign each slow planet stands in (the era's
// spirit), their exact aspects to each other, the eclipses and the retrogrades. The sky comes from the engine.
function CollectiveYearComponent({year}: ICollectiveYear) {
    const translate = useLocalization();
    const content = useContent();
    const classes = useCollectiveYearStyles();
    const {data, isFetching, isError} = useGetCollective(year);
    const c = content.collective as unknown as Texts;

    const name = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;
    const sign = (id: string | null) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : '');
    const range = (s: CollectiveStayModel) => {
        if (!s.start && !s.end) return translate('col_whole_year');
        return `${s.start ? formatLocal(s.start, false) : translate('year_from_start')} – ${s.end ? formatLocal(s.end, false) : translate('year_to_end')}`;
    };
    const pairKey = (planets: string[]) => planets.join('_');

    return (
        <section className={classes.wrap} aria-labelledby='sec-collective'>
            <div className={classes.block}>
                <h2 id='sec-collective' className={classes.title}>{translate('col_title')}</h2>
                <p className={classes.muted}>{translate('col_intro')}</p>
            </div>

            {isError ? <Alert type='error' showIcon title={translate('col_error')}/> : null}
            {!data && isFetching ? <LoaderComponent/> : null}

            {data ? (
                <>
                    <div className={classes.block}>
                        <h3>{translate('col_era')}</h3>
                        <p className={classes.muted}>{translate('col_era_intro')}</p>
                        <div className={classes.grid}>
                            {ORDER.map((id) => data.positions.find((p) => p.id === id)).filter((p) => !!p).map((p) => (
                                <article key={p!.id} className={classes.card}>
                                    <h4><span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[p!.id])}</span> {name(p!.id)}</h4>
                                    <p className={classes.role}>{c.role[p!.id]}</p>
                                    {p!.stays.map((s) => (
                                        <div key={`${s.sign}-${s.start}`}>
                                            <p className={classes.fact}>
                                                <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[s.sign!])}</span> {sign(s.sign)} · {range(s)}
                                            </p>
                                            <p className={classes.text}>{c.signs[p!.id]?.[s.sign!]}</p>
                                        </div>
                                    ))}
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className={classes.block}>
                        <h3>{translate('col_aspects')}</h3>
                        <p className={classes.muted}>{translate('col_aspects_intro')}</p>
                        {data.aspects.length ? (
                            <div className={classes.grid}>
                                {data.aspects.map((a) => (
                                    <article key={`${pairKey(a.planets)}-${a.aspect}-${a.at}`} className={classes.card}>
                                        <h4>
                                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[a.planets[0]])}</span>
                                            <span className={`glyph ${classes[aspectTone(a.aspect)]}`} aria-hidden='true'>{` ${glyph(ASPECT_GLYPHS[a.aspect])} `}</span>
                                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[a.planets[1]])}</span>
                                            {` ${name(a.planets[0])} ${content.aspects[a.aspect as keyof typeof content.aspects]?.name.toLowerCase()} ${name(a.planets[1])}`}
                                        </h4>
                                        <p className={classes.fact}>
                                            {formatLocal(a.at, false)}
                                            {a.passes > 1 ? ` · ${translate('timeline_pass', {n: a.pass, total: a.passes})}` : ''}
                                        </p>
                                        <p className={classes.text}>{c.pairs[pairKey(a.planets)]}</p>
                                        <p className={classes.role}>{c.kinds[a.aspect]}</p>
                                    </article>
                                ))}
                            </div>
                        ) : <p className={classes.muted}>{translate('col_aspects_none')}</p>}
                    </div>

                    <div className={classes.block}>
                        <h3>{translate('col_eclipses')}</h3>
                        <p className={classes.muted}>{translate('col_eclipses_intro')}</p>
                        {data.eclipses.length ? (
                            <div className={classes.grid}>
                                {data.eclipses.map((e) => (
                                    <article key={`${e.kind}-${e.at}`} className={classes.card}>
                                        <h4>{translate(`eclipse_${e.kind}` as 'eclipse_solar')} · {translate(`eclipse_type_${e.type}` as 'eclipse_type_total')}</h4>
                                        <p className={classes.fact}>
                                            {formatLocal(e.at, false)} · <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[e.sign!])}</span> {sign(e.sign)}
                                        </p>
                                        <p className={classes.text}>{c.eclipse[e.kind]}</p>
                                        <p className={classes.text}>{translate('col_eclipse_theme', {areas: c.areas[e.sign!] ?? ''})}</p>
                                        <p className={classes.role}>{c.eclipse[e.type]}</p>
                                    </article>
                                ))}
                            </div>
                        ) : <p className={classes.muted}>{translate('col_eclipses_none')}</p>}
                    </div>

                    <div className={classes.block}>
                        <h3>{translate('col_retro')}</h3>
                        <p className={classes.muted}>{translate('col_retro_intro')}</p>
                        {data.retrogrades.length ? (
                            <div className={classes.grid}>
                                {data.retrogrades.map((r) => (
                                    <article key={`${r.planet}-${r.start}`} className={classes.card}>
                                        <h4><span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[r.planet])}</span> {name(r.planet)}</h4>
                                        <p className={classes.fact}>
                                            {r.startClipped ? translate('year_from_start') : formatLocal(r.start, false)} – {r.endClipped ? translate('year_to_end') : formatLocal(r.end, false)}
                                        </p>
                                        <p className={classes.text}>{c.retro[r.planet]}</p>
                                    </article>
                                ))}
                            </div>
                        ) : <p className={classes.muted}>{translate('col_retro_none')}</p>}
                    </div>

                    <p className={classes.note}>{translate('col_note')}</p>
                </>
            ) : null}
        </section>
    );
}

export default CollectiveYearComponent;
