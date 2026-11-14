import {ReactNode} from 'react';

export interface ITransitReading {
    transit: string;
    natal: string;
    aspect: string;
    children?: ReactNode;
}
