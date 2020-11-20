import React from 'react';
import { connect } from "react-redux";
import { login, logout, tokenRefresh } from "../redux/auth";
import PropTypes from "prop-types";
import Loading from "./Loading";

const mapDispatchToProps = {
    login,
    logout,
    tokenRefresh
}

const mapStateToProps = state => {
    let user = {};
    if (state.auth.user !== null) {
        user = {
            id: state.auth.user.id,
            username: state.auth.user.username,
            roles: state.auth.user.roles
        };
    }

    return {
        ...user,
        loaded: state.auth.loaded,
        isLoggedIn: state.auth.isLoggedIn,
    };
}

class AuthForm extends React.Component {
    constructor(props) {
        super(props);

        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    componentDidMount() {
        // this.props.tokenRefresh();
    }

    handleFormSubmit(event) {
        event.preventDefault();

        const usernameInput = event.target.elements.namedItem('username');
        const passwordInput = event.target.elements.namedItem('password');
        const body = {
            'username': usernameInput.value,
            'password': passwordInput.value
        }

        this.props.login(body);
    }

    handleLogout() {
        this.props.logout();
    }

    render() {
        const {loaded, isLoggedIn} = this.props;

        return (
            <div>
                <hr />
                <b>Authentication</b>

                <form onSubmit={ this.handleFormSubmit }>
                    Username: <input name='username' type='text' /><br />
                    Password: <input name='password' type='password' /><br />
                    <button type='submit'>Log in</button>{'  '}
                    <button type='button' onClick={this.handleLogout}>Log out</button>
                </form>

                Auth {loaded ? 'loaded' : <Loading />},{' '}
                {isLoggedIn ?
                    `logged in as: ${this.props.username} (#${this.props.id}), [${this.props.roles}]`
                    : 'not logged in'}
                <hr />
            </div>
        );
    }

    static get propTypes() {
        const p = PropTypes;
        return {
            login: p.func.isRequired,
            logout: p.func.isRequired,
            loaded: p.bool.isRequired,
            isLoggedIn: p.bool.isRequired,
            id: p.number,
            username: p.string,
            roles: p.array,
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthForm);