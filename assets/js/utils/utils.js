import "./dateFormat";

/*
 * Random small functions that do not fit anywhere else
 */

/**
 * Safely evaluate possibly-undefined value
 * @param fn Value to evaluate
 * @param defaultVal Default value, in case fn throws up
 * @returns {*}
 */
window.getSafe = (fn, defaultVal) => {
    try {
        return fn();
    } catch (e) {
        return defaultVal;
    }
}

/*
 * Add any property to a promise and return resolved promise
 * @param name
 * @param value
 * @returns {Promise<*>}
 */
/*Promise.prototype.addProperty = function (name, value) {
    return this.then(x => {
        x[name] = value;
        return x;
    });
}*/

/**
 * Defines loading states enum for when boolean value is not enough
 */
window.LoadState = {
    NotRequested: 0,
    Loading: 1,
    Done: 2,
}

/**
 * Generate avatar link from robohash.org
 * @param hash
 * @param bg Background set: 1 or 2. Will be skipped if falsy value passed
 * @param size Image size (square). Will be skipped if falsy value passed
 */
window.roboHash = (hash, bg=null, size=null) => {
    return `https://robohash.org/${hash}?${bg ?
        'bgset=bg'+bg : ''}&${size ? `size=${size}x${size}` : ''}`;
}

// Defined in webpack.config.js, using dotenv module
window.APP_ENV = process.env.APP_ENV;