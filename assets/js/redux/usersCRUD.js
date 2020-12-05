import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import API from "../utils/API";
import Utils from "../utils/Utils";
import {login, logout, tokenRefresh} from "./auth";


// --- Actions ---
const BASE = 'users/';
export const REGISTER = BASE + 'register'; // TODO remove export
const LOAD_LIST = BASE + 'loadList';
const LOAD_SINGLE = BASE + 'loadSingle';
const EDIT_USER = BASE + 'edit';
const DELETE_USER = BASE + 'delete';

// --- Action creators ---
/**
 * Create new user
 * @param {username<string>, password<string>} credentials Credentials object
 */
export const register = createAsyncThunk(REGISTER, (credentials, thunkAPI) => {
    /*return API.Users.Register(credentials.username, credentials.password)
        .then(response => {
            if (response.ok) {
                return response.json().then();
            }
            else {
                return response.json().then(r => thunkAPI.rejectWithValue(r));
            }
        });*/

    return API.HandleThunkResponse(
        API.Users.Register(credentials.username, credentials.password),
        thunkAPI)
        .then();
})

export const getUsers = createAsyncThunk(LOAD_LIST, (url, thunkAPI) => {
    return API.HandleThunkResponse(
        API.Users.GetList(url),
        thunkAPI)
        .then();
});

export const getSingleUser = createAsyncThunk(LOAD_SINGLE, (id, thunkAPI) => {
    return API.HandleThunkResponse(
        API.Users.GetSingle(id),
        thunkAPI)
        .then();
});

/**
 * @param {id<number>, roles<array>, oldPassword<string>, newPassword<string>} params
 */
export const editUser = createAsyncThunk(EDIT_USER, (params, thunkAPI) => {
    return API.HandleThunkResponse(
        API.Users.Edit(
            params.id,
            params.roles || null,
            params.newPassword || null,
            params.oldPassword || null),
        thunkAPI
    ).then();
});

export const deleteUser = createAsyncThunk(DELETE_USER, (id, thunkAPI) => {
    return API.Users.Delete(id)
        .then(response => {
            if (response.ok) {
                return true;
            } else {
                return response.json().then(payload => thunkAPI.rejectWithValue(payload));
            }
        });
});

// --- State ---
const initialState = {
    list: { // Users list
        url: null, // URL from which list was loaded, including pagination, sorting, filtering params.
                   // Can be used to check if currently loaded list is the needed one, if the url matches.
        loaded: 0, // LoadState.NotRequested
        pagination: {},
        items: [
            /*example item: {
                id, username, roles[]
            }*/
        ],
    },
    single: { // Single user
        id: null, // Requested item id
        item: null, // Actual user object
        loaded: 0, // LoadState.NotRequested
    },
}


// --- Reducer ---
export const usersCRUDSlice = createSlice({
    name: 'users',
    initialState: initialState,
    reducers: {},
    extraReducers:  builder => {
    builder
        .addCase(getUsers.pending, (state, action) => {
            state.list.loaded = LoadState.Loading;
            state.list.url = action.meta.arg;
        })
        .addCase(getUsers.fulfilled, (state, action) => {
            state.list.loaded = LoadState.Done;
            state.list.pagination = action.payload.pagination;
            state.list.items = action.payload.items;
        })
        .addCase(getUsers.rejected, (state, action) => {
            // state.list.url = action.payload.url;
            // state.list.loaded = LoadState.Loading;
            // console.error('Failed fetching users: ' + Utils.GetSafe(() => action.payload.error.status, 'unknown error'));
        })

        .addCase(getSingleUser.pending, (state, action) => {
            state.single.loaded = LoadState.Loading;
            state.single.id = action.meta.arg;
        })
        .addCase(getSingleUser.fulfilled, (state, action) => {
            state.single.loaded = LoadState.Done;
            state.single.item = action.payload;
        })
        .addCase(getSingleUser.rejected, (state, action) => {
            // console.error(`Failed fetching user #${action.meta.arg}: ${Utils.GetSafe(() => action.payload.error.status, 'unknown error')}`);
        })


        // Catch all failed requests
        .addMatcher(
        action => action.type.startsWith(BASE) && action.type.endsWith(REJECTED), (state, action) => {
            console.error(`Error in action ${action.type}, ${
                Utils.GetSafe(() => action.payload.error.status, 'unknown status code')}, ${
                Utils.GetSafe(() => action.payload.error.message, 'unknown error message')}`);
        })


        // Full state reset after these actions, as previously loaded data is no longer valid
        .addMatcher(action => {
            const matchingActions = [
                login.fulfilled.type,
                logout.fulfilled.type,
                register.fulfilled.type,
                editUser.fulfilled.type,
                deleteUser.fulfilled.type
            ];

            return matchingActions.indexOf(action.type) > -1;
        }, (state, action) => {
            return initialState;
        })
    },
});



// --- Middleware ---
export const authMiddleware = ({ getState, dispatch }) => {
    return function (next) {
        return function (action) {

            // TODO remove middleware?
            /*switch (action.type) {

            }*/
            return next(action);

        }
    }
};



// --- Helper methods ---