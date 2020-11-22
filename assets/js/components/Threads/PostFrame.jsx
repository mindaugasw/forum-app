import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Spinner, Col, Alert, Button, Card, Form, Image, OverlayTrigger, Tooltip, Row, Container} from "react-bootstrap";
import {Link} from "react-router-dom";
import UrlBuilder from "../../utils/UrlBuilder";
import {canUserManagePost} from "../../redux/auth";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {faEdit, faExclamationCircle, faMinusCircle, faPlusCircle, faTrash} from "@fortawesome/free-solid-svg-icons";
import VotingGeneral from "./VotingGeneral";

const mapStateToProps = state => {
    return {
        user: state.auth.user
    };
}

const mapDispatchToProps = {

}

/**
 * A general frame for rendering thread or comment.
 * Can render normal view, form for creating or editing, for both thread and comment.
 * See prop types for more info on config or use other wrapper components e.g. Post.Comment.View
 */
class PostFrame extends Component {
    render() {
        /** This thread or comment */
        const p = this.props.post;

        /** Currently logged in user object (or null) */
        const u = this.props.user;

        /** Is this thread or comment? */
        const isThread = !this.props.parentThread; // if parentThread not null, it is comment

        /** Thread that this comment belongs to. Null if rendering thread */
        const parentThread = this.props.parentThread;

        /** Render as form mode for editing/creating post (or view mode otherwise) */
        const formMode = this.props.formMode;

        /** Render as form for new post */
        const newMode = formMode && !this.props.post;

        /** Render as form for editing existing post */
        const editMode = formMode && !!this.props.post;


        return (
            <div>
                <Card border={u && p && u.id === p.author.id ? 'primary' : null}> {/* Your posts are highlighted */}
                    <Card.Header className='py-2'>
                        <div>
                            {headerLeftJsx(p, u, isThread, newMode)}
                            {headerRightJsx(p, u, isThread, formMode)}
                        </div>
                    </Card.Header>

                    <Card.Body className='py-2'>
                        {contentJsx(p, u, isThread, formMode, newMode, editMode, true)}
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

PostFrame.propTypes = {
    post: PropTypes.object, // Thread or comment object. If null, will render form for new thread/comment
    parentThread: PropTypes.object, // Thread object. Needed only when rendering as comment frame
    formMode: PropTypes.bool.isRequired, // Renders as form edit/create, if true

    formLoading: PropTypes.bool, // adjusts form style. Can be set to true e.g. after submitting
    // Redux state:
    // user: PropTypes.object,
}

/**
 * User avatar (or placeholder), username, posted time ago
 * @param p Post object | null
 * @param u User object | null
 * @param {boolean} isThread is this thread or comment?
 * @param {boolean} newMode if render as form, is for new post or edit existing post?
 */
function headerLeftJsx(p, u, isThread, newMode) {
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
                    {/* TODO check if edited ago works */}
                    {p.edited ?
                        <OverlayTrigger overlay={
                            <Tooltip id={`${isThread ? 't' : 'c'}-edited-${p.id}`}>
                                Submitted {(new Date(p.createdAt)).timeAgo()}<br/>
                                Last edit {(new Date(p.updatedAt)).timeAgo()}
                            </Tooltip>
                        }>
                            <span className='d-inline-block'>
                                {submittedTimeAgoJsx}
                            </span>
                        </OverlayTrigger>
                        : submittedTimeAgoJsx}
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
 * @param formMode Render as form for editing/creating post?
 */
function headerRightJsx(p, u, isThread, formMode) {
    let headerRightJsx; // Edit, Delete, voting
    if (formMode) { // Nothing in form mode
        headerRightJsx = null;
    } else { // View mode: all buttons
        headerRightJsx =
            <div className='d-inline-block float-right'>
                {canUserManagePost(u, p) ?
                    <div className='d-inline-block'>
                            <span className='mr-4'>
                                <a href='#' className='color-vote text-muted' > {/* TODO onClick={this.handleEditClick}*/}
                                    <FA icon={faEdit} size={'lg'} />
                                    <span className='d-none d-sm-inline ml-1'>Edit</span>
                                </a>
                            </span>
                        <span className='mr-4'>
                                <a href='#' className='color-vote text-muted' >{/* TODO onClick={this.handleDeleteClick}*/}
                                    <FA icon={faTrash} size={'lg'} />
                                    <span className='d-none d-sm-inline ml-1'>Delete</span>
                                </a>
                            </span>
                    </div>
                    : null}

                {/*<div className='d-inline-block color-vote'>
                        <FA icon={faMinusCircle} size={'lg'} />
                        {' '}<b>1234</b>{' '}
                        <FA icon={faPlusCircle} size={'lg'} />
                    </div>*/}
                <VotingGeneral post={p} isThread={isThread} isVertical={false} />
            </div>;
    }

    return headerRightJsx;
}

function contentJsx(p, u, isThread, formMode, newMode, editMode, formLoading) {
    const formLabels = isThread; // Show form labels only on thread form

    let contentJsx;
    if (!formMode)
        contentJsx = p.content;
    else {
        contentJsx =
            <Form>
                <fieldset disabled={formLoading}>
                {/* --- Title --- */}
                {isThread ?
                    <Form.Group controlId='form-title'>
                        {formLabels ?
                            <Form.Label>Topic title</Form.Label>
                            : null
                        }
                        <Form.Control type='text' value={editMode ? p.title : ''} />
                        <Form.Text className='text-muted'>
                            Should be between 10-255 characters.
                        </Form.Text>
                    </Form.Group>
                : null}

                {/* --- Content --- */}
                <Form.Group controlId='form-content'>
                    {formLabels ?
                        <Form.Label>{isThread ? 'Thread' : 'Comment'} content</Form.Label>
                        : null
                    }
                    {/* TODO markdown formatting */}
                    <Form.Control as='textarea' rows={5} style={{resize: 'vertical'}} /> {/*value={editMode ? p.title : ''}*/}
                    <Form.Text className='text-muted'>
                        Should not exceed 30000 characters.
                    </Form.Text>
                </Form.Group>

                {/* --- Buttons --- */}
                {editMode && u && u.id !== p.author.id ?
                    <Alert variant='primary' className='mb-2'>
                        <FA icon={faExclamationCircle} />
                        {` You're editing someone else's ${isThread? 'thread' : 'comment'} as an admin!`}
                    </Alert>
                : null }

                <Button variant='primary' type='submit' className='mr-2'>
                    {formLoading ?
                        <Spinner animation='border' size='sm' />
                        : 'Submit'
                    }
                </Button>
                {editMode ?
                    <Button variant='secondary' >Cancel</Button>
                : null}



                {/*<Container fluid className='p-0'>
                    <Row>
                        <Col xs={12} className='mb-2'>
                            <Col xs={6} className='d-inline-block p-0'>
                                <Button variant='primary' type='submit' className='mr-1 w-100'>Submit</Button>
                            </Col>
                            <Col xs={6} className='d-inline-block p-0'>
                                <Button variant='secondary' className='ml-1 w-100' >Cancel</Button>
                            </Col>
                        </Col>
                        <Col xs={12}>
                            <Alert variant='danger'>
                                <FA icon={faExclamationCircle} />
                                {` You're editing someone else's ${isThread? 'thread' : 'comment'} as an admin!`}
                            </Alert>
                        </Col>
                    </Row>
                </Container>*/}

                </fieldset>
            </Form>;
    }

    return contentJsx;
}


export default connect(mapStateToProps, mapDispatchToProps)(PostFrame);