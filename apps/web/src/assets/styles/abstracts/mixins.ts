const mixins = {
    breakpoint: (value: number) => `@media (max-width: ${value}px)`,
    reducedMotion: '@media (prefers-reduced-motion: reduce)',
    transition: (
        property: string | null = 'all',
        duration: number | null = 0.3,
        timingFunction: string | null = 'ease',
    ) => `${property} ${duration}s ${timingFunction}`,
};

export const {breakpoint, reducedMotion, transition} = mixins;
