import {createAction, createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import API from "../Api/API";

// --- Actions ---
const BASE = 'test/';
const TEST1 = BASE + 'act1';
const SUBSCRIBE = BASE + 'subscribe';

const PENDING = '/pending'; // Used to combine async thunk name
const FULFILLED = '/fulfilled';
const REJECTED = '/rejected';



// --- Action creators ---
export const resultAction = createAsyncThunk(
    TEST1,
    (param, thunkAPI) => {
        const payload = {
            act: TEST1,
            val: 55
        }
        console.log('E @ Action creator, ' + TEST1 + ', payload:');
        console.log(payload);

        return payload;
    }
);
export const subscribeAction = createAction(SUBSCRIBE);
/*export const tokenRefresh = createAsyncThunk(
    TOKEN_REFRESH,
    (param, thunkAPI) => {
        return API.Auth.TokenRefresh()
            .then(response => {
                if (response.ok)
                    return response.json().then();
                else
                    return response.json().then(r => thunkAPI.rejectWithValue(r));
            });
    });*/

let callbacks = [];

// --- Reducer ---
export const eventsSlice = createSlice({
    name: 'events',
    initialState: {
    },
    reducers: {

    },
    extraReducers: {
        [resultAction.pending]: (state, action) => {
            console.log('E @ Reducer, ' + action.type + ', payload:');
            console.log(action.payload);
        },
        [resultAction.fulfilled]: (state, action) => {
            console.log('E @ Reducer, ' + action.type + ', payload:');
            console.log(action.payload);
        },
        [resultAction.rejected]: (state, action) => {
            console.log('E @ Reducer, ' + action.type + ', payload:');
            console.log(action.payload);
        }
    }
});



// --- Middleware ---
export const eventsMiddleware = ({ getState, dispatch }) => {
    return function (next) {
        return function (action) {

            // console.log('E @ Middleware, NO SWITCH, ' + action.type);
            switch (action.type) {

                case TEST1:
                    console.log('E @ Middleware, ' + action.type + ' (malformed action?), payload:');
                    break;
                case TEST1 + PENDING:
                case TEST1 + FULFILLED:
                case TEST1 + REJECTED:
                    console.log('E @ Middleware, ' + action.type + ', payload:');
                    console.log(action.payload);

                    break;


                case SUBSCRIBE:
                    console.log('yay, Pushing to callbacks array');
                    console.log(action);
                    callbacks.push(action.payload.callback);
                    break;

            }
            return next(action);

        }
    }
};

