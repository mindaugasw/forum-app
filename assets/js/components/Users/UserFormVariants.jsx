import React, {Component} from "react";
import UserForm from "./UserForm";
import {connect} from "react-redux";
import {register, REGISTER, FULFILLED, REJECTED} from "../../redux/usersCRUD";


function handleFormChange(event, state) {
    const target = event.target;

    // TODO validate all fields as they're being typed

    const updatedState = { // Manual state update, as passed state is late by 1 onChange event
        ...state,
        [target.id]: target.value
    }

    return  {
        validation: {
            valid: false,
            ...validateRegistrationForm(updatedState),
        }
    };

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

function validatePassword(state, allowEmpty = false) {
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
    res.pswStrFeedback =
        <>
            {z.feedback.warning ? <>{z.feedback.warning}<br/></> : null}
            {z.feedback.suggestions ? <>{z.feedback.suggestions}</> : null }
        </>;

    if (z.score > 1 || APP_ENV === 'dev')
        res.passwordValid = !res.passwordRepeat; // Only valid if there's no password repeat message (ie passwords match)

    return res;
}
function validateUsername(state) {
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
        ...validateUsername(state),
        ...validatePassword(state, false),
    }

    if (res.usernameValid && res.passwordValid)
        res.valid = true;

    return res;
}


const mapDispatchToProps = {
    register
}

class UserForm_Register_unconnected extends Component {
    constructor(props) {
        super(props);

        this.handleRegistrationSubmit = this.handleRegistrationSubmit.bind(this);
    }

    handleRegistrationSubmit(event, state) {
        if (!state.validation.valid) {
            console.error('@ UserFormVariants', 'a1 Tried submitting invalid form');
            return;
        }

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
            console.log('a9', action);

            if (action.type === REGISTER+REJECTED) {
                console.log('a10', 'An error occurred');
            } else {
                console.log('a11', 'Registration success');
            }

            return action;
        });

    }


    render() {
        // const {username, password, passwordRepeat} = {};
        // const values = {username = '', password, passwordRepeat};

        return <UserForm
            variant='register'
            initialValues={{}}
            onSubmit={this.handleRegistrationSubmit}
            onChange={handleFormChange}
        />;
    }
}

export const UserForm_Register = connect(null, mapDispatchToProps)(UserForm_Register_unconnected);