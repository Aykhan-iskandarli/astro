import {formatDegree, formatOrb, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import useLocalization, {useContent} from 'assets/lang';
import {ExtraPointModel} from '../../models/natal-chart.model';
import {useExtraPointsStyles} from './extra-points.style';
import {IExtraPoints} from './extra-points';

// Asteroid glyphs ⚳ ⚴ ⚵ ⚶ (U+26B3–26B6, in the bundled symbol font); the Vertex is written "Vx"
const EXTRA_GLYPHS: Record<string, string> = {ceres: '⚳', pallas: '⚴', juno: '⚵', vesta: '⚶', vertex: 'Vx'};

const ExtraPointsComponent = ({extras}: IExtraPoints) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useExtraPointsStyles();

    const sign = (id: string | null) => (id ? content.signs[id as keyof typeof content.signs]?.name : '');
    const house = (n: number | null) => (n ? content.houses[String(n) as keyof typeof content.houses]?.name : null);
    const info = (id: string) => (content.extraPoints as Record<string, {name: string; short: string}>)[id];
    const point = (id: string | null) => (id ? content.points[id as keyof typeof content.points]?.name ?? id : '');

    const items: ExtraPointModel[] = [...extras.asteroids, ...(extras.vertex ? [extras.vertex] : [])];

    return (
        <div className={classes.wrap}>
            <ul className={classes.grid}>
                {items.map((p) => (
                    <li key={p.id} className={classes.card}>
                        <p className={classes.title}>
                            <span className={`glyph ${classes.glyph}`} aria-hidden='true'>{glyph(EXTRA_GLYPHS[p.id!])}</span>
                            <strong>{info(p.id!)?.name}</strong>
                        </p>
                        <p className={classes.pos}>
                            <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[p.sign!])}</span>
                            {` ${sign(p.sign)} ${formatDegree(p.degree, p.minute)}`}
                            {house(p.house) ? ` · ${house(p.house)}` : ''}
                            {p.retrograde ? ' ℞' : ''}
                        </p>
                        <p className={classes.text}>{info(p.id!)?.short}</p>
                    </li>
                ))}
            </ul>

            <h3 className={classes.sub}>{translate('extras_stars_title')}</h3>
            {extras.fixedStars.length ? (
                <ul className={classes.stars}>
                    {extras.fixedStars.map((s) => {
                        const star = (content.fixedStars as Record<string, {name: string; meaning: string}>)[s.star!];
                        return (
                            <li key={`${s.star}-${s.point}`} className={classes.star}>
                                <p>
                                    <span className={classes.starMark} aria-hidden='true'>★</span>
                                    <strong>{star?.name}</strong>
                                    {` ${translate('extras_conjunct')} `}
                                    <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[s.point!])}</span>
                                    {` ${point(s.point)} · ${formatOrb(s.orb)}`}
                                </p>
                                <p className={classes.text}>{star?.meaning}</p>
                            </li>
                        );
                    })}
                </ul>
            ) : <p className={classes.muted}>{translate('extras_no_stars')}</p>}
            <p className={classes.muted}>{translate('extras_note')}</p>
        </div>
    );
};

export default ExtraPointsComponent;
