
import { createSlice } from '@reduxjs/toolkit';
import { ClientType } from '@/types/apps/clientTypes';

const initialState = {
    loading: true,
    services: [] as ClientType[],
    error: '',
    client: null as ClientType | null,
};
const clientSlice = createSlice({
    name: 'client',
    initialState,
    reducers: {
        loaderListener: (state, action) => {
            state.loading = action.payload.loading;
        },
        successClientReducer: (state, action) => {
            state.loading = action.payload.loading;
            state.client = action.payload.data.client;
        },
        failedClientReducer: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});
export const { successClientReducer, failedClientReducer, loaderListener } = clientSlice.actions;

export default clientSlice.reducer;
