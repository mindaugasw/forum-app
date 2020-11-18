
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

    /*
     * Build params url (pagination, ordering) with given values
     * @param page
     * @param perpage
     * @param orderby
     * @param orderdir
     *
    static BuildParamsUrl (page=1, perpage=20, orderby='id', orderdir='DESC') {
        return `?page=${page}&perpage=${perpage}&orderby=${orderby}&orderdir=${orderdir}`;
    }
    /*window.buildParamsUrl = (paramsObj) => {
        return buildParamsUrl(paramsObj.page, paramsObj.perpage, paramsObj.orderby, paramsObj.orderdir);
    }*
    /**
     * Read currently set params, as string. Default values for each param can be passed.
     * @returns {string}
     *
    static ReadParamsUrlWithDefaults (page=1, perpage=20, orderby='id', orderdir='DESC') {
        const o = UrlBuilder.ReadParamsObjectWithDefaults(page, perpage, orderby, orderdir);
        return UrlBuilder.BuildParamsUrl(o.page, o.perpage, o.orderby, o.orderdir);
    }
    /**
     * Read currently set params, as object. Default values for each param can be passed.
     * @returns {{perpage: (*|number), orderby: (*|string), page: (*|number), orderdir: string}}
     *
    static ReadParamsObjectWithDefaults (page=1, perpage=20, orderby='id', orderdir='DESC') {
        return {
            page: UrlBuilder.FindGetParameter('page') || page,
            perpage: UrlBuilder.FindGetParameter('perpage') || perpage,
            orderby: UrlBuilder.FindGetParameter('orderby') || orderby,
            orderdir: (UrlBuilder.FindGetParameter('orderdir') || orderdir).toUpperCase()
        };
    }
    /**
     * Get url with currently set params, replacing with given value any that are not null
     * @param page
     * @param perpage
     * @param orderby
     * @param orderdir
     *
    static ReadParamsUrlWithReplace (page=null, perpage=null, orderby=null, orderdir=null) {
        let o = UrlBuilder.ReadParamsObjectWithDefaults();
        page !== null ? o.page = page : null;
        perpage !== null ? o.perpage = perpage : null;
        orderby !== null ? o.orderby = orderby : null;
        orderdir !== null ? o.orderdir = orderdir : null;

        return UrlBuilder.BuildParamsUrl(o.page, o.perpage, o.orderby, o.orderdir);
    }
    */
    // ------------------------------------

    static ReadParamsWithDefaults(defaults) {
        return new ListGetParams(
            UrlBuilder.FindGetParameter('page') || defaults.page,
            UrlBuilder.FindGetParameter('perpage') || defaults.perpage,
            UrlBuilder.FindGetParameter('orderby') || defaults.orderby,
            (UrlBuilder.FindGetParameter('orderdir') || defaults.orderdir).toUpperCase()
        );

        //---
        /*return {
            page: UrlBuilder.FindGetParameter('page') || defaults.page,
            perpage: UrlBuilder.FindGetParameter('perpage') || defaults.perpage,
            orderby: UrlBuilder.FindGetParameter('orderby') || defaults.orderby,
            orderdir: (UrlBuilder.FindGetParameter('orderdir') || defaults.orderdir).toUpperCase()
        };*/
        // ---
        /*return {
            page: UrlBuilder.FindGetParameter('page') || paramsObj.page || 1,
            perpage: UrlBuilder.FindGetParameter('perpage') || paramsObj.perpage || 20,
            orderby: UrlBuilder.FindGetParameter('orderby') || paramsObj.orderby || 'id',
            orderdir: (UrlBuilder.FindGetParameter('orderdir') || paramsObj.orderdir || 'DESC').toUpperCase()
        };*/

        /*return {
            page: UrlBuilder.FindGetParameter('page') || page,
            perpage: UrlBuilder.FindGetParameter('perpage') || perpage,
            orderby: UrlBuilder.FindGetParameter('orderby') || orderby,
            orderdir: (UrlBuilder.FindGetParameter('orderdir') || orderdir).toUpperCase()
        };*/
    }

    static ReadParamsWithReplace(replace, defaults) {
        return new ListGetParams(
            replace.page || UrlBuilder.FindGetParameter('page') || defaults.page,
            replace.perpage || UrlBuilder.FindGetParameter('perpage') || defaults.perpage,
            replace.orderby || UrlBuilder.FindGetParameter('orderby') || defaults.orderby,
            replace.orderdir || (UrlBuilder.FindGetParameter('orderdir') || defaults.orderdir).toUpperCase()
        );
        // ---
        /*return {
            page: replace.page || UrlBuilder.FindGetParameter('page') || defaults.page,
            perpage: replace.perpage || UrlBuilder.FindGetParameter('perpage') || defaults.perpage,
            orderby: replace.orderby || UrlBuilder.FindGetParameter('orderby') || defaults.orderby,
            orderdir: replace.orderdir || (UrlBuilder.FindGetParameter('orderdir') || defaults.orderdir).toUpperCase()
        };*/
    }

    /**
     * @param {ListGetParams} paramsObj
     * @returns {string}
     */
    static BuildParamsUrl_v2(paramsObj) {
        /*const page = paramsObj.page || 1;
        const perpage = paramsObj.perpage || 20;
        const orderby = paramsObj.orderby || 'id';
        const orderdir = (paramsObj.orderdir || 'DESC').toUpperCase();

        return `?page=${page}&perpage=${perpage}&orderby=${orderby}&orderdir=${orderdir}`;*/
        // ---
        /*const p = paramsObj;
        return `?page=${p.page}&perpage=${p.perpage}&orderby=${p.orderby}&orderdir=${p.orderdir}`;*/
        //----
        return paramsObj.GetUrl();
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


window.UrlBuilder = UrlBuilder; // TODO remove