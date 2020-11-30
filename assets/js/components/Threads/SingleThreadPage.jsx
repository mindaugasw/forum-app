import React from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router";
import {Link} from "react-router-dom";
import UrlBuilder from "../../utils/UrlBuilder";
import {getSingleThread, getComments} from "../../redux/threads";
import Loading from "../__old/Loading";
import Paginator from "../common/Paginator";
import Voting from "../__old/Voting";
import CommentForm from "../__old/CommentForm";
import Comment from "../__old/Comment";
import {canUserManagePost} from "../../redux/auth";
import ThreadForm from "../__old/ThreadForm";
import {Button, Card, Col, Container, Row, Spinner} from "react-bootstrap";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import PostFrame from "./PostFrame";
import ConditionalTooltip, {msg_MustBeLoggedIn} from "../common/ConditionalTooltip";
import Utils from "../../utils/Utils";

const mapDispatchToProps = {
    getSingleThread,
    getComments,
}
const mapStateToProps = state => {
    return {
        thread: state.threads.single,
        authLoaded: state.auth.loaded,
        isLoggedIn: state.auth.isLoggedIn,
        user: state.auth.user,
    };
}

class SingleThreadPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            id: parseInt(this.props.match.params.id), // This thread id
            // TODO show error if id is NaN
            // TODO show error on 404 response
            editMode: false,
        }

        this.getListUrl = this.getListUrl.bind(this);
        this.getPaginationListUrl = this.getPaginationListUrl.bind(this);
        this.handlePageNavigation = this.handlePageNavigation.bind(this);

        this.loadThread();
        this.loadComments();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.loadThread();
        this.loadComments();
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
     * Retrieve url with GET params for currently viewed comments list
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
    handlePageNavigation() {
        // Needed in ThreadList but somehow works without it here?
        /*this.setState({
            'refreshComponent': Math.random(),
        });*/
    }

    /*render_comments_list() {
        const t = this.props.thread;
        const c = this.props.thread.comments;

        if (c.loaded !== LoadState.Done) {
            return <div className='text-center mt-5 pt-5'><Spinner animation="border" /></div>;
        } else {
            return c.items.map(comment => {
                return <Comment key={comment.id} comment={comment} thread={t} />
            });
        }
    }*/

    render() {
        /** This thread (wrapper object, not thread item!) */
        const t = this.props.thread;
        /** Thread item or null */
        const ti = t.item || null;
        /** Comments object (not comment items!) */
        const c = this.props.thread.comments;
        /** Comment items array */
        const ci = c.items || null;

        const u = this.props.user;

        // TODO thread 404 page (e.g. threads/900)

        /**
         * Thread title and PostFrame
         */
        function threadJsx() {
            return (
                <>
                    <h3 className='mx-15-md-down'>{ti.title}</h3>
                    <PostFrame.Thread thread={ti} isNewThreadForm={false} />
                </>
            );
        }

        function commentsListJsx() {
            const headerJsx = // Header - Comments headline, new button
                <Row className='justify-content-between mx-0-md-down mb-1'>
                    <Col xs={6} sm='auto' className='pr-0'>
                        <h3>
                            {c.pagination.totalCount !== 0 ? <>Comments ({c.pagination.totalCount})</>
                                : 'There are no comments'}
                        </h3>
                    </Col>
                    <Col xs={6} sm='auto' className='pl-0 text-right'>
                        <ConditionalTooltip
                            placement='left'
                            tooltip={msg_MustBeLoggedIn}
                            tooltipId='create-comment-btn-tooltip'
                            show={u === null}
                            pointerEventsNone={true}
                        >
                            <a href='#new-comment-form'>
                                <Button disabled={u === null}><FA icon={faPlus}/> Add new</Button>
                            </a>
                        </ConditionalTooltip>
                    </Col>
                </Row>;
            const listJsx = c.items.map(ci => { // ci for comment.item
                return (
                    <div key={ci.id}>
                        <PostFrame.Comment comment={ci} parentThread={ti} isNewCommentForm={false} />
                        <br/>
                    </div>
                );
            });

            return (
                <>
                    {headerJsx}
                    {listJsx}
                </>
            );
        }

        const paginatorJsx = c.loaded && c.pagination.totalCount > 0 ?
            <Paginator
                pagination={c.pagination}
                linkGenerator={this.getPaginationListUrl}
                onClick={this.handlePageNavigation}
            />
            : null;

        function newCommentFormJsx() {
            return (
                <>
                    <h3 className='mx-15-md-down' id='new-comment-form'>Add new comment</h3>
                    <PostFrame.Comment comment={null} parentThread={ti} isNewCommentForm={true} />
                </>
            );
        }

        const loaderJsx = <div className='text-center mt-5 pt-5'><Spinner animation='border' /></div>;

        return (
            <Container fluid className='full-width-container-md-down'>

                {t.loaded === LoadState.Done ?
                    <>
                        {Utils.Titles.ThreadView(t.item.title)}
                        {threadJsx()}
                        <br/>


                        {c.loaded === LoadState.Done ?
                            <>
                                {commentsListJsx()}
                                {paginatorJsx}
                                <br/>
                                {newCommentFormJsx()}
                            </>
                            : loaderJsx
                        }
                    </>
                    :
                    <>
                        {Utils.Titles.ThreadView('Topic view')}
                        {loaderJsx}
                    </>
                }

            </Container>
        );
    }
}

SingleThreadPage.propTypes = {
    // Redux state:
    // thread: PropTypes.object.isRequired,
    // authLoaded: PropTypes.bool.isRequired,
    // isLoggedIn: PropTypes.bool.isRequired,

    // Router:
    // match: PropTypes.object.isRequired,
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(SingleThreadPage)
);