import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {IBirthInput} from 'store/store';
import {getPlaces, getTransits, getVedic} from './natal-chart.service';
import PlaceModel from '../models/place.model';
import TransitsModel from '../models/transits.model';
import VedicModel from '../models/vedic.model';

export const useGetPlaces = (query: string) => {
    return useQuery<PlaceModel[], Error>({
        queryKey: ['places', query],
        queryFn: () => {
            return getPlaces(query);
        },
        enabled: query.trim().length >= 2,
        placeholderData: keepPreviousData,
        staleTime: Infinity,
        gcTime: Infinity,
        retry: false,
        retryOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    });
};

// Birth data stays in memory only (React Query cache, dropped 5 minutes after the tab is closed)
export const useGetTransits = (input: IBirthInput | null, at: string) => {
    return useQuery<TransitsModel, Error>({
        queryKey: ['transits', input, at],
        queryFn: () => {
            return getTransits(input!, at);
        },
        enabled: !!input,
        placeholderData: keepPreviousData,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
        retryOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    });
};

export const useGetVedic = (input: IBirthInput | null) => {
    return useQuery<VedicModel, Error>({
        queryKey: ['vedic', input],
        queryFn: () => {
            return getVedic(input!);
        },
        enabled: !!input,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
        retryOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    });
};
