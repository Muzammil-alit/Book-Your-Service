import { CarerType } from '@/types/apps/carerTypes';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    loading: true,
    carers: [] as CarerType[],
    error: '',
};
const carerSlice = createSlice({
    name: 'carers',
    initialState,
    reducers: {
        loaderListener: (state, action) => {
            state.loading = action.payload.loading;
        },
        successCarerReducer: (state, action) => {
            state.loading = action.payload.loading;
            state.carers = action.payload.data.carers;
        },
        failedCarerReducer: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});
export const { successCarerReducer, failedCarerReducer, loaderListener } = carerSlice.actions;

export default carerSlice.reducer;
