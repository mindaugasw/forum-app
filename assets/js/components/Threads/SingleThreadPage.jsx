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
import {PostFrame_Thread} from "./PostFrameVariants";

const mapDispatchToProps = {
    getSingleThread,
    getComments,

    // editThread,
    // deleteThread
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
        /*this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleEditClick = this.handleEditClick.bind(this);
        this.handleCancelEditClick = this.handleCancelEditClick.bind(this);*/

        this.loadThread();
        this.loadComments();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.loadThread();
        this.loadComments();
    }

    /*handleDeleteClick(event) {
        event.preventDefault();

        if (!canUserManagePost(this.props.user, this.props.thread)) {
            console.error('You don\'t have permissions to do that');
            return;
        }

        const u = this.props.user;
        const message = `Delete this thread?${u && u.id !== this.props.thread.author.id ?
        `\n\nWARNING: you are deleting someone else's thread as an admin!` : ``}`
        let answer = confirm(message);

        if (answer)
            this.props.deleteThread({threadId: this.props.thread.id});
    }

    handleEditClick(event) {
        event.preventDefault();
        this.setState({editMode: true});
    }

    handleCancelEditClick(event) {
        event.preventDefault();
        this.setState({editMode: false});
    }*/

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

    render() {
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

    render_new() {
        /** This thread (not thread item!) */
        const t = this.props.thread;
        /** Thread item or null */
        const ti = t.item || null;
        /** Comments object from state */
        const c = this.props.thread.comments;
        const ci = c.items || null;

        // console.log(ci);

        // TODO thread 404 page (e.g. threads/900)

        // --- Comments ---
        let commentsListJsx = this.render_comments_list();
        /*let commentsListJsx;
        if (c.loaded !== LoadState.Done) {
            commentsListJsx = <Loading/>;
        } else {
            console.log('ASDccc');
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
                    <ul>{listJsx}</ul>
                    {paginator}
                </div>;
        }*/




        /*const commentsListJsx = c.map(comment => {
            return <Comment key={comment.id} thread={t} comment={comment} />;
        });*/


        return (
            <div>
                {/* --- Thread --- */}
                <h2>Thread view</h2>
                {t.loaded === LoadState.Done ?
                    // <PostFrame post={t.item} formMode={false} />
                    // <PostFrame.Thread thread={ti} isNewThreadForm={false} />
                    <PostFrame_Thread thread={ti} isNewThreadForm={false} />
                : null}
                <br/><br/>


                {/* --- Comments, Create new button --- */}
                <h2 style={{display: "inline-block"}}>Comments (420)</h2>
                <Link to={UrlBuilder.Threads.Create()}>
                    <Button style={{float: "right"}}><FA icon={faPlus}/> Add new</Button>
                </Link>


                <Container fluid className='thread-list-container'>

                    {commentsListJsx}

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


                </Container>
                <br/>
                {/*{paginator}*/}
            </div>
        );
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
}

SingleThreadPage.propTypes = {
    // thread: PropTypes.object.isRequired,
    // authLoaded: PropTypes.bool.isRequired,
    // isLoggedIn: PropTypes.bool.isRequired,
    // match: PropTypes.object.isRequired,
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(SingleThreadPage)
);