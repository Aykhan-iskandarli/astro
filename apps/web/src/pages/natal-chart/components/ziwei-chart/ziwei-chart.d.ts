export interface IZiweiChart {
    date: string;   // YYYY-MM-DD, local civil date
    time: string;   // HH:mm, local civil time
    gender: 'male' | 'female';
    age: number | null;
}
