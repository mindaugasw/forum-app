import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API from "../Api/API";

/*
 * Contains logic from threads loading, listing and viewing, along with their respective comments loading, viewing.
 */


// --- Actions ---
const BASE = 'thread/';
// const ADD = BASE + 'add';
const LOAD_LIST = BASE + 'loadList';

const PENDING = '/pending'; // Used to combine async thunk name, e.g. TOKEN_REFRESH+FULFILLED
const FULFILLED = '/fulfilled';
const REJECTED = '/rejected';


// --- Action Creators ---
/*
 * @param title Title for new thread
 */
/*export const addThread = createAction(ADD, function prepare(title) {
    return {
        payload: {
            title
        }
    }
});*/

/**
 * @param url Url defining list GET params, like page, perpage, orderby, orderdir.
 * e.g. url='?page=1&perpage=20&orderby=id&orderdir=DESC'
 */
export const getThreads = createAsyncThunk(LOAD_LIST, (url, thunkAPI) => {
    // if (!url) url = buildParamsUrl();

    return API.Threads.GetList(url)
        .then(response => {

            let payload = response.json().addProperty('url', url);
            // payload.url = url;
            // console.log(payload);
            if (response.ok) {
                // console.log(payload);
                /*return payload.then(x => {
                    let y = x;
                    y.url = url;
                    return y;
                });*/
                // return payload.addProperty('url', url);
                return payload;
            }
            else
                return thunkAPI.rejectWithValue(payload);
        });
});


// --- State ---
const initialState = {
    list: { // Threads list
        url: null,  // URL from which list was loaded, including pagination, sorting, filtering params.
                    // Can be used to check if currently loaded list is the needed one, if the url matches.
                    // For that reason URL generation helper method should be always used to get new url.
        loaded: 0, // LoadingState.NotRequested
        pagination: {},
        items: [
            /*{
                id, title, content, createdAt, updatedAt, edited, commentsCount,
                userVote, votesCount, author: {
                    id, username, roles: []
                }
            }*/
        ]
    },
    single: { // Single thread, currently viewed
        item: null, // Actual thread object
        loaded: false,
        comments: { // Comments for currently viewed thread
            url: null,
            loaded: false,
            pagination: {},
            items: []
        }
    }
    // loaded: false,
    // pagination: {}
}

// --- Reducer ---
export const threadSlice = createSlice({
    name: 'thread',
    initialState: initialState,
    reducers: {
        /*addThread: (state, action) => {
            state.list.push(action.payload);
        }*/
    },
    extraReducers: {
        [getThreads.pending]: (state, action) => {
            state.list.loaded = LoadState.Loading;
            state.list.url = action.meta.arg;
        },
        [getThreads.fulfilled]: (state, action) => {
            state.list.url = action.payload.url;
            state.list.loaded = LoadState.Done;
            state.list.pagination = action.payload.pagination;
            state.list.items = action.payload.items;
        },
        [getThreads.rejected]: (state, action) => {
            state.list.url = action.payload.url;
            state.list.loaded = LoadState.Done;
            console.log('Failed fetching threads: ' + getSafe(() => action.payload.code, 'unknown error'));
        }
    }
});


// --- Middleware ---
export const threadMiddleware = ({ getState, dispatch }) => {
    return function (next) {
        return function (action) {

            switch (action.type) {
                /*case LOAD_LIST:
                case LOAD_LIST+PENDING:
                case LOAD_LIST+FULFILLED:
                case LOAD_LIST+REJECTED:
                    console.log(action.type);
                    console.log(action.payload);
                    break;*/
                /*case ADD:
                    const thread = action.payload;
                    addIdToThread(thread, getState().threads.list);
                    if (!threadTitleValid(thread))
                        return dispatch({ type: "error/titleEmpty"});
                    return next(action);*/
            }

            return next(action);

        }
    }
};


// --- Helper methods ---
/*
 * Add ID to new thread (if it doesn't exist)
 * @param thread Thread object in the payload (action.payload)
 * @param threadList Already existing threads list (state.threads.list)
 */
/*function addIdToThread(thread, threadList) {
    if (!('id' in thread)) {
        let newId = 1;
        if (threadList.length > 0)
            newId = threadList[threadList.length - 1].id + 1;
        thread.id = newId;
    }
}*/

/*
 * Ensure that new thread title is set and not whitespace-only
 * @param thread Thread object
 */
/*function threadTitleValid(thread) {
    return ('title' in thread) && thread.title.trim().length > 0;
}*/

/*export function GenerateThreadsParamsUrl(page=1, perpage=20,
                                  orderby='id', orderdir='DESC') {
    return `?page=${page}&perpage=${perpage}&orderby=${orderby}&orderdir=${orderdir}`;
}
export function GenerateCommentsUrl(threadId, page=1, perpage=10,
                                    orderby='id', orderdir='ASC') {
    throw 'Not implemented';
}*/