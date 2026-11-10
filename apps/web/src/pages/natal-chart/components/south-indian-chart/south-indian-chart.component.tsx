import {motion, useReducedMotion} from 'framer-motion';
import classNames from 'classnames';
import {glyph, POINT_GLYPHS} from 'core/helpers/astro';
import useLocalization, {useContent} from 'assets/lang';
import {useSouthIndianChartStyles} from './south-indian-chart.style';
import {ISouthIndianChart} from './south-indian-chart';

// South Indian layout: signs stay in fixed cells (Pisces top-left, clockwise), the centre holds the title
const CELLS: {sign: string; row: number; col: number}[] = [
    {sign: 'pisces', row: 1, col: 1}, {sign: 'aries', row: 1, col: 2}, {sign: 'taurus', row: 1, col: 3},
    {sign: 'gemini', row: 1, col: 4}, {sign: 'cancer', row: 2, col: 4}, {sign: 'leo', row: 3, col: 4},
    {sign: 'virgo', row: 4, col: 4}, {sign: 'libra', row: 4, col: 3}, {sign: 'scorpio', row: 4, col: 2},
    {sign: 'sagittarius', row: 4, col: 1}, {sign: 'capricorn', row: 3, col: 1}, {sign: 'aquarius', row: 2, col: 1},
];

const VEDIC_GLYPHS: Record<string, string> = {...POINT_GLYPHS, rahu: POINT_GLYPHS.northNode, ketu: POINT_GLYPHS.southNode};

const SouthIndianChartComponent = ({title, placements, lagnaSign, activeId, onActivate}: ISouthIndianChart) => {
    const translate = useLocalization();
    const content = useContent();
    const reduce = useReducedMotion();
    const classes = useSouthIndianChartStyles();

    return (
        <figure className={classes.chart} aria-label={title}>
            {CELLS.map((cell, i) => {
                const here = placements.filter((p) => p.sign === cell.sign);
                return (
                    <motion.div
                        key={cell.sign}
                        className={classNames(classes.cell, {[classes.lagna]: lagnaSign === cell.sign})}
                        style={{gridRow: cell.row, gridColumn: cell.col}}
                        initial={reduce ? false : {opacity: 0, scale: 0.94}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{delay: i * 0.04, duration: 0.4}}
                    >
                        <span className={classes.signName}>{content.vedic.rashis[cell.sign as keyof typeof content.vedic.rashis]}</span>
                        {lagnaSign === cell.sign ? <span className={classes.lagnaMark} title={content.vedic.grahas.lagna.name}>{translate('lagna_short')}</span> : null}
                        <span className={classes.grahas}>
                            {here.map((p) => {
                                const name = content.vedic.grahas[p.id as keyof typeof content.vedic.grahas]?.name ?? p.id;
                                return (
                                    <button
                                        key={p.id}
                                        type='button'
                                        data-id={p.id}
                                        className={classNames(classes.graha, {[classes.active]: activeId === p.id})}
                                        title={`${name}${p.label ? ` · ${p.label}` : ''}`}
                                        aria-label={`${name}${p.label ? `, ${p.label}` : ''}`}
                                        onMouseEnter={onActivate}
                                        onFocus={onActivate}
                                    >
                                        <span className='glyph' aria-hidden='true'>{glyph(VEDIC_GLYPHS[p.id])}</span>
                                        {p.retrograde ? <sup>R</sup> : null}
                                    </button>
                                );
                            })}
                        </span>
                    </motion.div>
                );
            })}
            <figcaption className={classes.center}>{title}</figcaption>
        </figure>
    );
};

export default SouthIndianChartComponent;
