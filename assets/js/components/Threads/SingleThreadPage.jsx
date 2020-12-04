import React from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router";
import UrlBuilder, {ListGetParams} from "../../utils/UrlBuilder";
import {getSingleThread, getComments} from "../../redux/threads";
import Paginator from "../common/Paginator";
import {Button, Col, Container, Row} from "react-bootstrap";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import PostFrame from "./PostFrame";
import ConditionalTooltip, {msg_MustBeLoggedIn} from "../common/ConditionalTooltip";
import Utils from "../../utils/Utils";
import Page404 from "../common/Page404";
import Loader from "../common/Loader";

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

        this.defaultGETParams = new ListGetParams(1, 10, 'id', 'ASC');

        this.state = {
            // id: parseInt(this.props.match.params.id), // This thread id
            id: this.props.match.params.id, // This thread id
            editMode: false,
            notFound: false,
        };

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
                this.props.getSingleThread(targetId).then(action => {
                    if (action.error && action.error.status === 404)
                        this.setState({notFound: true});
                });
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
                this.props.getComments(targetUrl).then(action => {
                    if (action.payload.error && action.payload.error.status === 404)
                        this.setState({notFound: true});
                });
            }
        }
    }

    /**
     * Retrieve url with GET params for currently viewed comments list
     * @param page
     * @returns {string}
     */
    getListUrl(page = 1) {
        const defaults = {...this.defaultGETParams, page: page};
        return this.state.id + '/comments/' +
            UrlBuilder.ReadParamsWithDefaults(defaults).GetUrl();
    }

    /**
     * Retrieve url with GET params for specific page, to be used in pagination links
     */
    getPaginationListUrl(options) {
        return `/threads/${this.state.id}/comments/` +
            UrlBuilder.ReadParamsWithReplace(
                options,
                this.defaultGETParams
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
        /** This thread (wrapper object, not thread item!) */
        const t = this.props.thread;
        /** Thread item or null */
        const ti = t.item || null;
        /** Comments object (not comment items!) */
        const c = this.props.thread.comments;
        /** Comment items array */
        const ci = c.items || null;

        const u = this.props.user;

        if (this.state.notFound)
            return <Page404 />


        const perPageArr = [10, 20, 40, 100];
        let orderByArr = [
            {text: 'Oldest to newest', orderby: 'id', orderdir: 'ASC'},
            {text: 'Newest to oldest', orderby: 'id', orderdir: 'DESC'},
            {text: 'Most upvoted', orderby: 'votesCount', orderdir: 'DESC'},
        ];
        // Mark selected item for Order by
        const currentParams = UrlBuilder.ReadParamsWithDefaults(this.defaultGETParams);
        const selectedIndex = orderByArr.findIndex(el => el.orderby === currentParams.orderby && el.orderdir === currentParams.orderdir);
        if (selectedIndex !== -1)
            orderByArr[selectedIndex] = {...orderByArr[selectedIndex], selected: true};

        const paginatorJsx = c.loaded && c.pagination.totalCount > 0 ?
            <Paginator
                pagination={c.pagination}
                linkGenerator={this.getPaginationListUrl}
                onClick={this.handlePageNavigation}
                perPage={perPageArr}
                orderBy={orderByArr}
            />
            : null;

        // const loaderJsx = <div className='text-center mt-5 pt-5'><Spinner animation='border' /></div>;

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
                            <a href='#new-comment-form' onClick={(event) => { event.preventDefault(); document.getElementById('content').focus(); }}>
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
                    {paginatorJsx}
                </>
            );
        }

        function newCommentFormJsx() {
            return (
                <>
                    <h3 className='mx-15-md-down' id='new-comment-form'>Add new comment</h3>
                    <PostFrame.Comment comment={null} parentThread={ti} isNewCommentForm={true} />
                </>
            );
        }


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
                                <br/>
                                {newCommentFormJsx()}
                            </>
                            : <Loader />
                        }
                    </>
                    :
                    <>
                        {Utils.Titles.ThreadView('Topic view')}
                        <Loader />
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