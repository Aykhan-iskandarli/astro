/** Helpers for the directions timeline: which events fall in a calendar year, and how they are grouped by month. */
export interface IDirectionEvent {
    at: string;
    age: number;
}

export const eventsIn = <T extends IDirectionEvent>(items: T[], year: number): T[] => items
    .filter((e) => new Date(e.at).getUTCFullYear() === year)
    .sort((a, b) => a.at.localeCompare(b.at));

/** Events of one year grouped by calendar month (0-11), months without events left out. */
export const byMonth = <T extends IDirectionEvent>(items: T[]): {month: number; items: T[]}[] => {
    const groups = new Map<number, T[]>();
    items.forEach((e) => {
        const m = new Date(e.at).getUTCMonth();
        groups.set(m, [...(groups.get(m) ?? []), e]);
    });
    return [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([month, list]) => ({month, items: list}));
};

/** The window of years to request so that `year` always lies inside it (the same windows as the transformations page). */
export const DIRECTIONS_WINDOW = 12;
export const directionsStart = (year: number) => Math.floor(year / 6) * 6 - 3;
