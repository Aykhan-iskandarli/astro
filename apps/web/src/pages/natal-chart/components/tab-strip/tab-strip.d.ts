export interface ITabStripItem {
    key: string;
    label: string;
}

export interface ITabStrip {
    items: ITabStripItem[];
    activeKey: string;
    onChange: (key: string) => void;
    label: string;
}
