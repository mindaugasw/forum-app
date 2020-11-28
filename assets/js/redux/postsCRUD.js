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
/**
 * @param {title<string>, content<string>} params
 */
export const createThread = createAsyncThunk(CREATE_THREAD, (params, thunkAPI) => {
    return API.Threads.CreateThread(params.title, params.content)
        .then(response => response.json().then(payload => { // TODO replace all thunks with this structure?
            if (response.ok)
                return payload;
            else
                return thunkAPI.rejectWithValue(payload);
        }));
        /*.then(response => {
            let payload = response.json().then();

            if (response.ok) {
                return payload;
            } else {
                return thunkAPI.rejectWithValue(payload);
            }
        });*/
});
/**
 * @param {threadId<number>, title<string>, content<string>} params
 */
export const editThread = createAsyncThunk(EDIT_THREAD, (params, thunkAPI) => {
    return API.Threads.EditThread(params.threadId, params.title, params.content)
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
 * @param {threadId<number>} params
 */
export const deleteThread = createAsyncThunk(DELETE_THREAD, (params, thunkAPI) => {
    return API.Threads.DeleteThread(params.threadId)
        .then(response => {
            if (response.ok) {
                return true;
            } else {
                let payload = response.json();
                return thunkAPI.rejectWithValue(payload);
            }
        });
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
 * @param {threadId<number>, commentId<number>, content<string>} params Thread and comment ids, updated comment content
 */
export const editComment = createAsyncThunk(EDIT_COMMENT, (params, thunkAPI) => {
    return API.Threads.EditComment(params.threadId, params.commentId, params.content)
        .then(response => {
            let payload = response.json();
            if (response.ok) {
                return payload;
            } else {
                return thunkAPI.rejectWithValue(payload);
            }
        });
})
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
        });
});



// --- Reducer ---
export const postsCRUDSlice = createSlice({
    name: 'postsCRUD',
    initialState: {},
    reducers: {},
    extraReducers: builder => {
    builder
        .addCase(CREATE_THREAD+PENDING, (state, action) => {
            console.log(CREATE_THREAD+PENDING, action);
        })
        .addCase(CREATE_THREAD+FULFILLED, (state, action) => {
            console.log(CREATE_THREAD+FULFILLED, action);
        })
        .addCase(CREATE_THREAD+REJECTED, (state, action) => {
            console.log(CREATE_THREAD+REJECTED, action);
        })
        // Catch all failed requests
        .addMatcher(
            action => action.type.startsWith(BASE) && action.type.endsWith('rejected'), (state, action) => {
                console.error(`Error in action ${action.type}, ${
                    getSafe(() => action.payload.error.status, 'unknown status code')}, ${
                    getSafe(() => action.payload.error.message, 'unknown error message')}`);
            })
    }
});