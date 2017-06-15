"use strict";

let express = require("express");

// initialize the express framework
let app = express();

// Initialize the body parser
let reqParser   = require("body-parser");

// Create application/x-www-form-urlencoded parser
let urlEncodedParser    = reqParser.urlencoded({extended: false});

// assets
app.use(express.static("public"));

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

app.post("/post-submit", urlEncodedParser, (req, res) => {
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
let server  = app.listen(8080, () => {
    let host    = server.address().address;
    let port    = server.address().port;

    console.log("Server running at : http://%s:%s", host, port);
});