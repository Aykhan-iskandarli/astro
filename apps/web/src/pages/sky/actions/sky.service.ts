import axiosPublic from 'core/configs/axios-public.config';
import {API} from 'core/configs/api.config';
import SkyModel, {CalendarModel} from '../models/sky.model';

export const getSky = (at?: string): Promise<SkyModel> => {
    return axiosPublic.get(API.sky, {params: at ? {at} : {}})
        .then((res) => {
            return new SkyModel(res.data);
        });
};

export const getCalendar = (start: string, end: string): Promise<CalendarModel> => {
    return axiosPublic.get(API.skyCalendar, {params: {start, end}})
        .then((res) => {
            return new CalendarModel(res.data);
        });
};
