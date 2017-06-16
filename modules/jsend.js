/**
 * Created by sanjibdevnath on 16/6/17.
 */

let express = require("express");

function init() {
    /**
     * JSend Standard response.
     *
     * @param data
     * @param message
     * @param code
     * @param status
     * @returns {*}
     */
    function jsend(data = null, message = null, code = 200, status = "success") {
        if (code >=200 && code < 300) {
            status  = "success";
        } else if (code >= 400 && code < 500) {
            status  = "fail";
        } else if (code >= 500) {
            status  = "error";
        }

        return this.status(code).json({
            status: status,
            message: message,
            data: data
        });
    }

    express.response.jsend = jsend;
}

exports.init    = init;
