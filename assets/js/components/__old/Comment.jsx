import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Voting from "./Voting";
import {connect} from "react-redux";
import {canUserManagePost} from "../../redux/auth";
import {deleteComment} from "../../redux/postsCRUD";
import CommentForm from "./CommentForm";
import {Col, Row, Card, CardGroup, Container, Image, NavDropdown, Tooltip, OverlayTrigger} from "react-bootstrap";
import UrlBuilder from "../../utils/UrlBuilder";
import {Link} from "react-router-dom";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {faEdit, faMinusCircle, faPlusCircle, faTrash} from "@fortawesome/free-solid-svg-icons";

const mapStateToProps = state => {
    return {
        user: state.auth.user
    };
}

const mapDispatchToProps = {
    deleteComment
}

class Comment extends Component {
    constructor(props) {
        super(props);

        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleEditClick = this.handleEditClick.bind(this);
        this.handleCancelEditClick = this.handleCancelEditClick.bind(this);

        this.state = {
            editMode : false
        }
    }

    handleDeleteClick(event) {
        event.preventDefault();

        if (!canUserManagePost(this.props.user, this.props.comment)) {
            console.error('You don\'t have permissions to do that');
            return;
        }

        const u = this.props.user;
        const message = `Delete this comment?${u && u.id !== this.props.comment.author.id ?
            `\n\nWARNING: you are deleting someone else's comment as an admin!` : ``}`
        let answer = confirm(message);

        if (answer)
            this.props.deleteComment({threadId: this.props.thread.id, commentId: this.props.comment.id})
    }
    
    handleEditClick(event) {
        event.preventDefault();
        this.setState({editMode: true});
    }

    handleCancelEditClick(event) {
        event.preventDefault();
        this.setState({editMode: false});
    }

    /*render() {
        return this.render_new();

        const c = this.props.comment;

        if (this.state.editMode) {
            return (
                <li>
                    <CommentForm editMode={true} threadId={this.props.thread.id}
                                 comment={c} cancelCallback={this.handleCancelEditClick} />
                </li>
            );
        }


        let editDeleteJsx = null;
        if (canUserManagePost(this.props.user, c)) {
            editDeleteJsx =
                <span>
                    <a href="#" onClick={this.handleEditClick}>Edit</a>,{' '}
                    <a href="#" onClick={this.handleDeleteClick}>Delete</a>
                </span>;
        }

        return (
            <li className='bsr'>
                {c.content}<br/>
                #{c.id} by {c.author.username} at {c.createdAt},{' '}
                <Voting post={c} isThread={false} />. {editDeleteJsx}
            </li>
        );
    }*/

    render() {
        const c = this.props.comment;
        const u = this.props.user;
        const a = c.author;


        if (this.state.editMode) {
            return (
                // <li>
                <CommentForm editMode={true} threadId={this.props.thread.id}
                             comment={c} cancelCallback={this.handleCancelEditClick} />
                // </li>
            );
        }

        const submittedTimeAgoJsx = <>{(new Date(c.createdAt)).timeAgo()}{c.edited ? '*' : null}</>;

        return (
            <>
            <Card border={u && u.id === c.author.id ? 'primary' : null}>
                <Card.Header className='py-2'>

                    {/* -- Author, Date -- */}
                    <div className='d-inline-block'>
                        <Link to={UrlBuilder.Users.Single(a.id)}>
                            <Image
                                style={{height: '25px'}}
                                src={UrlBuilder.RoboHash(a.username, 2, 100)}
                                roundedCircle />

                            <span className='ml-2'>{c.author.username}</span>
                        </Link>

                        {/* - Date - */}
                        <span className='text-muted d-none d-sm-inline small'>
                            {' '}&nbsp;·&nbsp;{' '}

                            {/* TODO check if edited ago works */}
                            {c.edited ?
                                <OverlayTrigger overlay={
                                    <Tooltip id={'commed-edited-'+c.id}>
                                        Submitted {(new Date(c.createdAt)).timeAgo()}<br/>
                                        Last edit {(new Date(c.updatedAt)).timeAgo()}
                                    </Tooltip>
                                }>
                                    <span className='d-inline-block'>
                                        {submittedTimeAgoJsx}
                                    </span>
                                </OverlayTrigger>
                                : submittedTimeAgoJsx}
                        </span>

                    </div>

                    {/* -- Edit, Delete, Voting -- */}
                    <div className='d-inline-block float-right'>
                        {canUserManagePost(u, c) ?
                        <div className='d-inline-block'>
                            <span className='mr-4'>
                                <a href='#' className='color-vote text-muted' onClick={this.handleEditClick}>
                                    <FA icon={faEdit} size={'lg'} />
                                    <span className='d-none d-sm-inline ml-1'>
                                        Edit
                                    </span>
                                </a>
                            </span>
                            <span className='mr-4'>
                                <a href='#' className='color-vote text-muted' onClick={this.handleDeleteClick}>
                                    <FA icon={faTrash} size={'lg'} />
                                    <span className='d-none d-sm-inline ml-1'>
                                        Delete
                                    </span>
                                </a>
                            </span>
                        </div>
                        : null}

                        <div className='d-inline-block color-vote'>
                            <FA icon={faMinusCircle} size={'lg'} />
                            {' '}<b>1234</b>{' '}
                            <FA icon={faPlusCircle} size={'lg'} />
                        </div>
                    </div>

                </Card.Header>

                <Card.Body className='py-2'>
                    {c.content}
                </Card.Body>
            </Card>
            <br/>
            </>
        );
        /* TODO highlight current user's comments + threads with colored card border */
    }
}

Comment.propTypes = {
    comment: PropTypes.object.isRequired,
    thread: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Comment);
