import date from "moment";
import _ from "underscore";
import {load} from "dotenv-safe";
import {RtmClient} from "@slack/client";
import {RTM_EVENTS} from "@slack/client";

"use strict";

load();

let winston = require("winston"),
    botToken = process.env.SLACK_BOT_TOKEN || "",
    rtm = new RtmClient(botToken),
    pattern = "{product}expected to reach {type}in {sec}secs sent at {timestamp}failed for id {orderId}";

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
    let matches = message.text.getPlaceholders(pattern);

    if (empty(matches)) {
        return false;
    }

    log("MESSAGE", matches);
});

rtm.start();

String.prototype.isSimilarTo = function (patternString) {
    patternString = patternString.replace(/\{[A-Za-z0-9_\-\.]+\}/g, '[A-Za-z0-9_\\-\\.\\s:]+');

    return this.match(patternString);
};

String.prototype.getPlaceholders = function (patternString) {
    if (! this.isSimilarTo(patternString)) {
        return false;
    }

    let patterns = patternString.match(/\{[A-Za-z0-9_\-\.]+\}/g),
        params = [];

    for (let i=0; i< patterns.length; i++) {
        let matching = patternString[patternString.indexOf(patterns[i]) + patterns[i].length],
            matchingstring = null,
            subString = this.substr(patternString.indexOf(patterns[i]));

        matchingstring = empty(matching) ? subString : subString.split(matching)[0];

        params.push({
            var: patterns[i].slice(1, -1),
            value: matchingstring.trim()
        });

        patternString = patternString.replace(patterns[i], matchingstring);
    }

    params = _.reduce(params, function (context, item) {
        context[item.var] = item.value;

        return context;
    }, {});

    return params;
};

function empty(item) {
    return item === "" || item === null || item === undefined || item === false;
}

function log(...args) {
    winston.log('info', '['+ date().format('YYYY-MM-DD H:mm:ss') + ']', ...args);
}
