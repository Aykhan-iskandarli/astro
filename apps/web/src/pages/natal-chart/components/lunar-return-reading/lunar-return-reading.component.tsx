import {formatDegree, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import useLocalization, {useContent} from 'assets/lang';
import {useLunarReturnReadingStyles} from './lunar-return-reading.style';
import {ILunarReturnReading} from './lunar-return-reading';

// A short monthly reading of a lunar return chart: where the Moon falls (its house) and the Ascendant's sign.
const LunarReturnReadingComponent = ({chart}: ILunarReturnReading) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useLunarReturnReadingStyles();

    const moon = chart.points.find((p) => p.id === 'moon');
    const asc = chart.angles.find((a) => a.id === 'asc');
    const reading = content.lunarReturn as {house: Record<string, string>; asc: Record<string, string>};
    const house = moon?.house ? content.houses[String(moon.house) as keyof typeof content.houses] : null;
    const sign = (id: string | null | undefined) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : '');

    if (!moon) return null;

    return (
        <section className={classes.wrap} aria-labelledby='lunar-return-title'>
            <h3 id='lunar-return-title' className={classes.title}>{translate('lunar_return_title')}</h3>
            <div className={classes.grid}>
                <article className={classes.card}>
                    <p className={classes.label}>{translate('lunar_return_moon')}</p>
                    <p className={classes.big}>
                        <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS.moon)}</span>
                        {' '}<span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[moon.sign!])}</span>
                        {` ${sign(moon.sign)} ${formatDegree(moon.degree, moon.minute)}`}
                    </p>
                    {house ? (
                        <>
                            <p><strong>{house.name}</strong>{` · ${house.theme}`}</p>
                            <p className={classes.text}>{reading.house[String(moon.house)]}</p>
                        </>
                    ) : <p className={classes.text}>{translate('lunar_return_no_houses')}</p>}
                </article>
                {asc ? (
                    <article className={classes.card}>
                        <p className={classes.label}>{translate('lunar_return_asc')}</p>
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

export default LunarReturnReadingComponent;
