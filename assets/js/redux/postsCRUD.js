import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API from "../utils/API";
import Utils from "../utils/Utils";


// --- Actions ---
const BASE = 'thread/crud/';
const CREATE_THREAD = BASE + 'create';
const EDIT_THREAD = BASE + 'edit';
const DELETE_THREAD = BASE + 'delete';

const CREATE_COMMENT = BASE + 'create_comment';
const EDIT_COMMENT = BASE + 'edit_comment';
const DELETE_COMMENT = BASE + 'delete_comment';

// --- Action Creators ---
/**
 * @param {title<string>, content<string>} params
 */
export const createThread = createAsyncThunk(CREATE_THREAD, (params, thunkAPI) => {
    /*return API.Threads.CreateThread(params.title, params.content)
        .then(response => response.json().then(payload => { // TODO check if all thunks use the same promise return structure
            if (response.ok)
                return payload;
            else
                return thunkAPI.rejectWithValue(payload);
        }));*/

    return API.HandleThunkResponse(
        API.Threads.CreateThread(params.title, params.content),
        thunkAPI)
        .then();
});
/**
 * @param {threadId<number>, title<string>, content<string>} params
 */
export const editThread = createAsyncThunk(EDIT_THREAD, (params, thunkAPI) => {
    /*return API.Threads.EditThread(params.threadId, params.title, params.content)
        .then(response => response.json().then(payload => {
            if (response.ok)
                return payload;
            else
                return thunkAPI.rejectWithValue(payload);
        }));*/

    return API.HandleThunkResponse(
        API.Threads.EditThread(params.threadId, params.title, params.content),
        thunkAPI)
        .then();
});
/**
 * @param {threadId<number>} params
 */
export const deleteThread = createAsyncThunk(DELETE_THREAD, (params, thunkAPI) => {
    /*return API.Threads.DeleteThread(params.threadId)
        .then(response => {
            if (response.ok) {
                return true;
            } else {
                return response.json().then(payload => thunkAPI.rejectWithValue(payload));
            }
        });*/

    return API.HandleThunkResponse(
        API.Threads.DeleteThread(params.threadId),
        thunkAPI)
        .then();
});


/**
 * @param {threadId<number>, content<string>} params Thread id and comment content
 */
export const createComment = createAsyncThunk(CREATE_COMMENT, (params, thunkAPI) => {
    /*return API.Threads.CreateComment(params.threadId, params.content)
        .then(response => response.json().then(payload => {
            if (response.ok) {
                return payload;
            } else {
                return thunkAPI.rejectWithValue(payload);
            }
        }));*/

    return API.HandleThunkResponse(
        API.Threads.CreateComment(params.threadId, params.content),
        thunkAPI)
        .then();
});
/**
 * @param {threadId<number>, commentId<number>, content<string>} params Thread and comment ids, updated comment content
 */
export const editComment = createAsyncThunk(EDIT_COMMENT, (params, thunkAPI) => {
    /*return API.Threads.EditComment(params.threadId, params.commentId, params.content)
        .then(response => response.json().then(payload => {
            if (response.ok) {
                return payload;
            } else {
                return thunkAPI.rejectWithValue(payload);
            }
        }));*/

    return API.HandleThunkResponse(
        API.Threads.EditComment(params.threadId, params.commentId, params.content),
        thunkAPI)
        .then();
});
/**
 * @param {threadId<number>, commentId<number>} params Thread and comment id
 */
export const deleteComment = createAsyncThunk(DELETE_COMMENT, (params, thunkAPI) => {
    /*return API.Threads.DeleteComment(params.threadId, params.commentId)
        .then(response => {
            if (response.ok) {
                return true; // Dont return any payload as endpoint returns 204 No content
            } else {
                return response.json().then(payload => thunkAPI.rejectWithValue(payload));
            }
        });*/

    return API.HandleThunkResponse(
        API.Threads.DeleteComment(params.threadId, params.commentId),
        thunkAPI)
        .then();
});


// --- Reducer ---
export const postsCRUDSlice = createSlice({
    name: 'postsCRUD',
    initialState: {},
    reducers: {},
    extraReducers: builder => {
    builder
        // NOTE: on any successful CRUD request all threads state is cleared in threads.js reducer

        // Catch all failed requests
        .addMatcher(
            action => action.type.startsWith(BASE) && action.type.endsWith('rejected'),
            (state, action) => {
                console.error(`Error in action ${action.type}, ${
                    Utils.GetSafe(() => action.payload.error.status, 'unknown status code')}, ${
                    Utils.GetSafe(() => action.payload.error.message, 'unknown error message')}`,
                    action);
            })
    }
});
