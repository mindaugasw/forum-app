module.exports = {
    extends: ['eslint:recommended', 'plugin:react/recommended'],
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        }
    },
    env: {
        browser: true,
        es6: true,
        node: true
    },
    rules: {
        "no-console": 0,
        "no-unused-vars": 0,
        "no-case-declarations": 0,
        "react/prop-types": 0
    },
    globals: {
        "getSafe": true,
        "store": true,
        "LoadState": true,
        "APP_ENV": true,
        "importZxcvbn": true,
        "zxcvbn": true,
        "isObject": true,
        "mergeDeep": true,
        "redirect": true,
        "FULFILLED": true,
        "REJECTED": true,
        "PENDING": true,
    },
    "parser": "babel-eslint"
};