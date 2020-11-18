import React from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router";
import {Link} from "react-router-dom";
import UrlBuilder from "../../utils/UrlBuilder";
import {getSingleThread, getComments} from "../../redux/threads";
import PropTypes from "prop-types";
import Loading from "../Loading";
import Paginator from "../Paginator";

const mapDispatchToProps = {
    getSingleThread,
    getComments
}
const mapStateToProps = state => {
    return {
        thread: state.threads.single,
        authLoaded: state.auth.loaded,
    };
}

class SingleThread extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            id: parseInt(this.props.match.params.id), // This thread id
            // TODO show error if id is NaN
        }

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

    loadThread() {
        const t = this.props.thread;
        const targetId = this.state.id;

        if (this.props.authLoaded) {
            if (t.id !== targetId || t.loaded === LoadState.NotRequested) {
                this.props.getSingleThread(targetId);
            }
        }
    }

    loadComments() {
        const c = this.props.thread.comments;
        const targetUrl = this.getListUrl();

        if (this.props.authLoaded) {
            if (c.url !== targetUrl || c.loaded === LoadState.NotRequested) {
                this.props.getComments(targetUrl);
            }
        }
    }

    getListUrl(page = 1) {
        return this.state.id + '/comments/' +
            UrlBuilder.ReadParamsWithDefaults({
                page: page, perpage: 10, orderby: 'id', orderdir: 'ASC'}).GetUrl();

        // ---
        /*return this.state.id+'/comments/'+UrlBuilder.BuildParamsUrl_v2(
            UrlBuilder.ReadCurrentParamsWithDefaults({
                page: page, perpage: 10, orderby: 'id', orderdir: 'ASC'
        }));*/
        // ---
        // return `${this.state.id}/comments/${UrlBuilder
        //     .ReadParamsUrlWithDefaults(page, 10, 'id', 'ASC')}`;
    }

    getPaginationListUrl(page) {
        return `/threads/${this.state.id}/comments/` +
            UrlBuilder.ReadParamsWithReplace(
                {page: page},
                {perpage: 10, orderby: 'id', orderdir: 'ASC'}
            ).GetUrl();

        // return UrlBuilder.ReadParamsUrlWithReplace(page);
    }

    handlePageNavigation() {
        // Needed to force refresh component. Link click by default only sets GET params,
        // which do not force components update
        this.setState({
            'refreshComponent': Math.random(),
        });
    }

    render() {
        const t = this.props.thread;
        const c = this.props.thread.comments;

        let threadJsx;
        let commentsJsx;

        if (c.loaded !== LoadState.Done) {
            commentsJsx = <Loading/>;
        } else {
            let listJsx = c.items.map(ci => { // ci for comment item
                return (
                    <li key={ci.id}>
                        {ci.content}<br/>
                        #{ci.id} by {ci.author.username} at {ci.createdAt}<br/>
                    </li>
                );
            });

            const paginator = <Paginator pagination={c.pagination}
                                         linkGenerator={this.getPaginationListUrl}
                                         onClick={this.handlePageNavigation} />

            commentsJsx =
                <div>
                    <h3>Comments (total {t.item.commentsCount})</h3>
                    {paginator}
                    <ul>{listJsx}</ul>
                    {paginator}
                </div>;
        }

        if (t.loaded !== LoadState.Done) {
            threadJsx = <Loading/>;
        } else {
            threadJsx =
                <div>
                    <h3>{t.item.title}</h3>
                    #{t.id} by {t.item.author.username} at {t.item.createdAt}<br/>
                    {t.item.content}

                    {commentsJsx}
                </div>;
        }



        return (
            <div>
                <Link to='/threads'>Back - threads index</Link><br/>
                {threadJsx}
            </div>
        );
    }

    static get propTypes() {
        return {
            thread: PropTypes.object.isRequired,
            authLoaded: PropTypes.bool.isRequired,
            match: PropTypes.object.isRequired,
        };
    }
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(SingleThread)
);