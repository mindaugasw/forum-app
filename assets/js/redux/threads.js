import { getThreadList } from "../Api/thread_api";
import { createAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";


// --- Actions ---
const BASE = 'thread/';
const ADD = BASE + 'add';
const LOAD_LIST = BASE + 'loadList';


// --- Action Creators ---
/**
 * @param title Title for new thread
 *
 */
export const addThread = createAction(ADD, function prepare(title) {
    return {
        payload: {
            title
        }
    }
});

export const getThreads = createAsyncThunk(LOAD_LIST, () => {
    return getThreadList()
        // Handle errors here. https://www.valentinog.com/blog/redux/#modern-redux-with-redux-toolkit-createasyncthunk
        .then(payload => payload);
});


// --- Reducer ---
export const threadSlice = createSlice({
    name: 'thread',
    initialState: {
        list: [],
        loading: false, // change 'loading' to 'loaded'
        pagination: {}
    },
    reducers: {
        addThread: (state, action) => {
            state.list.push(action.payload);
        }
    },
    extraReducers: {
        [getThreads.pending]: state => {
            state.loading = true;
        },
        [getThreads.fulfilled]: (state, action) => {
            state.loading = false;
            state.list = action.payload.items;
            state.pagination = action.payload.pagination;
        },
        [getThreads.rejected]: (state, action) => {
            state.loading = false;
            console.log('ERROR during action');
        }
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
};


// --- Helper methods ---
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

