import React from "react";
import {
    BrowserRouter,
    Switch,
    Route,
    Link, NavLink
} from "react-router-dom";
import AuthForm from "./AuthForm";
import NavBar from "./NavBar";
import {tokenRefresh} from "../redux/auth";
import { connect } from "react-redux";
import UrlBuilder from "../utils/UrlBuilder";
import Homepage from "./Homepage";
import {Container, Row, Col} from "react-bootstrap";
import ThreadRouter from "./Threads/ThreadRouter";

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
                <br/>
            </BrowserRouter>
        );
    }
}

export default connect(null, mapDispatchToProps)(ReactApp);