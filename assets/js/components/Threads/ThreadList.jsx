import React from 'react';
import { connect } from 'react-redux';
import { getThreads } from "../../redux/threads";
import {Link} from "react-router-dom";
import Paginator from "../common/Paginator";
import UrlBuilder from "../../utils/UrlBuilder";
import {Row, Button, Card, Col, Container, Spinner} from "react-bootstrap";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
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
                page: page, perpage: 10, orderby: 'id', orderdir: 'DESC'}).GetUrl();
    }

    /**
     * Retrieve url with GET params for specific page, to be used in pagination links
     */
    getPaginationListUrl(page) {
        return UrlBuilder.ReadParamsWithReplace(
                {page: page},
                {perpage: 10, orderby: 'id', orderdir: 'DESC'}).GetUrl();
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
            return <div className='text-center mt-5 pt-5'><Spinner animation="border" /></div>;
        }

        const threadListItems = this.props.threads.items.map(t =>
            <ThreadListItem key={t.id} thread={t} />
        );

        const paginator = <Paginator pagination={this.props.threads.pagination}
                                     linkGenerator={this.getPaginationListUrl}
                                     onClick={this.handlePageNavigation} />

        return (
            <div>
                {/* --- Title, Create new button --- */}
                <Row>
                    <Col className='pr-0'>
                        <h2 style={{display: "inline-block"}}>Topics list</h2>
                    </Col>
                    <Col className='pl-0'>
                        <Link to={UrlBuilder.Threads.Create()}>
                            <Button style={{float: "right"}}><FA icon={faPlus}/> Create new</Button>
                        </Link>
                    </Col>
                </Row>

                <Container fluid className='thread-list-container'>
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
                </Container>
                <br/>
                {paginator}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ThreadList);