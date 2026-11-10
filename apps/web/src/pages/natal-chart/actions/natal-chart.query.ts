import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {IBirthInput} from 'store/store';
import {getBazi, getComposite, getNumerology, getPlaces, getProgressions, getReturn, getTransits, getVedic, IReturnParams} from './natal-chart.service';
import PlaceModel from '../models/place.model';
import TransitsModel from '../models/transits.model';
import VedicModel from '../models/vedic.model';
import NumerologyModel from '../models/numerology.model';
import BaziModel from '../models/bazi.model';
import NatalChartModel from '../models/natal-chart.model';
import {ProgressionModel, ReturnModel} from '../models/forecast.model';

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

export const useGetNumerology = (date: string | null, fullName: string) => {
    return useQuery<NumerologyModel, Error>({
        queryKey: ['numerology', date, fullName],
        queryFn: () => {
            return getNumerology(date!, fullName);
        },
        enabled: !!date,
        placeholderData: keepPreviousData,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
        retryOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    });
};

export const useGetBazi = (input: IBirthInput | null, gender: 'male' | 'female') => {
    return useQuery<BaziModel, Error>({
        queryKey: ['bazi', input, gender],
        queryFn: () => {
            return getBazi(input!, gender);
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

export const useGetReturn = (input: IBirthInput | null, params: IReturnParams, enabled: boolean) => {
    return useQuery<ReturnModel, Error>({
        queryKey: ['return', input, params],
        queryFn: () => {
            return getReturn(input!, params);
        },
        enabled: !!input && enabled,
        placeholderData: keepPreviousData,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
        retryOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    });
};

export const useGetProgressions = (input: IBirthInput | null, target: string, enabled: boolean) => {
    return useQuery<ProgressionModel, Error>({
        queryKey: ['progressions', input, target],
        queryFn: () => {
            return getProgressions(input!, target);
        },
        enabled: !!input && enabled,
        placeholderData: keepPreviousData,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
        retryOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    });
};

export const useGetComposite = (first: IBirthInput | null, second: IBirthInput | null) => {
    return useQuery<NatalChartModel, Error>({
        queryKey: ['composite', first, second],
        queryFn: () => {
            return getComposite(first!, second!);
        },
        enabled: !!first && !!second,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
        retryOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    });
};
