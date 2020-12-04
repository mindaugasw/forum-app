import React, {Component} from 'react';
import {Navbar, Nav, NavDropdown, Image, Button, OverlayTrigger, Tooltip, Badge} from 'react-bootstrap';
import {Link, NavLink} from "react-router-dom";
import { connect } from "react-redux";
import UrlBuilder from "../../utils/UrlBuilder";
import ConditionalTooltip, {msg_MustBeLoggedIn} from "./ConditionalTooltip";
import Loader from "./Loader";
import Utils from "../../utils/Utils";

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
                    <Loader.Small />
                </Navbar.Text>;
        } else if (auth.isLoggedIn) {
            profileArea =
                <>
                {/* --- User --- */}
                <NavDropdown title={
                    <>
                    {auth.user.username}
                    {Utils.Roles.IsUserAdmin(auth.user) ? <Badge.Admin /> : null}
                    <Image
                        className='avatar-image-small ml-2'
                        src={UrlBuilder.RoboHash(auth.user.username, 2, 100)}
                        roundedCircle />
                    </>} alignRight id="basic-nav-dropdown">

                    {/* --- User links --- */}
                    <NavDropdown.Item as={Link} to={UrlBuilder.Users.Single(auth.user.id)} onClick={this.closeNav}>My profile</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to={UrlBuilder.Users.Edit(auth.user.id)} onClick={this.closeNav}>Edit profile</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to={UrlBuilder.Logout()} onClick={this.closeNav}>Logout</NavDropdown.Item>
                </NavDropdown>
                </>;
        } else {
            profileArea =
                <>
                {/* --- Login --- */}
                <Nav.Item>
                    <Nav.Link as={NavLink} to={UrlBuilder.Login()} onClick={this.closeNav}>Login</Nav.Link>
                </Nav.Item>

                {/* --- Register --- */}
                <Nav.Item>
                    <Nav.Link as={NavLink} to={UrlBuilder.Register()} onClick={this.closeNav}>Register</Nav.Link>
                </Nav.Item>
                </>;
        }

        return (
            <Navbar bg="light" expand="md" sticky="top" onToggle={this.setNavExpanded} expanded={this.state.navExpanded}>
                <Link to='/' onClick={this.closeNav}>
                    <Navbar.Brand>Forum app</Navbar.Brand>
                </Link>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">

                        {/* --- Threads list --- */}
                        <Nav.Item>
                            <Nav.Link as={NavLink} to={UrlBuilder.Threads.Index()} onClick={this.closeNav}>Topics list</Nav.Link>
                        </Nav.Item>

                        {/* --- New thread --- */}
                        <ConditionalTooltip
                            placement='bottom'
                            tooltip={msg_MustBeLoggedIn}
                            tooltipId='navbar-newthread-loggedin-tooltip'
                            show={!auth.user}
                        >
                            <Nav.Item>
                                <Nav.Link
                                    as={NavLink}
                                    to={UrlBuilder.Threads.Create()}
                                    onClick={this.closeNav}
                                    disabled={!auth.user}
                                >New topic</Nav.Link>
                            </Nav.Item>
                        </ConditionalTooltip>

                        {/* --- Users list --- */}
                        <Nav.Item>
                            <Nav.Link as={NavLink} to={UrlBuilder.Users.List()} onClick={this.closeNav}>Users</Nav.Link>
                        </Nav.Item>

                        <Nav.Item>
                            <Nav.Link
                                href={"https://github.com/mindaugasw/forum-app/blob/master/docs/README.md"} target='_blank' rel='noopener noreferrer'
                                onClick={this.closeNav}
                                active={false}
                            >
                                About
                            </Nav.Link>
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
                <OverlayTrigger // With ConditionalTooltip layout breaks?
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