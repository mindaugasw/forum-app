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
 * Build params url (pagination, ordering) with given values
 * @param page
 * @param perpage
 * @param orderby
 * @param orderdir
 *
window.buildParamsUrl = (page=1, perpage=20, orderby='id', orderdir='DESC') => {
    /*let pageStr = page === null ? '' : 'page='+page;
    let perpageStr = perpage === null ? '' : 'perpage='+perpage;
    let orderbyStr = orderby === null ? '' : 'orderby='+orderby;
    let orderdirStr = orderdir === null ? '' : 'orderdir='+orderdir;*

    return `?page=${page}&perpage=${perpage}&orderby=${orderby}&orderdir=${orderdir}`;
}
/*window.buildParamsUrl = (paramsObj) => {
    return buildParamsUrl(paramsObj.page, paramsObj.perpage, paramsObj.orderby, paramsObj.orderdir);
}*
/**
 * Read currently set params, as string. Default values for each param can be passed.
 * @returns {string}
 *
window.readParamsUrlWithDefaults = (page=1, perpage=20, orderby='id', orderdir='DESC') => {
    const o = readParamsObjectWithDefaults(page, perpage, orderby, orderdir);
    return buildParamsUrl(o.page, o.perpage, o.orderby, o.orderdir);
}
/**
 * Read currently set params, as object. Default values for each param can be passed.
 * @returns {{perpage: (*|number), orderby: (*|string), page: (*|number), orderdir: string}}
 *
window.readParamsObjectWithDefaults = (page=1, perpage=20, orderby='id', orderdir='DESC') => {
    return {
        page: findGetParameter('page') || page,
        perpage: findGetParameter('perpage') || perpage,
        orderby: findGetParameter('orderby') || orderby,
        orderdir: (findGetParameter('orderdir') || orderdir).toUpperCase()
    }
}
/**
 * Read currently set params, with given ones any that are not null
 * @param page
 * @param perpage
 * @param orderby
 * @param orderdir
 *
window.readParamsUrlWithReplace = (page=null, perpage=null, orderby=null, orderdir=null) => {
    let o = readParamsObjectWithDefaults(page, perpage, orderby, orderdir);
    page !== null ? o.page = page : null;
    perpage !== null ? o.perpage = perpage : null;
    orderby !== null ? o.orderby = orderby : null;
    orderdir !== null ? o.orderdir = orderdir : null;

    return buildParamsUrl(o.page, o.perpage, o.orderby, o.orderdir);
}
// TODO move above methos to UrlBuilder class?
 */

/**
 * Add any property to a promise and return resolved promise
 * @param name
 * @param value
 * @returns {Promise<*>}
 */
Promise.prototype.addProperty = function (name, value) {
    return this.then(x => {
        x[name] = value;
        return x;
    });
}

/**
 * Defines loading states enum for when boolean value is not enough
 */
window.LoadState = {
    NotRequested: 0,
    Loading: 1,
    Done: 2,
}