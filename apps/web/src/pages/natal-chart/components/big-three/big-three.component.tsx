import {useCallback} from 'react';
import {motion, useReducedMotion} from 'framer-motion';
import {placementText} from '@astra/content';
import {ELEMENT_OF_SIGN, formatDegree, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import {useStore} from 'store/store.config';
import useLocalization, {useContent} from 'assets/lang';
import {useBigThreeStyles} from './big-three.style';
import {IBigThree} from './big-three';

const ROLES = [
    {id: 'sun', role: 'big_three_sun'},
    {id: 'moon', role: 'big_three_moon'},
    {id: 'asc', role: 'big_three_asc'},
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

// The "Big Three": Sun (core self), Moon (emotional needs), Ascendant (how you meet the world).
const BigThreeComponent = ({chart, onSelect}: IBigThree) => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const reduce = useReducedMotion();
    const classes = useBigThreeStyles();

    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const id = e.currentTarget.dataset.id;
        if (id) onSelect(id);
    }, [onSelect]);

    const find = (id: string) => chart.points.find((p) => p.id === id) ?? chart.angles.find((a) => a.id === id) ?? null;

    return (
        <section className={classes.wrap} aria-labelledby='sec-big-three'>
            <h2 id='sec-big-three' className={classes.title}>{translate('big_three_title')}</h2>
            <div className={classes.grid}>
                {ROLES.map(({id, role}, i) => {
                    const p = chart.timeUnknown && id === 'asc' ? null : find(id);
                    const sign = p?.sign ?? null;
                    const element = sign ? ELEMENT_OF_SIGN[sign] : null;
                    const signInfo = sign ? content.signs[sign as keyof typeof content.signs] : null;
                    return (
                        <motion.article key={id} className={`${classes.card} ${element ? classes[element] : ''}`}
                                        initial={reduce ? false : {opacity: 0, y: 18}} animate={{opacity: 1, y: 0}}
                                        transition={{delay: 0.15 + i * 0.12, duration: 0.7, ease: EASE}}>
                            <header className={classes.head}>
                                <span className={`glyph ${classes.pointGlyph}`} aria-hidden='true'>{glyph(POINT_GLYPHS[id])}</span>
                                <div>
                                    <p className={classes.role}>{translate(role)}</p>
                                    <h3 className={classes.pointName}>{content.points[id as keyof typeof content.points]?.name}</h3>
                                </div>
                                {sign ? <span className={`glyph ${classes.signGlyph}`} aria-hidden='true'>{glyph(SIGN_GLYPHS[sign])}</span> : null}
                            </header>
                            {p && sign ? (
                                <>
                                    <p className={classes.sign}>
                                        {signInfo?.name} <span className={classes.degree}>{formatDegree(p.degree, p.minute)}</span>
                                    </p>
                                    <p className={classes.tags}>
                                        {element ? content.elements[element].name : ''} · {signInfo?.keywords}
                                    </p>
                                    <p className={classes.text}>{placementText(locale, id, sign)}</p>
                                    <button type='button' className={classes.more} data-id={id} onClick={handleClick}>
                                        {translate('big_three_more')}
                                    </button>
                                </>
                            ) : (
                                <p className={classes.text}>{translate('big_three_asc_unknown')}</p>
                            )}
                        </motion.article>
                    );
                })}
            </div>
        </section>
    );
};

export default BigThreeComponent;
