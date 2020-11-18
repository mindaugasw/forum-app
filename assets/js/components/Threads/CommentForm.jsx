import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import {createComment, editComment} from "../../redux/postsCRUD";

const mapDispatchToProps = {
    createComment,
    editComment
}
const mapStateToProps = state => {
    return {
        isLoggedIn: state.auth.isLoggedIn,
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
        const {editMode, comment, cancelCallback} = this.props;

        return (
            <div>
                <form onSubmit={this.handleFormSubmit}>

                    <b>{editMode ? 'Edit comment' : 'Submit new comment'}</b><br/>
                    {editMode ? <span>Comment #{comment.id} made by {comment.author.username} at {comment.createdAt}<br/></span> : null}

                    <input type="text" name="content" onChange={this.handleTextboxChange} value={this.state.contentValue}/>
                    <button type="submit">Submit</button>{' '}
                    <button onClick={cancelCallback}>Cancel</button>
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
};

export default connect(mapStateToProps, mapDispatchToProps)(CommentForm);
