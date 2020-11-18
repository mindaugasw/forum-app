import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Voting from "./Voting";
import {connect} from "react-redux";
import {canUserManagePost} from "../../redux/auth";
import {deleteComment} from "../../redux/postsCRUD";

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
    }

    render() {
        const c = this.props.comment;

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
