import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API from "../utils/API";


// --- Actions ---
const BASE = 'thread/crud/';
const CREATE_THREAD = BASE + 'create';
const EDIT_THREAD = BASE + 'edit';
const DELETE_THREAD = BASE + 'delete';

const CREATE_COMMENT = BASE + 'create_comment';

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
            if (response.ok)
                return payload;
            else
                return thunkAPI.rejectWithValue(payload);
        });
});


// --- State ---
const initialState = {}

// --- Reducer ---
export const postsCRUDSlice = createSlice({
    name: 'postsCRUD',
    initialState: initialState,
    reducers: {},
    extraReducers: []
});