
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
            /*// eslint-disable-next-line no-case-declarations
            let newId = 1;
            if (state.list.length > 0)
                newId = state.list[state.list.length - 1].id + 1;


            return Object.assign({}, state, {
                list: state.list.concat({
                    id: newId,
                    title: action.payload.title
                })
            });*/

            return Object.assign({}, state, {
                list: state.list.concat(action.payload)
            });

        default:
            return state;
    }
}


// Action Creators
export function addThread(payload) {
    return { type: ADD, payload }; // payload: { id, title }
}

// Middleware
export const threadMiddleware = ({ getState, dispatch }) => {
    return function (next) {
        return function (action) {
            // console.log('MIDDLEWARE: ' + action.payload.title);

            switch (action.type) {
                case ADD:
                    const thread = action.payload;
                    addIdToThread(thread, getState().threads.list);
                    if (!threadTitleValid(thread))
                        return dispatch({ type: "error/titleEmpty"});
                    return next(action);
                default:
                    return next(action);
            }

        }
    }
}

/**
 * Add ID to new thread (if it doesn't exist)
 * @param thread Thread object in the payload (action.payload)
 * @param threadList Already existing threads list (state.threads.list)
 */
function addIdToThread(thread, threadList) {
    if (!('id' in thread)) {
        let newId = 1;
        if (threadList.length > 0)
            newId = threadList[threadList.length - 1].id + 1;
        thread.id = newId;
    }
}

/**
 * Ensure that new thread title is set and not whitespace-only
 * @param thread Thread object
 */
function threadTitleValid(thread) {
    return ('title' in thread) && thread.title.trim().length > 0;
}

