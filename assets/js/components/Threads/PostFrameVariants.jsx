import React, {Component} from "react";
import PostFrame from "./PostFrame";
import FormUtils from "../../utils/FormUtils";
import Notifications from "../../utils/Notifications";
import UrlBuilder from "../../utils/UrlBuilder";
import {connect} from "react-redux";
import {createThread, deleteThread, editThread} from "../../redux/postsCRUD";
import PropTypes from 'prop-types';
import {canUserManagePost} from "../../redux/auth";

class PostFrame_Comment {

}

const mapStateToProps = state => {
    return {
        user: state.auth.user,
    }
}

class PostFrame_Thread_connected extends Component {
    constructor(props) {
        super(props);

        this.handleThreadFormChange = this.handleThreadFormChange.bind(this);
        this.handleThreadFormSubmit = this.handleThreadFormSubmit.bind(this);
        this.handleEditModeChange = this.handleEditModeChange.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.validateFullForm = this.validateFullForm.bind(this);

        this.state = {
            formLoading: false,
            editMode: this.props.isNewThreadForm,
        }
    }

    // Used for initial validation when mounting edit form component
    validateFullForm(state) {
        let validationData = {
            ...FormUtils.ValidateTextField(state.post.title, 'title', {minLength: 10, maxLength: 255}),
            ...FormUtils.ValidateTextField(state.post.content, 'content', {minLength: 1, maxLength: 30000})
        };

        validationData = mergeDeep(state.validation, validationData);
        validationData.valid = validationData.titleValid && validationData.contentValid;

        return {
            validation: {
                ...validationData
            }
        };
    }

    handleThreadFormChange(event, state) {
        const target = event.target;

        const updatedState = { // Manual state update, as passed state is late by 1 onChange event
            ...state,
            [target.id]: target.value
        };

        // Validate only edited field (to not show errors on still untouched fields)
        let validationData = null;
        if (target.id === 'title')
            // validationData = {...this.validateFieldNotEmpty(updatedState, 'username')};
            validationData = {...FormUtils.ValidateTextField(target.value, 'title', {minLength: 10, maxLength: 255})};

        if (target.id === 'content')
            // validationData = {...this.validateFieldNotEmpty(updatedState, 'password')};
            validationData = {...FormUtils.ValidateTextField(target.value, 'content', {minLength: 1, maxLength: 30000})};

        // Join all validation data to check full form validity
        validationData = mergeDeep(state.validation, validationData);

        validationData.valid = validationData.titleValid && validationData.contentValid;

        return {
            validation: {
                ...validationData
            }
        };
    }

    handleThreadFormSubmit(event, state) {
        if (!state.validation.valid) {
            console.error('Tried submitting invalid form');
            return;
        }

        this.setState({formLoading: true});
        let response = this.props.isNewThreadForm ?
            this.props.createThread({title: state.post.title, content: state.post.content}) :
            this.props.editThread({threadId: this.props.thread.id, title: state.post.title, content: state.post.content});

        return response.then(action => {
            if (action.type.endsWith(REJECTED)) {
                this.setState({formLoading: false}); // Do not update state on success, as component is already unmounted
                const p = action.payload;
                const e = p.error;

                if (e && e.status === 400) {
                    return {
                        validation: {
                            alert: {
                                show: true,
                                type: 'danger',
                                message: 'Could not complete the request. There were following errors: '+e.message,
                            }
                        }
                    };
                } else if (p.code === 401) {
                    Notifications.Unauthenticated();
                    return;
                }

                console.error('Unknown error in thread create form', action);
                Notifications.UnhandledError('Form error in PostFrame_Thread', action);
                return;

            } else {
                if (this.props.isNewThreadForm) {
                    console.debug('Thread created successfully');
                    Notifications.Add({type:'success', headline:'New topic created'});
                } else {
                    console.debug('Thread updated successfully');
                    Notifications.Add({type:'success', headline:'Topic updated'});
                }
                redirect(UrlBuilder.Threads.Single(action.payload.id));
                return;
            }
        });
    }

    handleEditModeChange(event, editMode) {
        event.preventDefault();
        this.setState({
            editMode,
        });
    }

    handleDeleteClick(event) {
        event.preventDefault();

        if (!canUserManagePost(this.props.user, this.props.thread)) {
            Notifications.Unauthorized();
            return;
        }

        const u = this.props.user;
        const message = `Delete this thread?${u && u.id !== this.props.thread.author.id ?
            `\n\nWARNING: you are deleting someone else's thread as an admin!` : ``}`
        let answer = confirm(message);

        if (answer) {
            this.props.deleteThread({threadId: this.props.thread.id})
                .then(action => {
                    if (action.type.endsWith(REJECTED)) {
                        const p = action.payload;
                        const e = p.error;

                        if (e && e.status === 401) {
                            Notifications.Unauthenticated();
                            return;
                        }

                        console.error('Unknown error in thread delete', action);
                        Notifications.UnhandledError('Thread delete error', action);
                        return;

                    } else {
                        console.debug('Thread deleted successfully');
                        Notifications.Add({type:'success', headline:'Topic deleted'});
                        redirect(UrlBuilder.Home());
                        // return;
                    }
                });
        }
    }

    render() {
        if (this.props.isNewThreadForm === true) { // New thread form
            return (
                <PostFrame
                    post={null}
                    isThread={true}
                    formMode={true}
                    formLoading={this.state.formLoading}
                    onChange={this.handleThreadFormChange}
                    onSubmit={this.handleThreadFormSubmit}
                />
            );
        } else if (this.state.editMode) { // Edit existing thread
            return (
                <PostFrame
                    post={this.props.thread}
                    isThread={true}
                    formMode={true}
                    onChange={this.handleThreadFormChange}
                    onSubmit={this.handleThreadFormSubmit}
                    onEditClick={this.handleEditModeChange}
                    onValidateFullForm={this.validateFullForm}
                    formLoading={this.state.formLoading}
                />
            );
        } else { // Show thread
            return (
                <PostFrame
                    post={this.props.thread}
                    isThread={true}
                    formMode={false}
                    onEditClick={this.handleEditModeChange}
                    onDeleteClick={this.handleDeleteClick}
                />
            );
        }
    }
}
export const PostFrame_Thread = connect(mapStateToProps, {createThread, editThread, deleteThread})(PostFrame_Thread_connected);
PostFrame_Thread.propTypes = {
    isNewThreadForm: PropTypes.bool.isRequired,
    thread: PropTypes.object, // Thread object. Not needed if creating new thread

    // Redux state:
    // user: PropTypes.object,
}

class PostFrame_Comment_Create {

}

