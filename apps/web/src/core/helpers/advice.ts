/** Which practical note a transit gets: the conjunction, the hard aspects or the easy ones (minor aspects get none). */
export type AdviceKind = 'conjunction' | 'hard' | 'soft';

export const adviceKind = (aspect: string): AdviceKind | null => {
    if (aspect === 'conjunction') return 'conjunction';
    if (aspect === 'square' || aspect === 'opposition') return 'hard';
    if (aspect === 'trine' || aspect === 'sextile') return 'soft';
    return null;
};
