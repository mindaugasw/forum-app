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

class ConnectedThreadList extends React.Component {
    constructor(props) {
        super(props);

        this.getListUrl = this.getListUrl.bind(this);
        this.getPaginationListUrl = this.getPaginationListUrl.bind(this);
        this.handlePageNavigation = this.handlePageNavigation.bind(this);
        this.loadThreadsList();
    }

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

    getListUrl(page = 1) {
        return UrlBuilder.ReadParamsUrlWithDefaults(page, 20, 'id', 'DESC');
        // return UrlBuilder.ReadParamsUrlWithReplace(page, 20, 'id', 'DESC');
    }

    getPaginationListUrl(page) {
        return UrlBuilder.ReadParamsUrlWithReplace(page);
    }

    handlePageNavigation() {
        // Needed to force refresh component. Link click by default only sets GET params,
        // which do not force components update
        this.setState({
            'refreshComponent': Math.random(),
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.loadThreadsList();
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
                {/*<ThreadFormRedux/>*/}

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

const ThreadListRedux = connect(mapStateToProps, mapDispatchToProps)(ConnectedThreadList);

export default ThreadListRedux;