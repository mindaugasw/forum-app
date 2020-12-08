import React from 'react';
import {
    Switch,
    Route
} from "react-router-dom";
import { withRouter } from "react-router";
import Page404 from "../common/Page404";
import UserListPage from "./UserListPage";
import SingleUserPage from "./SingleUserPage";
import UrlBuilder from "../../utils/UrlBuilder";

function UserRouter(props) {
    const {match} = props;

    return (
        <Switch>
            <Route exact path={match.path}>
                <UserListPage />
            </Route>

            {/*<Route path={`${match.path}/:id/edit`} >*/}
            <Route path={UrlBuilder.Users.Edit(':id')} >
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

UserRouter.propTypes = {
    // ReactRouter props
    // match: PropTypes.object.isRequired,
}

export default withRouter(UserRouter);