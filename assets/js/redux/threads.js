
// Actions
const BASE = 'thread/';
const ADD = BASE + 'add';

// Reducer
const initialState = {
    list: [
        { id: 1, title: 'Initial state thread'}
    ]
}

export default function threadReducer(state = initialState, action) {
    switch (action.type) {
        case ADD:
            // eslint-disable-next-line no-case-declarations
            let newId = 1;
            if (state.list.length > 0)
                newId = state.list[state.list.length - 1].id + 1;


            return Object.assign({}, state, {
                list: state.list.concat({
                    id: newId,
                    title: action.payload.title
                })
            });
        default:
            return state;
    }
}



// Action Creators
export function addThread(payload) {
    return { type: ADD, payload };
}