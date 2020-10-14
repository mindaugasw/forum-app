import React from "react";
import ThreadList from "./ThreadList";
import AuthForm from "./AuthForm";

export default class ReactApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            auth: {
                jwt: null,
                authLoaded: false, // Did initial authentication request (/api/token/refresh) finish already?
                isAuthenticated: false, // Is the user logged in?
                user: null // Currently logged in user object. Should be null if not authenticated
                // user: { id: 1, username: 'user1', roles: ['ROLE_USER'] } // Example user object
            }
        }

        this.handleAuthUpdate = this.handleAuthUpdate.bind(this);
    }

    handleAuthUpdate(jwt, user) {
        this.setState({
            auth: {
                jwt: jwt,
                authLoaded: true,
                isAuthenticated: user !== null,
                user: user
            }
        });
    }


    render() {
        return (
        <div>
            <AuthForm {...this.state.auth} onAuthLoad={this.handleAuthUpdate} />
            <ThreadList/>
        </div>);
    }
}