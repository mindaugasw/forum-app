import {Helmet} from "react-helmet";
import React from "react";
import {history} from "../components/ReactApp";

class Utils {
    static Redirect(path) {
        history.push(path);
    }

    /**
     * Deep-merge source into target object.
     * Does immutable merge.
     * From https://stackoverflow.com/a/37164538/4110469
     * @param target
     * @param source
     * @returns {*}
     */
    static MergeDeep(target, source) {
        let output = Object.assign({}, target);
        if (Utils.IsObject(target) && Utils.IsObject(source)) {
            Object.keys(source).forEach(key => {
                if (Utils.IsObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = Utils.MergeDeep(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    static IsObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }

    /**
     * Dynamically imports zxcvbn library to global scope, to avoid big
     * library load when unnecessary
     */
    static ImportZxcvbn() {
        if (!window.zxcvbn) {
            import('zxcvbn').then(zxcvbn => {
                window.zxcvbn = zxcvbn;
            });
        }
    }

    /**
     * Safely evaluate possibly-undefined value
     * @param fn Value to evaluate
     * @param defaultVal Default value, in case fn throws up
     * @returns {*}
     */
    static GetSafe(fn, defaultVal) {
        try {
            return fn();
        } catch (e) {
            return defaultVal;
        }
    }
}

/**
 * Provides tab titles for various pages. Returned result needs to be rendered to take effect.
 * @type {Utils.Titles}
 */
Utils.Titles = class {
    static appName = 'Forum App';

    static GetTitle(title) {
        return <Helmet><title>{title}</title></Helmet>;
    }

    static GetTitleWithAppName(title) {
        return <Helmet><title>{title} - {this.appName}</title></Helmet>;
    }

    static Homepage() {
        return this.GetTitle(this.appName);
    }

    static ThreadView(threadName) {
        return this.GetTitleWithAppName(threadName);
    }

    static ThreadNew() {
        return this.GetTitleWithAppName('New topic');
    }

    static Login() {
        return this.GetTitleWithAppName('Login');
    }

    static Register() {
        return this.GetTitleWithAppName('Register');
    }
}

export default Utils;