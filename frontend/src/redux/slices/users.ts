import { UserType } from '@/types/apps/userTypes';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    loading: true,
    users: [] as UserType[],
    error: '',
};
const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        loaderListener: (state, action) => {
            state.loading = action.payload.loading;
        },
        successUserReducer: (state, action) => {
            state.loading = action.payload.loading;
            state.users = action.payload.data.users;
        },
        failedUserReducer: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});
export const { successUserReducer, failedUserReducer, loaderListener } = userSlice.actions;

export default userSlice.reducer;
