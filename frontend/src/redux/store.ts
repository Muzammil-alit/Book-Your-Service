import { combineReducers, configureStore } from '@reduxjs/toolkit';
// We'll use redux-logger just as an example of adding another middleware
import logger from 'redux-logger';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from '@/redux/slices/login';
import usersReducer from '@/redux/slices/users';
import servicesReducer from '@/redux/slices/services';
import carersReducer from '@/redux/slices/carers';
import activityLogsReducer from "@/redux/slices/activitylogs";
import bookingRequestsReducer from '@/redux/slices/bookingRequests'

const persistConfig = {
    debug: false,
    key: 'root',
    keyPrefix: 'v.1',
    storage,
    blacklist: [],
    // add reducer name to persist
    whitelist: ['authReducer']
}

const rootReducer = combineReducers({
    "authReducer": authReducer,
    "usersReducer": usersReducer,
    "activityLogsReducer": activityLogsReducer,
    "servicesReducer": servicesReducer,
    "carersReducer": carersReducer,
    "bookingRequestsReducer": bookingRequestsReducer, 
});

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        }).concat(logger)
});
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export const persistor = persistStore(store)
