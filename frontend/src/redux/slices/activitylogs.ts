import { ActivityLogType } from '@/types/apps/activityLogsType';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    loading: true,
    logs: [] as ActivityLogType[],
    totalRecords: 0,
    error: '',
};
const activityLogsSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        loaderListener: (state, action) => {
            state.loading = action.payload.loading;
        },
        successActivityLogsReducer: (state, action) => {
            state.loading = action.payload.loading;
            state.logs = action.payload.data.logs;
            state.totalRecords = action.payload.data.totalRecords;
        },
        failedActivityLogsReducer: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});
export const { successActivityLogsReducer, failedActivityLogsReducer, loaderListener } = activityLogsSlice.actions;

export default activityLogsSlice.reducer;
