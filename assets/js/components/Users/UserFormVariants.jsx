import React, {Component} from "react";
import PropTypes from 'prop-types';
import UserForm from "./UserForm";
import {connect} from "react-redux";
import {editUser, register, REGISTER} from "../../redux/usersCRUD";
import {login, LOG_IN_MANUAL, tokenRefresh} from "../../redux/auth";
import UrlBuilder from "../../utils/UrlBuilder";
import Notifications from "../../utils/Notifications";
import Utils from "../../utils/Utils";
import FormUtils from "../../utils/FormUtils";
import {Form} from "react-bootstrap";

// TODO refactor

function handleFormChange_Register_Edit(event, state) {
    // TODO method almost the same as login form change handler
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
    validationData = Utils.MergeDeep(state.validation, validationData);

    // if (validationData.usernameValid && validationData.passwordValid)
    //     validationData = true;
    validationData.valid = validationData.usernameValid && validationData.passwordValid;

    return {
        validation: {
            ...validationData
        }
    };
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

class UserForm_Register_connected extends Component {
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

        return this.props.register({username: state.username, password: state.password})
            .then(action => {
            this.setState({formLoading: false}); // TODO dont update on success

            if (action.type === REGISTER+REJECTED) {
                const p = action.payload;
                const e = p.error;

                if (e) {
                    if (e.message.includes('username is already in use')) {
                        return {
                            validation: {
                                usernameServer: e.message,
                            }
                        };
                    }
                }

                console.error('Unknown error in form', action);
                Notifications.UnhandledError('Form error in UserForm_Register_unconnected');
                return;

            } else {
                Utils.Redirect(UrlBuilder.Login());
                Notifications.Add({type:'success', headline:'Registration successful', message:'You can now log in to your new account'});
                return;
            }
        });
    }

    render() {
        return <UserForm
            variant='register'
            initialValues={{}}
            formLoading={this.state.formLoading}
            onSubmit={this.handleRegistrationSubmit}
            onChange={handleFormChange_Register_Edit}
        />;
    }
}
export const UserForm_Register = connect(null, {register})(UserForm_Register_connected);



