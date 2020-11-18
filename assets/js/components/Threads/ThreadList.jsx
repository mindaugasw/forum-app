import React from 'react';
import { connect } from 'react-redux';
import { getThreads } from "../../redux/threads";
import Loading from "../Loading";
import {Link} from "react-router-dom";
import Paginator from "../Paginator";
import UrlBuilder from "../../utils/UrlBuilder";

const mapDispatchToProps = {
    getThreads
}

const mapStateToProps = state => {
    return {
        threads: state.threads.list,
        authLoaded: state.auth.loaded
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

        // return UrlBuilder.ReadParamsUrlWithDefaults(page, 20, 'id', 'DESC');
    }

    /**
     * Retrieve url with GET params for specific page, to be used in pagination links
     */
    getPaginationListUrl(page) {
        return UrlBuilder.ReadParamsWithReplace(
                {page: page},
                {perpage: 20, orderby: 'id', orderdir: 'DESC'}).GetUrl();


        // ---
        /*let paramsObj = UrlBuilder.ReadCurrentParamsWithDefaults();
        paramsObj.page = page;

        return UrlBuilder.BuildParamsUrl_v2(paramsObj);*/
        // ---
        // return UrlBuilder.ReadParamsUrlWithReplace(page);
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

        const list = this.props.threads.items.map(t => {
            const createdAt = new Date(t.createdAt).formatDefault();

            return (
                <li key={t.id}>
                    <Link to={`/threads/${t.id}`}>
                        {t.id}: {t.title}
                    </Link><br/>
                    By <a href="#">{t.author.username}</a> @ {createdAt}
                    . {t.commentsCount} comments.{' '}
                    Vote: {t.userVote === 1 ? '🔼' : t.userVote === -1 ? '🔻' : '-'}
                </li>
            );
        });

        const paginator = <Paginator pagination={this.props.threads.pagination}
                                     linkGenerator={this.getPaginationListUrl}
                                     onClick={this.handlePageNavigation} />

        return (
            <div>
                <hr/>
                <b>ThreadListRedux.jsx</b><br/>

                {paginator}
                <ul>
                    {list}
                </ul>
                {paginator}
                <hr/>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ThreadList);