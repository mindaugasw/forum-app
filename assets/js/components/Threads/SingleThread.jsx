import React from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router";
import {Link} from "react-router-dom";
import UrlBuilder from "../../utils/UrlBuilder";
import {getSingleThread, getComments} from "../../redux/threads";
import {editThread, deleteThread} from "../../redux/postsCRUD";
import PropTypes from "prop-types";
import Loading from "../Loading";
import Paginator from "../Paginator";
import Voting from "./Voting";
import CommentForm from "./CommentForm";
import Comment from "./Comment";
import {canUserManagePost} from "../../redux/auth";
import ThreadForm from "./ThreadForm";

const mapDispatchToProps = {
    getSingleThread,
    getComments,

    editThread,
    deleteThread
}
const mapStateToProps = state => {
    return {
        thread: state.threads.single,
        authLoaded: state.auth.loaded,
        isLoggedIn: state.auth.isLoggedIn,
        user: state.auth.user,
    };
}

class SingleThread extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            id: parseInt(this.props.match.params.id), // This thread id
            // TODO show error if id is NaN
            editMode: false,
        }

        this.getListUrl = this.getListUrl.bind(this);
        this.getPaginationListUrl = this.getPaginationListUrl.bind(this);
        this.handlePageNavigation = this.handlePageNavigation.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleEditClick = this.handleEditClick.bind(this);
        this.handleCancelEditClick = this.handleCancelEditClick.bind(this);

        this.loadThread();
        this.loadComments();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.loadThread();
        this.loadComments();
    }

    handleDeleteClick(event) {
        event.preventDefault();

        if (!canUserManagePost(this.props.user, this.props.thread)) {
            console.error('You don\'t have permissions to do that');
            return;
        }

        this.props.deleteThread({threadId: this.props.thread.id});
    }

    handleEditClick(event) {
        event.preventDefault();
        this.setState({editMode: true});
    }

    handleCancelEditClick(event) {
        event.preventDefault();
        this.setState({editMode: false});
    }

    /**
     * Checks if currently loaded data matches needed data for this view. If not, loads needed data.
     */
    loadThread() {
        const t = this.props.thread;
        const targetId = this.state.id;

        if (this.props.authLoaded) {
            if (t.id !== targetId || t.loaded === LoadState.NotRequested) {
                this.props.getSingleThread(targetId);
            }
        }
    }

    /**
     * Checks if currently loaded data matches needed data for this view. If not, loads needed data.
     */
    loadComments() {
        const c = this.props.thread.comments;
        const targetUrl = this.getListUrl();

        if (this.props.authLoaded) {
            if (c.url !== targetUrl || c.loaded === LoadState.NotRequested) {
                this.props.getComments(targetUrl);
            }
        }
    }

    /**
     * Retrieve url with GET params for currently viewed coments list
     * @param page
     * @returns {string}
     */
    getListUrl(page = 1) {
        return this.state.id + '/comments/' +
            UrlBuilder.ReadParamsWithDefaults({
                page: page, perpage: 10, orderby: 'id', orderdir: 'ASC'}).GetUrl();
    }

    /**
     * Retrieve url with GET params for specific page, to be used in pagination links
     */
    getPaginationListUrl(page) {
        return `/threads/${this.state.id}/comments/` +
            UrlBuilder.ReadParamsWithReplace(
                {page: page},
                {perpage: 10, orderby: 'id', orderdir: 'ASC'}
            ).GetUrl();
    }

    /**
     * Used from child paginator component, on navigation click to any other page
     */
    handlePageNavigation() {}

    render() {
        const t = this.props.thread;
        const c = this.props.thread.comments;

        // --- Comments ---
        let commentsListJsx;
        if (c.loaded !== LoadState.Done) {
            commentsListJsx = <Loading/>;
        } else {
            let listJsx = c.items.map(ci => { // ci for comment item
                return (
                    <Comment key={ci.id} comment={ci} thread={t.item} />
                );
            });

            const paginator = <Paginator pagination={c.pagination}
                                         linkGenerator={this.getPaginationListUrl}
                                         onClick={this.handlePageNavigation} />

            commentsListJsx =
                <div>
                    <h3>Comments (total {t.item.commentsCount})</h3>
                    {paginator}
                    <ul>{listJsx}</ul>
                    {paginator}
                </div>;
        }


        // --- Thread ---
        let threadJsx;
        let threadContentJsx;
        if (t.loaded !== LoadState.Done) {
            threadJsx = <Loading/>;
        } else {
            if (this.state.editMode) {
                threadContentJsx = <ThreadForm editMode={true} thread={t.item} cancelCallback={this.handleCancelEditClick} />
            } else {
                let editDeleteJsx = null;
                if (canUserManagePost(this.props.user, t.item)) {
                    editDeleteJsx =
                        <span>
                        <a href="#" onClick={this.handleEditClick}>Edit</a>,{' '}
                            <a href="#" onClick={this.handleDeleteClick}>Delete</a>
                    </span>;
                }

                threadContentJsx =
                    <div>
                        <h3>{t.item.title}</h3>
                        #{t.id} by {t.item.author.username} at {t.item.createdAt},{' '}
                        <Voting post={t.item} isThread={true} />, {editDeleteJsx}
                        <br/>
                        {t.item.content}
                    </div>;
            }

            threadJsx =
                <div>
                    {threadContentJsx}
                    {commentsListJsx}
                    <CommentForm editMode={false} threadId={t.item.id} />
                </div>;
        }

        return (
            <div>
                <Link to='/threads'>Back - threads index</Link><br/>
                {threadJsx}
            </div>
        );
    }
}

SingleThread.propTypes = {
    // thread: PropTypes.object.isRequired,
    // authLoaded: PropTypes.bool.isRequired,
    // isLoggedIn: PropTypes.bool.isRequired,
    // match: PropTypes.object.isRequired,
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(SingleThread)
);