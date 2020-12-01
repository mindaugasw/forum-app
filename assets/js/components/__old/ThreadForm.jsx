import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import {createThread, editThread} from "../../redux/postsCRUD";

const mapDispatchToProps = {
    createThread,
    editThread,
}
const mapStateToProps = state => {
    return {
        isLoggedIn: state.auth.isLoggedIn,
    };
}

class ThreadForm extends Component {
    constructor(props) {
        super(props);

        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);

        this.state = {
            title: this.props.thread ? this.props.thread.title : '',
            content: this.props.thread ? this.props.thread.content : ''
        }
    }

    handleInputChange(event) {
        this.setState({contentValue: event.target.value});

        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handleFormSubmit(event) {
        event.preventDefault();

        const title = event.target.elements.namedItem('title').value;
        const content = event.target.elements.namedItem('content').value;

        if (!this.props.isLoggedIn) {
            console.error('You must be logged in to do that.');
            return;
        }

        if (title.length < 10 || title.length > 255) {
            // TODO show error
            console.error('Title length must be between 10-255 characters. Current length: '+title.length+' characters');
            return;
        }

        if (content.length < 1 || content.length > 30000) {
            // TODO show error
            console.error('Content length must be between 1-30000 characters. Current length: '+content.length+' characters');
            return;
        }

        if (this.props.editMode)
            this.props.editThread({threadId: this.props.thread.id, title, content});
            // TODO disable edit mode
        else
            this.props.createThread({title, content});
            // TODO redirect somewhere
    }
    
    render() {
        const {editMode, thread, cancelCallback} = this.props;

        return (
            <div>
                <form onSubmit={this.handleFormSubmit}>

                    <b>{editMode ? 'Edit thread' : 'Submit new thread'}</b><br/>
                    {editMode ? <span>Thread #{thread.id} made by {thread.author.username} at {thread.createdAt}<br/></span> : null}


                    Title: <input type="text" name="title" onChange={this.handleInputChange} value={this.state.title}/><br/>
                    Content: <input type="text" name="content" onChange={this.handleInputChange} value={this.state.content}/><br/>
                    <button type="submit">Submit</button>{' '}
                    {editMode ? <button onClick={cancelCallback}>Cancel</button> : null }
                </form>
            </div>
        );
    }
}

ThreadForm.propTypes = {
    editMode: PropTypes.bool.isRequired, // false: new comment creation. true: given comment edit

    // For new comment:
    // threadId: PropTypes.number.isRequired,

    // For thread edit:
    thread: PropTypes.object,
    cancelCallback: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(ThreadForm);
