import React from 'react';
import {Col, Row} from "react-bootstrap";
import UserForm from "./UserForm";
import Utils from "../../utils/Utils";

function LoginPage () {
    return (
        <Row className="justify-content-center">
            {Utils.Titles.Login()}
            <Col sm={8} md={6} xl={5}>
                <h2>Login</h2>
                <UserForm.Login />
            </Col>
        </Row>
    );
}

export default LoginPage;