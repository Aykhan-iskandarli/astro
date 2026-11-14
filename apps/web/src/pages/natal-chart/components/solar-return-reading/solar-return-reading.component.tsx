import {formatDegree, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import useLocalization, {useContent} from 'assets/lang';
import {useSolarReturnReadingStyles} from './solar-return-reading.style';
import {ISolarReturnReading} from './solar-return-reading';

// A short yearly reading of a solar return: the house the Sun falls in and the Ascendant's sign.
const SolarReturnReadingComponent = ({sun, asc}: ISolarReturnReading) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useSolarReturnReadingStyles();

    const reading = content.solarReturn as {house: Record<string, string>; asc: Record<string, string>};
    const house = sun?.house ? content.houses[String(sun.house) as keyof typeof content.houses] : null;
    const sign = (id: string | null | undefined) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : '');

    if (!sun) return null;

    return (
        <section className={classes.wrap} aria-labelledby='solar-return-title'>
            <h3 id='solar-return-title' className={classes.title}>{translate('solar_return_title')}</h3>
            <div className={classes.grid}>
                <article className={classes.card}>
                    <p className={classes.label}>{translate('solar_return_sun')}</p>
                    <p className={classes.big}>
                        <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS.sun)}</span>
                        {' '}<span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[sun.sign!])}</span>
                        {` ${sign(sun.sign)} ${formatDegree(sun.degree, sun.minute)}`}
                    </p>
                    {house ? (
                        <>
                            <p><strong>{house.name}</strong>{` · ${house.theme}`}</p>
                            <p className={classes.text}>{reading.house[String(sun.house)]}</p>
                        </>
                    ) : <p className={classes.text}>{translate('lunar_return_no_houses')}</p>}
                </article>
                {asc ? (
                    <article className={classes.card}>
                        <p className={classes.label}>{translate('solar_return_asc')}</p>
                        <p className={classes.big}>
                            <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[asc.sign!])}</span>
                            {` ${sign(asc.sign)} ${formatDegree(asc.degree, asc.minute)}`}
                        </p>
                        <p className={classes.text}>{reading.asc[asc.sign!]}</p>
                    </article>
                ) : null}
            </div>
        </section>
    );
};

export default SolarReturnReadingComponent;
