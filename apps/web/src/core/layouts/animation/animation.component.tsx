import {Outlet, useLocation} from 'react-router-dom';
import {AnimatePresence, motion, useReducedMotion} from 'framer-motion';

// Calm route transitions: a soft fade with a slight rise (instant under reduced motion).
const AnimationComponent = () => {
    const location = useLocation();
    const reduce = useReducedMotion();

    return (
        // initial={false}: the first page of a visit appears at once (keeps prerendered LCP intact)
        <AnimatePresence mode='wait' initial={false}>
            <motion.div
                key={location.pathname}
                initial={reduce ? false : {opacity: 0, y: 12, filter: 'blur(6px)'}}
                animate={{opacity: 1, y: 0, filter: 'blur(0px)'}}
                exit={reduce ? {opacity: 1} : {opacity: 0, y: -8, filter: 'blur(4px)'}}
                transition={{duration: reduce ? 0 : 0.6, ease: [0.22, 1, 0.36, 1]}}
            >
                <Outlet/>
            </motion.div>
        </AnimatePresence>
    );
};

export default AnimationComponent;
