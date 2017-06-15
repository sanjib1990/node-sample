"use strict";

let express = require("express");

// Initialize the body parser
let reqParser   = require("body-parser");

//initialize mongoose
let mongoose    = require("mongoose");

// Include the user model
let User    = require("./app/models/user");

// initialize the express framework
let app = express();

// create connection to mongo db.
mongoose.connect("mongodb://localhost:27017/mydb");

// basic setups
app.use(express.static("public"));
app.use(reqParser.urlencoded({extended: false}));
app.use(reqParser.json());

// port
let PORT    = process.env.PORT || 8080;

// Router
let router  = new express.Router();

// Middleware to be used by all request
router.use((req, res, next) => {
    console.log(req.method + ": " + req.url);

    next();
});

// Middleware to be used by views routes
app.use((req, res, next) => {
    console.log(req.method + ": " + req.url);

    next();
});

// Test route
router.get("/test", (req, res) => {
    res.json({message: "Successfull"});
});

// ALl route will start with api/v1
app.use("/api/v1", router);

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

// server setup.
let server  = app.listen(PORT, () => {
    let host    = server.address().address;
    let port    = server.address().port;

    console.log("Server running at : http://%s:%s", host, port);
});