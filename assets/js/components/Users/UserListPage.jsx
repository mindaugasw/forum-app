import React, {Component} from "react";
import { connect } from 'react-redux';
import {getUsers} from "../../redux/usersCRUD";
import UrlBuilder, {ListGetParams} from "../../utils/UrlBuilder";
import {Card, Col, Container, Row} from "react-bootstrap";
import Paginator from "../common/Paginator";
import UserListItem from "./UserListItem";
import Utils from "../../utils/Utils";
import Loader from "../common/Loader";


class UserListPage extends Component {
    constructor(props) {
        super(props);

        this.defaultGETParams = new ListGetParams(1, 12, 'id', 'DESC');

        this.loadUsersList();

        this.getListUrl = this.getListUrl.bind(this);
        this.getPaginationListUrl = this.getPaginationListUrl.bind(this);
        this.handlePageNavigation = this.handlePageNavigation.bind(this);
    }

    componentDidUpdate() {
        this.loadUsersList();
    }

    /**
     * Checks if currently loaded data matches needed data for this view. If not, loads needed data.
     */
    loadUsersList() {
        const u = this.props.users;
        const targetUrl = this.getListUrl();

        // Wait for auth to load. Auth info isn't used directly in this component,
        // but all state is cleared after auth state changes
        if (this.props.authLoaded) {

            // If target url matches and loading state is any other than 'NotRequested', skip data request.
            // In all other cases request updated data
            if (u.url !== targetUrl || u.loaded === LoadState.NotRequested) {
                this.props.getUsers(targetUrl);
            }
        }
    }

    /**
     * Retrieve url with GET params for currently viewed list.
     * Used to check if requested data (url) matches currently loaded data in redux state.
     * @param page
     * @returns {string}
     * // TODO move outside for code reuse?
     */
    getListUrl(page = 1) {
        const defaults = {...this.defaultGETParams, page: page};
        return UrlBuilder.ReadParamsWithDefaults(defaults).GetUrl();
    }

    /**
     * Retrieve url with GET params with specific options (page, perpage, orderby, orderdir).
     * Used by Paginator to generate links.
     * // TODO move outside for code reuse?
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
        if (this.props.users.loaded !== LoadState.Done) {
            return <Loader />;
        }

        const userListItems = this.props.users.items.map(u =>
            <UserListItem key={u.id} user={u} />
        );


        const perPageArr = [12, 25, 50, 100];
        let orderByArr = [
            {text: 'Newest to oldest', orderby: 'id', orderdir: 'DESC'},
            {text: 'Oldest to newest', orderby: 'id', orderdir: 'ASC'},
            {text: 'Admins first', orderby: 'roles', orderdir: 'ASC'},
            {text: 'Name A-Z', orderby: 'username', orderdir: 'ASC'},
            {text: 'Name Z-A', orderby: 'username', orderdir: 'DESC'},
        ];
        // Mark selected item for Order by
        const currentParams = UrlBuilder.ReadParamsWithDefaults(this.defaultGETParams);
        const selectedIndex = orderByArr.findIndex(el => el.orderby === currentParams.orderby && el.orderdir === currentParams.orderdir);
        if (selectedIndex !== -1)
            orderByArr[selectedIndex] = {...orderByArr[selectedIndex], selected: true};

        const paginator = <Paginator pagination={this.props.users.pagination}
                                     linkGenerator={this.getPaginationListUrl}
                                     onClick={this.handlePageNavigation}
                                     perPage={perPageArr}
                                     orderBy={orderByArr} />

        return (
            <div>
                {Utils.Titles.UsersList()}
                <h2>Users list</h2>

                <Container fluid className='full-width-container-md-down'>
                    <Card>

                        {/* -- Card header -- */}
                        <Card.Header className='py-2'>
                            <Container fluid className='p-0'>
                                <Row className='no-gutters'>
                                    <Col>
                                        User
                                    </Col>

                                    <Col xs={2} className='text-center'>
                                        View
                                    </Col>
                                </Row>
                            </Container>
                        </Card.Header>

                        {/* --- Items list --- */}
                        {userListItems}

                    </Card>

                    <br/>
                    {paginator}
                </Container>

            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        users: state.users.list,
        authLoaded: state.auth.loaded,
        authUser: state.auth.user,
    }
}

const mapDispatchToProps = {
    getUsers
}

export default connect(mapStateToProps, mapDispatchToProps)(UserListPage);

