import {motion} from 'framer-motion';
import useLocalization from 'assets/lang';
import {useFeaturesStyles} from './features.style';

const FEATURES = [
    {key: 'accurate', icon: 'M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4'},
    {key: 'free', icon: 'M12 2l2.9 6.9L22 10l-5.5 4.7L18 22l-6-3.6L6 22l1.5-7.3L2 10l7.1-1.1z'},
    {key: 'private', icon: 'M6 10V7a6 6 0 0112 0v3M5 10h14v11H5z'},
] as const;

const FeaturesComponent = () => {
    const translate = useLocalization();
    const {features, title, grid, card, icon} = useFeaturesStyles();

    return (
        <section className={`container ${features}`} aria-labelledby='features-title'>
            <motion.h2 id='features-title' className={title}
                       initial={{opacity: 0, y: 16}} whileInView={{opacity: 1, y: 0}} viewport={{once: true}}
                       transition={{duration: 0.8}}>
                {translate('features_title')}
            </motion.h2>
            <ul className={grid}>
                {FEATURES.map((f, i) => (
                    <motion.li key={f.key} className={card}
                               initial={{opacity: 0, y: 24}} whileInView={{opacity: 1, y: 0}}
                               viewport={{once: true, margin: '-60px'}}
                               transition={{delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1]}}>
                        <svg className={icon} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.4'
                             strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                            <path d={f.icon}/>
                        </svg>
                        <h3>{translate(`feature_${f.key}_title`)}</h3>
                        <p>{translate(`feature_${f.key}_text`)}</p>
                    </motion.li>
                ))}
            </ul>
        </section>
    );
};

export default FeaturesComponent;
