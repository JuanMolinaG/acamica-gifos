//Imports
import ApiRequests from './helpers/api.js';
import dictionary from './helpers/dictionary.js';
import Chronometer from './helpers/chrono.js';

// Endpoint URLs
let trendsUrl = 'https://api.giphy.com/v1/gifs/trending?rating=g',
    searchTermUrl = 'https://api.giphy.com/v1/gifs/search?rating=G&lang=en',
    searchIdsUrl = 'https://api.giphy.com/v1/gifs',
    uploadUrl = 'https://upload.giphy.com/v1/gifs';

/**
 * Variables globales
 */
let body = document.querySelector( 'body' ),
    themeChangerButton = document.querySelector( '.theme-changer' ),
    themeOptions = [ ...document.querySelector( '.theme-options' ).children ],
    searchInput = document.querySelector( '.search-input' ),
    searchButton = document.querySelector( '.search-button' ),
    suggestedTerms,
    suggestedSearchsContainer = document.querySelector( '.suggested-searchs' ),
    suggestedSearchButtons = [ ...document.getElementsByClassName( 'btn-suggested' ) ],
    apiRequest = new ApiRequests(),
    chronometer = new Chronometer(),
    gifBlob,
    videoViewer = document.querySelector( '.video-viewer' ),
    gifPreviewer = document.querySelector( '.gif-previewer'),
    gifThumbnail,
    uploadedGifData;
var recorder;
/** */

/**
 * @description Ejecuta las funciones necesarias al finalizar la carga de la página, tanto las generales como las específicas de cada una.
 */
document.addEventListener( 'DOMContentLoaded', () => {
    generalEvents();
    setTheme();
    if ( body.classList.contains( 'main-page' ) ) {
        mainPageEvents();
        setSuggestedGifs();
        setTrendGifs();
    } else if ( body.classList.contains( 'my-gifos' ) ) {
        myGifosPageEvents();
        setMyGifos();
    }
});

/**
 * @description Conjunto de eventos que son necesarios en todas las páginas
 */
function generalEvents() {
    // Muestra u oculta las opciones para el cambio de tema
    themeChangerButton.addEventListener( 'click', () => {
        themeChangerButton.classList.toggle( 'active' );
    });

    themeOptions.forEach( ( option, index ) => {
        // Guarda en el localStorage el tema seleccionado por el usuario y ejecuta el cambio de tema
        option.addEventListener( 'click', () => {
            if ( index == 0 ) {
                themeOptions[1].classList.remove( 'active' );
                localStorage.setItem( 'theme_skin', 'sailor-day' );
                setTheme();
            } else {
                themeOptions[0].classList.remove( 'active' );
                localStorage.setItem( 'theme_skin', 'sailor-night' );
                setTheme();
            }
        })
    });
}

/**
 * @description Conjunto de eventos necesarios para la página principal
 */
function mainPageEvents() {
    // Muestra u oculta las sugerencias de búsquedas según los caracteres que el usuario ingrese en el input de búsqueda
    searchInput.addEventListener( 'keyup', (e) => {
        if ( e.target.value.length > 2 ) {
            suggestedTerms = getSuggestedSearchs( e.target.value );
    
            suggestedSearchButtons.forEach( ( button, index ) => {
                button.innerHTML = suggestedTerms[ index ];
            });
            suggestedSearchsContainer.classList.add( 'active' );
            searchButton.classList.replace( 'btn-disabled', 'btn-primary' );
        } else {
            suggestedSearchsContainer.classList.remove( 'active' );
            searchButton.classList.replace( 'btn-primary', 'btn-disabled' );
        }
    });

    // Ejecuta la búsqueda de gifs en giphy según el término ingresado por el usuario
    searchButton.addEventListener( 'click', (e) => {
        e.preventDefault();
        setSearchGifs( searchInput.value );
    });

    suggestedSearchButtons.forEach( ( button ) => {
        // Ejecuta la búsqueda de gifs en giphy según el término de búsqueda sugerido seleccionado
        button.addEventListener( 'click', () => {
            searchInput.value = button.text;
            setSearchGifs( button.text );
        })
    });
}

/**
 * @description Conjunto de eventos necesarios para la página mis-gifos
 */
