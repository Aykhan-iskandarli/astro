import {keepPreviousData, useQuery} from '@tanstack/react-query';
import NameAnalysisModel from '../models/name-analysis.model';
import {getNameAnalysis} from './name-analysis.service';

// A name (and an optional birth date) is personal: kept in memory only, dropped 5 minutes after leaving the page
export const useGetNameAnalysis = (fullName: string, date: string | null) => {
    return useQuery<NameAnalysisModel, Error>({
        queryKey: ['name-analysis', fullName, date],
        queryFn: () => {
            return getNameAnalysis(fullName, date);
        },
        enabled: fullName.trim().length > 0,
        placeholderData: keepPreviousData,
        staleTime: Infinity,
        gcTime: 5 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
    });
};
