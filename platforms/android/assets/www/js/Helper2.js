/* 
Copyright (c) 2015, 2016 Robert R Schomburg
Licensed under terms of the MIT License, which is given at
https://github.com/bobbyray/MitLicense/releases/tag/v1.0
*/
// Standard prototype addition to String to trim leading and trailing spaces.
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};

// Returns Date obj for a JSON date.
// JSON Date is this string with this format: /Date({millisecs}{-/+}{hhmm})/
//  {milliseconds} is elapsed time in milliseconds since 1970/01/01 00:00.
//  {+|-} is plus or minus sign.
//  {hhmm} is time offset in hours and minutes with respect to utc.
//  Note: {+|-}{mins} is not used.
String.prototype.parseJsonDate = function () {
    var utcTime = 0;
    if (this.substr(0, 6) == "/Date(")
        utcTime = parseInt(this.substr(6));
    var date = new Date(utcTime);
    return date;
};

// Returns Date obj for a JSON Date converted to 
// same local time, but wrt GMT-00.
// Example: 
//   local date:      20150501 14:16:44 GMT-07 (Pacific Daylight Time).
//   utc date return: 20150501 14:16:44 GMT-00.
//   local date and utc date both indicate exact same time,
//   but the utc date in elapsed millisecinds is 
//      7 (hours) * 60 (mins) * 60 (secs) * 1000 (millisecs)
//      less than the local date in elapsed milliseconds.
String.prototype.parseJsonDateGmt = function () {
    var date;
    var t = 0;
    var re = /\/Date\(([-+]?\d+)([\+\-])(\d\d)(\d\d)/;
    var match = re.exec(this);
    if (match && match.length >= 4) {
        msDate = parseInt(match[1]);
        var msTimeZone = parseInt(match[3]) * 60 * 60 * 1000;
        if (match[2] === '-') {
            msTimeZone = - msTimeZone;
        }
        msDate += msTimeZone;
        date = new Date(msDate);
    } else {
        date = new Date(0);
    }
    return date;
};

// String prototype for formatting string with args filled in for placeholders.
// {i} is the placeholder (like in C#). 
// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
              ? args[number]
              : match
            ;
        });
    };
}

(function (window) {
    'use strict';

    // Cache the querySelector/All for easier and faster reuse
    // Note: Not using $ only so that jquery can be easily used too.
    window.$qa = document.querySelectorAll.bind(document);
    window.$q = document.querySelector.bind(document);

    /* //???? MS Explorer complains. Not really using.
    
    // Allow for looping on Objects by chaining:
    // $qa('.foo').each(function () {})
    Object.prototype.each = function (callback) {
        for (var x in this) {
            if (this.hasOwnProperty(x)) {
                callback.call(this, this[x]);
            }
        }
    };
    */
}
)(window);

