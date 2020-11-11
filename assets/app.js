/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import './styles/app.css';

import React from 'react';
import { render } from 'react-dom';
import ReactApp from './js/components/ReactApp';
// import '@fortawesome/fontawesome-free/js/all';
import { Provider } from "react-redux";

import store from "./js/store";
import ThreadListRedux from "./js/components/ReduxTest/ThreadListRedux";

render(
    <Provider store={store}>
        <ThreadListRedux />
        <ReactApp />
    </Provider>, document.getElementById('sample-div')
);
