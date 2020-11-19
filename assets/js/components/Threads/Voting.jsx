import React, {Component} from 'react';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import {submitVote} from "../../redux/threads";

const mapDispatchToProps = {
    submitVote
}
const mapStateToProps = state => {
    return {
        isLoggedIn: state.auth.isLoggedIn,
        user: state.auth.user,
    };
}

class Voting extends Component {
    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event, direction) {
        event.preventDefault();

        if (!this.props.isLoggedIn) {
            console.error('You need to be logged in to do that.');
            return;
        }

        if (this.props.user.id === this.props.post.author.id) {
            console.error('Voting on your own threads/comments is not allowed.');
            return;
        }

        if (direction === this.props.post.userVote)
            direction = 0;

        this.props.submitVote({
            id: this.props.post.id, direction, isThread: this.props.isThread
        });
    }

    render() {
        const {post} = this.props;
        // TODO disable voting links if not logged in
        // TODO disable voting links on your own posts

        return (
            <span>
                Score: {post.votesCount},{' '}
                <a href="#" onClick={event => this.handleClick(event, 1)}>
                    {post.userVote === 1 ? '🔼' : '⬆'}
                </a>{' '}
                <a href="#" onClick={event => this.handleClick(event, -1)}>
                    {post.userVote === -1 ? '🔽' : '⬇'}
                </a>
            </span>
        );
    }
}

Voting.propTypes = {
    // From props:
    post: PropTypes.object.isRequired, // Thread or comment object
    isThread: PropTypes.bool.isRequired, // is this thread or comment vote?

    // Automatically-passed props commented out for IDE to not suggest them when inserting Voting component
    // From redux state:
    // isLoggedIn: PropTypes.bool.isRequired,
    // user: PropTypes.object,

    // Redux actions:
    // submitVote: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Voting);
