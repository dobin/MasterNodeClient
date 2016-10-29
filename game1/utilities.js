"use strict";


function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function getCurrentTime() {
    return new Date().getTime()
}