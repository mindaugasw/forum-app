
// Actions
const BASE = 'thread/';
const ADD = BASE + 'add';

// Reducer
const initialState = {
    threads: []
}

export default function threadReducer(state = initialState, action) {
    switch (action.type) {
        case ADD:
            // state.threads.push(action.payload);
            return Object.assign({}, state, {
                threads: state.threads.concat(action.payload)
            });
        default:
            return state;
    }
}



// Action Creators
export function addThread(payload) {
    return { type: ADD, payload };
}