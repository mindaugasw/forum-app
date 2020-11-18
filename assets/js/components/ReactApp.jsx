import React from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link, NavLink
} from "react-router-dom";
import AuthFormRedux from "./ReduxTest/AuthFormRedux";
import ThreadPage from "./Threads/ThreadPage";

class ReactApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {}
    }

    render() {
        // TODO add auth form
        return (
            <Router>
                <div>

                    <AuthFormRedux />

                    <nav>
                        <ul>
                            <li><NavLink to='/'>Home</NavLink></li>
                            <li><NavLink to='/threads'>Thread list</NavLink></li>
                        </ul>
                    </nav>

                    <Switch>
                        <Route exact path='/'>
                            App homepage
                        </Route>
                        <Route path='/threads'>
                            {/*<ThreadList />*/}
                            <ThreadPage />
                        </Route>
                        {/*<Route path='/authform'>
                          <__AuthForm {...this.state.auth} onAuthLoad={this.handleAuthUpdate} />
                      </Route>*/}

                        <Route>
                            No route found - 404
                        </Route>
                    </Switch>

                </div>
            </Router>
        );
    }
}

export default ReactApp;