import React, {Component} from "react";
import UserForm from "./UserForm";

function handleRegistrationSubmit(state) {
    // event.preventDefault();

    // const form = event.target;
    // return {validUsername: 'Username does not meet requirements.'};

    return validateRegistrationForm(state);
}

function handleFormChange(event, state) {
    const target = event.target;

    // TODO validate all fields as they're being typed

    if (target.id === 'password' || target.id === 'passwordRepeat') {
        const updatedState = { // Manual state update, as passed state is late by 1 onChange event
            ...state,
            [target.id]: target.value
        }

        return {
            validation: validatePassword(updatedState),
        }
    }
}

function validatePassword(state) {
    const s = state;
    let res = {
        valid: false,
        passwordRepeat: false, // error message under password repeat
        pswStrNumber: false, // strength meter value
        pswStrFlavor: false, // strength meter color
        pswStrText: 'too weak', // strength meter message
        // pswStrTip: false, // zxcvbn password improve tip
    };

    if (!s.password && !s.passwordRepeat) // Both passwords empty
        return res;

    if (s.password !== s.passwordRepeat) {
        res.passwordRepeat = 'Passwords do not match.';
        return res;
    }

    const pswTested = s.password.length > 100 ? s.password.substring(0, 100) : s.password; // Long strings are cut for performance
    const z = zxcvbn.default(pswTested, [s.username]);
    console.log(z);

    res.pswStrNumber = Math.max(z.score * 25, 10);
    switch (z.score) {
        case 0:
        case 1:
            res.pswStrFlavor = 'danger';
            res.pswStrText = 'very weak'
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
    res.pswStrText =
        <>
            Password strength: {res.pswStrText}.<br/>
            {z.feedback.warning ? <>{z.feedback.warning}<br/></> : null}
            {z.feedback.suggestions ? <>{z.feedback.suggestions}</> : null }
        </>;

    if (z.score > 1)
        res.valid = true;

    return res;
}

function validateRegistrationForm(state) {
    const s = state;
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

    return v;
}


export class UserForm_Register extends Component {
    constructor(props) {
        super(props);

        this.state = {
            THIS_ONE: 1
        }
    }


    render() {
        const {username, password, passwordRepeat} = this.state
        const values = {username, password, passwordRepeat};

        return <UserForm
            variant='register'
            values={values}
            onSubmit={handleRegistrationSubmit}
            onChange={handleFormChange}
        />;
    }
}