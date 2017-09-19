import _ from "underscore";
import {load} from "dotenv-safe";
import {RtmClient} from "@slack/client";
import {RTM_EVENTS} from "@slack/client";

load();

let botToken = process.env.SLACK_BOT_TOKEN || "";
let rtm = new RtmClient(botToken);
let pattern = "Deploy Successfull on `{ip_address}` Branch: `{branch}` Codebase: `{website}`";

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
    console.log('Message:', JSON.stringify(getPlaceholders(pattern, message.text)));
});

rtm.start();

function getPlaceholders(patternString, contextString)
{
    let patterns = patternString.match(/\{[A-Za-z0-9_\-\.]+\}/g);

    let params = [];
    for (let i=0; i< patterns.length; i++) {
        let matching = patternString[patternString.indexOf(patterns[i]) + patterns[i].length];
        let matchingstring = null;
        let subString = contextString.substr(patternString.indexOf(patterns[i]));

        matchingstring = empty(matching) ? subString : subString.split(matching)[0];

        params.push({
            var: patterns[i].slice(1, -1),
            value: matchingstring
        });

        patternString = patternString.replace(patterns[i], matchingstring);
    }

    params = _.reduce(params, function (context, item) {
        context[item.var] = item.value;

        return context;
    }, {});

    return params;
}

function empty(item)
{
    return item === "" || item === null || item === undefined;
}
