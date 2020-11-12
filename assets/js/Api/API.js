import { api_fetch } from "./api_fetch";
import { getThreadList } from "./thread_api";

/**
 * See backend API documentation at:
 * https://documenter.getpostman.com/view/2542393/TVRg6V1E
 */
export default class API {

    static Fetch(method, url, body = null) {
        return api_fetch(method, url, body);
        // TODO move code here from separate file
    }

    /**
     * Generic call to the backend API
     * @param method Request method: GET, POST, PUT, PATCH, DELETE
     * @param url Request URL, in the form /api{/url}
     * @param body Request payload, as object (will be JSON-ified)
     * @param authHeader Should Authorization header be included? Will be only included if set to true AND jwt token is found in redux store.
     */
    static Fetch_new(method, url, body = null, authHeader = true) {
        url = API.BaseUrl + url;

        const headers = new Headers();
        headers.append('Accept', 'application/json');
        if (body !== null)
            headers.append('Content-Type', 'application/json');
        // TODO append Authorization header

        body = body === null ? null : JSON.stringify(body);

        return fetch(url, {
            method: method,
            headers: headers,
            body: body
        }).then(response => response);
    }

}
API.BaseUrl = '/api';


API.Thread = class {
    static GetList() {
        return getThreadList();
        // TODO move code here from separate file
    }
}


API.Auth = class {
    static LogIn(username, password) {
        const body = {
            username,
            password
        };

        return API.Fetch_new('POST', '/login_check', body, false)
            .then(response => response);
    }

    static TokenRefresh() {
        return API.Fetch_new('POST', '/token/refresh', null)
            .then(response => response);
    }

    static LogOut() {
        return API.Fetch_new('POST', '/logout', null)
            .then(response => response);
    }
}