import React from 'react';
import {
    Switch,
    Route,
    Redirect
} from "react-router-dom";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import SingleThreadPage from "./SingleThreadPage";
import UrlBuilder from "../../utils/UrlBuilder";
import PostFrame from "./PostFrame";
import Utils from "../../utils/Utils";
import Page404 from "../common/Page404";

class ThreadRouter extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {match} = this.props;

        return (
            <Switch>
                <Route exact path={match.path}>
                    <Redirect to={UrlBuilder.Home()} />
                </Route>

                <Route path={UrlBuilder.Threads.Create()} >
                    <h2>Create a new topic</h2>
                    {Utils.Titles.ThreadNew()}
                    <PostFrame.Thread isNewThreadForm={true} thread={null} />
                </Route>

                <Route path={`${match.path}/:id`} >
                    <SingleThreadPage />
                </Route>

                <Route>
                    <Page404 />
                </Route>
            </Switch>
        );
    }

    static get propTypes() {
        return {
            match: PropTypes.object.isRequired,
        };
    }
}

export default withRouter(ThreadRouter);