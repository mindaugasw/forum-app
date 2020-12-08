import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API from "../utils/API";
import {login, logout} from "./auth";
import * as CRUD from "./postsCRUD";
import Utils from "../utils/Utils";

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


// --- Action Creators ---
/**
 * @param url Url defining list GET params, like page, perpage, orderby, orderdir.
 * e.g. url='?page=1&perpage=20&orderby=id&orderdir=DESC'
 */
export const getThreads = createAsyncThunk(LOAD_LIST, (url, thunkAPI) => {
    return API.HandleThunkResponse(
        API.Threads.GetList(url),
        thunkAPI)
        .then();
});

/**
 * @param id Thread id to load
 */
export const getSingleThread = createAsyncThunk(LOAD_SINGLE, (id, thunkAPI) => {
    let findResult = thunkAPI.getState().threads.list.items.find(t => t.id === id);
    if (findResult !== undefined)
        return findResult;

    return API.HandleThunkResponse(
        API.Threads.GetSingle(id),
        thunkAPI)
        .then();
});

/**
 * @param url Url defining thread id and comments list GET params, like page, perpage, orderby, orderdir.
 * e.g. url='/threads/100/comments/?page=1&perpage=20&orderby=id&orderdir=DESC'
 */
export const getComments = createAsyncThunk(LOAD_COMMENTS, (url, thunkAPI) => {
    return API.HandleThunkResponse(
        API.Threads.GetCommentsList(url),
        thunkAPI)
        .then();
});

/**
 * @param params Vote params, e.g. {id: 1, direction: -1, isThread: false}
 */
export const submitVote = createAsyncThunk(SUBMIT_VOTE, (params, thunkAPI) => {
    let response = params.isThread ?
        API.Threads.SubmitThreadVote(params.id, params.direction) :
        API.Threads.SubmitCommentVote(params.id, params.direction) ;

    return response.then(r => {
        if (!r.ok)
            return r.json().then(x => thunkAPI.rejectWithValue(x));
        else
            return true;
    });
});

// --- State ---
const initialState = {
    list: { // Threads list
        url: null, // URL from which list was loaded, including pagination, sorting, filtering params.
                   // Can be used to check if currently loaded list is the needed one, if the url matches.
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
        id: null, // Requested item id
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
    reducers: {},
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
            // state.list.url = action.meta.arg;
            // state.list.loaded = LoadState.Loading;
            // console.error('Failed fetching threads: ' + Utils.GetSafe(() => action.payload.error.status, 'unknown error'));
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
            // state.single.loaded = LoadState.NotRequested; // Causes infinite loop
            // console.error(`Failed fetching thread #${action.meta.arg}: ${Utils.GetSafe(() => action.payload.error.status, 'unknown error')}`);
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
            // console.error(`Failed fetching comments: ${action.meta.arg}, error: ${Utils.GetSafe(() => action.payload.error.status, 'unknown error')}`);
        })

        .addCase(submitVote.pending, (state, action) => {
            // Assumes that voting was successful and modifies state immediately, so that voting
            // would be more responsive.

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
            /*console.error(`Failed voting: ${
                Utils.GetSafe(() => action.payload.error.status, 'unknown error')
                }, {id: ${action.meta.arg.id}, direction: ${action.meta.arg.direction
                }, isThread: ${action.meta.arg.isThread}}`);*/
        })


        // Catch all failed requests
        .addMatcher(
    action => action.type.startsWith(BASE) && action.type.endsWith(REJECTED), (state, action) => {
            console.error(`Error in action ${action.type}, ${
                Utils.GetSafe(() => action.payload.error.status, 'unknown status code')}, ${
                Utils.GetSafe(() => action.payload.error.message, 'unknown error message')}`);
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
