import { BookingRequestType } from '@/types/apps/bookingRequestsType';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    loading: true,
    bookingRequests: [] as BookingRequestType[],
    error: '',
};

const bookingRequestsSlice = createSlice({
    name: 'bookingRequests',
    initialState,
    reducers: {
        loaderListener: (state, action) => {
            state.loading = action.payload.loading;
        },
        successBookingRequestsReducer: (state, action) => {
            state.loading = action.payload.loading;
            state.bookingRequests = action.payload.data.bookingRequests;
        },
        failedBookingRequestsReducer: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});

export const { 
    successBookingRequestsReducer, 
    failedBookingRequestsReducer, 
    loaderListener 
} = bookingRequestsSlice.actions;

export default bookingRequestsSlice.reducer;