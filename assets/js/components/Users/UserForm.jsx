import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Button, Form, ProgressBar} from "react-bootstrap";
import {Link} from "react-router-dom";
import UrlBuilder from "../../utils/UrlBuilder";
import {UserForm_Edit, UserForm_Login, UserForm_Register} from "./UserFormVariants";
import Utils from "../../utils/Utils";
import AlertWithIcon from "../common/AlertWithIcon";
import Loader from "../common/Loader";

class UserForm extends Component {
    constructor(props) {
        super(props);

        this.handleFormChange = this.handleFormChange.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);

        let iv = {...this.props.initialValues} || { // Set initial input values
            username: '',
            currentPassword: '',
            newPassword: '',
            newPasswordRepeat: '',
            roles: [
                'ROLE_USER'
            ],
        };

        if (!iv.currentPassword) // User returned by API won't have password fields, which causes errors
            iv.currentPassword = '';
        if (!iv.newPassword)
            iv.newPassword = '';
        if (!iv.newPasswordRepeat)
            iv.newPasswordRepeat = '';


        this.state = {
            user: iv, // Input values

            validation: {
                valid: false, // Is entire form valid?

                usernameValid: false, // These values used only internally in UserFormVariants to determine full form validity
                currentPasswordValid: false,
                newPasswordValid: false,
                rolesValid: false,

                username: false, // Validation messages to the user. If false, message won't be rendered
                usernameServer: false, // Validation message from server. Will be set if username is already taken
                roles: false,
                currentPassword: false,
                currentPasswordServer: false,
                newPassword: false,
                newPasswordRepeat: false,

                pswStr: { // Password strength meter feedback
                    show: false,
                    score: false, // zxcvbn score 0-4
                    pass: false,
                    feedbackWarning: false,
                    feedbackSuggestions: false,
                },

                alert: { // Alert for whole form. Currently only shown after unhandled 400 response
                    show: false,
                    type: false,
                    message: false,
                },
            },
        };
    }

    // Component variants shortcuts
    static Register = UserForm_Register;
    static Login = UserForm_Login;
    static Edit = UserForm_Edit;

    componentDidMount() {
        // Initial form validation for pre-filled data
        if (this.props.variant === 'edit') {
            this.setState(state => {
                return { ...Utils.MergeDeep(state, this.props.onValidateFullForm(state)) };
            });
        }
    }

    handleFormChange(event) {
        const target = event.target;

        // Manually merge new state data before passing it for validation
        let targetUpdate = null;
        if (target.type === 'checkbox') { // Custom state merge for checkboxes, {name: value}
            if (target.checked) {
                targetUpdate = {[target.name]: this.state.user[target.name].pushIfNotExist(target.value)};
            } else {
                targetUpdate = {[target.name]: this.state.user[target.name].removeAll(target.value)};
            }
        } else
            targetUpdate = {[target.id]: target.value};

        const updatedState = Utils.MergeDeep(
            this.state,
            {
                user: targetUpdate
            }
        );


        // Callback can return new state data, e.g. validation data
        let validationData = null;
        if (this.props.onChange)
            validationData = this.props.onChange(target, updatedState);

        this.setState({
            ...Utils.MergeDeep(updatedState, validationData)
        });
    }

    handleFormSubmit(event) {
        event.preventDefault();

        this.props.onSubmit(event, this.state).then(newState => {
            if (newState) // If any state was returned, it's likely updated validation data, and form was not submitted
                this.setState(state => {
                    return {
                        ...Utils.MergeDeep(state, newState),
                    };
                })
        });
    }

    render() {
        window.getStuff = () => {
            console.log('STATE', this.state, 'PROPS', this.props);
        };

        if (!this.props.authLoaded) // Auth is needed on edit form
            return <Loader />;

        const u = this.state.user; // User that is edited
        const au = this.props.authUser; // Currently logged in user
        const v = this.state.validation;
        const {handleFormChange, handleFormSubmit} = this;
        const handleCancelClick = this.props.onCancel;

        const {formLoading, variant} = this.props;
        const register = variant === 'register'; // form variant shortcuts
        const login = variant === 'login';
        const edit = variant === 'edit';

        // --- Form fields render methods ---

        function alertJsx() { // For unhandled 400 response information
            return (
                <AlertWithIcon variant={v.alert.type}>
                    {v.alert.message}
                </AlertWithIcon>
            );
        }

        function usernameJsx() { // Show in login and registration form, disabled in edit
            return (
                <Form.Group controlId='username'>
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type='text'
                        maxLength={25}
                        value={u.username}
                        autoComplete='username'
                        disabled={edit}
                        onChange={handleFormChange} />

                    {register ? // Field requirements only for registration
                        <Form.Text className='text-muted'>Should be between 4-25 characters.</Form.Text>
                        : null}

                    {v.username ?
                        <Form.Control.Feedback type='invalid' className='d-block'>{v.username}</Form.Control.Feedback>
                        : null}
                    {v.usernameServer ?
                        <Form.Control.Feedback type='invalid' className='d-block'>{v.usernameServer}</Form.Control.Feedback>
                        : null}

                </Form.Group>
            );
        }

        function rolesJsx() { // Shown in edit form for admins only
            const roles = [
                {
                    value: 'ROLE_USER',
                    label: `User - can create new content, edit their own content, vote on other's content.`,
                    disabled: true,
                },
                {
                    value: 'ROLE_ADMIN',
                    label: `Administrator - can manage other users and their content.`,
                    disabled: false,
                },
            ];

            return (
                <Form.Group controlId='roles'>
                    <Form.Label>Roles</Form.Label>

                    {roles.map(r =>
                        <Form.Check
                            type='checkbox'
                            name='roles'
                            key={r.value}
                            value={r.value}
                            id={r.value}
                            label={r.label}
                            checked={Utils.Roles.HasUserRole(u, r.value)}
                            disabled={r.disabled}
                            onChange={handleFormChange}
                        />
                    )}

                    {v.roles ?
                        <Form.Control.Feedback type='invalid' className='d-block'>{v.roles}</Form.Control.Feedback>
                    : null }
                </Form.Group>
            );
        }

        function currentPasswordJsx() { // Show on login and edit forms
            return (
                <Form.Group controlId='currentPassword'>
                    <Form.Label className={edit ? 'mb-0' : ''}>{edit ? 'Current password' : 'Password'}</Form.Label>
                    {edit ?
                        <Form.Text className='text-muted mt-0'>If you do not want to change password, leave all three fields empty.</Form.Text>
                        : null}

                    <Form.Control
                        type='password'
                        value={u.currentPassword}
                        autoComplete='current-password'
                        onChange={handleFormChange}
                    />

                    {v.currentPassword ?
                        <Form.Control.Feedback type='invalid' className='d-block'>{v.currentPassword}</Form.Control.Feedback>
                        : null}

                    {v.currentPasswordServer ?
                        <Form.Control.Feedback type='invalid' className='d-block'>{v.currentPasswordServer}</Form.Control.Feedback>
                        : null}

                </Form.Group>
            );
        }

        function newPasswordJsx() { // Shown on registration and edit forms, together with newPasswordRepeatJsx
            return (
                <Form.Group controlId='newPassword'>
                    <Form.Label>{register ? 'Password' : 'New password'}</Form.Label>
                    {/*{edit ?
                        <Form.Text className='text-muted mt-0'>If you do not want to change password, leave both fields empty.</Form.Text>
                        : null}*/}

                    <Form.Control
                        type='password'
                        value={u.newPassword}
                        autoComplete='new-password'
                        onChange={handleFormChange}
                    />

                    {v.newPassword ?
                        <Form.Control.Feedback type='invalid' className='d-block'>{v.newPassword}</Form.Control.Feedback>
                        : null}

                </Form.Group>
            );
        }

        function newPasswordRepeatJsx() { // Shown on registration and edit forms, together with newPasswordJsx
            return (
                <Form.Group controlId='newPasswordRepeat'>
                    <Form.Control
                        type='password'
                        value={u.newPasswordRepeat}
                        autoComplete='new-password'
                        onChange={handleFormChange}
                    />
                    <Form.Text className='text-muted'>Repeat {edit? 'new ' : ''}password.</Form.Text>

                    {v.newPasswordRepeat ?
                        <Form.Control.Feedback type='invalid' className='d-block'>{v.newPasswordRepeat}</Form.Control.Feedback>
                        : null}

                </Form.Group>
            );
        }

        function passwordStrengthMeterJsx() {
            let flavor, strengthText;

            switch (v.pswStr.score) {
                case 0:
                case 1:
                    flavor = 'danger';
                    strengthText = 'too weak';
                    break;
                case 2: // minimum passable score
                    flavor = 'warning';
                    strengthText = ' weak';
                    break;
                case 3:
                    flavor = 'info';
                    strengthText = 'strong';
                    break;
                case 4:
                    flavor = 'success';
                    strengthText = 'very strong';
            }

            const meterScore = Math.max(v.pswStr.score * 25, 10);

            return (
                <Form.Group>
                    <ProgressBar striped animated variant={flavor} now={meterScore} />
                    <Form.Text className={`d-block ${!v.pswStr.pass ? 'invalid-feedback' : 'text-muted'}`}>
                        Password strength: {strengthText}
                    </Form.Text>
                    <Form.Text className='text-muted mt-0'>
                        {v.pswStr.feedbackWarning ? <>{v.pswStr.feedbackWarning}<br/></> : null}
                        {v.pswStr.feedbackSuggestions ?
                            <>
                                Some suggestions:
                                <ul>
                                    {v.pswStr.feedbackSuggestions.map(x => <li key={x}>{x}</li>)}
                                </ul>
                            </>
                            : null}
                    </Form.Text>
                </Form.Group>
            );
        }

        function submitButtonJsx() {
            return (
                <Button variant='primary' type='submit' className='mr-2' disabled={!v.valid}>
                    {formLoading ? <><Loader.Small /> </> : ''}

                    {register ? 'Register' : login ? 'Login' : 'Save'}
                </Button>
            );
        }

        function cancelButtonJsx() {
            return (
                <Button variant='outline-secondary' onClick={handleCancelClick}>Cancel</Button>
            );
        }

        return (
            <Form onSubmit={this.handleFormSubmit}>
                <Form.Group>
                    <fieldset disabled={formLoading}>

                        {v.alert.show ? alertJsx() : null}

                        {usernameJsx()}

                        {edit && Utils.Roles.IsUserAdmin(au) ? rolesJsx() : null}

                        {/* Show current psw on login and edit, only if editing your own user */}
                        {login || (edit && au.id === u.id) ? currentPasswordJsx() : null }

                        {register || (edit && au.id === u.id) ?
                            <>
                                {newPasswordJsx()}
                                {newPasswordRepeatJsx()}
                                {v.pswStr.show ?
                                    passwordStrengthMeterJsx()
                                    : null}
                            </>
                            : null}

                        {submitButtonJsx()}

                        {edit ? cancelButtonJsx() : null }


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

    initialValues: PropTypes.object, // User that is being edited. Can be null if not in edit form
    formLoading: PropTypes.bool, // adjusts form style. Can be set to true e.g. after submitting

    // Event callbacks. Can return updated state data, e.g. validation data
    onSubmit: PropTypes.func.isRequired, // On successful submit should not return anything
    onChange: PropTypes.func,
    onCancel: PropTypes.func, // Callback for Cancel button in edit form

    onValidateFullForm: PropTypes.func, // Full form validation callback, used for pre-filled data on edit form

    // Redux state:
    // authUser: PropTypes.object, // Currently logged in user
}

const mapStateToProps = state => {
    return {
        authUser: state.auth.user,
        authLoaded: state.auth.loaded,
    };
}

export default connect(mapStateToProps)(UserForm);