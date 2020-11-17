import React from 'react';
import { connect } from 'react-redux';
import ThreadFormRedux from "./ThreadFormRedux";
import { getThreads, GenerateThreadsParamsUrl } from "../../redux/threads";
import Loading from "../Loading";
import {Link} from "react-router-dom";

const mapDispatchToProps = {
    getThreads
}

const mapStateToProps = state => {
    return {
        threads: state.threads.list.items,
        pagination: state.threads.list.pagination,
        threadsLoaded: state.threads.list.loaded,
        authLoaded: state.auth.loaded
    };
};

class ConnectedThreadList extends React.Component {
    constructor(props) {
        super(props);

        let threadsLoadRequested = false;
        if (!props.threadsLoaded && props.authLoaded) {
            // TODO test this
            props.getThreads();
            threadsLoadRequested = true;
        }

        this.state = {
            threadsLoadRequested
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.props.threadsLoaded && this.props.authLoaded && !this.state.threadsLoadRequested) {
            this.props.getThreads();
            this.setState({threadsLoadRequested: true});
        }
    }


    render() {
        if (!this.props.threadsLoaded) {
            return <Loading />
        }

        const {threads, loaded, pagination} = this.props;

        const list = threads.map(t => {
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