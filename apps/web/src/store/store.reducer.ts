import {AnyAction, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ILang} from '../assets/lang/lang';
import {IBirthInput, IRelation, ISavedChart, IState} from './store';

const initialState: IState = {
    loader: false,
    locale: 'az',
    ambientSound: false,
    birthInput: null,
    savedCharts: [],
    primaryChartId: null,
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
            if (state.primaryChartId === action.payload) state.primaryChartId = null;
        },
        updateSavedChart: (state: IState, action: PayloadAction<{id: string; name?: string; relation?: IRelation}>) => {
            const chart = state.savedCharts.find((c) => c.id === action.payload.id);
            if (!chart) return;
            if (action.payload.name !== undefined) chart.input.name = action.payload.name || null;
            if (action.payload.relation !== undefined) chart.relation = action.payload.relation;
        },
        setPrimaryChart: (state: IState, action: PayloadAction<string | null>) => {
            state.primaryChartId = action.payload;
        },
        importSavedCharts: (state: IState, action: PayloadAction<ISavedChart[]>) => {
            // Merge by id; imported entries replace existing ones with the same id
            const byId = new Map(state.savedCharts.map((c) => [c.id, c]));
            action.payload.forEach((c) => byId.set(c.id, c));
            state.savedCharts = [...byId.values()].slice(0, 50);
        },
    },
    extraReducers: (builder) => {
        builder.addCase('persist/REHYDRATE', (state, action: AnyAction) => {
            if (action.payload) {
                state.savedCharts = action.payload.savedCharts || [];
                state.locale = action.payload.locale || 'az';
                state.primaryChartId = action.payload.primaryChartId ?? null;
            }
        });
    },
});

export const {
    setLoader, setLocale, setAmbientSound, setBirthInput, addSavedChart, removeSavedChart, updateSavedChart,
    setPrimaryChart, importSavedCharts,
} = rootSlice.actions;
export default rootSlice.reducer;
