import {AnyAction, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ILang} from '../assets/lang/lang';
import {IBirthInput, ISavedChart, IState} from './store';

const initialState: IState = {
    loader: false,
    locale: 'az',
    ambientSound: false,
    birthInput: null,
    savedCharts: [],
};

export const rootSlice = createSlice({
    name: 'root',
    initialState,
    reducers: {
        setLoader: (state: IState, action: PayloadAction<boolean>) => {
            state.loader = action.payload;
        },
        setLocale: (state: IState, action: PayloadAction<ILang>) => {
            state.locale = action.payload;
        },
        setAmbientSound: (state: IState, action: PayloadAction<boolean>) => {
            state.ambientSound = action.payload;
        },
        setBirthInput: (state: IState, action: PayloadAction<IBirthInput | null>) => {
            state.birthInput = action.payload;
        },
        addSavedChart: (state: IState, action: PayloadAction<ISavedChart>) => {
            state.savedCharts = [action.payload, ...state.savedCharts].slice(0, 50);
        },
        removeSavedChart: (state: IState, action: PayloadAction<string>) => {
            state.savedCharts = state.savedCharts.filter((c) => c.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder.addCase('persist/REHYDRATE', (state, action: AnyAction) => {
            if (action.payload) {
                state.savedCharts = action.payload.savedCharts || [];
                state.locale = action.payload.locale || 'az';
            }
        });
    },
});

export const {
    setLoader, setLocale, setAmbientSound, setBirthInput, addSavedChart, removeSavedChart,
} = rootSlice.actions;
export default rootSlice.reducer;
