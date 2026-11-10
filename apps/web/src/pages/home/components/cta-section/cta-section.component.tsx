import {useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button} from 'antd';
import {motion} from 'framer-motion';
import {Routes} from 'router/routes';
import useLocalization from 'assets/lang';
import {useCtaSectionStyles} from './cta-section.style';

const CtaSectionComponent = () => {
    const translate = useLocalization();
    const navigate = useNavigate();
    const {cta, orbits, orbit, inner, button} = useCtaSectionStyles();

    const handleStart = useCallback(() => {
        navigate(Routes.natalChart);
    }, [navigate]);

    return (
        <section className={cta} aria-labelledby='cta-title'>
            {/* Orbit lines draw themselves as the section scrolls into view */}
            <svg className={orbits} viewBox='-300 -300 600 600' aria-hidden='true'>
                {[120, 190, 260].map((r, i) => (
                    <motion.circle key={r} cx={0} cy={0} r={r} className={orbit}
                                   initial={{pathLength: 0, opacity: 0}}
                                   whileInView={{pathLength: 1, opacity: 1}}
                                   viewport={{once: true}}
                                   transition={{delay: i * 0.3, duration: 2.2, ease: [0.22, 1, 0.36, 1]}}/>
                ))}
            </svg>
            <motion.div className={inner} initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true}} transition={{delay: 0.4, duration: 0.9}}>
                <h2 id='cta-title'>{translate('cta_title')}</h2>
                <p>{translate('cta_text')}</p>
                <Button type='primary' size='large' className={button} onClick={handleStart}>{translate('cta_button')}</Button>
            </motion.div>
        </section>
    );
};

export default CtaSectionComponent;
