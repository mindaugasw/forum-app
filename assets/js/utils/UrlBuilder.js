/**
 * Defines paths for frontend routing and provides path building utilities
 */
class UrlBuilder {

    static Home() { return '/'; }
    static Login() { return '/login'; }
    static Logout() { return '/logout'; }
    static Register() { return '/register'; }
    static About() { return '/about'; }


    /**
     * Generate avatar link from robohash.org
     * @param hash
     * @param bg Background set: 1 or 2. Will be skipped if falsy value passed
     * @param size Image size (square). Will be skipped if falsy value passed
     */
    static RoboHash(hash, bg=null, size=null) {
        return `https://robohash.org/${hash}?${bg ?
            'bgset=bg'+bg : ''}&${size ? `size=${size}x${size}` : ''}`;
    }

    /**
     * Find GET parameter in the url and return its value or null, if not found.
     * @param name
     * @returns {null}
     */
    static FindGetParameter (name) {
        let result = null,
            tmp = [];
        location.search
            .substr(1)
            .split("&")
            .forEach(function (item) {
                tmp = item.split("=");
                if (tmp[0] === name) result = decodeURIComponent(tmp[1]);
            });
        return result;
    }

    /**
     * Get ListGetParams object with appropriate GET params. Attempts to read each param
     * from the address bar or uses passed default value.
     * @param defaults
     * @returns {ListGetParams}
     * @constructor
     */
    static ReadParamsWithDefaults(defaults) {
        return new ListGetParams(
            UrlBuilder.FindGetParameter('page') || defaults.page,
            UrlBuilder.FindGetParameter('perpage') || defaults.perpage,
            UrlBuilder.FindGetParameter('orderby') || defaults.orderby,
            (UrlBuilder.FindGetParameter('orderdir') || defaults.orderdir).toUpperCase()
        );
    }

    /**
     * Get ListGetParams object with appropriate GET params, but replace any specified values.
     * Values priority:
     * 1. From passed 'replace' object
     * 2. Read from address bar (if there's no replace value for it)
     * 3. Use value from 'defaults' object
     * @param replace Highest priority values, will be always used
     * @param defaults Lowest priority values, will be used only if there's no value in
     * 'replace' and no GET param found
     * @returns {ListGetParams}
     * @constructor
     */
    static ReadParamsWithReplace(replace, defaults) {
        return new ListGetParams(
            replace.page || UrlBuilder.FindGetParameter('page') || defaults.page,
            replace.perpage || UrlBuilder.FindGetParameter('perpage') || defaults.perpage,
            replace.orderby || UrlBuilder.FindGetParameter('orderby') || defaults.orderby,
            replace.orderdir || (UrlBuilder.FindGetParameter('orderdir') || defaults.orderdir).toUpperCase()
        );
    }
}

UrlBuilder.Threads = class Threads {
    static Index() { return '/threads'; }
    static Single(id) { return `${Threads.Index()}/${id}`; }
    // static SingleMatchPath() { return `${Threads.Index()}/:id`; }
    static Create() { return `${Threads.Index()}/create`; }
}

UrlBuilder.Users = class Users {
    static List() { return '/users'; }
    static Single(id) { return `${Users.List()}/${id}`; }
    static Edit(id) { return `${Users.List()}/${id}/edit`; }
}

/**
 * Defines GET params for lists: page, perpage, orderby, orderdir
 */
export class ListGetParams {
    constructor(page, perpage, orderby, orderdir) {
        this.page = page;
        this.perpage = perpage;
        this.orderby = orderby;
        this.orderdir = orderdir;
    }
}

ListGetParams.prototype.GetUrl = function () {
    return `?page=${this.page}&perpage=${this.perpage}&orderby=${this.orderby}&orderdir=${this.orderdir}`;
};

export default UrlBuilder;