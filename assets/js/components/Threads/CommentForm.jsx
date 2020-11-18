import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import {createComment} from "../../redux/postsCRUD";

const mapDispatchToProps = {
    createComment
}
const mapStateToProps = state => {
    return {
        isLoggedIn: state.auth.isLoggedIn,
        // user: state.auth.user,
    };
}

class CommentForm extends Component {
    constructor(props) {
        super(props);

        this.handleFormSubmit = this.handleFormSubmit.bind(this);
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

        this.props.createComment({id: this.props.threadId, content});
    }
    
    render() {
        return (
            <div>
                <form onSubmit={this.handleFormSubmit}>
                    <b>Submit new comment</b><br/>
                    <input type="text" name="content" />
                    <button type="submit">Submit</button>
                </form>
            </div>
        );
    }
}

CommentForm.propTypes = {
    threadId: PropTypes.number.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(CommentForm);
