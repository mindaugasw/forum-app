import Utils from "./Utils";

class FormUtils {
    /**
     * Validates that given input is between required length
     * @param {string} input Input string
     * @param {string} fieldName
     * @param {minLength<number>,
     *         maxLength<number>,
     *         errorMessage<string>} options
     * @return Validation object, e.g. {fieldNameValid<boolean>, fieldName<string>: 'FieldName does not meet requirements'}
     */
    static ValidateTextField(input, fieldName, options={}) {
        let res = {
            [[fieldName]+'Valid']: false, // Is this input valid?
            [fieldName]: false, // Error message for this input (no message if falsy value)
        };

        // Override not provided inputs with defaults, to avoid additional null checking
        if (input === null)
            input = '';

        options = {
            minLength: -1,
            maxLength: -1,
            errorMessage: fieldName.capitalizeFirstLetter() + ' does not meet requirements.',
            ...options
        };

        if ((options.minLength !== -1 && input.length < options.minLength)
            || (options.maxLength !== -1 && input.length > options.maxLength)) {

            res[fieldName] = options.errorMessage;
            return res;
        }

        res[[fieldName]+'Valid'] = true;
        return res;
    }

    /**
     * Validates new password: that newPassword and newPasswordRepeat matches and
     * password is strong enough
     * @param {object} state Form component state
     * @param {boolean} allowEmpty Should empty password fields be considered valid?
     */
    static ValidateNewPassword(state, allowEmpty = false) {
        const psw = state.user.newPassword;
        const pswRepeat = state.user.newPasswordRepeat;

        let res = {
            newPasswordValid: false,

            newPassword: false, // feedback messages
            newPasswordRepeat: false,

            pswStr: {
                show: false,
                score: false,
                pass: false,
                feedbackWarning: false,
                feedbackSuggestions: false,
            }
        };

        if (!psw && !pswRepeat) { // Both passwords empty
            res.newPasswordValid = allowEmpty; // If editing user, password optional and is valid if empty
            return res;
        }

        if (psw !== pswRepeat) {
            res.newPasswordRepeat = 'Passwords do not match.';
            // return res; // Show password strength even if passwords don't match
        }

        const pswTested = psw.length > 75 ? psw.substring(0, 75) : psw; // Test only first x chars for performance reasons
        const z = zxcvbn.default(pswTested, [state.user.username]);

        res.pswStr = {
            show: true,
            score: z.score,
            pass: z.score > 1 || APP_ENV === 'dev', // allow weak password for dev
            feedbackWarning: z.feedback.warning || false,
            // feedbackSuggestions: z.feedback.suggestions ? z.feedback.suggestions.join(' ') : false,
            feedbackSuggestions: z.feedback.suggestions && z.feedback.suggestions.length > 0 ?
                z.feedback.suggestions : false,
            // feedbackSuggestions: z.feedback.suggestions ? Utils.FormatZxcvbnSuggestions(z.feedback.suggestions) : false,
        };

        res.newPasswordValid = res.pswStr.pass && !res.newPasswordRepeat; // Only valid if there's no password repeat error message (and zxcvbn passes)

        return res;
    }

    /**
     * Validates roles. Will always return 'valid'. If removing yourself from admins,
     * will add a warning.
     * @param state Form component state
     * @param userSubjectInitial User object that is being edited, in its original state, before any edits
     * @param authUser Currently logged in user
     */
    static ValidateRoles(state, userSubjectInitial, authUser) {
        let res = {
            rolesValid: true, // Roles will be always valid. Invalid roles are ignored by the server
            roles: false,
        };

        // Add warning for removing yourself from admins
        if (userSubjectInitial && authUser
            && userSubjectInitial.id === authUser.id
            && Utils.Roles.IsUserAdmin(userSubjectInitial)
            && !Utils.Roles.IsUserAdmin(state.user) )
            res.roles = 'Warning: you will not be able to promote yourself back to admin!';

        return res;
    }
}

export default FormUtils;