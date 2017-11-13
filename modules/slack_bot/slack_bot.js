import https from "https";
import Bot from "./Bot.js";
import _ from "underscore";
import config from "config";
import Logger from "./Logger.js";
import {load} from "dotenv-safe";

"use strict";

/**
 * Load env.
 */
load();

let logger = new Logger(),
    matches = {},
    pattern = "{merchant} {type} expected to reach {status} in {sec}secs sent at {timestamp}failed for id" +
        " {martjack_id}";

let bot = new Bot(process.env.SLACK_BOT_TOKEN || "");
let capBot = new Bot(process.env.CAPWX_BOT_TOKEN || "");

/**
 * Event handler for new message.
 */
bot.linstener(function (message) {
    logger.log("Message received", message.text);

    matches = message.text.getPlaceholders(pattern);
    logger.log(matches);

    // Proceed only if matches found and its for stock updates
    if (empty(matches) || matches.status !== 'swx_stock_updated') {
        logger.log("No Match Found");
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
        path : config.get('api.pull_sku') + matches.martjack_id + '/pull',
        method : 'POST',
        headers : postheaders
    };

    logger.log(optionspost);

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // do the POST call
    logger.log("Calling Connect");
    let reqPost = https.request(optionspost, res => {
        res.setEncoding('utf-8');

        let responseString = '';

        res.on('data', data => {
            responseString += data;
        });

        res.on('end', () => {
            let resObj = JSON.parse(responseString);

            if (res.statusCode !== 200) {
                logger.log(resObj.type, resObj.message);
                throw new Error([resObj.type, resObj.message]);
            }

            // send success message in slack
            capBot.rtm.sendMessage(
                "Bot Called Connect for product " + matches.martjack_id,
                capBot.getChannelIdByName(process.env.SLACK_AUTOMATION_SUCCESS_CHANNEL)
            );
        });
    });

    // write the json data
    reqPost.end();
    reqPost.on('error', err => {
        logger.log("ERROR OCCURED", err);
        throw new Error(err);
    });
});

// run the bot.
bot.run();
capBot.run();

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
 * Get the basic Authoriazation to call connect api.
 *
 * @returns {string}
 */
function getAuthorization(){
    let user = process.env.MARTJACK_MERCHANT_ID;
    let pass = process.env.MARTJACK_API_SECRET;

    return "Basic " + new Buffer(user + ":" + pass).toString("base64");
}

/**
 * Handle unhandled exception
 */
process.on('uncaughtException', function(err) {
    logger.log('Exception Occured: ', JSON.stringify(matches), err);

    // send error to slack
    capBot.rtm.sendMessage(
        "Exception Occured " + matches.martjack_id
        + "\n```"
        + JSON.stringify({matches: matches, error: err.toString()}, null, 4)
        + "\n```",
        capBot.getChannelIdByName(process.env.SLACK_AUTOMATION_ERROR_CHANNEL)
    );
});
