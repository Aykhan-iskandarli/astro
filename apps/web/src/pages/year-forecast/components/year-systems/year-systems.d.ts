import {IBirthInput} from 'store/store';
import YearModel from 'pages/natal-chart/models/forecast-year.model';

export interface IYearSystems {
    input: IBirthInput;
    year: number;
    data: YearModel;
}
