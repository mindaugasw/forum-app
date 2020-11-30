/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.scss in this case)
import './styles/app.scss';
// import 'bootstrap/ /css/bootstrap.min.';
// import 'bootstrap/scss/bootstrap.scss';

import React from 'react';
import { render } from 'react-dom';
// import Utils from "./js/utils/Utils";
import "./js/utils/constants";
import "./js/utils/dateFormat";
import "./js/utils/prototypes"; // Must be imported before ReactApp?
import ReactApp from "./js/components/ReactApp";
import { Provider } from "react-redux";
import store from "./js/redux/store";
import {BrowserRouter} from "react-router-dom";

// import '@fortawesome/fontawesome-free/js/all';


render(
    <Provider store={store}>
        <BrowserRouter>
            <ReactApp />
        </BrowserRouter>
    </Provider>, document.getElementById('root')
);
