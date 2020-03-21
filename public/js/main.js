//Imports
import ApiRequests from './helpers/api.js';
import dictionary from './helpers/dictionary.js';
import Chronometer from './helpers/chrono.js';

// Endpoint URLs
let trendsUrl = 'https://api.giphy.com/v1/gifs/trending?rating=g';
let searchTermUrl = 'https://api.giphy.com/v1/gifs/search?rating=G&lang=en';
let searchIdsUrl = 'https://api.giphy.com/v1/gifs';

// Variables
let body = document.querySelector( 'body' );
let themeChangerButton = document.querySelector( '.theme-changer' );
let themeOptions = [ ...document.querySelector( '.theme-options' ).children ];
let searchInput = document.querySelector( '.search-input' );
let searchButton = document.querySelector( '.search-button' );
let suggestedSearchsContainer = document.querySelector( '.suggested-searchs' );
let suggestedSearchButtons = [ ...document.getElementsByClassName( 'btn-suggested' ) ];
let apiRequest = new ApiRequests();
let chronometer = new Chronometer();
let gifBlob;
let videoViewer = document.querySelector( '.video-viewer' );
let gifPreviewer = document.querySelector( '.gif-previewer');
let gifThumbnail;
let testGifs = ['51Uiuy5QBZNkoF3b2Z', '1xOOQSMJ9X4UykElSk', '9fuvOqZ8tbZOU'];
var recorder;

