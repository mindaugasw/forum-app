
export default class UrlBuilder {

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
