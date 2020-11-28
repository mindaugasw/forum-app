import React, {Component} from 'react';
import PropTypes from "prop-types";
import {connect} from 'react-redux';
import {submitVote} from "../../redux/threads";
import {Col} from "react-bootstrap";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {faMinusCircle, faPlusCircle} from "@fortawesome/free-solid-svg-icons";

const mapDispatchToProps = {
    submitVote
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.auth.isLoggedIn,
        user: state.auth.user,
    };
}

// TODO add Voting variants
class VotingGeneral extends Component {
    constructor(props) {
        super(props);

        this.handleVoteClick = this.handleVoteClick.bind(this);
    }

    handleVoteClick(event, direction) {
        event.preventDefault();

        // TODO render appropriately
        if (!this.props.isLoggedIn) {
            console.error('You need to be logged in to do that.');
            return;
        }

        // TODO render appropriately
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
        const p = this.props.post;
        const u = this.props.user;
        const puv = p.userVote;
        const isVertical = this.props.isVertical;

        // TODO add notification if not logged in voting

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
                    // Vertical icon
                    <a href='#' onClick={event => this.handleVoteClick(event, 1)}>
                        <Col xs={12} className='lh-1 p-0 text-center'>
                            {upvoteIcon}
                        </Col>
                    </a>
                    :
                    // Horizontal icon
                    <a href='#' onClick={event => this.handleVoteClick(event, 1)}>
                        {upvoteIcon}
                    </a>;
        const downvoteLinkJsx = u && u.id === p.author.id ?
            null // Hide voting links on your own posts
            :
            isVertical ?
                // Vertical icon
                <a href='#' onClick={event => this.handleVoteClick(event, -1)}>
                    <Col xs={12} className='lh-1 p-0 text-center'>
                        {downvoteIcon}
                    </Col>
                </a>
                :
                // Horizontal icon
                <a href='#' onClick={event => this.handleVoteClick(event, -1)}>
                    {downvoteIcon}
                </a>;


        return (
            isVertical ?
                // Vertical vote
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
                    {/*{u && u.id === p.author.id ? null :
                        <a href='#' onClick={event => this.handleVoteClick(event, -1)}>
                            <Col xs={12} className='lh-1 p-0 text-center'>
                                {downvoteIcon}
                            </Col>
                        </a>
                    }*/}
                    {downvoteLinkJsx}

                </Col>
            :
                // Horizontal vote




                <div className='d-inline-block color-vote'>
                    {/*<FA icon={faMinusCircle} size={'lg'} />*/}
                    {downvoteLinkJsx}
                    {/*{' '}<b>1234</b>{' '}*/}
                    <span className={`font-weight-bold d-inline-block text-center ${colorText}`} style={{minWidth: '2em'}}>
                        {p.votesCount}
                    </span>
                    {/*<FA icon={faPlusCircle} size={'lg'} />*/}
                    {upvoteLinkJsx}
                </div>
            // </div>
        );
    }
}

VotingGeneral.propTypes = {
    // From props:
    post: PropTypes.object.isRequired, // Thread or comment object
    isVertical: PropTypes.bool.isRequired, // Vertical or horizontal rendering
    isThread: PropTypes.bool.isRequired, // is this component on thread or comment? /* TODO is this prop needed? */

    // Redux state:
    // isLoggedIn: PropTypes.bool.isRequired,
    // user: PropTypes.object,

    // Redux actions:
    // submitVote: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(VotingGeneral);
