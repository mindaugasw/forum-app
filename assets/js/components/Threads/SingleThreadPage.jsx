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
import {PostFrame_Comment, PostFrame_Comment_connected, PostFrame_Thread} from "./PostFrameVariants";
import ConditionalTooltip from "../common/ConditionalTooltip";

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

    render_comments_list() {
        const t = this.props.thread;
        const c = this.props.thread.comments;

        if (c.loaded !== LoadState.Done) {
            return <div className='text-center mt-5 pt-5'><Spinner animation="border" /></div>;
        } else {
            return c.items.map(comment => {
                return <Comment key={comment.id} comment={comment} thread={t} />
            });
        }
    }



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
                t.loaded === LoadState.Done ?
                    <>
                        <h3 className='mx-15-md-down'>{ti.title}</h3>
                        {/*<h3 className='margins-md-x15'>{ti.title}</h3>*/}
                        <PostFrame.Thread thread={ti} isNewThreadForm={false} />
                    </>
                : <div className='text-center my-5 pb-5'><Spinner animation='border' /></div>
            );
        }

        function commentsListJsx() {
            // const t = this.props.thread; // thread wrapper object
            // const c = this.props.thread.comments; // actual comment objects are in c.items

            if (c.loaded !== LoadState.Done) {
                return <div className='text-center mt-5 pt-5'><Spinner animation="border" /></div>;
            } else {
                const headerJsx = // Header - Comments headline, new button
                    <Row className='justify-content-between mx-0-md-down'>
                        <Col xs={6} sm='auto' className='pr-0'>
                            <h2>
                                {c.items.length !== 0 ? <>Comments ({c.pagination.totalCount})</>
                                    : 'There are no comments'}
                            </h2>
                        </Col>
                        <Col xs={6} sm='auto' className='pl-0 text-right'>
                            <ConditionalTooltip
                                placement='left'
                                tooltip='You must be logged in to do that.'
                                tooltipId='create-comment-btn-tooltip'
                                show={u === null}
                                pointerEventsNone={true}
                            >
                                <Link to={UrlBuilder.Threads.Create()}>
                                    <Button disabled={u === null}><FA icon={faPlus}/> Add new</Button>
                                </Link>
                            </ConditionalTooltip>
                        </Col>
                    </Row>;
                const listJsx = c.items.map(ci => { // ci for comment.item
                    return (
                        <div key={ci.id}>
                            {/*<PostFrame post={ci} isThread={false} formMode={false} />*/}
                            <PostFrame_Comment_connected comment={ci} isNewCommentForm={false} />
                            <br/>
                        </div>
                    );
                });

                return (
                    <>
                        {headerJsx}
                        {/*<Container fluid className='thread-list-container'>*/}
                        {listJsx}
                        {/*</Container>*/}
                    </>
                );
            }
        }

        // --- Comments ---
        // let commentsListJsx = this.render_comments_list();
        // let commentsListJsx = this.commentsListJsx();


        return (
            <Container fluid className='full-width-container-md-down' > {/*style={{width: 'auto', margin: '0 -15px', padding: '0px'}}*/}
                {/* --- Thread --- */}
                {/*{t.loaded === LoadState.Done ?
                    <>
                        <h3 className='mx-15-md-down'>{ti.title}</h3>
                        <PostFrame.Thread thread={ti} isNewThreadForm={false} />
                    </>
                : null}*/}
                {threadJsx()}
                <br/>


                {/* --- Comments, Create new button --- */}
                {/*<h2 style={{display: "inline-block"}}>Comments (420)</h2>
                <Link to={UrlBuilder.Threads.Create()}>
                    <Button style={{float: "right"}}><FA icon={faPlus}/> Add new</Button>
                </Link>*/}


                {/*<Container fluid className='thread-list-container'>*/}

                {commentsListJsx()}

                    {/*<Card>

                        /!* -- Card header -- *
                        <Card.Header className='py-2'>
                            <Container fluid className='p-0'>
                                <Row className='no-gutters'>
                                    <Col>
                                        Title
                                    </Col>
                                    <Col sm={2} className={'d-none d-sm-block text-center'}> {*Visible on sm and up*}
                                        Replies
                                    </Col>
                                    <Col xs={2} sm={1} className='text-center'>
                                        Vote
                                    </Col>
                                </Row>
                            </Container>
                        </Card.Header>

                    </Card>*/}


                {/*</Container>*/}
                <br/>
                {/*{paginator}*/}
                {ci && ci.length > 0 ?
                    <Paginator
                        pagination={c.pagination}
                        linkGenerator={this.getPaginationListUrl}
                        onClick={this.handlePageNavigation}
                    />
                : null}
            </Container>
        );
    }

    render_old() {
        return this.render_new();

        const t = this.props.thread;
        const ti = t.item || null;
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
                <div className='bsr'>
                    <h3>Comments (total {t.item.commentsCount})</h3>
                    {/*{paginator}*/}
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