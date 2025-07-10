import { ServiceType } from '@/types/apps/servicesTypes';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    loading: true,
    services: [] as ServiceType[],
    error: '',
};
const serviceSlice = createSlice({
    name: 'services',
    initialState,
    reducers: {
        loaderListener: (state, action) => {
            state.loading = action.payload.loading;
        },
        successServiceReducer: (state, action) => {
            state.loading = action.payload.loading;
            state.services = action.payload.data.services;
        },
        failedServiceReducer: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});
export const { successServiceReducer, failedServiceReducer, loaderListener } = serviceSlice.actions;

export default serviceSlice.reducer;
