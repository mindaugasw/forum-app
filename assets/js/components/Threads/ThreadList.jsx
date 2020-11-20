import React from 'react';
import { connect } from 'react-redux';
import { getThreads } from "../../redux/threads";
import Loading from "../Loading";
import {Link} from "react-router-dom";
import Paginator from "../Paginator";
import UrlBuilder from "../../utils/UrlBuilder";
import Voting from "./Voting";
import {Row, Button, Card, Col, Container} from "react-bootstrap";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {
    faArrowAltCircleDown,
    faArrowAltCircleUp,
    faCaretDown, faChevronDown,
    faChevronUp,
    faPlus
} from "@fortawesome/free-solid-svg-icons";
import ThreadListItem from "./ThreadListItem";

const mapDispatchToProps = {
    getThreads
}

const mapStateToProps = state => {
    return {
        threads: state.threads.list,
        authLoaded: state.auth.loaded,
        isLoggedIn: state.auth.isLoggedIn,
    };
};

class ThreadList extends React.Component {
    constructor(props) {
        super(props);

        this.loadThreadsList();

        this.getListUrl = this.getListUrl.bind(this);
        this.getPaginationListUrl = this.getPaginationListUrl.bind(this);
        this.handlePageNavigation = this.handlePageNavigation.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.loadThreadsList();
    }

    /**
     * Checks if currently loaded data matches needed data for this view. If not, loads needed data.
     */
    loadThreadsList() {
        const t = this.props.threads;
        const targetUrl = this.getListUrl();

        // If auth is not loaded, wait for it
        // (so that loaded thread list would have current user's voting info)
        if (this.props.authLoaded) {

            // If target url matches and loading state is any other than 'NotRequested', skip data request.
            // In all other cases request updated data
            if (t.url !== targetUrl || t.loaded === LoadState.NotRequested) { // url same
                this.props.getThreads(targetUrl);
            }
        }
    }

    /**
     * Retrieve url with GET params for currently viewed list
     * @param page
     * @returns {string}
     */
    getListUrl(page = 1) {
        return UrlBuilder.ReadParamsWithDefaults({
                page: page, perpage: 20, orderby: 'id', orderdir: 'DESC'}).GetUrl();
    }

    /**
     * Retrieve url with GET params for specific page, to be used in pagination links
     */
    getPaginationListUrl(page) {
        return UrlBuilder.ReadParamsWithReplace(
                {page: page},
                {perpage: 20, orderby: 'id', orderdir: 'DESC'}).GetUrl();
    }

    /**
     * Used from child paginator component, on navigation click to any other page
     */
    handlePageNavigation() {
        // Needed to force refresh component. Link click by default only sets GET params,
        // which do not force components update
        this.setState({
            'refreshComponent': Math.random(),
        });
    }

