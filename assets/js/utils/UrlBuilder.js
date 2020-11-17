
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
     * Build params url (pagination, ordering) with given values
     * @param page
     * @param perpage
     * @param orderby
     * @param orderdir
     */
    static BuildParamsUrl (page=1, perpage=20, orderby='id', orderdir='DESC') {
        return `?page=${page}&perpage=${perpage}&orderby=${orderby}&orderdir=${orderdir}`;
    }
    /*window.buildParamsUrl = (paramsObj) => {
        return buildParamsUrl(paramsObj.page, paramsObj.perpage, paramsObj.orderby, paramsObj.orderdir);
    }*/
    /**
     * Read currently set params, as string. Default values for each param can be passed.
     * @returns {string}
     */
    static ReadParamsUrlWithDefaults (page=1, perpage=20, orderby='id', orderdir='DESC') {
        const o = UrlBuilder.ReadParamsObjectWithDefaults(page, perpage, orderby, orderdir);
        return UrlBuilder.BuildParamsUrl(o.page, o.perpage, o.orderby, o.orderdir);
    }
    /**
     * Read currently set params, as object. Default values for each param can be passed.
     * @returns {{perpage: (*|number), orderby: (*|string), page: (*|number), orderdir: string}}
     */
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
     */
    static ReadParamsUrlWithReplace (page=null, perpage=null, orderby=null, orderdir=null) {
        let o = UrlBuilder.ReadParamsObjectWithDefaults();
        page !== null ? o.page = page : null;
        perpage !== null ? o.perpage = perpage : null;
        orderby !== null ? o.orderby = orderby : null;
        orderdir !== null ? o.orderdir = orderdir : null;

        return UrlBuilder.BuildParamsUrl(o.page, o.perpage, o.orderby, o.orderdir);
    }

}