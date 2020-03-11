//Imports
import ApiRequests from './api.js';

// Endpoint URLs
let trendsUrl = 'https://api.giphy.com/v1/gifs/trending?rating=g';
let searchTermUrl = 'https://api.giphy.com/v1/gifs/search?rating=G&lang=en';
let searchIdUrl = 'https://api.giphy.com/v1/gifs/';

// Variables
let themeChangerButton = document.querySelector( '.theme-changer' );
let themeOptions = [ ...document.querySelector( '.theme-options' ).children ];
let searchInput = document.querySelector( '.search-input' );
let searchButton = document.querySelector( '.search-button' );
let suggestedSearchsContainer = document.querySelector( '.suggested-searchs' );
let apiRequest = new ApiRequests();

// Event listeners
document.addEventListener( 'DOMContentLoaded', () => {
    setSuggestedGifs();
    setTrendGifs();
});
themeChangerButton.addEventListener( 'click', () => {
    themeChangerButton.classList.toggle( 'active' );
});
themeOptions.forEach( ( option, index ) => {
    option.addEventListener( 'click', () => {
        let body = document.querySelector( 'body' );
        if ( index == 0 ) {
            body.classList.replace( 'sailor-night', 'sailor-day' );
            themeOptions[1].classList.remove( 'active' );
        } else {
            body.classList.replace( 'sailor-day', 'sailor-night' );
            themeOptions[0].classList.remove( 'active' );
        }
        option.classList.add( 'active' );
    })
});
searchInput.addEventListener( 'keyup', (e) => {
    if ( e.target.value.length > 2 ) {
        let suggestedTerms = getSuggestedSearchs();
        let suggestedButtons = [ ...document.getElementsByClassName( 'btn-suggested' ) ];

        suggestedButtons.forEach( ( button, index ) => {
            button.innerHTML = suggestedTerms[index];
        });
        suggestedSearchsContainer.classList.add( 'active' );
        searchButton.classList.replace( 'btn-disabled', 'btn-primary' );
    } else {
        suggestedSearchsContainer.classList.remove( 'active' );
        searchButton.classList.replace( 'btn-primary', 'btn-disabled' );
    }
});
searchButton.addEventListener( 'click', (e) => {
    e.preventDefault();
    setSearchGifs( searchInput.value );
})

//Functions
function getSuggestedSearchs() {
    let searchTerms = [
        'Feliz cumpleaños',
        'Alf',
        'Javascript',
        'Programación',
        'Pensando',
        'Pescador',
        'Industria',
        'Monologo',
        'Suerte',
        'Estudiar',
        'Electricidad',
        'Estrellas',
        'Bigote',
        'Oso panda',
        'Hamburguesa',
        'Golosina',
        'Caballo',
        'Cacatúa',
        'Cabeza',
        'Saludar'
    ];

    let suggestedTerms = [];

    for ( let i = 0; i < 3; i++ ) {
       let randomTerm = searchTerms[ Math.floor( Math.random() * searchTerms.length ) ];
       suggestedTerms.push( randomTerm );
       searchTerms.splice( searchTerms.indexOf( randomTerm ), 1 );
    }

    return suggestedTerms;
}

async function setSuggestedGifs() {
    let suggestedGifs = await apiRequest.fetchGet( trendsUrl, 4 );

    if ( suggestedGifs ) {
        if ( suggestedGifs.data.length > 0 ) {
            let suggestedItems = [ ...document.getElementsByClassName( 'suggested-item' ) ];
            suggestedItems.forEach( ( item, index ) => {
                const { title, images:{ downsized_large:{ url } } } = suggestedGifs.data[index];
                let html = `<div class="title-bar">
                                <span>#${ title }</span>
                                <img src="./assets/img/close.svg" alt="">
                            </div>
                            <div class="item-body">
                                <img src="${ url }" alt="${ title }">
                                <a href="#" class="btn-sm btn-secondary">Ver más...</a>
                            </div>`;
                item.innerHTML = html;
                item.classList.remove( 'loading' );
            })
        }
    }
}

async function setTrendGifs() {
    let trendGifs = await apiRequest.fetchGet( trendsUrl, 20, 4 );

    if ( trendGifs ) {
        if ( trendGifs.data.length > 0 ) {
            let trendsContainer = document.querySelector( '.trends-container' );
            let html = '';
            trendGifs.data.forEach(gif => {
                const { title, images:{ downsized_large:{ url } } } = gif;
                html += `<div class="trend-item">
                            <img src="${ url }" alt="${ title }">
                            <div class="title-bar">
                                <span>#${ title }</span>
                            </div>
                        </div>`
            });
            trendsContainer.innerHTML = html;
        }
    }
}

async function setSearchGifs( searchTerm ) {
    let completeSearchUrl = `${ searchTermUrl }&q=${ searchTerm }`;
    let resultGifs = await apiRequest.fetchGet( completeSearchUrl, 20 );
    let trendsTitle = document.querySelector( '.trends-section .title-input' );
    let suggestedSection = document.querySelector( '.suggested-section ' );
    
    if ( resultGifs ) {
        if ( resultGifs.data.length > 0 ) {
            let trendsContainer = document.getElementsByClassName('trends-container')[0];
            let html = '';
            resultGifs.data.forEach(gif => {
                const {title, images:{downsized_large:{url}}} = gif;
                html += `<div class="trend-item">
                            <img src="${url}" alt="${title}">
                            <div class="title-bar">
                                <span>#${title}</span>
                            </div>
                        </div>`
            });
            trendsContainer.innerHTML = html;
        }
    }
    suggestedSection.classList.add( 'd-none' );
    trendsTitle.value = `${ searchTerm } (resultados)`;
    suggestedSearchsContainer.classList.remove( 'active' );
}

