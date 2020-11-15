import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useRouteMatch,
    useParams
} from "react-router-dom";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import SingleThreadRedux from "../ReduxTest/SingleThreadRedux";


class ThreadPage extends React.Component {
    constructor(props) {
        super(props);

    }


    render() {
        const {match} = this.props;

        return (
            <div>
                THREAD PAGE<br/>
                {console.log(match)}
                <Switch>
                    <Route exact path={match.path}>
                        Threads list - index
                    </Route>
                    <Route path={`${match.path}/:id`} >
                        <SingleThreadRedux />
                    </Route>
                    <Route>
                        404
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

// const ThreadPageWithRouter = withRouter(ThreadPage);
export default withRouter(ThreadPage);
// export default ThreadPage;