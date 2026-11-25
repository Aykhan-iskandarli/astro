import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {IBirthInput} from 'store/store';
import {
    getAstrocartography, getDirections, getGeneration, getLifetime, getTransformations, getElectional, getBazi, getBaziYears, getChineseCompatibility, getComposite, getCycles, getDavison, getDetails, getGunaMilan, getOtherSystems, getTiming, getNumerology, getNumerologyCompatibility, getPlaces, getProgressions, getReturn, getTimeline, getTransits, getVedic,
    getLifeline, getRetrogrades, getYear, IAcgProbe, INumerologyPerson, IReturnParams,
} from './natal-chart.service';
import CyclesModel from '../models/cycles.model';
import ChineseCompatibilityModel from '../models/chinese-compatibility.model';
import {DetailsModel, GunaMilanModel, OtherSystemsModel, TimingModel} from '../models/extras.model';
import AstrocartographyModel from '../models/astrocartography.model';
import YearModel, {LifelineModel, RetrogradesModel} from '../models/forecast-year.model';
import NumerologyCompatibilityModel from '../models/numerology-compatibility.model';
import PlaceModel from '../models/place.model';
import TransitsModel from '../models/transits.model';
import VedicModel from '../models/vedic.model';
import NumerologyModel from '../models/numerology.model';
import BaziModel from '../models/bazi.model';
import LifetimeModel from '../models/lifetime.model';
import GenerationModel from '../models/generation.model';
import DirectionsModel from '../models/directions.model';
import TransformationsModel from '../models/transformations.model';
import ElectionalModel from '../models/electional.model';
import BaziYearsModel from '../models/bazi-years.model';
import NatalChartModel from '../models/natal-chart.model';
import {ProgressionModel, ReturnModel} from '../models/forecast.model';
import TimelineModel from '../models/timeline.model';

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

export const useGetBaziYears = (input: IBirthInput | null, gender: 'male' | 'female', startYear: number, years: number) => {
    return useQuery<BaziYearsModel, Error>({
        queryKey: ['bazi-years', input, gender, startYear, years],
        queryFn: () => {
            return getBaziYears(input!, gender, startYear, years);
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

export const useGetElectional = (input: IBirthInput | null, start: string, days: number, viewerTimezone: string) => {
    return useQuery<ElectionalModel, Error>({
        queryKey: ['electional', input, start, days, viewerTimezone],
        queryFn: () => {
            return getElectional(input!, start, days, viewerTimezone);
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

export const useGetTransformations = (input: IBirthInput | null, startYear: number, years: number) => {
    return useQuery<TransformationsModel, Error>({
        queryKey: ['transformations', input, startYear, years],
        queryFn: () => {
            return getTransformations(input!, startYear, years);
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

export const useGetDirections = (input: IBirthInput | null, startYear: number, years: number) => {
    return useQuery<DirectionsModel, Error>({
        queryKey: ['directions', input, startYear, years],
        queryFn: () => {
            return getDirections(input!, startYear, years);
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

export const useGetGeneration = (input: IBirthInput | null) => {
    return useQuery<GenerationModel, Error>({
        queryKey: ['generation', input],
        queryFn: () => {
            return getGeneration(input!);
        },
        enabled: !!input,
        placeholderData: keepPreviousData,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    });
};

export const useGetLifetime = (input: IBirthInput | null, gender: 'male' | 'female') => {
    return useQuery<LifetimeModel, Error>({
        queryKey: ['lifetime', input, gender],
        queryFn: () => {
            return getLifetime(input!, gender);
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

export const useGetTimeline = (input: IBirthInput | null, start: string, days: number, enabled: boolean, fast = false) => {
    return useQuery<TimelineModel, Error>({
        queryKey: ['timeline', input, start, days, fast],
        queryFn: () => {
            return getTimeline(input!, start, days, fast);
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

export const useGetCycles = (input: IBirthInput | null, enabled: boolean) => {
    return useQuery<CyclesModel, Error>({
        queryKey: ['cycles', input],
        queryFn: () => {
            return getCycles(input!);
        },
        enabled: !!input && enabled,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
        retryOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    });
};

export const useGetNumerologyCompatibility = (first: INumerologyPerson | null, second: INumerologyPerson | null) => {
    return useQuery<NumerologyCompatibilityModel, Error>({
        queryKey: ['numerology-compatibility', first, second],
        queryFn: () => {
            return getNumerologyCompatibility(first!, second!);
        },
        enabled: !!first && !!second,
        placeholderData: keepPreviousData,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
        retryOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    });
};

export const useGetChineseCompatibility = (first: string | null, second: string | null) => {
    return useQuery<ChineseCompatibilityModel, Error>({
        queryKey: ['chinese-compatibility', first, second],
        queryFn: () => {
            return getChineseCompatibility(first!, second!);
        },
        enabled: !!first && !!second,
        placeholderData: keepPreviousData,
        staleTime: Infinity,
        retry: false,
        refetchOnWindowFocus: false,
    });
};

export const useGetDetails = (input: IBirthInput | null) => {
    return useQuery<DetailsModel, Error>({
        queryKey: ['details', input],
        queryFn: () => getDetails(input!),
        enabled: !!input,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
    });
};

export const useGetTiming = (input: IBirthInput | null, on: string, enabled: boolean) => {
    return useQuery<TimingModel, Error>({
        queryKey: ['timing', input, on],
        queryFn: () => getTiming(input!, on),
        enabled: !!input && enabled,
        placeholderData: keepPreviousData,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
    });
};

export const useGetGunaMilan = (groom: IBirthInput | null, bride: IBirthInput | null) => {
    return useQuery<GunaMilanModel, Error>({
        queryKey: ['guna-milan', groom, bride],
        queryFn: () => getGunaMilan(groom!, bride!),
        enabled: !!groom && !!bride,
        placeholderData: keepPreviousData,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
    });
};

export const useGetOtherSystems = (date: string | null, gender: 'male' | 'female') => {
    return useQuery<OtherSystemsModel, Error>({
        queryKey: ['other-systems', date, gender],
        queryFn: () => getOtherSystems(date!, gender),
        enabled: !!date,
        placeholderData: keepPreviousData,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
    });
};

export const useGetAstrocartography = (input: IBirthInput | null, probe: IAcgProbe | null) => {
    return useQuery<AstrocartographyModel, Error>({
        queryKey: ['astrocartography', input, probe],
        queryFn: () => {
            return getAstrocartography(input!, probe);
        },
        enabled: !!input?.time,
        placeholderData: keepPreviousData,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
        retryOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    });
};

export const useGetDavison = (first: IBirthInput | null, second: IBirthInput | null, enabled: boolean) => {
    return useQuery<NatalChartModel, Error>({
        queryKey: ['davison', first, second],
        queryFn: () => getDavison(first!, second!),
        enabled: !!first && !!second && enabled,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
    });
};

export const useGetLifeline = (input: IBirthInput | null, start: string, years: number) => {
    return useQuery<LifelineModel, Error>({
        queryKey: ['lifeline', input, start, years],
        queryFn: () => {
            return getLifeline(input!, start, years);
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

export const useGetRetrogrades = (input: IBirthInput | null, start: string, days: number) => {
    return useQuery<RetrogradesModel, Error>({
        queryKey: ['retrogrades', input, start, days],
        queryFn: () => {
            return getRetrogrades(input!, start, days);
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

export const useGetYear = (input: IBirthInput | null, year: number) => {
    return useQuery<YearModel, Error>({
        queryKey: ['year', input, year],
        queryFn: () => {
            return getYear(input!, year);
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
