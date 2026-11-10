import {useMutation} from '@tanstack/react-query';
import {IBirthInput} from 'store/store';
import {createDestinyMatrix, createNatalChart, createSynastry} from './natal-chart.service';

// The chart is not cached server-side or client-side (privacy): it lives only in the mutation result.
export const useCreateNatalChart = () => {
    return useMutation({
        mutationFn: (input: IBirthInput) => {
            return createNatalChart(input);
        },
    });
};

export const useCreateDestinyMatrix = () => {
    return useMutation({
        mutationFn: (input: IBirthInput) => {
            return createDestinyMatrix(input);
        },
    });
};

export const useCreateSynastry = () => {
    return useMutation({
        mutationFn: ({first, second}: {first: IBirthInput; second: IBirthInput}) => {
            return createSynastry(first, second);
        },
    });
};
