import express from "express";
import bluebird from "bluebird";
import mongoose from "mongoose";
import {load} from "dotenv-safe";
import reqParser from "body-parser";
import jsend from "./modules/jsend";
import User from "./app/models/user";
import v2User from "./app/models/v2/user";

require("./bootstrap/boot");

// Load the env
load();

// Initialize JSend Standard response.
jsend.init();

// Add custom promise for mongoose
mongoose.Promise    = bluebird;

// initialize the express framework
let app = express();

// create connection to mongo db.
mongoose.connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`);

// basic setups
app.use(express.static("public"));
app.use(reqParser.urlencoded({extended: false}));
app.use(reqParser.json());

// port
let PORT    = process.env.PORT || 8080;

// Router
let router  = new express.Router();

// Middleware to be used by all api request
router.use((req, res, next) => {
    if (req.header("content-type") === "application/json" && req.header("accept") === "application/json") {
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
            console.log("Valid");
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
            .build({
                name: req.body.name,
                address: req.body.address
            })
            .save()
            .then((data) => {
                return res.jsend(data, "Success", 201);
            })
            .catch(err => {
                return apiErrorHandler(err, req, res);
            });
    });

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
    res.sendFile(__dirname + "/views/form.html");
});

app.get("/submit", (req, res) => {
    let response = {
        first_name: req.query.first_name,
        last_name: req.query.last_name
    };
    res.end(JSON.stringify(response));
});

app.get("/post-form", (req, res) => {
    res.sendFile(__dirname + "/views/post-form.html");
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
 * Get debug info based on env.
 *
 * @param err
 * @param req
 * @param res
 * @returns {{}}
 */
function getDebugInfo(err, req, res) {
    let data    = {};

    data.validation = [];
    if (process.env.APP_ENV === "prod") {
        return data;
    }


    data.debug  = {
        realm: process.env.APP_ENV,
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

// server setup.
let server  = app.listen(PORT, () => {
    let host    = server.address().address;
    let port    = server.address().port;

    console.log("Server running at : http://%s:%s", host, port);
});