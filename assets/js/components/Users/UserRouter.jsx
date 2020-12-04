import React from 'react';
import {
    Switch,
    Route
} from "react-router-dom";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import Page404 from "../common/Page404";
import UserListPage from "./UserListPage";
import SingleUserPage from "./SingleUserPage";
import UrlBuilder from "../../utils/UrlBuilder";

class UserRouter extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {match} = this.props;

        return (
            <Switch>
                <Route exact path={match.path}>
                    <UserListPage />
                </Route>

                <Route path={UrlBuilder.Users.Edit(':id')} >
                {/*<Route path={`${match.path}/:id/edit`} >*/}
                    <SingleUserPage editMode={true} />
                </Route>


                {/*<Route path={`${match.path}/:id`} >*/}
                <Route path={UrlBuilder.Users.Single(':id')} >
                    <SingleUserPage editMode={false} />
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

export default withRouter(UserRouter);