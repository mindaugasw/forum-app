import {createAction, createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import API from "../Api/API";
import {useDispatch} from "react-redux";


// --- Actions ---
const BASE = 'auth/';
const LOG_IN_MANUAL = BASE + 'login'; // When user fills login form
const TOKEN_REFRESH = BASE + 'refresh'; // Automatic token refresh
const LOG_OUT = BASE + 'logout';

const PENDING = '/pending';
const FULFILLED = '/fulfilled';
const REJECTED = '/REJECTED';



// --- Action creators ---
/**
 * Login with given credentials
 * @param credentials Credentials object {username: '', password: ''}
 */
export const login = createAsyncThunk(
    LOG_IN_MANUAL,
    (credentials, thunkAPI) => {
        return API.Auth.LogIn(credentials.username, credentials.password)
            .then(response => {
                if (response.ok)
                    return response.json().then();
                else
                    return response.json().then(r => thunkAPI.rejectWithValue(r));
            });
});
export const logout = createAsyncThunk(
    LOG_OUT,
    (param, thunkAPI) => {
        return API.Auth.LogOut()
            .then(response => {
                if (response.ok)
                    return response.json().then();
                else
                    return response.json().then(r => thunkAPI.rejectWithValue(r));
            });
});
export const tokenRefresh = createAsyncThunk(
    TOKEN_REFRESH,
    (param, thunkAPI) => {
        return API.Auth.TokenRefresh()
            .then(response => {
                if (response.ok)
                    return response.json().then();
                else
                    return response.json().then(r => thunkAPI.rejectWithValue(r));
            });
    });


// --- Reducer ---
export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null, /* {
            id, username, roles: [], iat, exp
        },*/
        loaded: false,
        isLoggedIn: false,
        jwt: null,
        timer: null, // Used for automatic token refresh
    },
    reducers: {

    },
    extraReducers: {
        [login.fulfilled]: (state, action) => {
            console.log('Manual login successful');
            const p = action.payload;
            /*state.loaded = true;
            state.isLoggedIn = true;
            state.jwt = p.token;
            state.user = p.user;
            state.timer = p.timer;*/
            setAuthState(state, true, p.token, p.user, p.timer);
        },
        [login.rejected]: (state, action) => {
            console.log('Manual login failed: ' + action.payload.code);
            state.loaded = true;
        },


        [logout.fulfilled]: (state, action) => {
            console.log('Logout successful');
            /*state.loaded = true;
            state.isLoggedIn = false;
            state.jwt = null;
            state.user = null;
            state.timer = null;*/
            setAuthState(state, false, null, null, null);
        },
        [logout.rejected]: (state, action) => {
            console.log('Logout failed: ' + action.payload.code);
            /*state.loaded = true;
            state.isLoggedIn = false;
            state.jwt = null;
            state.user = null;
            state.timer = null;*/
            setAuthState(state, false, null, null, null);
        },


        [tokenRefresh.fulfilled]: (state, action) => {
            console.log('Automatic login successful');
            const p = action.payload;

            /*state.loaded = true;
            state.isLoggedIn = true;
            state.jwt = p.token;
            state.user = p.user;
            state.timer = p.timer;*/
            setAuthState(state, true, p.token, p.user, p.timer);
        },
        [tokenRefresh.rejected]: (state, action) => {
            console.log('Automatic login failed: ' + action.payload.code);
            if (state.isLoggedIn) {
                // TODO display error if user was logged out during token refresh
            }

            /*state.loaded = true;
            state.isLoggedIn = false;
            state.jwt = null;
            state.user = null;
            state.timer = null;*/
            setAuthState(state, false, null, null, null);
        },
    }
});



// --- Middleware ---
export const authMiddleware = ({ getState, dispatch }) => {
    return function (next) {
        return function (action) {
            let p; // To prevent syntax error "Block scoped variables cannot be redeclared"

            switch (action.type) {
                /*case LOG_IN_MANUAL + FULFILLED:
                    console.log('@ middleware - '+LOG_IN_MANUAL+FULFILLED);
                    p = action.payload;
                    p.user = jwtDecode(p.token);
                    p.timer = restartTimer(getState().auth.timer, p.user.exp, dispatch);
                    break;*/

                case LOG_IN_MANUAL + FULFILLED:
                case TOKEN_REFRESH + FULFILLED:
                    // console.log('@ middleware - ('+TOKEN_REFRESH+'/'+LOG_IN_MANUAL+')'+FULFILLED);
                    p = action.payload;
                    p.user = jwtDecode(p.token);
                    p.timer = restartTimer(getState().auth.timer, p.user.exp, dispatch);
                    break;

                case TOKEN_REFRESH + REJECTED:  // Clear timer just in case
                case LOG_OUT + FULFILLED:
                case LOG_OUT + REJECTED:
                    stopTimer(getState().auth.timer);
                    // console.log('@ middleware - '+REJECTED);
                    break;

            }
            return next(action);

        }
    }
};



// --- Helper methods ---
function jwtDecode(jwt) {
    return JSON.parse(atob(jwt.split('.')[1]));
}

/**
 * Shortcut for setting all state variables
 * @param state object on which to set given values
 * @param isLoggedIn
 * @param jwt
 * @param user
 * @param timer
 */
function setAuthState(state, isLoggedIn, jwt, user, timer) {
    state.loaded = true;
    state.isLoggedIn = isLoggedIn;
    state.jwt = jwt;
    state.user = user;
    state.timer = timer;
}

/**
 * Restart automatic token refresh timer. Stops old one (if it exists),
 * creates new one, starts and returns it.
 * New timer will be set to tick after 85% time until JWT expiry.
 * @param oldTimer Previous timer object or null
 * @param jwtExp JWT expiry timestamp (exp from decoded JWT)
 * @param dispatch Dispatch function from the middleware
 */
function restartTimer(oldTimer, jwtExp, dispatch) {
    if (oldTimer !== null)
        clearTimeout(oldTimer);

    const timeoutMs = (jwtExp * 1000 - Date.now()) * 0.85; // Refresh token after 85% expiry time
    console.log('Token refresh in ' + (timeoutMs / 1000));
    return setTimeout(() => {
        dispatch(tokenRefresh());
    }, timeoutMs);
}

function stopTimer(timer) {
    if (timer !== null)
        clearTimeout(timer);
}