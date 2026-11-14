import axiosPublic from 'core/configs/axios-public.config';
import {API} from 'core/configs/api.config';
import {IBirthInput} from 'store/store';
import NatalChartModel from '../models/natal-chart.model';
import DestinyMatrixModel from '../models/destiny-matrix.model';
import PlaceModel from '../models/place.model';
import TransitsModel from '../models/transits.model';
import SynastryModel from '../models/synastry.model';
import VedicModel from '../models/vedic.model';
import NumerologyModel from '../models/numerology.model';
import BaziModel from '../models/bazi.model';
import BaziYearsModel from '../models/bazi-years.model';
import {ProgressionModel, ReturnModel} from '../models/forecast.model';
import TimelineModel from '../models/timeline.model';
import CyclesModel from '../models/cycles.model';
import ChineseCompatibilityModel from '../models/chinese-compatibility.model';
import {DetailsModel, GunaMilanModel, OtherSystemsModel, TimingModel} from '../models/extras.model';
import AstrocartographyModel from '../models/astrocartography.model';
import YearModel, {LifelineModel, RetrogradesModel} from '../models/forecast-year.model';
import NumerologyCompatibilityModel from '../models/numerology-compatibility.model';

export const getPlaces = (query: string): Promise<PlaceModel[]> => {
    return axiosPublic.get(API.places, {params: {q: query, limit: 8}})
        .then((res) => {
            return res.data.map((item: any) => new PlaceModel(item));
        });
};

export const createNatalChart = (input: IBirthInput): Promise<NatalChartModel> => {
    return axiosPublic.post(API.natalChart, input)
        .then((res) => {
            return new NatalChartModel(res.data);
        });
};

export const createDestinyMatrix = (input: IBirthInput): Promise<DestinyMatrixModel> => {
    return axiosPublic.post(API.destinyMatrix, {name: input.name, date: input.date})
        .then((res) => {
            return new DestinyMatrixModel(res.data);
        });
};

export const getTransits = (input: IBirthInput, at: string): Promise<TransitsModel> => {
    return axiosPublic.post(API.transits, {...input, at})
        .then((res) => {
            return new TransitsModel(res.data);
        });
};

export const createSynastry = (first: IBirthInput, second: IBirthInput): Promise<SynastryModel> => {
    return axiosPublic.post(API.synastry, {first, second, houseSystem: first.houseSystem})
        .then((res) => {
            return new SynastryModel(res.data);
        });
};

export const getVedic = (input: IBirthInput): Promise<VedicModel> => {
    return axiosPublic.post(API.vedic, input)
        .then((res) => {
            return new VedicModel(res.data);
        });
};

export const getNumerology = (date: string, fullName: string): Promise<NumerologyModel> => {
    return axiosPublic.post(API.numerology, {date, fullName: fullName || null})
        .then((res) => {
            return new NumerologyModel(res.data);
        });
};

export const getBazi = (input: IBirthInput, gender: 'male' | 'female'): Promise<BaziModel> => {
    return axiosPublic.post(API.bazi, {...input, gender})
        .then((res) => {
            return new BaziModel(res.data);
        });
};

export const getBaziYears = (input: IBirthInput, gender: 'male' | 'female', startYear: number, years: number): Promise<BaziYearsModel> => {
    return axiosPublic.post(API.baziYears, {...input, gender, startYear, years})
        .then((res) => {
            return new BaziYearsModel(res.data);
        });
};

export interface IReturnParams {
    kind: 'solar' | 'lunar';
    year?: number;
    after?: string;
    relocate?: {latitude: number; longitude: number; timezone: string; name: string} | null;
}

export const getReturn = (input: IBirthInput, params: IReturnParams): Promise<ReturnModel> => {
    return axiosPublic.post(API.returns, {...input, ...params})
        .then((res) => {
            return new ReturnModel(res.data);
        });
};

export const getProgressions = (input: IBirthInput, target: string): Promise<ProgressionModel> => {
    return axiosPublic.post(API.progressions, {...input, target})
        .then((res) => {
            return new ProgressionModel(res.data);
        });
};

export const getComposite = (first: IBirthInput, second: IBirthInput): Promise<NatalChartModel> => {
    return axiosPublic.post(API.composite, {first, second, houseSystem: first.houseSystem})
        .then((res) => {
            return new NatalChartModel(res.data);
        });
};

export const getTimeline = (input: IBirthInput, start: string, days: number): Promise<TimelineModel> => {
    return axiosPublic.post(API.timeline, {...input, start, days})
        .then((res) => {
            return new TimelineModel(res.data);
        });
};

export const getCycles = (input: IBirthInput): Promise<CyclesModel> => {
    return axiosPublic.post(API.cycles, input)
        .then((res) => {
            return new CyclesModel(res.data);
        });
};

export interface INumerologyPerson {
    date: string;
    fullName: string | null;
}

export const getNumerologyCompatibility = (first: INumerologyPerson, second: INumerologyPerson): Promise<NumerologyCompatibilityModel> => {
    return axiosPublic.post(API.numerologyCompatibility, {first, second})
        .then((res) => {
            return new NumerologyCompatibilityModel(res.data);
        });
};

export const getChineseCompatibility = (first: string, second: string): Promise<ChineseCompatibilityModel> => {
    return axiosPublic.post(API.chineseCompatibility, {first, second})
        .then((res) => {
            return new ChineseCompatibilityModel(res.data);
        });
};

export const getDetails = (input: IBirthInput): Promise<DetailsModel> => {
    return axiosPublic.post(API.details, input)
        .then((res) => {
            return new DetailsModel(res.data);
        });
};

export const getTiming = (input: IBirthInput, on: string): Promise<TimingModel> => {
    return axiosPublic.post(API.timing, {...input, on})
        .then((res) => {
            return new TimingModel(res.data);
        });
};

export const getGunaMilan = (groom: IBirthInput, bride: IBirthInput): Promise<GunaMilanModel> => {
    return axiosPublic.post(API.gunaMilan, {groom, bride})
        .then((res) => {
            return new GunaMilanModel(res.data);
        });
};

export const getOtherSystems = (date: string, gender: 'male' | 'female'): Promise<OtherSystemsModel> => {
    return axiosPublic.post(API.other, {date, gender})
        .then((res) => {
            return new OtherSystemsModel(res.data);
        });
};

export interface IAcgProbe {
    latitude: number;
    longitude: number;
    timezone: string;
    name: string;
}

export const getAstrocartography = (input: IBirthInput, probe: IAcgProbe | null): Promise<AstrocartographyModel> => {
    return axiosPublic.post(API.astrocartography, {...input, probe})
        .then((res) => {
            return new AstrocartographyModel(res.data);
        });
};

export const getDavison = (first: IBirthInput, second: IBirthInput): Promise<NatalChartModel> => {
    return axiosPublic.post(API.davison, {first, second, houseSystem: first.houseSystem})
        .then((res) => {
            return new NatalChartModel(res.data);
        });
};

export const getLifeline = (input: IBirthInput, start: string, years: number): Promise<LifelineModel> => {
    return axiosPublic.post(API.lifeline, {...input, start, years})
        .then((res) => {
            return new LifelineModel(res.data);
        });
};

export const getRetrogrades = (input: IBirthInput, start: string, days: number): Promise<RetrogradesModel> => {
    return axiosPublic.post(API.retrogrades, {...input, start, days})
        .then((res) => {
            return new RetrogradesModel(res.data);
        });
};

export const getYear = (input: IBirthInput, year: number): Promise<YearModel> => {
    return axiosPublic.post(API.year, {...input, year})
        .then((res) => {
            return new YearModel(res.data);
        });
};
