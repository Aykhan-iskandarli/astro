import {keepPreviousData, useQuery} from '@tanstack/react-query';
import SkyModel, {CalendarModel} from '../models/sky.model';
import {getCalendar, getSky} from './sky.service';

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
