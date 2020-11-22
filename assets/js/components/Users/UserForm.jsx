import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Alert, Button, Form, ProgressBar, Spinner} from "react-bootstrap";
import {Link} from "react-router-dom";
import UrlBuilder from "../../utils/UrlBuilder";
import {UserForm_Login, UserForm_Register} from "./UserFormVariants";
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import {faExclamationCircle} from "@fortawesome/free-solid-svg-icons";

const mapDispatchToProps = {}

const mapStateToProps = state => {
    return {
        // user: state.auth.user,
        // formLoading: state.users.formLoading,
    };
} // TODO remove?

class UserForm extends Component {
    // _isMounted = false;

    constructor(props) {
        super(props);

        this.handleFormChange = this.handleFormChange.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);

        const v = this.props.initialValues;
        this.state = {
            username: v.username || '', // Input values
            password: v.password || '',
            passwordRepeat: v.passwordRepeat || '',

            // formLoading: this.props.formLoading,

            validation: {
                valid: false, // Is entire form valid?

                username: false, // Can be replaced with validation error message. If empty, message won't be rendered
                password: false,
                passwordRepeat: false,

                pswStrNumber: false,
                pswStrFlavor: false,
                pswStrText: false,
                pswStrFeedbackWarning: false,
                pswStrFeedbackSuggestions: false,

                alert: {
                    show: false,
                    type: false,
                    message: false,
                }
            },

            ...v, // Overwrite state with any additional values passed
        }
    }

    /*componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }*/

    // Form variants shortcuts
    static Register = UserForm_Register;
    static Login = UserForm_Login;
    // static Edit = UserForm_Edit;

    handleFormChange(event) {
        const target = event.target;

        // Callback can return new state data, e.g. validation data
        let newStateData = null;
        if (this.props.onChange)
            newStateData = this.props.onChange(event, this.state);

        // console.log('v1', newStateData);

        this.setState(state => {
            return {
                ...mergeDeep(state, newStateData),
                [target.id]: target.value,
                // ...this.props.onChange(event, state) // doesn't work? Throws up in the console
                // ...newStateData
            };
        });
    }

    handleFormSubmit(event) {
        event.preventDefault();

        /*console.log('@ UserForm', 's0', this.state);
        this.setState(state => {
            let x = this.props.onSubmit(event, state).then(x => {
                console.log('@ UserForm', 's2', x);
                return x;
            });
            console.log('@ UserForm', 's3', x);
            return {
                // ...this.props.onSubmit(event, state)
                ...x,
            };
        });*/

        this.props.onSubmit(event, this.state).then(newState => {
            // console.log('@ UserForm', 's4 quit', newState);

            console.log('c1', newState);
            if (newState)
                console.log('c2');
                this.setState(state => {
                    // console.log('c3', state, newState);
                    // const newObj = mergeDeep(state, newState);
                    // const newObj = mergeDeep_2(state, newState);
                    // console.log('c4', newObj)
                    return {
                        ...mergeDeep(state, newState),
                        // ...newObj
                    };
                })

            /*this.setState({


                validation: {

                    username: newState.payload.error.message
                }
                // ...newState,
            });*/
        });
    }

    render() {
        // const u = this.props.user;
        // const us = this.props.userSubject;
        const {formLoading, variant} = this.props;
        const register = variant === 'register'; // form variant shortcuts
        const login = variant === 'login';
        const edit = variant === 'edit';

        const {username, password, passwordRepeat/*, formLoading*/} = this.state;
        const v = this.state.validation;

        return (
            <Form onSubmit={this.handleFormSubmit}>
                <Form.Group>
                    <fieldset disabled={formLoading}>

                        {/* --- Alert --- */}
                        {v.alert.show ?
                            <Alert variant={v.alert.type}>
                                <FA icon={faExclamationCircle} /> {v.alert.message}
                            </Alert>
                        : null}


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
                            {v.usernameValidServer ?
                            <Form.Control.Feedback type='invalid' className='d-block'>{v.usernameValidServer}</Form.Control.Feedback>
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
                                    <Form.Text className={`d-block ${v.pswStrFlavor === 'danger' ? 'invalid-feedback' : 'text-muted'}`}>
                                        {v.pswStrText}
                                    </Form.Text>
                                    <Form.Text className='text-muted mt-0'>
                                        {v.pswStrFeedbackWarning ? <>{v.pswStrFeedbackWarning}<br/></> : null}
                                        {v.pswStrFeedbackSuggestions ? v.pswStrFeedbackSuggestions : null}
                                    </Form.Text>
                                </Form.Group>
                            : null}
                            </>
                            : null}

                        {/* --- Submit --- */}
                        <Button variant='primary' type='submit' className='mr-2' disabled={!v.valid}>
                            {/*{formLoading ?
                                <Spinner animation='border' size='sm' /> :
                                register ? 'Register' :
                                    login ? 'Login' : 'Save'
                            }*/}

                            {formLoading ? <><Spinner animation='border' size='sm' /> </> : ''}

                            {register ? 'Register' :
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

    initialValues: PropTypes.object.isRequired, // Form field values. Object must, values optional. Values: username, password, passwordRepeat
    // userSubject: PropTypes.object, // User object that is being edited

    // Event callbacks. Both can return updated state data, e.g. validation data
    onSubmit: PropTypes.func.isRequired, // On successful submit should not return anything
    onChange: PropTypes.func,
    formLoading: PropTypes.bool, // adjusts form style. Can be set to true e.g. after submitting

    // Redux state:
    // user: PropTypes.object, // Currently logged in user

}


export default connect(mapStateToProps, mapDispatchToProps)(UserForm);