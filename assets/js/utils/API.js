/**
 * See backend API documentation at:
 * https://documenter.getpostman.com/view/2542393/TVRg6V1E
 */
export default class API {
    /**
     * Generic call to the backend API
     * @param method Request method: GET, POST, PUT, PATCH, DELETE
     * @param url Request URL, in the form /api{/url}
     * @param body Request payload, as object (will be JSON-ified)
     * @param authHeader Should Authorization header be included? Will be only included if jwt token is found in redux store.
     */
    static Fetch(method, url, body = null, authHeader = true) {
        url = API.BaseUrl + url;

        const headers = new Headers();
        headers.append('Accept', 'application/json');
        if (body !== null)
            headers.append('Content-Type', 'application/json');

        if (authHeader) {
            const {isLoggedIn, jwt} = store.getState().auth;
            if (isLoggedIn)
                headers.append('Authorization', 'Bearer ' + jwt);
        }

        body = body === null ? null : JSON.stringify(body);

        return fetch(url, {
            method: method,
            headers: headers,
            body: body
        });//.then(response => response);
    }

}
API.BaseUrl = '/api';


API.Threads = class {
    /**
     * @param paramsUrl Url defining list GET params, like page, perpage, orderby, orderdir.
     * e.g. url='?page=1&perpage=20&orderby=id&orderdir=DESC'
     */
    static GetList(paramsUrl) {
        return API.Fetch('GET', '/threads/'+paramsUrl, null, true);
            // .then(response => response);
    }

    static GetSingle(id) {
        return API.Fetch('GET', `/threads/${id}/`, null, true);
            // .then(response => response);
    }

    /**
     * @param url Url with thread id and comments list GET params.
     * e.g. url='100/comments/?page=1&perpage=20&orderby=id&orderdir=DESC'
     */
    static GetCommentsList(url) {
        return API.Fetch('GET', '/threads/'+url, null, true);
    }

    static SubmitThreadVote(threadId, voteValue) {

        return API.Fetch('POST', `/threads/${threadId}/vote/${voteValue}/`, null, true);
    }

    static SubmitCommentVote(commentId, voteValue) {
        return API.Fetch('POST', `/threads/comments/${commentId}/vote/${voteValue}/`, null, true);
    }

    // --- CRUD operations ---

    static CreateComment(threadId, content) {
        const body = {content};
        return API.Fetch('POST', `/threads/${threadId}/comments/`, body, true);
    }

}

API.Auth = class {
    static LogIn(username, password) {
        const body = {
            username,
            password
        };

        return API.Fetch('POST', '/login_check', body, false);
            // .then(response => response);
    }

    static TokenRefresh() {
        return API.Fetch('POST', '/token/refresh', null, false);
            // .then(response => response);
    }

    static LogOut() {
        return API.Fetch('POST', '/logout', null, false);
            // .then(response => response);
    }
}