function myGifosPageEvents() {
    let backButton = document.querySelector( '.back-button' ),
        createGifButton = document.querySelector( '.start-creation' ),
        cancelButton = document.querySelector( '.cancel-creation' ),
        startRecordButton = document.querySelector( '.start-record-button' ),
        stopRecordButton = document.querySelector( '.stop-record-button' ),
        createGifTitle = document.querySelector( '.create-gif-container .title-bar span' ),
        playPreviewButton = document.querySelector( '.preview-controls .btn-play' ),
        repeatCaptureButton = document.querySelector( '.repeat-capture' ),
        uploadGifButton = document.querySelector( '.upload-gif' ),
        cancelUploadButton = document.querySelector( '.cancel-upload' ),
        currentUrl = window.location.href,
        createGifContainer = document.querySelector( '.create-gif-container' ),
        closeComponent = document.querySelector( '.create-gif-container .title-bar img' );
    
    // Verifica si el usuario ingresa mediante el enlace para crear gifos y muestra la ventana de creación de gifs
    if ( currentUrl.search( 'action=crearGifo' ) > 0 ) {
        createGifContainer.classList.remove( 'd-none' );
        document.querySelector( '.nav-bar .navigation-container' ).classList.add( 'd-none' );
        backButton.classList.remove( 'd-none' );
    }

    // Permite al usuario volver a la página anterior en la vista de creación de gifs
    backButton.addEventListener( 'click', () => {
        window.history.back();
    });

    // Inicia el proceso de creación de gifs, muestra la vista del stream de la cámara web
    createGifButton.addEventListener( 'click', (e) => {
        e.preventDefault();
        let createGifIcon = createGifContainer.querySelector( '.icon-container' ),
            createGifText = createGifContainer.querySelector( '.text-container' ),
            instructionsActions = document.querySelector( '.instructions-actions' );
        createGifIcon.classList.add( 'd-none' );
        createGifText.classList.add( 'd-none' );
        instructionsActions.classList.add( 'd-none' );
        startRecordButton.classList.remove( 'd-none' );
        createGifContainer.style.width = '854px';
        createGifTitle.innerHTML = 'Un Chequeo Antes de Empezar';
        setVideoStream();
    });

    // Devuelve al usuario a la página anterior si no ha iniciado la creación de gifs
    cancelButton.addEventListener( 'click', (e) => {
        e.preventDefault();
        window.history.back();
    });

    // Ejecuta la función que inicia la grabación del stream de la cámara web
    startRecordButton.addEventListener( 'click', () => {
        createGifTitle.innerHTML = 'Capturando tu Gifo';
        startRecord();
    });

    // Ejecuta la función que detiene la grabación del stream
    stopRecordButton.addEventListener( 'click', () => {
        createGifTitle.innerHTML = 'Vista previa';
        stopRecord();
    });

    // Ejecuta la función que reproduce el gif en el previsualizador
    playPreviewButton.addEventListener( 'click', () => {
        playPreview();
    });

    // Muestra nuevamente la vista del stream de la cámara web para que el usuario vuelva a crear el gif
    repeatCaptureButton.addEventListener( 'click', (e) => {
        e.preventDefault();
        let previewGifActions = document.querySelector( '.preview-gif-actions' ),
            counterInput = document.querySelector( '.counter-input' );
        previewGifActions.classList.add( 'd-none' );
        startRecordButton.classList.remove( 'waiting', 'd-none' );
        startRecordButton.querySelector( '.start-record' ).innerHTML = 'Capturar';
        counterInput.classList.add( 'd-none' );
        videoViewer.classList.remove( 'd-none' );
        gifPreviewer.classList.add( 'd-none' );
        createGifButton.click();
    });

    // Ejecuta la función que sube el gif a giphy
    uploadGifButton.addEventListener( 'click', (e) => {
        e.preventDefault();
        createGifTitle.innerHTML = 'Subiendo Gifo';
        uploadGif();
    });

    // Cancela el proceso de subida del gif a giphy en caso de que no se haya terminado de ejecutar y devuelve al usuario a la página anterior
    cancelUploadButton.addEventListener( 'click', (e) => {
        e.preventDefault();
        apiRequest.cancelPost();
        window.history.back();
    });

    // Devuelve al usuario a la página anterior en cualquier lugar del proceso de creación de gifs
    closeComponent.addEventListener( 'click', () => {
        window.history.back();
    });
}

/**
 * @description Verifica en el localStorage si el usuario había establecido un tema previamente, sino establece el sailor-day
 */
