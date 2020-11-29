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
import SingleThreadRedux from "./SingleThread";
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
                        {/*<ThreadList />*/}
                        <Redirect to={UrlBuilder.Home()} />
                    </Route>
                    <Route path={UrlBuilder.Threads.Create()} >
                        {/*<ThreadForm editMode={false} />*/}
                        <h2>Create a new topic</h2>
                        {/*<PostFrame post={null} formMode={true} isThread={true} />*/}
                        <PostFrame.ThreadCreate isNewThreadForm={true} thread={null} />
                    </Route>
                    {/*<Route path={UrlBuilder.Threads.SingleMatchPath()} >*/}
                    <Route path={`${match.path}/:id`} >
                    {/*<Route path={`/threads/:id`} >*/}
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

export default withRouter(ThreadRouter);