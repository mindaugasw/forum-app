import React, {Component} from "react";
import PostFrame from "./PostFrame";
import FormUtils from "../../utils/FormUtils";
import Notifications from "../../utils/Notifications";
import UrlBuilder from "../../utils/UrlBuilder";
import {connect} from "react-redux";
import {createComment, createThread, deleteComment, deleteThread, editComment, editThread} from "../../redux/postsCRUD";
import PropTypes from 'prop-types';
import Utils from "../../utils/Utils";

/**
 * Validates form submit response. Handles 400, 401, 403 responses by showing appropriate
 * notification. Shows unhandled error notification in all other cases if it was rejected action.
 * @param action Redux thunk action
 * @returns {boolean|{validation: {alert: {show: boolean, type: boolean, message: boolean}}}|{validation: {alert: {show: boolean, type: string, message: string}}}} True if response is successful. Validation data otherwise.
 */
function handleFormSubmitErrors(action) {
    if (action.type.endsWith(REJECTED)) {
        const p = action.payload;
        const e = p.error;

        const emptyAlert = { // Return this to clear alert (in case there's some different error and alert from previous request)
            validation: {
                alert: {
                    show: false,
                    type: false,
                    message: false,
                }
            }
        };

        if (e && e.status === 400) {
            return {
                validation: {
                    alert: {
                        show: true,
                        type: 'danger',
                        message: 'Could not complete the request. There were the following errors: ' + e.message,
                    }
                }
            };
        } else if ((e && e.status === 401) || p.code === 401) {
            Notifications.Unauthenticated();
            return emptyAlert;
        } else if (e && e.status === 403) {
            Notifications.Unauthorized();
            return emptyAlert;
        }

        console.error('Form error in PostFrame form submit', action);
        Notifications.UnhandledError('Form error in PostFrame form submit', action);
        return false;
    } else
        return true;
}

/**
 * Checks delete action for possible errors. Returns true if action completed successfully.
 * Otherwise returns false and adds notification.
 * @param action
 * @returns {boolean}
 */
function handleDeleteErrors(action) {
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

        console.error('Thread/Comment delete error', action);
        Notifications.UnhandledError('Thread/Comment delete error', action);
        return false;
    }

    return true;
}


class PostFrame_Thread_connected extends Component {
    constructor(props) {
        super(props);

        this.handleThreadFormChange = this.handleThreadFormChange.bind(this);
        this.handleThreadFormSubmit = this.handleThreadFormSubmit.bind(this);
        this.handleEditModeChange = this.handleEditModeChange.bind(this);
        this.handleThreadDeleteClick = this.handleThreadDeleteClick.bind(this);
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

        validationData = Utils.MergeDeep(state.validation, validationData);
        validationData.valid = validationData.titleValid && validationData.contentValid;

        return {
            validation: {
                ...validationData
            }
        };
    }

    handleThreadFormChange(target, state) {
        // Validate only edited field (to not show errors on still untouched fields)
        let validationData = {};
        if (target.id === 'title')
            validationData = FormUtils.ValidateTextField(target.value, 'title', {minLength: 10, maxLength: 255});

        if (target.id === 'content')
            validationData = FormUtils.ValidateTextField(target.value, 'content', {minLength: 1, maxLength: 30000});

        // Join all validation data to check full form validity
        validationData = Utils.MergeDeep(state.validation, validationData);

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
            Notifications.UnhandledError('Tried submitting invalid form');
            return;
        }

        this.setState({formLoading: true});
        let response = this.props.isNewThreadForm ?
            this.props.createThread({title: state.post.title, content: state.post.content}) :
            this.props.editThread({threadId: this.props.thread.id, title: state.post.title, content: state.post.content});

        return response.then(action => {
            const errorHandler = handleFormSubmitErrors(action);

            if (errorHandler !== true) {
                this.setState({formLoading: false});
                return errorHandler;
            }

            if (this.props.isNewThreadForm) {
                console.debug('Thread created successfully');
                Notifications.Success('New topic created');
            } else {
                console.debug('Thread updated successfully');
                Notifications.Success('Topic updated');
            }
            Utils.Redirect(UrlBuilder.Threads.Single(action.payload.id));
            return false;
        });
    }

    handleEditModeChange(event, editMode) {
        event.preventDefault();
        this.setState({
            editMode,
        });
    }

    handleThreadDeleteClick(event) {
        event.preventDefault();

        if (!Utils.Roles.CanUserManagePost(this.props.user, this.props.thread)) {
            Notifications.Unauthorized();
            return;
        }

        const u = this.props.user;
        const message = `Delete this topic?${u && u.id !== this.props.thread.author.id ?
            `\n\nWARNING: you are deleting someone else's thread as an admin!` : ``}`
        let answer = confirm(message);

        if (answer) {
            this.props.deleteThread({threadId: this.props.thread.id})
                .then(action => {
                    const errorsHandler = handleDeleteErrors(action);
                    if (errorsHandler !== true)
                        return errorsHandler;

                    console.debug('Thread deleted successfully');
                    Notifications.Success('Topic deleted');
                    Utils.Redirect(UrlBuilder.Home());
                    return;
                    // TODO successful thread delete prints errors in console,  as
                    //      SingleThreadPage attempts to load no-longer existing thread,
                    //      before redirection happens
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
                    parentThread={this.props.thread}
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
                    parentThread={this.props.thread}
                    isThread={true}
                    formMode={false}
                    onEditClick={this.handleEditModeChange}
                    onDeleteClick={this.handleThreadDeleteClick}
                />
            );
        }
    }
}

