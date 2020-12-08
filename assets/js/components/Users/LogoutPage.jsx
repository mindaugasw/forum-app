import React, {Component} from 'react';
import {connect} from 'react-redux';
import {logout} from "../../redux/auth";
import UrlBuilder from "../../utils/UrlBuilder";
import Notifications from "../../utils/Notifications";
import Utils from "../../utils/Utils";
import Loader from "../common/Loader";


class LogoutPage extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.logout()
            .then(action => {
                Utils.Redirect(UrlBuilder.Home());
                Notifications.Add({type:'success', headline:'Logout successful'});
            });
    }

    render() {
        return (
            <div className='text-center mt-5'>
                <Loader />
            </div>
        );
    }
}

LogoutPage.propTypes = {
    // Redux:
    // logout: PropTypes.func.isRequired,
}

const mapDispatchToProps = {
    logout
}

export default connect(null, mapDispatchToProps)(LogoutPage);