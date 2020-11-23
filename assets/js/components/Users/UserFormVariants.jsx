import React, {Component} from "react";
import UserForm from "./UserForm";
import {connect} from "react-redux";
import {register, REGISTER, FULFILLED, REJECTED} from "../../redux/usersCRUD";
import {login, LOG_IN_MANUAL} from "../../redux/auth";
import UrlBuilder from "../../utils/UrlBuilder";
import Notifications from "../../utils/Notifications";

function handleFormChange_Register_Edit(event, state) {
    const target = event.target;

    const updatedState = { // Manual state update, as passed state is late by 1 onChange event
        ...state,
        [target.id]: target.value
    }

    // Validate only edited field (to not show errors on still untouched fields)
    let validationData = null;
    if (target.id === 'username')
        validationData = {...validateNewUsername(updatedState)};

    if (target.id === 'password' || target.id === 'passwordRepeat')
        validationData = {...validateNewPassword(updatedState)};

    // Join all validation data to check full form validity
    validationData = mergeDeep(state.validation, validationData);

    if (validationData.usernameValid && validationData.passwordValid)
        validationData.valid = true;

    return {
        validation: {
            ...validationData
        }
    };

    /*return  {
        validation: {
            // valid: false, // if form is valid, value will overwritten from method result
            // ...validateRegistrationForm(updatedState),
            ...validationData
        }
    };*/

    // console.log('Form change, valid: '+res.valid);
    // res.validation = {
    //     ...validateRegistrationForm(state) // validatePassword(updatedState, false),
    // }


    /*if (target.id === 'password' || target.id === 'passwordRepeat') {
        const updatedState = { // Manual state update, as passed state is late by 1 onChange event
            ...state,
            [target.id]: target.value
        }

        return {
            validation: validatePassword(updatedState),
        }
    }*/
}

function validateNewPassword(state, allowEmpty = false) {
    const s = state;
    let res = {
        passwordValid: false,

        passwordRepeat: false, // error message under password repeat
        pswStrNumber: false, // strength meter value
        pswStrFlavor: false, // strength meter color
        pswStrText: false, // strength meter message
        pswStrFeedback: false, // zxcvbn feedback
    };

    if (!s.password && !s.passwordRepeat) { // Both passwords empty
        res.passwordValid = allowEmpty; // If editing user, password optional and is valid if empty
        return res;
    }

    if (s.password !== s.passwordRepeat) {
        res.passwordRepeat = 'Passwords do not match.';
        // return res; // Show password strength even if passwords don't match
    }

    const pswTested = s.password.length > 100 ? s.password.substring(0, 100) : s.password; // Long strings are cut for performance
    const z = zxcvbn.default(pswTested, [s.username]);

    res.pswStrNumber = Math.max(z.score * 25, 10);
    switch (z.score) {
        case 0:
        case 1:
            res.pswStrFlavor = 'danger';
            res.pswStrText = 'too weak'
            break;
        case 2:
            res.pswStrFlavor = 'warning';
            res.pswStrText = 'weak'
            break;
        case 3:
            res.pswStrFlavor = 'info';
            res.pswStrText = 'strong'
            break;
        case 4:
            res.pswStrFlavor = 'success';
            res.pswStrText = 'very strong'
            break;
    }

    res.pswStrText = 'Password strength: '+res.pswStrText;
    res.pswStrFeedbackWarning = z.feedback.warning || false;
    res.pswStrFeedbackSuggestions = z.feedback.suggestions || false;

    if (z.score > 1 || APP_ENV === 'dev')
        res.passwordValid = !res.passwordRepeat; // Only valid if there's no password repeat message (ie passwords match)

    return res;
}
function validateNewUsername(state) {
    const s = state;
    let res = {
        usernameValid: false,
        username: false,
    }

    if (!s.username || s.username.length < 4 || s.username.length > 25) {
        // v.valid = false;
        res.username = 'Username does not meet requirements.';
        return res;
    }

    res.usernameValid = true;
    return res;
}

function validateRegistrationForm(state) {
    /*const s = state;
    let v = { // v for validation data
        valid: true
    }

    if (!s.username || s.username.length < 4 || s.username.length > 25) {
        v.valid = false;
        v.username = 'Username does not meet requirements.';
    }

    if (!s.password || s.password.length < 4) {
        v.valid = false;
        v.password = 'Password does not meet requirements.';
    }

    if (!s.passwordRepeat || s.passwordRepeat.length < 4) {
        v.valid = false;
        v.passwordRepeat = 'Password repeat does not meet requirements.';
    }

    return v;*/

    let res = {
        valid: false,
        ...validateNewUsername(state),
        ...validateNewPassword(state, false),
    }

    if (res.usernameValid && res.passwordValid)
        res.valid = true;

    return res;
}


class UserForm_Register_unconnected extends Component {
    constructor(props) {
        super(props);

        this.handleRegistrationSubmit = this.handleRegistrationSubmit.bind(this);

        this.state = {
            formLoading: false
        };
    }

