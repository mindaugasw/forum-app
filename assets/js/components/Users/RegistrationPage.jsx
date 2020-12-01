import React, {Component} from 'react';
import UserForm from "./UserForm";
import {Row, Col} from "react-bootstrap";
import Utils from "../../utils/Utils";

class RegistrationPage extends Component {
    render() {
        Utils.ImportZxcvbn();

        return (
            <Row className="justify-content-center">
                {Utils.Titles.Register()}
                <Col sm={8} md={6} xl={5}>
                    <h2>New user registration</h2>
                    <UserForm.Register />
                </Col>
            </Row>
        );
    }
}

export default RegistrationPage;