import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Button, Form, ProgressBar, Spinner} from "react-bootstrap";
import {Link} from "react-router-dom";
import UrlBuilder from "../../utils/UrlBuilder";
import {UserForm_Register} from "./UserFormVariants";

const mapDispatchToProps = {}

const mapStateToProps = state => {
    return {
        user: state.auth.user,
    };
}

class UserForm extends Component {
    constructor(props) {
        super(props);

        this.handleFormChange = this.handleFormChange.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);

        const v = this.props.values;
        this.state = {
            username: v.username || '',
            password: v.password || '',
            passwordRepeat: v.passwordRepeat || '',

            validation: {
                // valid: true | false,
                // username: 'Username does not meet requirements.',
            }
        }
    }

    static Register = UserForm_Register;
    // static Login = UserForm_Login;
    // static Edit = UserForm_Edit;

    handleFormChange(event) {
        const target = event.target;




        // let newValidationData = null;
        // if (this.props.onChange)
/*
            this.setState(state => {
                console.log(event);
                return {
                    ...this.props.onChange(event, state)
                };
            });
*/

        let newValidationData = null;
        if (this.props.onChange)
            newValidationData = this.props.onChange(event, this.state);

        this.setState({
            [target.id]: target.value,
            ...newValidationData
        });

        // this.setState({
        //     ...newValidationData
        // });
    }

    handleFormSubmit(event) {
        event.preventDefault();
        this.setState({
            validation: this.props.onSubmit(this.state)
        });
    }

    render() {
        // const u = this.props.user;
        const us = this.props.userSubject;
        const {formLoading, variant} = this.props;
        const register = variant === 'register'; // form variant shortcuts
        const login = variant === 'login';
        const edit = variant === 'edit';

        const {username, password, passwordRepeat} = this.state;
        const v = this.state.validation;

        return (
            <Form onSubmit={this.handleFormSubmit}>
                <Form.Group>
                    <fieldset disabled={formLoading}>
                        {/* --- Username --- */}
                        <Form.Group controlId='username'>
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type='text'
                                maxLength={25}
                                value={username}
                                onChange={this.handleFormChange} />

                            {register ?
                            <Form.Text className='text-muted'>Should be between 4-25 characters.</Form.Text>
                            : null}

                            {v.username ?
                            <Form.Control.Feedback type='invalid' className='d-block'>{v.username}</Form.Control.Feedback>
                            : null}

                        </Form.Group>

                        {/* --- Password --- */}
                        <Form.Group controlId='password'>
                            <Form.Label>Password</Form.Label>
                            <Form.Control type='password' value={password} onChange={this.handleFormChange} />

                            {v.password ?
                            <Form.Control.Feedback type='invalid' className='d-block'>{v.password}</Form.Control.Feedback>
                            : null}

                        </Form.Group>
                        {register || edit ?
                            <>
                            {/* --- Password repeat --- */}
                            <Form.Group controlId='passwordRepeat'>
                                <Form.Control type='password' value={passwordRepeat} onChange={this.handleFormChange} />
                                <Form.Text className='text-muted'>Repeat password.</Form.Text>

                                {v.passwordRepeat ?
                                <Form.Control.Feedback type='invalid' className='d-block'>{v.passwordRepeat}</Form.Control.Feedback>
                                : null}

                            </Form.Group>

                            {/* --- Password strength meter --- */}
                            {v.pswStrNumber ?
                                <Form.Group>
                                    <ProgressBar striped animated variant={v.pswStrFlavor} now={v.pswStrNumber} />
                                    <Form.Text className='text-muted'>{v.pswStrText}</Form.Text>
                                </Form.Group>
                            : null}
                            </>
                            : null}

                        {/* --- Submit --- */}
                        <Button variant='primary' type='submit' className='mr-2'>
                            {formLoading ?
                                <Spinner animation='border' size='sm' /> :
                                register ? 'Register' :
                                    login ? 'Login' : 'Save'
                            }
                        </Button>

                        {/* --- Login/Register instead --- */}
                        {login || register ?
                            <>or{' '}
                            {login ?
                                <Link to={UrlBuilder.Register()}>Register</Link> :
                                <Link to={UrlBuilder.Login()}>Login</Link>
                            } instead</>
                        : null}

                    </fieldset>
                </Form.Group>
            </Form>
        );
    }
}

UserForm.propTypes = {
    variant: PropTypes.oneOf(['login', 'register', 'edit']).isRequired,

    values: PropTypes.object.isRequired, // Form field values. Object must, values optional. Values: username, password, passwordRepeat
    // userSubject: PropTypes.object, // User object that is being edited
    formLoading: PropTypes.bool, // adjusts form style. Can be set to true e.g. after submitting

    onSubmit: PropTypes.func.isRequired, // onSubmit callback, should return validation data if form was not submitted
    onChange: PropTypes.func, // onChange callback, can be used to return validation data
    // TODO zxcvbn tips

    // Redux state:
    // user: PropTypes.object, // Currently logged in user

}


export default connect(mapStateToProps, mapDispatchToProps)(UserForm);