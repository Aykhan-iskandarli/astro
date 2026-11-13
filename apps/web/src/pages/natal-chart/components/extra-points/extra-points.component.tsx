import {formatDegree, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import useLocalization, {useContent} from 'assets/lang';
import {useExtraPointsStyles} from './extra-points.style';
import {IExtraPoints} from './extra-points';

// Asteroids, Vertex and Part of Spirit: shown here only (not on the wheel, not in aspects or balance).
const ExtraPointsComponent = ({chart}: IExtraPoints) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useExtraPointsStyles();

    if (!chart.extraPoints.length) return null;

    return (
        <>
            <div className={classes.grid}>
                {chart.extraPoints.map((p) => {
                    const info = content.extraPoints[p.id as keyof typeof content.extraPoints];
                    const sign = content.signs[p.sign as keyof typeof content.signs];
                    return (
                        <article key={p.id} className={classes.card}>
                            <header className={classes.head}>
                                <span className={`glyph ${classes.glyph}`} aria-hidden='true'>
                                    {glyph(POINT_GLYPHS[p.id!]) || '✦'}
                                </span>
                                <div>
                                    <h3>{info?.name}</h3>
                                    <p className={classes.position}>
                                        <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[p.sign!])}</span>
                                        {` ${sign?.name} ${formatDegree(p.degree, p.minute)}`}
                                        {p.house ? ` · ${content.houses[String(p.house) as keyof typeof content.houses]?.name}` : ''}
                                        {p.retrograde ? <abbr className={classes.retro} title={translate('retrograde')}> {translate('retrograde_short')}</abbr> : null}
                                    </p>
                                </div>
                            </header>
                            <p className={classes.keywords}>{info?.keywords}</p>
                            <p className={classes.text}>{info?.short}</p>
                            <p className={classes.text}>{sign?.expression}</p>
                        </article>
                    );
                })}
            </div>
            {chart.timeUnknown ? <p className={classes.note}>{translate('extra_points_time_unknown')}</p> : null}
        </>
    );
};

export default ExtraPointsComponent;
