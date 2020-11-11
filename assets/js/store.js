import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { threadSlice, threadMiddleware } from "./redux/threads";

const store = configureStore({
    reducer: {
        threads: threadSlice.reducer,
    },
    middleware: [
        ...getDefaultMiddleware(),
        threadMiddleware
    ]
});

export default store;