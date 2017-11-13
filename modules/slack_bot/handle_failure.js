import Bot from "./Bot.js";
import {load} from "dotenv-safe";

// Array which will hold the messages to push to slack channel
let array = [];

/**
 * Load env.
 */
load();

// initialize the bot.
let bot = new Bot(process.env.CAPWX_BOT_TOKEN || "", process.env.FAILURE_SLACK_CHANNEL);

bot.connectionOpenHandler(function () {
    let i =0;

    // keep sending messages to slack after every 1 sec.
    setInterval(function () {
        if (! array[i]) {
            process.exit(0);
        }

        bot.rtm.sendMessage(array[i], bot.getChannelId());
        i++;
    }, 1000);
});

bot.run();
