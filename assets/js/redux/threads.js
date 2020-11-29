import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API from "../utils/API";
import {login, logout} from "./auth";
import * as CRUD from "./postsCRUD";

/*
 * Contains logic for threads loading, listing and viewing, along with their respective comments loading, viewing.
 * Threads and comments CRUD logic can be found in ./postsCRUD.js
 */


// --- Actions ---
const BASE = 'thread/';
const LOAD_LIST = BASE + 'loadList';
const LOAD_SINGLE = BASE + 'loadSingle';
const LOAD_COMMENTS = BASE + 'loadComments';
const SUBMIT_VOTE = BASE + 'vote';

// const PENDING = '/pending'; // Used to combine async thunk name, e.g. TOKEN_REFRESH+FULFILLED
// const FULFILLED = '/fulfilled';
// const REJECTED = '/rejected';


// --- Action Creators ---
/**
 * @param url Url defining list GET params, like page, perpage, orderby, orderdir.
 * e.g. url='?page=1&perpage=20&orderby=id&orderdir=DESC'
 */
export const getThreads = createAsyncThunk(LOAD_LIST, (url, thunkAPI) => {
    return API.Threads.GetList(url)
        .then(response => {
            let payload = response.json();
            if (response.ok) {
                return payload;
            }
            else
                // TODO test if does not return a promise
                return thunkAPI.rejectWithValue(payload);
        });
});

/**
 * @param id Thread id to load
 */
export const getSingleThread = createAsyncThunk(LOAD_SINGLE, (id, thunkAPI) => {
    let findResult = thunkAPI.getState().threads.list.items.find(t => t.id === id);
    if (findResult !== undefined)
        return findResult;

    return API.Threads.GetSingle(id)
        .then(response => {
            let payload = response.json();
            if (response.ok) {
                return payload;
            } else {
                return payload.then(x => thunkAPI.rejectWithValue(x));
            }
        });
});

/**
 * @param url Url defining thread id and comments list GET params, like page, perpage, orderby, orderdir.
 * e.g. url='/threads/100/comments/?page=1&perpage=20&orderby=id&orderdir=DESC'
 */
export const getComments = createAsyncThunk(LOAD_COMMENTS, (url, thunkAPI) => {
    return API.Threads.GetCommentsList(url)
        .then(response => {
            let payload = response.json();
            if (response.ok) {
                return payload;
            } else {
                return payload.then(x => thunkAPI.rejectWithValue(x));
            }
        });
});

/**
 * @param params Vote params, e.g. {id: 1, direction: -1, isThread: false}
 */
export const submitVote = createAsyncThunk(SUBMIT_VOTE, (params, thunkAPI) => {
    let response = params.isThread ?
        API.Threads.SubmitThreadVote(params.id, params.direction) :
        API.Threads.SubmitCommentVote(params.id, params.direction) ;

    return response.then(r => {
        if (!r.ok) {
            return r.json().then(x => thunkAPI.rejectWithValue(x));
        }
    });
});

// --- State ---
const initialState = {
    list: { // Threads list
        url: null, // URL from which list was loaded, including pagination, sorting, filtering params.
                   // Can be used to check if currently loaded list is the needed one, if the url matches.
                   // For that reason URL generation helper method should be always used to get new url.
        loaded: 0, // LoadState.NotRequested
        pagination: {},
        items: [
            /*example item: {
                id, title, content, createdAt, updatedAt, edited, commentsCount,
                userVote, votesCount, author: {
                    id, username, roles: []
                }
            }*/
        ]
    },
    single: { // Single thread, currently viewed
        id: null, // This thread id, same as in item.id. Repeated here to avoid
                  // additional item===null check before checking item id
        item: null, // Actual thread object
        loaded: 0, // LoadState.NotRequested
        comments: { // Comments for currently viewed thread
            url: null,
            loaded: false,
            pagination: {},
            items: []
        }
    }
}

