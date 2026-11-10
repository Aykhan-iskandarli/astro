import {motion} from 'framer-motion';
import {glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import useLocalization, {useContent} from 'assets/lang';
import {usePatternsListStyles} from './patterns-list.style';
import {IPatternsList} from './patterns-list';

const PatternsListComponent = ({patterns}: IPatternsList) => {
    const translate = useLocalization();
    const content = useContent();
    const {list, card, title, members, meaning, empty} = usePatternsListStyles();

    if (!patterns.length) return <p className={empty}>{translate('no_patterns')}</p>;

    return (
        <ul className={list}>
            {patterns.map((p, i) => {
                const info = content.patterns[p.type as keyof typeof content.patterns];
                const where = p.sign
                    ? translate('in_sign', {sign: content.signs[p.sign as keyof typeof content.signs]?.name})
                    : p.house ? content.houses[String(p.house) as keyof typeof content.houses]?.name : null;
                return (
                    <motion.li
                        key={`${p.type}-${p.points.join('-')}-${p.sign ?? p.house ?? ''}`}
                        className={card}
                        initial={{opacity: 0, y: 12}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true, margin: '-40px'}}
                        transition={{delay: i * 0.06, duration: 0.5}}
                    >
                        <h4 className={title}>
                            {info?.name}
                            {where ? <span>{` · ${where}`}</span> : null}
                            {p.sign ? <span className='glyph' aria-hidden='true'>{` ${glyph(SIGN_GLYPHS[p.sign])}`}</span> : null}
                        </h4>
                        <p className={members}>
                            {p.points.map((id) => (
                                <span key={id} title={content.points[id as keyof typeof content.points]?.name}>
                                    <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[id])}</span>
                                    {' '}{content.points[id as keyof typeof content.points]?.name}
                                    {p.apex === id ? ' ★' : ''}
                                </span>
                            ))}
                        </p>
                        <p className={meaning}>{info?.meaning}</p>
                    </motion.li>
                );
            })}
        </ul>
    );
};

export default PatternsListComponent;