function setTheme(){
    let userSelectedTheme = localStorage.getItem( 'theme_skin' );

    if ( userSelectedTheme ) {
        if ( userSelectedTheme == 'sailor-day' ) {
            body.classList.add( 'sailor-day' );
            body.classList.remove( 'sailor-night' );
            themeOptions[0].classList.add( 'active' );
        } else if ( userSelectedTheme == 'sailor-night' ) {
            body.classList.add( 'sailor-night' );
            body.classList.remove( 'sailor-day' );
            themeOptions[1].classList.add( 'active' );
        }
    } else {
        localStorage.setItem( 'theme_skin', 'sailor-day' );
        setTheme();
    }
}

/**
 * @description Utiliza los caracteres ingresados en el input de búsqueda para filtrar en el diccionario
 *              Si el filtro arroja menos de 3 sugerencias, se completan las 3 aleatoriamente
 * @param searchTerm - Caracteres ingresados en el input de búsqueda.
 * @returns array con las sugerencias
 */
function getSuggestedSearchs( searchTerm ) {
    
    let suggestions = dictionary.filter( word => word.indexOf( searchTerm.toLowerCase() ) >= 0 );

    if ( suggestions.length < 3 ) {
        for ( let i = suggestions.length; i < 3; i++ ) {
            let randomTerm = dictionary[ Math.floor( Math.random() * dictionary.length ) ];
            suggestions.push( randomTerm );
         }
    }

    return suggestions;
}

/**
 * @description Consume la API de giphy para mostrar 4 gifs sugeridos
 */
