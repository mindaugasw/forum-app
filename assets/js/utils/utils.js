import "./dateFormat";
import {history} from "../components/ReactApp";
import UrlBuilder from "./UrlBuilder";

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


// Defined in webpack.config.js
window.APP_ENV = process.env.APP_ENV;

/**
 * Dynamically imports zxcvbn library to global scope
 */
window.importZxcvbn = () => {
    if (!window.zxcvbn) {
        import('zxcvbn').then(zxcvbn => {
            window.zxcvbn = zxcvbn;
        });
    }
}


/**
 * Deep-merge source into target object.
 * Does immutable merge.
 * From https://stackoverflow.com/a/37164538/4110469
 * @param target
 * @param source
 * @returns {*}
 */
window.mergeDeep = (target, source) => {
    let output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = mergeDeep(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}
window.isObject = item => {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

window.mergeDeep_2 = function (...objects) {
    const isObject = obj => obj && typeof obj === 'object';

    return objects.reduce((prev, obj) => {
        Object.keys(obj).forEach(key => {
            const pVal = prev[key];
            const oVal = obj[key];

            if (Array.isArray(pVal) && Array.isArray(oVal)) {
                prev[key] = pVal.concat(...oVal);
            }
            else if (isObject(pVal) && isObject(oVal)) {
                prev[key] = mergeDeep(pVal, oVal);
            }
            else {
                prev[key] = oVal;
            }
        });

        return prev;
    }, {});
}


window.redirect = (path) => {
    history.push(path);
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}