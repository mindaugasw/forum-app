import React from 'react';
import { connect } from 'react-redux';
import { getThreads } from "../../redux/threads";
import Loading from "../Loading";
import {Link} from "react-router-dom";

const mapDispatchToProps = {
    getThreads
}

const mapStateToProps = state => {
    return {
        threads: state.threads.list,
        // pagination: state.threads.list.pagination,
        // threadsLoaded: state.threads.list.loaded,
        authLoaded: state.auth.loaded
    };
};

class ConnectedThreadList extends React.Component {
    constructor(props) {
        super(props);

        /*let threadsLoadRequested = false;
        if (!props.threadsLoaded && props.authLoaded) {
            // TODO test this
            props.getThreads();
            threadsLoadRequested = true;
        }*/

        // this.getListUrl = this.getListUrl.bind(this);
        // this.loadThreadsList = this.loadThreadsList.bind(this);

        /*this.state = {
            url: readParamsUrl()
        }*/

        // this.props.getThreads(readParamsUrl());
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

    getListUrl() {
        return readParamsUrlWithDefaults(1, 20, 'id', 'DESC');
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        /*if (!this.props.threadsLoaded && this.props.authLoaded && !this.state.threadsLoadRequested) {
            this.props.getThreads();
            this.setState({threadsLoadRequested: true});
        }*/
        this.loadThreadsList();
    }


    render() {
        if (this.props.threads.loaded !== LoadState.Done) {
            return <Loading />
        }

        const {threads, pagination} = this.props;

        const list = threads.items.map(t => {
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

        return (
            <div>
                <hr/>
                <b>ThreadListRedux.jsx</b><br/>
                {/*<ThreadFormRedux/>*/}

                <ul>
                    {list}
                </ul>
                <hr/>
            </div>
        );
    }
}

const ThreadListRedux = connect(mapStateToProps, mapDispatchToProps)(ConnectedThreadList);

export default ThreadListRedux;