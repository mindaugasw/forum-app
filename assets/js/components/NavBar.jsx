import React, {Component, Fragment} from 'react';
import {Navbar, Nav, NavDropdown, Image, Spinner, Button, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {Link, NavLink} from "react-router-dom";
import { connect } from "react-redux";
import UrlBuilder from "../utils/UrlBuilder";

const mapStateToProps = state => {
    return {
        auth: state.auth,
    };
}

class NavBar extends Component {
    constructor(props) {
        super(props);

        this.setNavExpanded = this.setNavExpanded.bind(this);
        this.closeNav = this.closeNav.bind(this);

        this.state = {
            navExpanded: false,
        };
    }

    // setNavExpanded and closeNav are needed to automatically collapse navbar after link click
    setNavExpanded(expanded) {
        this.setState({ navExpanded: expanded });
    }

    closeNav() {
        this.setState({ navExpanded: false });
    }

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
                        className='avatar-image-small'
                        src={UrlBuilder.RoboHash(auth.user.username, 2, 100)}
                        roundedCircle />
                    </>} alignRight id="basic-nav-dropdown">

                    <NavDropdown.Item as={NavLink} to={UrlBuilder.Users.Single(auth.user.id)} onClick={this.closeNav} disabled>My profile</NavDropdown.Item>
                    <NavDropdown.Item as={NavLink} to={UrlBuilder.Users.Edit(auth.user.id)} onClick={this.closeNav} disabled>Edit profile</NavDropdown.Item>
                    <NavDropdown.Item as={NavLink} to={UrlBuilder.Logout()} onClick={this.closeNav}>Logout</NavDropdown.Item>
                </NavDropdown>
                </>;
        } else {
            profileArea =
                <>
                <Nav.Item>
                    <Nav.Link as={NavLink} to={UrlBuilder.Login()} onClick={this.closeNav}>Login</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={NavLink} to={UrlBuilder.Register()} onClick={this.closeNav}>Register</Nav.Link>
                </Nav.Item>
                </>;
        }

        return (
            <Navbar bg="light" expand="lg" sticky="top" onToggle={this.setNavExpanded} expanded={this.state.navExpanded}>
                <Link to='/'>
                    <Navbar.Brand>Forum app</Navbar.Brand>
                </Link>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">

                        <Nav.Item>
                            <Nav.Link as={NavLink} to={UrlBuilder.Threads.Index()} onClick={this.closeNav}>Topics list</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={NavLink} to={UrlBuilder.Threads.Create()} onClick={this.closeNav}>New topic</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={NavLink} to={UrlBuilder.Users.List()} onClick={this.closeNav} disabled>Users</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={NavLink} to={UrlBuilder.About()} onClick={this.closeNav} disabled>About</Nav.Link>
                        </Nav.Item>

                    </Nav>


                    <Nav className="justify-content-end">
                        {/* Extra login link, visible even when logged in already */}
                        {APP_ENV === 'dev' && auth.isLoggedIn ?
                            <Nav.Item>
                                <Nav.Link as={NavLink} to={UrlBuilder.Login()} onClick={this.closeNav}>Login form</Nav.Link>
                            </Nav.Item>
                            : ''}
                        {profileArea}
                    </Nav>
                </Navbar.Collapse>


                {/* Bootstrap breakpoints indicator */}
                {APP_ENV === 'dev' ?
                <OverlayTrigger
                    placement='bottom'
                    overlay={<Tooltip id='breakpoint-indicator-tooltip'>
                        Bootstrap breakpoint indicator. Shown only on dev.
                    </Tooltip>}
                >
                    <span className='ml-auto mr-3'>
                        <Button variant='danger' className='d-block d-sm-none' disabled style={{pointerEvents: "none"}}>
                            XS
                        </Button>
                        <Button variant='warning' className='d-none d-sm-block d-md-none' disabled style={{pointerEvents: "none"}}>
                            SM
                        </Button>
                        <Button variant='success' className='d-none d-md-block d-lg-none' disabled style={{pointerEvents: "none"}}>
                            MD
                        </Button>
                        <Button variant='primary' className='d-none d-lg-block d-xl-none' disabled style={{pointerEvents: "none"}}>
                            LG
                        </Button>
                        <Button variant='dark' className='d-none d-xl-block' disabled style={{pointerEvents: "none"}}>
                            XL
                        </Button>
                    </span>
                </OverlayTrigger>
                : ''}
                <Navbar.Toggle aria-controls="basic-navbar-nav" />

            </Navbar>
        );
    }
}

export default connect(mapStateToProps)(NavBar);