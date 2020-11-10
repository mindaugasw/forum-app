/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import './styles/app.css';

import React from 'react';
import {render} from 'react-dom';
import ReactApp from './js/components/ReactApp';
// import '@fortawesome/fontawesome-free/js/all';


// Need jQuery? Install it with "yarn add jquery", then uncomment to import it.
// import $ from 'jquery';

console.log('Webpack Encore @ assets/app.js');



// Actions
const increment = () => {
    return {
        type: 'INCREMENT'
    }
}
const decrement = () => {
    return {
        type: 'DECREMENT'
    }
}

// Reducer
/*const counter = (state = 0, action) => {
    switch (action.type) {
        case 'INCREMENT':
            return state + 1;
        case  'DECREMENT':
            return state - 1;
    }
}*/


// Store
// import { createStore } from '@reduxjs/toolkit';
// import rootReducer from './js/redux/reducers/rootReducer';
import Counter from "./js/components/ReduxTest/Counter";
import { Provider } from "react-redux";
/*let store = createStore(
    rootReducer
    , window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);*/


// store.subscribe(() => console.log(store.getState()));

// Dispatch
// store.dispatch(increment());

import store from "./js/store";
import { addThread } from "./js/redux/threads";
import ThreadListRedux from "./js/components/ReduxTest/ThreadListRedux";

// store.subscribe(() => console.log(store.getState()));
// window.store = store;
// window.addThread = addThread;

// store.dispatch(addThread({id: 2, title: 'From app.js'}));


render(
    <Provider store={store}>
        {/*<Counter />*/}
        <ThreadListRedux />
        <ReactApp />
    </Provider>, document.getElementById('sample-div'));
