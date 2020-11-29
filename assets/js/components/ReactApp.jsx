import React from "react";
import {
    withRouter,
    Switch,
    Route,
} from "react-router-dom";
import NavBar from "./NavBar";
import {tokenRefresh} from "../redux/auth";
import { connect } from "react-redux";
import UrlBuilder from "../utils/UrlBuilder";
import Homepage from "./Homepage";
import {Container, Row, Col} from "react-bootstrap";
import ThreadRouter from "./Threads/ThreadRouter";
import RegistrationPage from "./Users/RegistrationPage";
import UserForm from "./Users/UserForm";
import LogoutPage from "./Users/Logout";
import NotificationRenderer from "./NotificationRenderer";

export let history;

const mapDispatchToProps = {
    tokenRefresh
}

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

                <Container id='app-body' fluid='lg' > {/*fluid-lg = container takes 100% width until lg (on xd sm md, but not lg)*/}
                    <Row className='justify-content-center'>
                        <Col><br/>

                            <Switch>
                                <Route exact path={UrlBuilder.Home()}>
                                    <Homepage/>
                                </Route>
                                <Route path={UrlBuilder.Threads.Index()}>
                                    <ThreadRouter />
                                </Route>

                                <Route exact path={UrlBuilder.Login()}>
                                    <Row className="justify-content-center">
                                        <Col sm={8} md={6} xl={5}>
                                            <h2>Login</h2>
                                            {/*<UserForm variant='login' initialValues={{}} onSubmit={null} />*/}
                                            <UserForm.Login />
                                        </Col>
                                    </Row>
                                </Route>
                                <Route exact path={UrlBuilder.Logout()}>
                                    {/*Not implemented*/}
                                    <LogoutPage />
                                </Route>
                                <Route exact path={UrlBuilder.Register()}>
                                    <RegistrationPage />
                                </Route>

                                <Route>
                                    No route found - 404 {/* TODO */}
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

export default withRouter(
    connect(null, mapDispatchToProps)(ReactApp)
);