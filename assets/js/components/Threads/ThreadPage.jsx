import React from 'react';
import {
    Switch,
    Route,
    Link,
    useRouteMatch,
    useParams
} from "react-router-dom";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import SingleThreadRedux from "./SingleThreadRedux";
import ThreadListRedux from "./ThreadListRedux";


class ThreadPage extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        const {match} = this.props;

        return (
            <div>
                THREAD PAGE<br/>
                {/*{console.log(match)}*/}
                <Switch>
                    <Route exact path={match.path}>
                        Threads list - index
                        <ThreadListRedux />
                    </Route>
                    <Route path={`${match.path}/:id`} >
                        <SingleThreadRedux />
                    </Route>
                    <Route>
                        404<br/>
                        Tried accessing path: {match.path}
                    </Route>
                </Switch>
            </div>
        );
    }

    static get propTypes() {
        return {
            match: PropTypes.object.isRequired,
        };
    }
}

export default withRouter(ThreadPage);