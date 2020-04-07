import fs from "fs";
import path from "path";
import express from "express";
import orm from "./modules/ORM";
import bluebird from "bluebird";
import mongoose from "mongoose";
import {load} from "dotenv-safe";
import reqParser from "body-parser";
import jsend from "./modules/jsend";
import User from "./app/models/user";
import v2User from "./app/models/v2/user";
import validator from "express-validator";
import {helpers} from "./bootstrap/boot";

// Load the env
load({
  allowEmptyValues: true
});

const Sentry = require('@sentry/node');
Sentry.init({ dsn:  process.env.SENTRY_URL});

// Initialize JSend Standard response.
jsend.init();

// Add custom promise for mongoose
mongoose.Promise    = bluebird;

// initialize the express framework
let app = express();
let cors    = require("cors");

let config_path     = path.join(__dirname, "/config/");
let databaseConfig  = require(path.join(config_path, "database.js"));

// create connection to mongo db.
mongoose.connect(databaseConfig.connections.mongo.url);

let mysqlConfig = databaseConfig.connections[process.env.DB_CONNECTION];

fs.writeFile(path.join(config_path, "database.json"), JSON.stringify(mysqlConfig), err => {
    if (err) throw err;
});

// basic setups
app.use(cors());
app.use(express.static("public"));
app.use(reqParser.urlencoded({extended: false}));
app.use(reqParser.json());
app.use(validator());

// Router
let router  = new express.Router();

// Middleware to be used by all api request
router.use((req, res, next) => {
    if (req.method === 'GET' || (req.header("content-type") === "application/json"
        && req.header("accept") === "application/json")) {
        return next();
    }

    return res.jsend(null, "Improper Headers", 406);
});

// Middleware to be used by all view request
app.use((req, res, next) => {
    console.log(req.method + ": " + req.url);
    next();
});

// ALl route will start with api
app.use("/api", router);
app.use(apiErrorHandler);

// Test route
router.get("/test", (req, res) => {
    res.json({message: "Successfull"});
});

// Api Routes using mongo db
router
    .route('/v1/users')
    .post((req, res, next) => {
        if (! req.body.name) {
            return res.send("No Body");
        }

        next();
    }, (req, res) => {
        let user    = new User();

        user.name       = req.body.name;
        user.address    = req.body.address;

        user.save(err => {
            if (err) res.send(err);

            res.jsend(user, "Successfully Requested");
        });
    })
    .get((req, res) => {
        User.find((err, user) => {
            if (err) {
                return res.send(err);
            }

            res.jsend(user, "Successfully Requested");
        });
    });

/**
 * User get by id middlware.
 *
 * @param req
 * @param res
 * @param next
 */
function userByIdMiddleware (req, res, next) {
    if (/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i.test(req.params.user_id)) {

        User.findOne({_id: req.params.user_id}, (err, user) => {
            if (err) throw apiErrorHandler(err, req, res);

            if (! user) {
                let err     = new Error("Not Found");
                err.status  = 404;

                return next(err);
            }

            req.user    = user;

            return next();
        });

        return;
    }

    let err     = new Error("Not Found");
    err.status  = 404;

    next(err);
}

router
    .route("/v1/users/:user_id")
    .get(userByIdMiddleware, (req, res) => {
        res.jsend(req.user, "Successfully Requested");
    })
    .put(userByIdMiddleware, (req, res) => {
        let user    = req.user;

        user.name       = req.body.name;
        user.address    = req.body.address;

        user.save(err => {
            if (err) return apiErrorHandler(err, req, res);

            res.status(205);
            res.send();
        });
    })
    .delete(userByIdMiddleware, (req, res) => {
        let user    = req.user;

        user.remove(err => {
            if (err) return apiErrorHandler(err, req, res);

            res.status(204);
            res.send();
        });
    });