// Event listeners
document.addEventListener( 'DOMContentLoaded', () => {
    generalEvents();
    if ( body.classList.contains( 'main-page' ) ) {
        mainPageEvents();
        setSuggestedGifs();
        setTrendGifs();
    } else if ( body.classList.contains( 'my-gifos' ) ) {
        localStorage.setItem('mis_gifos', testGifs.toString());
        myGifosPageEvents();
        setMyGifos();
    }
});
function generalEvents() {
    themeChangerButton.addEventListener( 'click', () => {
        themeChangerButton.classList.toggle( 'active' );
    });
    themeOptions.forEach( ( option, index ) => {
        option.addEventListener( 'click', () => {
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
}
function mainPageEvents() {
    searchInput.addEventListener( 'keyup', (e) => {
        if ( e.target.value.length > 2 ) {
            let suggestedTerms = getSuggestedSearchs( e.target.value );
    
            suggestedSearchButtons.forEach( ( button, index ) => {
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
    });
    suggestedSearchButtons.forEach( ( button ) => {
        button.addEventListener( 'click', () => {
            searchInput.value = button.text;
            setSearchGifs( button.text );
        })
    });
}
function myGifosPageEvents() {
    let createGifButton = document.querySelector( '.start-creation' );
    let cancelButton = document.querySelector( '.cancel-creation' );
    let startRecordButton = document.querySelector( '.start-record-button' );
    let stopRecordButton = document.querySelector( '.stop-record-button' );
    let createGifTitle = document.querySelector( '.create-gif-container .title-bar span' );
    let playPreview = document.querySelector( '.preview-controls .btn-play' );
    let repeatCapture = document.querySelector( '.repeat-capture' );

    createGifButton.addEventListener( 'click', (e) => {
        e.preventDefault();
        let createGifContainer = document.querySelector( '.create-gif-container' );
        let createGifIcon = createGifContainer.querySelector( '.icon-container' );
        let createGifText = createGifContainer.querySelector( '.text-container' );
        let instructionsActions = document.querySelector( '.instructions-actions' );
        createGifIcon.classList.add( 'd-none' );
        createGifText.classList.add( 'd-none' );
        instructionsActions.classList.add( 'd-none' );
        startRecordButton.classList.remove( 'd-none' );
        createGifContainer.style.width = '854px';
        createGifTitle.innerHTML = 'Un Chequeo Antes de Empezar';
        setVideoStream();
    });

    startRecordButton.addEventListener( 'click', () => {
        createGifTitle.innerHTML = 'Capturando tu Gifo';
        startRecord();
    });

    stopRecordButton.addEventListener( 'click', () => {
        createGifTitle.innerHTML = 'Vista previa';
        stopRecord();
    });

    playPreview.addEventListener( 'click', () => {
        viewPreview();
    });

    repeatCapture.addEventListener( 'click', (e) => {
        e.preventDefault();
        let previewGifActions = document.querySelector( '.preview-gif-actions' );
        previewGifActions.classList.add( 'd-none' );
        startRecordButton.classList.remove( 'waiting', 'd-none' );
        startRecordButton.querySelector( '.start-record' ).innerHTML = 'Capturar';
        let counterInput = document.querySelector( '.counter-input' );
        counterInput.classList.add( 'd-none' );
        videoViewer.classList.remove( 'd-none' );
        gifPreviewer.classList.add( 'd-none' );
        createGifButton.click();
    })
}

//Functions
function getSuggestedSearchs( searchTerm ) {
    
    let suggestedTerms = dictionary.filter( word => word.indexOf( searchTerm.toLowerCase() ) >= 0 );

    if ( suggestedTerms.length < 3 ) {
        for ( let i = suggestedTerms.length; i < 3; i++ ) {
            let randomTerm = dictionary[ Math.floor( Math.random() * dictionary.length ) ];
            suggestedTerms.push( randomTerm );
         }
    }

    return suggestedTerms;
}

async function setSuggestedGifs() {
    let suggestedGifs = await apiRequest.fetchGet( `${ trendsUrl }&`, 4 );

    if ( suggestedGifs ) {
        if ( suggestedGifs.data.length > 0 ) {
            let suggestedItems = [ ...document.getElementsByClassName( 'suggested-item' ) ];
            suggestedItems.forEach( ( item, index ) => {
                const { title, images:{ downsized_large:{ url } } } = suggestedGifs.data[index];
                let shortTitle = title.split( " GIF" )[0];
                let hashtagTitle = shortTitle.replace( / /g, '' );
                let html = `<div class="title-bar">
                                <span>#${ hashtagTitle }</span>
                                <img src="./assets/img/close.svg" alt="">
                            </div>
                            <div class="item-body">
                                <img src="${ url }" alt="${ title }">
                                <a href="#" class="btn-sm btn-secondary see-more" data-title="${ shortTitle }">Ver más...</a>
                            </div>`;
                item.innerHTML = html;
                item.classList.remove( 'loading' );
                item.addEventListener( 'click', (e) => {
                    if ( e.target && e.target.classList.contains( 'see-more' )) {
                        e.preventDefault();
                        searchRelatedGifs( e.target.getAttribute( 'data-title' ) );
                    }
                })
            })
        }
    }
}

async function setTrendGifs() {
    let trendGifs = await apiRequest.fetchGet( `${ trendsUrl }&`, 20, 4 );

    if ( trendGifs ) {
        if ( trendGifs.data.length > 0 ) {
            let trendsContainer = document.querySelector( '.trends-container' );
            let html = '';
            trendGifs.data.forEach(gif => {
                const { title, images:{ downsized_large:{ url } } } = gif;
                let shortTitle = title.split( "GIF" )[0].trim();
                let hashtagTitle = shortTitle.replace( / /g, '' );
                html += `<div class="trend-item">
                            <img src="${ url }" alt="${ title }">
                            <div class="title-bar">
                                <span>#${ hashtagTitle }</span>
                            </div>
                        </div>`
            });
            trendsContainer.innerHTML = html;
        }
    }
}

async function setSearchGifs( searchTerm ) {
    let completeSearchUrl = `${ searchTermUrl }&q=${ searchTerm }&`;
    let resultGifs = await apiRequest.fetchGet( completeSearchUrl, 20 );
    let trendsTitle = document.querySelector( '.trends-section .title-input' );
    let suggestedSection = document.querySelector( '.suggested-section ' );
    
    if ( resultGifs ) {
        if ( resultGifs.data.length > 0 ) {
            let trendsContainer = document.querySelector( '.trends-container' );
            let html = '';
            resultGifs.data.forEach(gif => {
                const {title, images:{downsized_large:{url}}} = gif;
                let shortTitle = title.split( "GIF" )[0].trim();
                let hashtagTitle = shortTitle.replace( / /g, '' );
                html += `<div class="trend-item">
                            <img src="${ url }" alt="${ title }">
                            <div class="title-bar">
                                <span>#${ hashtagTitle }</span>
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

function searchRelatedGifs( gifTitle) {
    searchInput.value = gifTitle;
    searchButton.classList.replace( 'btn-disabled', 'btn-primary' );
    setSearchGifs( gifTitle );
}

async function setMyGifos() {
    let myGifosIds = localStorage.getItem( 'mis_gifos' );
    let completeIdsUrl = `${ searchIdsUrl }?ids=${ myGifosIds }&`;
    let myGifosResult = await apiRequest.fetchGet( completeIdsUrl );

    if ( myGifosResult ) {
        if ( myGifosResult.data.length > 0 ) {
            let myGifosContainer = document.querySelector( '.my-gifos-container' );
            let html = '';
            myGifosResult.data.forEach(gif => {
                const {title, images:{downsized_large:{url}}} = gif;
                let shortTitle = title.split( "GIF" )[0].trim();
                let hashtagTitle = shortTitle.replace( / /g, '' );
                html += `<div class="trend-item">
                            <img src="${ url }" alt="${ title }">
                            <div class="title-bar">
                                <span>#${ hashtagTitle }</span>
                            </div>
                        </div>`
            });
            myGifosContainer.innerHTML = html;
        }
    }
}

async function setVideoStream() {
    let videoContainer = document.querySelector( '.media-container' );
    let videoSrc = await getStream();

    if ( videoSrc !== 'error' ) {
        videoContainer.classList.remove( 'd-none' );
        videoViewer.srcObject = videoSrc;
        videoViewer.play();
    } else {
        videoContainer.classList.remove( 'd-none' );
        videoContainer.innerHTML = `<div class="message">Ocurrió un error:
        Revise que cuenta con una cámara y que está permitiendo el acceso a ella para poder continuar.</div>`;
        document.querySelector( '.start-record-button' ).classList.add( 'waiting' );
    }
}

function getStream() {
    let stream = navigator.mediaDevices.getUserMedia( {
        audio: false,
        video: {
            width: 1280,
            height: 720
        }
    })
    .then( ( response ) => {
        return response;
    })
    .catch( ( error) => {
        console.log('error :', error);
        return 'error';
    })

    return stream;
}

async function startRecord() {
    let startRecordButton = document.querySelector( '.start-record-button' );
    startRecordButton.classList.add( 'waiting' );
    startRecordButton.querySelector( '.start-record' ).innerHTML = 'Inicializando...';

    let stream = await getStream();
    recorder = RecordRTC( stream, {
        type: 'gif',
        frameRate: 1,
        quality: 10,
        width: 450,
        hidden: 240,
        onGifRecordingStarted: () => {
            let stopRecordButton = document.querySelector( '.stop-record-button' );
            let counterInput = document.querySelector( '.counter-input' );

            startRecordButton.classList.add( 'd-none' );
            stopRecordButton.classList.remove( 'd-none' );
            counterInput.classList.remove( 'd-none' );
            takeGifThumbnail();
            chronometer.startCounter();
        },
    });
    recorder.startRecording();
}

function stopRecord() {
    recorder.stopRecording( () => {
        chronometer.stopCounter();
        gifBlob = recorder.getBlob();
        showGifPreviewer();
    });
}

function showGifPreviewer(){
    let previewGifActions = document.querySelector( '.preview-gif-actions' );
    let stopRecordButton = document.querySelector( '.stop-record-button' );
    previewGifActions.classList.remove( 'd-none' );
    stopRecordButton.classList.add( 'd-none' );
    videoViewer.classList.add( 'd-none' );
    gifPreviewer.classList.remove( 'd-none' );
    let counterInput = document.querySelector( '.counter-input' );
    counterInput.value = '00:00:00:00';
}

function viewPreview(){
    let progressBar = document.querySelector( '.progress-bar' );
    let timeElapsed = chronometer.getTimeElapsed();
    progressBar.style.animation = `gradient ${timeElapsed/1000}s steps(17, start) 1`;
    gifPreviewer.src = URL.createObjectURL( gifBlob );
    chronometer.startCounter();
    setTimeout(() => {
        gifPreviewer.src = gifThumbnail;
        progressBar.style.animation = `none`;
        let counterInput = document.querySelector( '.counter-input' );
        counterInput.value = '00:00:00:00';
        chronometer.stopCounter();
    }, timeElapsed);
}

function takeGifThumbnail() {
    let thumbnailDrawer = document.querySelector('.thumbnail-drawer');
    thumbnailDrawer.width = videoViewer.videoWidth;
    thumbnailDrawer.height = videoViewer.videoHeight;
    thumbnailDrawer.getContext('2d').drawImage(videoViewer, 0, 0, videoViewer.videoWidth, videoViewer.videoHeight);
    gifThumbnail = thumbnailDrawer.toDataURL('image/png');
    gifPreviewer.src = gifThumbnail;
}