    handleRegistrationSubmit(event, state) {
        if (!state.validation.valid) {
            console.error('Tried submitting invalid form');
            return;
        }
        this.setState({formLoading: true});

        /*return this.props.register({username: state.username, password: state.password})
            .then(action => {
                const p = action.payload;
                console.log('@ UserFormVariants', 'a2 p', p);
                if (!action || !p || action.error || p.error) { // if no action or payload, or action or payload contains error
                    console.log('@ UserFormVariants', 'a3 ERROR in form;',action);

                    if (p.error.status === 400 && p.error.message.includes('a4 username is already in use')) {
                        return {
                            validation: {
                                username: p.error.message,
                            },
                        };
                    }

                    console.log('@ UserFormVariants', 'a5 Unknown error', action);
                } else {
                    console.log('@ UserFormVariants', 'a6 success');
                }
            });*/

        let response = this.props.register({username: state.username, password: state.password});
        // console.log('@ UserFormVariants', 'a7', response);
        // response.then(x => console.log('@ UserFormVariants', 'a8', x));
        // return response;

        return response.then(action => {
            this.setState({formLoading: false});
            // console.log('a9', action);

            if (action.type === REGISTER+REJECTED) {
                // console.log('a10', 'An error occurred');
                const p = action.payload;
                const e = p.error;

                if (e) {
                    if (e.message.includes('username is already in use')) {
                        return {
                            validation: {
                                usernameValidServer: e.message,
                            }
                        };
                    }
                }

                console.error('Unknown error in form', action);
                Notifications.UnhandledError('Form error in UserForm_Register_unconnected');
                return;

            } else {
                redirect(UrlBuilder.Login());
                Notifications.Add('success', 'Registration successful', 'You can now log in to your new account');
                return;
            }
        });
    }

    render() {
        // const {username, password, passwordRepeat} = {};
        // const values = {username = '', password, passwordRepeat};

        return <UserForm
            variant='register'
            initialValues={{}}
            formLoading={this.state.formLoading}
            onSubmit={this.handleRegistrationSubmit}
            onChange={handleFormChange_Register_Edit}
        />;
    }
}

class UserForm_Login_unconnected extends Component {
    constructor(props) {
        super(props);

        this.validateFieldNotEmpty = this.validateFieldNotEmpty.bind(this);
        this.handleLoginChange = this.handleLoginChange.bind(this);
        this.handleLoginSubmit = this.handleLoginSubmit.bind(this);

        this.state = {
            formLoading: false,
        };
    }

    handleLoginChange(event, state) {
        const target = event.target;

        const updatedState = { // Manual state update, as passed state is late by 1 onChange event
            ...state,
            [target.id]: target.value
        }

        // Validate only edited field (to not show errors on still untouched fields)
        let validationData = null;
        if (target.id === 'username')
            validationData = {...this.validateFieldNotEmpty(updatedState, 'username')};

        if (target.id === 'password')
            validationData = {...this.validateFieldNotEmpty(updatedState, 'password')};

        // Join all validation data to check full form validity
        validationData = mergeDeep(state.validation, validationData);

        // console.log(validationData);
        // if (validationData.usernameValid && validationData.passwordValid)
        //     validationData.valid = true;
        validationData.valid = validationData.usernameValid && validationData.passwordValid;

        return {
            validation: {
                ...validationData
            }
        };
    }

    validateFieldNotEmpty(state, fieldName) {
        let res = {
            [[fieldName]+'Valid']: false,
            [fieldName]: false,
        }

        if (!state[fieldName] || state[fieldName].length < 1) {
            res[fieldName] = [fieldName].toString().capitalizeFirstLetter()+' should not be empty.';
            return res;
        }

        res[[fieldName]+'Valid'] = true;
        return res;
    }

    /*validateUsername(state) {
        let res = {
            usernameValid: false,
            username: false,
        }

        if (!state.username || state.username.length < 1) {
            res.username = 'Username should not be empty.';
            return res;
        }

        res.usernameValid = true;
        return res;
    }*/

    handleLoginSubmit(event, state) {
        if (!state.validation.valid) {
            console.error('Tried submitting invalid form');
            return;
        }

        this.setState({formLoading: true});
        let response = this.props.login({username: state.username, password: state.password});

        return response.then(action => {
            this.setState({formLoading: false});

            if (action.type === LOG_IN_MANUAL+REJECTED) {
                // console.log('a10', 'An error occurred');
                const p = action.payload;
                // const e = p.error;

                // console.log('z0', p, e);

                if (p && p.code === 401) {
                    return {
                        validation: {
                            alert: {
                                show: true,
                                type: 'danger',
                                message: p.message,
                            }
                        }
                    };
                }

                console.error('Unknown error in form', action);
                Notifications.UnhandledError('Form error in UserForm_Login_unconnected');
                return;

            } else {
                console.log('Login success');
                redirect(UrlBuilder.Home());
                Notifications.Add('success', 'Login successful', '');
                return;
            }
        });
    }

    render() {
        return <UserForm
            variant='login'
            initialValues={{}}
            formLoading={this.state.formLoading}
            onSubmit={this.handleLoginSubmit}
            onChange={this.handleLoginChange}
        />
    }
}

export const UserForm_Register = connect(null, {register})(UserForm_Register_unconnected);
export const UserForm_Login = connect(null, {login})(UserForm_Login_unconnected);