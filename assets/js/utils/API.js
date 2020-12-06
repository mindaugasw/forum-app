/**
 * See backend API documentation at:
 * https://documenter.getpostman.com/view/2542393/TVRg6V1E
 */
export default class API {

    static BaseUrl = '/api';
    /*static Threads = Threads; // Not working with static properties?
    static Users = Users;
    static Auth = Auth;*/

    /**
     * Generic call to the backend API
     * @param method Request method: GET, POST, PUT, PATCH, DELETE
     * @param url Request URL, in the form /api{/url}
     * @param body Request payload, as object (will be JSON-ified)
     * @param authHeader Should Authorization header be included? Will be only included if jwt token is found in redux store.
     */
    static Fetch(method, url, body = null, authHeader = true) {
        // url = API.BaseUrl + url;

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

    /**
     * If response was ok, Jsonify and return it. Otherwise rejectWithValue, including payload.
     * @param apiResponsePromise API call promise
     * @param thunkAPI
     */
    static HandleThunkResponse(apiResponsePromise, thunkAPI) {
        return apiResponsePromise.then(response => response.json().then(payload => {
            if (response.ok)
                return payload;
            else
                return thunkAPI.rejectWithValue(payload);
        }));
    }
}

API.Threads = class {

    static BaseUrl = API.BaseUrl + '/threads';


    // --- GET operations ---

    /**
     * @param paramsUrl Url defining list GET params, like page, perpage, orderby, orderdir.
     * e.g. url='?page=1&perpage=20&orderby=id&orderdir=DESC'
     */
    static GetList(paramsUrl) {
        return API.Fetch('GET', `${this.BaseUrl}/${paramsUrl}`, null, true);
            // .then(response => response);
    }

    static GetSingle(id) {
        return API.Fetch('GET', `${this.BaseUrl}/${id}/`, null, true);
            // .then(response => response);
    }

    /**
     * @param url Url with thread id and comments list GET params.
     * e.g. url='100/comments/?page=1&perpage=20&orderby=id&orderdir=DESC'
     */
    static GetCommentsList(url) {
        return API.Fetch('GET', `${this.BaseUrl}/${url}`, null, true);
    }


    // --- VOTE operations ---

    static SubmitThreadVote(threadId, voteValue) {

        return API.Fetch('POST', `${this.BaseUrl}/${threadId}/vote/${voteValue}/`, null, true);
    }

    static SubmitCommentVote(commentId, voteValue) {
        return API.Fetch('POST', `${this.BaseUrl}/comments/${commentId}/vote/${voteValue}/`, null, true);
    }

    // --- CRUD operations ---

    static CreateThread(title, content) {
        const body = {title, content};
        return API.Fetch('POST', `${this.BaseUrl}/`, body, true);
    }

    static EditThread(id, title, content) {
        const body = {title, content};
        return API.Fetch('PATCH', `${this.BaseUrl}/${id}/`, body, true);
    }

    static DeleteThread(id) {
        return API.Fetch('DELETE', `${this.BaseUrl}/${id}/`, null, true);
    }

    static CreateComment(threadId, content) {
        const body = {content};
        return API.Fetch('POST', `${this.BaseUrl}/${threadId}/comments/`, body, true);
    }

    static EditComment(threadId, commentId, content) {
        const body = {content};
        return API.Fetch('PATCH', `${this.BaseUrl}/${threadId}/comments/${commentId}/`, body, true);
    }

    static DeleteComment(threadId, commentId) {
        return API.Fetch('DELETE', `${this.BaseUrl}/${threadId}/comments/${commentId}/`, null, true);
    }

}

API.Auth = class {

    static BaseUrl = API.BaseUrl;

    static LogIn(username, password) {
        const body = {
            username,
            password
        };

        return API.Fetch('POST', `${this.BaseUrl}/login_check`, body, false);
            // .then(response => response);
    }

    static TokenRefresh() {
        return API.Fetch('POST', `${this.BaseUrl}/token/refresh`, null, false);
            // .then(response => response);
    }

    static LogOut() {
        return API.Fetch('POST', `${this.BaseUrl}/logout`, null, false);
            // .then(response => response);
    }
}

API.Users = class {

    static BaseUrl = API.BaseUrl + '/users';

    static Register(username, password) {
        const body = {
            username,
            password
        };

        return API.Fetch('POST', `${this.BaseUrl}/register/`, body, false);
    }

    /**
     * @param paramsUrl Url defining list GET params, like page, perpage, orderby, orderdir.
     * e.g. url='?page=1&perpage=20&orderby=id&orderdir=DESC'
     */
    static GetList(paramsUrl) {
        return API.Fetch('GET', `${this.BaseUrl}/${paramsUrl}`, null, false);
    }

    static GetSingle(id) {
        return API.Fetch('GET', `${this.BaseUrl}/${id}/`, null, true);
    }

    static Edit(id, roles = null, newPassword = null, oldPassword = null) {
        let body = {};
        if (roles) body.roles = roles;
        if (newPassword) body.password = newPassword;
        if (oldPassword) body.oldPassword = oldPassword;

        return API.Fetch('PATCH', `${this.BaseUrl}/${id}/`, body, true);
    }

    static Delete(id) {
        return API.Fetch('DELETE', `${this.BaseUrl}/${id}/`, null, true);
    }
}