import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import API from "../utils/API";


// --- Actions ---
const BASE = 'users/';
export const REGISTER = BASE + 'register';

export const FULFILLED = '/fulfilled'; // Used to combine async thunk name, e.g. TOKEN_REFRESH+FULFILLED
export const REJECTED = '/rejected';



// --- Action creators ---
/**
 * Create new user
 * @param {username<string>, password<string>} credentials Credentials object
 */
export const register = createAsyncThunk(REGISTER, (credentials, thunkAPI) => {
    return API.Users.Register(credentials.username, credentials.password)
        .then(response => {
            if (response.ok) {
                return response.json().then;
            }
            else {
                return response.json().then(r => thunkAPI.rejectWithValue(r));
            }
        });
})


// --- State ---
const initialState = {
    formLoading: false,
}


// --- Reducer ---
export const usersCRUDSlice = createSlice({
    name: 'users',
    initialState: initialState,
    reducers: {

    },
    extraReducers: {
        [register.pending]: (state, action) => {
            state.formLoading = true;
            console.log('@ reducer', action.type, action.meta.arg);
        },
        [register.fulfilled]: (state, action) => {
            state.formLoading = false;
            console.log('@ reducer', action.type, action.payload);
        },
        [register.rejected]: (state, action) => {
            state.formLoading = false;
            console.error('@ reducer', action.type, action.payload);
        },
    }
});



// --- Middleware ---
export const authMiddleware = ({ getState, dispatch }) => {
    return function (next) {
        return function (action) {

            switch (action.type) {

            }
            return next(action);

        }
    }
};



// --- Helper methods ---