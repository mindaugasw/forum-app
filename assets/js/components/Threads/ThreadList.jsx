import React from 'react';
import { connect } from 'react-redux';
import { getThreads } from "../../redux/threads";
import {Link} from "react-router-dom";
import Paginator from "../common/Paginator";
import UrlBuilder, {ListGetParams} from "../../utils/UrlBuilder";
import {OverlayTrigger, Row, Button, Card, Col, Container, Spinner, Tooltip} from "react-bootstrap";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import ThreadListItem from "./ThreadListItem";
import ConditionalTooltip, {msg_MustBeLoggedIn} from "../common/ConditionalTooltip";
import Utils from "../../utils/Utils";

const mapDispatchToProps = {
    getThreads
}

const mapStateToProps = state => {
    return {
        threads: state.threads.list,
        authLoaded: state.auth.loaded,
        isLoggedIn: state.auth.isLoggedIn, // TODO remove
        user: state.auth.user,
    };
};

class ThreadList extends React.Component {
    constructor(props) {
        super(props);

        this.defaultGETParams = new ListGetParams(1, 10, 'id', 'DESC');

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
     * Retrieve url with GET params for currently viewed list.
     * Used to check if requested data (url) matches currently loaded data in redux state.
     * @param page
     * @returns {string}
     */
    getListUrl(page = 1) {
        const defaults = {...this.defaultGETParams, page: page};
        return UrlBuilder.ReadParamsWithDefaults(defaults).GetUrl();

        /*return UrlBuilder.ReadParamsWithDefaults({
                page: page, perpage: 10, orderby: 'id', orderdir: 'DESC'}).GetUrl();*/
    }

    /**
     * Retrieve url with GET params with specific options (page, perpage, orderby, orderdir).
     * Used by Paginator to generate links.
     */
    getPaginationListUrl(options) {
        return UrlBuilder.ReadParamsWithReplace(
                options,
                this.defaultGETParams).GetUrl();
    }

    /**
     * Used from child Paginator component, on navigation click to any other page
     */
    handlePageNavigation() {
        // Needed to force refresh component. Link click by default only sets GET params,
        // which does not force components update. Utils.Redirect also doesn't work here.
        this.setState({
            'refreshComponent': Math.random(),
        });
    }

    render() {
        if (this.props.threads.loaded !== LoadState.Done) {
            return <div className='text-center mt-5 pt-5'><Spinner animation="border" /></div>;
        }

        const threadListItems = this.props.threads.items.map(t =>
            <ThreadListItem key={t.id} thread={t} />
        );

        const perPageArr = [10, 20, 40, 100];
        let orderByArr = [
            {text: 'Newest to oldest', orderby: 'id', orderdir: 'DESC'},
            {text: 'Oldest to newest', orderby: 'id', orderdir: 'ASC'},
            {text: 'Most upvoted', orderby: 'votesCount', orderdir: 'DESC'},
            {text: 'Most replies', orderby: 'commentsCount', orderdir: 'DESC'},
        ];
        // Mark selected item for Order by
        const currentParams = UrlBuilder.ReadParamsWithDefaults(this.defaultGETParams);
        const selectedIndex = orderByArr.findIndex(el => el.orderby === currentParams.orderby && el.orderdir === currentParams.orderdir);
        if (selectedIndex !== -1)
            orderByArr[selectedIndex] = {...orderByArr[selectedIndex], selected: true};

        const paginator = <Paginator pagination={this.props.threads.pagination}
                                     linkGenerator={this.getPaginationListUrl}
                                     onClick={this.handlePageNavigation}
                                     perPage={perPageArr}
                                     orderBy={orderByArr} />

        return (
            <div>
                {/* --- Title, Create new button --- */}
                <Row className='justify-content-between'>
                    <Col xs={6} sm='auto' className='pr-0'>
                        <h2>Topics list</h2>
                    </Col>
                    <Col xs={6} sm='auto' className='pl-0 text-right'>

                        <ConditionalTooltip
                            placement='left'
                            tooltip={msg_MustBeLoggedIn}
                            tooltipId='create-thread-btn-tooltip'
                            show={this.props.user === null}
                            pointerEventsNone={true}
                        >
                            <Link to={UrlBuilder.Threads.Create()}>
                                <Button disabled={this.props.user === null}><FA icon={faPlus}/> Create new</Button>
                            </Link>
                        </ConditionalTooltip>
                    </Col>
                </Row>

                <Container fluid className='full-width-container-md-down'>
                    {paginator}
                    <Card>

                        {/* -- Card header -- */}
                        <Card.Header className='py-2'>
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

                    <br/>
                    {paginator}
                </Container>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ThreadList);