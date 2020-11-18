import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API from "../utils/API";


// --- Actions ---
const BASE = 'thread/crud/';
const CREATE_THREAD = BASE + 'create';
const EDIT_THREAD = BASE + 'edit';
const DELETE_THREAD = BASE + 'delete';

const CREATE_COMMENT = BASE + 'create_comment';
const EDIT_COMMENT = BASE + 'edit_comment';
const DELETE_COMMENT = BASE + 'delete_comment';

// --- Action Creators ---
export const createThread = createAsyncThunk(CREATE_THREAD, (params, thunkAPI) => {
    // TODO
});

/**
 * @param {id<number>, content<string>} params Thread id and comment content
 */
export const createComment = createAsyncThunk(CREATE_COMMENT, (params, thunkAPI) => {
    return API.Threads.CreateComment(params.id, params.content)
        .then(response => {
            let payload = response.json();
            if (response.ok) {
                return payload;
            } else {
                return thunkAPI.rejectWithValue(payload);
            }
        });
});

/**
 * @param {threadId<number>, commentId<number>} params Thread and comment id
 */
export const deleteComment = createAsyncThunk(DELETE_COMMENT, (params, thunkAPI) => {
    return API.Threads.DeleteComment(params.threadId, params.commentId)
        .then(response => {
            if (response.ok) {
                return true;
            } else {
                let payload = response.json();
                return thunkAPI.rejectWithValue(payload);
            }
        })
});


// --- State ---
const initialState = {}

// --- Reducer ---
export const postsCRUDSlice = createSlice({
    name: 'postsCRUD',
    initialState: initialState,
    reducers: {},
    extraReducers: builder => {
    builder
        // Catch all failed requests
        .addMatcher(
            action => action.type.startsWith(BASE) && action.type.endsWith('rejected'), (state, action) => {
                console.error(`Error in action ${action.type}, ${
                    getSafe(() => action.payload.error.status, 'unknown error')}, ${
                    getSafe(() => action.payload.error.message, 'unknown error')}`);
            })
    }
});