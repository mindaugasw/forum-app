import { getThreadList } from "../Api/thread_api";
import {createAction, createReducer} from "@reduxjs/toolkit";


// --- Actions ---
const BASE = 'thread/';
const ADD = BASE + 'add';
// const GET_DATA = BASE + 'dataLoad';
const DATA_LOADED = BASE + 'dataLoaded';

// --- Action Creators ---
export const addThread = createAction(ADD, function prepare(title) {
    return {
        payload: {
            title
        }
    }
});

export const getThreads = () => {
    return function (dispatch) {
        getThreadList()
            .then((data) =>
                dispatch({ type: DATA_LOADED, payload: { list: data.items, pagination: data.pagination }})
            );
    }
}

// --- Reducer ---
const initialState = {
    list: []
}

export const threadReducer = createReducer(initialState, {
    [addThread]: (state, action) => {
        state.list.push(action.payload);
    },
    [DATA_LOADED]: (state, action) => {
        state.list = action.payload.list;
        state.pagination = action.payload.pagination;
    }
});


// --- Middleware ---
export const threadMiddleware = ({ getState, dispatch }) => {
    return function (next) {
        return function (action) {
            switch (action.type) {
                case ADD:
                    const thread = action.payload;
                    addIdToThread(thread, getState().threads.list);
                    if (!threadTitleValid(thread))
                        return dispatch({ type: "error/titleEmpty"});
                    return next(action);
                default:
                    return next(action);
            }

        }
    }
}

/**
 * Add ID to new thread (if it doesn't exist)
 * @param thread Thread object in the payload (action.payload)
 * @param threadList Already existing threads list (state.threads.list)
 */
function addIdToThread(thread, threadList) {
    if (!('id' in thread)) {
        let newId = 1;
        if (threadList.length > 0)
            newId = threadList[threadList.length - 1].id + 1;
        thread.id = newId;
    }
}

/**
 * Ensure that new thread title is set and not whitespace-only
 * @param thread Thread object
 */
function threadTitleValid(thread) {
    return ('title' in thread) && thread.title.trim().length > 0;
}

