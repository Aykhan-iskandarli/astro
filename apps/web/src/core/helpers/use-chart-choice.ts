import {useCallback, useMemo, useState} from 'react';
import {useStore} from 'store/store.config';
import {IBirthInput} from 'store/store';
import useLocalization from 'assets/lang';

const CURRENT = 'current';

/**
 * Which of the user's charts a personal page works with: the chart open in this session first, then the profile
 * marked as "my chart", then the newest saved one. Returns the input, the select options and the setter.
 */
export const useChartChoice = () => {
    const translate = useLocalization();
    const birthInput = useStore('birthInput');
    const saved = useStore('savedCharts');
    const primaryId = useStore('primaryChartId');
    const [choice, setChoice] = useState<string>(
        birthInput ? CURRENT : (saved.find((s) => s.id === primaryId) ?? saved[0])?.id ?? CURRENT);

    const input: IBirthInput | null = choice === CURRENT ? birthInput : saved.find((s) => s.id === choice)?.input ?? null;

    const options = useMemo(() => [
        ...(birthInput ? [{value: CURRENT, label: birthInput.name || translate('today_current_chart')}] : []),
        ...saved.map((s) => ({value: s.id, label: `${s.input.name || translate('unnamed_chart')} · ${s.input.date.split('-').reverse().join('.')}`})),
    ], [birthInput, saved, translate]);

    const onChoice = useCallback((v: string) => {
        setChoice(v);
    }, []);

    return {input, options, choice, onChoice};
};
