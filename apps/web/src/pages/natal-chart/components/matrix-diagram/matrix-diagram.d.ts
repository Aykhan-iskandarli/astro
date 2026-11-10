export interface IMatrixDiagram {
    points: Record<string, number>;
    activeKey: string | null;
    onSelect: (key: string) => void;
}
