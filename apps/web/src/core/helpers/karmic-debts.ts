/**
 * Karmic debts in numerology (13/4, 14/5, 16/7, 19/1): which of a person's numbers pass through one of them while the
 * compound number is reduced, grouped by debt. The numbers themselves come from the engine; this only groups them and
 * writes out the reduction chain (49 -> 13 -> 4) so that the reader can see where the debt comes from.
 */
export const DEBTS = [13, 14, 16, 19] as const;
export const MASTER = [11, 22, 33];

export interface IDebtNumber {
    value: number;
    compound: number;
    karmicDebt: number | null;
}

export interface IDebtSource {
    kind: string;
    compound: number;
    value: number;
    chain: number[];
}

export interface IDebtGroup {
    debt: number;
    sources: IDebtSource[];
}

/** 49 -> [49, 13, 4]: the digit sums until a single digit (or a master number) is reached. */
export const chainOf = (n: number): number[] => {
    const out = [n];
    let cur = n;
    while (cur > 9 && !MASTER.includes(cur)) {
        cur = String(cur).split('').reduce((a, d) => a + Number(d), 0);
        out.push(cur);
    }
    return out;
};

export const karmicDebts = (numbers: Record<string, IDebtNumber | null>, order: readonly string[]): IDebtGroup[] => DEBTS
    .map((debt) => ({
        debt,
        sources: order.flatMap((kind) => {
            const n = numbers[kind];
            return n && n.karmicDebt === debt ? [{kind, compound: n.compound, value: n.value, chain: chainOf(n.compound)}] : [];
        }),
    }))
    .filter((g) => g.sources.length > 0);
