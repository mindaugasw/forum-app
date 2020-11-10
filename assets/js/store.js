import { createStore, applyMiddleware, compose } from "@reduxjs/toolkit";
import rootReducer from "./redux/reducers/rootReducer";
import { threadMiddleware } from "./redux/threads";

const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({features: {persist: false}}) || compose();

const store = createStore(
    rootReducer,
    storeEnhancers(applyMiddleware(threadMiddleware))
    // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({features: {persist: false}})
);

export default store;