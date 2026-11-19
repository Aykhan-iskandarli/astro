import axiosPublic from 'core/configs/axios-public.config';
import {API} from 'core/configs/api.config';
import SkyModel, {CalendarModel} from '../models/sky.model';
import CollectiveModel from '../models/collective.model';
import MoonCalendarModel from '../models/moon-calendar.model';
import SkyDayModel from '../models/sky-day.model';
import MoonDayModel, {PersonalLunationsModel} from '../models/personal-moon.model';
import {IBirthInput} from 'store/store';

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

export const getCollective = (year: number): Promise<CollectiveModel> => {
    return axiosPublic.get(API.skyCollective, {params: {year}})
        .then((res) => {
            return new CollectiveModel(res.data);
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

// The Moon in the user's chart (birth data goes to the server only for the calculation)
export const getMoonDay = (input: IBirthInput, start: string, hours: number): Promise<MoonDayModel> => {
    return axiosPublic.post(API.moonDay, {...input, start, hours})
        .then((res) => {
            return new MoonDayModel(res.data);
        });
};

export const getMoonLunations = (input: IBirthInput, start: string, days: number): Promise<PersonalLunationsModel> => {
    return axiosPublic.post(API.moonLunations, {...input, start, days})
        .then((res) => {
            return new PersonalLunationsModel(res.data);
        });
};
