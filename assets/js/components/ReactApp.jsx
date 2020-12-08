import React from "react";
import {
    withRouter,
    Switch,
    Route,
} from "react-router-dom";
import NavBar from "./common/NavBar";
import {tokenRefresh} from "../redux/auth";
import { connect } from "react-redux";
import UrlBuilder from "../utils/UrlBuilder";
import Homepage from "./Homepage";
import {Container, Row, Col} from "react-bootstrap";
import ThreadRouter from "./Threads/ThreadRouter";
import RegistrationPage from "./Users/RegistrationPage";
import LogoutPage from "./Users/LogoutPage";
import NotificationRenderer from "./common/NotificationRenderer";
import LoginPage from "./Users/LoginPage";
import Page404 from "./common/Page404";
import UserRouter from "./Users/UserRouter";

export let history; // Used as global var for redirecting

class ReactApp extends React.Component {
    constructor(props) {
        super(props);

        history = this.props.history;
    }

    componentDidMount() {
        this.props.tokenRefresh();
    }

    render() {
        return (
            <>
                <NavBar />

                <NotificationRenderer />

                <Container id='app-body' fluid='lg' > {/*fluid lg = container takes 100% width until lg (on xd sm md, but not lg)*/}
                    <Row className='justify-content-center'>
                        <Col>
                            <br/>

                            <Switch>
                                <Route exact path={UrlBuilder.Home()}>
                                    <Homepage/>
                                </Route>

                                <Route path={UrlBuilder.Threads.Index()}>
                                    <ThreadRouter />
                                </Route>

                                <Route path={UrlBuilder.Users.List()}>
                                    <UserRouter />
                                </Route>

                                <Route exact path={UrlBuilder.Login()}>
                                    <LoginPage />
                                </Route>

                                <Route exact path={UrlBuilder.Logout()}>
                                    <LogoutPage />
                                </Route>

                                <Route exact path={UrlBuilder.Register()}>
                                    <RegistrationPage />
                                </Route>

                                <Route>
                                    <Page404 />
                                </Route>
                            </Switch>

                        </Col>
                    </Row>
                </Container>
                <br/>
            </>
        );
    }
}

ReactApp.propTypes = {
    // Redux:
    // tokenRefresh: PropTypes.func.isRequired,

    // ReactRouter props
}

const mapDispatchToProps = {
    tokenRefresh
}

export default withRouter(
    connect(null, mapDispatchToProps)(ReactApp)
);