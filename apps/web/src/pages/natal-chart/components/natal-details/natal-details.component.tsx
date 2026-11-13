import {useStore} from 'store/store.config';
import {glyph, POINT_GLYPHS, SIGN_GLYPHS, formatDegree} from 'core/helpers/astro';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {useGetDetails} from '../../actions/natal-chart.query';
import {useExtrasStyles} from '../extras-ui/extras.style';

const dmy = (iso: string) => iso.slice(0, 10).split('-').reverse().join('.');

// Deeper natal details: dominant planets, mutual receptions, declinations (out of bounds), antiscia, prenatal eclipses.
const NatalDetailsComponent = () => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useExtrasStyles();
    const birthInput = useStore('birthInput');
    const {data} = useGetDetails(birthInput);

    if (!data) return <LoaderComponent/>;
    const name = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;
    const sign = (s: string) => content.signs[s as keyof typeof content.signs]?.name ?? s;
    const g = (id: string) => <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[id])}</span>;
    const oob = data.declinations.filter((d) => d.outOfBounds);
    const top = data.dominants.slice(0, 5);
    const maxPct = Math.max(1, ...top.map((d) => d.percentage));

    return (
        <div className={classes.wrapper}>
            <div className={classes.grid}>
                <article className={classes.card}>
                    <p className={classes.title}>{translate('details_dominants')}</p>
                    <ul className={classes.list}>
                        {top.map((d) => (
                            <li key={d.id}>
                                {g(d.id)} {name(d.id)} <span className={classes.small}>{d.percentage}%</span>
                                <div className={classes.bar}><span style={{width: `${d.percentage / maxPct * 100}%`}}/></div>
                            </li>
                        ))}
                    </ul>
                    <p className={classes.small}>
                        {translate('details_dominant_element', {
                            element: data.dominantElement ? content.elements[data.dominantElement as keyof typeof content.elements]?.name ?? data.dominantElement : '—',
                            quality: data.dominantQuality ? content.modalities[data.dominantQuality as keyof typeof content.modalities]?.name ?? data.dominantQuality : '—',
                        })}
                    </p>
                    <p className={classes.small}>{translate('details_dominants_note')}</p>
                </article>

                <article className={classes.card}>
                    <p className={classes.title}>{translate('details_receptions')}</p>
                    {data.receptions.length ? (
                        <ul className={classes.list}>
                            {data.receptions.map((r) => (
                                <li key={`${r.a}-${r.b}-${r.type}`}>
                                    {g(r.a)} {name(r.a)} ⇄ {g(r.b)} {name(r.b)} · <span className={classes.gold}>{translate(`details_reception_${r.type}` as ITranslationKey)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className={classes.text}>{translate('details_none')}</p>}
                    <p className={classes.small}>{translate('details_receptions_note')}</p>
                </article>

                <article className={classes.card}>
                    <p className={classes.title}>{translate('details_oob')}</p>
                    {oob.length ? (
                        <ul className={classes.list}>
                            {oob.map((d) => <li key={d.id}>{g(d.id)} {name(d.id)} · {d.declination.toFixed(2)}°</li>)}
                        </ul>
                    ) : <p className={classes.text}>{translate('details_none')}</p>}
                    <p className={classes.small}>{translate('details_oob_note', {obliquity: data.obliquity.toFixed(2)})}</p>
                </article>

                <article className={classes.card}>
                    <p className={classes.title}>{translate('details_antiscia')}</p>
                    {data.antisciaContacts.length ? (
                        <ul className={classes.list}>
                            {data.antisciaContacts.map((c) => (
                                <li key={`${c.a}-${c.b}-${c.kind}`}>
                                    {g(c.a)} {name(c.a)} ↔ {g(c.b)} {name(c.b)} · {translate(c.kind === 'antiscion' ? 'details_antiscion' : 'details_contra')} · {c.orb.toFixed(2)}°
                                </li>
                            ))}
                        </ul>
                    ) : <p className={classes.text}>{translate('details_none')}</p>}
                    <p className={classes.small}>{translate('details_antiscia_note', {orb: data.antisciaOrb})}</p>
                </article>

                <article className={classes.card}>
                    <p className={classes.title}>{translate('details_stars')}</p>
                    {data.starContacts.length ? (
                        <ul className={classes.list}>
                            {data.starContacts.map((c) => {
                                const star = content.details.stars[c.star as keyof typeof content.details.stars];
                                const point = c.point === 'asc' || c.point === 'mc' ? c.point.toUpperCase() : name(c.point);
                                return (
                                    <li key={`${c.star}-${c.point}`}>
                                        <b>{star?.name}</b> ☌ {c.point === 'asc' || c.point === 'mc' ? null : g(c.point)} {point} · {c.orb.toFixed(2)}°
                                        <br/><span className={classes.small}>{star?.meaning}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : <p className={classes.text}>{translate('details_none')}</p>}
                    <p className={classes.small}>{translate('details_stars_note', {orb: data.starOrb})}</p>
                </article>

                {data.lots ? (
                    <article className={classes.card}>
                        <p className={classes.title}>{translate('details_lots')}</p>
                        <ul className={classes.list}>
                            {data.lots.map((l) => {
                                const lot = content.details.lots[l.id as keyof typeof content.details.lots];
                                return (
                                    <li key={l.id}>
                                        <b>{lot?.name}</b> · <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[l.sign])}</span> {sign(l.sign)} {formatDegree(l.degree, l.minute)}
                                        {l.house ? ` · ${content.houses[String(l.house) as keyof typeof content.houses]?.name}` : ''}
                                        <br/><span className={classes.small}>{lot?.meaning}</span>
                                    </li>
                                );
                            })}
                        </ul>
                        <p className={classes.small}>{translate('details_lots_note')}</p>
                    </article>
                ) : null}

                <article className={classes.card}>
                    <p className={classes.title}>{translate('details_harmonics')}</p>
                    <ul className={classes.list}>
                        {Object.entries(data.harmonics).map(([n, h]) => (
                            <li key={n}>
                                <b>{content.details.harmonics[n as keyof typeof content.details.harmonics]}</b>
                                <br/>
                                {h.conjunctions.length
                                    ? h.conjunctions.map((c) => <span key={`${c.a}-${c.b}`} className={classes.small}>{name(c.a)} ☌ {name(c.b)} ({c.orb.toFixed(1)}°) </span>)
                                    : <span className={classes.small}>{translate('details_none')}</span>}
                            </li>
                        ))}
                    </ul>
                    <p className={classes.small}>{translate('details_harmonics_note', {orb: data.harmonicOrb})}</p>
                </article>

                {data.prenatal ? (
                    <article className={classes.card}>
                        <p className={classes.title}>{translate('details_prenatal')}</p>
                        <ul className={classes.list}>
                            {(['solar', 'lunar'] as const).map((k) => {
                                const e = data.prenatal![k];
                                return (
                                    <li key={k}>
                                        <b>{translate(k === 'solar' ? 'details_prenatal_solar' : 'details_prenatal_lunar')}</b> · {dmy(e.at)} ·{' '}
                                        <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[e.sign])}</span> {sign(e.sign)} {formatDegree(e.degree, e.minute)}
                                        {' '}<span className={classes.small}>({translate(`details_eclipse_${e.type}` as ITranslationKey)})</span>
                                    </li>
                                );
                            })}
                        </ul>
                        <p className={classes.small}>{translate('details_prenatal_note')}</p>
                    </article>
                ) : null}
            </div>
        </div>
    );
};

export default NatalDetailsComponent;
