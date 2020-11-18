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
// import '@fortawesome/fontawesome-free/js/all';
import { Provider } from "react-redux";
import "./js/utils/utils";

import store from "./js/store";
import ReactApp from "./js/components/ReactApp";


render(
    <Provider store={store}>
        {/*<SingleThreadRedux />*/}
        {/*<ThreadList />*/}
        {/*<__ReactApp />*/}
        <ReactApp />
    </Provider>, document.getElementById('sample-div')
);
