import counterReducer from "./counter";
import loggedReducer from "./isLogged";
import { combineReducers } from "@reduxjs/toolkit";
// import threadReducer from "./threadReducer";
import threadReducer from "../threads";

const rootReducer = combineReducers({
    threads: threadReducer,
    counter: counterReducer,
    isLogged: loggedReducer
})
export default rootReducer;