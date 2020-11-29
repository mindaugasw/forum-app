import React, {Component} from 'react';
import ThreadList from "./Threads/ThreadList";
import {Link} from "react-router-dom";
import UrlBuilder from "../utils/UrlBuilder";
import {connect} from "react-redux";
import UnderConstructionNotice from "./common/UnderConstructionNotice";

const mapStateToProps = state => {
    return {
        authLoaded: state.auth.loaded,
        isLoggedIn: state.auth.isLoggedIn
    }
}

class Homepage extends Component {
    render() {
        const {authLoaded, isLoggedIn} = this.props;
        return (
            <div>
                {APP_ENV === 'prod' ? <UnderConstructionNotice /> : null}

                <h1>Welcome!</h1>
                This is a general-purpose discussion forum. Find more info in{' '}
                <Link to={UrlBuilder.About()}>About</Link> section.

                {authLoaded && !isLoggedIn ?
                    <>
                        <br/>
                        <Link to={UrlBuilder.Login()}>Login</Link> or{' '}
                        <Link to={UrlBuilder.Register()}>Register</Link> to access all features.
                    </>
                : ''}

                <hr/>

                <ThreadList />
            </div>
        );
    }
}

export default connect(mapStateToProps)(Homepage);