import {MotionValue} from 'framer-motion';
import {IJourneyPlanet} from '../../home.data';

export interface IPlanetCard {
    planet: IJourneyPlanet;
    index: number;
    total: number;
    /** Scroll progress of the journey; null renders a static card (reduced motion) */
    progress: MotionValue<number> | null;
    hidden?: boolean;
}
