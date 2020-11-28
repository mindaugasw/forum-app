class FormUtils {
    /**
     *
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
}

export default FormUtils;