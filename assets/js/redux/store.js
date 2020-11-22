import {configureStore, getDefaultMiddleware} from "@reduxjs/toolkit";
import {threadSlice, threadMiddleware} from "./threads";
import {authSlice, authMiddleware} from "./auth";
import {postsCRUDSlice} from "./postsCRUD";
import {usersCRUDSlice} from "./usersCRUD";

const store = configureStore({
    reducer: {
        threads: threadSlice.reducer,
        auth: authSlice.reducer,
        postsCRUD: postsCRUDSlice.reducer,
        users: usersCRUDSlice.reducer,
    },
    middleware: [
        ...getDefaultMiddleware(),
        threadMiddleware,
        authMiddleware,
    ]
});

window.store = store;

export default store;