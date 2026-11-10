import {AnimatePresence, motion} from 'framer-motion';
import {describePlacement} from '@astra/content';
import {ASPECT_GLYPHS, aspectTone, formatDegree, formatOrb, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import {useStore} from 'store/store.config';
import useLocalization, {useContent} from 'assets/lang';
import {useInterpretationPanelStyles} from './interpretation-panel.style';
import {IInterpretationPanel} from './interpretation-panel';

const InterpretationPanelComponent = ({chart, pointId}: IInterpretationPanel) => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useInterpretationPanelStyles();

    const point = chart.points.find((p) => p.id === pointId) ?? chart.angles.find((a) => a.id === pointId) ?? null;
    const house = point && 'house' in point ? (point.house as number | null) : null;
    const dignity = point && 'dignity' in point ? (point.dignity as string | null) : null;
    const retro = point && 'retrograde' in point ? Boolean(point.retrograde) : false;
    const aspects = chart.aspects.filter((a) => a.p1 === pointId || a.p2 === pointId);
    const pointName = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;

    return (
        <div className={classes.panel} aria-live='polite'>
            <AnimatePresence mode='wait'>
                {point ? (
                    <motion.article
                        key={point.id}
                        initial={{opacity: 0, y: 8}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -6}}
                        transition={{duration: 0.35}}
                    >
                        <header className={classes.head}>
                            <span className={`glyph ${classes.bigGlyph}`} aria-hidden='true'>
                                {point.id === 'partOfFortune' ? '⊗' : glyph(POINT_GLYPHS[point.id!])}
                            </span>
                            <div>
                                <h3 className={classes.title}>{pointName(point.id!)}</h3>
                                <p className={classes.position}>
                                    <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[point.sign!])}</span>
                                    {` ${content.signs[point.sign as keyof typeof content.signs]?.name} ${formatDegree(point.degree, point.minute)}`}
                                    {house ? ` · ${content.houses[String(house) as keyof typeof content.houses]?.name}` : ''}
                                    {retro ? ` · ${translate('retrograde')}` : ''}
                                </p>
                            </div>
                        </header>

                        <div className={classes.text}>
                            {describePlacement(locale, point.id!, point.sign!, house).map((s) => <p key={s}>{s}</p>)}
                            {dignity ? (
                                <p className={classes.dignity}>
                                    <strong>{content.dignities[dignity as keyof typeof content.dignities]?.name}.</strong>
                                    {' '}{content.dignities[dignity as keyof typeof content.dignities]?.meaning}
                                </p>
                            ) : null}
                        </div>

                        {aspects.length ? (
                            <ul className={classes.aspects}>
                                {aspects.map((a) => {
                                    const other = a.p1 === point.id ? a.p2! : a.p1!;
                                    const info = content.aspects[a.type as keyof typeof content.aspects];
                                    return (
                                        <li key={`${a.p1}-${a.p2}`}>
                                            <span className={`glyph ${classes[aspectTone(a.type!)]}`} aria-hidden='true'>{glyph(ASPECT_GLYPHS[a.type!])}</span>
                                            <span>
                                                <strong>{info?.name}</strong>{` · ${pointName(other)} · ${formatOrb(a.orb!)}`}
                                                {a.applying !== null ? ` · ${translate(a.applying ? 'applying' : 'separating')}` : ''}
                                                <br/>
                                                <span className={classes.muted}>{info?.meaning}</span>
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : null}
                    </motion.article>
                ) : (
                    <motion.p key='hint' className={classes.hint} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                        {translate('select_point_hint')}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InterpretationPanelComponent;
