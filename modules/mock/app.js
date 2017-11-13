import express from "express";
import reqParser from "body-parser";

// load express
let app = express();

// Basic setup
app.use(reqParser.urlencoded({extended: false}));
app.use(reqParser.json());

/**
 * Unhandled exception handler.
 */
process.on("Unhandled", function (err, req, res) {
    return errorHandler(err, req, res);
});

/**
 * Error handler functions.
 *
 * @param err
 * @param req
 * @param res
 * @returns {*}
 */
function errorHandler(err, req, res, next) {
    if (! err.status) {
        err.status = 500;
    }

    res.status(err.status).json({
        message: err.message,
        data: getDebugInfo(err, req, res)
    });
}

/**
 * Get debug info based on env.
 *
 * @param err
 * @param req
 * @param res
 * @returns {{}}
 */
function getDebugInfo(err, req, res) {
    let data    = {};

    data.validation = err.validation ? err.validation :[];
    if (process.env.NODE_ENV === "prod") {
        return data;
    }


    data.debug  = {
        realm: process.env.NODE_ENV,
        stack: err.stack.split("\n").map(e => e.trim())
    };

    data.http   = {
        method  : req.method,
        url     : req.url,
        body    : req.body,
        headers : req.headers
    };

    return data;
}

module.exports = {
    app: app,
    express: express
};