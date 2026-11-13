import axiosPublic from 'core/configs/axios-public.config';
import {API} from 'core/configs/api.config';
import NameAnalysisModel from '../models/name-analysis.model';

export const getNameAnalysis = (fullName: string, date: string | null): Promise<NameAnalysisModel> => {
    return axiosPublic.post(API.nameAnalysis, {fullName, date})
        .then((res) => {
            return new NameAnalysisModel(res.data);
        });
};
