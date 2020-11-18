import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { threadSlice, threadMiddleware } from "./redux/threads";
import {authMiddleware, authSlice} from "./redux/auth";

const store = configureStore({
    reducer: {
        threads: threadSlice.reducer,
        auth: authSlice.reducer,
    },
    middleware: [
        ...getDefaultMiddleware(),
        threadMiddleware,
        authMiddleware,
    ]
});

window.store = store;

export default store;