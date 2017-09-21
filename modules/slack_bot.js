import https from "https";
import date from "moment";
import _ from "underscore";
import {load} from "dotenv-safe";
import {RtmClient} from "@slack/client";
import {RTM_EVENTS} from "@slack/client";

"use strict";

/**
 * Load env.
 */
load();

// let Client = require("").Client;
let winston = require("winston"),
    botToken = process.env.SLACK_BOT_TOKEN || "",
    rtm = new RtmClient(botToken),
    pattern = "{product}expected to reach {type}in {sec}secs sent at {timestamp}failed for id {martjack_id}";

/**
 * Event handler for new message.
 */
rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
    log("Message received", message.text);

    let matches = message.text.getPlaceholders(pattern);

    if (empty(matches)) {
        log("No Match Found");
        return false;
    }

    // prepare the header
    let postheaders = {
        'Content-Type': 'application/json',
        'Authorization': getAuthorization()
    };

    // the post options
    let optionspost = {
        host : process.env.CONNECT_HOST,
        port : 443,
        path : process.env.CONNECT_PULL_SKU_URI + matches.martjack_id,
        method : 'POST',
        headers : postheaders
    };

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // do the POST call
    log("Calling Connect");
    let reqPost = https.request(optionspost, res => {
        res.setEncoding('utf-8');

        let responseString = '';

        res.on('data', data => {
            responseString += data;
        });

        res.on('end', () => {
            log("Response Received", responseString);
        });
    });

    // write the json data
    reqPost.end();
    reqPost.on('error', err => {
        log(err);
    });
});

rtm.start();

/**
 * Check for similarity between two strings.
 *
 * @param patternString
 * @returns {Array|{index: number, input: string}}
 */
String.prototype.isSimilarTo = function (patternString) {
    patternString = patternString.replace(/\{[A-Za-z0-9_\-\.]+\}/g, '[A-Za-z0-9_\\-\\.\\s:]+');

    return this.match(patternString);
};

/**
 * Get all the placeholders and the matching values.
 *
 * @param patternString
 * @returns {*}
 */
String.prototype.getPlaceholders = function (patternString) {
    /**
     * Check if the string is similar to the pattern
     */
    if (! this.isSimilarTo(patternString)) {
        return false;
    }

    /**
     * Get all the place holders.
     */
    let patterns = patternString.match(/\{[A-Za-z0-9_\-\.]+\}/g),
        params = [];

    /**
     * Loop through all the placeholders in pattern string.
     */
    for (let i=0; i< patterns.length; i++) {
        /**
         * Get the matching string which n+1th character of the placeholder
         */
        let matching = patternString[patternString.indexOf(patterns[i]) + patterns[i].length],
            matchingstring = null,

            /**
             * Matching substring from the placeholders position.
             *
             * @type {string}
             */
            subString = this.substr(patternString.indexOf(patterns[i]));

        /**
         * Matched value.
         */
        matchingstring = empty(matching) ? subString : subString.split(matching)[0];

        params.push({
            var: patterns[i].slice(1, -1),
            value: matchingstring.trim()
        });

        /**
         * Update the pattern string with the value.
         */
        patternString = patternString.replace(patterns[i], matchingstring);
    }

    params = _.reduce(params, function (context, item) {
        context[item.var] = item.value;

        return context;
    }, {});

    return params;
};

/**
 * Check for emptiness of a variable.
 *
 * @param item
 * @returns {boolean}
 */
function empty(item) {
    return item === "" || item === null || item === undefined || item === false;
}

/**
 * Log helper.
 *
 * @param args
 */
function log(...args) {
    winston.log('info', '['+ date().format('YYYY-MM-DD H:mm:ss') + ']', ...args);
}

/**
 * Get the basic Authoriazation to call connect api.
 *
 * @returns {string}
 */
function getAuthorization(){
    let user = process.env.MARTJACK_MERCHANT_ID;
    let pass = process.env.MARTJACK_API_SECRET;

    return "Basic " + new Buffer(user + ":" + pass).toString("base64");
}
