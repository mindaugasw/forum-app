import React, {Component} from 'react';
import {connect} from 'react-redux';
import {submitVote} from "../../redux/threads";
import PropTypes from "prop-types";
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

class NewVoting extends Component {
    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event, direction) {
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

        // TODO add modal window if not logged in voting

        return (
            <Col xs={2} sm={1} style={{margin: 'auto 0px'}}> {/* margin: '-5px 0 -5px 0' - more compact, but can't vertical align*/}

                {/* Upvote */}
                {u && u.id === p.author.id ? null :
                    <a href='#' onClick={event => this.handleClick(event, 1)}>
                        <Col xs={12} className='lh-1 p-0 text-center'>
                            <FA icon={faPlusCircle} size={'lg'} className={puv === 1 ? 'color-upvote' : 'color-vote'} />
                        </Col>
                    </a>
                }

                {/* Score */}
                <Col xs={12} className={`lh-1 p-0 text-center ${
                     puv === 1 ? 'color-upvote' : puv === 0 ? 'color-vote' : 'color-downvote'}`}
                     style={{fontWeight: 'bold'}}
                >
                    {p.votesCount}
                </Col>

                {/* Downvote */}
                {u && u.id === p.author.id ? null :
                    <a href='#' onClick={event => this.handleClick(event, -1)}>
                        <Col xs={12} className='lh-1 p-0 text-center'>
                            <FA icon={faMinusCircle} size={'lg'} className={puv === -1 ? 'color-downvote' : 'color-vote'} />
                        </Col>
                    </a>
                }

            </Col>
        );
    }
}

NewVoting.propTypes = {
    // From props:
    post: PropTypes.object.isRequired, // Thread or comment object
    isThread: PropTypes.bool.isRequired, // is this thread or comment vote? /* TODO is this prop needed? */

    // Automatically passed Redux props:
    // Redux state:
    // isLoggedIn: PropTypes.bool.isRequired,
    // user: PropTypes.object,

    // Redux actions:
    // submitVote: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(NewVoting);