async function setSuggestedGifs() {
    let suggestedGifs = await apiRequest.fetchGet( `${ trendsUrl }&`, 4 );

    if ( suggestedGifs ) {
        if ( suggestedGifs.data.length > 0 ) {
            let suggestedItems = [ ...document.getElementsByClassName( 'suggested-item' ) ];
            suggestedItems.forEach( ( item, index ) => {
                const { title, images:{ downsized_large:{ url } } } = suggestedGifs.data[index];
                let shortTitle = title.split( " GIF" )[0],
                    hashtagTitle = shortTitle.replace( / /g, '' ),
                    html = `<div class="title-bar">
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
                        let gifTitle = e.target.getAttribute( 'data-title' );
                        suggestedTerms = getSuggestedSearchs( gifTitle );
                        searchRelatedGifs( gifTitle );
                    }
                })
            })
        }
    }
}

/**
 * @description Consume la API de giphy para mostrar 20 gifs que son tendencia
 */
async function setTrendGifs() {
    let trendGifs = await apiRequest.fetchGet( `${ trendsUrl }&`, 20, 4 );

    if ( trendGifs ) {
        if ( trendGifs.data.length > 0 ) {
            let trendsContainer = document.querySelector( '.trends-container' ),
                html = '';
            trendGifs.data.forEach(gif => {
                const { title, images:{ downsized_large:{ url } } } = gif;
                let shortTitle = title.split( "GIF" )[0].trim(),
                    hashtagTitle = shortTitle.replace( / /g, '' );
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

/**
 * @description Realiza una búsqueda en la API de giphy con un término de búsqueda dado
 * @param searchTerm - Término a buscar
 */
async function setSearchGifs( searchTerm ) {
    let completeSearchUrl = `${ searchTermUrl }&q=${ searchTerm }&`,
        resultGifs = await apiRequest.fetchGet( completeSearchUrl, 20 ),
        trendsTitle = document.querySelector( '.trends-section .title-input' ),
        suggestedSection = document.querySelector( '.suggested-section ' ),
        relatedTagsContainer = document.querySelector( '.related-tags' ),
        relatedTagsButtons = [ ...relatedTagsContainer.getElementsByClassName( 'btn-secondary' ) ];

        relatedTagsButtons.forEach( ( button, index ) => {
            button.innerHTML = `#${ suggestedTerms[ index ] }`;
        });

        relatedTagsContainer.classList.remove( 'd-none' );
    
    if ( resultGifs ) {
        if ( resultGifs.data.length > 0 ) {
            let trendsContainer = document.querySelector( '.trends-container' ),
                html = '';
            resultGifs.data.forEach(gif => {
                const { title, images:{ downsized_large:{ url } } } = gif;
                let shortTitle = title.split( "GIF" )[0].trim(),
                    hashtagTitle = shortTitle.replace( / /g, '' );
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

/**
 * @description Realiza una búsqueda de gifs relacionados según el título de un gif
 *              Esta función es usada cuando el usuario da click en el botón "Ver más..." de uno de los gifs sugeridos
 * @param gifTitle - Título del gif de sugerencias
 */
function searchRelatedGifs( gifTitle) {
    searchInput.value = gifTitle;
    searchButton.classList.replace( 'btn-disabled', 'btn-primary' );
    setSearchGifs( gifTitle );
}

/**
 * @description Muestra los gifs subidos por el usuario a giphy, los ids de estos gifs se encuentran en el localStorage
 *              Usando los ids se buscan los gifs con la API de gifos
 */
async function setMyGifos() {
    let myGifosIds = localStorage.getItem( 'my_gifos' );
    if ( myGifosIds ) {
        let completeIdsUrl = `${ searchIdsUrl }?ids=${ myGifosIds }&`,
            myGifosResult = await apiRequest.fetchGet( completeIdsUrl );
    
        if ( myGifosResult ) {
            if ( myGifosResult.data.length > 0 ) {
                let myGifosContainer = document.querySelector( '.my-gifos-container' ),
                    html = '';
                myGifosResult.data.forEach(gif => {
                    const { title, images:{ downsized_large:{ url } } } = gif;
                    let shortTitle = title.split( "GIF" )[0].trim(),
                        hashtagTitle = shortTitle.replace( / /g, '' );
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
}

/**
 * @description Muestra en pantalla el stream de la cámara web del usuario, o un mensaje en caso de error.
 */
async function setVideoStream() {
    let mediaContainer = document.querySelector( '.media-container' ),
        videoSrc = await getStream();

    if ( videoSrc !== 'error' ) {
        mediaContainer.classList.remove( 'd-none' );
        videoViewer.srcObject = videoSrc;
        videoViewer.play();
    } else {
        mediaContainer.classList.remove( 'd-none' );
        mediaContainer.innerHTML = `<div class="message">Ocurrió un error:
        Revise que cuenta con una cámara y que está permitiendo el acceso a ella para poder continuar.</div>`;
        document.querySelector( '.start-record-button' ).classList.add( 'waiting' );
    }
}

/**
 * @description Crea un stream de la cámara web del usuario
 * @returns stream de la cámara web o error en caso de que la cámara no esté disponible o el usuario no de permisos para usarla.
 */
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

/**
 * @description Inicia la grabación del stream en formato .gif
 */
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
            let stopRecordButton = document.querySelector( '.stop-record-button' ),
                counterInput = document.querySelector( '.counter-input' );

            startRecordButton.classList.add( 'd-none' );
            stopRecordButton.classList.remove( 'd-none' );
            counterInput.classList.remove( 'd-none' );
            takeGifThumbnail();
            chronometer.startCounter();
        },
    });
    recorder.startRecording();
}

/**
 * @description Detiene la grabación del stream y obtiene el objeto con el .gif
 */
function stopRecord() {
    recorder.stopRecording( () => {
        chronometer.stopCounter();
        gifBlob = recorder.getBlob();
        showGifPreviewer();
    });
}

/**
 * @description Muestra el previsualizador del gif creado
 */
function showGifPreviewer(){
    let previewGifActions = document.querySelector( '.preview-gif-actions' ),
        stopRecordButton = document.querySelector( '.stop-record-button' );
    previewGifActions.classList.remove( 'd-none' );
    stopRecordButton.classList.add( 'd-none' );
    videoViewer.classList.add( 'd-none' );
    gifPreviewer.classList.remove( 'd-none' );
    let counterInput = document.querySelector( '.counter-input' );
    counterInput.value = '00:00:00:00';
}

/**
 * @description Permite reproducir el gif creado en el previsualizador
 */
function playPreview(){
    let progressBar = document.querySelector( '.preview-controls .progress-bar' ),
        timeElapsed = chronometer.getTimeElapsed();
    progressBar.style.animation = `gradient-move ${timeElapsed/1000}s steps(17, start) 1`;
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

/**
 * @description Sube el gif creado a giphy por medio de su API
 */
async function uploadGif(){
    let mediaContainer = document.querySelector( '.media-container' ),
        previewGifActions = document.querySelector( '.preview-gif-actions' ),
        counterInput = document.querySelector( '.counter-input' ),
        uploadingContainer = document.querySelector( '.uploading-container' ),
        uploadingActions = document.querySelector( '.uploading-actions' );

    mediaContainer.classList.add( 'd-none' );
    previewGifActions.classList.add( 'd-none' );
    counterInput.classList.add( 'd-none' );
    uploadingContainer.classList.remove( 'd-none' );
    uploadingActions.classList.remove( 'd-none' );    

    let form = new FormData(),
        timestamp = new Date().getTime();
    form.append( 'file', gifBlob, `myGif-${timestamp}.gif` );
    
    uploadedGifData = await apiRequest.fetchPost( uploadUrl, form );

    if ( uploadedGifData ) {
        uploadingContainer.classList.add( 'd-none' );
        uploadingActions.classList.add( 'd-none' );
        showUploadedGif();
    }
}

/**
 * @description Muestra el gif que se acaba de subir a giphy
 */
async function showUploadedGif(){
    let uploadingContainer = document.querySelector( '.uploading-container' ),
        uploadingActions = document.querySelector( '.uploading-actions' ),
        uploadResult = document.querySelector( '.upload-result-container' ),
        finalAction = document.querySelector( '.final-action' ),
        uploadedGif = document.querySelector( '.uploaded-gif' ),
        finishButton = document.querySelector( '.finish-creation' ),
        createGifContainer = document.querySelector( '.create-gif-container' ),
        createGifTitle = document.querySelector( '.create-gif-container .title-bar span' ),
        getGifUrl = `${ searchIdsUrl }?ids=${ uploadedGifData.data.id }&`,
        newGifoData = await apiRequest.fetchGet( getGifUrl ),
        copyLinkButton = document.querySelector( '.copy-link' ),
        downloadGifButton = document.querySelector( '.download-gif' );

    if ( newGifoData ) {
        if ( newGifoData.data.length > 0 ) {
            let newGifoUrl = newGifoData.data[0].images.downsized_large.url;
            uploadedGif.src = newGifoUrl;
            createGifContainer.style.width = '715px';
            createGifTitle.innerHTML = 'Gifo subido con éxito';
            uploadResult.classList.remove( 'd-none' );
            finalAction.classList.remove( 'd-none' );
            uploadingContainer.classList.add( 'd-none' );
            uploadingActions.classList.add( 'd-none' );

            setGifIdLocalStorage();
            setMyGifos();

            downloadGifButton.href = await apiRequest.fetchDownload( newGifoUrl );
            downloadGifButton.download = 'myNewGifo.gif';

            copyLinkButton.addEventListener( 'click', (e) => {
                e.preventDefault();
                let tempInput = document.createElement( 'input' );
                tempInput.setAttribute( 'value', newGifoUrl );
                tempInput.style.position = 'absolute';
                tempInput.style.zIndex = '-1';
                uploadResult.appendChild( tempInput );
                tempInput.select();
                document.execCommand( 'copy' );
                uploadResult.removeChild( tempInput );
                copyLinkButton.innerHTML = 'Enlace copiado!';
                setTimeout(() => {
                    copyLinkButton.innerHTML = 'Copiar enlace Gifo';
                }, 2000);
            });

            finishButton.addEventListener( 'click', (e) => {
                e.preventDefault();
                window.location = './';
            });
        }
    }
}

/**
 * @description Guarda el id del gif que se acaba de subir a giphy en el localStorage
 */
function setGifIdLocalStorage() {
    let myGifosIds = localStorage.getItem( 'my_gifos' );

    if ( myGifosIds ) {
        myGifosIds = `${ uploadedGifData.data.id },${ myGifosIds }`;
        localStorage.setItem( 'my_gifos', myGifosIds );
    } else {
        localStorage.setItem( 'my_gifos', uploadedGifData.data.id );
    }
}

/**
 * @description Toma un screenShot del visor de la cámara web en el momento en que se inicia la grabación
 *              Este screenShot es usado en el previsualizador del gif creado para simular que el gif se encuentra pausado
 */
function takeGifThumbnail() {
    let thumbnailDrawer = document.querySelector('.thumbnail-drawer');
    thumbnailDrawer.width = videoViewer.videoWidth;
    thumbnailDrawer.height = videoViewer.videoHeight;
    thumbnailDrawer.getContext('2d').drawImage(videoViewer, 0, 0, videoViewer.videoWidth, videoViewer.videoHeight);
    gifThumbnail = thumbnailDrawer.toDataURL('image/png');
    gifPreviewer.src = gifThumbnail;
}