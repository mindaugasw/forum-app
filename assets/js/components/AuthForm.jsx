import React from 'react';
import '../Api/api_fetch';
import {api_fetch} from "../Api/api_fetch";
import PropTypes from "prop-types";


// https://medium.com/@ryanchenkie_40935/react-authentication-how-to-store-jwt-in-a-cookie-346519310e81

export default class AuthForm extends React.Component {
    constructor(props) {
        super(props);

        // this.state = {
        //     authLoaded: false,
        //     isAuthenticated: false
        // }

        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.tryAutoLogin = this.tryAutoLogin.bind(this);
    }

    componentDidMount() {
        this.tryAutoLogin();
    }


    handleFormSubmit(event) {
        event.preventDefault();

        const usernameInput = event.target.elements.namedItem('username');
        const passwordInput = event.target.elements.namedItem('password');
        const body = {
            'username': usernameInput.value,
            'password': passwordInput.value
        }

        api_fetch('POST', '/login_check', body)
            .then(json => {
                console.log('Successfully logged in');
                this.props.onAuthLoad(json.token, null); // TODO decode JWT
            })
            .catch((response) => console.log('Authentication error', response))
    }

    tryAutoLogin() {
        // automatically log in using refresh token
        api_fetch('POST', '/token/refresh')
            .then(json => {
                console.log('Successfully automatically authenticated');
                this.props.onAuthLoad(json.token, null);
            })
            .catch((response) => console.log('Authentication error', response))
    }

    render() {
        const {jwt, authLoaded, isAuthenticated, user } = this.props;

        return (
        <div>
            <b>Auth form</b>
            <form onSubmit={ this.handleFormSubmit }>
                Username: <input name='username' type='text' />
                Password: <input name='password' type='password' />
                <button type='submit'>Log in</button>
            </form><br/>
            Auth loaded: {authLoaded.toString()} <br/>
            Is authenticated: {isAuthenticated.toString()} <br/>
            JWT: <input name='jwt' type='text' value={jwt||''} readOnly='readOnly'/><br/>
            User: {JSON.stringify(user)}
            <hr/>
        </div>
        );
    }

    static get propTypes() {
        return {
            onAuthLoad: PropTypes.func.isRequired,
            jwt: PropTypes.string,
            authLoaded: PropTypes.bool.isRequired,
            isAuthenticated: PropTypes.bool.isRequired,
            user: PropTypes.object
        };
    }
}