// --- Reducer ---
export const threadSlice = createSlice({
    name: 'thread',
    initialState: initialState,
    reducers: {
    },
    extraReducers: builder => {
    builder
        .addCase(getThreads.pending, (state, action) => {
            state.list.loaded = LoadState.Loading;
            state.list.url = action.meta.arg;
        })
        .addCase(getThreads.fulfilled, (state, action) => {
            // state.list.url = action.payload.url;
            state.list.loaded = LoadState.Done;
            state.list.pagination = action.payload.pagination;
            state.list.items = action.payload.items;
        })
        .addCase(getThreads.rejected, (state, action) => {
            state.list.url = action.payload.url;
            state.list.loaded = LoadState.Done;
            // TODO change .code to .error.status and test it
            console.error('Failed fetching threads: ' + getSafe(() => action.payload.code, 'unknown error'));
        })

        .addCase(getSingleThread.pending, (state, action) => {
            state.single.loaded = LoadState.Loading;
            state.single.id = action.meta.arg;
        })
        .addCase(getSingleThread.fulfilled, (state, action) => {
            state.single.item = action.payload;
            state.single.loaded = LoadState.Done;
        })
        .addCase(getSingleThread.rejected, (state, action) => {
            // state.single.id = null;
            // state.single.item = null;
            // state.single.loaded = LoadState.NotRequested; // Commented out because causes infinite loop
            console.error(`Failed fetching thread #${action.meta.arg}: ${getSafe(() => action.payload.error.status, 'unknown error')}`);
        })

        .addCase(getComments.pending, (state, action) => {
            state.single.comments.loaded = LoadState.Loading;
            state.single.comments.url = action.meta.arg;
        })
        .addCase(getComments.fulfilled, (state, action) => {
            state.single.comments.loaded = LoadState.Done;
            state.single.comments.items = action.payload.items;
            state.single.comments.pagination = action.payload.pagination;
        })
        .addCase(getComments.rejected, (state, action) => {
            // state.single.comments.items = null;
            console.error(`Failed fetching comments: ${action.meta.arg}, error: ${getSafe(() => action.payload.error.status, 'unknown error')}`);
        })

        .addCase(submitVote.pending, (state, action) => {
            const args = action.meta.arg;
            let items = []; // Array of items (threads/comment) on which to apply the vote

            // Collect all items to update: thread in list and single thread, or comment in list
            if (args.isThread) {
                let listThread = state.list.items.find(x => x.id === args.id);
                if (listThread !== undefined)
                    items.push(listThread);

                let singleThread = state.single.id === args.id && state.single.item !== null ?
                    state.single.item : undefined;
                if (singleThread !== undefined)
                    items.push(singleThread);
            } else {
                let listComment = state.single.comments.items.find(x => x.id === args.id);
                if (listComment !== undefined)
                    items.push(listComment);
            }

            // Update all selected items
            items.forEach(x => {
                x.votesCount += args.direction - x.userVote;
                x.userVote = args.direction;
            });
        })
        .addCase(submitVote.rejected, (state, action) => {
            console.error(`Failed voting: ${
                getSafe(() => action.payload.error.status, 'unknown error')
                }, {id: ${action.meta.arg.id}, direction: ${action.meta.arg.direction
                }, isThread: ${action.meta.arg.isThread}}`);
        })


        // Full state reset after any of these actions, as previously loaded data is no longer valid
        .addMatcher(action => {
            const matchingActions = [
                login.fulfilled.type,
                logout.fulfilled.type,
                CRUD.createThread.fulfilled.type,
                CRUD.editThread.fulfilled.type,
                CRUD.deleteThread.fulfilled.type,
                CRUD.createComment.fulfilled.type,
                CRUD.editComment.fulfilled.type,
                CRUD.deleteComment.fulfilled.type,
            ];

            return matchingActions.indexOf(action.type) > -1;
        }, (state, action) => {
            return initialState;
        })
    }
});




// --- Middleware ---
export const threadMiddleware = ({ getState, dispatch }) => {
    return function (next) {
        return function (action) {
            // TODO remove middleware if empty
            // switch (action.type) {
            // }

            return next(action);

        }
    }
};
