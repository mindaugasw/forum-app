import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import API from "../utils/API";


// --- Actions ---
const BASE = 'auth/';
const LOG_IN_MANUAL = BASE + 'login'; // When user fills login form
const TOKEN_REFRESH = BASE + 'refresh'; // Automatic token refresh
const LOG_OUT = BASE + 'logout';

const FULFILLED = '/fulfilled'; // Used to combine async thunk name, e.g. TOKEN_REFRESH+FULFILLED
const REJECTED = '/rejected';



// --- Action creators ---
/**
 * Login with given credentials
 * @param credentials Credentials object {username: '', password: ''}
 */
export const login = createAsyncThunk(LOG_IN_MANUAL, (credentials, thunkAPI) => {
    return API.Auth.LogIn(credentials.username, credentials.password)
        .then(response => {
            if (response.ok)
                return response.json().then();
            else
                return response.json().then(r => thunkAPI.rejectWithValue(r));
        });
});
export const logout = createAsyncThunk(LOG_OUT, (param, thunkAPI) => {
    return API.Auth.LogOut()
        .then(response => {
            if (response.ok)
                return response.json().then();
            else
                return response.json().then(r => thunkAPI.rejectWithValue(r));
        });
});
export const tokenRefresh = createAsyncThunk(TOKEN_REFRESH, (param, thunkAPI) => {
    return API.Auth.TokenRefresh()
        .then(response => {
            if (response.ok)
                return response.json().then();
            else
                return response.json().then(r => thunkAPI.rejectWithValue(r));
        });
});


// --- State ---
const initialState = {
    user: null, /* {    // user object. Available only after login
            id, username, roles: [], iat, exp
        },*/
    loaded: false,  // Is the initial TOKEN_REFRESH request finished?
    isLoggedIn: false, // TODO remove isLoggedIn. Check authentication by whether user is null or not
    jwt: null,      // Full encoded token
    timer: null,    // Timer used for automatic token refresh
    // TODO add property: admin: bool
}


// --- Reducer ---
export const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {

    },
    extraReducers: {
        [login.fulfilled]: (state, action) => {
            console.log('Manual login successful');
            const p = action.payload;
            setAuthState(state, true, p.token, p.user, p.timer);
        },
        [login.rejected]: (state, action) => {
            // TODO change .code to .error.status and test it
            console.error('Manual login failed: ' + getSafe(() => action.payload.code, 'unknown error'));
            state.loaded = true;
        },


        [tokenRefresh.fulfilled]: (state, action) => {
            console.log('Automatic login successful');
            const p = action.payload;
            setAuthState(state, true, p.token, p.user, p.timer);
        },
        [tokenRefresh.rejected]: (state, action) => {
            // TODO change .code to .error.status and test it
            const errorCode = getSafe(() => action.payload.code, 'unknown error');
            console.info('Automatic login failed: ' + errorCode);
            state.loaded = true;

            if (state.isLoggedIn && errorCode === 401) {
                setAuthState(state, false, null, null, null);
            }
        },


        [logout.fulfilled]: (state, action) => {
            console.log('Logout successful');
            setAuthState(state, false, null, null, null);
        },
        [logout.rejected]: (state, action) => {
            // TODO change .code to .error.status and test it
            console.error('Logout failed: ' + getSafe(() => action.payload.code, 'unknown error'));
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

                case LOG_IN_MANUAL + FULFILLED:
                case TOKEN_REFRESH + FULFILLED:
                    p = action.payload;
                    p.user = jwtDecode(p.token);
                    p.timer = restartTimer(getState().auth.timer, p.user.exp, dispatch);
                    break;

                // case TOKEN_REFRESH + REJECTED:  // Clear timer just in case
                case LOG_OUT + FULFILLED:
                case LOG_OUT + REJECTED:
                    stopTimer(getState().auth.timer);
                    // TODO redirect to homepage
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
 * Restart timer for automatic token refresh. Stops old one (if it exists),
 * creates new one, starts and returns it.
 * New timer will be set to timeout after 85% time until JWT expiry.
 * @param oldTimer Previous timer object or null
 * @param jwtExp JWT expiry timestamp (exp from decoded JWT)
 * @param dispatch Dispatch function from the middleware
 */
function restartTimer(oldTimer, jwtExp, dispatch) {
    if (oldTimer !== null)
        clearTimeout(oldTimer);

    const timeoutMs = (jwtExp * 1000 - Date.now()) * 0.85; // Refresh token after 85% expiry time

    return setTimeout(() => {
        dispatch(tokenRefresh());
    }, timeoutMs);
}

function stopTimer(timer) {
    if (timer !== null)
        clearTimeout(timer);
}

/**
 * Is the given user admin? Checks for admin role on user object.
 * @param user
 * @returns {*|boolean}
 */
export function isUserAdmin(user) {
    return user && user.roles.indexOf('ROLE_ADMIN') > -1;
}

/**
 * Does given user have permissions to manage (edit, delete) given thread/comment?
 * Checks if user is admin or is author of that thread/comment.
 * @param user User object
 * @param post Thread or comment object
 * @returns {*|boolean}
 */
export function canUserManagePost(user, post) {
    return isUserAdmin(user) || (user && user.id === post.author.id);
}