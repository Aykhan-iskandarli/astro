import classNames from 'classnames';
import {glyph, SIGN_GLYPHS} from 'core/helpers/astro';
import useLocalization, {useContent} from 'assets/lang';
import {useSadeSatiStyles} from './sade-sati.style';
import {ISadeSatiProps} from './sade-sati';

const dmy = (iso: string) => iso.slice(0, 10).split('-').reverse().join('.');

// Sade Sati: Saturn's 7.5-year passage over the natal Moon sign (sidereal), with its three phases.
const SadeSatiComponent = ({sadeSati, signName}: ISadeSatiProps) => {
    const translate = useLocalization();
    const content = useContent();
    const t = content.vedic.sadeSati;
    const classes = useSadeSatiStyles();

    return (
        <section className={classes.section} aria-labelledby='vedic-sade-sati'>
            <h3 id='vedic-sade-sati'>{translate('sade_sati_title')}</h3>
            <p className={classes.muted}>{t.intro}</p>
            <p className={classes.muted}>
                {translate('sade_sati_moon', {sign: signName(sadeSati.moonSign), years: sadeSati.horizonYears})}
            </p>
            <ol className={classes.list}>
                {sadeSati.periods.map((p) => (
                    <li key={p.start} className={classNames(classes.period, {
                        [classes.periodNow]: p.status === 'now',
                        [classes.periodPast]: p.status === 'past',
                    })}>
                        <div className={classes.head}>
                            <strong>
                                {p.startClipped ? translate('sade_sati_at_birth') : dmy(p.start)} – {p.endClipped ? '…' : dmy(p.end)}
                            </strong>
                            <span className={classNames(classes.badge, {[classes.badgeNow]: p.status === 'now'})}>
                                {translate(p.status === 'past' ? 'cycles_status_past' : p.status === 'now' ? 'cycles_status_now' : 'cycles_status_future')}
                            </span>
                        </div>
                        <div className={classes.phases}>
                            {p.phases.map((ph) => (
                                <div key={ph.phase} className={classes.phase}>
                                    <b>{t.phases[ph.phase].name}</b>
                                    <span>
                                        <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[ph.sign])}</span> {signName(ph.sign)}
                                    </span>
                                    <span className={classes.small}>{dmy(ph.start)} – {dmy(ph.end)}</span>
                                </div>
                            ))}
                        </div>
                    </li>
                ))}
            </ol>
            <ul className={classes.list}>
                {(['rising', 'peak', 'setting'] as const).map((ph) => (
                    <li key={ph} className={classes.small}><b>{t.phases[ph].name}:</b> {t.phases[ph].meaning}</li>
                ))}
            </ul>
            <p className={classes.small}>{translate('sade_sati_note')}</p>
        </section>
    );
};

export default SadeSatiComponent;
