import React from "react";
import {
    BrowserRouter,
    Switch,
    Route,
    Link, NavLink
} from "react-router-dom";
import AuthForm from "./AuthForm";
import ThreadPage from "./Threads/ThreadRouter";
import NavBar from "./NavBar";
import {tokenRefresh} from "../redux/auth";
import { connect } from "react-redux";
import UrlBuilder from "../utils/UrlBuilder";
import Homepage from "./Homepage";
import {Container, Row, Col} from "react-bootstrap";

const mapDispatchToProps = {
    tokenRefresh
}

class ReactApp extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.tokenRefresh();
    }

    render() {
        return (
            <BrowserRouter>
                <NavBar/>

                <Container id='app-body' fluid='md'> {/*fluid-md = container takes 100% width until md (xd-sm)*/}
                    <Row className='justify-content-center'>
                        <Col><br/>

                            <Switch>
                                <Route exact path={UrlBuilder.Home()}>
                                    <Homepage/>
                                </Route>
                                <Route path={UrlBuilder.Threads.List()}>
                                    <ThreadPage />
                                </Route>

                                <Route exact path={UrlBuilder.Login()}>
                                    <AuthForm />
                                </Route>
                                <Route exact path={UrlBuilder.Logout()}>
                                    Not implemented {/* TODO */}
                                </Route>
                                <Route exact path={UrlBuilder.Register()}>
                                    Not implemented {/* TODO */}
                                </Route>

                                <Route>
                                    No route found - 404 {/* TODO */}
                                </Route>
                            </Switch>

                        </Col>
                    </Row>
                </Container>

            </BrowserRouter>
        );
    }
}

export default connect(null, mapDispatchToProps)(ReactApp);