import axiosPublic from 'core/configs/axios-public.config';
import {API} from 'core/configs/api.config';
import SkyModel, {CalendarModel} from '../models/sky.model';
import MoonCalendarModel from '../models/moon-calendar.model';
import SkyDayModel from '../models/sky-day.model';

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

export interface IMoonPlace {
    name: string;
    latitude: number;
    longitude: number;
    timezone: string;
}

export const getMoonCalendar = (start: string, end: string, place: IMoonPlace): Promise<MoonCalendarModel> => {
    return axiosPublic.get(API.skyMoon, {params: {start, end, lat: place.latitude, lon: place.longitude, tz: place.timezone}})
        .then((res) => {
            return new MoonCalendarModel(res.data);
        });
};

export const getSkyDay = (date: string, place: IMoonPlace): Promise<SkyDayModel> => {
    return axiosPublic.get(API.skyDay, {params: {date, lat: place.latitude, lon: place.longitude, tz: place.timezone}})
        .then((res) => {
            return new SkyDayModel(res.data);
        });
};
