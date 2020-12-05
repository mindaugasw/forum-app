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


// --- Registration form ---
class UserForm_Register_connected extends Component {
    constructor(props) {
        super(props);

        this.handleRegistrationChange = this.handleRegistrationChange.bind(this);
        this.handleRegistrationSubmit = this.handleRegistrationSubmit.bind(this);

        this.state = {
            formLoading: false
        };
    }

    handleRegistrationChange(target, state) {
        let validationData = {};

        if (target.id === 'username')
            validationData = FormUtils.ValidateTextField(
                state.user.username,
                'username', {
                    minLength: 4,
                    maxLength: 25,
                    errorMessage: 'Username does not meet requirements'
            });

        if (target.id === 'newPassword' || target.id === 'newPasswordRepeat')
            validationData = FormUtils.ValidateNewPassword(state, false);

        // Join all validation data to check full form validity
        validationData = Utils.MergeDeep(state.validation, validationData);

        // validationData.valid = validationData.usernameValid && validationData.passwordValid;
        validationData.valid = validationData.usernameValid && validationData.newPasswordValid;

        return {
            validation: {
                ...validationData
            }
        };
    }

    handleRegistrationSubmit(event, state) {
        if (!state.validation.valid) {
            console.error('Tried submitting invalid form');
            Notifications.UnhandledError('Tried submitting invalid form');
            return;
        }

        this.setState({formLoading: true});

        return this.props.register({username: state.user.username, password: state.user.newPassword})
            .then(action => {

            if (action.type.endsWith(REJECTED)) {

                this.setState({formLoading: false});
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

                console.error('UserForm_Register submit error', action);
                Notifications.UnhandledError('UserForm_Register submit error', action);
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
            initialValues={null}
            formLoading={this.state.formLoading}
            onChange={this.handleRegistrationChange}
            onSubmit={this.handleRegistrationSubmit}
        />;
    }
}
const mapDispatchToProps_Register = {
    register
}
export const UserForm_Register = connect(null, mapDispatchToProps_Register)(UserForm_Register_connected);
UserForm_Register.propTypes = {
    // Redux:
    // register: PropTypes.func.isRequired,
}


// --- Login form ---
class UserForm_Login_connected extends Component {
    constructor(props) {
        super(props);

        this.handleLoginChange = this.handleLoginChange.bind(this);
        this.handleLoginSubmit = this.handleLoginSubmit.bind(this);

        this.state = {
            formLoading: false,
        };
    }

    handleLoginChange(target, state) {
        let validationData = {};

        if (target.id === 'username')
            validationData = FormUtils.ValidateTextField(state.user.username, 'username', {minLength: 1, errorMessage: 'Username should not be empty'});

        if (target.id === 'currentPassword')
            validationData = FormUtils.ValidateTextField(state.user.currentPassword, 'currentPassword', {minLength: 1, errorMessage: 'Password should not be empty'});

        // Join all validation data to check full form validity
        validationData = Utils.MergeDeep(state.validation, validationData);

        validationData.valid = validationData.usernameValid && validationData.currentPasswordValid;

        return {
            validation: {
                ...validationData
            }
        };
    }

    handleLoginSubmit(event, state) {
        if (!state.validation.valid) {
            console.error('Tried submitting invalid form');
            Notifications.UnhandledError('Tried submitting invalid form');
            return;
        }

        this.setState({formLoading: true});


        return this.props.login({username: state.user.username, password: state.user.currentPassword})
            .then(action => {
            if (action.type.endsWith(REJECTED)) {
                this.setState({formLoading: false});
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

                console.error('UserForm_Login submit error', action);
                Notifications.UnhandledError('UserForm_Login submit error', action);
                return;

            } else {
                console.debug('Login success');
                Utils.Redirect(UrlBuilder.Home());
                Notifications.Add({type:'success', headline:'Login successful'});
                return;
            }
        });
    }

    render() {
        return <UserForm
            variant='login'
            initialValues={null}
            formLoading={this.state.formLoading}
            onChange={this.handleLoginChange}
            onSubmit={this.handleLoginSubmit}
        />
    }
}
const mapDispatchToProps_Login = {
    login
}
export const UserForm_Login = connect(null, mapDispatchToProps_Login)(UserForm_Login_connected);
UserForm_Login.propTypes = {
    // Redux:
    // login: PropTypes.func.isRequired,
}


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

        if (target.name === 'roles') {
            validationData = FormUtils.ValidateRoles(state, this.props.user, this.props.authUser);
        }

        if (target.id === 'currentPassword' || target.id === 'newPassword' || target.id === 'newPasswordRepeat') {
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