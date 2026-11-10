import {useShootingStarsStyles} from './shooting-stars.style';

// A few CSS-only meteors crossing the sky at long, staggered intervals (hidden under reduced motion).
const STARS = [
    {top: '12%', left: '62%', delay: '2s', duration: '9s'},
    {top: '30%', left: '88%', delay: '6.5s', duration: '13s'},
    {top: '6%', left: '35%', delay: '11s', duration: '17s'},
];

const ShootingStarsComponent = () => {
    const {wrap, star} = useShootingStarsStyles();
    return (
        <div className={wrap} aria-hidden='true'>
            {STARS.map((s) => (
                <span key={s.left} className={star}
                      style={{top: s.top, left: s.left, animationDelay: s.delay, animationDuration: s.duration}}/>
            ))}
        </div>
    );
};

export default ShootingStarsComponent;
