import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Spinner, Alert, Button, Card, Form, Image} from "react-bootstrap";
import {Link} from "react-router-dom";
import UrlBuilder from "../../utils/UrlBuilder";
import {canUserManagePost} from "../../redux/auth";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {faEdit, faExclamationCircle, faTrash} from "@fortawesome/free-solid-svg-icons";
import VotingGeneral from "./VotingGeneral";
import {PostFrame_Comment, PostFrame_Thread} from "./PostFrameVariants";
import AlertWithIcon from "../common/AlertWithIcon";
import ConditionalTooltip, {msg_MustBeLoggedIn} from "../common/ConditionalTooltip";
import Utils from "../../utils/Utils";

const mapStateToProps = state => {
    return {
        user: state.auth.user
    };
}

/**
 * A general component for rendering thread or comment.
 * Responsible only for rendering various forms of threads or comments (plain
 * view, new item submission form, existing item editing form). Form validation
 * and submission logic should be handled externally and callbacks passed via props.
 */
class PostFrame extends Component {
    constructor(props) {
        super(props);

        this.handleFormChange = this.handleFormChange.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.headerLeftJsx = this.headerLeftJsx.bind(this);
        this.headerRightJsx = this.headerRightJsx.bind(this);
        this.contentJsx = this.contentJsx.bind(this);

        const p = this.props.post;
        // this.initialState = { // Set to object property to easily reset on new comment submit, as component is not remounted and state not reset automatically
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

        // Callback can return new state data, e.g. validation data
        let newStateData = null;
        if (this.props.onChange)
            newStateData = this.props.onChange(event, this.state);

        this.setState(state => {
            return {
                ...Utils.MergeDeep(state, newStateData),
                post: {
                    ...state.post,
                    [target.id]: target.value,
                },
            };
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


    // --- Render methods ---
    /**
     * User avatar (or placeholder), username, posted time ago
     * @param p Post object | null
     * @param u User object | null
     * @param {boolean} isThread is this thread or comment?
     * @param {boolean} newMode if render as form, is for new post or edit existing post?
     */
    headerLeftJsx(p, u, isThread, newMode) {
        let headerLeftJsx; // Avatar, username, time ago

        if (newMode) { // Creating new post. Render logged in user or placeholder
            if (u) { // Render logged in user
                headerLeftJsx =
                    <Link to={UrlBuilder.Users.Single(u.id)}>
                        <Image
                            className='avatar-image-small'
                            src={UrlBuilder.RoboHash(u.username, 2, 100)}
                            roundedCircle />
                        <span className='ml-2'>{u.username}</span>
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
     * @param p Post object | null
     * @param u User object | null
     * @param {boolean} isThread is this thread or comment?
     * @param {boolean} formMode Render as form for editing/creating post?
     */
    headerRightJsx(p, u, isThread, formMode) {
        let headerRightJsx; // Edit, Delete, voting
        if (formMode) { // Don't show anything in form mode
            headerRightJsx = null;
        } else { // View mode: show everything
            headerRightJsx =
                <div className='d-inline-block float-right'>
                    {canUserManagePost(u, p) ?
                        <div className='d-inline-block'>
                            <span className='mr-4'>
                                <a href='#' className='color-vote text-muted' onClick={event => this.props.onEditClick(event, true)}>
                                    <FA icon={faEdit} size={'lg'} />
                                    <span className='d-none d-sm-inline ml-1'>Edit</span>
                                </a>
                            </span>
                            <span className='mr-4'>
                                <a href='#' className='color-vote text-muted' onClick={event => this.props.onDeleteClick(event)}>
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
     * @param p Post object
     * @param u User object
     * @param {boolean} isThread is this thread or comment?
     * @param {boolean} formMode Render as form for editing/creating post?
     * @param {boolean} newMode if render as form, is for new post or edit existing post?
     * @param {boolean} editMode if render as form, is for new post or edit existing post?
     *                  (same as negated newMode, added for convenience / readability)
     * @param {boolean} formLoading if render as form, should form be rendered as loading? (disables inputs)
     */
    contentJsx(p, u, isThread, formMode, newMode, editMode, formLoading) {
        let contentJsx;
        if (!formMode)
            contentJsx = p.content;
        else {
            p = this.state.post; // If in edit mode, get post from state (with updated input values), instead of props with initial values
            const v = this.state.validation;
            const formLabels = isThread; // Show form labels only on thread form

            contentJsx =
                <Form onSubmit={this.handleFormSubmit}>
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
                                    onChange={this.handleFormChange}
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
                            {/* TODO markdown formatting */}
                            <Form.Control
                                as='textarea'
                                rows={5}
                                maxLength={30000}
                                style={{resize: 'vertical'}}
                                value={p.content}
                                autoComplete='off'
                                onChange={this.handleFormChange}
                            />
                            <Form.Text className='text-muted'>
                                Should not be empty and not exceed 30000 characters.
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
                            <Button variant='primary' type='submit' className='mr-2' disabled={!v.valid}>
                                {formLoading ?
                                    <Spinner animation='border' size='sm' />
                                    : null
                                }{' '}
                                {editMode ? 'Save' : 'Submit'}
                            </Button>
                        </ConditionalTooltip>

                        {/*<Button variant='primary' type='submit' className='mr-2' disabled={!v.valid}>
                            {formLoading ?
                                <Spinner animation='border' size='sm' />
                                : null
                            }{' '}
                            {editMode ? 'Save' : 'Submit'}
                        </Button>*/}


                        {/* --- Cancel edit button --- */}
                        {editMode ?
                            <Button
                                variant='secondary'
                                onClick={event => this.props.onEditClick(event, false)}
                            >Cancel</Button>
                        : null}
                    </fieldset>
                </Form>;
        }

        return contentJsx;
    }

    render() {
        /** This thread or comment */
        const p = this.props.post;

        /** Currently logged in user object (or null) */
        const u = this.props.user;

        /** Is this thread or comment? */
        const isThread = this.props.isThread; // if parentThread not null, it is comment

        /** Render as form mode for editing/creating post (or view mode otherwise) */
        const formMode = this.props.formMode;

        /** Render as form for new post */
        const newMode = formMode && !this.props.post;

        /** Render as form for editing existing post */
        const editMode = formMode && !!this.props.post;

        const formLoading = this.props.formLoading;


        return (
            <div>
                <Card border={u && p && u.id === p.author.id ? 'primary' : null}> {/* Your posts are highlighted */}
                    <Card.Header className='py-2'>
                        <div>
                            {this.headerLeftJsx(p, u, isThread, newMode)}
                            {this.headerRightJsx(p, u, isThread, formMode)}
                        </div>
                    </Card.Header>

                    <Card.Body className='py-2'>
                        {this.contentJsx(p, u, isThread, formMode, newMode, editMode, formLoading)}
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

    onChange: PropTypes.func, // Form inputs change callback
    onSubmit: PropTypes.func, // Form submit callback
    onEditClick: PropTypes.func, // Callback for 'Edit' or 'Cancel edit' buttons. Passes event and true/false if starting/ending editing
    onDeleteClick: PropTypes.func, // Callback for 'Delete' click
    onValidateFullForm: PropTypes.func, // Callback for initial validation on Edit form variant

    // Redux state:
    // user: PropTypes.object,
}

export default connect(mapStateToProps)(PostFrame);