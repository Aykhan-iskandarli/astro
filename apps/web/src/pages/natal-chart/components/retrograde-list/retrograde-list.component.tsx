import {useMemo} from 'react';
import {formatDegree, formatLocal, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import TermComponent from 'core/shared/term/term.component';
import useLocalization, {useContent} from 'assets/lang';
import {useRetrogradeListStyles} from './retrograde-list.style';
import {IRetrogradeList} from './retrograde-list';

const ms = (iso: string | null) => (iso ? new Date(iso).getTime() : 0);

// Retrograde periods with the natal house they start, end and pass through, plus a strip showing when they happen.
const RetrogradeListComponent = ({retrogrades, from, to}: IRetrogradeList) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useRetrogradeListStyles();

    const name = (id: string | null) => (id ? content.points[id as keyof typeof content.points]?.name ?? id : '');
    const sign = (id: string | null) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : '');
    const house = (n: number | null) => (n ? content.houses[String(n) as keyof typeof content.houses] : null);
    const text = (id: string | null) => (id ? (content.retrograde.planet as Record<string, string>)[id] : null);

    const range = useMemo(() => ({lo: new Date(from).getTime(), hi: new Date(to).getTime()}), [from, to]);
    const planets = useMemo(() => [...new Set(retrogrades.map((r) => r.planet!))], [retrogrades]);
    const pct = (t: number) => Math.min(100, Math.max(0, ((t - range.lo) / (range.hi - range.lo)) * 100));

    if (!retrogrades.length) return <p className={classes.muted}>{translate('retro_none')}</p>;

    return (
        <div className={classes.wrap}>
            <div className={classes.strip} role='img' aria-label={translate('retro_strip_label')}>
                {planets.map((pid) => (
                    <div key={pid} className={classes.stripRow}>
                        <span className={classes.stripWho}><span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[pid])}</span></span>
                        <div className={classes.track}>
                            {retrogrades.filter((r) => r.planet === pid).map((r) => (
                                <span key={r.start} className={classes.run}
                                      style={{left: `${pct(ms(r.start))}%`, width: `${Math.max(pct(ms(r.end)) - pct(ms(r.start)), 0.6)}%`}}/>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <ul className={classes.list}>
                {retrogrades.map((r) => (
                    <li key={`${r.planet}-${r.start}`} className={classes.item}>
                        <h4>
                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[r.planet!])}</span>
                            {` ${name(r.planet)} `}<TermComponent id='retrograde'>{translate('retro_word')}</TermComponent>
                        </h4>
                        <p className={classes.dates}>
                            {r.startClipped ? translate('retro_before') : formatLocal(r.start, false)}
                            {' – '}
                            {r.endClipped ? translate('retro_after') : formatLocal(r.end, false)}
                        </p>
                        <p className={classes.muted}>
                            {translate('retro_from')}{' '}
                            <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[r.from.sign!])}</span>
                            {` ${sign(r.from.sign)} ${formatDegree(r.from.degree, r.from.minute)}`}
                            {r.from.house ? ` · ${house(r.from.house)?.name}` : ''}
                            {' → '}{translate('retro_to')}{' '}
                            <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[r.to.sign!])}</span>
                            {` ${sign(r.to.sign)} ${formatDegree(r.to.degree, r.to.minute)}`}
                            {r.to.house ? ` · ${house(r.to.house)?.name}` : ''}
                        </p>
                        {r.houses.length ? (
                            <p className={classes.houses}>
                                {r.houses.map((n) => <span key={n} className={classes.chip}>{house(n)?.name}: {house(n)?.theme}</span>)}
                            </p>
                        ) : null}
                        <p className={classes.text}>{text(r.planet)}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RetrogradeListComponent;
