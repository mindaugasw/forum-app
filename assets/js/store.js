import {configureStore, getDefaultMiddleware} from "@reduxjs/toolkit";
import {threadSlice, threadMiddleware} from "./redux/threads";
import {authMiddleware, authSlice} from "./redux/auth";
import {postsCRUDSlice} from "./redux/postsCRUD";

const store = configureStore({
    reducer: {
        threads: threadSlice.reducer,
        auth: authSlice.reducer,
        postsCRUD: postsCRUDSlice.reducer,
    },
    middleware: [
        ...getDefaultMiddleware(),
        threadMiddleware,
        authMiddleware,
    ]
});

window.store = store;

export default store;