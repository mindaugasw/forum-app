// import { createStore, applyMiddleware, compose } from "@reduxjs/toolkit";
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
// import rootReducer from "./redux/reducers/rootReducer";
import { threadReducer, threadMiddleware } from "./redux/threads";
// import thunk from "redux-thunk";

/*const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({features: {
    pause: true,
    lock: true,
    persist: true,
    jump: true,
    skip: true,
    reorder: true,
    dispatch: true
}}) || compose();

const store = createStore(
    rootReducer,
    storeEnhancers(applyMiddleware(threadMiddleware, thunk))
    // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({features: {persist: false}})
);*/

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