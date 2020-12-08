import {Helmet} from "react-helmet";
import React from "react";
import {history} from "../components/ReactApp";

/**
 * Various small functions that do not fit anywhere else
 */
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

    // Used in MergeDeep
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
 * User-roles related utils
 */
Utils.Roles = class {
    /**
     * Checks if given user has given role. If user is null, will return false.
     * @param {object} user
     * @param {string} role
     * @returns {boolean}
     */
    static HasUserRole(user, role) {
        return user && user.roles.indexOf(role) > -1;
    }

    /**
     * Checks if given user is an admin (i.e. has ROLE_ADMIN role)
     * @param {object} user
     * @returns {boolean}
     */
    static IsUserAdmin(user) {
        return this.HasUserRole(user, 'ROLE_ADMIN');
    }

    /**
     * Does given user have permissions to manage (edit, delete) given thread/comment?
     * Checks if user is admin or author of that thread/comment.
     * @param {object} user
     * @param {object} post Thread or comment object
     * @returns {boolean}
     */
    static CanUserManagePost(user, post) {
        return this.IsUserAdmin(user) || (user && user.id === post.author.id);
    }
}

/**
 * Provides tab titles for various pages. Returned result needs to be rendered to take effect.
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

    static UsersList() {
        return this.GetTitleWithAppName('Users');
    }

    static UserSingle(username) {
        return this.GetTitleWithAppName(username);
    }
}

export default Utils;