import path from "path";
import faker from "faker";
import Logger from "../Utils/Logger";

let config = require(path.join(__dirname, '..', 'config.js')).config,
    logger = new Logger();

/**
 * Class Controller.
 */
export default class Controller
{
    /**
     * Faker library.
     *
     * @return faker
     */
    static faker() {
        return faker;
    }

    /**
     * Get Config.
     *
     * @returns object
     */
    static getConfig() {
        return config;
    }

    /**
     * Logger.
     *
     * @return {Logger}
     */
    static logger() {
        return logger;
    }

    /**
     * Get the response from response folder.
     *
     * @param fileName
     */
    static getContentOf(fileName) {
        let content = require(config.response_dir_path + fileName);

        return content.default;
    }
}