import './styles/app.scss';
import React from 'react';
import { render } from 'react-dom';
import "./js/utils/constants";
import "./js/utils/prototypes";
import "./js/utils/dateFormat";
import ReactApp from "./js/components/ReactApp";
import { Provider } from "react-redux";
import store from "./js/redux/store";
import {BrowserRouter} from "react-router-dom";

render(
    <Provider store={store}>
        <BrowserRouter>
            <ReactApp />
        </BrowserRouter>
    </Provider>, document.getElementById('root')
);
