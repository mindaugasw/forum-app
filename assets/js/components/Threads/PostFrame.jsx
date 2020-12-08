import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Button, Card, Form, Image, Badge} from "react-bootstrap";
import {Link} from "react-router-dom";
import UrlBuilder from "../../utils/UrlBuilder";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import VotingGeneral from "./Voting";
import {PostFrame_Comment, PostFrame_Thread} from "./PostFrameVariants";
import AlertWithIcon from "../common/AlertWithIcon";
import ConditionalTooltip, {msg_MustBeLoggedIn} from "../common/ConditionalTooltip";
import Utils from "../../utils/Utils";
import Loader from "../common/Loader";

/**
 * General thread/comment rendering component.
 * Responsible only for rendering various forms of threads or comments (plain
 * view, new item submission form, existing item editing form). Form validation
 * and submission logic should be handled externally and callbacks passed via props.
 */
class PostFrame extends Component {
    constructor(props) {
        super(props);

        this.handleFormChange = this.handleFormChange.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);

        const p = this.props.post;
        // this.initialState = { // Helps easily reset on new comment submit, as component is not remounted(?) and state not reset automatically
        this.state = {
            post: p || {
                title: '',
                content: '',
            },

            validation: {
                valid: false, // Is entire form valid?

                title: false,
                content: false,

                titleValid: false, // Used only in PostFrameVariants
                contentValid: false,

                alert: {
                    show: false,
                    type: false,
                    message: false,
                },
            }
        };

        /*
        // If PostFrame is ever initially rendered as edit form, it should also
        // validate form data immediately. Currently full form is only validated in
        // componentWillUpdate, as PostFrame never renders as edit form initially
        // UNTESTED
        if (this.props.formMode && !this.props.post) { // is edit mode
            initialState = mergeDeep(initialState, this.props.onValidateFullForm(initialState));
        }*/

