class ApiRequests{
    constructor() {
        this.apiKey= '98DZpP9iuSTg6FFtfqO3TV3X6MrQ0FDD';
    }

    fetchGet(url, limit, offset = 0) {
        let results = fetch(`${url}&api_key=${this.apiKey}&limit=${limit}&offset=${offset}`, {method: 'GET'})
            .then((response) => {
                return response.json();
            })
            .then(data => {
                return data;
            })
            .catch(error => {
                console.log(error)
            })

            return results;
    }
}

export default ApiRequests;