const mapStateToProps_thread = state => {
    return {
        user: state.auth.user,
    }
}

export const PostFrame_Thread = connect(mapStateToProps_thread, {createThread, editThread, deleteThread})(PostFrame_Thread_connected);

PostFrame_Thread.propTypes = {
    isNewThreadForm: PropTypes.bool.isRequired,
    thread: PropTypes.object, // Thread object. Not needed if creating new thread

    // Redux state:
    // user: PropTypes.object,
}



class PostFrame_Comment_connected extends Component {
    constructor(props) {
        super(props);

        this.handleCommentFormChange = this.handleCommentFormChange.bind(this);
        this.handleCommentFormSubmit = this.handleCommentFormSubmit.bind(this);
        this.handleEditModeChange = this.handleEditModeChange.bind(this);
        this.handleCommentDeleteClick = this.handleCommentDeleteClick.bind(this);
        this.validateFullForm = this.validateFullForm.bind(this);

        this.state = {
            formLoading: false,
            editMode: this.props.isNewThreadForm,
        }
    }

    // Used for initial validation when mounting edit form component
    validateFullForm(state) {
        let validationData = {
            ...FormUtils.ValidateTextField(state.post.content, 'content', {minLength: 1, maxLength: 30000})
        };

        validationData = Utils.MergeDeep(state.validation, validationData);
        validationData.valid = validationData.contentValid;

        return {
            validation: {
                ...validationData
            }
        };
    }

    handleCommentFormChange(target, state) {
        // Validate only edited field (to not show errors on still untouched fields)
        let validationData = {};
        if (target.id === 'content')
            validationData = FormUtils.ValidateTextField(target.value, 'content', {minLength: 1, maxLength: 30000});

        // Join all validation data to check full form validity
        validationData = Utils.MergeDeep(state.validation, validationData);

        validationData.valid = validationData.contentValid;

        return {
            validation: {
                ...validationData
            }
        };
    }

    handleCommentFormSubmit(event, state) {
        if (!state.validation.valid) {
            console.error('Tried submitting invalid form');
            Notifications.UnhandledError('Tried submitting invalid form');
            return;
        }

        this.setState({formLoading: true});
        let response = this.props.isNewCommentForm ?
            this.props.createComment({threadId: this.props.parentThread.id, content: state.post.content}) :
            this.props.editComment({threadId: this.props.parentThread.id, commentId: this.props.comment.id, content: state.post.content});

        return response.then(action => {
            const errorHandler = handleFormSubmitErrors(action);

            if (errorHandler !== true) {
                this.setState({formLoading: false});
                return errorHandler;
            }

            if (this.props.isNewCommentForm) {
                console.debug('Comment created successfully');
                Notifications.Success('Comment submitted');
            } else {
                console.debug('Thread updated successfully');
                Notifications.Success('Comment updated');
            }

            return false;
        });
    }

    handleEditModeChange(event, editMode) {
        event.preventDefault();
        this.setState({
            editMode,
        });
    }

    handleCommentDeleteClick(event) {
        event.preventDefault();

        if (!Utils.Roles.CanUserManagePost(this.props.user, this.props.comment)) {
            Notifications.Unauthorized();
            return;
        }

        const u = this.props.user;
        const message = `Delete this thread?${u && u.id !== this.props.comment.author.id ?
            `\n\nWARNING: you are deleting someone else's comment as an admin!` : ``}`
        let answer = confirm(message);

        if (answer) {
            this.props.deleteComment({threadId: this.props.parentThread.id, commentId: this.props.comment.id})
                .then(action => {
                    const errorsHandler = handleDeleteErrors(action);
                    if (errorsHandler !== true)
                        return errorsHandler;

                    console.debug('Thread deleted successfully');
                    Notifications.Success('Comment deleted');
                    return;
                });
        }
    }

    render() {
        if (this.props.isNewCommentForm === true) { // New comment form
            return (
                <PostFrame
                    post={null}
                    isThread={false}
                    formMode={true}
                    formLoading={this.state.formLoading}
                    onChange={this.handleCommentFormChange}
                    onSubmit={this.handleCommentFormSubmit}
                />
            );
        } else if (this.state.editMode) { // Edit existing comment
            return (
                <PostFrame
                    post={this.props.comment}
                    parentThread={this.props.parentThread}
                    isThread={false}
                    formMode={true}
                    onChange={this.handleCommentFormChange}
                    onSubmit={this.handleCommentFormSubmit}
                    onEditClick={this.handleEditModeChange}
                    onValidateFullForm={this.validateFullForm}
                    formLoading={this.state.formLoading}
                />
            );
        } else { // Show comment
            return (
                <PostFrame
                    post={this.props.comment}
                    parentThread={this.props.parentThread}
                    isThread={false}
                    formMode={false}
                    onEditClick={this.handleEditModeChange}
                    onDeleteClick={this.handleCommentDeleteClick}
                />
            );
        }
    }
}

const mapStateToProps_comment = state => {
    return {
        user: state.auth.user,
    }
}

export const PostFrame_Comment = connect(mapStateToProps_comment, {createComment, editComment, deleteComment})(PostFrame_Comment_connected);
PostFrame_Comment.propTypes = {
    isNewCommentForm: PropTypes.bool.isRequired,
    comment: PropTypes.object, // Comment object. Not needed if creating new comment
    parentThread: PropTypes.object.isRequired, // Thread that this comment belongs to

    // Redux state:
    // user: PropTypes.object.isRequired,
}
