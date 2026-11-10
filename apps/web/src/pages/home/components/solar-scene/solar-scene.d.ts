import {MotionValue} from 'framer-motion';

export interface ISolarScene {
    /** 0..1 scroll progress through the journey section */
    progress: MotionValue<number>;
    /** Render loop runs only while the section is on screen */
    active?: boolean;
}
