import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {getSingleUser} from "../../redux/usersCRUD";
import {Link, withRouter} from "react-router-dom";
import UrlBuilder from "../../utils/UrlBuilder";
import {Badge, Col, Image, Row} from "react-bootstrap";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import UserForm from "./UserForm";
import Utils from "../../utils/Utils";
import Loader from "../common/Loader";
import Page404 from "../common/Page404";

const mapDispatchToProps = {
    getSingleUser
}

function mapStateToProps(state) {
    return {
        user: state.users.single,
        authLoaded: state.auth.loaded,
        authUser: state.auth.user,
    };
}

class SingleUserPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id: this.props.match.params.id, // This user id
            notFound: false,
        }

        this.loadUser();
        // this.toggleEditMode = this.toggleEditMode.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const newTargetId = this.props.match.params.id;
        if (prevState.id !== newTargetId)
            this.setState({id: newTargetId});
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
                            <a href='#' className='color-vote text-muted' onClick={null}>
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
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SingleUserPage));

