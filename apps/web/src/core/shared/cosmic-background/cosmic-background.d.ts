export interface ICosmicBackground {
    /** 0..1: how much nebula colour shows through the vignette */
    intensity?: number;
    /** Render resolution relative to CSS size (the nebula is soft, 0.5 is plenty) */
    scale?: number;
}
