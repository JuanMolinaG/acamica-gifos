// Chronometer based on https://www.proglogic.com/code/javascript/time/chronometer.php

export default class Chronometer{
    constructor() {
        this.startTime = 0;
        this.start = 0;
        this.end = 0;
        this.diff = 0;
        this.timerID = 0;
        this.timeElapsed = 0;
    }

    counter() {
        this.end = new Date();
        this.diff = this.end - this.start;
        this.timeElapsed = this.diff;
        this.diff = new Date( this.diff );
        let msec = Number( this.diff.getMilliseconds().toString().slice( 0, -1 ) );
        let sec = this.diff.getSeconds();
        let min = this.diff.getMinutes();
        let hr = this.diff.getHours()-19;
        if ( min < 10 ) {
            min = "0" + min;
        }
        if ( sec < 10 ) {
            sec = "0" + sec;
        }
        if ( msec < 10 ) {
            msec = "0" + msec;
        }
        if ( hr < 10 ) {
            hr = "0" + hr;
        }

        // adds data in counter input
        document.querySelector( '.counter-input' ).value = `${hr}:${min}:${sec}:${msec}`;

        this.timerID = setTimeout( () => { this.counter() }, 10);
    }

    startCounter() {
        this.start = new Date();
        this.counter();
    }

    stopCounter() {
        clearTimeout(this.timerID);
    }

    getTimeElapsed() {
        return this.timeElapsed;
    }
}