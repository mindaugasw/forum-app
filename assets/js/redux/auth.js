import {createAction, createAsyncThunk, createSlice, unwrapResult} from "@reduxjs/toolkit";
import API from "../Api/API";


// --- Actions ---
const BASE = 'auth/';
const LOG_IN_MANUAL = BASE + 'login'; // When user fills login form
const TOKEN_REFRESH = BASE + 'refresh'; // Automatic token refresh
const LOG_OUT = BASE + 'logout';


// --- Action creators ---
export const login = createAsyncThunk(
    LOG_IN_MANUAL,
    (credentials, thunkAPI) => {
        return API.Auth.LogIn(credentials.username, credentials.password)
            .then(response => {
                if (response.ok)
                    return response.json().then();
                else {
                    return response.json().then(r => thunkAPI.rejectWithValue(r));
                }
            });
});
export const tokenRefresh = createAction(TOKEN_REFRESH);
export const logout = createAction(LOG_OUT);
// TODO action creators


// --- Reducer ---
export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        /*{
            id, username, roles: [], iat, exp
        },*/
        loaded: false,
        isLoggedIn: false,
        jwt: null,
    },
    reducers: {
        // TODO
    },
    extraReducers: {
        [login.fulfilled]: (state, action) => {
            state.loaded = true;
            state.isLoggedIn = true;
            state.jwt = action.payload.token;
            state.user = jwtDecode(action.payload.token);
            console.log('Login successful');
        },
        [login.rejected]: (state, action) => {
            state.loaded = true;
            console.log('Login failed: ' + action.payload.code);
        }
    }
});


// --- Middleware ---
export const authMiddleware = ({ getState, dispatch }) => {
    return function (next) {
        return function (action) {

            switch (action.type) {
                default:
                    return next(action);
            }

        }
    }
};


// --- Helper methods ---
function jwtDecode(jwt) {
    return JSON.parse(atob(jwt.split('.')[1]));
}