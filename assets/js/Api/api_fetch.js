
export function api_fetch(method, url, body = null) {
    url = '/api' + url;

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    if (body !== null)
        headers.append('Content-Type', 'application/json');

    body = body === null ? null : JSON.stringify(body);

    return fetch(url, {
        method: method,
        headers: headers,
        body: body
    })
        .then(response => {
            if (!response.ok) {
                // console.error(`${method} ${location.origin}${url} ${response.status}`);
                // if (errorHandler !== null)
                //     errorHandler(response);
                // return false;
                throw response;
            }

            return response.json();
        });
}