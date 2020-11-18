import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Voting from "./Voting";
import {connect} from "react-redux";
import {canUserManagePost} from "../../redux/auth";
import {deleteComment} from "../../redux/postsCRUD";
import CommentForm from "./CommentForm";

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

    render() {
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
            <li>
                {c.content}<br/>
                #{c.id} by {c.author.username} at {c.createdAt},{' '}
                <Voting post={c} isThread={false} />. {editDeleteJsx}
            </li>
        );
    }
}

Comment.propTypes = {
    comment: PropTypes.object.isRequired,
    thread: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Comment);
