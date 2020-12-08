import React, {Component} from 'react';
import PropTypes from "prop-types";
import {connect} from 'react-redux';
import {submitVote} from "../../redux/threads";
import {Col} from "react-bootstrap";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {faMinusCircle, faPlusCircle} from "@fortawesome/free-solid-svg-icons";
import Notifications from "../../utils/Notifications";

/**
 * Voting component for thread or comment
 */
class Voting extends Component {
    constructor(props) {
        super(props);

        this.handleVoteClick = this.handleVoteClick.bind(this);
    }

    handleVoteClick(event, direction) {
        event.preventDefault();

        if (!this.props.isLoggedIn) { // Can't vote if not logged in
            Notifications.Unauthenticated();
            return;
        }

        if (this.props.user.id === this.props.post.author.id) { // Voting on own post
            console.error('Voting on your own threads/comments is not allowed.');
            Notifications.Unauthorized();
            return;
        }

        if (direction === this.props.post.userVote)
            direction = 0;

        this.props.submitVote({
            id: this.props.post.id, direction, isThread: this.props.isThread
        });
    }

    render() {
        const p = this.props.post;
        const u = this.props.user;
        const puv = p.userVote;
        const isVertical = this.props.isVertical;

        // --- Colors ---
        let colorUpvote, colorDownvote, colorText;
        colorUpvote = colorDownvote = colorText = 'color-vote';

        if (puv === 1)
            colorUpvote = colorText = 'color-upvote';
        else if (puv === -1)
            colorDownvote = colorText = 'color-downvote';

        // --- Icons ---
        const upvoteIcon = <FA icon={faPlusCircle} size={'lg'} className={colorUpvote} />;
        const downvoteIcon = <FA icon={faMinusCircle} size={'lg'} className={colorDownvote} />;

        // --- Links ---
        const upvoteLinkJsx = u && u.id === p.author.id ?
                null // Hide voting links on your own posts
                :
                isVertical ?
                    // Vertical upvote icon
                    <a href='#' onClick={event => this.handleVoteClick(event, 1)}>
                        <Col xs={12} className='lh-1 p-0 text-center'>
                            {upvoteIcon}
                        </Col>
                    </a>
                    :
                    // Horizontal upvote icon
                    <a href='#' onClick={event => this.handleVoteClick(event, 1)}>
                        {upvoteIcon}
                    </a>;
        const downvoteLinkJsx = u && u.id === p.author.id ?
            null // Hide voting links on your own posts
            :
            isVertical ?
                // Vertical downvote icon
                <a href='#' onClick={event => this.handleVoteClick(event, -1)}>
                    <Col xs={12} className='lh-1 p-0 text-center'>
                        {downvoteIcon}
                    </Col>
                </a>
                :
                // Horizontal downvote icon
                <a href='#' onClick={event => this.handleVoteClick(event, -1)}>
                    {downvoteIcon}
                </a>;


        return (
            isVertical ?
                // Vertical voting component
                <Col xs={2} sm={1} style={{margin: 'auto 0px'}}> {/* margin: '-5px 0 -5px 0' - more compact, but can't vertical align*/}

                    {/* Upvote */}
                    {upvoteLinkJsx}

                    {/* Score */}
                    <Col xs={12} className={`lh-1 p-0 text-center ${colorText}`}
                         style={{fontWeight: 'bold'}}
                    >
                        {p.votesCount}
                    </Col>

                    {/* Downvote */}
                    {downvoteLinkJsx}

                </Col>
            :

                // Horizontal voting component
                <div className='d-inline-block color-vote'>
                    {downvoteLinkJsx}
                    <span className={`font-weight-bold d-inline-block text-center ${colorText}`} style={{minWidth: '2em'}}>
                        {p.votesCount}
                    </span>
                    {upvoteLinkJsx}
                </div>
        );
    }
}

Voting.propTypes = {
    post: PropTypes.object.isRequired, // Thread or comment object
    isVertical: PropTypes.bool.isRequired, // Vertical or horizontal rendering
    isThread: PropTypes.bool.isRequired, // is this component on thread or comment?

    // Redux:
    // isLoggedIn: PropTypes.bool.isRequired,
    // user: PropTypes.object,

    // submitVote: PropTypes.func.isRequired,
}

const mapDispatchToProps = {
    submitVote
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.auth.isLoggedIn,
        user: state.auth.user,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Voting);
