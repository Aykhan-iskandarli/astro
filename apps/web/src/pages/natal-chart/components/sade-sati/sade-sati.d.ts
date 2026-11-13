import {ISadeSati} from '../../models/vedic.model';

export interface ISadeSatiProps {
    sadeSati: ISadeSati;
    signName: (sign: string) => string;
}