    render() {
        if (this.props.threads.loaded !== LoadState.Done) {
            return <Loading />
        }

        // OLD V
        /*const list = this.props.threads.items.map(t => {
            const createdAt = new Date(t.createdAt).formatDefault();

            return (
                <li key={t.id}>
                    <Link to={`/threads/${t.id}`}>
                        {t.id}: {t.title}
                    </Link><br/>
                    By <a href="#">{t.author.username}</a> @ {createdAt}
                    . {t.commentsCount} comments.
                    {' '}
                    {/!*Vote: {t.userVote === 1 ? '🔼' : t.userVote === -1 ? '🔻' : '-'}*!/}
                    <Voting post={t} isThread={true} />
                </li>
            );
        });*/
        // OLD ^

        const threadListItems = this.props.threads.items.map(t =>
            <ThreadListItem key={t.id} thread={t} />
        );

        const paginator = <Paginator pagination={this.props.threads.pagination}
                                     linkGenerator={this.getPaginationListUrl}
                                     onClick={this.handlePageNavigation} />

        return (
            <div>
                {/* --- Title, Create new button --- */}
                <h2 style={{display: "inline-block"}}>Topics list</h2>
                <Link to={UrlBuilder.Threads.Create()}>
                    <Button style={{float: "right"}}><FA icon={faPlus}/> Create new</Button>
                </Link>

                <Container fluid className='thread-list-container'> {/*className="container-fluid mt-100"*/}
                    <Card>
                        {/* -- Card header -- */}
                        <Card.Header className='py-2'> {/*className="card-header pl-0 pr-0"*/}
                            <Container fluid className='p-0'>
                                <Row className='no-gutters'>
                                    <Col>
                                        Title
                                    </Col>
                                    <Col sm={2} className={'d-none d-sm-block text-center'}> {/*Visible on sm and up*/}
                                        Replies
                                    </Col>
                                    <Col xs={2} sm={1} className='text-center'>
                                        Vote
                                    </Col>
                                </Row>
                            </Container>
                        </Card.Header>

                        {/* --- Items list --- */}
                        {threadListItems}

                    </Card>
                </Container>

                <br/>

                {/*
                {/* --- Threads list --- *}
                {/*---------------------------------------------------------------------*}
                {/* .thread-list-container has custom css in app.scss *}
                <Container fluid className='thread-list-container'> {/*className="container-fluid mt-100"*}
                    <Card>
                        {/* -- Card header -- *}
                        <Card.Header className='py-2'> {/*className="card-header pl-0 pr-0"*}
                            <Container fluid className='p-0'>
                                <Row className='no-gutters'>
                                    <Col>
                                        Title
                                    </Col>
                                    <Col sm={2} className={'d-none d-sm-block text-center'}> {/*Visible on sm and up*}
                                        Replies
                                    </Col>
                                    <Col xs={2} sm={1} className='text-center'>
                                        Vote
                                    </Col>
                                </Row>
                            </Container>
                            {/*<div className="row no-gutters w-100 align-items-center">
                                <div className="col ml-3">Title</div>
                                <div className="col-4 text-muted">
                                    <div className="row no-gutters align-items-center">
                                        <div className="col-4">Replies</div>
                                        <div className="col-8">Vote</div>
                                    </div>
                                </div>
                            </div>*}
                        </Card.Header>

                        {/* -- Item #0 -- *}
                        <Card.Body className='py-2'>
                            <Container fluid className='p-0'>
                                <Row className='no-gutters'>
                                    <Col>
                                        {/* - Thread title - *}
                                        <Link to={UrlBuilder.Threads.Single(1)} style={{
                                            overflow: 'hidden',         // Ellipsis overflow on 2nd line
                                            textOverflow: 'ellipsis',   // https://stackoverflow.com/a/13924997/4110469
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                        }} >
                                            How can i change the username?
                                            {/*How can i change the username? How can i change the username? How can i change the username? How can i change the username? How can i change the username? How can i change the username? How can i change the username? How can*}
                                        </Link>

                                        {/* - CreatedAt, author -*}
                                        <div className='text-muted small' >Started 25 days ago &nbsp;·&nbsp; <Link to={UrlBuilder.Users.Single(1)} className='text-muted'>Neon Mandela</Link></div>
                                    </Col>

                                    {/* - Replies - *}
                                    <Col sm={2} className={'d-none d-sm-block text-center m-auto'}>
                                        42
                                    </Col>

                                    {/* - Voting - *}
                                    <Col xs={2} sm={1} className='' style={{margin: '-5px 0'}}>
                                        <Col xs={12} className='lh-1 p-0 text-center bsg'>
                                            <FA icon={faChevronUp} size={'lg'} className='color-upvote bsr' />
                                        </Col>
                                        <Col xs={12} className='lh-1 p-0 text-center bsg color-upvote' style={{fontWeight: 'bold'}}>
                                            42
                                        </Col>
                                        <Col xs={12} className='lh-1 p-0 text-center bsg'>
                                            <FA icon={faChevronDown} size={'lg'} className='bsr' />
                                        </Col>
                                    </Col>
                                </Row>
                            </Container>
                        </Card.Body>
                        <hr className='m-0'/>


                        {/* -- Item #0.1 -- *}
                        <Card.Body className='py-2'>
                            <Container fluid className='p-0'>
                                <Row className='no-gutters'>
                                    <Col>
                                        {/* - Thread title - *}
                                        <Link to={UrlBuilder.Threads.Single(1)} style={{
                                            overflow: 'hidden',         // Ellipsis overflow on 2nd line
                                            textOverflow: 'ellipsis',   // https://stackoverflow.com/a/13924997/4110469
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                        }} >
                                            How can i change the username?
                                            {/*How can i change the username? How can i change the username? How can i change the username? How can i change the username? How can i change the username? How can i change the username? How can i change the username? How can*}
                                        </Link>

                                        {/* - CreatedAt, author -*}
                                        <div className='text-muted small' >Started 25 days ago &nbsp;·&nbsp; <Link to={UrlBuilder.Users.Single(1)} className='text-muted'>Neon Mandela</Link></div>
                                    </Col>

                                    {/* - Replies - *}
                                    <Col sm={2} className={'d-none d-sm-block text-center m-auto'}>
                                        42
                                    </Col>

                                    {/* - Voting - *}
                                    <Col xs={2} sm={1} className='' style={{margin: '-5px 0'}}>
                                        <Col xs={12} className='lh-1 p-0 text-center bsg'>
                                            <FA icon={faChevronUp} size={'lg'} className='color-upvote bsr' />
                                        </Col>
                                        <Col xs={12} className='lh-1 p-0 text-center bsg color-upvote' style={{fontWeight: 'bold'}}>
                                            42
                                        </Col>
                                        <Col xs={12} className='lh-1 p-0 text-center bsg'>
                                            <FA icon={faChevronDown} size={'lg'} className='bsr' />
                                        </Col>
                                    </Col>
                                </Row>
                            </Container>
                        </Card.Body>
                        <hr className='m-0'/>

                        {/* -- Item #1 -- *}
                        <div className="card-body py-3">
                            <div className="row no-gutters align-items-center">
                                <div className="col"><a href="#" className="text-big" data-abc="true">How
                                    can i change the username?</a>
                                    <div className="text-muted small mt-1">Started 25 days ago &nbsp;·&nbsp; <a
                                        href="#" className="text-muted" data-abc="true">Neon
                                        Mandela</a></div>
                                </div>
                                <div className="d-none d-md-block col-4">
                                    <div className="row no-gutters align-items-center">
                                        <div className="col-4">12</div>
                                        <div className="media col-8 align-items-center"><img
                                            src="https://res.cloudinary.com/dxfq3iotg/image/upload/v1574583246/AAA/2.jpg"
                                            alt="" className="d-block ui-w-30 rounded-circle"/>
                                            <div className="media-body flex-truncate ml-2">
                                                <div className="line-height-1 text-truncate">1 day ago</div>
                                                <a href="#" className="text-muted small text-truncate"
                                                   data-abc="true">by Tim cook</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr className="m-0"/>

                        {/* -- Item #2 -- *}
                        <div className="card-body py-3">
                            <div className="row no-gutters align-items-center">
                                <div className="col"><a href="#" className="text-big"
                                                        data-abc="true">How to change the theme to dark mode?</a>
                                    <div className="text-muted small mt-1">Started 5 days ago &nbsp;·&nbsp; <a
                                        href="#" className="text-muted" data-abc="true">Allize
                                        Rome</a></div>
                                </div>
                                <div className="d-none d-md-block col-4">
                                    <div className="row no-gutters align-items-center">
                                        <div className="col-4">43</div>
                                        <div className="media col-8 align-items-center"><img
                                            src="https://res.cloudinary.com/dxfq3iotg/image/upload/v1574583319/AAA/3.jpg"
                                            alt="" className="d-block ui-w-30 rounded-circle"/>
                                            <div className="media-body flex-truncate ml-2">
                                                <div className="line-height-1 text-truncate">1 day ago</div>
                                                <a href="#"
                                                   className="text-muted small text-truncate" data-abc="true">by
                                                    Steve smith</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr className="m-0"/>

                        {/*<div className="card-body py-3">
                            <div className="row no-gutters align-items-center">
                                <div className="col"><a href="javascript:void(0)" className="text-big"
                                                        data-abc="true">Is it possible to get the refund of the
                                    product i purchased today?</a>
                                    <div className="text-muted small mt-1">Started 21 days ago &nbsp;·&nbsp; <a
                                        href="javascript:void(0)" className="text-muted" data-abc="true">Kane
                                        William</a></div>
                                </div>
                                <div className="d-none d-md-block col-4">
                                    <div className="row no-gutters align-items-center">
                                        <div className="col-4">42</div>
                                        <div className="media col-8 align-items-center"><img
                                            src="https://res.cloudinary.com/dxfq3iotg/image/upload/v1574583336/AAA/4.jpg"
                                            alt="" className="d-block ui-w-30 rounded-circle"/>
                                            <div className="media-body flex-truncate ml-2">
                                                <div className="line-height-1 text-truncate">2 day ago</div>
                                                <a href="javascript:void(0)"
                                                   className="text-muted small text-truncate" data-abc="true">by
                                                    Brethwett sonm</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr className="m-0"/>

                        <div className="card-body py-3">
                            <div className="row no-gutters align-items-center">
                                <div className="col"><a href="javascript:void(0)" className="text-big"
                                                        data-abc="true">Do you have android application for
                                    this tool?</a>
                                    <div className="text-muted small mt-1">Started 56 days ago &nbsp;·&nbsp;
                                        <a href="javascript:void(0)" className="text-muted" data-abc="true">Glen
                                            Maxwell</a></div>
                                </div>
                                <div className="d-none d-md-block col-4">
                                    <div className="row no-gutters align-items-center">
                                        <div className="col-4">632</div>
                                        <div className="media col-8 align-items-center"><img
                                            src="https://res.cloudinary.com/dxfq3iotg/image/upload/v1574583246/AAA/2.jpg"
                                            alt="" className="d-block ui-w-30 rounded-circle"/>
                                            <div className="media-body flex-truncate ml-2">
                                                <div className="line-height-1 text-truncate">11 day ago
                                                </div>
                                                <a href="javascript:void(0)"
                                                   className="text-muted small text-truncate"
                                                   data-abc="true">by Neil patels</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr className="m-0"/>

                        <div className="card-body py-3">
                            <div className="row no-gutters align-items-center">
                                <div className="col"><a href="javascript:void(0)" className="text-big"
                                                        data-abc="true">How can i transfer my fund to my
                                    friend</a>
                                    <div className="text-muted small mt-1">Started 25 days
                                        ago &nbsp;·&nbsp; <a href="javascript:void(0)"
                                                             className="text-muted" data-abc="true">Marry
                                            Tom</a></div>
                                </div>
                                <div className="d-none d-md-block col-4">
                                    <div className="row no-gutters align-items-center">
                                        <div className="col-4">53</div>
                                        <div className="media col-8 align-items-center"><img
                                            src="https://res.cloudinary.com/dxfq3iotg/image/upload/v1574583336/AAA/4.jpg"
                                            alt="" className="d-block ui-w-30 rounded-circle"/>
                                            <div className="media-body flex-truncate ml-2">
                                                <div className="line-height-1 text-truncate">1 day ago
                                                </div>
                                                <a href="javascript:void(0)"
                                                   className="text-muted small text-truncate"
                                                   data-abc="true">by Tibok tom</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr className="m-0"/>

                        <div className="card-body py-3">
                                            <div className="row no-gutters align-items-center">
                                                <div className="col"><a href="javascript:void(0)"
                                                                        className="text-big" data-abc="true">How can
                                                    i delete my account?</a>
                                                    <div className="text-muted small mt-1">Started 25 days
                                                        ago &nbsp;·&nbsp; <a href="javascript:void(0)"
                                                                             className="text-muted" data-abc="true">Bob
                                                            bulmer</a></div>
                                                </div>
                                                <div className="d-none d-md-block col-4">
                                                    <div className="row no-gutters align-items-center">
                                                        <div className="col-4">12</div>
                                                        <div className="media col-8 align-items-center"><img
                                                            src="https://res.cloudinary.com/dxfq3iotg/image/upload/v1574583246/AAA/2.jpg"
                                                            alt="" className="d-block ui-w-30 rounded-circle"/>
                                                            <div className="media-body flex-truncate ml-2">
                                                                <div className="line-height-1 text-truncate">1 day
                                                                    ago
                                                                </div>
                                                                <a href="javascript:void(0)"
                                                                   className="text-muted small text-truncate"
                                                                   data-abc="true">by Ross taylor</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>*}
                    {/*</Card>
                </Container>*/}


                {/*{paginator}*/}
                {/*<ul>
                    {list}
                </ul>*/}
                {paginator}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ThreadList);