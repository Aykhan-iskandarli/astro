export interface IChartPlacement {
    id: string;
    sign: string;
    label?: string;
    retrograde?: boolean;
}

export interface ISouthIndianChart {
    title: string;
    placements: IChartPlacement[];
    lagnaSign: string | null;
    activeId: string | null;
    onActivate: (e: React.SyntheticEvent<HTMLButtonElement>) => void;
}
