/**
 * @description Clase con los métodos get y post para la API de Giphy
 * @requires apiCredentials.js con el apiKey y username de Giphy
 */

import { apiKey, username } from './apiCredentials.js';

export default class ApiRequests{
    constructor() {
        this.apiKey = apiKey;
        this.username = username;
        this.controller = new AbortController();
        this.signal = this.controller.signal;
    }

    fetchGet( url, limit = 0, offset = 0 ) {
        let results = fetch(`${url}api_key=${this.apiKey}&limit=${limit}&offset=${offset}`, {method: 'GET'})
            .then( response => {
                return response.json();
            })
            .then( data => {
                return data;
            })
            .catch( error => {
                console.log( error );
            })

            return results;
    }

    fetchPost( url, form ) {
        form.append( 'api_key', this.apiKey );
        form.append( 'username', this.username );

        let requestOptions = {
            method: 'POST',
            body: form,
            signal: this.signal
        };

        let results = fetch( url, requestOptions )
            .then( response => {
                return response.json();
            })
            .then( data => {
                return data;
            })
            .catch( error => {
                console.log( error );
            })
        
            return results;

    }

    cancelPost(){
        this.controller.abort();
    }

    fetchDownload( url ) {
        let result = fetch( url )
            .then( response => {
                return response.blob();
            })
            .then( blob => {
                return URL.createObjectURL( blob );
            })
            .catch( error => {
                console.log( error );
            })

            return result;
    }
}