import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Navbar, Nav, NavDropdown, Image, Spinner} from 'react-bootstrap';
import {Link, NavLink} from "react-router-dom";
import { connect } from "react-redux";
import UrlBuilder from "../utils/UrlBuilder";

const mapStateToProps = state => {
    return {
        auth: state.auth,
    };
}

class NavBar extends Component {
    render() {
        const {auth} = this.props;

        let profileArea = null;
        if (!auth.loaded) {
            profileArea =
                <Navbar.Text>
                    <Spinner animation="border" size="sm" />
                </Navbar.Text>;
        } else if (auth.isLoggedIn) {
            profileArea =
                <>
                <NavDropdown title={
                    <>
                    {auth.user.username+' '}
                    <Image
                        style={{height: '25px'}}
                        src={roboHash(auth.user.username, 2, 100)}
                        roundedCircle />
                    </>} alignRight id="basic-nav-dropdown">

                    <NavDropdown.Item as={NavLink} to={UrlBuilder.Users.Single(auth.user.id)} disabled>My profile</NavDropdown.Item>
                    <NavDropdown.Item as={NavLink} to={UrlBuilder.Logout()} disabled>Logout</NavDropdown.Item>
                </NavDropdown>
                </>;
        } else {
            profileArea =
                <>
                <Nav.Item>
                    <Nav.Link as={NavLink} to={UrlBuilder.Login()}>Login</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={NavLink} to={UrlBuilder.Register()} disabled>Register</Nav.Link>
                </Nav.Item>
                </>;
        }

        return (
            <Navbar bg="light" expand="lg" sticky="top">
                <Link to='/'>
                    <Navbar.Brand>Forum app</Navbar.Brand>
                </Link>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">

                        <Nav.Item>
                            <Nav.Link as={NavLink} to={UrlBuilder.Threads.List()}>Topics list</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={NavLink} to={UrlBuilder.Threads.Create()} disabled={!auth.isLoggedIn}>New topic</Nav.Link> {/*TODO add tooltip to login if not logged in*/}
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={NavLink} to={UrlBuilder.Users.List()} disabled>Users</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={NavLink} to={UrlBuilder.About()} disabled>About</Nav.Link>
                        </Nav.Item>

                    </Nav>

                    {/* Dev features. TODO remove*/}
                    <Nav className="justify-content-center">
                        <Nav.Item>
                            <Nav.Link as={NavLink} to={UrlBuilder.Login()}>Login</Nav.Link>
                        </Nav.Item>

                        {/* Breakpoint indicator */}
                        <div className={'d-none'}>
                            None
                        </div>
                        <div className={'d-block d-sm-none'} style={{color: 'brown'}}>
                            XS
                        </div>
                        <div className={'d-none d-sm-block d-md-none'} style={{color: 'orange'}}>
                            SM
                        </div>
                        <div className={'d-none d-md-block d-lg-none'} style={{color: 'red'}}>
                            MD
                        </div>
                        <div className={'d-none d-lg-block d-xl-none'} style={{color: 'green'}}>
                            LG
                        </div>
                        <div className={'d-none d-xl-block'} style={{color: 'blue'}}>
                            XL
                        </div>
                    </Nav>

                    <Nav className="justify-content-end">
                        {profileArea}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}

NavBar.propTypes = {};

export default connect(mapStateToProps)(NavBar);