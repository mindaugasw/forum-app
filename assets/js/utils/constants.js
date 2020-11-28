/**
 * Defines loading states enum for when boolean value is not enough
 */
window.LoadState = {
    NotRequested: 0,
    Loading: 1,
    Done: 2,
}

// Defined in webpack.config.js
/**
 * App environment: 'dev' or 'prod'
 */
window.APP_ENV = process.env.APP_ENV;

// async thunk type constants, used to combine action type string, e.g. 'auth/tokenRefresh/fulfilled'
window.PENDING = '/pending';
window.FULFILLED = '/fulfilled';
window.REJECTED = '/rejected';