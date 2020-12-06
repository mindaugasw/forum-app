import React, {Component} from 'react';
import ThreadList from "./Threads/ThreadList";
import {Link} from "react-router-dom";
import UrlBuilder from "../utils/UrlBuilder";
import {connect} from "react-redux";
import UnderConstructionNotice from "./common/UnderConstructionNotice";
import Utils from "../utils/Utils";

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
                {Utils.Titles.Homepage()}

                {/*{APP_ENV === 'prod' ? <UnderConstructionNotice /> : null}*/}

                <h1>Welcome!</h1>
                This is a general-purpose discussion forum. Find more info in{' '}
                {/* TODO render markdown in page? Instead of linking to the same markdown on github */}
                <a href="https://github.com/mindaugasw/forum-app/blob/master/docs/README.md" target='_blank' rel='noopener noreferrer'>About</a> section.

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