router
    .route("/v2/users")
    .get((req, res) => {
        v2User
            .all({
                attributes: ['id', 'name', 'address']
            })
            .then((data) => {
                return res.jsend(data, "Successfully Requested");
            })
            .catch(err => {
                return apiErrorHandler(err, req, res);
            });
    })
    .post(userRequest, (req, res) => {
        v2User
            .build({
                name: req.body.name,
                address: req.body.address
            })
            .save()
            .then((data) => {
                return res.jsend(data, "Successfully Requested", 201);
            })
            .catch(orm.Sequelize.ValidationError, err => {
                return sequlizeValidationErrors(req, res, err)
            })
            .catch(err => {
                return apiErrorHandler(err, req, res);
            });
    });

router
    .route("/v2/users/:user_id")
    .get((req, res) => {
        v2User
            .findOne({
                where       : {id: req.params.user_id},
                attributes  : ['id', 'name', 'address']
            })
            .then((data) => {
                return res.jsend(data, "Successfully Requested");
            })
            .catch(err => {
                return apiErrorHandler(err, req, res);
            });
    });

router
    .route("/*")
    .get((req, res) => {
        return res.jsend([], "Successfully Requested");
    })
    .post((req, res) => {
         return res.jsend(req.body, "Successfully Requested");
    });

/**
 * Handle Sequlize validation errors.
 *
 * @param req
 * @param res
 * @param err
 * @returns {*}
 */
function sequlizeValidationErrors(req, res, err) {
    let errors  = {};

    errors[err.errors[0].path]  = {
        param   : err.errors[0].path,
        msg     : err.errors[0].message,
        value   : err.errors[0].value
    };

    return invalidInputHandler(req, res, errors)
}

/**
 * User request handler.
 *
 * @param req
 * @param res
 * @param next
 */
function userRequest(req, res, next) {
    req
        .checkBody("name")
        .notEmpty().withMessage("Name is required");
    req
        .checkBody("address")
        .notEmpty().withMessage("Address is required");

    req
        .getValidationResult()
        .then(result => {
            if (! result.isEmpty()) {
                return invalidInputHandler(req, res, result.mapped());
            }

            return next();
        });
}

// Routes with views
app.get("/", (req, res) => {
    res.send("Helo there get");
});

app.post("/", (req, res) => {
    res.send("Helo there post");
});

app.get("/test", (req, res) => {
    res.send("Helo there get test");
});

app.get("/test/*", (req, res) => {
    res.send("Helo there get test with pattern * " + req.url);
});

app.get("/form", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/form.html"));
});

app.get("/submit", (req, res) => {
    let response = {
        first_name: req.query.first_name,
        last_name: req.query.last_name
    };
    res.end(JSON.stringify(response));
});

app.get("/post-form", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/post-form.html"));
});

app.post("/post-submit", (req, res) => {
    let response = {
        first_name: req.body.first_name,
        last_name: req.body.last_name
    };
    res.end(JSON.stringify(response));
});

app.delete("/test/*", (req, res) => {
    res.send("Helo there delete test with pattern * " + req.url);
});

app.use((req, res, next) => {
    return res.jsend(null, "Not Found", 404);
});

/**
 * API Error handler functions.
 *
 * @param err
 * @param req
 * @param res
 * @returns {*}
 */
function apiErrorHandler(err, req, res, next) {
    if (! err.status) {
        err.status = 500;
    }

   res.jsend(getDebugInfo(err, req, res), err.message, err.status)
}

/**
 * Invalid input handler.
 *
 * @param req
 * @param res
 * @param validation
 * @returns {*}
 */
function invalidInputHandler(req, res, validation) {
    let err = new Error();
    err.status  = 400;
    err.message = "Validation Error";
    err.validation  = validation;

    return apiErrorHandler(err, req, res);
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

/**
 * Unhandled exception handler.
 */
process.on("Unhandled", function (err, req, res) {
    return apiErrorHandler(err, req, res);
});

module.exports  = app;
