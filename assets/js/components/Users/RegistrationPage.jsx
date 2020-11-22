import React, {Component} from 'react';
import UserForm from "./UserForm";
import {Row, Col} from "react-bootstrap";

class RegistrationPage extends Component {
    render() {
        importZxcvbn();

        return (
            <Row className="justify-content-center">
                <Col sm={8} md={6} xl={5}>
                    <h2>New user registration</h2>
                    {/*<UserForm variant='register' />*/}
                    <UserForm.Register />
                </Col>
            </Row>
        );
    }
}

export default RegistrationPage;