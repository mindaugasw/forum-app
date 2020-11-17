import React from "react";
import {connect} from "react-redux";
import { withRouter } from "react-router";
import {Link} from "react-router-dom";


const mapDispatchToProps = {}
const mapStateToProps = state => {
    return {
    };
}

class SingleThreadRedux extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        const {match} = this.props;

        return (
            <div>
                Single thread view - #{match.params.id}<br/>
                <Link to='/threads'>Back - threads index</Link>
            </div>
        );
    }

}

// const SingleThreadRedux = connect(mapStateToProps, mapDispatchToProps)(SingleThreadConnected);
// export default SingleThreadRedux;

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(SingleThreadRedux)
);