// --- Login form ---
class UserForm_Login_connected extends Component {
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
        };

        // Validate only edited field (to not show errors on still untouched fields)
        let validationData = null;
        if (target.id === 'username')
            validationData = {...this.validateFieldNotEmpty(updatedState, 'username')};

        if (target.id === 'password')
            validationData = {...this.validateFieldNotEmpty(updatedState, 'password')};

        // Join all validation data to check full form validity
        validationData = Utils.MergeDeep(state.validation, validationData);

        validationData.valid = validationData.usernameValid && validationData.passwordValid;

        return {
            validation: {
                ...validationData
            }
        };
    }

    validateFieldNotEmpty(state, fieldName) {
        // TODO replace with FormUtils.ValidateTextField
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
                const p = action.payload;

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
                Notifications.UnhandledError('Form error in UserForm_Login_unconnected', action);
                return;

            } else {
                console.log('Login success');
                Utils.Redirect(UrlBuilder.Home());
                Notifications.Add({type:'success', headline:'Login successful'});
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
export const UserForm_Login = connect(null, {login})(UserForm_Login_connected);



// --- Edit form ---
class UserForm_Edit_connected extends Component {
    constructor(props) {
        super(props);

        this.handleEditChange = this.handleEditChange.bind(this);
        this.handleEditSubmit = this.handleEditSubmit.bind(this);
        this.handleCancelClick = this.handleCancelClick.bind(this);
        this.validateFullForm = this.validateFullForm.bind(this);

        this.state = {
            formLoading: false,
        };
    }

    /**
     * Validates currentPassword, newPassword, and newPasswordRepeat. Allows all three
     * values being blank.
     * @param state
     */
    validatePasswordChange(state) {
        const u = state.user;
        // let currentPasswordValidated = false;

        // If either newPassword or newPasswordRepeat not blank, validate all 3 fields (including current password)
        if (   (u.newPassword && u.newPassword.length > 0)
            || (u.newPasswordRepeat && u.newPasswordRepeat.length > 0)  ) {

            // currentPasswordValidated = true;
            return {
                ...FormUtils.ValidateTextField(
                    u.currentPassword,
                    'currentPassword',
                    {minLength: 1, errorMessage: 'Current password should not be empty.'}
                ),
                ...FormUtils.ValidateNewPassword(state, true),
            };
        }

        // if (!currentPasswordValidated && state.validation.currentPassword) {
        //
        // }

        /*if ((u.currentPassword && u.currentPassword.length > 0) // if at least one field isn't empty, validate all
            || (u.newPassword && u.newPassword.length > 0)
            || (u.newPasswordRepeat && u.newPasswordRepeat.length > 0) )
        {
            return {
                ...FormUtils.ValidateTextField(
                    u.currentPassword,
                    'currentPassword',
                    {minLength: 1, errorMessage: 'Current password should not be empty.'}
                ),
                ...FormUtils.ValidateNewPassword(state, false),
            };
        }*/ else {
            return {
                currentPasswordValid: true,
                newPasswordValid: true,
                // newPasswordRepeatValid: true,

                currentPassword: false,
                newPassword: false,
                newPasswordRepeat: false,

                pswStr: {
                    show: false,
                    score: false,
                    pass: false,
                    feedbackWarning: false,
                    feedbackSuggestions: false,
                },
            };
        }
    }

    validateFullForm(state) {
        let validationData = {
            ...FormUtils.ValidateRoles(state, this.props.user, this.props.authUser),
            ...this.validatePasswordChange(state)
        };

        validationData = Utils.MergeDeep(state.validation, validationData);
        validationData.valid =
            validationData.rolesValid &&
            validationData.currentPasswordValid &&
            validationData.newPasswordValid;

        return {
            validation: {
                ...validationData,
            }
        };
    }

    handleEditChange(target, state) {
        let validationData = {};

        // Validate changed field
        if (target.name === 'roles') {
            validationData = FormUtils.ValidateRoles(state, this.props.user, this.props.authUser);
        }

        if (target.id === 'currentPassword' || target.id === 'newPassword' || target.id === 'newPasswordRepeat') {
            // validationData = FormUtils.ValidateNewPassword(state, true);
            validationData = this.validatePasswordChange(state);
        }

        validationData = Utils.MergeDeep(state.validation, validationData);

        // Check if all validations passed
        let validationCriteria = [];
        if (Utils.Roles.IsUserAdmin(this.props.authUser))
            validationCriteria.push(validationData.rolesValid);

        if (this.props.authUser.id === this.props.user.id) {
            validationCriteria.push(validationData.currentPasswordValid);
            validationCriteria.push(validationData.newPasswordValid);
        }

        validationData.valid =
            validationCriteria.length === 0 ||
            validationCriteria.every(v => v === true);

        return {
            validation: {
                ...validationData
            }
        };
    }

    handleEditSubmit(event, state) {
        if (!state.validation.valid) {
            console.error('Tried submitting invalid form');
            Notifications.UnhandledError('Tried submitting invalid form');
            return;
        }

        this.setState({formLoading: true});

        return this.props.editUser({
            id: this.props.user.id,
            roles: state.user.roles || null,
            oldPassword: state.user.currentPassword || null,
            newPassword: state.user.newPassword || null,
        }).then(action => {
            if (action.type.endsWith(REJECTED)) {
                this.setState({formLoading: false});

                const p = action.payload;
                const e = p.error;

                if ((e && e.status === 401) || (p.code && p.code === 401)) {
                    Notifications.Unauthorized();
                    console.error('Unauthorized user edit', action);
                    return;
                } else if (e) {
                    if (e.status === 400 && e.message.includes('Password does not match')) {
                        return {
                            validation: {
                                currentPasswordServer: e.message,
                            }
                        };
                    }
                }

                console.error('Unknown error in user form', action);
                Notifications.UnhandledError('UserForm_Edit submit error', action);
                return;
            } else {
                if (this.props.user.id === this.props.authUser.id)
                    this.props.tokenRefresh(); // if user edited himself, update auth user state

                Utils.Redirect(UrlBuilder.Users.Single(this.props.user.id));
                Notifications.Add({type:'success', headline:'User profile updated'});
                return;
            }
        });
    }

    handleCancelClick(event) {
        event.preventDefault();

        Utils.Redirect(UrlBuilder.Users.Single(this.props.user.id));
    }

    render() {
        return (
            <UserForm
                variant='edit'
                initialValues={this.props.user}
                formLoading={this.state.formLoading}
                onChange={this.handleEditChange}
                onSubmit={this.handleEditSubmit}
                onCancel={this.handleCancelClick}
                onValidateFullForm={this.validateFullForm}
            />
        );
    }
}
const mapDispatchToProps_Edit = {
    editUser,
    tokenRefresh,
}
const mapStateToProps_Edit = state => {
    return {
        authUser: state.auth.user,
    };
}
export const UserForm_Edit = connect(mapStateToProps_Edit, mapDispatchToProps_Edit)(UserForm_Edit_connected);
UserForm_Edit.propTypes = {
    user: PropTypes.object.isRequired, // User object to edit

    // Redux:
    // authUser: PropTypes.object.isRequired, // Currently logged in user

    // editUser: PropTypes.func.isRequired,
    // tokenRefresh: PropTypes.func.isRequired,
}