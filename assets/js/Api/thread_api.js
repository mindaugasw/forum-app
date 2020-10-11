export function getThreadList() {
    return fetch('/api/threads/', {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
           return response.json(); 
        });
}