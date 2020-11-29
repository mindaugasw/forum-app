import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Spinner} from "react-bootstrap";
import {logout} from "../../redux/auth";
import UrlBuilder from "../../utils/UrlBuilder";
import Notifications from "../../utils/Notifications";

const mapDispatchToProps = {
    logout
}

const mapStateToProps = state => {
    return {};
}

class LogoutPage extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.logout()
            .then(action => {
                redirect(UrlBuilder.Home());
                Notifications.Add({type:'success', headline:'Logout successful'});
            });
    }

    render() {
        return (
            <div className='text-center mt-5'>
                <Spinner animation='border' />
            </div>
        );
    }
}

LogoutPage.propTypes = {}

export default connect(mapStateToProps, mapDispatchToProps)(LogoutPage);