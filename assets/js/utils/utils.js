import "./dateFormat";

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