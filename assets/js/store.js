import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { threadReducer, threadMiddleware } from "./redux/threads";

const store = configureStore({
    reducer: {
        threads: threadReducer,
    },
    middleware: [
        ...getDefaultMiddleware(),
        threadMiddleware
    ]
});

export default store;