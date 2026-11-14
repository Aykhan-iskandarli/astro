import {useCallback, useMemo, useState} from 'react';
import {Dayjs} from 'dayjs';
import {IBirthInput} from 'store/store';
import {useChartChoice} from './use-chart-choice';

export type BirthMode = 'chart' | 'date';

/**
 * Where a personal page gets its birth data: the user's chart, or only a birth date (no time, no place). A date is
 * enough for everything except the Moon, the angles and the houses, so the engine is given noon at 0/0 UTC.
 */
export const useBirthSource = () => {
    const {input: chartInput} = useChartChoice();
    const [mode, setMode] = useState<BirthMode>(chartInput ? 'chart' : 'date');
    const [birth, setBirth] = useState<Dayjs | null>(null);

    const dateInput = useMemo<IBirthInput | null>(() => (birth ? {
        name: null, date: birth.format('YYYY-MM-DD'), time: null, latitude: 0, longitude: 0, timezone: 'UTC', place: '', houseSystem: 'P',
    } as IBirthInput : null), [birth]);
    const input = mode === 'chart' && chartInput ? chartInput : dateInput;

    const onMode = useCallback((v: string | number) => {
        setMode(v as BirthMode);
    }, []);
    const onBirth = useCallback((v: Dayjs | null) => {
        setBirth(v);
    }, []);

    return {chartInput, mode, onMode, birth, onBirth, input, showDate: mode === 'date' || !chartInput};
};
