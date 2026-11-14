import {keepPreviousData, useQuery} from '@tanstack/react-query';
import SkyModel, {CalendarModel} from '../models/sky.model';
import {getCalendar, getMoonCalendar, getMoonDay, getMoonLunations, getSky, getSkyDay, IMoonPlace} from './sky.service';
import {IBirthInput} from 'store/store';
import MoonDayModel, {PersonalLunationsModel} from '../models/personal-moon.model';
import SkyDayModel from '../models/sky-day.model';
import MoonCalendarModel from '../models/moon-calendar.model';

// The sky is not personal data: it can be cached normally. Refreshed every 10 minutes while the page is open.
export const useGetSky = () => {
    return useQuery<SkyModel, Error>({
        queryKey: ['sky'],
        queryFn: () => {
            return getSky();
        },
        staleTime: 5 * 60 * 1000,
        refetchInterval: 10 * 60 * 1000,
        retry: 1,
    });
};

export const useGetCalendar = (start: string, end: string) => {
    return useQuery<CalendarModel, Error>({
        queryKey: ['sky-calendar', start, end],
        queryFn: () => {
            return getCalendar(start, end);
        },
        placeholderData: keepPreviousData,
        staleTime: Infinity,
        retry: 1,
    });
};

// Not personal (a city, not a birth): cached like the rest of the sky
export const useGetMoonCalendar = (start: string, end: string, place: IMoonPlace) => {
    return useQuery<MoonCalendarModel, Error>({
        queryKey: ['sky-moon', start, end, place.latitude, place.longitude, place.timezone],
        queryFn: () => {
            return getMoonCalendar(start, end, place);
        },
        placeholderData: keepPreviousData,
        staleTime: Infinity,
        retry: 1,
    });
};

export const useGetSkyDay = (date: string, place: IMoonPlace) => {
    return useQuery<SkyDayModel, Error>({
        queryKey: ['sky-day', date, place.latitude, place.longitude, place.timezone],
        queryFn: () => getSkyDay(date, place),
        placeholderData: keepPreviousData,
        staleTime: Infinity,
        retry: 1,
    });
};

// Personal: the birth data is part of the query key, so it stays in memory only (dropped 5 minutes after leaving)
export const useGetMoonDay = (input: IBirthInput | null, start: string) => {
    return useQuery<MoonDayModel, Error>({
        queryKey: ['moon-day', input, start],
        queryFn: () => {
            return getMoonDay(input!, start, 24);
        },
        enabled: !!input,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
    });
};

export const useGetMoonLunations = (input: IBirthInput | null, start: string, days: number) => {
    return useQuery<PersonalLunationsModel, Error>({
        queryKey: ['moon-lunations', input, start, days],
        queryFn: () => {
            return getMoonLunations(input!, start, days);
        },
        enabled: !!input,
        placeholderData: keepPreviousData,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
    });
};
