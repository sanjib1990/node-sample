import date from "moment";
import Winston from "winston";

/**
 * Logger
 */
export default class Logger {
    constructor () {
        this.winston = Winston;
    }

    log(...args) {
        return this.winston.log('info', '['+ date().format('YYYY-MM-DD H:mm:ss') + ']', ...args);
    }
}
