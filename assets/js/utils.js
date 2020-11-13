
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