import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {deleteUser, getSingleUser} from "../../redux/usersCRUD";
import {Link, withRouter} from "react-router-dom";
import UrlBuilder from "../../utils/UrlBuilder";
import {Badge, Col, Image, Row} from "react-bootstrap";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import UserForm from "./UserForm";
import Utils from "../../utils/Utils";
import Loader from "../common/Loader";
import Page404 from "../common/Page404";
import Notifications from "../../utils/Notifications";
import {logout} from "../../redux/auth";


class SingleUserPage extends Component {
    constructor(props) {
        super(props);

        this.handleDeleteClick = this.handleDeleteClick.bind(this);

        let initialState = {
            id: parseInt(this.props.match.params.id),
            notFound: false,
        }

        if (isNaN(initialState.id)) {
            initialState.id = -1;
            initialState.notFound = true;
        }

        this.state = initialState;

        if (!this.state.notFound)
            this.loadUser();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.notFound) {
            return;
        }

        let newTargetId = parseInt(this.props.match.params.id);
        if (isNaN(newTargetId))
            newTargetId = -1;


        if (prevState.id !== newTargetId) {
            if (newTargetId === -1)
                this.setState({id: newTargetId, notFound: true});
            else
                this.setState({id: newTargetId});
        }
        else
            this.loadUser();
    }

    loadUser() {
        const u = this.props.user;
        const targetId = this.state.id;

        if (this.props.authLoaded) {
            if (u.id !== targetId || u.loaded === LoadState.NotRequested) {
                this.props.getSingleUser(targetId).then(action => {
                    if (action.payload.error && action.payload.error.status === 404)
                        this.setState({notFound: true});
                });
            }
        }
    }

    handleDeleteClick(event) {
        event.preventDefault();
        const u = this.props.user; // User subject
        const au = this.props.authUser; // Currently logged in user

        if (!au || (au.id !== u.id && !Utils.Roles.IsUserAdmin(au))) {
            Notifications.Unauthorized();
            return;
        }

        const message = `Delete this account? Account deletion is permanent!${au.id !== u.id ?
            `\n\nWARNING: you are deleting someone else's account as an admin!` : ``}`
        let answer = confirm(message);

        if (answer) {
            this.props.deleteUser(u.id)
                .then(action => {
                    // TODO duplicating code with PostFormVariants.handleDeleteErrors
                    if (action.type.endsWith(REJECTED)) {
                        const p = action.payload;
                        const e = p.error;

                        if ((e && e.status === 401) || p.code === 401) {
                            Notifications.Unauthenticated();
                            return false;
                        } if (e && e.status === 403) {
                            Notifications.Unauthorized();
                            return false;
                        }

                        console.error('User delete error', action);
                        Notifications.UnhandledError('User delete error', action);
                        return false;
                    }

                    // TODO component state is modified after deletion on unmounted component (before redirect, race condition?), which causes warning
                    console.debug('User deleted');
                    Notifications.Success('User deleted');
                    if (au.id === u.id) {
                        Utils.Redirect(UrlBuilder.Home());
                        this.props.logout();
                    } else {
                        Utils.Redirect(UrlBuilder.Users.List());
                    }
                    return true;

                });
        }
    }

    /*toggleEditMode(event) {
        event.preventDefault();

        this.setState(s => {
            return {
                editMode: !s.editMode,
            };
        });
    }*/

    render() {
        let u = this.props.user; // User object wrapper
        const au = this.props.authUser; // Currently logged in user
        const editMode = this.props.editMode;

        if (this.state.notFound)
            return <Page404 />

        if (u.loaded !== LoadState.Done)
            return <Loader />;

        u = u.item; // Replace with actual user item

        const {handleDeleteClick} = this;


        function editPageJsx() {
            Utils.ImportZxcvbn();

            return (
                <Col sm={8} md={6} xl={5}>
                    <h2>Edit profile</h2>
                    <UserForm.Edit user={u} />
                </Col>
            );
        }
        function viewPageJsx() {
            return (
                <div className='text-center mx-auto' style={{width: '300px'}}>
                    {Utils.Titles.UserSingle(u.username)}
                    <div className='text-left'>
                        <h3>User profile</h3>
                    </div>
                    <br/>

                    {/* --- Avatar, username --- */}
                    <Image
                        src={UrlBuilder.RoboHash(u.username, 2, 300)}
                        style={{width: '200px', height: '200px'}}
                        roundedCircle
                    />
                    <div className='mt-3'>
                        <h2>{u.username}{Utils.Roles.IsUserAdmin(u) ? <span style={{fontSize: '1em'}}><Badge.Admin /></span> : ''}</h2>
                    </div>

                    {/* --- Edit, Delete links --- */}
                    {au && au.id === u.id || Utils.Roles.IsUserAdmin(au) ?
                        <div className='mt-2'>
                            <Link to={UrlBuilder.Users.Edit(u.id)} className='color-vote text-muted mr-4'>
                                <FA icon={faEdit} size={'lg'} /><span className='ml-1'>Edit profile</span>
                            </Link>
                            <a href='#' className='color-vote text-muted' onClick={handleDeleteClick}>
                                <FA icon={faTrash} size={'lg'} /><span className='ml-1'>Delete account</span>
                            </a>
                        </div>
                        : null}
                </div>
            );
        }

        return (
            <Row className='justify-content-center'>
                {editMode ?
                    editPageJsx()
                    :
                    viewPageJsx()
                }
            </Row>
        );
    }
}

SingleUserPage.propTypes = {
    editMode: PropTypes.bool, // If true, will immediately show edit form

    // Redux:
    // user: PropTypes.object,
    // authLoaded: PropTypes.bool.isRequired,
    // authUser: PropTypes.object,

    // getSingleUser: PropTypes.func.isRequired,
    // deleteUser: PropTypes.func.isRequired,

    // Router:
    // match: PropTypes.object,
}

const mapDispatchToProps = {
    getSingleUser,
    deleteUser,
    logout,
}

function mapStateToProps(state) {
    return {
        user: state.users.single,
        authLoaded: state.auth.loaded,
        authUser: state.auth.user,
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SingleUserPage));

