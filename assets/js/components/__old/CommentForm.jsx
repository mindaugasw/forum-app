import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import {createComment, editComment} from "../../redux/postsCRUD";
import {Card, Image, OverlayTrigger, Tooltip} from "react-bootstrap";
import {Link} from "react-router-dom";
import UrlBuilder from "../../utils/UrlBuilder";
import {canUserManagePost} from "../../redux/auth";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {faEdit, faMinusCircle, faPlusCircle, faTrash} from "@fortawesome/free-solid-svg-icons";

const mapDispatchToProps = {
    createComment,
    editComment
}
const mapStateToProps = state => {
    return {
        // isLoggedIn: state.auth.isLoggedIn,
        user: state.auth.user
    };
}

class CommentForm extends Component {
    constructor(props) {
        super(props);

        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleTextboxChange = this.handleTextboxChange.bind(this);

        this.state = {
            contentValue: this.props.comment ? this.props.comment.content : ''
        }
    }

    handleTextboxChange(event) {
        this.setState({contentValue: event.target.value});
    }

    handleFormSubmit(event) {
        event.preventDefault();

        const content = event.target.elements.namedItem('content').value;

        if (!this.props.isLoggedIn) {
            console.error('You must be logged in to do that.');
            return;
        }

        if (content.length < 1 || content.length > 30000) {
            // TODO show error
            console.error('Content length must be between 1-30000 characters. Current length: '+content.length+' characters');
            return;
        }

        if (this.props.editMode)
            this.props.editComment({threadId: this.props.threadId, commentId: this.props.comment.id, content})
        else
            this.props.createComment({id: this.props.threadId, content});
    }
    
    render() {
        const {editMode, cancelCallback} = this.props;
        const u = this.props.user;
        const c = this.props.comment
        const a = c.author || null;

        let avatarPlaceholderImg = require('../../../images/avatar_placeholder.png');
        const submittedTimeAgoJsx = <>{(new Date(c.createdAt)).timeAgo()}{c.edited ? '*' : null}</>;

        return (
            <>
                <Card border={u && u.id === c.author.id ? 'primary' : null}>
                    <Card.Header className='py-2'>

                        {/* -- Author, Date -- */}
                        <div className='d-inline-block'>

                            {editMode ?
                                <>
                                <Link to={UrlBuilder.Users.Single(a.id)}>
                                    <Image
                                        className='avatar-image-small'
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
                                </>
                            :
                                <span>
                                    <Image
                                        className='avatar-image-small'
                                        src={avatarPlaceholderImg}
                                        roundedCircle />
                                </span>
                            }



                        </div>

                    </Card.Header>

                    <Card.Body className='py-2'>
                        <input type='text' value={c.content} />
                    </Card.Body>
                </Card>
                <br/>
            </>
        );





        return (
            <div>
                <form onSubmit={this.handleFormSubmit}>

                    <b>{editMode ? 'Edit comment' : 'Submit new comment'}</b><br/>
                    {editMode ? <span>Comment #{comment.id} made by {comment.author.username} at {comment.createdAt}<br/></span> : null}

                    <input type="text" name="content" onChange={this.handleTextboxChange} value={this.state.contentValue}/>
                    <button type="submit">Submit</button>{' '}
                    {editMode ? <button onClick={cancelCallback}>Cancel</button> : null }
                </form>
            </div>
        );
    }
}

CommentForm.propTypes = {
    editMode: PropTypes.bool.isRequired, // false: new comment creation. true: given comment edit

    // For new comment:
    threadId: PropTypes.number.isRequired,

    // For comment edit:
    comment: PropTypes.object,
    cancelCallback: PropTypes.func,

    // Redux state:
    user: PropTypes.object,
};

export default connect(mapStateToProps, mapDispatchToProps)(CommentForm);
