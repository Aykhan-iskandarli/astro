export interface IMoonPhase {
    /** Illuminated fraction 0..1 (from the engine) */
    illumination: number;
    waxing: boolean;
    size?: number;
}
