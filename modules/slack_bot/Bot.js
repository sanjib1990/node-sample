import {RtmClient, WebClient, RTM_EVENTS} from "@slack/client";
import CLIENT_EVENTS from "@slack/client/lib/clients/events/client";

/**
 * Class Bot.
 */
export default class Bot {
    /**
     * Bot Constructor.
     *
     * @param botToken
     * @param channelName
     */
    constructor (botToken, channelName = null) {
        this._channel_name = channelName;

        this
            ._setBotToken(botToken)
            ._setRtmClient()
            ._setWebClient()
            .assignChannel();
    }

    /**
     * Get the channel Id.
     *
     * @returns {*}
     */
    getChannelId() {
        return this._channel_id;
    }

    /**
     * On Successfull connection to perform desired operation
     *
     * @param handler
     */
    connectionOpenHandler(handler) {
        // you need to wait for the client to fully connect before you can send messages
        this.rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
            handler();
        });
    }

    /**
     * Listen to events.
     *
     * @param handler
     */
    linstener (handler) {
        this.rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
            handler(message);
        });
    }

    /**
     * Get channel id by channel name.
     *
     * @param channelName
     * @returns {null}
     */
    getChannelIdByName(channelName) {
        // check in public channels.
        for (let c of this.public_channels) {
            if (c.is_member && c.name === channelName) {
                return c.id
            }
        }

        // check in private channel.
        for (let c of this.private_channels.groups) {
            if (c.name === channelName) {
                return c.id
            }
        }

        return null;
    }

    /**
     * Start the bot.
     */
    run () {
        this.rtm.start();
    }

    /**
     * Set the RTM client.
     *
     * @returns {Bot}
     * @private
     */
    _setRtmClient() {
        this.rtm = new RtmClient(this._bot_token);

        return this;
    }

    /**
     * Set the web client.
     *
     * @returns {Bot}
     * @private
     */
    _setWebClient() {
        this.web_client = new WebClient(this._bot_token);

        return this;
    }

    /**
     * Set Bot token.
     *
     * @param token
     * @returns {Bot}
     * @private
     */
    _setBotToken(token) {
        this._bot_token = token;

        return this;
    }

    /**
     * After authentication assign channel.
     */
    assignChannel() {
        // The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
        this.rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
            this.public_channels = rtmStartData.channels;

            // get the private channels.
            this.web_client.groups.list( (err, channels) => {
                this.private_channels = channels;

                // set the channel id.
                this._channel_id = this.getChannelIdByName(this._channel_name);
            });
        });
    }
}
