import React from 'react';
import {
    Switch,
    Route,
    Link,
    useRouteMatch,
    useParams,
    Redirect
} from "react-router-dom";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import SingleThread from "./SingleThreadPage";
import UrlBuilder from "../../utils/UrlBuilder";
import PostFrame from "./PostFrame";

class ThreadRouter extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        const {match} = this.props;

        return (
            <div>
                <Switch>
                    <Route exact path={match.path}>
                        <Redirect to={UrlBuilder.Home()} />
                    </Route>

                    <Route path={UrlBuilder.Threads.Create()} >
                        <h2>Create a new topic</h2>
                        <PostFrame.Thread isNewThreadForm={true} thread={null} />
                    </Route>

                    <Route path={`${match.path}/:id`} >
                    {/*<Route path={`/threads/:id`} >*/}
                        <SingleThread />
                    </Route>

                    <Route>
                        404<br/>
                        Tried accessing path: {match.path}
                        // TODO error page
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

export default withRouter(ThreadRouter);