        // this.state = this.initialState;
    }

    // Component variants shortcuts
    static Thread = PostFrame_Thread;
    static Comment = PostFrame_Comment;

    componentDidUpdate(prevProps, prevState, snapshot) {
        // Validate form if entering edit mode
        if (prevProps.formMode === false && this.props.formMode === true) {
            this.setState({
                ...Utils.MergeDeep(this.state, this.props.onValidateFullForm(this.state))
            });
        }
    }

    handleFormChange(event) {
        const target = event.target;

        // Manually merge new state data before passing it for validation
        const targetUpdate = {[target.id]: target.value};
        const updatedState = Utils.MergeDeep(
            this.state, {
                post: targetUpdate
            }
        );


        // Callback can return new state data, e.g. validation data
        let validationData = null;
        if (this.props.onChange)
            validationData = this.props.onChange(target, updatedState);

        this.setState({
            ...Utils.MergeDeep(updatedState, validationData)
        });
    }

    handleFormSubmit(event) {
        event.preventDefault();

        this.props.onSubmit(event, this.state).then(newState => {
            if (newState) { // If any state was returned, it's likely updated validation data, and form was not submitted
                /*if (newState.resetState === true) { // Reset state after comment submit to use the same form again. Not needed anymore?
                    console.log('PostFrame state reset');
                    this.setState({...this.initialState});
                }
                else*/
                this.setState(state => {
                    return {
                        ...Utils.MergeDeep(state, newState),
                    };
                });
            }
        });
    }

    render() {
        /** This thread or comment */
        const p = this.props.post;

        /** Currently logged in user object (or null) */
        const u = this.props.user;

        /** Is this thread or comment? */
        const isThread = this.props.isThread;

        /** If this is thread, that equal to props.post. If this is comment, parent thread that this comment belongs to. */
        const parentThread = this.props.parentThread;

        /** Render as form mode for editing/creating post (or view mode otherwise) */
        const formMode = this.props.formMode;

        /** Render as form for new post */
        const newMode = formMode && !this.props.post;

        /** Render as form for editing existing post */
        const editMode = formMode && !!this.props.post;

        const formLoading = this.props.formLoading;

        const {validation} = this.state
        const post_state = this.state.post;
        const {onEditClick, onDeleteClick} = this.props;
        const {handleFormSubmit, handleFormChange} = this;


        /**
         * User avatar (or placeholder), username, posted time ago
         */
        function headerLeftJsx() {
            let headerLeftJsx; // Avatar, username, time ago

            if (newMode) { // Creating new post. Render logged in user or placeholder
                if (u) { // Render logged in user
                    headerLeftJsx =
                        <Link to={UrlBuilder.Users.Single(u.id)}>
                            <Image
                                className='avatar-image-small'
                                src={UrlBuilder.RoboHash(u.username, 2, 100)}
                                roundedCircle />
                            <span className='ml-2 mr-1'>{u.username}</span>
                            {Utils.Roles.IsUserAdmin(u) ? <Badge.Admin /> : null}
                        </Link>;
                } else { // Render placeholder
                    headerLeftJsx =
                        <span>
                        <Image
                            className='avatar-image-small'
                            src={require('../../../images/avatar_placeholder.png').default}
                            roundedCircle />
                    </span>;
                }

            } else { // View or edit mode. Render post author's user
                // (if editing by admin, post author's name/avatar will not match currently logged in user)
                const submittedTimeAgoJsx = <> &nbsp;·&nbsp; {(new Date(p.createdAt)).timeAgo()}{p.edited ? '*' : null}</>;
                headerLeftJsx =
                    <>
                        <Link to={UrlBuilder.Users.Single(p.author.id)}>
                            <Image
                                className='avatar-image-small'
                                src={UrlBuilder.RoboHash(p.author.username, 2, 100)}
                                roundedCircle />
                            <span className='ml-2'>{p.author.username}</span>
                            {parentThread && parentThread.author.id === p.author.id ? <Badge.Author /> : null }
                            {Utils.Roles.IsUserAdmin(p.author) ? <Badge.Admin /> : null}
                        </Link>
                        <span className='text-muted d-none d-sm-inline small'> {/* Hide on xs */}
                            <ConditionalTooltip
                                placement='top'
                                tooltip={<>
                                    Submitted {(new Date(p.createdAt)).formatDefault()}
                                    {p.edited ?
                                        <><br/>Last edit {(new Date(p.updatedAt)).formatDefault()}</>
                                        : null}
                                </>}
                                tooltipId={`${isThread ? 't' : 'c'}-edited-${p.id}`}
                                // show={p.edited}
                                show={true}
                                wrapperProps={{className: 'd-inline-block'}}
                            >
                            <span className='d-inline-block'>
                                {submittedTimeAgoJsx}
                            </span>
                        </ConditionalTooltip>
                            {APP_ENV === 'dev' ? <> &nbsp;·&nbsp; #{p.id}</> : ''}
                </span>
                    </>;
            }
            headerLeftJsx = <div className='d-inline-block'>{headerLeftJsx}</div>;

            return headerLeftJsx;
        }

        /**
         * Edit, Delete links, Voting buttons
         */
        function headerRightJsx() {
            let headerRightJsx; // Edit, Delete, voting
            if (formMode) { // Don't show anything in form mode
                headerRightJsx = null;
            } else { // View mode: show everything
                headerRightJsx =
                    <div className='d-inline-block float-right'>
                        {Utils.Roles.CanUserManagePost(u, p) ?
                            <div className='d-inline-block'>
                            <span className='mr-4'>
                                <a href='#' className='color-vote text-muted' onClick={event => onEditClick(event, true)}>
                                    <FA icon={faEdit} size={'lg'} />
                                    <span className='d-none d-sm-inline ml-1'>Edit</span>
                                </a>
                            </span>
                                <span className='mr-4'>
                                <a href='#' className='color-vote text-muted' onClick={event => onDeleteClick(event)}>
                                    <FA icon={faTrash} size={'lg'} />
                                    <span className='d-none d-sm-inline ml-1'>Delete</span>
                                </a>
                            </span>
                            </div>
                            : null}

                        <VotingGeneral post={p} isThread={isThread} isVertical={false} />
                    </div>;
            }

            return headerRightJsx;
        }

        /**
         * Main content: thread or comment text, or create/edit form
         */
        function contentJsx() {
            let contentJsx;
            if (!formMode)
                contentJsx = p.content;
            else {
                let p = post_state; // If in edit mode, get post from state (with updated input values), instead of props with initial values
                const v = validation;
                const formLabels = isThread; // Show form labels only on thread form

                contentJsx =
                    <Form onSubmit={handleFormSubmit}>
                        <fieldset disabled={formLoading}>

                            {v.alert.show ?
                                <AlertWithIcon variant={v.alert.type}>{v.alert.message}</AlertWithIcon>
                                : null}

                            {/* --- Title --- */}
                            {isThread ?
                                <Form.Group controlId='title'>
                                    {formLabels ?
                                        <Form.Label>Topic title</Form.Label>
                                        : null
                                    }
                                    <Form.Control
                                        type='text'
                                        maxLength={255}
                                        value={p.title}
                                        autoComplete='off'
                                        onChange={handleFormChange}
                                    />
                                    <Form.Text className='text-muted'>
                                        Should be between 10-255 characters.
                                    </Form.Text>
                                    {v.title ?
                                        <Form.Control.Feedback type='invalid' className='d-block'>{v.title}</Form.Control.Feedback>
                                        : null}
                                </Form.Group>
                                : null}

                            {/* --- Content --- */}
                            <Form.Group controlId='content'>
                                {formLabels ?
                                    <Form.Label>{isThread ? 'Topic' : 'Comment'} content</Form.Label>
                                    : null
                                }
                                {/* TODO FEATURE markdown formatting */}
                                <Form.Control
                                    as='textarea'
                                    rows={5}
                                    maxLength={30000}
                                    style={{resize: 'vertical'}}
                                    value={p.content}
                                    autoComplete='off'
                                    onChange={handleFormChange}
                                />
                                <Form.Text className='text-muted'>
                                    Should be not empty and not exceed 30000 characters.
                                </Form.Text>
                                {v.content ?
                                    <Form.Control.Feedback type='invalid' className='d-block'>{v.content}</Form.Control.Feedback>
                                    : null}
                            </Form.Group>

                            {/* --- Admin alert --- */}
                            {editMode && u && u.id !== p.author.id ?
                                <AlertWithIcon variant='primary' className='mb-2'>
                                    {` You're editing someone else's ${isThread? 'thread' : 'comment'} as an admin!`}
                                </AlertWithIcon>
                                : null }

                            {/* --- Submit button --- */}
                            <ConditionalTooltip
                                placement='right'
                                tooltip={msg_MustBeLoggedIn}
                                tooltipId='postframe-form-submit-auth-tooltip'
                                show={!u}
                                pointerEventsNone={true}
                            >
                                <Button variant='primary' type='submit' className='mr-2' disabled={!v.valid || !u}>
                                    {formLoading ?
                                        <Loader.Small />
                                        : null
                                    }{' '}
                                    {editMode ? 'Save' : 'Submit'}
                                </Button>
                            </ConditionalTooltip>


                            {/* --- Cancel edit button --- */}
                            {editMode ?
                                <Button
                                    variant='outline-secondary'
                                    onClick={event => onEditClick(event, false)}
                                >Cancel</Button>
                                : null}
                        </fieldset>
                    </Form>;
            }

            return contentJsx;
        }


        return (
            <div>
                <Card border={u && p && u.id === p.author.id ? 'primary' : null}> {/* Your posts are highlighted */}
                    <Card.Header className='py-2'>
                        <div>
                            {headerLeftJsx()}
                            {headerRightJsx(p, u, isThread, formMode)}
                        </div>
                    </Card.Header>

                    <Card.Body className='py-2'>
                        {contentJsx(p, u, isThread, formMode, newMode, editMode, formLoading)}
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

PostFrame.propTypes = {
    post: PropTypes.object, // Thread or comment object. If null, will render form for new thread/comment
    isThread: PropTypes.bool.isRequired, // Is provided post thread or comment
    formMode: PropTypes.bool.isRequired, // If true, renders as form form edit/create
    formLoading: PropTypes.bool, // adjusts form style. Can be set to true e.g. after submitting
    parentThread: PropTypes.object, // If this is thread, parentThread should be same as post prop. If this is comment, than parentThread that this comment belongs to. Needed to display author badge.

    onChange: PropTypes.func, // Form inputs change callback
    onSubmit: PropTypes.func, // Form submit callback
    onEditClick: PropTypes.func, // Callback for 'Edit' or 'Cancel edit' buttons. Passes event and true/false if starting/ending editing
    onDeleteClick: PropTypes.func, // Callback for 'Delete' click
    onValidateFullForm: PropTypes.func, // Callback for initial validation on Edit form variant

    // Redux state:
    // user: PropTypes.object,
}

const mapStateToProps = state => {
    return {
        user: state.auth.user
    };
}

export default connect(mapStateToProps)(PostFrame);