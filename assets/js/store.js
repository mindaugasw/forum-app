import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { threadSlice, threadMiddleware } from "./redux/threads";
import {authMiddleware, authSlice} from "./redux/auth";
import {eventsMiddleware, eventsSlice} from "./redux/events";
import { composeWithDevTools } from "redux-devtools-extension";

const store = configureStore({
    reducer: {
        threads: threadSlice.reducer,
        auth: authSlice.reducer,
        events: eventsSlice.reducer
    },
    middleware: [
        ...getDefaultMiddleware(),
        threadMiddleware,
        authMiddleware,
        eventsMiddleware,
    ],
    devTools: true
});

window.store = store;

export default store;