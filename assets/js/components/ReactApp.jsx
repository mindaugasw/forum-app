import React from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link, NavLink
} from "react-router-dom";
import ThreadList from "./ThreadList";
import AuthForm from "./AuthForm";
import ThreadForm from "./ThreadForm";

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


    /*render() {
        return (
        <div>
            <AuthForm {...this.state.auth} onAuthLoad={this.handleAuthUpdate} />
            <ThreadList/>
        </div>);
    }*/

    render() {
        return (
          <Router>
              <div>

                  <nav>
                      <ul>
                          <li><NavLink to='/'>Home</NavLink></li>
                          <li><NavLink to='/threadlist'>Thread list</NavLink></li>
                          <li><NavLink to='/threadform'>Thread form</NavLink></li>
                          {/*<li><NavLink to='/authform'>Auth form</NavLink></li>*/}
                      </ul>
                  </nav>

                  <Switch>
                      <Route exact path='/'>
                          App homepage
                      </Route>
                      <Route path='/threadlist'>
                          <ThreadList/>
                      </Route>
                      {/*<Route path='/authform'>
                          <AuthForm {...this.state.auth} onAuthLoad={this.handleAuthUpdate} />
                      </Route>*/}
                  </Switch>

              </div>
          </Router>
        );
    }
}